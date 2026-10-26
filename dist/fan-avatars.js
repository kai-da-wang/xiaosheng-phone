/* Xiaosheng Phone · fictional WeChat fan-group avatars, Chinese social-avatar mix v3.
   Load after phone-life.js; no changes to stored chats or membership. */
(function(root){
 'use strict';
 const life=root.PhoneLife;
 if(!life||!Array.isArray(life.members))return;
 const photos=Object.create(null);
 const photo=id=>'https://images.unsplash.com/'+id+'?auto=format&fit=crop&w=160&h=160&q=74';
 const portrait=id=>'https://unsplash.com/photos/'+id+'/download?force=true&w=160&h=160&fit=crop';
 const svg=s=>'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(s);
 const xml='xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"';
 const faces={
  youzi:'Ciu8udXTW7g',soda:'X7ba47Gmi7Y',peach:'zysyGJX3HDI',xiaoqi:'PXtsSfKzQ5o',
  shiliu:'_6274ybW9Gg',xingle:'vl-snATnMqM',yoyo:'yS5BDBQRHwM',ruru:'95KM3rX2ltk',
  acheng:'tj9kuJFCp3A',seven:'jctnmeVjmUk',xiaoyu:'wda_6NbD_VU',nannan:'-3CEGpb7zZI',
  chengzi:'vo687EZJW6E',feifei:'lVu6PS61tes',sisi:'FJVSWmr8wHQ',shanshan:'lh2P4dSOgtc',
  water:'C41JEExGq74',yichen:'WFahqksH0jA',daxiong:'-Ggcu9Hr8fA',
  weiyu:'tcWcwiJbfv4',ming:'-PpOcveNj5w'
 };
 const pets={
  luckycat:'photo-1564750929852-b2a3cbc6b0a3',momo:'photo-1514888286974-6c03e2ca1dba',
  yufan:'photo-1573865526739-10659fec78a5',ee:'photo-1495360010541-f48722b34f7d',
  shiro:'photo-1627919408782-6a7d5f3d7a91',lulu:'photo-1507146426996-ef05306b995a',
  pudding:'photo-1668314772050-098a66f82d83',cola:'photo-1749291200523-c929a1756b68',
  ahwang:'photo-1552053831-71594a27632d',liang:'photo-1574158622682-e40e69881006'
 };
 const scenery={
  wind:'photo-1470770841072-f978cf4d019e',cloud:'photo-1500530855697-b586d89ba3ee',
  deer:'photo-1469474968028-56623f02e42e',xinghe:'photo-1439066615861-d1af74d74000',
  shushu:'photo-1500534314209-a25ddb2bd429',guang:'photo-1490750967868-88aa4486c946',
  wait:'photo-1470252649378-9c29740c9fa8',xingxing:'photo-1483985988355-763728e1935b'
 };
 function cartoon(kind,bg,accent){
  const shapes={
   rice:'<path d="M39 51 56 23 67 54 88 24 94 56" fill="#e6ded1" stroke="#ab9a9a" stroke-width="4"/>',
   honey:'<path d="M51 30Q38 0 64 16Q89 0 77 30" stroke="#ad8fce" stroke-width="9" fill="none" stroke-linecap="round"/>',
   tangyuan:'<path d="M23 45q40-45 82 0" fill="none" stroke="#98caa3" stroke-width="11"/>',
   xiuxiu:'<path d="M87 5 52 49 73 45 40 108 91 56 68 57Z" fill="#f3df79" stroke="#c7a76a" stroke-width="3"/>',
   nono:'<circle cx="96" cy="27" r="14" fill="none" stroke="#fff" stroke-width="4"/><circle cx="105" cy="55" r="7" fill="none" stroke="#fff" stroke-width="3"/>',
   dandan:'<path d="M26 46q38-51 76 0" fill="none" stroke="#c59052" stroke-width="11"/>',
   yumi:'<path d="M28 48h72l-9 70H37Z" fill="#c19b82" opacity=".32"/><path d="M64 0 78 48" stroke="#b58a79" stroke-width="6"/>',
   jiujiu:'<path d="M21 43q5-35 43-28 38-6 43 28" fill="#86b7d1" opacity=".55"/><path d="M55 80h18l-9 8Z" fill="#e7aa60"/>'
  };
  return svg('<svg '+xml+'><rect width="128" height="128" fill="'+bg+'"/><circle cx="64" cy="70" r="43" fill="#fff6ee"/>'+
   shapes[kind]+'<circle cx="49" cy="70" r="4" fill="#473738"/><circle cx="79" cy="70" r="4" fill="#473738"/>'+
   '<ellipse cx="37" cy="84" rx="9" ry="5" fill="#efadad" opacity=".7"/><ellipse cx="91" cy="84" rx="9" ry="5" fill="#efadad" opacity=".7"/>'+
   '<path d="M37 94q27 16 54 0" fill="none" stroke="'+accent+'" stroke-width="3" stroke-linecap="round"/></svg>');
 }
 const cute={
  rice:['#f5e8ce','#f3b4b4'],honey:['#f3d8e8','#b892e8'],
  tangyuan:['#dbeadf','#96c5a8'],xiuxiu:['#e9e0f6','#b6a0de'],
  nono:['#daebf3','#94b8d4'],dandan:['#faebd4','#d7a66e'],
  yumi:['#e3d1be','#b58a79'],jiujiu:['#d8ebf4','#86b7d1']
 };
 const memes={
  nightowl:['还没','睡呢','#131d2a','#f2e7ca'],
  jelly:['别管','我啦','#f1d3ed','#72477b'],
  aa:['早睡','失败','#f8efdd','#5d5142'],
  xiaolin:['人麻','了','#e5f1ec','#496659'],
  sugar:['开摆','😎','#f6ddb9','#a75643']
 };
 function meme(a,b,bg,ink){
  const escape=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  return svg('<svg '+xml+'><rect width="128" height="128" fill="'+bg+'"/><rect x="9" y="9" width="110" height="110" rx="13" fill="none" stroke="'+ink+'" stroke-width="2" stroke-opacity=".18"/>'+
   '<text x="64" y="56" font-family="sans-serif" font-weight="800" font-size="31" text-anchor="middle" fill="'+ink+'">'+escape(a)+'</text>'+
   '<text x="64" y="93" font-family="sans-serif" font-weight="900" font-size="33" text-anchor="middle" fill="'+ink+'">'+escape(b)+'</text></svg>');
 }
 for(const [id,image] of Object.entries(faces))photos[id]=portrait(image);
 for(const [id,image] of Object.entries(pets))photos[id]=photo(image);
 for(const [id,image] of Object.entries(scenery))photos[id]=photo(image);
 for(const [id,palette] of Object.entries(cute))photos[id]=cartoon(id,...palette);
 for(const [id,params] of Object.entries(memes))photos[id]=meme(...params);
 for(const member of life.members){if(photos[member.id])member.avatar=photos[member.id];}
 root.XiaoshengFanAvatars={count:life.members.filter(m=>!!photos[m.id]).length,source:'weixin-aesthetic-v3',pictures:photos};
})(typeof window==='undefined'?globalThis:window);
