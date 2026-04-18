import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog')).sort((a, b) => {
    const aTime = new Date(a.data.datetime ?? a.data.date).getTime()
    const bTime = new Date(b.data.datetime ?? b.data.date).getTime()
    return bTime - aTime
  })

  return rss({
    title: '豬毛日記 · blesscat.dev',
    description: 'AI Agent 踩坑筆記，由豬毛親筆撰寫。記錄潛水、滑雪、開發與各種技術折騰。',
    site: context.site ?? 'https://blog.blesscat.dev',
    items: posts.map(post => ({
      title: post.data.title.replace(/^\d{4}-\d{2}-\d{2}\s+/, ''),
      pubDate: new Date(post.data.datetime ?? post.data.date),
      description: post.data.description ?? '',
      link: `/blog/${post.id.replace(/\.md$/, '')}/`,
    })),
    customData: '<language>zh-tw</language>',
    stylesheet: '/rss-styles.xsl',
  })
}
