import Link from 'next/link'
import styles from './page.module.css'

export default function NotFound() {
  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>We couldn&rsquo;t find that page.</h1>
        <p className={styles.lede}>
          Try the <Link href="/locations">locations</Link> or head back{' '}
          <Link href="/">home</Link>.
        </p>
      </div>
    </div>
  )
}
