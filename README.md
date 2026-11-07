# 应用岛

iPad 优先的 App 风格导航，用各项目真实 Logo、名称和简介连接工作区其他网站。支持搜索、收藏、整页强制刷新及新窗口打开，兼容手机和 PC。

公开源码与发布配置：https://github.com/ZhiYanRen/app-island

正式网站：https://zhiyanren.github.io/app-island/ 。

## 本机运行

Node.js 22.16+，无生产后端或浏览器运行依赖。

```sh
npm ci
npm test
npm run build
npm start
```

访问 http://127.0.0.1:4175 。dist/ 从 public/ 构建并生成主屏幕图标，不进 Git。sharp 用于生成图标，@playwright/test 用于开发验证。

预览运行后执行 `npm run test:browser`，默认使用已安装 Chrome，可通过 BROWSER_EXECUTABLE 指定本机 Chromium；结果与截图保存在忽略的 work/qa/。浏览器模拟不等于实体 iPad 验证。

## 项目登记

public/projects.json 是唯一数据源。先登记准备中，正式上线后启用网址：

```sh
node scripts/register-project.mjs --id example --name 示例 --description 项目简介 --category 工具 --icon /absolute/path/logo.svg
node scripts/register-project.mjs --id example --url https://owner.github.io/example/
npm test
npm run build
```

以上为参数示例，不要直接执行占位网址。第二步实际访问验证 HTTPS HTML 响应；未发布时 url=null，没有可点击入口。更新后在 main 提交推送，跟进导航部署。项目更名、Logo 或网址变化时同步更新。

链接使用 target=_blank、rel=noopener noreferrer，由浏览器决定新窗口还是新标签。收藏仅保存在当前浏览器；存储受限时仅本次会话可用，不跨设备同步。

## 自动发布

单公开仓库保存源码和配置。main push 自动 npm ci、npm test、npm run build，上传 dist/ 并通过 GitHub Actions 发布 Pages。Pages 来源为 GitHub Actions，不需要跨仓库密钥。PR 只验证，workflow_dispatch 支持手动重试。

开发规范见 AGENTS.md，设计见 DESIGN.md 与 UX-CONTRACT.md。应用岛 Logo 为本项目原创，拼音小花园图标取自其原始资源，无外部图标服务依赖。

应用岛仅列出其他项目，不展示自己的应用入口；目录校验和登记脚本会拒绝 app-island 自身条目。

右上角“刷新页面”会重新载入整个页面，绕过旧页面地址缓存并获取最新目录；已保存的收藏不会清除。发布时为脚本、样式和图标生成内容版本地址，避免新版页面继续引用旧资源。
