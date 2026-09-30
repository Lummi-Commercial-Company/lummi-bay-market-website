import React from 'react'
import { wrapFieldsWithMeta } from 'tinacms'

/**
 * An on/off switch that says which it is.
 *
 * Tina's own toggle has a white track either way; only the knob's side
 * changes, so on and off look alike (owner, 30 Sep 2026: "usually if it's
 * colored it's on and if it's greyed out it's off"). This one is green with
 * the word "On" when on, grey with "Off" when off, and the words can say what
 * on and off mean for that field.
 *
 * `unsetIs` matters: a field nobody has touched is saved as nothing, and some
 * fields treat nothing as on — a promotion runs unless "Running" is switched
 * off (lib/promos.ts). The switch must show what the site will do, so it
 * shows nothing as `unsetIs`.
 */

interface Props {
  input: { value: unknown; onChange: (value: boolean) => void; name: string }
  field: { label?: string }
}

export function onOffField({
  on = 'On',
  off = 'Off',
  unsetIs = false,
}: { on?: string; off?: string; unsetIs?: boolean } = {}) {
  function OnOff({ input, field }: Props) {
    const checked = typeof input.value === 'boolean' ? input.value : unsetIs
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={field.label}
        id={input.name}
        onClick={() => input.onChange(!checked)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: 0,
          border: 0,
          background: 'none',
          cursor: 'pointer',
          font: 'inherit',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: 'relative',
            width: 46,
            height: 26,
            borderRadius: 99,
            background: checked ? '#1f7a45' : '#c4c9d0',
            transition: 'background .15s',
            flex: 'none',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 3,
              left: checked ? 23 : 3,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 2px rgba(0,0,0,.3)',
              transition: 'left .15s',
            }}
          />
        </span>
        <span style={{ fontSize: 14, fontWeight: 700, color: checked ? '#1f7a45' : '#4b5563' }}>
          {checked ? on : off}
        </span>
      </button>
    )
  }
  // Tina's published field-component type is narrower than the props it passes.
  return wrapFieldsWithMeta(OnOff as never) as never
}
