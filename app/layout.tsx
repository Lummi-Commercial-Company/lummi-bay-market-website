import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { BackToTop } from '@/components/layout/BackToTop'
import { PageBackdrop } from '@/components/layout/PageBackdrop'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { getSettings } from '@/lib/settings'
import { SITE_URL } from '@/lib/site'

/**
 * Fonts are self-hosted, not fetched from a third party at runtime.
 * `next/font` downloads them at build time and serves them from this origin,
 * which keeps /privacy's "this site sets no cookies" true — a runtime request
 * to fonts.googleapis.com is a third-party connection made before anybody
 * clicks anything (ADR 0025).
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

const HEADER_ID = 'site-header'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Lummi Bay Market',
    template: '%s · Lummi Bay Market',
  },
  description:
    'Fuel, convenience and a truck stop on Lummi Nation — Exit 260, the Minimart and Fisherman’s Cove.',
  applicationName: 'Lummi Bay Market',
  manifest: '/site.webmanifest',
  icons: {
    // The paddle-alone icon mark: the one carve-out from the locked logo, for
    // small square slots the lockup cannot fill. It never stands in for the
    // lockup in the header or the hero.
    icon: [
      { url: '/brand/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/brand/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/brand/favicon.ico',
    apple: '/brand/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Lummi Bay Market',
    locale: 'en_US',
    images: [
      {
        url: '/brand/share/share-default-2026-09.jpg',
        width: 1200,
        height: 630,
        alt: 'Lummi Bay Market',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  themeColor: '#1C4E8F',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings()

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        {/* Decoration, behind everything, off on phones (ADR 0020). */}
        <PageBackdrop settings={settings.backdrop} />

        {/* Header, waterline and the emergency notice — one sticky wrapper. */}
        <SiteHeader />

        <main id="main">{children}</main>

        <SiteFooter />

        {/* In the layout, so no page can forget it (ADR 0011). */}
        <BackToTop headerId={HEADER_ID} />
      </body>
    </html>
  )
}
