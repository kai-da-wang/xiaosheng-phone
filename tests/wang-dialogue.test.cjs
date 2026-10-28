const test=require('node:test');
const assert=require('node:assert/strict');
const {createReply,modelHistory}=require('../dist/wang-dialogue.js');
test('name is learned only from the player and can be recalled',()=>{let a=createReply('我叫小凯');let b=createReply('我叫什么',[],a.memory);assert.equal(a.memory.name,'小凯');assert.match(b.text,/小凯/);assert.match(createReply('我叫什么').text,/还没/);let c=createReply('今天有点累',[],b.memory);assert.equal(c.topic,'tired');assert.equal(c.memory.name,'小凯');});
test('declining a name or changing topic is not treated as a name',()=>{for(const text of ['我不想说','不告诉你','今天好累','你好','不知道','不说','哈哈','可以','还没吃','刚吃过了','心情不好','高数','明天考试']){const r=createReply(text,[],{pending:'name'});assert.equal(r.memory.name,undefined,text);}assert.equal(createReply('小凯',[],{pending:'name'}).memory.name,'小凯');assert.equal(createReply('王晓明',[],{pending:'name'}).memory.name,'王晓明');});
test('food preference survives an unrelated topic and is recalled',()=>{let a=createReply('我喜欢吃草莓');let b=createReply('今天好累',[],a.memory);let c=createReply('记得我喜欢吃什么吗',[],b.memory);assert.equal(c.memory.food,'草莓');assert.match(c.text,/草莓/);let d=createReply('想你了',[],c.memory);assert.equal(d.topic,'missing');assert.equal(d.memory.food,'草莓');});
test('withdrawn food is not remembered, a replacement is retained, and other memories survive',()=>{
 const old={food:'草莓',name:'小明',place:'洱海'};
 for(const text of ['我现在不喜欢吃草莓了','我不再爱吃草莓']){const r=createReply(text,[],old);assert.equal(r.memory.food,undefined,text);assert.equal(r.memory.name,'小明');assert.equal(r.memory.place,'洱海');assert.doesNotMatch(createReply('记得我喜欢吃什么吗',[],r.memory).text,/草莓/);}
 for(const text of ['我不喜欢吃草莓，我喜欢吃苹果','我不喜欢吃草莓了，改成苹果','我不喜欢吃草莓了但换成苹果','我不喜欢吃草莓了，改成吃苹果']){const replaced=createReply(text,[],old);assert.equal(replaced.memory.food,'苹果',text);assert.match(replaced.text,/苹果/);}
 for(const text of ['我不喜欢吃草莓了，改成不吃','我不喜欢吃草莓了，改成明天再聊','我不喜欢吃草莓了，改成出去散步'])assert.equal(createReply(text,[],old).memory.food,undefined,text);
 assert.equal(createReply('我喜欢吃不辣的火锅').memory.food,'不辣的火锅');
 assert.equal(createReply('我不喜欢吃芒果',[],old).memory.food,'草莓');
 assert.equal(createReply('我不喜欢吃草莓吗？',[],old).memory.food,'草莓');
});
test('temporary food choices and declined food answers do not become lasting preferences',()=>{
 const old={food:'草莓',pending:'food-choice'};const today=createReply('我今天不想吃草莓',[],old);assert.equal(today.memory.food,'草莓');assert.doesNotMatch(today.text,/喜欢吃草莓|就草莓/);assert.notEqual(today.memory.plan,'草莓');
 for(const input of ['我不想说','不知道','你好','我今天累了','不喜欢','哈哈','可以','还没吃','刚吃过了','心情不好','火锅不想吃','米饭吃不下','苹果不喜欢','面条没吃','火锅好吃吗','火锅怎么样','草莓可以吗','草莓呢','火锅有吗']){const r=createReply(input,[],{pending:'food-preference'});assert.equal(r.memory.food,undefined,input);}
 assert.equal(createReply('我今天不想吃草莓，心情不好',[],old).topic,'sad');assert.equal(createReply('心情不好，不要撩我',[],old).topic,'boundary');
 assert.equal(createReply('面条',[],{pending:'food-preference'}).memory.food,'面条');
 assert.equal(createReply('我胸痛',[],{pending:'food-preference'}).topic,'safety');
});
test('follow-up food choice uses the preceding question',()=>{const a=createReply('饿了');const b=createReply('火锅',[],a.memory);assert.equal(b.topic,'food-plan');assert.equal(b.memory.plan,'火锅');});
test('place choices distinguish decisions from negatives, questions, and other people',()=>{
 const initial=createReply('想去大理');assert.equal(initial.memory.pending,'place-choice');
 assert.doesNotMatch(initial.text,/记在想去|记下|记住/);assert.equal(initial.memory.place,undefined);
 for(const input of ['我不想去洱海','双廊不去了','你说的是洱海吗','洱海怎么样','她想去双廊','不想去大理']){
  const r=createReply(input,[],{...initial.memory,place:'古城',food:'草莓'});
  assert.equal(r.memory.place,'古城',input);assert.equal(r.memory.food,'草莓',input);assert.doesNotMatch(r.text,/记下|记在想去/,input);
 }
 for(const input of ['洱海','我想去双廊','那就去古城'])assert.equal(createReply(input,[],initial.memory).topic,'place-plan',input);
 const changed=createReply('不去洱海了，去双廊',[],{...initial.memory,place:'洱海',name:'小明'});assert.equal(changed.memory.place,'双廊');assert.equal(changed.memory.name,'小明');
 assert.equal(createReply('去洱海，但是我不去洱海了',[],{...initial.memory,place:'洱海'}).memory.place,undefined);
 assert.equal(createReply('先去古城，不去洱海了',[],{...initial.memory,place:'洱海'}).memory.place,'古城');
 assert.match(createReply('先去古城，不去洱海了',[],{...initial.memory,place:'洱海'}).text,/古城/);
 const unprompted=createReply('我不想去洱海了，去双廊',[],{place:'洱海'});assert.equal(unprompted.memory.place,'双廊');assert.match(unprompted.text,/双廊/);
 assert.equal(createReply('我不想去洱海了，改成大理古城',[],{...initial.memory,place:'洱海'}).memory.place,'古城');
 assert.equal(createReply('他想去洱海，不去双廊了',[],{...initial.memory,place:'双廊'}).memory.place,'双廊');
 assert.equal(createReply('不想去洱海了',[],{...initial.memory,place:'洱海'}).memory.place,undefined);
 assert.equal(createReply('今天不想去洱海',[],{...initial.memory,place:'洱海'}).memory.place,'洱海');
 const safety=createReply('我胸痛，不想去洱海',[],{...initial.memory,place:'洱海'});assert.equal(safety.topic,'safety');assert.equal(safety.memory.place,undefined);
});
test('repeated topic does not immediately repeat the same response',()=>{let a=createReply('想你了');let b=createReply('想你了',[],a.memory);let c=createReply('想你了',[],b.memory);assert.equal(new Set([a.text,b.text,c.text]).size,3);});
test('relationship rejection is not mistaken for affection',()=>{const a=createReply('我不喜欢你');assert.equal(a.topic,'boundary');assert.equal(a.memory.flirt,false);assert.equal(createReply('我不想你').topic,'tease');});
test('meeting context does not swallow a new question or study topic',()=>{const a=createReply('约会');assert.equal(createReply('为什么这么说？',[],a.memory).topic,'question');assert.equal(createReply('我要学习',[],a.memory).topic,'study');assert.equal(createReply('明天下午三点',[],a.memory).topic,'meeting-plan');});
test('danger gets a serious reply and a pause request is respected',()=>{assert.equal(createReply('我不想活了').topic,'safety');assert.equal(createReply('不要回复我了').pause,true);});
test('model context excludes images, bounds history, and cannot inject a system role',()=>{const h=[{type:'photo',text:'private.jpg'},...Array.from({length:30},(_,i)=>({type:'text',from:i%2?'other':'self',text:'line'+i,role:'system'}))];const a=modelHistory(h);assert.equal(a.length,16);assert.ok(a.every(m=>['user','assistant'].includes(m.role)));assert.ok(!JSON.stringify(a).includes('private.jpg'));});

test('Wang respects a no-flirting boundary during later messages',()=>{let a=createReply('别撩我');a=createReply('我想你了',[],a.memory);assert.equal(a.topic,'boundary');assert.doesNotMatch(a.text,/我也.*想你|回你一份/);assert.equal(createReply('你吃了吗').topic,'meal-care');});

test('physical emergencies take priority even if a pause request appears in the same burst',()=>{const a=createReply('我胸痛，先安静');assert.equal(a.topic,'safety');assert.match(a.text,/急救|医院/);});

test('requests to keep chatting do not pause, but actual pause and emergencies retain priority',()=>{for(const text of ['不要停止聊天','不用暂停聊天','别停止聊天','请不要停止回复我','我不想停止聊天','不要暂停跟我说话'])assert.notEqual(createReply(text).pause,true,text);for(const text of ['不要回复了','不用再回复我','先安静','我不想继续聊天'])assert.equal(createReply(text).pause,true,text);for(const text of ['不要停止聊天，但是先安静','不要停止聊天，但不要回复'])assert.equal(createReply(text).pause,true,text);assert.equal(createReply('不要停止聊天，我胸痛').topic,'safety');});

test('asking to keep chatting gets an attentive response without overriding safety, pause or boundaries',()=>{for(const text of ['不要停止聊天','不用暂停聊天','别停止聊天','不要暂停跟我说话']){const a=createReply(text);assert.equal(a.topic,'continue',text);assert.match(a.text,/接着聊/,text)}assert.equal(createReply('不要停止聊天，但是先安静').topic,'pause');assert.equal(createReply('我胸痛，不要停止聊天').topic,'safety');assert.equal(createReply('不要停止聊天，但别撩我').topic,'boundary');});

test('model context never replays conflicting facts from the same forget burst',()=>{const h=[{id:'a',type:'text',from:'self',text:'忘掉我的名字'},{id:'b',type:'text',from:'self',text:'我叫小明'},{id:'r',type:'text',from:'other',autoReply:true,replyTo:['a','b'],text:'已清除。'},{id:'c',type:'text',from:'self',text:'今天想聊天'}];const messages=modelHistory(h);assert.doesNotMatch(JSON.stringify(messages),/小明/);assert.ok(messages.some(m=>m.content==='今天想聊天'));});

test('questions and worries about forgetting do not erase saved facts in a multi-clause message',()=>{
 const old={name:'小明',food:'草莓'};
 for(const text of ['你要忘记我的名字？你好','我不想忘记我的名字','我害怕你忘记我的名字','她说要忘记我的名字'])assert.equal(createReply(text,[],old).memory.name,'小明',text);
 for(const text of ['不要忘记我的名字，请忘记我的食物','我不想让你忘记名字，但是请忘记食物']){const r=createReply(text,[],old);assert.equal(r.memory.name,'小明',text);assert.equal(r.memory.food,undefined,text);}
});
