# Clinical Protocol Hub

A mobile-first **progressive web app (PWA)** that lets physicians consult
clinical protocols from a smartphone. It is a fast, clean, installable
**document/reference library** — optimized for one-handed use on iPhone and
Android.

> **This application is intended for healthcare professionals as a reference
> tool. It does not replace clinical judgment, local guidelines, or specialist
> consultation.**

---

## ⚕️ Why this is NOT a patient app

This is deliberately a **professional document library**, not a patient-facing
or clinical-decision-support product:

- **No patient records.** There are no patient tables, screens, or fields.
- **No patient-identifiable data** is requested or stored (no name, date of
  birth, diagnosis, or health data) — anywhere. See `src/lib/types.ts`.
- **No diagnostic or therapeutic algorithms.** The app never tells you what to
  do for a specific patient.
- **Not a medical decision support system.** It stores and serves reference
  documents (protocols) and metadata only.
- A visible **disclaimer** appears on the home, profile, and every protocol
  detail page.

The only "personal" data is an optional **physician profile** (your own
professional details) stored locally on your device.

---

## ✨ Features

- **Home dashboard** with large tappable cards and a "recently updated" feed.
- **Protocols list** with client-side search (title, description, category,
  tags, author, reviewer), category & tag filters, favorites filter, and
  sort-by-recently-updated.
- **Protocol detail** with version, author/reviewer, last-updated date, tags,
  disclaimer, open/download document, inline PDF preview, and related protocols.
- **Favorites** stored in `localStorage` (per device).
- **Useful contacts** directory with tap-to-call / tap-to-email.
- **Contact / request form** (technical issue, protocol update, new protocol
  request, other).
- **Physician profile** stored locally.
- **Admin area** (create / edit / archive / upload protocols) behind a simple
  flag.
- **PWA**: installable, app icon, theme color, offline app-shell service worker.
- **Supabase-ready** data layer that also works **with zero configuration**
  using local mock data.

---

## 🧱 Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **lucide-react** icons
- **localStorage** for favorites / profile / mock persistence
- **@supabase/supabase-js** (optional)
- PWA via `manifest.json` + a hand-written service worker

---

## 🚀 Installation & running locally

Requires **Node.js 18.18+** (Node 20+ recommended).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The app works **immediately** with mock data —
no database or environment variables required.

Other scripts:

```bash
npm run build       # production build
npm run start       # run the production build
npm run typecheck   # TypeScript check
npm run lint        # ESLint
```

### Regenerating placeholder assets (optional)

The repo already includes generated icons and sample PDFs. To regenerate them:

```bash
node scripts/generate-icons.js        # public/icons/*.png
node scripts/generate-sample-pdfs.js  # public/protocols/*.pdf
```

---

## 🔧 Environment variables

All variables are **optional**. See `.env.example`. Copy it to start:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. Enables **Supabase mode** when set together with the anon key. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key. |
| `NEXT_PUBLIC_ENABLE_ADMIN` | `true`/`false` to force the `/admin` area on/off. Defaults to **on in development**, **off in production**. |

---

## 🗂️ Mock mode vs Supabase mode

The UI never touches mock data or Supabase directly — it always calls the data
layer in **`src/lib/data/repository.ts`**, which picks a backend at runtime:

- **Mock mode** (default): used when the Supabase env vars are **absent**.
  Data comes from `src/lib/data/mock-data.ts`. Favorites, profile, submitted
  requests, and admin protocol changes persist in `localStorage`.
- **Supabase mode**: used automatically when both Supabase env vars are
  **present**. Reads/writes go to your Supabase tables and Storage bucket.

A small badge on the home screen and a banner in the admin area show which mode
is active.

### How to change / add protocols

- **Mock mode:** edit **`src/lib/data/mock-data.ts`**.
  1. Add or edit an entry in `mockProtocols`.
  2. Ensure `categoryId` / `categoryName` match an entry in `mockCategories`.
  3. Point `fileUrl` at a file in `/public/protocols` (or an external URL).
  - You can also use the **/admin** UI; in mock mode those changes are saved to
    `localStorage` on your device.
- **Supabase mode:** use the **/admin** UI, or insert rows directly in Supabase.

---

## 🛢️ Connecting Supabase

1. Create a project at <https://supabase.com>.
2. In the **SQL editor**, run **`supabase/schema.sql`**. This creates the
   `profiles`, `categories`, `protocols`, `contacts`, and `contact_requests`
   tables, with starter Row Level Security policies.
3. Create a **public Storage bucket** named `protocols` (for uploaded files):
   ```sql
   insert into storage.buckets (id, name, public)
   values ('protocols', 'protocols', true);
   ```
   Then add storage policies (admins can upload, everyone can read).
4. Copy your project URL and anon key into `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
5. Restart `npm run dev`. The app is now in Supabase mode.

> The hand-written `Database` types live in `src/lib/supabase/types.ts`. For a
> real project, regenerate them with
> `supabase gen types typescript --project-id <id>`.

### Document handling (PDF / DOCX / external)

- **PDF**: opened in a new tab and previewed inline (on supported browsers).
- **DOCX**: downloaded / opened externally — the MVP does **not** render Word
  in-app. Converting DOCX → HTML for better mobile reading is on the roadmap.
- **External**: simply links out to the provided URL.

---

## 📲 Installing the PWA

The app is installable on a phone (best experienced over **HTTPS**, e.g. once
deployed). The service worker is only active in production builds.

### iPhone / iPad (Safari)

1. Open the app URL in **Safari**.
2. Tap the **Share** button (square with an up arrow).
3. Tap **Add to Home Screen**.
4. Confirm — the app icon appears on your home screen and opens full-screen.

### Android (Chrome)

1. Open the app URL in **Chrome**.
2. Tap the **⋮** menu (top-right).
3. Tap **Install app** / **Add to Home screen**.
4. Confirm — the app installs like a native app.

---

## 🛡️ Admin area

`/admin` is protected by a **simple flag** (`NEXT_PUBLIC_ENABLE_ADMIN`), **not**
real authentication — this is intentional for the MVP. It lets you list, create,
edit, archive, and attach files to protocols. In mock mode, changes persist to
`localStorage`; in Supabase mode they persist to the database / Storage.

Replacing this with real authentication and role-based access control is the
first roadmap item below.

---

## 📁 Project structure

```
public/
  icons/                 # PWA icons (generated)
  protocols/             # sample placeholder PDFs (replace with real docs)
  manifest.json          # PWA manifest
  sw.js                  # service worker (app-shell caching)
scripts/                 # one-off asset generators (icons, sample PDFs)
supabase/
  schema.sql             # tables + starter RLS policies
src/
  app/                   # App Router routes
    page.tsx             # /            home dashboard
    protocols/           # /protocols + /protocols/[slug]
    contacts/            # /contacts
    contact/             # /contact     request form
    profile/             # /profile
    admin/               # /admin, /admin/protocols/new, /[id]/edit
  components/            # UI + feature components
    ui/                  # buttons, inputs, badges, cards, spinner
    layout/              # bottom nav, page header
    admin/               # admin guard, protocol form, file upload field
  lib/
    types.ts             # domain types (no patient data)
    config.ts            # feature flags
    utils.ts             # helpers (dates, slugify, ids)
    storage.ts           # localStorage helpers
    hooks/               # useFavorites
    data/
      mock-data.ts       # mock categories / protocols / contacts
      repository.ts      # data-access abstraction (mock ↔ Supabase)
    supabase/
      client.ts          # Supabase client + isSupabaseConfigured()
      types.ts           # Database types
```

---

## ☁️ Deployment — get a live link in ~1 click

The fastest way to get a shareable HTTPS link (which also powers PWA install and
the mobile app) is **Vercel**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alcasai/therapedia&project-name=clinical-protocol-hub&repository-name=clinical-protocol-hub)

**Or import your existing repo (recommended for ongoing work):**

1. Go to <https://vercel.com/new> and sign in with GitHub.
2. **Import** the `alcasai/therapedia` repository.
3. Under *Settings → Git*, deploy the branch you want
   (e.g. `claude/ecstatic-galileo-feafdr`), or merge it to `main` first.
4. (Optional) add `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   in *Settings → Environment Variables* to enable Supabase mode.
   Leave them empty to run in mock mode.
5. **Deploy.** You get a URL like `https://clinical-protocol-hub.vercel.app`.

No build configuration is needed — Vercel auto-detects Next.js. The PWA +
service worker are served over HTTPS automatically, so the app is immediately
installable from the link (see *Installing the PWA* above).

> Any platform that runs Next.js 14 works too (Netlify, Render, a Node server…).

### Alternative: free hosting on GitHub Pages

You can also host it **free on GitHub Pages** as a static export. A workflow is
already included at `.github/workflows/deploy-pages.yml`.

1. In your repo: **Settings → Pages → Build and deployment → Source = GitHub
   Actions**.
2. Push to `main` (or the configured branch) — or run the **Deploy to GitHub
   Pages** workflow manually from the *Actions* tab.
3. Your site goes live at `https://<owner>.github.io/<repo>/`
   (e.g. `https://alcasai.github.io/therapedia/`).

How it works: the workflow builds with `GITHUB_PAGES=true` and sets
`NEXT_PUBLIC_BASE_PATH=/<repo>` automatically, so Next.js produces a static
export (`out/`) with all asset, manifest, service-worker, and PDF paths
correctly prefixed for the subdirectory.

**GitHub Pages caveats:**

- It is a **static, mock-mode** deployment by default (no server). The included
  sample protocols and the admin demo (saved to `localStorage`) work fully.
  To use **live Supabase data**, add `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` as repo **Secrets** and pass them in the
  workflow's build step (they're read client-side).
- Because routes are pre-rendered, protocols created in the browser don't get
  their own static `edit` page on Pages — fine for a demo; a live backend makes
  this fully dynamic.
- Local dev and Vercel are **unaffected** — they run at the root path with no
  base path. The static-export settings only activate when `GITHUB_PAGES=true`.

### 📲 Turn it into a real mobile app (App Store / Google Play)

Once you have the live link, wrap the same app into a native Android/iOS app with
**Capacitor** — no rewrite. Full step-by-step in **[MOBILE.md](./MOBILE.md)**.

---

## 🗺️ Future roadmap

- Full **authentication** (replace the admin flag).
- **Role-based access control** (admin / reviewer / reader).
- Protocol **version history**.
- **Audit trail** of protocol updates.
- **Offline** protocol access (cache documents, not just the app shell).
- **DOCX → HTML** conversion for better mobile reading.
- **Full-text search inside documents**.
- **Push notifications** for updated protocols.
- **Multilingual** support.
- **App Store / Google Play** wrapper (e.g. via Capacitor) if a native shell is
  needed.

---

## 📄 License

Provided as an MVP starting point. Review and harden (auth, RLS, content) before
any clinical or production use.
