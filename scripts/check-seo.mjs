/**
 * Technical SEO check for the built site (run after `npm run build`).
 * Validates the exact homepage title/description, canonical URL, Open Graph and
 * Twitter metadata, WebSite + Organization JSON-LD, robots.txt, sitemap.xml,
 * homepage indexability, heading structure and the referenced favicon assets.
 *
 * Usage: node scripts/check-seo.mjs
 */
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const SITE = 'https://akashexam-hublive.netlify.app';
const TITLE = 'Akash Exam Hub | CBSE Learning & Exam Preparation - Platform';
const DESCRIPTION =
  'Your Complete CBSE Learning Platform for Classes 6–12. Access Study Materials, NCERT Resources, MCQ Practice, Mock Tests and AI-Powered Learning Support in Hindi & English.';

const dist = resolve('dist');
const failures = [];
const passes = [];
const check = (label, condition, detail = '') => {
  if (condition) passes.push(label);
  else failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
};

const unescape = (value) =>
  value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');

const metaContent = (html, attr, name) => {
  const re = new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, 'i');
  const match = html.match(re);
  return match ? unescape(match[1]) : null;
};

const html = await readFile(resolve(dist, 'index.html'), 'utf8');

// --- Title & description -----------------------------------------------------
const title = unescape((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '');
check('Homepage <title> matches the requested string exactly', title === TITLE, `got: ${title}`);
check('Homepage meta description matches the requested string exactly', metaContent(html, 'name', 'description') === DESCRIPTION);

// --- Canonical & indexability ------------------------------------------------
const canonical = (html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i) || [])[1];
check('Canonical URL is the production homepage', canonical === `${SITE}/`, `got: ${canonical}`);
check('Homepage is indexable (no noindex)', !/content="[^"]*noindex/i.test(html));
check('Robots meta allows indexing and following', /content="index, follow/i.test(html));

// --- Brand metadata ----------------------------------------------------------
check('og:site_name is "Akash Exam Hub"', metaContent(html, 'property', 'og:site_name') === 'Akash Exam Hub');
check('og:url is the canonical homepage', metaContent(html, 'property', 'og:url') === `${SITE}/`);
check('og:title is set', metaContent(html, 'property', 'og:title') === TITLE);
check('og:description is set', metaContent(html, 'property', 'og:description') === DESCRIPTION);
const ogImages = [...html.matchAll(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/gi)].map((m) => m[1]);
check('og:image uses absolute production URLs', ogImages.length > 0 && ogImages.every((url) => url.startsWith(`${SITE}/`)), ogImages.join(', '));
check('og:type is present', Boolean(metaContent(html, 'property', 'og:type')));
check('twitter:card is present', Boolean(metaContent(html, 'name', 'twitter:card')));
check('twitter:title is set', metaContent(html, 'name', 'twitter:title') === TITLE);
check('twitter:description is set', metaContent(html, 'name', 'twitter:description') === DESCRIPTION);
const twitterImage = metaContent(html, 'name', 'twitter:image');
check('twitter:image uses an absolute production URL', Boolean(twitterImage && twitterImage.startsWith(`${SITE}/`)), String(twitterImage));

// --- JSON-LD -----------------------------------------------------------------
const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
const parsed = [];
for (const block of blocks) {
  try {
    parsed.push(JSON.parse(block));
  } catch (error) {
    failures.push(`JSON-LD block does not parse: ${error.message}`);
  }
}
check('All JSON-LD blocks parse as valid JSON', parsed.length === blocks.length && blocks.length > 0, `${blocks.length} block(s)`);

const byType = (type) => parsed.find((entry) => entry['@type'] === type);
const website = byType('WebSite');
const organization = byType('Organization');

check('WebSite JSON-LD is present', Boolean(website));
if (website) {
  check('WebSite.name is "Akash Exam Hub"', website.name === 'Akash Exam Hub', String(website.name));
  check('WebSite.alternateName is "Akash Exam Hub CBSE Learning"', website.alternateName === 'Akash Exam Hub CBSE Learning', String(website.alternateName));
  check('WebSite.url is the canonical homepage', website.url === `${SITE}/`, String(website.url));
  check('WebSite has a stable @id', typeof website['@id'] === 'string' && website['@id'].startsWith(`${SITE}/#`));
  check('WebSite declares inLanguage', Array.isArray(website.inLanguage) && website.inLanguage.length > 0);
  check('WebSite publisher references the Organization', website.publisher && website.publisher['@id'] === `${SITE}/#organization`);
}

check('Organization JSON-LD is present', Boolean(organization));
if (organization) {
  check('Organization.name is "Akash Exam Hub"', organization.name === 'Akash Exam Hub', String(organization.name));
  check('Organization.alternateName is set', organization.alternateName === 'Akash Exam Hub CBSE Learning');
  check('Organization.url is the canonical homepage', organization.url === `${SITE}/`);
  const logoUrl = organization.logo && (organization.logo.url || organization.logo.contentUrl);
  check('Organization.logo points at the existing production logo', logoUrl === `${SITE}/notes-logo.png`, String(logoUrl));
  check('Organization.logo has dimensions', Boolean(organization.logo && organization.logo.width && organization.logo.height));
}

const brandStrings = parsed
  .flatMap((entry) => [entry.name, entry.alternateName, entry.brand && entry.brand.name, entry['@type']])
  .filter(Boolean)
  .map(String);
check('No schema brand field is named after the hosting provider', brandStrings.every((value) => !/netlify/i.test(value)), brandStrings.join(' | '));

// --- Favicon references ------------------------------------------------------
const iconHrefs = [...html.matchAll(/<link[^>]*rel="(?:icon|shortcut icon|apple-touch-icon)"[^>]*href="([^"]+)"/gi)].map((m) => m[1]);
check('Favicon and touch-icon references are present', iconHrefs.length >= 3, iconHrefs.join(', '));
for (const href of new Set(iconHrefs)) {
  try {
    await access(resolve(dist, href.replace(/^\//, '')));
    passes.push(`Referenced asset exists in build output: ${href}`);
  } catch {
    failures.push(`Referenced favicon asset is missing from the build: ${href}`);
  }
}

// --- Heading structure -------------------------------------------------------
const h1s = [...html.matchAll(/<h1[\s>]/gi)].length;
const h2s = [...html.matchAll(/<h2[\s>]/gi)].length;
check('Homepage has exactly one <h1>', h1s === 1, `found ${h1s}`);
check('Homepage has section-level <h2> headings', h2s >= 2, `found ${h2s}`);

// --- robots.txt --------------------------------------------------------------
const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8');
check('robots.txt allows crawling', /User-agent:\s*\*/i.test(robots) && /Allow:\s*\//i.test(robots));
check('robots.txt does not block the homepage', !/Disallow:\s*\/\s*$/im.test(robots));
check('robots.txt declares the sitemap', robots.includes(`Sitemap: ${SITE}/sitemap.xml`));

// --- sitemap.xml -------------------------------------------------------------
const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
check('sitemap.xml starts with an XML declaration', sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
check('sitemap.xml uses the sitemaps.org schema', sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
check('sitemap.xml lists the homepage', locs.includes(`${SITE}/`), locs.join(', '));
for (const level of [6, 7, 8, 9, 10, 11, 12]) {
  check(`sitemap.xml lists Class ${level}`, locs.includes(`${SITE}/classes/class-${level}/`));
}
check('sitemap.xml URLs are all absolute production URLs', locs.every((loc) => loc.startsWith(`${SITE}/`)));
check('sitemap.xml does not advertise the private portal', !locs.some((loc) => /\/app\/?$/.test(loc)));
const openTags = (sitemap.match(/<url>/g) || []).length;
const closeTags = (sitemap.match(/<\/url>/g) || []).length;
check('sitemap.xml <url> elements are balanced', openTags === closeTags && openTags === locs.length, `${openTags}/${closeTags}/${locs.length}`);

// --- Class page metadata -----------------------------------------------------
const classHtml = await readFile(resolve(dist, 'classes/class-10/index.html'), 'utf8');
const classCanonical = (classHtml.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i) || [])[1];
check('Class page canonical is absolute', classCanonical === `${SITE}/classes/class-10/`, String(classCanonical));
check('Class page references the site brand', classHtml.includes('Akash Exam Hub'));

// --- Private portal stays out of the index ----------------------------------
const appHtml = await readFile(resolve(dist, 'app.html'), 'utf8');
check('Student portal keeps noindex', /content="noindex/i.test(appHtml));

console.log(`\nSEO checks — ${passes.length} passed, ${failures.length} failed`);
if (failures.length) {
  console.error('\nFailures:');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
console.log('All homepage branding, structured data and crawlability checks passed.');
