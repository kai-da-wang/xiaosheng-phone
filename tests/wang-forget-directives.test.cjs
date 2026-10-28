const test=require('node:test'),assert=require('node:assert/strict');
const engine=require('../dist/wang-dialogue.js');

test('a request not to forget does not delete saved facts or count as a context cut',()=>{
 for(const text of ['我不想让你忘记我的名字','我不希望你忘记我的名字','我不愿意让你忘记我的名字','我不想忘记我的名字','我害怕你忘记我的名字','她说要忘记我的名字','不要忘记我的名字','别忘记我的偏好']){
  assert.deepEqual(engine.forgetKeys(text),[],text);
  const memory=engine.rememberExplicitFacts([text],{name:'小明',food:'草莓'});
  assert.equal(memory.name,'小明',text);assert.equal(memory.food,'草莓',text);
  const result=engine.createReply(text,[],memory);assert.notEqual(result.topic,'forget',text);
 }
});

test('mixed clauses forget only the requested field, including polite requests and questions',()=>{
 for(const [text,keys] of [
  ['不要忘记我的名字，请忘记我的食物偏好',['food']],
  ['我不想让你忘记我的名字；请删除我的食物',['food']],
  ['别忘记我的食物，忘掉我的名字',['name']],
  ['你忘记我的名字了吗？请忘掉我的食物',['food']],
  ['请忘掉我的名字好吗？不要忘记我的食物',['name']]
 ]){
  assert.deepEqual(engine.forgetKeys(text),keys,text);
  const next=engine.rememberExplicitFacts([text],{name:'小明',food:'草莓',place:'洱海',recent:['小明喜欢草莓']});
  assert.equal(next.name,keys.includes('name')?undefined:'小明',text);
  assert.equal(next.food,keys.includes('food')?undefined:'草莓',text);
  assert.equal(next.place,'洱海',text);assert.deepEqual(next.recent,[],text);
  assert.equal(engine.createReply(text,[],next).topic,'forget',text);
 }
});

test('privacy cutoff respects mixed forget clauses even when grouped with another user message',()=>{
 const h=[{id:'a',type:'text',from:'self',text:'我叫小明，我喜欢吃草莓'},
  {id:'b',type:'text',from:'self',text:'不要忘记我的名字，请忘记我的食物偏好'},
  {id:'c',type:'text',from:'self',text:'我喜欢吃苹果'},
  {id:'r',type:'text',from:'other',autoReply:true,replyTo:['b','c'],text:'好，清除了'},
  {id:'d',type:'text',from:'self',text:'我们继续聊'}];
 const history=engine.modelHistory(h);assert.doesNotMatch(JSON.stringify(history),/小明|草莓|苹果|忘记/);assert.match(JSON.stringify(history),/我们继续聊/);
 const kept=engine.modelHistory([{type:'text',from:'self',text:'我叫小明'},{type:'text',from:'self',text:'我不想让你忘记我的名字'}]);
 assert.match(JSON.stringify(kept),/小明/);
});

test('Wang runtime model request after mixed forget excludes older and merged private turns',async()=>{
 const vm=require('node:vm'),fs=require('node:fs'),requests=[],tasks=new Map();let now=0,next=1;
 class Clock extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}
 const state={chatMessages:{wang:[{id:'before',type:'text',from:'self',text:'我叫小明，我喜欢吃草莓'}]},chatUnreadIds:{},chatReadRooms:['wang'],wangAutoReply:true,wangMemory:{name:'小明',food:'草莓'},wangPending:null};
 const sandbox={window:{WangDialogue:engine,WANG_CHAT_ENDPOINT:'https://example.test/chat'},location:{href:'https://example.test/'},document:{hidden:false,querySelector:()=>null},Date:Clock,Intl,URL,AbortController,
  fetch:async(url,opts)=>{requests.push(JSON.parse(opts.body));return {ok:true,json:async()=>({reply:'在呢'})}},setTimeout(fn,ms){let id=next++;tasks.set(id,{fn,at:now+ms});return id},clearTimeout(id){tasks.delete(id)}};
 vm.runInNewContext(fs.readFileSync('dist/wang-chat-runtime.js','utf8'),sandbox);
 const rt=sandbox.window.WangChatRuntime.create({getState:()=>state,getRoute:()=>({app:'home'}),wang:'wang',save(){},renderBubble(){return ''},refreshList(){}});
 function send(id,text){const m={id,type:'text',from:'self',text};state.chatMessages.wang.push(m);rt.enqueue(m)}
 async function tick(ms){const end=now+ms;while(true){const due=[...tasks].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;tasks.delete(due[0]);now=due[1].at;await due[1].fn();for(let i=0;i<5;i++)await Promise.resolve();}now=end;}
 send('forget','不要忘记我的名字，请忘记我的食物偏好');send('merged','我喜欢吃苹果');await tick(3000);
 assert.equal(state.wangMemory.name,'小明');assert.equal(state.wangMemory.food,undefined);assert.equal(requests.length,0);
 send('next','你好');await tick(3000);assert.equal(requests.length,1);assert.doesNotMatch(JSON.stringify(requests[0]),/小明|草莓|苹果|忘记/);assert.match(JSON.stringify(requests[0]),/你好/);
});

test('a question about forgetting followed by another sentence does not delete data',()=>{
 for(const text of ['你要忘记我的名字？你好','你会忘记我的名字？我们继续聊','你忘记我的名字？然后说说今天','我的名字已经忘记了吗？你好']){
  assert.deepEqual(engine.forgetKeys(text),[],text);assert.equal(engine.rememberExplicitFacts([text],{name:'小明'}).name,'小明',text);
 }
});
