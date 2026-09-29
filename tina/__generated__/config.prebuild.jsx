// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.NEXT_PUBLIC_TINA_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? null,
  token: process.env.TINA_TOKEN ?? null,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  schema: {
    collections: [
      {
        name: "fuelPrices",
        label: "Fuel Prices",
        path: "content",
        format: "json",
        match: { include: "fuel-prices" },
        // ui.global puts this under "Site" and opens straight to the form —
        // the shortest path for the edit staff make most often.
        ui: {
          global: true,
          allowedActions: { create: false, delete: false }
        },
        fields: [
          {
            type: "boolean",
            name: "linkLocations",
            label: "Apply one price to all three locations",
            description: "Tick this when all three stores charge the same. It is a reminder only \u2014 each store still keeps its own price below, and the Truck Stop is never affected."
          },
          {
            type: "object",
            name: "locations",
            label: "Store prices",
            fields: [
              {
                type: "object",
                name: "exit_260",
                nameOverride: "exit-260",
                label: "Exit 260",
                fields: priceFields(["regular", "diesel"])
              },
              {
                type: "object",
                name: "mini_mart",
                nameOverride: "mini-mart",
                label: "Mini Mart",
                fields: priceFields(["regular", "diesel"])
              },
              {
                type: "object",
                name: "fishermans_cove",
                nameOverride: "fishermans-cove",
                label: "Fisherman's Cove",
                fields: priceFields(["regular", "diesel"])
              }
            ]
          },
          {
            type: "object",
            name: "truckStop",
            label: "Truck Stop",
            description: "Always typed by hand. Truck-lane diesel is not the same as car-lane diesel.",
            fields: priceFields(["diesel", "def"])
          }
        ]
      },
      {
        name: "location",
        label: "Locations",
        path: "content/locations",
        format: "json",
        ui: {
          // Three Locations exist and there are no others in scope (CONTEXT.md).
          allowedActions: { create: false, delete: false }
        },
        fields: [
          { type: "number", name: "order", label: "Order in lists" },
          {
            type: "string",
            name: "name",
            label: "Full name",
            description: "As it appears at the top of the store's own page.",
            required: true
          },
          {
            type: "string",
            name: "navLabel",
            label: "Short name (menus and lists)",
            required: true
          },
          {
            type: "string",
            name: "shortLabel",
            label: "Shortest name (fuel price table)",
            description: "Used where space is tight. Fisherman's Cove becomes The Cove."
          },
          { type: "string", name: "aka", label: "Also known as" },
          { type: "string", name: "address", label: "Street address", required: true },
          { type: "string", name: "city", label: "City" },
          { type: "string", name: "state", label: "State" },
          { type: "string", name: "zip", label: "ZIP" },
          { type: "string", name: "phone", label: "Phone number" },
          {
            type: "string",
            name: "phoneLabel",
            label: "What to call that phone number",
            description: 'For example "C-Store". Shown next to the number.'
          },
          {
            type: "string",
            name: "hours",
            label: "Opening hours",
            description: 'Keep it short: "6am\u20139pm" or "Open 24 hours". Long hours get cut off on phones.'
          },
          {
            type: "string",
            name: "cardLine",
            label: "One-line summary for lists",
            description: "Street first, then hours. This truncates rather than wrapping, so keep it tight."
          },
          {
            type: "string",
            name: "intro",
            label: "Short introduction",
            ui: { component: "textarea" }
          },
          { type: "string", name: "amenities", label: "What's here", list: true },
          {
            type: "object",
            name: "truckStop",
            label: "Truck Stop (Exit 260 only)",
            description: "Leave empty for stores without a truck stop. The truck stop is a second store, with its own phone and hours.",
            fields: [
              { type: "string", name: "phone", label: "Truck Stop phone" },
              { type: "string", name: "hours", label: "Truck Stop hours" },
              { type: "string", name: "amenities", label: "What's here", list: true }
            ]
          }
        ]
      },
      {
        name: "siteAlert",
        label: "Emergency Notice",
        path: "content/settings",
        format: "json",
        match: { include: "site-alert" },
        ui: {
          global: true,
          allowedActions: { create: false, delete: false }
        },
        fields: [
          {
            type: "boolean",
            name: "active",
            label: "Show this notice on every page",
            description: "Turn off as soon as the situation has passed."
          },
          {
            type: "string",
            name: "message",
            label: "Message",
            ui: { component: "textarea" }
          },
          { type: "string", name: "linkLabel", label: "Link text (optional)" },
          { type: "string", name: "linkHref", label: "Link address (optional)" }
        ]
      }
    ]
  }
});
function priceFields(grades) {
  const labels = {
    regular: "Regular",
    diesel: "Diesel",
    def: "DEF"
  };
  return [
    ...grades.map((g) => ({
      type: "number",
      name: g,
      label: labels[g],
      description: "Dollars, two decimals. For example 4.05"
    })),
    {
      type: "string",
      name: "updated",
      label: "Last updated",
      description: "Set this to today's date when you change a price."
    }
  ];
}
export {
  config_default as default
};
