import { defineConfig } from 'tinacms'
import type { Collection, Template, TinaField } from 'tinacms'

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
      label: 'First day (YYYY-MM-DD)',
      description: 'The first whole day these hours apply, Pacific time.',
      required: true,
    },
    {
      type: 'string',
      name: 'endsAt',
      label: 'Last day (YYYY-MM-DD)',
      description:
        'The last whole day these hours apply, Pacific time. Required — without an end date the temporary hours would never go away on their own.',
      required: true,
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
          { type: 'rich-text', name: 'answer', label: 'Answer', required: true },
        ],
      },
    ],
  },
]

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
    label: 'Hide from Google',
    description:
      'Keeps the page reachable by its link but out of search results. Leave off unless you know you want this.',
  },
  {
    type: 'boolean',
    name: 'noBackdrop',
    label: 'Turn off the background watermark on this page',
  },
]

/* ===========================================================================
   Collections
   =========================================================================== */

const locations: Collection = {
  name: 'locations',
  label: 'Locations',
  path: 'content/locations',
  format: 'mdx',
  // There are exactly three Locations and there are no others in scope. A
  // fourth would appear in the locations index, the fuel price table, /contact
  // and the sitemap — a business renting space on our property is a Tenant, not
  // a Location. Adding and deleting are therefore off.
  ui: { allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: 'string',
      name: 'id',
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
          name: 'amenities',
          label: 'What’s at the Truck Stop',
          description: 'One per line: diesel lanes, DEF, showers, driver lounge, truck parking.',
          list: true,
        },
        { ...hoursOverridesField, label: 'Temporary Truck Stop hours' },
      ],
    },
    {
      type: 'object',
      name: 'hero',
      label: 'Main photo',
      fields: [
        { type: 'image', name: 'image', label: 'Photo' },
        {
          type: 'string',
          name: 'alt',
          label: 'Describe the photo',
          description: 'One short sentence, for people using a screen reader.',
        },
      ],
    },
  ],
}

/**
 * Fuel prices — one document, eight numbers, the only place a price is stored.
 * See the skill `fuel-price-update` for the procedure staff follow.
 */
const fuelPrices: Collection = {
  name: 'fuelPrices',
  label: 'Fuel prices',
  path: 'content',
  format: 'json',
  match: { include: 'fuel-prices' },
  ui: {
    allowedActions: { create: false, delete: false },
    router: () => '/fuel-prices',
  },
  fields: [
    {
      type: 'boolean',
      name: 'linkLocations',
      label: 'The three stores usually share a price',
      description:
        'A reminder for you, nothing more. It does not change the website: every store always shows the price typed against its own name below. The Truck Stop is never affected by it.',
    },
    {
      type: 'object',
      name: 'locations',
      label: 'Store prices',
      fields: [
        { type: 'object', name: 'exit-260', label: 'Exit 260', fields: priceFields() },
        { type: 'object', name: 'minimart', label: 'Minimart', fields: priceFields() },
        { type: 'object', name: 'fishermans-cove', label: 'Fisherman’s Cove', fields: priceFields() },
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
function priceFields({ includeRegular = true } = {}): TinaField[] {
  const fields: TinaField[] = []
  if (includeRegular) {
    fields.push({
      type: 'number',
      name: 'regular',
      label: 'Regular ($ per gallon)',
      description: 'For example 3.79. Leave blank if it is not sold here.',
    })
  }
  fields.push(
    {
      type: 'number',
      name: 'diesel',
      label: 'Diesel ($ per gallon)',
      description: 'Leave blank if it is not sold here.',
    },
    {
      type: 'number',
      name: 'def',
      label: 'DEF ($ per gallon)',
      description: 'Diesel exhaust fluid. Leave blank if it is not sold here.',
    },
    {
      type: 'string',
      name: 'updated',
      label: 'Last changed (YYYY-MM-DD)',
      description: 'Shown to customers next to the prices. Update it whenever you change a price here.',
    }
  )
  return fields
}

const pages: Collection = {
  name: 'pages',
  label: 'Pages',
  path: 'content/pages',
  format: 'mdx',
  ui: {
    router: (props) => `/${props.document._sys.filename}`,
  },
  fields: [
    { type: 'string', name: 'title', label: 'Page title', required: true, isTitle: true },
    {
      type: 'string',
      name: 'slug',
      label: 'Web address',
      description:
        'The part after lummibay.com/. Changing it breaks every existing link to this page. The privacy page in particular must keep its address — it is published in both app stores.',
      required: true,
    },
    {
      type: 'string',
      name: 'navLabel',
      label: 'Short name (footer and links)',
    },
    {
      type: 'boolean',
      name: 'showPromos',
      label: 'Show the promotions band on this page',
    },
    ...seoFields,
    {
      type: 'object',
      name: 'blocks',
      label: 'Page content',
      list: true,
      templates: pageBlocks,
    },
  ],
}

const mainPages: Collection = {
  name: 'mainPages',
  label: 'Home page versions',
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
    ...seoFields,
    {
      type: 'object',
      name: 'blocks',
      label: 'Page content',
      list: true,
      templates: pageBlocks,
    },
  ],
}

const infoPages: Collection = {
  name: 'infoPages',
  label: 'Offer detail pages',
  path: 'content/info-pages',
  format: 'mdx',
  ui: {
    allowedActions: { delete: false },
    router: (props) => `/info/${props.document._sys.filename}`,
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
    {
      type: 'object',
      name: 'blocks',
      label: 'Page content',
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
  label: 'Promotions',
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
      description: 'Around 28 characters reads best. Longer still works, it just gets smaller.',
      required: true,
      isTitle: true,
    },
    {
      type: 'string',
      name: 'cta',
      label: 'Button text',
      description: 'Leave blank for "See details".',
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
      label: 'Starts (YYYY-MM-DD)',
      description: 'Leave blank to start straight away. Pacific time.',
    },
    {
      type: 'string',
      name: 'endsAt',
      label: 'Ends (YYYY-MM-DD)',
      description: 'Leave blank to run until you turn it off. Pacific time — it stops on its own at the end of this day.',
    },
    {
      type: 'boolean',
      name: 'active',
      label: 'Running',
      description: 'Turn this off to pull the promotion immediately, whatever the dates say.',
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
      description: 'Only used when "Specific pages only" is chosen above. Add one row per page.',
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
      type: 'number',
      name: 'priority',
      label: 'Order',
      description: 'Lower numbers come first when several are running at once.',
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
  label: 'Other businesses on our properties',
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
      label: 'We have permission to use their logo and photo',
      description: 'The logo and photo stay hidden until this is ticked. Somebody else’s trademark is not ours to publish.',
    },
    {
      type: 'object',
      name: 'blocks',
      label: 'Page content',
      list: true,
      templates: pageBlocks,
    },
  ],
}

const settings: Collection = {
  name: 'settings',
  label: 'Site settings',
  path: 'content/settings',
  format: 'json',
  ui: { allowedActions: { create: false, delete: false }, global: true },
  fields: [
    {
      type: 'object',
      name: 'siteAlert',
      label: 'Emergency notice',
      description:
        'A single line across the top of every page, for something urgent and unplanned — a closure, a road out, a power cut. It goes live within seconds. For planned holiday hours use "Temporary hours" on the location instead.',
      fields: [
        {
          type: 'boolean',
          name: 'active',
          label: 'Show the notice',
          description: 'Turn this off and the bar disappears completely — it leaves no gap behind.',
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
          name: 'updated',
          label: 'Last updated',
          description: 'Shown at the end of the bar on larger screens.',
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
          type: 'string',
          name: 'careersUrl',
          label: 'Careers link',
          description:
            'Where the footer’s "Careers" link goes. The link text on the site is always the single word "Careers" — it never names the destination.',
        },
        {
          type: 'string',
          name: 'lummiCommercialCompaniesUrl',
          label: 'Lummi Commercial Companies link',
          description: 'The one place on this site that points to the wider group of companies.',
        },
      ],
    },
    {
      type: 'object',
      name: 'social',
      label: 'Social accounts',
      description:
        'Links only — a link, never an embedded feed or follow button. Embedded widgets load code from the social network and set cookies before anyone clicks, which would make the "No cookies" line in the footer untrue. Leave the list empty and the row does not appear at all.',
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
        { type: 'boolean', name: 'enabled', label: 'Show the watermark' },
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
      type: 'reference',
      name: 'liveMainPage',
      label: 'Which home page is live',
      collections: ['mainPages'],
      description: 'Only the version chosen here is shown to visitors.',
    },
  ],
}

export default defineConfig({
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
    collections: [locations, fuelPrices, promos, pages, mainPages, infoPages, tenants, settings],
  },
})
