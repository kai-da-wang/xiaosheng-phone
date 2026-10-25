# 《小圣的手机》2.0：三位女主情感互动与人物灵魂 · Work Mode 更新包

**生成日期：2026-10-25 | 目标仓库：`kai-da-wang/xiaosheng-phone` | 官方试玩入口：`https://kai-da-wang.github.io/xiaosheng-phone/`**

## 这是做什么的
该包用于让 ChatGPT 工作模式在**现有代码基础上增量开发**三位角色的情景聊天，形成「有辨识度的人设 + 记住玩家明确说过的话 + 有界限的情绪变化 + 可追溯名场面」。

- **薇薇** (`lead_vivi`)：温和、率直，关注具体细节及平等交流；证据不全，定位为受片段启发的**同人性格方案**。
- **木马／洋葱** (`lead_muma`)：适度慢热、尊重对方工作与节奏，「六分熟」线索；“狗尾巴草留给我当纪念”为用户提供的名场面，**尚待原视频逐字核验**。
- **魔女／黑白魔女** (`lead_monv`)：平和的生活流幽默、边界清楚、独立生活节律；沙县、看电影、叫错“暗黑魔女”是可定位的**公开视频/直播切片线索**，仍需逐句人工核验。

> **重要**：照片无法证明一个人的说话风格、内心情绪或关系状态。本包明确分开「公开资料线索」「粉丝反馈/自动转写」「开发者原创剧本」，不能把虚构微信当成真人私信。研究资料不能保证 AI 100%复刻真人话语；能显著减少角色混同与机械重复。

## 文件导航（建议阅读顺序）
1. `WORK_MODE_PROMPT.md`：**工作模式第一优先读取**，含确切开发任务与仓库对接点。
2. `RESEARCH_AND_SOURCES.md`：公开可访问的抖音线索、可信度与核验缺口。
3. `CHARACTER_BIBLE.md`：三个角色差异、独立性格、话术和原创情景。
4. `EMOTION_MEMORY_SPEC.md`：状态机、持久记忆、回复策略、隐私、接口/降级。
5. `TEST_AND_RELEASE.md`：验收脚本、回归测试、发布要求。
6. `data/characters.json`：机器可读取的角色卡。
7. `data/evidence.json`：机器可读取的来源列表与证据等级。
8. `data/scenes.json`：标注为原创的分支示例剧情；不可标为真实聊天。
9. `data/conversation_tests.json`：预期行为与角色差异检查用例。
10. `examples/persona-engine.js`：可在 Node 和浏览器加载的**规则引擎参考实现**，工作模式需要适配实际项目架构。
11. `tests/test_persona_engine.cjs`：参考引擎回归测试（`node tests/test_persona_engine.cjs`）。

## 当前仓库已经有哪些功能（2026-10-25 接口检查）
- `dist/content.js` 包含 `lead_vivi`、`lead_muma`、`lead_monv` 人物对象。
- `dist/vivi-chat.js`、`dist/muma-chat.js`、`dist/monv-chat.js`：既有**作者创作**的静态聊天故事；不得覆盖或伪称真实记录。
- `dist/phone-experience.js` 里 `send()` 将玩家消息写入 `chatMessages[id]`；目前只有小王 `lead_wang_xiaomiao` 会触发 `WangChatRuntime.enqueue`。
- `dist/wang-dialogue.js` 和 `dist/wang-chat-runtime.js`：可参考现有小王的本地自动回复、持久化、打字状态和可选 HTTPS endpoint 实现。
- `dist/core.js` 以 `localStorage` 保存 `xiaosheng-phone-v1`，`PhoneCore.normalize` 目前 `...raw` 合并已存数据。
- 现有的微信 ¥0.99 自愿支持、两张健身图、密码 0520 等功能必须保持现状。

## 交付预期
工作模式应**实际改动源码、测试、提交至 GitHub 并验证 GitHub Pages**，而不是只回复策划文案。不要重建整个网站；不要把 ZIP 解压后直接覆盖仓库。

## 实证说明
文中的公开视频页面与抖音 AI 文稿存在自动识别误差、切片断章风险。没有亲自核对原视频音轨/逐句字幕前，一律标为「候选/待复核」。`content.js` 中现有 `PhoneCore.canQuote()` 需要 `status='verified'`、说话者、时间戳、来源、rights='cleared'；研究线索**不能绕过**这项逻辑。
