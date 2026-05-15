import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { getPostById, getNextPost } from '../../data/loadPosts'
import TagBadge from '../../components/TagBadge/TagBadge'
import ReadingProgress from '../../components/ReadingProgress/ReadingProgress'
import ImageLightbox from '../../components/ImageLightbox/ImageLightbox'
import CodeBlock from '../../components/CodeBlock/CodeBlock'
import TableOfContents from '../../components/TableOfContents/TableOfContents'
import ProfileCard from '../../components/ProfileCard/ProfileCard'
import useMeta from '../../hooks/useMeta'
import NotFound from '../NotFound/NotFound'

function MarkdownRenderer({ content, onImageClick }) {
  const components = useMemo(
    () => ({
      pre: CodeBlock,
      img({ src, alt }) {
        if (!src) return null
        return (
          <img
            src={src}
            alt={alt || ''}
            className="cursor-zoom-in hover:opacity-90 transition-opacity duration-200"
            onClick={() => onImageClick(src, alt || '')}
            loading="lazy"
          />
        )
      },
    }),
    [onImageClick]
  )

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeHighlight, rehypeKatex, rehypeSlug]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}

export default function Article() {
  const { '*': id } = useParams()
  const [post, setPost] = useState(null)
  const [nextPost, setNextPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    (async () => {
      const found = await getPostById(id)
      setPost(found)
      if (found) {
        const next = await getNextPost(id)
        setNextPost(next)
      }
      setLoading(false)
    })()
  }, [id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useMeta({ title: post?.title, description: post?.excerpt, image: post?.cover })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-ink-muted font-serif">Loading...</p>
      </div>
    )
  }

  if (!post || post.hidden) {
    return <NotFound />
  }

  return (
    <>
      <ReadingProgress />

      {/* Profile — fixed in left margin */}
      <aside
        className="hidden lg:block fixed top-24 z-20 w-36"
        style={{ left: 'max(1rem, calc(50% - 568px))' }}
      >
        <ProfileCard />
      </aside>

      {/* TOC — fixed in right margin, follows viewport */}
      <aside
        className="hidden xl:block fixed top-24 w-48 z-20"
        style={{ left: 'calc(50% + 384px + 2.5rem)' }}
      >
        <TableOfContents content={post.content} />
      </aside>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Mobile-only profile */}
        <div className="lg:hidden mb-10">
          <ProfileCard />
        </div>

        {/* Back link */}
        <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-amber transition-colors duration-300 mb-10 font-medium tracking-wide"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            返回文章列表
          </Link>

          {/* Article header */}
          <header className="mb-12">
            <div className="flex items-center gap-2.5 text-xs text-ink-muted font-medium tracking-wide mb-4">
              <time dateTime={post.date}>{post.date}</time>
              <span aria-hidden className="text-rule">·</span>
              <span className="text-amber">{post.category}</span>
              <span aria-hidden className="text-rule">·</span>
              <span>{post.readTime} min read</span>
            </div>

            <h1 className="font-serif text-3xl font-semibold text-ink mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </header>

          {/* Cover image */}
          {post.cover && (
            <div className="mb-10 flex justify-center">
              <img
                src={post.cover}
                alt={post.title}
                className="max-w-full max-h-96 object-contain rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity duration-200"
                onClick={() => setLightbox({ src: post.cover, alt: post.title })}
                loading="lazy"
              />
            </div>
          )}

          {/* Decorative rule */}
          <div className="flex items-center gap-3 mb-10">
            <span className="flex-1 h-px bg-rule" />
            <span className="w-1 h-1 rounded-full bg-amber/50" />
            <span className="flex-1 h-px bg-rule" />
          </div>

          {/* Article body */}
          <article className="prose max-w-none">
            <MarkdownRenderer
              content={post.content}
              onImageClick={(src, alt) => setLightbox({ src, alt })}
            />
          </article>

          {/* Article footer */}
          <div className="mt-16 pt-10 border-t border-rule flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-amber transition-colors duration-300 font-medium tracking-wide"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              返回文章列表
            </Link>
            {nextPost ? (
              <Link
                to={`/article/${nextPost.id}`}
                className="group inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-amber transition-colors duration-300 font-medium tracking-wide"
              >
                下一篇文章
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="text-xs text-ink-muted/40 font-medium">
                已是最后一篇
              </span>
            )}
          </div>
      </div>

      {/* Image lightbox */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}
