import { buildInstagramPayload, loadInstagramCandidates } from '../../src/lib/instagram/blog-to-instagram.ts'

async function main(): Promise<void> {
  const projectRoot = process.cwd()
  const siteUrl = process.env.SITE_URL ?? 'https://blog.blesscat.dev'
  const candidates = await loadInstagramCandidates(projectRoot)

  if (candidates.length === 0) {
    console.log('沒有找到 instagram=true 且有 heroImage 的文章喵。')
    return
  }

  const slugFilter = process.argv[2]
  const targetPosts = slugFilter
    ? candidates.filter(post => post.slug === slugFilter)
    : candidates.slice(0, 5)

  if (targetPosts.length === 0) {
    console.log(`找不到 slug=${slugFilter} 的 IG 候選文章喵。`)
    return
  }

  for (const post of targetPosts) {
    const payload = buildInstagramPayload(post, siteUrl)
    console.log('='.repeat(80))
    console.log(`slug: ${payload.slug}`)
    console.log(`source: ${post.sourceFile}`)
    console.log(`imageUrl: ${payload.imageUrl}`)
    console.log(`captionHash: ${payload.captionHash}`)
    console.log('caption:')
    console.log(payload.caption)
    console.log()
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
