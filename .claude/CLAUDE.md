# finance-web-app — Claude Context

## Project overview

Personal/business financial management web app. Frontend of a three-repo platform:

| Repo | Tech | Purpose |
|------|------|---------|
| `finance-core-service` | Spring Boot 3.5 / Java 17 | Transactions, accounts, holdings, monthly reports |
| `finance-identity-service` | Spring Boot 3.5 / Java 17 | Auth, users (not yet implemented) |
| `finance-web-app` ← this repo | React 19 + Vite + TypeScript | Frontend SPA |

All three repos live under the same GitHub account.

---

## Business context

The owner runs a Portuguese sole trader company.
The app covers two types of accounts — personal finance and business accounting —
similar to how banking apps (N26, Revolut) integrate personal and business accounts in one UI.

Monthly accounting reports are produced by an internal "Motor Contábil" script (v1.0 + ajustes).
Source files are HTML reports named `relatorio_contabil_<mes><ano>.html`, one per month.

Files exist for every month of 2025 (jan → dez).
The Q4 2025 dataset (out, nov, dez) is already embedded as static TypeScript in `src/data/businessReports.ts`.

---

## Stack decisions (chosen in this session — do not change without reason)

- **React 19** + **TypeScript** (strict)
- **Vite 8** with `@tailwindcss/vite` plugin — **Tailwind v4** (no tailwind.config.js needed)
- **React Router v7** — using `createBrowserRouter` + `RouterProvider`
- **TanStack Query v5** + **Axios** — for all API calls
- **lucide-react** — for icons
- **clsx** + **tailwind-merge** — `cn()` utility in `src/lib/utils.ts`
- No shadcn/ui — hand-rolled minimal primitives to keep bundle lean

Path alias: `@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

Node version in use: **v24.15.0 / npm 11.12.1**

---

## Design language

- Inspired by the **Wealthfolio** desktop app (dark, card-based, sidebar nav)
- Default dark theme — `<html class="dark">` in `index.html`
- CSS design tokens in `src/index.css` (do not use Tailwind arbitrary values for brand colours; use the tokens):
  ```css
  --color-bg, --color-surface, --color-surface-2
  --color-border, --color-text, --color-text-muted, --color-accent
  --kpi-receita, --kpi-iva-apurado, --kpi-iva-pago
  --kpi-custos, --kpi-retiradas, --kpi-pessoais, --kpi-ignorar
  ```
- KPI colours match the reference HTML reports exactly.

---

## App structure

```
src/
  components/
    layout/
      AppLayout.tsx     Sidebar + <Outlet />
      Sidebar.tsx       Icon-only 64px sidebar with NavLink highlights
    ui/
      Card.tsx          Card / CardHeader / CardTitle
      KpiCard.tsx       Coloured value card used on Business report pages
      Badge.tsx         Classification pill (Receita, Custos Oper., etc.)
  data/
    businessReports.ts  Static Q4 2025 monthly report data + helpers
  lib/
    utils.ts            cn(), formatCurrency(), formatDate(), formatPercent()
    api/
      client.ts         Two Axios instances: coreApi (port 8080) + identityApi (port 8081)
      transactions.ts   fetchTransactions() — GET /transactions on finance-core-service
  pages/
    Dashboard.tsx       Personal: investments/net worth overview (stub)
    Holdings.tsx        Personal: portfolio composition (stub)
    Transactions.tsx    Personal: live transactions table from core service
    Business.tsx        Business: monthly report cards grid (only months with data)
    BusinessReportDetail.tsx  Business: KPI cards + transactions table for one month
  types/
    transaction.ts      Transaction, Classification, TransactionCategory
    report.ts           MonthlyReport, MonthlyReportSummary, MonthlyKpis
  router.tsx            Route definitions
  main.tsx              QueryClientProvider + RouterProvider bootstrap
  index.css             Tailwind v4 import + CSS token definitions
```

---

## Routes

| Path | Component | Notes |
|------|-----------|-------|
| `/` | → `/dashboard` | redirect |
| `/dashboard` | Dashboard | Personal overview |
| `/holdings` | Holdings | Portfolio composition |
| `/transactions` | Transactions | Live from finance-core-service |
| `/business` | Business | Business reports landing — only shows months with data |
| `/business/:year/:month` | BusinessReportDetail | Monthly KPI + transaction table |
| `/reports*` | → `/business*` | Legacy redirect |

---

## API contracts

Base URLs read from Vite env vars (see `.env.example`):
- `VITE_CORE_API_URL` → default `http://localhost:8080`
- `VITE_IDENTITY_API_URL` → default `http://localhost:8081`

### finance-core-service endpoints consumed

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/transactions` | ✅ stub implemented | Returns `[{id, description, amount}]` — frontend tolerates missing fields |
| GET | `/reports/monthly?year=YYYY` | ⏳ not yet | Future: replace static data in businessReports.ts |
| GET | `/reports/monthly/{year}/{month}` | ⏳ not yet | Shape: `MonthlyReport` type in `src/types/report.ts` |

### finance-identity-service

Not yet integrated. Auth is stubbed: `Authorization: Bearer <token>` header is added if
`localStorage["auth.token"]` is set. Login flow is a future task.

---

## Business report data model

KPI categories (used in `MonthlyKpis` and as `Classification` on transactions):

| Classification | Colour token | Business meaning |
|---------------|-------------|-----------------|
| Receita | `--kpi-receita` (green) | Revenue from clients |
| IVA Apurado | `--kpi-iva-apurado` (orange) | VAT accrued |
| IVA Pago | `--kpi-iva-pago` (yellow) | VAT actually paid to tax authority |
| Custos Oper. | `--kpi-custos` (red) | Operating costs |
| Retiradas | `--kpi-retiradas` (blue) | Owner withdrawals / salary |
| Gastos Pessoais | `--kpi-pessoais` (purple) | Personal expenses |
| IGNORAR | `--kpi-ignorar` (grey) | Internal transfers to ignore |

---

## What is done

- [x] Full Vite + React + TS scaffold
- [x] Tailwind v4 dark theme with CSS tokens
- [x] Sidebar layout + routing
- [x] Dashboard, Holdings, Transactions, Business pages
- [x] Business area with Q4 2025 static data (Oct, Nov, Dec)
- [x] Business monthly detail with KPI cards + sortable transaction table
- [x] Axios clients wired to both backends
- [x] `develop` branch pushed to GitHub

## What remains

- [ ] Implement real data on Dashboard (accounts, total value, performance chart)
- [ ] Implement Holdings charts (currency / accounts / classes / regions)
- [ ] Add remaining 2025 months (Jan–Sep) to businessReports.ts once needed
- [ ] Implement `GET /reports/monthly` on finance-core-service + swap static data
- [ ] Add Login page + auth flow with finance-identity-service
- [ ] Wire up `GET /accounts` and `GET /holdings` endpoints (not yet on backend)
- [ ] Add a personal/business context toggle at app level if needed
- [ ] Set up CI/CD (GitHub Actions)

---

## Git workflow

- `main` — stable, deployable
- `develop` — active development branch (always branch off here)
- Feature branches: `feature/<name>` off `develop`

All commits use the `feat:` / `fix:` / `refactor:` conventional prefix.
