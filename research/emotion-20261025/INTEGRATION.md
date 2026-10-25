# 增量接入记录 · 2026-10-25

基线：GitHub 6124e45f0a9c8aeb080e9f66a332b1f73a4e24a1，Sites 99495bd1737ffd728e89f29abc27289b31de8302。工作区干净。

现有架构：静态dist；core.js负责原key存档；phone-experience.js组合静态故事和动态chatMessages，send写一次玩家消息；wang-chat-runtime.js负责小王队列、输入中、未读；app.js负责路由、弹层、转义和保存失败提示。

新增persona-data.js、persona-dialogue.js、persona-chat-runtime.js；仅在phone-experience.js增加三房间分支和详情控制，core.js增加防御性personaV2迁移，index及离线构建增加脚本。静态故事、content角色ID、小王两脚本、照片、支持开发者流程和图片均保持字节。

主要风险：跨房间DOM插入、快速消息重复、旧存档损坏、清除后旧历史重新学偏好、定时回复在清除后回写。使用逐房间jobId/取消、replyTo去重、白名单迁移、只从本轮输入学偏好处理。运行时不读取付款事件，也不从历史重新抽取已删除的事实。

研究边界：已读包内全部人物资料、数据与参考实现；未逐字核听公开视频、未取得引用授权。本轮仅用原创游戏人格，无新增verified引文；一根/一颗洋葱账号矛盾仍needs_review，不合并三三/珊珊。
