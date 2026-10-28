const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Core=require('../dist/core.js');
function harness(){
 const w={},events={},timers=new Map(),toasts=[],modals=[];let timer=0,renders=0;
 for(const f of ['content.js','gallery-data.js','muma-chat.js','monv-chat.js','vivi-chat.js','gangjie-chat.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),{window:w});
 w.WangChatRuntime={create:()=>({typingMarkup:()=>''})};w.PersonaChatRuntime={create:()=>({supports:()=>false,typingMarkup:()=>''})};
 const upload={addEventListener(){}};const document={hidden:false,addEventListener:(type,fn)=>(events[type]||=[]).push(fn),createElement:()=>upload,body:{appendChild(){}},querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null};
 const state=Core.defaults(),route={app:'room',id:'lead_muma'};
 const sandbox={window:w,document,Intl,Date,Promise,Map,Set,Math,URL,Audio:class{constructor(){throw Error('unexpected audio playback');}},setTimeout:fn=>{timers.set(++timer,fn);return timer;},clearTimeout:id=>timers.delete(id)};
 vm.runInNewContext(fs.readFileSync('dist/wechat-details.js','utf8'),sandbox);vm.runInNewContext(fs.readFileSync('dist/phone-experience.js','utf8'),sandbox);
 const x=w.PhoneExperience.create({data:w.PHONE_DATA,gallery:w.PHOTO_LIBRARY,esc:v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),icon:()=>'',btn:(action,label,cls='',extra='')=>`<button data-action="${action}" ${extra}>${label}</button>`,shell:(title,body)=>body,go(){},save(){},toast:m=>toasts.push(m),modal:(kind,data)=>modals.push({kind,data}),closeModal(){},appIcon(){},render(){renders++;},getState:()=>state,getRoute:()=>route});
 const id='muma-story-one-day-20261026-3',element={dataset:{room:route.id,id},closest(){return this;}};
 const fire=(type,extra={})=>{const e={target:element,pointerId:1,isPrimary:true,button:0,clientX:20,clientY:20,preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};for(const fn of events[type]||[])fn(e);return e;};
 return {w,x,state,route,id,element,fire,modals,toasts,timers,renders:()=>renders,advance(){const first=timers.entries().next().value;if(first){timers.delete(first[0]);first[1]();}}};
}
test('story voice displays original text only after long press and transcribe, with a silent tap',()=>{
 const h=harness(),original=h.w.MUMA_CHAT.messages.find(m=>m.id===h.id).text;assert.match(h.x.room(),/语音，长按或右键转文字/);assert.ok(!h.x.room().includes(original));
 h.x.action('wx-voice',{dataset:{id:h.id,room:h.route.id}});assert.match(h.toasts.at(-1),/暂无声音/);
 h.fire('pointerdown');h.advance();assert.equal(h.modals.at(-1).data.items[0].label,'转文字');h.fire('pointerup');assert.equal(h.fire('click').stopped,true);
 h.x.action('wx-voice-transcribe',{dataset:{member:h.id}});assert.ok(h.x.room().includes(original));assert.equal(h.w.MUMA_CHAT.messages.find(m=>m.id===h.id).text,original);assert.deepEqual(h.state.chatMessages,{});
 h.fire('contextmenu');assert.equal(h.modals.at(-1).data.items[0].label,'收起文字');h.x.action('wx-voice-transcribe',{dataset:{member:h.id}});assert.ok(!h.x.room().includes(original));
});
test('movement, cancellation and navigation cancel long press; desktop keyboard and right click work',()=>{
 const h=harness();h.fire('pointerdown');h.fire('pointermove',{clientY:45});h.advance();assert.equal(h.modals.length,0);
 h.fire('pointerdown');h.fire('pointercancel');h.advance();assert.equal(h.modals.length,0);
 h.fire('pointerdown');h.x.onNavigate();h.route.app='home';h.advance();assert.equal(h.modals.length,0);
 h.route.app='room';assert.equal(h.fire('contextmenu').prevented,true);assert.equal(h.modals.length,1);h.fire('keydown',{key:'F10',shiftKey:true});assert.equal(h.modals.length,2);
});
test('transcript is escaped, and story voice selection applies to incoming and outgoing messages',()=>{
 const h=harness();h.w.MUMA_CHAT.messages.find(m=>m.id===h.id).text='<script>unsafe</script>';h.x.action('wx-voice-transcribe',{dataset:{member:h.id}});const html=h.x.room();assert.ok(html.includes('&lt;script&gt;unsafe&lt;/script&gt;'));assert.ok(!html.includes('<script>unsafe</script>'));assert.match(html,/wx-message outgoing/);assert.match(html,/wx-message incoming/);
 for(const [room,key] of [['lead_monv','MONV_CHAT'],['lead_vivi','VIVI_CHAT'],['lead_gangjie','GANGJIE_CHAT']]){h.route.id=room;const source=h.w[key].messages.find(m=>m.type==='text');assert.ok(source.text);assert.match(h.x.room(),/语音，长按或右键转文字/);}
});

test('incoming silent voice is marked read on tap or transcription and remains read after rendering',()=>{
 for(const method of ['tap','transcribe']){const h=harness(),m=h.w.MUMA_CHAT.messages.find(m=>m.type==='text'&&m.from==='other'&&['muma-story-one-day-20261026-3','muma-story-one-day-20261026-5'].includes(m.id));assert.ok(m);
 if(method==='tap')h.x.action('wx-voice',{dataset:{id:m.id,room:h.route.id}});else h.x.action('wx-voice-transcribe',{dataset:{member:m.id}});
 assert.ok(h.state.playedVoiceIds.includes(m.id));const html=h.x.room();const message=html.split(`data-message-id="${m.id}"`)[1].split('wx-message-anchor')[0];assert.doesNotMatch(message,/wx-voice-unheard/);}
});
