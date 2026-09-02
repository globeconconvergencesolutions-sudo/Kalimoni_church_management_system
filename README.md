# St. Theresa Parish, Kalimoni — Parish Website & Office

A React parish website and staff **Parish Office** for **St. Theresa Catholic Church, Kalimoni** (Juja, Kiambu County, Kenya). The public site shares Mass times, news, events, galleries, and giving information. Staff sign in to manage notices, content, media, inbox messages, and donation records.

This repository is actively developed. Some features are production-ready; others are demo or in progress. This README is written so a new developer can clone, configure, run, and deploy without prior context.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Quick start](#quick-start)
4. [Environment variables](#environment-variables)
5. [Database setup (Supabase)](#database-setup-supabase)
6. [Staff accounts](#staff-accounts)
7. [Development](#development)
8. [Project structure](#project-structure)
9. [Features & completion status](#features--completion-status)
10. [Media uploads (important)](#media-uploads-important)
11. [Production deployment (Vercel)](#production-deployment-vercel)
12. [Scripts & utilities](#scripts--utilities)
13. [Troubleshooting](#troubleshooting)
14. [Contributing](#contributing)

---

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 19, React Router 8, Tailwind CSS v4 |
| Build | Vite 8, TypeScript 5.7 |
| Database & auth | [Supabase](https://supabase.com) (Postgres + Auth + RLS) |
| Media CDN | [Cloudinary](https://cloudinary.com) |
| Email (dev/server) | Gmail via Nodemailer (inbox notifications) |
| Hosting target | Vercel (static SPA + serverless `/api` routes) |

The project began as a [Figma Make](https://www.figma.com/make/) export and was extended into a full parish system.

---

## Prerequisites

- **Node.js 20+** (see `.mise.toml` for pinned version)
- **pnpm** (recommended) or npm
- A **Supabase** project (free tier is fine for development)
- A **Cloudinary** account (for staff media uploads)
- Optional: **Gmail app password** for inbox email forwarding in local dev

---

## Quick start

```bash
# 1. Clone
git clone https://github.com/globeconconvergencesolutions-sudo/Kalimoni_church_management_system.git
cd Kalimoni_church_management_system

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase and Cloudinary keys (see below)

# 4. Run database migrations in Supabase SQL Editor (see Database setup)

# 5. Create a staff user in Supabase Auth dashboard

# 6. Start dev server
pnpm dev
```

Open:

- **Public site:** http://localhost:8443/
- **Parish office login:** http://localhost:8443/admin/login

Default dev port is **8443** (configurable via `PORT`).

---

## Environment variables

Copy `.env.example` to `.env.local`. **Never commit `.env.local`.**

### Required for core functionality

| Variable | Where used | Notes |
|----------|------------|-------|
| `VITE_SUPABASE_URL` | Client + server | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Client + server | Supabase **anon** (public) key |

`VITE_SUPABASE_PUBLISHABLE_KEY` is supported if your Supabase project uses the newer publishable key format.

Legacy `NEXT_PUBLIC_SUPABASE_*` names still work as a fallback in code, but **use `VITE_` in `.env.local`** — this is a Vite project and only `VITE_*` keys are exposed to the browser.

### Required for media uploads

| Variable | Where used | Notes |
|----------|------------|-------|
| `CLOUDINARY_CLOUD_NAME` | Server only | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Server only | API key |
| `CLOUDINARY_API_SECRET` | Server only | **Keep secret** — never expose to client |
| `VITE_CLOUDINARY_CLOUD_NAME` | Client | Same cloud name (for image URLs) |
| `CLOUDINARY_ROOT_FOLDER` | Server | Optional; defaults to `Kalimoni` |

### Optional — inbox email (local dev)

| Variable | Notes |
|----------|-------|
| `GMAIL_USER` | Gmail address used to send office notifications |
| `GMAIL_APP_PASSWORD` | 16-character Google app password |
| `PARISH_NOTIFY_EMAIL` | Where copies arrive (defaults to `GMAIL_USER`) |

### Developer notes only (not loaded by the app)

```env
USER_EMAIL=staff@example.com
USER_PASSWORD=your-password
```

These are for your own reference when testing login. Create the matching user in **Supabase Auth**.

---

## Database setup (Supabase)

SQL migrations live in `supabase/migrations/`. Run them in the **Supabase SQL Editor** for your project.

### Fresh project — recommended order

Run each file **once**, in this order:

1. `20260831_sprint1_notices.sql` — notice bar, parish notices
2. `20260831_sprint2_cms.sql` — news posts, events, Mass schedule
3. `20260831_sprint3_inbox.sql` — contact / prayer inbox
4. `20260831_sprint4_giving_media.sql` — donations + `parish_media` table
5. `20260831_media_slots.sql` — slot columns for site-wide image placements
6. `20260831_notice_copy_refresh.sql` — copy updates (optional)

**Shortcut for media only:** if `parish_media` does not exist yet, you can run the all-in-one:

- `20260901_media_setup_combined.sql`

### Verify media table

In SQL Editor:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'parish_media'
order by ordinal_position;
```

You should see `slot_key`, `is_slot`, and `media_type` among other columns.

### Import prototype content (optional)

After migrations and staff login exist:

```bash
npx tsx scripts/import-cms.mts
```

This seeds notices, blog posts, events, and Mass times from static data files.

---

## Staff accounts

1. Open your Supabase project → **Authentication** → **Users**
2. **Add user** → email + password
3. Use those credentials at `/admin/login`

There is **no public signup**. Only users created in Supabase Auth can access the Parish Office.

Row Level Security (RLS) policies allow:

- **Anonymous** visitors: read published content only
- **Authenticated** staff: full CRUD on office tables

---

## Development

```bash
pnpm dev      # Start Vite dev server on :8443
pnpm build    # Production build → dist/
pnpm preview  # Preview production build locally
pnpm format   # Format with oxfmt
npx tsc --noEmit  # Typecheck
```

### Dev-only API routes

During `pnpm dev`, Vite plugins in `server/` handle:

| Route | Purpose |
|-------|---------|
| `POST /api/media/upload` | Upload images/videos to Cloudinary + save to Supabase |
| `POST /api/media/delete` | Remove gallery items / revert site slots |
| `POST /api/inbox` | Send inbox notification email |
| `POST /api/mpesa/stk` | **Demo** M-Pesa STK simulation |
| `POST /api/mpesa/confirm` | **Demo** payment confirmation |

**Restart `pnpm dev` after changing `.env.local` or server code.**

---

## Project structure

```
├── api/media/              # Vercel serverless handlers (production uploads)
├── server/                 # Vite dev middleware (shared media logic in mediaApi.ts)
├── src/
│   ├── main.tsx            # App entry
│   ├── routes.ts           # Public + admin routes
│   ├── pages/              # Public pages (Home, About, Gallery, …)
│   ├── pages/admin/        # Parish Office (Dashboard, Media, Inbox, …)
│   ├── components/         # Layout, office UI, notice bar, …
│   ├── hooks/              # useSiteMedia, useStaffSession, …
│   └── lib/                # Supabase clients, CMS, media, inbox, …
├── supabase/migrations/    # SQL schema
├── scripts/import-cms.mts  # One-off content import
├── .env.example            # Environment template
├── vercel.json             # SPA + API routing for Vercel
└── vite.config.ts          # Vite + Tailwind + dev plugins
```

### Key routes

**Public**

| Path | Page |
|------|------|
| `/` | Home |
| `/about`, `/history`, `/community` | Parish story |
| `/ministries`, `/vincentians`, `/sisters` | Ministries |
| `/events`, `/gallery`, `/blog` | Calendar & media |
| `/donate`, `/contact` | Giving & contact |

**Parish Office** (requires login)

| Path | Module |
|------|--------|
| `/admin` | Dashboard |
| `/admin/notices` | Notice bar |
| `/admin/posts` | News / blog |
| `/admin/events` | Parish calendar |
| `/admin/mass` | Mass times |
| `/admin/media` | Site images + gallery |
| `/admin/inbox` | Contact messages |
| `/admin/giving` | Donation records |
| `/admin/content` | Archive import tools |

---

## Features & completion status

Honest snapshot for planning — not a marketing checklist.

| Area | Status | Notes |
|------|--------|-------|
| Public website UI | **Strong** | All main pages, bilingual touches, SEO hooks |
| Notice bar | **Working** | Supabase-backed, staff CRUD |
| News / blog | **Working** | Staff CRUD; public reads published posts |
| Events & Mass times | **Working** | Staff CRUD |
| Contact / inbox | **Working** | Saves to Supabase; email in dev via Gmail plugin |
| Media — site slots | **Working** | 24 placements; Cloudinary + Supabase |
| Media — gallery | **Working** | Upload, publish/unpublish, delete |
| Giving / M-Pesa | **Demo** | Simulated STK — not live Safaricom integration |
| Broadcasts (SMS/WhatsApp) | **Not started** | Roadmap item |
| Jumuiya registry | **Not started** | Roadmap item |

---

## Media uploads (important)

Staff manage images at **Parish Office → Media**.

### Two tabs

1. **Site images** — Replace exact placements on the public site (hero, carousel slides, ministry cards, etc.). Each card maps to a `slot_key` in `src/lib/mediaSlots.ts`.
2. **Gallery library** — Photos/videos for `/gallery` only.

### How to upload (staff workflow)

1. Click **Upload** or **Replace** on a placement (or use the gallery form).
2. **Choose a file** — drag-and-drop or browse.
3. Wait for the **Ready** badge and preview.
4. Click **Save to website** or **Publish to gallery**.

Choosing a file alone does **not** upload — you must click Save/Publish.

### Supported formats

- **Photos:** JPG, PNG, WebP, GIF, HEIC/HEIF, and most `image/*` types
- **Videos (gallery + video slots):** MP4, MOV, WebM, and most `video/*` types
- **Limits:** ~25 MB photos, ~100 MB videos (Cloudinary optimises delivery)

### Architecture

```
Browser (AdminMedia)
  → POST /api/media/upload  (JSON + base64 data URL)
    → Cloudinary (store file)
    → Supabase parish_media (metadata + slot_key)
  → Public pages read via useSiteMedia() hook
```

### Common upload failures

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| "Upload service not found" | API route missing | Production: deploy `api/media/*`. Local: restart `pnpm dev` |
| "Sign in required" | Session expired | Log in again at `/admin/login` |
| "Supabase is not configured" | Missing env vars | Check `.env.local` |
| Cloudinary error | Wrong API keys | Verify `CLOUDINARY_*` in env |
| DB error on save | Migration not run | Run `20260901_media_setup_combined.sql` |
| File chosen but nothing happens | Forgot to click Save | Select file → click **Save to website** |
| iPhone HEIC rejected (older builds) | Strict file filter | Pull latest — HEIC is now accepted |

---

## Production deployment

This is a **single-page application (SPA)**. Direct visits to paths like `/donate`, `/gallery`, or `/admin/media` must be rewritten to `index.html` so React Router can handle them. Without that rule, hosts show their own ugly “Page not found” screen (as on Netlify).

### Netlify (current live host: gcskalimoni.netlify.app)

The repo includes:

- **`netlify.toml`** — build command, publish folder, SPA redirect
- **`public/_redirects`** — copied to `dist/_redirects` on build (backup rule)

| Setting | Value |
|---------|-------|
| Build command | `pnpm build` |
| Publish directory | `dist` |
| Node version | 20 (set in `netlify.toml`) |

**After pushing these files, trigger a new deploy** on Netlify. Then test:

- https://gcskalimoni.netlify.app/donate
- https://gcskalimoni.netlify.app/admin/login

Set environment variables in **Netlify → Site configuration → Environment variables** (same `VITE_*` and `CLOUDINARY_*` keys as `.env.local`).

**Note:** Staff media upload API routes (`/api/media/*`) are set up for **Vercel serverless** in this repo. On Netlify static hosting, uploads will not work until you add [Netlify Functions](https://docs.netlify.com/functions/overview/) or host the API elsewhere. The public site and Supabase-backed content still work.

### Vercel (alternative)

### Build settings

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build command | `pnpm build` |
| Output directory | `dist` |

`vercel.json` rewrites non-API paths to `index.html` (SPA) and preserves `/api/*` serverless functions.

### Required Vercel environment variables

Set the same variables as `.env.local`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (or `VITE_SUPABASE_PUBLISHABLE_KEY`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_ROOT_FOLDER` (optional)

### API routes on Vercel

These files deploy as serverless functions:

- `api/media/upload.ts`
- `api/media/delete.ts`

Without them, the static site works but **staff uploads fail** in production.

Inbox and M-Pesa demo routes currently exist only in the Vite dev plugins (`server/inboxPlugin.ts`, `server/sprint4Plugin.ts`). Contact form still saves to Supabase directly when the dev inbox route is unavailable.

---

## Scripts & utilities

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Development server |
| `pnpm build` | Production bundle |
| `npx tsx scripts/import-cms.mts` | Import static blog/events/Mass data into Supabase |

---

## Troubleshooting

### Port already in use

```bash
PORT=3000 pnpm dev
```

### TypeScript or build errors

```bash
npx tsc --noEmit
pnpm build
```

### Supabase "relation does not exist"

Run the migrations in order (see [Database setup](#database-setup-supabase)).

### Media page shows 0 customised slots after upload

Refresh the page or navigate away and back. The media module waits for auth before loading; a hard refresh after login also helps.

### Netlify shows “Page not found” on /donate or other routes

The site is missing the SPA fallback. Ensure `netlify.toml` and `public/_redirects` are in the repo, run `pnpm build`, and redeploy. The built `dist/_redirects` file must be published.

### CORS or auth errors

Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` match your Supabase project and that the staff user exists in Auth.

---

## Contributing

1. Create a feature branch from `main`
2. Keep changes focused; match existing code style (double quotes in JSX strings with apostrophes, default exports for components)
3. Run `pnpm build` and `npx tsc --noEmit` before opening a PR
4. Do **not** commit `.env.local` or secrets

---

## Parish

**St. Theresa Parish, Kalimoni**  
P.O. Box 141, Kalimoni 01001, Kenya  
*Service to God through service to humanity.*

---

## License

Private parish project. Contact the parish office or repository maintainers for usage terms.
