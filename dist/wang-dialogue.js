/* Original game persona and local conversation rules. This is not a language model. */
(function(root){
 'use strict';
 const persona='你扮演《小圣的手机》中的成年小王游戏角色，不冒充真人。用中文微信短句回复，亲近、俏皮、嘴硬但关心对方；先回应用户刚说的内容，再自然接一句。每次1—2句，通常15—65字，不写旁白、舞台动作或角色名，不替用户说话。可以聊照片、散步、大理和日常打趣。只把用户明确说过的偏好当作记忆；不编造现实人物的私事、真实行程或真实原话。用户不想调情时尊重边界。不索款、不引导付款，不声称发送真实微信或具备真人身份。遇到实际危险先认真回应安全，不用恋爱玩笑。';
 const pools={
  greeting:['来啦？刚好，给你留了个位置。今天想跟我聊什么？','在呢。先报个到，今天过得怎么样？','嗯哼，听见啦。你是来聊天，还是来逗我的？'],
  missing:['才一会儿不见就想我啦？那我也勉强承认一下，想你。','想我就直说嘛，绕这么大一圈。今天有没有好好吃饭？','收到一份想念。回你一份，不许说我回得少。'],
  love:['今天嘴怎么这么甜？行，这句话我收好了🤍','知道啦。那下次出门，手可要牵稳一点。','这句先记着，等见面了再说一遍给我听。'],
  meal:['先把饭吃好，再来跟我贫。你想吃热乎的，还是甜的？','饿了就别硬扛。火锅和面条，今天选哪个？','想吃什么？先说好，第一口我要尝尝。'],
  tired:['累了就歇一会儿，水也喝两口。我在，慢慢说。','今天辛苦啦。先把肩膀放松，别一直绷着。','先休息五分钟再忙，好不好？不用每一件事都硬撑着。'],
  study:['好好学，我先不闹你。等你做完这一小段，再来找我报到。','先把眼前这一题解决，别一下给自己压一整天的任务。卡在哪儿了？','学不动就先歇两分钟。回来只做一小段，我给你加个油。'],
  work:['先把手头最急的一件做完，别一边忙一边忘了吃饭。','今天忙得过来吗？先跟我说最让你头大的那一件。','辛苦啦。忙完记得给自己留点休息时间，我又不会跑。'],
  sleep:['好，手机先放下。晚安，明天再接着贫🤍','那今天就先聊到这儿，睡个好觉。晚安。','去睡吧，被子盖好。想说的话，明天慢慢说。'],
  morning:['早呀。第一件事，先喝点水，再认真吃早饭。','早安。今天准备做什么？我先听听你的安排。','醒啦？那今天也别空着肚子出门。'],
  sad:['我听着呢。是哪件事让你这么难受？慢慢说，不用一次讲完。','先不逗你了。你想让我陪你听一会儿，还是一起想办法？','嗯，今天确实不好受。先说最难受的那一点，我认真听。'],
  bored:['那陪我选一张照片？海边那张和雪山那张，你更喜欢哪张？','来，换我问你：明天有半天空闲，你最想做什么？','那玩个二选一，散步还是吃好吃的？先选，不许全都要。'],
  photo:['给我拍照可得认真一点。海边那张和雪山那张，你更喜欢哪张？','照片我都收好啦。你更想再看海边，还是雪山？','下次先别催我摆姿势，我还没笑好呢。你想去哪儿拍？'],
  dali:['那就把大理记在想去的地方里。古城逛逛，还是去洱海边走走？','去大理的话，我想先在洱海边慢慢走。你选才村还是双廊？','大理这题我会选：风景慢慢看，合照认真拍。你想先去古城还是湖边？'],
  meeting:['好呀。你想哪天、去哪儿？先说清楚，我才好记着。','见面可以，别只说一句就没下文。你想约在哪儿？','那你负责想地点，我负责提醒你别忘带外套。什么时候去？'],
  compliment:['行，今天这句夸得不错。奖励你下次继续夸。','你再这么说，我可就真信了。','嘴甜归嘴甜，下次拍照不许把我拍糊。'],
  apology:['听到啦。我们把刚才不舒服的地方说清楚，好不好？','先不跟你赌气。刚才那句你是怎么想的？','好，我听见了。下次别让我靠猜，你直接跟我说。'],
  thanks:['这就谢啦？那我把这句也收着。','不客气。你也记得对自己好一点。','收到。今天多照顾自己一点，就当回礼啦。'],
  laugh:['笑什么啦，分我一点，我也想听。','哎，你一笑我也想笑了。刚刚是哪句戳中你了？','行，看来今天心情还不错。接着说，我听着呢。']
 };
 const compact=s=>String(s||'').trim().replace(/\s+/g,' ');
 // Read only standalone, explicitly volunteered text messages; media labels and
 // questions are not evidence of a name or a food preference.
 function explicitFact(input){
  const value=compact(input);if(!value||/[?？]/.test(value)||/(?:吗|么)[。！!\s]*$/.test(value))return null;
  const name=value.match(/^(?:我叫|叫我|我的名字是)\s*((?!(?:什么|什麼|啥|谁))[\u4e00-\u9fffA-Za-z]{1,10})(?:[，。！!\s]|$)/);
  if(name)return {key:'name',value:name[1]};
  const food=value.match(/^(?:我(?:最)?喜欢吃|我(?:最)?爱吃)\s*((?!(?:什么|什麼|啥))[^，。！？!?]{1,14})/);
  if(food)return {key:'food',value:food[1].trim()};
  return null;
 }
 function forgetKeys(input){
  const text=compact(input);
  if(/(?:别|不要|不许|不会|没有|没|不能|无法)忘(?:记|掉)/.test(text)||/^我(?:已经|刚刚|刚|好像)?忘(?:记|掉)/.test(text))return [];
  const question=/[?？]|(?:吗|么|吧)[。！!\s]*$/.test(text),request=/^(?:(?:请(?:你)?|麻烦(?:你)?|帮我|可以|能不能|能|你能|你可以|可不可以|我想让你)\s*)?(?:忘记|忘掉|删除|清除|别记|不要记|不许记|别保存|不要保存)/.test(text);
  const stateQuestion=/(?:忘记|忘掉|删除|清除).{0,20}(?:了吗|了么|了没|没有)[？?。!！\s]*$/.test(text);
  if(question&&(!request||stateQuestion))return [];
  if(!/(?:忘记|忘掉|删除|清除|别记|不要记|不许记|别保存|不要保存)/.test(text)||!/(?:名字|昵称|偏好|喜欢吃|爱吃|食物|记忆|个人信息)/.test(text))return [];
  const keys=[];if(/名字|昵称/.test(text))keys.push('name');if(/偏好|喜欢吃|爱吃|食物/.test(text))keys.push('food');
  if(/记忆|个人信息/.test(text))keys.push('name','food','plan','place','photo');return [...new Set(keys)];
 }
 function rememberExplicitFacts(messages,old={}){
  const result={...old},forget=messages.flatMap(forgetKeys);
  // Forgetting wins over conflicting volunteered facts in the same burst.
  if(forget.length){for(const key of forget)delete result[key];result.recent=[];}
  for(const text of messages){const fact=explicitFact(text);if(fact&&fact.value&&!forget.includes(fact.key))result[fact.key]=fact.value;}
  return result;
 }
 function createReply(input,history=[],old={}){
  const text=compact(input).slice(0,1000),m={...old,turn:(Number(old.turn)||0)+1,recent:Array.isArray(old.recent)?old.recent.slice(-8):[]};
  const recent=(Array.isArray(history)?history:[]).filter(x=>x.type==='text').slice(-20);
  const select=(topic,choices,pending='')=>{const unused=choices.filter(s=>!m.recent.includes(s)),list=unused.length?unused:choices;const reply=list[(m.turn-1)%list.length];m.topic=topic;m.pending=pending;m.recent=[...m.recent,reply].slice(-8);return {text:reply,memory:m,topic};};
  const one=(topic,t,pending)=>select(topic,[t],pending);
  if(/(?:自杀|自残|不想活|想死|结束生命)/.test(text))return one('safety','我很担心你现在的安全。先远离可能伤到自己的东西，找一个能陪着你的人；眼前有危险就联系当地急救。你身边有人吗？');
  if(/(?:胸痛|呼吸困难|昏倒|吃了很多药)/.test(text))return one('safety','这件事先别在聊天里耽误，尽快找身边的人陪着你，联系当地急救或去医院。先照顾好自己。');
  if(/(?:不要|别|停止|暂停).{0,4}(?:回复|说话|聊天)|先安静/.test(text))return {...one('pause','好，我先安静一会儿。想继续时，点聊天右上角，把自动回复打开就好。'),pause:true};
  const forgotten=forgetKeys(text);if(forgotten.length){for(const key of forgotten)delete m[key];m.recent=[];return one('forget','好，刚才说的资料已经从记忆里清除，聊天记录还在。');}
  const fact=explicitFact(text);
  if(/(?:你是|你是不是|你真是|你到底是).{0,8}(?:真人|本人|真的小王|人工智能|机器人|AI)|(?:是不是|是).{0,3}程序/.test(text))return one('identity','我是这部手机里的小王游戏角色呀。现在用情景对话陪你聊天，真人的私事我可不会乱编。');
  if(fact?.key==='name'){m.name=fact.value;return one('name',`${m.name}，记住啦。那以后我就这样叫你，好不好？`);}
  if(/(?:我叫什[么麼]|我的名字|记得我的名字|还记得我叫)/.test(text))return one('name',m.name?`${m.name}呀。自己告诉我的，我有认真记着。`:'你还没正式告诉我呢。你想让我怎么叫你？',m.name?'':'name');
  if(m.pending==='name'&&/^[\u4e00-\u9fffA-Za-z]{1,6}$/.test(text)&&!/[？?]/.test(text)&&!/^(好的|好呀|不知道|随便|都可以|不说)$/.test(text)){m.name=text;return one('name',`${text}，好，记住啦。`);}
  if(fact?.key==='food'){m.food=fact.value;return one('food-memory',`${m.food}，我记住了。下次聊吃什么，可别说我没认真听。`);}
  if(/(?:记得|知道).{0,8}(?:喜欢吃|爱吃)|我(?:喜欢吃|爱吃)什[么麼]/.test(text))return one('food-memory',m.food?`你说过喜欢吃${m.food}。看，我有认真听。`:'这个你还没告诉我呢。你最喜欢吃什么？',m.food?'':'food-preference');
  if(m.pending==='food-preference'&&text.length<=14&&!/[？?]/.test(text)){m.food=text;return one('food-memory',`${text}，好，记在这次聊天的小本子上啦。`);}
  if(/(?:你(?:刚才|上次)|刚刚).{0,8}(?:说了|说的|问我|问的)|刚才聊到哪/.test(text)){const last=recent.filter(x=>x.from!=='self'&&x.autoReply).at(-1);return one('recall',last?`我刚才说的是：“${compact(last.text).slice(0,90)}”`:'刚才还没正式聊起来呢。要不从你今天过得怎么样开始？');}
  if(/(?:不喜欢你|不爱你|别撩|不要撩|不想谈恋爱|别叫我宝宝|不要叫我宝宝)/.test(text)){m.flirt=false;return one('boundary','好，那我们就轻松聊，不这样逗你了。你想聊点什么？');}
  if(m.pending==='food-choice'&&/^(?:第?一[个家种]?|第一[个家种]?|火锅|热乎的|面条|第二[个家种]?|第?二[个家种]?|甜的|甜点|都要|都可以|随便|你选)[呀吧啦呢！!。\s]*$/.test(text)){const choice=/火锅|第一|^一|热乎/.test(text)?'火锅':/第二|^二|面条/.test(text)?'面条':/甜/.test(text)?'甜点':m.food||'热乎的面条';m.plan=choice;return one('food-plan',`那就先记下${choice}。别只顾着说，饿了记得真的去吃点东西。`);}
  if(m.pending==='photo-choice'&&/海边|雪山|第一|第二|^都|你选/.test(text)){m.photo=/雪山|第二/.test(text)?'雪山':'海边';return one('photo-plan',`那就${m.photo}那张。你把照片收好，下次再给我拍一张更好看的。`);}
  if(m.pending==='place-choice'&&/古城|湖边|洱海|才村|双廊|你选/.test(text)){const place=(text.match(/古城|洱海|才村|双廊/)||[])[0]||'洱海边';m.place=place;return one('place-plan',`${place}，记下啦。先一起在地图里看看，想去的地方慢慢攒。`);}
  if(m.pending==='activity-choice'&&/散步|吃|第一|第二|都要/.test(text))return /吃|第二/.test(text)?select('meal',pools.meal,'food-choice'):one('walk','那就散步。路上别光顾着看手机，抬头看看风景。','meeting');
  if(m.pending==='meeting'&&text.length<=45&&/明天|后天|今天|周[一二三四五六日天末]|星期|[点时]|晚上|中午|门口|食堂|公园|古城|湖边/.test(text)&&!/[？?]/.test(text)){m.plan=text;return one('meeting-plan',`“${text.slice(0,35)}”，先记在聊天里啦。到时候别忘了多带件外套。`);}
  if(/晚安|睡觉|睡了|要睡|困了|做个好梦/.test(text))return select('sleep',pools.sleep);
  if(/^早[呀啊哦安好！!~～]*$|早上好|早安/.test(text))return select('morning',pools.morning,'day-plan');
  if(/(?:难过|不开心|伤心|委屈|焦虑|烦死|想哭|失落|生气|心情不好)/.test(text))return select('sad',pools.sad,'feelings');
  if(/(?:不想你|没想你|才没想你)/.test(text))return one('tease','好嘛，那先不逗你了。你今天在忙什么？');
  if(/想你|想我|想见你|想念/.test(text))return m.flirt===false?one('boundary','听见啦，我们就按你舒服的方式聊天。今天过得还好吗？'):select('missing',pools.missing);
  if(/喜欢你|爱你|爱我|亲亲|抱抱|牵手|牵着/.test(text))return m.flirt===false?one('boundary','听见啦，我们就按你舒服的方式聊天。今天过得还好吗？'):select('love',pools.love);
  if(/给你发了张照片/.test(text))return one('photo-received','照片收到啦，这是在哪儿拍的？快跟我讲讲。');
  if(/给你发了个位置/.test(text))return one('location-received','位置收到啦。你这是想约我一起去吗？');
  if(/大理|洱海|才村|双廊|苍山/.test(text))return select('dali',pools.dali,'place-choice');
  if(/(?:想吃|要吃|就吃|吃点)(火锅|面条|米饭|蛋糕|草莓|冰淇淋|麻辣烫|烧烤)/.test(text)){m.plan=RegExp.$1;return one('food-plan',`那就${m.plan}，先记下啦。饿了就去吃点，别光顾着跟我聊天。`);}
  if(/你.{0,5}吃(?:饭)?了(?:吗|没)|你吃过了吗/.test(text))return one('meal-care','有记得吃饭呀。你呢，今天别光顾着问我，也要吃饱。');
  if(/(?:吃什么|吃饭|饿了|好饿|晚饭|午饭|早饭|火锅|面条|奶茶|蛋糕)/.test(text))return select('meal',m.food?[`你不是说喜欢吃${m.food}吗？今天想吃那个，还是换点热乎的？`,...pools.meal]:pools.meal,'food-choice');
  if(/累|疲惫|没力气|忙死|加班/.test(text))return select('tired',pools.tired);
  if(/学习|考研|高数|数学|考试|背单词|作业|做题|复习/.test(text))return select('study',pools.study);
  if(/工作|上班|任务|项目/.test(text))return select('work',pools.work);
  if(/照片|拍照|自拍|合照|雪山|帽子/.test(text))return select('photo',pools.photo,'photo-choice');
  if(/见面|约会|一起去|去哪玩|出去玩|散步/.test(text))return select('meeting',pools.meeting,'meeting');
  if(/无聊|没意思|干嘛呢|干什么呢|在做什么|聊什么/.test(text))return select('bored',pools.bored,m.turn%3===1?'photo-choice':m.turn%3===2?'day-plan':'activity-choice');
  if(/好看|漂亮|可爱|好美|真美|好甜/.test(text))return select('compliment',pools.compliment);
  if(/对不起|抱歉|我错了|别生气/.test(text))return select('apology',pools.apology);
  if(/谢谢|感谢/.test(text))return select('thanks',pools.thanks);
  if(/哈哈|哈哈哈|笑死|😂|🤣/.test(text))return select('laugh',pools.laugh);
  if(/^(你好|嗨|hi|hello|在吗|小王|王王)[呀啊！!？?~～\s]*$/i.test(text))return select('greeting',pools.greeting);
  if(/^(好[的呀啊嘛吧]?|嗯[嗯呢]?|可以|行|收到|知道啦)[！!。~～\s]*$/.test(text)){if(m.topic==='sad')return one('sad-followup','嗯，我听着。你想接着说就慢慢说，不用急。');if(m.topic==='sleep')return one('sleep-followup','好，那今天先休息，晚安🤍');return select('followup',['那说好啦。今天还有什么想跟我说的？','嗯哼。换你说一件今天的小事，我听着呢。','好，我记下这一句。然后呢？']);}
  if(/怎么|为什么|是不是|能不能|[？?]$/.test(text))return select('question',['这个我不想随口乱猜。你把最想问的那一点说具体些，好不好？','等一下，让我先听明白。你是在问刚才那件事，还是另一件？','你这题问得有点突然。先给我补一句背景，我再接。']);
  return select('open',['嗯，我在听。你刚说的这件事，最让你在意的是哪一点？','然后呢？你别只说半句，把后面也讲给我听。','收到。今天这件事你是觉得开心，还是有点烦？','好，你接着说。想让我听你讲，还是陪你一起想一想？']);
 }
 function modelHistory(history=[]){
  const items=Array.isArray(history)?history:[],indices=new Map(items.map((m,i)=>[m?.id,i]));let after=-1;
  for(let i=0;i<items.length;i++){const m=items[i];if(m?.from!=='self'||m.type!=='text'||typeof m.text!=='string'||!forgetKeys(m.text).length)continue;after=Math.max(after,i);if(!m.id)continue;
   // All source messages merged into this forget response belong to the same
   // privacy boundary, including conflicting facts sent after the request.
   const reply=items.find(x=>x?.autoReply&&Array.isArray(x.replyTo)&&x.replyTo.includes(m.id));
   for(const id of reply?.replyTo||[])if(indices.has(id))after=Math.max(after,indices.get(id));
  }
  return items.slice(after+1).filter(x=>x.type==='text'&&typeof x.text==='string').slice(-16).map(x=>({role:x.from==='self'?'user':'assistant',content:x.text.slice(0,1000)}));
 }
 const api={persona,createReply,modelHistory,explicitFact,forgetKeys,rememberExplicitFacts};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WangDialogue=api;
})(typeof window==='undefined'?globalThis:window);
