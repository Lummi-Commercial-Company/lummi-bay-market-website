#!/usr/bin/env node
/**
 * Validates src/data/fuel-prices.json before a build. Catches the things a
 * non-technical edit actually breaks: a typo'd number, a removed grade, a price a
 * location does not sell. Run with `npm run check:prices`.
 */
import { readFileSync } from "node:fs";

const GRADES = new Set([
  "regular",
  "midgrade",
  "premium",
  "diesel",
  "ethanol-free",
  "def",
]);

/** Price groups, and the grades each is allowed to carry. */
const EXPECTED = {
  "exit-260": ["regular", "midgrade", "premium", "diesel"],
  "exit-260-truck-stop": ["diesel", "def"],
  "mini-mart": ["regular", "diesel"],
  "fishermans-cove": ["regular", "diesel", "ethanol-free"],
};

const STALE_DAYS = 30;
const errors = [];
const warnings = [];

let prices;
try {
  prices = JSON.parse(readFileSync("src/data/fuel-prices.json", "utf8"));
} catch (err) {
  console.error(`fuel-prices.json does not parse: ${err.message}`);
  process.exit(1);
}

for (const [group, expectedGrades] of Object.entries(EXPECTED)) {
  const entry = prices[group];
  if (!entry) {
    errors.push(`missing price group "${group}"`);
    continue;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.updated ?? "")) {
    errors.push(`${group}: "updated" must be YYYY-MM-DD, got ${entry.updated}`);
  } else {
    const age = (Date.now() - Date.parse(entry.updated)) / 86_400_000;
    if (age > STALE_DAYS) {
      warnings.push(
        `${group}: prices last updated ${entry.updated} (${Math.floor(age)} days ago)`
      );
    }
  }

  for (const grade of expectedGrades) {
    if (typeof entry[grade] !== "number") {
      errors.push(`${group}: missing price for "${grade}"`);
    }
  }

  for (const [key, value] of Object.entries(entry)) {
    if (key === "updated") continue;
    if (!GRADES.has(key)) {
      errors.push(`${group}: "${key}" is not a known fuel grade`);
      continue;
    }
    if (!expectedGrades.includes(key)) {
      errors.push(`${group}: does not sell "${key}"`);
      continue;
    }
    if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
      errors.push(`${group}.${key}: must be a number >= 0, got ${value}`);
      continue;
    }
    // Tested as a string: value * 100 is not exact in binary floating point.
    if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
      errors.push(`${group}.${key}: must be dollars with at most two decimals (${value})`);
    }
    if (value > 15) {
      errors.push(`${group}.${key}: ${value} looks like a typo (over $15)`);
    }
  }
}

for (const group of Object.keys(prices)) {
  if (!EXPECTED[group]) errors.push(`unknown price group "${group}"`);
}

for (const w of warnings) console.warn(`warning: ${w}`);

if (errors.length) {
  console.error(`\nfuel-prices.json has ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(
  `fuel-prices.json ok — ${Object.keys(EXPECTED).length} price groups validated` +
    (warnings.length ? `, ${warnings.length} warning(s)` : "")
);
