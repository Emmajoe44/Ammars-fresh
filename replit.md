# AgriMarket South Sudan

A full-stack agricultural marketplace connecting farmers, retailers, and logistics admins across South Sudan — from farm to market.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/agri-market run dev` — run the frontend (port 19061)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Wouter (routing) + TanStack Query + shadcn/ui + Framer Motion + Recharts
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — database schema (users, categories, products, orders, trucks, pricing)
- `lib/api-zod/src/generated/api.ts` — Zod validation schemas (generated, do not edit)
- `lib/api-client-react/src/generated/api.ts` — React Query hooks (generated, do not edit)
- `artifacts/api-server/src/routes/` — all Express routes
- `artifacts/api-server/src/lib/auth.ts` — auth middleware + token parsing
- `artifacts/agri-market/src/pages/` — all frontend pages (retailer/, farmer/, admin/)
- `artifacts/agri-market/src/contexts/` — AuthContext, CartContext, LangContext

## Architecture decisions

- Contract-first: OpenAPI spec drives both server Zod validation and client React Query hooks via Orval codegen. Never hand-write API types.
- Simple token auth: `agritoken.<base64(json)>` pattern — stateless, no sessions, fast verification. SHA-256 + salt password hashing.
- Role-based routing: Three distinct portals (Retailer, Farmer, Admin) enforced both in Express middleware and React route guards.
- Cart in memory: Cart state lives in CartContext (React) — not persisted — to avoid complexity. Placed orders persist in DB.
- Orders as JSON: Order items stored as JSONB array in the orders table for flexibility and query simplicity.
- Language in state: EN/AR language toggle changes document dir="rtl" globally; nameAr fields used throughout.

## Product

- **Retailer portal**: Browse produce by category, search, add to cart, place orders, track delivery status with step-by-step tracker
- **Farmer portal**: List products (EN + AR), toggle availability, view sales stats and top-selling products chart
- **Admin portal**: Command center with stats, demand analytics charts (line/bar/pie via Recharts), order management with truck assignment, GPS fleet overview, user management, pricing rules
- **Multi-language**: English / Arabic (RTL) toggle persisted in localStorage
- **Multi-currency**: SSP / USD display toggle throughout

## Demo accounts

| Role | Phone | Password |
|------|-------|----------|
| Admin | +211900000001 | admin123 |
| Farmer (Akuei Deng) | +211900000002 | farmer123 |
| Farmer (Amara Lado) | +211900000003 | farmer123 |
| Retailer (Mary Wani) | +211900000004 | retailer123 |
| Retailer (James Lual) | +211900000005 | retailer123 |

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing openapi.yaml before writing frontend code
- Categories were seeded twice (IDs 1-6 are the real ones; 7-12 were removed). Products use category IDs 1-6.
- `ORDER BY` alias names don't work in PostgreSQL raw SQL — use the full expression
- The API server must be restarted after code changes (workflow auto-rebuilds on restart)
- `pnpm run dev` at root does NOT exist — always target individual artifacts

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
