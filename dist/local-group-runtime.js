/* Local fictional group replies. Each group's pending source messages are stored
   on the messages themselves so older saves do not need a schema migration. */
window.LocalGroupRuntime={create(ctx){
 'use strict';
 const S=ctx.getState,timers=new Map();let serial=0,previousState=null;
 const active=id=>!document.hidden&&ctx.getRoute().app==='room'&&ctx.getRoute().id===id;
 const group=id=>S().wechatGroups?.[id];
 const supported=m=>m?.from==='self'&&(['photo','location'].includes(m.type)||(m.type==='text'&&typeof m.text==='string'&&m.text.trim()));
 const words=m=>m.type==='text'?m.text:'';
 const emergency=text=>/自杀|自残|割腕|不想活|想死|伤害自己|胸痛|胸口疼|喘不过气|呼吸困难/.test(text);
 const pause=text=>/别.{0,4}回|不要.{0,4}(?:回|说话)|先安静|停一下|不聊/.test(text);
 const resume=text=>/可以回复|可以回了|继续聊|开始聊天|继续说|说话吧/.test(text);
 function paused(id){const last=(S().chatMessages?.[id]||[]).filter(m=>typeof m.groupPauseChange==='boolean').at(-1);return last?.groupPauseChange===true;}
 const eligible=id=>!!group(id)&&!S().wechatPrefs?.[id]?.left;
 const members=id=>{const known=new Set(ctx.people.map(p=>p.id));return [...new Set(group(id)?.members||[])].filter(x=>known.has(x));};
 function stop(id){if(timers.has(id))clearTimeout(timers.get(id));timers.delete(id);}
 function cancel(id){stop(id);let changed=false;for(const m of S().chatMessages?.[id]||[])if(m.groupPending){delete m.groupPending;changed=true;}if(changed)ctx.save();}
 function replyFor(text,id,turn){
  const t=text.toLowerCase();
  if(/别回|不要回复|不聊|安静|停一下/.test(t))return '好，我们先安静一会儿。';
  if(/难过|累|烦|不开心|失落/.test(t))return ['先休息一下，想说的话我们都在。','今天辛苦了，别勉强自己。'][turn%2];
  if(/饿|吃|饭|奶茶|火锅/.test(t))return ['说到吃的我就来精神了，想吃什么？','好呀，先挑个大家都喜欢的。'][turn%2];
  if(/晚安|睡觉/.test(t))return '晚安，大家都早点休息。';
  if(/你好|大家好|在吗|来了/.test(t))return ['在呢，刚好看到消息。','来啦，今天想聊什么？'][turn%2];
  if(/哈哈|开心|笑/.test(t))return '哈哈，看到你这样说我也笑了。';
  if(/[?？]|怎么|什么|哪|谁/.test(t))return '这个问题我也想听听大家怎么说。';
  const byPerson={lead_wang_xiaomiao:'收到，你接着说，我在听。',lead_muma:'嗯，我在呢，你慢慢说。',lead_monv:'行，继续，我听着呢。',lead_vivi:'嗯，我看到了，你继续说。',lead_gangjie:'我在呀，继续说～'};
  return byPerson[id]||'我在听，你继续说。';
 }
 function complete(id,owner){
  timers.delete(id);if(S()!==owner||!eligible(id)){if(S()===owner)cancel(id);return;}
  const history=S().chatMessages?.[id]||[],answered=new Set(history.filter(m=>m.replyOrigin==='local-group').flatMap(m=>Array.isArray(m.replyTo)?m.replyTo:[]));
  const inputs=history.filter(m=>supported(m)&&m.groupPending&&!answered.has(m.id));
  const people=members(id);if(!inputs.length||!people.length){cancel(id);return;}
  const urgent=inputs.find(m=>emergency(words(m))),directive=inputs.filter(m=>typeof m.groupPauseChange==='boolean').at(-1);
  const turn=history.filter(m=>m.replyOrigin==='local-group').length,speaker=people[turn%people.length];
  const message={id:'local_group_reply_'+Date.now()+'_'+serial++,type:'text',from:'other',speaker,text:urgent?(/胸痛|胸口疼|喘不过气|呼吸困难/.test(urgent.text)?'胸痛或呼吸困难请立刻就医，也联系身边的人陪你。':'先联系身边信任的人陪着你，遇到紧急危险请立即联系当地急救。'):directive?.groupPauseChange===true?'好，我们先安静一会儿。':directive?.groupPauseChange===false?'好，我们继续聊。':inputs.at(-1).type==='photo'?'照片收到啦，大家有空再一起看。':inputs.at(-1).type==='location'?'位置收到啦，大家再商量一下。':replyFor(inputs.at(-1).text,speaker,turn),createdAt:Date.now(),time:new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()),replyOrigin:'local-group',sceneMode:'fictional_fan_scene',replyTo:inputs.map(m=>m.id)};
  for(const m of inputs)delete m.groupPending;history.push(message);
  if(!active(id)){S().chatReadRooms=(S().chatReadRooms||[]).filter(x=>x!==id);ctx.markUnread?.(id,message);}
  ctx.save();ctx.onIncoming?.(id,message);
 }
 function schedule(id,delay){stop(id);const owner=S();timers.set(id,setTimeout(()=>complete(id,owner),delay));}
 function enqueue(id,message){if(!eligible(id)||!members(id).length||!supported(message))return false;
  const history=S().chatMessages?.[id]||[];if(!history.includes(message)||history.some(m=>m.replyOrigin==='local-group'&&m.replyTo?.includes(message.id)))return false;
  const text=words(message);if(resume(text))message.groupPauseChange=false;else if(pause(text))message.groupPauseChange=true;
  if(paused(id)&&!pause(text)&&!emergency(text)){ctx.save();return false;}
  message.groupPending=true;ctx.save();schedule(id,Math.min(1900,1000+text.length*12));return true;
 }
 function sync(){if(previousState===S())return;previousState=S();for(const id of [...timers.keys()])stop(id);for(const [id,history] of Object.entries(S().chatMessages||{})){if(!group(id))continue;if(!eligible(id)){cancel(id);continue;}if(history.some(m=>m.groupPending&&supported(m)))schedule(id,800);}}
 function dispose(){for(const id of [...timers.keys()])stop(id);}
 sync();return {enqueue,cancel,sync,dispose};
}};
