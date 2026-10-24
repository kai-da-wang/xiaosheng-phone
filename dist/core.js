(function(root){
  const key='xiaosheng-phone-v1';
  const defaults=()=>({version:1,seenIntro:false,unlocked:false,viewed:[],favorites:[],opened:[],settings:{dark:false,reduced:false,review:false,brightness:100},alarms:[{time:'07:30',label:'起床，今天也出门走走',on:true},{time:'23:00',label:'早点休息',on:false}],notes:[],reminders:[{id:'r1',text:'去看看今天的晚霞',done:false},{id:'r2',text:'把喜欢的片段收藏起来',done:false}],sms:[],captures:0,chatReadRooms:[],chatDrafts:{},chatMessages:{},playedVoiceIds:[],discovered:[],callLog:[]});
  function normalize(raw){const d=defaults();if(!raw||raw.version!==1)return d;return {...d,...raw,viewed:[...new Set(Array.isArray(raw.viewed)?raw.viewed:[])],favorites:[...new Set(Array.isArray(raw.favorites)?raw.favorites:[])],settings:{...d.settings,...raw.settings}};}
  function canQuote(s){return s.status==='verified'&&!!s.speaker&&Number.isFinite(s.timestampSec)&&s.timestampSec>=0&&!!s.sourceUrl&&s.rights==='cleared';}
  function collect(state,id){const i=state.favorites.indexOf(id);if(i<0)state.favorites.push(id);else state.favorites.splice(i,1);return i<0;}
  function favoriteLeads(state,data){return data.people.filter(p=>p.scenes.some(s=>state.favorites.includes(s.id))).length;}
  function safeUrl(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:null;}catch{return null;}}
  const api={key,defaults,normalize,canQuote,collect,favoriteLeads,safeUrl};
  if(typeof module!=='undefined')module.exports=api;else root.PhoneCore=api;
})(typeof window==='undefined'?globalThis:window);
