const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const Core=require('../dist/core.js'),Media=require('../dist/photo-media.js');
const window={};for(const name of ['gallery-data.js','photo-variants.js'])vm.runInNewContext(fs.readFileSync('dist/'+name,'utf8'),{window});
test('all displayed photo variants exist, save bandwidth, and retain the exact originals',()=>{
 let original=0,thumb=0,full=0;
 for(const asset of window.PHOTO_LIBRARY.assets){const bytes=fs.readFileSync('dist/'+asset.path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);original+=bytes.length;
  for(const size of ['avatar','thumb','full']){const variant=window.PHOTO_VARIANTS[asset.path][size];assert.ok(fs.statSync('dist/'+variant.path).size>0);assert.ok(variant.width>0&&variant.height>0);}
  thumb+=fs.statSync('dist/'+window.PHOTO_VARIANTS[asset.path].thumb.path).size;full+=fs.statSync('dist/'+window.PHOTO_VARIANTS[asset.path].full.path).size;
 }
 assert.ok(thumb<original*.12,'thumbnail budget');assert.ok(full<original*.45,'large image budget');
});
test('embedded offline images and unknown legacy paths resolve without breaking original access',()=>{
 const media=Media.create({'a.jpg':{thumb:{path:'a.webp',width:120,height:180}}},{'a.webp':'data:image/webp;base64,AAA','a.jpg':'data:image/jpeg;base64,BBB'});
 assert.equal(media.src('a.jpg'),'data:image/webp;base64,AAA');assert.equal(media.original('a.jpg'),'data:image/jpeg;base64,BBB');assert.equal(media.src('legacy.jpg'),'legacy.jpg');assert.match(media.attrs('a.jpg'),/width="120" height="180"/);
});
test('failed optimized requests fall back once, then let the viewer report a failed original',()=>{
 const callbacks={},sandbox={window:{PHOTO_VARIANTS:{}},document:{addEventListener:(type,fn)=>callbacks[type]=fn}};vm.runInNewContext(fs.readFileSync('dist/photo-media.js','utf8'),sandbox);
 const img={tagName:'IMG',dataset:{fallback:'original.jpg'},src:'thumb.webp',getAttribute(){return this.src;}};let stopped=0;
 callbacks.error({target:img,stopImmediatePropagation(){stopped++;}});assert.equal(img.src,'original.jpg');assert.equal(stopped,1);
 callbacks.error({target:img,stopImmediatePropagation(){stopped++;}});assert.equal(stopped,1);
});
test('damaged save fields recover without discarding valid legacy messages or notes',()=>{
 const state=Core.normalize({version:1,opened:null,chatReadRooms:{},chatMessages:{wang:[null,1,{text:'legacy text'},{id:'ok',type:'text',text:'kept'}],broken:{}},chatDrafts:{wang:42,other:'draft'},notes:[null,{id:'old-note'}],settings:{brightness:'bad',sound:false},reminders:null});
 assert.deepEqual(state.opened,[]);assert.deepEqual(state.chatReadRooms,[]);assert.equal(state.chatMessages.wang.length,2);assert.equal(state.notes.length,1);assert.equal(state.chatDrafts.other,'draft');assert.equal(state.settings.brightness,100);assert.equal(state.settings.sound,false);assert.ok(Array.isArray(state.reminders));
});
function audioHarness({sound=false}={}){
 const w={},route={app:'room',id:'lead_wang_xiaomiao'},reads=[],audio=[],revoked=[],open={},writes=[],events={},documentEvents={};let state=Core.defaults(),renders=0,soundUnlocks=0;
 for(const name of ['content.js','gallery-data.js'])vm.runInNewContext(fs.readFileSync('dist/'+name,'utf8'),{window:w});
 if(sound)w.PhoneLife={groupId:'fans',members:[],normalize:v=>v,createSound:()=>({unlock(){soundUnlocks++;}}),create:()=>({})};
 w.indexedDB={open:()=>open};w.WangChatRuntime={create:()=>({typingMarkup:()=>''})};w.PersonaChatRuntime={create:()=>({supports:()=>false})};
 const upload={files:[],addEventListener:(type,fn)=>events[type]=fn};
 const document={addEventListener:(type,fn)=>documentEvents[type]=fn,createElement:()=>upload,body:{appendChild(){}},querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null};
 const sandbox={window:w,document,clearTimeout,indexedDB:w.indexedDB,Promise,Intl,Date,Map,Math,URL:{createObjectURL:blob=>'blob:'+blob.id,revokeObjectURL:url=>revoked.push(url)},Audio:class{constructor(url){this.url=url;audio.push(this);}play(){this.played=true;return Promise.resolve();}pause(){this.paused=true;}}};
 vm.runInNewContext(fs.readFileSync('dist/phone-experience.js','utf8'),sandbox);
 const x=w.PhoneExperience.create({data:w.PHONE_DATA,gallery:w.PHOTO_LIBRARY,esc:String,icon:()=>'',btn:()=>'',shell:()=>'',go(){},save(){},toast(){},modal(){},appIcon(){},render(){renders++;},getState:()=>state,getRoute:()=>route});
 open.result={transaction:()=>{const tx={objectStore:()=>({get:()=>{const r={};reads.push(r);return r;},put:(blob,id)=>writes.push({blob,id,tx})})};return tx;}};open.onsuccess();
 state.chatMessages[route.id]=[{id:'a',type:'voice',blobKey:'a'},{id:'b',type:'voice',blobKey:'b'}];
 return {x,route,state,reads,audio,revoked,writes,upload,events,documentEvents,soundUnlocks:()=>soundUnlocks,renders:()=>renders,reset(){state=Core.defaults();return state;},play(id){x.action('wx-voice',{dataset:{id,room:route.id}});},resolve(index,id){reads[index].result={id};reads[index].onsuccess();}};
}
const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
test('lock and passcode gestures skip audio setup; an app gesture still enables sound',()=>{
 const h=audioHarness({sound:true}),locked={target:{closest:()=>({})}};
 h.documentEvents.pointerdown(locked);h.documentEvents.keydown(locked);assert.equal(h.soundUnlocks(),0);
 h.documentEvents.pointerdown({target:{closest:()=>null}});assert.equal(h.soundUnlocks(),1);
});
test('leaving a room cancels voice playback even if IndexedDB finishes later',async()=>{
 const h=audioHarness();h.play('a');await flush();h.x.onNavigate();h.route.app='home';h.resolve(0,'a');await flush();assert.equal(h.audio.length,0);assert.deepEqual(h.state.playedVoiceIds,[]);
});
test('rapid voice selection plays only the latest result and releases its object URL',async()=>{
 const h=audioHarness();h.play('a');await flush();h.play('b');await flush();h.resolve(1,'b');await flush();h.resolve(0,'a');await flush();assert.equal(h.audio.length,1);assert.equal(h.audio[0].url,'blob:b');assert.deepEqual(h.state.playedVoiceIds,['b']);h.x.stopAudio();assert.equal(h.audio[0].paused,true);assert.deepEqual(h.revoked,['blob:b']);
});
test('finishing an audio import saves to its original room without repainting another page',async()=>{
 const h=audioHarness(),room=h.route.id;h.upload.files=[{id:'import',size:100,name:'clip.m4a'}];h.events.change();const probe=h.audio[0];probe.duration=3;const saved=probe.onloadedmetadata();await flush();h.route.app='home';h.writes[0].tx.oncomplete();await saved;
 assert.equal(h.state.chatMessages[room].at(-1).type,'voice');assert.equal(h.renders(),0);assert.ok(h.revoked.includes('blob:import'));
});
test('resetting during metadata or storage prevents an old import from entering the new save',async()=>{
 for(const phase of ['metadata','storage']){const h=audioHarness();h.upload.files=[{id:'import',size:100,name:'clip.m4a'}];h.events.change();const probe=h.audio[0];probe.duration=3;
  if(phase==='metadata'){const fresh=h.reset();await probe.onloadedmetadata();assert.deepEqual(fresh.chatMessages,{});assert.equal(h.writes.length,0);}
  else{const saved=probe.onloadedmetadata();await flush();const fresh=h.reset();h.writes[0].tx.oncomplete();await saved;assert.deepEqual(fresh.chatMessages,{});}
  assert.equal(h.renders(),0);
 }
});
test('map requests are lazy, shared, retryable, and never repaint a different app',()=>{
 const w={},scripts=[],route={app:'maps'},calls=[],document={createElement:()=>({remove(){}}),head:{appendChild:s=>scripts.push(s)}};
 vm.runInNewContext(fs.readFileSync('dist/dali-experience.js','utf8'),{window:w,document});
 const x=w.DaliExperience.create({gallery:{},esc:String,icon:()=>'',btn:()=>'',shell:(title,body)=>body,getState:()=>Core.defaults(),getRoute:()=>route,render:()=>calls.push('render')});
 assert.equal(scripts.length,0);x.maps();x.maps();assert.equal(scripts.length,1);scripts[0].onerror();assert.equal(calls.length,1);assert.match(x.maps(),/没有加载成功/);x.action('dali-retry');assert.equal(scripts.length,2);route.app='home';w.DALI_MAP={};scripts[1].onload();assert.equal(calls.length,2);
});
