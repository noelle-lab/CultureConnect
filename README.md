# CultureConnect

**Bringing family-owned, ethnic-minority-run businesses from big cities to every city in the U.S.**

CultureConnect is an online marketplace + operations platform. Family-owned
cultural shops (starting in New York City, expanding to SF & DC) get a place to
sell authentic goods nationwide, while our team discovers, onboards, and markets
them behind the scenes. Buyers anywhere in the country can discover and purchase
genuine cultural products that are otherwise hard to find outside major cities.

This repo is a working front-end prototype built with **React + Vite**. Auth is
intentionally faked and all data is mock data persisted to `localStorage`, so the
whole experience is explorable with no backend.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # production build to dist/
npm run preview  # serve the production build
```

## Signing in (demo)

The site opens as a storefront. Sign-in buttons are in the top-right.

| Role  | How to sign in |
|-------|----------------|
| **Buyer** | Click **Sign in** → *Buyer* tab. Any email/password works, or click "Skip — use demo buyer account". |
| **Admin** | Click **🔐 Admin** → any credentials, or "Skip — use demo admin account". Unlocks the full operations console at `/admin`. |

Demo credentials are shown right on the sign-in modal. The admin area is gated —
buyers can't see it.

---

## What's inside

### Public storefront
- **Home** — mission-driven hero, featured products, partner-shop spotlights, how-it-works, mission band.
- **Shop** — full catalog with search, category & heritage filters, and sorting.
- **Product detail** — in-store vs. online price, add-to-cart / buy-now, related items.
- **Cart & checkout** — a demo checkout that records an order (no real payment).
- **For Businesses (Services)** — the two offerings + a transparent commission explainer + apply form.
- **Request a City** — buyers submit and upvote cities they want served next.
- **Our Mission (About)** — the problem, the goal, and our principles.

### Two services for shops
1. **List on CultureConnect** — full white-glove marketplace listing. 20% commission, no upfront cost.
2. **Cross-listing service** — publish & sync one catalog to **Etsy** and **eBay** from a single dashboard.

### Admin operations console (`/admin`)
- **Dashboard** — sales, commission, payouts, active shops, sales trend, expansion pipeline, recent orders.
- **Shop Discovery** — research/log minority-owned shops and move them through a
  prospect → contacted → onboarding → active pipeline (starting in NYC).
- **Partner Shops** — manage every shop's status and which services they use.
- **City Buildout** — buyer city requests ranked by demand, moved through the launch flow.
- **Listings** — every product; edit in-store price (online price auto-marks up), stock, and channels.
- **Cross-Listing** — toggle each product live on Etsy / eBay for enrolled shops.
- **Orders** — every order with the commission split and fulfillment status.
- **Finance & Payouts** — the business-model engine: 20% commission, per-shop
  payout ledger, and a pricing calculator built around the 120%-of-in-store rule.

### The business model, built in
CultureConnect takes a **20% commission** on online sales. Shops are encouraged
to list at **120% of their in-person price**, which covers the commission while
they still net ~96% of their usual in-store value — with zero marketing effort.
All of this is wired through the app (see `src/data/mockData.js` and the Finance
page).

---

## Project structure

```
src/
  main.jsx                 App entry + providers
  App.jsx                  Routes (public shell vs. admin shell)
  index.css                Full design system / styling
  context/AppContext.jsx   Fake auth, cart, and all mutable state (localStorage)
  data/
    mockData.js            Seed shops, products, cities, orders + pricing helpers
    analytics.js           Order/aggregate math + money formatting
  components/              Navbar, Footer, ProductCard, AuthModal, RequireAdmin
  pages/                  Public pages (Home, Shop, Cart, Services, …)
  pages/admin/            Admin console pages
```

> **Note:** This is a prototype. Authentication, payments, and cross-listing
> integrations are simulated for demonstration. Data resets via the **Reset
> demo** button in the admin bar.
