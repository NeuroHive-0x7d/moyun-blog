import { Link } from 'react-router-dom'

export default function TagBadge({ tag }) {
  return (
    <Link
      to={`/tag/${encodeURIComponent(tag)}`}
      className="text-[0.7rem] tracking-wide px-2.5 py-0.5 rounded-full bg-rule/60 text-ink-muted font-medium transition-all duration-300 hover:bg-amber/15 hover:text-amber"
    >
      {tag}
    </Link>
  )
}
