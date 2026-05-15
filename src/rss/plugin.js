import fs from 'fs'
import path from 'path'
import { parseFrontmatter } from '../utils/frontmatter.js'

export default function rssPlugin(siteUrl, siteTitle, siteDesc) {
  return {
    name: 'generate-rss',
    async writeBundle() {
      const postsDir = path.resolve('content/posts')
      if (!fs.existsSync(postsDir)) return

      function collectMdFiles(dir, base) {
        const entries = fs.readdirSync(dir, { withFileTypes: true })
        const files = []
        for (const e of entries) {
          const full = path.join(dir, e.name)
          const rel = path.join(base, e.name)
          if (e.isDirectory()) {
            files.push(...collectMdFiles(full, rel))
          } else if (e.name.endsWith('.md')) {
            files.push({ full, rel })
          }
        }
        return files
      }

      const mdFiles = collectMdFiles(postsDir, '')
      const posts = mdFiles
        .map(({ full, rel }) => {
          const raw = fs.readFileSync(full, 'utf-8')
          const { data } = parseFrontmatter(raw)
          return { ...data, id: rel.replace(/\\/g, '/').replace('.md', '') }
        })
        .filter((p) => !p.hidden && p.date)
        .sort((a, b) => b.date.localeCompare(a.date))

      const items = posts
        .map(
          (p) => `    <item>
      <title>${escapeXml(p.title || p.id)}</title>
      <link>${siteUrl}/article/${p.id}</link>
      <description>${escapeXml(p.excerpt || '')}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <guid>${siteUrl}/article/${p.id}</guid>
    </item>`
        )
        .join('\n')

      const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDesc)}</description>
    <language>zh-CN</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`
      fs.writeFileSync(path.resolve('dist/feed.xml'), rss)
    },
  }
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
