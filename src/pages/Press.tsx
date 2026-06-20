import { SEOHead } from "@/components/SEOHead";
import { Newspaper, ExternalLink } from "lucide-react";

const pressReleases = [
  {
    date: "June 2026",
    title: "ASTRA Villa Launches AI-Powered Property Valuation Engine for Indonesian Market",
    outlet: "ASTRA Villa Newsroom",
    summary: "New ML models trained on 50,000+ transactions deliver real-time property valuations with 94% accuracy.",
  },
  {
    date: "May 2026",
    title: "ASTRA Villa Raises Series A to Expand Across Southeast Asia",
    outlet: "ASTRA Villa Newsroom",
    summary: "Funding will accelerate AI R&D, expand into Singapore, Phuket, and Kuala Lumpur markets.",
  },
  {
    date: "April 2026",
    title: "Partnership Announced with Top Indonesian Property Developers",
    outlet: "ASTRA Villa Newsroom",
    summary: "Strategic integrations provide buyers exclusive early access to pre-launch developments.",
  },
];

const brandAssets = [
  { label: "ASTRA Villa Logo Kit", url: "#" },
  { label: "Brand Guidelines", url: "#" },
  { label: "Leadership Bios & Photos", url: "#" },
  { label: "Fact Sheet", url: "#" },
];

export default function PressPage() {
  return (
    <div className="reos min-h-screen">
      <SEOHead title="Press" description="ASTRA Villa Property press releases, media kit, and brand assets." />

      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0" style={{ background: "var(--hotspot-bg)" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Press & Media</h1>
          <p className="mt-5 text-lg text-[var(--text-2)] max-w-2xl mx-auto">
            Latest news, press releases, and brand resources for journalists and partners.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-semibold mb-8 inline-flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-[var(--gold-2)]" /> Press Releases
        </h2>
        <div className="space-y-4">
          {pressReleases.map((item) => (
            <div key={item.title} className="reos-card p-6 hover:border-[var(--line-strong)] transition">
              <div className="text-xs text-[var(--gold-2)] font-medium tracking-wide uppercase">{item.date}</div>
              <h3 className="mt-2 text-lg font-medium leading-snug">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-2)]">{item.summary}</p>
              <div className="mt-4 text-xs text-[var(--text-3)]">{item.outlet}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-semibold mb-8">Brand Assets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {brandAssets.map((asset) => (
            <a
              key={asset.label}
              href={asset.url}
              className="reos-card p-5 flex items-center justify-between hover:border-[var(--line-strong)] transition"
            >
              <span className="font-medium text-sm">{asset.label}</span>
              <ExternalLink className="h-4 w-4 text-[var(--text-3)]" />
            </a>
          ))}
        </div>

        <div className="mt-10 reos-card p-8">
          <h3 className="text-lg font-medium">Media Inquiries</h3>
          <p className="mt-2 text-sm text-[var(--text-2)]">
            For interview requests, speaker bookings, or partnership discussions, reach out to our communications team.
          </p>
          <a
            href="mailto:press@astravilla.com"
            className="mt-4 inline-block text-sm font-medium text-[var(--gold-2)] hover:underline"
          >
            press@astravilla.com
          </a>
        </div>
      </section>
    </div>
  );
}
