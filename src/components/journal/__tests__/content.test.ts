import { describe, expect, it } from 'vitest'
import { isCurrentSection, newestFirst, postsForTopic, postUrl, topicsFor, topicSlug, topicUrl, type Post } from '../content'
function post(id: string, date: string, tags: string[] = [], datetime?: string): Post {
  return { id, collection: 'blog', data: { title: id, date, tags, datetime } }
}

describe('journal discovery', () => {
  it('orders dates and same-day timestamps without mutating the collection', () => {
    const posts = [post('morning', '2026-10-24', [], '2026-10-24T08:00:00+08:00'), post('next', '2026-10-25'), post('evening', '2026-10-24', [], '2026-10-24T20:00:00+08:00')]
    expect(newestFirst(posts).map(p => p.id)).toEqual(['next', 'evening', 'morning'])
    expect(posts[0].id).toBe('morning')
  })
  it('finds every exact-tag match beyond an archive page and counts posts once', () => {
    const posts = Array.from({ length: 25 }, (_, i) => post(String(i), `2026-09-${String(i + 1).padStart(2, '0')}`, ['AI', 'AI']))
    posts.push(post('other', '2026-10-01', ['AI Agent']))
    expect(postsForTopic(posts, 'AI')).toHaveLength(25)
    expect(postsForTopic(posts, 'AI')[0].id).toBe('24')
    expect(topicsFor(posts)).toEqual([{ tag: 'AI', count: 25 }, { tag: 'AI Agent', count: 1 }])
    expect(postsForTopic(posts, 'unknown')).toEqual([])
  })
  it('keeps arbitrary Unicode and path-like tags in unique safe route segments', () => {
    const tags = ['豬毛日記', '../AI/ML', 'AI ML', 'AI%ML', 'AI~ML', 'AI']
    const slugs = tags.map(topicSlug)
    expect(new Set(slugs).size).toBe(tags.length)
    for (const tag of tags) {
      const path = topicUrl(tag)
      expect(path.split('/')).toHaveLength(4)
      expect(new URL(path, 'https://example.test').pathname).toBe(path)
    }
  })
  it('retains article destinations and only marks exact section boundaries', () => {
    expect(postUrl(post('an-entry.md', '2026-10-24'))).toBe('/blog/an-entry')
    expect(isCurrentSection('/blog/page/2', '/blog')).toBe(true)
    expect(isCurrentSection('/blogging', '/blog')).toBe(false)
    expect(isCurrentSection('/blog', '/')).toBe(false)
    expect(isCurrentSection('/', '/')).toBe(true)
  })
})
