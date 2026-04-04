import { resolve } from 'node:path'
import { buildCaptionPreview } from '../../src/lib/instagram/caption.ts'
import { buildInstagramPayload, loadInstagramCandidates } from '../../src/lib/instagram/blog-to-instagram.ts'
import { loadProjectEnv } from '../../src/lib/instagram/env.ts'
import { publishInstagramPost, readInstagramEnv } from '../../src/lib/instagram/graph-api.ts'
import { getInstagramRecord, loadInstagramState, saveInstagramState, upsertInstagramRecord } from '../../src/lib/instagram/state.ts'
import type { InstagramSyncRecord } from '../../src/lib/instagram/types.ts'

async function main(): Promise<void> {
  const projectRoot = process.cwd()
  loadProjectEnv(projectRoot)
  const statePath = resolve(projectRoot, 'src/data/instagram-posts.json')
  const config = readInstagramEnv()
  const candidates = await loadInstagramCandidates(projectRoot)
  const state = await loadInstagramState(statePath)

  if (candidates.length === 0) {
    console.log('沒有需要同步到 Instagram 的文章喵。')
    return
  }

  const slugFilter = process.argv[2]
  const selected = slugFilter
    ? candidates.filter(post => post.slug === slugFilter)
    : candidates

  if (selected.length === 0) {
    console.log(`找不到 slug=${slugFilter} 的 IG 候選文章喵。`)
    return
  }

  let nextState = state

  for (const post of selected) {
    const previous = getInstagramRecord(nextState, post.slug)
    if (previous?.status === 'posted') {
      console.log(`略過 ${post.slug}，之前已發過喵。`)
      continue
    }

    const payload = buildInstagramPayload(post, config.siteUrl)

    try {
      const result = await publishInstagramPost(config, payload)
      const now = new Date().toISOString()
      const record: InstagramSyncRecord = {
        slug: payload.slug,
        sourceFile: payload.sourceFile,
        status: 'posted',
        captionHash: payload.captionHash,
        imageUrl: payload.imageUrl,
        captionPreview: buildCaptionPreview(payload.caption),
        containerId: result.containerId,
        mediaId: result.mediaId,
        publishedAt: now,
        updatedAt: now,
      }
      nextState = upsertInstagramRecord(nextState, record)
      console.log(`已發佈 ${payload.slug} 到 Instagram 喵。`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const failedRecord: InstagramSyncRecord = {
        slug: payload.slug,
        sourceFile: payload.sourceFile,
        status: 'failed',
        captionHash: payload.captionHash,
        imageUrl: payload.imageUrl,
        captionPreview: buildCaptionPreview(payload.caption),
        updatedAt: new Date().toISOString(),
        error: message,
      }
      nextState = upsertInstagramRecord(nextState, failedRecord)
      console.error(`同步 ${payload.slug} 失敗：${message}`)
    }
  }

  await saveInstagramState(statePath, nextState)
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
