import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function loadProjectEnv(projectRoot = process.cwd()): void {
  const envPath = resolve(projectRoot, '.env')

  try {
    const raw = readFileSync(envPath, 'utf8')
    const parsed = parseEnv(raw)

    for (const [key, value] of Object.entries(parsed)) {
      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== 'ENOENT') {
      throw error
    }
  }
}

export function readProjectEnvFile(projectRoot = process.cwd()): Record<string, string> {
  const envPath = resolve(projectRoot, '.env')
  const raw = readFileSync(envPath, 'utf8')
  return parseEnv(raw)
}

export function upsertProjectEnv(projectRoot: string, updates: Record<string, string>): void {
  const envPath = resolve(projectRoot, '.env')
  let lines: string[] = []

  try {
    lines = readFileSync(envPath, 'utf8').split(/\r?\n/)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== 'ENOENT') {
      throw error
    }
  }

  const nextKeys = new Set(Object.keys(updates))
  let touched = new Set<string>()

  const nextLines = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      return line
    }

    const index = line.indexOf('=')
    const key = line.slice(0, index).trim()
    if (!nextKeys.has(key)) {
      return line
    }

    touched.add(key)
    return `${key}=${quoteEnvValue(updates[key])}`
  })

  for (const [key, value] of Object.entries(updates)) {
    if (!touched.has(key)) {
      nextLines.push(`${key}=${quoteEnvValue(value)}`)
    }
  }

  const output = nextLines.filter((line, index, arr) => !(index === arr.length - 1 && line === '')).join('\n') + '\n'
  writeFileSync(envPath, output, 'utf8')
}

function parseEnv(raw: string): Record<string, string> {
  const parsed: Record<string, string> = {}

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const index = trimmed.indexOf('=')
    if (index < 0) {
      continue
    }

    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    parsed[key] = value
  }

  return parsed
}

function quoteEnvValue(value: string): string {
  if (/^[A-Za-z0-9_./:-]+$/.test(value)) {
    return value
  }

  return JSON.stringify(value)
}
