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
 function mount(){
  if(document.querySelector('#local-ai-settings'))return;
  const b=document.createElement('button');
  b.id='local-ai-settings';b.type='button';b.textContent='⚙ AI设置';
  b.setAttribute('aria-label','打开 DeepSeek 和阿里云本地密钥设置');
  Object.assign(b.style,{position:'fixed',bottom:'85px',left:'9px',zIndex:'2147483644',
    background:'rgba(18,37,42,.85)',color:'#fff',border:'1px solid #ffffff55',borderRadius:'20px',
    fontSize:'12px',padding:'7px 10px',boxShadow:'0 2px 7px #0004'});
  b.onclick=()=>window.AndroidAI.openSettings();
  document.body.appendChild(b);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
 else mount();
})();
