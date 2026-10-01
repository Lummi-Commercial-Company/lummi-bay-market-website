import { cacheLife } from 'next/cache'
import { contentApiUrl, toSitePaths } from './live-shapes'

/**
 * Live content: the documents staff change most, read from the TinaCloud
 * content API instead of the copy built into the deployment (owner, 1 Oct
 * 2026: "under 30 seconds").
 *
 * Why: content is files in git (ADR 0002), and a file in the deployed bundle
 * only changes on a deploy — one to four minutes after a save. TinaCloud's
 * content API has a saved document within seconds. ADR 0024 already decided
 * fuel prices must be read this way; the build had shipped reading the built
 * file instead, so prices waited for a deploy like everything else.
 *
 * Read live: fuel prices, notices (Site Settings), promotions and their rows,
 * and Location hours. Everything else — page text, offer pages — still
 * arrives with the deploy.
 *
 * Rules:
 *   - **Cached for 10 seconds**, then refreshed in the background, so the API
 *     is asked a few times a minute, not once per visitor, and a save is on
 *     the site within roughly 10–20 seconds.
 *   - **The built file is always the fallback.** No credentials (local
 *     development), the API slow (over 2.5s) or down, an answer that does not
 *     parse: the caller reads the built copy, exactly as before. A visitor
 *     never sees an error because TinaCloud had a bad minute.
 *   - Pictures come back from the API as full addresses on TinaCloud's asset
 *     host; they are turned back into this site's `/uploads/…` paths, which is
 *     what the files hold and what the site's rules expect.
 *
 * The API version is the installed @tinacms/graphql's major.minor — the same
 * one `tinacms build` uses. lib/tina-live.test.ts fails if an upgrade moves it.
 * The pure parts — the address, the picture paths, the field names — are in
 * lib/live-shapes.ts, where they can be tested without Next.js.
 */

export { contentApiUrl, TINA_API_VERSION, toSitePaths } from './live-shapes'

async function query<T>(text: string, variables: Record<string, unknown>): Promise<T> {
  'use cache'
  cacheLife({ stale: 10, revalidate: 10, expire: 120 })

  const url = contentApiUrl()
  if (!url) throw new Error('no TinaCloud credentials')
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-KEY': process.env.TINA_TOKEN?.trim() ?? '' },
    body: JSON.stringify({ query: text, variables }),
    signal: AbortSignal.timeout(2500),
  })
  if (!response.ok) throw new Error(`content API answered ${response.status}`)
  const json = (await response.json()) as { data?: T; errors?: { message: string }[] }
  if (json.errors?.length || !json.data) {
    throw new Error(`content API: ${json.errors?.map((e) => e.message).join('; ') ?? 'no data'}`)
  }
  return json.data
}

/**
 * After a failure, skip the API for 30 seconds on this server instance and
 * read the built copy straight away. Without it, an API that hangs would hold
 * every visitor's page for the full 2.5-second timeout while it is down.
 */
let skipUntil = 0
const SKIP_AFTER_FAILURE_MS = 30_000

function skipping(): boolean {
  return Date.now() < skipUntil
}

function warn(what: string, error: unknown) {
  // Quiet when there are simply no credentials (local development).
  if (error instanceof Error && error.message === 'no TinaCloud credentials') return
  skipUntil = Date.now() + SKIP_AFTER_FAILURE_MS
  console.error(`[live content] ${what}: using the built copy (${error instanceof Error ? error.message : error})`)
}

/** One document's values, live; null means "use the built file". */
export async function liveDocument(
  collection: string,
  relativePath: string
): Promise<Record<string, unknown> | null> {
  if (skipping()) return null
  try {
    const data = await query<{ document: { _values: Record<string, unknown> } | null }>(
      `query Live($c: String!, $r: String!) { document(collection: $c, relativePath: $r) { ... on Document { _values } } }`,
      { c: collection, r: relativePath }
    )
    const values = data.document?._values
    return values && typeof values === 'object' ? (toSitePaths(values) as Record<string, unknown>) : null
  } catch (error) {
    warn(`${collection}/${relativePath}`, error)
    return null
  }
}

/** Every document in a collection, live; null means "use the built files". */
export async function liveCollection(
  collection: string
): Promise<{ relativePath: string; filename: string; values: Record<string, unknown> }[] | null> {
  if (skipping()) return null
  try {
    const data = await query<{
      collection: {
        documents: { edges: { node: { _sys: { relativePath: string; filename: string }; _values: Record<string, unknown> } }[] }
      } | null
    }>(
      `query LiveList($c: String!) { collection(collection: $c) { documents(first: 500) { edges { node { ... on Document { _sys { relativePath filename } _values } } } } } }`,
      { c: collection }
    )
    const edges = data.collection?.documents?.edges
    if (!Array.isArray(edges)) return null
    return edges
      .map(({ node }) => ({
        relativePath: node._sys.relativePath,
        filename: node._sys.filename,
        values: toSitePaths(node._values ?? {}) as Record<string, unknown>,
      }))
      .filter((doc) => !doc.filename.startsWith('.'))
  } catch (error) {
    warn(collection, error)
    return null
  }
}
