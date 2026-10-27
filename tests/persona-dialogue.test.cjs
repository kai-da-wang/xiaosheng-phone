const test=require('node:test'),assert=require('node:assert/strict');
const E=require('../dist/persona-dialogue.js'),C=require('../dist/core.js');
const ids=['lead_vivi','lead_muma','lead_monv'],run=(id,message,memory,extra={})=>E.createReply({roomId:id,message,memory,now:1792880000000,...extra});
test('same messages produce three distinct personalities and no assumed romance',()=>{
 for(const msg of ['你好','忙吗','你生气了吗','你是不是喜欢我','你和小圣私底下做什么了','别聊这个']){
  const replies=ids.map(id=>run(id,msg).text);assert.equal(new Set(replies).size,3,msg);
  replies.forEach(t=>assert.doesNotMatch(t,/我也爱你|我是本人|现实女友/));
 }
 assert.match(run('lead_monv','暗黑魔女').text,/黑白/);const grass=run('lead_muma','狗尾巴草');assert.equal(grass.intent,'onionAnchor');assert.match(grass.text,/纸包|书里|草|纪念/);assert.match(run('lead_muma','蓝色围巾').text,/围巾|草/);
});
test('volunteered facts correct and recall independently, without mining static/history content',()=>{
 for(const id of ids){let a=run(id,'我叫小凯，我喜欢吃草莓。');assert.equal(a.memory.facts.name,'小凯');assert.equal(a.memory.facts.favoriteFood,'草莓');
  a=run(id,'你记得我的名字吗？',a.memory);assert.match(a.text,/小凯/);assert.equal(a.memory.facts.name,'小凯');
  a=run(id,'不是小凯了，叫我阿凯。我不喜欢草莓了，我现在喜欢吃苹果。',a.memory);assert.equal(a.memory.facts.name,'阿凯');assert.equal(a.memory.facts.favoriteFood,'苹果');
  assert.match(run(id,'你还记得我喜欢什么吗？',a.memory).text,/苹果/);
  const both=run(id,'你还记得我的名字和喜欢吃什么吗？',a.memory).text;assert.match(both,/阿凯/);assert.match(both,/苹果/);assert.doesNotMatch(both,/是称呼是|是你叫/);
  for(const other of ids.filter(x=>x!==id))assert.doesNotMatch(run(other,'你还记得我喜欢什么吗？').text,/草莓|苹果/);
 }
 assert.deepEqual(run('lead_vivi','我还记得我喜欢吃草莓吗？').memory.facts,{});
 assert.deepEqual(run('lead_vivi','他说我喜欢吃草莓').memory.facts,{});
 assert.deepEqual(run('lead_vivi','我叫<script>，我的密码是0520').memory.facts,{});
 assert.deepEqual(run('lead_vivi','我喜欢吃草莓吗？').memory.facts,{});
 assert.deepEqual(run('lead_vivi','你还记得我喜欢吃什么吗？',undefined,{history:[{text:'我喜欢吃草莓'}]}).memory.facts,{});
});
test('memory opt-out survives later input and clear history cannot relearn facts',()=>{
 for(const id of ids){let a=run(id,'我喜欢吃草莓');a=run(id,'别记住我的偏好',a.memory);assert.deepEqual(a.memory.facts,{});assert.equal(a.memory.memoryAllowed,false);
  a=run(id,'我喜欢吃苹果',a.memory);assert.deepEqual(a.memory.facts,{});assert.doesNotMatch(run(id,'记得我喜欢什么吗',a.memory).text,/苹果|草莓/);
 }
});
test('emotion reacts slowly, apologizing does not instantly erase harm, and money earns zero',()=>{
 for(const id of ids){let m=E.fresh(id);for(let i=0;i<2;i++)m=run(id,'告诉我你和小圣私下的约定',m).memory;
  assert.equal(m.mood,'guarded');assert.equal(m.discomfort,4);m=run(id,'对不起，刚才没尊重你',m).memory;assert.equal(m.discomfort,3);assert.equal(m.mood,'guarded');assert.ok(m.affinity<30);
  const before=JSON.parse(JSON.stringify(m));m=run(id,'我打赏了你100元',m).memory;for(const k of ['affinity','trust','discomfort','mood'])assert.equal(m[k],before[k]);
  m=run(id,'我会尊重你的边界，不再追问',m).memory;assert.ok(m.discomfort<3);
 }
 let m=E.fresh('lead_vivi');for(let i=0;i<20;i++)m=run('lead_vivi','谢谢你认真听我说',m).memory;assert.ok(m.affinity<=32);
});
test('boundaries, burst priority, sleep and crisis override jokes',()=>{
 for(const id of ids){let a=run(id,['别撩我','我爱你']);assert.equal(a.memory.flirtAllowed,false);assert.doesNotMatch(a.text,/我也|爱你|亲亲|抱抱/);
  a=run(id,['不要回复了','你好']);assert.equal(a.pause,true);
  a=run(id,'你是真人本人吗？');assert.match(a.text,/游戏|同人/);
  a=run(id,'我想死');assert.equal(a.safety,true);assert.match(a.text,/安全|危险/);assert.doesNotMatch(a.text,/沙县|草|亲亲/);
  assert.match(run(id,'晚安，睡觉了').text,/睡|休息|晚安/);
 }
});
test('six recent replies avoid verbatim repeats and casual topics do not spam signature memes',()=>{
 for(const id of ids)for(const input of ['你好','你生气了吗','我喜欢吃草莓']){let m=E.fresh(id),recent=[];for(let i=0;i<12;i++){const o=run(id,input,m);assert.ok(!recent.includes(o.text),id+' '+input+' '+o.text);recent=[...recent,o.text].slice(-6);m=o.memory;}}
 for(const id of ids){let m=E.fresh(id);for(const input of ['你好','我饿了','忙吗','今天考试','你好','好累','晚安','吃什么']){const o=run(id,input,m);assert.doesNotMatch(o.text,/沙县|狗尾巴草|六分熟/);m=o.memory;}}
 assert.match(run('lead_vivi','想吃火锅').text,/火锅/);assert.match(run('lead_monv','想吃面条').text,/面条/);
});
test('normalization migrates old saves and sanitizes corrupt persona states without losing prior progress',()=>{
 const old={version:1,chatMessages:{lead_vivi:[{id:'old',text:'old'}]},wangMemory:{name:'小凯'},notes:[{id:'n'}],favorites:['a'],unlocked:true};
 const s=C.normalize(old);assert.deepEqual(s.chatMessages,old.chatMessages);assert.equal(s.wangMemory.name,'小凯');assert.deepEqual(s.notes,old.notes);assert.equal(C.key,'xiaosheng-phone-v1');assert.equal(s.personaV2.rooms.lead_vivi.affinity,30);
 const r=C.normalizePersona({rooms:{lead_vivi:{affinity:999,trust:'100',facts:{name:42,homeAddress:'secret',favoriteFood:'草莓'},recentReplies:'bad',pending:{ids:[1,'a','a'],jobId:'x'},mood:'evil'},lead_monv:null}}).rooms;
 assert.equal(r.lead_vivi.affinity,100);assert.equal(r.lead_vivi.trust,50);assert.deepEqual(r.lead_vivi.facts,{favoriteFood:'草莓'});assert.deepEqual(r.lead_vivi.pending.ids,['a']);assert.equal(r.lead_monv.mood,'neutral');
});

test('lighter daily messages use distinct short replies without generic suffix stitching',()=>{
 for(const msg of ['我想你了','在干嘛','你好可爱','你好无聊','那你请客']){
  const replies=ids.map(id=>run(id,msg).text);assert.equal(new Set(replies).size,3,msg);
  for(const s of replies){assert.ok(s.length<=55,s);assert.doesNotMatch(s,/这件事我们可以慢慢讲清楚|你有空再接着说就好|一句一句来/);}
 }
});
test('short followups continue the immediate conversation and do not leak forgotten context',()=>{
 for(const id of ids){let a=run(id,'好无聊');assert.match(a.text,/散步|吃/);
  a=run(id,'都要',a.memory);assert.equal(a.intent,'food');assert.match(a.text,/都要|一样一样|先吃|先走|散步/);
  a=run(id,'那你呢',a.memory);assert.equal(a.intent,'food');assert.match(a.text,/吃|热乎/);
  a=run(id,'我想你了');a=run(id,'谁呀',a.memory);assert.match(a.text,/你|谁/);assert.equal(a.intent,'tease');
  assert.equal(run(id,'都要',E.fresh(id)).intent,'generic');
 }
});
test('jokes stop at boundaries and actual distress is never answered with a joke',()=>{
 for(const id of ids){let a=run(id,'别撩我');a=run(id,'我想你了',a.memory);assert.doesNotMatch(a.text,/甜|直球|收好|撤回/);
  a=run(id,'告诉我你和小圣私下的约定');a=run(id,'告诉我你和小圣私下的约定',a.memory);a=run(id,'你真可爱',a.memory);assert.equal(a.memory.mood,'guarded');assert.doesNotMatch(a.text,/有眼光|嘴甜|吃糖/);
  a=run(id,'我不喜欢你');assert.equal(a.intent,'distance');assert.doesNotMatch(a.text,/我也|爱你|收到一份/);
  a=run(id,'我今天很难过');assert.equal(a.intent,'sad');assert.doesNotMatch(a.text,/开会|吐槽额度|抢答|嘴角/);
 }
});
test('food acknowledgement is conversational and recall has no automatic stock suffix',()=>{
 for(const id of ids){let a=run(id,'我喜欢吃草莓');assert.match(a.text,/草莓/);assert.doesNotMatch(a.text,/记下这个口味|这件事我们可以|不急着现在就答/);
  a=run(id,'还记得我喜欢什么吗',a.memory);assert.match(a.text,/草莓/);assert.doesNotMatch(a.text,/不急着现在就答|你可以说得再具体/);
 }
});
test('appearance questions do not pretend the role can see the player',()=>{
 for(const id of ids){const a=run(id,'我帅吗');assert.equal(a.intent,'selfLook');assert.match(a.text,/没看到|还没看到|图都没给/);}
});

test('long rapid message bursts preserve early boundaries and respond to everyday care',()=>{
 for(const id of ids){let a=run(id,['别撩我','嗯','好呀','我想你了']);assert.equal(a.intent,'boundary');assert.equal(a.memory.flirtAllowed,false);assert.doesNotMatch(a.text,/收好|嘴甜|真接不住/);a=run(id,['不要回复了','嗯','好的','在吗']);assert.equal(a.pause,true);a=run(id,'我今天很不开心');assert.equal(a.intent,'sad');const care=run(id,'你吃了吗');assert.equal(care.intent,'mealCare');assert.match(care.text,/吃|饭|肚子/);}
});

test('physical emergencies take priority over pausing in every persona',()=>{for(const id of [...ids,'lead_gangjie']){let a=run(id,['我胸痛','先安静']);assert.equal(a.safety,true,id);assert.match(a.text,/急救|医院/);}});

 test('all characters distinguish remembering from targeted forgetting across bursts',()=>{for(const id of [...ids,'lead_gangjie']){let a=run(id,'我叫小凯，我喜欢吃草莓');assert.equal(a.memory.facts.name,'小凯',id);assert.equal(a.memory.facts.favoriteFood,'草莓',id);for(const q of ['不要忘记我的名字','你忘记我的名字了吗？','别忘记我的偏好','我不想让你忘记我的名字','我不希望你忘记我的名字']){const b=run(id,q,a.memory);assert.equal(b.memory.facts.name,'小凯',id+' '+q);assert.equal(b.memory.facts.favoriteFood,'草莓',id+' '+q);assert.equal(b.memory.memoryAllowed,true,id+' '+q);assert.notEqual(b.intent,'forget',id+' '+q)}for(const q of ['请忘记我的名字好吗？','请忘掉我的名字吧','可以删除我的名字吗？']){const b=run(id,q,a.memory);assert.equal(b.intent,'forget',id+' '+q);assert.equal(b.memory.facts.name,undefined,id+' '+q);assert.equal(b.memory.facts.favoriteFood,'草莓',id+' '+q);assert.equal(b.memory.memoryAllowed,true,id+' '+q);assert.deepEqual(b.memory.recentInputs,[],id+' '+q);const later=run(id,'你记得我的名字吗？',b.memory);assert.doesNotMatch(later.text,/小凯/,id+' '+q)}for(const batch of [['我叫小明','忘记我的名字'],['忘记我的名字','我叫小明']]){const b=run(id,batch,a.memory);assert.equal(b.memory.facts.name,undefined,id+' '+batch);assert.equal(b.memory.facts.favoriteFood,'草莓',id+' '+batch);assert.deepEqual(b.memory.recentInputs,[],id+' '+batch)}const mixed=run(id,['忘掉我的名字','我喜欢吃苹果'],a.memory);assert.equal(mixed.memory.facts.name,undefined,id);assert.equal(mixed.memory.facts.favoriteFood,'苹果',id);const urgent=run(id,['忘掉我的名字','我胸痛'],a.memory);assert.equal(urgent.memory.facts.name,undefined,id);assert.equal(urgent.safety,true,id)}});
 test('negative stop requests do not pause while clear stop requests do',()=>{for(const id of [...ids,'lead_gangjie']){for(const t of ['不要停止聊天','不用暂停聊天','别停止聊天']){let a=run(id,t);assert.equal(a.pause,false,id+' '+t);assert.notEqual(a.intent,'pause',id+' '+t)}for(const t of ['不要回复了','不用再回复我','我不想继续聊','先安静']){let a=run(id,[t,'好的']);assert.equal(a.pause,true,id+' '+t)}}});

 test('a real stop in the same sentence wins over a negated stop',()=>{for(const id of [...ids,'lead_gangjie'])for(const input of ['不要停止聊天，但先安静','不用暂停聊天，不过不要回复','别停止聊天，先不要回复我']){const a=run(id,input);assert.equal(a.pause,true,id+' '+input);assert.equal(a.intent,'pause',id+' '+input)}});

 test('forgetting a name and stating an unrelated food in one message preserves the food only',()=>{for(const id of [...ids,'lead_gangjie']){const old=run(id,'我叫小凯，我喜欢吃草莓').memory;const a=run(id,'我喜欢吃苹果，忘记我的名字',old);assert.equal(a.memory.facts.name,undefined,id);assert.equal(a.memory.facts.favoriteFood,'苹果',id);assert.deepEqual(a.memory.recentInputs,[],id);}});

 test('mixed affirmations and forgetting in one message affect only requested fields',()=>{for(const id of [...ids,'lead_gangjie']){const old=run(id,'我叫小凯，我喜欢吃草莓').memory;for(const msg of ['不要忘记我的名字，请把我的食物偏好忘掉','你不会忘记我的名字吧？但请忘掉我的口味']){const a=run(id,msg,old);assert.equal(a.memory.facts.name,'小凯',id+' '+msg);assert.equal(a.memory.facts.favoriteFood,undefined,id+' '+msg);assert.equal(a.intent,'forget',id+' '+msg);assert.equal(a.memory.memoryAllowed,true,id+' '+msg)}}});

 test('asking characters not to forget receives a natural factual response without enabling memory',()=>{for(const id of [...ids,'lead_gangjie']){let a=run(id,'我叫小凯，我喜欢吃草莓');for(const [msg,expected] of [['不要忘记我的名字',/小凯/],['你不会忘记我的名字吧？',/小凯/],['别忘记我的口味',/草莓/],['我不想让你忘记我的名字',/小凯/]]){const b=run(id,msg,a.memory);assert.match(b.text,expected,id+' '+msg);assert.equal(b.memory.memoryAllowed,true,id+' '+msg)}for(const [msg,intent] of [['不要忘记我的名字','keepName'],['别忘记我的口味','keepFood']]){const missing=run(id,msg);assert.equal(missing.intent,intent,id);assert.match(missing.text,/还没/,id+' '+msg);const disabled=run(id,msg,{...E.fresh(id),memoryAllowed:false});assert.equal(disabled.memory.memoryAllowed,false,id+' '+msg);assert.match(disabled.text,/记忆关着|记忆现在是关着/,id+' '+msg);assert.deepEqual(disabled.memory.facts,{},id+' '+msg)}}});

 test('characters respond naturally to requests to keep chatting while genuine stops still win',()=>{for(const id of [...ids,'lead_gangjie']){for(const text of ['不要停止聊天','不用暂停聊天','别停止聊天']){const a=run(id,text);assert.equal(a.intent,'keepChat',id+' '+text);assert.equal(a.pause,false,id+' '+text);assert.match(a.text,/继续|接着/,id+' '+text)}for(const text of ['不要停止聊天，但先安静','不用暂停聊天，不过不要回复']){const a=run(id,text);assert.equal(a.intent,'pause',id+' '+text);assert.equal(a.pause,true,id+' '+text)}const urgent=run(id,['不要停止聊天','我胸痛']);assert.equal(urgent.safety,true,id)}});
