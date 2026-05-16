
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Rocket, BarChart3, Cpu, DollarSign, Megaphone, FolderOpen,
  CheckCircle, Circle, AlertTriangle, TrendingUp, Users, Building,
  Globe, Brain, FileText, Target, Shield, Zap
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  minimum_threshold: string;
  stretch_goal: string;
  priority: 'critical' | 'important' | 'nice-to-have';
}

interface ChecklistCategory {
  key: string;
  name: string;
  icon: typeof Rocket;
  color: string;
  description: string;
  items: ChecklistItem[];
}

const checklistData: ChecklistCategory[] = [
  {
    key: 'traction',
    name: 'Traction Validation',
    icon: TrendingUp,
    color: 'text-green-500',
    description: 'Prove marketplace demand with real numbers investors can verify',
    items: [
      { id: 't1', label: 'Active Listing Inventory', description: 'Total verified property listings on platform', minimum_threshold: '500+ active listings', stretch_goal: '2,000+ listings across 3+ cities', priority: 'critical' },
      { id: 't2', label: 'Monthly Active Users (MAU)', description: 'Unique users engaging with platform monthly', minimum_threshold: '5,000 MAU', stretch_goal: '25,000+ MAU with 40%+ returning', priority: 'critical' },
      { id: 't3', label: 'Monthly Organic Traffic', description: 'Google organic search visits proving SEO traction', minimum_threshold: '10,000 visits/month', stretch_goal: '50,000+ with keyword ranking proof', priority: 'critical' },
      { id: 't4', label: 'Agent Network Size', description: 'Active agents listing and responding on platform', minimum_threshold: '50 active agents', stretch_goal: '200+ agents with 70%+ activation rate', priority: 'important' },
      { id: 't5', label: 'Inquiry Volume', description: 'Monthly buyer inquiries through platform', minimum_threshold: '200 inquiries/month', stretch_goal: '1,000+ with agent response rate > 80%', priority: 'important' },
      { id: 't6', label: 'Geographic Coverage', description: 'Number of cities with meaningful supply', minimum_threshold: '2 cities with 100+ listings each', stretch_goal: '5+ cities including Jakarta, Surabaya, Bandung', priority: 'important' },
      { id: 't7', label: 'Week-over-Week Growth', description: 'Consistent upward trajectory in core metrics', minimum_threshold: '5% WoW listing or traffic growth', stretch_goal: '10%+ WoW growth sustained 8+ weeks', priority: 'nice-to-have' },
    ],
  },
  {
    key: 'product',
    name: 'Product Readiness',
    icon: Cpu,
    color: 'text-purple-500',
    description: 'Demonstrate functional AI differentiation and scalable platform architecture',
    items: [
      { id: 'p1', label: 'AI Property Valuation Engine', description: 'Automated price estimation with accuracy tracking', minimum_threshold: 'Functional with ±15% accuracy', stretch_goal: '±10% accuracy with confidence intervals', priority: 'critical' },
      { id: 'p2', label: 'AI Search & Recommendations', description: 'NLP search and personalized property matching', minimum_threshold: 'Basic NLP search working', stretch_goal: 'Personalized feed with 8%+ CTR', priority: 'critical' },
      { id: 'p3', label: 'Admin Analytics Dashboard', description: 'Real-time KPI visibility for platform health', minimum_threshold: 'Core metrics visible (users, listings, inquiries)', stretch_goal: 'Full AI health monitor, SEO tracker, growth dashboard', priority: 'important' },
      { id: 'p4', label: 'Agent Onboarding Flow', description: 'Streamlined agent registration and listing upload', minimum_threshold: 'Self-serve signup + listing in < 10 min', stretch_goal: 'Guided onboarding with quality scoring', priority: 'important' },
      { id: 'p5', label: 'Mobile Responsiveness', description: 'Full platform functionality on mobile devices', minimum_threshold: '90%+ feature parity on mobile', stretch_goal: 'Mobile-first UX with < 3s load time', priority: 'important' },
      { id: 'p6', label: 'SEO Infrastructure', description: 'Programmatic pages indexed and ranking', minimum_threshold: '500+ pages indexed by Google', stretch_goal: '5,000+ indexed with structured data markup', priority: 'nice-to-have' },
    ],
  },
  {
    key: 'financial',
    name: 'Financial Clarity',
    icon: DollarSign,
    color: 'text-blue-500',
    description: 'Show investors you understand unit economics and capital efficiency',
    items: [
      { id: 'f1', label: 'Revenue Model Documentation', description: 'Clear articulation of how the platform makes money', minimum_threshold: '3+ revenue streams identified with pricing', stretch_goal: 'Revenue model validated with early paying customers', priority: 'critical' },
      { id: 'f2', label: 'Monthly Burn Rate', description: 'Clear understanding of current spending', minimum_threshold: 'Accurate monthly burn documented', stretch_goal: 'Burn rate trending down as % of growth', priority: 'critical' },
      { id: 'f3', label: 'Funding Utilization Plan', description: '18-month allocation of raised capital', minimum_threshold: 'High-level allocation (team, marketing, tech)', stretch_goal: 'Quarterly milestones tied to spend buckets', priority: 'critical' },
      { id: 'f4', label: 'Unit Economics Awareness', description: 'CAC, LTV, and marketplace take-rate projections', minimum_threshold: 'Estimated CAC and target LTV ratio', stretch_goal: 'Validated CAC < Rp 50K with LTV/CAC > 3x', priority: 'important' },
      { id: 'f5', label: 'Runway Calculation', description: 'Months of operation at current burn', minimum_threshold: 'Current runway documented', stretch_goal: '18+ months post-raise with buffer scenarios', priority: 'important' },
      { id: 'f6', label: 'Financial Projections', description: '3-year revenue and expense forecast', minimum_threshold: 'Basic 12-month projection', stretch_goal: '36-month model with scenario analysis', priority: 'nice-to-have' },
    ],
  },
  {
    key: 'narrative',
    name: 'Investor Narrative',
    icon: Megaphone,
    color: 'text-orange-500',
    description: 'Craft a compelling story that makes investors want to bet on you',
    items: [
      { id: 'n1', label: 'Vision Statement', description: 'One-sentence articulation of the big picture', minimum_threshold: 'Clear, memorable vision statement', stretch_goal: 'Vision that passes the "tell a friend" test', priority: 'critical' },
      { id: 'n2', label: 'Market Opportunity Sizing', description: 'TAM/SAM/SOM with credible methodology', minimum_threshold: 'TAM documented with sources', stretch_goal: 'Bottom-up SAM with city-level calculations', priority: 'critical' },
      { id: 'n3', label: 'Competitive Differentiation', description: 'Why AI-powered approach wins vs. incumbents', minimum_threshold: 'Competitor matrix with clear advantages', stretch_goal: 'Defensibility thesis with data moats explained', priority: 'critical' },
      { id: 'n4', label: 'Founder-Market Fit Story', description: 'Why this founder, this market, this moment', minimum_threshold: 'Personal connection to problem articulated', stretch_goal: 'Compelling narrative with domain expertise proof', priority: 'important' },
      { id: 'n5', label: 'Why Now Argument', description: 'Market timing and technology readiness thesis', minimum_threshold: 'Key market shifts identified', stretch_goal: 'Data-backed timing thesis (AI costs, mobile penetration, regulation)', priority: 'important' },
      { id: 'n6', label: 'Exit/Returns Framing', description: 'How investors make money from this bet', minimum_threshold: 'Comparable exits referenced', stretch_goal: 'Clear path to 10-50x with milestone-based valuation', priority: 'nice-to-have' },
    ],
  },
  {
    key: 'dataroom',
    name: 'Data Room Preparation',
    icon: FolderOpen,
    color: 'text-amber-500',
    description: 'Have every document ready before the first investor meeting',
    items: [
      { id: 'd1', label: 'Pitch Deck (10-15 slides)', description: 'Concise, visual, story-driven investor presentation', minimum_threshold: 'Complete deck with all key sections', stretch_goal: 'Design-polished deck with embedded demos', priority: 'critical' },
      { id: 'd2', label: 'KPI Dashboard Snapshot', description: 'Current metrics export showing growth trajectory', minimum_threshold: 'Screenshot of key metrics with trends', stretch_goal: 'Live dashboard link with real-time data', priority: 'critical' },
      { id: 'd3', label: 'Product Demo Recording', description: 'Video walkthrough of core platform features', minimum_threshold: '3-5 min Loom-style demo', stretch_goal: 'Interactive demo environment investors can explore', priority: 'important' },
      { id: 'd4', label: 'Growth Roadmap Summary', description: '12-month execution plan with milestones', minimum_threshold: 'Quarterly milestone document', stretch_goal: 'Roadmap with dependency mapping and risk flags', priority: 'important' },
      { id: 'd5', label: 'Partnership Pipeline', description: 'Active and prospective partnership overview', minimum_threshold: 'List of partnerships with status', stretch_goal: 'Pipeline with revenue projections per partner', priority: 'important' },
      { id: 'd6', label: 'Cap Table', description: 'Current ownership structure and ESOP allocation', minimum_threshold: 'Basic cap table documented', stretch_goal: 'Modeled with post-raise dilution scenarios', priority: 'critical' },
      { id: 'd7', label: 'Legal/Corporate Documents', description: 'Company registration, IP ownership, contracts', minimum_threshold: 'PT registration complete, basic agreements', stretch_goal: 'All IP assigned, employment contracts, advisor agreements', priority: 'important' },
    ],
  },
];

const priorityConfig = {
  critical: { label: 'Critical', color: 'border-destructive/50 text-destructive bg-destructive/10' },
  important: { label: 'Important', color: 'border-amber-500/50 text-amber-500 bg-amber-500/10' },
  'nice-to-have': { label: 'Nice-to-Have', color: 'border-muted-foreground/50 text-muted-foreground bg-muted/50' },
};

const FundraisingReadinessDashboard = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalItems = checklistData.reduce((s, c) => s + c.items.length, 0);
  const checkedCount = checkedItems.size;
  const overallPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const criticalItems = checklistData.flatMap(c => c.items.filter(i => i.priority === 'critical'));
  const criticalChecked = criticalItems.filter(i => checkedItems.has(i.id)).length;
  const criticalPct = criticalItems.length > 0 ? Math.round((criticalChecked / criticalItems.length) * 100) : 0;

  const getReadinessLevel = () => {
    if (criticalPct === 100 && overallPct >= 80) return { label: 'Investor-Ready', color: 'text-green-500', icon: CheckCircle };
    if (criticalPct >= 70 && overallPct >= 50) return { label: 'Nearly Ready', color: 'text-amber-500', icon: AlertTriangle };
    return { label: 'Building Foundation', color: 'text-muted-foreground', icon: Circle };
  };

  const readiness = getReadinessLevel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fundraising Readiness</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Angel / Seed investment preparation — {totalItems} checklist items across 5 domains
        </p>
      </div>

      {/* Readiness Score */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/60 backdrop-blur-sm border-border/50 md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <readiness.icon className={`h-6 w-6 ${readiness.color}`} />
              <div>
                <p className={`text-lg font-bold ${readiness.color}`}>{readiness.label}</p>
                <p className="text-[10px] text-muted-foreground">{checkedCount}/{totalItems} items completed</p>
              </div>
            </div>
            <Progress value={overallPct} className="h-2 mb-1" />
            <p className="text-[10px] text-muted-foreground text-right">{overallPct}% overall readiness</p>
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground mb-1">Critical Items</p>
            <p className="text-2xl font-bold text-foreground">{criticalChecked}/{criticalItems.length}</p>
            <Progress value={criticalPct} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground mb-1">Categories Done</p>
            <p className="text-2xl font-bold text-foreground">
              {checklistData.filter(c => c.items.every(i => checkedItems.has(i.id))).length}/{checklistData.length}
            </p>
            <Progress value={(checklistData.filter(c => c.items.every(i => checkedItems.has(i.id))).length / checklistData.length) * 100} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Category Progress Overview */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Category Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {checklistData.map((cat) => {
            const catChecked = cat.items.filter(i => checkedItems.has(i.id)).length;
            const catPct = Math.round((catChecked / cat.items.length) * 100);
            return (
              <div key={cat.key} className="flex items-center gap-3">
                <cat.icon className={`h-4 w-4 flex-shrink-0 ${cat.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-foreground">{cat.name}</span>
                    <span className="text-[10px] text-muted-foreground">{catChecked}/{cat.items.length}</span>
                  </div>
                  <Progress value={catPct} className="h-1" />
                </div>
                <span className="text-[10px] font-medium text-foreground w-8 text-right">{catPct}%</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Detailed Checklists */}
      <Tabs defaultValue="traction" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {checklistData.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key} className="text-xs gap-1.5 data-[state=active]:bg-background">
              <cat.icon className={`h-3.5 w-3.5 ${cat.color}`} />
              {cat.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {checklistData.map((cat) => (
          <TabsContent key={cat.key} value={cat.key} className="mt-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <cat.icon className={`h-5 w-5 ${cat.color}`} />
              <div>
                <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                <p className="text-[11px] text-muted-foreground">{cat.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {cat.items.map((item) => {
                const checked = checkedItems.has(item.id);
                const pCfg = priorityConfig[item.priority];
                return (
                  <div
                    key={item.id}
                    className={`border rounded-xl p-3 transition-all ${
                      checked ? 'border-green-500/30 bg-green-500/5' : 'border-border/50 bg-card/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`text-[12px] font-medium ${checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {item.label}
                          </span>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${pCfg.color}`}>{pCfg.label}</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-1.5">{item.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-muted/30 p-1.5 border border-border/30">
                            <p className="text-[9px] text-muted-foreground mb-0.5">Minimum Threshold</p>
                            <p className="text-[10px] text-foreground">{item.minimum_threshold}</p>
                          </div>
                          <div className="rounded-lg bg-primary/5 p-1.5 border border-primary/20">
                            <p className="text-[9px] text-primary mb-0.5">Stretch Goal</p>
                            <p className="text-[10px] text-foreground">{item.stretch_goal}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Investor Meeting Prep Timeline */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Pre-Meeting Preparation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { week: '4 Weeks Before', tasks: ['Finalize pitch deck with designer review', 'Record product demo video (3-5 min)', 'Complete financial model with scenarios', 'Organize data room in Google Drive / Notion'], icon: FileText },
              { week: '2 Weeks Before', tasks: ['Practice pitch with 3+ trusted advisors', 'Update KPI dashboard with latest metrics', 'Prepare FAQ document for common objections', 'Research target investor portfolio and thesis'], icon: Users },
              { week: '1 Week Before', tasks: ['Final metrics refresh — ensure numbers are current', 'Prepare 2-minute and 10-minute pitch versions', 'Test demo environment for stability', 'Prepare follow-up email template with data room link'], icon: Zap },
              { week: 'Day Of', tasks: ['Confirm latest traction numbers memorized', 'Have backup slides ready for deep-dive questions', 'Bring printed one-pager as leave-behind', 'Set up follow-up cadence (24h thank-you, 1-week check-in)'], icon: Rocket },
            ].map((phase) => (
              <div key={phase.week} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <phase.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-foreground">{phase.week}</p>
                  <ul className="mt-1 space-y-0.5">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary">▸</span>{task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Funding Ask Framework */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Funding Ask Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                stage: 'Angel Round',
                range: 'Rp 500M – 2B ($30K – $120K)',
                dilution: '5-10%',
                use: ['Initial team (2-3 hires)', 'Marketing budget for 3 cities', 'Server and AI API costs for 6 months'],
                milestone: 'Prove product-market fit in 2 cities',
              },
              {
                stage: 'Pre-Seed',
                range: 'Rp 2B – 8B ($120K – $500K)',
                dilution: '10-15%',
                use: ['Team expansion to 8-10 people', '6-month marketing and city activation', 'AI model training and infrastructure'],
                milestone: 'Achieve 10K listings and 100K MAU',
              },
              {
                stage: 'Seed Round',
                range: 'Rp 8B – 25B ($500K – $1.5M)',
                dilution: '15-20%',
                use: ['National expansion to 10+ cities', 'Full product and engineering team', 'Aggressive user acquisition'],
                milestone: 'Path to monetization with revenue traction',
              },
            ].map((round) => (
              <div key={round.stage} className="border border-border/50 rounded-xl p-3 bg-card/40">
                <p className="text-[12px] font-semibold text-foreground mb-1">{round.stage}</p>
                <p className="text-[11px] text-primary font-medium">{round.range}</p>
                <p className="text-[10px] text-muted-foreground mb-2">Target dilution: {round.dilution}</p>
                <p className="text-[10px] font-medium text-foreground mb-1">Use of Funds:</p>
                <ul className="space-y-0.5 mb-2">
                  {round.use.map((u, i) => (
                    <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                      <span className="text-primary">•</span>{u}
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-1.5">
                  <p className="text-[9px] text-primary mb-0.5">Key Milestone</p>
                  <p className="text-[10px] text-foreground">{round.milestone}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundraisingReadinessDashboard;
