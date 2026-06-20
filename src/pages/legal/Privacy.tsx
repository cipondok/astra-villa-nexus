import { SEOHead } from "@/components/SEOHead";
import { Lock, Mail } from "lucide-react";

const sections = [
  { h: "1. Information We Collect", p: "We collect information you provide directly (account details, KYC documents, property preferences) and information generated through use of the Platform (device data, search activity, transaction history)." },
  { h: "2. How We Use Information", p: "Information is used to operate the Platform, personalize recommendations, process transactions, comply with legal obligations, and improve our AI-powered intelligence features." },
  { h: "3. Sharing of Information", p: "We share information with agents, developers, payment providers, escrow partners, identity verification providers, and authorities when required by law. We do not sell personal data." },
  { h: "4. Data Retention", p: "Personal data is retained for as long as your account is active and for the period required to comply with Indonesian financial and tax regulations." },
  { h: "5. Your Rights", p: "Subject to applicable law, you may request access, correction, deletion, or portability of your personal data. Submit requests via privacy@astravilla.com." },
  { h: "6. Security", p: "The Platform uses encryption in transit, role-based access controls, and row-level security on backend data stores. No system is fully immune to risk — please use a strong password and enable available verification controls." },
  { h: "7. International Transfers", p: "Some service providers may process data outside Indonesia. We use contractual safeguards consistent with applicable data protection laws." },
  { h: "8. Children's Privacy", p: "The Platform is not intended for users under 18. We do not knowingly collect personal data from minors." },
  { h: "9. Changes to This Policy", p: "We will post updates to this policy on this page and, where appropriate, notify you via email or in-app notification." },
];

export default function Privacy() {
  return (
    <div className="reos min-h-screen">
      <SEOHead title="Privacy Policy" description="How ASTRA Villa Property collects, uses, and protects your personal data." />
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0" style={{ background: "var(--hotspot-bg)" }} />
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
          <Lock className="h-8 w-8 mx-auto mb-4 text-[var(--gold)]" />
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-sm text-[var(--text-2)]">Last updated: January 2026</p>
          <p className="mt-3 text-xs text-[var(--text-2)] max-w-2xl mx-auto">
            This page is maintained by ASTRA Villa Property to explain how we handle personal information. It describes our current practices and is not a certification.
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
            <div className="font-medium">Privacy requests</div>
            <a href="mailto:privacy@astravilla.com" className="text-[var(--gold)] hover:underline">privacy@astravilla.com</a>
          </div>
        </div>
      </section>
    </div>
  );
}
