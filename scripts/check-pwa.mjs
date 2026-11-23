/*
 * Regression check for the PWA install setup.
 * Validates the built output so a broken manifest, missing icon or removed
 * service-worker registration fails the build instead of silently shipping.
 * Run with: node scripts/check-pwa.mjs
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function readPngSize(file) {
  const buf = readFileSync(file);
  if (buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// 1. Manifest must exist in the build output with the required install fields.
const manifestPath = resolve(root, 'dist/manifest.json');
if (!existsSync(manifestPath)) {
  fail('dist/manifest.json is missing from the build output');
} else {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`dist/manifest.json is not valid JSON: ${error.message}`);
  }
  if (manifest) {
    const expected = {
      name: 'Akash Exam Hub',
      short_name: 'Akash Exam Hub',
      start_url: '/',
      display: 'standalone',
    };
    for (const [key, value] of Object.entries(expected)) {
      if (manifest[key] !== value) fail(`manifest ${key} should be "${value}" (got ${JSON.stringify(manifest[key])})`);
    }
    const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
    const sizes = new Set(icons.map((icon) => icon.sizes));
    for (const size of ['192x192', '512x512']) {
      if (!sizes.has(size)) fail(`manifest is missing a ${size} icon`);
    }
    for (const icon of icons) {
      const src = String(icon.src || '').replace(/^\//, '');
      const iconPath = resolve(root, 'dist', src);
      if (!existsSync(iconPath)) {
        fail(`manifest icon ${icon.src} is not in the build output`);
        continue;
      }
      const dims = readPngSize(iconPath);
      if (!dims) {
        fail(`manifest icon ${icon.src} is not a readable PNG`);
      } else if (`${dims.width}x${dims.height}` !== icon.sizes) {
        fail(`manifest icon ${icon.src} is ${dims.width}x${dims.height} but declares ${icon.sizes}`);
      }
    }
    notes.push(`manifest: ${manifest.name} / ${manifest.short_name}, start_url ${manifest.start_url}, display ${manifest.display}, ${icons.length} icons`);
  }
}

// 2. Service worker must be published and handle fetch + lifecycle events.
const swPath = resolve(root, 'dist/sw.js');
if (!existsSync(swPath)) {
  fail('dist/sw.js is missing from the build output');
} else {
  const sw = readFileSync(swPath, 'utf8');
  for (const token of ["addEventListener('install'", "addEventListener('activate'", "addEventListener('fetch'"]) {
    if (!sw.includes(token)) fail(`sw.js is missing ${token}`);
  }
  notes.push('service worker: install, activate and fetch handlers present');
}

// 3. Both entry pages must link the manifest; each must register the worker.
for (const page of ['index.html', 'app.html']) {
  const file = resolve(root, 'dist', page);
  if (!existsSync(file)) {
    fail(`dist/${page} is missing from the build output`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!/rel="manifest"\s+href="\/manifest\.json"/.test(html)) fail(`${page} does not link /manifest.json`);
  if (!html.includes("serviceWorker.register('/sw.js')")) fail(`${page} does not register /sw.js`);
}
notes.push('pages: manifest link and service-worker registration found in index.html and app.html');

// 4. Install button + beforeinstallprompt handling on the homepage.
const homepage = existsSync(resolve(root, 'dist/index.html')) ? readFileSync(resolve(root, 'dist/index.html'), 'utf8') : '';
if (homepage) {
  if (!homepage.includes('id="install-app"')) fail('homepage has no Install button (id="install-app")');
  if (!homepage.includes("addEventListener('beforeinstallprompt'")) fail('homepage does not listen for beforeinstallprompt');
  if (!homepage.includes('.prompt()')) fail('homepage never calls the captured prompt()');
  if (!homepage.includes('userChoice')) fail('homepage does not handle the userChoice result');
  if (!homepage.includes('Add to Home Screen')) fail('homepage has no honest Add to Home Screen fallback instructions');
  if (!homepage.includes("'(display-mode: standalone)'")) fail('homepage does not detect standalone display mode');
  notes.push('homepage: Install button, prompt() call, userChoice handling and fallback copy present');
}

// 5. Clean SEO metadata: one canonical social image, topic coverage, no
// fabricated reviews, ratings or user counts anywhere in the built HTML.
if (homepage) {
  const ogImages = homepage.match(/property="og:image"/g) || [];
  if (ogImages.length !== 1) fail(`homepage declares ${ogImages.length} og:image tags (expected exactly 1)`);
  if (!/property="og:image" content="[^"]*\/og-image\.png"/.test(homepage)) fail('homepage og:image does not use the 1200x630 og-image.png');
  if (!homepage.includes('property="og:image:width" content="1200"') || !homepage.includes('property="og:image:height" content="630"')) {
    fail('homepage og:image is missing its 1200x630 dimensions');
  }
  if (!/name="twitter:image" content="[^"]*\/og-image\.png"/.test(homepage)) fail('homepage twitter:image does not use og-image.png');
  if (!/name="keywords"[^>]*MCQ practice[^>]*mock tests[^>]*AI Study Assistant/i.test(homepage)) {
    fail('homepage keywords meta does not cover MCQ practice, mock tests and the AI Study Assistant');
  }
  if (!homepage.includes('>Install App<')) fail('homepage install button is not labelled "Install App"');
  notes.push('seo: single 1200x630 og:image, matching twitter:image, topic keywords and "Install App" label');
}

const fabricated = [];
function walkHtml(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full);
    else if (entry.name.endsWith('.html')) {
      const html = readFileSync(full, 'utf8');
      for (const token of ['aggregateRating', 'ratingValue', 'reviewCount', 'ratingCount']) {
        if (html.includes(token)) fabricated.push(`${full.slice(root.length + 1)}: ${token}`);
      }
    }
  }
}
if (existsSync(resolve(root, 'dist'))) walkHtml(resolve(root, 'dist'));
if (fabricated.length) fail(`fabricated review/rating markup found: ${fabricated.join(', ')}`);
else notes.push('seo: no aggregateRating/ratingValue/reviewCount/ratingCount markup in the build output');

// 6. Generated catalogue pages carry the manifest so installs work from them too.
const classPage = resolve(root, 'dist/classes/class-10/index.html');
if (!existsSync(classPage)) {
  fail('dist/classes/class-10/index.html is missing from the build output');
} else {
  const html = readFileSync(classPage, 'utf8');
  if (!/rel="manifest"\s+href="\/manifest\.json"/.test(html)) fail('class-10 page does not link /manifest.json');
  if (!/property="og:image" content="[^"]*\/og-image\.png"/.test(html)) fail('class-10 page og:image does not use og-image.png');
  notes.push('catalogue: class page links the manifest and the 1200x630 social image');
}

if (failures.length) {
  console.error('PWA check FAILED');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('PWA check passed');
for (const note of notes) console.log(` - ${note}`);
