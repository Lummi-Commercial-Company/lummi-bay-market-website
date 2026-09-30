import React, { useRef } from 'react'
import { wrapFieldsWithMeta } from 'tinacms'
import { calendarDay, withCalendarDay } from '../../lib/pacific-time'

/**
 * A date box staff can type in, with a calendar button beside it (owner's
 * request, 30 Sep 2026: picking from a calendar makes it easier to land on
 * the right day).
 *
 * The saved value is still the text in the box — MM/DD/YYYY, with an optional
 * time — so everything that reads dates (lib/pacific-time.ts `parseWhen`) is
 * unchanged, and typing still works exactly as before. The calendar is the
 * browser's own, so it needs no library and looks right on every device.
 *
 * Tina's built-in `datetime` field was not used: it saves a full timestamp in
 * the editor's own time zone, where the site reads Pacific wall-clock dates,
 * and it cannot take "10/05/2026 12:00 PM" typed in.
 */

interface Props {
  input: { value: unknown; onChange: (value: string) => void; name: string; onBlur?: () => void }
  field: { name: string; label?: string }
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

function makeDateField(allowTime: boolean) {
  function DateText({ input, field }: Props) {
    const picker = useRef<HTMLInputElement>(null)
    const typed = typeof input.value === 'string' ? input.value : ''

    const openCalendar = () => {
      const el = picker.current
      if (!el) return
      try {
        // Every current browser; opens the calendar on the typed date.
        el.showPicker()
      } catch {
        el.focus()
        el.click()
      }
    }

    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'stretch', position: 'relative' }}>
        <input
          id={input.name}
          value={typed}
          onChange={(event) => input.onChange(event.target.value)}
          onBlur={input.onBlur}
          placeholder={allowTime ? 'MM/DD/YYYY, or MM/DD/YYYY 12:00 PM' : 'MM/DD/YYYY'}
          autoComplete="off"
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            font: 'inherit',
            fontSize: 14,
            padding: '8px 10px',
            borderRadius: 6,
            border: '1px solid #b9c3cf',
          }}
        />
        <button
          type="button"
          onClick={openCalendar}
          title="Pick the date from a calendar"
          aria-label={`Pick ${field.label ?? 'the date'} from a calendar`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            font: 'inherit',
            fontSize: 13,
            padding: '0 12px',
            borderRadius: 6,
            border: '1px solid #b9c3cf',
            background: '#f6f8fa',
            color: '#1C4E8F',
            cursor: 'pointer',
          }}
        >
          <CalendarIcon />
          Calendar
        </button>
        {/* The browser's calendar. Kept in the layout (not display:none) so
            it can open, but invisible and under the button. */}
        <input
          ref={picker}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={calendarDay(typed)}
          onChange={(event) => input.onChange(withCalendarDay(typed, event.target.value, allowTime))}
          style={{ position: 'absolute', right: 0, bottom: 0, width: 1, height: 1, opacity: 0, border: 0, padding: 0, pointerEvents: 'none' }}
        />
      </div>
    )
  }
  // Tina's published field-component type is narrower than the props it passes.
  return wrapFieldsWithMeta(DateText as never) as never
}

/** A day: temporary hours, fuel price stamps, notice dates. */
export const DateField = makeDateField(false)
/** A day, or a day and a time: promotion start and end. */
export const DateTimeField = makeDateField(true)
