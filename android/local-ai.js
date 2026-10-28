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
 // Keep the credential editor out of the visible phone UI. This gesture exists
 // only in the APK, not in the public GitHub Pages build.
 // In Settings, tap the large page heading seven times within 4.5 seconds.
 function init(){
   const screen=document.getElementById('screen');
   if(!screen)return;
   let taps=0,firstTap=0;
   screen.addEventListener('click',event=>{
     const heading=event.target.closest?.('h2.large-title');
     const isSettingsHeading=heading?.textContent.trim()==='设置' &&
       !!screen.querySelector('button[data-action="wx-settings"]');
     if(!isSettingsHeading){taps=0;firstTap=0;return;}
     const now=Date.now();
     if(!firstTap||now-firstTap>4500){taps=0;firstTap=now;}
     if(++taps===7){
       taps=0;firstTap=0;
       window.AndroidAI.openSettings();
     }
   },true);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
 else init();
})();
