import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * A deliberately small Markdown renderer.
 *
 * Why this exists instead of a library: the same reason `lib/frontmatter.ts`
 * does. Adding a runtime dependency needs sign-off, and the only Markdown
 * parser in the tree arrives under the TinaCMS *CLI*, a devDependency. This
 * reads the subset TinaCMS's rich-text editor can actually produce with the
 * toolbar staff are given: headings, paragraphs, lists, quotes, links, bold
 * and italic.
 *
 * It renders React elements, never `dangerouslySetInnerHTML`. That is the
 * security property worth stating plainly: content is escaped by React by
 * construction, so no amount of raw HTML typed into a content file can inject
 * script. Raw HTML is not parsed — it is printed as the text it is. (MDX
 * forbids `<!-- -->` comments outright, which is what made the privacy policy
 * body parse as one `invalid_markdown` node before it was cleaned up.)
 *
 * NOT supported, on purpose: tables, images, footnotes, reference links, HTML
 * blocks, nested lists, setext headings, JSX/MDX expressions.
 *
 * Heading levels: the page's `<h1>` is the page title, printed by the route.
 * A `#` in a body would therefore be a SECOND h1, which breaks the heading
 * order screen readers navigate by. `#` and `##` both render `<h2>`, `###`
 * renders `<h3>`, `####` and deeper render `<h4>` — so a document can never
 * produce a heading order the page did not intend.
 */

type Block =
  | { kind: 'heading'; level: 2 | 3 | 4; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'rule' }

const HEADING = /^(#{1,6})\s+(.*)$/
const UNORDERED = /^[-*+]\s+(.*)$/
const ORDERED = /^\d+[.)]\s+(.*)$/
const QUOTE = /^>\s?(.*)$/
const RULE = /^(-{3,}|\*{3,}|_{3,})$/

export function parseMarkdownBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ').trim() })
    paragraph = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim()

    if (line === '') {
      flushParagraph()
      continue
    }

    if (RULE.test(line)) {
      flushParagraph()
      blocks.push({ kind: 'rule' })
      continue
    }

    const heading = line.match(HEADING)
    if (heading?.[1] !== undefined && heading[2] !== undefined) {
      flushParagraph()
      const hashes = heading[1].length
      const level = hashes <= 2 ? 2 : hashes === 3 ? 3 : 4
      blocks.push({ kind: 'heading', level, text: heading[2].trim() })
      continue
    }

    const quote = line.match(QUOTE)
    if (quote?.[1] !== undefined) {
      flushParagraph()
      const parts: string[] = [quote[1].trim()]
      while (i + 1 < lines.length) {
        const nextRaw = (lines[i + 1] ?? '').trim()
        if (nextRaw === '') break
        const nextQuote = nextRaw.match(QUOTE)
        parts.push(nextQuote?.[1] !== undefined ? nextQuote[1].trim() : nextRaw)
        i++
      }
      blocks.push({ kind: 'quote', text: parts.join(' ').trim() })
      continue
    }

    const unordered = line.match(UNORDERED)
    const ordered = line.match(ORDERED)
    if (unordered?.[1] !== undefined || ordered?.[1] !== undefined) {
      flushParagraph()
      const isOrdered = ordered?.[1] !== undefined
      const items: string[] = []
      let cursor = i
      while (cursor < lines.length) {
        const candidate = (lines[cursor] ?? '').trim()
        if (candidate === '') break
        const match = candidate.match(isOrdered ? ORDERED : UNORDERED)
        if (match?.[1] === undefined) {
          // A wrapped continuation line belongs to the item above it.
          const last = items.length - 1
          const previous = items[last]
          if (previous === undefined) break
          items[last] = `${previous} ${candidate}`
          cursor++
          continue
        }
        items.push(match[1].trim())
        cursor++
      }
      blocks.push({ kind: 'list', ordered: isOrdered, items })
      i = cursor - 1
      continue
    }

    paragraph.push(line)
  }

  flushParagraph()
  return blocks
}

/** `**bold**`, `*italic*`, `` `code` `` and `[text](href)`, in one pass. */
const INLINE =
  /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|`[^`\n]+`|\[[^\]\n]+\]\([^()\s]+\))/g

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  let cursor = 0
  let index = 0

  for (const match of text.matchAll(INLINE)) {
    const token = match[0]
    const at = match.index
    if (at > cursor) out.push(text.slice(cursor, at))
    cursor = at + token.length
    const key = `${keyPrefix}-${index++}`

    if (token.startsWith('**') || token.startsWith('__')) {
      out.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('`')) {
      out.push(<code key={key}>{token.slice(1, -1)}</code>)
    } else if (token.startsWith('*')) {
      out.push(<em key={key}>{token.slice(1, -1)}</em>)
    } else {
      const split = token.indexOf('](')
      const label = token.slice(1, split)
      const href = token.slice(split + 2, -1)
      out.push(
        <MarkdownLink key={key} href={href}>
          {label}
        </MarkdownLink>
      )
    }
  }

  if (cursor < text.length) out.push(text.slice(cursor))
  return out
}

/**
 * Internal links go through `next/link`; anything else is a plain anchor with
 * `rel="noreferrer"`. `noreferrer` is not boilerplate here: it stops this
 * site's URL being handed to the destination in a `Referer` header, which is
 * the quietest way a no-tracking site leaks where a visitor came from.
 */
function MarkdownLink({ href, children }: { href: string; children: ReactNode }) {
  const isInternal = href.startsWith('/') || href.startsWith('#')
  if (isInternal) return <Link href={href}>{children}</Link>
  return (
    <a href={href} rel="noreferrer">
      {children}
    </a>
  )
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = parseMarkdownBlocks(source)
  if (blocks.length === 0) return null

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const key = `b${index}`
        switch (block.kind) {
          case 'heading': {
            const Tag = `h${block.level}` as 'h2' | 'h3' | 'h4'
            return <Tag key={key}>{renderInline(block.text, key)}</Tag>
          }
          case 'paragraph':
            return <p key={key}>{renderInline(block.text, key)}</p>
          case 'quote':
            return (
              <blockquote key={key}>
                <p>{renderInline(block.text, key)}</p>
              </blockquote>
            )
          case 'rule':
            return <hr key={key} />
          case 'list':
            return block.ordered ? (
              <ol key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
                ))}
              </ol>
            ) : (
              <ul key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
                ))}
              </ul>
            )
        }
      })}
    </div>
  )
}

/**
 * The first sentence or two of a body, for a meta description when the
 * document does not carry one. Markup is stripped rather than rendered.
 */
export function excerptFromMarkdown(source: string, limit = 160): string {
  const blocks = parseMarkdownBlocks(source)
  const first = blocks.find((block) => block.kind === 'paragraph')
  if (!first || first.kind !== 'paragraph') return ''
  const plain = first.text
    .replace(/\[([^\]\n]+)\]\([^()\s]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/`([^`\n]+)`/g, '$1')
    .trim()
  if (plain.length <= limit) return plain
  return `${plain.slice(0, limit - 1).replace(/\s+\S*$/, '')}…`
}
