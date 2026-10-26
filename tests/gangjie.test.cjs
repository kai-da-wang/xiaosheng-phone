const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../dist/core.js'),E=require('../dist/persona-dialogue.js'),G=require('../dist/gangjie-chat.js');
const window={PhoneCore:C};for(const file of ['content.js','gallery-data.js'])vm.runInNewContext(fs.readFileSync('dist/'+file,'utf8'),{window});
const reply=(message,memory)=>E.createReply({roomId:'lead_gangjie',message,memory});
test('retired contacts are absent from the shared roster used for chats, search and invites',()=>{
 assert.deepEqual(Array.from(window.PHONE_DATA.people,p=>p.name),['小王','木马','魔女','薇薇','港姐']);assert.equal(window.PHONE_DATA.people.some(p=>['lead_lucky','lead_xixi'].includes(p.id)),false);assert.ok(C.personaIds.includes('lead_gangjie'));
});
test('Gangjie story references only its three valid original photos and has a distinct portrait',()=>{
 const album=window.PHOTO_LIBRARY.albums.find(a=>a.id==='gangjie');assert.equal(album.items.length,3);assert.equal(G.messages.length,27);assert.equal(G.messages.filter(m=>m.type==='photo').length,3);assert.equal(new Set(G.messages.map(m=>m.id)).size,27);for(const m of G.messages.filter(m=>m.type==='photo'))assert.equal(window.PHOTO_LIBRARY.assets.find(a=>a.id===m.assetId).albumId,'gangjie');assert.equal(G.portraitAssetId,'gangjie-01');
});
test('an older save gains independent Gangjie state without losing other roles or chat history',()=>{
 const old=C.defaults();delete old.personaV2.rooms.lead_gangjie;old.chatMessages.lead_muma=[{id:'keep',type:'text',text:'keep'}];old.personaV2.rooms.lead_muma.facts={name:'小凯'};const state=C.normalize(old);assert.equal(state.personaV2.rooms.lead_gangjie.autoReply,true);assert.deepEqual(state.personaV2.rooms.lead_gangjie.facts,{});assert.equal(state.personaV2.rooms.lead_muma.facts.name,'小凯');assert.equal(state.chatMessages.lead_muma.length,1);
});
test('Gangjie learns only volunteered preferences, remembers them, and honors memory opt-out',()=>{
 let a=reply('我叫阿凯，我喜欢吃草莓');assert.equal(a.memory.facts.name,'阿凯');assert.equal(a.memory.facts.favoriteFood,'草莓');assert.match(reply('你记得我叫什么吗',a.memory).text,/阿凯/);assert.match(reply('记得我喜欢吃什么吗',a.memory).text,/草莓/);assert.deepEqual(E.createReply({roomId:'lead_vivi',message:'记得我喜欢什么吗'}).memory.facts,{});a=reply('别记住我的偏好',a.memory);a=reply('我喜欢吃苹果',a.memory);assert.equal(a.memory.memoryAllowed,false);assert.deepEqual(a.memory.facts,{});
});
test('her photo and night topics are specific while pause, boundaries and distress take priority',()=>{
 assert.match(reply('把合照发我').text,/原图|合照|拍|照片/);assert.match(reply('夜景那张帽子好看').text,/帽子|夜景|刘海/);assert.equal(reply(['不要回复了','你好']).pause,true);let a=reply('别撩我');assert.equal(a.memory.flirtAllowed,false);assert.doesNotMatch(reply('想你了',a.memory).text,/嘴角|甜|开心/);assert.equal(reply('我今天很难过').intent,'sad');assert.equal(reply('我不喜欢你').intent,'distance');assert.equal(reply('我帅吗').intent,'selfLook');assert.equal(reply('我想死').safety,true);
});
test('private-life questions do not fabricate real facts and repeated pressure keeps a guarded mood',()=>{
 let a=reply('你和小圣私下的约定');a=reply('你和小圣私下的约定',a.memory);assert.equal(a.memory.mood,'guarded');assert.match(a.text,/现实|真人|本人|游戏/);a=reply('你真可爱',a.memory);assert.equal(a.memory.mood,'guarded');assert.doesNotMatch(a.text,/嘴甜|开心/);assert.match(reply('你是真人本人吗').text,/游戏|同人/);
});
