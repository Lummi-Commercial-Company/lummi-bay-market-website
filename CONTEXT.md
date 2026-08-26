# CONTEXT — Lummi Bay Market Glossary

A shared vocabulary for this project. Glossary only — no implementation details.
Updated as terms are resolved during design.

## Terms

**Lummi Bay Market** — The parent company and brand. The "Market" logo lockup is the
site's master mark, used sitewide (header, home hero). The three Locations are stores
operating under Lummi Bay Market. Referred to as "Lummi Bay Market" in copy.

**Location** — A physical Lummi Bay fuel + convenience site with its own name.
Exactly three exist; there are no others in scope.

**Exit 260** — A Location. Full name "Lummi Bay Market at Exit 260"; nav label
"Exit 260". Sits on the Salish Village development beside I-5 Exit 260. Holds the
24-hour convenience store (16 fuel lanes, tobacco & liquor drive-thru, quick-serve
food) and the separate truck stop (diesel lanes, driver store, showers, lounge). The
flagship.

**Mini Mart** — A Location. Full name "Lummi Bay Market Mini Mart"; nav label
"Mini Mart". Fuel + convenience store; next to Silver Reef Casino.

**Fisherman's Cove** — A Location. Full name "Lummi Bay Market at Fisherman's Cove";
nav label "Fisherman's Cove"; short label "The Cove", used only where horizontal room is
scarce — the fuel price band. Navigation never abbreviates it. Fuel + convenience store; includes the Cove Kitchen and
ethanol-free fuel.

**Amenity** — A service offered at a Location (e.g., showers, driver lounge). A café or
deli, if one exists at a Location, is an Amenity — not a separate brand or site section.

**Tenant** — An independent business operating at a Lummi Bay Market property, renting from
Lummi Commercial Company. Not owned, operated or managed by Lummi Bay Market. Known at
Exit 260 / Salish Village: **Piroshky Piroshky** (a counter inside the store), **Wendy's**
and **Black Bear Diner** (freestanding buildings; Black Bear not yet built), and a coffee
truck outside the store. The site never mentions renting, leasing or landlords — see
ADR 0016. A Tenant is **not a Location**
— Locations are the three Lummi Bay stores and nothing else, and the Locations index and
the fuel price table both read from that set. A Tenant is also **not an Amenity**: the Cove
Kitchen is an Amenity because Lummi Bay Market runs it, while the piroshki counter sits
inside the Exit 260 store and is somebody else's business. Ownership decides which, not
whether it shares a roof. See ADR 0016.
_Avoid_: partner, vendor, concession.

**Fuel Grade** — A product sold at a posted per-unit price. Three exist in scope: regular,
diesel, and DEF. Midgrade, premium, and ethanol-free are not priced on this site.
_Avoid_: fuel type, product.

**Fuel Price** — A posted price for one Fuel Grade at one place. Four places post prices:
the three Locations and the Truck Stop. The three Locations may be priced together or
separately; the Truck Stop is always priced on its own.
_Avoid_: gas price, pump price, rate.

**DEF** — Diesel exhaust fluid. Not a fuel, but posted and priced like one, so it is a
Fuel Grade. Sold at the Truck Stop only.

**Truck Stop** — The driver-facing facility at the Exit 260 / Salish Village site
(diesel lanes, driver store, showers, lounge, parking). Not a Location, but it posts its
own Fuel Prices — diesel and DEF — independently of the three Locations. Summarized on the
Exit 260 page and detailed on its own dedicated `/truck-stop` page; the two cross-link.

**Rewards** — The Lummi Bay Market loyalty program, delivered via a mobile app. On this
site it is a promo page (`/rewards`) that pitches the app and links to the download —
no loyalty logic is built here. Carried over from exit260.com's rewards page.

**Careers** — A single editable link (managed in the CMS), pointing wherever hiring is
run (typically LCC). Lives in the footer; not a built jobs section.

**Contact form** — One site-wide contact form. Per-Location address, hours, phone, and
map are shown on each Location page.

**Sub-brand** — A brand-book logo lockup (Market, Café, Marina, Deli). Out of scope as
separate site sections; the system exists but this site does not build pages for them.

**Lummi Commercial Company (LCC)** — The parent tribal enterprise (lcc-lummi.com),
wholly owned by Lummi Nation. Owns the Lummi Bay Market brand plus other businesses
(Silver Reef Casino & Resort, Loomis Trail Golf, the Salish Village development).

**Lummi Commercial Companies** — The footer link (and only reference on this site) to
LCC and its other businesses. Points to lcc-lummi.com. Never appears in page copy or nav.

**Salish Village** — A 160-acre LCC development beside I-5 Exit 260. It hosts the
Exit 260 store AND the separate truck stop. It is a place/site, not a store; the store
there is named "Exit 260". Used in copy only when referring to the development.
