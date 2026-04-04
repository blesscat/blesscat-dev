export type InstagramSyncStatus = 'draft' | 'queued' | 'posted' | 'failed'

export interface BlogInstagramFrontmatter {
  title: string
  date: string
  datetime?: string
  description?: string
  heroImage?: string
  tags?: string[]
  instagram?: boolean
  instagramCaption?: string
  instagramStatus?: InstagramSyncStatus
  instagramAlt?: string
}

export interface BlogInstagramPost {
  slug: string
  sourceFile: string
  body: string
  frontmatter: BlogInstagramFrontmatter
}

export interface InstagramSyncRecord {
  slug: string
  sourceFile: string
  status: InstagramSyncStatus
  captionHash: string
  imageUrl: string
  captionPreview: string
  containerId?: string
  mediaId?: string
  publishedAt?: string
  updatedAt: string
  error?: string
}

export interface InstagramState {
  posts: InstagramSyncRecord[]
}

export interface InstagramPublishPayload {
  slug: string
  sourceFile: string
  title: string
  caption: string
  captionHash: string
  imageUrl: string
  heroImagePath: string
  tags: string[]
  datetime?: string
  description?: string
  alt?: string
}

export interface InstagramPublishResult {
  containerId: string
  mediaId: string
}

export interface InstagramEnv {
  accessToken: string
  igUserId: string
  siteUrl: string
}
