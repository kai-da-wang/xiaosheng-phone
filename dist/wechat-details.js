/* iPhone-style chat information pages. Every change stays in this simulated phone. */
window.WeChatDetails={create(ctx){
 'use strict';
 const {esc,icon,btn,avatar,go,save,toast,modal}=ctx,S=ctx.getState,route=ctx.getRoute;
 let selected=new Set(),search='',filter='',memberFilter='',editDraft='',reportReason='',expandedMembers=false;
 const groupId=ctx.life?.groupId||'group_xiaosheng_fans';
 const prefs=id=>{S().wechatPrefs||={};return S().wechatPrefs[id]||={};};
 const member=id=>{if(typeof id!=='string')return undefined;if(id==='self')return {id,name:'小圣',initial:'圣',color:'#82978d'};if(id.startsWith('fan_')){const p=ctx.life?.members.find(p=>'fan_'+p.id===id);return p?{...p,id}:undefined;}return ctx.people.find(p=>p.id===id);};
 function group(id){if(id===groupId)return {id,name:prefs(id).groupName||'小圣的快乐补给站',members:['self',...(ctx.life?.members||[]).map(p=>'fan_'+p.id),...(prefs(id).addedMembers||[])],owner:'fan_youzi'};return S().wechatGroups?.[id]||null;}
 const groups=()=>Object.values(S().wechatGroups||{}).map(g=>({id:g.id,name:g.name,initial:'群',color:'#73a58b',alias:'群聊'}));
 const isGroup=id=>!!group(id);
 const name=id=>prefs(id).remark||group(id)?.name||ctx.people.find(p=>p.id===id)?.name||'聊天';
 const muted=id=>prefs(id).muted??((id===groupId&&S().phoneLife?.groupMuted)||false);
 const pinned=id=>prefs(id).pinned??id===ctx.wang;
 const members=id=>(group(id)?.members||[id]).map(member).filter(Boolean);
 const count=id=>members(id).length;
 function shell(title,body,{back='wx-detail-back',right='',className=''}={}){return `<section class="app-shell wx-shell wx-detail-shell ${className}"><nav class="wx-nav"><div class="wx-left">${btn(back,icon('back'),'','aria-label="返回"')}</div><h1>${esc(title)}</h1><div class="wx-right">${right}</div></nav><div class="app-scroll wx-detail-scroll">${body}</div></section>`;}
 const row=(label,action,value='',extra='')=>`<button class="wx-detail-row" data-action="${action}" ${extra}><span>${esc(label)}</span><span class="wx-detail-value">${esc(value)}</span>${icon('chevron')}</button>`;
 const toggle=(label,key,on)=>`<div class="wx-detail-row"><span>${esc(label)}</span><button class="wx-ios-switch ${on?'on':''}" type="button" role="switch" aria-checked="${!!on}" aria-label="${esc(label)}" data-action="wx-detail-toggle" data-key="${key}"><i></i></button></div>`;
 const section=html=>`<div class="wx-detail-section">${html}</div>`;
 function memberTile(p){return `<button class="wx-member-tile" data-action="wx-member" data-member="${esc(p.id)}" aria-label="查看${esc(p.name)}的资料">${avatar(p,p.id==='self')}<span>${esc(p.id==='self'?(prefs(route().id).myNickname||p.name):p.name)}</span></button>`;}
 function info(){const id=route().id,g=group(id),p=prefs(id),left=p.left;
  const allMembers=members(id),visibleMembers=g&&!expandedMembers?allMembers.slice(0,19):allMembers;
  const top=`<div class="wx-member-grid">${visibleMembers.map(memberTile).join('')}${left?'':`<button class="wx-member-tile wx-member-add" data-action="wx-invite" aria-label="添加聊天成员"><span class="wx-add-square">${icon('plus')}</span><span aria-hidden="true">　</span></button>`}</div>${g&&allMembers.length>19&&!expandedMembers?`<button class="wx-member-expand" data-action="wx-expand-members">查看全部 ${allMembers.length} 位群成员 ${icon('chevron')}</button>`:''}`;
  const common=section(row('查找聊天记录','wx-search-history'))+section(toggle('消息免打扰','muted',muted(id))+toggle('置顶聊天','pinned',pinned(id))+(g?toggle('保存到通讯录','saved',p.saved):''));
  const groupRows=g?section(row('群聊名称','wx-detail-edit',g.name,'data-field="groupName"')+row('群二维码','wx-group-code')+row('群公告','wx-detail-edit',p.notice||g.notice||'未设置','data-field="notice"')+row('备注','wx-detail-edit',p.remark||'','data-field="remark"')):'';
  const nickname=g?section(row('我在本群的昵称','wx-detail-edit',p.myNickname||'小圣','data-field="myNickname"')+toggle('显示群成员昵称','showNicknames',p.showNicknames!==false)):'';
  return shell(g?`聊天信息(${count(id)})`:'聊天详情',section(top)+groupRows+common+nickname+section(row('设置当前聊天背景','wx-chat-background')+row('清空聊天记录','wx-clear-history'))+section(row('投诉','wx-report'))+(g?section(left?'<p class="wx-left-group-note">你已退出此群聊</p>':btn('wx-leave','退出群聊','wx-detail-danger')):''));
 }
 const historyText=m=>m.type==='transfer'?`[转账] ¥${(m.amountFen/100).toFixed(2)} ${m.note||''}`:m.text||'';
 function historyResults(){const q=search.trim().toLowerCase(),all=ctx.messages(route().id);const results=all.filter(m=>(q||filter||memberFilter)&&(!q||historyText(m).toLowerCase().includes(q))&&(!filter||m.type===filter)&&(!memberFilter||(m.from==='self'?memberFilter==='self':m.speaker===memberFilter.replace(/^fan_/,''))));
  if(!q&&!filter&&!memberFilter)return `<p class="wx-search-prompt">搜索指定内容</p><div class="wx-history-filters">${btn('wx-history-filter','图片与视频','','data-filter="photo"')}${btn('wx-history-filter','语音','','data-filter="voice"')}${btn('wx-history-filter','交易','','data-filter="transfer"')}${isGroup(route().id)?btn('wx-history-members','群成员'):''}</div>`;
  return `<p class="wx-history-count">${results.length} 条相关记录${filter?' · '+(filter==='photo'?'图片与视频':filter==='voice'?'语音':'交易'):''}${memberFilter?' · '+esc(member(memberFilter)?.name||'群成员'):''}</p>${results.length?results.map(m=>`<button class="wx-history-result" data-action="wx-history-jump" data-message="${esc(m.id)}">${avatar(m.from==='self'?member('self'):member(m.speaker?.startsWith('fan_')?m.speaker:'fan_'+m.speaker)||ctx.person(route().id),m.from==='self')}<span><strong>${esc(m.from==='self'?'小圣':isGroup(route().id)?member('fan_'+m.speaker)?.name||'群成员':name(route().id))}</strong><span>${esc(m.type==='photo'?'[图片]':m.type==='voice'?'[语音]':historyText(m))}</span></span><small>${esc(m.time||'')}</small></button>`).join(''):'<p class="wx-detail-empty">没有找到相关聊天记录</p>'}`;
 }
 function history(){return shell('查找聊天记录',`<label class="wx-history-search">${icon('search')}<input id="wx-history-input" type="search" aria-label="搜索聊天记录" placeholder="搜索" value="${esc(search)}"></label><div id="wx-history-results">${historyResults()}</div>`,{right:btn('wx-history-reset','取消','wx-nav-text')});}
 const colors={default:['默认','#ededed'],mint:['浅绿','#e3ede6'],blue:['浅蓝','#e4ebf3'],pink:['浅粉','#f3e7e9'],sand:['暖米','#f0ece3']};
 function background(){const current=prefs(route().id).background||'default';return shell('聊天背景',`<div class="wx-background-grid">${Object.entries(colors).map(([key,[label,color]])=>`<button class="wx-background-choice ${current===key?'selected':''}" data-action="wx-background-select" data-background="${key}" aria-pressed="${current===key}" style="--chat-color:${color}"><span class="wx-background-preview"><i></i><i></i>${current===key?icon('check'):''}</span><span>${label}</span></button>`).join('')}</div>`);}
 function edit(){const field=route().field;if(field==='notice'&&group(route().id)?.owner!=='self')return shell('群公告',`<p class="wx-group-notice-content">${esc(prefs(route().id).notice||'暂无群公告')}</p>`);const labels={groupName:'群聊名称',notice:'群公告',remark:'备注',myNickname:'我在本群的昵称'};return shell(labels[field]||'编辑',`<label class="wx-edit-field">${field==='notice'?`<textarea id="wx-detail-editor" maxlength="500" aria-label="${labels[field]}">${esc(editDraft)}</textarea>`:`<input id="wx-detail-editor" maxlength="${field==='myNickname'?24:40}" aria-label="${labels[field]}" value="${esc(editDraft)}">`}</label>${field==='remark'?'<p class="wx-detail-note">备注的群聊名称仅自己可见。</p>':''}`,{right:btn('wx-detail-save','完成','wx-nav-done')});}
 function invite(){const id=route().id,existing=new Set(group(id)?.members||['self',id]);return shell('选择联系人',`<label class="wx-history-search">${icon('search')}<input id="wx-invite-search" type="search" aria-label="搜索联系人" placeholder="搜索"></label><div id="wx-invite-list">${ctx.people.map(p=>`<button class="wx-invite-person ${existing.has(p.id)?'already':''}" data-action="wx-select-member" data-member="${p.id}" aria-pressed="${selected.has(p.id)}" ${existing.has(p.id)?'disabled':''}><span class="wx-select-circle ${selected.has(p.id)?'checked':''}">${selected.has(p.id)||existing.has(p.id)?icon('check'):''}</span>${avatar(p)}<span>${esc(p.name)}</span></button>`).join('')}</div>`,{right:btn('wx-invite-done',`完成${selected.size?'('+selected.size+')':''}`,'wx-nav-done',selected.size?'':'disabled')});}
 function profile(){const p=member(route().member)||ctx.person(route().member);return shell('详细资料',`<div class="wx-member-profile">${avatar(p,p.id==='self')}<div><h2>${esc(p.name)}</h2>${p.alias?`<p>昵称：${esc(p.alias)}</p>`:''}</div></div>${ctx.people.some(x=>x.id===p.id)?section(btn('wx-member-chat','发消息','wx-profile-message',`data-member="${p.id}"`)):'<p class="wx-detail-note">本手机内的群聊成员</p>'}`);}
 function reports(){return shell('投诉',`<p class="wx-detail-note">请选择投诉原因</p>${section(['发布不适当内容','存在骚扰行为','其他'].map(label=>row(label,'wx-report-reason',reportReason===label?'已选择':'',`data-reason="${label}"`)).join(''))}<p class="wx-detail-note">这是模拟手机内的反馈，仅保存在本机，不会发送至微信。</p>${btn('wx-report-submit','提交','wx-local-submit',reportReason?'':'disabled')}`);}
 function settings(){return shell('角色对话设置',`<p class="wx-detail-note">粉丝同人创作，角色对话为虚构演绎。回复与记忆设置只作用于本机。</p>${section(ctx.people.filter(p=>p.id===ctx.wang||ctx.supports(p.id)).map(p=>row(p.name,'wx-reply-config','',`data-room="${p.id}"`)).join(''))}`,{back:'wx-settings-back'});}
 function savedGroups(){const list=[{id:groupId},...groups()].filter(g=>prefs(g.id).saved);return shell('群聊',list.length?section(list.map(g=>row(name(g.id),'wx-open-group','',`data-room="${g.id}"`)).join('')):'<p class="wx-detail-empty">暂未保存群聊</p>',{back:'wx-contacts-back'});}
 function render(page){return ({'chat-info':info,'chat-search':history,'chat-background':background,'chat-edit':edit,'chat-invite':invite,'chat-member':profile,'chat-report':reports,'wechat-settings':settings,'saved-groups':savedGroups})[page]?.()||'';}
 function clearHistory(){const id=route().id;ctx.cancelReplies(id);ctx.discardRoomMedia?.(id);S().chatMessages[id]=[];delete S().chatDrafts[id];prefs(id).historyCleared=true;ctx.markRead(id);ctx.resetView(id);save();ctx.closeModal();go('room',{id},true);toast('聊天记录已清空');}
 function action(a,t){const id=route().id,p=id?prefs(id):{};
  switch(a){
   case'wx-detail-back':go(route().app==='chat-info'?'room':'chat-info',{id},true);return true;
   case'wx-open-info':go('chat-info',{id});return true;
   case'wx-detail-toggle':{const key=t.dataset.key;if(!['muted','pinned','saved','showNicknames'].includes(key))return true;p[key]=!(key==='muted'?muted(id):key==='pinned'?pinned(id):key==='showNicknames'?p.showNicknames!==false:p[key]);if(key==='muted'&&id===groupId)S().phoneLife.groupMuted=p[key];save();ctx.render();return true;}
   case'wx-search-history':search='';filter='';memberFilter='';go('chat-search',{id});return true;
   case'wx-history-filter':filter=t.dataset.filter;ctx.render();return true;
   case'wx-history-members':modal('phone-actions',{title:'选择群成员',items:members(id).map(m=>({action:'wx-history-member',label:m.name,glyph:'user',member:m.id}))});return true;
   case'wx-history-member':memberFilter=t.dataset.member;ctx.closeModal();ctx.render();return true;
   case'wx-history-reset':search='';filter='';memberFilter='';ctx.render();return true;
   case'wx-history-jump':go('room',{id,focusMessage:t.dataset.message});return true;
   case'wx-chat-background':go('chat-background',{id});return true;
   case'wx-background-select':if(colors[t.dataset.background]){p.background=t.dataset.background;save();go('chat-info',{id},true);}return true;
   case'wx-detail-edit':if(['groupName','notice','remark','myNickname'].includes(t.dataset.field)){editDraft=p[t.dataset.field]||(t.dataset.field==='groupName'?group(id)?.name:t.dataset.field==='myNickname'?'小圣':'')||'';go('chat-edit',{id,field:t.dataset.field});}return true;
   case'wx-detail-save':{const field=route().field,value=editDraft.trim();if(field==='notice'&&group(id)?.owner!=='self')return true;if(['groupName','myNickname'].includes(field)&&!value){toast('内容不能为空');return true;}if(field==='groupName'&&S().wechatGroups?.[id])S().wechatGroups[id].name=value;else p[field]=value;save();go('chat-info',{id},true);return true;}
   case'wx-clear-history':modal('phone-actions',{title:'清空聊天记录',note:'清空与“'+name(id)+'”的聊天记录？照片应用中的原图仍会保留。',ios:true,items:[{action:'wx-clear-confirm',label:'清空聊天记录',danger:true},{action:'modal-close',label:'取消'}]});return true;
   case'wx-clear-confirm':clearHistory();return true;
   case'wx-group-code':modal('phone-actions',{title:'群二维码',note:'这是手机内的剧情群聊，没有真实微信群的入群二维码。',items:[{action:'modal-close',label:'我知道了',glyph:'check'}]});return true;
   case'wx-invite':selected=new Set();go('chat-invite',{id});return true;
   case'wx-select-member':if(selected.has(t.dataset.member))selected.delete(t.dataset.member);else selected.add(t.dataset.member);ctx.render();return true;
   case'wx-invite-done':{if(!selected.size)return true;let target=id;const added=[...selected];if(isGroup(id)){if(S().wechatGroups?.[id])S().wechatGroups[id].members=[...new Set([...group(id).members,...added])];else p.addedMembers=[...new Set([...(p.addedMembers||[]),...added])];}else{target='local_group_'+Date.now().toString(36);S().wechatGroups||={};S().wechatGroups[target]={id:target,name:[name(id),...added.map(name)].join('、').slice(0,40),members:['self',id,...added],owner:'self'};}S().chatMessages[target]||=[];S().chatMessages[target].push({id:'members_'+Date.now(),type:'system',text:'你邀请了'+added.map(name).join('、')+'加入群聊'});save();selected.clear();go('room',{id:target});return true;}
   case'wx-expand-members':expandedMembers=true;ctx.render();return true;
   case'wx-member':go('chat-member',{id,member:t.dataset.member});return true;
   case'wx-member-chat':go('room',{id:t.dataset.member});return true;
   case'wx-report':reportReason='';go('chat-report',{id});return true;
   case'wx-report-reason':reportReason=t.dataset.reason;ctx.render();return true;
   case'wx-report-submit':if(reportReason){S().wechatFeedback||=[];S().wechatFeedback.push({room:id,reason:reportReason,time:Date.now()});save();toast('反馈已保存在本机');go('chat-info',{id},true);}return true;
   case'wx-leave':modal('phone-actions',{title:'退出群聊',note:'退出后将不再接收此群的新消息，已有记录会保留。',ios:true,items:[{action:'wx-leave-confirm',label:'退出群聊',danger:true},{action:'modal-close',label:'取消'}]});return true;
   case'wx-leave-confirm':ctx.cancelReplies(id);p.left=true;save();ctx.closeModal();go('room',{id},true);return true;
   case'wx-rejoin':p.left=false;save();ctx.render();return true;
   case'wx-settings':go('wechat-settings');return true;
   case'wx-settings-back':go('settings',{},true);return true;
   case'wx-reply-config':go('wechat-settings',{id:t.dataset.room},true);ctx.replySettings();return true;
   case'wx-saved-groups':go('saved-groups');return true;
   case'wx-open-group':go('room',{id:t.dataset.room});return true;
   case'wx-contacts-back':go('wechat',{},true);return true;
   default:return false;
  }
 }
 function input(el){if(el.id==='wx-history-input'){search=el.value;document.getElementById('wx-history-results').innerHTML=historyResults();return true;}if(el.id==='wx-detail-editor'){editDraft=el.value;return true;}if(el.id==='wx-invite-search'){document.querySelectorAll('.wx-invite-person').forEach(b=>b.hidden=!b.textContent.toLowerCase().includes(el.value.trim().toLowerCase()));return true;}return false;}
 return {prefs,group,groups,isGroup,name,muted,pinned,members,count,render,action,input,colors};
}};
