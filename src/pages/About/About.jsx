export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Decorative top */}
      <p className="text-xs tracking-[0.2em] text-ink-muted uppercase mb-8 font-medium">
        About
      </p>

      <h1 className="font-serif text-3xl font-semibold text-ink mb-10 tracking-tight">
        关于这个角落
      </h1>

      {/* Rule */}
      <div className="w-8 h-px bg-amber mb-10" />

      <div className="prose max-w-none">
        <p>
          你好，这里是林依的博客——一个安静写字的地方。
        </p>

        <p>
          在这个注意力被算法切割的时代，回归文字本身反而成了一种奢侈。
          这里没有推荐系统，没有评论区，没有阅读量统计。只有纯粹的文字与思考。
        </p>

        <h2>关于作者</h2>

        <p>
          热爱文字与代码的写作者。相信简洁的力量，相信写作本身就是最好的思考方式。
        </p>

        <h2>关于博客</h2>

        <p>
          本博客使用 <strong>React + Vite</strong> 构建，纯静态部署，无需后端服务。
          所有文章以 <strong>Markdown</strong> 编写，由 <strong>React Markdown</strong> 渲染。
        </p>

        <ul>
          <li>极简设计，以阅读体验为核心</li>
          <li>无追踪，无广告，无外部分析</li>
          <li>响应式布局，适配任何设备</li>
          <li>代码语法高亮，技术写作友好</li>
        </ul>

        <h2>联系</h2>

        <p>
          <strong>Email</strong>：blog@example.com
        </p>
      </div>

      {/* Bottom rule */}
      <div className="mt-16 flex items-center gap-3">
        <span className="flex-1 h-px bg-rule" />
        <span className="w-1 h-1 rounded-full bg-amber/50" />
        <span className="flex-1 h-px bg-rule" />
      </div>
    </div>
  )
}
