import { useState, useEffect, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import CodeBlock from '../../components/CodeBlock/CodeBlock'
import useMeta from '../../hooks/useMeta'
import { parseFrontmatter } from '../../utils/frontmatter'

const aboutModules = import.meta.glob('/content/pages/about.md', { query: '?raw', import: 'default' })

export default function About() {
  const [content, setContent] = useState(null)
  const [title, setTitle] = useState('关于')

  useEffect(() => {
    (async () => {
      const loader = aboutModules['/content/pages/about.md']
      if (!loader) {
        setContent(null)
        return
      }
      const raw = await loader()
      const { data, content: md } = parseFrontmatter(raw)
      setTitle(data.title || '关于')
      setContent(md)
    })()
  }, [])

  useMeta({ title })

  const components = useMemo(() => ({ pre: CodeBlock }), [])

  if (content === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-3xl font-semibold text-ink mb-6 tracking-tight">{title}</h1>
        <div className="prose max-w-none">
          <p>
            未找到关于页面内容。请在 <code>content/pages/about.md</code> 创建关于页面。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl font-semibold text-ink mb-10 tracking-tight">
        {title}
      </h1>

      <div className="w-8 h-px bg-amber mb-10" />

      <article className="prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeHighlight, rehypeKatex, rehypeSlug]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </article>

      <div className="mt-16 flex items-center gap-3">
        <span className="flex-1 h-px bg-rule" />
        <span className="w-1 h-1 rounded-full bg-amber/50" />
        <span className="flex-1 h-px bg-rule" />
      </div>
    </div>
  )
}
