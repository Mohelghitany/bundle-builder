# Wyze Bundle Builder

A data-driven React prototype of a multi-step security-system bundle builder with a
live review panel, backed by a small hardened Express API. Rebuilt from the Figma
design with desktop fidelity and full responsiveness down to a phone.

## Highlights

- **4-step accordion builder** (cameras, plan, sensors, extra protection); step 1 open on load.
- **Empty first visit** — nothing is pre-selected. A configuration restores only from a
  saved `localStorage` snapshot (“Save my system for later”).
- **Live review panel** grouped by category with per-line steppers, conditional shipping,
  guarantee, financing, totals, savings callout, checkout and save-for-later.
- **Variant-aware quantities** — each color of a product is tracked separately; the card
  stepper is bound to the active variant; every variant with qty > 0 is its own review line.
- **Card ↔ review sync** — one Redux map is the single source of truth, so steppers stay
  in sync and totals recalculate instantly.
- **Learn More** — product detail modal with summary, highlights, and specs from the catalog.
- **Conditional required items** — Sense Hub becomes Required only when a Motion Sensor is
  selected; checkout blocks with a clear error until Hub is added.
- **Shipping** — Fast Shipping is **$5.99** under a **$50** product subtotal, and **FREE**
  at/above $50 (same rule on client totals and `POST /api/checkout`).
- **Feedback layer** — skeleton loading, accessible toasts (success/error), error boundary.
- **Hardened API** — `helmet`, gzip, CORS allowlist, rate limiting; endpoints:
  `GET /api/catalog`, `GET /api/health`, `POST /api/checkout`.

## Tech stack

| Area     | Choice                                                        |
| -------- | ------------------------------------------------------------- |
| Frontend | React 19 + Vite, Redux Toolkit + React-Redux, CSS Modules     |
| Backend  | Node + Express 5, helmet, cors, express-rate-limit, compression |
| Data     | JSON catalog served by the API, with a client offline fallback |

## Getting started (from a clean clone)

Prerequisites: Node 18+ and npm.

```bash
# 1. Install dependencies for root, client and server
npm run install:all

# 2. Start the client (Vite) and API (Express) together
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:3001 (Vite proxies `/api` here in dev)

The app still runs if the API is down: the client falls back to a bundled copy of the
catalog so `npm run --prefix client dev` alone works for UI work.

### Other scripts

```bash
npm run build     # production build of the client (outputs client/dist)
npm run start     # run the API only (node)
npm run client    # client dev server only
npm run server    # API dev server only (nodemon)
```

### Configuration

Copy `client/.env.example` if you want to point the client at a deployed API
(`VITE_API_URL`). The server reads these optional env vars (sensible defaults provided):

| Variable               | Default                                                                 | Purpose                        |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| `PORT`                 | `3001`                                                                  | API port                       |
| `CORS_ORIGINS`         | `http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173`   | Comma-separated allowlist      |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min)                                                       | Rate-limit window              |
| `RATE_LIMIT_MAX`       | `100`                                                                   | Max requests per window per IP |

## Project structure

```
bundle-builder/
├─ client/
│  └─ src/
│     ├─ api/            # catalog fetch, checkout POST, runtime schema validation
│     ├─ assets/         # product images, swatches, icons
│     ├─ components/     # Accordion, ProductCard, ReviewPanel, ProductDetails, Toasts, ...
│     ├─ data/catalog.json  # offline fallback (mirrors server catalog)
│     ├─ store/          # Redux Toolkit: bundleSlice, notifications, selectors, persistence
│     ├─ styles/         # design tokens + global base styles
│     └─ utils/          # formatting, assets, selection keys, requiredWhen helpers
└─ server/
   ├─ data/products.json # catalog source of truth
   └─ src/               # app, config, routes, middleware, checkout service
```

## API

| Method | Path            | Purpose |
| ------ | --------------- | ------- |
| `GET`  | `/api/health`   | Liveness |
| `GET`  | `/api/catalog`  | Full product catalog |
| `POST` | `/api/checkout` | Validate selections + required rules + shipping; confirm order |

Checkout body:

```json
{ "selections": { "cam-v4::white": 1, "motion-sensor::default": 2 } }
```

Notable responses:

- `400` empty / invalid payload
- `422` missing required items (e.g. Motion Sensor selected without Sense Hub)
- `200` `{ ok, orderId, items, subtotal, shipping, total }`

## Architecture notes

- **Single source of truth.** Selections are keyed `productId::variantId`. Card and review
  steppers dispatch the same actions, so sync is structural, not bolted on.
- **Data-driven UI.** Products render from JSON (badges, variants, details, `requiredWhen`).
- **Shared contract.** The same catalog shape is served by the API and used as the client
  fallback, with runtime validation so a bad payload cannot crash the app.
- **Persistence via middleware.** “Save my system for later” writes a versioned
  `localStorage` snapshot; load hydrates only when that snapshot exists and is valid.

## Decisions & tradeoffs

- **Only step 1 is fully designed in Figma.** Steps 2–4 appear collapsed in the design;
  their products show up in the review panel. Those steps reuse the same card pattern so
  every step is interactive.
- **First load is empty on purpose.** The take-home demo seed was removed so shoppers start
  clean; saved systems restore from `localStorage` only.
- **Pricing is unit × quantity.** Catalog card prices are the single source of truth for
  line totals. Financing is `grandTotal / 10` (including shipping when charged).
- **Shipping threshold.** Configurable via `meta.shipping.freeAbove` (default `50`) and
  `meta.shipping.price` (default `5.99`), applied in both UI selectors and checkout.
- **Variant color images.** Floodlight / Battery include full color photos; Cam v4 / Pan
  only have small swatch assets for non-default colors, so White keeps the high-res hero.
- **Font.** Design uses Gilroy (commercial). The app ships Mulish behind `--font-sans`.
- **JavaScript (not TypeScript)** to match the scaffold and keep the take-home lean;
  `useAppDispatch` / `useAppSelector` wrappers keep a future TS migration mechanical.
- **Duplicated domain helpers.** Client `utils/required.js` and server checkout validation
  intentionally mirror the same rules so offline UI still blocks bad checkout; a shared
  package would be the natural next refactor.

## Out of scope

- No payment gateway (checkout confirms via API + success toast).
- No server-side save-for-later (client `localStorage` by design).
- No automated test suite in this deliverable (manual verification + production build).
