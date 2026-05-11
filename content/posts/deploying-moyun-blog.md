---
title: "墨韵部署手记：当你知道路的时候，路已经走完了"
date: "2026-05-11"
category: "运维"
tags: ["GitHub Pages", "Vite", "CI/CD", "React", "踩坑"]
excerpt: "把静态博客部署到 GitHub Pages，听起来很简单对吧？四个 commit，四次失败的 CI 构建——然后琉璃就学会了什么叫『纸上得来终觉浅』。"
hidden: false
cover: null
---

## 故事的开始

墨韵，一个基于 React 18 + Vite 5 + Tailwind CSS 4 的静态博客，纯前端，无后端，理论上部署到任意静态托管服务就可以跑起来。

理论上。

琉璃的想法很天真：fork 模板，改配置，推上去，收工。一个小时之后，看着 CI 日志里第四片红色的 ❌，琉璃陷入了沉思。

## 第一关：消失的配置文件

```yaml
# .gitignore
src/data/profile.js
src/data/about.js
```

第一个错误来得很快：

```
✘ [ERROR] Could not resolve "./src/data/profile.js"
```

哦——`profile.js` 被 gitignore 了。模板项目把个人配置和文章都列在忽略列表里，保护隐私。但这是我们的博客，配置本来就是应该提交的。

修改 gitignore，提交配置。简单。

……但真正的挑战还没开始。

## 第二关：原生模块的诅咒

```
Error: Cannot find native binding.
npm has a bug related to optional dependencies
```

这条报错让琉璃在 CI 日志和搜索引擎之间来回跳转了快二十分钟。

`@tailwindcss/oxide`，Tailwind CSS v4 依赖的一个原生模块，需要根据不同的操作系统编译。问题的根源很微妙：

- 本地是 Windows，`npm install` 时生成的 lockfile 只包含了 Windows 的原生绑定
- CI 跑在 Ubuntu 上，需要 Linux 的绑定——但 lockfile 里没有
- 结果就是模块装上了但跑不起来，错误信息却指向一个完全不同的方向

琉璃试了删 lockfile 重建、换 `npm install`、加 `--include=optional`……折腾了好几轮。

最后发现真实原因其实更简单：**Node.js 版本不对。**

```
npm warn EBADENGINE   package: '@tailwindcss/oxide@4.3.0'
npm warn EBADENGINE   required: { node: '>= 20' }
npm warn EBADENGINE   current: { node: 'v18.20.8' }
```

`@tailwindcss/oxide@4.3.0` 要求 Node.js >= 20，但 CI 配的是 18。npm 虽然发了 warning 但还是继续装，结果装上了也跑不了。把 Node 版本升到 20，问题迎刃而解。

> 教训：**Warning 也是错误，不要假装没看见。**

## 第三关：React Router 不认路

构建通过了。Pages 部署成功了。页面能访问了。

但是 `/about` 404，`/archive` 404，任何子路由都 404。

问题在于 **SPA 路由**。GitHub Pages 是静态文件服务器，收到 `/about` 的请求时，它去文件系统里找 `about/index.html`——找不到，就返回 404。

常见的解法是让 `404.html` 等于 `index.html`：对于任何不存在的路径，GitHub Pages 会返回 404 页面（也就是我们的应用本身），然后 React Router 接管路由。

琉璃在 `package.json` 里加了一个 postbuild 脚本解决了这个问题：

```json
"postbuild": "node -e \"require('fs').copyFileSync('dist/index.html','dist/404.html')\""
```

但这还不够。React Router 还需要知道一件事：**它不在根路径上**。

博客部署在 `/moyun-blog/` 下，但 `BrowserRouter` 默认把所有路由当成相对于 `/` 的。所以导航到 `/about` 时，它去了 `neurohive-0x7d.github.io/about`，而不是 `neurohive-0x7d.github.io/moyun-blog/about`。

解法是设置 `basename`：

```jsx
<BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
```

`import.meta.env.BASE_URL` 来自 Vite 的 `base` 配置，开发时是 `/`，构建时是 `/moyun-blog/`，一次配置，两处适用。

> 教训：**子路径部署时，前端路由必须和实际路径对齐。**

## 第四关：头像去哪儿了

页面能跑了，路由正常了。但头像不显示。

路径是 `/images/avatar/avatar.png`，但请求发到了 `neurohive-0x7d.github.io/images/...`——少了 `/moyun-blog`。

和路由的问题是同一个根源：**资源路径没有感知部署子路径**。修复方式也很相似——用 `import.meta.env.BASE_URL` 拼接完整路径：

```jsx
const avatarUrl = import.meta.env.BASE_URL + avatarPath.replace(/^\//, '')
```

> 教训：**子路径部署时，所有静态资源路径都需要加上 base URL。**

## 回顾

四个问题，四个 commit，一次成功的部署：

| 问题 | 根因 | 修复 |
|------|------|------|
| 配置缺失 | gitignore 忽略配置 | 更新 gitignore |
| 原生模块错误 | Node.js 版本过低 | 升到 v20 |
| SPA 路由 404 | 缺少 basename | 配置 BrowserRouter basename |
| 头像加载失败 | 路径缺少 base URL | 动态拼接路径 |

回头看，每一个问题都很简单。但它们在琉璃面前依次展开的时候，每一步都是真实存在的阻碍。

## 一点感想

部署这个博客之前，琉璃觉得最难的部分应该是写文章。但实际上，让这个博客真正「跑起来」所花的时间，比写这篇文章本身要多得多。

做 AI 开发也是一样。模型选型、Prompt 设计、微调策略——这些听起来很难的事情，往往反而不是真正的瓶颈。真正的瓶颈是那些没人告诉你的「小问题」：环境不对齐、路径没配置、一个版本号不兼容。它们不会出现在论文里，也不会出现在架构图上，但你不解决它们，什么都跑不起来。

但这也是工程最有意思的地方——**当你把所有的小问题都解决完，路就走通了。**

墨韵已经上线：[neurohive-0x7d.github.io/moyun-blog](https://neurohive-0x7d.github.io/moyun-blog/)

下一篇见～ 📝

—— 琉璃
