const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('../dist/core.js');
function setup(room='lead_muma'){
 const window={};for(const file of ['content.js','gallery-data.js','muma-chat.js','monv-chat.js'])vm.runInNewContext(fs.readFileSync('dist/'+file,'utf8'),{window});
 const state=C.defaults(),route={app:'room',id:room},calls=[];
 const document={createElement:()=>({addEventListener(){}}),body:{appendChild(){}},querySelector:()=>null,getElementById:()=>null};
 window.WangChatRuntime={create:()=>({typingMarkup:()=>'',enqueue(){},enabled:()=>true,mode:()=> '情景对话'})};
 vm.runInNewContext(fs.readFileSync('dist/phone-experience.js','utf8'),{window,document,Promise,Intl,Date,Map,Math});
 const ctx={data:window.PHONE_DATA,gallery:window.PHOTO_LIBRARY,esc:v=>String(v??''),icon:()=>'',btn:(a,label,c='',extra='')=>`<button data-action="${a}" ${extra}>${label}</button>`,shell:()=>'',go:(...a)=>calls.push(['go',...a]),save(){},toast(){},modal:(...a)=>calls.push(['modal',...a]),closeModal(){},appIcon(){},getState:()=>state,getRoute:()=>route,render(){}};
 return {x:window.PhoneExperience.create(ctx),state,route,calls,window};
}
test('Muma scene contains the supplied line from Muma and all photo IDs resolve',()=>{
 const {window}=setup(),scene=window.MUMA_CHAT;
 const line=scene.messages.find(m=>m.text==='你留狗尾巴草给我当纪念');assert.equal(line.from,'other');
 assert.equal(new Set(scene.messages.map(m=>m.id)).size,scene.messages.length);
 assert.ok(scene.messages.filter(m=>m.type==='photo').every(m=>window.PHOTO_LIBRARY.assets.find(a=>a.id===m.assetId)?.albumId==='muma'));
 assert.equal(window.PHONE_DATA.people.find(p=>p.id===scene.roomId).alias,'一根洋葱');
});
test('Muma story unread is independent of an older contact read mark',()=>{
 const {x,state,window}=setup();state.chatReadRooms.push('lead_muma');assert.equal(x.unreadCount(),3);
 const html=x.room();assert.match(html,/你留狗尾巴草给我当纪念/);assert.match(html,/data-album="muma"/);
 assert.ok(state.chatReadStories.includes(window.MUMA_CHAT.storyId));assert.equal(x.unreadCount(),2);
 assert.match(x.avatar(window.PHONE_DATA.people.find(p=>p.id==='lead_muma')),/muma_03_museum_selfie/);
});
test('Photo viewer, picker and send stay in the current contact album; legacy defaults remain Wang',()=>{
 const {x,state,calls}=setup();x.action('wx-photo',{dataset:{album:'muma',index:'1'}});assert.equal(calls.at(-1)[2].albumId,'muma');
 x.action('wx-pick-photo',{dataset:{}});assert.equal(calls.at(-1)[2].albumId,'muma');assert.equal(calls.at(-1)[2].photos.length,4);
 x.action('wx-send-photo',{dataset:{album:'muma',index:'1'}});assert.equal(state.chatMessages.lead_muma[0].assetId,'muma-02');
 x.action('wx-photo',{dataset:{index:'0'}});assert.equal(calls.at(-1)[2].albumId,'xiaowang');
 x.action('wx-album',{dataset:{}});assert.equal(calls.at(-1)[1],'album');assert.equal(calls.at(-1)[2].id,'muma');assert.equal(calls.at(-1)[2].returnRoom,'lead_muma');
});

test('Monv alias, story, photo references and read state remain independent',()=>{
 const {x,state,window}=setup('lead_monv'),scene=window.MONV_CHAT;
 assert.equal(window.PHONE_DATA.people.find(p=>p.id===scene.roomId).alias,'黑白魔女');
 assert.equal(new Set(scene.messages.map(m=>m.id)).size,scene.messages.length);
 assert.ok(scene.messages.filter(m=>m.type==='photo').every(m=>window.PHOTO_LIBRARY.assets.find(a=>a.id===m.assetId)?.albumId==='monv'));
 const html=x.room();assert.match(html,/去吃沙县/);assert.match(html,/data-album="monv"/);assert.ok(state.chatReadStories.includes(scene.storyId));assert.ok(!state.chatReadStories.includes(window.MUMA_CHAT.storyId));
 assert.match(x.avatar(window.PHONE_DATA.people.find(p=>p.id==='lead_monv')),/monv_01_shopping_selfie/);
});
test('Monv picker and outgoing photos cannot resolve to Muma or Wang',()=>{
 const {x,state,calls}=setup('lead_monv');x.action('wx-pick-photo',{dataset:{}});assert.equal(calls.at(-1)[2].albumId,'monv');assert.equal(calls.at(-1)[2].photos.length,4);
 x.action('wx-send-photo',{dataset:{album:'monv',index:'1'}});assert.equal(state.chatMessages.lead_monv[0].assetId,'monv-02');
 x.action('wx-photo',{dataset:{album:'monv',index:'1'}});assert.equal(calls.at(-1)[2].albumId,'monv');
 x.action('wx-album',{dataset:{}});assert.equal(calls.at(-1)[2].id,'monv');assert.equal(calls.at(-1)[2].returnRoom,'lead_monv');
});
