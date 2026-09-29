# KrishiBazar: Master Brief

Agricultural marketplace for Bangladesh. Farmers list produce, buyers
order it, farmers see a 30-day market price chart before setting a price.
Also read docs/PLAN.md for the original plan (it was written for C#;
we are using the stack below instead).

## Stack
Next.js (App Router) + TypeScript, Tailwind, Prisma + PostgreSQL,
Auth.js, Framer Motion, Recharts, react-leaflet (load with
dynamic import, ssr: false). Fonts via next/font: Bricolage Grotesque
+ Hind Siliguri. UI is Bangla-first with an English toggle
(use next-intl or simple translation files from the start).

## Roles
ADMIN, FARMER, BUYER, PRICE_EDITOR.

## Design
Mobile-first, modern, calm. Colors (CSS variables, with dark variants):
bg #F3F7F2, ink #12221A, green #17553A, up #1A8F52, down #C93C3C,
farmer-price line #C98A06, tint #E4EFE6. Hero on the home page has a
market price panel: Recharts AreaChart, 7D/30D toggle, dashed
ReferenceLine for the farmer's price, line-draw animation on load.
Animate only transform/opacity, respect prefers-reduced-motion.
Keep animation purposeful: one page-load moment, plus animations that
respond to user actions (add to cart, status change).

## Data model rules
- Product must have CategoryId and DistrictId.
- Product supports: minimumOrderQty, unit (kg), optional
  expectedHarvestDate (advance listing / pre-order).
- Cart may contain products from several farmers, so an order is split
  into one Order per farmer.
- An Order can have many Payment attempts (1:many).
- PriceHistory: categoryId, districtId, pricePerKg (Decimal), date,
  source (ADMIN/MARKET), enteredBy. Unique on
  (categoryId, districtId, date, source).
- Money is always Decimal, never float.
- Seed: 64 districts (name, latitude, longitude), categories,
  vehicle types, roles, and DEMO price history for 6 crops in 8
  districts. Mark demo data clearly.

## Security rules (must follow)
- Farmers can edit only their own farm and products (check ownership
  on the server, not just in the UI).
- Only PRICE_EDITOR/ADMIN can write PriceHistory. Warn if a new price
  differs more than 50% from the previous day.
- Validate all input on the server. No secrets in code; use .env and
  make sure .env is in .gitignore.

## Phases (do one at a time, stop after each)
1. Foundation: Prisma schema, migrations, seed, Auth.js with roles,
   layout, theme, fonts, language toggle, home page from the design.
2. Farmer side: farmer profile, farm, add/edit product (with image
   upload via a storage abstraction; local disk for now).
3. Price chart: PriceChart component and API, shown on the add-product
   form with the farmer's price line and "X% above/below market" text.
4. Buyer side: browse and filter products, product page, cart,
   COD checkout, orders split per farmer, order tracking timeline
   (Pending, Confirmed, Shipped, Delivered).
5. Transport: distance (Haversine) x vehicle-type rate, shown on
   product page and checkout.
6. Admin: PRICE_EDITOR panel with a table for daily price entry and
   CSV upload, admin user and product management.
7. Polish: animations, loading skeletons, empty and error states,
   accessibility check, PWA basics, README with a Limitations section
   (demo price data, simulated payout, sample coordinates).

Not in version 1: real payment gateway, chat, live tracking,
weather, price alerts, ratings.

## Working rules
- After each phase: list files changed, how to run it, and what to
  test manually. Do not start the next phase.
- Prefer simple, readable code over clever abstractions.
