import { readFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import type { BlogInstagramFrontmatter, BlogInstagramPost, InstagramPublishPayload } from './types.ts'
import { toPreviewPayload } from './caption.ts'

const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/

export async function loadInstagramCandidates(projectRoot: string): Promise<BlogInstagramPost[]> {
  const blogDir = resolve(projectRoot, 'src/content/blog')
  const files = await collectMarkdownFiles(blogDir)
  const posts = await Promise.all(files.map(file => readInstagramBlogPost(projectRoot, file)))

  return posts
    .filter((post): post is BlogInstagramPost => post !== null)
    .filter(post => post.frontmatter.instagram === true)
    .filter(post => Boolean(post.frontmatter.heroImage))
    .sort((a, b) => {
      const aTime = new Date(a.frontmatter.datetime ?? a.frontmatter.date).getTime()
      const bTime = new Date(b.frontmatter.datetime ?? b.frontmatter.date).getTime()
      return bTime - aTime
    })
}

export async function readInstagramBlogPost(projectRoot: string, absolutePath: string): Promise<BlogInstagramPost | null> {
  const raw = await readFile(absolutePath, 'utf8')
  const match = raw.match(FRONTMATTER_PATTERN)

  if (!match) {
    return null
  }

  const [, frontmatterRaw, body] = match
  const frontmatter = parseFrontmatter(frontmatterRaw)

  if (!frontmatter.title || !frontmatter.date) {
    return null
  }

  const relativePath = relative(projectRoot, absolutePath)
  const slug = relativePath
    .replace(/^src\/content\/blog\//, '')
    .replace(/\.md$/, '')

  return {
    slug,
    sourceFile: relativePath,
    body: body.trim(),
    frontmatter,
  }
}

export function buildInstagramPayload(post: BlogInstagramPost, siteUrl: string): InstagramPublishPayload {
  const imageUrl = toPublicImageUrl(siteUrl, post.frontmatter.heroImage!)
  return toPreviewPayload(post, imageUrl)
}

export function toPublicImageUrl(siteUrl: string, heroImagePath: string): string {
  const normalizedSiteUrl = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl
  const normalizedHeroPath = heroImagePath.startsWith('/') ? heroImagePath : `/${heroImagePath}`
  return `${normalizedSiteUrl}${normalizedHeroPath}`
}

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const { readdir } = await import('node:fs/promises')
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async entry => {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      return collectMarkdownFiles(fullPath)
    }
    return entry.name.endsWith('.md') ? [fullPath] : []
  }))

  return files.flat()
}

function parseFrontmatter(source: string): BlogInstagramFrontmatter {
  const data: BlogInstagramFrontmatter = { title: '', date: '' }

  for (const rawLine of source.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const index = line.indexOf(':')
    if (index < 0) {
      continue
    }

    const key = line.slice(0, index).trim()
    const rawValue = line.slice(index + 1).trim()

    switch (key) {
      case 'title':
      case 'date':
      case 'datetime':
      case 'description':
      case 'heroImage':
      case 'instagramCaption':
      case 'instagramAlt':
        ;(data as unknown as Record<string, unknown>)[key] = parseStringValue(rawValue)
        break
      case 'instagram':
        data.instagram = rawValue === 'true'
        break
      case 'instagramStatus':
        if (['draft', 'queued', 'posted', 'failed'].includes(parseStringValue(rawValue))) {
          data.instagramStatus = parseStringValue(rawValue) as BlogInstagramFrontmatter['instagramStatus']
        }
        break
      case 'tags':
        data.tags = parseStringArray(rawValue)
        break
      default:
        break
    }
  }

  return data
}

function parseStringValue(rawValue: string): string {
  const trimmed = rawValue.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseStringArray(rawValue: string): string[] {
  const trimmed = rawValue.trim()
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
    return []
  }

  const inner = trimmed.slice(1, -1).trim()
  if (!inner) {
    return []
  }

  return inner
    .split(',')
    .map(part => parseStringValue(part.trim()))
    .filter(Boolean)
}
