import { resolve } from 'node:path'
import { loadInstagramCandidates } from '../../src/lib/instagram/blog-to-instagram.ts'
import { loadProjectEnv } from '../../src/lib/instagram/env.ts'
import { loadInstagramState } from '../../src/lib/instagram/state.ts'

async function main(): Promise<void> {
  const projectRoot = process.cwd()
  loadProjectEnv(projectRoot)
  const statePath = resolve(projectRoot, 'src/data/instagram-posts.json')
  const state = await loadInstagramState(statePath)
  const candidates = await loadInstagramCandidates(projectRoot)
  const failedSlugs = new Set(state.posts.filter(post => post.status === 'failed').map(post => post.slug))
  const failedPosts = candidates.filter(post => failedSlugs.has(post.slug))

  if (failedPosts.length === 0) {
    console.log('目前沒有 failed 的 Instagram 同步項目喵。')
    return
  }

  console.log('這些文章上次同步失敗，可以針對單一 slug 重跑 sync.ts 喵：')
  for (const post of failedPosts) {
    console.log(`- ${post.slug}`)
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
