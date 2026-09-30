import React, { useEffect } from 'react'
import type { ScreenPlugin, TinaCMS } from 'tinacms'
import { PromotionStatusScreen } from './promo-status'

/**
 * The SITE section of the CMS menu, in the owner's order (30 Sep 2026):
 *
 *   Site Settings · Promotion Status · Media Manager · Header Motif Groups
 *
 * The owner asked for Promotion Status first. Tina always draws its "global"
 * collections — Site Settings — above every screen, and offers no way to
 * change that, so Site Settings leads and the rest follow in the asked order.
 * Media Manager is added by Tina itself before this runs, so it is taken out
 * and put back after Promotion Status.
 *
 * Header Motif Groups live inside Site Settings → Header motifs, beside the
 * background watermark; this entry is a shortcut that opens Site Settings.
 */

const SITE_SETTINGS = '#/collections/settings/~'

function OpenSiteSettings() {
  useEffect(() => {
    window.location.hash = SITE_SETTINGS
  }, [])
  return (
    <div style={{ padding: 32, fontSize: 14, color: '#4b5563' }}>
      Header motif groups are in <a href={SITE_SETTINGS}>Site Settings → Header motifs</a>, below Background
      watermark. Opening it…
    </div>
  )
}

function MotifIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 15c3-5 6 5 9 0s6 5 9 0" />
      <path d="M3 9c3-5 6 5 9 0s6 5 9 0" opacity=".5" />
    </svg>
  )
}

const HeaderMotifsShortcut: ScreenPlugin = {
  __type: 'screen',
  name: 'Header Motif Groups',
  Component: () => <OpenSiteSettings />,
  Icon: MotifIcon,
  layout: 'fullscreen',
  navCategory: 'Site',
}

/**
 * Safe to run more than once — Tina calls it from a React effect, which runs
 * twice in development: everything is taken out first, then added in order.
 */
export function arrangeSiteMenu(cms: TinaCMS) {
  const screens = cms.plugins.findOrCreateMap<ScreenPlugin>('screen')
  const media = screens.find('Media Manager')
  for (const name of [PromotionStatusScreen.name, 'Media Manager', HeaderMotifsShortcut.name]) screens.remove(name)
  screens.add(PromotionStatusScreen)
  if (media) screens.add(media)
  screens.add(HeaderMotifsShortcut)
  return cms
}
