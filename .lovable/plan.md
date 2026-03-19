

# Optimize Landing Page for Investor Outreach

## Current State
The landing page hero has solid structure but needs optimization for converting real investors who receive the link. Key issues:

1. **Stats are aspirational/fake** ("10K+ Properties Analyzed", "95% AI Accuracy") — destroys trust with savvy investors
2. **CTAs are generic** — "Explore Opportunities" doesn't create urgency
3. **No social proof above the fold** — testimonials exist but are buried below
4. **No investor-specific entry point** — the onboarding flow exists but isn't linked from hero
5. **Trust proof section uses fake partner logos** (Ciputra, Sinar Mas) — serious liability if shared publicly

## Changes

### 1. LandingHero.tsx — Investor-Focused Rewrite
- Replace fake stats with honest, compelling ones: "5 Live Listings", "AI-Scored", "Bali · Jakarta · BSD"
- Change primary CTA: "Explore Opportunities" → "View Investment Opportunities" linking to `/search`
- Change secondary CTA: "List Your Property" → "Start Investor Profile" linking to `/onboarding/investor`
- Add a subtle trust line below CTAs: "Free access · No credit card · AI-powered scoring on every listing"
- Remove fake floating particles (they add load time, not value)

### 2. LandingTrustProof.tsx — Remove Fake Partners
- Remove the hardcoded developer partner names (Ciputra, Sinar Mas, etc.) — these imply partnerships that don't exist
- Keep testimonials but label section as "What Investors Say" (mark as illustrative if needed)
- Replace partner logos row with a "How It Works" 3-step flow: Browse → Score → Invest

### 3. LandingFeatured.tsx — Real Data Connection
- Already queries real properties from DB — just needs the seeded listings to have `opportunity_score >= 70`
- Add fallback messaging if no scored properties exist yet: "Properties are being scored by our AI engine"

### 4. LandingLeadCapture.tsx — Tighten Copy
- Change heading to "Get Early Access to Premium Deals"
- Add "Join 50+ investors exploring Indonesian property" (update as real numbers grow)

## Files Modified
- `src/components/landing/LandingHero.tsx` — stats, CTAs, remove particles
- `src/components/landing/LandingTrustProof.tsx` — remove fake partners, add how-it-works
- `src/components/landing/LandingFeatured.tsx` — fallback state
- `src/components/landing/LandingLeadCapture.tsx` — copy update

