# finance-web-app

Frontend for the personal/business finance platform. Talks to the
companion Spring Boot services:

- [`finance-core-service`](https://github.com/cezarfbf/finance-core-service)
  — transactions, accounts, holdings, monthly reports
- [`finance-identity-service`](https://github.com/cezarfbf/finance-identity-service)
  — auth, users (wired but not yet used)

## Stack

- **React 19** + **TypeScript** with **Vite**
- **TailwindCSS v4** (via `@tailwindcss/vite`)
- **React Router v7** for routing
- **TanStack Query v5** + **Axios** for data fetching
- **lucide-react** for icons

## Getting started

```bash
npm install
cp .env.example .env       # adjust if your services run on different ports
npm run dev                # http://localhost:5173
```

## Available scripts

| Script         | Purpose                       |
| -------------- | ----------------------------- |
| `npm run dev`  | Start the Vite dev server     |
| `npm run build`| Type-check and build for prod |
| `npm run lint` | Run ESLint                    |
| `npm run preview` | Serve the production build |

## Project layout

```
src/
  components/
    layout/      Sidebar + AppLayout
    ui/          Card, KpiCard, Badge — small primitives
  lib/
    api/         Axios clients (core + identity) and endpoint wrappers
    utils.ts     cn(), currency / date / percent formatters
  pages/
    Dashboard.tsx              Investments / Net Worth overview (personal)
    Holdings.tsx               Portfolio composition (personal)
    Transactions.tsx           Live GET /transactions from finance-core-service
    Business.tsx               Business area landing — monthly result cards
    BusinessReportDetail.tsx   Monthly KPI cards + transaction table (mirrors relatorio_contabil_*.html)
  data/
    businessReports.ts         Static Q4 2025 dataset (placeholder until backend lands)
  types/         Transaction, Classification, MonthlyReport
  router.tsx     Route table
  main.tsx       App bootstrap (QueryClient + RouterProvider)
```

## Backend contracts

The frontend expects the following endpoints from `finance-core-service`:

| Method | Path                              | Status     |
| ------ | --------------------------------- | ---------- |
| GET    | `/transactions`                   | implemented (stub) |
| GET    | `/reports/monthly?year=YYYY`      | not yet    |
| GET    | `/reports/monthly/{year}/{month}` | not yet    |

The shape consumed by the UI is defined in `src/types/`.

The **Business** area is currently driven by static data in
`src/data/businessReports.ts`, ported from the
`relatorio_contabil_<mes>2025.html` files (Q4 2025). When the backend
exposes the monthly report endpoint, swap the data source — types are
already aligned.

## Authentication

Auth is stubbed: an `Authorization: Bearer <token>` header is added if
`localStorage["auth.token"]` is present. Login wiring against
`finance-identity-service` will be added in a follow-up.
