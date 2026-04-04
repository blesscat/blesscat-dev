import { createHash } from 'node:crypto'
import type { BlogInstagramPost, InstagramPublishPayload } from './types.ts'

const MAX_CAPTION_LENGTH = 2200

export function buildInstagramCaption(post: BlogInstagramPost): string {
  if (post.frontmatter.instagramCaption?.trim()) {
    return clampCaption(post.frontmatter.instagramCaption.trim())
  }

  const title = stripMarkdown(post.frontmatter.title)
  const description = stripMarkdown(post.frontmatter.description ?? '')
  const paragraphs = extractParagraphs(post.body)
  const summaryParts = [description, ...paragraphs].filter(Boolean)
  const summary = summaryParts.join('\n\n').trim()
  const tags = normalizeHashtags(post.frontmatter.tags ?? [])

  const lines = [
    `${title}`,
    '',
    summary || '今天的豬毛日記已經上線，來吸一口精華版喵。',
    '',
    '全文可以去 blog.blesscat.dev 看喵～',
    tags.length > 0 ? tags.join(' ') : '#豬毛日記 #blesscatdev',
  ]

  return clampCaption(lines.filter(Boolean).join('\n'))
}

export function buildCaptionHash(caption: string): string {
  return createHash('sha256').update(caption).digest('hex')
}

export function buildCaptionPreview(caption: string, maxLength = 160): string {
  if (caption.length <= maxLength) {
    return caption
  }
  return `${caption.slice(0, maxLength - 1)}…`
}

export function toPreviewPayload(post: BlogInstagramPost, imageUrl: string): InstagramPublishPayload {
  const caption = buildInstagramCaption(post)

  return {
    slug: post.slug,
    sourceFile: post.sourceFile,
    title: post.frontmatter.title,
    caption,
    captionHash: buildCaptionHash(caption),
    imageUrl,
    heroImagePath: post.frontmatter.heroImage!,
    tags: post.frontmatter.tags ?? [],
    datetime: post.frontmatter.datetime,
    description: post.frontmatter.description,
    alt: post.frontmatter.instagramAlt,
  }
}

function extractParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/g)
    .map(chunk => chunk.trim())
    .map(stripMarkdown)
    .filter(chunk => chunk.length > 0)
    .filter(chunk => !chunk.startsWith('>'))
    .filter(chunk => !chunk.startsWith('#'))
    .slice(0, 2)
}

function normalizeHashtags(tags: string[]): string[] {
  const normalized = tags
    .map(tag => tag.replace(/\s+/g, ''))
    .map(tag => tag.replace(/[^\p{L}\p{N}_]/gu, ''))
    .filter(Boolean)
    .map(tag => `#${tag}`)

  if (!normalized.includes('#豬毛日記')) {
    normalized.unshift('#豬毛日記')
  }

  return [...new Set(normalized)].slice(0, 10)
}

function stripMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function clampCaption(caption: string): string {
  if (caption.length <= MAX_CAPTION_LENGTH) {
    return caption
  }
  return `${caption.slice(0, MAX_CAPTION_LENGTH - 1)}…`
}
