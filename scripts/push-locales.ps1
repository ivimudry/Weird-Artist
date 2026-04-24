# Push each locale file individually (push --only locales/ skips en.default.json for some reason)
$ErrorActionPreference = 'Continue'
$locales = @('en.default','uk','de','fr','it','pl','cs','sk','es','ru')
foreach ($l in $locales) {
  $file = "locales/$l.json"
  if (-not (Test-Path $file)) { Write-Host "SKIP $l (missing)" -ForegroundColor Yellow; continue }
  Write-Host "Pushing $file ..." -ForegroundColor Cyan
  $out = & shopify theme push --store weird-artist-1318.myshopify.com --theme 135935230037 --only $file --nodelete 2>&1 | Out-String
  if ($out -match 'success') { Write-Host "  OK" -ForegroundColor Green }
  else { Write-Host "  FAIL"; Write-Host $out }
}
Write-Host "Done."
