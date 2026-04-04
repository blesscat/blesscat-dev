import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export function loadProjectEnv(projectRoot = process.cwd()): void {
  const envPath = resolve(projectRoot, '.env')

  try {
    const raw = readFileSync(envPath, 'utf8')
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
