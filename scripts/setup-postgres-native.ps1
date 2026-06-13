# Configures local PostgreSQL for AMMARS FRESH (native Windows install).
# Run after installing PostgreSQL 17. May require an elevated PowerShell.

$ErrorActionPreference = "Stop"
$pgRoot = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
  Sort-Object Name -Descending |
  Select-Object -First 1

if (-not $pgRoot) {
  Write-Error "PostgreSQL not found. Install with: winget install -e --id PostgreSQL.PostgreSQL.17 --source winget"
}

$psql = Join-Path $pgRoot.FullName "bin\psql.exe"
$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match "postgresql-x64" } |
  Sort-Object Name -Descending |
  Select-Object -First 1
if ($service -and $service.Status -ne "Running") {
  Write-Host "Starting $($service.Name)..."
  Start-Service $service.Name
}

$env:PGPASSWORD = "postgres"
& $psql -U postgres -h localhost -p 5432 -tc "SELECT 1 FROM pg_database WHERE datname = 'agrimarket'" | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Warning "Could not connect as postgres/postgres on port 5432. Set the postgres password during install, then re-run."
  exit 1
}

$dbExists = & $psql -U postgres -h localhost -p 5432 -tc "SELECT 1 FROM pg_database WHERE datname = 'agrimarket'"
if (-not ($dbExists -match "1")) {
  & $psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE agrimarket"
}

$envFile = Join-Path $PSScriptRoot "..\artifacts\AMMARS FRESH\.env"
$url = "postgres://postgres:postgres@localhost:5432/agrimarket"
if (Test-Path $envFile) {
  $content = Get-Content $envFile -Raw
  if ($content -match "DATABASE_URL=") {
    $content = $content -replace "DATABASE_URL=.*", "DATABASE_URL=$url"
  } else {
    $content += "`nDATABASE_URL=$url`n"
  }
  Set-Content -Path $envFile -Value $content.TrimEnd() -NoNewline
  Add-Content -Path $envFile -Value "`n"
} else {
  Copy-Item (Join-Path $PSScriptRoot "..\artifacts\AMMARS FRESH\.env.example") $envFile
  (Get-Content $envFile -Raw) -replace "DATABASE_URL=.*", "DATABASE_URL=$url" | Set-Content $envFile
}

Write-Host "Database ready. DATABASE_URL set to $url"
Write-Host "Next: pnpm db:push && pnpm run dev"
