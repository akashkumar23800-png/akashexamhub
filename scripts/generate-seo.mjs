import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Canonical production origin. Netlify's URL env var wins on deploy, but the
// production domain is the default so local builds produce identical absolute URLs.
const PRODUCTION_URL = 'https://akashexam-hublive.netlify.app';
const siteUrl = (process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.SITE_URL || PRODUCTION_URL).replace(/\/$/, '');
const out = resolve('dist');
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const classes = [6, 7, 8, 9, 10, 11, 12];
const commonSubjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'];
const seniorSubjects = ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science'];
const HOME_TITLE = 'Akash Exam Hub | CBSE Learning & Exam Preparation - Platform';
const HOME_DESCRIPTION = 'Your Complete CBSE Learning Platform for Classes 6–12. Access Study Materials, NCERT Resources, MCQ Practice, Mock Tests and AI-Powered Learning Support in Hindi & English.';
const pages = [
  { path: '/', title: HOME_TITLE, description: HOME_DESCRIPTION, changefreq: 'weekly', priority: '1.0' },
  { path: '/privacy', title: 'Privacy Policy | Akash Exam Hub', description: 'How Akash Exam Hub handles information for students using the CBSE learning platform.', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', title: 'Terms & Conditions | Akash Exam Hub', description: 'Terms and conditions for using the Akash Exam Hub CBSE learning platform.', changefreq: 'yearly', priority: '0.3' },
];

function classPage(level) {
  const subjects = level <= 10 ? commonSubjects : seniorSubjects;
  const subjectItems = subjects.map((subject) => `<li>${esc(subject)}</li>`).join('');
  const title = `CBSE Class ${level} Study Resources | Akash Exam Hub`;
  const description = `Explore the CBSE Class ${level} learning area on Akash Exam Hub. Find published study resources and practice options, with Hindi and English learning support where available.`;
  const path = `/classes/class-${level}/`;
  const canonical = `<link rel="canonical" href="${siteUrl}${path}">`;
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${siteUrl}${path}#webpage`, name: title, description, url: `${siteUrl}${path}`, isPartOf: { '@id': `${siteUrl}/#website` }, about: { '@id': `${siteUrl}/#organization` }, inLanguage: ['en', 'hi'] };
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101a36"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${canonical}<meta name="author" content="Akash Exam Hub"><meta property="og:type" content="article"><meta property="og:site_name" content="Akash Exam Hub"><meta property="og:locale" content="en_IN"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${siteUrl}${path}"><meta property="og:image" content="${siteUrl}/og-image.png"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Akash Exam Hub — CBSE learning for Classes 6–12"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${siteUrl}/og-image.png"><link rel="icon" type="image/png" sizes="512x512" href="/website-icon-512x512.png"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"><link rel="manifest" href="/manifest.json"><script type="application/ld+json">${JSON.stringify(schema)}</script><style>:root{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#17213b;background:#f7f8fc}*{box-sizing:border-box}body{margin:0;line-height:1.7}.wrap{max-width:900px;margin:36px auto;padding:0 20px}.top,.panel{background:#fff;border:1px solid #e5e9f2;border-radius:18px;padding:25px}.brand{font-weight:800;color:#101a36;text-decoration:none}.tag{display:inline-block;margin-top:26px;background:#eef2ff;color:#455bc2;border-radius:99px;padding:6px 11px;font-size:12px;font-weight:800}h1{font-size:clamp(30px,5vw,44px);line-height:1.15;letter-spacing:-1.5px;color:#101a36;margin:16px 0}h2{font-size:21px;color:#101a36;margin:0 0 10px}.muted{color:#66718a}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0}.panel p{margin:0;color:#66718a}.panel ul{columns:2;padding-left:22px;color:#4b5872}.btn{display:inline-block;background:#3867ed;color:#fff;text-decoration:none;padding:12px 17px;border-radius:11px;font-weight:700;margin:8px 8px 0 0}.btn.alt{background:#fff;color:#263451;border:1px solid #e2e7f0}.notice{margin-top:18px;padding:15px 17px;background:#fff;border:1px solid #e5e9f2;border-radius:13px;color:#66718a;font-size:14px}@media(max-width:600px){.grid{grid-template-columns:1fr}.panel ul{columns:1}.wrap{margin:18px auto;padding:0 14px}.top,.panel{padding:20px}}</style></head><body><main class="wrap"><header class="top"><a class="brand" href="/">Akash Exam Hub</a><div class="tag">CBSE CLASS ${level}</div><h1>CBSE Class ${level} Study Resources</h1><p class="muted">Explore the Class ${level} learning area on Akash Exam Hub. The platform is being developed to organise study resources, revision and practice for CBSE learners, with Hindi and English learning support.</p><a class="btn" href="/app/">Open Student Portal →</a><a class="btn alt" href="/">Visit Homepage</a></header><section class="grid"><article class="panel"><h2>Explore subject areas</h2><p>These are common subject areas students may study. Actual subject combinations can vary by school and board selection.</p><ul>${subjectItems}</ul></article><article class="panel"><h2>Build a steady study routine</h2><p>Read the relevant textbook section, make short revision notes, practise questions and review mistakes. Use the student portal to access resources that have been published.</p></article></section><section class="panel"><h2>Study in Hindi or English</h2><p>Akash Exam Hub is designed with Hindi and English learning support in mind. Check the language and availability of each resource before relying on it for exam preparation.</p></section><div class="notice"><strong>Content status:</strong> The class catalogue is being expanded. Not every subject, chapter, bilingual note, MCQ set or test is available yet. This page does not claim that unpublished resources are already available.</div><p class="muted" style="font-size:13px;margin:22px 4px">© ${new Date().getFullYear()} Akash Exam Hub · <a href="/privacy/">Privacy</a></p></main></body></html>`;
}

for (const level of classes) {
  const path = `/classes/class-${level}/`;
  const dir = resolve(out, 'classes', `class-${level}`);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, 'index.html'), classPage(level));
  pages.push({ path, title: `CBSE Class ${level} Study Resources | Akash Exam Hub`, description: `CBSE Class ${level} learning area with published study resources and practice options from Akash Exam Hub.` });
}

// robots.txt: the public catalogue stays crawlable, the private portal is
// excluded from the sitemap and marked noindex in app.html.
await writeFile(resolve(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

const lastmod = new Date().toISOString().slice(0, 10);
const urls = pages
  .map((page) => `<url><loc>${siteUrl}${page.path}</loc><lastmod>${lastmod}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`)
  .join('\n');
await writeFile(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`);

// Homepage title, description, canonical, Open Graph/Twitter tags and the
// WebSite + Organization JSON-LD live in index.html so development and
// production serve identical metadata. Fail the build if any of it is lost
// instead of silently injecting a second, competing set of tags.
const homePath = resolve(out, 'index.html');
const home = await readFile(homePath, 'utf8');
const required = [
  `<link rel="canonical" href="${siteUrl}/"`,
  'property="og:site_name"',
  'property="og:url"',
  'name="twitter:card"',
  '"@type":"WebSite"',
  '"@type":"Organization"',
  'Akash Exam Hub CBSE Learning',
];
const missing = required.filter((needle) => !home.includes(needle));
if (missing.length) throw new Error(`Homepage SEO metadata missing from index.html: ${missing.join(', ')}`);

console.log(`Generated SEO pages for ${classes.length} classes. robots.txt, sitemap.xml and canonical URLs generated for ${siteUrl}`);
