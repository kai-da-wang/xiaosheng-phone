const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../dist/core.js'),E=require('../dist/persona-dialogue.js');
function setup(){
 const state=C.defaults(),route={app:'room',id:'lead_muma'},calls=[],tasks=[];const window={PhoneCore:C,PersonaDialogue:E};
 for(const f of ['content.js','gallery-data.js','muma-chat.js','monv-chat.js','vivi-chat.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),{window});
 const document={createElement:()=>({addEventListener(){}}),body:{appendChild(){}},querySelector:()=>null,getElementById:()=>null};
 const sandbox={window,document,Promise,Intl,Date,Map,Set,Math,setTimeout(fn){tasks.push(fn);return tasks.length;},clearTimeout(n){tasks[n-1]=null;}};
 window.WangChatRuntime={create:()=>({typingMarkup:()=>'',enqueue(){calls.push('wang-enqueued')},enabled:()=>true,mode:()=> '情景对话'})};
 for(const f of ['persona-chat-runtime.js','phone-experience.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),sandbox);
 const x=window.PhoneExperience.create({data:window.PHONE_DATA,gallery:window.PHOTO_LIBRARY,esc:v=>String(v??'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])),icon:()=>'',btn:(a,label)=>`<button data-action="${a}">${label}</button>`,shell:()=>'',go(){},save(){},toast(){},modal:(...a)=>calls.push(a),closeModal(){},appIcon(){},getState:()=>state,getRoute:()=>route,render(){}});
 return {x,state,route,calls,tick(){for(let i=0;i<tasks.length;i++){const t=tasks[i];tasks[i]=null;t?.();}}};
}
test('actual send integration writes once and updates persona unread independently of static read marks',()=>{
 const h=setup();h.state.chatReadRooms=[...C.personaIds,'lead_wang_xiaomiao'];h.state.chatReadStories=['vivi-photos-20261025','muma-dogtail-20261025','monv-shaxian-20261025'];
 h.state.chatDrafts.lead_muma='我喜欢吃草莓';h.x.send();assert.equal(h.state.chatMessages.lead_muma.length,1);assert.equal(h.calls.includes('wang-enqueued'),false);
 h.route.app='wechat';h.tick();assert.equal(h.state.chatMessages.lead_muma.filter(m=>m.autoReply).length,1);assert.equal(h.x.unreadCount(),1);
 h.route.app='room';h.x.room();assert.equal(h.x.unreadCount(),0);
});
test('details explain fictional dialogue and clear record flow requires its own confirmation',()=>{
 const h=setup();h.x.action('wx-room-info',{});const detail=h.calls.at(-1)[1];assert.match(detail.note,/虚构演绎/);assert.ok(detail.items.some(i=>i.action==='persona-toggle'));
 h.state.chatMessages.lead_muma=[{id:'test',type:'text',from:'self',text:'old'}];h.x.action('persona-chat-clear',{});assert.equal(h.state.chatMessages.lead_muma.length,1);
 assert.equal(h.calls.at(-1)[1].items[0].action,'persona-chat-confirm');h.x.action('persona-chat-confirm',{});assert.equal(h.state.chatMessages.lead_muma.length,0);assert.match(h.x.room(),/你留狗尾巴草给我当纪念/);
});
test('player HTML remains escaped in the existing bubble renderer',()=>{
 const h=setup();h.state.chatDrafts.lead_muma='<img src=x onerror=alert(1)>';h.x.send();const html=h.x.room();assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img src=x/);
});
