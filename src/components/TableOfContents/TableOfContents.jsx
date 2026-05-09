import { useState, useEffect, useMemo } from 'react'

function baseSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function makeSlugifier() {
  const seen = new Map()
  return (text) => {
    const base = baseSlug(text)
    const count = seen.get(base) || 0
    seen.set(base, count + 1)
    return count === 0 ? base : `${base}-${count}`
  }
}

function extractHeadings(content) {
  const re = /^(#{2,3})\s+(.+)$/gm
  const slugify = makeSlugifier()
  const headings = []
  let m
  while ((m = re.exec(content)) !== null) {
    headings.push({
      level: m[1].length,
      text: m[2].trim(),
      id: slugify(m[2].trim()),
    })
  }
  return headings
}

export default function TableOfContents({ content }) {
  const headings = useMemo(() => extractHeadings(content), [content])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    if (headings.length === 0) return

    const observers = []
    const visibleSet = new Set()

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visibleSet.add(id)
          } else {
            visibleSet.delete(id)
          }
          // Pick the first visible heading (top-most)
          const firstVisible = headings.find((h) => visibleSet.has(h.id))
          if (firstVisible) setActiveId(firstVisible.id)
        },
        { rootMargin: '-80px 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })

    // Fallback: when scrolled to top, highlight first heading
    const onScroll = () => {
      if (window.scrollY < 100) {
        setActiveId(headings[0]?.id || '')
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observers.forEach((o) => o.disconnect())
      window.removeEventListener('scroll', onScroll)
    }
  }, [headings])

  if (headings.length < 2) return null

  const handleClick = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
    }
  }

  return (
    <nav className="toc" aria-label="文章目录">
      <p className="text-xs tracking-[0.15em] text-ink-muted uppercase font-medium mb-4">
        目录
      </p>
      <ul className="space-y-0.5 border-l border-rule pl-4">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? '0.75rem' : '0' }}>
            <button
              onClick={() => handleClick(h.id)}
              className={`block text-left text-sm w-full py-0.5 transition-colors duration-200 truncate ${
                activeId === h.id
                  ? 'text-amber font-medium'
                  : 'text-ink-muted hover:text-ink-light'
              }`}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
