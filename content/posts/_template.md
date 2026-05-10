---
title: "文章标题"
date: "2026-05-10"
category: "示例"
tags: ["示例", "模板", "Markdown"]
excerpt: "这篇文章展示了如何编写博客文章，包括 YAML 头部字段说明和常用 Markdown 语法。"
hidden: false
cover: null
---

## 二级标题

正文内容从这里开始。支持 **加粗**、*斜体*、~~删除线~~ 等 Markdown 语法。

### 三级标题

> 这是一段引用。写作是思考的延伸。

#### 代码块

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

#### 数学公式

行内公式：$E = mc^2$

独立公式：
$$
\sum_{i=1}^{n} x_i = x_1 + x_2 + \cdots + x_n
$$

#### 表格

| 特性 | 说明 |
|------|------|
| 标题 | `title` — 文章标题 |
| 日期 | `date` — YYYY-MM-DD 格式 |
| 分类 | `category` — 单个分类名 |
| 标签 | `tags` — 标签数组，用于筛选 |
| 摘要 | `excerpt` — 首页卡片展示的简短描述 |
| 隐藏 | `hidden: true` 可隐藏草稿 |
| 封面 | `cover` — 可选封面图路径 |

#### 图片

![图片描述](/images/example.jpg)

---

> 每篇文章以 YAML 头部定义元数据，正文使用 Markdown 编写。文件名（不含 .md）即为文章 URL 标识。
