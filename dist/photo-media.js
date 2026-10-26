/* Size images for their display role, with original-file recovery on failed requests. */
(function(root){
 'use strict';
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function create(variants={},embedded={}){
  const original=asset=>typeof asset==='string'?asset:asset?.path||'';
  const local=path=>embedded[path]||path;
  function src(asset,size='thumb'){const path=original(asset);return local(variants[path]?.[size]?.path||path);}
  function attrs(asset,size='thumb',{lazy=true}={}){const path=original(asset),variant=variants[path]?.[size],dimensions=variant||asset;return `src="${escape(src(asset,size))}" data-fallback="${escape(local(path))}" decoding="async"${lazy?' loading="lazy"':''}${dimensions?.width&&dimensions?.height?` width="${dimensions.width}" height="${dimensions.height}"`:''}`;}
  return {src,attrs,original:asset=>local(original(asset))};
 }
 if(typeof module!=='undefined')module.exports={create};
 else{
  root.PhotoMedia=create(root.PHOTO_VARIANTS,root.PHONE_EMBEDDED_ASSETS);
  document.addEventListener('error',event=>{const img=event.target;if(img.tagName!=='IMG'||!img.dataset.fallback||img.dataset.fallbackTried||img.getAttribute('src')===img.dataset.fallback)return;img.dataset.fallbackTried='true';img.src=img.dataset.fallback;event.stopImmediatePropagation();},true);
 }
})(typeof window==='undefined'?globalThis:window);
