/** Optional model gateway. Not enabled in the public static build without owner configuration. */
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {persona}=require('../dist/wang-dialogue.js');
const origins=new Set((process.env.ALLOWED_ORIGINS||'https://kai-da-wang.github.io,https://xiaosheng-phone-kai.imjusttrying341.chatgpt.site').split(',').map(x=>x.trim()));
const windows=new Map();
function limited(ip){const now=Date.now(),w=windows.get(ip);if(w&&now-w.start<60000){w.count++;return w.count>12;}if(windows.size>5000)windows.clear();windows.set(ip,{start:now,count:1});return false;}
function answer(res,status,value,origin){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})});res.end(JSON.stringify(value));}
const server=createServer(async(req,res)=>{
 const origin=req.headers.origin||'';
 if(req.url==='/health'&&req.method==='GET')return answer(res,200,{status:'ok',configured:!!(process.env.LLM_API_KEY&&process.env.LLM_CHAT_URL&&process.env.LLM_MODEL)},origin);
 if(req.url!=='/chat')return answer(res,404,{error:'not_found'},origin);
 if(!origins.has(origin))return answer(res,403,{error:'origin_not_allowed'},origin);
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'});return res.end();}
 if(req.method!=='POST')return answer(res,405,{error:'method_not_allowed'},origin);
 if(limited(req.socket.remoteAddress||'unknown'))return answer(res,429,{error:'rate_limited'},origin);
 if(!process.env.LLM_API_KEY||!process.env.LLM_CHAT_URL||!process.env.LLM_MODEL)return answer(res,503,{error:'model_not_configured'},origin);
 try{
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return answer(res,415,{error:'json_required'},origin);
  let body='';for await(const chunk of req){body+=chunk.toString();if(Buffer.byteLength(body)>24000){answer(res,413,{error:'request_too_large'},origin);return;}}
  const parsed=JSON.parse(body),messages=parsed.messages;
  if(!Array.isArray(messages)||!messages.length||messages.length>16||messages.some(m=>!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>1000)||messages.at(-1).role!=='user')return answer(res,400,{error:'invalid_messages'},origin);
  const url=new URL(process.env.LLM_CHAT_URL);if(url.protocol!=='https:')return answer(res,503,{error:'invalid_model_configuration'},origin);
  const upstream=await fetch(url,{method:'POST',headers:{'Authorization':'Bearer '+process.env.LLM_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.LLM_MODEL,messages:[{role:'system',content:persona},...messages],temperature:.8,max_tokens:180,stream:false}),signal:AbortSignal.timeout(8000)});
  if(!upstream.ok)return answer(res,502,{error:'model_unavailable'},origin);
  const result=await upstream.json(),reply=result?.choices?.[0]?.message?.content;
  if(typeof reply!=='string'||!reply.trim()||reply.length>1000)return answer(res,502,{error:'invalid_model_reply'},origin);
  answer(res,200,{reply:reply.trim()},origin);
 }catch{answer(res,502,{error:'reply_unavailable'},origin);}
});
server.listen(Number(process.env.PORT)||8787);
