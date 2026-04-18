import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import svelte from '@astrojs/svelte'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  integrations: [svelte(), sitemap()],
  output: 'static',
  site: 'https://blog.blesscat.dev',
  redirects: {
    '/blog/page/1': '/blog',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})