import { resolve } from 'node:path'
import { buildCaptionPreview } from '../../src/lib/instagram/caption.ts'
import { buildInstagramPayload, loadInstagramCandidates } from '../../src/lib/instagram/blog-to-instagram.ts'
import { loadProjectEnv } from '../../src/lib/instagram/env.ts'
import { publishInstagramPost, readInstagramEnv } from '../../src/lib/instagram/graph-api.ts'
import { getInstagramRecord, loadInstagramState, saveInstagramState, upsertInstagramRecord } from '../../src/lib/instagram/state.ts'
import type { InstagramSyncRecord } from '../../src/lib/instagram/types.ts'
import { readFacebookEnv, publishFacebookPhoto } from '../../src/lib/facebook/graph-api.ts'
import { getFacebookRecord, loadFacebookState, saveFacebookState, upsertFacebookRecord } from '../../src/lib/facebook/state.ts'
import type { FacebookSyncRecord } from '../../src/lib/facebook/types.ts'

async function main(): Promise<void> {
  const projectRoot = process.cwd()
  loadProjectEnv(projectRoot)
  const igStatePath = resolve(projectRoot, 'src/data/instagram-posts.json')
  const fbStatePath = resolve(projectRoot, 'src/data/facebook-posts.json')
  const igConfig = readInstagramEnv()
  const candidates = await loadInstagramCandidates(projectRoot)

  const igState = await loadInstagramState(igStatePath)
  const fbState = await loadFacebookState(fbStatePath)

  // 嘗試讀取 FB 設定（如果缺少則跳過 FB 同步）
  let fbConfig: ReturnType<typeof readFacebookEnv> | null = null
  try {
    fbConfig = readFacebookEnv()
  } catch {
    console.log('⚠️ 未設定 Facebook 參數，跳過 FB 同步喵。')
  }

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

  let nextIgState = igState
  let nextFbState = fbState

  for (const post of selected) {
    const igPrevious = getInstagramRecord(nextIgState, post.slug)
    if (igPrevious?.status === 'posted') {
      console.log(`略過 ${post.slug}，IG 之前已發過喵。`)
      continue
    }

    const igPayload = buildInstagramPayload(post, igConfig.siteUrl)

    // ── Instagram 發文 ──
    try {
      const result = await publishInstagramPost(igConfig, igPayload)
      const now = new Date().toISOString()
      const igRecord: InstagramSyncRecord = {
        slug: igPayload.slug,
        sourceFile: igPayload.sourceFile,
        status: 'posted',
        captionHash: igPayload.captionHash,
        imageUrl: igPayload.imageUrl,
        captionPreview: buildCaptionPreview(igPayload.caption),
        containerId: result.containerId,
        mediaId: result.mediaId,
        publishedAt: now,
        updatedAt: now,
      }
      nextIgState = upsertInstagramRecord(nextIgState, igRecord)
      console.log(`✅ 已發佈 ${igPayload.slug} 到 Instagram 喵。`)

      // ── Facebook 同步（僅當 IG 成功且有 FB 設定時）──
      if (fbConfig) {
        const fbPrevious = getFacebookRecord(nextFbState, post.slug)
        if (fbPrevious?.status === 'posted') {
          console.log(`  ↳ FB 略過 ${post.slug}，之前已發過喵。`)
        } else {
          const fbResult = await publishToFacebook(fbConfig, igPayload, igRecord.publishedAt!)
          nextFbState = upsertFacebookRecord(nextFbState, fbResult.record)
          if (fbResult.record.status === 'posted') {
            console.log(`  ↳ ✅ 已發佈 ${igPayload.slug} 到 Facebook 喵。`)
          } else {
            console.error(`  ↳ ❌ FB 同步失敗：${fbResult.record.error}`)
          }
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const failedRecord: InstagramSyncRecord = {
        slug: igPayload.slug,
        sourceFile: igPayload.sourceFile,
        status: 'failed',
        captionHash: igPayload.captionHash,
        imageUrl: igPayload.imageUrl,
        captionPreview: buildCaptionPreview(igPayload.caption),
        updatedAt: new Date().toISOString(),
        error: message,
      }
      nextIgState = upsertInstagramRecord(nextIgState, failedRecord)
      console.error(`❌ 同步 ${igPayload.slug} 失敗：${message}`)
    }
  }

  await saveInstagramState(igStatePath, nextIgState)
  if (fbConfig) {
    await saveFacebookState(fbStatePath, nextFbState)
  }
}

async function publishToFacebook(
  fbConfig: ReturnType<typeof readFacebookEnv>,
  igPayload: ReturnType<typeof buildInstagramPayload>,
  igPublishedAt: string,
): Promise<{ record: FacebookSyncRecord }> {
  // FB caption = IG caption + 文章連結當第一行
  const fbCaption = `${igPayload.caption}\n\n🔗 ${igPayload.postUrl}`

  const fbGraphPayload = {
    imageUrl: igPayload.imageUrl,
    caption: fbCaption,
    postUrl: igPayload.postUrl,
  }

  try {
    const postId = await publishFacebookPhoto(fbConfig, fbGraphPayload)
    const now = new Date().toISOString()
    const record: FacebookSyncRecord = {
      slug: igPayload.slug,
      sourceFile: igPayload.sourceFile,
      status: 'posted',
      captionHash: igPayload.captionHash,
      imageUrl: igPayload.imageUrl,
      captionPreview: buildCaptionPreview(fbCaption),
      postId,
      publishedAt: igPublishedAt,
      updatedAt: now,
    }
    return { record }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const record: FacebookSyncRecord = {
      slug: igPayload.slug,
      sourceFile: igPayload.sourceFile,
      status: 'failed',
      captionHash: igPayload.captionHash,
      imageUrl: igPayload.imageUrl,
      captionPreview: buildCaptionPreview(fbCaption),
      updatedAt: new Date().toISOString(),
      error: message,
    }
    return { record }
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
