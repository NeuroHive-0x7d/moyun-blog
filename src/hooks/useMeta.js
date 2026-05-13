import { useEffect } from 'react'
import profile from '../data/profile'

export default function useMeta({ title, description, image } = {}) {
  useEffect(() => {
    const created = []

    function setMeta(name, content) {
      if (!content) return
      let el = document.querySelector(`meta[name="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        document.head.appendChild(el)
        created.push(el)
      }
      el.setAttribute('content', content)
    }

    const siteTitle = profile.pageTitle
    const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle
    document.title = pageTitle
    setMeta('description', description || '')
    setMeta('og:title', pageTitle)
    setMeta('og:description', description || '')
    setMeta('og:image', image || '')
    setMeta('og:type', title ? 'article' : 'website')
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary')
    setMeta('twitter:title', pageTitle)
    setMeta('twitter:description', description || '')
    setMeta('twitter:image', image || '')

    return () => {
      created.forEach(el => el.remove())
    }
  }, [title, description, image])
}
