# Creates a GCS bucket + service account for AMMARS FRESH uploads and updates artifacts/ammars-fresh/.env
#
# Prerequisites:
#   winget install Google.CloudSDK
#   gcloud auth login
#   gcloud auth application-default login   (optional, for local testing)
#
# Usage:
#   .\scripts\setup-gcs.ps1
#   .\scripts\setup-gcs.ps1 -ProjectId my-project -BucketName agrimarket-uploads

param(
  [string]$ProjectId = "",
  [string]$BucketName = "",
  [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$appDir = Join-Path $repoRoot "artifacts\ammars-fresh"
$gcpDir = Join-Path $appDir "gcp"
$keyFile = Join-Path $gcpDir "service-account.json"
$envFile = Join-Path $appDir ".env"
$saName = "agrimarket-storage"
$saId = "$saName@$ProjectId.iam.gserviceaccount.com"

function Require-Gcloud {
  $gcloud = Get-Command gcloud -ErrorAction SilentlyContinue
  if (-not $gcloud) {
    Write-Host ""
    Write-Host "Google Cloud SDK (gcloud) is not installed." -ForegroundColor Red
    Write-Host "Install:  winget install Google.CloudSDK" -ForegroundColor Yellow
    Write-Host "Then run:  gcloud auth login" -ForegroundColor Yellow
    exit 1
  }
}

function Set-EnvVar {
  param([string]$Path, [string]$Key, [string]$Value)
  $lines = @()
  if (Test-Path $Path) {
    $lines = Get-Content $Path
  }
  $pattern = "^\s*$([regex]::Escape($Key))\s*="
  $newLine = "$Key=$Value"
  $found = $false
  $out = foreach ($line in $lines) {
    if ($line -match $pattern) {
      $found = $true
      $newLine
    } else {
      $line
    }
  }
  if (-not $found) {
    $out = @($out) + $newLine
  }
  Set-Content -Path $Path -Value $out -Encoding utf8
}

Require-Gcloud

if (-not $ProjectId) {
  $ProjectId = (gcloud config get-value project 2>$null).Trim()
  if (-not $ProjectId -or $ProjectId -eq "(unset)") {
    $ProjectId = Read-Host "GCP project ID"
  }
}

if (-not $BucketName) {
  $suffix = Get-Random -Maximum 999999
  $BucketName = "agrimarket-uploads-$suffix"
  $custom = Read-Host "GCS bucket name [$BucketName]"
  if ($custom) { $BucketName = $custom }
}

$saId = "$saName@$ProjectId.iam.gserviceaccount.com"

Write-Host ""
Write-Host "Project:  $ProjectId"
Write-Host "Bucket:   $BucketName"
Write-Host "Region:   $Region"
Write-Host ""

gcloud config set project $ProjectId | Out-Null

$bucketExists = gsutil ls -b "gs://$BucketName" 2>$null
if (-not $bucketExists) {
  Write-Host "Creating bucket gs://$BucketName ..."
  gsutil mb -p $ProjectId -l $Region "gs://$BucketName"
} else {
  Write-Host "Bucket gs://$BucketName already exists."
}

$saExists = gcloud iam service-accounts describe $saId 2>$null
if (-not $saExists) {
  Write-Host "Creating service account $saName ..."
  gcloud iam service-accounts create $saName `
    --display-name="AgriMarket object storage"
} else {
  Write-Host "Service account $saName already exists."
}

Write-Host "Granting objectAdmin on bucket ..."
gsutil iam ch "serviceAccount:${saId}:roles/storage.objectAdmin" "gs://$BucketName"

New-Item -ItemType Directory -Force -Path $gcpDir | Out-Null
Write-Host "Creating service account key at gcp/service-account.json ..."
gcloud iam service-accounts keys create $keyFile --iam-account=$saId

$privateDir = "/$BucketName/private"
$publicDir = "/$BucketName/public"

if (-not (Test-Path $envFile)) {
  Copy-Item (Join-Path $appDir ".env.example") $envFile
}

Set-EnvVar -Path $envFile -Key "USE_LOCAL_OBJECT_STORAGE" -Value "false"
Set-EnvVar -Path $envFile -Key "GCP_PROJECT_ID" -Value $ProjectId
Set-EnvVar -Path $envFile -Key "GOOGLE_APPLICATION_CREDENTIALS" -Value "./gcp/service-account.json"
Set-EnvVar -Path $envFile -Key "PRIVATE_OBJECT_DIR" -Value $privateDir
Set-EnvVar -Path $envFile -Key "PUBLIC_OBJECT_SEARCH_PATHS" -Value $publicDir

Write-Host ""
Write-Host "GCS setup complete." -ForegroundColor Green
Write-Host ""
Write-Host "Updated $envFile with:"
Write-Host "  USE_LOCAL_OBJECT_STORAGE=false"
Write-Host "  GCP_PROJECT_ID=$ProjectId"
Write-Host "  GOOGLE_APPLICATION_CREDENTIALS=./gcp/service-account.json"
Write-Host "  PRIVATE_OBJECT_DIR=$privateDir"
Write-Host "  PUBLIC_OBJECT_SEARCH_PATHS=$publicDir"
Write-Host ""
Write-Host "For production, also set APP_URL to your public HTTPS origin, e.g.:"
Write-Host "  APP_URL=https://your-domain.com"
Write-Host ""
Write-Host "Restart the dev server:  pnpm run dev"
Write-Host ""
Write-Host "Never commit gcp/service-account.json — it is gitignored."
