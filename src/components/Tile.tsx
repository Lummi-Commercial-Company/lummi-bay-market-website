import Link from "next/link";
import PhotoSlot from "./PhotoSlot";
import styles from "./Tile.module.css";

/**
 * One tile in the Home mosaic: an image slot with the caption laid over it.
 * Every tile on the page is this component — a new tile is data, not new markup.
 */
export type TileData = {
  photo: string;
  eyebrow?: string;
  title: string;
  blurb?: string;
  href: string;
  feature?: boolean;
};

export default function Tile({ tile }: { tile: TileData }) {
  return (
    <Link
      href={tile.href}
      className={`${styles.tile} ${tile.feature ? styles.feature : ""}`}
    >
      <div className={styles.media}>
        <PhotoSlot name={tile.photo} feature={tile.feature} />
      </div>

      <div className={styles.caption}>
        {tile.eyebrow && <span className={styles.eyebrow}>{tile.eyebrow}</span>}
        <span className={styles.title}>{tile.title}</span>
        {tile.blurb && <span className={styles.blurb}>{tile.blurb}</span>}
      </div>
    </Link>
  );
}
