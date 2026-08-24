import locations from "@/data/locations.json";

/**
 * Locations are data, never markup. Addresses, hours and phone numbers are edited
 * here (and later in TinaCMS) so staff never touch a page. See skill
 * `location-content-model`. When Tina lands, this loader is the seam that changes:
 * it starts reading content/locations/*.md and every caller stays as it is.
 */

export type Location = {
  id: string;
  name: string;
  navLabel: string;
  aka: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: string;
  truckStop: boolean;
  fuelGrades: string[];
  amenities: string[];
};

export function getLocations(): Location[] {
  return locations as Location[];
}

export function getLocation(id: string): Location {
  const found = getLocations().find((l) => l.id === id);
  if (!found) throw new Error(`No location with id "${id}"`);
  return found;
}

export function telHref(phone: string): string {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}
