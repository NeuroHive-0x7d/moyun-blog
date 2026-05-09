import { Link } from 'react-router-dom'
import TagBadge from '../TagBadge/TagBadge'

export default function ArticleCard({ post, index = 0 }) {
  return (
    <article
      className="group relative py-8 border-b border-rule last:border-0 animate-card-in"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <Link
        to={`/article/${post.id}`}
        className="block -mx-3 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-rule/40"
      >
        {/* Meta line */}
        <div className="flex items-center gap-2.5 text-xs text-ink-muted mb-3 font-medium tracking-wide">
          <time dateTime={post.date}>{post.date}</time>
          <span aria-hidden className="text-rule">·</span>
          <span className="text-amber">{post.category}</span>
          <span aria-hidden className="text-rule">·</span>
          <span>{post.readTime} min read</span>
        </div>

        {/* Title */}
        <h2 className="font-serif text-xl font-semibold text-ink mb-2.5 group-hover:text-amber transition-colors duration-300 leading-snug">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-sm text-ink-light leading-relaxed mb-3 font-sans">
          {post.excerpt}
        </p>
      </Link>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap pl-3 pt-1">
        {post.tags.map((tag) => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
    </article>
  )
}
