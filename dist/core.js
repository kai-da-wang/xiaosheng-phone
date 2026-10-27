(function(root){
  const key='xiaosheng-phone-v1';
  const personaIds=['lead_vivi','lead_muma','lead_monv','lead_gangjie'];
  const personaRoom=id=>({autoReply:true,affinity:id==='lead_vivi'?30:25,trust:50,discomfort:0,mood:'neutral',lastReplyAt:0,lastTopic:null,facts:{},flirtAllowed:true,memoryAllowed:true,recentReplies:[],recentInputs:[],conversationTurns:0,positiveTurns:0,repairTurns:0,growthCount:0,growthDay:'',lastGrowthTurn:0,lastEmotionDay:'',pending:null});
  const personaDefaults=()=>({version:1,rooms:Object.fromEntries(personaIds.map(id=>[id,personaRoom(id)]))});
  function normalizePersona(raw){
    const result=personaDefaults(),obj=v=>v&&typeof v==='object'&&!Array.isArray(v),number=(v,d,a,b)=>Number.isFinite(v)?Math.max(a,Math.min(b,Math.floor(v))):d;
    for(const id of personaIds){const r=obj(raw?.rooms?.[id])?raw.rooms[id]:{},d=result.rooms[id];
      for(const k of ['autoReply','flirtAllowed','memoryAllowed'])if(typeof r[k]==='boolean')d[k]=r[k];
      for(const [k,a,b] of [['affinity',0,100],['trust',0,100],['discomfort',0,5],['conversationTurns',0,1e7],['positiveTurns',0,1e7],['repairTurns',0,10],['growthCount',0,6],['lastGrowthTurn',0,1e7],['lastReplyAt',0,1e15]])d[k]=number(r[k],d[k],a,b);
      if(['neutral','warm','playful','hurt','guarded'].includes(r.mood))d.mood=r.mood;
      for(const k of ['lastTopic','growthDay','lastEmotionDay'])if(typeof r[k]==='string')d[k]=r[k].slice(0,40);
      for(const k of ['recentReplies','recentInputs'])d[k]=Array.isArray(r[k])?r[k].filter(v=>typeof v==='string').slice(-6).map(v=>v.slice(0,180)):[];
      if(obj(r.facts)&&d.memoryAllowed)for(const k of ['name','favoriteFood','travelPlace','agreement'])if(typeof r.facts[k]==='string'&&r.facts[k].trim()&&r.facts[k].length<=70)d.facts[k]=r.facts[k].trim();
      if(d.autoReply&&obj(r.pending)&&typeof r.pending.jobId==='string'&&Array.isArray(r.pending.ids)){const ids=[...new Set(r.pending.ids.filter(v=>typeof v==='string'&&v.length<150))].slice(-30);if(ids.length)d.pending={jobId:r.pending.jobId.slice(0,150),ids,createdAt:number(r.pending.createdAt,0,0,1e15)};}
    }return result;
  }
  const lifeDefaults=()=>({version:1,callStatus:'new',callResult:'',followupSent:false,groupIntroSent:false,groupMuted:false,groupPending:null});
  function normalizeLife(raw){const d=lifeDefaults();if(!raw||typeof raw!=='object')return d;for(const k of ['followupSent','groupIntroSent','groupMuted'])if(typeof raw[k]==='boolean')d[k]=raw[k];if(['new','ringing','connected','ended'].includes(raw.callStatus))d.callStatus=raw.callStatus;if(['declined','answered','missed'].includes(raw.callResult))d.callResult=raw.callResult;if(raw.groupPending&&Array.isArray(raw.groupPending.ids)){const ids=[...new Set(raw.groupPending.ids.filter(x=>typeof x==='string'&&x.length<150))].slice(-20);if(ids.length)d.groupPending={ids};}return d;}
  const defaults=()=>({version:1,seenIntro:false,unlocked:false,viewed:[],favorites:[],opened:[],settings:{dark:false,reduced:false,review:false,brightness:100,sound:true},alarms:[{time:'07:30',label:'起床，今天也出门走走',on:true},{time:'23:00',label:'早点休息',on:false}],notes:[],reminders:[{id:'r1',text:'去看看今天的晚霞',done:false},{id:'r2',text:'把喜欢的片段收藏起来',done:false}],sms:[],captures:0,wechatPrefs:{},wechatGroups:{},wechatFeedback:[],chatReadRooms:[],chatReadStories:[],chatDrafts:{},chatMessages:{},playedVoiceIds:[],discovered:[],callLog:[],noteChecks:[],mapSavedPlaces:[],wangAutoReply:true,wangMemory:{},wangPending:null,wangLastMode:'local',personaV2:personaDefaults(),phoneLife:lifeDefaults()});
  function normalize(raw){
    const d=defaults(),obj=v=>v&&typeof v==='object'&&!Array.isArray(v),strings=v=>Array.isArray(v)?[...new Set(v.filter(x=>typeof x==='string'))]:[];
    if(!obj(raw)||raw.version!==1)return d;
    const result={...d,...raw,settings:{...d.settings,...(obj(raw.settings)?raw.settings:{})},personaV2:normalizePersona(raw.personaV2),phoneLife:normalizeLife(raw.phoneLife)};
    for(const k of ['viewed','favorites','opened','chatReadRooms','chatReadStories','playedVoiceIds','discovered','mapSavedPlaces'])result[k]=strings(raw[k]);
    for(const k of ['seenIntro','unlocked','wangAutoReply'])result[k]=typeof raw[k]==='boolean'?raw[k]:d[k];
    for(const k of ['dark','reduced','review','sound'])result.settings[k]=typeof raw.settings?.[k]==='boolean'?raw.settings[k]:d.settings[k];
    result.settings.brightness=Number.isFinite(raw.settings?.brightness)?Math.max(45,Math.min(100,raw.settings.brightness)):100;
    result.captures=Number.isFinite(raw.captures)?Math.max(0,Math.floor(raw.captures)):0;
    const records=(key,valid)=>Array.isArray(raw[key])?raw[key].filter(v=>obj(v)&&valid(v)):d[key];
    result.notes=records('notes',v=>typeof v.id==='string');
    result.sms=Array.isArray(raw.sms)?raw.sms.filter(v=>typeof v==='string'):[];
    result.reminders=records('reminders',v=>typeof v.id==='string'&&typeof v.text==='string');
    result.alarms=records('alarms',v=>typeof v.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time)&&typeof v.label==='string');
    result.callLog=records('callLog',v=>typeof v.id==='string');
    result.noteChecks=Array.isArray(raw.noteChecks)?[...new Set(raw.noteChecks.filter(v=>Number.isInteger(v)&&v>=0&&v<3))]:[];
    const validKey=k=>k.length<150&&!['__proto__','constructor','prototype'].includes(k);
    result.chatDrafts=Object.fromEntries(Object.entries(obj(raw.chatDrafts)?raw.chatDrafts:{}).filter(([k,v])=>validKey(k)&&typeof v==='string').map(([k,v])=>[k,v.slice(0,1000)]));
    result.chatMessages=Object.fromEntries(Object.entries(obj(raw.chatMessages)?raw.chatMessages:{}).filter(([k,v])=>validKey(k)&&Array.isArray(v)).map(([k,v])=>[k,v.filter(m=>obj(m)&&(m.type===undefined||['text','system'].includes(m.type)?typeof m.text==='string':['voice','photo'].includes(m.type)))]));
    result.wechatPrefs={};
    for(const [id,p] of Object.entries(obj(raw.wechatPrefs)?raw.wechatPrefs:{})){if(!validKey(id)||!obj(p))continue;const clean={};for(const k of ['muted','pinned','saved','showNicknames','left','historyCleared'])if(typeof p[k]==='boolean')clean[k]=p[k];for(const k of ['groupName','notice','remark','myNickname'])if(typeof p[k]==='string')clean[k]=p[k].slice(0,k==='notice'?500:40);if(['default','mint','blue','pink','sand'].includes(p.background))clean.background=p.background;if(Array.isArray(p.addedMembers))clean.addedMembers=strings(p.addedMembers).filter(validKey);result.wechatPrefs[id]=clean;}
    result.wechatGroups={};
    for(const [id,g] of Object.entries(obj(raw.wechatGroups)?raw.wechatGroups:{})){if(!/^local_group_[a-z0-9]+$/.test(id)||!obj(g)||typeof g.name!=='string'||!Array.isArray(g.members))continue;result.wechatGroups[id]={id,name:g.name.slice(0,40),members:strings(g.members).filter(validKey),owner:'self'};}
    result.wechatFeedback=Array.isArray(raw.wechatFeedback)?raw.wechatFeedback.filter(v=>obj(v)&&typeof v.room==='string'&&typeof v.reason==='string').slice(-30):[];
    result.wangMemory=obj(raw.wangMemory)?raw.wangMemory:{};
    result.wangPending=obj(raw.wangPending)&&typeof raw.wangPending.jobId==='string'&&Array.isArray(raw.wangPending.ids)?{...raw.wangPending,ids:strings(raw.wangPending.ids)}:null;
    return result;
  }
  function canQuote(s){return s.status==='verified'&&!!s.speaker&&Number.isFinite(s.timestampSec)&&s.timestampSec>=0&&!!s.sourceUrl&&s.rights==='cleared';}
  function collect(state,id){const i=state.favorites.indexOf(id);if(i<0)state.favorites.push(id);else state.favorites.splice(i,1);return i<0;}
  function favoriteLeads(state,data){return data.people.filter(p=>p.scenes.some(s=>state.favorites.includes(s.id))).length;}
  function safeUrl(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null;}catch{return null;}}
  function messageTimestamp(message){if(Number.isFinite(message?.createdAt)&&message.createdAt>0)return message.createdAt;return Number(String(message?.id||'').match(/(?:^|_)(\d{13})(?:_|$)/)?.[1])||0;}
  const api={key,defaults,normalize,canQuote,collect,favoriteLeads,safeUrl,messageTimestamp,personaIds,personaRoom,normalizePersona};
  if(typeof module!=='undefined')module.exports=api;else root.PhoneCore=api;
})(typeof window==='undefined'?globalThis:window);
