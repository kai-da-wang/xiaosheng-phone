const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Core=require('../dist/core.js');

// Exercise the actual app event handlers with no elapsed timers between input events.
function harness(){
 const listeners=new Map(),windows=new Map();let ctx,renders=0,cycle=0,soundUnlocks=0;const saves=[],timers=new Map();let timerId=0;
 function element(dataset={}){
  const classes=new Set(),attrs=new Map(),events=new Map();
  return {dataset,style:{},events,isConnected:true,textContent:'',
   classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle(k,on){if(on===undefined)on=!classes.has(k);on?classes.add(k):classes.delete(k);}},
   setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k),hasAttribute:k=>attrs.has(k),getAttribute:k=>attrs.get(k),toggleAttribute(k,on){on?attrs.set(k,''):attrs.delete(k);},
   addEventListener(type,fn){events.set(type,fn);},focus(){},matches:()=>false,
   closest(selector){return selector==='[data-action]'&&dataset.action||selector==='[data-action="pin-key"]'&&dataset.action==='pin-key'?this:null;}};
 }
 const nodes=Object.fromEntries(['#phone','#screen','#modal-root','#toast','#statusbar','#home-indicator','.wallpaper','.camera-layout'].map(k=>[k,element()]));
 const dots=Array.from({length:4},()=>element()),progress=element(),error=element(),panel=element();
 panel.querySelectorAll=()=>dots;panel.querySelector=s=>s==='.pin-dots'?progress:error;
 const screen=nodes['#screen'];let html='';
 Object.defineProperty(screen,'innerHTML',{get:()=>html,set(value){html=value;renders++;if(value.includes('realistic-passcode')){dots.forEach(x=>x.classList.remove('filled'));error.textContent='';progress.setAttribute('aria-label','已输入 0 位，共 4 位');}}});
 const pager=element(),pages=[element(),element()],pageButtons=[element({page:'0'}),element({page:'1'})];
 pager.clientWidth=320;pager.scrollLeft=0;pager.querySelectorAll=()=>pages;
 pager.scrollTo=options=>{pager.lastScroll=options;pager.scrollLeft=options.left;pager.events.get('scroll')?.();};
 screen.querySelector=s=>s==='.passcode'&&html.includes('realistic-passcode')?panel:s==='.home-pager'&&html.includes('home-pager')?pager:null;
 screen.querySelectorAll=()=>pageButtons;
 const x={beforeRender(){},afterRender(){},onNavigate(){},onUnlock(){assert.equal(ctx.getState().unlocked,true);assert.notEqual(ctx.getRoute().app,'pin');soundUnlocks++;},action:()=>false,input:()=>false,room:()=>'<h1>小王</h1>',stopAudio(){},unreadCount:()=>0,avatar:()=>''};
 const document={querySelector:s=>nodes[s]||null,querySelectorAll:()=>[],addEventListener(type,fn,capture){const list=listeners.get(type)||[];list.push({fn,capture:!!capture});listeners.set(type,list);}};
 const history={replaceState(value){this.state=value;},pushState(value){this.state=value;}};
 const window={PhoneCore:Core,PHONE_DATA:{people:[{id:'wang',name:'小王',alias:'测试别称',scenes:[]}],folderUnlockCount:3},PHOTO_LIBRARY:{unlock:{pin:'0520'},assets:[],albums:[]},PhoneExperience:{create(c){ctx=c;return x;}},DaliExperience:{create:()=>({action:()=>false,input:()=>false,note:()=>'',afterRender(){},camera:()=>'<div class="camera-layout"></div>'})},addEventListener:(k,fn)=>windows.set(k,fn)};
 vm.runInNewContext(fs.readFileSync('dist/app.js','utf8'),{window,document,history,localStorage:{getItem:()=>null,setItem(key,value){saves.push(JSON.parse(value));}},icon:()=>'',appIcon:()=>'',Intl,Date,Map,Math,setInterval(){},setTimeout(fn){const id=++timerId;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}});
 function event(target,extra={}){return {target,detail:1,pointerId:1,button:0,isPrimary:true,clientX:0,clientY:0,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};}
 function dispatch(type,e){for(const l of listeners.get(type)||[])if(l.capture){l.fn(e);if(e.stopped)return;}if(type==='pointerdown'){screen.events.get(type)?.(e);nodes['#phone'].events.get(type)?.(e);}if(type==='pointerup'||type==='pointercancel')nodes['#phone'].events.get(type)?.(e);for(const l of listeners.get(type)||[])if(!l.capture){l.fn(e);if(e.stopped)return;}}
 function click(action,data={}){dispatch('click',event(element({action,...data}),{detail:0}));}
 function down(key,extra={}){const target=element({action:'pin-key',key});dispatch('pointerdown',event(target,extra));return target;}
 function tap(key){const target=down(key);dispatch('pointerup',event(target));dispatch('click',event(target));}
 return {ctx,click,down,tap,dispatch,event,element,screen,nodes,windows,saves,tick(){for(const [id,fn] of [...timers]){timers.delete(id);fn();}},field(id,value){nodes['#'+id]=element();nodes['#'+id].value=value;return nodes['#'+id];},submit(form){dispatch('submit',event(element({form})));},dots,error,progress,history,pager,pages,pageButtons,soundUnlocks:()=>soundUnlocks,renderCount:()=>renders,filled:()=>dots.filter(x=>x.classList.contains('filled')).length,
  scrollHome(page){pager.scrollLeft=page*pager.clientWidth;pager.events.get('scroll')?.();},home(){nodes['#home-indicator'].events.get('click')();},
  key(key,repeat=false){dispatch('keydown',event(element(),{key,repeat}));},pop(app){windows.get('popstate')({state:{phone:true,route:{app}}});},
  swipe(cancel=false){const target=element();dispatch('pointerdown',event(target,{pointerId:++cycle,clientY:300}));if(cancel)dispatch('pointercancel',event(target,{pointerId:cycle}));dispatch('pointerup',event(target,{pointerId:cycle,clientY:100}));}};
}
test('the first zero works immediately on contact; partial input never replaces the keypad',()=>{
 const h=harness();h.click('pin');const count=h.renderCount();h.down('0');assert.equal(h.filled(),1);assert.equal(h.progress.getAttribute('aria-label'),'已输入 1 位，共 4 位');assert.equal(h.renderCount(),count);
});
test('rapid 0520 enters exactly once despite mobile compatibility clicks, and supports another unlock',()=>{
 const h=harness();for(let cycle=0;cycle<2;cycle++){if(cycle)h.click('lock-phone');h.click('pin');for(const n of '0520')h.tap(n);assert.equal(h.ctx.getRoute().app,'home');assert.equal(h.ctx.getState().unlocked,true);}
});
test('wrong input, delete, keyboard and repeated keydown recover without recreating buttons',()=>{
 const h=harness();h.click('pin');const count=h.renderCount();for(const n of '1111')h.tap(n);assert.match(h.error.textContent,/密码不对/);assert.equal(h.filled(),0);h.key('0');h.key('0',true);assert.equal(h.filled(),1);assert.equal(h.error.textContent,'');h.key('Backspace');assert.equal(h.filled(),0);assert.equal(h.renderCount(),count);for(const n of '0520')h.key(n);assert.equal(h.ctx.getRoute().app,'home');
});
test('secondary pointers and input behind an inert screen cannot add digits',()=>{
 const h=harness();h.click('pin');h.down('0',{isPrimary:false});assert.equal(h.filled(),0);h.screen.setAttribute('inert','');h.tap('0');assert.equal(h.filled(),0);h.screen.removeAttribute('inert');h.tap('0');assert.equal(h.filled(),1);
});
test('an overlapping second finger and its click cannot duplicate or add a PIN digit',()=>{
 for(const secondaryFirst of [true,false]){
  const h=harness();h.click('pin');const first=h.down('0'),second=h.down('5',{pointerId:2,isPrimary:false});
  const clicks=[[second,{pointerId:2,isPrimary:false}],[first,{pointerId:1}]];if(!secondaryFirst)clicks.reverse();
  for(const [target,extra] of clicks)h.dispatch('click',h.event(target,extra));
  assert.equal(h.filled(),1);for(const n of '520')h.tap(n);assert.equal(h.ctx.getRoute().app,'home');
 }
});
test('sound is enabled only after a successful PIN or direct unlock, including keyboard entry',()=>{
 for(const method of ['pointer','keyboard','direct']){
  const h=harness();h.click('pin');if(method==='direct')h.click('unlock');else{
   for(const n of '052'){method==='pointer'?h.tap(n):h.key(n);assert.equal(h.soundUnlocks(),0);}
   method==='pointer'?h.tap('0'):h.key('0');
  }
  assert.equal(h.soundUnlocks(),1);assert.equal(h.ctx.getRoute().app,'home');
 }
});
test('canceling a camera or notification unlock clears its deferred destination',()=>{
 for(const action of ['lock-camera','lock-notification']){const h=harness();h.click(action);h.click('back');h.click('pin');for(const n of '0520')h.tap(n);assert.equal(h.ctx.getRoute().app,'home');}
 const h=harness();h.click('lock-camera');for(const n of '0520')h.tap(n);assert.equal(h.ctx.getRoute().app,'camera');
});
test('history never reopens a stale keypad or an app while locked',()=>{
 const h=harness();h.click('pin');h.tap('0');h.pop('pin');assert.equal(h.ctx.getRoute().app,'lock');h.click('pin');assert.equal(h.filled(),0);for(const n of '0520')h.tap(n);h.pop('pin');assert.equal(h.ctx.getRoute().app,'home');h.click('lock-phone');h.pop('photos');assert.equal(h.ctx.getRoute().app,'lock');h.click('app',{app:'photos'});assert.equal(h.ctx.getRoute().app,'lock');
});
test('canceled swipes cannot unlock and a completed swipe opens an empty keypad',()=>{
 const h=harness();h.swipe(true);assert.equal(h.ctx.getRoute().app,'lock');h.swipe();assert.equal(h.ctx.getRoute().app,'pin');h.tap('0');assert.equal(h.filled(),1);
});
test('native home swipes update page controls and inactive accessibility without repainting',()=>{
 const h=harness();h.click('unlock');const count=h.renderCount();h.scrollHome(1);
 assert.equal(h.pageButtons[1].getAttribute('aria-pressed'),'true');assert.equal(h.pages[0].hasAttribute('inert'),true);assert.equal(h.pages[1].hasAttribute('inert'),false);
 h.scrollHome(0);assert.equal(h.pageButtons[0].getAttribute('aria-pressed'),'true');assert.equal(h.renderCount(),count);
});
test('the remaining preview apps show a test message and return to the second page with a separate file route',()=>{
 const h=harness();h.click('unlock');h.scrollHome(1);
 for(const [app,name] of [['alipay','支付宝'],['music','音乐'],['douyin','抖音'],['health','健康'],['qq','QQ'],['weibo','微博'],['xiaohongshu','小红书'],['bilibili','哔哩哔哩'],['taobao','淘宝'],['jd','京东'],['meituan','美团'],['amap','高德地图']]){
  h.click('app',{app});assert.equal(h.ctx.getRoute().app,app);assert.ok(h.screen.innerHTML.includes('<h1>'+name+'</h1>'));assert.match(h.screen.innerHTML,/app-test-card/);assert.match(h.screen.innerHTML,/测试消息/);assert.match(h.screen.innerHTML,/<time>刚刚<\/time>/);if(app==='contacts'){assert.match(h.screen.innerHTML,/最近通话/);assert.match(h.screen.innerHTML,/未接来电/);assert.match(h.screen.innerHTML,/剧情记录/);}
  h.click('back');assert.equal(h.ctx.getRoute().app,'home');assert.equal(h.pager.scrollLeft,h.pager.clientWidth);
 }
});
test('page dots, home indicator and arrows switch pages without locking or adding history',()=>{
 const h=harness();h.click('unlock');const history=h.history.state;h.click('home-page',{page:'1'});assert.equal(h.pager.scrollLeft,320);
 h.home();assert.equal(h.pager.scrollLeft,0);assert.equal(h.ctx.getState().unlocked,true);assert.equal(h.history.state,history);
 h.ctx.getState().settings.reduced=true;h.pager.events.get('keydown')(h.event(h.element(),{key:'ArrowRight'}));assert.equal(h.pager.scrollLeft,320);assert.equal(h.pager.lastScroll.behavior,'auto');
 h.click('back');assert.equal(h.ctx.getRoute().app,'home');assert.equal(h.pager.scrollLeft,0);
 h.scrollHome(1);h.click('reset-confirm');h.click('unlock');assert.equal(h.pager.scrollLeft,0);
});

test('contacts have searchable names, a chat return path, and separate real call history',()=>{
 const h=harness();h.click('unlock');h.click('app',{app:'contacts'});assert.match(h.screen.innerHTML,/搜索通讯录/);assert.match(h.screen.innerHTML,/发微信消息/);assert.doesNotMatch(h.screen.innerHTML,/测试消息/);
 h.nodes['#contact-list']=h.element();const input=h.field('contact-search','测试别称');input.id='contact-search';h.dispatch('input',h.event(input));assert.match(h.nodes['#contact-list'].innerHTML,/小王/);
 input.value='没有这个人';h.dispatch('input',h.event(input));assert.match(h.nodes['#contact-list'].innerHTML,/没有找到联系人/);
 h.click('room',{id:'wang'});assert.equal(h.ctx.getRoute().app,'room');h.click('back');assert.equal(h.ctx.getRoute().app,'contacts');
 h.ctx.getState().callLog.push({id:'call',name:'小王',result:'answered',time:'12:00'});h.click('contacts-tab',{tab:'calls'});assert.match(h.screen.innerHTML,/本机通话/);assert.match(h.screen.innerHTML,/已接听/);assert.match(h.screen.innerHTML,/剧情记录/);
});
test('file browser links to actual content and nested back returns through the entry path',()=>{
 const h=harness();h.click('unlock');h.ctx.getState().notes.push({id:'legacy'});h.click('app',{app:'file-manager'});assert.match(h.screen.innerHTML,/故事片段/);assert.match(h.screen.innerHTML,/0 张照片/);assert.doesNotMatch(h.screen.innerHTML,/学习资料|测试消息/);
 h.click('browse',{app:'notes'});h.click('memo',{id:'shoot'});h.click('back');assert.equal(h.ctx.getRoute().app,'notes');h.click('back');assert.equal(h.ctx.getRoute().app,'file-manager');
 h.click('browse',{app:'chapters'});assert.match(h.screen.innerHTML,/按人物翻阅/);h.click('back');assert.equal(h.ctx.getRoute().app,'file-manager');
});
test('notes can be edited in place; canceling deletion keeps content and confirming returns to its list',()=>{
 const h=harness();h.click('unlock');h.click('app',{app:'notes'});h.click('add-note');h.field('note-title','一条记录');h.field('note-text','原文');h.submit('note');const id=h.ctx.getState().notes[0].id;
 h.click('memo',{id});h.click('edit-note',{id});assert.match(h.nodes['#modal-root'].innerHTML,/原文/);h.field('note-title','改好');h.field('note-text','<script>文字</script>');h.submit('note');
 assert.equal(h.ctx.getState().notes.length,1);assert.equal(h.ctx.getState().notes[0].id,id);assert.match(h.screen.innerHTML,/&lt;script&gt;/);
 h.click('delete-note',{id});assert.equal(h.ctx.getState().notes.length,1);h.click('modal-close');assert.equal(h.ctx.getState().notes.length,1);h.click('delete-note-confirm',{id});assert.equal(h.ctx.getState().notes.length,1);
 h.click('delete-note',{id});h.click('delete-note-confirm',{id});assert.equal(h.ctx.getState().notes.length,0);assert.equal(h.ctx.getRoute().app,'notes');
});
test('draft saving coalesces typing and flushes on navigation and page exit',()=>{
 const h=harness();h.click('unlock');const before=h.saves.length;
 for(const draft of ['h','he','hello']){h.ctx.getState().chatDrafts.wang=draft;h.ctx.saveDraft();}assert.equal(h.saves.length,before);h.tick();assert.equal(h.saves.length,before+1);assert.equal(h.saves.at(-1).chatDrafts.wang,'hello');
 h.ctx.getState().chatDrafts.wang='离开前';h.ctx.saveDraft();h.click('app',{app:'contacts'});assert.equal(h.saves.at(-1).chatDrafts.wang,'离开前');
 h.ctx.getState().chatDrafts.wang='刷新前';h.ctx.saveDraft();h.windows.get('pagehide')();assert.equal(h.saves.at(-1).chatDrafts.wang,'刷新前');
});

test('back from an album opened in a contact chat returns through that chat to contacts',()=>{const h=harness();h.click('unlock');h.click('app',{app:'contacts'});h.click('room',{id:'wang'});const origin={...h.ctx.getRoute()};h.ctx.go('album',{id:'xiaowang',returnRoom:'wang',returnTo:origin});h.click('back');assert.equal(h.ctx.getRoute().app,'room');h.click('back');assert.equal(h.ctx.getRoute().app,'contacts');});
