import { SEOHead } from "@/components/SEOHead";
import { Gavel, ShieldCheck, FileCheck, Building2, Mail } from "lucide-react";

const pillars = [
  { icon: Building2, h: "Listing Review", p: "Every listing submitted by an owner, agent or developer is reviewed by our team before it becomes public. Review checks the listing details; it is not a legal title or document verification." },
  { icon: ShieldCheck, h: "Lister Approval", p: "Owners, agents and developers can only post listings after an admin approves their application. Licence numbers, when given, are not independently checked." },
  { icon: FileCheck, h: "Payments", p: "Online payments and escrow are not active on the Platform yet. Do not send money through anyone claiming to act for ASTRA Villa Property." },
  { icon: Gavel, h: "Personal Data", p: "We aim to handle personal data in line with Indonesia's Personal Data Protection Law (UU PDP). See our Privacy Policy for details." },
];

export default function Compliance() {
  return (
    <div className="reos min-h-screen">
      <SEOHead title="Compliance" description="ASTRA Villa Property's current controls: listing review, lister approval and personal data handling." />
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0" style={{ background: "var(--hotspot-bg)" }} />
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
          <Gavel className="h-8 w-8 mx-auto mb-4 text-[var(--gold)]" />
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Compliance</h1>
          <p className="mt-4 text-sm text-[var(--text-2)] max-w-2xl mx-auto">
            Trust and regulatory alignment are foundational to ASTRA Villa Property. This page describes the controls currently enabled across the Platform.
          </p>
          <p className="mt-3 text-xs text-[var(--text-2)] max-w-2xl mx-auto">
            This page is maintained by ASTRA Villa Property and is not an independent certification.
          </p>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 gap-4">
          {pillars.map(({ icon: Icon, h, p }) => (
            <div key={h} className="reos-card p-5">
              <Icon className="h-5 w-5 text-[var(--gold)] mb-3" />
              <h3 className="font-medium text-[15px] mb-1.5">{h}</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">{p}</p>
            </div>
          ))}
        </div>
        <article className="mt-10">
          <h2 className="text-lg font-semibold mb-2">Shared responsibility</h2>
          <p className="text-sm text-[var(--text-2)] leading-relaxed">
            ASTRA Villa Property operates the Platform and its built-in controls. Owners, agents and developers are responsible for the accuracy of submitted information and compliance with applicable local laws.
          </p>
        </article>
        <article className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Report a concern</h2>
          <p className="text-sm text-[var(--text-2)] leading-relaxed">
            To report a suspicious listing, transaction, or security issue, please contact our compliance team. We aim to acknowledge reports within 2 business days.
          </p>
        </article>
        <div className="reos-card p-5 flex items-start gap-3 mt-6">
          <Mail className="h-4 w-4 mt-0.5 text-[var(--gold)]" />
          <div className="text-sm">
            <div className="font-medium">Compliance contact</div>
            <a href="mailto:cs@astravilla.com" className="text-[var(--gold)] hover:underline">cs@astravilla.com</a>
          </div>
        </div>
      </section>
    </div>
  );
}
