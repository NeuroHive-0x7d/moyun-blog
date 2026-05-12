import { parseFrontmatter } from '../utils/frontmatter'

const postModules = import.meta.glob('/content/posts/*.md', { query: '?raw', import: 'default' })

let _posts = null

function estimateReadTime(text) {
  // Strip Markdown syntax but keep CJK and Latin characters
  const cleaned = text.replace(/[#*`\[\]()>|\-!_~={}]+/g, '')
  // Count CJK characters (Chinese, Japanese, Korean)
  const cjk = (cleaned.match(/[一-鿿㐀-䶿]/g) || []).length
  // Count English words (space-separated, excluding whitespace-only)
  const latin = cleaned.replace(/[一-鿿㐀-䶿]/g, '')
  const words = latin.split(/\s+/).filter(Boolean).length
  // CJK: ~400 chars/min, English: ~250 words/min → normalize to char-equivalent
  const effectiveChars = cjk + words * 4
  return Math.max(1, Math.round(effectiveChars / 400))
}

export async function loadPosts() {
  if (_posts) return _posts

  const entries = await Promise.all(
    Object.entries(postModules).map(async ([filepath, loader]) => {
      const raw = await loader()
      const { data, content } = parseFrontmatter(raw)
      const id = filepath.replace('/content/posts/', '').replace('.md', '')
      return {
        id,
        title: data.title || id,
        date: data.date || '',
        category: data.category || '未分类',
        tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
        excerpt: data.excerpt || '',
        hidden: data.hidden === 'true' || data.hidden === true,
        content,
        readTime: estimateReadTime(content),
        cover: data.cover || null,
      }
    })
  )

  _posts = entries.sort((a, b) => b.date.localeCompare(a.date))
  return _posts
}

export async function getVisiblePosts() {
  const posts = await loadPosts()
  return posts.filter((p) => !p.hidden)
}

export async function getCategories() {
  const posts = await getVisiblePosts()
  return [...new Set(posts.map((p) => p.category))]
}

export async function getPostsByCategory(category) {
  const posts = await getVisiblePosts()
  if (!category) return posts
  return posts.filter((p) => p.category === category)
}

export async function getPostById(id) {
  const posts = await loadPosts()
  return posts.find((p) => p.id === id) || null
}

export async function getAllTags() {
  const posts = await getVisiblePosts()
  const tags = new Set()
  posts.forEach((p) => p.tags.forEach((t) => tags.add(t)))
  return [...tags].sort()
}

export async function getPostsByTag(tagName) {
  const posts = await getVisiblePosts()
  return posts.filter((p) => p.tags.some((t) => t === tagName))
}

export async function searchPosts(query) {
  const posts = await getVisiblePosts()
  if (!query || !query.trim()) return posts
  const q = query.toLowerCase().trim()
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  )
}

export async function getNextPost(currentId) {
  const posts = await getVisiblePosts()
  const idx = posts.findIndex((p) => p.id === currentId)
  if (idx === -1 || idx >= posts.length - 1) return null
  return posts[idx + 1]
}
