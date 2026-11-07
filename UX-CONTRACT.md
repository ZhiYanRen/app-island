# 应用岛行为约定

单屏静态启动器，只有本地搜索、收藏、外链和目录载入，无 CRUD、服务端分页、日期或权限表单。

| 能力 | 唯一拥有者 | 行为 | 验证 |
| --- | --- | --- | --- |
| Scrollbar | public/styles.css | 全局 thumb/track/hover/active token，forced-colors 用系统值 | tests/browser.mjs |
| 搜索 | public/app.js + catalog.js | 本地过滤、清除、空状态恢复 | 单元与浏览器测试 |
| 收藏 | public/app.js | 当前浏览器持久化；存储受限仅保留会话并提示；aria-pressed 表态 | tests/browser.mjs |
| 目录 | public/projects.json | pending url=null 无链接，published 正式 HTTPS Pages；失败重试 | 单元与浏览器测试 |
| 外链 | 原生 a | 直接新窗口打开，noopener noreferrer，不异步 window.open | tests/browser.mjs |

所有焦点、hover 和按压由公共样式管理。main 自然滚动，底部导航不遮内容。目录文案通过 textContent 进入 DOM，不解释为 HTML。

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Scrollbar | public/styles.css global baseline | DESIGN.md + CSS tokens | thumb, track, hover, active, forced-colors | tests/browser.mjs |
