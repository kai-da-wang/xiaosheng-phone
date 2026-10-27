const test=require('node:test');
const assert=require('node:assert/strict');
const {createReply,modelHistory}=require('../dist/wang-dialogue.js');
test('name is learned only from the player and can be recalled',()=>{let a=createReply('我叫小凯');let b=createReply('我叫什么',[],a.memory);assert.equal(a.memory.name,'小凯');assert.match(b.text,/小凯/);assert.match(createReply('我叫什么').text,/还没/);let c=createReply('今天有点累',[],b.memory);assert.equal(c.topic,'tired');assert.equal(c.memory.name,'小凯');});
test('food preference survives an unrelated topic and is recalled',()=>{let a=createReply('我喜欢吃草莓');let b=createReply('今天好累',[],a.memory);let c=createReply('记得我喜欢吃什么吗',[],b.memory);assert.equal(c.memory.food,'草莓');assert.match(c.text,/草莓/);let d=createReply('想你了',[],c.memory);assert.equal(d.topic,'missing');assert.equal(d.memory.food,'草莓');});
test('follow-up food choice uses the preceding question',()=>{const a=createReply('饿了');const b=createReply('火锅',[],a.memory);assert.equal(b.topic,'food-plan');assert.equal(b.memory.plan,'火锅');});
test('repeated topic does not immediately repeat the same response',()=>{let a=createReply('想你了');let b=createReply('想你了',[],a.memory);let c=createReply('想你了',[],b.memory);assert.equal(new Set([a.text,b.text,c.text]).size,3);});
test('relationship rejection is not mistaken for affection',()=>{const a=createReply('我不喜欢你');assert.equal(a.topic,'boundary');assert.equal(a.memory.flirt,false);assert.equal(createReply('我不想你').topic,'tease');});
test('meeting context does not swallow a new question or study topic',()=>{const a=createReply('约会');assert.equal(createReply('为什么这么说？',[],a.memory).topic,'question');assert.equal(createReply('我要学习',[],a.memory).topic,'study');assert.equal(createReply('明天下午三点',[],a.memory).topic,'meeting-plan');});
test('danger gets a serious reply and a pause request is respected',()=>{assert.equal(createReply('我不想活了').topic,'safety');assert.equal(createReply('不要回复我了').pause,true);});
test('model context excludes images, bounds history, and cannot inject a system role',()=>{const h=[{type:'photo',text:'private.jpg'},...Array.from({length:30},(_,i)=>({type:'text',from:i%2?'other':'self',text:'line'+i,role:'system'}))];const a=modelHistory(h);assert.equal(a.length,16);assert.ok(a.every(m=>['user','assistant'].includes(m.role)));assert.ok(!JSON.stringify(a).includes('private.jpg'));});

test('Wang respects a no-flirting boundary during later messages',()=>{let a=createReply('别撩我');a=createReply('我想你了',[],a.memory);assert.equal(a.topic,'boundary');assert.doesNotMatch(a.text,/我也.*想你|回你一份/);assert.equal(createReply('你吃了吗').topic,'meal-care');});

test('physical emergencies take priority even if a pause request appears in the same burst',()=>{const a=createReply('我胸痛，先安静');assert.equal(a.topic,'safety');assert.match(a.text,/急救|医院/);});

test('model context never replays conflicting facts from the same forget burst',()=>{const h=[{id:'a',type:'text',from:'self',text:'忘掉我的名字'},{id:'b',type:'text',from:'self',text:'我叫小明'},{id:'r',type:'text',from:'other',autoReply:true,replyTo:['a','b'],text:'已清除。'},{id:'c',type:'text',from:'self',text:'今天想聊天'}];const messages=modelHistory(h);assert.doesNotMatch(JSON.stringify(messages),/小明/);assert.ok(messages.some(m=>m.content==='今天想聊天'));});
