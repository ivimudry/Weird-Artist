const fs = require('fs');
const path = process.argv[2] || 'locales/en.default.json';
const raw = fs.readFileSync(path, 'utf8');
console.log('FILE:', path);
console.log('size:', raw.length);
console.log('has "wa":', raw.indexOf('"wa":') > -1);
const stripped = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^(\s*)\/\/.*/gm, '');
try {
  const j = JSON.parse(stripped);
  console.log('parses OK, top keys count:', Object.keys(j).length);
  if (j.wa) {
    console.log('wa subkeys:', Object.keys(j.wa).join(','));
    console.log('wa.tagline:', j.wa.tagline);
    console.log('wa.footer.products:', j.wa.footer && j.wa.footer.products);
    console.log('wa.nav.tools:', j.wa.nav && j.wa.nav.tools);
  } else {
    console.log('NO wa namespace');
  }
} catch (e) {
  console.log('PARSE FAIL:', e.message);
}
