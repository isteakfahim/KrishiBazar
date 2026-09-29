# KrishiBazar (কৃষিবাজার) 🌾
**Bangladesh’s Premier Digital Agricultural Marketplace & Fair Price Discovery Platform**

KrishiBazar connects rural growers directly with retail and wholesale buyers across all 64 districts of Bangladesh. By providing 30-day historical wholesale market trend charts, live price benchmarking, and automated distance-based transport freight quotes, KrishiBazar eliminates exploitative middlemen, ensures fair income for farmers, and guarantees fresh, affordable produce for buyers.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript (Strict typing)
- **Styling**: Tailwind CSS v4 (Mobile-first, CSS variables, dark/light theme)
- **Database & ORM**: PostgreSQL via Prisma ORM 6.x (11 models, 5 enums, Decimal currency)
- **Authentication**: Auth.js v5 (Role-based access: `ADMIN`, `FARMER`, `BUYER`, `PRICE_EDITOR`)
- **Visualizations**: Recharts (30-day AreaCharts, dashed reference line for farmer benchmark, responsive bar charts)
- **Geographic Maps**: Leaflet & React-Leaflet (`ssr: false` dynamic import with custom SVG pins)
- **Animations**: Framer Motion (respects `prefers-reduced-motion`)
- **Typography**: Google Fonts via `next/font` (`Hind Siliguri` + `Bricolage Grotesque`)
- **Internationalization**: Bangla-first with live English toggle (`src/lib/i18n`)

---

## 🚀 Quick Start Guide

### 1. Start the Embedded PostgreSQL Database
The repository includes an embedded PostgreSQL runner configured with UTF-8 encoding on port `5433`:
```bash
npm run db:start
```
*(Leave this running in a terminal or background task)*

### 2. Run Database Migrations and Seed
Seed Bangladesh’s 64 districts (with precise latitude/longitude), 9 categories, 4 vehicle types, demo role accounts, and 1,440 historical price records:
```bash
npm run db:seed
```

### 3. Start the Next.js Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Code Quality & Build Verification
```bash
npm run lint    # 0 errors, 0 warnings
npm run build   # 0 errors, all 25 routes compiled
```

---

## 👥 Demo Role Accounts & Credentials

KrishiBazar features a **1-Click Role Switcher** on the login page (`/login`) for instant testing, or you can sign in manually:

| Role | Email | Password | What You Can Test |
|---|---|---|---|
| **ADMIN** | `admin@krishibazar.gov.bd` | `Krishi@123456` | Platform KPIs, user role switching, product moderation, daily price entry |
| **PRICE_EDITOR** | `editor@krishibazar.gov.bd` | `Krishi@123456` | Daily wholesale price entry, 50% deviation warnings, CSV bulk upload |
| **FARMER (Md. Rahim)** | `farmer.rahim@krishibazar.com` | `Krishi@123456` | Farm profile, crop listings, benchmark chart, received orders workflow |
| **FARMER (Karim)** | `farmer.karim@krishibazar.com` | `Krishi@123456` | Secondary farmer in Bogura |
| **BUYER (Hasan)** | `buyer.hasan@krishibazar.com` | `Krishi@123456` | Product browsing, cart with split orders, COD checkout, order tracking |

---

## 🌟 Key Features & Architecture

### 1. Live Market Price Trend Panel (Home & Products)
- **30-Day Wholesale Trends**: Interactive AreaChart displaying price movements across 64 districts.
- **Farmer's Benchmark ReferenceLine**: Dashed line (`#C98A06`) showing the farmer's price alongside market averages.
- **7D / 30D Toggle**: Statistical trend indicator (Rising ▲, Falling ▼, Stable ●).

### 2. Farmer Crop Listing & Price Intelligence (`/farmer/products/new`)
- **Two-Column Responsive Form**: Live benchmark chart updates automatically as the farmer selects category and district.
- **Suggested Price Chip**: Instant one-click button to populate the local market average.
- **Deviation Warning**: Alerts the farmer if their listed price deviates by more than 40% from market averages.
- **Advance Listing**: Supports `expectedHarvestDate` for pre-orders.

### 3. Haversine Direct Transport Engine (`/transport` & Product/Cart/Checkout)
- **Accurate Freight Calculation**: Uses the spherical Haversine formula with a 1.3 Bangladesh road tortuosity factor.
- **Automatic Vehicle Recommendation**:
  - `weight <= 200 kg`: Local small van (৳12/km, min ৳200)
  - `weight <= 2,000 kg`: Small pickup truck (৳25/km, min ৳400)
  - `weight <= 5,000 kg`: Covered freight van (৳42/km, min ৳800)
  - `weight <= 10,000 kg`: Medium truck (৳68/km, min ৳1,500)
  - `weight > 10,000 kg`: Heavy freight truck (৳95/km, min ৳2,500)

### 4. Split Orders Per Farmer (`/cart` & `/checkout`)
- **Policy Compliance**: A buyer’s cart can contain produce from multiple farmers across different districts.
- **Individual Shipment Groups**: The system groups cart items by farmer and computes independent transport freight.
- **Server Action Transaction**: `placeOrdersAction` creates 1 `Order` per farmer and decrements available product stock atomically.

### 5. Order Tracking & Lifecycle Management (`/orders` & `/farmer/orders`)
- **Visual Progress Timeline**: `PENDING` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`.
- **Farmer Dispatch Controls**: Farmers confirm orders, mark shipments as dispatched, and complete delivery.
- **Buyer Cancellation**: Buyers can cancel pending orders with automatic stock restoration.

### 6. Price Editor & Admin Panel (`/admin`)
- **Daily Price Entry**: Select crop, district, and date. Checks previous day prices and enforces an explicit confirmation checkbox if price jumps/drops by >50%.
- **CSV Bulk Upload**: Paste or upload CSV rows (`date,category,district,price`), preview valid/invalid rows in a table, and commit to the database in one click.
- **Product Moderation**: Toggle public visibility or delete listings.
- **User Role Management**: Promote or switch user roles seamlessly.

---

## ⚠️ Limitations (Version 1.0)

As specified in the project scope, the following simulated behaviors are present in this release:
1. **Demo Market Price Data**: Historical price records (1,440 entries) are modeled based on typical Department of Agricultural Marketing (DAM) seasonal patterns and labeled as "নমুনা / Demo".
2. **Simulated Payment Gateways**: Cash on Delivery (COD) is the primary functional payment method. bKash / Nagad / Rocket options run in simulated sandbox mode.
3. **Sample Farm Coordinates**: Farm and district geographic coordinates are sampled from verified Bangladesh center points for demonstration.
4. **Mock SMS & OTP**: Real-time SMS and OTP delivery are bypassed; direct phone links (`tel:`) are provided for direct communication.

---

## 📄 License
KrishiBazar is developed for the agricultural empowerment of Bangladesh. Open source under the MIT License.
