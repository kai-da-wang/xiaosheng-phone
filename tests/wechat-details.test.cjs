const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../dist/core.js'),Life=require('../dist/phone-life.js');
function setup(id='lead_muma'){
 const state=C.defaults(),route={app:'chat-info',id},calls=[],result={innerHTML:''},window={};
 for(const name of ['content.js','wechat-details.js'])vm.runInNewContext(fs.readFileSync('dist/'+name,'utf8'),{window,Set,Date,document:{getElementById:()=>result,querySelectorAll:()=>[]}});
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const people=window.PHONE_DATA.people;
 const x=window.WeChatDetails.create({people,life:Life,wang:people[0].id,esc,icon:()=>'',btn:(a,l,c='',extra='')=>`<button data-action="${a}" ${extra}>${l}</button>`,avatar:p=>`<span>${esc(p?.name)}</span>`,getState:()=>state,getRoute:()=>route,go(app,opts={}){Object.keys(route).forEach(k=>delete route[k]);Object.assign(route,{app,...opts});calls.push(['go',app,opts]);},save(){},render(){},toast(){},modal:(...a)=>calls.push(['modal',...a]),closeModal(){},person:id=>people.find(p=>p.id===id)||people[0],supports:id=>C.personaIds.includes(id),replySettings(){},messages:id=>state.chatMessages[id]||[],cancelReplies:id=>calls.push(['cancel',id]),markRead(){},resetView(){}});
 return {x,state,route,calls,result};
}
test('single chat has a complete iPhone-style detail page and keeps engine settings out',()=>{
 const h=setup(),html=h.x.render('chat-info');for(const text of ['聊天详情','添加聊天成员','查找聊天记录','消息免打扰','置顶聊天','设置当前聊天背景','清空聊天记录','投诉'])assert.ok(html.includes(text));for(const text of ['群聊名称','自动回复','偏好记忆','role="dialog"'])assert.ok(!html.includes(text));
});
test('group information uses member grid and group-only settings',()=>{
 const h=setup(Life.groupId),html=h.x.render('chat-info');for(const text of ['聊天信息('+ (Life.members.length+1) +')','阿柚','小米饭','晚风','群聊名称','群二维码','群公告','备注','保存到通讯录','我在本群的昵称','显示群成员昵称','退出群聊'])assert.ok(html.includes(text));assert.equal(h.x.count(Life.groupId),Life.members.length+1);
});
test('mute, pin, and background settings are per conversation and persist across reload',()=>{
 const h=setup();h.x.action('wx-detail-toggle',{dataset:{key:'muted'}});h.x.action('wx-detail-toggle',{dataset:{key:'pinned'}});assert.equal(h.x.muted('lead_muma'),true);assert.equal(h.x.muted('lead_vivi'),false);assert.equal(h.x.pinned('lead_muma'),true);h.x.action('wx-background-select',{dataset:{background:'mint'}});const restored=C.normalize(JSON.parse(JSON.stringify(h.state)));assert.equal(restored.wechatPrefs.lead_muma.background,'mint');assert.equal(restored.wechatPrefs.lead_muma.muted,true);
});
test('old fan-group mute state migrates and remains synchronized with its new switch',()=>{
 const h=setup(Life.groupId);h.state.phoneLife.groupMuted=true;assert.equal(h.x.muted(Life.groupId),true);h.x.action('wx-detail-toggle',{dataset:{key:'muted'}});assert.equal(h.state.phoneLife.groupMuted,false);assert.equal(h.x.muted(Life.groupId),false);
});
test('group name and nickname editing preserves escaped values and isolates other chats',()=>{
 const h=setup(Life.groupId);h.x.action('wx-detail-edit',{dataset:{field:'groupName'}});h.x.input({id:'wx-detail-editor',value:'<快乐补给站>'});h.x.action('wx-detail-save',{dataset:{}});assert.equal(h.x.name(Life.groupId),'<快乐补给站>');assert.match(h.x.render('chat-info'),/&lt;快乐补给站&gt;/);assert.equal(h.state.wechatPrefs.lead_muma,undefined);
});
test('single-chat plus creates a separate local group without changing original participants',()=>{
 const h=setup();h.x.action('wx-invite',{dataset:{}});h.x.action('wx-select-member',{dataset:{member:'lead_vivi'}});h.x.action('wx-invite-done',{dataset:{}});assert.match(h.route.id,/^local_group_/);assert.equal(h.x.count(h.route.id),3);assert.equal(h.state.chatMessages[h.route.id][0].type,'system');assert.equal(h.x.isGroup('lead_muma'),false);assert.equal(Object.keys(C.normalize(JSON.parse(JSON.stringify(h.state))).wechatGroups).length,1);
});
test('adding a member to an existing group updates the group count exactly once',()=>{
 const h=setup(Life.groupId);h.x.action('wx-invite',{dataset:{}});h.x.action('wx-select-member',{dataset:{member:'lead_vivi'}});h.x.action('wx-invite-done',{dataset:{}});assert.equal(h.x.count(Life.groupId),Life.members.length+2);assert.equal(h.x.group(Life.groupId).members.filter(x=>x==='lead_vivi').length,1);
});
test('history clear requires its confirmation and cancels only this conversation queue',()=>{
 const h=setup();h.state.chatMessages.lead_muma=[{id:'a',type:'text',text:'mine'}];h.state.chatMessages.lead_vivi=[{id:'b',type:'text',text:'keep'}];h.x.action('wx-clear-history',{dataset:{}});assert.equal(h.state.chatMessages.lead_muma.length,1);assert.equal(h.calls.at(-1)[2].items[0].action,'wx-clear-confirm');h.x.action('wx-clear-confirm',{dataset:{}});assert.equal(h.state.chatMessages.lead_muma.length,0);assert.equal(h.state.chatMessages.lead_vivi.length,1);assert.ok(h.calls.some(x=>x[0]==='cancel'&&x[1]==='lead_muma'));assert.equal(h.state.wechatPrefs.lead_muma.historyCleared,true);
});
test('search results escape user messages and jump back to an exact message',()=>{
 const h=setup();h.state.chatMessages.lead_muma=[{id:'needle',type:'text',from:'self',text:'火锅<script>'},{id:'other',type:'text',from:'self',text:'别的'}];h.x.action('wx-search-history',{dataset:{}});h.x.input({id:'wx-history-input',value:'火锅'});assert.match(h.result.innerHTML,/1 条相关记录/);assert.match(h.result.innerHTML,/火锅&lt;script&gt;/);assert.doesNotMatch(h.result.innerHTML,/data-message="other"/);h.x.action('wx-history-jump',{dataset:{message:'needle'}});assert.equal(h.route.app,'room');assert.equal(h.route.focusMessage,'needle');
});
test('leaving a group stops pending replies, retains history, and offers no fake WeChat rejoin',()=>{
 const h=setup(Life.groupId);h.state.chatMessages[Life.groupId]=[{id:'keep',type:'text',text:'keep'}];h.x.action('wx-leave-confirm',{dataset:{}});assert.equal(h.state.wechatPrefs[Life.groupId].left,true);assert.equal(h.state.chatMessages[Life.groupId].length,1);assert.doesNotMatch(h.x.render('chat-info'),/重新加入群聊/);
});
test('ordinary group members can read the notice without getting an owner edit control',()=>{
 const h=setup(Life.groupId);h.x.action('wx-detail-edit',{dataset:{field:'notice'}});assert.match(h.x.render('chat-edit'),/暂无群公告/);assert.doesNotMatch(h.x.render('chat-edit'),/textarea|wx-detail-save/);
});

test('chat history finds a transfer by amount, note, or transaction filter',()=>{const h=setup();h.state.chatMessages.lead_muma=[{id:'t1',type:'transfer',from:'other',amountFen:1880,note:'奶茶钱'},{id:'t2',type:'text',from:'self',text:'thanks'}];h.x.action('wx-search-history',{dataset:{}});assert.match(h.x.render('chat-search'),/交易/);h.x.input({id:'wx-history-input',value:'18.80'});assert.match(h.result.innerHTML,/奶茶钱/);assert.match(h.result.innerHTML,/t1/);h.x.input({id:'wx-history-input',value:'转账'});assert.match(h.result.innerHTML,/¥18.80/);h.x.action('wx-history-reset',{dataset:{}});h.x.action('wx-history-filter',{dataset:{filter:'transfer'}});assert.match(h.x.render('chat-search'),/1 条相关记录 · 交易/);assert.doesNotMatch(h.x.render('chat-search'),/data-message="t2"/);});
