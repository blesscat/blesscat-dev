import type { FacebookEnv, FacebookPhotoPayload } from './types.ts'

const GRAPH_API_BASE = 'https://graph.facebook.com/v23.0'
const TRANSIENT_RETRY_DELAYS_MS = [1500, 4000]

export function readFacebookEnv(env: NodeJS.ProcessEnv = process.env): FacebookEnv {
  // 優先使用 page access token（FB 發文需要 page token，user token 無法使用 pages_manage_posts）
  const accessToken = env.FACEBOOK_PAGE_ACCESS_TOKEN ?? env.FACEBOOK_ACCESS_TOKEN ?? env.INSTAGRAM_ACCESS_TOKEN
  const pageId = env.FACEBOOK_PAGE_ID ?? ''
  const siteUrl = env.SITE_URL ?? 'https://blog.blesscat.dev'

  if (!accessToken) {
    throw new Error('缺少 FACEBOOK_ACCESS_TOKEN（或 INSTAGRAM_ACCESS_TOKEN）')
  }

  if (!pageId) {
    throw new Error('缺少 FACEBOOK_PAGE_ID')
  }

  return { accessToken, pageId, siteUrl }
}

export async function publishFacebookPhoto(
  config: FacebookEnv,
  payload: FacebookPhotoPayload,
): Promise<string> {
  let lastError: unknown

  for (let attempt = 0; attempt <= TRANSIENT_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await postFacebookPhotoOnce(config, payload)
    } catch (error) {
      lastError = error
      if (!isTransientMetaError(error) || attempt === TRANSIENT_RETRY_DELAYS_MS.length) {
        throw error
      }

      const delay = TRANSIENT_RETRY_DELAYS_MS[attempt]
      await sleep(delay)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Facebook 發文失敗')
}

export async function postFacebookComment(
  config: FacebookEnv,
  photoId: string,
  message: string,
): Promise<void> {
  try {
    await postForm(`${GRAPH_API_BASE}/${photoId}/comments`, {
      message,
      access_token: config.accessToken,
    })
  } catch (error) {
    // Comment 失敗不影響發文狀態，只 log warning
    console.warn(`⚠️ FB 留言失敗（photo ${photoId}）：${error instanceof Error ? error.message : error}`)
  }
}

async function postFacebookPhotoOnce(
  config: FacebookEnv,
  payload: FacebookPhotoPayload,
): Promise<string> {
  const response = await postForm(`${GRAPH_API_BASE}/${config.pageId}/photos`, {
    url: payload.imageUrl,
    caption: payload.caption,
    access_token: config.accessToken,
  })

  const id = response.id
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error('Facebook 發文失敗：無有效 post ID')
  }

  return id
}

async function postForm(url: string, body: Record<string, string>): Promise<Record<string, unknown>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
  })

  const data = (await response.json()) as Record<string, unknown>

  if (!response.ok) {
    const message = typeof data.error === 'object' ? JSON.stringify(data.error) : JSON.stringify(data)
    throw new Error(message)
  }

  return data
}

function isTransientMetaError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  try {
    const parsed = JSON.parse(error.message) as {
      is_transient?: boolean
      code?: number
      error_subcode?: number
    }

    return parsed.is_transient === true || parsed.code === 2
  } catch {
    return false
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
