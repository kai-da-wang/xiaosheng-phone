const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Core=require('../dist/core.js');

// Exercise the actual app event handlers with no elapsed timers between input events.
function harness(){
 const listeners=new Map(),windows=new Map();let ctx,renders=0,cycle=0;
 function element(dataset={}){
  const classes=new Set(),attrs=new Map(),events=new Map();
  return {dataset,style:{},events,isConnected:true,textContent:'',
   classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle(k,on){if(on===undefined)on=!classes.has(k);on?classes.add(k):classes.delete(k);}},
   setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k),hasAttribute:k=>attrs.has(k),getAttribute:k=>attrs.get(k),
   addEventListener(type,fn){events.set(type,fn);},focus(){},matches:()=>false,
   closest(selector){return selector==='[data-action]'&&dataset.action||selector==='[data-action="pin-key"]'&&dataset.action==='pin-key'?this:null;}};
 }
 const nodes=Object.fromEntries(['#phone','#screen','#modal-root','#toast','#statusbar','#home-indicator','.wallpaper','.camera-layout'].map(k=>[k,element()]));
 const dots=Array.from({length:4},()=>element()),progress=element(),error=element(),panel=element();
 panel.querySelectorAll=()=>dots;panel.querySelector=s=>s==='.pin-dots'?progress:error;
 const screen=nodes['#screen'];let html='';
 Object.defineProperty(screen,'innerHTML',{get:()=>html,set(value){html=value;renders++;if(value.includes('realistic-passcode')){dots.forEach(x=>x.classList.remove('filled'));error.textContent='';progress.setAttribute('aria-label','已输入 0 位，共 4 位');}}});
 screen.querySelector=s=>s==='.passcode'&&html.includes('realistic-passcode')?panel:null;
 const x={beforeRender(){},afterRender(){},onNavigate(){},action:()=>false,stopAudio(){},unreadCount:()=>0,avatar:()=>''};
 const document={querySelector:s=>nodes[s]||null,querySelectorAll:()=>[],addEventListener(type,fn,capture){const list=listeners.get(type)||[];list.push({fn,capture:!!capture});listeners.set(type,list);}};
 const history={replaceState(value){this.state=value;},pushState(value){this.state=value;}};
 const window={PhoneCore:Core,PHONE_DATA:{people:[{id:'wang',name:'小王'}]},PHOTO_LIBRARY:{unlock:{pin:'0520'}},PhoneExperience:{create(c){ctx=c;return x;}},DaliExperience:{create:()=>({action:()=>false,afterRender(){},camera:()=>'<div class="camera-layout"></div>'})},addEventListener:(k,fn)=>windows.set(k,fn)};
 vm.runInNewContext(fs.readFileSync('dist/app.js','utf8'),{window,document,history,localStorage:{getItem:()=>null,setItem(){}},icon:()=>'',appIcon:()=>'',Intl,Date,Map,Math,setInterval(){},setTimeout:()=>1,clearTimeout(){}});
 function event(target,extra={}){return {target,detail:1,pointerId:1,button:0,isPrimary:true,clientX:0,clientY:0,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...extra};}
 function dispatch(type,e){for(const l of listeners.get(type)||[])if(l.capture){l.fn(e);if(e.stopped)return;}if(type==='pointerdown'){screen.events.get(type)?.(e);nodes['#phone'].events.get(type)?.(e);}if(type==='pointerup'||type==='pointercancel')nodes['#phone'].events.get(type)?.(e);for(const l of listeners.get(type)||[])if(!l.capture){l.fn(e);if(e.stopped)return;}}
 function click(action,data={}){dispatch('click',event(element({action,...data}),{detail:0}));}
 function down(key,extra={}){const target=element({action:'pin-key',key});dispatch('pointerdown',event(target,extra));return target;}
 function tap(key){const target=down(key);dispatch('pointerup',event(target));dispatch('click',event(target));}
 return {ctx,click,down,tap,dispatch,event,element,screen,dots,error,progress,history,renderCount:()=>renders,filled:()=>dots.filter(x=>x.classList.contains('filled')).length,
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
