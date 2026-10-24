# 小圣的手机 · 交互体验版

按用户 2026-10-24 定稿桌面独立实现的静态网页。无需安装依赖、无后台、移动端优先。

## 体验

- 解锁：上滑或点击解锁，演示密码 **0520**；也可以点“直接进入”。
- 照片：新增「和小王」（6 张）与「健身」（3 张），支持全屏原比例查看、左右滑动、方向键切换与关闭返回。相簿只展示照片图集，章节收藏从微信打开。
- 微信：进入小王、木马、魔女、Lucky、薇薇、夕夕的章节。小王有四段可切换场景。
- 点“打开这段片段”浏览卡片，查看出处、收藏；收藏的卡片从微信的收藏入口打开。
- 收藏三个不同人物的章节后，在备忘录中打开 `.memories`。
- 设置中可切换深色模式、减少动态、壁纸亮度、候选文稿审校，或重置体验。
- 候选文稿默认隐藏，开启审校后明确显示未核实标签。没有已完成原声核验的台词。

## 本地运行

直接用浏览器打开 `dist/index.html`，或者打开 `portable/xiaosheng-phone.html` 单文件离线版。

如需 HTTP 预览：

```bash
python3 -m http.server 8000 --directory dist
```

访问 `http://localhost:8000`。页面资源使用相对路径，可以部署到静态站点子目录。

```bash
node --test tests/core.test.cjs
python3 scripts/build-portable.py
```

## 文件

- `dist/`：可直接发布的 HTML、CSS、原生 JavaScript 及原创壁纸。
- `dist/gallery-data.js`：按上传素材清单配置相册、封面、排序和原图路径。
- `dist/assets/photos/`：9 张用户原始截图，SHA-256 与清单一致。
- `dist/content.js`：人物与场景数据（JSON 对象赋给 `window.PHONE_DATA`，兼容离线打开）。
- `dist/core.js`：台词展示规则、收藏去重、存档规则、来源链接协议校验。
- `dist/app.js`：页面渲染、导航、模拟应用与本地状态。
- `research/`：用户原始研究数据，仅作编辑参考，不等于已核验内容。
- `portable/`：生成的离线单文件版本。
- `docs/`：实测截图。
- `ATTRIBUTION.md`：视觉素材及内容来源记录。
- `TEST_REPORT.md`：本轮检查结果及验证边界。

## 新增人物或片段

编辑 `dist/content.js` 的 `people` 数组。每个人物拥有唯一 `id`、`name`、`initial`、`color`、`subtitle` 和 `scenes`；每个场景有独立 `id`、`title`、原创旁白 `narrative`、`quote`、`speaker`、`timestampSec`、`status`、`sourceUrl`、`rights`。新增人物不需要修改组件。

未经核实使用 `needs_review` 或 `missing`，不要猜测时间戳和发言者。原话正式显示要求 `status: verified`、已确认的 `speaker`、非负 `timestampSec`、来源 URL、`rights: cleared` 同时具备。

更新后运行检查并重新生成离线单文件。

## 数据与模拟范围

阅读、收藏、设置、备忘录、提醒事项和演示短信存于当前浏览器 LocalStorage。不同设备不会同步，清理浏览器会清除进度；秒表仅本次页面会话计时。

相机拍摄的是页面内原创壁纸；电话、短信、天气、地图、日程、闹钟和应用目录都是演示。没有摄像头/通讯录/定位权限调用，没有真实短信、拨号或后台闹铃。

该版本公开访问，无需登录；人物原声资料仍需继续核实。

## GitHub

源码仓库：https://github.com/kai-da-wang/xiaosheng-phone （源码私有）

公开体验地址：https://xiaosheng-phone-kai.imjusttrying341.chatgpt.site

新增照片时修改 `dist/gallery-data.js` 中的相册与资源数组；同一结构可继续新增相册。`photoCount` 仅作资料记录，页面数量由实际资源计算。
