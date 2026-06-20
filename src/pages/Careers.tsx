import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/useTranslation";
import { Briefcase, MapPin, Clock, ChevronRight, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const openRoles = [
  { title: "Senior Full-Stack Engineer", department: "Engineering", location: "Remote / Jakarta", type: "Full-time" },
  { title: "AI/ML Engineer — Property Intelligence", department: "Engineering", location: "Remote / Singapore", type: "Full-time" },
  { title: "Product Designer", department: "Design", location: "Remote / Bali", type: "Full-time" },
  { title: "Property Investment Analyst", department: "Research", location: "Jakarta", type: "Full-time" },
  { title: "Growth Marketing Manager", department: "Marketing", location: "Remote", type: "Full-time" },
  { title: "Customer Success Lead", department: "Operations", location: "Jakarta / Bali", type: "Full-time" },
];

export default function CareersPage() {
  const { t } = useTranslation();

  return (
    <div className="reos min-h-screen">
      <SEOHead title="Careers" description="Join ASTRA Villa Property and build Southeast Asia's premier AI-powered real estate platform." />

      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0" style={{ background: "var(--hotspot-bg)" }} />
        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Build the Future of Real Estate</h1>
          <p className="mt-5 text-lg text-[var(--text-2)] max-w-2xl mx-auto">
            Join a team of engineers, designers, and property experts building Southeast Asia's premier AI-powered real estate operating system.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="reos-chip px-3 py-1 rounded-full text-xs">Remote-first</span>
            <span className="reos-chip px-3 py-1 rounded-full text-xs">Competitive equity</span>
            <span className="reos-chip px-3 py-1 rounded-full text-xs">Flexible PTO</span>
            <span className="reos-chip px-3 py-1 rounded-full text-xs">Learning budget</span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-semibold mb-8">Open Positions</h2>
        <div className="space-y-3">
          {openRoles.map((role) => (
            <div key={role.title} className="reos-card p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 hover:border-[var(--line-strong)] transition">
              <div className="flex-1">
                <h3 className="font-medium text-[15px]">{role.title}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-2)]">
                  <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" /> {role.department}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {role.location}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {role.type}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.location.href = "mailto:careers@astravilla.com"}
                className="btn-titanium text-xs px-4 py-2 rounded-lg font-medium inline-flex items-center gap-1.5 shrink-0"
              >
                Apply <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 reos-card p-8 text-center">
          <h3 className="text-lg font-medium">Don’t see your role?</h3>
          <p className="mt-2 text-sm text-[var(--text-2)] max-w-md mx-auto">
            We’re always looking for exceptional talent. Send us your portfolio and a note about what you’d like to build.
          </p>
          <a
            href="mailto:careers@astravilla.com"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--gold-2)] hover:underline"
          >
            <Mail className="h-4 w-4" /> careers@astravilla.com
          </a>
        </div>
      </section>
    </div>
  );
}
