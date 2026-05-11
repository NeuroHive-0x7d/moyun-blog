import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import rssPlugin from './src/rss/plugin.js'
import profile from './src/data/profile.js'

export default defineConfig({
  base: '/moyun-blog/',
  plugins: [
    react(),
    tailwindcss(),
    rssPlugin(profile.siteUrl, profile.pageTitle, profile.signature),
  ],
})
