export type FacebookSyncStatus = 'draft' | 'queued' | 'posted' | 'failed'

export interface FacebookSyncRecord {
  slug: string
  sourceFile: string
  status: FacebookSyncStatus
  captionHash: string
  imageUrl: string
  captionPreview: string
  postId?: string
  publishedAt?: string
  updatedAt: string
  error?: string
}

export interface FacebookState {
  posts: FacebookSyncRecord[]
}

export interface FacebookEnv {
  accessToken: string
  pageId: string
  siteUrl: string
}

export interface FacebookPhotoPayload {
  imageUrl: string
  caption: string
  postUrl: string
}
