const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Core=require('../dist/core.js');
function setup(initial=Core.defaults()){
 const state=initial,route={app:'moments'},calls=[],nodes={};let saves=0,renders=0;
 const w={PhoneCore:Core};for(const f of ['content.js','gallery-data.js','moments-data.js','muma-chat.js','monv-chat.js','vivi-chat.js','gangjie-chat.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),{window:w});
 const document={addEventListener(){},createElement:()=>({addEventListener(){}}),body:{appendChild(){}},querySelector:s=>nodes[s]||null,querySelectorAll:()=>[],getElementById:()=>null};
 const sandbox={window:w,document,Promise,Intl,Date,Map,Set,Math,setTimeout:()=>1,clearTimeout(){}};
 w.WangChatRuntime={create:()=>({typingMarkup:()=>'',enqueue(){},enabled:()=>true,mode:()=>''})};w.PersonaChatRuntime={create:()=>({supports:()=>false,typingMarkup:()=>''})};
 for(const f of ['wechat-details.js','phone-experience.js'])vm.runInNewContext(fs.readFileSync('dist/'+f,'utf8'),sandbox);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const x=w.PhoneExperience.create({data:w.PHONE_DATA,gallery:w.PHOTO_LIBRARY,esc,icon:()=>'',btn:(action,label,cls='',extra='')=>`<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`,shell:(title,body)=>body,go(app,opts={}){for(const key of Object.keys(route))delete route[key];Object.assign(route,{app,...opts});calls.push(['go',app,opts]);},save(){saves++;},toast:t=>calls.push(['toast',t]),modal:(...a)=>calls.push(['modal',...a]),closeModal:()=>calls.push(['close']),appIcon(){},getState:()=>state,getRoute:()=>route,render(){renders++;}});
 return {x,w,state,route,calls,nodes,saves:()=>saves,renders:()=>renders};
}
test('all six profiles have distinct photo covers and image posts using existing gallery assets',()=>{
 const h=setup(),data=h.w.PHONE_MOMENTS,assets=h.w.PHOTO_LIBRARY.assets,ids=['self',...h.w.PHONE_DATA.people.map(p=>p.id)];
 assert.equal(new Set(Object.values(data.covers)).size,6);assert.equal(new Set(data.posts.map(p=>p.id)).size,data.posts.length);
 for(const id of ids){const cover=assets.find(a=>a.id===data.covers[id]);assert.ok(cover,id+' cover');const posts=data.posts.filter(p=>p.author===id);assert.ok(posts.length>=2,id+' posts');assert.notEqual(posts[0].assetId,cover.id,id+' cover differs from first post');assert.ok(posts.every(p=>assets.some(a=>a.id===p.assetId)),id+' photos');
  h.route.owner=id;const html=h.x.moments();assert.match(html,/wx-moments-hero/);assert.ok(html.includes(cover.path));assert.equal((html.match(/class="wx-moment"/g)||[]).length,posts.length);assert.doesNotMatch(html,/wx-moments-grid|wx-shared-album/);
 }
});
test('Discover shows the combined feed and Me opens only the player’s own moments',()=>{
 const h=setup(),html=h.x.moments();assert.equal((html.match(/class="wx-moment"/g)||[]).length,17);for(const name of ['小王','一根洋葱','魔女','薇薇','港姐','小圣'])assert.ok(html.includes(name));
 h.route.app='wechat';h.x.action('wx-tab',{dataset:{tab:'me'}});assert.match(h.x.wechat(),/data-action="wx-moments-self"/);h.x.action('wx-moments-self',{dataset:{}});assert.equal(h.route.owner,'self');assert.equal(h.route.returnTo.app,'wechat');assert.equal((h.x.moments().match(/class="wx-moment"/g)||[]).length,3);
});
test('profile, picture, like, comment and cover actions preserve local state safely',()=>{
 const h=setup();h.x.action('wx-moment-profile',{dataset:{owner:'lead_muma'}});assert.equal(h.route.owner,'lead_muma');assert.equal(h.route.returnTo.app,'moments');
 h.x.action('wx-moment-photo',{dataset:{asset:'muma-03'}});assert.equal(h.calls.at(-1)[1],'photo');assert.equal(h.calls.at(-1)[2].assetId,'muma-03');assert.equal(h.calls.at(-1)[2].index,0);assert.equal(h.calls.at(-1)[2].albumId,undefined);
 const id='moment_muma_1';h.x.action('wx-moment-like',{dataset:{id}});assert.equal(h.state.momentsLikes[id],true);h.x.action('wx-moment-comment',{dataset:{id}});assert.equal(h.calls.at(-1)[1],'moment-comment');h.x.submitMomentComment(id,'<script>周末见</script>');assert.match(h.x.moments(),/&lt;script&gt;周末见&lt;\/script&gt;/);assert.doesNotMatch(h.x.moments(),/<script>周末见/);
 h.route.owner='self';h.x.action('wx-moments-cover',{dataset:{}});assert.equal(h.calls.at(-1)[1],'moments-cover');h.x.action('wx-moments-cover-select',{dataset:{id:'vivi-03'}});assert.equal(h.state.momentsCoverId,'vivi-03');assert.ok(h.x.moments().includes(h.w.PHOTO_LIBRARY.assets.find(a=>a.id==='vivi-03').path));
 h.x.action('wx-moments-cover-select',{dataset:{id:'javascript:alert(1)'}});assert.equal(h.state.momentsCoverId,'vivi-03');const restored=Core.normalize(JSON.parse(JSON.stringify(h.state)));assert.equal(restored.momentsCoverId,'vivi-03');assert.equal(restored.momentsLikes[id],true);assert.equal(restored.momentsComments[id][0].text,'<script>周末见</script>');
 h.x.action('wx-moment-like',{dataset:{id}});assert.equal(h.state.momentsLikes[id],undefined);
});
test('chat member details offer a moments entry, with a return path to the member page',()=>{
 const h=setup();h.route.app='chat-member';h.route.id='lead_gangjie';h.route.member='lead_gangjie';assert.match(h.x.details('chat-member'),/朋友圈/);h.x.action('wx-moment-profile',{dataset:{owner:'lead_gangjie'}});assert.equal(h.route.owner,'lead_gangjie');assert.equal(h.route.returnTo.app,'chat-member');assert.equal(h.route.returnTo.member,'lead_gangjie');
});
test('scroll positions survive a redraw and are isolated between feed and profiles',()=>{
 const h=setup(),screen={dataset:{momentView:'feed'},scrollTop:540};h.nodes['.wx-moments-scroll']=screen;h.x.beforeRender();screen.scrollTop=0;h.x.afterRender();assert.equal(screen.scrollTop,540);
 h.nodes['.wx-moments-scroll']={dataset:{momentView:'lead_vivi'},scrollTop:0};h.x.afterRender();assert.equal(h.nodes['.wx-moments-scroll'].scrollTop,0);
});
test('damaged moments storage recovers without injecting invalid records',()=>{const s=Core.normalize({version:1,momentsCoverId:3,momentsLikes:{ok:true,no:false},momentsComments:{post:[{text:' ok '},{text:''},{text:3},null]}});assert.equal(s.momentsCoverId,'');assert.deepEqual(s.momentsLikes,{ok:true});assert.deepEqual(s.momentsComments.post,[{text:'ok',createdAt:0}]);});
