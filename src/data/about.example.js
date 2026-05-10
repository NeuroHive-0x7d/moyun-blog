export default {
  header: "关于这个博客",
  intro: "一个安静写字的地方。",
  paragraphs: [],
  author: {
    heading: "关于作者",
    lines: [
      "复制 <code>about.example.js</code> 为 <code>about.js</code> 并在此处填写你的个人信息。",
    ],
  },
  tech: {
    heading: "技术栈",
    lines: [
      "本博客使用 <strong>React 18 + Vite 5</strong> 构建，纯静态部署，无需后端服务。所有文章以 <strong>Markdown</strong> 文件存放于 <code>content/posts/</code> 目录，由 <strong>react-markdown</strong> 渲染，支持 GFM、KaTeX 数学公式、代码语法高亮。",
      "主题名为<strong>「墨韵」</strong>——暖纸底色（<code>#f6f2ec</code>），墨色文字（<code>#2d2a26</code>），琥珀点缀（<code>#b89450</code>）。字体使用 Noto Serif SC（正文）、DM Sans（UI）与 JetBrains Mono（代码）。支持明暗双模，暗色模式下切换为深褐底色与暖白文字，减少夜间阅读的视觉疲劳。",
    ],
    features: [
      "纯静态，无后端，可部署至任何静态托管服务（Netlify、Vercel、GitHub Pages）",
      "无追踪器，无分析脚本，无第三方请求",
      "响应式布局，适配手机、平板与桌面",
      "代码高亮 + 复制按钮，技术写作友好",
      "文章目录（IntersectionObserver 高亮当前位置）",
      "阅读进度条 + 图片灯箱 + 自定义光标",
      "构建时自动生成 RSS 订阅源",
    ],
  },
  why: {
    heading: "开始使用",
    lines: [
      "1. 复制 <code>src/data/profile.example.js</code> 为 <code>src/data/profile.js</code>，编辑个人信息。",
      "2. 复制本文件为 <code>src/data/about.js</code>，编辑关于页内容。",
      "3. 在 <code>content/posts/</code> 目录下添加 <code>.md</code> 文件，填写 YAML 头部信息后即可发布文章。",
    ],
  },
}
