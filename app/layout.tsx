import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Waterline from "@/components/Waterline";
import BackToTop from "@/components/BackToTop";
import "./globals.css";

// Locked typefaces — skill `brand-system`. Do not add families beyond these two.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lummi Bay Market",
    template: "%s · Lummi Bay Market",
  },
  description:
    "Fuel, convenience stores and a full truck stop at three locations around Bellingham and Ferndale, Washington.",
  icons: {
    // TODO: the favicons carry the full 3:1 lockup and smear at 16px. A mark needs
    // NEW art — the paddle alone was ruled out. Launch checklist A11.
    icon: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
};

/**
 * The layout owns the header, footer, waterline and back-to-top so a page cannot lose
 * or move them (ADR 0015). Pages supply their own content and nothing else.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <Waterline />
        <main id="main">{children}</main>
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}
