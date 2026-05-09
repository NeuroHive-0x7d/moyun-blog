import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import About from './pages/About/About'
import NotFound from './pages/NotFound/NotFound'

const Article = lazy(() => import('./pages/Article/Article'))
const Tag = lazy(() => import('./pages/Tag/Tag'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-ink-muted font-serif">Loading...</p>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/article/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <Article />
            </Suspense>
          }
        />
        <Route
          path="/tag/:tagName"
          element={
            <Suspense fallback={<PageFallback />}>
              <Tag />
            </Suspense>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
