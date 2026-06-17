# ASTRA Villa — UI Interaction Audit (Homepage `/`)

Scope: `src/pages/AstraReosHome.tsx` and global header/sidebar controls. Functional repair only — no redesign.

## ✅ Working After Fix

| Element | Behavior |
| --- | --- |
| Logo (`A` + wordmark) | `<Link to="/">` — returns to home |
| Mobile menu button (☰) | Opens slide-in drawer with all top tabs + sidebar nav (`lg:hidden`) |
| Header search input | `Enter` → navigates to `/search?q=…` |
| Header filter button (Sliders) | Navigates to `/search-advanced` |
| Language selector (Globe / EN) | Dropdown wired to `useLanguage()`, persists via `safeLocalStorage` |
| Theme toggle (Sun/Moon) | Wired to `useTheme()` from `ThemeProvider`, persists in `localStorage` |
| Notifications bell | Navigates to `/notifications` |
| Saved (heart) | Navigates to `/favorites` |
| Sign in / Get Started | Opens `ReosAuthModal` (login / register mode) |
| Profile chip (when authed) | Opens menu → Profile / Wallet / Saved / Sign out |
| Top tabs (Dashboard, Properties, Investment, Finance, Legal, Management, Vendors, AI Center, More) | All converted to `<Link>` with verified routes |
| Sidebar nav (Overview → Support) | All converted to `<Link>` with verified routes |
| Investor Club "Join Now" | Authed → `/astra-tokens`; guest → opens register modal |
| App Store / Google Play | External `<a target="_blank" rel="noopener noreferrer">` |
| Hero search tabs (All/Properties/…) | Filters active tab state |
| Hero search input + "AI Search" button | Calls `useReosAiSearch().search()` and opens results sheet |
| Hero location chips (Bali, Jakarta, …) | Navigate to `/search?q=Properties in <city>` |
| Hero "More" chip | Navigates to `/search-advanced` |
| Market Overview country selector | Dropdown of ASEAN countries with persistent selection |
| Market Overview "View Full Report" | Navigates to `/market-heatmap` |
| Hub cards (Properties, Investment, Finance, Legal, AI Advisor, Management) | `<Link>` to verified routes |
| Featured properties cards | `<Link to="/properties/:id">` (was broken `/property/:id`) |
| Featured / Hotspots / AI / Market "View All" links | All routed to existing pages |
| Investment Hotspot dots | `<button>` → `/invest/:citySlug` (CityInvestmentPage) |
| Hotspot zoom +/- | Scales hotspot layer in place (`hotspotZoom` state) |
| AI Results sheet (×) | Closes and resets AI state |
| "Generate Now" CTA | Authed → `/wealth-advisor`; guest → opens login modal |
| Authentication persistence | Handled by `AuthProvider` (`supabase.auth.onAuthStateChange` + initial `getSession`) — survives refresh |

## 🔧 Broken Elements Repaired

| Element | Previous Issue | Fix |
| --- | --- | --- |
| Theme switch | No control on home page | Added Sun/Moon toggle wired to `useTheme()` |
| Language selector | Static button (no handler) | Wired to `useLanguage()` with dropdown |
| Top tabs | `<button>` with no `onClick` | Converted to `<Link to={t.to}>` |
| Sidebar nav | `<motion.button>` with no handler | Converted to `<Link to={n.to}>` |
| Mobile menu | Did not exist | Added drawer + ☰ button |
| Notifications bell | No handler | `navigate("/notifications")` |
| Saved heart | No handler | `navigate("/favorites")` |
| Header search Enter | Opened AI sheet only | Routes to `/search?q=` for actual search |
| Header filter (Sliders) | No handler | `navigate("/search-advanced")` |
| Country selector ("Indonesia") | No handler | Dropdown with 6 ASEAN countries |
| Market "View Full Report" | No handler | `navigate("/market-heatmap")` |
| Hotspot map dots | Non-interactive `<div>` | `<button>` → `/invest/:slug` |
| Hotspot +/- zoom | No handler | `setHotspotZoom` state, scales map |
| Featured property card link | `/property/:id` route did not exist | Fixed to `/properties/:id` |
| AI Recommendation "View All" | `/ai` route did not exist | `/ai-search` |
| Market Intelligence "View All" | `/intelligence` route did not exist | `/market-heatmap` |
| Hub: Finance / Legal / AI Advisor / Management | All pointed to non-existent routes | Re-mapped to `/wallet`, `/legal-services`, `/ai-search`, `/agent-dashboard` |
| "Join Now" (Investor Club) | No handler | Auth-aware → `/astra-tokens` or register modal |
| "Generate Now" (AI report) | No handler | Auth-aware → `/wealth-advisor` or login modal |
| App Store / Google Play | `<button>` with no handler | External anchors |
| Authed profile chip | Static (no menu, no sign-out) | Dropdown with Profile / Wallet / Saved / Sign out |

## 🌐 State Management

| Concern | Source of Truth | Persistence |
| --- | --- | --- |
| Theme | `ThemeProvider` (`src/components/ThemeProvider.tsx`) | `localStorage["astra-villa-theme"]` |
| Language | `LanguageProvider` (`src/contexts/LanguageContext.tsx`) | `safeLocalStorage["language"]` |
| Auth session | `AuthProvider` (`src/contexts/AuthContext.tsx`) — `onAuthStateChange` + `getSession` | Supabase cookie / `localStorage` |
| Auth modal | Local `showAuth` / `authInitial` state | n/a |
| Mobile menu, language dropdown, profile menu, country dropdown | Local state with `mousedown` outside-click handlers | n/a |

## 🛣 Route Verification

Every `<Link>` and `navigate()` target on the homepage now resolves to a route registered in `src/App.tsx`:
`/`, `/properties`, `/properties/:id`, `/investment`, `/wallet`, `/legal-services`, `/agent-dashboard`, `/services`, `/ai-search`, `/search`, `/search-advanced`, `/favorites`, `/notifications`, `/profile`, `/messages`, `/documents`, `/support`, `/market-heatmap`, `/investment-performance`, `/wealth-advisor`, `/astra-tokens`, `/invest/:citySlug`.

## ❌ Remaining Items Out of Scope

- Pagination dots beneath Featured Properties are purely decorative (no carousel implementation — design says "do not redesign"). Left visual-only.
- Bottom stats `MoreHorizontal` ellipsis icons are visual affordances; no menu was specified.
- "Trusted By" bank wordmarks are not links (no partner pages exist).
