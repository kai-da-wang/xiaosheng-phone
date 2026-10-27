const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../dist/core.js'),E=require('../dist/persona-dialogue.js');
function setup(){
 const state=C.defaults(),route={app:'room',id:'lead_muma'},calls=[],tasks=[];const window={PhoneCore:C,PersonaDialogue:E};
 for(const f of ['content.js','gallery-data.js','muma-chat.js','monv-chat.js','vivi-chat.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),{window});
 const document={addEventListener(){},createElement:()=>({addEventListener(){}}),body:{appendChild(){}},querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null};
 const sandbox={window,document,Promise,Intl,Date,Map,Set,Math,setTimeout(fn){tasks.push(fn);return tasks.length;},clearTimeout(n){tasks[n-1]=null;}};
 window.WangChatRuntime={create:()=>({typingMarkup:()=>'',enqueue(){calls.push('wang-enqueued')},enabled:()=>true,mode:()=> '情景对话'})};
 for(const f of ['wechat-details.js','persona-chat-runtime.js','phone-experience.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),sandbox);
 const x=window.PhoneExperience.create({data:window.PHONE_DATA,gallery:window.PHOTO_LIBRARY,esc:v=>String(v??'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])),icon:()=>'',btn:(a,label)=>`<button data-action="${a}">${label}</button>`,shell:()=>'',go(app,opts={}){for(const k of Object.keys(route))delete route[k];Object.assign(route,{app,...opts});calls.push(['go',app,opts]);},save(){},toast(){},modal:(...a)=>calls.push(a),closeModal(){},appIcon(){},getState:()=>state,getRoute:()=>route,render(){}});
 return {x,state,route,calls,tick(){for(let i=0;i<tasks.length;i++){const t=tasks[i];tasks[i]=null;t?.();}}};
}
test('actual send integration writes once and updates persona unread independently of static read marks',()=>{
 const h=setup();h.state.chatReadRooms=[...C.personaIds,'lead_wang_xiaomiao'];h.state.chatReadStories=['vivi-photos-20261025','muma-dogtail-20261025','monv-shaxian-20261025'];
 h.state.chatDrafts.lead_muma='我喜欢吃草莓';h.x.send();assert.equal(h.state.chatMessages.lead_muma.length,1);assert.equal(h.calls.includes('wang-enqueued'),false);
 h.route.app='wechat';h.tick();assert.equal(h.state.chatMessages.lead_muma.filter(m=>m.autoReply).length,1);assert.equal(h.x.unreadCount(),1);
 h.route.app='room';h.x.room();assert.equal(h.x.unreadCount(),0);
});
test('details explain fictional dialogue and clear record flow requires its own confirmation',()=>{
 const h=setup();h.x.action('wx-room-info',{});assert.equal(h.route.app,'chat-info');assert.match(h.x.details('chat-info'),/聊天详情/);h.x.action('wx-reply-config',{dataset:{room:'lead_muma'}});const detail=h.calls.at(-1)[1];assert.match(detail.note,/虚构演绎/);assert.ok(detail.items.some(i=>i.action==='persona-toggle'));
 h.state.chatMessages.lead_muma=[{id:'test',type:'text',from:'self',text:'old'}];h.x.action('persona-chat-clear',{});assert.equal(h.state.chatMessages.lead_muma.length,1);
 assert.equal(h.calls.at(-1)[1].items[0].action,'persona-chat-confirm');h.x.action('persona-chat-confirm',{});assert.equal(h.state.chatMessages.lead_muma.length,0);assert.match(h.x.room(),/你是随手摘的，可我是认真收下的/);
});
test('player HTML remains escaped in the existing bubble renderer',()=>{
 const h=setup();h.state.chatDrafts.lead_muma='<img src=x onerror=alert(1)>';h.x.send();const html=h.x.room();assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img src=x/);
});
test('native history clearing hides preset stories, cancels queued replies, and keeps other rooms',()=>{
 const h=setup();h.state.chatMessages.lead_vivi=[{id:'other',type:'text',from:'self',text:'keep'}];h.state.chatDrafts.lead_muma='等会回复';h.x.send();h.x.action('wx-clear-confirm',{dataset:{}});h.tick();assert.equal(h.state.chatMessages.lead_muma.length,0);assert.equal(h.state.chatMessages.lead_vivi.length,1);assert.doesNotMatch(h.x.room(),/你是随手摘的，可我是认真收下的/);assert.equal(h.state.personaV2.rooms.lead_muma.pending,null);
});
test('muting a single chat suppresses its global unread badge while still receiving the reply',()=>{
 const h=setup();h.state.chatReadRooms=[...C.personaIds,'lead_wang_xiaomiao'];h.state.chatReadStories=['vivi-photos-20261025','muma-dogtail-20261025','monv-shaxian-20261025'];h.x.action('wx-detail-toggle',{dataset:{key:'muted'}});h.state.chatDrafts.lead_muma='在干嘛';h.x.send();h.route.app='wechat';h.tick();assert.equal(h.state.chatMessages.lead_muma.filter(x=>x.autoReply).length,1);assert.equal(h.x.unreadCount(),0);assert.equal(h.state.wechatPrefs.lead_muma.muted,true);
});

test('chat list keeps pinned rooms first, then recent messages, with escaped draft previews',()=>{
 const h=setup();h.state.chatMessages.lead_monv=[{id:'text_1793052000000_a',type:'text',text:'旧消息',from:'self'}];h.state.chatMessages.lead_vivi=[{id:'new',createdAt:1793052100000,type:'text',text:'新消息',from:'self'}];h.state.chatDrafts.lead_vivi='<img src=x>';
 const html=h.x.wechat(),order=id=>html.indexOf('data-id="'+id+'"');assert.ok(order('lead_wang_xiaomiao')<order('lead_vivi'));assert.ok(order('lead_vivi')<order('lead_monv'));assert.ok(order('lead_monv')<order('lead_muma'));assert.match(html,/草稿/);assert.match(html,/&lt;img src=x&gt;/);assert.doesNotMatch(html,/<img src=x>/);
});
test('Enter sends once while Shift+Enter and IME confirmation do not send',()=>{
 const h=setup();h.state.chatDrafts.lead_muma='今天好呀';const event=extra=>({target:{id:'wx-message-input'},key:'Enter',preventDefault(){this.prevented=true;},...extra});
 for(const extra of [{shiftKey:true},{isComposing:true},{keyCode:229}])assert.equal(h.x.keydown(event(extra)),false);
 assert.equal(h.state.chatMessages.lead_muma,undefined);const enter=event();assert.equal(h.x.keydown(enter),true);assert.equal(enter.prevented,true);assert.equal(h.state.chatMessages.lead_muma.length,1);assert.ok(h.state.chatMessages.lead_muma[0].createdAt>0);h.state.chatDrafts.lead_muma='下一句';h.x.keydown(event({repeat:true}));assert.equal(h.state.chatMessages.lead_muma.length,1);
});
