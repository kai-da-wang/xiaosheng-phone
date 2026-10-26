/* Android-only plugin injected into the APK's bundled website, never deployed to GitHub Pages.
   Keys remain in Android Keystore-backed encrypted local preferences. */
(function(){
 'use strict';
 if(!window.AndroidAI)return;
 const endpoint='https://local-ai.xiaosheng.invalid';
 const apiFetch=window.fetch.bind(window);
 let sequence=0;
 const pending=new Map();
 window.__localAIDeliver=function(id,result){
   const p=pending.get(String(id));if(!p)return;
   pending.delete(String(id));
   p.resolve({ok:result.status>=200&&result.status<300,status:result.status,
     json:async()=>result.payload});
 };
 window.GIRLS_AI_API=window.AndroidAI.hasAnyKey()?endpoint:'';
 window.fetch=function(url,options){
   const path=typeof url==='string'?url:url?.url||'';
   if(typeof path==='string'&&path.startsWith(endpoint+'/api/')){
     return new Promise((resolve,reject)=>{
       const id='native-'+Date.now()+'-'+(++sequence);
       pending.set(id,{resolve,reject});
       try{
         window.AndroidAI.request(id,path.endsWith('/api/tts')?'tts':'chat',options?.body||'{}');
       }catch(err){pending.delete(id);reject(err);}
     });
   }
   return apiFetch(url,options);
 };
 // Keep all AI controls inside the simulated phone's Settings app.
 // Never mount a floating control over the lock screen, games or conversations.
 function mountSettingsRow(){
  const screen=document.getElementById('screen');
  const neighbor=screen?.querySelector('button[data-action="wx-settings"]');
  if(!neighbor||screen.querySelector('#local-ai-settings'))return;
  const button=document.createElement('button');
  button.id='local-ai-settings';
  button.type='button';
  button.className='list-row';
  button.setAttribute('aria-label','本机 AI 实验室：设置 DeepSeek 和阿里云百炼');
  const label=document.createElement('span');
  label.className='row-label';
  label.textContent='AI 实验室';
  const hint=document.createElement('small');
  hint.textContent=window.AndroidAI.hasAnyKey()?'本机 AI 已配置 · DeepSeek / 阿里云':'DeepSeek 聊天与阿里云语音 · 仅此设备';
  label.appendChild(hint);
  const chevron=document.createElement('span');
  chevron.setAttribute('aria-hidden','true');
  chevron.textContent='›';
  chevron.style.cssText='margin-left:auto;color:#a0a5a9;font-size:23px;line-height:1';
  button.append(label,chevron);
  button.addEventListener('click',event=>{
   event.preventDefault();
   event.stopPropagation();
   window.AndroidAI.openSettings();
  });
  neighbor.insertAdjacentElement('afterend',button);
 }
 function init(){
  const screen=document.getElementById('screen');
  if(!screen)return;
  mountSettingsRow();
  // The simulator recreates the Settings DOM whenever a screen changes.
  const observer=new MutationObserver(()=>mountSettingsRow());
  observer.observe(screen,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
