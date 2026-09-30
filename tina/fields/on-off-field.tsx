import React from 'react'
import { wrapFieldsWithMeta } from 'tinacms'

/**
 * An on/off switch that says which it is.
 *
 * Tina's own toggle has a white track either way; only the knob's side
 * changes, so on and off look alike (owner, 30 Sep 2026). The owner's
 * direction: the words "Off" and "On" beside their own sides, or a knob that
 * turns from green to red. This does both —
 *
 *     Off  [ ●━━━ ]  On      knob red, left;  "Off" bold and red
 *     Off  [ ━━━● ]  On      knob green, right; "On" bold and green
 *
 * — and then says in words what the position means for that field ("not
 * showing", "running"). Either side's word can be clicked, as well as the
 * switch itself.
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

const GREEN = '#1f7a45'
const RED = '#b42318'
const GREY = '#6b7280'

export function onOffField({
  on = '',
  off = '',
  unsetIs = false,
}: { on?: string; off?: string; unsetIs?: boolean } = {}) {
  function OnOff({ input, field }: Props) {
    const checked = typeof input.value === 'boolean' ? input.value : unsetIs
    const meaning = checked ? on : off

    const side = (value: boolean) => ({
      font: 'inherit',
      fontSize: 14,
      padding: '4px 2px',
      border: 0,
      background: 'none',
      cursor: 'pointer',
      fontWeight: checked === value ? 800 : 500,
      color: checked === value ? (value ? GREEN : RED) : GREY,
      textDecoration: checked === value ? 'underline' : 'none',
      textUnderlineOffset: 4,
      textDecorationThickness: 2,
    })

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" tabIndex={-1} style={side(false)} onClick={() => input.onChange(false)}>
          Off
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={`${field.label ?? 'Setting'}: ${checked ? 'on' : 'off'}`}
          id={input.name}
          onClick={() => input.onChange(!checked)}
          style={{
            position: 'relative',
            width: 56,
            height: 30,
            padding: 0,
            borderRadius: 99,
            border: `2px solid ${checked ? GREEN : RED}`,
            background: checked ? '#e3f1e8' : '#fbe9e7',
            cursor: 'pointer',
            flex: 'none',
            transition: 'background .15s, border-color .15s',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 3,
              left: checked ? 29 : 3,
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: checked ? GREEN : RED,
              transition: 'left .15s, background .15s',
            }}
          />
        </button>
        <button type="button" tabIndex={-1} style={side(true)} onClick={() => input.onChange(true)}>
          On
        </button>
        {meaning ? (
          <span style={{ fontSize: 13, fontWeight: 600, color: checked ? GREEN : RED }}>— {meaning}</span>
        ) : null}
      </div>
    )
  }
  // Tina's published field-component type is narrower than the props it passes.
  return wrapFieldsWithMeta(OnOff as never) as never
}
