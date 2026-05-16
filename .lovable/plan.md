# ASTRA Villa — Two-Phase Launch Plan

Approach: **strip in place**. Current repo has 269 pages, 196 edge functions, dozens of tables. Nothing is deleted from git — everything non-MVP moves to `_archived/` so the future modules can be re-enabled cleanly.

Confirmed scope: keep Indonesian + English, admin = 1–2 hardcoded emails, no buyer accounts, no payments, no 3D in Phase 1.

---

## Phase 1 — MVP (live in 14 days)

### Active pages (11)

```
Public                       Admin
/                            /admin/login
/villas                      /admin
/villas/:slug                /admin/properties/new
/about                       /admin/properties/:id
/contact                     /admin/leads
/privacy
/terms
```

### Database (3 tables only)

```
properties
  id, slug (unique), title, description,
  city, address, price_idr, listing_type (sale|rent),
  bedrooms, bathrooms, land_sqm, building_sqm,
  status (draft|published|sold), featured (bool),
  cover_image, images (text[]),
  created_at, updated_at

leads
  id, property_id (nullable FK), name, email, phone, message,
  source (website|whatsapp|contact), status (new|contacted|closed),
  created_at

admin_users        -- allowlist; auth lives in auth.users
  user_id (PK, FK auth.users), email, created_at
```

**RLS:**
- `properties` — public SELECT where `status='published'`; INSERT/UPDATE/DELETE only `is_admin(auth.uid())`.
- `leads` — public INSERT (rate-limited at edge); SELECT/UPDATE admin only.
- `admin_users` — admin only.
- Helper `is_admin(uid)` SECURITY DEFINER reads `admin_users`.

### Storage

Single bucket `property-images` (public read, admin write). Path `{property_id}/{uuid}.webp`.

### Edge functions (exactly 3)

1. **`create-lead`** — validates lead with zod, inserts row, sends Resend email + WhatsApp deep-link to admin. Rate-limit by IP (10/hour).
2. **`upload-property`** — admin-only (JWT + admin_users check). Accepts validated property payload + base64 images, optimizes to webp, stores in bucket, inserts/updates row. Single endpoint handles create + update.
3. **`admin-auth`** — wraps Supabase sign-in, verifies email is in `admin_users`, returns clean session payload. Blocks non-admins immediately (no leaked tokens).

Everything else gets deleted from Supabase via `delete_edge_functions` after the archive move.

### Frontend stack (locked)

Vite + React + TS + Tailwind + shadcn (already in repo). React Router. TanStack Query. `react-helmet-async` for per-route SEO. Tiny JSON i18n (`id.json`, `en.json`) — drop the 40-file i18n system.

### Folder structure (post-strip)

```
src/
  app/              router + providers (Query, Helmet, i18n, Auth)
  pages/
    public/         Home, Villas, VillaDetail, About, Contact, Privacy, Terms
    admin/          Login, Dashboard, PropertyForm, Leads
    future/         placeholder pages, all gated behind FEATURE_FLAGS
  features/         MVP feature slices (hook + UI + types per slice)
    villas/         useVillas, useVilla, VillaCard, VillaGallery, VillaFilters
    leads/          useCreateLead, ContactForm, WhatsAppButton
    admin/          useAdminAuth, AdminShell, PropertyTable, ImageUploader
  modules/          Phase 2 placeholders — empty index.ts + README each
    ai-assistant/   crm/  three-d-viewer/  virtual-tours/  pipeline/
    automation/     analytics/  vendors/  notifications/  booking/
    compliance/     portal/  multi-agent/  reporting/  recommendations/
  components/ui/    shadcn primitives actually used
  lib/              supabase, format, slugify, whatsapp, validation (zod schemas)
  i18n/             id.json, en.json, useT.ts
  config/
    features.ts     FEATURE_FLAGS — every Phase 2 module = false
    admin.ts        ADMIN_EMAILS allowlist
  _archived/        the entire previous app, untouched
supabase/
  functions/
    create-lead/   upload-property/   admin-auth/
    _archived/      (the other 193, undeployed)
  migrations/       new 000_mvp_reset.sql
```

### Why this is "future-ready"

- `src/modules/<name>/` exists from day 1 with `index.ts` exporting `{ enabled: false }` and a `README.md` describing the future contract. Phase 2 work = fill the folder, flip the flag.
- `config/features.ts` is the single switch. Public router reads it; pages under `pages/future/` render "Coming Soon" until the flag flips.
- DB has no Phase 2 columns now, but `properties` keeps a `jsonb` `meta` field reserved for tour URLs, AI scores, etc. — no migration needed to start storing them.

---

## Phase 2 — Upgrade roadmap (build only when needed)

Each module ships independently behind its flag. Suggested order (effort, weeks):

| Order | Module | Drop-in path |
|---|---|---|
| 1 | **CRM + Lead Pipeline** | `modules/crm` + new `lead_stages` table; reuses `leads` |
| 2 | **Smart Notifications** | `modules/notifications` + 1 edge fn; piggybacks on Resend |
| 3 | **Analytics Dashboard** | `modules/analytics` reads existing tables; no new schema |
| 4 | **Booking System** | `modules/booking` + `bookings` table + Midtrans (revive archived) |
| 5 | **AI Assistant + Recommendations** | revive archived `core-engine` + `ai-engine` behind flag |
| 6 | **Virtual Tours / 3D Viewer** | revive archived Three.js viewer; gated by `meta.tour_url` |
| 7 | **Multi-Agent + Vendor Mgmt** | revive `user_roles`, agents, listings approval |
| 8 | **Deal Automation / Compliance / Reporting** | revive risk-engine, escrow, KYC modules |

Nothing in Phase 2 requires schema rework of Phase 1 tables — `meta jsonb` and module-owned tables absorb everything.

---

## 14-day execution

```text
D1   Plan approval, secrets audit (RESEND_API_KEY, VITE_WHATSAPP_NUMBER, VITE_ADMIN_EMAILS)
D2   Migration: 3 tables + RLS + is_admin() + property-images bucket
D3   Move src/* and supabase/functions/* → _archived/; scaffold new tree;
     delete 193 deployed edge functions
D4   Public layout, Home (hero + featured villas + WhatsApp CTA)
D5   Villas list (filters: city, price, beds, type) + VillaCard
D6   VillaDetail (gallery, specs, description, sticky inquiry panel)
D7   Contact form + WhatsApp button + create-lead edge function
D8   Admin login + AdminShell + admin-auth edge function
D9   Admin properties table + delete + status toggle
D10  Admin property form + image uploader + upload-property edge function
D11  Admin leads inbox (mark contacted, WhatsApp deep-link, mark closed)
D12  i18n trim to id/en, mobile QA, accessibility pass (44px tap targets)
D13  SEO: per-route Helmet, sitemap.xml regen, JSON-LD on detail page,
     seed 10 real villas + optimized images
D14  Lighthouse pass, publish update, custom domain check, soft launch
```

---

## Launch checklist

- [ ] 3 tables created, RLS verified with anon + admin tokens
- [ ] `property-images` bucket public-read, admin-write
- [ ] Admin user inserted into `admin_users`, email in `VITE_ADMIN_EMAILS`
- [ ] `VITE_WHATSAPP_NUMBER` + `RESEND_API_KEY` set
- [ ] Resend sender `notify@astravilla.com` domain verified
- [ ] Exactly 3 edge functions deployed; 193 archived ones removed from Supabase
- [ ] 10+ published villas with cover + 5 gallery images each
- [ ] `index.html` title/description/canonical for astravilla.com; per-route Helmet on `/villas/:slug`
- [ ] sitemap.xml + robots.txt current
- [ ] Lighthouse mobile ≥ 85 on `/` and `/villas/:slug`
- [ ] End-to-end: anon visitor submits inquiry → admin gets email + sees lead within 1 min
- [ ] Custom domain `astravilla.com` resolves to the MVP build

---

## Open questions before I execute

1. **WhatsApp number** for the public site (single inbound number)?
2. **Admin email(s)** to whitelist (1 or 2)?
3. **Resend sender** — keep `notify@astravilla.com`, or use `onboarding@resend.dev` to start?

On approval, the first build pass will execute D2–D3: migration, the archive move, scaffolding, and edge-function cleanup. Days 4+ ship in subsequent passes.