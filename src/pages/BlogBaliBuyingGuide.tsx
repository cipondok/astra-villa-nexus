import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, TrendingUp, MapPin, Clock, AlertTriangle, Home } from "lucide-react";

export default function BlogBaliBuyingGuide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": "How to Buy a Villa in Bali as a Foreigner: A Complete 2026 Guide",
        "description": "A foreign investor's guide to buying property in Bali: leasehold vs freehold, legal structures, area comparisons, ROI, and due diligence.",
        "author": {
          "@type": "Organization",
          "name": "ASTRA Villa Property",
          "url": "https://astravilla.com",
        },
        "publisher": {
          "@type": "Organization",
          "name": "ASTRA Villa Property",
          "url": "https://astravilla.com",
        },
        "datePublished": "2026-07-17",
        "dateModified": "2026-07-17",
        "image": "https://astravilla.com/icon-512.png",
        "url": "https://astravilla.com/blog/bali-property-buying-guide",
      },
      {
        "@type": "HowTo",
        "name": "How to Buy a Villa in Bali as a Foreigner",
        "description": "Step-by-step process for legally purchasing Bali real estate as a foreign investor.",
        "step": [
          { "@type": "HowToStep", "name": "Choose ownership structure", "text": "Decide between leasehold (Hak Sewa/Hak Pakai) or a PT PMA freehold (Hak Guna Bangunan) structure based on budget and timeline." },
          { "@type": "HowToStep", "name": "Select micro-location", "text": "Compare Canggu, Seminyak, Uluwatu, Ubud, Sanur, and Nusa Dua for yield, lifestyle, and growth potential." },
          { "@type": "HowToStep", "name": "Verify land certificates", "text": "Check SHM, HGB, IMB/PBG, zoning, and building permits with a certified notary and local consultant." },
          { "@type": "HowToStep", "name": "Conduct due diligence", "text": "Confirm seller identity, land history, tax status, and absence of disputes. Use escrow for deposits." },
          { "@type": "HowToStep", "name": "Sign and close", "text": "Execute the sale agreement before a notary, pay taxes, and register the transfer or lease." },
        ],
      },
    ],
  };

  return (
    <div className="reos min-h-screen">
      <SEOHead
        title="How to Buy a Villa in Bali as a Foreigner"
        description="A complete 2026 guide for foreign investors buying Bali villas: leasehold vs freehold, legal ownership, area comparisons, ROI, and due diligence."
        keywords="balinese house for sale, bali villa, buy villa bali, foreigner buy property bali, leasehold bali, freehold bali, hak pakai, hak milik, bali property investment"
        canonical="https://astravilla.com/blog/bali-property-buying-guide"
        ogType="article"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0" style={{ background: "var(--hotspot-bg)" }} />
        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--gold-2)] bg-[var(--gold)]/10 px-3 py-1.5 rounded-full mb-6">
            <Home className="h-3.5 w-3.5" /> Investor Guide
          </div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            How to Buy a Villa in Bali as a Foreigner
          </h1>
          <p className="mt-5 text-lg text-[var(--text-2)] max-w-2xl mx-auto">
            A 2026 roadmap to legally and safely owning Bali real estate: ownership structures, area comparisons, ROI, and due diligence.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[var(--text-3)]">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 12 min read</span>
            <span>Updated July 2026</span>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-14">
        {/* Intro */}
        <p className="text-lg text-[var(--text-2)] leading-relaxed">
          Bali remains one of Southeast Asia's most attractive destinations for foreign property buyers. Whether you are looking for a personal villa, a vacation rental, or a long-term capital appreciation play, understanding Indonesian property law is the difference between a profitable asset and a costly mistake.
        </p>

        <p className="mt-4 text-[var(--text-2)] leading-relaxed">
          This guide explains how foreigners can legally buy property in Bali, compares leasehold and freehold structures, breaks down the most investor-friendly areas, and provides a practical checklist for safe transactions.
        </p>

        {/* Ownership comparison */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Shield className="h-5 w-5 reos-gold" /> Leasehold vs Freehold: What Foreigners Can Own
          </h2>
          <p className="mt-4 text-[var(--text-2)] leading-relaxed">
            Indonesian law does not allow foreigners to hold <em>Hak Milik</em> (freehold ownership) directly. However, there are two common legal structures for international buyers:
          </p>

          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <div className="reos-card p-6">
              <h3 className="text-lg font-semibold">Leasehold (Hak Sewa / Hak Pakai)</h3>
              <p className="mt-2 text-sm text-[var(--text-2)]">
                The most popular option for individuals. You lease the land or building from an Indonesian owner for 25–30 years, with extension options up to 80+ years.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> Lower upfront cost</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> Direct ownership possible</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> Fast transaction timeline</li>
              </ul>
            </div>
            <div className="reos-card p-6">
              <h3 className="text-lg font-semibold">Freehold via PT PMA (Hak Guna Bangunan)</h3>
              <p className="mt-2 text-sm text-[var(--text-2)]">
                A foreign-owned company (PT PMA) can hold <em>Hak Guna Bangunan</em> (HGB) for commercial property, valid for 30 years and extendable.
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> Full corporate ownership</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> Better for commercial rentals</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" /> Higher setup cost</li>
              </ul>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl border border-[var(--gold)]/30 bg-[var(--gold)]/5 text-sm">
            <strong className="text-[var(--gold-2)]">Important:</strong> Avoid nominee structures where an Indonesian citizen holds the title on your behalf. They are legally risky and unenforceable in Indonesian courts.
          </div>
        </section>

        {/* Area comparison */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <MapPin className="h-5 w-5 reos-gold" /> Bali Area Comparison for Investors
          </h2>
          <p className="mt-4 text-[var(--text-2)] leading-relaxed">
            Location determines rental yield, capital growth, and occupancy. Each area has a different risk/reward profile.
          </p>

          <div className="mt-6 grid gap-5">
            <div className="reos-card p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">Canggu & Pererenan</h3>
                <p className="text-sm text-[var(--text-2)]">Digital nomad and tourism hub. Strong short-term rental demand, but prices are elevated.</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Yield: 8–12%</span>
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Risk: Medium</span>
              </div>
            </div>
            <div className="reos-card p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">Seminyak & Legian</h3>
                <p className="text-sm text-[var(--text-2)]">Established luxury market. Premium prices, steady occupancy, lower capital growth.</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Yield: 6–9%</span>
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Risk: Low</span>
              </div>
            </div>
            <div className="reos-card p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">Uluwatu & Bukit</h3>
                <p className="text-sm text-[var(--text-2)]">Fast growth, cliffside views, surfer demand. Infrastructure is improving but still seasonal.</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Yield: 7–11%</span>
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Risk: Medium-High</span>
              </div>
            </div>
            <div className="reos-card p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">Ubud</h3>
                <p className="text-sm text-[var(--text-2)]">Wellness and long-stay market. Lower volatility, but slower appreciation than coastal areas.</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Yield: 6–8%</span>
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Risk: Low</span>
              </div>
            </div>
            <div className="reos-card p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">Sanur & Nusa Dua</h3>
                <p className="text-sm text-[var(--text-2)]">Family tourism and retirement demand. Quieter, more regulated, and often closer to hospitals and schools.</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Yield: 5–8%</span>
                <span className="px-3 py-1.5 rounded-full bg-[var(--surface)]">Risk: Low</span>
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-step process */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-5 w-5 reos-gold" /> The Buying Process: Step by Step
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              ["1. Define your budget and ownership model", "Leasehold is faster and cheaper; PT PMA is better for commercial scale and full ownership rights."],
              ["2. Pick a location and property type", "Match the area to your goal: short-term yield, long-term appreciation, or personal use."],
              ["3. Negotiate terms and sign an LOI", "A Letter of Intent locks the price and basic terms before due diligence. Use a refundable deposit."],
              ["4. Verify certificates and permits", "Confirm SHM, HGB, IMB/PBG, building permits, and zoning compliance through a certified notary."],
              ["5. Run legal and financial due diligence", "Check seller identity, outstanding taxes, previous disputes, land history, and encumbrances."],
              ["6. Execute the sale before a notary", "The notary drafts the AJB (sale deed) and handles the transfer or lease registration."],
              ["7. Register permits and open for rentals", "If you plan to rent, set up the legal entity and local permits required for short-term rentals."],
            ].map(([title, body]) => (
              <li key={title} className="reos-card p-5">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-[var(--text-2)]">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Due diligence checklist */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 reos-gold" /> Due Diligence Checklist
          </h2>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {[
              "Verify the seller matches the title certificate",
              "Check original land certificate (SHM or HGB)",
              "Confirm building permit (IMB/PBG) and zoning status",
              "Review land history and previous transactions",
              "Confirm no outstanding taxes or debts",
              "Check for disputes, mortgages, or encumbrances",
              "Use escrow for deposits and staged payments",
              "Inspect the physical property and boundaries",
              "Review access road and utility rights",
              "Get an independent valuation before closing",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ROI and risks */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">ROI, Rental Yield, and Risks</h2>
          <p className="mt-4 text-[var(--text-2)] leading-relaxed">
            Bali villas typically produce net rental yields of 6% to 12% depending on location, management, and marketing. Luxury short-term rentals in Canggu and Uluwatu can outperform, while Ubud and Sanur offer steadier, lower-volatility returns.
          </p>
          <p className="mt-4 text-[var(--text-2)] leading-relaxed">
            Key risks include regulatory changes, oversupply in hotspots, seasonal tourism swings, and poor legal structuring. The most reliable way to reduce risk is to buy in a well-documented lease, use a reputable notary, and avoid informal nominee arrangements.
          </p>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-4">
            {[
              ["Can a foreigner own land in Bali directly?", "No. Foreigners cannot hold Hak Milik (freehold land). They can lease land or use a PT PMA to hold Hak Guna Bangunan for commercial use."],
              ["What is the safest ownership structure for a foreigner?", "Leasehold with a registered Hak Pakai or Hak Sewa is the safest and most common path for individuals. PT PMA is safer for commercial investors planning scale."],
              ["How long can a leasehold last?", "Initial leases are usually 25–30 years. Extensions can bring the total term to 80 years or more, depending on the agreement."],
              ["Which areas have the highest ROI in Bali?", "Canggu, Pererenan, and Uluwatu currently offer the highest short-term rental yields, while Sanur and Ubud provide lower-risk, stable returns."],
              ["Do I need a lawyer to buy property in Bali?", "Yes. A certified Indonesian notary (PPAT) is legally required for the transfer, and an independent consultant or lawyer is strongly recommended for due diligence."],
            ].map(([q, a]) => (
              <div key={q} className="reos-card p-5">
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-2 text-sm text-[var(--text-2)]">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="mt-16 reos-card p-8 text-center">
          <h2 className="text-xl font-semibold">Ready to find your Bali villa?</h2>
          <p className="mt-2 text-[var(--text-2)] text-sm">
            Browse verified leasehold and freehold properties across Bali, with AI-powered ROI analysis and legal-ready documentation.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/search" className="btn-titanium h-10 px-6 rounded-full text-sm font-semibold inline-flex items-center gap-2">
              Browse Bali Properties <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="h-10 px-6 rounded-full text-sm font-semibold inline-flex items-center gap-2 border border-[var(--line-strong)] hover:bg-[var(--surface)] transition">
              Speak to an Advisor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
