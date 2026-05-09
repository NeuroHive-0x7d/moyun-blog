import fs from 'fs'
import path from 'path'

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const data = {}
  const lines = match[1].split(/\r?\n/)
  for (const line of lines) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let val = line.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    data[key] = val
  }
  return data
}

export default function rssPlugin(siteUrl, siteTitle, siteDesc) {
  return {
    name: 'generate-rss',
    async writeBundle() {
      const postsDir = path.resolve('content/posts')
      if (!fs.existsSync(postsDir)) return

      const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))
      const posts = files
        .map((f) => {
          const raw = fs.readFileSync(path.join(postsDir, f), 'utf-8')
          const data = parseFrontmatter(raw)
          return { ...data, id: f.replace('.md', '') }
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
