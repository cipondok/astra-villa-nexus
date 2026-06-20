import { SEOHead } from "@/components/SEOHead";
import { Cookie, Mail } from "lucide-react";

const categories = [
  { h: "Essential Cookies", p: "Required for core functionality such as authentication, session management, and security. The Platform cannot function correctly without these." },
  { h: "Preference Cookies", p: "Remember your language (default: Bahasa Indonesia), currency (IDR), saved searches, and theme preferences." },
  { h: "Analytics Cookies", p: "Help us understand how visitors interact with the Platform so we can improve performance and discover-ability of listings." },
  { h: "Marketing Cookies", p: "Used to measure the effectiveness of campaigns and to show relevant property recommendations on partner sites. You can opt out from your cookie preferences." },
];

export default function Cookies() {
  return (
    <div className="reos min-h-screen">
      <SEOHead title="Cookie Policy" description="How ASTRA Villa Property uses cookies and similar technologies." />
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0" style={{ background: "var(--hotspot-bg)" }} />
        <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-20 text-center">
          <Cookie className="h-8 w-8 mx-auto mb-4 text-[var(--gold)]" />
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Cookie Policy</h1>
          <p className="mt-4 text-sm text-[var(--text-2)]">Last updated: January 2026</p>
          <p className="mt-3 text-xs text-[var(--text-2)] max-w-2xl mx-auto">
            This page is maintained by ASTRA Villa Property and explains how cookies and similar technologies are used on the Platform.
          </p>
        </div>
      </section>
      <section className="max-w-3xl mx-auto px-6 py-14 space-y-6">
        <p className="text-sm text-[var(--text-2)] leading-relaxed">
          Cookies are small text files stored on your device that help the Platform remember information about your visit. We use both first-party and approved third-party cookies.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {categories.map((c) => (
            <div key={c.h} className="reos-card p-5">
              <h3 className="font-medium text-[15px] mb-2">{c.h}</h3>
              <p className="text-xs text-[var(--text-2)] leading-relaxed">{c.p}</p>
            </div>
          ))}
        </div>
        <article className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Managing your preferences</h2>
          <p className="text-sm text-[var(--text-2)] leading-relaxed">
            You can adjust non-essential cookies at any time from the cookie banner or your browser settings. Disabling essential cookies may prevent the Platform from functioning correctly.
          </p>
        </article>
        <div className="reos-card p-5 flex items-start gap-3 mt-6">
          <Mail className="h-4 w-4 mt-0.5 text-[var(--gold)]" />
          <div className="text-sm">
            <div className="font-medium">Questions about cookies</div>
            <a href="mailto:privacy@astravilla.com" className="text-[var(--gold)] hover:underline">privacy@astravilla.com</a>
          </div>
        </div>
      </section>
    </div>
  );
}
