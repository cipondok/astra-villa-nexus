import React from "react";
import { Link } from "react-router-dom";

import {
  Sparkles, Search, MapPin, Image as ImageIcon, Home, Calculator, FileText,
  Shield, TrendingUp, Users, MessageSquare, Palette, Wand2, Brain, Building2,
  LineChart, ClipboardCheck, Video, ScrollText,
} from "lucide-react";

type Tool = {
  to: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
};

const TOOLS: Tool[] = [
  { to: "/ai-search", title: "AI Search Assistant", description: "Natural-language property search", icon: Search, category: "Discovery" },
  { to: "/ai-map", title: "AI Map Search", description: "Explore listings by area intelligence", icon: MapPin, category: "Discovery" },
  { to: "/recommendations", title: "AI Recommendations", description: "Personalized property matches", icon: Sparkles, category: "Discovery" },
  { to: "/neighborhood-insights", title: "Neighborhood Insights", description: "Live area intelligence", icon: Building2, category: "Discovery" },

  { to: "/ai-property-valuation", title: "AI Property Valuation", description: "Instant market-based valuation", icon: Calculator, category: "Valuation" },
  { to: "/ai-pricing", title: "AI Price Estimator", description: "Fair market price estimator", icon: TrendingUp, category: "Valuation" },
  { to: "/ai-smart-pricing", title: "Smart Pricing", description: "Dynamic pricing engine", icon: LineChart, category: "Valuation" },
  { to: "/ml-valuation-engine", title: "ML Valuation Engine", description: "Model-driven valuation", icon: Brain, category: "Valuation" },
  { to: "/ai-rental-yield", title: "Rental Yield AI", description: "Yield & ROI forecasting", icon: TrendingUp, category: "Valuation" },
  { to: "/comparative-market-analysis", title: "CMA Report", description: "Comparative market analysis", icon: LineChart, category: "Valuation" },

  { to: "/ai-listing-generator", title: "Listing Generator", description: "AI-written listing copy", icon: Wand2, category: "Content" },
  { to: "/ai-content-generator", title: "Content Generator", description: "Marketing content on demand", icon: FileText, category: "Content" },
  { to: "/ai-social-copy", title: "Social Copy", description: "Social media captions", icon: MessageSquare, category: "Content" },
  { to: "/ai-image-enhance", title: "Image Enhancer", description: "Upscale & polish photos", icon: ImageIcon, category: "Content" },
  { to: "/ai-interior-design", title: "AI Interior Design", description: "Restyle rooms with AI", icon: Palette, category: "Content" },
  { to: "/virtual-staging", title: "Virtual Staging", description: "Stage rooms virtually", icon: Home, category: "Content" },
  { to: "/virtual-tour-generator", title: "Virtual Tour", description: "Generate a video tour", icon: Video, category: "Content" },

  { to: "/ai-document-generator", title: "Document Generator", description: "Drafts contracts & letters", icon: ScrollText, category: "Legal & Docs" },
  { to: "/ai-document-verifier", title: "Document Verifier", description: "Verify legal documents", icon: ClipboardCheck, category: "Legal & Docs" },
  { to: "/contract-analyzer", title: "Contract Analyzer", description: "Explain contract risks", icon: FileText, category: "Legal & Docs" },
  { to: "/fraud-detector", title: "Fraud Detector", description: "Detect listing fraud", icon: Shield, category: "Legal & Docs" },

  { to: "/ai-mortgage-advisor", title: "Mortgage Advisor", description: "Personalized financing", icon: Calculator, category: "Finance" },
  { to: "/investment-scenario-simulator", title: "Scenario Simulator", description: "Simulate investments", icon: LineChart, category: "Finance" },
  { to: "/wealth-simulator", title: "Wealth Simulator", description: "Long-term wealth model", icon: TrendingUp, category: "Finance" },

  { to: "/ai-lead-scoring", title: "Lead Scoring", description: "Prioritize hottest leads", icon: Users, category: "Agent Tools" },
  { to: "/ai-tenant-matching", title: "Tenant Matching", description: "Match tenants to units", icon: Users, category: "Agent Tools" },
  { to: "/tenant-screening", title: "Tenant Screening", description: "Screen tenant risk", icon: Shield, category: "Agent Tools" },
];

const CATEGORIES = [
  "Discovery", "Valuation", "Content", "Legal & Docs", "Finance", "Agent Tools",
] as const;

const AICenter: React.FC = () => {
  React.useEffect(() => {
    const prev = document.title;
    document.title = "AI Center | ASTRA Villa Property";
    return () => { document.title = prev; };
  }, []);
  return (
    <>


      <main className="container mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Center
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Every AI tool, one place
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            The ASTRA Villa AI ecosystem — valuation, discovery, content, legal,
            finance and agent intelligence, unified.
          </p>
        </header>

        <div className="space-y-12">
          {CATEGORIES.map((cat) => {
            const items = TOOLS.filter((t) => t.category === cat);
            if (!items.length) return null;
            return (
              <section key={cat} aria-labelledby={`cat-${cat}`}>
                <h2
                  id={`cat-${cat}`}
                  className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  {cat}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(({ to, title, description, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      className="group relative flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 transition-all hover:border-primary/50 hover:bg-card"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {description}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
};

export default AICenter;
