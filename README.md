# 小圣的手机

可直接游玩的手机网页。公开地址：https://xiaosheng-phone-kai.imjusttrying341.chatgpt.site

## 当前交互

- 锁屏密码 0520；支持直接进入。
- 微信采用微信、通讯录、发现、我四个页签，联系人列表显示小王未读红点，进入后消除并保存。
- 小王聊天中可浏览已提供的六张照片，点开后在手机内全屏查看。
- 聊天支持用户自己的文字输入、表情、选择照片、导入原声音频并点播，不自动生成角色回复。
- 语音保存于当前浏览器 IndexedDB，播放状态与已听标记保存在本机。没有捏造的小王/小圣配音，没有复制参考手机的声音。
- 本次上传的 27 秒录屏仅用于理解交互，没有作为声音或人物聊天素材发布。暂未取得可用于还原小圣/小王对话的原声片段。
- 抖音已删除，原位置加入计算器；支持四则运算、正负号、百分比及 520 彩蛋。
- Safari 改为手机内的收藏和最近浏览，取消全部出处抽屉与来源外跳。
- 照片保留和小王、健身两个图集，备忘录补充相簿清单和照片关键词；设置个人卡片有相册彩蛋。

## 运行与存档

直接打开 `dist/index.html`，或下载 `portable/xiaosheng-phone.html` 离线文件。

```bash
python3 -m http.server 8000 --directory dist
node --test tests/core.test.cjs
python3 scripts/build-portable.py
```

文字、已读、收藏等保存在当前浏览器 LocalStorage，音频文件保存在 IndexedDB。不跨设备同步，不发送真实微信消息。

## 继续添加原声

进入联系人 → 聊天输入栏的加号 → 导入原声。选择 MP3、M4A、WAV 等浏览器支持的音频文件。语音条的实际秒数由音频元数据读取，未听红点在开始播放后消失。导入只保存在操作这台设备的浏览器中，不会上传给其他访客。

若需要所有访客都能听到同一段人物原声，应先由项目维护者补充对应原视频或原音频，并确认片段与人物的对应关系，再加入正式资源；当前页面没有假装具备这些尚未提供的原声。

## 文件

- `dist/app.js`：手机路由、相册、基础应用。
- `dist/phone-experience.js`：微信四个页签、聊天输入、原声导入播放、未读状态、Safari、计算器与彩蛋。
- `dist/core.js`：旧版兼容存档、收藏与台词校验规则。
- `dist/content.js`：原人物与研究线索，未核实语句不作为聊天消息展示。
- `dist/gallery-data.js`、`dist/assets/photos/`：用户原始照片及图集清单。
- `scripts/build-portable.py`：离线单文件生成。
- `ATTRIBUTION.md`、`TEST_REPORT.md`：素材说明与测试边界。

源码：https://github.com/kai-da-wang/xiaosheng-phone （私有仓库）
