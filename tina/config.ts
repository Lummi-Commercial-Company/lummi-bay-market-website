import { defineConfig } from 'tinacms'
import type { Collection, Template, TinaField } from 'tinacms'
import { MOTIF_LIMITS } from '../lib/motif-check'
import { noticeState, toNotice } from '../lib/notices'
import { pacificStamp } from '../lib/pacific-time'
import { MAX_PROMO_ROWS, parseWhen, ROW_LAYOUTS } from '../lib/promos'
import { GroupNameField, MotifFileField, rangeField } from './fields/motif-fields'
import { returnToListAfterSave } from './fields/after-save'
import { parsePrice, SharedDateField, SharedPriceField } from './fields/shared-price'
import { DateField, DateTimeField } from './fields/date-field'
import { onOffField } from './fields/on-off-field'
import { HeadlineField } from './fields/promo-status'
import { warnWhenCmsUpdated } from './fields/stale-cms'
import { RichTextWithLinksField } from './fields/rich-text-links'
import { arrangeSiteMenu } from './fields/site-menu'

/**
 * Every date staff type is MM/DD/YYYY (owner's direction, 30 Sep 2026). The
 * field says so, and says so again the moment something else is typed —
 * rather than the site quietly ignoring a date it cannot read.
 */
const dateOnly = (value: unknown) =>
  typeof value === 'string' && value.trim() && !parseWhen(value)?.day
    ? 'Type the date as MM/DD/YYYY, for example 10/05/2026.'
    : undefined
const dateOrDateTime = (value: unknown) =>
  typeof value === 'string' && value.trim() && !parseWhen(value)
    ? 'Type the date as MM/DD/YYYY, and a time if you need one — for example 10/05/2026 or 10/05/2026 12:00 PM.'
    : undefined

/**
 * TinaCMS schema — Lummi Bay Market.
 *
 * Read this before changing a field:
 *
 *  - Content is Markdown, MDX and JSON committed to this repository. There is
 *    no content database, there is nothing to back up, and that is what lets a
 *    content change arrive as an ordinary commit (ADR 0002).
 *
 *  - Login is by email. Nobody on staff needs a GitHub account (ADR 0003).
 *
 *  - FREE TIER, TWO EDITOR LOGINS (locked). The next tiers are Team $24/mo for
 *    three users and Team Plus $41/mo for five. Adding a third editor is a
 *    billing decision, not a configuration one — ask before promising it.
 *
 *  - Every field here is labelled in plain English and carries a description,
 *    because the people using it are not engineers and the field name is not an
 *    explanation. If a label needs a paragraph to make sense, the field is
 *    wrong, not the label.
 */

const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  'main'

/* ===========================================================================
   Shared field groups
   =========================================================================== */

/** A main photo: the Location's, or the Truck Stop's on its own page. */
const heroField: TinaField = {
  type: 'object',
  name: 'hero',
  label: 'Main photo',
  description:
    'Shown wide at the top of this location’s page, and on its card wherever the location cards appear (Home, the Locations page, the other location pages). Leave empty for no photo.',
  fields: [
    {
      type: 'image',
      name: 'image',
      label: 'Photo',
      description:
        'One landscape photo, 2400 by 1350 or larger, with the storefront in the middle. The page shows a wide strip of it, the card most of it, and a phone a small square from the centre.',
    },
    {
      type: 'string',
      name: 'alt',
      label: 'Describe the photo',
      description: 'One short sentence, for people using a screen reader.',
    },
  ],
}

/**
 * The temporary hours line, on a date window (ADR 0027).
 *
 * `endsAt` is required and deliberately so: an override with no end never
 * reverts and fails silently, because a wrong opening time still looks like an
 * opening time.
 */
const hoursOverridesField: TinaField = {
  type: 'object',
  name: 'hoursOverrides',
  label: 'Temporary hours (holidays, closures)',
  description:
    'Usually empty. Use this for a short-term change — New Year’s Eve, a storm, a remodel. Type it weeks ahead: it starts and stops on its own, in Pacific time. For a permanent change, edit the Hours field above instead.',
  list: true,
  ui: {
    itemProps: (item) => ({
      label: item?.hours ? `${item.hours} (${item.startsAt ?? '?'} to ${item.endsAt ?? '?'})` : 'New temporary hours',
    }),
  },
  fields: [
    {
      type: 'string',
      name: 'hours',
      label: 'Hours during this period',
      description: 'Short form, like "6am–4pm" or "Closed". This replaces the normal hours everywhere they appear.',
      required: true,
    },
    {
      type: 'string',
      name: 'reason',
      label: 'Reason (two or three words)',
      description: 'Shown on the location page only, never on the short cards. For example: "Christmas Day".',
    },
    {
      type: 'string',
      name: 'startsAt',
      label: 'First day (MM/DD/YYYY)',
      description: 'The first whole day these hours apply, Pacific time. For example 12/24/2026.',
      required: true,
      ui: { component: DateField, validate: dateOnly },
    },
    {
      type: 'string',
      name: 'endsAt',
      label: 'Last day (MM/DD/YYYY)',
      description:
        'The last whole day these hours apply, Pacific time, for example 12/26/2026. Required — without an end date the temporary hours would never go away on their own.',
      required: true,
      ui: { component: DateField, validate: dateOnly },
    },
  ],
}

/**
 * The closed set of page blocks. Adding to this list is an engineering change,
 * on purpose: a page built from arbitrary HTML is a page that can lose the
 * header, the footer or the waterline.
 */
const pageBlocks: Template[] = [
  {
    name: 'richText',
    label: 'Text',
    ui: { defaultItem: { body: '' } },
    fields: [
      {
        type: 'rich-text',
        name: 'body',
        label: 'Text',
        description: 'Headings, paragraphs, lists and links.',
        isBody: false,
        ui: { component: RichTextWithLinksField },
      },
    ],
  },
  {
    name: 'imageBanner',
    label: 'Image banner',
    fields: [
      { type: 'image', name: 'image', label: 'Image', required: true },
      {
        type: 'string',
        name: 'alt',
        label: 'Describe the image',
        description:
          'One short sentence describing what is in the picture, for people using a screen reader. Not a caption.',
        required: true,
      },
      { type: 'string', name: 'caption', label: 'Caption (optional)' },
    ],
  },
  {
    name: 'hoursTable',
    label: 'Hours table',
    fields: [
      {
        type: 'string',
        name: 'heading',
        label: 'Heading',
        description: 'Optional heading above the table.',
      },
      {
        type: 'boolean',
        name: 'includeTruckStop',
        ui: { component: onOffField() },
        label: 'Include the Truck Stop',
        description: 'The Truck Stop keeps its own hours, separate from the Exit 260 store.',
      },
    ],
  },
  {
    name: 'locationList',
    label: 'List of our locations (always up to date)',
    fields: [
      {
        type: 'string',
        name: 'heading',
        label: 'Heading',
        description:
          'Leave blank to use the standard heading. The list itself reads the locations, so it never needs editing here.',
      },
    ],
  },
  {
    // The map itself is two fields in Settings — the embed code from Google My
    // Maps and a still picture of it. Nothing is typed here, and while either
    // setting is empty this block renders NOTHING: the page is one section
    // shorter, never a placeholder box (ADR 0019).
    name: 'locationsMap',
    label: 'Map of our locations',
    fields: [
      {
        type: 'string',
        name: 'heading',
        label: 'Heading',
        description:
          'Leave blank for "Find us". The map itself comes from Settings — if no map has been added yet, this section simply does not appear.',
      },
    ],
  },
  {
    // Everything on the card — name, synopsis, amenities, address, phone and
    // hours — is read from the Location documents. Nothing is typed here, so a
    // phone number changed in one place changes everywhere it appears.
    name: 'locationContacts',
    label: 'Contact details for every location (always up to date)',
    fields: [
      {
        type: 'string',
        name: 'heading',
        label: 'Heading',
        description:
          'Leave blank for "Where to find us". The Truck Stop gets its own card: it has its own phone and its own hours.',
      },
    ],
  },
  {
    name: 'callout',
    label: 'Highlighted note',
    fields: [
      { type: 'string', name: 'heading', label: 'Opening words (bold)' },
      {
        type: 'string',
        name: 'text',
        label: 'Note',
        ui: { component: 'textarea' },
      },
    ],
  },
  {
    name: 'ctaRow',
    label: 'Button row',
    fields: [
      {
        type: 'object',
        name: 'buttons',
        label: 'Buttons',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.label ?? 'New button' }) },
        fields: [
          { type: 'string', name: 'label', label: 'Button text', required: true },
          { type: 'string', name: 'href', label: 'Where it goes', required: true },
        ],
      },
    ],
  },
  {
    name: 'faq',
    label: 'Questions and answers',
    fields: [
      { type: 'string', name: 'heading', label: 'Heading' },
      {
        type: 'object',
        name: 'items',
        label: 'Questions',
        list: true,
        ui: { itemProps: (item) => ({ label: item?.question ?? 'New question' }) },
        fields: [
          { type: 'string', name: 'question', label: 'Question', required: true },
          {
            type: 'rich-text',
            name: 'answer',
            label: 'Answer',
            required: true,
            ui: { component: RichTextWithLinksField },
          },
        ],
      },
    ],
  },
]

/**
 * The page's own words, stored as the Markdown body of the .mdx file rather
 * than inside the frontmatter.
 *
 * This field is not a convenience. Without an `isBody: true` field on the
 * collection, TinaCMS has nowhere to put a Markdown body: it is dropped from
 * the document the CMS shows, and the next save writes the file back WITHOUT
 * it. `content/pages/privacy.mdx` — a legal document supplied by the client and
 * reproduced verbatim — was in exactly that state. An editor would have opened
 * an apparently empty page and saved the policy away.
 *
 * It is also the only place long prose can live and stay readable in git: a
 * rich-text field nested in a block is serialised into the frontmatter, which
 * is fine for a paragraph and unreadable for a policy.
 */
const pageBodyField: TinaField = {
  type: 'rich-text',
  name: 'body',
  label: 'Page text',
  description:
    'The main text of this page — headings, paragraphs, lists and links. It renders directly under the page title, above any extra sections below.',
  isBody: true,
  // Tina's editor plus a Links panel: Tina 3.14 cannot edit or remove an
  // existing link itself (tina/fields/rich-text-links.tsx).
  ui: { component: RichTextWithLinksField },
}

const seoFields: TinaField[] = [
  {
    type: 'string',
    name: 'seoDescription',
    label: 'Search result description',
    description:
      'One or two sentences shown under the page title in Google. Around 150 characters. Leave blank and the page opening is used.',
    ui: { component: 'textarea' },
  },
  {
    type: 'boolean',
    name: 'noindex',
    ui: { component: onOffField({ on: 'hidden from Google', off: 'Google can list it' }) },
    label: 'Hide from Google',
    description:
      'Keeps the page reachable by its link but out of search results. Leave off unless you know you want this.',
  },
  {
    type: 'boolean',
    name: 'noBackdrop',
    ui: { component: onOffField() },
    label: 'Turn off the background watermark on this page',
  },
]

/* ===========================================================================
   Collections
   =========================================================================== */

const locations: Collection = {
  name: 'locations',
  label: 'Location Details',
  path: 'content/locations',
  format: 'mdx',
  // There are exactly three Locations and there are no others in scope. A
  // fourth would appear in the locations index, the fuel price table, /contact
  // and the sitemap — a business renting space on our property is a Tenant, not
  // a Location. Adding and deleting are therefore off.
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      // Every Tina document already has a built-in `id`, so a content field
      // called `id` collides in the generated GraphQL schema. `nameOverride`
      // keeps the key in the .mdx file as `id` — which is what the content
      // model specifies and what lib/locations.ts reads — while Tina's own
      // name for it is `slug`.
      type: 'string',
      name: 'slug',
      nameOverride: 'id',
      label: 'Location ID',
      description: 'Set once when the location was created. Changing it breaks the web address and every link to it.',
      required: true,
      ui: { validate: (value?: string) => (value ? undefined : 'Required') },
    },
    {
      type: 'string',
      name: 'name',
      label: 'Full name',
      description: 'The complete name, as it appears at the top of the location page. For example: Lummi Bay Market at Exit 260.',
      required: true,
      isTitle: true,
    },
    {
      type: 'string',
      name: 'navLabel',
      label: 'Short name (menus and cards)',
      description: 'Two or three words. For example: Exit 260.',
      required: true,
    },
    {
      type: 'string',
      name: 'shortLabel',
      label: 'Shortest name (fuel price table)',
      description:
        'The tightest version, used only where space is very tight. Fisherman’s Cove becomes "The Cove" here. Leave blank if the short name already fits.',
    },
    {
      type: 'string',
      name: 'aka',
      label: 'Also known as',
      description: 'Any older or local name people still use.',
    },
    { type: 'string', name: 'address', label: 'Street address', required: true },
    { type: 'string', name: 'city', label: 'City', required: true },
    { type: 'string', name: 'state', label: 'State', required: true },
    { type: 'string', name: 'zip', label: 'ZIP code', required: true },
    {
      type: 'string',
      name: 'phone',
      label: 'Phone number',
      description: 'The store’s number. At Exit 260 this is the C-Store line — the Truck Stop has its own, further down.',
      required: true,
    },
    {
      type: 'string',
      name: 'hours',
      label: 'Hours',
      description:
        'The normal opening hours, short form: "6am–9pm", or "Open 24 hours". Keep it short — it has to fit on one line on a phone.',
      required: true,
    },
    hoursOverridesField,
    {
      // ADR 0015 added this: /contact shows a short synopsis per Location, and
      // it is a field on the Location rather than prose typed into the contact
      // page, so the Location pages and any future index can use the same
      // sentence. Not marketing copy — what somebody would say if you asked
      // them what is there.
      type: 'string',
      name: 'summary',
      label: 'One or two sentences about this place',
      description:
        'What makes this stop different, in a customer’s words. Shown on the contact page under the name. Leave it blank rather than writing something vague — the section simply omits it.',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'cardLine',
      label: 'One-line summary (street, then hours)',
      description:
        'What shows under the name on the short cards, for example "4839 Rural Ave · Open 24 hours". It is one line and it cuts off rather than wrapping, so keep it tight.',
      required: true,
    },
    {
      type: 'string',
      name: 'amenities',
      label: 'What’s here',
      description:
        'One thing per line — "Car wash", "Propane", "Hot food". Put the reason someone would stop first. Two or more are needed for the badges to show. Do not combine two things in one line.',
      list: true,
    },
    {
      type: 'object',
      name: 'truckStop',
      label: 'Truck Stop (Exit 260 only)',
      description:
        'The Truck Stop is a separate fuel station for truckers sharing the Exit 260 property — not a service of the store. Its phone, hours and amenities are its own and are never mixed with the store’s. Leave this empty at the other two locations.',
      fields: [
        {
          type: 'string',
          name: 'phone',
          label: 'Truck Stop phone number',
          description: 'A driver asking about showers or the diesel lanes should reach the truck side, not the store.',
        },
        { type: 'string', name: 'hours', label: 'Truck Stop hours' },
        {
          type: 'string',
          name: 'summary',
          label: 'One or two sentences about the Truck Stop',
          description: 'Shown on the contact page, where the Truck Stop is listed on its own.',
          ui: { component: 'textarea' },
        },
        {
          type: 'string',
          name: 'amenities',
          label: 'What’s at the Truck Stop',
          description: 'One per line: diesel lanes, DEF, showers, driver lounge, truck parking.',
          list: true,
        },
        { ...hoursOverridesField, label: 'Temporary Truck Stop hours' },
        {
          ...heroField,
          label: 'Truck Stop main photo',
          description:
            'Shown wide at the top of the Truck Stop page. Its own photo, never the store’s. Leave empty for no photo.',
        },
      ],
    },
    heroField,
  ],
}

/**
 * Fuel prices — one document, eight numbers, the only place a price is stored.
 * See the skill `fuel-price-update` for the procedure staff follow.
 */
const fuelPrices: Collection = {
  name: 'fuelPrices',
  label: 'Fuel Prices',
  path: 'content',
  format: 'json',
  match: { include: 'fuel-prices' },
  ui: {
    allowedActions: { create: false, delete: false },
    // No `router` on purpose (30 Sep 2026). A router makes Tina open this
    // collection as a live page preview whose fields only appear once the
    // page is wired for click-to-edit (`useTina`). The site's pages are not
    // wired yet, so the preview showed the page and an empty sidebar — no
    // inputs at all. Without a router Tina opens its ordinary form. Add the
    // router back only together with `useTina` on the page it points at.
  },
  fields: [
    {
      type: 'boolean',
      name: 'linkLocations',
      ui: { component: onOffField({ on: 'Exit 260 fills in the other two', off: 'each store typed on its own' }) },
      label: 'The three stores usually share a price',
      description:
        'On: whatever you type for Exit 260 is copied into Minimart and Fisherman’s Cove as you type, so you fill in one store instead of three. Each store still shows the price in its own box — if one is different today, type over it after the copy, or switch this off. Off: nothing is copied. The Truck Stop is never copied.',
    },
    {
      type: 'object',
      name: 'locations',
      label: 'Store prices',
      fields: [
        // `nameOverride` keeps the JSON key the location slug (`exit-260`) while
        // Tina's own field name stays alphanumeric, which is all Tina allows.
        // The slug in the file is what `lib/fuel-prices.ts` reads — it must not
        // change.
        {
          type: 'object',
          name: 'exit_260',
          nameOverride: 'exit-260',
          label: 'Exit 260',
          fields: priceFields({ copiesToOthers: true }),
        },
        { type: 'object', name: 'minimart', label: 'Minimart', fields: priceFields() },
        {
          type: 'object',
          name: 'fishermans_cove',
          nameOverride: 'fishermans-cove',
          label: 'Fisherman’s Cove',
          fields: priceFields(),
        },
      ],
    },
    {
      type: 'object',
      name: 'truckStop',
      label: 'Truck Stop prices',
      description: 'Priced on its own, always. The Truck Stop sells diesel and DEF.',
      fields: priceFields({ includeRegular: false }),
    },
  ],
}

/**
 * Only regular, diesel and DEF are posted on this site. Midgrade, premium and
 * ethanol-free can be listed as amenities but carry no posted price.
 *
 * Leaving a price blank means "we do not sell this here" and prints an em-dash.
 * It does not mean zero.
 */
function priceFields({ includeRegular = true, copiesToOthers = false } = {}): TinaField[] {
  // Exit 260's boxes also fill Minimart and Fisherman's Cove while "The three
  // stores usually share a price" is on (tina/fields/shared-price.tsx).
  const copyNote = copiesToOthers
    ? ' With "The three stores usually share a price" on, this also fills in Minimart and Fisherman’s Cove.'
    : ''
  const priceUi = copiesToOthers ? { ui: { component: SharedPriceField, parse: parsePrice } } : {}
  const fields: TinaField[] = []
  if (includeRegular) {
    fields.push({
      type: 'number',
      name: 'regular',
      label: 'Regular ($ per gallon)',
      description: `For example 3.79. Leave blank if it is not sold here.${copyNote}`,
      ...priceUi,
    })
  }
  fields.push(
    {
      type: 'number',
      name: 'diesel',
      label: 'Diesel ($ per gallon)',
      description: `Leave blank if it is not sold here.${copyNote}`,
      ...priceUi,
    },
    {
      type: 'number',
      name: 'def',
      label: 'DEF ($ per gallon)',
      description: `Diesel exhaust fluid. Leave blank if it is not sold here.${copyNote}`,
      ...priceUi,
    },
    {
      type: 'string',
      name: 'updated',
      label: 'Last changed (MM/DD/YYYY)',
      description: `Shown to customers next to the prices, for example 09/29/2026. Update it whenever you change a price here.${copyNote}`,
      ui: { component: copiesToOthers ? SharedDateField : DateField, validate: dateOnly },
    }
  )
  return fields
}

/**
 * The general page collection (ADR 0015). Adding a page is a content action:
 * a new document here is a new URL, rendered by `app/[slug]/page.tsx`.
 *
 * THE WEB ADDRESS IS THE FILE NAME. There is deliberately no `slug` field.
 * One existed and it was a trap: routing has always been by file name
 * (`generateStaticParams` over `content/pages/`), so a
 * `slug` field labelled "the part after lummibay.com/" was a text box an editor
 * could change with no effect on the address — or, worse, could disagree with
 * the real address without anything saying so. `/privacy` is published inside
 * two app store listings and must never move (ADR 0026); a field that promises
 * to move it and does not is the wrong side of that risk in both directions.
 *
 * Deleting is off for the same reason. `/privacy` cannot be deleted without
 * risking the app listings, and `/about` and `/contact` are linked from the
 * footer of every page. Removing a page is rare enough to be an engineering
 * change; losing one by accident is not recoverable from the CMS.
 */
/** The four footer columns, as the approved templates head them (ADR 0029). */
const FOOTER_COLUMN_LABELS: Record<string, string> = {
  about: 'About',
  visit: 'Visit',
  rewards: 'Rewards',
  work: 'Work with us',
}

/**
 * Promo rows (ADR 0018, Revision). The region on a page is a list of rows, and
 * each row says how many promos sit across it. A row holding fewer live promos
 * than it has room for re-divides evenly, so expiry never leaves a hole. The
 * layouts are defined once, in lib/promos.ts.
 */
const promoRowsField = (label: string, description: string): TinaField => ({
  type: 'object',
  name: 'promoRows',
  label,
  description,
  list: true,
  ui: {
    itemProps: (item) => ({
      label:
        ROW_LAYOUTS[item?.layout as keyof typeof ROW_LAYOUTS]?.label ?? 'Choose a layout',
    }),
    defaultItem: { layout: '2' },
  },
  fields: [
    {
      type: 'string',
      name: 'layout',
      label: 'Promotions across this row',
      options: Object.entries(ROW_LAYOUTS).map(([value, layout]) => ({
        value,
        label: layout.label,
      })),
      required: true,
    },
  ],
})

const pageRowsField = promoRowsField(
  'Promotion rows on this page',
  `List every row, top to bottom — for one full-width row then two halves, add two rows: "1 across — full width", then "2 across — halves". These replace the rows in Site Settings for this page; leave empty to use those instead. Up to ${MAX_PROMO_ROWS} rows. Promotions fill them by "Order", and a row with nothing running does not show.`
)

const pages: Collection = {
  name: 'pages',
  label: 'Pages',
  path: 'content/pages',
  format: 'mdx',
  ui: {
    allowedActions: { delete: false },
    // No `router` on purpose (30 Sep 2026). A router makes Tina open this
    // collection as a live page preview whose fields only appear once the
    // page is wired for click-to-edit (`useTina`). The site's pages are not
    // wired yet, so the preview showed the page and an empty sidebar — no
    // inputs at all. Without a router Tina opens its ordinary form. Add the
    // router back only together with `useTina` on the page it points at.
  },
  fields: [
    { type: 'string', name: 'title', label: 'Page title', required: true, isTitle: true },
    {
      type: 'string',
      name: 'navLabel',
      label: 'Short name (footer and links)',
    },
    {
      type: 'boolean',
      name: 'showPromos',
      ui: { component: onOffField() },
      label: 'Show the promotions band on this page',
      description:
        'Lets in promotions set to "Every page except home". A promotion that names this page in "Which pages" shows here either way.',
    },
    pageRowsField,
    ...seoFields,
    pageBodyField,
    {
      type: 'object',
      name: 'blocks',
      label: 'Extra sections, after the text',
      list: true,
      templates: pageBlocks,
    },
  ],
}

const mainPages: Collection = {
  name: 'mainPages',
  label: 'Home Page(s)',
  path: 'content/main-pages',
  format: 'mdx',
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Internal name',
      description:
        'More than one home page may exist. Only the one chosen in Settings is live, so a replacement can be built in full and switched over by changing a single setting. Name this one so you can tell them apart — staff see this name, visitors never do.',
      required: true,
      isTitle: true,
    },
    {
      type: 'string',
      name: 'headline',
      label: 'Headline',
      description:
        'The large heading at the top of the home page. A few words — it is the first thing a visitor reads.',
      required: true,
    },
    {
      type: 'string',
      name: 'intro',
      label: 'Intro sentence',
      description: 'One sentence under the headline. Leave blank to show the headline alone.',
      ui: { component: 'textarea' },
    },
    pageRowsField,
    ...seoFields,
    pageBodyField,
    {
      type: 'object',
      name: 'blocks',
      label: 'Extra sections, after the text',
      list: true,
      templates: pageBlocks,
    },
  ],
}

const infoPages: Collection = {
  name: 'infoPages',
  label: 'Linked Promo Details Pages',
  path: 'content/info-pages',
  format: 'mdx',
  ui: {
    allowedActions: { delete: false },
    // No `router` on purpose (30 Sep 2026). A router makes Tina open this
    // collection as a live page preview whose fields only appear once the
    // page is wired for click-to-edit (`useTina`). The site's pages are not
    // wired yet, so the preview showed the page and an empty sidebar — no
    // inputs at all. Without a router Tina opens its ordinary form. Add the
    // router back only together with `useTina` on the page it points at.
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Page title',
      description:
        'This is the page a promotion links to. When its promotion stops running the page keeps its web address but drops out of Google and says the offer has ended. Never delete one — shared links would break and the offer could not be brought back.',
      required: true,
      isTitle: true,
    },
    ...seoFields,
    pageBodyField,
    {
      type: 'object',
      name: 'blocks',
      label: 'Extra sections, after the text',
      list: true,
      templates: pageBlocks,
    },
  ],
}

/**
 * Promotions (ADR 0007, ADR 0018).
 *
 * Any number of them, on any page. Whether one is live is worked out per
 * visitor from the dates below, in Pacific time — there is no scheduler to set
 * up and nothing to remember to switch off.
 */
const promos: Collection = {
  name: 'promos',
  label: 'Promo Pages',
  path: 'content/promos',
  format: 'mdx',
  fields: [
    {
      type: 'string',
      name: 'eyebrow',
      label: 'Small line above the headline',
      description: 'Two or three words, optional. For example: "This week only".',
    },
    {
      type: 'string',
      name: 'headline',
      label: 'Headline',
      description:
        '28 characters or fewer — short headlines read best at every size. This is also the name you will see in the list of promotions.',
      required: true,
      isTitle: true,
      // The promotion's Live / Scheduled / Ended / Off tag sits above this box.
      ui: { component: HeadlineField },
    },
    {
      type: 'string',
      name: 'cta',
      label: 'Button text',
      description: 'Leave blank for "Learn more". It shows in capitals on the button.',
    },
    {
      type: 'image',
      name: 'image',
      label: 'Picture',
      description: 'One wide image, 2400 by 1350 or larger. The site crops it to fit wherever it appears.',
      required: true,
    },
    {
      type: 'string',
      name: 'alt',
      label: 'Describe the picture',
      description: 'One short sentence, for people using a screen reader.',
      required: true,
    },
    {
      type: 'reference',
      name: 'link',
      label: 'Page this links to',
      collections: ['infoPages'],
      required: true,
    },
    {
      type: 'string',
      name: 'startsAt',
      label: 'Starts (MM/DD/YYYY)',
      description:
        'A date like 10/03/2026, or a date and time like 10/03/2026 6:00 AM. Pacific time. Leave blank to start straight away.',
      ui: { component: DateTimeField, validate: dateOrDateTime },
    },
    {
      type: 'string',
      name: 'endsAt',
      label: 'Ends (MM/DD/YYYY)',
      description:
        'A date like 10/05/2026 runs to the end of that day; a date and time like 10/05/2026 12:00 PM stops at that minute. Pacific time. It comes down on its own. Leave blank to run until you turn it off.',
      ui: { component: DateTimeField, validate: dateOrDateTime },
    },
    {
      type: 'boolean',
      name: 'active',
      ui: { component: onOffField({ on: 'running', off: 'not showing', unsetIs: true }) },
      label: 'Running',
      description:
        'On unless you turn it off. Off pulls the promotion immediately, whatever the dates say; turning it back on (and moving the end date if it has passed) brings it and its offer page back.',
    },
    {
      type: 'string',
      name: 'placement',
      label: 'Where it appears',
      options: [
        { value: 'home', label: 'Home page' },
        { value: 'all-interior', label: 'Every page except home' },
        { value: 'specific', label: 'Specific pages only' },
      ],
      required: true,
    },
    {
      // Tina has no list of references: a `reference` field is always a single
      // document. A list of one-reference objects is the supported shape, and
      // it reads the same in the sidebar — "Add page", then pick one.
      type: 'object',
      name: 'pages',
      label: 'Which pages',
      description:
        'Only used when "Specific pages only" is chosen above. Add one row per page — a general page or another offer page. Locations go in "Which locations", below.',
      list: true,
      ui: { itemProps: (item) => ({ label: item?.page || 'Choose a page' }) },
      fields: [
        {
          type: 'reference',
          name: 'page',
          label: 'Page',
          description: 'Pick the page this promotion should appear on.',
          collections: ['pages', 'infoPages'],
        },
      ],
    },
    {
      // A separate list, not a third collection on the reference above: Tina
      // builds one query for a multi-collection reference, and a Location's
      // required "navLabel" collides with a page's optional one.
      type: 'object',
      name: 'locations',
      label: 'Which locations',
      description:
        'Only used when "Specific pages only" is chosen above. Add one row per location page this promotion should appear on.',
      list: true,
      ui: { itemProps: (item) => ({ label: item?.location || 'Choose a location' }) },
      fields: [
        {
          type: 'reference',
          name: 'location',
          label: 'Location',
          collections: ['locations'],
        },
      ],
    },
    {
      type: 'number',
      name: 'priority',
      label: 'Order (1 = first place)',
      description:
        'Which place it takes. Places fill top to bottom, left to right: with one full-width row and then two halves, 1 is the full-width row, 2 is the left half, 3 the right half. Leave blank to go after every numbered one. If more are running than there are places, the highest numbers wait and appear as others end. Promotion Status shows where each one is.',
    },
  ],
}

/**
 * Tenants (ADR 0016) — independent businesses on a Lummi Bay property.
 *
 * A Tenant is never a Location and never an amenity. The site never mentions
 * renting, leasing or landlords. Nothing renders until a tenant is published.
 */
const tenants: Collection = {
  name: 'tenants',
  label: 'Other Businesses',
  path: 'content/tenants',
  format: 'mdx',
  fields: [
    {
      type: 'string',
      name: 'name',
      label: 'Business name',
      description:
        'An independent business at one of our properties — they run themselves, we simply point to them. The page is called "Also at Exit 260". Nothing appears on the site until at least one business is published.',
      required: true,
      isTitle: true,
    },
    {
      type: 'reference',
      name: 'location',
      label: 'Which of our properties',
      collections: ['locations'],
      required: true,
    },
    {
      type: 'string',
      name: 'placement',
      label: 'Where on the property',
      description: 'Used to group the cards, so a visitor knows where to walk.',
      options: [
        { value: 'inside', label: 'Inside our store' },
        { value: 'property', label: 'Its own building on the property' },
        { value: 'lot', label: 'In the lot (truck or trailer)' },
      ],
      required: true,
    },
    {
      type: 'string',
      name: 'summary',
      label: 'One or two sentences',
      ui: { component: 'textarea' },
    },
    {
      type: 'string',
      name: 'hours',
      label: 'Hours',
      description: 'Their hours, not ours. Leave blank if you are not sure.',
    },
    {
      type: 'boolean',
      name: 'hoursConfirmed',
      ui: { component: onOffField() },
      label: 'Hours confirmed with the business',
      description: 'Hours are only shown once this is ticked. Posting a guess sends people to a closed door.',
    },
    {
      type: 'string',
      name: 'linkMode',
      label: 'Where the card goes',
      options: [
        { value: 'internal', label: 'A page here on our site' },
        { value: 'external', label: 'Straight to their own website' },
      ],
      required: true,
    },
    {
      type: 'string',
      name: 'externalUrl',
      label: 'Their website',
      description: 'Only used when the card goes straight to their own website. The card is marked as leaving our site.',
    },
    { type: 'image', name: 'logo', label: 'Their logo' },
    { type: 'image', name: 'photo', label: 'Photo' },
    {
      type: 'boolean',
      name: 'markApproved',
      ui: { component: onOffField() },
      label: 'We have permission to use their logo and photo',
      description: 'The logo and photo stay hidden until this is ticked. Somebody else’s trademark is not ours to publish.',
    },
    pageBodyField,
    {
      type: 'object',
      name: 'blocks',
      label: 'Extra sections, after the text',
      list: true,
      templates: pageBlocks,
    },
  ],
}

/**
 * Header motif groups (ADR 0021, amended 30 Sep 2026). Kept in Site settings →
 * Header motifs, beside the background watermark, at the owner's ask; they
 * began as their own collection.
 *
 * A group is an ordered set of motif files and the way the band draws them.
 * The group with "Use this group in the header" on is live; any number can be
 * kept, edited and deleted here. Files come only from the motif library
 * (uploads/motifs), through a box that checks each one before it is stored —
 * see tina/fields/motif-fields.tsx and lib/motif-check.ts.
 *
 * TODO: replace with approved Lummi art. Uploading a motif does not approve
 * it: final art must be authentic or tribe-approved before launch.
 */
const [strengthMin, strengthMax, strengthDefault] = MOTIF_LIMITS.strength
const [scaleMin, scaleMax, scaleDefault] = MOTIF_LIMITS.scale
const [spacingMin, spacingMax, spacingDefault] = MOTIF_LIMITS.spacing

const motifGroupFields: TinaField[] = [
    {
      type: 'string',
      name: 'name',
      label: 'Group name',
      description:
        'So you can tell groups apart, for example "Winter — orca, salmon, eagle". The preview updates as you change the settings below; turn on "Use this group in the header" at the bottom to show it.',
      required: true,
      ui: { component: GroupNameField },
    },
    {
      type: 'object',
      name: 'motifs',
      label: 'Motifs, in order',
      description:
        'Shown left to right. Add each motif as its own row — an owl, a whale, a fish — or one file that already holds several. Drag to reorder. Where the band is too narrow for all of them, the last ones are left off rather than cut in half.',
      list: true,
      ui: {
        itemProps: (item) => ({
          label: typeof item?.file === 'string' && item.file ? item.file.split('/').pop() : 'Choose a motif',
        }),
      },
      fields: [
        {
          type: 'string',
          name: 'file',
          label: 'Motif file',
          description:
            'An SVG of plain shapes on a transparent background. Its colours are ignored — the band paints every motif in the ink chosen below. Each file is checked before it is uploaded.',
          ui: { component: MotifFileField },
        },
      ],
    },
    {
      type: 'number',
      name: 'strength',
      label: 'Strength',
      description: `How strongly the motifs show against the navy header, ${strengthMin}–${strengthMax}%. The approved look is ${strengthDefault}%.`,
      ui: { component: rangeField(strengthMin, strengthMax, strengthDefault, 1, '%') },
    },
    {
      type: 'number',
      name: 'scale',
      label: 'Scale',
      description: `Motif height, as a share of the header bar, ${scaleMin}–${scaleMax}%. Bigger motifs mean fewer fit.`,
      ui: { component: rangeField(scaleMin, scaleMax, scaleDefault, 2, '%') },
    },
    {
      type: 'number',
      name: 'spacing',
      label: 'Spacing',
      description: `The gap between motifs, ${spacingMin}–${spacingMax} pixels.`,
      ui: { component: rangeField(spacingMin, spacingMax, spacingDefault, 2, 'px') },
    },
    {
      type: 'string',
      name: 'ink',
      label: 'Ink',
      description: 'The one colour every motif is drawn in. Only brand colours are offered.',
      options: [
        { value: 'bone', label: 'Bone (cream)' },
        { value: 'teal', label: 'Teal' },
        { value: 'white', label: 'White' },
      ],
    },
    {
      type: 'boolean',
      name: 'repeat',
      ui: { component: onOffField({ unsetIs: true }) },
      label: 'Repeat the group to fill the band',
      description: 'On: the motifs repeat in order across the band. Off: each is shown once.',
    },
  {
    type: 'boolean',
    name: 'live',
    ui: { component: onOffField({ on: 'this group is in the header', off: 'not in the header' }) },
    label: 'Use this group in the header',
    description: 'Turn on for the group you want shown. If more than one is on, the first in the list is used.',
  },
]

const settings: Collection = {
  name: 'settings',
  label: 'Site Settings',
  path: 'content/settings',
  format: 'json',
  ui: { allowedActions: { create: false, delete: false }, global: true },
  fields: [
    {
      // A list since 30 Sep 2026 (ADR 0017, amended): notices can be scheduled,
      // and several can wait their turn. It was one `siteAlert` object; the
      // site still reads that (lib/notices.ts) so nothing saved is lost.
      type: 'object',
      name: 'alerts',
      label: 'Notices (the bar across the top of every page)',
      description:
        'For something every visitor needs to see — a closure, a road out, a power cut, or an event weekend planned ahead. Add as many as you like. Each can start and end on its own; with no dates it shows as soon as it is switched on and stays until it is switched off. The bar holds one notice: if more than one is showing at the same time, the one highest in this list shows — drag them to change the order. For holiday hours use "Temporary hours" on the location instead.',
      list: true,
      ui: {
        itemProps: (item) => {
          const notice = toNotice(item)
          if (!notice) return { label: 'New notice' }
          const state = noticeState(notice, pacificStamp(new Date()))
          const tag = { live: '● Showing now', scheduled: 'Scheduled', ended: 'Ended', off: 'Off' }[state]
          return { label: `${tag} — ${notice.headline}` }
        },
        defaultItem: { active: true },
      },
      fields: [
        {
          type: 'boolean',
          name: 'active',
          ui: { component: onOffField({ on: 'showing within its dates', off: 'not showing' }) },
          label: 'Show this notice',
          description: 'Off takes it down straight away, whatever the dates say. When nothing is showing the bar disappears completely — it leaves no gap behind.',
        },
        {
          type: 'string',
          name: 'headline',
          label: 'The main message',
          description: 'One short sentence. For example: "The Minimart is closed today."',
        },
        {
          type: 'string',
          name: 'detail',
          label: 'Extra detail',
          description: 'Optional second sentence.',
        },
        {
          type: 'string',
          name: 'link',
          label: 'Link (optional)',
          description: 'A page on this site with more information.',
        },
        {
          type: 'string',
          name: 'startsAt',
          label: 'Starts (MM/DD/YYYY)',
          description:
            'A date like 10/03/2026, or a date and time like 10/03/2026 6:00 AM. Pacific time. Leave blank to show it as soon as it is switched on.',
          ui: { component: DateTimeField, validate: dateOrDateTime },
        },
        {
          type: 'string',
          name: 'endsAt',
          label: 'Ends (MM/DD/YYYY)',
          description:
            'A date like 10/05/2026 runs to the end of that day; a date and time like 10/05/2026 9:00 PM comes down at that minute. Pacific time. Leave blank to show it until it is switched off.',
          ui: { component: DateTimeField, validate: dateOrDateTime },
        },
        {
          type: 'string',
          name: 'updated',
          label: 'Last updated (MM/DD/YYYY)',
          description: 'For example 10/05/2026.',
          ui: { component: DateField, validate: dateOnly },
        },
      ],
    },
    {
      type: 'object',
      name: 'rewards',
      label: 'Rewards app links',
      fields: [
        { type: 'string', name: 'appStoreUrl', label: 'Apple App Store link' },
        { type: 'string', name: 'playStoreUrl', label: 'Google Play link' },
      ],
    },
    {
      type: 'object',
      name: 'footer',
      label: 'Footer links',
      fields: [
        {
          type: 'object',
          name: 'links',
          label: 'Links in the four columns',
          description:
            'Every link in the About, Visit, Rewards and Work with us columns, in the order shown. Drag to reorder, delete a row to remove a link. A column with no links is not shown — except Visit, which then lists the locations automatically. Do not name Silver Reef, Loomis Trail, Salish Village or any other Lummi business in the link text: other Lummi companies appear on this site only as the one "Lummi Commercial Companies" link, and a link that names one will not be shown.',
          list: true,
          ui: {
            itemProps: (item) => ({
              label: item?.label
                ? `${item.label} — ${FOOTER_COLUMN_LABELS[item.column as string] ?? 'no column'}`
                : 'New link',
            }),
          },
          fields: [
            {
              type: 'string',
              name: 'label',
              label: 'Link text',
              description: 'What visitors read, for example: Gift cards.',
              required: true,
            },
            {
              type: 'string',
              name: 'url',
              label: 'Where it goes',
              description:
                'A page on this site starting with / (for example /rewards), or a full address starting with https://, mailto: or tel:. Outside addresses open in a new tab.',
              required: true,
            },
            {
              type: 'string',
              name: 'column',
              label: 'Which column',
              options: Object.entries(FOOTER_COLUMN_LABELS).map(([value, label]) => ({ value, label })),
              required: true,
            },
          ],
        },
        {
          type: 'string',
          name: 'privacyLabel',
          label: 'Privacy Policy link — text',
          description:
            'Leave blank for "Privacy Policy". This link is always in the bottom row and cannot be removed.',
        },
        {
          type: 'string',
          name: 'privacyUrl',
          label: 'Privacy Policy link — where it goes',
          description:
            'Leave blank for /privacy. Changing this moves the link, not the policy page: the page stays at /privacy because both app stores link to it.',
        },
        {
          type: 'string',
          name: 'lummiCommercialCompaniesUrl',
          label: 'Lummi Commercial Companies link — where it goes',
          description:
            'The bottom row link to the wider group of companies. Its text cannot be changed: it is the one place on this site that names them.',
        },
      ],
    },
    {
      type: 'object',
      name: 'social',
      label: 'Social accounts',
      description:
        'Links only — a link, never an embedded feed or follow button. Embedded widgets load code from the social network and set cookies before anyone clicks, which would make the privacy policy’s "this site sets no cookies" untrue. Leave the list empty and the row does not appear at all.',
      list: true,
      ui: { itemProps: (item) => ({ label: item?.label ?? 'New account' }) },
      fields: [
        {
          type: 'string',
          name: 'platform',
          label: 'Network',
          options: [
            { value: 'facebook', label: 'Facebook' },
            { value: 'instagram', label: 'Instagram' },
            { value: 'yelp', label: 'Yelp' },
          ],
          required: true,
        },
        {
          type: 'string',
          name: 'label',
          label: 'Name for screen readers',
          description: 'For example: Facebook.',
          required: true,
        },
        { type: 'string', name: 'url', label: 'Link', required: true },
      ],
    },
    {
      type: 'object',
      name: 'map',
      label: 'Map on the contact page',
      fields: [
        {
          type: 'string',
          name: 'embedCode',
          label: 'Map embed code',
          description: 'The map does not load until a visitor asks for it, so the page sets no cookies on arrival.',
          ui: { component: 'textarea' },
        },
        {
          type: 'image',
          name: 'stillImage',
          label: 'Still picture shown before the map loads',
        },
      ],
    },
    {
      type: 'object',
      name: 'backdrop',
      label: 'Background watermark',
      description: 'A large faint image down one side of the page on desktop. Never shown on phones.',
      fields: [
        { type: 'boolean', name: 'enabled', label: 'Show the watermark', ui: { component: onOffField() } },
        { type: 'image', name: 'image', label: 'Image' },
        {
          type: 'number',
          name: 'opacity',
          label: 'How faint (percent)',
          description: '10 is the tested setting. Higher numbers start to compete with the text.',
        },
        {
          type: 'string',
          name: 'side',
          label: 'Which side',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'right', label: 'Right' },
          ],
        },
        {
          type: 'number',
          name: 'height',
          label: 'Height (percent of the screen)',
        },
      ],
    },
    {
      type: 'object',
      name: 'headerMotifs',
      label: 'Header motifs',
      description:
        'The row of motifs in the navy header, between the menu and the Get the App button. Keep as many groups as you like; switch on "Use this group in the header" for the one to show.',
      fields: [
        {
          type: 'boolean',
          name: 'show',
          ui: { component: onOffField({ unsetIs: true }) },
          label: 'Show header motifs',
        },
        {
          type: 'object',
          name: 'groups',
          label: 'Motif groups',
          description:
            'Each group is a set of motifs in order, with its own strength, scale, spacing and ink. Add a group with +, open one to edit it (the preview updates as you go), delete one with the bin.',
          list: true,
          ui: {
            itemProps: (item) => ({
              label: `${item?.name || 'New group'}${item?.live ? ' — in use' : ''}`,
            }),
            defaultItem: {
              strength: strengthDefault,
              scale: scaleDefault,
              spacing: spacingDefault,
              ink: 'bone',
              repeat: true,
              live: false,
            },
          },
          fields: motifGroupFields,
        },
      ],
    },
    {
      type: 'reference',
      name: 'liveMainPage',
      label: 'Which home page is live',
      collections: ['mainPages'],
      description: 'Only the version chosen here is shown to visitors.',
    },
    promoRowsField(
      'Promotion rows',
      `How promotions are laid out on every page that does not set its own rows. Each row holds one to four across; up to ${MAX_PROMO_ROWS} rows. Promotions fill the rows in order, a row with nothing running does not show, and a row that loses one re-divides so there is never a gap. Leave empty for one full-width row, then two halves.`
    ),
  ],
}

export default defineConfig({
  // "Promotion status" in the CMS menu: every promotion's Live / Scheduled /
  // Ended / Off tag, which Tina's own list has no column for (ADR 0018 §4).
  // The SITE menu: Promotion Status, Media Manager, Header Motif Groups, in
  // that order after Site Settings (tina/fields/site-menu.tsx).
  cmsCallback: (cms) => warnWhenCmsUpdated(returnToListAfterSave(arrangeSiteMenu(cms))),
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? '',
  token: process.env.TINA_TOKEN ?? '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },

  schema: {
    // The order of the CMS menu (owner's order, 30 Sep 2026). Site settings is
    // global, so Tina always lists it under SITE rather than here.
    collections: [mainPages, fuelPrices, promos, infoPages, locations, tenants, pages, settings],
  },
})
