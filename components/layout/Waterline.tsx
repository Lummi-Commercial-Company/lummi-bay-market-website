/**
 * The waterline — the brand's recurring signature, teal into navy.
 *
 * Geometry and gradient are the locked artwork from
 * `docs/design-spec-sheet.html`: full width, 18px tall, vector. It rides under
 * the header on every page and is reused as a section divider.
 *
 * TODO: replace with approved Lummi art.
 */
export function Waterline({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 18"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="lb-waterline" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0FB5C4" />
          <stop offset="1" stopColor="#1C4E8F" />
        </linearGradient>
      </defs>
      <path
        d="M0 11 C 100 2, 200 20, 300 11 S 500 2, 600 11 S 800 20, 900 11 S 1100 2, 1200 11 L1200 18 L0 18 Z"
        fill="url(#lb-waterline)"
      />
    </svg>
  )
}
