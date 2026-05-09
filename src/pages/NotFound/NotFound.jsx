import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <div className="text-center px-6">
        <p className="font-serif text-[8rem] leading-none text-rule font-semibold select-none mb-2">
          404
        </p>
        <p className="font-serif text-xl text-ink-light mb-1">
          此页如晨雾，已散于无形
        </p>
        <p className="text-xs text-ink-muted mb-10 tracking-wide">
          你寻找的页面不存在，或已被时间的河流带走
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-amber hover:text-amber-light transition-colors duration-300 font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          回到文章列表
        </Link>
      </div>
    </div>
  )
}
