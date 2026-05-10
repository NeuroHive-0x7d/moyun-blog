# 墨韵 · 博客

一个纯前端静态博客，以「墨韵」为主题——暖纸底色、墨色文字、琥珀点缀，如古老书房中一灯如豆。

> 1. 此项目由 deepseek-v4-pro 进行 vibe coding 生成，旨在测试模型的代码生成能力和项目构建能力。所有内容（包括文本、代码、文件结构）均由模型创作，除基础依赖外未使用任何现成模板或第三方库。
> 2. 项目中不排除存在 bug 或未完善的功能。
> 3. 整个项目中仅有这段话不由模型生成。

## 功能

- **Markdown 写作**：支持 GFM 表格、KaTeX 数学公式、代码语法高亮
- **文章管理**：分类筛选、标签筛选、全文搜索、年份归档
- **阅读体验**：文章目录（IntersectionObserver 高亮）、阅读进度条、图片灯箱
- **墨韵主题**：明暗双模，暖纸/墨池两套配色，无闪烁切换
- **自定义光标**：琥珀色墨迹光标，点击涟漪动画
- **RSS 订阅**：构建时自动生成 `feed.xml`
- **响应式设计**：适配手机、平板、桌面
- **零追踪**：无分析脚本、无广告、无第三方请求

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 4 |
| 路由 | React Router v6 |
| 渲染 | react-markdown + remark-gfm + rehype-highlight + rehype-katex |
| 字体 | Noto Serif SC（正文）· DM Sans（UI）· JetBrains Mono（代码） |

## 项目结构

```
├── index.html                     # SPA 入口，暗色模式防闪烁脚本
├── vite.config.js                 # Vite 配置（React + Tailwind + RSS 插件）
├── package.json
├── content/
│   └── posts/
│       ├── _template.md           # 文章模板（示例）
│       └── *.md                   # 博客文章（不提交到 Git）
├── public/
│   ├── favicon.svg                # 网站图标
│   └── images/                    # 图片资源（不提交到 Git）
├── src/
│   ├── main.jsx                   # React 入口
│   ├── App.jsx                    # 路由定义
│   ├── index.css                  # 全局样式 + Tailwind @theme 配置
│   ├── data/
│   │   ├── profile.js             # 个人资料（不提交到 Git）
│   │   ├── profile.example.js     # 个人资料模板
│   │   ├── loadPosts.js           # 文章加载与解析
│   │   ├── about.js               # 关于页内容（不提交到 Git）
│   │   └── about.example.js       # 关于页模板
│   ├── hooks/
│   │   └── useMeta.js             # 页面 title/meta 设置
│   ├── components/
│   │   ├── Layout/                # 全局布局（导航、页脚、主题切换）
│   │   ├── ArticleCard/           # 首页文章卡片
│   │   ├── ProfileCard/           # 作者信息卡片
│   │   ├── CodeBlock/             # 代码块（复制按钮 + 语言标签）
│   │   ├── TableOfContents/       # 文章目录
│   │   ├── ImageLightbox/         # 图片灯箱
│   │   ├── ReadingProgress/       # 阅读进度条
│   │   ├── BackToTop/             # 回到顶部
│   │   ├── InkCursor/             # 自定义光标
│   │   └── TagBadge/              # 标签组件
│   ├── pages/
│   │   ├── Home/                  # 首页（文章列表 + 搜索 + 分类筛选）
│   │   ├── Article/               # 文章详情页
│   │   ├── Tag/                   # 标签筛选页
│   │   ├── Archive/               # 归档页（按年分组）
│   │   ├── About/                 # 关于页
│   │   └── NotFound/              # 404 页面
│   └── rss/
│       └── plugin.js              # RSS 生成插件
```

## 使用方法

### 环境要求

- Node.js 18+
- npm

### 安装与启动

```bash
# 安装依赖
npm install

# 启动开发服务器（支持热更新）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

### 撰写文章

在 `content/posts/` 目录下创建 `.md` 文件，使用 YAML 头部定义文章元数据：

```markdown
---
title: "文章标题"
date: "2026-05-10"
category: "随笔"
tags: ["标签1", "标签2"]
excerpt: "文章摘要，展示在首页卡片上。"
hidden: false
cover: null
---

## 正文标题

正文内容，支持 Markdown 语法。
```

| 字段 | 说明 |
|------|------|
| `title` | 文章标题 |
| `date` | 发布日期（YYYY-MM-DD） |
| `category` | 分类（单个） |
| `tags` | 标签数组 |
| `excerpt` | 摘要，首页卡片展示 |
| `hidden` | `true` 时文章隐藏（草稿模式） |
| `cover` | 封面图路径，可选 |

文章文件名（不含 `.md`）即为 URL 标识。例如 `hello-world.md` → `/article/hello-world`。

### 自定义站点

**个人资料**：复制 `src/data/profile.example.js` 为 `src/data/profile.js`，编辑个人信息。

**关于页面**：复制 `src/data/about.example.js` 为 `src/data/about.js`，编辑关于页内容。

**主题色**：编辑 `src/index.css` 中的 `@theme` 块。

### 部署

构建产物在 `dist/` 目录，可部署至任意静态托管服务：

- **GitHub Pages**：推送 `dist/` 到 `gh-pages` 分支
- **Netlify / Vercel**：指定构建命令 `npm run build`，输出目录 `dist`
- **任意静态服务器**：直接托管 `dist/` 目录

## Git 忽略策略

以下内容**不会提交到仓库**，以保护个人数据：

| 忽略规则 | 内容 |
|----------|------|
| `content/posts/*.md` | 博客文章（`_template.md` 除外） |
| `public/images/` | 图片资源 |
| `src/data/profile.js` | 个人资料 |
| `src/data/about.js` | 关于页内容 |

新克隆项目后，复制对应的 `.example.js` 文件并创建文章即可开始使用。

## 许可

[GPL v3](LICENSE)
