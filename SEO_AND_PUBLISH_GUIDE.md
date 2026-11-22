# Akash Exam Hub — SEO and publishing guide

## What this update changes

- The root URL (`/`) is now a public, crawlable homepage. Visitors do not need to sign in to read it.
- The existing authenticated React application is served at `/app/` and remains behind the existing authentication flow.
- Static class landing pages are generated for `/classes/class-6/` through `/classes/class-12/` during the production build.
- The build generates `robots.txt`; it generates `sitemap.xml` and absolute canonical URLs when Netlify's `URL` variable or `SITE_URL` is available.
- The student portal is marked `noindex` so Google is directed toward the public pages rather than the login/dashboard shell.
- The class landing pages clearly state that content availability varies. They do not claim that every chapter, note, MCQ or test is already published.

## Build locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm ci
npm run build
```

The deployable output is `dist/`.

## Deploy on Netlify without Bolt/Lovable credits

1. Create/sign in to a Netlify account.
2. For repeatable deployments, put this project in a Git repository and connect that repository to Netlify. The build command is `npm run build` and publish directory is `dist` (already set in `netlify.toml`).
3. If deploying from a prebuilt folder using Netlify Drop, upload the contents of `dist/`, not the source ZIP. The `dist/` folder must first be created by running the build command on a computer with Node.js and network access to install dependencies.
4. Add the public Supabase values as Netlify environment variables if the existing application needs them: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These are browser-side project configuration values; never add a Gemini/API secret with a `VITE_` prefix.
5. Configure Gemini only in the Supabase Edge Function secrets, then deploy the `ai-study-assistant` function and apply the migrations using the Supabase project owner account.

## Google Search Console

1. After the website is live, open Google Search Console: https://search.google.com/search-console/.
2. Add the exact public Netlify URL as a URL-prefix property, or add a custom domain property if you own a domain.
3. Complete Google's ownership verification. Do not paste private API keys into the verification field.
4. Open Sitemaps and submit `https://YOUR-LIVE-DOMAIN/sitemap.xml`.
5. Use URL Inspection for the homepage and the class pages, then request indexing.
6. Recheck indexing and search performance over the following weeks. Indexing and ranking are controlled by Google and are not guaranteed.

## Before public launch

- Replace any remaining placeholder study content with reviewed, original educational content.
- Publish a complete privacy policy with the operator's contact details, data handling, retention and service-provider disclosures before opening student registration broadly.
- Verify Supabase Row Level Security, auth redirects, AI function secrets, usage limits and data deletion behaviour.
- Test the public homepage, `/app/`, class pages, login, signup, password reset and mobile layouts on the deployed URL.

## Important limits

This source update does not publish the site, create a GitHub repository, connect Netlify/Supabase, set secrets, verify Google Search Console ownership or submit the sitemap. Those actions require the owner's accounts and explicit access. Google may take time to crawl/index pages and does not guarantee first-page placement.
