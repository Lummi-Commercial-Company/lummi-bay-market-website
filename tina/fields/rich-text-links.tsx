import React, { useEffect, useMemo, useState } from 'react'
import { MdxFieldPlugin, useCMS } from 'tinacms'
import {
  addLink,
  isSafeLinkUrl,
  listLinks,
  ownSitePath,
  setLinkUrl,
  unlink,
  type RichNode,
} from '../../lib/rich-text-links'

/**
 * Tina's own rich-text editor, with a Links panel under it.
 *
 * Why: Tina 3.14's link tool can make a NEW link (select plain words, press
 * the link button, paste an address) but cannot edit or remove one that
 * already exists — the button does nothing on a link, and its "Edit link /
 * Unlink" bar never appears on screen. Reproduced 30 Sep 2026.
 *
 * The panel lists every link in the text. Each has its address, a list of the
 * pages on this site to pick from, and Unlink. "Add a link" links words
 * already in the text. Edits go into the saved text (lib/rich-text-links.ts)
 * and the editor above reloads to show them.
 */

const TinaRichText = MdxFieldPlugin.Component as unknown as React.FC<Record<string, unknown>>

interface SitePage {
  path: string
  label: string
}

/** Pages every build has, in the order a guest meets them. */
const FIXED_PAGES: SitePage[] = [
  { path: '/', label: 'Home' },
  { path: '/locations', label: 'Locations' },
  { path: '/truck-stop', label: 'Truck Stop' },
  { path: '/rewards', label: 'Rewards app' },
  { path: '/fuel-prices', label: 'Fuel prices' },
]

const PAGES_QUERY = `query SitePages {
  locationsConnection(first: 50) { edges { node { ... on Locations { _sys { filename } name } } } }
  pagesConnection(first: 200) { edges { node { ... on Pages { _sys { filename } title } } } }
  infoPagesConnection(first: 500) { edges { node { ... on InfoPages { _sys { filename } title } } } }
}`

interface Edges<T> {
  edges: { node: T }[]
}

/** Shared across every rich-text field on the screen: fetched once. */
let pagesPromise: Promise<SitePage[]> | null = null

function useSitePages(): SitePage[] {
  const cms = useCMS()
  const [pages, setPages] = useState<SitePage[]>(FIXED_PAGES)
  useEffect(() => {
    let live = true
    const client = cms.api.tina
    if (!client) return
    pagesPromise ??= client
      .request(PAGES_QUERY, { variables: {} })
      .then((raw) => {
        const data = raw as {
          locationsConnection: Edges<{ _sys: { filename: string }; name: string }>
          pagesConnection: Edges<{ _sys: { filename: string }; title: string }>
          infoPagesConnection: Edges<{ _sys: { filename: string }; title: string }>
        }
        return [
          ...FIXED_PAGES,
          ...data.locationsConnection.edges.map(({ node }) => ({
            path: `/locations/${node._sys.filename}`,
            label: `Location — ${node.name}`,
          })),
          ...data.pagesConnection.edges.map(({ node }) => ({
            path: `/${node._sys.filename}`,
            label: node.title,
          })),
          ...data.infoPagesConnection.edges.map(({ node }) => ({
            path: `/info/${node._sys.filename}`,
            label: `Offer — ${node.title}`,
          })),
        ]
      })
      .catch(() => {
        pagesPromise = null
        return FIXED_PAGES
      })
    void pagesPromise.then((list) => live && setPages(list))
    return () => {
      live = false
    }
  }, [cms])
  return pages
}

const ui = {
  panel: { marginTop: 10, border: '1px solid #d7dde5', borderRadius: 8, background: '#fff', padding: 12 },
  head: { fontSize: 13, fontWeight: 700, color: '#1f2937', margin: 0 },
  note: { fontSize: 12, color: '#5b6570', margin: '2px 0 10px', lineHeight: 1.45 },
  row: { borderTop: '1px solid #eef1f4', padding: '10px 0', display: 'grid', gap: 6 },
  words: { fontSize: 13, fontWeight: 600, color: '#1C4E8F' },
  line: { display: 'flex', gap: 6, flexWrap: 'wrap' as const, alignItems: 'center' },
  input: {
    flex: '1 1 220px',
    minWidth: 0,
    font: 'inherit',
    fontSize: 13,
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid #b9c3cf',
  },
  select: { font: 'inherit', fontSize: 13, padding: '5px 6px', borderRadius: 6, border: '1px solid #b9c3cf', maxWidth: 220 },
  btn: {
    font: 'inherit',
    fontSize: 13,
    padding: '6px 11px',
    borderRadius: 6,
    border: '1px solid #b9c3cf',
    background: '#f6f8fa',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  primary: { background: '#1C4E8F', color: '#fff', border: '1px solid #1C4E8F' },
  danger: { color: '#a11', borderColor: '#e2b3b3', background: '#fff7f7' },
  error: { fontSize: 12, color: '#b42318', margin: 0 },
  hint: { fontSize: 12, color: '#8a5a00', margin: 0 },
}

function UnlinkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ verticalAlign: '-2px', marginRight: 4 }}>
      <path d="M9 17H7a5 5 0 0 1 0-10h2M15 7h2a5 5 0 0 1 1.5 9.77M8 12h3M2 2l20 20" />
    </svg>
  )
}

/** An address box with the site's pages to pick from. */
function AddressInput({
  id,
  value,
  onChange,
  pages,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  pages: SitePage[]
}) {
  return (
    <>
      <input
        style={ui.input}
        value={value}
        list={`${id}-pages`}
        placeholder="/rewards, or https://…"
        aria-label="Link address"
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={`${id}-pages`}>
        {pages.map((page) => (
          <option key={page.path} value={page.path}>
            {page.label}
          </option>
        ))}
      </datalist>
      <select
        style={ui.select}
        value=""
        aria-label="Pick a page on this site"
        onChange={(event) => event.target.value && onChange(event.target.value)}
      >
        <option value="">Pick a page on this site…</option>
        {pages.map((page) => (
          <option key={page.path} value={page.path}>
            {page.label} ({page.path})
          </option>
        ))}
      </select>
    </>
  )
}

function LinkRow({
  id,
  words,
  url,
  pages,
  onSave,
  onUnlink,
}: {
  id: string
  words: string
  url: string
  pages: SitePage[]
  onSave: (url: string) => void
  onUnlink: () => void
}) {
  const [draft, setDraft] = useState(url)
  useEffect(() => setDraft(url), [url])
  const hosts = useMemo(() => ['lummibay.com', typeof window === 'undefined' ? '' : window.location.hostname], [])
  const shortForm = ownSitePath(url, hosts)
  const valid = isSafeLinkUrl(draft)
  const changed = draft.trim() !== url

  return (
    <div style={ui.row}>
      <div style={ui.words}>“{words || '(no words)'}”</div>
      <div style={ui.line}>
        <AddressInput id={id} value={draft} onChange={setDraft} pages={pages} />
        <button type="button" style={{ ...ui.btn, ...ui.primary }} disabled={!changed || !valid} onClick={() => onSave(draft.trim())}>
          Save address
        </button>
        <button type="button" style={{ ...ui.btn, ...ui.danger }} onClick={onUnlink} title="Remove the link and keep the words">
          <UnlinkIcon />
          Unlink
        </button>
      </div>
      {draft && !valid ? (
        <p style={ui.error}>
          Use a page on this site starting with / (for example /rewards), or a full address starting with https://,
          mailto: or tel:.
        </p>
      ) : null}
      {shortForm && !changed ? (
        <p style={ui.hint}>
          This goes to a page on this site the long way, which breaks if the web address changes.{' '}
          <button type="button" style={{ ...ui.btn, padding: '2px 8px' }} onClick={() => onSave(shortForm)}>
            Use {shortForm}
          </button>
        </p>
      ) : null}
    </div>
  )
}

function AddLinkRow({ pages, onAdd }: { pages: SitePage[]; onAdd: (words: string, url: string) => string | null }) {
  const [words, setWords] = useState('')
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const valid = isSafeLinkUrl(url)
  return (
    <div style={ui.row}>
      <div style={{ ...ui.words, color: '#1f2937' }}>Add a link</div>
      <div style={ui.line}>
        <input
          style={ui.input}
          value={words}
          placeholder="Words from the text to link, e.g. Rewards App"
          aria-label="Words to link"
          onChange={(event) => setWords(event.target.value)}
        />
      </div>
      <div style={ui.line}>
        <AddressInput id="add" value={url} onChange={setUrl} pages={pages} />
        <button
          type="button"
          style={{ ...ui.btn, ...ui.primary }}
          disabled={!words.trim() || !valid}
          onClick={() => {
            const problem = onAdd(words, url.trim())
            setMessage(problem)
            if (!problem) {
              setWords('')
              setUrl('')
            }
          }}
        >
          Add link
        </button>
      </div>
      {url && !valid ? (
        <p style={ui.error}>Use a page on this site starting with /, or an address starting with https://, mailto: or tel:.</p>
      ) : null}
      {message ? <p style={ui.error}>{message}</p> : null}
    </div>
  )
}

function RichTextWithLinks(props: Record<string, unknown>) {
  const input = props.input as { value: RichNode | null; onChange: (value: RichNode) => void; name: string }
  const [editorKey, setEditorKey] = useState(0)
  const pages = useSitePages()
  const links = listLinks(input.value)

  // The editor reads its value once, so after a change here it is reloaded.
  const apply = (next: RichNode) => {
    input.onChange(next)
    setEditorKey((key) => key + 1)
  }
  const id = `links-${String(input.name).replace(/[^\w-]/g, '-')}`

  return (
    <>
      <TinaRichText key={editorKey} {...props} />
      <div style={ui.panel}>
        <p style={ui.head}>Links in this text</p>
        <p style={ui.note}>
          Change where a link goes, pick a page on this site, or unlink it — the words stay. To link new words, select
          them in the text above and press the link button, or use “Add a link” below.
        </p>
        {links.length === 0 ? <p style={{ ...ui.note, margin: '0 0 6px' }}>No links in this text yet.</p> : null}
        {links.map((link, index) => (
          <LinkRow
            key={`${link.path.join('.')}-${link.url}`}
            id={`${id}-${index}`}
            words={link.text}
            url={link.url}
            pages={pages}
            onSave={(url) => input.value && apply(setLinkUrl(input.value, link.path, url))}
            onUnlink={() => input.value && apply(unlink(input.value, link.path))}
          />
        ))}
        <AddLinkRow
          pages={pages}
          onAdd={(words, url) => {
            const next = input.value ? addLink(input.value, words, url) : null
            if (!next) return `“${words.trim()}” is not in the text, or is already part of a link. Type the words exactly as they appear.`
            apply(next)
            return null
          }}
        />
      </div>
    </>
  )
}

export const RichTextWithLinksField = RichTextWithLinks as never
