/* Authored, browser-local phone events. No real calls or multi-user service. */
(function(root){
 'use strict';
 const groupId='group_xiaosheng_fans';
 const members=[{id:'youzi',name:'阿柚',initial:'柚',color:'#e8ad78'},{id:'rice',name:'小米饭',initial:'米',color:'#94aaa0'},{id:'wind',name:'晚风',initial:'风',color:'#91a4bd'}];
 const seed=[
  {id:'fans-welcome',type:'system',text:'你加入了「小圣的快乐补给站」'},
  {id:'fans-seed-1',type:'text',from:'other',speaker:'youzi',text:'先说好，今天群里不许潜水 👀',time:'19:20'},
  {id:'fans-seed-2',type:'text',from:'other',speaker:'rice',text:'我带了零食，谁带话题？',time:'19:21'},
  {id:'fans-seed-3',type:'text',from:'other',speaker:'wind',text:'那我负责给你们的冷笑话捧场。',time:'19:21'}
 ];
 const defaults=()=>({version:1,callStatus:'new',callResult:'',followupSent:false,groupIntroSent:false,groupMuted:false,groupPending:null});
 function normalize(raw){const d=defaults();if(!raw||typeof raw!=='object')return d;for(const k of ['followupSent','groupIntroSent','groupMuted'])if(typeof raw[k]==='boolean')d[k]=raw[k];if(['new','ringing','connected','ended'].includes(raw.callStatus))d.callStatus=raw.callStatus;if(['declined','answered','missed'].includes(raw.callResult))d.callResult=raw.callResult;if(raw.groupPending&&Array.isArray(raw.groupPending.ids)){const ids=[...new Set(raw.groupPending.ids.filter(x=>typeof x==='string'&&x.length<150))].slice(-20);if(ids.length)d.groupPending={ids};}return d;}
 function createSound(ctx){
  let audio=null,ringTimer=null;const live=new Set();
  const enabled=()=>ctx.getState().settings.sound!==false;
  function unlock(){if(!enabled())return;try{const A=root.AudioContext||root.webkitAudioContext;if(!A)return;audio||=new A();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
  function tone(freq,at,length,volume=.08){if(!audio||audio.state!=='running'||!enabled())return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+at;o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+length);o.connect(g);g.connect(audio.destination);live.add(o);o.onended=()=>{live.delete(o);o.disconnect();g.disconnect();};o.start(t);o.stop(t+length+.03);}
  function message(){if(ctx.hidden?.())return;tone(880,0,.14,.07);tone(1174.66,.12,.24,.055);}
  function ringPhrase(){if(ctx.hidden?.())return;[659.25,830.61,987.77,830.61].forEach((f,i)=>tone(f,i*.18,.24,.065));}
  function stop(){clearInterval(ringTimer);ringTimer=null;for(const o of live){try{o.stop();}catch{}}live.clear();}
  function ring(){stop();ringPhrase();ringTimer=setInterval(ringPhrase,2300);}
  return {unlock,message,ring,stop,enabled};
 }
 function create(ctx){
  const S=ctx.getState,L=()=>S().phoneLife,active=id=>ctx.getRoute().app==='room'&&ctx.getRoute().id===id;
  let callTimer=null,endTimer=null,followTimer=null,groupTimer=null,introTimer=null,started=false,previousState=S();
  const time=()=>new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  const eligible=()=>S().unlocked&&!['lock','pin'].includes(ctx.getRoute().app)&&!ctx.hidden?.()&&ctx.available()!==false;
  function incoming(id,m,{quiet=false}={}){const history=S().chatMessages[id]||=[];if(history.some(x=>x.id===m.id))return false;history.push({...m,sceneMode:'fictional_fan_scene',time:m.time||time()});if(!active(id))S().chatReadRooms=S().chatReadRooms.filter(x=>x!==id);ctx.save();ctx.onIncoming(id,history.at(-1),quiet);return true;}
  function followup(){followTimer=null;if(L().followupSent||L().callStatus!=='ended')return;L().followupSent=true;const text=L().callResult==='answered'?'刚刚说的算数哦，看到消息要回我。别让我对着聊天框发呆😌':L().callResult==='missed'?'没接到呀？那我先在这里等你。忙完回我一声就好。':'居然挂我电话？好吧，给你留个文字版：今天也有一点想你。就一点🤏';incoming(ctx.wang,{id:'wang-call-followup-v1',type:'text',from:'other',text,replyOrigin:'local-phone-event'});ctx.save();}
  function scheduleFollowup(){if(!L().followupSent&&followTimer===null)followTimer=setTimeout(followup,850);}
  function end(result='declined'){if(!['ringing','connected'].includes(L().callStatus))return;clearTimeout(endTimer);endTimer=null;ctx.sound.stop();L().callResult=L().callStatus==='connected'?'answered':result;L().callStatus='ended';S().callLog||=[];S().callLog.push({id:'wang-intro-call-v1',name:'小王',direction:'incoming',result:L().callResult,time:time(),sceneMode:'fictional_fan_scene'});ctx.save();ctx.onCall(null);scheduleFollowup();sync();}
  function showCall(){callTimer=null;if(L().callStatus!=='new')return;if(!eligible()){if(S().unlocked&&!['lock','pin'].includes(ctx.getRoute().app)&&!ctx.hidden?.())callTimer=setTimeout(showCall,500);return;}L().callStatus='ringing';ctx.save();ctx.onCall('ringing');ctx.sound.ring();endTimer=setTimeout(()=>end('missed'),22000);}
  function answer(){if(L().callStatus!=='ringing')return;ctx.sound.stop();clearTimeout(endTimer);L().callStatus='connected';ctx.save();ctx.onCall('connected');endTimer=setTimeout(()=>end('answered'),8000);}
  function introduce(){introTimer=null;if(!eligible()||L().callStatus==='ringing'||L().callStatus==='connected')return;if(L().groupIntroSent)return;L().groupIntroSent=true;incoming(groupId,{id:'fans-intro-v1',type:'text',from:'other',speaker:'youzi',text:'小圣来啦！今天的群聊签到题：用一个词形容你的心情。'});ctx.save();}
  function groupReply(text,turn){
   if(/停|别回|安静|不聊/.test(text))return {speaker:'wind',text:'收到，我们先安静一会儿。想聊了再叫我们。'};
   if(/难过|累|烦|不开心|失落/.test(text))return {speaker:'rice',text:'给你留个靠窗的位置。今天不用负责活跃气氛，我们陪你慢慢聊。'};
   if(/饿|吃|饭|奶茶|火锅/.test(text))return [{speaker:'rice',text:'本群一聊吃的，潜水的人都浮上来了。你先报菜名，我拿碗！'},{speaker:'youzi',text:'好，今日重大议题：先吃饭，还是边吃边聊？我投两票。'}][turn%2];
   if(/狗尾巴草|洋葱|木马/.test(text))return {speaker:'wind',text:'一根小草也能被认真收藏。好啦，这一段我们一起记得。'};
   if(/小王|甜|想|喜欢/.test(text))return {speaker:'youzi',text:'等一下，我搬个小板凳。这个话题听起来有后续 👀'};
   if(/你好|来了|大家好|报到|签到/.test(text))return {speaker:'rice',text:'欢迎归队！零食放左边，快乐放右边，烦恼暂时交给门口。'};
   if(/哈哈|笑|开心/.test(text))return {speaker:'youzi',text:'笑声已收到，传染给全群了哈哈哈。谁都不许偷偷憋着！'};
   if(/晚安|睡/.test(text))return {speaker:'wind',text:'晚安，今天群聊打烊。明天见面再续上这半句。'};
   if(/[?？]|怎么|什么|哪|谁/.test(text))return {speaker:'wind',text:'这个问题我先举手围观。你心里是不是已经有个答案了？'};
   return [{speaker:'youzi',text:'好好好，话题递到你这里了。展开讲讲，我的瓜子还没嗑完。'},{speaker:'rice',text:'我刚想潜水，看到你这句又冒出来了 😂'},{speaker:'wind',text:'这句先留在群里。等大家回来，又有话可以接着聊了。'}][turn%3];
  }
  function completeGroup(){groupTimer=null;const pending=L().groupPending;if(!pending)return;const history=S().chatMessages[groupId]||[],answered=new Set(history.flatMap(m=>m.replyTo||[])),inputs=history.filter(m=>pending.ids.includes(m.id)&&m.from==='self'&&!answered.has(m.id));L().groupPending=null;if(!inputs.length){ctx.save();return;}const reply=groupReply(inputs.at(-1).text,history.filter(m=>m.replyOrigin==='local-fan-group').length);incoming(groupId,{id:'fans_'+inputs.at(-1).id,type:'text',from:'other',...reply,replyOrigin:'local-fan-group',replyTo:inputs.map(m=>m.id)});ctx.save();}
  function enqueueGroup(m){if(m.type!=='text'||m.from!=='self')return;const history=S().chatMessages[groupId]||[];if(history.some(x=>x.replyTo?.includes(m.id)))return;L().groupPending={ids:[...new Set([...(L().groupPending?.ids||[]),m.id])].slice(-20)};ctx.save();clearTimeout(groupTimer);groupTimer=setTimeout(completeGroup,1250+Math.min(m.text.length*8,450));}
  function clearTimers(){for(const t of [callTimer,endTimer,followTimer,groupTimer,introTimer])clearTimeout(t);callTimer=endTimer=followTimer=groupTimer=introTimer=null;ctx.sound.stop();}
  function sync(){
   if(previousState!==S()){clearTimers();ctx.onCall(null);previousState=S();started=false;}
   if(!started){started=true;if(['ringing','connected'].includes(L().callStatus))end('missed');if(L().groupPending)groupTimer=setTimeout(completeGroup,800);}
   if(L().callStatus==='new'){if(eligible()&&callTimer===null)callTimer=setTimeout(showCall,2000);else if(!eligible()){clearTimeout(callTimer);callTimer=null;}}
   if(L().callStatus==='ended')scheduleFollowup();
   if(!L().groupIntroSent&&eligible()&&['new','ended'].includes(L().callStatus)&&introTimer===null)introTimer=setTimeout(introduce,6500);
  }
  function visibility(){if(ctx.hidden?.()){ctx.sound.stop();clearTimeout(callTimer);callTimer=null;clearTimeout(introTimer);introTimer=null;}else{sync();if(L().callStatus==='ringing')ctx.sound.ring();}}
  function toggleGroupMute(){L().groupMuted=!L().groupMuted;ctx.save();return L().groupMuted;}
  return {sync,answer,end,enqueueGroup,toggleGroupMute,visibility,notify:(id,m)=>ctx.onIncoming(id,m,false),dispose:clearTimers};
 }
 const api={groupId,members,seed,defaults,normalize,create,createSound};
 if(typeof module!=='undefined')module.exports=api;else root.PhoneLife=api;
})(typeof window==='undefined'?globalThis:window);
