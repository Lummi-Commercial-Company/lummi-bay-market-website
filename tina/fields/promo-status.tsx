import React, { useCallback, useEffect, useState } from 'react'
import { useCMS, wrapFieldsWithMeta, type ScreenPlugin } from 'tinacms'
import { pacificStamp } from '../../lib/pacific-time'
import {
  describeAll,
  describePromo,
  previewRows,
  rowsFrom,
  type PreviewRow,
  type PromoStatus,
  type StatusTag,
} from '../../lib/promo-status'

/**
 * Promotion status in the CMS (ADR 0018 §4): Live, Scheduled, Ended or Off,
 * derived from the dates every time it is looked at and never stored — a
 * stored "Live" would still say Live the day after the offer ended.
 *
 * Tina's own list of promotions has fixed columns, so the tag cannot sit in
 * it. It sits in two places Tina does allow:
 *   - HeadlineField: the headline input with its 28-character counter, and the
 *     promotion's status under it, updating as the form is edited.
 *   - PromotionStatusScreen: "Promotion status" in the CMS menu — every
 *     promotion with its tag, including the ones that are live but waiting
 *     for a slot, which a single form cannot know.
 *
 * Both use lib/promo-status.ts, the same rules the site uses.
 */

const HEADLINE_CAP = 28

const TAG_STYLE: Record<StatusTag, { background: string; color: string }> = {
  live: { background: '#1f7a45', color: '#fff' },
  waiting: { background: '#b7791f', color: '#fff' },
  scheduled: { background: '#1C4E8F', color: '#fff' },
  problem: { background: '#b42318', color: '#fff' },
  off: { background: '#6b7280', color: '#fff' },
  ended: { background: '#e5e7eb', color: '#374151' },
}

export function StatusTagPill({ status }: { status: PromoStatus }) {
  return (
    <span
      style={{
        ...TAG_STYLE[status.tag],
        display: 'inline-block',
        borderRadius: 99,
        padding: '3px 10px',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {status.tag === 'live' ? '● ' : ''}
      {status.label}
    </span>
  )
}

interface FieldProps {
  input: { value: unknown; onChange: (value: unknown) => void; name: string }
  form?: { subscribe?: (fn: (state: { values: Record<string, unknown> }) => void, sub: { values: true }) => () => void }
}

function Headline({ input, form }: FieldProps) {
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [now, setNow] = useState(() => pacificStamp(new Date()))
  useEffect(() => form?.subscribe?.((state) => setValues(state.values ?? {}), { values: true }), [form])
  // The tag is about "now", so it keeps up if the form is left open.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(pacificStamp(new Date())), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const value = typeof input.value === 'string' ? input.value : ''
  const over = value.length > HEADLINE_CAP
  const status = describePromo('this promotion', { ...values, headline: value }, now)

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '0 0 10px', flexWrap: 'wrap' }}>
        <StatusTagPill status={status} />
        <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.45 }}>{status.detail}</span>
      </div>
      <input
        value={value}
        onChange={(event) => input.onChange(event.target.value)}
        style={{
          width: '100%',
          font: 'inherit',
          fontSize: 14,
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid #b9c3cf',
        }}
      />
      <div style={{ fontSize: 12, marginTop: 4, color: over ? '#b7791f' : '#5b6570' }}>
        {value.length} / {HEADLINE_CAP} characters
        {over ? ' — it still fits, but a shorter headline reads better at every size.' : ''}
      </div>
    </div>
  )
}

// Tina's published field-component type is narrower than the props it passes.
export const HeadlineField = wrapFieldsWithMeta(Headline as never) as never

/* ---------- the status screen ------------------------------------------- */

const QUERY = `query PromotionStatus {
  promosConnection(first: 200) { edges { node { ... on Promos { _sys { filename relativePath } _values } } } }
  infoPagesConnection(first: 500) { edges { node { ... on InfoPages { _sys { filename } } } } }
  mainPagesConnection(first: 50) { edges { node { ... on MainPages { _sys { filename } _values } } } }
  settings(relativePath: "site.json") { ... on Settings { _values } }
}`

interface Edge<T> {
  node: T
}
interface QueryResult {
  promosConnection: { edges: Edge<{ _sys: { filename: string; relativePath: string }; _values: Record<string, unknown> }>[] }
  infoPagesConnection: { edges: Edge<{ _sys: { filename: string } }>[] }
  mainPagesConnection: { edges: Edge<{ _sys: { filename: string }; _values: Record<string, unknown> }>[] }
  settings: { _values: Record<string, unknown> }
}

type Row = ReturnType<typeof describeAll>[number]

/**
 * The promotion region drawn small: each row as visitors see it now, with the
 * headline in each place. Answers "what goes where" without opening the site.
 */
function LayoutPreview({ title, note, rows }: { title: string; note: string; rows: PreviewRow[] }) {
  return (
    <section style={{ margin: '0 0 22px' }}>
      <h3 style={{ fontSize: 16, margin: '0 0 2px', color: '#1f2937' }}>{title}</h3>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: '#4b5563' }}>{note}</p>
      {rows.length === 0 ? (
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Nothing is showing here right now.</p>
      ) : (
        <div style={{ display: 'grid', gap: 6, maxWidth: 640 }}>
          {rows.map((row, r) => (
            <div key={r} style={{ display: 'grid', gridTemplateColumns: '64px repeat(12, 1fr)', gap: 6, alignItems: 'stretch' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', alignSelf: 'center' }}>Row {r + 1}</div>
              {row.items.map((item, i) => (
                <a
                  key={item.id}
                  href={`#/collections/edit/promos/${item.id.replace(/\.mdx?$/, '').split('/').map(encodeURIComponent).join('/')}`}
                  style={{
                    gridColumn: `span ${row.spans[i]}`,
                    background: '#e8eef7',
                    border: '1px solid #b9c8de',
                    borderRadius: 6,
                    padding: '10px 8px',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1C4E8F',
                    textAlign: 'center',
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item.headline}
                </a>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function PromotionStatus() {
  const cms = useCMS()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [preview, setPreview] = useState<{ home: PreviewRow[]; pages: PreviewRow[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkedAt, setCheckedAt] = useState('')

  const load = useCallback(async () => {
    setError(null)
    try {
      const client = cms.api.tina
      if (!client) throw new Error('no content API')
      const data = (await client.request(QUERY, { variables: {} })) as QueryResult
      const settings = data.settings?._values ?? {}
      const liveMain = String(settings.liveMainPage ?? '').split('/').pop()?.replace(/\.mdx?$/, '')
      const home = data.mainPagesConnection.edges.find((e) => e.node._sys.filename === liveMain)?.node._values
      const pageRows = rowsFrom(settings.promoRows)
      const now = pacificStamp(new Date())
      // The path inside Promotions, folder and all, so a promotion kept in a
      // folder opens from here too. The CMS's own folder placeholder
      // (.gitkeep) is not a promotion.
      const docs = data.promosConnection.edges
        .filter((e) => !e.node._sys.filename.startsWith('.'))
        .map((e) => ({ id: e.node._sys.relativePath, data: e.node._values }))
      const offerPages = new Set(data.infoPagesConnection.edges.map((e) => e.node._sys.filename))
      const homeRows = rowsFrom(home?.promoRows, pageRows)
      setRows(describeAll(docs, now, { offerPages, homeRows, pageRows }))
      setPreview({
        home: previewRows(docs, now, homeRows, 'home', offerPages),
        pages: previewRows(docs, now, pageRows, 'all-interior', offerPages),
      })
      setCheckedAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
    } catch {
      setError('The promotions could not be loaded just now. Try again in a moment.')
    }
  }, [cms])

  useEffect(() => {
    void load()
  }, [load])

  const live = rows?.filter((row) => row.status.tag === 'live').length ?? 0

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000, fontFamily: 'inherit' }}>
      <h2 style={{ fontSize: 24, margin: '0 0 6px', color: '#b45309' }}>Promotion Status</h2>
      <p style={{ margin: '0 0 18px', color: '#4b5563', fontSize: 14, lineHeight: 1.5, maxWidth: '70ch' }}>
        Every promotion and whether visitors can see it right now, in Pacific time. Worked out from the
        dates each time this page loads — nothing here is stored.{' '}
        {rows ? `${live} live${checkedAt ? `, checked at ${checkedAt}` : ''}.` : ''}{' '}
        <button
          type="button"
          onClick={() => void load()}
          style={{ font: 'inherit', fontSize: 13, padding: '3px 10px', borderRadius: 6, border: '1px solid #b9c3cf', background: '#fff', cursor: 'pointer' }}
        >
          Check again
        </button>
      </p>
      {error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
      {preview ? (
        <>
          <LayoutPreview
            title="Home page, right now"
            note='Rows come from the Home page (Home Page(s) → "Promotion rows on this page"), or from Site Settings if it has none. Places fill top to bottom, left to right, by "Order": 1 first. Promotions with no Order number go after the numbered ones.'
            rows={preview.home}
          />
          <LayoutPreview
            title="Every page except Home, right now"
            note="Rows come from Site Settings → Promotion rows. A page with its own rows, or promotions chosen for it, can differ."
            rows={preview.pages}
          />
        </>
      ) : null}
      {rows === null && !error ? <p>Loading…</p> : null}
      {rows?.length === 0 ? <p>No promotions yet. Add one under Promo Pages.</p> : null}
      {rows?.length ? (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
          {rows.map((row, index) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(120px, auto) 1fr',
                gap: 16,
                alignItems: 'start',
                padding: '14px 16px',
                borderTop: index ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <div>
                <StatusTagPill status={row.status} />
              </div>
              <div>
                <a
                  href={`#/collections/edit/promos/${row.id.replace(/\.mdx?$/, '').split('/').map(encodeURIComponent).join('/')}`}
                  style={{ fontSize: 15, fontWeight: 600, color: '#1C4E8F' }}
                >
                  {row.headline}
                </a>
                <div style={{ fontSize: 13, color: '#4b5563', marginTop: 3, lineHeight: 1.45 }}>{row.status.detail}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function StatusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </svg>
  )
}

// Tina 3 no longer exports `createScreen`; a screen is this plain object.
export const PromotionStatusScreen: ScreenPlugin = {
  __type: 'screen',
  name: 'Promotion Status',
  Component: () => <PromotionStatus />,
  Icon: StatusIcon,
  layout: 'fullscreen',
  navCategory: 'Site',
}
