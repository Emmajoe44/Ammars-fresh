# Build a debug APK for sideloading on a physical Android device.
# Usage:
#   .\scripts\build-apk.ps1
#   .\scripts\build-apk.ps1 -ApiBaseUrl "http://192.168.1.20:3000"

param(
  [string]$ApiBaseUrl = "http://10.0.2.2:3000"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$flutter = if ($env:FLUTTER_ROOT) { Join-Path $env:FLUTTER_ROOT "bin\flutter.bat" } else { "C:\Users\emmaj\flutter\bin\flutter.bat" }

if (-not (Test-Path $flutter)) {
  throw "Flutter not found. Install Flutter or set FLUTTER_ROOT."
}

Push-Location $root
try {
  & $flutter pub get
  & $flutter build apk --debug --dart-define=API_BASE_URL=$ApiBaseUrl
  $apk = Join-Path $root "build\app\outputs\flutter-apk\app-debug.apk"
  if (Test-Path $apk) {
    $dest = Join-Path $root "ammars-fresh-debug.apk"
    Copy-Item $apk $dest -Force
    Write-Host ""
    Write-Host "APK ready: $dest"
    Write-Host "API base URL baked in: $ApiBaseUrl"
    Write-Host "For a physical phone on Wi-Fi, rebuild with your PC LAN IP, e.g.:"
    Write-Host "  .\scripts\build-apk.ps1 -ApiBaseUrl `"http://192.168.1.20:3000`""
  }
}
finally {
  Pop-Location
}
