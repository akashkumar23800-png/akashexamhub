import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteUrl = (process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.SITE_URL || '').replace(/\/$/, '');
const out = resolve('dist');
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const classes = [6, 7, 8, 9, 10, 11, 12];
const commonSubjects = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'];
const seniorSubjects = ['English', 'Hindi', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Accountancy', 'Business Studies', 'Economics', 'History', 'Geography', 'Political Science'];
const pages = [{ path: '/', title: 'Akash Exam Hub | CBSE Learning Platform for Classes 6–12', description: 'Akash Exam Hub brings CBSE learning resources, study material and practice tools together for Classes 6–12, with Hindi and English learning support.' }];

function classPage(level) {
  const subjects = level <= 10 ? commonSubjects : seniorSubjects;
  const subjectItems = subjects.map((subject) => `<li>${esc(subject)}</li>`).join('');
  const title = `CBSE Class ${level} Study Resources | Akash Exam Hub`;
  const description = `Explore the CBSE Class ${level} learning area on Akash Exam Hub. Find published study resources and practice options, with Hindi and English learning support where available.`;
  const path = `/classes/class-${level}/`;
  const canonical = siteUrl ? `<link rel="canonical" href="${siteUrl}${path}">` : '';
  const schema = { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: siteUrl ? `${siteUrl}${path}` : undefined, isPartOf: { '@type': 'WebSite', name: 'Akash Exam Hub', url: siteUrl || undefined }, inLanguage: ['en', 'hi'] };
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101a36"><meta name="robots" content="index,follow,max-image-preview:large"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${canonical}<meta property="og:type" content="website"><meta property="og:site_name" content="Akash Exam Hub"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${siteUrl || ''}/og-image.svg"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="/website-icon-512x512.png"><script type="application/ld+json">${JSON.stringify(schema)}</script><style>:root{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#17213b;background:#f7f8fc}*{box-sizing:border-box}body{margin:0;line-height:1.7}.wrap{max-width:900px;margin:36px auto;padding:0 20px}.top,.panel{background:#fff;border:1px solid #e5e9f2;border-radius:18px;padding:25px}.brand{font-weight:800;color:#101a36;text-decoration:none}.tag{display:inline-block;margin-top:26px;background:#eef2ff;color:#455bc2;border-radius:99px;padding:6px 11px;font-size:12px;font-weight:800}h1{font-size:clamp(30px,5vw,44px);line-height:1.15;letter-spacing:-1.5px;color:#101a36;margin:16px 0}h2{font-size:21px;color:#101a36;margin:0 0 10px}.muted{color:#66718a}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:18px 0}.panel p{margin:0;color:#66718a}.panel ul{columns:2;padding-left:22px;color:#4b5872}.btn{display:inline-block;background:#3867ed;color:#fff;text-decoration:none;padding:12px 17px;border-radius:11px;font-weight:700;margin:8px 8px 0 0}.btn.alt{background:#fff;color:#263451;border:1px solid #e2e7f0}.notice{margin-top:18px;padding:15px 17px;background:#fff;border:1px solid #e5e9f2;border-radius:13px;color:#66718a;font-size:14px}@media(max-width:600px){.grid{grid-template-columns:1fr}.panel ul{columns:1}.wrap{margin:18px auto;padding:0 14px}.top,.panel{padding:20px}}</style></head><body><main class="wrap"><header class="top"><a class="brand" href="/">Akash Exam Hub</a><div class="tag">CBSE CLASS ${level}</div><h1>CBSE Class ${level} Study Resources</h1><p class="muted">Explore the Class ${level} learning area on Akash Exam Hub. The platform is being developed to organise study resources, revision and practice for CBSE learners, with Hindi and English learning support.</p><a class="btn" href="/app/">Open Student Portal →</a><a class="btn alt" href="/">Visit Homepage</a></header><section class="grid"><article class="panel"><h2>Explore subject areas</h2><p>These are common subject areas students may study. Actual subject combinations can vary by school and board selection.</p><ul>${subjectItems}</ul></article><article class="panel"><h2>Build a steady study routine</h2><p>Read the relevant textbook section, make short revision notes, practise questions and review mistakes. Use the student portal to access resources that have been published.</p></article></section><section class="panel"><h2>Study in Hindi or English</h2><p>Akash Exam Hub is designed with Hindi and English learning support in mind. Check the language and availability of each resource before relying on it for exam preparation.</p></section><div class="notice"><strong>Content status:</strong> The class catalogue is being expanded. Not every subject, chapter, bilingual note, MCQ set or test is available yet. This page does not claim that unpublished resources are already available.</div><p class="muted" style="font-size:13px;margin:22px 4px">© ${new Date().getFullYear()} Akash Exam Hub · <a href="/privacy/">Privacy</a></p></main></body></html>`;
}

for (const level of classes) {
  const path = `/classes/class-${level}/`;
  const dir = resolve(out, 'classes', `class-${level}`);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, 'index.html'), classPage(level));
  pages.push({ path, title: `CBSE Class ${level} Study Resources | Akash Exam Hub`, description: `CBSE Class ${level} learning area with published study resources and practice options from Akash Exam Hub.` });
}

// Do not advertise private app routes or placeholder content to search engines.
await writeFile(resolve(out, 'robots.txt'), `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`);
if (siteUrl) {
  const urls = pages.map((page) => `<url><loc>${siteUrl}${page.path}</loc><changefreq>${page.path === '/' ? 'weekly' : 'monthly'}</changefreq><priority>${page.path === '/' ? '1.0' : '0.7'}</priority></url>`).join('\n');
  await writeFile(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`);
  const homePath = resolve(out, 'index.html');
  let home = await readFile(homePath, 'utf8');
  const canonical = `<link rel="canonical" href="${siteUrl}/">`;
  if (!home.includes('rel="canonical"')) home = home.replace('</head>', `${canonical}</head>`);
  home = home.replace('content="/og-image.svg"', `content="${siteUrl}/og-image.svg"`);
  home = home.replace('content="/og-image.svg"', `content="${siteUrl}/og-image.svg"`);
  const websiteSchema = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Akash Exam Hub', url: `${siteUrl}/`, description: 'CBSE learning resources for Classes 6–12 with Hindi and English learning support.', inLanguage: ['en', 'hi'] };
  const organizationSchema = { '@context': 'https://schema.org', '@type': 'EducationalOrganization', name: 'Akash Exam Hub', url: `${siteUrl}/`, description: 'A learning platform for CBSE Classes 6–12 with Hindi and English learning support.', educationalLevel: 'Classes 6–12', areaServed: 'India' };
  home = home.replace('</head>', `<script type="application/ld+json">${JSON.stringify(websiteSchema)}</script><script type="application/ld+json">${JSON.stringify(organizationSchema)}</script></head>`);
  await writeFile(homePath, home);
}
console.log(`Generated SEO pages for ${classes.length} classes. ${siteUrl ? 'Sitemap and canonical URLs generated for ' + siteUrl : 'Set SITE_URL or deploy on Netlify to generate absolute canonical URLs and sitemap.xml.'}`);
