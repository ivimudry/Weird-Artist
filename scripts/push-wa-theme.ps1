$ErrorActionPreference = 'Continue'
$store = 'weird-artist-1318.myshopify.com'
$theme = '135935230037'

$files = @(
  'assets/wa-extras.css',
  'assets/wa-custom-select.js',
  'assets/weird-artist-custom.css',
  'snippets/stylesheets.liquid',
  'snippets/wa-page-tools.liquid',
  'snippets/wa-page-crm.liquid',
  'snippets/wa-page-finance.liquid',
  'sections/wa-header.liquid',
  'sections/wa-footer.liquid',
  'sections/wa-categories.liquid',
  'sections/wa-page-router.liquid',
  'sections/wa-404.liquid',
  'templates/404.json'
)

foreach ($f in $files) {
  Write-Host "Pushing $f ..."
  $out = & shopify theme push --store $store --theme $theme --nodelete --only $f 2>&1 | Out-String
  if ($out -match 'successfully') {
    Write-Host "  OK"
  } else {
    Write-Host "  FAIL"
    Write-Host $out
  }
}
Write-Host "Done."
