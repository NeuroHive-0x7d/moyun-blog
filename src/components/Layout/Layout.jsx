import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BackToTop from '../BackToTop/BackToTop'
import profile from '../../data/profile'

function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="relative w-9 h-9 flex items-center justify-center rounded-full text-ink-muted hover:text-amber transition-all duration-300 hover:bg-rule/30"
      aria-label={dark ? '切换到亮色模式' : '切换到暗色模式'}
      title={dark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      <span className="text-lg leading-none select-none">
        {dark ? '☀' : '☽'}
      </span>
    </button>
  )
}

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink transition-colors duration-300">
      <header
        className={`sticky top-0 z-10 transition-all duration-300 ${
          scrolled
            ? 'bg-paper/92 backdrop-blur shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
            : 'bg-paper/70'
        }`}
      >
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="font-serif text-xl font-semibold tracking-tight text-ink hover:text-amber transition-colors duration-300"
          >
            {profile.blogTitle}
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-8 text-sm font-medium">
              {[
                ['/', '文章'],
                ['/archive', '归档'],
                ['/about', '关于'],
              ].map(([path, label]) => {
                const active = pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`relative py-1 transition-colors duration-300 ${
                      active ? 'text-ink' : 'text-ink-muted hover:text-ink-light'
                    }`}
                  >
                    {label}
                    <span
                      className={`absolute bottom-0 left-0 h-px bg-amber transition-all duration-300 ${
                        active ? 'w-full' : 'w-0'
                      }`}
                    />
                  </Link>
                )
              })}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-rule mt-20">
        <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col items-center gap-2">
          <p className="text-xs text-ink-muted tracking-widest uppercase">
            &copy; {new Date().getFullYear()} {profile.copyright}
          </p>
          <p className="text-xs text-ink-muted/60">
            Theme by 墨韵
          </p>
          {profile.icp && (
            <a
              href="https://beian.miit.gov.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.65rem] text-ink-muted/40 hover:text-ink-muted transition-colors"
            >
              {profile.icp}
            </a>
          )}
        </div>
      </footer>

      <BackToTop />
    </div>
  )
}
