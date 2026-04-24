$ErrorActionPreference = 'Continue'
$store = 'weird-artist-1318.myshopify.com'
$theme = '135935230037'
$files = @(
  'locales/en.default.json','locales/uk.json','locales/de.json','locales/fr.json','locales/it.json',
  'locales/pl.json','locales/cs.json','locales/sk.json','locales/es.json','locales/ru.json',
  'assets/wa-extras.css',
  'sections/wa-footer.liquid',
  'sections/wa-page-router.liquid',
  'snippets/wa-page-promptgrid.liquid'
)
foreach ($f in $files) {
  Write-Host "Pushing $f ..."
  $out = & shopify theme push --store $store --theme $theme --nodelete --only $f 2>&1 | Out-String
  if ($out -match 'successfully') { Write-Host '  OK' } else { Write-Host '  FAIL'; Write-Host $out }
}
Write-Host 'Done.'
