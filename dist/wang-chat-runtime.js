/* Debounced local replies, persistence, and an optional owner-configured HTTPS model endpoint. */
window.WangChatRuntime={create(ctx){
 'use strict';
 const {getState:S,getRoute,wang,save,renderBubble,refreshList}=ctx,engine=window.WangDialogue;
 let timer=null,request=null,serial=0;
 const time=()=>new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
 const activeRoom=()=>getRoute().app==='room'&&getRoute().id===wang;
 const enabled=()=>S().wangAutoReply!==false;
 function pending(){return enabled()&&Array.isArray(S().wangPending?.ids)&&S().wangPending.ids.length>0;}
 function typingMarkup(avatar){return pending()?`<div class="wx-message incoming wx-typing-message" role="status" aria-label="小王正在输入">${avatar}<div class="wx-text-bubble wx-typing-dots"><i></i><i></i><i></i></div></div>`:'';}
 function removeTyping(){if(activeRoom())document.querySelector('.wx-typing-message')?.remove();}
 function stop(){clearTimeout(timer);timer=null;request?.abort();request=null;}
 function updateVisible(reply){
  if(activeRoom()){
   const scroll=document.querySelector('.wx-chat-scroll'),bottom=document.querySelector('#wx-chat-bottom');
   const follow=scroll&&scroll.scrollHeight-scroll.scrollTop-scroll.clientHeight<150;
   removeTyping();
   if(bottom&&reply)bottom.insertAdjacentHTML('beforebegin',renderBubble(reply));
   if(follow&&scroll)scroll.scrollTop=scroll.scrollHeight;
  }
  refreshList();
 }
 function endpoint(){const value=window.WANG_CHAT_ENDPOINT;if(typeof value!=='string'||!value)return null;try{const url=new URL(value,location.href);return url.protocol==='https:'?url.href:null;}catch{return null;}}
 async function complete(jobId){
  const job=S().wangPending;if(!enabled()||!job||job.jobId!==jobId)return;
  const history=S().chatMessages[wang]||[],ids=job.ids.filter(id=>history.some(m=>m.id===id&&m.from==='self'&&m.type==='text'));
  if(!ids.length){S().wangPending=null;save();removeTyping();return;}
  if(history.some(m=>m.autoReply&&ids.every(id=>m.replyTo?.includes(id)))){S().wangPending=null;save();removeTyping();return;}
  const inputs=history.filter(m=>ids.includes(m.id));
  const local=engine.createReply(inputs.slice(-3).map(m=>m.text.slice(-300)).join('。'),history,S().wangMemory||{});
  let text=local.text,origin='local';
  const url=endpoint();
  if(url&&!['safety','pause','identity'].includes(local.topic)){
   const controller=new AbortController();request=controller;const deadline=setTimeout(()=>controller.abort(),9000);
   try{
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:engine.modelHistory(history)}),signal:controller.signal,credentials:'omit'});
    const body=await res.json();
    if(!res.ok||typeof body.reply!=='string'||!body.reply.trim()||body.reply.length>1000)throw Error('Invalid reply');
    text=body.reply.trim();origin='model';
   }catch{origin='local-fallback';}finally{clearTimeout(deadline);if(request===controller)request=null;}
  }
  if(!enabled()||S().wangPending?.jobId!==jobId)return;
  const reply={id:'wang_'+Date.now()+'_'+serial++,type:'text',createdAt:Date.now(),from:'other',text,time:time(),autoReply:true,replyTo:ids,replyOrigin:origin};
  S().chatMessages[wang].push(reply);S().wangMemory=local.memory;S().wangPending=null;S().wangLastMode=origin;
  if(local.pause)S().wangAutoReply=false;
  if(!activeRoom())S().chatReadRooms=S().chatReadRooms.filter(id=>id!==wang);
  save();updateVisible(reply);ctx.onIncoming?.(wang,reply);
 }
 function schedule(delay){clearTimeout(timer);const job=S().wangPending;if(job)timer=setTimeout(()=>{timer=null;complete(job.jobId);},delay);}
 function enqueue(message){
  if(!enabled())return;
  stop();const previous=S().wangPending?.ids||[];
  S().wangPending={ids:[...new Set([...previous,message.id])],jobId:Date.now()+'_'+serial++,createdAt:Date.now()};save();
  schedule(Math.min(1800,1050+message.text.length*12));
 }
 function toggle(){stop();S().wangAutoReply=!enabled();if(!enabled())S().wangPending=null;save();removeTyping();return enabled();}
 function mode(){return S().wangLastMode==='model'?'AI对话':'情景对话';}
 setTimeout(()=>{if(pending())schedule(600);},0);
 return {enqueue,typingMarkup,toggle,enabled,mode,cancel(){stop();S().wangPending=null;removeTyping();}};
}};
