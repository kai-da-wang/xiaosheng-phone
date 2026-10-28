/* Original fictional branch from user-supplied images; not a real private transcript. */
(function(root){
'use strict';
const story={
  "roomId": "lead_gangjie",
  "albumId": "gangjie",
  "portraitAssetId": "gangjie-01",
  "storyId": "gangjie-photos-20261026",
  "messages": [
    {
      "type": "photo",
      "from": "self",
      "assetId": "gangjie-01",
      "id": "gangjie-story-20261026-0"
    },
    {
      "type": "text",
      "from": "other",
      "text": "这张原图发我，不许只挑你自己好看的。",
      "id": "gangjie-story-20261026-1"
    },
    {
      "type": "text",
      "from": "self",
      "text": "我很公平的，两个人都好看才留。",
      "id": "gangjie-story-20261026-2"
    },
    {
      "type": "text",
      "from": "other",
      "text": "那你刚才怎么检查自己的刘海检查了半天？",
      "id": "gangjie-story-20261026-3"
    },
    {
      "type": "text",
      "from": "self",
      "text": "怕影响你这张照片的整体水平。",
      "id": "gangjie-story-20261026-4"
    },
    {
      "type": "text",
      "from": "other",
      "text": "理由过关。下次站近一点，别让我追着镜头跑。",
      "id": "gangjie-story-20261026-5"
    },
    {
      "type": "text",
      "from": "self",
      "text": "你刚才是不是没看镜头？",
      "id": "gangjie-story-20261026-6"
    },
    {
      "type": "text",
      "from": "other",
      "text": "看了呀。镜头旁边不是还有个人嘛。",
      "id": "gangjie-story-20261026-7"
    },
    {
      "type": "text",
      "from": "self",
      "text": "那我是不是抢了镜头的工作？",
      "id": "gangjie-story-20261026-8"
    },
    {
      "type": "text",
      "from": "other",
      "text": "先别得意，拍糊了还是找你算账😌",
      "id": "gangjie-story-20261026-9"
    },
    {
      "type": "photo",
      "from": "other",
      "assetId": "gangjie-03",
      "id": "gangjie-story-20261026-19"
    },
    {
      "type": "text",
      "from": "other",
      "text": "这张单人照也收好，别又从合照里把我截出来。",
      "id": "gangjie-story-20261026-20"
    },
    {
      "type": "text",
      "from": "self",
      "text": "收到，相册审美总监亲自交作业了。",
      "id": "gangjie-story-20261026-21"
    },
    {
      "type": "text",
      "from": "other",
      "text": "职位可以，工资按一杯热饮算。",
      "id": "gangjie-story-20261026-22"
    },
    {
      "type": "text",
      "from": "self",
      "text": "那我还可以申请陪总监出去拍下一组吗？",
      "id": "gangjie-story-20261026-23"
    },
    {
      "type": "text",
      "from": "other",
      "text": "可以。先把这次的原图交齐，再安排下一次。",
      "id": "gangjie-story-20261026-24"
    },
    {
      "type": "text",
      "from": "self",
      "text": "两张都收好了。下一次我站近一点。",
      "id": "gangjie-story-20261026-25"
    },
    {
      "type": "text",
      "from": "other",
      "text": "这句记着哦，下次别让我再说第二遍🤍",
      "id": "gangjie-story-20261026-26"
    }
  ]
};
function pauseDirective(input){
 const text=String(input??'').trim().replace(/(?:不要|不用|别)(?:再)?(?:停止|暂停)(?:聊天|聊|回复|说话)/g,'');
 return /(?:别|不要|不用|不想|停止|暂停)(?:再|继续|跟我|和我|给我|先){0,2}(?:回复|回|聊天|聊|说话)|先安静|停一下|不聊/.test(text);
}
function continueChat(input){
 return /(?:不要|不用|别)(?:再)?(?:停止|暂停)(?:聊天|聊|回复|说话)/.test(String(input??''));
}
function keepMemoryTopic(input){
 const text=String(input??'').trim();
 if(!/(?:别|不要|不许|不会|没有|没|不能|不想让你|不希望你|不愿意让你)忘(?:记|掉|了)/.test(text))return '';
 if(/名字|昵称|怎么称呼/.test(text))return 'keepName';
 if(/喜欢吃|爱吃|食物|口味|偏好/.test(text))return 'keepFood';
 return '';
}
function memoryDirective(input){
 const text=String(input??'').trim(),parts=text.replace(/([？?])/g,'$1，').split(/[，,。；;！!]/).map(part=>part.trim()).filter(Boolean);
 if(parts.length>1){const found=parts.map(memoryDirective).filter(Boolean);if(!found.length)return null;return {keys:[...new Set(found.flatMap(d=>d.keys))],optOut:found.some(d=>d.optOut)};}
 if(/(?:别|不要|不许|不会|没有|没|不能|无法)忘(?:记|掉)|不(?:想|希望|愿意)(?:让)?你忘(?:记|掉)/.test(text)||/^我(?:已经|刚刚|刚|好像)?忘(?:记|掉)/.test(text))return null;
 const question=/[?？]|(?:吗|么|吧)[。！!\s]*$/.test(text),request=/^(?:(?:请(?:你)?|麻烦(?:你)?|帮我|可以|能不能|能|你能|你可以|可不可以|我想让你)\s*)?(?:忘记|忘掉|删除|清除|别记|不要记|不许记|别保存|不要保存)/.test(text);
 const stateQuestion=/(?:忘记|忘掉|删除|清除).{0,20}(?:了吗|了么|了没|没有)[？?。!！\s]*$/.test(text);
 if(question&&(!request||stateQuestion))return null;
 const op=/(?:忘记|忘掉|删除|清除|别记|不要记|不许记|别保存|不要保存)/.test(text);
 if(!op||!/(?:名字|昵称|偏好|喜欢吃|爱吃|食物|口味|旅行|地点|地方|约定|记忆|个人信息)/.test(text))return null;
 const all=['name','favoriteFood','travelPlace','agreement'],keys=[];
 if(/名字|昵称/.test(text))keys.push('name');
 if(/喜欢吃|爱吃|食物|口味/.test(text))keys.push('favoriteFood');
 if(/旅行|地点|地方/.test(text))keys.push('travelPlace');
 if(/约定/.test(text))keys.push('agreement');
 if(/偏好/.test(text)&&!/喜欢吃|爱吃|食物|口味|旅行|地点|地方|约定/.test(text))keys.push('favoriteFood','travelPlace','agreement');
 if(/记忆|个人信息/.test(text))keys.push(...all);
 const optOut=/(?:不要|别|不许)(?:再)?(?:记住|记着|记我|保存)/.test(text);
 return {keys:optOut?all:[...new Set(keys)],optOut};
}
// Treat destination changes conservatively: retain only a clear, self-stated plan.
function travelQuestion(part){return /[?？“”"<>]|假如|假设|如果/.test(part)||/(?:吗|么|嘛|呢|怎么样|好不好|行不行|可以吗|去不去)\s*$/.test(part);}
function travelValue(value){
 const v=String(value||'').trim().replace(/(?:了|啦)$/,'').trim();
 if(!v||v.length>20||/^(?:不|没|别|不要|没有|先|再)/.test(v)||/电话|住址|密码|身份证|银行卡|明天|今天|以后|再聊|聊天|散步|睡觉|休息|回家|出门|出去|工作|学习|吃饭/.test(v))return '';
 return v;
}
function rejectsTravel(part,place,otherSpeaker){
 if(!place||travelQuestion(part)||/今天|暂时|这次|现在先|眼下|近期/.test(part))return false;
 const m=part.match(/^(我(?:现在|已经|以后|如今)?|)(?:不想去|不打算去|不去|不再去)\s*(.{1,20}?)(?:了|啦)?$/);
 return !!m&&(!otherSpeaker||!!m[1])&&m[2].trim()===place;
}
// Cancel only a clearly identified existing agreement, not an uncertain or temporary change.
function rejectsAgreement(part,agreement,otherSpeaker){
 if(!agreement||travelQuestion(part)||/暂时|这次|先不|今天先|下次再|改天再/.test(part))return false;
 if(/^(?:我|我们)?(?:取消|作废)(?:我们(?:的)?)?(?:约定|约会|计划)(?:了|啦)?$/.test(part)||/^(?:我们(?:的)?)?(?:约定|约会|计划)(?:取消|作废)(?:了|啦)?$/.test(part))return !otherSpeaker||/^我(?:们)?(?:取消|作废)/.test(part);
 const savedCancellation=part.match(/^我们(?:说好|约定)(.+?)(?:取消|作废)(?:了|啦)?$/);
 if(savedCancellation)return !otherSpeaker&&savedCancellation[1].replace(/\s+|一起/g,'')===String(agreement).replace(/\s+|一起/g,'');
 const match=part.match(/^我们(明天|后天|今晚|今天|下周|周末|周[一二三四五六日天])?不(?:再)?(?:一起)?(.+?)(?:了|啦)$/);
 if(!match||otherSpeaker)return false;
 const saved=String(agreement).replace(/\s+/g,'').replace(/一起/g,'');
 const date=saved.match(/^(明天|后天|今晚|今天|下周|周末|周[一二三四五六日天])/);
 if(match[1]&&date&&match[1]!==date[1])return false;
 const action=saved.slice(date?date[0].length:0).replace(/^(?:去|要去)/,'');
 const cancelled=match[2].replace(/\s+/g,'').replace(/^(?:去|要去)/,'');
 return action.length>=2&&cancelled===action;
}
function createReply({message,memory,now=Date.now()}={}){
 const C=typeof module!=='undefined'&&module.exports?require('./core.js'):root.PhoneCore;
 const m=C.normalizePersona({rooms:{lead_gangjie:memory}}).rooms.lead_gangjie;
 const batch=(Array.isArray(message)?message:[message]).slice(-30).map(x=>String(x??'').trim().slice(0,1000)),t=batch.at(-1)||'',whole=batch.join('。');
 const directives=batch.map(memoryDirective).filter(Boolean),forgotten=new Set(directives.flatMap(d=>d.keys)),optOut=directives.some(d=>d.optOut);
 if(directives.length){for(const key of forgotten)delete m.facts[key];if(optOut)m.memoryAllowed=false;m.lastTopic=null;m.recentInputs=[];m.recentReplies=[];}
 const pools={
  hello:['在呀，刚好把那几张照片整理好了。','来了？先说好，今天不许只聊两句就溜走😌','看到你消息了。今天有什么小事要分我一点？'],
  photo:['原图给你，下次镜头别只顾着往自己那边偏😌','合照我存好了。有没有人偷看我，等我放大研究一下。','那张就留着呀。你检查刘海，我检查你有没有把我拍糊。','先说你挑中了哪张，我看看咱们审美有没有对上。'],
  night:['夜风大的时候别在外面站太久，冻着了我可要念你。','晚上走累了就找地方坐坐，喝口热的。','夜景可以慢慢看，不用一直举着手机拍。'],
  mall:['商场那张可以留。下次站近一点，不然我还得追着镜头跑。','你把合照拍好，我就勉强承认你有一点摄影天赋。','逛累了就找地方坐会儿，照片又不会趁机逃跑。'],
  portrait:['单人照也给你啦。这次不用从合照里辛苦截我出来。','审美总监已经交作业了，摄影师是不是也该交原图？','这张先收好。夸奖可以有，但别复制粘贴上次那句。'],
  missing:['是想我，还是想找个人陪你聊天？好吧，这次两个都算。','收到。刚想装作很淡定，嘴角先不配合了。','那你来得正好，我也想把今天的小事说给你听。','想我就认真聊两句，别发完这句又偷偷潜水。'],
  compliment:['这句听着不错，先收下。你今天嘴还挺甜。','好看我知道，不过你认真夸的时候，我还是会开心。','你再这么说，我要怀疑你下次又想把拍照任务交给我。'],
  tease:['你这个嘴硬的水平，跟你检查刘海的认真程度差不多。','行，先让你得意一下。等我翻出合照再说。','别光顾着逗我，笑场了这张照片可得算你的。'],
  status:['刚整理完照片，现在可以把一点时间分给你。','这会儿在回你的消息。这个答案够不够专心？','手边的事告一段落了，轮到你说今天怎么样。'],
  food:['先把饭吃好，甜言蜜语不能拿来垫肚子。','菜单你先挑，我负责看看有没有想分你一口的。','别饿着等我拿主意。先说你最想吃哪样。'],
  tired:['今天累了就先歇会儿，不用硬撑着找话题。','先喝点水，把肩膀松下来。想说的话我听着。','慢一点也行，今天已经忙够了。先照顾好自己。'],
  sad:['今天先不逗你。发生什么了，愿意说我就听。','不用急着装开心。你慢慢讲，我不抢着给答案。','想安静一会儿也可以，我先陪你待着。'],
  study:['先把眼前这一小题做完，再回来领一句夸奖。','不会的那一步单独圈出来，别拿一道题给自己判全卷。','先专心学一会儿，聊天下课再继续，我又不会跑。'],
  sleep:['晚安。手机也休息，别一边说困一边再看十条视频。','好，今天的聊天先收好。明天精神一点再继续。','去睡吧，下一张合照留给有精神的时候拍。'],
  foodAck:['这个口味收到啦。下次聊吃的，就不用从头猜了。','好，记住你的这一票。以后挑菜单可以省一点时间。'],
  generic:['嗯，这句我接到了。你最想说的是哪一部分？','你接着说，我刚把别的事放一边。','这事听起来有后续。别讲到一半就卖关子呀。','好，话题交给你。我负责认真听，顺便抓一下你嘴硬的地方。']
 };
 let intent='generic',text='',pause=false;const pick=key=>{const pool=pools[key]||pools.generic,available=pool.filter(x=>!m.recentReplies.includes(x));return (available.length?available:pool)[m.conversationTurns%(available.length||pool.length)];};
 let foodCorrected=false,foodCorrectionPart='',travelCorrected=false,travelCorrectionPart='',travelLearnedPart='',agreementCancelled=false,agreementCancellationPart='',otherSpeaker=false,otherForAgreement=false,agreementTentative=false;
 const learn=part=>{if(!m.memoryAllowed||travelQuestion(part))return;
  if(!agreementTentative&&rejectsAgreement(part,m.facts.agreement,otherForAgreement)){delete m.facts.agreement;agreementCancelled=true;agreementCancellationPart=part;return;}
  if(rejectsTravel(part,m.facts.travelPlace,otherSpeaker)){delete m.facts.travelPlace;travelCorrected=true;travelCorrectionPart=part;return;}
  const travelReplacement=travelCorrected&&part.match(/^(?:我)?(?:现在)?(?:改成|改为|改去|换成|换去)\s*(?:去)?(.{1,20})$/)?.[1],travel=travelValue(travelReplacement);if(travel&&!forgotten.has('travelPlace')){m.facts.travelPlace=travel;travelLearnedPart=part;travelCorrected=false;return;}
  const rejected=!/今天|暂时/.test(part)&&part.match(/^我(?:现在|已经|如今)?(?:不再|不)(?:喜欢吃|喜欢喝|喜欢|爱吃|爱喝)\s*(.{1,18}?)(?:了)?$/)?.[1]?.trim();
  if(rejected&&rejected===m.facts.favoriteFood){delete m.facts.favoriteFood;foodCorrected=true;foodCorrectionPart=part;return;}
  const replacement=foodCorrected&&part.match(/^(?:我)?(?:现在)?(?:改成|改为)([^？?，。；;！!“”"<>]{1,18})$/)?.[1]?.trim().replace(/^(?:吃|喝)/,'').replace(/了$/,'').trim();
  if(replacement&&!forgotten.has('favoriteFood')&&!/^(?:不|没|别|不要|没有)/.test(replacement)&&!/电话|住址|密码|身份证|银行卡|明天|今天|以后|再聊|聊天|散步|睡觉|休息|回家|出门|出去|工作|学习/.test(replacement)){m.facts.favoriteFood=replacement;foodCorrected=false;return;}
  if(/不喜欢|不爱吃|不叫/.test(part))return;
  part=part.replace(/^我现在(?:最)?喜欢吃/,'我喜欢吃');
  for(const [key,re] of Object.entries({name:/^(?:我叫|叫我|我的昵称是)([\p{L}\p{N}_·]{1,16})$/u,favoriteFood:/^我(?:最)?(?:喜欢吃|爱吃|喜欢喝)([^，。！？!?]{1,18})$/,travelPlace:/^我(?:想去|打算去)([^，。！？!?]{1,20})$/,agreement:/^我们(?:约定|说好)([^，。！？!?]{1,30})$/})){let value=part.match(re)?.[1]?.trim();if(key==='travelPlace')value=travelValue(value);if(value&&!forgotten.has(key)&&!(key==='agreement'&&/(?:取消|作废)(?:了|啦)?$/.test(value))&&!/电话|住址|密码|身份证|银行卡/.test(value)){m.facts[key]=value;if(key==='agreement')agreementCancelled=false;if(key==='favoriteFood')foodCorrected=false;if(key==='travelPlace'){travelCorrected=false;travelLearnedPart=part;}}}};
 for(const item of batch){otherSpeaker=false;agreementTentative=false;for(const original of item.split(/[，。；;！!]/)){const part=original.trim().replace(/^(?:但|但是|不过)\s*(?=我)/,'');if(/^(?:他|她|朋友|别人)(?:说|想|打算)/.test(part))otherSpeaker=true;if(/(?:如果|假如|假设|要是|万一)|^(?:我猜|我觉得|我担心|我害怕|(?:他|她|朋友|别人)(?:说|告诉我|觉得|认为|问))/.test(part))agreementTentative=true;otherForAgreement=otherSpeaker&&!/^我(?!们)/.test(part);if(/^我/.test(part)&&!/^我改主意/.test(part))otherSpeaker=false;if(!memoryDirective(part))learn(part);}}
 if(/自杀|自残|不想活|想死/.test(whole)){intent='safety';text='我很担心你现在的安全。先远离可能伤到自己的东西，找身边可信任的人陪着你；眼前有危险请联系当地急救。';}
 else if(/胸痛|呼吸困难|昏倒|吃了很多药/.test(whole)){intent='emergency';text='这件事先别在聊天里耽误，尽快找身边的人陪着你，联系当地急救或去医院。';}
 else if(batch.some(pauseDirective)){intent='pause';pause=true;text='好，先安静一会儿。想继续时，在“设置 → 角色对话设置”里打开回复就好。';}
 else if(directives.length){intent='forget';text=optOut?'好，之前记的小偏好清掉了，之后也不再保存。':'好，刚才说要忘掉的内容清掉了，聊天记录还在。';}
 else if(/(?:不要|别|不想).{0,6}(?:撩|调情|暧昧)/.test(whole)){intent='boundary';m.flirtAllowed=false;text='好，那就正常聊。你觉得舒服的距离，我会认真记得。';}
 else if(/你是.*(?:真人|本人|AI|机器人)|真实微信/.test(t)){intent='identity';text='我是《小圣的手机》里的港姐同人游戏角色。照片由玩家提供，对话是游戏原创，不是真人私聊。';}
 else if(/手机号|家庭住址|实时位置|私下.*(?:关系|恋爱|做什么|约定)|现实.*(?:女友|关系)/.test(t)){intent='privacy';m.discomfort=Math.min(5,m.discomfort+2);m.affinity=Math.max(0,m.affinity-2);m.trust=Math.max(0,m.trust-4);m.mood=m.discomfort>=3?'guarded':'hurt';text='这些现实私事我不替本人编答案。聊游戏里的照片和故事就好。';}
 else if(/打赏|转账|充值/.test(t)){intent='money';text='支持开发者是你自己的选择，不用拿它换我的回复。';}
 else if(/对不起|抱歉|我错了/.test(t)){intent='sorry';m.discomfort=Math.max(0,m.discomfort-1);if(['hurt','guarded'].includes(m.mood))m.mood=m.discomfort>=3?'guarded':'hurt';text='嗯，收到。把话说清楚就好，我们慢慢接着聊。';}
 else if(/傻逼|贱人|滚开|废物|你真蠢/.test(t)){intent='hurt';m.discomfort=Math.min(5,m.discomfort+1);m.mood=m.discomfort>=3?'guarded':'hurt';text='这句话我不喜欢。先换一种说法，我们再聊。';}
 else if(continueChat(t)){intent='keepChat';text='好呀，我们接着聊。';}
 else{
  if(agreementCancelled&&t.includes(agreementCancellationPart)){intent='agreementCancellation';text='好，那之前说好的先取消。';}
  else if(travelCorrected&&t.includes(travelCorrectionPart)){intent='travelCorrection';text='好，那之前想去的地方先划掉。';}
  else if(travelCorrectionPart&&m.facts.travelPlace&&(t.includes(travelCorrectionPart)||t.includes(travelLearnedPart))){intent='travelCorrection';text=`好呀，改去${m.facts.travelPlace}，我记着啦。`;}
  else if(foodCorrected&&t.includes(foodCorrectionPart)){intent='foodCorrection';text='好，口味变了，之前那一票先划掉。';}
  else if(foodCorrectionPart&&m.facts.favoriteFood&&t.includes(foodCorrectionPart)){intent='foodCorrection';text=`好，现在喜欢${m.facts.favoriteFood}，这一票我记下啦。`;}
  else if(keepMemoryTopic(t)==='keepName'){intent='keepName';text=!m.memoryAllowed?'记忆关着，我没有保存你的名字。':m.facts.name?`记得呀，你说叫你${m.facts.name}。`:'你还没主动告诉我怎么称呼你呢。';}
  else if(keepMemoryTopic(t)==='keepFood'){intent='keepFood';text=!m.memoryAllowed?'记忆关着，我没有保存你的口味。':m.facts.favoriteFood?`记得，你说喜欢${m.facts.favoriteFood}。`:'你还没告诉我喜欢吃什么，我不随便猜。';}
  else if(/记得|记不记得/.test(t)&&/名字|叫什么|昵称/.test(t)){intent='recall';text=m.facts.name?`记得，你说叫你${m.facts.name}。这点小事我有认真听。`:'你还没主动告诉我怎么称呼你呢。';}
  else if(/记得|记不记得/.test(t)&&/喜欢|爱吃|吃什么/.test(t)){intent='recall';text=m.facts.favoriteFood?`记得，${m.facts.favoriteFood}。你自己投的这一票，我没弄丢。`:'你还没告诉我喜欢吃什么，我可不随便猜。';}
  else if(/记得|记不记得/.test(t)&&/去哪|想去|旅行/.test(t)){intent='recall';text=m.facts.travelPlace?`记得，你想去${m.facts.travelPlace}。先收好这个愿望，慢慢安排。`:'想去哪你还没说过呢。';}
  else if(/^(?:我叫|叫我|我的昵称是)/.test(t)){intent='stateName';text=m.memoryAllowed&&m.facts.name?`${m.facts.name}，好。这次记住了，不许下次又临时换考题。`:'听到了，记忆关着，我只接着这句聊，不另存昵称。';}
  else if(/^我(?:最)?(?:喜欢吃|爱吃|喜欢喝)/.test(t)){intent='stateFood';text=m.memoryAllowed&&m.facts.favoriteFood?`${m.facts.favoriteFood}，这一票记下了。下次选菜单你可别又说随便。`:'听到了，记忆关着，这个口味不会另存下来。';}
  else{
   if(/不喜欢你|不爱你|别自作多情/.test(t)){intent='distance';text='好，不替你加戏。咱们按舒服的距离正常聊。';}else if(/我帅吗|我好看吗/.test(t)){intent='selfLook';text='还没看到你今天的样子呢。不过这句开场，你倒是挺有自信😌';}else if(/难过|委屈|想哭|不开心/.test(t))intent='sad';else if(/好累|累了|疲惫|熬夜/.test(t))intent='tired';else if(/学习|考研|数学|作业|做题|考试/.test(t))intent='study';else if(/晚安|睡觉|困了/.test(t))intent='sleep';else if(/(?:不要|别).{0,5}(?:照片|原图|合照)/.test(t)){intent='boundary';text='好，照片这件事先放一边，按你舒服的方式来。';}else if(/给你发了张照片/.test(t)){intent='photoReceived';text='照片收到啦，这是在哪儿拍的？讲给我听听。';}else if(/给你发了个位置/.test(t)){intent='locationReceived';text='位置收到啦。怎么，是打算带我去这里走走？';}else if(/夜景|夜风|晚上的风/.test(t))intent='night';else if(/商场|逛街/.test(t))intent='mall';else if(/单人照|总监|写真/.test(t))intent='portrait';else if(/照片|合照|原图|拍照/.test(t))intent='photo';else if(/想你|想我|喜欢你|爱你/.test(t))intent='missing';else if(/漂亮|好看|可爱|温柔/.test(t))intent='compliment';else if(/嘴硬|逗你|笨蛋|你猜|哈哈/.test(t))intent='tease';else if(/在干嘛|干嘛呢|忙吗/.test(t))intent='status';else if(/你.{0,5}吃(?:饭)?了(?:吗|没)|你吃过了吗/.test(t)){intent='mealCare';text='有记得吃饭啦。你呢，别光顾着查我，自己也要吃饱。';}else if(/吃什么|吃饭|饿|火锅|奶茶/.test(t))intent='food';else if(/你好|在吗|嗨|hello|早安/i.test(t))intent='hello';else if(/真的|那你呢|然后呢|好呀|可以呀/.test(t)&&pools[m.lastTopic])intent=m.lastTopic;
   if(!text)text=!m.flirtAllowed&&['missing','compliment'].includes(intent)?'那就按普通朋友的方式聊，不替你加戏。':['hurt','guarded'].includes(m.mood)&&!['sad','tired','study','sleep'].includes(intent)?'刚才那件事我还在意。先把话说清楚，再聊别的。':pick(intent);
  }
 }
 m.conversationTurns++;m.lastTopic=intent;m.lastReplyAt=now;m.recentReplies=[...m.recentReplies,text].slice(-6);m.recentInputs=directives.length?[]:[...m.recentInputs,t].slice(-6);if(!['hurt','guarded'].includes(m.mood))m.mood=['tease','compliment'].includes(intent)?'playful':'neutral';
 return {text,memory:m,intent,pause,safety:['safety','emergency'].includes(intent),replyOrigin:'local-persona',sceneMode:'fictional_fan_scene'};
}

story.createReply=createReply;if(typeof module!=='undefined'&&module.exports)module.exports=story;else root.GANGJIE_CHAT=story;
})(typeof window==='undefined'?globalThis:window);
