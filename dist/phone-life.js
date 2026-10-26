/* Authored, browser-local phone events. No real calls or multi-user service. */
(function(root){
 'use strict';
 const groupId='group_xiaosheng_fans';
 const members=[
  {id:"youzi",name:"阿柚",emoji:"🍊",initial:"阿",color:"#e8ad78",avatar:'https://i.pravatar.cc/100?img=47'},
  {id:"rice",name:"小米饭",emoji:"🍙",initial:"小",color:"#94aaa0",avatar:'https://i.pravatar.cc/100?img=44'},
  {id:"wind",name:"晚风",emoji:"🌙",initial:"晚",color:"#91a4bd",avatar:'https://i.pravatar.cc/100?img=11'},
  {id:"soda",name:"苏打冰",emoji:"🧊",initial:"苏",color:"#9ad0e0",avatar:'https://i.pravatar.cc/100?img=12'},
  {id:"luckycat",name:"招财猫",emoji:"🐱",initial:"招",color:"#d7aa7c"},
  {id:"peach",name:"桃子汽水",emoji:"🍑",initial:"桃",color:"#eaa0af",avatar:'https://i.pravatar.cc/100?img=36'},
  {id:"nightowl",name:"不睡觉冠军",emoji:"🦉",initial:"不",color:"#7284a9",avatar:'https://i.pravatar.cc/100?img=15'},
  {id:"cloud",name:"云朵收集员",emoji:"☁️",initial:"云",color:"#9bafbf"},
  {id:"xiaoqi",name:"小七同学",emoji:"🎧",initial:"小",color:"#b9a3e5",avatar:'https://i.pravatar.cc/100?img=49'},
  {id:"honey",name:"甜筒不加冰",emoji:"🍦",initial:"甜",color:"#e3b0b1",avatar:'https://i.pravatar.cc/100?img=50'},
  {id:"momo",name:"Momo",emoji:"🐰",initial:"M",color:"#a9c3d1"},
  {id:"yufan",name:"鱼饭",emoji:"🐟",initial:"鱼",color:"#6b9db3",avatar:'https://i.pravatar.cc/100?img=19'},
  {id:"shiliu",name:"十六",emoji:"✨",initial:"十",color:"#d9a7b0",avatar:'https://i.pravatar.cc/100?img=48'},
  {id:"ee",name:"一颗栗子",emoji:"🌰",initial:"一",color:"#b88e6e"},
  {id:"xingle",name:"星乐",emoji:"⭐",initial:"星",color:"#d4ae67",avatar:'https://i.pravatar.cc/100?img=33'},
  {id:"shiro",name:"小白没烦恼",emoji:"🧸",initial:"小",color:"#c7b59a"},
  {id:"lulu",name:"鹿鹿",emoji:"🦌",initial:"鹿",color:"#a5bc98",avatar:'https://i.pravatar.cc/100?img=60'},
  {id:"deer",name:"山野来信",emoji:"🌲",initial:"山",color:"#7caa8a"},
  {id:"pudding",name:"布丁人",emoji:"🍮",initial:"布",color:"#dbc28e",avatar:'https://i.pravatar.cc/100?img=34'},
  {id:"yoyo",name:"YoYo",emoji:"🎀",initial:"Y",color:"#dba8c2",avatar:'https://i.pravatar.cc/100?img=53'},
  {id:"cola",name:"可乐只喝冰的",emoji:"🥤",initial:"可",color:"#8ba2be"},
  {id:"ruru",name:"茹茹",emoji:"🌷",initial:"茹",color:"#dca8ac",avatar:'https://i.pravatar.cc/100?img=52'},
  {id:"acheng",name:"阿澄",emoji:"🌊",initial:"阿",color:"#8ca9b3",avatar:'https://i.pravatar.cc/100?img=14'},
  {id:"jelly",name:"果冻没有骨头",emoji:"🍇",initial:"果",color:"#9f94c2"},
  {id:"aa",name:"AAAA早睡协会",emoji:"💤",initial:"A",color:"#8da5ba"},
  {id:"tangyuan",name:"汤圆圆",emoji:"🍡",initial:"汤",color:"#ceaabd",avatar:'https://i.pravatar.cc/100?img=29'},
  {id:"xinghe",name:"星河贩卖机",emoji:"🌌",initial:"星",color:"#6d7b98"},
  {id:"yichen",name:"一尘",emoji:"🍃",initial:"一",color:"#86a697",avatar:'https://i.pravatar.cc/100?img=63'},
  {id:"ahwang",name:"旺仔不太忙",emoji:"🧃",initial:"旺",color:"#cf956c",avatar:'https://i.pravatar.cc/100?img=22'},
  {id:"water",name:"白桃乌龙",emoji:"🍵",initial:"白",color:"#9da89a"},
  {id:"xiuxiu",name:"咻咻",emoji:"⚡",initial:"咻",color:"#c7b064",avatar:'https://i.pravatar.cc/100?img=26'},
  {id:"daxiong",name:"大雄同学",emoji:"📷",initial:"大",color:"#9cabaf"},
  {id:"seven",name:"柒月",emoji:"🌻",initial:"柒",color:"#ddb478",avatar:'https://i.pravatar.cc/100?img=57'},
  {id:"shushu",name:"树树",emoji:"🌿",initial:"树",color:"#7fa186"},
  {id:"weiyu",name:"未雨",emoji:"🌧️",initial:"未",color:"#8fa6c1",avatar:'https://i.pravatar.cc/100?img=46'},
  {id:"dandan",name:"蛋黄酥",emoji:"🥐",initial:"蛋",color:"#e0b27d"},
  {id:"xingxing",name:"行星漫游",emoji:"🪐",initial:"行",color:"#9b92b1"},
  {id:"nannan",name:"南南",emoji:"🌼",initial:"南",color:"#d0bb88",avatar:'https://i.pravatar.cc/100?img=56'},
  {id:"chengzi",name:"橙子味日落",emoji:"🌇",initial:"橙",color:"#c68b76"},
  {id:"xiaoyu",name:"小宇",emoji:"🏀",initial:"小",color:"#889cb8",avatar:'https://i.pravatar.cc/100?img=13'},
  {id:"nono",name:"诺诺",emoji:"🫧",initial:"诺",color:"#9fbfbe",avatar:'https://i.pravatar.cc/100?img=65'},
  {id:"guang",name:"光合反应",emoji:"🌞",initial:"光",color:"#d0ae6d"},
  {id:"xiaolin",name:"阿林",emoji:"🎮",initial:"阿",color:"#92a7b5",avatar:'https://i.pravatar.cc/100?img=28'},
  {id:"liang",name:"两只小熊",emoji:"🐻",initial:"两",color:"#c0a17f"},
  {id:"feifei",name:"菲菲",emoji:"🎹",initial:"菲",color:"#c3a3c8",avatar:'https://i.pravatar.cc/100?img=58'},
  {id:"wait",name:"等一场雪",emoji:"❄️",initial:"等",color:"#9daec2"},
  {id:"sisi",name:"思丝",emoji:"🌸",initial:"思",color:"#d8a5b7",avatar:'https://i.pravatar.cc/100?img=55'},
  {id:"ming",name:"凌晨四点",emoji:"🌃",initial:"凌",color:"#788aaa"},
  {id:"yumi",name:"柚米",emoji:"🧋",initial:"柚",color:"#c5b1a0",avatar:'https://i.pravatar.cc/100?img=59'},
  {id:"sugar",name:"砂糖橘",emoji:"🍬",initial:"砂",color:"#d3a36b"},
  {id:"jiujiu",name:"啾啾",emoji:"🐦",initial:"啾",color:"#92bac1"},
  {id:"shanshan",name:"珊珊",emoji:"🪻",initial:"珊",color:"#b9a3d0",avatar:'https://i.pravatar.cc/100?img=51'},
 ];
 const seed=[
  {id:'fans-welcome',type:'system',text:'你加入了「小圣的快乐补给站」'},
  {id:"fans-seed-1",type:'text',from:'other',speaker:"youzi",text:"先说好，今天群里不许潜水 👀",time:"19:20"},
  {id:"fans-seed-2",type:'text',from:'other',speaker:"luckycat",text:"我没潜水，我是在认真窥屏。",time:"19:20"},
  {id:"fans-seed-3",type:'text',from:'other',speaker:"rice",text:"我带了零食，谁带话题？",time:"19:21"},
  {id:"fans-seed-4",type:'text',from:'other',speaker:"wind",text:"那我负责给你们的冷笑话捧场。",time:"19:21"},
  {id:"fans-seed-5",type:'text',from:'other',speaker:"soda",text:"刚打开相册，手一滑划了半天哈哈",time:"19:22"},
  {id:"fans-seed-6",type:'text',from:'other',speaker:"peach",text:"小圣这手机里面到底藏了多少东西啊",time:"19:22"},
  {id:"fans-seed-7",type:'text',from:'other',speaker:"nightowl",text:"我先替半夜不睡的群友占个位置。",time:"19:23"},
  {id:"fans-seed-8",type:'text',from:'other',speaker:"xiaoqi",text:"救命 谁把群名起得这么像奶茶店🤣",time:"19:23"},
  {id:"fans-seed-9",type:'text',from:'other',speaker:"youzi",text:"招牌：快乐加满，不快乐退半杯。",time:"19:23"},
  {id:"fans-seed-10",type:'text',from:'other',speaker:"luckycat",text:"老板，来一杯周一不上班。",time:"19:24"},
  {id:"fans-seed-11",type:'text',from:'other',speaker:"momo",text:"🐰（默默排队）",time:"19:24"},
  {id:"fans-seed-12",type:'text',from:'other',speaker:"yufan",text:"你们是真能聊，我就去接了杯水",time:"19:25"},
  {id:"fans-seed-13",type:'text',from:'other',speaker:"honey",text:"有没有人和我一样看头像先认人，根本记不住名字🥲",time:"19:26"},
  {id:"fans-seed-14",type:'text',from:'other',speaker:"shiliu",text:"看头像+看说话方式，三天就记住啦",time:"19:26"},
  {id:"fans-seed-15",type:'text',from:'other',speaker:"acheng",text:"先别三天了，谁告诉我今天晚上吃啥",time:"19:27"},
  {id:"fans-seed-16",type:'text',from:'other',speaker:"pudding",text:"火锅！",time:"19:27"},
  {id:"fans-seed-17",type:'text',from:'other',speaker:"cola",text:"刚说火锅我又饿了…",time:"19:28"},
  {id:"fans-seed-18",type:'text',from:'other',speaker:"wind",text:"这群真好，聊天没有重点，但一直有人接话。",time:"19:28"},
  {id:"fans-seed-19",type:'text',from:'other',speaker:"xingle",text:"报个到，我去补一下未读消息👋",time:"19:29"},
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
  function introduce(){introTimer=null;if(!eligible()||L().callStatus==='ringing'||L().callStatus==='connected')return;if(L().groupIntroSent||S().wechatPrefs?.[groupId]?.left)return;L().groupIntroSent=true;incoming(groupId,{id:'fans-intro-v1',type:'text',from:'other',speaker:'youzi',text:'小圣来啦！今天的群聊签到题：用一个词形容你的心情。'});ctx.save();}
  function groupReply(text,turn){
   const pick=options=>options[turn%options.length];
   if(/停|别回|安静|不聊/.test(text))return pick([{speaker:'wind',text:'收到，我们先安静一会儿。想聊了再叫我们。'},{speaker:'soda',text:'好嘞，先静音模式一会儿 🤫'}]);
   if(/难过|累|烦|不开心|失落/.test(text))return pick([{speaker:'rice',text:'给你留个靠窗的位置。今天不用负责活跃气氛，我们陪你慢慢聊。'},{speaker:'lulu',text:'抱抱。不用硬撑，想说就说，不想说也没关系。'},{speaker:'nannan',text:'辛苦啦，先喝口水。大家都在呢。'}]);
   if(/饿|吃|饭|奶茶|火锅/.test(text))return pick([{speaker:'pudding',text:'火锅！我投火锅！已经开始饿了。'},{speaker:'rice',text:'本群一聊吃的，潜水的人都浮上来了。先报菜名，我拿碗！'},{speaker:'cola',text:'暂停，我现在真的想点外卖了😂'}]);
   if(/狗尾巴草|洋葱|木马/.test(text))return pick([{speaker:'wind',text:'一根小草也能被认真收藏。好啦，这一段我们一起记得。'},{speaker:'cloud',text:'这种小细节最容易记住，好像突然看到一张旧照片。'}]);
   if(/小王|甜|想|喜欢/.test(text))return pick([{speaker:'youzi',text:'等一下，我搬个小板凳。这个话题听起来有后续 👀'},{speaker:'xiaoqi',text:'不是，等一下，这里是不是有故事！'},{speaker:'yoyo',text:'我宣布这一句值得截屏哈哈哈。'}]);
   if(/你好|来了|大家好|报到|签到/.test(text))return pick([{speaker:'rice',text:'欢迎归队！零食放左边，快乐放右边。'},{speaker:'soda',text:'来啦来啦！今天这群居然这么齐。'},{speaker:'xingle',text:'打卡成功✅ 先坐，慢慢聊～'}]);
   if(/哈哈|笑|开心/.test(text))return pick([{speaker:'luckycat',text:'不是，谁能给我补一下前情哈哈哈'},{speaker:'peach',text:'我在屏幕这边笑出声了救命'},{speaker:'youzi',text:'不许一个人笑！快把笑点发出来！'}]);
   if(/晚安|睡/.test(text))return pick([{speaker:'wind',text:'晚安，今天群聊打烊。明天见。'},{speaker:'nightowl',text:'晚安！本夜猫子替你守群🌙'},{speaker:'aa',text:'早睡协会今日终于有会员了！'}]);
   if(/[?？]|怎么|什么|哪|谁/.test(text))return pick([{speaker:'shiliu',text:'等下等下，我也想知道这个问题的答案。'},{speaker:'yufan',text:'先蹲一个回复，我也好奇。'},{speaker:'acheng',text:'这个我好像知道一点，但得先听你说说。'}]);
   return pick([{speaker:'youzi',text:'等等，这句有点意思，展开讲讲👀'},{speaker:'soda',text:'哈哈我正在打字，你先发了。'},{speaker:'luckycat',text:'我本来在潜水，看到这句冒个泡。'},{speaker:'momo',text:'收到！兔子耳朵竖起来了🐰'},{speaker:'shiliu',text:'我在听我在听，继续。'},{speaker:'peach',text:'这群怎么每次都能聊歪哈哈。'}]);
  }
  function completeGroup(){groupTimer=null;const pending=L().groupPending;if(S().wechatPrefs?.[groupId]?.left){L().groupPending=null;ctx.save();return;}if(!pending)return;const history=S().chatMessages[groupId]||[],answered=new Set(history.flatMap(m=>m.replyTo||[])),inputs=history.filter(m=>pending.ids.includes(m.id)&&m.from==='self'&&!answered.has(m.id));L().groupPending=null;if(!inputs.length){ctx.save();return;}const reply=groupReply(inputs.at(-1).text,history.filter(m=>m.replyOrigin==='local-fan-group').length);incoming(groupId,{id:'fans_'+inputs.at(-1).id,type:'text',from:'other',...reply,replyOrigin:'local-fan-group',replyTo:inputs.map(m=>m.id)});ctx.save();}
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
  return {cancelGroup(){clearTimeout(groupTimer);groupTimer=null;L().groupPending=null;},sync,answer,end,enqueueGroup,toggleGroupMute,visibility,notify:(id,m)=>ctx.onIncoming(id,m,false),dispose:clearTimers};
 }
 const api={groupId,members,seed,defaults,normalize,create,createSound};
 if(typeof module!=='undefined')module.exports=api;else root.PhoneLife=api;
})(typeof window==='undefined'?globalThis:window);
