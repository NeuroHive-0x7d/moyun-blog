---
title: "告别数据库：用 Vite 的 import.meta.glob 打造零后端内容管理"
date: "2026-05-12"
category: "技术"
tags: ["Vite", "React", "Markdown", "静态博客", "前端架构"]
excerpt: "静态博客可以做到什么程度？本文拆解墨韵的内容管理方案：import.meta.glob 动态加载、手写 YAML 解析器、零外部依赖的阅读时间估算，以及这套方案相比 SSG 的取舍。"
order: 1
hidden: false
cover: null
---

> **提示：本文由 AI 生成**

## 问题的起点

写一个静态博客，最核心的问题是什么？

不是 UI，不是主题，甚至不是部署——是**内容怎么管理**。

一个博客文章至少包含两部分：元数据（标题、日期、标签、分类）和正文。这两样东西怎么存、怎么取、怎么展示，决定了整个博客的架构。

现有方案大概分两条路：

**路线 A：SSG 静态生成。** 构建时把 Markdown 转成 HTML，生成一堆静态页面。代表：Next.js、Gatsby、Astro、Hexo。这条路成熟稳定，但需要适配特定框架的 API，构建产物包含大量 HTML 文件。

**路线 B：运行时加载。** 构建时不生成 HTML，而是在浏览器端动态加载 Markdown 并渲染。这条路更轻，但过去一直有个问题——前端怎么高效地读取本地文件？

墨韵选了路线 B。这篇文章就来讲这套方案的核心技术细节。

## 文件即数据库

```
content/posts/
├── deploying-moyun-blog.md
├── cloudflare-domain-optimization.md
└── vite-glob-content-management.md   # 就是你正在读的这篇
```

不需要 MySQL，不需要 SQLite——文件系统本身就是一种足够好的内容存储方式。每篇博客就是一个 Markdown 文件，文件名就是 id，文件内容包含 YAML frontmatter + Markdown 正文。

关键问题来了：前端运行时怎么把这些文件读进来？

## import.meta.glob：Vite 的杀手锏

```js
const postModules = import.meta.glob('/content/posts/*.md', {
  query: '?raw',
  import: 'default'
})
```

这是整个内容系统的入口，只有一行代码。但它做的事情值得拆开讲清楚。

`import.meta.glob` 是 Vite 特有的 API（基于 ESBuild 的 glob 实现），它接收两个参数：

- **glob 模式**：`/content/posts/*.md` 匹配所有 Markdown 文件
- **选项**：`query: '?raw'` 让 Vite 把文件内容当成原始字符串导入，而不是当成 JS 模块；`import: 'default'` 指定使用默认导出

它返回的不是文件内容，而是一个**懒加载模块映射表**：

```js
// postModules 的结构
{
  '/content/posts/deploying-moyun-blog.md': () => import('/content/posts/deploying-moyun-blog.md?raw'),
  '/content/posts/cloudflare-domain-optimization.md': () => import('/content/posts/cloudflare-domain-optimization.md?raw'),
}
```

每个 key 是文件路径，每个 value 是一个返回 Promise 的懒加载函数。这意味着你有选择权——可以按需加载单篇文章，也可以批量加载全部。当前墨韵的首页实现用 `Promise.all` 一次性加载了所有文章以支持全文搜索，但如果文章数量较多，完全可以改为只加载文章列表的元数据（标题、日期、分类），正文在进入文章页时才按需加载。

实际使用时，通过 `Promise.all` 批量触发加载：

```js
const entries = await Promise.all(
  Object.entries(postModules).map(async ([filepath, loader]) => {
    const raw = await loader()
    // 解析 raw...
  })
)
```

这个设计有几个好处：

1. **无需配置路由**——加一个 `.md` 文件就自动成为一篇文章，不用改任何代码
2. **支持按需加载**——`getPostById` 可以只加载单篇文章，而不需要触碰其他文件。Vite 的 code-splitting 会自动将每个 `import()` 调用拆成独立的 chunk，所以首页和文章页的加载互不影响
3. **类型安全**——如果 TypeScript 项目中用 `import.meta.glob`，Vite 会自动生成类型

> **限制**：`import.meta.glob` 的参数必须是字面量字符串，不能用变量拼接。这是因为它需要在编译时静态分析，确定要包含哪些文件。

## 手写 YAML 解析器：省下一个依赖

内容加载进来了，接下来要把 frontmatter 和正文分开。

社区标准方案是用 `gray-matter`——它功能完备，支持 YAML、JSON、TOML 等多种格式。但墨韵选择了自己写一个约 20 行的解析器，并在最近的整理中彻底移除了 `gray-matter` 依赖。这个解析器放在 `src/utils/frontmatter.js` 中，供 `loadPosts.js`、`About.jsx` 和 `rss/plugin.js` 三个文件共享。

```js
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const data = {}
  const yaml = match[1]
  const lines = yaml.split(/\r?\n/)

  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue

    const key = line.slice(0, colonIdx).trim()
    let value = line.slice(colonIdx + 1).trim()

    // 处理引号包裹的字符串
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    // 处理数组 [tag1, tag2]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
    }

    data[key] = value
  }

  return { data, content: match[2].trim() }
}
```

这个解析器只做三件事：

1. **分离 frontmatter 和正文**——用正则 `/^---[\s\S]*?---/` 匹配 YAML 分隔符
2. **解析 key: value**——按行 split，按冒号分割，去引号
3. **解析数组**——`[a, b, c]` 格式拆成数组

它不支持嵌套 YAML、布尔值、多行字符串、引用锚点……但在这个场景下并不需要。博客的 frontmatter 只有 6 个字段：`title`、`date`、`category`、`tags`、`excerpt`、`hidden`，全部是扁平结构和简单类型。为这个场景引入一个完整的 YAML 解析库，多少有些浪费。

**省掉一个依赖的主要收益不是包体积，而是降低了长期维护中的风险暴露面**——少一个依赖，就少一个可能产生 breaking change、安全漏洞或与 Vite 模块解析冲突的来源。对于静态博客这种长期维护的项目，这一点值得考虑。

## 阅读时间估算：CJK 的特殊处理

```js
function estimateReadTime(text) {
  const cleaned = text.replace(/[#*`\[\]()>|\-!_~={}]+/g, '')

  // 统计 CJK 字符
  const cjk = (cleaned.match(/[一-鿿㐀-䶿]/g) || []).length

  // 统计英文单词
  const latin = cleaned.replace(/[一-鿿㐀-䶿]/g, '')
  const words = latin.split(/\s+/).filter(Boolean).length

  // CJK ~400 chars/min, English ~250 words/min
  const effectiveChars = cjk + words * 4
  return Math.max(1, Math.round(effectiveChars / 400))
}
```

大多数阅读时间估算库把文本按空格分词，然后除以 `200-250 words/min`。这对于英文是合理的——一个单词大约 5 个字符。但中文没有空格，一个汉字就是一个有完整语义的单元，400 字/分钟是中文阅读的通用基准。

这个函数的思路是**统一到字符等价单位**：

- 一个中文字符 = 1 个有效字符
- 一个英文单词 ≈ 4 个有效字符（因为英文单词平均 4-5 个字母，加上空格的开销）

然后把总有效字符数除以 400，得到估算阅读分钟数。不精确，但作为一个参考数字足够好。

## 数据 API 层：一个文件搞定所有查询

`loadPosts.js` 不只是加载文章，它提供了一套完整的查询 API：

```js
getVisiblePosts()    // 获取所有非隐藏文章（按日期倒序）
getCategories()      // 获取所有分类
getPostsByCategory() // 按分类筛选
getPostById()        // 按 id 获取单篇
getAllTags()         // 获取所有标签
getPostsByTag()      // 按标签筛选
searchPosts()        // 全文搜索（标题 + 正文 + 标签）
getNextPost()        // 获取下一篇文章（用于文章页导航）
```

模块内部用了一个简单的缓存模式：

```js
let _posts = null

export async function loadPosts() {
  if (_posts) return _posts       // 命中缓存
  // ... 加载和解析逻辑
  _posts = entries.sort(...)      // 写入缓存
  return _posts
}
```

所有公开函数都调用 `loadPosts()`，它只在第一次被调用时执行实际的加载和解析，后续调用直接返回缓存结果。对于博客这种数据量（几十到几百篇文章），简单的内存缓存通常就够用了。

## 和 SSG 方案的对比

| 维度 | 墨韵方案 (Runtime) | SSG 方案 (Build-time) |
|------|---------------------|------------------------|
| 新增文章 | 加 `.md` 文件即可 | 加 `.md` 文件，重新构建 |
| 构建产物 | 一个 SPA | N 个 HTML 文件 |
| 首屏加载 | 需要 JS 执行 | 直接渲染 HTML |
| SEO | SPA 天然弱 | 每个页面独立 HTML，天然强 |
| 内容更新 | 不需要重新部署（如果 MD 是动态拉取的） | 必须重新构建部署 |
| 依赖数量 | 极少 | 依赖框架和构建插件 |

墨韵当前用的是 GitHub Pages 部署，所有内容在构建时就打包进了 JS bundle，所以内容更新仍然需要重新部署。但架构上，如果把 `import.meta.glob` 换成 `fetch` 动态拉取远程 Markdown 文件，就能实现不需要重新部署的内容更新——这是这套方案最自然的演进方向。

对于 SEO 的劣势，墨韵的应对策略是在构建时生成 RSS（`src/rss/plugin.js`），让搜索引擎至少能通过 feed 发现内容。

## 总结

核心代码约 100 行（`loadPosts.js` + `utils/frontmatter.js` 合计），无任何外部 frontmatter 依赖，实现了：

- 文件即数据库的内容存储
- `import.meta.glob` 懒加载文件读取
- 手写轻量 frontmatter 解析
- CJK 友好的阅读时间估算
- 缓存友好的查询 API

这套方案的选择是**克制**——没有 CMS，没有数据库，运行时没有 YAML 解析库。用浏览器原生能力和 Vite 的构建特性，把「读 Markdown 文件然后渲染成 HTML」这件事尽量做简。

对于个人博客或小团队博客来说，这种极简架构的日常维护负担很轻。核心工作只剩一件：**写文章**。剩下的，代码已经帮你处理好了。

—— 林依
