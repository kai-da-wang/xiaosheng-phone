# DeepSeek + 阿里云百炼：小圣手机网页的 AI 女生与语音配置

**这是网站，不是需要安装的私人 App。** GitHub Pages 仍负责网页，Render Node Web Service 负责隐藏两家平台的密钥。已写好：`server/girls-ai.mjs`（AI 文字与 TTS 网关）、`dist/ai-config.js`（只填公开后端域名），前端配置为空时继续离线情景回复。

## 1. 获取两个 API Key
- DeepSeek：访问 https://platform.deepseek.com → API Keys → 创建。推荐 `deepseek-flash`（2026-10 新版，`deepseek-chat` 是旧模型名），按量计费。
- 阿里云百炼：https://bailian.console.aliyun.com → 开通语音模型，在北京地域生成 Key；推荐 `qwen3-tts-flash`，使用预置音色，非真人声音复刻。
- 密钥**只填写到 Render Environment**，严禁提交 GitHub、聊天消息、照片或 `dist` 内。泄露立即吊销。

## 2. Render 部署网关
1. Render → New → Web Service → Connect `kai-da-wang/xiaosheng-phone`（若无法连接，需在 Render 授权 GitHub 仓库）。
2. Runtime：Node，Build Command：`echo ready`，Start Command：`node server/girls-ai.mjs`；本服务器不需要第三方 npm 包。
3. Render → Environment 添加：

| 名称 | 值 |
|---|---|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek Key |
| `DEEPSEEK_MODEL` | `deepseek-flash` |
| `DASHSCOPE_API_KEY` | 你的阿里云百炼 Key |
| `DASHSCOPE_BASE_URL` | `https://dashscope.aliyuncs.com/api/v1`（北京） |
| `TTS_MODEL` | `qwen3-tts-flash` |
| `ALLOWED_ORIGINS` | `https://kai-da-wang.github.io` |
| `MAX_CHAT_CALLS_PER_DAY` | `100` |
| `MAX_TTS_CALLS_PER_DAY` | `40` |
| `RATE_LIMIT_PER_MINUTE` | `8` |
| `PORT` | 不用手动填，Render 注入 |

4. Deploy 完成获得 `https://你的服务.onrender.com`；打开 `https://你的服务.onrender.com/health`，`chatConfigured`、`ttsConfigured` 应为 `true`。这只检查配置，并不证明成功调用上游。

## 3. 启用前端
打开 GitHub `dist/ai-config.js`，把 `window.GIRLS_AI_API = '';` 改成 `window.GIRLS_AI_API = 'https://你的服务.onrender.com';`，提交后 GitHub Pages 自动部署。浏览器会向你的网关请求 DeepSeek 回复，失败会使用原有本地回复；AI 角色文本气泡可按“语音朗读”调用阿里云（需用户主动点击）。

## 4. 上线前的安全与费用
- **公共网页能够消耗你的 API 额度**，CORS 只能限制普通浏览器跨站请求，**不是防盗刷认证**。上线前配置模型平台账单预警、充值控制、请求额度、验证码/登录，以及服务端持久化限流。随附额度是单实例内存计数，服务重启会清零。
- Render Free Web Service 空闲15分钟后休眠；下一次唤醒可能花约一分钟，导致网页回复降级本地。正式公开建议选不会休眠的服务。
- 文字历史发送到你的后端和 DeepSeek，语音文字发送到阿里云，应在网站告知玩家并说明隐私处理。网页历史依旧只在玩家设备，网关示例不写聊天数据库。
- 阿里云声音使用 Serena（薇薇）、Cherry（一根洋葱）、Vivian（魔女）、Chelsie（港姐），**不是现实人物的声音**；切勿未经本人同意克隆特定现实人物。
- 建议先只启用文本，确认成本与响应，再开按需朗读。实时语音电话还需要 ASR、WebSocket、流式 TTS，工程复杂度更高。

官方依据：
- https://api-docs.deepseek.com/zh-cn/
- https://help.aliyun.com/zh/model-studio/qwen-tts-api
- https://help.aliyun.com/zh/model-studio/qwen-tts-voice-list
- https://render.com/docs/free
