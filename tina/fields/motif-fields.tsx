import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCMS, wrapFieldsWithMeta } from 'tinacms'
import { checkMotifSvg, MOTIF_FOLDER, type MotifCheck } from '../../lib/motif-check'

/**
 * CMS fields for the header motif band (ADR 0021, amended 30 Sep 2026).
 *
 *   MotifFileField — the motif library. It can see ONE folder,
 *     uploads/motifs, and nothing else: no promo pictures, no photos. Every
 *     file is checked (lib/motif-check) before it is uploaded, and again
 *     before an existing file is chosen; a failing file is never stored or
 *     chosen, and the reasons are shown in plain words.
 *   rangeField — a slider with its value beside it, for strength, scale and
 *     spacing, as the approved motif proof had them.
 *   MotifGroupPreview — the band as it will look, from the form's own values,
 *     drawn inside the form while it is edited.
 *
 * The site checks every file again when it draws the header, so a file that
 * reaches the folder some other way still cannot get into the band.
 */

/** Media-root-relative folder the store is asked for: public/uploads/motifs. */
const STORE_DIR = MOTIF_FOLDER.replace(/^\/uploads\//, '').replace(/\/$/, '')

/** Words ad blockers match in addresses (ADR 0007); a motif named so may vanish. */
const BLOCKED_WORDS = /(^|[^a-z])(ad|ads|advert|banner|sponsor(ed)?)([^a-z]|$)/i

/**
 * Where each motif file can be fetched from in the editor. A file uploaded a
 * minute ago is in the media store before the site has redeployed with it, so
 * the store's own address is remembered and preferred over the site path.
 */
const sources = new Map<string, string>()
const pathFor = (filename: string) => `${MOTIF_FOLDER}${filename}`

async function fetchText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    return response.ok ? await response.text() : null
  } catch {
    return null
  }
}

const svgDataUrl = (text: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`

/** The file's code, checked, and a data URL to draw it with. */
function useMotif(path: string | undefined) {
  const [state, setState] = useState<{ check: MotifCheck | null; url: string | null; missing: boolean }>({
    check: null,
    url: null,
    missing: false,
  })
  useEffect(() => {
    let live = true
    if (!path) {
      setState({ check: null, url: null, missing: false })
      return
    }
    const load = async () => {
      const text = (await fetchText(sources.get(path) ?? path)) ?? (await fetchText(path))
      if (!live) return
      if (text === null) setState({ check: null, url: null, missing: true })
      else setState({ check: checkMotifSvg(text), url: svgDataUrl(text), missing: false })
    }
    void load()
    return () => {
      live = false
    }
  }, [path])
  return state
}

/* ---------- small shared pieces ------------------------------------------ */

const ui = {
  box: { border: '1px solid #d7dde5', borderRadius: 8, padding: 12, background: '#fff' },
  row: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' as const },
  btn: {
    font: 'inherit',
    fontSize: 13,
    padding: '6px 12px',
    borderRadius: 6,
    border: '1px solid #b9c3cf',
    background: '#f6f8fa',
    cursor: 'pointer',
  },
  primary: { background: '#1C4E8F', color: '#fff', border: '1px solid #1C4E8F' },
  danger: { color: '#a11', borderColor: '#e2b3b3', background: '#fff7f7' },
  error: { color: '#a11', fontSize: 13, margin: '6px 0 0', lineHeight: 1.45 },
  warn: { color: '#8a5a00', fontSize: 13, margin: '6px 0 0', lineHeight: 1.45 },
  ok: { color: '#17663a', fontSize: 13, margin: '6px 0 0' },
  swatch: {
    background: '#14396B',
    borderRadius: 6,
    display: 'grid',
    placeItems: 'center',
    flex: 'none' as const,
  },
}

function MotifSwatch({ url, size = 56 }: { url: string | null; size?: number }) {
  return (
    <span style={{ ...ui.swatch, width: size * 1.6, height: size }} aria-hidden="true">
      {url ? (
        <span
          style={{
            width: '86%',
            height: '72%',
            background: '#F5F1E8',
            WebkitMaskImage: `url("${url}")`,
            maskImage: `url("${url}")`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      ) : null}
    </span>
  )
}

function CheckResult({ check, missing }: { check: MotifCheck | null; missing?: boolean }) {
  if (missing) {
    return (
      <p style={ui.warn}>
        This file could not be opened here to re-check it. The site checks it again before showing it, and leaves it
        out if it fails.
      </p>
    )
  }
  if (!check) return null
  return (
    <>
      {check.errors.map((error) => (
        <p key={error} style={ui.error}>
          ✕ {error}
        </p>
      ))}
      {check.warnings.map((warning) => (
        <p key={warning} style={ui.warn}>
          ! {warning}
        </p>
      ))}
      {check.ok ? (
        <p style={ui.ok}>
          ✓ Passes the motif check — {Math.round(check.width)} × {Math.round(check.height)}, {check.ratio.toFixed(2)}{' '}
          times wider than tall, {(check.bytes / 1000).toFixed(1)} KB.
        </p>
      ) : null}
    </>
  )
}

/* ---------- the motif library field --------------------------------------- */

interface MediaItem {
  id: string
  filename: string
  directory: string
  src?: string
  type: 'file' | 'dir'
}

// Tina's field props are loosely typed; these are the parts used.
interface FieldProps {
  input: { value: unknown; onChange: (value: unknown) => void; name: string }
  field: { name: string; label?: string }
  form?: { subscribe?: (fn: (state: { values: Record<string, unknown> }) => void, sub: { values: true }) => () => void }
}

function MotifFile({ input }: FieldProps) {
  const cms = useCMS()
  const value = typeof input.value === 'string' ? input.value : ''
  const current = useMotif(value || undefined)
  const [library, setLibrary] = useState<MediaItem[] | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [upload, setUpload] = useState<{ name: string; check: MotifCheck; note?: string } | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement | null>(null)

  const refresh = useCallback(async () => {
    try {
      // `thumbnailSizes` is required in practice: Tina's store maps over it.
      const list = await cms.media.list({
        directory: STORE_DIR,
        filesOnly: true,
        limit: 200,
        thumbnailSizes: [{ w: 75, h: 75 }],
      })
      const files = (list.items as MediaItem[]).filter((item) => item.type === 'file' && /\.svg$/i.test(item.filename))
      for (const item of files) if (item.src) sources.set(pathFor(item.filename), item.src)
      setLibrary(files)
    } catch {
      setLibrary([])
      setMessage('The motif library could not be listed just now. Try again in a moment.')
    }
  }, [cms])

  useEffect(() => {
    if (open && library === null) void refresh()
  }, [open, library, refresh])

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    setMessage(null)
    if (!file) return
    if (!/\.svg$/i.test(file.name)) {
      setUpload({
        name: file.name,
        check: { ...checkMotifSvg(''), errors: ['Motifs must be SVG files (.svg) — shapes, not a photo or a PNG.'] },
      })
      return
    }
    const check = checkMotifSvg(await file.text())
    const note = BLOCKED_WORDS.test(file.name.replace(/\.svg$/i, ''))
      ? 'The file name contains a word ad blockers hide (ad, banner, sponsored…). Rename it for what it shows, for example orca.svg.'
      : undefined
    setUpload({ name: file.name, check, note })
    // A failing file is never stored.
    if (!check.ok || note) return
    setBusy(true)
    try {
      const [stored] = (await cms.media.persist([{ directory: STORE_DIR, file }])) as MediaItem[]
      const filename = stored?.filename ?? file.name
      if (stored?.src) sources.set(pathFor(filename), stored.src)
      input.onChange(pathFor(filename))
      setLibrary(null)
      setMessage(`Uploaded ${filename} to the motif library and chose it. Save the group to keep it.`)
    } catch {
      setMessage('The upload did not go through. Check the connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  const choose = async (item: MediaItem) => {
    setMessage(null)
    const path = pathFor(item.filename)
    const text = (await fetchText(item.src ?? path)) ?? (await fetchText(path))
    if (text !== null) {
      const check = checkMotifSvg(text)
      if (!check.ok) {
        setUpload({ name: item.filename, check })
        return
      }
    }
    input.onChange(path)
    setOpen(false)
  }

  const remove = async (item: MediaItem) => {
    const ok = window.confirm(
      `Delete ${item.filename} from the motif library?\n\nAny group that uses it will simply skip it. Deleted files stay in the site's history and can be restored.`
    )
    if (!ok) return
    try {
      await cms.media.delete(item as never)
      if (value === pathFor(item.filename)) input.onChange('')
      setLibrary(null)
      await refresh()
    } catch {
      setMessage(`${item.filename} could not be deleted just now.`)
    }
  }

  return (
    <div style={ui.box}>
      <div style={ui.row}>
        <MotifSwatch url={current.url} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, wordBreak: 'break-all' }}>
            {value ? value.replace(MOTIF_FOLDER, '') : 'No motif chosen'}
          </div>
          {value ? <CheckResult check={current.check} missing={current.missing} /> : null}
        </div>
      </div>

      <div style={{ ...ui.row, marginTop: 10 }}>
        <button type="button" style={{ ...ui.btn, ...ui.primary }} disabled={busy} onClick={() => fileInput.current?.click()}>
          {busy ? 'Uploading…' : 'Upload a new motif'}
        </button>
        <button type="button" style={ui.btn} onClick={() => setOpen((v) => !v)}>
          {open ? 'Close the motif library' : 'Choose from the motif library'}
        </button>
        {value ? (
          <button type="button" style={ui.btn} onClick={() => input.onChange('')}>
            Clear
          </button>
        ) : null}
        <input ref={fileInput} type="file" accept=".svg,image/svg+xml" hidden onChange={onUpload} />
      </div>

      {upload ? (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{upload.name}</div>
          <CheckResult check={upload.check} />
          {upload.note ? <p style={ui.error}>✕ {upload.note}</p> : null}
          {!upload.check.ok || upload.note ? (
            <p style={ui.error}>Not uploaded. Fix the file and upload it again.</p>
          ) : null}
        </div>
      ) : null}
      {message ? <p style={ui.ok}>{message}</p> : null}

      {open ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#5b6570', marginBottom: 6 }}>
            The motif library — only header motifs are kept here.
          </div>
          {library === null ? <p style={{ fontSize: 13 }}>Loading…</p> : null}
          {library?.length === 0 ? <p style={{ fontSize: 13 }}>No motifs uploaded yet.</p> : null}
          <div style={{ display: 'grid', gap: 8 }}>
            {library?.map((item) => (
              <LibraryRow key={item.id} item={item} chosen={value === pathFor(item.filename)} onChoose={choose} onDelete={remove} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function LibraryRow({
  item,
  chosen,
  onChoose,
  onDelete,
}: {
  item: MediaItem
  chosen: boolean
  onChoose: (item: MediaItem) => void
  onDelete: (item: MediaItem) => void
}) {
  const motif = useMotif(pathFor(item.filename))
  return (
    <div style={{ ...ui.row, border: '1px solid #e3e7ec', borderRadius: 6, padding: 6 }}>
      <MotifSwatch url={motif.url} size={36} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, wordBreak: 'break-all' }}>
        {item.filename}
        {motif.check && !motif.check.ok ? <span style={{ color: '#a11' }}> — fails the check</span> : null}
      </span>
      <button type="button" style={ui.btn} disabled={chosen} onClick={() => onChoose(item)}>
        {chosen ? 'Chosen' : 'Use'}
      </button>
      <button type="button" style={{ ...ui.btn, ...ui.danger }} onClick={() => onDelete(item)}>
        Delete
      </button>
    </div>
  )
}

// Tina's published field-component type is narrower than the props it passes
// at runtime (form, tinaForm); cast once here rather than at every use.
export const MotifFileField = wrapFieldsWithMeta(MotifFile as never) as never

/* ---------- sliders ------------------------------------------------------- */

export function rangeField(min: number, max: number, fallback: number, step: number, unit: string) {
  function Range({ input }: FieldProps) {
    const value = typeof input.value === 'number' ? input.value : fallback
    return (
      <div style={{ ...ui.row, gap: 12 }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => input.onChange(Number(event.target.value))}
          style={{ flex: 1, minWidth: 140, accentColor: '#1C4E8F' }}
          aria-label={`${input.name} (${min}–${max}${unit})`}
        />
        <span style={{ fontVariantNumeric: 'tabular-nums', minWidth: 48, fontSize: 14 }}>
          {value}
          {unit}
        </span>
      </div>
    )
  }
  return wrapFieldsWithMeta(Range as never) as never
}

/* ---------- the live preview ---------------------------------------------- */

const INK: Record<string, string> = { bone: '#F5F1E8', teal: '#0FB5C4', white: '#FFFFFF' }

function PreviewMotif({ path, scale }: { path: string; scale: number }) {
  const motif = useMotif(path)
  if (!motif.url || !motif.check?.ok) return null
  return (
    <span
      style={{
        flex: 'none',
        height: '100%',
        maxWidth: '100%',
        aspectRatio: String(motif.check.ratio * (scale / 100)),
        background: 'var(--preview-ink)',
        WebkitMaskImage: `url("${motif.url}")`,
        maskImage: `url("${motif.url}")`,
        WebkitMaskSize: '100% auto',
        maskSize: '100% auto',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }}
    />
  )
}

/**
 * Shown under the group's name: the band on a navy bar the width of a
 * desktop header's motif gap, redrawn as the sliders move. It is the same
 * layout the site uses — one row, whole motifs, right-aligned.
 */
function GroupNameWithPreview(props: FieldProps) {
  const { input, form } = props
  const [all, setAll] = useState<Record<string, unknown>>({})
  useEffect(() => form?.subscribe?.((state) => setAll(state.values ?? {}), { values: true }), [form])
  // This field is a group's name. In Site settings the group is one row of a
  // list (`headerMotifs.groups.2.name`), so its sliders and motifs are the
  // values beside it, not the whole form's.
  const values = String(input.name)
    .split('.')
    .slice(0, -1)
    .reduce<Record<string, unknown>>((node, key) => ((node?.[key] as Record<string, unknown>) ?? {}), all)

  const scale = typeof values.scale === 'number' ? values.scale : 86
  const strength = typeof values.strength === 'number' ? values.strength : 14
  const spacing = typeof values.spacing === 'number' ? values.spacing : 24
  const ink = INK[String(values.ink ?? 'bone')] ?? INK.bone
  const files = Array.isArray(values.motifs)
    ? (values.motifs as { file?: string }[]).map((row) => row?.file).filter((f): f is string => Boolean(f))
    : []
  const repeated = values.repeat === false ? files : Array.from({ length: 8 }, () => files).flat()

  return (
    <div>
      <input
        value={typeof input.value === 'string' ? input.value : ''}
        onChange={(event) => input.onChange(event.target.value)}
        style={{ width: '100%', font: 'inherit', fontSize: 14, padding: '8px 10px', borderRadius: 6, border: '1px solid #b9c3cf' }}
      />
      <div style={{ fontSize: 12, color: '#5b6570', margin: '12px 0 6px' }}>
        Preview — how the band sits in the header, between the menu and the Get the App button
      </div>
      <div
        style={{
          background: '#1C4E8F',
          borderRadius: 6,
          height: 56,
          display: 'flex',
          alignItems: 'stretch',
          padding: '0 10px',
          gap: 20,
          ['--preview-ink' as string]: ink,
        }}
      >
        <span style={{ color: '#F5F1E8', fontSize: 12, alignSelf: 'center', opacity: 0.8 }}>Home · Locations · Truck Stop</span>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            alignContent: 'flex-start',
            columnGap: spacing,
            rowGap: 0,
            overflow: 'hidden',
            opacity: strength / 100,
          }}
        >
          {repeated.map((path, index) => (
            <PreviewMotif key={`${path}-${index}`} path={path} scale={scale} />
          ))}
        </div>
        <span
          style={{
            alignSelf: 'center',
            background: '#C9772E',
            color: '#fff',
            borderRadius: 99,
            padding: '6px 12px',
            fontSize: 12,
            boxShadow: '0 0 0 1.5px #F5F1E8',
          }}
        >
          ★ Get the App
        </span>
      </div>
      {files.length === 0 ? (
        <p style={{ fontSize: 12, color: '#5b6570' }}>Add motifs below to see them here.</p>
      ) : null}
    </div>
  )
}

export const GroupNameField = wrapFieldsWithMeta(GroupNameWithPreview as never) as never
