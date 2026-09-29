'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './BackToTop.module.css'

/**
 * Back to top (ADR 0011).
 *
 * Lives in the layout, so every page gets it and no page can forget it.
 *
 * It appears once the visitor is three quarters of a viewport down and is
 * hidden — `visibility: hidden`, not `display: none` — the rest of the time, so
 * it never traps focus and never animates in from nothing.
 *
 * Scrolling is a real interaction, so it returns focus to the header rather
 * than silently leaving the focus ring at the bottom of the page: a keyboard
 * visitor who presses it should be able to Tab straight into the nav.
 */
export function BackToTop({ headerId }: { headerId: string }) {
  const [shown, setShown] = useState(false)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const evaluate = () => {
      frame.current = null
      setShown(window.scrollY > window.innerHeight * 0.75)
    }
    const onScroll = () => {
      // rAF-throttled: one measurement per painted frame, never one per event.
      if (frame.current !== null) return
      frame.current = window.requestAnimationFrame(evaluate)
    }

    evaluate()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
    }
  }, [])

  const toTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    const header = document.getElementById(headerId)
    if (header) {
      header.setAttribute('tabindex', '-1')
      header.focus({ preventScroll: true })
    }
  }

  return (
    <button
      type="button"
      className={styles.totop}
      data-shown={shown ? 'true' : 'false'}
      aria-label="Back to top"
      onClick={toTop}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          d="M12 5.5 5.5 12M12 5.5 18.5 12M12 5.5V19"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
