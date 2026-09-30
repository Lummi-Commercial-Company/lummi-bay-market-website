import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

/**
 * Filesystem access to the content files in this repo.
 *
 * All content is Markdown/MDX/JSON committed to git — there is no content
 * database and there is never going to be one. Phase 2 layers Tina's generated
 * GraphQL client on top of these same files for visual editing and for the
 * per-request price read (ADR 0024); the files stay the source of truth.
 */

export const CONTENT_DIR = path.join(process.cwd(), 'content')

/** Read a content file. Returns null when it does not exist. */
export async function readContentFile(relativePath: string): Promise<string | null> {
  try {
    return await readFile(path.join(CONTENT_DIR, relativePath), 'utf8')
  } catch {
    return null
  }
}

/** Read and parse a JSON content file. Returns null when absent or invalid. */
export async function readContentJson<T>(relativePath: string): Promise<T | null> {
  const raw = await readContentFile(relativePath)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    // A malformed content file must not take the whole site down; the caller
    // falls back and the problem shows up as missing data, not a 500.
    console.error(`[content] ${relativePath} is not valid JSON`)
    return null
  }
}

export async function listContentFiles(
  dir: string,
  extensions: string[] = ['.md', '.mdx']
): Promise<string[]> {
  try {
    const entries = await readdir(path.join(CONTENT_DIR, dir))
    return entries
      .filter((name) => extensions.some((ext) => name.endsWith(ext)))
      .sort()
  } catch {
    return []
  }
}

/**
 * Every content file under `dir`, folders included, as paths relative to it
 * (`6th_Anniversary/win-fuel-cards.mdx`). The CMS lets staff group documents
 * into folders ("Add Folder"), and a document in a folder must not silently
 * vanish from the site. Hidden files — the `.gitkeep.mdx` the CMS writes to
 * hold an empty folder open — are skipped.
 */
export async function listContentFilesDeep(
  dir: string,
  extensions: string[] = ['.md', '.mdx']
): Promise<string[]> {
  const out: string[] = []
  const walk = async (relative: string) => {
    let entries: import('node:fs').Dirent[]
    try {
      entries = await readdir(path.join(CONTENT_DIR, dir, relative), { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const child = relative ? `${relative}/${entry.name}` : entry.name
      if (entry.isDirectory()) await walk(child)
      else if (extensions.some((ext) => entry.name.endsWith(ext))) out.push(child)
    }
  }
  await walk('')
  return out.sort()
}
