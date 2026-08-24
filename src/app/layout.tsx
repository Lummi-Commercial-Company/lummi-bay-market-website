import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

/* Locked type pairing — see skill `brand-system`. No other families. */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lummibay.com"),
  title: {
    default: "Lummi Bay Market — fuel, food and a full truck stop",
    template: "%s · Lummi Bay Market",
  },
  description:
    "Three Lummi Bay Market locations near Bellingham and Ferndale, WA. Current fuel prices, hours, and a full truck stop at Exit 260.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#main" className="skipLink">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
