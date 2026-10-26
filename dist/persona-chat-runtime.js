/* Independent offline queues. No message listener, model endpoint, or payment dependency. */
window.PersonaChatRuntime={create(ctx){
 'use strict';
 const {getState:S,getRoute,save,renderBubble,refreshList,esc}=ctx,E=window.PersonaDialogue,C=window.PhoneCore;
 const timers=new Map();let serial=0;
 const supports=id=>C.personaIds.includes(id);
 const room=id=>S().personaV2.rooms[id];
 const active=id=>getRoute().app==='room'&&getRoute().id===id;
 const enabled=id=>supports(id)&&room(id).autoReply;
 const pending=id=>enabled(id)&&room(id).pending?.ids?.length>0;
 function removeTyping(id){if(active(id))document.querySelector(`.wx-typing-message[data-persona-room="${id}"]`)?.remove();}
 function stop(id){clearTimeout(timers.get(id));timers.delete(id);}
 function showReply(id,reply){
  if(active(id)){
   const scroll=document.querySelector('.wx-chat-scroll'),bottom=document.querySelector('#wx-chat-bottom');
   if(scroll?.dataset.roomId===id){const follow=scroll.scrollHeight-scrollTop(scroll)-scroll.clientHeight<150;removeTyping(id);if(bottom)bottom.insertAdjacentHTML('beforebegin',renderBubble(reply,id));if(follow)scroll.scrollTop=scroll.scrollHeight;}
  }refreshList();
 }
 const scrollTop=e=>e.scrollTop||0;
 function complete(id,jobId){
  const r=room(id),job=r.pending;if(!enabled(id)||!job||job.jobId!==jobId)return;
  const history=S().chatMessages[id]||[],answered=new Set(history.filter(m=>m.autoReply).flatMap(m=>Array.isArray(m.replyTo)?m.replyTo:[]));
  const ids=job.ids.filter(source=>!answered.has(source)&&history.some(m=>m.id===source&&m.type==='text'&&m.from==='self'));
  if(!ids.length){r.pending=null;save();removeTyping(id);return;}
  const inputs=ids.map(source=>history.find(m=>m.id===source).text);
  const output=E.createReply({roomId:id,message:inputs,memory:r,now:Date.now()});
  if(!enabled(id)||room(id).pending?.jobId!==jobId)return;
  const reply={id:'persona_'+id+'_'+Date.now()+'_'+serial++,type:'text',from:'other',text:output.text,time:new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()),autoReply:true,replyTo:ids,replyOrigin:'local-persona',sceneMode:'fictional_fan_scene'};
  history.push(reply);S().personaV2.rooms[id]={...output.memory,pending:null,autoReply:!output.pause};
  if(!active(id))S().chatReadRooms=S().chatReadRooms.filter(x=>x!==id);
  save();showReply(id,reply);ctx.onIncoming?.(id,reply);
 }
 function schedule(id,delay){stop(id);const job=room(id).pending;if(job)timers.set(id,setTimeout(()=>{timers.delete(id);complete(id,job.jobId);},delay));}
 function enqueue(id,message){
  if(!enabled(id)||message.type!=='text'||message.from!=='self')return;
  const history=S().chatMessages[id]||[];if(history.some(m=>m.autoReply&&m.replyTo?.includes(message.id)))return;
  const old=room(id).pending?.ids||[];room(id).pending={ids:[...new Set([...old,message.id])].slice(-30),jobId:id+'_'+Date.now()+'_'+serial++,createdAt:Date.now()};save();
  schedule(id,Math.min(1800,850+message.text.length*14));
 }
 function cancel(id){stop(id);room(id).pending=null;removeTyping(id);}
 function toggle(id){cancel(id);room(id).autoReply=!room(id).autoReply;save();return enabled(id);}
 function clearMemory(id){cancel(id);const old=room(id);S().personaV2.rooms[id]={...C.personaRoom(id),autoReply:old.autoReply,memoryAllowed:old.memoryAllowed,flirtAllowed:old.flirtAllowed};save();}
 function toggleMemory(id){const on=!room(id).memoryAllowed;clearMemory(id);room(id).memoryAllowed=on;save();return on;}
 function clearChat(id){clearMemory(id);S().chatMessages[id]=[];delete S().chatDrafts[id];save();refreshList();}
 function typingMarkup(id,avatar,name){return pending(id)?`<div class="wx-message incoming wx-typing-message" data-persona-room="${id}" role="status" aria-label="${esc(name)}正在输入">${avatar}<div class="wx-text-bubble wx-typing-dots"><i></i><i></i><i></i></div></div>`:'';}
 const mood=id=>({neutral:'自在',warm:'放松',playful:'轻松',hurt:'有些介意',guarded:'想留点空间'})[room(id).mood];
 setTimeout(()=>{for(const id of C.personaIds)if(pending(id))schedule(id,750);},0);
 return {cancel,supports,enqueue,enabled,toggle,clearMemory,clearChat,toggleMemory,typingMarkup,mood,memoryEnabled:id=>room(id).memoryAllowed};
}};
