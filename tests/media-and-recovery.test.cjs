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
test('second-page icons retain official store artwork bytes and work in the offline build',()=>{
 const manifest=JSON.parse(fs.readFileSync('dist/assets/app-icons/manifest.json','utf8')),scope={window:{},Intl,Date};
 vm.runInNewContext(fs.readFileSync('dist/icons.js','utf8'),scope);assert.equal(Object.keys(manifest).length,14);
 for(const [id,asset] of Object.entries(manifest)){
  const bytes=fs.readFileSync('dist/'+asset.path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  assert.match(asset.artworkUrl,/^https:\/\/is\d-ssl\.mzstatic\.com\//);assert.match(asset.sourcePage,/^https:\/\/apps\.apple\.com\//);
  const live=scope.window.appIcon(id);assert.ok(live.includes('src="'+asset.path+'"'));assert.ok(!live.includes('<svg'));
  scope.window.PHONE_EMBEDDED_ASSETS={[asset.path]:'data:image/jpeg;base64,'+bytes.toString('base64')};assert.ok(scope.window.appIcon(id).includes(scope.window.PHONE_EMBEDDED_ASSETS[asset.path]));
 }
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
function audioHarness({sound=false,failOpen=false,failTransaction=false}={}){
 const w={},route={app:'room',id:'lead_wang_xiaomiao'},reads=[],audio=[],revoked=[],open={},writes=[],deletes=[],clears=[],toasts=[],events={},documentEvents={};let state=Core.defaults(),renders=0,soundUnlocks=0,lifeContext;
 for(const name of ['content.js','gallery-data.js'])vm.runInNewContext(fs.readFileSync('dist/'+name,'utf8'),{window:w});
 if(sound)w.PhoneLife={groupId:'fans',members:[],normalize:v=>v,createSound:()=>({unlock(){soundUnlocks++;}}),create:c=>(lifeContext=c,{})};
 w.indexedDB={open:()=>{if(failOpen)throw Error('blocked');return open;}};w.WangChatRuntime={create:()=>({typingMarkup:()=>''})};w.PersonaChatRuntime={create:()=>({supports:()=>false})};
 const upload={files:[],click(){},addEventListener:(type,fn)=>events[type]=fn};
 const document={addEventListener:(type,fn)=>documentEvents[type]=fn,createElement:()=>upload,body:{appendChild(){}},querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null};
 const sandbox={window:w,document,clearTimeout,indexedDB:w.indexedDB,Promise,Intl,Date,Map,Set,Math,URL:{createObjectURL:blob=>'blob:'+blob.id,revokeObjectURL:url=>revoked.push(url)},Audio:class{constructor(url){this.url=url;audio.push(this);}play(){this.played=true;return Promise.resolve();}pause(){this.paused=true;}}};
 vm.runInNewContext(fs.readFileSync('dist/wechat-details.js','utf8'),sandbox);
 vm.runInNewContext(fs.readFileSync('dist/phone-experience.js','utf8'),sandbox);
 const x=w.PhoneExperience.create({data:w.PHONE_DATA,gallery:w.PHOTO_LIBRARY,esc:String,icon:()=>'',btn:(action,label,cls='',extra='')=>`<button data-action="${action}" ${extra}>${label}</button>`,shell:(title,body)=>body,go(){},save(){},toast(message){toasts.push(message);},modal(){},closeModal(){},appIcon(){},render(){renders++;},getState:()=>state,getRoute:()=>route});
 if(!failOpen){open.result={transaction:()=>{if(failTransaction)throw Error('database closed');const tx={objectStore:()=>({get:()=>{const r={};reads.push(r);return r;},put:(blob,id)=>writes.push({blob,id,tx}),delete:id=>deletes.push({id,tx}),clear:()=>clears.push(tx)})};return tx;}};open.onsuccess();}
 state.chatMessages[route.id]=[{id:'a',type:'voice',blobKey:'a'},{id:'b',type:'voice',blobKey:'b'}];
 return {x,route,state,reads,document,lifeContext,audio,revoked,writes,deletes,clears,toasts,upload,events,documentEvents,soundUnlocks:()=>soundUnlocks,renders:()=>renders,reset(){state=Core.defaults();return state;},play(id){x.action('wx-voice',{dataset:{id,room:route.id}});},resolve(index,id){reads[index].result={id};reads[index].onsuccess();}};
}
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
test('locked keyboard focus skips audio setup; successful unlock enables the first call without another tap',()=>{
 const h=audioHarness({sound:true}),body={target:{closest:()=>null}};
 for(const app of ['lock','pin']){h.route.app=app;h.documentEvents.pointerdown(body);h.documentEvents.keydown(body);}
 assert.equal(h.soundUnlocks(),0);
 h.route.app='home';h.state.unlocked=true;h.x.onUnlock();assert.equal(h.soundUnlocks(),1);
 h.documentEvents.pointerdown(body);assert.equal(h.soundUnlocks(),2);
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

test('incoming call eligibility defers while a composer, note editor, or overlay is active',()=>{
 const h=audioHarness({sound:true});assert.equal(h.lifeContext.available(),true);h.document.activeElement={matches:()=>true};assert.equal(h.lifeContext.available(),false);h.document.activeElement={matches:()=>false};assert.equal(h.lifeContext.available(),true);h.document.querySelector=()=>({});assert.equal(h.lifeContext.available(),false);
});

test('clearing a chat cancels imports at metadata and storage stages and releases orphan audio',async()=>{
 for(const phase of ['metadata','storage']){const h=audioHarness(),id=h.route.id;h.state.chatMessages.other=[{id:'other',type:'voice',blobKey:'b'}];h.upload.files=[{id:'clip',size:100,name:'clip.m4a'}];h.events.change();const probe=h.audio[0];probe.duration=3;
  const pending=phase==='storage'?probe.onloadedmetadata():null;if(pending)await flush();h.x.action('wx-clear-confirm',{dataset:{}});await flush();
  if(pending){h.writes[0].tx.oncomplete();await pending;await flush();assert.ok(h.deletes.some(x=>x.id===h.writes[0].id));}else{await probe.onloadedmetadata();assert.equal(h.writes.length,0);}
  assert.equal(h.state.chatMessages[id].length,0);assert.equal(h.state.chatMessages.other.length,1);assert.ok(h.deletes.some(x=>x.id==='a'));assert.ok(!h.deletes.some(x=>x.id==='b'));
 }
});
test('file picker retains the original chat even if the user navigates before selection',async()=>{
 const h=audioHarness(),original=h.route.id;h.x.action('wx-import',{dataset:{}});h.route.id='lead_muma';h.upload.files=[{id:'picked',size:100,name:'clip.m4a'}];h.events.change();const probe=h.audio[0];probe.duration=3;const saved=probe.onloadedmetadata();await flush();h.writes[0].tx.oncomplete();await saved;
 assert.equal(h.state.chatMessages[original].at(-1).type,'voice');assert.equal(h.state.chatMessages.lead_muma,undefined);assert.equal(h.renders(),0);
});
test('reset invalidates an open picker and clears stored audio',async()=>{
 const h=audioHarness();h.x.action('wx-import',{dataset:{}});h.x.discardAllMedia();h.reset();h.upload.files=[{id:'old',size:100,name:'clip.m4a'}];h.events.change();await flush();assert.equal(h.audio.length,0);assert.equal(h.writes.length,0);assert.equal(h.clears.length,1);
});
test('unavailable or closed browser audio storage shows a helpful message instead of crashing',async()=>{
 for(const opts of [{failOpen:true},{failTransaction:true}]){const h=audioHarness(opts);h.play('a');await flush();assert.ok(h.toasts.some(t=>/原声文件不可用/.test(t)));assert.equal(h.audio.length,0);}
});

test('Safari recent entries lead to valid apps, with readable names and no duplicate detail pages',()=>{const h=audioHarness();h.state.opened=['contacts','room','chat-info','chat-search','album','photos','file-manager','chapters'];const html=h.x.safari();assert.match(html,/>文件</);assert.match(html,/>故事片段</);assert.match(html,/>微信</);assert.equal((html.match(/data-app="wechat"/g)||[]).length,2);assert.doesNotMatch(html,/data-app="chat-info"|data-app="chat-search"|data-app="album"/);});

test('playing real audio removes its visible unread indicator in the voice wrapper',async()=>{
 const h=audioHarness();let removed=0;const b={classList:{add(){}},closest:sel=>sel==='.wx-voice-wrap'?{querySelector:()=>({remove(){removed++;}})}:null};h.document.querySelector=sel=>sel.includes('wx-voice')?b:null;
 h.play('a');await flush();h.resolve(0,'a');await flush();assert.equal(removed,1);assert.ok(h.state.playedVoiceIds.includes('a'));
});
