import { useEffect } from 'react'
import profile from '../data/profile'

function setMeta(name, content) {
  if (!content) return
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function useMeta({ title, description } = {}) {
  useEffect(() => {
    const siteTitle = profile.pageTitle
    document.title = title ? `${title} | ${siteTitle}` : siteTitle
    setMeta('description', description || '')
    setMeta('og:title', title ? `${title} | ${siteTitle}` : siteTitle)
    setMeta('og:description', description || '')
    setMeta('og:type', title ? 'article' : 'website')
    setMeta('twitter:card', 'summary')
    setMeta('twitter:title', title ? `${title} | ${siteTitle}` : siteTitle)
    setMeta('twitter:description', description || '')
  }, [title, description])
}
