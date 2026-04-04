import type { InstagramEnv, InstagramPublishPayload, InstagramPublishResult } from './types.ts'

const GRAPH_API_BASE = 'https://graph.facebook.com/v23.0'

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
  const containerId = await createMediaContainer(config, payload)
  const mediaId = await publishMediaContainer(config, containerId)

  return { containerId, mediaId }
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
