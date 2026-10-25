# GitHub角色聊天项目参考 · 2026-10-25

本轮通过GitHub连接读取原始仓库源码，参考的是架构思路；本项目规则和文案独立编写，没有复制项目代码、角色卡或提示词。

- SillyTavern系统提示管理：<https://github.com/SillyTavern/SillyTavern/blob/06bde939fb1e9c4c8d8641d810f0a916b5bce127/public/scripts/sysprompt.js>。启发：角色设定独立维护，真实模型调用时放在服务端。
- RisuAI历史记忆：<https://github.com/kwaroran/Risuai/blob/f50b5942ec6aa59aa3c56049ac687ca09667fec7/src/ts/process/memory/hypav2.ts>。启发：将用户记忆和有限上下文分开，不把无限历史塞进每次请求。

本项目当前公开实现是轻量本地情景规则，并不具备上述项目的模型推理或长期语义记忆。可选网关尚未部署，配置方法见 `docs/WANG_REPLY_SETUP.md`。
