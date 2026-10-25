(function(root){
  const key='xiaosheng-phone-v1';
  const personaIds=['lead_vivi','lead_muma','lead_monv'];
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
  const defaults=()=>({version:1,seenIntro:false,unlocked:false,viewed:[],favorites:[],opened:[],settings:{dark:false,reduced:false,review:false,brightness:100},alarms:[{time:'07:30',label:'起床，今天也出门走走',on:true},{time:'23:00',label:'早点休息',on:false}],notes:[],reminders:[{id:'r1',text:'去看看今天的晚霞',done:false},{id:'r2',text:'把喜欢的片段收藏起来',done:false}],sms:[],captures:0,chatReadRooms:[],chatReadStories:[],chatDrafts:{},chatMessages:{},playedVoiceIds:[],discovered:[],callLog:[],noteChecks:[],mapSavedPlaces:[],wangAutoReply:true,wangMemory:{},wangPending:null,wangLastMode:'local',personaV2:personaDefaults()});
  function normalize(raw){const d=defaults();if(!raw||raw.version!==1)return d;return {...d,...raw,viewed:[...new Set(Array.isArray(raw.viewed)?raw.viewed:[])],favorites:[...new Set(Array.isArray(raw.favorites)?raw.favorites:[])],settings:{...d.settings,...raw.settings},personaV2:normalizePersona(raw.personaV2)};}
  function canQuote(s){return s.status==='verified'&&!!s.speaker&&Number.isFinite(s.timestampSec)&&s.timestampSec>=0&&!!s.sourceUrl&&s.rights==='cleared';}
  function collect(state,id){const i=state.favorites.indexOf(id);if(i<0)state.favorites.push(id);else state.favorites.splice(i,1);return i<0;}
  function favoriteLeads(state,data){return data.people.filter(p=>p.scenes.some(s=>state.favorites.includes(s.id))).length;}
  function safeUrl(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null;}catch{return null;}}
  const api={key,defaults,normalize,canQuote,collect,favoriteLeads,safeUrl,personaIds,personaRoom,normalizePersona};
  if(typeof module!=='undefined')module.exports=api;else root.PhoneCore=api;
})(typeof window==='undefined'?globalThis:window);
