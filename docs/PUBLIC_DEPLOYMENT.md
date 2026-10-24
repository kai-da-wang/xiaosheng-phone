# 小圣的手机｜公开游玩部署（2026-10-24）

## 当前状态（已核验）

- 源码仓库：`kai-da-wang/xiaosheng-phone`，当前 **private**；请不要未经检查直接改成 public，因为仓库包含研究文件及素材。
- 网站成品在 `dist/`：`index.html`、CSS、JS 和相册资源均已存在；不依赖 ChatGPT 登录。
- 已新增 `.github/workflows/deploy-pages.yml`，可自动部署 `dist/`。
- 第一次自动部署失败的具体原因：`Configure Pages` 阶段返回 `Get Pages site failed ... Not Found`，GitHub Pages 尚未启用。
- 当前还没有经过验证可供公众访问的 GitHub Pages URL，**不要把预期链接当作已上线**。

## 方案 A：GitHub Pages（海外优先）

1. 打开 https://github.com/kai-da-wang/xiaosheng-phone/settings/pages
2. 如果 Pages 菜单可用，选择 **Build and deployment → Source → GitHub Actions**。
3. 如果提示私有仓库不支持，GitHub Free 需公开仓库才能使用 Pages；GitHub Pro/Team 等可以使用私有仓库 Pages。建议另建只包含 `dist/` 的公共部署仓库，不要直接公开含研究资料的原仓库。
4. 打开 Actions → `Deploy XiaoSheng Phone to GitHub Pages` → `Run workflow`（main）。
5. 待部署显示 success，实际访问并测试：
   https://kai-da-wang.github.io/xiaosheng-phone/

> 上面的地址是 GitHub Pages **预期地址**；目前部署失败尚不可确认可访问。国内网络访问 GitHub Pages 可能不稳定。

## 方案 B：大陆访问优先 / 双线路

**推荐腾讯云 EdgeOne Pages** 额外部署一份完全相同的静态文件：
1. 在 EdgeOne Pages 创建项目，连接这个 GitHub 仓库（需授权 EdgeOne 读取私有库，或上传 `dist/` 产物）。
2. 构建命令选择无构建／空值，输出目录设 `dist`。
3. 选择合适的加速区域。若采用包含中国大陆节点的加速区域并绑定正式域名，按腾讯云要求完成 ICP 备案。
4. 绑定自己的域名，设置 HTTPS；中国境内分别用移动/联通/电信网络实测，海外至少用一个不同网络实测。
5. 同时保留 GitHub Pages 作为海外备用入口。无法备案时可以考虑香港/境外节点，但**不保证所有大陆运营商稳定可访问**。

> 官方参考：https://edgeone.cloud.tencent.com/pages/document/165485994849755136
> 官方要求：https://edgeone.ai/document/175201428435140608

## Render 备选平台

已尝试创建 Render 静态站点，但 Render 无法读取当前 private 的 GitHub 仓库，创建失败；**没有生成新的公网链接**。
若使用该平台，需在 Render 上授权该 GitHub 私有仓库访问后创建 Static Site，publishPath=`dist`、branch=`main`、buildCommand=`echo static`；大陆连通性仍需另行验证。

## 发布前检查

- 图片、头像、音频、人物肖像和公开视频截图是否具备公开使用许可；勿公布私人真实聊天内容。
- `dist/` 是否包含密钥、访问令牌、隐私信息；独立公开部署仓库尽量只包含用户同意公开的静态资产。
- 手机浏览器无 ChatGPT 登录授权；输入锁屏密码 `0520` 后进入完整桌面。
- 检查锁屏、微信、相册、计算器、地图、语音、iOS/Android 浏览器、不同网络。
- `LocalStorage/IndexedDB` 数据不会自动在不同域名同步；换站点后用户本地存档可能不一致。

## 维护方式

后续更新 `dist/**` 且 Pages 已配置后，GitHub Actions 会自动部署。手动触发可在 Actions 中使用 workflow_dispatch。
