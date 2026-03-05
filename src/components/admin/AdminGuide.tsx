import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, Building, Users, BarChart3, Shield, Zap, Coins, Wrench, Headphones, Globe, Settings, Cpu, TestTube2, HelpCircle } from "lucide-react";

interface GuideSection {
  category: string;
  icon: React.ReactNode;
  items: { title: string; description: string }[];
}

const guideSections: GuideSection[] = [
  {
    category: "Dashboard & Overview",
    icon: <BarChart3 className="h-4 w-4" />,
    items: [
      { title: "Dashboard Overview", description: "The main dashboard shows KPI cards (total users, properties, revenue, active sessions), recent activity feed, and quick-action shortcuts to commonly used sections." },
      { title: "Project Map", description: "Visual map of the entire project structure including database tables, edge functions, components, and their relationships. Useful for onboarding new team members." },
    ],
  },
  {
    category: "Property Management",
    icon: <Building className="h-4 w-4" />,
    items: [
      { title: "Property Management Hub", description: "Central hub for all property CRUD operations. Supports bulk actions (approve, reject, feature), image management, and status transitions (draft → active → sold)." },
      { title: "Off-Plan Project Manager", description: "Track construction milestones for off-plan developments. Set completion percentages, milestone dates, and notify interested buyers automatically." },
      { title: "Sample Property Generator", description: "Generate AI-powered sample properties with realistic images for each kelurahan/desa. Useful for demos and testing." },
      { title: "Property Filters", description: "Configure which filters appear on the search page for rent, sale, and new project listings." },
    ],
  },
  {
    category: "User Management",
    icon: <Users className="h-4 w-4" />,
    items: [
      { title: "User Management Hub", description: "View all registered users, their roles, verification status, and activity. Supports ban, suspend, and role assignment." },
      { title: "User Levels & Membership", description: "Configure membership tiers: Basic → Verified → VIP → Gold → Platinum → Diamond. Each tier unlocks features and listing limits." },
      { title: "KYC & Verification", description: "Review KYC submissions (KTP, NPWP, SIUP), video verification sessions, and bulk approve/reject applications." },
      { title: "Upgrade Applications", description: "Process user requests to upgrade roles to Property Owner, Vendor, or Agent with document verification." },
    ],
  },
  {
    category: "AI & Analytics",
    icon: <Zap className="h-4 w-4" />,
    items: [
      { title: "AI Model Weights", description: "View and auto-tune the 6 scoring factors (location, price, feature, investment, popularity, collaborative). Weights are normalized to sum=100 with ±3 max change guardrails." },
      { title: "DOM Prediction Accuracy", description: "Compare predicted days-on-market vs actual sold dates. Tracks MAE, RMSE, and accuracy distribution." },
      { title: "Weight Tuning History", description: "Historical view of all weight changes across auto-tune cycles with visual diff charts." },
      { title: "AI Performance", description: "Track CTR, engagement, and conversion metrics for AI-powered recommendations." },
      { title: "Algorithm Dashboard", description: "Monitor search algorithms, ranking distributions, and user behavior patterns." },
    ],
  },
  {
    category: "Transactions & Payments",
    icon: <Coins className="h-4 w-4" />,
    items: [
      { title: "Transaction Hub", description: "Complete transaction lifecycle management with tabs for active transactions, tax config, live monitor, audit trail, and feedback." },
      { title: "ASTRA Token", description: "Manage the platform token economy including earn/spend rules, daily check-in rewards, and token analytics." },
      { title: "Mortgage Management", description: "Partner bank management, interest rate configuration, and KPR customer inquiry tracking." },
    ],
  },
  {
    category: "Technical & System",
    icon: <Cpu className="h-4 w-4" />,
    items: [
      { title: "Cron Job Monitor", description: "View all pg_cron scheduled jobs, their schedules, and execution history with success/failure tracking." },
      { title: "System Health", description: "Real-time monitoring of database, auth, storage, and edge function health with latency tracking." },
      { title: "Error Monitoring", description: "Track 404 errors, runtime exceptions, and database errors with IP-based filtering." },
      { title: "Security Monitoring", description: "Monitor failed login attempts, suspicious activity, account lockouts, and IP-based threats." },
      { title: "Rate Limiting", description: "Configure API rate limits, manage blocked IPs, and monitor abuse patterns." },
    ],
  },
  {
    category: "Content & Settings",
    icon: <Settings className="h-4 w-4" />,
    items: [
      { title: "System Settings", description: "Global platform configuration including branding, feature toggles, SEO defaults, and notification preferences." },
      { title: "Homepage Slider", description: "Manage hero slider images for desktop/tablet/mobile with auto-advance and CTA configuration." },
      { title: "Auth & Registration", description: "Configure login methods, signup rewards, social login providers, and registration flow." },
    ],
  },
];

const AdminGuide = () => {
  const [search, setSearch] = useState("");

  const filtered = guideSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((s) => s.items.length > 0);

  const totalItems = guideSections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Admin Guide & Documentation
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalItems} documented features across {guideSections.length} categories
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documentation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((section) => (
          <Card key={section.category} className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {section.icon}
                {section.category}
                <Badge variant="secondary" className="ml-auto text-xs">
                  {section.items.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="space-y-1">
                {section.items.map((item) => (
                  <AccordionItem key={item.title} value={item.title} className="border-none">
                    <AccordionTrigger className="text-sm py-2 hover:no-underline hover:text-primary">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground pb-3">
                      {item.description}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No results for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGuide;
