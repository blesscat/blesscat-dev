import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { FacebookState, FacebookSyncRecord } from './types.ts'

const EMPTY_STATE: FacebookState = { posts: [] }

export async function loadFacebookState(path: string): Promise<FacebookState> {
  try {
    const raw = await readFile(path, 'utf8')
    const data = JSON.parse(raw) as Partial<FacebookState>
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

export async function saveFacebookState(path: string, state: FacebookState): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
}

export function getFacebookRecord(state: FacebookState, slug: string): FacebookSyncRecord | undefined {
  return state.posts.find(post => post.slug === slug)
}

export function upsertFacebookRecord(state: FacebookState, record: FacebookSyncRecord): FacebookState {
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
