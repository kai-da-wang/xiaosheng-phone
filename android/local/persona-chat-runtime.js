/* Android-only persona queues and optional, user-configured model endpoint. */
window.PersonaChatRuntime={create(ctx){
 'use strict';
 const {getState:S,getRoute,save,renderBubble,refreshList,esc}=ctx,E=window.PersonaDialogue,C=window.PhoneCore;
 const timers=new Map();let serial=0;
 const supports=id=>C.personaIds.includes(id);
 const room=id=>S().personaV2.rooms[id];
 const active=id=>!document.hidden&&getRoute().app==='room'&&getRoute().id===id;
 const supportedMessage=m=>m.from==='self'&&['text','photo','location'].includes(m.type);
 const messageText=m=>m.type==='photo'?'给你发了张照片':m.type==='location'?'给你发了个位置：'+String(m.place||'地点').slice(0,80):m.text;
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
 function aiEndpoint(){
  const v=window.GIRLS_AI_API;if(typeof v!=='string'||!v.trim())return '';
  try{const u=new URL(v);return u.protocol==='https:'?(u.href.endsWith('/')?u.href.slice(0,-1):u.href):'';}catch{return '';}
 }
 function contextStart(history,currentIds){
  let cut=-1;const forgetIds=new Set();
  for(let i=0;i<history.length;i++){
   const m=history[i];
   if(m.personaContextCut===true){cut=i;forgetIds.clear();}
   if(m.from==='self'&&m.type==='text'&&E.isForgetRequest?.(m.text)){cut=i;forgetIds.add(m.id);}
   if(m.autoReply&&Array.isArray(m.replyTo)&&m.replyTo.some(id=>forgetIds.has(id))){cut=i;for(const id of m.replyTo)forgetIds.delete(id);}
  }
  // Old saves can contain a cancelled forget burst with no reply.  In that
  // case only the currently requested batch can be safely sent as context.
  if(forgetIds.size){const current=history.findIndex(m=>currentIds.has(m.id));if(current>=0)cut=Math.max(cut,current-1);}
  return cut+1;
 }
 async function cloudReply(id,history,ids){
  const endpoint=aiEndpoint();if(!endpoint)return null;
  const currentIds=new Set(ids);
  const recent=history.slice(contextStart(history,currentIds)).filter(m=>m.type==='text'&&(m.from==='self'||m.autoReply)&&
    (room(id).memoryAllowed||m.from==='self'&&currentIds.has(m.id)))
   .slice(-12).map(m=>({role:m.from==='self'?'user':'assistant',content:String(m.text||'').slice(0,400)}));
  if(!recent.length||recent.at(-1).role!=='user')return null;
  const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),10500);
  try{
   const res=await fetch(endpoint+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({roomId:id,messages:recent}),credentials:'omit',signal:abort.signal});
   if(!res.ok)return null;
   const json=await res.json();
   return typeof json.reply==='string'&&json.reply.trim()&&json.reply.length<=220?json.reply.trim():null;
  }catch{return null;}finally{clearTimeout(timeout);}
 }
 async function complete(id,jobId){
  const r=room(id),job=r.pending;if(!enabled(id)||!job||job.jobId!==jobId)return;
  const history=S().chatMessages[id]||[],answered=new Set(history.filter(m=>m.autoReply).flatMap(m=>Array.isArray(m.replyTo)?m.replyTo:[]));
  const ids=job.ids.filter(source=>!answered.has(source)&&history.some(m=>m.id===source&&supportedMessage(m)));
  if(!ids.length){r.pending=null;save();removeTyping(id);return;}
  const inputs=ids.map(source=>messageText(history.find(m=>m.id===source)));
  const output=E.createReply({roomId:id,message:inputs,memory:r,now:Date.now()});
  // Sensitive actions, explicit boundaries and pause are always answered locally.
  const localOnly=['safety','emergency','identity','privacy','pause','forget','boundary','money','insult'].includes(output.intent);
  const media=ids.some(source=>history.find(m=>m.id===source)?.type!=='text');
  const remote=(media||localOnly||!aiEndpoint())?null:await cloudReply(id,history,ids);
  if(!enabled(id)||room(id).pending?.jobId!==jobId)return;
  const transfer=ctx.transferOffer?.(id,inputs,output);
  const forgot=ids.some(source=>{const m=history.find(x=>x.id===source);return m?.type==='text'&&E.isForgetRequest?.(m.text)});
  const reply={id:'persona_'+id+'_'+Date.now()+'_'+serial++,type:'text',createdAt:Date.now(),from:'other',text:transfer?.reply||remote||output.text,time:new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()),autoReply:true,replyTo:ids,replyOrigin:remote?'deepseek-gateway':'local-persona',sceneMode:'fictional_fan_scene',...(forgot?{personaContextCut:true}:{})};
  history.push(reply);S().personaV2.rooms[id]={...output.memory,pending:null,autoReply:!output.pause};
  if(!active(id)){S().chatReadRooms=S().chatReadRooms.filter(x=>x!==id);ctx.markUnread?.(id,reply);}
  save();showReply(id,reply);ctx.onIncoming?.(id,reply);ctx.sendTransfer?.(id,transfer);
 }
 function schedule(id,delay){stop(id);const job=room(id).pending;if(job)timers.set(id,setTimeout(()=>{timers.delete(id);complete(id,job.jobId);},delay));}
 function enqueue(id,message){
  if(!enabled(id)||!supportedMessage(message))return;
  const history=S().chatMessages[id]||[];if(history.some(m=>m.autoReply&&m.replyTo?.includes(message.id)))return;
  const old=room(id).pending?.ids||[];room(id).pending={ids:[...new Set([...old,message.id])].slice(-30),jobId:id+'_'+Date.now()+'_'+serial++,createdAt:Date.now()};save();
  schedule(id,Math.min(1800,850+messageText(message).length*14));
 }
 function cancel(id){stop(id);room(id).pending=null;removeTyping(id);}
 function toggle(id){cancel(id);room(id).autoReply=!room(id).autoReply;save();return enabled(id);}
 function clearMemory(id){cancel(id);const history=S().chatMessages[id]||[];if(history.length)history[history.length-1].personaContextCut=true;const old=room(id);S().personaV2.rooms[id]={...old,facts:C.personaRoom(id).facts,lastTopic:null,recentInputs:[],recentReplies:[],pending:null};save();}
 function toggleMemory(id){const on=!room(id).memoryAllowed;clearMemory(id);room(id).memoryAllowed=on;save();return on;}
 function clearChat(id){clearMemory(id);S().chatMessages[id]=[];delete S().chatDrafts[id];if(S().chatUnreadIds)delete S().chatUnreadIds[id];save();refreshList();}
 function typingMarkup(id,avatar,name){return pending(id)?`<div class="wx-message incoming wx-typing-message" data-persona-room="${id}" role="status" aria-label="${esc(name)}正在输入">${avatar}<div class="wx-text-bubble wx-typing-dots"><i></i><i></i><i></i></div></div>`:'';}
 const mood=id=>({neutral:'自在',warm:'放松',playful:'轻松',hurt:'有些介意',guarded:'想留点空间'})[room(id).mood];
 setTimeout(()=>{for(const id of C.personaIds)if(pending(id))schedule(id,750);},0);
 return {cancel,supports,enqueue,enabled,toggle,clearMemory,clearChat,toggleMemory,typingMarkup,mood,memoryEnabled:id=>room(id).memoryAllowed};
}};
