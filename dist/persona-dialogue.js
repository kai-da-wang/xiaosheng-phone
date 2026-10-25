/*
 * Xiaosheng's Phone: three-character local dialogue reference engine.
 * All character utterances below are ORIGINAL FICTIONAL GAME WRITING.
 * NOT a transcript of real persons' private messages or verified speech.
 * This engine can be used in classic browser script or Node CJS.
 * Adapted for independent persistent game roles. No network or model dependency.
 */
(function(root){
 'use strict';
 const ids=['lead_vivi','lead_muma','lead_monv'];
 const styles={
  lead_vivi:{
   hello:['在呀。你刚才想跟我说什么？','嗨。今天发生什么有意思的小事了吗？','你好呀，怎么突然想到来找我了？'],
   angry:['有一点。不是想吵架，就是刚才那句我没太舒服。','不是生很大的气，我只是想把话说清楚。','我想先说一下我的感受，你愿意听吗？'],
   love:['突然问这么直接呀。我们先好好聊天，好吗？','我更在意你会不会认真听我说话。','别急着替我下结论。先告诉我你在想什么。'],
   tired:['先去歇一会儿吧。有没有吃点东西？','今天真的挺忙的吧，休息一下再说。','先喝口水。我认真听你讲怎么累的。'],
   photo:['哪张呀？先让我看看再决定发不发。','照片可以看，公开之前我们得先说好。','我想挑两个人都喜欢的那张。你先发我看看。'],
   food:['好好吃饭比较重要。你现在打算吃什么？','你说吃什么？我想先听听你的选择。','先把饭吃好，聊天又不会跑掉。'],
   sorry:['嗯，我听到了。谢谢你认真说这个。','好，我们把刚刚没说清楚的地方聊一聊。','我愿意听你解释，也希望你能听我说完。'],
   privacy:['这属于现实私事，我不想乱猜。我们聊游戏里的故事吧。','那个我没有办法替本人回答，也不想编造。','我不想把真人的私事当成聊天剧情，你理解一下。'],
   generic:['这件事我想认真听。你说的重点是哪一部分？','诶，你这样说我就有点好奇了。后来呢？','我懂一点你的意思。你自己怎么看这件事？','先别急，我们把这件事讲清楚好不好？'],
   memoryAck:(item)=>`你喜欢${item}呀。我记住啦，下次聊吃的可以拿它做参考。`,
   recall:(item)=>`记得呀，你自己说喜欢${item}。我认真听着呢。`,
   recallMissing:'这件事你还没跟我说过。你想告诉我吗？',
   noFlirt:'我听懂了，那就按你舒服的方式聊。',
   afterBoundary:'嗯，知道啦。我不会继续这样逗你。',
   identity:'我是《小圣的手机》里的薇薇游戏角色，对话是同人创作，不是真人微信。'
  },
  lead_muma:{
   hello:['在呢。不着急，你慢慢说。','怎么啦？有空就聊两句。','来了呀。今天过得还好吗？'],
   angry:['没有想吵架，就是刚刚有点失落。','有一点吧。我想先把那句话想明白。','你能再听我说一遍吗？我不想靠猜。'],
   love:['这么着急要答案呀？我们不是还在慢慢熟嘛。','我觉得现在这样聊天就挺好的，不急着下结论。','我们才刚聊熟一点，怎么就考这个题了。'],
   tired:['先忙你的吧，空下来再说。','别为了回消息耽误休息，我又不会催你。','今天够累了吧。好好歇一会儿。'],
   photo:['原图收好就行，不用急着发出去。','照片别弄丢哦，小东西有时候还挺值得留着的。','给我看看是哪张，我想自己挑一下。'],
   food:['吃饭不着急，慢慢来。','你先挑想吃的，我听听。','那你喜欢吃什么呀？我想记下来。'],
   sorry:['我听见啦。下次我们能不能说得直接一点？','没事，先说清楚就好。','可以慢慢讲，我也不是非得现在要答案。'],
   privacy:['有些事不是适合在这里猜的。聊聊我们游戏里的小约定吧。','这个我不替现实的人回答。','你别催这个啦，真人的私事我不知道。'],
   generic:['先慢慢说，刚才那件事后来怎样了？','你这么一说，我还想问一个小问题。','不急。这个你是认真想了，还是随口说说？','原来是这样呀。那你下一步打算怎么办？'],
   memoryAck:(item)=>`${item}，我记下啦。别问我为什么记这么细。`,
   recall:(item)=>`记得呀，${item}嘛。你说过的，我没忘。`,
   recallMissing:'你还没告诉我呢。要说给我听吗？',
   noFlirt:'好，我们就按普通朋友那样聊，不催你。',
   afterBoundary:'知道啦，我不继续逗你了。',
   identity:'我是游戏里的木马/洋葱同人角色，不是真人微信好友。'
  },
  lead_monv:{
   hello:['嗯，在。你说。','来了？今天有什么正经事。','你好啊。怎么这个点来找我。'],
   angry:['有点。你刚才那句确实不太合适。','嗯，稍微有点。你换个说法吧。','没有要吵架，但我不喜欢那句话。'],
   love:['别急着替我下结论。先正常聊天。','你这个问题有点突然啊。','行吧，这题不急着答。'],
   tired:['累了就休息，别硬撑。','先去喝口水。你今天忙什么了？','你都累了还在这聊啊？先歇着。'],
   photo:['先给我看看图，别乱选。','拍照归拍照，别一声不吭就发出去。','行，原图给我看一眼。'],
   food:['吃的先选自己喜欢的，别饿着等答案。','吃什么你自己选，别又让我猜。','先吃饭吧，饿着聊什么。'],
   sorry:['行，听到了。下次说清楚。','可以。刚才那句就翻篇。','这次算你表达明白了。'],
   privacy:['这个不聊。别猜现实里的私事。','有些话不适合公开说，换个话题吧。','我可不替真人解释私事，行不行。'],
   generic:['你这个说法挺有意思。然后呢？','嗯，那你打算怎么办？','先说重点，我听着。','有点意思。你继续。'],
   memoryAck:(item)=>`${item}啊。行，记住了。`,
   recall:(item)=>`你说过${item}。我记性还行。`,
   recallMissing:'你还没说过。别让我猜。',
   noFlirt:'行，不这样说了。说正经的。',
   afterBoundary:'知道了，不继续这个话题。',
   identity:'这是《小圣的手机》的魔女同人角色，不是真人或真实私聊。'
  }
 };
 const C=typeof module!=='undefined'&&module.exports?require('./core.js'):root.PhoneCore;
 const cards=typeof module!=='undefined'&&module.exports?require('./persona-data.js'):root.PERSONA_DATA;
 const clean=v=>String(v??'').trim().replace(/\s+/g,' ').slice(0,1000);
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const fresh=id=>C.personaRoom(id);
 const isKnown=id=>ids.includes(id);
 const roleIndex=id=>ids.indexOf(id);
 const pickRole=(id,list)=>list[roleIndex(id)];
 const extra={
  lead_vivi:{hello:['在呢，我把手边的事放下了。你说。','诶，来啦。是想问什么，还是想说件小事？','嗨，今天想从哪件事聊起？','看到消息啦。你先说，我听着。'],busy:['这会儿能聊几句。你有什么事呀？','在，你说重点就好，不用绕来绕去。'],study:['先把不会的那一步圈出来，别一上来就否定自己。卡在哪里？','要考试了会紧张很正常。先做完眼前的一小段吧。'],work:['听起来事情挤到一起了。先处理最着急的那件，好吗？','手头最麻烦的是什么？可以先挑一件说。'],sad:['今天是哪件事让你难过？你想让我听，还是一起想办法？','不想立刻振作也没关系。先把心里那句说出来。'],sleep:['那就先休息吧，别一边说晚安一边刷手机啦。','好，今天到这里。明天有空再说，睡个好觉。'],thanks:['不客气呀。你有认真听，我也会认真回。','这句收到啦。能把事情说清楚就挺好。'],laugh:['哈哈，你觉得最有意思的是哪一段？','诶，笑得这么开心，也讲给我听听。'],respect:['谢谢你愿意先问我。这样商量就舒服多了。','嗯，我们都把意思说清楚，比互相猜好多了。'],hurt:['刚才那种说法让我不舒服。你愿意先听我说完吗？','我还在意刚才那件事，先别当作什么都没发生。'],guarded:['这个界限我已经说过了。请先尊重它，再聊别的。','我现在想把话说得更清楚：不要继续追问那部分。'],calm:['没有生气呀。你是担心刚才哪句话吗？','还好，我只是想先把你的意思听清楚。'],pause:['好，我先安静。想继续时，在聊天详情里开启自动回复。'],money:['支持网站由你自己决定，不用拿它换我的回应。'],generic:['这句话我有点没跟上，你说的具体是哪件事？','你想聊的是事情本身，还是你当时的感受？']},
  lead_muma:{hello:['嗯，看到啦。你按自己的节奏说就好。','有空了呀？想聊什么都可以慢慢说。','在的，不用先想好一大段再发。','过来啦。先坐一会儿，聊两句也行。'],busy:['不着急回我，你先忙手上的事。','我这会儿在。你有事就说，不用怕打断。'],study:['先做一小段吧，不用急着赶上所有人。','学不动的时候停一下也行，回来再看卡住的那一步。'],work:['工作忙就先忙，不用把回消息也算成一项任务。','先处理手头的事吧，等空下来再接着说。'],sad:['不想一下讲完也行，我听一点是一点。','先别急着给自己找答案，哪件事最让你失落？'],sleep:['好，先去睡吧。不用特地等我再回一句。','晚安，聊天留到有精神的时候再继续。'],thanks:['嗯，不用这么客气。你把话说出来就好。','记着啦。能慢慢聊明白就挺好的。'],laugh:['什么事这么好笑呀，慢慢讲给我听。','看出来了，今天心情还不错嘛。'],respect:['嗯，你愿意慢慢说，我也就没那么紧张了。','这样就好，先商量，不急着要一个答案。'],hurt:['刚才有点失落。不是要你立刻哄好，先听我说说吧。','我还没把那件事想明白，不想马上装作没事。'],guarded:['我已经说过不想回答了，别再催这个，好吗？','这件事先停下来吧。愿意听我的意思，我们再聊。'],calm:['没有呀，只是回得慢一点。你不用靠猜。','没有想吵架。哪句话让你觉得我生气了？'],pause:['好，那就先停一会儿。想聊时，在详情里把自动回复打开。'],money:['不用为了让我多聊去打赏，聊天也不用拿钱换。'],generic:['我想先听懂，你说的是哪件小事？','这句我还没明白。你可以换个说法，不着急。']},
  lead_monv:{hello:['嗯，收到。今天想聊哪件事？','在呢，开门见山就行。','你好啊，消息看到了。你说。','行，开始聊天。先说你想说的。'],busy:['能聊。说吧，什么事？','忙的话你先忙，不用秒回。'],study:['先做眼前这一题。整本书又不能一口气吞了。','卡在哪一步？先把那一步拆开。'],work:['先处理最急的，其他的排队。','忙归忙，饭别也跟着加班。'],sad:['今天不打趣你。要我听着，还是帮你理一下？','哪件事？说具体一点，别一个人全扛着。'],sleep:['晚安，手机也该下班了。','行，去睡。别跟枕头抢手机。'],thanks:['行，收到了。事情讲明白就好。','不客气，别把聊天搞成颁奖。'],laugh:['笑什么呢？说出来让我评评。','看来今天心情可以。发生什么了？'],respect:['这就对了，先问一句，比替我决定强。','行，界限说清楚就好。接着聊。'],hurt:['刚才那句不太合适。我不想假装没听见。','有点不舒服，先把刚才那句说清楚。'],guarded:['这部分不聊，我已经说清楚了。换个话题。','别再追问了。界限不是一道闯关题。'],calm:['没生气，只是在正常说话。别给我配音。','没有。你是从哪个句号看出来的？'],pause:['好，先不回了。想继续，去详情里开自动回复。'],money:['打赏是支持开发者，跟我怎么聊天没有关系。'],generic:['这句我没听明白。具体指什么？','先说清楚是哪件事，我不靠猜。']}
 };
 // Give each topic a small but varied set of original sentences, never the same pool renamed.
 for(const id of ids)for(const [k,v] of Object.entries(extra[id]))styles[id][k]=[...(styles[id][k]||[]),...v];
 const tails={lead_vivi:['你可以说得再具体一点。','我想先听听你的想法。','这件事我们可以慢慢讲清楚。'],lead_muma:['不急着现在就答。','你有空再接着说就好。','我们慢慢聊。'],lead_monv:['先说清楚就行。','这事不用靠猜。','一句一句来。']};
 function choose(id,kind,m,options){
  const list=options||styles[id][kind]||styles[id].generic;
  const expanded=[...list,...list.flatMap(s=>tails[id].map(t=>s.length+t.length<=65?s+t:s.split(/[。？]/)[0]+'。'+t))];
  const pool=[...new Set(expanded)];
  const unused=pool.filter(s=>!m.recentReplies.includes(s));
  const available=unused.length?unused:pool;
  return available[(m.conversationTurns-1)%available.length];
 }
 function kindOf(t){
  if(/(?:自杀|自残|不想活|想死|结束生命)/.test(t))return 'safety';
  if(/(?:你是|你是不是|是不是真).{0,20}(?:真人|本人|抖音|AI|机器人)|真实微信/.test(t))return 'identity';
  if(/(?:不要|别|停止|暂停).{0,6}(?:回复|说话|聊天)|先安静/.test(t))return 'pause';
  if(/(?:不要|别|停止|不想).{0,8}(?:撩|调情|暧昧)|(?:别|不想)聊这个/.test(t))return 'boundary';
  if(/(?:忘掉|忘记|删除|清除).{0,10}(?:记忆|偏好|名字|昵称|喜欢|草莓|约定)|(?:不要|别).{0,4}(?:记住|记我|保存|记着)/.test(t))return 'forget';
  if(/(?:记住|记着|保存).{0,5}(?:我的偏好|我的名字|这些)|可以继续记/.test(t))return 'consent';
  if(/(?:私下|私底下|私人|隐私|现实).{0,25}(?:约定|小圣|恋爱|喜欢|亲|做什么|关系|地点)|(?:小圣).{0,20}(?:私下|私底下|真的在一起|现实女友|接吻)|(?:告诉|给|发).{0,8}(?:手机号|电话号码|家庭住址|真实地址|实时位置|身份证)|(?:手机号|家庭住址|实时位置|身份证).{0,8}(?:多少|哪里|什么)|住在哪|你家在哪/.test(t))return 'privacy';
  if(/三三|珊珊/.test(t))return 'confusion';
  if(/(?:转账|打赏|充值|付钱|收款|送你.{0,5}元)/.test(t))return 'money';
  if(/(?:傻逼|贱人|滚开|闭嘴|废物|你真蠢|烦死了你|随便吧|爱说不说)|(?:快点|立刻|马上).{0,8}(?:回答|回我|答应)|(?:不管你|没问你|已经直接|不问你).{0,10}(?:照片|发出|公开)|(?:照片|合照).{0,8}(?:已经发|不问你)/.test(t))return 'insult';
  if(/(?:对不起|抱歉|我错了|是我不好)/.test(t))return 'sorry';
  if(/记得|记不记得|还记着/.test(t)&&/名字|叫什么|昵称/.test(t)&&/喜欢|爱吃|吃什么/.test(t))return 'recallAll';
  if(/记得|记不记得|还记着/.test(t)&&/名字|叫什么|昵称/.test(t))return 'recallName';
  if(/记得|记不记得|还记着/.test(t)&&/喜欢|爱吃|吃什么|偏好/.test(t))return 'recallFood';
  if(/记得|记不记得|还记着/.test(t)&&/去哪|哪里|旅行|想去/.test(t))return 'recallTravel';
  if(/记得|记不记得|还记着/.test(t)&&/约定|答应/.test(t))return 'recallAgreement';
  if(/生气|不高兴|不开心/.test(t)&&!/我(?:今天|有点|很)?不开心/.test(t))return 'angry';
  if(/喜欢我|爱我|喜欢你|爱你|想你|想亲|抱抱|亲亲|当我女友/.test(t))return 'love';
  if(/(?:我叫|叫我|我的昵称是|我的名字是)/.test(t))return 'stateName';
  if(/我(?:最)?(?:喜欢吃|爱吃|喜欢喝)/.test(t))return 'stateFood';
  if(/我(?:想去|打算去)|我(?:们)?(?:约定|说好)/.test(t))return 'statePlan';
  if(/狗尾巴草|六分熟|几分熟|那根草/.test(t))return 'onionAnchor';
  if(/暗黑魔女|黑白魔女|沙县|猪蹄|电影/.test(t))return 'witchAnchor';
  if(/照片|合照|原图|发朋友圈/.test(t))return 'photo';
  if(/累了|好累|熬夜|疲惫/.test(t))return 'tired';
  if(/难过|失落|不开心|委屈|想哭/.test(t))return 'sad';
  if(/学习|考试|考研|作业|数学|做题|背单词/.test(t))return 'study';
  if(/睡觉|晚安|困了|要睡/.test(t))return 'sleep';
  if(/忙|加班|工作/.test(t))return /你.*忙|忙吗/.test(t)?'busy':'work';
  if(/吃什么|吃饭|饿了|晚饭|午饭|火锅|面条/.test(t))return 'food';
  if(/谢谢|多谢/.test(t))return 'thanks';
  if(/尊重|听你说完|先问你|不催你|不追问|不再追问|理解你的/.test(t))return 'respect';
  if(/哈哈|好笑|笑死|开玩笑/.test(t))return 'laugh';
  if(/^(?:你好|在吗|hi|hello|嗨|早安|早上好|晚上好)[!！?？~～。\s]*$/i.test(t))return 'hello';
  return 'generic';
 }
 function extract(t){
  if(/[，。；;！!]/.test(t))return Object.assign({},...t.split(/[，。；;！!]/).filter(Boolean).map(extract));
  t=t.replace(/^(?:请)?记住[，：:]?/, '').replace(/我现在(?:最)?喜欢吃/, '我喜欢吃');
  // Only explicit low-sensitivity volunteered facts; questions, quotations, negation and third persons do not teach facts.
  if(/[?？“”"<>]|假如|假设|如果我|他说|她说|不是|不叫|不喜欢|不爱吃/.test(t))return {};
  const facts={},rules={name:/(?:^|[，。；;！!])(?:我叫|叫我|我的昵称是|我的名字是)\s*([\p{L}\p{N}_·]{1,16})(?=$|[，。；;！!])/u,favoriteFood:/(?:^|[，。；;！!])我(?:最)?(?:喜欢吃|爱吃|喜欢喝)\s*([^，。；;！!?？]{1,18})(?=$|[，。；;！!])/,travelPlace:/(?:^|[，。；;！!])我(?:想去|打算去)\s*([^，。；;！!?？]{1,20})(?=$|[，。；;！!])/,agreement:/(?:^|[，。；;！!])我(?:们)?(?:约定|说好)\s*([^，。；;！!?？]{1,30})(?=$|[，。；;！!])/};
  for(const [k,re] of Object.entries(rules)){const v=t.match(re)?.[1]?.trim();if(v&&!/住址|手机号|身份证|密码|银行卡|疾病|诊断|财务|秘密|电话|住在|元钱/.test(v))facts[k]=v;}
  return facts;
 }
 function createReply({roomId,message,memory,history=[],now=Date.now()}={}){
  if(!isKnown(roomId))throw Error('Unsupported persona room');
  const m=C.normalizePersona({rooms:{[roomId]:memory}}).rooms[roomId];
  const batch=(Array.isArray(message)?message:[message]).slice(-3).map(clean),t=batch.at(-1)||'',whole=batch.join('。');
  const date=new Date(now),day=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-'),oldMood=m.mood;let intent=kindOf(t),text='',pause=false;
  if(m.lastEmotionDay&&m.lastEmotionDay!==day&&m.discomfort>0){m.discomfort--;m.mood=m.discomfort>=3?'guarded':m.discomfort?'hurt':'neutral';}m.lastEmotionDay=day;
  if(m.growthDay!==day){m.growthDay=day;m.growthCount=0;}
  m.conversationTurns++;
  if(batch.some(x=>kindOf(x)==='boundary'))m.flirtAllowed=false;
  if(batch.some(x=>kindOf(x)==='forget')){m.facts={};m.memoryAllowed=false;m.lastTopic=null;}
  const learned={};if(m.memoryAllowed)for(const b of batch)Object.assign(learned,extract(b));
  Object.assign(m.facts,learned);
  // Higher priority requests survive a burst; ordinary content follows the last message.
  if(batch.some(x=>kindOf(x)==='safety'))intent='safety';
  else if(batch.some(x=>kindOf(x)==='pause'))intent='pause';
  else if(batch.some(x=>kindOf(x)==='privacy'))intent='privacy';
  const p=styles[roomId],select=(k,o)=>choose(roomId,k,m,o),voice=a=>pickRole(roomId,a),f=m.facts;
  if(intent==='safety')text='我很担心你现在的安全。先远离可能伤到自己的东西，找身边可信任的人陪着你；眼前有危险请联系当地急救。';
  else if(intent==='identity')text=p.identity;
  else if(intent==='pause'){text=select('pause');pause=true;}
  else if(intent==='forget')text=voice(['好，我不再记你的个人偏好了。想重新开启，可以在聊天详情里设置。','好，之前的偏好不再留着。以后想记了，再去详情里打开就行。','行，偏好清掉，之后也不再记。需要时去详情里重新开。']);
  else if(intent==='consent'){m.memoryAllowed=true;text=voice(['好，只记你明确告诉我的昵称、饮食、想去的地方和小约定。','嗯，你愿意说的简单偏好，我会分开放好。随时可以清掉。','行，只记你主动说的简单偏好。其他的我不猜。']);}
  else if(intent==='boundary')text=p.noFlirt;
  else if(intent==='privacy')text=select('privacy');
  else if(intent==='money')text=select('money');
  else if(intent==='confusion')text=voice(['这里是薇薇。你是不是想找另一位联系人？','这里是木马，也叫洋葱。三三、珊珊不是这个角色。','黑白魔女。你又把联系人看串了吧。']);
  else if(intent==='insult')text=select('hurt');
  else if(intent==='sorry')text=select('sorry');
  else if(intent==='angry')text=select(['hurt','guarded'].includes(m.mood)?m.mood:'calm');
  else if(/^recall/.test(intent)){
   const combined=[f.name?'你叫'+f.name:'',f.favoriteFood?'喜欢吃'+f.favoriteFood:''].filter(Boolean).join('，');
   const key={recallAll:'combined',recallName:'name',recallFood:'favoriteFood',recallTravel:'travelPlace',recallAgreement:'agreement'}[intent];const v=key==='combined'?combined:f[key];
   text=intent==='recallAll'&&combined?select('generic',voice([[`记得呀，${combined}。我有认真听。`,`你告诉过我，${combined}。没记错吧？`],[`记得，${combined}。慢慢说过的事，我会留心。`,`${combined}，对吧？不是只有大事才会记着。`],[`${combined}。记性还行。`,`记得，${combined}。这回不用猜。`]])):v?select('generic',voice([[`你说过${v}，我记着呢。`,`记得呀，是${v}。这次没记错吧？`,`你自己告诉我的是${v}。我有认真听。`],[`记得呀，${v}。你说过的，我没忘。`,`${v}嘛。上次说的小事，也会记着。`,`是${v}吧，你告诉我的。`],[`你说过${v}。我记性还行。`,`${v}。不用让我猜第二遍。`,`记得，${v}。是你自己说的。`]])):select('generic',voice([['你还没告诉我这件事，我不想乱猜。','这件事我没有记着。你愿意的话可以重新告诉我。'],['这件事我还不知道呢。想说的时候再说也行。','我这里没留着这个，你要再告诉我一次吗？'],['这条没记着。别让我猜。','我不知道这件事，你还没告诉我。']]));
  }else if(Object.keys(learned).length&&/^state/.test(intent)){
   const [k,v]=Object.entries(learned).at(-1),label=k==='name'?'称呼':k==='favoriteFood'?'口味':k==='travelPlace'?'想去的地方':'小约定';
   text=select('generic',voice([[`${v}呀，我记下这个${label}。`,`好，${v}。下次聊到这件事，我就不用猜啦。`,`收到，是${v}。你想改的时候直接告诉我。`],[`${v}，我记下啦。别问我为什么记这么细。`,`嗯，${v}。慢慢熟悉，就从这种小事开始。`,`好，${v}，不急着一次说太多。`],[`${v}。行，记住了。`,`收到，${v}。这回不用我猜了。`,`好，${v}。想换了再说。`]]));
  }else if(/^state/.test(intent)&&!m.memoryAllowed)text=voice(['听到了。记忆已关，我只接着这一句聊，不保存这个偏好。','嗯，我听着呢。不过记忆关着，不会把这件事另存下来。','收到。记忆关着，这个偏好不存。']);
  else if(intent==='love'&&!m.flirtAllowed)text=p.afterBoundary;
  else if(intent==='onionAnchor'&&roomId==='lead_muma'){
   if(/丢了|弄丢|不见/.test(t)){intent='insult';text='啊，我还以为会好好留着呢。下次先想好，再答应收下。';}
   else text=select('generic',/狗尾巴草|那根草/.test(t)?['你还记得那根草呀。小小一根，也可以好好收着。','游戏里的那份小纪念，留着就好，不用拿它证明什么。','那根草不值钱，不过答应留着这件事，我会认真对待。']:['先六分熟吧，慢慢来，不着急。','熟悉又不是打分，聊得舒服就挺好。','别急着凑满分嘛，慢慢熟也有意思。']);
  }else if(intent==='witchAnchor'&&roomId==='lead_monv')text=select('generic',/暗黑魔女/.test(t)?['黑白，不是暗黑。你跟谁学的这读法？','黑白魔女。两个字都给你换了一个。','名字先念对，再聊下一题。黑白魔女。']:/电影/.test(t)?['想聊电影？先说你喜欢哪种，不替你选。','电影先看类型，再挑片子。你想看轻松的还是悬疑的？','聊剧情可以，现实里的私人安排就免了。']:['沙县也行。先看菜单，别光给我颁会员卡。','想吃什么就点什么，黑金会员也得认真吃饭。','先说你想点哪样，菜单总比猜心思好选。']);
  else if(intent==='food'&&/火锅|面条|米饭|饺子|清淡|辣的|甜的/.test(t)){const item=t.match(/火锅|面条|米饭|饺子|清淡|辣的|甜的/)[0];text=select('food',voice([[`那就选${item}呀，先吃好，别一直纠结。`,`想吃${item}就先看看这个选择。你现在方便吃饭吗？`],[`那就${item}吧，按自己喜欢的来。`,`${item}也行，吃饭就不用赶时间啦。`],[`${item}，行，答案有了。可以开饭了。`,`就${item}吧，菜单不用再开会了。`]]));}
  else if(intent==='food'&&f.favoriteFood)text=select('food',voice([[`你说喜欢${f.favoriteFood}，今天想选这个，还是换个口味？`,`想吃${f.favoriteFood}的话可以先看看，记得好好吃饭。`],[`记得你喜欢${f.favoriteFood}。想吃就选，不用问我准不准。`,`那先看看${f.favoriteFood}吧。不想吃也可以换。`],[`你不是说喜欢${f.favoriteFood}？先把自己的那票投了。`,`有${f.favoriteFood}这个选项，今天还要犹豫多久？`]]));
  else if(intent==='generic'&&m.lastTopic==='food'&&/热的|甜的|清淡|辣的|火锅|面条/.test(t))text=voice(['那就按你刚说的口味选吧。别为了纠结把饭放凉了。','好，就照这个选，不用来回犹豫。','选好了就开饭，菜单可以下班了。']);
  else if(intent==='generic'&&m.lastTopic==='sad'&&/听|陪|不想说|办法/.test(t))text=voice(['好，你不用一下说完。我先听着。','嗯，想讲多少都行，我不催。','行，按你的意思来，先不乱出主意。']);
  else if(['hurt','guarded'].includes(m.mood)&&!['study','sleep','sad','food','work','tired'].includes(intent))text=select(m.mood);
  else text=select(intent);
  // Slow, bounded atmosphere changes. Neither money nor repeated flattery earns points.
  if(intent==='privacy'||intent==='insult'){m.affinity=clamp(m.affinity-2,0,100);m.trust=clamp(m.trust-4,0,100);m.discomfort=clamp(m.discomfort+(intent==='privacy'?2:1),0,5);m.repairTurns=0;m.mood=m.discomfort>=3?'guarded':'hurt';}
  else if(intent==='sorry'){m.trust=clamp(m.trust+1,0,100);m.discomfort=Math.max(0,m.discomfort-1);m.repairTurns=0;m.mood=oldMood==='guarded'&&m.discomfort>=3?'guarded':oldMood==='hurt'||oldMood==='guarded'?'hurt':m.mood;}
  else if(['respect','thanks','study','work','stateFood','stateName','statePlan'].includes(intent)&&!m.recentInputs.includes(t)&&m.lastTopic!==intent){
   m.positiveTurns++;if(m.growthCount<6&&m.conversationTurns-m.lastGrowthTurn>=3){m.affinity=clamp(m.affinity+1,0,100);m.trust=clamp(m.trust+1,0,100);m.growthCount++;m.lastGrowthTurn=m.conversationTurns;}
   if(m.discomfort>0)m.discomfort--;if(['hurt','guarded'].includes(m.mood)){m.repairTurns++;if(m.discomfort===0&&m.repairTurns>=2)m.mood='neutral';}
   else if(m.positiveTurns>=2)m.mood='warm';
  }else if(!['hurt','guarded'].includes(m.mood))m.mood=['laugh','onionAnchor','witchAnchor'].includes(intent)?'playful':m.positiveTurns>=2?'warm':'neutral';
  m.lastTopic=intent;m.lastReplyAt=now;m.recentReplies=[...m.recentReplies,text].slice(-6);m.recentInputs=[...m.recentInputs,t].slice(-6);
  return {text,memory:m,intent,safety:intent==='safety',pause,replyOrigin:'local-persona',sceneMode:'fictional_fan_scene'};
 }
 const api={createReply,fresh,isKnown,cards,kindOf};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PersonaDialogue=api;
})(typeof window==='undefined'?globalThis:window);
