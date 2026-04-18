import { createHash } from 'node:crypto'
import type { BlogInstagramPost, InstagramPublishPayload } from './types.ts'

const MAX_CAPTION_LENGTH = 2200

export function buildInstagramCaption(post: BlogInstagramPost): string {
  if (post.frontmatter.instagramCaption?.trim()) {
    return clampCaption(addBlankLines(post.frontmatter.instagramCaption.trim()))
  }

  const body = stripMarkdown(post.body)
  const tags = normalizeHashtags(post.frontmatter.tags ?? [])

  const lines = [
    body,
    '',
    tags.length > 0 ? tags.join(' ') : '#豬毛日記 #blesscatdev',
  ]

  return clampCaption(addBlankLines(lines.filter(Boolean).join('\n\n')))
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

export function toPreviewPayload(post: BlogInstagramPost, imageUrl: string, postUrl: string): InstagramPublishPayload {
  const caption = buildInstagramCaption(post)

  return {
    slug: post.slug,
    sourceFile: post.sourceFile,
    title: post.frontmatter.title,
    caption,
    captionHash: buildCaptionHash(caption),
    imageUrl,
    postUrl,
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
    .filter(chunk => !looksLikeSectionHeading(chunk))
    .slice(0, 3)
}

function dedupeSummaryParts(parts: string[], title: string): string[] {
  const normalizedTitle = normalizeForComparison(title)
  const seen = new Set<string>()

  return parts
    .map(part => stripMarkdown(part).replace(/^\d{4}[\-/\s]\d{2}[\-/\s]\d{2}\s*/u, '').trim())
    .filter(Boolean)
    .filter(part => !looksLikeSubtitle(part))
    .filter(part => {
      const normalizedPart = normalizeForComparison(part)
      if (!normalizedPart || normalizedPart === normalizedTitle || normalizedPart.includes(normalizedTitle)) {
        return false
      }
      if (seen.has(normalizedPart)) {
        return false
      }
      seen.add(normalizedPart)
      return true
    })
}

function formatSummary(parts: string[]): string[] {
  if (parts.length === 0) {
    return ['今天的豬毛日記已經上線，來吸一口精華版喵。']
  }

  if (parts.length === 1) {
    return [parts[0]]
  }

  return [
    '今天豬毛覺得值得看的重點喵：',
    ...parts.slice(0, 3).map((part, index) => `${index + 1}. ${part}`),
  ]
}

function toTitleHook(title: string): string {
  return title.includes('今日 AI 新聞') ? '今日 AI 新聞巡邏時間喵 🐾' : `${title} 喵 🐾`
}

function looksLikeSubtitle(chunk: string): boolean {
  if (/^豬毛的.*(報告|日報|巡邏報告)$/u.test(chunk)) {
    return true
  }

  if (/^[\p{L}\p{N}\s]+的(每日|本日)?\s*AI\s*世界?巡邏報告$/u.test(chunk)) {
    return true
  }

  return false
}

function looksLikeSectionHeading(chunk: string): boolean {
  const normalized = stripMarkdown(chunk)

  if (looksLikeSubtitle(normalized)) {
    return true
  }

  if (normalized.length <= 20 && !/[。！？.!?：:]/u.test(normalized)) {
    return true
  }

  if (/^[\p{L}\p{N}\s🐾🐱😺😸😹✨⭐️🔥💡📝]+$/u.test(normalized) && normalized.length <= 24) {
    return true
  }

  if (/^[^\p{L}\p{N}]*[\p{L}\p{N}\sAIaiLLMllm]+$/u.test(normalized) && normalized.length <= 30 && !/[。！？.!?：:]/u.test(normalized)) {
    return true
  }

  if (/^[📛🔓🚨🔥✨⭐️💡📝🐾🐱😺😸😹]/u.test(normalized) && normalized.length <= 36 && !/[。！？.!?：:]/u.test(normalized)) {
    return true
  }

  if (/報告$|巡邏報告$|日報$|週報$|月報$/u.test(normalized) && normalized.length <= 18) {
    return true
  }

  return false
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

function normalizeForComparison(value: string): string {
  return stripMarkdown(value)
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function addBlankLines(caption: string): string {
  return caption
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n\n')
}

function clampCaption(caption: string): string {
  if (caption.length <= MAX_CAPTION_LENGTH) {
    return caption
  }
  return `${caption.slice(0, MAX_CAPTION_LENGTH - 1)}…`
}
