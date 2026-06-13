# Run the Flutter app on a connected device or emulator.
# Usage:
#   .\scripts\dev-mobile.ps1
#   .\scripts\dev-mobile.ps1 -ApiBaseUrl "http://192.168.1.94:3000"

param(
  [string]$ApiBaseUrl = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$flutter = if ($env:FLUTTER_ROOT) { Join-Path $env:FLUTTER_ROOT "bin\flutter.bat" } else { "C:\Users\emmaj\flutter\bin\flutter.bat" }

if (-not (Test-Path $flutter)) {
  throw "Flutter not found at $flutter. Install Flutter or set FLUTTER_ROOT."
}

Push-Location $root
try {
  & $flutter pub get
  if ($ApiBaseUrl) {
    & $flutter run --dart-define=API_BASE_URL=$ApiBaseUrl
  } else {
    & $flutter run
  }
}
finally {
  Pop-Location
}
