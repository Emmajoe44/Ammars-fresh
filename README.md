# AMMARS FRESH

Digital data-driven B2B agri-tech platform connecting South Sudan farmers with urban retailers in Juba.

## Brand & project updates

- `config/brand.json` — live branding (name, currencies, mission, emails)
- `config/project-updates.json` — merged from `rob ammars fresh.docx`
- `config/planned-features.json` — features from the spec vs. what is already built
- `pnpm run apply:updates` — sync branding to web, mobile, and OpenAPI

## Run & Operate

- `pnpm install` — install workspace dependencies
- `pnpm run dev` — Next.js web app (`artifacts/AMMARS FRESH`)
- `pnpm run dev:mobile` — Flutter app (`artifacts/AMMARS FRESH-mobile`)
- `pnpm run build:mobile-apk` — Android debug APK
- `pnpm run apply:updates` — apply `config/project-updates.json`
- `pnpm --filter @workspace/ammars-fresh run setup:gcs` — GCS object storage setup
- Required env: `DATABASE_URL` in `artifacts/AMMARS FRESH/.env`

### Database (PostgreSQL)

Login and API routes need a running Postgres instance.

**Option A — Docker** (port 5433, matches default `.env`):

```bash
pnpm db:up
pnpm db:push
```

**Option B — Native Windows** (port 5432):

```powershell
winget install -e --id PostgreSQL.PostgreSQL.17 --source winget
powershell -ExecutionPolicy Bypass -File scripts/setup-postgres-native.ps1
pnpm db:push
```

Check connectivity: `pnpm db:check`

## Artifact folders

| Folder | Purpose |
|--------|---------|
| `artifacts/AMMARS FRESH` | Next.js web + API |
| `artifacts/AMMARS FRESH-mobile` | Flutter Android app |

> If `artifacts/agri-market` still exists (legacy copy), stop any dev server using it and delete that folder manually.

## Currencies

Supported: **USD**, **SSP**, **USG** (USG uses provisional SSP-based display until dedicated rates are added).

## Demo accounts

| Role | Phone | Password |
|------|-------|----------|
| Admin | +211900000001 | admin123 |
| Farmer (Akuei Deng) | +211900000002 | farmer123 |
| Retailer (Mary Wani) | +211900000004 | retailer123 |
