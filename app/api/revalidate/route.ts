import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/lib/cache-tags'
import type { CacheTag } from '@/lib/cache-tags'

/**
 * On-demand revalidation (ADR 0017).
 *
 * The emergency notice has to be live in under a second. A rebuild takes
 * minutes, which is the wrong order of magnitude for "the Haxton Way store is
 * closed, the road is out". This endpoint drops the cached settings entry and
 * the next request paints the new bar.
 *
 * It is the one route handler on the site and it exists because a decision
 * required it. There is no custom server and no other API surface.
 *
 * Auth is a shared secret in `REVALIDATE_SECRET`, compared in constant time.
 * With no secret configured the endpoint refuses every request rather than
 * defaulting open — a revalidation endpoint anyone can call is a free way to
 * knock the cache out from under the site.
 */

const VALID_TAGS = new Set<string>(Object.values(CACHE_TAGS))

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    return Response.json({ revalidated: false, reason: 'not configured' }, { status: 503 })
  }

  const provided = request.headers.get('x-revalidate-secret') ?? ''
  if (!timingSafeEqual(provided, secret)) {
    return Response.json({ revalidated: false }, { status: 401 })
  }

  const url = new URL(request.url)
  const requested = url.searchParams.get('tag')
  const tags: CacheTag[] = requested
    ? VALID_TAGS.has(requested)
      ? [requested as CacheTag]
      : []
    : (Object.values(CACHE_TAGS) as CacheTag[])

  if (tags.length === 0) {
    return Response.json({ revalidated: false, reason: 'unknown tag' }, { status: 400 })
  }

  // `{ expire: 0 }` purges the entry outright rather than letting a stale copy
  // live out a profile window. An emergency notice that arrives in ten minutes
  // is not an emergency notice.
  for (const tag of tags) revalidateTag(tag, { expire: 0 })

  return Response.json({ revalidated: true, tags, now: Date.now() })
}
