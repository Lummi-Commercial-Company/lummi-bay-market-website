import React from 'react'
import { NumberFieldPlugin } from 'tinacms'
import { DateField } from './date-field'

/**
 * "The three stores usually share a price" — what the switch does (owner,
 * 1 Oct 2026).
 *
 * With it On, a price or date typed for Exit 260 is copied, as it is typed,
 * into the same box for Minimart and Fisherman's Cove, in the form, before
 * anything is saved. Each store's own box is still what is saved and what the
 * site shows (ADR 0004: the site never reads one shared price), so a store
 * that differs that day is simply typed over after the copy. The Truck Stop is
 * never copied: truck-lane diesel is not car-lane diesel.
 *
 * Copying goes one way only, Exit 260 to the other two, so it is always clear
 * which box drives the others.
 */

const COPIED_TO = ['minimart', 'fishermans_cove']

interface Props {
  input: { name: string; onChange: (value: unknown) => void }
  // The form library's own object (final-form), as Tina hands it to a field.
  form?: {
    getState?: () => { values?: Record<string, unknown> }
    values?: Record<string, unknown>
    change?: (name: string, value: unknown) => void
  }
  [key: string]: unknown
}

/** `locations.exit_260.regular` → the same box for each store it copies to. */
export function copiedNames(name: string): string[] {
  return name.includes('.exit_260.') ? COPIED_TO.map((store) => name.replace('.exit_260.', `.${store}.`)) : []
}

function copying(Inner: React.ComponentType<Props>, parse: (raw: unknown) => unknown) {
  function Shared(props: Props) {
    const { input, form } = props
    const onChange = (eventOrValue: unknown) => {
      input.onChange(eventOrValue)
      const values = form?.getState?.().values ?? form?.values
      if (values?.linkLocations !== true || !form?.change) return
      const target = (eventOrValue as { target?: { value?: unknown } } | null)?.target
      const value = parse(target ? target.value : eventOrValue)
      for (const name of copiedNames(input.name)) form.change(name, value)
    }
    return <Inner {...props} input={{ ...input, onChange }} />
  }
  return Shared as never
}

/** Tina's own number box, which also fills the other two stores. */
export const SharedPriceField = copying(
  NumberFieldPlugin.Component as unknown as React.ComponentType<Props>,
  (raw) => (NumberFieldPlugin.parse as (value: unknown) => unknown)(raw)
)

/** The "Last changed" date box, which also fills the other two stores. */
export const SharedDateField = copying(DateField as unknown as React.ComponentType<Props>, (raw) => raw)

/** Tina's number parsing, for a box whose component is SharedPriceField. */
export const parsePrice = NumberFieldPlugin.parse as never
