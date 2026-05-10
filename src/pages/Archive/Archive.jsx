import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useMeta from '../../hooks/useMeta'
import { getVisiblePosts } from '../../data/loadPosts'

export default function Archive() {
  const [yearGroups, setYearGroups] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useMeta({ title: '归档', description: '全部文章按时间线排列' })

  useEffect(() => {
    (async () => {
      const posts = await getVisiblePosts()
      setTotal(posts.length)
      const groups = {}
      posts.forEach((p) => {
        const year = p.date.slice(0, 4) || '未知'
        if (!groups[year]) groups[year] = []
        groups[year].push(p)
      })
      setYearGroups(Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0])))
      setLoading(false)
    })()
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="text-xs tracking-[0.2em] text-ink-muted uppercase mb-5 font-medium">
        Archive
      </p>
      <h1 className="font-serif text-3xl font-semibold text-ink mb-12 tracking-tight">
        归档
      </h1>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-ink-muted font-serif">Loading...</p>
        </div>
      ) : (
        <>
          {yearGroups.map(([year, posts]) => (
            <section key={year} className="mb-12">
              <h2 className="font-serif text-lg font-semibold text-ink mb-5 flex items-center gap-3">
                {year}
                <span className="text-xs text-ink-muted font-normal font-sans">
                  {posts.length} 篇
                </span>
              </h2>
              <ul className="space-y-3">
                {posts.map((p) => (
                  <li key={p.id} className="flex items-baseline gap-4 group">
                    <time className="text-xs text-ink-muted shrink-0 w-16 tabular-nums">
                      {p.date.slice(5)}
                    </time>
                    <Link
                      to={`/article/${p.id}`}
                      className="text-sm text-ink hover:text-amber transition-colors duration-200 truncate"
                    >
                      {p.title}
                    </Link>
                    <span className="text-[0.65rem] text-ink-muted/50 shrink-0 hidden sm:inline">
                      {p.category}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="mt-16 pt-8 border-t border-rule text-center">
            <p className="text-xs text-ink-muted">
              共 <span className="text-amber font-medium">{total}</span> 篇文章
            </p>
          </div>
        </>
      )}
    </div>
  )
}
