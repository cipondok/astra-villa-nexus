import React, { useState } from "react";
import { Layers, ChevronDown, ChevronUp, Copy, Check, TrendingUp, DollarSign, Users, Zap, Building, CreditCard, Wrench, Home, ShoppingBag, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminPageHeader from "./shared/AdminPageHeader";

/* ───────── types & data ───────── */

interface EcosystemLayer {
  id: string;
  phase: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  timeline: string;
  revenueOpportunity: string;
  services: { name: string; model: string; arrPotential: string }[];
  networkEffect: string;
  ltvExpansion: string;
  dependencies: string[];
  keyMetrics: { metric: string; target: string }[];
}

const layers: EcosystemLayer[] = [
  {
    id: "marketplace",
    phase: 1,
    title: "Marketplace Dominance Layer",
    icon: <Building className="h-5 w-5" />,
    description: "Establish the property marketplace as the primary liquidity engine with dominant listing inventory, investor demand density, and vendor network coverage in launch cities.",
    timeline: "Month 1-12",
    revenueOpportunity: "$0 → $1.2M ARR",
    services: [
      { name: "Property Listing Marketplace", model: "Freemium + Boost (Rp 150K-2M/listing)", arrPotential: "$400K" },
      { name: "Investor Deal Discovery", model: "Subscription (Rp 299K-999K/mo)", arrPotential: "$300K" },
      { name: "Vendor Directory & Matching", model: "Commission + Featured Slots (8-12%)", arrPotential: "$250K" },
      { name: "AI Property Valuation", model: "Freemium gateway → Premium reports (Rp 99K)", arrPotential: "$150K" },
      { name: "Market Intelligence Reports", model: "Gated content + Enterprise API", arrPotential: "$100K" },
    ],
    networkEffect: "Supply-demand flywheel: more listings attract more investors, whose inquiry velocity attracts more vendors to list. Each new listing increases the probability of a match for every investor.",
    ltvExpansion: "Base LTV: Rp 6.4M per investor, Rp 14.4M per vendor. Marketplace layer establishes the foundational engagement that all subsequent layers monetize.",
    dependencies: ["Minimum 500 active listings", "200+ monthly active investors", "50+ verified vendors"],
    keyMetrics: [
      { metric: "Listing-to-inquiry ratio", target: ">3 inquiries per listing/month" },
      { metric: "Vendor activation rate", target: ">70% list within 7 days" },
      { metric: "Investor retention (90-day)", target: ">55%" },
      { metric: "Marketplace liquidity index", target: ">65/100" },
    ],
  },
  {
    id: "transaction",
    phase: 2,
    title: "Transaction & Monetization Stack",
    icon: <CreditCard className="h-5 w-5" />,
    description: "Layer transactional revenue on top of marketplace activity by facilitating and monetizing the deal execution process — from offer to closing.",
    timeline: "Month 6-18",
    revenueOpportunity: "$1.2M → $4.5M ARR",
    services: [
      { name: "Digital Offer & Negotiation", model: "Transaction fee (0.5-1.5% of deal value)", arrPotential: "$1.2M" },
      { name: "Escrow & Payment Processing", model: "Processing fee (1-2%) + float income", arrPotential: "$600K" },
      { name: "Legal Document Automation", model: "Per-document fee (Rp 250K-1M)", arrPotential: "$350K" },
      { name: "Due Diligence Packages", model: "Bundled service fee (Rp 2-5M)", arrPotential: "$400K" },
      { name: "Agent Commission Management", model: "SaaS fee + commission split", arrPotential: "$300K" },
      { name: "Deal Analytics & Insights", model: "Premium subscription add-on", arrPotential: "$200K" },
    ],
    networkEffect: "Transaction data compounds intelligence advantage — every closed deal improves pricing models, valuation accuracy, and deal matching algorithms. Competitors cannot replicate without equal transaction volume.",
    ltvExpansion: "LTV increases 2.8x: investors transacting through ASTRA generate Rp 18M+ lifetime value vs Rp 6.4M for browse-only users.",
    dependencies: ["Marketplace liquidity index >65", "Banking partner integrations", "Legal compliance framework"],
    keyMetrics: [
      { metric: "Inquiry-to-offer conversion", target: ">12%" },
      { metric: "Transaction completion rate", target: ">35% of offers" },
      { metric: "Average transaction fee captured", target: ">Rp 15M per deal" },
      { metric: "Time to close reduction", target: "<28 days (vs 45 industry avg)" },
    ],
  },
  {
    id: "financial",
    phase: 3,
    title: "Financial & Ownership Services",
    icon: <DollarSign className="h-5 w-5" />,
    description: "Integrate mortgage origination, insurance, property management tools, and rental yield optimization to capture revenue throughout the ownership lifecycle.",
    timeline: "Month 12-30",
    revenueOpportunity: "$4.5M → $12M ARR",
    services: [
      { name: "Mortgage Marketplace", model: "Lead referral fee (0.3-0.8% of loan value)", arrPotential: "$2.5M" },
      { name: "Property Insurance Brokerage", model: "Commission (15-25% of premium)", arrPotential: "$800K" },
      { name: "Rental Management Platform", model: "SaaS (Rp 500K-2M/property/mo)", arrPotential: "$1.5M" },
      { name: "Yield Analytics & Optimization", model: "Premium subscription (Rp 999K/mo)", arrPotential: "$600K" },
      { name: "Property Tax & Compliance", model: "Service fee per filing (Rp 500K-1.5M)", arrPotential: "$400K" },
      { name: "Investment Portfolio Tracker", model: "Freemium → Pro (Rp 499K/mo)", arrPotential: "$350K" },
      { name: "Fractional Ownership Infrastructure", model: "Platform fee (2-3% of syndication)", arrPotential: "$1.2M" },
    ],
    networkEffect: "Financial services create deep switching costs — mortgage data, rental history, and portfolio analytics become increasingly valuable over time. Users with financial products active have 4.5x lower churn.",
    ltvExpansion: "LTV increases to Rp 45M+: property owners generating rental income through ASTRA remain active for 36+ months vs 16-month marketplace-only retention.",
    dependencies: ["OJK regulatory compliance", "3+ bank partnerships", ">500 completed transactions", "Rental management MVP"],
    keyMetrics: [
      { metric: "Mortgage lead conversion", target: ">8% of qualified buyers" },
      { metric: "Rental management adoption", target: ">20% of transacted properties" },
      { metric: "Financial product attach rate", target: ">35% of active investors" },
      { metric: "Owner retention (12-month)", target: ">75%" },
    ],
  },
  {
    id: "lifestyle",
    phase: 4,
    title: "Lifestyle & Ecosystem Lock-In",
    icon: <Home className="h-5 w-5" />,
    description: "Expand into adjacent services that touch every aspect of property ownership and living — creating an irreplaceable super-app ecosystem.",
    timeline: "Month 24-48",
    revenueOpportunity: "$12M → $30M+ ARR",
    services: [
      { name: "Renovation & Interior Design Marketplace", model: "Commission (10-15%) + vendor subscriptions", arrPotential: "$2.5M" },
      { name: "Home Services (Cleaning, Security, Maintenance)", model: "Recurring subscription + booking fee", arrPotential: "$1.8M" },
      { name: "Smart Home & IoT Integration", model: "Device partnerships + monitoring SaaS", arrPotential: "$800K" },
      { name: "Community & Neighborhood Intelligence", model: "Premium insights + local business ads", arrPotential: "$600K" },
      { name: "Moving & Relocation Services", model: "Referral fee + service bundling", arrPotential: "$400K" },
      { name: "Property Wellness (Energy Audit, Green Cert)", model: "Service fee + certification", arrPotential: "$350K" },
      { name: "Lifestyle Concierge for VIP Investors", model: "Premium tier (Rp 5-50M/mo)", arrPotential: "$1.5M" },
    ],
    networkEffect: "Lifestyle services create daily engagement touchpoints (vs monthly for marketplace). Users managing their home through ASTRA become dependent on the ecosystem — creating organic referrals as neighbors and friends observe the convenience.",
    ltvExpansion: "LTV reaches Rp 120M+: super-app users with 3+ active services generate 18x the revenue of marketplace-only users over a 48-month lifecycle.",
    dependencies: ["Established owner user base >5,000", "Vendor marketplace maturity", "Multi-city presence", "Mobile-first UX excellence"],
    keyMetrics: [
      { metric: "Services per user", target: ">2.5 active services avg" },
      { metric: "Daily active usage", target: ">15% of registered users" },
      { metric: "Ecosystem NPS", target: ">55" },
      { metric: "Super-app revenue share", target: ">40% of total platform revenue" },
    ],
  },
];

const phaseColors = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30",
];

/* ───────── component ───────── */

const SuperAppEcosystemPlan: React.FC = () => {
  const [expandedLayer, setExpandedLayer] = useState<string | null>("marketplace");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggle = (id: string) => setExpandedLayer(prev => (prev === id ? null : id));

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Super-App Ecosystem Blueprint"
        description="4-phase strategic architecture transforming property marketplace into full-lifecycle real estate super-app"
        icon={Layers}
        badge={{ text: "🏗️ Blueprint", variant: "outline" }}
      />

      {/* Phase Overview Timeline */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Ecosystem Expansion Roadmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {layers.map((layer, i) => (
              <div
                key={layer.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-[6px] p-3 transition-colors"
                onClick={() => toggle(layer.id)}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border ${phaseColors[i]}`}>
                  {layer.phase}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground truncate">{layer.title}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0">{layer.timeline}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">{layer.services.length} services</span>
                    <span className="text-xs font-medium text-primary">{layer.revenueOpportunity}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>

          {/* Total ARR projection */}
          <div className="mt-4 rounded-[6px] border border-border bg-primary/5 p-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Total Ecosystem ARR Target</span>
            <Badge className="text-sm">$30M+ by Month 48</Badge>
          </div>
        </CardContent>
      </Card>

      {/* LTV Expansion Model */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> User Lifetime Value Expansion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { phase: "Marketplace Only", ltv: "Rp 6.4M", multiplier: "1x", retention: "16 months" },
              { phase: "+ Transactions", ltv: "Rp 18M", multiplier: "2.8x", retention: "24 months" },
              { phase: "+ Financial", ltv: "Rp 45M", multiplier: "7x", retention: "36 months" },
              { phase: "Full Super-App", ltv: "Rp 120M+", multiplier: "18x", retention: "48+ months" },
            ].map((item, i) => (
              <div key={i} className={`rounded-[6px] border p-3 space-y-1 ${phaseColors[i]}`}>
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.phase}</span>
                <p className="text-lg font-bold">{item.ltv}</p>
                <div className="flex justify-between text-[10px]">
                  <span>{item.multiplier} LTV</span>
                  <span>{item.retention}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layer Detail Cards */}
      {layers.map((layer, layerIdx) => (
        <Card key={layer.id} className="border-border overflow-hidden">
          <CardHeader className="cursor-pointer select-none" onClick={() => toggle(layer.id)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-[6px] flex items-center justify-center border ${phaseColors[layerIdx]}`}>
                  {layer.icon}
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    Phase {layer.phase}: {layer.title}
                    <Badge variant="outline" className="text-[10px]">{layer.timeline}</Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{layer.description}</p>
                </div>
              </div>
              {expandedLayer === layer.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>

          {expandedLayer === layer.id && (
            <CardContent className="space-y-5 pt-0">
              {/* Revenue Services */}
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" /> Revenue Services ({layer.revenueOpportunity})
                </h5>
                <div className="space-y-1.5">
                  {layer.services.map((svc, i) => {
                    const svcId = `${layer.id}-svc-${i}`;
                    return (
                      <div key={i} className="flex items-center gap-3 bg-muted/30 rounded-[6px] p-2.5 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{svc.name}</p>
                          <p className="text-xs text-muted-foreground">{svc.model}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">{svc.arrPotential} ARR</Badge>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={() => copyText(`${svc.name}: ${svc.model} — ${svc.arrPotential} ARR`, svcId)}>
                          {copiedId === svcId ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Network Effect & LTV */}
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-[6px] border border-border bg-muted/30 p-3 space-y-1.5">
                  <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-primary" /> Network Effect Logic
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{layer.networkEffect}</p>
                </div>
                <div className="rounded-[6px] border border-border bg-primary/5 p-3 space-y-1.5">
                  <h5 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" /> LTV Expansion
                  </h5>
                  <p className="text-xs text-muted-foreground leading-relaxed">{layer.ltvExpansion}</p>
                </div>
              </div>

              {/* Dependencies */}
              <div>
                <h5 className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-orange-500" /> Prerequisites
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {layer.dependencies.map((dep, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{dep}</Badge>
                  ))}
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-2">Success Metrics</h5>
                <div className="grid md:grid-cols-2 gap-2">
                  {layer.keyMetrics.map((kpi, i) => (
                    <div key={i} className="flex items-center justify-between rounded-[6px] border border-border p-2">
                      <span className="text-xs text-muted-foreground">{kpi.metric}</span>
                      <Badge variant="secondary" className="text-[10px]">{kpi.target}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Ecosystem Flywheel Summary */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" /> Ecosystem Lock-In Flywheel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { title: "Data Compounding", desc: "Every transaction, viewing, and service interaction feeds AI models — improving recommendations, valuations, and matching accuracy across all layers." },
              { title: "Switching Cost Escalation", desc: "Users with mortgage, rental management, and maintenance services active face exponentially higher switching costs. 3+ services = <5% annual churn." },
              { title: "Cross-Sell Velocity", desc: "Each layer creates natural upsell triggers: buyers become owners → need management → discover renovation → engage lifestyle services." },
              { title: "Brand Gravity", desc: "Super-app positioning attracts institutional partnerships (banks, insurers, developers) that prefer single-platform integration over fragmented vendor relationships." },
            ].map((item, i) => (
              <div key={i} className="rounded-[6px] border border-border bg-muted/30 p-3 space-y-1">
                <h6 className="text-xs font-semibold text-foreground">{item.title}</h6>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAppEcosystemPlan;
