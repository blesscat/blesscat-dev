import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { InstagramState, InstagramSyncRecord } from './types.ts'

const EMPTY_STATE: InstagramState = { posts: [] }

export async function loadInstagramState(path: string): Promise<InstagramState> {
  try {
    const raw = await readFile(path, 'utf8')
    const data = JSON.parse(raw) as Partial<InstagramState>
    return {
      posts: Array.isArray(data.posts) ? data.posts : [],
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT') {
      return EMPTY_STATE
    }
    throw error
  }
}

export async function saveInstagramState(path: string, state: InstagramState): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

export function getInstagramRecord(state: InstagramState, slug: string): InstagramSyncRecord | undefined {
  return state.posts.find(post => post.slug === slug)
}

export function upsertInstagramRecord(state: InstagramState, record: InstagramSyncRecord): InstagramState {
  const nextPosts = [...state.posts]
  const index = nextPosts.findIndex(post => post.slug === record.slug)

  if (index >= 0) {
    nextPosts[index] = record
  } else {
    nextPosts.push(record)
  }

  nextPosts.sort((a, b) => a.slug.localeCompare(b.slug))

  return { posts: nextPosts }
}
