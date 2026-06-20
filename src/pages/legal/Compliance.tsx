import { SEOHead } from "@/components/SEOHead";
import { Gavel, ShieldCheck, FileCheck, Building2, Mail } from "lucide-react";

const pillars = [
  { icon: ShieldCheck, h: "KYC & AML", p: "All investors and high-value buyers undergo identity verification aligned with Indonesian financial regulations (PPATK guidance) before transacting." },
  { icon: FileCheck, h: "Escrow & Payments", p: "Funds for qualifying transactions are processed via licensed payment partners. Escrow release follows documented milestones and dual-control approvals." },
  { icon: Building2, h: "Property Verification", p: "Listings undergo document checks (SHM/HGB/PPJB) and agent verification before being marked verified on the Platform." },
  { icon: Gavel, h: "Regulatory Alignment", p: "We align operations with applicable Indonesian property, consumer protection, and personal data protection laws (UU PDP)." },
];

export default function Compliance() {
  return (
    <div className="reos min-h-screen">
      <SEOHead title="Compliance" description="ASTRA Villa Property's compliance program: KYC/AML, escrow, property verification, and regulatory alignment." />
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
            ASTRA Villa Property operates the Platform and its built-in controls. Agents, developers, and investors are responsible for the accuracy of submitted information, completion of required verifications, and compliance with applicable local laws.
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
            <a href="mailto:compliance@astravilla.com" className="text-[var(--gold)] hover:underline">compliance@astravilla.com</a>
          </div>
        </div>
      </section>
    </div>
  );
}
