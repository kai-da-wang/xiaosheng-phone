# 小圣的手机 · Supabase 数据库接入说明

更新时间：2026-10-24。此文档记录**实际创建并测试成功**的独立 Supabase 项目。网站现有静态页面尚未改动。

## 已创建的项目
- 工作区：Desk（Free 套餐）
- 名称：`xiaosheng-phone`
- 区域：`ap-southeast-1`（新加坡）
- Project Ref：`xnltkbukiehkdqmnbtjo`
- Project URL：`https://xnltkbukiehkdqmnbtjo.supabase.co`
- 控制台：`https://supabase.com/dashboard/project/xnltkbukiehkdqmnbtjo`
- 建项时报价：0 美元/月（仅代表当时报价，不代表用量无上限）

## 数据结构（2026-10-24 已运行迁移）
1. `public.phone_characters`：女主目录，已录入小王、木马、魔女、Lucky、薇薇、夕夕六人。公开只读已发布人物。
2. `public.phone_story_moments`：台词 / 回忆片段。记录角色、标题、文本、出处、秒数、真实性状态（`fiction`, `verified_quote`, `unverified_candidate`）。只有审核发布且属于原创演绎或已核实原话的片段才公开。**当前 0 条；请勿把未核实的台词当作真实原话上传并发布。**
3. `public.phone_votes`：每个 Supabase Auth 用户一票，允许修改所投人物，仅当前用户可以读取与修改自己的记录。对无账号玩家，需要启用 **Supabase Auth Anonymous Sign-ins** 并在页面静默调用 `signInAnonymously()`；不应要求粉丝输入邮箱或密码。
4. `public.phone_vote_totals`：公开只读票数；数据库触发器维护原子化计数，所有人物初始值 0。客户端**禁止直接更新票数**。

全部 `public` 表均已启用 RLS；安全检查未发现 lint。匿名读取测试通过：6 个人物、6 行票数、0 条已发布剧情。

## 下一步接入已有网站（Work 模式指令）
前端实际工程路径 `dist/`：`index.html`, `app.js`, `phone-experience.js`, `core.js` 等。

1. 不推倒重写。保留锁屏密码 0520、小王微信、相册、备忘录、地图和其他现有功能。
2. 从 Supabase 控制台 Project Settings → API Keys 获取**publishable key**；允许用于浏览器。不使用 `service_role` / Secret key。
3. 使用锁定依赖版本的 `@supabase/supabase-js` 初始化客户端，读取 `phone_characters` 和 `phone_vote_totals`，首次上线可先做**只读人气榜**。
4. 若希望所有游客不注册即可投票，在 Supabase **Authentication → Providers → Anonymous Sign-ins** 开启匿名登录，必要时启用 CAPTCHA/速率限制；进入投票模块时创建匿名会话（不要每次打开页面重复创建）。浏览器清理数据或换设备会生成新用户，**一人一票并不等于防刷票**。
5. 调用 `phone_votes`：以 `auth.uid()` 对应当前会话的 ID，首次 INSERT；已有记录则 UPDATE `character_id`。RLS 自动约束所有权；客户端只需读取票数表，**不要写 `phone_vote_totals`**。
6. 验证：游客正常加载六个人物；票数公开读取；一位匿名用户改票前后总票数守恒；第二位用户看得到共同榜单；未核实台词不会泄漏；浏览器无 Supabase Secret。
7. 创建/测试完成后，再做公网托管。Supabase **不是主站静态网页托管的替代品**，无法仅凭数据库创建实现大陆+海外秒开。网站需要 GitHub Pages/EdgeOne Pages 等另行部署，并在大陆移动/联通/电信及海外网络分别实测。

## 数据编辑建议
新增女主：插入 `phone_characters` 并同步为其初始化 `phone_vote_totals`（可以通过后台管理工具）。用户投稿的台词先保存 `unverified_candidate`, `is_published=false`；核验视频来源后再标记 `verified_quote` 并补 `source_url`, `verified_at`。

## 状态声明
**已完成：** Supabase 项目创建、数据表迁移、六个人物初始化、RLS、安全检查、公开读取权限测试。

**未完成：** 前端连接 API、匿名登录开关、实际投票端到端测试、公开托管国内外连通性验证。切勿向用户称已上线可用的投票网页。
