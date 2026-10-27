/* Debounced local replies, persistence, and an optional owner-configured HTTPS model endpoint. */
window.WangChatRuntime={create(ctx){
 'use strict';
 const {getState:S,getRoute,wang,save,renderBubble,refreshList}=ctx,engine=window.WangDialogue;
 let timer=null,request=null,serial=0;
 const time=()=>new Intl.DateTimeFormat('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
 const activeRoom=()=>!document.hidden&&getRoute().app==='room'&&getRoute().id===wang;
 const supportedMessage=m=>m.from==='self'&&['text','photo','location'].includes(m.type);
 const messageText=m=>m.type==='photo'?'给你发了张照片':m.type==='location'?'给你发了个位置：'+String(m.place||'地点').slice(0,80):m.text;
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
  const history=S().chatMessages[wang]||[],ids=job.ids.filter(id=>history.some(m=>m.id===id&&supportedMessage(m)));
  if(!ids.length){S().wangPending=null;save();removeTyping();return;}
  if(history.some(m=>m.autoReply&&ids.every(id=>m.replyTo?.includes(id)))){S().wangPending=null;save();removeTyping();return;}
  const inputs=history.filter(m=>ids.includes(m.id)).map(m=>({...m,text:messageText(m)}));
  const critical=inputs.find(m=>/(?:自杀|自残|不想活|想死|结束生命|胸痛|呼吸困难|昏倒|吃了很多药)/.test(m.text))||inputs.find(m=>/(?:不要|别|停止|暂停).{0,4}(?:回复|说话|聊天)|先安静/.test(m.text))||inputs.find(m=>/(?:别撩|不要撩|不想谈恋爱|别叫我宝宝|不要叫我宝宝)/.test(m.text))||inputs.find(m=>m.type==='text'&&engine.forgetKeys(m.text).length);
  const prompt=[...(critical?[critical.text.slice(0,300)]:[]),...inputs.slice(-3).map(m=>m.text.slice(-220))].join('。');
  const volunteered=inputs.filter(m=>m.type==='text').map(m=>m.text);
  const memory=engine.rememberExplicitFacts(volunteered,S().wangMemory||{});
  const last=inputs.at(-1),replyInput=critical?critical.text:last?.type==='text'&&engine.explicitFact(last.text)?last.text:prompt;
  const local=engine.createReply(replyInput,history,memory);
  let text=local.text,origin='local';
  const url=endpoint();
  if(url&&inputs.every(m=>m.type==='text')&&!['safety','pause','identity','boundary','forget'].includes(local.topic)){
   const controller=new AbortController();request=controller;const deadline=setTimeout(()=>controller.abort(),9000);
   try{
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:engine.modelHistory(history)}),signal:controller.signal,credentials:'omit'});
    const body=await res.json();
    if(!res.ok||typeof body.reply!=='string'||!body.reply.trim()||body.reply.length>1000)throw Error('Invalid reply');
    text=body.reply.trim();origin='model';
   }catch{origin='local-fallback';}finally{clearTimeout(deadline);if(request===controller)request=null;}
  }
  if(!enabled()||S().wangPending?.jobId!==jobId)return;
  const transfer=ctx.transferOffer?.(wang,inputs,local);if(transfer){text=transfer.reply;origin='local-transfer';}
  const reply={id:'wang_'+Date.now()+'_'+serial++,type:'text',createdAt:Date.now(),from:'other',text,time:time(),autoReply:true,replyTo:ids,replyOrigin:origin};
  S().chatMessages[wang].push(reply);S().wangMemory=local.memory;S().wangPending=null;S().wangLastMode=origin;
  if(local.pause)S().wangAutoReply=false;
  if(!activeRoom()){S().chatReadRooms=S().chatReadRooms.filter(id=>id!==wang);ctx.markUnread?.(wang,reply);}
  save();updateVisible(reply);ctx.onIncoming?.(wang,reply);ctx.sendTransfer?.(wang,transfer);
 }
 function schedule(delay){clearTimeout(timer);const job=S().wangPending;if(job)timer=setTimeout(()=>{timer=null;complete(job.jobId);},delay);}
 function enqueue(message){
  if(!enabled()||!supportedMessage(message))return;
  stop();const previous=S().wangPending?.ids||[];
  S().wangPending={ids:[...new Set([...previous,message.id])],jobId:Date.now()+'_'+serial++,createdAt:Date.now()};save();
  schedule(Math.min(1800,1050+messageText(message).length*12));
 }
 function toggle(){stop();S().wangAutoReply=!enabled();if(!enabled())S().wangPending=null;save();removeTyping();return enabled();}
 function mode(){return S().wangLastMode==='model'?'AI对话':'情景对话';}
 setTimeout(()=>{if(pending())schedule(600);},0);
 return {enqueue,typingMarkup,toggle,enabled,mode,cancel(){stop();S().wangPending=null;removeTyping();}};
}};
