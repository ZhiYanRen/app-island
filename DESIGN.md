---
version: alpha
name: "应用岛"
description: "iPad 上每个小世界的入口，漂浮小岛主题的应用启动器"
colors:
  primary: "#6552cd"
  background: "#eeedf8"
  surface: "#ffffff"
  ink: "#25243e"
  muted: "#74738b"
  border: "#e7e5f1"
typography:
  sans:
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif'
rounded:
  DEFAULT: "28px"
spacing:
  card-gap: "22px"
components:
  app-card:
    rounded: "28px"
  navigation:
    height: "54px"
---

# 应用岛设计系统

## Overview

中文个人应用导航，目标是通过真实项目 Logo 和名称进入网站。产品界面而非营销页，以 iPad 主屏幕和漂浮小岛为意象：淡紫天空、纸白卡片、紫色导航，专属 Logo 是四个应用块组成的小岛。

UI/UX Pro Max 的 tablet app launcher 初次结果含营销模板，不符合需求而不采用；缩窄 product 搜索未命中，改用 productivity dashboard 得到 Productivity Tool 的 Flat Design + Micro-interactions。采用其功能层级与轻交互原则，具体配色和小岛图形来自本项目主题，不冒充数据库精确推荐。

## Colors

public/styles.css :root 是运行时 token 唯一来源，本文件镜像已接受值：primary → --primary → 导航与焦点；background → --bg → 背景；surface → --surface → 卡片；ink → --ink → 标题；muted → --muted → 次级文本；border → --border → 分隔。静态装饰渐变不携带语义。仅提供浅色主题，系统暗色时仍保持此主题。

## Typography

中文系统 PingFang SC 等回退保证本地可读，标题38px（手机32px），应用名称19px（手机16px），正文12—14px。英文眉题仅为辅助，不能承载唯一信息。

## Layout

桌面236px侧栏，小平板200px，700px以下底部导航。主栏 max-width 1220px，内容自然滚动，不锁定视口；预留底部安全区，适配屏幕键盘。手机两列，小于350px一列。不收录导航自身，也不生成虚构应用填满留白。

## Elevation & Depth

玻璃侧栏、纸白卡片与轻阴影。背景为静态渐变，不持续消耗 GPU。主题图形不演变为宣传首屏。

## Shapes

卡片圆角28px，手机23px；Logo 76px，手机62px；星标触控目标44px。原始资源位于 public/assets/。

## Components

- public/app.js render 拥有卡片、结果与收藏状态；public/catalog.js 负责校验与过滤；public/projects.json 为目录唯一来源。
- 搜索有标签和清除，过滤即时本地执行，无远程 debounce。收藏与外链为兄弟元素，避免嵌套交互；收藏后恢复合理焦点，存储失败提供本次会话降级提示。
- 已发布使用原生 a、target=_blank、rel=noopener noreferrer，名称说明新窗口；准备中无超链接。图标失败以首字作错误降级，不能代替正式 Logo。
- 全局 scrollbar 在 styles.css，具备 thumb/track/hover/active/forced-colors；焦点3px，状态同时有文字与颜色。
- CSS 入场420ms、操作反馈160—220ms、第二项延迟70ms；按压缩放与收藏高亮。减少动态效果时关闭动画和过渡。无复杂控制，不引入 GSAP。
- 目录失败显示重试，空列表提供恢复，搜索与导航不因加载移动。
- Logo 原稿 public/assets/logo.svg 为本项目原创，构建生成180/192/512 PNG。拼音小花园图标来自其 dist/icon.svg，保持原始图形和配色。

## Do's and Don'ts

- 保持真实品牌、触控反馈、键盘与多端适配。
- 用轻动效提升品质，不用持续循环动画干扰导航。
- 不放宣传 Hero、冗长页脚、假统计或未发布的可点击地址。
- 公开单仓库、main 与 Pages 静态边界优先于技能默认建议。
