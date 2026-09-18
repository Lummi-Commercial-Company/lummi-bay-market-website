/**
 * A deliberately small YAML-frontmatter reader.
 *
 * Why this exists instead of a library: the only frontmatter parser already in
 * the tree (`gray-matter`) arrives as a transitive dependency of the TinaCMS
 * *CLI*, which is a devDependency — importing it from application code would
 * mean depending on something we never declared. Adding a runtime dependency
 * needs sign-off, so this reads the narrow subset of YAML that TinaCMS itself
 * writes: scalars, block scalars, nested maps, and lists of scalars or maps.
 *
 * Block scalars (`key: >-` and `key: |`) are supported because Tina writes
 * them without being asked: it serialises frontmatter with js-yaml, whose
 * default line width folds any string past ~80 characters onto continuation
 * lines. A one-line SEO description typed in the CMS comes back as a folded
 * block. Before this was handled the parser read the value as the literal
 * string ">-" AND silently discarded every key after it, because the
 * continuation lines sat at an indent the map loop treated as the end of the
 * map. That is the failure mode this file exists to avoid: not a crash, but a
 * document that quietly loses half its fields.
 *
 * It does NOT support anchors, flow collections (`[a, b]`) or multi-document
 * files. Editors never type YAML — Tina writes it from the schema — so that
 * subset is the whole surface.
 *
 * Phase 2 replaces this: once the Tina Cloud project exists, content is read
 * through Tina's generated GraphQL client (needed anyway for visual editing and
 * for per-request prices, ADR 0024) and this file can be deleted.
 */

type Line = {
  indent: number
  text: string
  isItem: boolean
  /** Set when the key's value was a `|`/`>` block, already folded. */
  blockValue?: string
}

export type Frontmatter = Record<string, unknown>

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function splitFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const match = raw.match(FRONTMATTER)
  if (!match || match[1] === undefined) return { data: {}, body: raw }
  return {
    data: parseYamlSubset(match[1]),
    body: raw.slice(match[0].length),
  }
}

export function parseYamlSubset(source: string): Frontmatter {
  const lines = tokenize(source)
  if (lines.length === 0) return {}
  const first = lines[0]
  if (!first) return {}
  const [value] = parseMap(lines, 0, first.indent)
  return value
}

/** `key: >-` / `key: |` — the header of a block scalar, value on later lines. */
const BLOCK_SCALAR_HEADER = /^([^:#]+):\s*([|>])([-+]?)\d*\s*$/

/**
 * Raw text to lines, consuming block scalars whole.
 *
 * Blank lines and comments are dropped — except inside a block scalar, where a
 * blank line is content (it is the paragraph break) and a `#` is just a `#`.
 */
function tokenize(source: string): Line[] {
  const raw = source.split(/\r?\n/)
  const lines: Line[] = []

  for (let i = 0; i < raw.length; i++) {
    const rawLine = raw[i]
    if (rawLine === undefined) continue
    if (rawLine.trim() === '' || rawLine.trim().startsWith('#')) continue

    const indent = rawLine.length - rawLine.replace(/^ +/, '').length
    let text = rawLine.trim()
    let isItem = false
    if (text === '-' || text.startsWith('- ')) {
      isItem = true
      text = text.slice(1).trim()
    }

    const header = text.match(BLOCK_SCALAR_HEADER)
    if (header?.[1] !== undefined && header[2] !== undefined) {
      const block: string[] = []
      let j = i + 1
      for (; j < raw.length; j++) {
        const next = raw[j]
        if (next === undefined) break
        // A blank line does not end the block; a line indented no further than
        // the key does, and it is the next key.
        if (next.trim() === '') {
          block.push('')
          continue
        }
        if (next.length - next.replace(/^ +/, '').length <= indent) break
        block.push(next)
      }
      // Blank lines after the last content line belong to whatever follows.
      while (block.at(-1) === '') block.pop()

      lines.push({
        indent,
        text: `${header[1]}:`,
        isItem,
        blockValue: foldBlockScalar(block, header[2] === '|', header[3] ?? ''),
      })
      i = j - 1
      continue
    }

    lines.push({ indent, text, isItem })
  }

  return lines
}

/**
 * Turn the raw lines of a block scalar into its string value.
 *
 * `literal` (`|`) keeps every newline. Folded (`>`, which is what js-yaml
 * writes) joins wrapped lines with a space, turns a blank line into one real
 * newline, and keeps the break before a line indented further than its
 * neighbours. `chomp` is the `-`/`+` suffix: strip, keep, or clip to one.
 */
function foldBlockScalar(block: string[], literal: boolean, chomp: string): string {
  if (block.length === 0) return ''

  let contentIndent = Number.POSITIVE_INFINITY
  for (const line of block) {
    if (line.trim() === '') continue
    contentIndent = Math.min(contentIndent, line.length - line.replace(/^ +/, '').length)
  }
  if (!Number.isFinite(contentIndent)) contentIndent = 0
  const body = block.map((line) => (line.trim() === '' ? '' : line.slice(contentIndent)))

  let out = ''
  if (literal) {
    out = body.join('\n')
  } else {
    for (let i = 0; i < body.length; i++) {
      const line = body[i] ?? ''
      if (i === 0) {
        out = line
      } else if (line === '') {
        out += '\n'
      } else if ((body[i - 1] ?? '') === '' || line.startsWith(' ')) {
        out += line === '' ? '' : (out.endsWith('\n') ? '' : '\n') + line
      } else {
        out += ' ' + line
      }
    }
  }

  if (chomp === '-') return out.replace(/\n+$/, '')
  if (chomp === '+') return `${out}\n`
  return `${out.replace(/\n+$/, '')}\n`
}

/**
 * How many lines belong under a parent at `indent`.
 *
 * `allowFlushItems` is the difference between the two callers, and getting it
 * wrong is silent. For a map KEY, a list written flush with its key
 * (`amenities:` then `- fuel` in the same column) is still that key's value, so
 * a flush `- ` line is a child. For a list ITEM, a flush `- ` line is the NEXT
 * ITEM, not a child of this one — treating it as a child swallows the whole
 * list into the first entry, which then parses as a map and yields `[{}]`.
 */
function childrenOf(
  lines: Line[],
  start: number,
  indent: number,
  allowFlushItems: boolean
): number {
  let end = start
  while (end < lines.length) {
    const line = lines[end]
    if (!line) break
    const deeper = line.indent > indent
    const flushItem = allowFlushItems && line.indent === indent && line.isItem
    if (!deeper && !flushItem) break
    end++
  }
  return end
}

function parseMap(lines: Line[], start: number, indent: number): [Frontmatter, number] {
  const out: Frontmatter = {}
  let i = start
  while (i < lines.length) {
    const line = lines[i]
    if (!line || line.indent !== indent || line.isItem) break
    const match = line.text.match(/^([^:]+):\s*(.*)$/)
    if (!match || match[1] === undefined) {
      i++
      continue
    }
    const key = match[1].trim()
    const inline = (match[2] ?? '').trim()
    // A block scalar was already folded by the tokenizer; its continuation
    // lines are gone, so the map loop cannot mistake them for the end of it.
    if (line.blockValue !== undefined) {
      out[key] = line.blockValue
      i++
      continue
    }
    if (inline !== '') {
      // A plain scalar may wrap onto following, more-indented lines with no
      // `>` marker at all — ordinary YAML, and what a person writes by hand
      // when a sentence is too long for one line. Unfolded, the value is
      // truncated at the first line AND every key after it is read as part of
      // this one, so the document quietly loses fields. Quoted values are left
      // alone: their end is the closing quote, not the indentation.
      let text = inline
      if (!/^["']/.test(inline)) {
        while (i + 1 < lines.length) {
          const cont = lines[i + 1]
          if (!cont || cont.indent <= indent || cont.isItem) break
          if (cont.blockValue !== undefined) break
          // A `word:` line is the next key, not a continuation. The cost is
          // that a wrapped line may not begin `something: ` — the one shape of
          // sentence this reader cannot take.
          if (/^[^:\s][^:]*:(\s|$)/.test(cont.text)) break
          text += ` ${cont.text}`
          i++
        }
      }
      out[key] = parseScalar(text)
      i++
      continue
    }
    const end = childrenOf(lines, i + 1, indent, true)
    if (end === i + 1) {
      out[key] = null
      i = end
      continue
    }
    const block = lines.slice(i + 1, end)
    const head = block[0]
    if (!head) {
      out[key] = null
    } else if (head.isItem) {
      out[key] = parseSeq(block, 0, head.indent)[0]
    } else {
      out[key] = parseMap(block, 0, head.indent)[0]
    }
    i = end
  }
  return [out, i]
}

function parseSeq(lines: Line[], start: number, indent: number): [unknown[], number] {
  const out: unknown[] = []
  let i = start
  while (i < lines.length) {
    const line = lines[i]
    if (!line || line.indent !== indent || !line.isItem) break
    const end = childrenOf(lines, i + 1, indent, false)
    const nested = lines.slice(i + 1, end)
    const looksLikeKey = /^[^:\s][^:]*:(\s|$)/.test(line.text)

    if (!looksLikeKey && nested.length === 0) {
      out.push(parseScalar(line.text))
      i = end
      continue
    }

    // A map item: its first key sits inline after the dash, the rest follow
    // indented. Re-present the inline key as a normal map line.
    const itemLines: Line[] = []
    if (line.text !== '') {
      itemLines.push({ ...line, indent: indent + 2, isItem: false })
    }
    for (const child of nested) {
      itemLines.push({ ...child, indent: indent + 2 })
    }
    const head = itemLines[0]
    out.push(head ? parseMap(itemLines, 0, head.indent)[0] : {})
    i = end
  }
  return [out, i]
}

function parseScalar(value: string): unknown {
  if (value === '' || value === '~' || value === 'null') return null
  if (value === 'true') return true
  if (value === 'false') return false
  // The one flow collection Tina writes: an emptied list or map comes back as
  // `[]` / `{}` on one line. Read as text these become the STRING "[]", which
  // every `Array.isArray` guard downstream rejects — same end result by luck,
  // but the wrong type, and `hoursOverrides: []` is exactly this case.
  if (value === '[]') return []
  if (value === '{}') return {}
  const quoted = value.match(/^"([\s\S]*)"$/) ?? value.match(/^'([\s\S]*)'$/)
  if (quoted && quoted[1] !== undefined) {
    return quoted[1].replace(/\\"/g, '"').replace(/''/g, "'")
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  return value
}
