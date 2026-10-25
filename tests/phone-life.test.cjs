const test=require('node:test'),assert=require('node:assert/strict');
const Life=require('../dist/phone-life.js'),Core=require('../dist/core.js');
function setup(state=Core.defaults()){
 let now=0,n=0,hidden=false,available=true;const tasks=new Map(),events=[],calls=[],sounds=[];
 const timers={setTimeout:global.setTimeout,clearTimeout:global.clearTimeout};
 global.setTimeout=(fn,delay)=>{const id=++n;tasks.set(id,{at:now+delay,fn});return id;};global.clearTimeout=id=>tasks.delete(id);
 const route={app:'home'},sound={ring:()=>sounds.push('ring'),stop:()=>sounds.push('stop')};state.unlocked=true;
 const runtime=Life.create({getState:()=>state,getRoute:()=>route,wang:'wang',sound,save(){},hidden:()=>hidden,available:()=>available,onCall:p=>calls.push(p),onIncoming:(id,m)=>events.push({id,m})});
 function tick(ms){const end=now+ms;for(let limit=0;limit<100;limit++){const entry=[...tasks].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!entry)break;tasks.delete(entry[0]);now=entry[1].at;entry[1].fn();}now=end;}
 return {state,route,runtime,events,calls,sounds,tick,hide(v){hidden=v;runtime.visibility();},block(v){available=v;},close(){runtime.dispose();Object.assign(global,timers);}};
}
test('old saves retain progress and defensive phone-event defaults',()=>{
 const raw={version:1,notes:[{id:'keep'}],chatMessages:{wang:[{text:'keep'}]},settings:{sound:false},phoneLife:{callStatus:'invalid',groupMuted:'yes',groupPending:{ids:['x','x',null]}}};
 const s=Core.normalize(raw);assert.deepEqual(s.notes,raw.notes);assert.deepEqual(s.chatMessages,raw.chatMessages);assert.equal(s.settings.sound,false);assert.deepEqual(s.phoneLife,Life.normalize(raw.phoneLife));assert.equal(s.phoneLife.callStatus,'new');assert.equal(s.phoneLife.groupMuted,false);
});
test('call waits 2 seconds, hangs up once, then sends one unread message; navigation preserves timer',()=>{
 const h=setup();try{h.runtime.sync();h.tick(1500);assert.deepEqual(h.calls,[]);h.route.app='wechat';h.runtime.sync();h.tick(499);assert.deepEqual(h.calls,[]);h.tick(1);assert.deepEqual(h.calls,['ringing']);h.runtime.end();h.runtime.end();h.tick(850);assert.equal(h.state.callLog.length,1);assert.equal(h.state.chatMessages.wang.length,1);assert.equal(h.state.chatMessages.wang[0].id,'wang-call-followup-v1');assert.equal(h.state.phoneLife.followupSent,true);assert.equal(h.state.chatReadRooms.includes('wang'),false);h.runtime.sync();h.tick(25000);assert.equal(h.calls.filter(x=>x==='ringing').length,1);}finally{h.close();}
});
test('hidden or locked pages do not start calls; answer stops ringtone and completes the scene',()=>{
 const h=setup();try{h.hide(true);h.runtime.sync();h.tick(3000);assert.equal(h.calls.length,0);h.hide(false);h.tick(2000);h.runtime.answer();assert.equal(h.state.phoneLife.callStatus,'connected');assert.equal(h.sounds.at(-1),'stop');h.tick(8000+850);assert.equal(h.state.phoneLife.callResult,'answered');assert.match(h.state.chatMessages.wang[0].text,/说的算数/);}finally{h.close();}
 const a=setup();try{a.route.app='lock';a.runtime.sync();a.tick(3000);assert.equal(a.calls.length,0);}finally{a.close();}
});
test('refresh during ringing recovers as missed once, without replaying the call',()=>{
 const s=Core.defaults();s.phoneLife.callStatus='ringing';const h=setup(s);try{h.runtime.sync();h.tick(850);assert.equal(h.state.phoneLife.callStatus,'ended');assert.equal(h.state.phoneLife.callResult,'missed');assert.equal(h.state.chatMessages.wang.length,1);assert.equal(h.calls.includes('ringing'),false);}finally{h.close();}
 const b=setup(Core.normalize(JSON.parse(JSON.stringify(s))));try{b.runtime.sync();b.tick(30000);assert.equal(b.state.chatMessages.wang.length,1);assert.equal(b.calls.includes('ringing'),false);}finally{b.close();}
});
test('group bursts debounce, recover pending across refresh, and never duplicate answered inputs',()=>{
 const s=Core.defaults();s.phoneLife.callStatus='ended';s.phoneLife.followupSent=true;s.phoneLife.groupIntroSent=true;s.chatMessages[Life.groupId]=[{id:'a',type:'text',from:'self',text:'我来了'},{id:'b',type:'text',from:'self',text:'想吃火锅'}];
 const h=setup(s);try{h.runtime.sync();h.runtime.enqueueGroup(s.chatMessages[Life.groupId][0]);h.tick(500);h.runtime.enqueueGroup(s.chatMessages[Life.groupId][1]);h.tick(1800);assert.equal(h.events.length,1);assert.match(h.events[0].m.text,/吃|菜|饭/);assert.deepEqual(h.events[0].m.replyTo,['a','b']);h.runtime.enqueueGroup(s.chatMessages[Life.groupId][1]);h.tick(2000);assert.equal(h.events.length,1);assert.equal(h.runtime.toggleGroupMute(),true);}finally{h.close();}
 s.chatMessages[Life.groupId].push({id:'c',type:'text',from:'self',text:'今天好累'});s.phoneLife.groupPending={ids:['c']};const a=setup(Core.normalize(JSON.parse(JSON.stringify(s))));try{a.runtime.sync();a.tick(800);assert.equal(a.events.length,1);assert.match(a.events[0].m.text,/不用负责活跃气氛/);assert.equal(a.state.phoneLife.groupMuted,true);}finally{a.close();}
});
test('group intro arrives once and active-room arrivals stay read',()=>{
 const h=setup();try{h.state.phoneLife.callStatus='ended';h.state.phoneLife.followupSent=true;h.route.app='room';h.route.id=Life.groupId;h.state.chatReadRooms=[Life.groupId];h.runtime.sync();h.tick(6500);assert.equal(h.events.length,1);assert.equal(h.state.chatReadRooms.includes(Life.groupId),true);h.runtime.sync();h.tick(10000);assert.equal(h.events.length,1);}finally{h.close();}
});
test('sound is gesture-unlocked, respects mute, and stops scheduled ringtone oscillators',()=>{
 const old=global.AudioContext;let resumes=0,tones=0,stops=0,hidden=false;const s=Core.defaults();
 global.AudioContext=class{constructor(){this.state='suspended';this.currentTime=0;this.destination={};}resume(){resumes++;this.state='running';return Promise.resolve();}createOscillator(){tones++;return {frequency:{},connect(){},disconnect(){},start(){},stop(){stops++;}};}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}};
 const a=Life.createSound({getState:()=>s,hidden:()=>hidden});try{a.message();assert.equal(tones,0);a.unlock();a.message();assert.equal(resumes,1);assert.equal(tones,2);s.settings.sound=false;a.message();assert.equal(tones,2);s.settings.sound=true;hidden=true;a.message();assert.equal(tones,2);hidden=false;a.ring();assert.equal(tones,6);a.stop();assert.ok(stops>=6);}finally{a.stop();global.AudioContext=old;}
});

test('an open sheet defers the incoming call until it closes',()=>{const h=setup();try{h.runtime.sync();h.tick(1000);h.block(false);h.tick(2000);assert.equal(h.calls.length,0);h.block(true);h.tick(500);assert.deepEqual(h.calls,['ringing']);}finally{h.close();}});
