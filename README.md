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

## Signing in

There are **two different sign-ins**, on purpose:

| Who | Sign-in | Where |
|-----|---------|-------|
| **Buyers / businesses** | **Fake** — any email/password works (it's a demo storefront). | **Sign in** button, top-right. |
| **Admins (our team)** | **Real Google account, invite-only.** | Discreet **Admin sign in** link at the very **bottom of the page** (in the footer), so the public never wanders in. |

### Admin access: real Google sign-in + invites

Admins sign in with a genuine Google account, and access is **invite-only**:

1. An existing admin opens **Team & Invites** in the console (`/admin/team`),
   types the new person's email, and clicks **Create invite link**.
2. They **email that link to the person themselves** — the app never sends it.
3. The invitee opens the link (`/invite?token=…`), which unlocks admin access
   for their email on their device, then signs in with the **matching Google
   account**.

Only emails that have redeemed a valid invite can get in. Links are HMAC-signed
(so they can't be hand-edited to a different email) and expire after 14 days.
The founder account (`noelle@c10family.com`) is seeded as the first admin so
there's always a way to send the first invite.

**Turning on real Google accounts:** set `VITE_GOOGLE_CLIENT_ID` (see
[`.env.example`](.env.example) for the 5-minute setup). Until it's set, admin
sign-in runs in a clearly-labelled **demo mode** — you just type the "Google"
email instead of really authenticating, and the whole invite flow still works.

> **Prototype honesty:** this is a front-end-only app with no backend, so the
> invite check and Google token decode happen in the browser. That's a solid,
> demonstrable gate, but true server-enforced security would verify tokens on a
> backend. All of that logic lives in one place — `src/lib/adminAuth.js` — for
> an easy future swap.

Demo buyer credentials are shown right on the buyer sign-in modal.

---

## What's inside

### Public storefront
- **Home** - mission-driven hero, featured products, partner-shop spotlights, how-it-works, mission band.
- **Shop** - full catalog (7 businesses, ~15 products each) with a "shop by
  business" strip, search, category & heritage filters, and sorting.
- **Businesses** (`/businesses`) - a browse-by-business directory: every
  family shop as a card with its owner, heritage, story snippet, and specialties.
- **Shop pages** (`/store/:id`) - each partner shop's own page: a "meet the
  owner" section with a real portrait and a two-paragraph founder story, the
  family behind it, its brick-and-mortar NYC location + hours, a real storefront
  photo, and everything it sells.
- **Product detail** - in-store vs. online price, add-to-cart / buy-now, related items.
- **Cart & checkout** - a demo checkout that records an order (no real payment).
- **For Businesses (Services)** - the two offerings + a transparent commission explainer + apply form.
- **Request a City** - buyers submit and upvote cities they want served next.
- **Our Mission (About)** - the problem, the goal, and our principles.

### Two services for shops
1. **List on CultureConnect** - full white-glove marketplace listing. 20% commission, no upfront cost.
2. **Cross-listing service** - publish & sync one catalog to **Etsy** and **eBay** from a single dashboard.

### Admin operations console (`/admin`)
- **Dashboard** - sales, commission, payouts, active shops, sales trend, expansion pipeline, recent orders.
- **Shop Discovery** - research/log minority-owned shops and move them through a
  prospect → contacted → onboarding → active pipeline (starting in NYC).
- **Partner Shops** - manage every shop's status and which services they use.
- **City Buildout** - buyer city requests ranked by demand, moved through the launch flow.
- **Listings** - every product; edit in-store price (online price auto-marks up), stock, and channels.
- **Cross-Listing** - toggle each product live on Etsy / eBay for enrolled shops.
- **Orders** - every order with the commission split and fulfillment status.
- **Finance & Payouts** - the business-model engine: 20% commission, per-shop
  payout ledger, and a pricing calculator built around the 120%-of-in-store rule.
- **Team & Invites** - manage who has admin access: create invite links, see
  pending invites, and revoke access.

Admins can **create new businesses**, **edit their bios and details**, **add
listings**, and **add photos** to both businesses and listings (paste a URL or
upload a file) - all from the console.

### The business model, built in
CultureConnect takes a **20% commission** on online sales. Shops are encouraged
to list at **120% of their in-person price**, which covers the commission while
they still net ~96% of their usual in-store value - with zero marketing effort.
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

### Photography & the demo shops
All product, storefront, and owner-portrait images are **real (non-AI)
photographs** sourced from openly-licensed collections (Flickr / Wikimedia
Commons) via [Openverse](https://openverse.org), each shared under a Creative
Commons or public-domain license. Every photo is credited to its photographer
and license on the **Photo credits** page (`/credits`) and in an overlay on the
image.

The seven partner shops are **illustrative demo businesses** - fictional
NYC family-owned, minority-run shops (Vietnamese, Oaxacan, Turkish, Nigerian,
Nepali/Tibetan, Filipino, and an Indian Ayurvedic apothecary) at plausible
neighborhood locations. The photos represent the *kind* of goods and storefronts
these shops sell; they are not a specific real business. The people in the owner
portraits are **real individuals** photographed in these communities — they
stand in for the fictional shopkeepers and are not the named characters. Real
onboarding would use each shop's own catalog, pricing, and photos.
