const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const C=require('../dist/core.js'),E=require('../dist/persona-dialogue.js'),ids=C.personaIds;
const code=fs.readFileSync('dist/persona-chat-runtime.js','utf8');
function harness(state=C.defaults()){
 let now=1792880000000,next=1,saves=0,visible=[],route={app:'room',id:ids[0]};const tasks=new Map();
 class Clock extends Date{constructor(...a){super(...(a.length?a:[now]));}static now(){return now;}}
 const scroll={dataset:{roomId:ids[0]},scrollTop:0,scrollHeight:600,clientHeight:500};
 const sandbox={window:{PhoneCore:C,PersonaDialogue:E},document:{querySelector(s){return s==='.wx-chat-scroll'?scroll:s==='#wx-chat-bottom'?{insertAdjacentHTML(_,v){visible.push(v)}}:null;}},Date:Clock,Intl,setTimeout(fn,ms){const id=next++;tasks.set(id,{fn,at:now+ms});return id;},clearTimeout(id){tasks.delete(id)}};
 vm.runInNewContext(code,sandbox);const r=sandbox.window.PersonaChatRuntime.create({getState:()=>state,getRoute:()=>route,save(){saves++},renderBubble:(m,id)=>id+':'+m.text,refreshList(){},esc:v=>v});
 const tick=ms=>{const end=now+ms;while(true){const due=[...tasks].filter(([,v])=>v.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;tasks.delete(due[0]);now=due[1].at;due[1].fn()}now=end};tick(0);
 return {r,state,tick,visible,tasks,go(id){route={app:'room',id};scroll.dataset.roomId=id},send(id,text,mid){const m={id:mid,type:'text',text,from:'self'};(state.chatMessages[id]||=[]).push(m);r.enqueue(id,m);return m;}};
}
test('three concurrent rooms debounce bursts, reply once and never render into another room',()=>{
 const h=harness();h.state.chatReadRooms=[...ids];for(const id of ids){h.send(id,'我叫小凯',id+'1');h.tick(100);h.send(id,'我喜欢吃草莓',id+'2');h.tick(100);h.send(id,'你记得我喜欢什么吗',id+'3');}
 h.go('lead_monv');assert.match(h.r.typingMarkup('lead_monv','avatar','魔女'),/魔女正在输入/);h.tick(2400);
 for(const id of ids){const rs=h.state.chatMessages[id].filter(m=>m.autoReply);assert.equal(rs.length,1);assert.equal(rs[0].replyTo.length,3);assert.match(rs[0].text,/草莓/);assert.equal(h.state.personaV2.rooms[id].pending,null);assert.equal(rs[0].sceneMode,'fictional_fan_scene');}
 assert.equal(h.visible.length,1);assert.match(h.visible[0],/^lead_monv:/);assert.deepEqual(h.state.chatReadRooms,['lead_monv']);assert.equal(h.r.typingMarkup('lead_monv','','魔女'),'');
});
test('pause and memory clearing cancel queued jobs; room toggles are independent',()=>{
 const h=harness();h.send(ids[0],'我喜欢吃草莓','a');assert.equal(h.r.toggle(ids[0]),false);h.tick(2200);assert.equal(h.state.chatMessages[ids[0]].length,1);assert.equal(h.r.enabled(ids[1]),true);h.r.toggle(ids[0]);
 h.send(ids[0],'我喜欢吃苹果','b');h.r.clearMemory(ids[0]);h.tick(2200);assert.equal(h.state.chatMessages[ids[0]].length,2);assert.deepEqual(h.state.personaV2.rooms[ids[0]].facts,{});
 h.send(ids[0],'记得我喜欢什么吗','c');h.tick(2200);assert.doesNotMatch(h.state.chatMessages[ids[0]].at(-1).text,/草莓|苹果/);
 h.r.clearChat(ids[0]);assert.equal(h.state.chatMessages[ids[0]].length,0);assert.equal(h.state.personaV2.rooms[ids[0]].pending,null);
});
test('refresh restores pending once and retrying already answered source IDs is harmless',()=>{
 let h=harness();h.send(ids[1],'我叫阿凯','a');const saved=C.normalize(JSON.parse(JSON.stringify(h.state)));h=harness(saved);h.tick(2200);
 assert.equal(saved.chatMessages[ids[1]].filter(m=>m.autoReply).length,1);assert.equal(saved.personaV2.rooms[ids[1]].facts.name,'阿凯');
 h.r.enqueue(ids[1],saved.chatMessages[ids[1]][0]);h.tick(2200);assert.equal(saved.chatMessages[ids[1]].filter(m=>m.autoReply).length,1);
 harness(C.normalize(JSON.parse(JSON.stringify(saved)))).tick(2200);assert.equal(saved.chatMessages[ids[1]].filter(m=>m.autoReply).length,1);
});
test('text pause produces one acknowledgement and cancels future automatic replies',()=>{
 const h=harness();h.send(ids[0],'先安静，不要回复了','a');h.tick(2200);assert.equal(h.r.enabled(ids[0]),false);h.send(ids[0],'你好','b');h.tick(2200);assert.equal(h.state.chatMessages[ids[0]].filter(m=>m.autoReply).length,1);
});
