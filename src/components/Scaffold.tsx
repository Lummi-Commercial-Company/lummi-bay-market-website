import Link from "next/link";
import styles from "./Scaffold.module.css";

/**
 * Placeholder for a page that is in the locked IA but whose copy does not exist yet.
 * It keeps navigation honest — no dead links, and no invented content standing in for
 * words the client has not written. Delete this component once every page is real.
 */
export default function Scaffold({
  title,
  note,
}: {
  title: string;
  note: string;
}) {
  return (
    <section className={`wrap ${styles.scaffold}`}>
      <p className={styles.flag}>Not built yet</p>
      <h1>{title}</h1>
      <p className={styles.note}>{note}</p>
      <Link href="/" className={styles.back}>
        Back to home
      </Link>
    </section>
  );
}
