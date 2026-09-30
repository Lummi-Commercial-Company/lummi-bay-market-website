/**
 * Links inside a TinaCMS rich-text value, edited without the editor.
 *
 * Tina 3.14's own link tool cannot edit or remove a link that already exists:
 * its button returns early when the selection holds a link, and the "Edit
 * link / Unlink" bar never positions on screen (reproduced 30 Sep 2026 on the
 * first real offer page). The CMS Links panel (tina/fields/rich-text-links.tsx)
 * uses these instead. They work on the saved value — the AST Tina stores:
 *
 *   { type: 'root', children: [ …blocks… ] }
 *   a link:  { type: 'a', url, title?, children: [ { type: 'text', text, bold? } ] }
 *
 * Pure and immutable: every function returns a new value and never mutates
 * the one it was given. Paths are child-index lists from the root.
 */

export interface RichNode {
  type?: string
  text?: string
  url?: string
  title?: string | null
  children?: RichNode[]
  [mark: string]: unknown
}

export interface FoundLink {
  path: number[]
  url: string
  text: string
}

function textOf(node: RichNode): string {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(textOf).join('')
}

export function listLinks(root: RichNode | null | undefined): FoundLink[] {
  const out: FoundLink[] = []
  const walk = (node: RichNode, path: number[]) => {
    if (node.type === 'a') {
      out.push({ path, url: String(node.url ?? ''), text: textOf(node) })
      return
    }
    node.children?.forEach((child, index) => walk(child, [...path, index]))
  }
  if (root) walk(root, [])
  return out
}

/** Replace the node at `path` with zero or more nodes. */
function spliceAt(root: RichNode, path: number[], replacement: RichNode[]): RichNode {
  if (path.length === 0) return root
  const [head, ...rest] = path as [number, ...number[]]
  const children = [...(root.children ?? [])]
  if (rest.length === 0) {
    children.splice(head, 1, ...replacement)
  } else {
    const child = children[head]
    if (!child) return root
    children[head] = spliceAt(child, rest, replacement)
  }
  return { ...root, children }
}

function nodeAt(root: RichNode, path: number[]): RichNode | undefined {
  let node: RichNode | undefined = root
  for (const index of path) node = node?.children?.[index]
  return node
}

export function setLinkUrl(root: RichNode, path: number[], url: string): RichNode {
  const link = nodeAt(root, path)
  if (link?.type !== 'a') return root
  return spliceAt(root, path, [{ ...link, url }])
}

/** The link goes; its words stay, with their bold or italic. */
export function unlink(root: RichNode, path: number[]): RichNode {
  const link = nodeAt(root, path)
  if (link?.type !== 'a') return root
  return spliceAt(root, path, link.children?.length ? link.children : [{ type: 'text', text: '' }])
}

/**
 * Link the first place `words` appear in plain (not already linked) text.
 * Returns null when they do not appear, so the panel can say so rather than
 * silently doing nothing. Matching is exact, case and all.
 */
export function addLink(root: RichNode, words: string, url: string): RichNode | null {
  const target = words.trim()
  if (!target) return null
  let done = false
  const walk = (node: RichNode): RichNode => {
    if (done || node.type === 'a' || !node.children) return node
    const children: RichNode[] = []
    for (const child of node.children) {
      if (!done && typeof child.text === 'string' && child.text.includes(target)) {
        const at = child.text.indexOf(target)
        const before = child.text.slice(0, at)
        const after = child.text.slice(at + target.length)
        if (before) children.push({ ...child, text: before })
        children.push({ type: 'a', url, title: null, children: [{ ...child, text: target }] })
        if (after) children.push({ ...child, text: after })
        done = true
      } else {
        children.push(done ? child : walk(child))
      }
    }
    return { ...node, children }
  }
  const next = walk(root)
  return done ? next : null
}

/**
 * Addresses a link may use: a page on this site (starting with one `/`), a
 * full `https://` or `http://` address, `mailto:` or `tel:`. A `javascript:`
 * address would run code when clicked, so it is refused here as it is in the
 * footer (lib/footer-links.ts).
 */
export function isSafeLinkUrl(url: string): boolean {
  const value = url.trim()
  if (value.startsWith('/')) return !value.startsWith('//')
  if (value.startsWith('#')) return value.length > 1
  return /^(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+\d][\d\s().-]*)$/i.test(value)
}

/**
 * A full address that points back at this site, written the long way
 * (`https://lummibay.com/rewards`, or a Vercel address). The panel offers the
 * short form, `/rewards`, which survives a change of domain.
 */
export function ownSitePath(url: string, hosts: string[]): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    const own = hosts.some((h) => host === h || host.endsWith(`.${h}`)) || /(^|\.)lummi-bay-market-website[\w-]*\.vercel\.app$/.test(host)
    return own ? `${parsed.pathname}${parsed.search}${parsed.hash}` || '/' : null
  } catch {
    return null
  }
}
