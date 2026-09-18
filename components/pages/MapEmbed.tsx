'use client'

import Image from 'next/image'
import { useState } from 'react'
import styles from './PageSections.module.css'

/**
 * The click-to-load map façade (ADR 0025, ADR 0019).
 *
 * At rest this is a still picture of the finished map, served from this origin.
 * Nothing is requested from Google. The `<iframe>` mounts only after the guest
 * presses "Load map", under a line that says what the click will do — which is
 * what makes it informed consent rather than just a click, and is why the site
 * needs no cookie banner.
 *
 * This is the ONLY client component on these pages, and it is a client
 * component solely because it holds one boolean.
 */
export function MapEmbed({
  src,
  stillImage,
  title,
}: {
  src: string
  stillImage: string
  title: string
}) {
  const [loaded, setLoaded] = useState(false)

  if (loaded) {
    return (
      <div className={styles.mapbox}>
        <iframe
          src={src}
          title={title}
          className={styles.mapframe}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className={styles.mapbox}>
      <Image
        src={stillImage}
        alt={title}
        fill
        sizes="(min-width: 900px) 760px, 100vw"
        className={styles.mapstill}
      />
      <div className={styles.mapveil}>
        <p className={styles.mapnotice}>
          Loading the interactive map connects to Google, which may set cookies.
        </p>
        <button type="button" className={styles.mapbutton} onClick={() => setLoaded(true)}>
          Load map
        </button>
      </div>
    </div>
  )
}
