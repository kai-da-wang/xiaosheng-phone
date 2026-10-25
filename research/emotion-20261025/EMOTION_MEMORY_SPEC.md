# 三女主聊天交互技术规格（可离线运行）

## 1. 设计目标和非目标

**目标**：在纯静态 GitHub Pages 网页里，也能做“在同一个角色身上持续发生”的对话体验——有不同口吻、简单事实记忆、情绪变化、尊重边界、基本状态恢复。

**非目标**：不保证无限自由聊天和真人水平语言智能；不直接模仿真人私信；不以对话内容判断现实关系；不需要付费模型作为必选依赖。可以后期用服务端 AI 模型增强，但必须有稳健本地 fallback。

## 2. 建议数据结构（保留旧 key，逐联系人独立）

保留 `PhoneCore.key='xiaosheng-phone-v1'`；将以下内容增量加入 `defaults()` 及 `normalize()`，要用 schema 校验旧数据：

```json
{
  "personaV2": {
    "version": 1,
    "rooms": {
      "lead_vivi": {"autoReply": true,"affinity": 30,"trust": 50,"discomfort": 0,"mood": "neutral","lastReplyAt": 0,"lastTopic": null,"facts": {},"recentReplies": [],"conversationTurns": 0,"pending": null},
      "lead_muma": {"autoReply": true,"affinity": 25,"trust": 50,"discomfort": 0,"mood": "neutral","lastReplyAt": 0,"lastTopic": null,"facts": {},"recentReplies": [],"conversationTurns": 0,"pending": null},
      "lead_monv": {"autoReply": true,"affinity": 25,"trust": 50,"discomfort": 0,"mood": "neutral","lastReplyAt": 0,"lastTopic": null,"facts": {},"recentReplies": [],"conversationTurns": 0,"pending": null}
    }
  }
}
```

- `facts` 仅记录玩家明确说出的昵称/食物偏好/玩家提出的旅行地/游戏内共同约定；**不得根据猜测提取住址/健康/财务/秘密**。推荐 `facts` 限制 10 条，每条短于 80 字，可点按清除。
- 角色之间**不能共享** `facts`。即使玩家向薇薇自报姓名，魔女也不能“隔空知道”。
- 将动态自动回复追加到现有 `chatMessages[id]`，消息结构保持 `{id,type:'text',from:'other',text,time,autoReply:true,replyTo:[sourceIds],replyOrigin:'local-persona'}`。
- 不篡改 `VIVI_CHAT.messages`、`MUMA_CHAT.messages`、`MONV_CHAT.messages` 静态剧情；新增玩家消息和自动回复永远单独存动态列表。
- localStorage 满额时不崩溃：降级保留当前回复，给出非阻碍型 toast；不要擅自清空用户原有数据。

## 3. 回复工作流（先意图，再人格，再情绪，再文风）

1. 用户 `send()` 写入消息、保存 → 按角色 route 入队（去重 `id`）。
2. 本地意图识别：称呼/昵称、具体需求、回忆测试、照片、名场面、普通日常、情绪支持、越界、身份混淆、终止/关闭、危机。
3. 安全/边界优先：如果玩家说“不想调情”“别聊这个”，记忆 `flirtAllowed=false` 并立即遵守；如果问现实私密关系或要求真实私人信息，拒绝编造。
4. 事实记忆更新：只存玩家明确陈述且同意保留的简单偏好；用户更正“我不是广州人，我是...”时覆盖旧信息；用户问“你还记得我喜欢什么？”只回答已存内容，不能补猜。
5. 情绪更新（详见下）：亲密度影响**是否愿意分享普通游戏日常**，不能突破角色设定、隐私和玩家边界。
6. 使用此角色对应的词库/句型，优先直接回应上一句；若同主题连续 3 次则改换角度。`recentReplies` 内 6 次禁重复。
7. 延迟 0.7～1.8 秒展示 typing；离开聊天室时可以继续安全入库，**不能渲染进其他联系人的会话**。
8. 入库：唯一回复 ID，`replyTo` 指向本轮用户消息 ID；在重新加载后恢复，无重复。

## 4. 情绪系统（可解释、不过度数值游戏化）

保留五种基本 `mood`：

| 状态 | 触发 | 对话外观/行为 | 恢复 |
|---|---|---|---|
| `neutral` | 初始/无特别触发 | 短句、自在 | 互动可进入其他状态 |
| `warm` | 2 次以上真诚、有内容的积极互动；不只一句“我爱你” | 适度多聊，偶尔主动问具体问题 | 逐渐回到 neutral |
| `playful` | 轻松且尊重彼此的玩笑/梗 | 角色各自幽默，非强制暧昧 | 结束玩笑可回 neutral |
| `hurt` | 敷衍、言语冒犯或不守游戏内约定 | 清楚指出不舒服，回复收敛 | 真诚道歉 + 改正言辞，非瞬间清零 |
| `guarded` | 多次越界追问/骚扰 | 明确“不想聊”，可暂停回复 | 用户主动尊重边界后逐步恢复 |

数值建议：`affinity ∈ [0,100]`，`trust ∈ [0,100]`，`discomfort ∈ [0,5]`。

| 玩家行为 | affinity | trust | discomfort | 特别说明 |
|---|---:|---:|---:|---|
| 有内容的真诚/关心、尊重回复边界 | +1~2 | +1~2 | -1 | 不是每条都加；相同套路反复不刷分 |
| 轻松玩笑且对方接受 | +1 | 0~+1 | 0 | 避免固定撒娇 |
| 敷衍、不理会明确拒绝 | -2 | -4 | +1 | 当轮要说清楚不适 |
| 强迫告知隐私、逼问现实感情 | -4 | -6 | +2 | 先回答边界，再更新状态 |
| 真诚道歉并改变表达 | +0~1 | +1 | -1 | 不能一条“对不起”瞬间满血 |

- `guarded` 条件例：`discomfort >= 3`；但**第一次越界就应当拒绝**，不靠阈值才保护隐私。
- 亲密度是**游戏内氛围进展**，绝不是现实人物对玩家/小圣的实际感情。
- 不能因为连续发夸赞、送虚拟/真实打赏而快速涨好感；不读取付款状态、**任何金钱事件对情绪变量权重 = 0**。
- 时间与情绪恢复：本地游戏时间进入新一天，`discomfort` 可随时间逐步降低，但不抹掉明确设置的个人边界；不能强制凌晨催玩家继续聊天。

## 5. 女主独立性（硬规则）

- **薇薇**：重视具体事物和讨论平等。争执时会说“刚才这句让我不舒服”，偏对话澄清。
- **洋葱**：节奏慢、不催促，记得玩家已经同意的“小约定”。争执时更愿意留下沟通空间但不会被迫作决定。
- **魔女**：轻幽默，有原则；问私人安排时直说“这部分不聊”，不靠羞涩回避所有话题。
- 不能把三人写成同一套“吃了吗/想你啦/抱抱”随机模板。
- 禁止反复提同一名场面：**同一主题 8 个回合最多主动提 1 次**（用户主动问则可适度响应）。

## 6. 可信度门槛

`data/evidence.json` 含 `tier` 和 `verification_status`。`sceneMode` 必须区分：

- `documented_public_candidate`：可链接公开片段，但未经逐字/授权复核；可作为原创创作灵感，不显示“真人说过”。
- `fictional_fan_scene`：原创剧本；展示时可在聊天详情或游戏说明统一声明“创作演绎”。
- `verified_public_quote`：仅当 `status=verified`, `timestampSec`, `speaker`, `sourceUrl`, `rights=cleared` 同时存在时启用原话模式。

不要从图片推断“他们一定相爱”或“女主现在真的心碎”等心理事实。对真人的联络/实时位置/手机号/私密约定一律不生成。

## 7. 低成本落地技术（优先纯前端）

```
index.html
  content.js -> ...
  persona-data.js (或压缩后 JSON 由 fetch 加载)
  persona-dialogue.js (本地规则 + 角色专有文本池)
  persona-chat-runtime.js (防抖队列/typing/写入/取消/持久化)
  wang-dialogue.js (不动)
  wang-chat-runtime.js (不动)
  muma-chat.js / monv-chat.js / vivi-chat.js (不动)
  phone-experience.js (最小接入)
  app.js
```

不要将整个站点改成 React/Next.js、不要增加运行时后端必需依赖。已有端点的密钥绝不能暴露在前端 JS。若支持真实大模型：仅调用用户配置的安全 HTTPS 服务端代理，发必要的非敏感上下文；断网/超时 5–9 秒回退本地引擎；任何模型输出都经长度校验、身份/隐私边界过滤、HTML 转义后渲染。

### 简化参考接口

```js
const output = PersonaDialogue.createReply({
  roomId: 'lead_muma',
  message: '你记得我喜欢吃什么吗？',
  history: [...],
  memory: state.personaV2.rooms['lead_muma']
});
// => { text, memory, intent, safety, replyOrigin: 'local-persona' }
```

## 8. 打字状态和并发处理

- 每个 `roomId` 有独立 `pending.jobId`，`ids`；新发送消息可以取消之前的 debounce 并合并消息文本（最多最近 3 条）后生成**一条**回复。
- `send()` 返回前完成 `save()`、渲染消息。回复完成前如玩家禁用自动回复，则不写回。
- `replyTo` 去重：如果历史存在已对 `job.ids` 响应的消息，不再生成。
- 切换/关闭聊天时取消 DOM 操作但安全保存结果；重新进入聊天应显示历史。
- 不因开发者打赏彩蛋触发两次回复；已有彩蛋脚本以输入表单事件监听，新增引擎应避免监听同一事件再发送一条玩家消息。

## 9. 用户可控制

- 聊天详情页：`自动回复：开/关`、`清除本角色的对话记忆`。
- 清除角色记忆只清 `personaV2.rooms[roomId].facts` / 好感状态 / recentReplies，不自动删除玩家已有对话记录，除非另有明确按钮。
- 若用户选择彻底删除：提供单独确认，清 `chatMessages[roomId]` 的动态记录；**保留静态故事数据**。
- 给游戏说明页增加清晰简短同人免责声明，而非每句话都打断沉浸感。
