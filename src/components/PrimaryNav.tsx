"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./SiteHeader.module.css";

/**
 * One nav list for both breakpoints. Below 900px it is a disclosure; at 900px and up
 * the CSS shows it as a row and the toggle disappears, so the markup is written once.
 */
export default function PrimaryNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.navInner}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="primary-nav-list"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.bars} aria-hidden="true" />
          Menu
        </button>

        <ul
          id="primary-nav-list"
          className={styles.navList}
          data-open={open ? "true" : "false"}
        >
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={styles.navLink}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
