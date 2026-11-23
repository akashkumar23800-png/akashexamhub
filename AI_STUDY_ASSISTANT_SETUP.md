# Akash Exam Hub — AI Study Assistant setup

## What changed
- Added an AI Study Assistant page at `#/ai-study-assistant` and dashboard/navigation entry.
- Added six Gemini-powered modes: doubt solver (including PNG/JPEG/WebP question images), planner, MCQ quiz, notes, performance analysis, and English teacher.
- Added conversation context for the doubt solver.
- Added per-user saved AI artifacts and chapter progress tables with Row Level Security.
- Extended the existing Supabase Edge Function; existing `ask`, `rewrite`, and `ai-detect` modes remain supported.
- Gemini key is read only from the Edge Function secret `GEMINI_API_KEY`.

## Required deployment steps
The ZIP is source code. Apply the database migration and deploy the Edge Function before using the AI modules.

1. Configure the Gemini secret in the Supabase project:
   ```bash
   supabase secrets set GEMINI_API_KEY=your_actual_key
   ```
2. Apply database migrations:
   ```bash
   supabase db push
   ```
3. Deploy the function:
   ```bash
   supabase functions deploy ai-study-assistant
   ```
4. Confirm `ai-study-assistant` has JWT verification enabled. `supabase/config.toml` sets `verify_jwt = true`.
5. Create `.env` from `.env.example` and fill in the project's existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. These are public client configuration values, not the Gemini secret. Do not put `GEMINI_API_KEY` in this file.
6. Install dependencies and build:
   ```bash
   npm ci
   npm run typecheck
   npm run lint
   npm run build
   ```
7. Deploy the generated `dist/` folder to the hosting provider.

## Security and behavior notes
- The Gemini API key is never read by frontend code and is sent to Google only from the Edge Function using the `x-goog-api-key` header.
- The Edge Function is configured to require a signed-in Supabase user. It also applies a database-backed limit of 20 AI requests per user per minute.
- AI records and chapter progress are protected by user-scoped RLS policies.
- The quiz is generated as structured JSON, scored in the UI, and its result is saved in the user's AI records.
- Performance analysis uses the signed-in student's existing attempt and answer data. It only analyzes available data and should say when data is insufficient.
- Generated AI material can contain mistakes. Students should verify important facts with their NCERT textbook/teacher.

## Verification status
- Source changes have been made.
- A production build and TypeScript check could not be completed in this environment because dependency installation did not complete; npm reported an uncached package while offline, and the online install attempt timed out.
- The Gemini API cannot be live-tested without the owner's configured Supabase secret and deployed Edge Function.
- Mobile/desktop manual interaction tests and authenticated multi-user isolation tests still need to be run after deployment.
