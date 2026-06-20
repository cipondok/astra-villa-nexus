import { SEOHead } from "@/components/SEOHead";
import { ScrollText, Mail } from "lucide-react";

const sections = [
  { h: "1. Acceptance of Terms", p: "By accessing or using ASTRA Villa Property (the \"Platform\"), you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the Platform." },
  { h: "2. Eligibility", p: "You must be at least 18 years old and legally capable of entering into binding contracts under the laws of the Republic of Indonesia or your jurisdiction of residence." },
  { h: "3. Use of the Platform", p: "You agree to use the Platform only for lawful purposes related to discovering, listing, transacting, or investing in real estate. You may not misuse listings, scrape data without permission, or attempt to disrupt the service." },
  { h: "4. Listings & Content", p: "Property listings, photos, and descriptions are provided by agents, owners, or developers. ASTRA Villa Property does not guarantee accuracy of third-party content and recommends independent verification before any transaction." },
  { h: "5. Transactions & Escrow", p: "Where escrow or payment facilities are provided, transactions are governed by the terms of the underlying payment provider and the escrow agreement presented at checkout." },
  { h: "6. Intellectual Property", p: "All Platform trademarks, software, and original content are owned by ASTRA Villa Property or its licensors. You may not reproduce or redistribute without written consent." },
  { h: "7. Limitation of Liability", p: "The Platform is provided on an \"as is\" basis. To the maximum extent permitted by law, ASTRA Villa Property is not liable for indirect, incidental, or consequential damages arising from use of the Platform." },
  { h: "8. Governing Law", p: "These Terms are governed by the laws of the Republic of Indonesia. Any disputes shall be resolved in the competent courts of Jakarta." },
  { h: "9. Changes to Terms", p: "We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes acceptance of the revised Terms." },
];

export default function Terms() {
  return (
    <div className="reos min-h-screen">
      <SEOHead title="Terms of Service" description="Terms of Service for ASTRA Villa Property — Indonesia's premier AI-powered real estate platform." />
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0" style={{ background: "var(--hotspot-bg)" }} />
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
          <ScrollText className="h-8 w-8 mx-auto mb-4 text-[var(--gold)]" />
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="mt-4 text-sm text-[var(--text-2)]">Last updated: January 2026</p>
          <p className="mt-3 text-xs text-[var(--text-2)] max-w-2xl mx-auto">
            This page is maintained by ASTRA Villa Property to describe the terms governing use of the Platform. It is not independent legal advice — please consult counsel for specific situations.
          </p>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-6 py-14 space-y-8">
        {sections.map((s) => (
          <article key={s.h}>
            <h2 className="text-lg font-semibold mb-2">{s.h}</h2>
            <p className="text-sm text-[var(--text-2)] leading-relaxed">{s.p}</p>
          </article>
        ))}
        <div className="reos-card p-5 flex items-start gap-3 mt-10">
          <Mail className="h-4 w-4 mt-0.5 text-[var(--gold)]" />
          <div className="text-sm">
            <div className="font-medium">Questions about these Terms?</div>
            <a href="mailto:legal@astravilla.com" className="text-[var(--gold)] hover:underline">legal@astravilla.com</a>
          </div>
        </div>
      </section>
    </div>
  );
}
