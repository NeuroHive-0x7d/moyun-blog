import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ArticleCard from '../../components/ArticleCard/ArticleCard'
import useMeta from '../../hooks/useMeta'
import { getPostsByTag } from '../../data/loadPosts'

export default function Tag() {
  const { tagName } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      setPosts(await getPostsByTag(tagName))
      setLoading(false)
    })()
  }, [tagName])

  useMeta({ title: `#${tagName}`, description: `${tagName} 标签下的所有文章` })

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-amber transition-colors duration-300 mb-10 font-medium tracking-wide"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回首页
      </Link>

      <section className="mb-10">
        <p className="text-xs tracking-[0.2em] text-ink-muted uppercase mb-5 font-medium">Tag</p>
        <h1 className="font-serif text-3xl font-semibold text-ink mb-3 tracking-tight">
          #{tagName}
        </h1>
        <p className="text-ink-light text-sm">
          共 <span className="text-amber font-medium">{posts.length}</span> 篇文章
        </p>
      </section>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-ink-muted font-serif">Loading...</p>
        </div>
      ) : posts.length > 0 ? (
        posts.map((post, idx) => (
          <ArticleCard key={post.id} post={post} index={idx} />
        ))
      ) : (
        <div className="text-center py-20">
          <p className="text-ink-muted font-serif text-lg">该标签下暂无文章</p>
        </div>
      )}
    </div>
  )
}
