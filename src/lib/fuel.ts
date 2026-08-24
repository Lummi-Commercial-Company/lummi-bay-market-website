import prices from "@/data/fuel-prices.json";

/**
 * Every price on the site comes from src/data/fuel-prices.json and nowhere else.
 * See skill `fuel-price-update`. Never hard-code a price in a page.
 */

export type Grade =
  | "regular"
  | "midgrade"
  | "premium"
  | "diesel"
  | "ethanol-free"
  | "def";

/**
 * Price groups are not the same thing as locations. `exit-260-truck-stop` is the
 * flagship's truck lanes, priced independently of the car lanes at the same site.
 */
export type PriceGroupId =
  | "exit-260"
  | "exit-260-truck-stop"
  | "mini-mart"
  | "fishermans-cove";

export type PriceGroup = {
  updated: string;
  prices: { grade: Grade; label: string; value: number }[];
};

const GRADE_LABELS: Record<Grade, string> = {
  regular: "Unleaded",
  midgrade: "Midgrade",
  premium: "Premium",
  diesel: "Diesel",
  "ethanol-free": "Ethanol-free",
  def: "DEF",
};

const GRADE_ORDER: Grade[] = [
  "regular",
  "midgrade",
  "premium",
  "diesel",
  "ethanol-free",
  "def",
];

export const GROUP_LABELS: Record<PriceGroupId, string> = {
  "exit-260": "Exit 260",
  "exit-260-truck-stop": "Truck Stop",
  "mini-mart": "Mini Mart",
  "fishermans-cove": "Fisherman's Cove",
};

/**
 * Names for the pinned widget, where four columns share a phone's width. Every one
 * fits on a single line, so no column's prices fall out of line with its neighbours.
 * "The Cove" is this location's documented aka, not a new name.
 */
export const GROUP_SHORT_LABELS: Record<PriceGroupId, string> = {
  ...GROUP_LABELS,
  "fishermans-cove": "The Cove",
};

export function getPriceGroup(id: PriceGroupId): PriceGroup {
  const raw = (prices as Record<string, Record<string, string | number>>)[id];
  if (!raw) throw new Error(`No fuel prices for price group "${id}"`);

  const rows = GRADE_ORDER.filter((g) => typeof raw[g] === "number").map((g) => ({
    grade: g,
    label: GRADE_LABELS[g],
    value: raw[g] as number,
  }));

  return { updated: String(raw.updated), prices: rows };
}

export function formatPrice(value: number): string {
  return value.toFixed(2);
}

/** "May 1, 2018" — parsed as a plain date so it does not shift by timezone. */
export function formatUpdated(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Which price groups a location page shows. Exit 260 shows two: its car lanes and
 * its truck lanes, which are priced independently at the same site.
 */
export function priceGroupsForLocation(locationId: string): PriceGroupId[] {
  if (locationId === "exit-260") return ["exit-260", "exit-260-truck-stop"];
  if (locationId === "mini-mart") return ["mini-mart"];
  if (locationId === "fishermans-cove") return ["fishermans-cove"];
  throw new Error(`No price groups mapped for location "${locationId}"`);
}
