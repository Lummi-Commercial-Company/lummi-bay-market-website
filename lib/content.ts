import fs from "node:fs";
import path from "node:path";

const CONTENT = path.join(process.cwd(), "content");

/** A Location's truck stop, when it has one. Only Exit 260 does. */
export type TruckStop = {
  phone: string;
  hours: string;
  amenities: string[];
};

/**
 * One of the three Lummi Bay Market stores. See CONTEXT.md — a Tenant is not a
 * Location, and this set is what the Locations index and the price table read from.
 */
export type Location = {
  /** Derived from the filename — Tina treats the filename as the slug. */
  id: string;
  name: string;
  navLabel: string;
  shortLabel: string;
  aka: string;
  order: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneLabel: string;
  hours: string;
  cardLine: string;
  intro: string;
  amenities: string[];
  truckStop?: TruckStop;
};

export type GradePrices = {
  regular?: number;
  diesel?: number;
  def?: number;
  updated: string;
};

export type FuelPrices = {
  linkLocations: boolean;
  locations: Record<string, GradePrices>;
  truckStop: GradePrices;
};

export type SiteAlert = {
  active: boolean;
  message: string;
  linkLabel: string;
  linkHref: string;
};

function readJson<T>(...segments: string[]): T {
  return JSON.parse(fs.readFileSync(path.join(CONTENT, ...segments), "utf8")) as T;
}

/** All Locations, in the order the Locations index and price table use. */
export function getLocations(): Location[] {
  const dir = path.join(CONTENT, "locations");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      ...readJson<Omit<Location, "id">>("locations", f),
      id: f.replace(/\.json$/, ""),
    }))
    .sort((a, b) => a.order - b.order);
}

export function getLocation(id: string): Location | undefined {
  return getLocations().find((l) => l.id === id);
}

/** The Location that owns the Truck Stop. Exactly one does. */
export function getTruckStopLocation(): Location | undefined {
  return getLocations().find((l) => l.truckStop);
}

export function getFuelPrices(): FuelPrices {
  return readJson<FuelPrices>("fuel-prices.json");
}

export function getSiteAlert(): SiteAlert {
  return readJson<SiteAlert>("settings", "site-alert.json");
}

/** A row in the fuel price table: a place that posts prices. */
export type PriceRow = {
  key: string;
  label: string;
  prices: GradePrices;
};

/**
 * The four places that post prices, in table order: the three Locations then the
 * Truck Stop. Labels use `shortLabel` — the price band is the constrained slot
 * `shortLabel` exists for.
 */
export function getPriceRows(): PriceRow[] {
  const locations = getLocations();
  const fuel = getFuelPrices();
  const rows: PriceRow[] = locations
    .filter((l) => fuel.locations[l.id])
    .map((l) => ({
      key: l.id,
      label: l.shortLabel || l.navLabel,
      prices: fuel.locations[l.id],
    }));
  rows.push({ key: "truck-stop", label: "Truck Stop", prices: fuel.truckStop });
  return rows;
}
