# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (HMR) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Architecture

A frontend-only static blog built with React 18 + Vite 5 + Tailwind CSS 4. No backend.

### Routing (React Router v6)

| Path | Page | Component |
|---|---|---|
| `/` | Home (article list + search + category filter) | `src/pages/Home/Home.jsx` |
| `/article/:id` | Article detail (Markdown via react-markdown) | `src/pages/Article/Article.jsx` |
| `/about` | About page | `src/pages/About/About.jsx` |
| `*` | 404 | `src/pages/NotFound/NotFound.jsx` |

### Data Flow

Articles live as individual Markdown files in `content/posts/*.md` with YAML frontmatter. `src/data/loadPosts.js` uses `import.meta.glob` to load all `.md` files at runtime and parses frontmatter with a built-in lightweight parser. No external frontmatter dependency at runtime (gray-matter is in `package.json` but the custom parser handles it).

### Design System — 「墨韵」

- **Colors**: CSS custom properties via Tailwind `@theme`. Light: warm paper `#faf8f5` / ink `#2d2a26`. Dark: deep brown `#1c1a17` / warm white `#e4e0d8`. Accent: amber `#b89450` (light) / `#d4b97a` (dark).
- **Typography**: Noto Serif SC (headings/body), DM Sans (UI), JetBrains Mono (code)
- **Dark mode**: Class-based (`<html class="dark">`). Toggle in `Layout.jsx`. Flash-prevention script in `index.html`. System preference detection.

### Key Conventions

- New articles: add a `.md` file to `content/posts/` with YAML frontmatter (title, date, category, tags, excerpt) — no code changes needed
- Pages are route-level components under `src/pages/<Name>/`
- Shared components under `src/components/<Name>/`
- Blog post `id` = filename without `.md` extension
