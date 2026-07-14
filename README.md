# Wyze Bundle Builder

A data-driven React prototype of a multi-step security-system bundle builder with a
live review panel, backed by a small hardened Express API. Rebuilt from the Figma
design with pixel-perfect desktop fidelity and full responsiveness down to a phone.


## Highlights

- **4-step accordion builder** (cameras, plan, sensors, extra protection); step 1 open on load.
- **Live review panel** grouped by category with per-line steppers, shipping, guarantee,
  financing, animated totals, savings callout, checkout and save-for-later.
- **Variant-aware quantities** — each color of a product is tracked separately, the card
  stepper is bound to the active variant, and every variant with a count > 0 shows as its
  own review line.
- **Card ↔ review sync** — the same Redux selection is the single source of truth, so any
  stepper updates everywhere and the total recalculates instantly.
- **Persistence** — "Save my system for later" stores a versioned snapshot in
  `localStorage`; on return the system is restored exactly and a toast confirms it.
- **Feedback layer** — skeleton loading, accessible toast notifications for success/error
  with clear human messages, and an app-wide error boundary.
- **Hardened API** — `helmet`, gzip `compression`, an env-driven CORS allowlist, and
  `express-rate-limit`, serving `GET /api/catalog` and `GET /api/health`.

## Tech stack

| Area     | Choice                                                      |
| -------- | ---------------------------------------------------------- |
| Frontend | React 19 + Vite, Redux Toolkit + React-Redux, CSS Modules |
| Backend  | Node + Express 5, helmet, cors, express-rate-limit, compression |
| Data     | A single JSON catalog shared by the API and the client fallback |

## Getting started (from a clean clone)

Prerequisites: Node 18+ and npm.

```bash
# 1. Install dependencies for root, client and server
npm run install:all

# 2. Start the client (Vite) and API (Express) together
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:3001 (the client proxies `/api` here in dev)

The app works even if the API is down: the client falls back to a bundled copy of the
catalog JSON, so `npm run --prefix client dev` alone also runs.

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

| Variable               | Default                                   | Purpose                          |
| ---------------------- | ----------------------------------------- | -------------------------------- |
| `PORT`                 | `3001`                                    | API port                         |
| `CORS_ORIGINS`         | `http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173` | Comma-separated allowlist |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min)                         | Rate-limit window                |
| `RATE_LIMIT_MAX`       | `100`                                     | Max requests per window per IP   |

## Project structure

```
bundle-builder/
├─ client/
│  └─ src/
│     ├─ api/            # catalog fetch + runtime schema validation
│     ├─ assets/         # product images, swatches, icons (exported from Figma)
│     ├─ components/     # Accordion, ProductCard, ReviewPanel, Toasts, Skeleton, ...
│     ├─ data/catalog.json  # offline fallback (copy of the server catalog)
│     ├─ store/          # Redux Toolkit: bundleSlice, notificationsSlice,
│     │                  #   selectors, persistence middleware, storage
│     ├─ styles/         # design tokens + global base styles
│     └─ utils/          # formatting, asset map, selection keys
└─ server/
   ├─ data/products.json # the source-of-truth catalog
   └─ src/               # app, config, routes (catalog/health), middleware
```

## Architecture notes

- **Single source of truth.** All selections live in one Redux map keyed by
  `productId::variantId`. Both the card steppers and the review-line steppers dispatch to
  the same key, so they stay in sync by construction. Derived data (per-step "N selected"
  counts, grouped review lines, totals/savings/financing) are memoized `reselect`
  selectors, and cards/lines/steppers are wrapped in `React.memo`.
- **Data-driven.** Nothing about a product is hardcoded in markup; the UI renders entirely
  from the catalog JSON, including badges, variants, "Required" items and the seeded
  initial state that reproduces the design on first paint.
- **Shared contract, both ends.** The same catalog schema is served by the API and used as
  the client fallback, with runtime validation on the client so a malformed payload can't
  crash the app.
- **Persistence via middleware.** A Redux middleware writes the snapshot on the explicit
  save action and clears it on reset, keeping side effects out of reducers.

## Decisions & tradeoffs

- **Only step 1 is fully designed in Figma.** Steps 2–4 appear collapsed in the design; the
  products for those categories are revealed by the review panel. I built those steps by
  reusing the step-1 card pattern with the plan/sensor/accessory products from the review
  panel, so every step is interactive.
- **Pricing is internally consistent.** The mockup's Cam Pan v3 *card* price ($39.98 →
  $34.98) is inconsistent with its *review* line ($57.98 → $47.98 for ×2). I treat the card
  price (which also matches the "Save 12%" badge) as the single source of truth and compute
  every total from unit × quantity. As a result the seeded total reads **$260.79 → $209.87**
  rather than the mockup's $238.81 → $187.89; the **savings ($50.92) matches exactly**. The
  financing line is computed dynamically (`total / 10`).
- **Variant labels in the review** are shown only when the same product has more than one
  variant selected, so the seeded view matches the design (no redundant labels) while
  Red-vs-Blue stays unambiguous when it matters.
- **Font.** The design uses Gilroy (commercial). The app ships with Mulish, a close free
  geometric sans, wired through a single `--font-sans` token — drop in licensed Gilroy
  woff2 files and update that token to switch.
- **JavaScript (not TypeScript)** to match the existing scaffold and keep it lean; the store
  uses `useAppSelector`/`useAppDispatch` wrappers so a TS migration would be mechanical.

## Not included

- No server-side persistence (save-for-later is client-side by design).
- Checkout is a prototype confirmation toast, as specified.
```
