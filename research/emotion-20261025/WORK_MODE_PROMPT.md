# 发给 ChatGPT 工作模式的完整执行指令（首读）

你是《小圣的手机》项目的开发工程师和剧情交互设计师。**先读取 ZIP 包全部说明与 data/ 文件，再连接 GitHub 仓库 `kai-da-wang/xiaosheng-phone` 读取最新版源码，进行增量开发、测试、提交并自动部署原网址。**

## 核心目标
玩家在模拟微信中分别给薇薇、洋葱/木马、黑白魔女发消息时，三名角色会**以各自明显不同的语言与情绪**回复；能够记住玩家曾**明确自愿提供**的个人偏好，在合理时间点自然提及；对不尊重/越界问题明确表达边界；不能固定靠关键词反复回复同一句，更不能凭聊天想当然地声称双方是现实恋人。

## 仓库与约束
- Repo: `kai-da-wang/xiaosheng-phone`
- 当前静态站点：`https://kai-da-wang.github.io/xiaosheng-phone/`
- 保留当前 `dist` 页面外观、锁屏密码 `0520`、通讯录、照片/健身相册、微信联系人、所有原有作者创作故事、角色小王的回复、打赏功能与付款图片。**本次不碰支付流程和图片。**
- **不重写、不生成一个全新的仿站、不改 GitHub 仓库名称、不破坏旧存档。**
- 保留 `dist/content.js` 的角色 ID，避免使用昵称字符串作为数据库主键。不得将“洋葱”与“三三/珊珊”混为一人；“一根洋葱/一颗洋葱”账号昵称矛盾需保留待核验标记。

## 实施优先级（按顺序）
1. **检查并记录现有架构**：`dist/index.html`、`dist/content.js`、`dist/core.js`、`dist/phone-experience.js`、`dist/vivi-chat.js`、`dist/muma-chat.js`、`dist/monv-chat.js`、`dist/wang-chat-runtime.js`、`dist/wang-dialogue.js`，列出需改文件和冲突风险。用 `git status` 保持干净，不覆盖用户最近提交。
2. **新建轻量角色引擎**（推荐 `dist/persona-dialogue.js`、`dist/persona-chat-runtime.js`），读取 `data/characters.json` 或等价内嵌配置。参照随包 `examples/persona-engine.js`，不要生搬现成常量造成资源加载失败；无需 API Key 即可本地运行。
3. **无侵入接入微信发送**：在 `dist/phone-experience.js` 的 `send()` 已写入玩家消息后，当 `id in ['lead_vivi','lead_muma','lead_monv']` 时 enqueue；保留 `if(id===wang)R.enqueue(message)` 分支和其行为。角色之间必须**独立记忆、独立好感/信任/边界状态**。
4. **对话体验**：每次消息只回答一次（多次快速发送可防抖合并），使用 0.7–1.8 秒自然输入状态，可取消/中止自动回复，离开页面不会把回复插入错误聊天室；消息与角色状态持久化。回复默认 10–50 个汉字、1–3 句，偶尔一句话；优先回答玩家最后一句的具体内容而非绕回模板问“今天过得怎样”。
5. **真实细节与原创故事分离**：公开素材详见 `RESEARCH_AND_SOURCES.md`，不可把研究线索当真人私信或逐字原话。静态故事数组原封保留；新增原创情景必须标注为 `fictional_fan_scene`。公开事实需要人工逐字核验和素材授权后才能标为 `verified`，遵守已有 `PhoneCore.canQuote` 审核门槛。
6. **人设差异**：按照 `CHARACTER_BIBLE.md` 与 `data/characters.json`，同一句“你生气了吗”必须出现不同表达习惯；不能给三位女主同套文本改个名字。魔女不靠每三句话喊“沙县”；洋葱不靠每三句话喊“狗尾巴草”；薇薇不靠每三句话要求发照片。
7. **情绪与记忆**：遵守 `EMOTION_MEMORY_SPEC.md`；对亲密度变化采用缓慢、有上限、非付费的成长机制；不能用强迫恋爱、陪伴依赖或为付款解锁亲密作为系统默认目标。保留“删除此角色记忆/清除聊天数据”入口。
8. **回归测试**：按 `TEST_AND_RELEASE.md` 自动化+手测，手机尺寸优先，确认微信原本布局与滚动位置没有回归；确认开发者打赏只在原有位置，不被新角色聊天混入。
9. **GitHub 发布**：以主题明确的 commit 更新原主分支或经过用户授权的 PR 流程；确认 GitHub Pages 构建成功并**打开线上页面实际验证**。只有确认后才说发布成功；最终给出唯一首推链接、commit SHA、测试结果、风险/剩余待核验资料。

## 插入点（根据已读取的仓库代码，复查最新版）
- `dist/phone-experience.js` 第约 78 行：`function send(){ ... if(id===wang)R.enqueue(message); ... }`。在其旁添加三角色分支 `if (personaRuntime?.supports(id)) personaRuntime.enqueue(id,message)`。已有聊天消息落盘由 `S().chatMessages[id]` 管理，不要二次保存重复的玩家消息。
- `dist/phone-experience.js` 的 `messages=id=>[...story, ...window.CHAT_ORIGINALS[id], ...S().chatMessages[id]]` 已支持动态追加；自动回复统一 `{id,type:'text',from:'other',text,time,autoReply:true,replyTo:[...],replyOrigin:'local-persona'}`。
- `room()` 现仅在小王聊天室显示 `R.typingMarkup(...)`。拓展三位女主 typing 提示。
- `profileSheet()` 现只显示小王自动回复开关。拓展到另外三人，保证切换不会影响其他角色。
- `dist/core.js` 的 `defaults()` 新增 `personaV2` 存档结构（逐角色），`normalize()` 要做防御性合并和旧存档迁移，不改原 key、不丢照片/微信/小王资料。
- `dist/index.html` 需要在 `phone-experience.js` 前引入角色配置与引擎脚本，带版本查询参数以刷新缓存。

## 质量验收的硬性标准
- 三个角色均可输入文本、各自回复并记住用户明确提供的昵称、喜欢的食物等简单信息。
- 同一信息发送给三人，语气、关心点、幽默方式不同；用户不允许调情时立即停止调情。
- 断网仍能基本情景回复；如增加 AI 接口，API Key 必须在服务端、不得写进仓库客户端代码。
- 无跨角色串话、没有无限输入动画、不产生重复回复、不丢旧进度。
- 清理本地记忆后不再重提私人偏好。
- 页面显著但不破坏沉浸感地说明“粉丝同人创作 / 角色对话为虚构演绎，非真实私人聊天”。

## 执行方式
不需要再次征求“是否开始”。先做适度评估后直接实现与测试。研究缺口无法补齐时请合理降级为纯原创游戏人格并在发布说明中注明，不要编造事实。
