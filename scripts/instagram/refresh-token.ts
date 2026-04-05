import { loadProjectEnv, readProjectEnvFile, upsertProjectEnv } from '../../src/lib/instagram/env.ts'

const GRAPH_API_BASE = 'https://graph.facebook.com/v23.0'
const REFRESH_THRESHOLD_DAYS = 14

interface DebugTokenResponse {
  data?: {
    is_valid?: boolean
    expires_at?: number
    scopes?: string[]
    type?: string
  }
}

interface ExchangeTokenResponse {
  access_token?: string
  token_type?: string
  expires_in?: number
}

async function main(): Promise<void> {
  const projectRoot = process.cwd()
  loadProjectEnv(projectRoot)
  const env = readProjectEnvFile(projectRoot)

  const appId = env.APP_ID
  const appSecret = env.APP_SECRET
  const currentToken = env.INSTAGRAM_ACCESS_TOKEN

  if (!appId) {
    throw new Error('缺少 APP_ID')
  }

  if (!appSecret) {
    throw new Error('缺少 APP_SECRET')
  }

  if (!currentToken) {
    throw new Error('缺少 INSTAGRAM_ACCESS_TOKEN')
  }

  const tokenInfo = await debugToken(appId, appSecret, currentToken)
  const expiresAt = tokenInfo.data?.expires_at
  const isValid = tokenInfo.data?.is_valid === true

  if (!isValid) {
    throw new Error('目前的 INSTAGRAM_ACCESS_TOKEN 無效，請先手動重新取得可用 token 喵。')
  }

  const now = Math.floor(Date.now() / 1000)
  const remainingSeconds = typeof expiresAt === 'number' ? expiresAt - now : null
  const remainingDays = remainingSeconds !== null ? remainingSeconds / 86400 : null

  if (remainingDays !== null && remainingDays > REFRESH_THRESHOLD_DAYS) {
    console.log(`目前 token 還有 ${remainingDays.toFixed(1)} 天才過期，先不用更新喵。`)
    return
  }

  const exchanged = await exchangeLongLivedToken(appId, appSecret, currentToken)
  const nextToken = exchanged.access_token

  if (!nextToken) {
    throw new Error('Meta 沒有回傳新的 access_token')
  }

  upsertProjectEnv(projectRoot, {
    INSTAGRAM_ACCESS_TOKEN: nextToken,
  })

  const expiresIn = typeof exchanged.expires_in === 'number'
    ? `${(exchanged.expires_in / 86400).toFixed(1)} 天`
    : '未知期限'

  console.log(`已更新 INSTAGRAM_ACCESS_TOKEN 喵，新 token 期限約 ${expiresIn}。`)
}

async function debugToken(appId: string, appSecret: string, inputToken: string): Promise<DebugTokenResponse> {
  const url = new URL(`${GRAPH_API_BASE}/debug_token`)
  url.searchParams.set('input_token', inputToken)
  url.searchParams.set('access_token', `${appId}|${appSecret}`)

  const response = await fetch(url, { method: 'GET' })
  const data = (await response.json()) as DebugTokenResponse & { error?: unknown }

  if (!response.ok) {
    throw new Error(typeof data.error === 'object' ? JSON.stringify(data.error) : JSON.stringify(data))
  }

  return data
}

async function exchangeLongLivedToken(
  appId: string,
  appSecret: string,
  shortLivedToken: string,
): Promise<ExchangeTokenResponse> {
  const url = new URL(`${GRAPH_API_BASE}/oauth/access_token`)
  url.searchParams.set('grant_type', 'fb_exchange_token')
  url.searchParams.set('client_id', appId)
  url.searchParams.set('client_secret', appSecret)
  url.searchParams.set('fb_exchange_token', shortLivedToken)

  const response = await fetch(url, { method: 'GET' })
  const data = (await response.json()) as ExchangeTokenResponse & { error?: unknown }

  if (!response.ok) {
    throw new Error(typeof data.error === 'object' ? JSON.stringify(data.error) : JSON.stringify(data))
  }

  return data
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
