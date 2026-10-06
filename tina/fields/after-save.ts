import type { TinaCMS } from 'tinacms'

/**
 * After a document is saved, go back up one level to the list it came from —
 * the folder it is in, if it is in one (owner, 30 Sep 2026). Tina already does
 * this after *creating* a document; after *editing* one it stays on the form.
 *
 * Tina offers no hook for "an edit was saved", but it announces one with a
 * "Document updated!" message, which is what this listens for. If a Tina
 * upgrade rewords that message, saving simply stays on the form again, as
 * before — nothing breaks.
 *
 * Not for the two single forms staff return to again and again: Site Settings
 * and Fuel Prices. Their "list" is one item, so going up would only add a
 * click. Inside them, saving an item opened from a list — one motif in a
 * motif group, say — goes back up one level to the item it sits in, the same
 * as the back arrow (owner, 6 Oct 2026). Saving at the top stays put.
 */

const SAVED = 'Document updated!'
const STAY = new Set(['settings', 'fuelPrices'])

/** `#/collections/edit/promos/6th_Anniversary/a-great-test` → `#/collections/promos/~/6th_Anniversary`. */
export function listAddressFor(hash: string): string | null {
  const match = hash.match(/^#\/collections\/edit\/([^/]+)\/(.+?)\/?$/)
  if (!match) return null
  const [, collection, path] = match as unknown as [string, string, string]
  if (STAY.has(collection)) return null
  const folder = path.split('/').slice(0, -1).join('/')
  return `#/collections/${collection}/~${folder ? `/${folder}` : ''}`
}

type Crumb = { formId: string; formName: string }

/** The level above the open one, or null at the top of the form. */
export function parentLevelOf(breadcrumbs: readonly Crumb[] | undefined): Crumb | null {
  if (!breadcrumbs || breadcrumbs.length < 2) return null
  const open = breadcrumbs[breadcrumbs.length - 1]!
  if (!open.formName) return null
  return breadcrumbs[breadcrumbs.length - 2]!
}

const WIRED = Symbol.for('lummi-bay.return-to-list')

export function returnToListAfterSave(cms: TinaCMS): TinaCMS {
  // cmsCallback runs twice under React's strict mode: subscribe once.
  const holder = cms as unknown as Record<symbol, boolean>
  if (holder[WIRED]) return cms
  holder[WIRED] = true
  cms.events.subscribe('alerts:add', (raw) => {
    const event = raw as { alert?: { level?: string; message?: unknown } }
    if (event.alert?.level !== 'success' || event.alert.message !== SAVED) return
    const target = listAddressFor(window.location.hash)
    // A moment's delay, as Tina's own "created" path uses, so the save
    // finishes settling before the form closes.
    if (target) {
      window.setTimeout(() => (window.location.hash = target), 10)
      return
    }
    const state = (cms as unknown as { state?: { breadcrumbs?: Crumb[] } }).state
    const parent = parentLevelOf(state?.breadcrumbs)
    if (parent) {
      window.setTimeout(
        () =>
          cms.dispatch({
            type: 'forms:set-active-field-name',
            value: { formId: parent.formId, fieldName: parent.formName },
          }),
        10
      )
    }
  })
  return cms
}
