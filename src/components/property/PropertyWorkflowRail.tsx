import { Link } from "react-router-dom";
import {
  Sparkles,
  Gauge,
  TrendingUp,
  ScrollText,
  Landmark,
  CalendarCheck,
} from "lucide-react";

/**
 * PropertyWorkflowRail
 *
 * Connects a Property Detail page into the wider ASTRA Villa REOS workflow.
 * Every card links into an existing module — no new pages, no new logic.
 *
 *   Property → AI Analysis → AI Valuation → Investment Score →
 *   Legal Verification → Mortgage → Book Viewing → CRM (via booking)
 */
export interface PropertyWorkflowRailProps {
  propertyId: string;
  price?: number | null;
  className?: string;
}

interface WorkflowStep {
  key: string;
  to: string;
  eyebrow: string;
  title: string;
  desc: string;
  icon: typeof Sparkles;
}

export function PropertyWorkflowRail({
  propertyId,
  price,
  className,
}: PropertyWorkflowRailProps) {
  const priceQ = price ? `&price=${price}` : "";

  const steps: WorkflowStep[] = [
    {
      key: "analysis",
      to: `/property-analysis/${propertyId}`,
      eyebrow: "Step 01",
      title: "AI Deep Analysis",
      desc: "Full intelligence report — market, risk, liquidity.",
      icon: Sparkles,
    },
    {
      key: "valuation",
      to: `/ai-property-valuation?propertyId=${propertyId}${priceQ}`,
      eyebrow: "Step 02",
      title: "AI Valuation",
      desc: "Instant fair-value estimate with confidence band.",
      icon: Gauge,
    },
    {
      key: "investment",
      to: `/wealth-advisor?propertyId=${propertyId}${priceQ}`,
      eyebrow: "Step 03",
      title: "Investment Score",
      desc: "ROI, yield and portfolio-fit projections.",
      icon: TrendingUp,
    },
    {
      key: "legal",
      to: `/legal-services?propertyId=${propertyId}`,
      eyebrow: "Step 04",
      title: "Legal Verification",
      desc: "Title, permits and due-diligence workflow.",
      icon: ScrollText,
    },
    {
      key: "mortgage",
      to: `/ai-mortgage-advisor?propertyId=${propertyId}${priceQ}`,
      eyebrow: "Step 05",
      title: "Mortgage & KPR",
      desc: "Financing options tailored to this listing.",
      icon: Landmark,
    },
    {
      key: "booking",
      to: `/booking/${propertyId}`,
      eyebrow: "Step 06",
      title: "Book Viewing",
      desc: "Schedule a private tour — routed to CRM.",
      icon: CalendarCheck,
    },
  ];

  return (
    <section
      aria-label="Property workflow"
      className={className}
    >
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-luxe-mut">
            Operating System
          </div>
          <h2 className="font-serif-l text-[22px] mt-1">Take this property further</h2>
        </div>
        <div className="text-[11px] text-luxe-mut hidden md:block">
          Every step connects to your dashboard & CRM
        </div>
      </div>

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.key}>
              <Link
                to={s.to}
                className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-[var(--luxe-gold)]/40 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--luxe-gold)]/60"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--luxe-gold)]/12 text-[var(--luxe-gold)] ring-1 ring-[var(--luxe-gold)]/25">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-luxe-mut">
                    {s.eyebrow}
                  </span>
                </div>
                <h3 className="mt-4 font-serif-l text-[17px] leading-snug">
                  {s.title}
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-luxe-mut">
                  {s.desc}
                </p>
                <div className="mt-4 text-[11px] text-[var(--luxe-gold)] opacity-0 transition-opacity group-hover:opacity-100">
                  Open →
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default PropertyWorkflowRail;
