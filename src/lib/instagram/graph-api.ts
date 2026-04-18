import type { InstagramEnv, InstagramPublishPayload, InstagramPublishResult } from './types.ts'

const GRAPH_API_BASE = 'https://graph.facebook.com/v23.0'
const TRANSIENT_RETRY_DELAYS_MS = [1500, 4000]
const CONTAINER_STATUS_POLL_DELAYS_MS = [1500, 2500, 4000, 6000]

export function readInstagramEnv(env: NodeJS.ProcessEnv = process.env): InstagramEnv {
  const accessToken = env.INSTAGRAM_ACCESS_TOKEN
  const igUserId = env.INSTAGRAM_IG_USER_ID
  const siteUrl = env.SITE_URL ?? 'https://blog.blesscat.dev'

  if (!accessToken) {
    throw new Error('缺少 INSTAGRAM_ACCESS_TOKEN')
  }

  if (!igUserId) {
    throw new Error('缺少 INSTAGRAM_IG_USER_ID')
  }

  return { accessToken, igUserId, siteUrl }
}

export async function createMediaContainer(
  config: InstagramEnv,
  payload: InstagramPublishPayload,
): Promise<string> {
  const response = await postForm(`${GRAPH_API_BASE}/${config.igUserId}/media`, {
    image_url: payload.imageUrl,
    caption: payload.caption,
    access_token: config.accessToken,
  })

  return readId(response, '建立 media container 失敗')
}

export async function getMediaContainerStatus(
  config: InstagramEnv,
  creationId: string,
): Promise<string | null> {
  const url = new URL(`${GRAPH_API_BASE}/${creationId}`)
  url.searchParams.set('fields', 'status_code')
  url.searchParams.set('access_token', config.accessToken)

  const response = await fetch(url, { method: 'GET' })
  const data = (await response.json()) as Record<string, unknown>

  if (!response.ok) {
    const message = typeof data.error === 'object' ? JSON.stringify(data.error) : JSON.stringify(data)
    throw new Error(message)
  }

  return typeof data.status_code === 'string' ? data.status_code : null
}

export async function publishMediaContainer(
  config: InstagramEnv,
  creationId: string,
): Promise<string> {
  const response = await postForm(`${GRAPH_API_BASE}/${config.igUserId}/media_publish`, {
    creation_id: creationId,
    access_token: config.accessToken,
  })

  return readId(response, '發佈 Instagram 貼文失敗')
}

export async function publishInstagramPost(
  config: InstagramEnv,
  payload: InstagramPublishPayload,
): Promise<InstagramPublishResult> {
  let lastError: unknown

  for (let attempt = 0; attempt <= TRANSIENT_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const containerId = await createMediaContainer(config, payload)
      await waitForMediaContainerReady(config, containerId)
      const mediaId = await publishMediaContainer(config, containerId)

      // 留言失敗不阻擋主流程，只 log 警告
      try {
        await postFirstComment(config, mediaId, payload.postUrl)
      } catch (commentError) {
        const msg = commentError instanceof Error ? commentError.message : String(commentError)
        console.warn(`⚠️ 留言失敗（不影響貼文發佈）：${msg}`)
      }

      return { containerId, mediaId }
    } catch (error) {
      lastError = error
      if (!isTransientMetaError(error) || attempt === TRANSIENT_RETRY_DELAYS_MS.length) {
        throw error
      }

      const delay = TRANSIENT_RETRY_DELAYS_MS[attempt]
      await sleep(delay)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Instagram 發文失敗')
}

async function postFirstComment(
  config: InstagramEnv,
  mediaId: string,
  postUrl: string,
): Promise<void> {
  const url = `${GRAPH_API_BASE}/${mediaId}/comments`
  const response = await postForm(url, {
    message: postUrl,
    access_token: config.accessToken,
  })

  if (!response.id) {
    throw new Error('留言發佈失敗')
  }
}

async function waitForMediaContainerReady(
  config: InstagramEnv,
  creationId: string,
): Promise<void> {
  for (const delay of CONTAINER_STATUS_POLL_DELAYS_MS) {
    const status = await getMediaContainerStatus(config, creationId)
    if (status === 'FINISHED' || status === 'PUBLISHED') {
      return
    }

    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new Error(`Media container 狀態異常：${status}`)
    }

    await sleep(delay)
  }

  const finalStatus = await getMediaContainerStatus(config, creationId)
  if (finalStatus === 'FINISHED' || finalStatus === 'PUBLISHED') {
    return
  }

  throw new Error(`Media container 尚未準備好發佈，最後狀態：${finalStatus ?? 'UNKNOWN'}`)
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

function readId(data: Record<string, unknown>, fallbackMessage: string): string {
  const id = data.id
  if (typeof id !== 'string' || id.length === 0) {
    throw new Error(fallbackMessage)
  }
  return id
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
