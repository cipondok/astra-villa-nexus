import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Newspaper, Search, Rocket, Bug, Sparkles, Wrench, Shield, Zap } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  type: "feature" | "fix" | "improvement" | "security" | "performance";
  items: string[];
}

const typeConfig = {
  feature: { icon: Sparkles, color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", label: "Feature" },
  fix: { icon: Bug, color: "bg-destructive/15 text-destructive", label: "Bug Fix" },
  improvement: { icon: Wrench, color: "bg-blue-500/15 text-blue-700 dark:text-blue-400", label: "Improvement" },
  security: { icon: Shield, color: "bg-amber-500/15 text-amber-700 dark:text-amber-400", label: "Security" },
  performance: { icon: Zap, color: "bg-purple-500/15 text-purple-700 dark:text-purple-400", label: "Performance" },
};

const changelog: ChangelogEntry[] = [
  {
    version: "3.8.0",
    date: "2026-03-05",
    title: "AI Auto-Tune & Analytics Expansion",
    type: "feature",
    items: [
      "Added auto_tune_ai_weights mode to core-engine with ±3 guardrails and data sufficiency checks",
      "Created AI Weight Tuning History dashboard with LineChart visualization",
      "Built batch-dom-predictor edge function with daily cron automation",
      "Added Revenue Analytics dashboard with transaction trend charts",
      "Created User Engagement Analytics with DAU/MAU, retention, and device breakdown",
      "Built Notification Templates Manager with variable preview",
      "Added Data Backup & Export tool with multi-table CSV/JSON download",
      "Created Audit Trail dashboard with paginated activity log viewer",
      "Added Bulk Property Actions for mass status updates and export",
    ],
  },
  {
    version: "3.7.0",
    date: "2026-03-03",
    title: "System Health & Admin Tools",
    type: "feature",
    items: [
      "Built System Health Dashboard with real-time DB/Auth/Storage/Edge latency monitoring",
      "Created Admin Guide & Documentation with searchable accordion",
      "Added Off-Plan Project Manager with construction milestone tracking",
      "Implemented Cron Job Monitor for pg_cron scheduled tasks",
      "Created DOM Prediction Accuracy report comparing predicted vs actual days-on-market",
    ],
  },
  {
    version: "3.6.0",
    date: "2026-02-28",
    title: "AI Performance & Model Weights",
    type: "feature",
    items: [
      "Added AI Performance Dashboard with CTR and engagement metrics",
      "Created AI Model Weights panel with Radar/Bar chart visualization",
      "Built core-engine edge function supporting 6 operational modes",
      "Implemented ai_recommendation_events tracking for conversion correlation",
    ],
  },
  {
    version: "3.5.0",
    date: "2026-02-20",
    title: "Investor Management & Blockchain",
    type: "feature",
    items: [
      "WNA/WNI investor settings hub with country eligibility management",
      "Blockchain Management for smart contracts, escrow, and tokenized deeds",
      "Partnership Programs with referral tracking and payout management",
      "B2B Data Marketplace for enterprise clients and API access",
    ],
  },
  {
    version: "3.4.1",
    date: "2026-02-15",
    title: "Security Hardening",
    type: "security",
    items: [
      "Added rate limiting dashboard with IP blocking and abuse detection",
      "Implemented CAPTCHA security for registration and contact forms",
      "Enhanced RLS policies across all tables",
      "Added account lockout after failed login attempts",
    ],
  },
  {
    version: "3.4.0",
    date: "2026-02-10",
    title: "Vendor & KYC System",
    type: "feature",
    items: [
      "Comprehensive Vendors Hub with service management and analytics",
      "Video Verification Review for Level 4 identity checks",
      "Bulk KYC Operations for batch approve/reject workflows",
      "Document OCR Scanner with Tesseract.js integration",
      "AHU Company Checker for PT registration verification",
    ],
  },
  {
    version: "3.3.0",
    date: "2026-02-01",
    title: "Performance Optimization",
    type: "performance",
    items: [
      "Lazy-loaded 30+ admin components reducing initial bundle by ~60%",
      "Added retry-aware lazy loader with 3-attempt recovery",
      "Implemented virtual scrolling for large data tables",
      "Optimized Supabase queries with selective column fetching",
    ],
  },
  {
    version: "3.2.0",
    date: "2026-01-25",
    title: "Bug Fixes & Stability",
    type: "fix",
    items: [
      "Fixed admin sidebar navigation state persistence across page reloads",
      "Resolved auth timeout redirect loop on slow connections",
      "Fixed property filter reset not clearing URL parameters",
      "Corrected transaction summary view aggregation for cancelled orders",
    ],
  },
];

const PlatformChangelog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = changelog.filter((entry) => {
    const matchSearch =
      !searchTerm ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.items.some((i) => i.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = typeFilter === "all" || entry.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Platform Changelog</h2>
          <Badge variant="outline" className="text-xs">v{changelog[0].version}</Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search changes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1">
          {["all", "feature", "fix", "improvement", "security", "performance"].map((t) => (
            <Badge
              key={t}
              variant={typeFilter === t ? "default" : "outline"}
              className="cursor-pointer text-xs capitalize"
              onClick={() => setTypeFilter(t)}
            >
              {t === "all" ? "All" : typeConfig[t as keyof typeof typeConfig]?.label || t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <ScrollArea className="h-[600px]">
        <div className="relative pl-6 space-y-4">
          {/* Timeline line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border/60" />

          {filtered.map((entry) => {
            const config = typeConfig[entry.type];
            const Icon = config.icon;
            return (
              <div key={entry.version} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-6 top-3 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>

                <Card className="border-border/40">
                  <CardHeader className="pb-2 pt-3 px-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs font-mono">v{entry.version}</Badge>
                        <CardTitle className="text-sm">{entry.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-1.5 ${config.color}`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{entry.date}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <ul className="space-y-1">
                      {entry.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlatformChangelog;
