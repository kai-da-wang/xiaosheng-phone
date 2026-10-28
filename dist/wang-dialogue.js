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
  dali:['大理好呀。古城逛逛，还是去洱海边走走？','去大理的话，我想先在洱海边慢慢走。你选才村还是双廊？','大理这题我会选：风景慢慢看，合照认真拍。你想先去古城还是湖边？'],
  meeting:['好呀。你想哪天、去哪儿？先说清楚，我才好记着。','见面可以，别只说一句就没下文。你想约在哪儿？','那你负责想地点，我负责提醒你别忘带外套。什么时候去？'],
  compliment:['行，今天这句夸得不错。奖励你下次继续夸。','你再这么说，我可就真信了。','嘴甜归嘴甜，下次拍照不许把我拍糊。'],
  apology:['听到啦。我们把刚才不舒服的地方说清楚，好不好？','先不跟你赌气。刚才那句你是怎么想的？','好，我听见了。下次别让我靠猜，你直接跟我说。'],
  thanks:['这就谢啦？那我把这句也收着。','不客气。你也记得对自己好一点。','收到。今天多照顾自己一点，就当回礼啦。'],
  laugh:['笑什么啦，分我一点，我也想听。','哎，你一笑我也想笑了。刚刚是哪句戳中你了？','行，看来今天心情还不错。接着说，我听着呢。']
 };
 const compact=s=>String(s||'').trim().replace(/\s+/g,' ');
 // Negating a stop request ("不要停止聊天") means continue, while an
 // explicit later stop in the same text must still take effect.
 const negatedStop=/(?:别|不要|不用|不必|无须|不需要|不想)(?:再|先|继续)?(?:停止|暂停)(?:和我|跟我|给我|对我的)?(?:聊天|聊|回复|回|说话)/g;
 function wantsToContinue(input){const text=compact(input);return text.replace(negatedStop,'')!==text;}
 function isPauseRequest(input){
  const text=compact(input).replace(negatedStop,'');
  return /(?:不要|别|不用|不必|不需要|停止|暂停|不想)(?:再|继续|跟我|和我|给我|先){0,3}(?:回复|回|聊天|聊|说话)|先安静|停一下|不聊/.test(text);
 }
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
 // Only a clearly stated lasting change to the same food invalidates it.
 // Process clauses in order so a replacement in the same message wins.
 function foodChanges(input){
  const text=compact(input);if(!text||/[?？]/.test(text)||/(?:吗|么)[。！!\s]*$/.test(text))return [];
  const changes=[];
  for(const part of text.split(/[，,。；;！!]|(?:但是|但|不过|而是)/).map(part=>part.trim()).filter(Boolean)){
   const no=part.match(/^(?:我)?(?:现在|已经|以后)?(?:不再|不|没那么)(?:喜欢吃|爱吃)\s*([^，。！？!?]{1,14}?)\s*(?:了|啦)?$/);
   if(no){changes.push({kind:'remove',value:no[1].trim()});continue;}
   const yes=explicitFact(part);
   const replacement=changes.length&&part.match(/^(?:我)?(?:现在|以后)?(?:改成|换成|喜欢吃|爱吃)\s*([^，。！？!?]{1,14})$/);
   const value=(yes?.key==='food'?yes.value:replacement?.[1])?.replace(/(?:了|啦)$/,'').trim();
   const next=replacement&&yes?.key!=='food'?value?.replace(/^吃/,'').trim():value;
   if(next&&(yes?.key==='food'||foodAnswer(next)))changes.push({kind:'set',value:next});
  }
  return changes;
 }
 function applyFoodChanges(memory,input){
  for(const change of foodChanges(input)){
   if(change.kind==='set')memory.food=change.value;
   else if(memory.food===change.value)delete memory.food;
  }
 }
 function foodAnswer(text){
  return /^[\u4e00-\u9fffA-Za-z0-9]{1,14}$/.test(text)&&
   !/^(?:我|你|他|她|不|没|别|要|想|好|嗯|是|请|先|还|刚|今天|现在|吃|晚安|早安|你好|嗨|在吗|不知道|随便|都可以|算了|谢谢|再见|学习|工作|考试|累|饿)/.test(text)&&
   !/(?:不|没|别|吃过|吃了|吃下|喜欢|讨厌|想吃|能吃|要吃|好吃|怎么样|如何|可以|有吗|吗|么|呢|吧)/.test(text)&&
   /(?:面|饭|粥|粉|包子|饺子|馄饨|馒头|肉|鱼|虾|蟹|蛋|菜|汤|火锅|烧烤|披萨|汉堡|寿司|薯|饼|糕|糖|巧克力|奶茶|咖啡|水果|草莓|苹果|香蕉|橙|葡萄|西瓜|芒果|桃|梨|柚|榴莲|樱桃|蓝莓|冰淇淋|冰激凌|豆腐|鸡翅|串|螺蛳|麻辣烫)/.test(text);
 }
 function nameAnswer(text){
  // Bare answers are ambiguous; accept familiar nicknames, common Chinese
  // surnames and Latin names, but reject normal conversational replies.
  if(/^(?:我|你|他|她|今天|明天|现在|刚才|晚上|早上|好|嗯|知道|随便|都可以|算了|谢谢|再见|在吗|嗨|hello|hi|累|饿|可以|哈哈|心情|还没|刚吃|高数|数学|英语|工作|学习|考试)/i.test(text))return false;
  return /^(?:小[\u4e00-\u9fff]{1,3}|[赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦许何吕张孔曹严华金魏谢邹苏潘范彭鲁马方任袁柳史唐薛雷贺汤罗郝安常于傅齐康伍余顾孟黄尹姚邵汪毛戴宋庞熊董梁杜蓝季贾江童郭林钟徐邱高夏蔡田胡霍万卢莫崔龚程陆邓洪包石刘龙叶白赖卓乔谭申桑桂牛边燕温庄柴阎连艾向易廖文曾沙关查游权][\u4e00-\u9fff]{1,3}|[A-Za-z]{2,12})$/.test(text);
 }

 // A mentioned place is not a decision: reject questions, other people's
 // plans and negations before considering an explicit choice.
 function placeResponse(text){
  const places='(?:大理)?古城|湖边|洱海|才村|双廊|大理|苍山';
  const parts=text.split(/[，,。；;！!]|(?:但是|但|不过|而是)/).map(x=>x.trim()).filter(Boolean);
  let rejected='',choice='',uncertain=false,temporary=false,otherSubject=false;const actions=[];
  for(const part of parts){
   if(/^(?:你|他|她|他们|她们)/.test(part))otherSubject=true;else if(/^(?:我|我们)/.test(part))otherSubject=false;
   let place=part.match(new RegExp(places))?.[0];if(!place)continue;if(place==='大理古城')place='古城';
   if(/[?？]|(?:吗|么|呢|怎么样|如何|是不是|能不能|可以吗)[。！!\s]*$/.test(part)||otherSubject){uncertain=true;continue;}
   if(/(?:不想|不再|不打算|不准备|不要|别|不去|去不了|取消)|(?:不去|不想去|去不了|取消)(?:了|啦)?$/.test(part)){
    rejected=place;temporary=/(?:今天|明天|这次|暂时|现在|这会儿)/.test(part);actions.push({kind:'reject',place,temporary});continue;
   }
   if(new RegExp('^(?:(?:我|我们)(?:想|要|决定|打算)?去|先去|去|选|选择|就去|改去|换成|改成|那就去|那就|还是)?\\s*('+places+')(?:边)?[呀啊吧啦哦！!。\\s]*$').test(part)){choice=place;actions.push({kind:'choice',place});}
   else uncertain=true;
  }
  return {rejected,choice,uncertain,temporary,actions};
 }
 function applyPlaceChanges(memory,input,allowChoices){
  const actions=placeResponse(input).actions;
  const explicitChange=actions.some(item=>item.kind==='reject')&&actions.some(item=>item.kind==='choice');
  for(const item of actions){
   if(item.kind==='choice'&&(allowChoices||explicitChange))memory.place=item.place;
   else if(item.kind==='reject'&&!item.temporary&&(memory.place===item.place||memory.place==='洱海边'&&item.place==='洱海'))delete memory.place;
  }
 }

 // A picture mentioned in a question or a refusal is not a selection. Keep
 // the old choice until the player actually chooses another picture.
 function photoResponse(input){
  const clauses=compact(input).split(/[，,。；;！!]|(?:但是|但|不过|而是)/).map(x=>x.trim()).filter(Boolean);
  let choice='',refusal=false,question=false;
  for(const clause of clauses){
   // A subsequent standalone change of mind cancels only this proposed
   // selection, never an earlier saved picture.
   if(/^(?:(?:那|这|我|还是|算了|先|就|那就|我还是|我先))*(?:不选|不要|不用|不发|不看|算了|不想选)(?:了|啦|吧)?$/.test(clause)){refusal=true;choice='';continue;}
   if(/^你选[呀啊吧啦哦！!。\s]*$/.test(clause)){choice='海边';continue;}
   if(!/海边|雪山|第一|第二/.test(clause))continue;
   if(/[?？]|(?:吗|么|呢|怎么样|如何|好不好|可以吗)[。！!\s]*$/.test(clause)||/^(?:你|他|她|他们|她们)/.test(clause)){question=true;continue;}
   const candidate=/雪山|第二/.test(clause)?'雪山':'海边';
   if(/不要|别|不想|不选|不发|不喜欢|不看|不用|不行|没选/.test(clause)){refusal=true;if(choice===candidate)choice='';continue;}
   if(/^(?:(?:我|我们)(?:想|要|想要)?(?:选|看|发)?|选|选择|就选|想看|想发|我要|我想要|那就|还是)?\s*(?:海边|雪山|第一|第二)(?:那张|的那张|张|个)?[呀啊吧啦哦！!。\s]*$/.test(clause))choice=candidate;
  }
  return {choice,refusal,question};
 }
 function meetingAnswer(input){
  const text=compact(input);
  if(!text||text.length>45||/[？?]/.test(text)||/(?:吗|么|呢|怎么样|如何|好不好|是不是|能不能|可以吗|几点|什么时候|去哪|哪里|哪儿)[。！!\s]*$/.test(text))return false;
  if(/(?:不|没|别|取消|改天|下次再|不见|不约|不去|不能|无法|没空|没时间|有事|上班|工作|考试|学习|也许|或许|可能|如果|要是|假如|未定|不确定|再看看)/.test(text)||/(?:你|他|她|他们|她们|朋友)/.test(text))return false;
  return /(?:明天|后天|今天|周[一二三四五六日天末]|星期[一二三四五六日天]|[点时]|晚上|中午|下午|上午|门口|食堂|公园|古城|湖边)/.test(text);
 }
 function cancelsMeetingPlan(input,plan){
  if(typeof plan!=='string'||!plan||/[？?]|(?:吗|么|呢|怎么样|是不是|能不能)[。！!\s]*$/.test(input)||/(?:你|他|她|他们|她们|朋友)/.test(input)||!/(?:不见|不约|取消.{0,5}(?:约会|见面)|见不了|约不成)/.test(input))return false;
  // plan is shared with meal plans; only erase an unmistakable matching
  // dated appointment, not an unrelated meal or a different appointment.
  if(/(?:吃|喝|火锅|面条|米饭|蛋糕|草莓|冰淇淋|麻辣烫|烧烤|奶茶|咖啡)/.test(plan)||!/(?:见面|见你|约会|公园|门口|古城|湖边)/.test(plan))return false;
  const dates=String(input).match(/明天|后天|今天|周[一二三四五六日天末]|星期[一二三四五六日天]/g)||[];
  return dates.length>0&&dates.some(date=>plan.includes(date));
 }

 function forgetKeys(input){
  const text=compact(input);
  // Keep each question mark attached to its clause: dropping it could turn a
  // question into a deletion command when another sentence follows.
  const clauses=(text.replace(/但是|但|不过/g,'，').match(/[^，,。；;！!？?]+[？?]?/g)||[]).map(x=>x.trim()).filter(Boolean);
  if(clauses.length>1)return [...new Set(clauses.flatMap(forgetKeys))];
  if(/(?:别|不要|不许|不会|没有|没|不能|无法|不想|不愿意)忘(?:记|掉)|不(?:想|希望|愿意)(?:让)?你忘(?:记|掉)|(?:害怕|担心|怕)(?:你)?忘(?:记|掉)/.test(text)||/^(?:她|他|他们|她们).{0,12}(?:忘记|忘掉|删除|清除)/.test(text)||/^我(?:已经|刚刚|刚|好像)?忘(?:记|掉)/.test(text))return [];
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
  for(const text of messages){const fact=explicitFact(text);if(fact?.key==='name'&&fact.value&&!forget.includes('name'))result.name=fact.value;if(!forget.includes('food'))applyFoodChanges(result,text);if(!forget.includes('place'))applyPlaceChanges(result,text,result.pending==='place-choice');}
  return result;
 }
 function createReply(input,history=[],old={}){
  const text=compact(input).slice(0,1000),m={...old,turn:(Number(old.turn)||0)+1,recent:Array.isArray(old.recent)?old.recent.slice(-8):[]};
  const recent=(Array.isArray(history)?history:[]).filter(x=>x.type==='text').slice(-20);
  const select=(topic,choices,pending='')=>{const unused=choices.filter(s=>!m.recent.includes(s)),list=unused.length?unused:choices;const reply=list[(m.turn-1)%list.length];m.topic=topic;m.pending=pending;m.recent=[...m.recent,reply].slice(-8);return {text:reply,memory:m,topic};};
  const one=(topic,t,pending)=>select(topic,[t],pending);
  if(!forgetKeys(text).includes('place'))applyPlaceChanges(m,text,m.pending==='place-choice');
  if(/(?:自杀|自残|不想活|想死|结束生命)/.test(text))return one('safety','我很担心你现在的安全。先远离可能伤到自己的东西，找一个能陪着你的人；眼前有危险就联系当地急救。你身边有人吗？');
  if(/(?:胸痛|呼吸困难|昏倒|吃了很多药)/.test(text))return one('safety','这件事先别在聊天里耽误，尽快找身边的人陪着你，联系当地急救或去医院。先照顾好自己。');
  if(isPauseRequest(text))return {...one('pause','好，我先安静一会儿。想继续时，点聊天右上角，把自动回复打开就好。'),pause:true};
  const forgotten=forgetKeys(text);if(forgotten.length){for(const key of forgotten)delete m[key];m.recent=[];return one('forget','好，刚才说的资料已经从记忆里清除，聊天记录还在。');}
  const changes=foodChanges(text);applyFoodChanges(m,text);
  const fact=explicitFact(text);
  if(/(?:你是|你是不是|你真是|你到底是).{0,8}(?:真人|本人|真的小王|人工智能|机器人|AI)|(?:是不是|是).{0,3}程序/.test(text))return one('identity','我是这部手机里的小王游戏角色呀。现在用情景对话陪你聊天，真人的私事我可不会乱编。');
  if(/(?:不喜欢你|不爱你|别撩|不要撩|不想谈恋爱|别叫我宝宝|不要叫我宝宝)/.test(text)){m.flirt=false;return one('boundary','好，那我们就轻松聊，不这样逗你了。你想聊点什么？');}
  if(/(?:难过|不开心|伤心|委屈|焦虑|烦死|想哭|失落|生气|心情不好)/.test(text)){if(fact?.key==='name')m.name=fact.value;return select('sad',pools.sad,'feelings');}
  if(fact?.key==='name'){m.name=fact.value;return one('name',`${m.name}，记住啦。那以后我就这样叫你，好不好？`);}
  if(/(?:我叫什[么麼]|我的名字|记得我的名字|还记得我叫)/.test(text))return one('name',m.name?`${m.name}呀。自己告诉我的，我有认真记着。`:'你还没正式告诉我呢。你想让我怎么叫你？',m.name?'':'name');
  if(m.pending==='name'&&nameAnswer(text)){m.name=text;return one('name',`${text}，好，记住啦。`);}
  if(changes.length){const last=changes.at(-1);return last.kind==='set'?one('food-memory',`${last.value}，我记住了。下次聊吃什么，可别说我没认真听。`):one('food-memory','好，知道你现在不喜欢这个了。想换个口味吗？');}
  if(/(?:记得|知道).{0,8}(?:喜欢吃|爱吃)|我(?:喜欢吃|爱吃)什[么麼]/.test(text))return one('food-memory',m.food?`你说过喜欢吃${m.food}。看，我有认真听。`:'这个你还没告诉我呢。你最喜欢吃什么？',m.food?'':'food-preference');
  if(/(?:今天|现在|这会儿|暂时)(?:我)?不(?:想|要)吃/.test(text))return one('meal','好，今天先不吃这个。想换什么口味？');
  if(m.pending==='food-preference'&&foodAnswer(text)){m.food=text;return one('food-memory',`${text}，好，记在这次聊天的小本子上啦。`);}
  if(/(?:你(?:刚才|上次)|刚刚).{0,8}(?:说了|说的|问我|问的)|刚才聊到哪/.test(text)){const last=recent.filter(x=>x.from!=='self'&&x.autoReply).at(-1);return one('recall',last?`我刚才说的是：“${compact(last.text).slice(0,90)}”`:'刚才还没正式聊起来呢。要不从你今天过得怎么样开始？');}
  if(wantsToContinue(text))return one('continue','在呢，我们接着聊。你想从哪件事说起？');
  if(m.pending==='food-choice'&&/^(?:第?一[个家种]?|第一[个家种]?|火锅|热乎的|面条|第二[个家种]?|第?二[个家种]?|甜的|甜点|都要|都可以|随便|你选)[呀吧啦呢！!。\s]*$/.test(text)){const choice=/火锅|第一|^一|热乎/.test(text)?'火锅':/第二|^二|面条/.test(text)?'面条':/甜/.test(text)?'甜点':m.food||'热乎的面条';m.plan=choice;return one('food-plan',`那就先记下${choice}。别只顾着说，饿了记得真的去吃点东西。`);}
  if(m.pending==='photo-choice'){
   const photo=photoResponse(text);
   if(photo.choice){m.photo=photo.choice;return one('photo-plan',`那就${m.photo}那张。你把照片收好，下次再给我拍一张更好看的。`);}
   if(photo.refusal)return one('photo-change','好，那张先不选。你想看哪一张，我们再商量。','photo-choice');
   if(photo.question)return one('photo-question','可以先看看，还没选定呢。你更喜欢哪一张？','photo-choice');
  }
  if(/给你发了张照片/.test(text))return one('photo-received','照片收到啦，这是在哪儿拍的？快跟我讲讲。');
  if(/给你发了个位置/.test(text))return one('location-received','位置收到啦。你这是想约我一起去吗？');
  const placeIntent=placeResponse(text);
  if(placeIntent.rejected){const lastChoice=placeIntent.actions.filter(item=>item.kind==='choice').at(-1);if(lastChoice&&m.place===lastChoice.place)return one('place-plan',`${m.place}，记下啦。先一起在地图里看看，想去的地方慢慢攒。`);return one('place-change','好，那这个地方先不去了。想换哪里，我们再慢慢商量。','place-choice');}
  if(placeIntent.uncertain&&!placeIntent.choice)return one('place-question','可以先聊聊，还没决定去哪儿。你比较想去哪里？','place-choice');
  if(m.pending==='place-choice'&&(placeIntent.choice||/^你选[呀吧啦呢！!。\s]*$/.test(text))){const place=placeIntent.choice||'洱海边';m.place=place;return one('place-plan',`${place}，记下啦。先一起在地图里看看，想去的地方慢慢攒。`);}
  if(m.pending==='activity-choice'&&/散步|吃|第一|第二|都要/.test(text))return /吃|第二/.test(text)?select('meal',pools.meal,'food-choice'):one('walk','那就散步。路上别光顾着看手机，抬头看看风景。','meeting');
  if(m.pending==='meeting'&&meetingAnswer(text)){m.plan=text;return one('meeting-plan',`“${text.slice(0,35)}”，先记在聊天里啦。到时候别忘了多带件外套。`);}
  if(m.pending==='meeting'&&/(?:不见|不约|不去|没空|没时间|取消|改天|去不了)/.test(text)){if(cancelsMeetingPlan(text,m.plan))delete m.plan;return one('meeting-change','好，那先不约这个时间。等你方便了，我们再商量。','meeting');}
  if(/晚安|睡觉|睡了|要睡|困了|做个好梦/.test(text))return select('sleep',pools.sleep);
  if(/^早[呀啊哦安好！!~～]*$|早上好|早安/.test(text))return select('morning',pools.morning,'day-plan');
  if(/(?:不想你|没想你|才没想你)/.test(text))return one('tease','好嘛，那先不逗你了。你今天在忙什么？');
  if(/想你|想我|想见你|想念/.test(text))return m.flirt===false?one('boundary','听见啦，我们就按你舒服的方式聊天。今天过得还好吗？'):select('missing',pools.missing);
  if(/喜欢你|爱你|爱我|亲亲|抱抱|牵手|牵着/.test(text))return m.flirt===false?one('boundary','听见啦，我们就按你舒服的方式聊天。今天过得还好吗？'):select('love',pools.love);
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
 const api={persona,createReply,modelHistory,explicitFact,forgetKeys,rememberExplicitFacts,isPauseRequest};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WangDialogue=api;
})(typeof window==='undefined'?globalThis:window);
