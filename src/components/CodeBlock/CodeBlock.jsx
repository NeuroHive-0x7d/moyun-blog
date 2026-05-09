import { useState, useCallback, Children, isValidElement } from 'react'

export default function CodeBlock({ children, ...props }) {
  const [copied, setCopied] = useState(false)

  let lang = ''
  let codeText = ''

  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.props.className) {
        const m = child.props.className.match(/language-(\w+)/)
        lang = m ? m[1] : ''
      }
      if (child.props.children) {
        codeText = extractText(child.props.children)
      }
    }
  })

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [codeText])

  return (
    <div className="code-block group relative">
      <pre data-lang={lang} {...props}>
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-1.5 right-2 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-ink/8 hover:bg-ink/15 text-ink-muted dark:bg-white/8 dark:hover:bg-white/15"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

function extractText(node) {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && node.props) {
    return extractText(node.props.children)
  }
  return ''
}
