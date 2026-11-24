# Roadmap — Property SEO & Discovery Engine

- [x] Readable permanent property links (/properties/<slug>) + redirects
- [x] Per-listing SEO title, description, alt text, JSON-LD (listing, offer, residence, breadcrumbs) with validation
- [x] Remove invented amenities fallback on property pages
- [x] Share panel: WhatsApp, Facebook, Telegram, X, Instagram/TikTok workflow, copy link, QR, UTM tags
- [x] Real, bot-filtered, de-duplicated view tracking
- [x] Popular / Trending / Newly listed / Most viewed / saved / shared homepage section
- [x] Internal links on property pages (breadcrumbs, same-area listings, location guide)
- [x] Sitemap: readable links, location pages with ≥5 listings, fix broken sitemap index
- [x] Admin SEO hub: Listing Health tab (completeness, duplicates, thin content, photos, top engagement)
- [ ] Google Search Console data (clicks, impressions, indexing) — blocked: needs a Search Console connection
- [ ] Resized WebP/AVIF photos — blocked: Supabase image resizing needs a paid Supabase plan
- [ ] Per-listing social preview images for WhatsApp/Facebook — blocked: needs server rendering (TanStack Start upgrade)

# Roadmap — Homepage redesign (ASTRA Signature)

- [x] Compact marketplace header (Beranda, Beli, Sewa, Properti Baru, Komersial, Insight, Pasang Iklan, language, Masuk/Daftar)
- [x] Photo hero with Indonesian copy + search (tabs, location autocomplete, type, price, bedrooms) wired to listings filters
- [x] Category shortcuts, Properti Pilihan (real records, DEMO labels), Lokasi Populer tiles, Pasang Iklan band, restrained footer
- [x] Demo inventory flag: DEMO label, noindex, no listing JSON-LD, excluded from sitemap
- [x] Indonesian homepage title/description
- [ ] Real (non-demo) listings — blocked: needs real inventory from owners/agents

# Roadmap — Genuine inventory & organic launch

- [x] Listing form saves correctly (removed missing fields, sale/rent only), full validation, ≥3 photos, private contact number, owner declaration
- [x] Server-side moderation: submissions always pending; owners can't self-approve, feature or un-demo; content edits on live listings return to review
- [x] Visitors only see approved + live listings; samples hidden unless the admin switch is on
- [x] Admin review: approve, request corrections, reject (notes saved), publish/unpublish, submitter contact, inventory counts, sample switch
- [x] Owner My Properties: review status + admin note, working edit page that resubmits corrections
- [x] SEO: unpublished/demo pages noindex without JSON-LD; sitemap, AI search and photo search only use approved real listings
- [ ] Owner sign-up emails — blocked: email service (Resend SMTP) not connected
- [ ] First real listing — blocked: needs a real owner/agent account with an approved listing role
- [ ] Confirm photo upload while signed in — blocked: no signed-in session available to test here

# Roadmap — Owner & agent onboarding

- [x] Safe role pipeline: sign-up never grants listing roles; applicants can't self-approve; approval grants owner/agent/developer role server-side; rejection revokes
- [x] Fix broken backend steps: new-account profile creation, profile edits, admin approval, admin view of agent applications
- [x] Onboarding page (role, contact, service area, bio; public vs private labels) wired to existing applications
- [x] Activation status card on Profile → Roles and on the dashboard; next steps to /post-property and My Properties with real counts
- [x] Admin applications screen: server-side approval only, required rejection note, full applicant details
- [x] Listing enquiry form saves real enquiries (live approved listings only); owners see their leads in My Properties; admins see all
- [x] Indonesian + English texts, tests, desktop/phone checks
- [ ] Owner sign-up emails — blocked: email service (Resend SMTP) not connected

# Roadmap — Enquiry & lead management

- [x] Lead inbox in My Properties: own leads only (database-enforced), filters, details, contact buttons, deep link from notifications
- [x] Statuses new → contacted → viewing scheduled → negotiation → won/lost; no return to "new"; history in the existing activity log
- [x] Private notes and next follow-up date; buyer details and linked listing locked server-side
- [x] Leads only from approved, live, non-sample listings; in-app notice to the lister (respects Messages setting)
- [x] Real lead counts (new, follow-ups due) on the activation card; admin read-only overview in Contacts
- [x] Indonesian + English texts, loading/empty/error states, tests
- [ ] Email alerts for new enquiries — blocked: sender domain notify.astravilla.com DNS verification timed out
- [ ] Signed-in click-through of the inbox — blocked: no signed-in session available here
- [ ] Email new enquiries to cs@astravilla.com — blocked: notify.astravilla.com sender DNS not verified
