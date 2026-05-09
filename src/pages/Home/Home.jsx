import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArticleCard from '../../components/ArticleCard/ArticleCard'
import ProfileCard from '../../components/ProfileCard/ProfileCard'
import useMeta from '../../hooks/useMeta'
import { getVisiblePosts, getCategories } from '../../data/loadPosts'

const POSTS_PER_PAGE = 5

export default function Home() {
  useMeta()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [loadedPosts, loadedCategories] = await Promise.all([
        getVisiblePosts(),
        getCategories(),
      ])
      setPosts(loadedPosts)
      setCategories(loadedCategories)
      setLoading(false)
    })()
  }, [])

  const displayPosts = (() => {
    let result = posts
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    } else if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory)
    }
    return result
  })()

  const totalPages = Math.max(1, Math.ceil(displayPosts.length / POSTS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const pagedPosts = displayPosts.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE)

  function setPage(page) {
    const params = new URLSearchParams(searchParams)
    if (page <= 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    setSearchParams(params, { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Floating profile — left margin, outside content flow */}
      <aside
        className="hidden lg:block fixed top-24 z-20 w-40"
        style={{ left: 'max(1rem, calc(50% - 584px))' }}
      >
        <ProfileCard />
      </aside>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Mobile-only profile (above hero) */}
        <div className="lg:hidden mb-10">
          <ProfileCard />
        </div>

        {/* Search bar */}
        <div className="search-wrapper relative mb-8">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value) setActiveCategory(null)
            }}
            placeholder="搜索文章标题或内容..."
            className="search-input w-full pl-10 pr-10 py-2.5 text-sm bg-transparent border border-rule rounded-lg outline-none transition-all duration-300 focus:border-amber focus:ring-1 focus:ring-amber/20 text-ink placeholder:text-ink-muted"
          />
          <button
            onClick={() => setSearchQuery('')}
            className={`search-clear absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-light transition-colors text-sm ${searchQuery ? 'visible' : ''}`}
          >
            &#10005;
          </button>
        </div>

        {/* Category filter pills */}
        {categories.length > 0 && !searchQuery && (
          <div className="flex gap-2 flex-wrap mb-4">
            {[
              { label: '全部', value: null },
              ...categories.map((c) => ({ label: c, value: c })),
            ].map(({ label, value }) => {
              const active = activeCategory === value
              return (
                <button
                  key={label}
                  onClick={() => setActiveCategory(value)}
                  className={`text-xs tracking-wide px-3.5 py-1.5 rounded-full transition-all duration-300 font-medium ${
                    active
                      ? 'bg-amber text-paper shadow-sm'
                      : 'bg-rule/40 text-ink-muted hover:bg-rule hover:text-ink-light'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {/* Results */}
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-20">
              <p className="text-ink-muted font-serif">Loading...</p>
            </div>
          ) : displayPosts.length > 0 ? (
            <>
              {pagedPosts.map((post, idx) => (
                <ArticleCard key={post.id} post={post} index={idx} />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-12">
                  <button
                    onClick={() => setPage(safePage - 1)}
                    disabled={safePage <= 1}
                    className="text-xs text-ink-muted hover:text-amber transition-colors disabled:opacity-30 disabled:cursor-default font-medium"
                  >
                    &larr; 上一页
                  </button>
                  <span className="text-xs text-ink-muted">
                    {safePage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                    className="text-xs text-ink-muted hover:text-amber transition-colors disabled:opacity-30 disabled:cursor-default font-medium"
                  >
                    下一页 &rarr;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-ink-muted font-serif text-lg">
                {searchQuery ? '没有找到匹配的文章' : '该分类下暂无文章'}
              </p>
              <p className="text-xs text-ink-muted/60 mt-2">
                {searchQuery ? '试试其他关键词' : '换个分类试试'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
