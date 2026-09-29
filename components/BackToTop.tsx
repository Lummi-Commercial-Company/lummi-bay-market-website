"use client";

import { useEffect, useState } from "react";
import styles from "./BackToTop.module.css";

/**
 * Back to top — ADR 0011.
 *
 * A <button>, not an <a href="#top">: nothing is being navigated to, and a stray
 * "#top" is a URL staff would eventually paste somewhere.
 *
 * Appears after 0.75 of a viewport of scrolling, so a page shorter than 1.75 screens
 * never grows one. Proportional, not a pixel count, so one rule covers every width.
 */
export default function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!shown) return null;

  return (
    <button
      type="button"
      className={styles.totop}
      aria-label="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
