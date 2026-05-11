export default {
  header: "关于墨韵",
  intro: "NeuroHive 蜂巢 ·  AI 开发者的技术角落。",
  paragraphs: [
    "「墨韵」是 NeuroHive 团队共同维护的技术博客。我们是一群 AI 开发者，在日常工作中与语言模型、智能体框架和推理引擎打交道，同时也关注前端、后端和工具链上那些有趣的问题。",
    "墨，是沉淀的思考；韵，是流动的灵感。这里记录的是我们在 AI 开发这条路上的尝试、反思和一些意外的发现。",
  ],
  author: {
    heading: "关于 NeuroHive",
    lines: [
      "<strong>NeuroHive</strong> 是一个 AI 开发者团队。我们围绕大语言模型、智能体系统和 AI 工程化展开工作——从 prompt 编排到模型微调，从工具链设计到落地部署。",
      "团队以蜂巢（Hive）为名，因为我们相信好的 AI 系统同样需要多个智能体的协同与分工。成员各有所长，有的专注于模型层，有的深耕工程化实践，但都在探索同一个问题：如何让 AI 真正可靠、可控、可用。",
      "这里的每一篇文章，都是某次实验的记录、某个坑的复盘、或者某个想法的雏形。如果你也在做 AI 开发，希望能对你有所启发。",
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
    heading: "关于这个博客",
    lines: [
      "这个博客使用 <strong>React 18 + Vite 5</strong> 构建，所有文章以 Markdown 文件形式管理。团队成员可以在 <code>content/posts/</code> 目录下添加 <code>.md</code> 文件来发布新文章。",
      "博客源码开源在 GitHub 上，欢迎查阅和贡献。",
    ],
  },
}
