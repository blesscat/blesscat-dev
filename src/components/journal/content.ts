import type { CollectionEntry } from 'astro:content'

export type Post = CollectionEntry<'blog'>

export function newestFirst(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const aTime = new Date(a.data.datetime ?? a.data.date).getTime()
    const bTime = new Date(b.data.datetime ?? b.data.date).getTime()
    return bTime - aTime || a.id.localeCompare(b.id)
  })
}

export function postUrl(post: Post): string {
  return `/blog/${post.id.replace(/\.md$/, '')}`
}

export function postTitle(post: Post): string {
  return post.data.title.replace(/^\d{4}-\d{2}-\d{2}\s+/, '')
}

// A UTF-8 hex segment keeps every tag, including slashes and dots, in one route.
export function topicSlug(tag: string): string {
  return Array.from(new TextEncoder().encode(tag), byte => byte.toString(16).padStart(2, '0')).join('')
}

export function topicUrl(tag: string): string {
  return `/blog/tag/${topicSlug(tag)}`
}

export function topicsFor(posts: Post[]) {
  const counts = new Map<string, number>()
  for (const post of posts) {
    for (const tag of new Set(post.data.tags ?? [])) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  return Array.from(counts, ([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
}

export function postsForTopic(posts: Post[], tag: string): Post[] {
  return newestFirst(posts.filter(post => post.data.tags?.includes(tag)))
}

export function isCurrentSection(path: string, href: string): boolean {
  if (href === '/') return path === '/'
  return path === href || path.startsWith(`${href}/`)
}
