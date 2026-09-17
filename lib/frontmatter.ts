/**
 * A deliberately small YAML-frontmatter reader.
 *
 * Why this exists instead of a library: the only frontmatter parser already in
 * the tree (`gray-matter`) arrives as a transitive dependency of the TinaCMS
 * *CLI*, which is a devDependency — importing it from application code would
 * mean depending on something we never declared. Adding a runtime dependency
 * needs sign-off, so this reads the narrow subset of YAML that TinaCMS itself
 * writes: scalars, nested maps, and lists of scalars or maps.
 *
 * It does NOT support anchors, multi-line block scalars (`|`, `>`), flow
 * collections (`[a, b]`) or multi-document files. Editors never type YAML —
 * Tina writes it from the schema — so that subset is the whole surface.
 *
 * Phase 2 replaces this: once the Tina Cloud project exists, content is read
 * through Tina's generated GraphQL client (needed anyway for visual editing and
 * for per-request prices, ADR 0024) and this file can be deleted.
 */

type Line = { indent: number; text: string; isItem: boolean }

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
  const lines: Line[] = []
  for (const rawLine of source.split(/\r?\n/)) {
    if (rawLine.trim() === '' || rawLine.trim().startsWith('#')) continue
    const indent = rawLine.length - rawLine.replace(/^ +/, '').length
    let text = rawLine.trim()
    let isItem = false
    if (text === '-' || text.startsWith('- ')) {
      isItem = true
      text = text.slice(1).trim()
    }
    lines.push({ indent, text, isItem })
  }
  if (lines.length === 0) return {}
  const first = lines[0]
  if (!first) return {}
  const [value] = parseMap(lines, 0, first.indent)
  return value
}

/** Lines belonging under a parent at `indent`. */
function childrenOf(lines: Line[], start: number, indent: number): number {
  let end = start
  while (end < lines.length) {
    const line = lines[end]
    if (!line) break
    const deeper = line.indent > indent
    // A list written flush with its key (`amenities:` then `- fuel` at the same
    // column) is still a child. Accept both stylings.
    const flushItem = line.indent === indent && line.isItem
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
    if (inline !== '') {
      out[key] = parseScalar(inline)
      i++
      continue
    }
    const end = childrenOf(lines, i + 1, indent)
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
    const end = childrenOf(lines, i + 1, indent)
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
      itemLines.push({ indent: indent + 2, text: line.text, isItem: false })
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
  const quoted = value.match(/^"([\s\S]*)"$/) ?? value.match(/^'([\s\S]*)'$/)
  if (quoted && quoted[1] !== undefined) {
    return quoted[1].replace(/\\"/g, '"').replace(/''/g, "'")
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
  return value
}
