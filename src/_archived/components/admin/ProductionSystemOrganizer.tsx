import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle, AlertTriangle, XCircle, Users, Building, Store,
  DollarSign, Shield, Activity, Layers, Target, Zap
} from 'lucide-react';

const StatusIcon = ({ status }: { status: 'done' | 'partial' | 'missing' }) => {
  if (status === 'done') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (status === 'partial') return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <XCircle className="h-4 w-4 text-red-500" />;
};

const StatusBadge = ({ status }: { status: 'done' | 'partial' | 'missing' }) => {
  const map = {
    done: { label: 'Implemented', variant: 'default' as const, cls: 'bg-emerald-600' },
    partial: { label: 'Partial', variant: 'secondary' as const, cls: 'bg-amber-500 text-white' },
    missing: { label: 'Missing', variant: 'destructive' as const, cls: 'bg-red-500' },
  };
  const s = map[status];
  return <Badge className={s.cls}>{s.label}</Badge>;
};

const roles = [
  { role: 'general_user', desc: 'Buyer / Renter — browse, save, inquire', status: 'done' as const },
  { role: 'property_owner', desc: 'List properties, seller tools, analytics', status: 'done' as const },
  { role: 'agent', desc: 'Manage deals, clients, commissions', status: 'done' as const },
  { role: 'vendor', desc: 'Service marketplace, jobs, products', status: 'done' as const },
  { role: 'investor', desc: 'Portfolio, intelligence, deal matching', status: 'done' as const },
  { role: 'developer', desc: 'Off-plan projects, unit management', status: 'done' as const },
  { role: 'admin', desc: 'Platform operations, moderation', status: 'done' as const },
  { role: 'super_admin', desc: 'Full system control, overrides', status: 'done' as const },
  { role: 'customer_service', desc: 'Support tickets, user assistance', status: 'done' as const },
  { role: 'editor', desc: 'Content management, articles', status: 'done' as const },
  { role: 'service_provider', desc: 'Specialized vendor services', status: 'done' as const },
  { role: 'legal_consultant', desc: 'Legal verification, contracts', status: 'done' as const },
];

const roleInfra = [
  { item: 'user_roles table (dedicated, not on profiles)', status: 'done' as const },
  { item: 'user_role enum (12 roles)', status: 'done' as const },
  { item: 'role_permissions table', status: 'done' as const },
  { item: 'has_role() SECURITY DEFINER function', status: 'done' as const },
  { item: 'has_permission() function', status: 'done' as const },
  { item: 'useUserRoles hook (UI-only guard)', status: 'done' as const },
  { item: 'PermissionGate component', status: 'done' as const },
  { item: 'Multi-role per user support', status: 'done' as const },
  { item: 'user_role_audit trail table', status: 'done' as const },
  { item: 'Legacy admin_users / admin_roles tables', status: 'partial' as const, note: 'Dual system — should consolidate into user_roles' },
];

const propertySchema = [
  { field: 'Core identity', cols: 'id, title, property_type, listing_type, location, city, state', status: 'done' as const },
  { field: 'Pricing', cols: 'price, rental_yield, roi_percentage, discount_percentage', status: 'done' as const },
  { field: 'Physical', cols: 'bedrooms, bathrooms, area_sqm, land_area_sqm, building_area_sqm, floors', status: 'done' as const },
  { field: 'AI Intelligence', cols: 'deal_score, demand_heat_score, investment_score, opportunity_score, luxury_index_score', status: 'done' as const },
  { field: 'Liquidity Signals', cols: 'days_on_market, predicted_days_to_sell, demand_trend, inquiry_velocity, views_count, saves_count', status: 'done' as const },
  { field: 'Price Forecasting', cols: 'price_forecast_3m/6m/12m, ai_estimated_price, valuation_gap_pct', status: 'done' as const },
  { field: 'Ownership', cols: 'owner_id, agent_id, developer_id, owner_type', status: 'done' as const },
  { field: 'Rich Media', cols: 'image_urls, virtual_tour_url, drone_video_url, panorama_360_urls, glb_model_url', status: 'done' as const },
  { field: 'Status Lifecycle', cols: 'status, approval_status, legal_status, sold_at, listed_at', status: 'done' as const },
  { field: 'visibility_score column', cols: 'Not present — uses deal_visibility_ranking table instead', status: 'partial' as const },
  { field: 'liquidity_score column', cols: 'Computed via liquidity engine, not stored on properties', status: 'partial' as const },
];

const dealLifecycle = [
  { stage: 'Listed', desc: 'Property published on marketplace', table: 'properties (status)', status: 'done' as const },
  { stage: 'Viewed', desc: 'Investor engagement tracked', table: 'behavioral_events', status: 'done' as const },
  { stage: 'Offer', desc: 'Digital offer submission', table: 'deal_stage_rules', status: 'done' as const },
  { stage: 'Negotiation', desc: 'Price negotiation flow', table: 'deal_stage_rules', status: 'done' as const },
  { stage: 'Payment Initiated', desc: 'Escrow / payment start', table: 'escrow_transactions', status: 'done' as const },
  { stage: 'Legal Verification', desc: 'Document & legal check', table: 'deal_stage_rules', status: 'done' as const },
  { stage: 'Closed', desc: 'Transaction completed', table: 'properties (sold_at)', status: 'done' as const },
  { stage: 'Post-Deal Services', desc: 'Vendor upsell, renovation, management', table: 'vendor_services', status: 'partial' as const },
];

const vendorItems = [
  { item: 'vendor_services table', status: 'done' as const },
  { item: 'Vendor verification system (5-stage)', status: 'done' as const },
  { item: 'AI vendor matching engine', status: 'done' as const },
  { item: 'Vendor performance scoring', status: 'done' as const },
  { item: 'Premium vendor slot management', status: 'partial' as const },
  { item: 'vendor_jobs table (job lifecycle)', status: 'missing' as const, note: 'Need dedicated job tracking table' },
  { item: 'vendor_products table', status: 'missing' as const, note: 'Need product catalog table' },
  { item: 'Auto lead routing by category', status: 'partial' as const, note: 'AI matching exists, auto-assignment needs edge function' },
  { item: 'Response time SLA tracking', status: 'partial' as const },
  { item: 'Category supply gap detection', status: 'done' as const },
];

const monetization = [
  { item: 'subscription_plans table', status: 'done' as const },
  { item: 'escrow_transactions table', status: 'done' as const },
  { item: 'Commission calculation (2.5% platform, 70% agent)', status: 'done' as const },
  { item: 'deal_stage_rules with transition logic', status: 'done' as const },
  { item: 'Revenue Intelligence Dashboard', status: 'done' as const },
  { item: 'Pricing tier admin editor (CRUD)', status: 'partial' as const, note: 'Dashboard exists, needs live DB write' },
  { item: 'Commission override slider', status: 'partial' as const },
  { item: 'Dynamic pricing experiment toggle', status: 'partial' as const },
  { item: 'Premium listing slot pricing control', status: 'partial' as const },
  { item: 'Upsell trigger automation', status: 'partial' as const },
];

const adminControls = [
  { control: 'Listing visibility ranking', status: 'done' as const, component: 'deal_visibility_ranking table + admin panels' },
  { control: 'Liquidity boost trigger', status: 'done' as const, component: 'ExecutionCommandCenter' },
  { control: 'Vendor lead allocation', status: 'partial' as const, component: 'AIVendorMatching — needs manual override' },
  { control: 'Deal routing override', status: 'done' as const, component: 'deal_stage_rules + admin panel' },
  { control: 'Pricing tier changes', status: 'partial' as const, component: 'RevenueFlywheelDashboard — UI-only' },
  { control: 'Campaign activation', status: 'done' as const, component: 'GrowthExecutionDashboard' },
  { control: 'Risk suspension actions', status: 'done' as const, component: 'EnhancedUserManagement' },
  { control: 'KYC / document verification', status: 'done' as const, component: 'AdminKYCManagement' },
  { control: 'Content moderation', status: 'done' as const, component: 'ContentModerationQueue' },
  { control: 'System health monitoring', status: 'done' as const, component: 'RealTimeSystemHealth' },
  { control: 'AI engine control', status: 'done' as const, component: 'AICommandCenter' },
  { control: 'Investor DNA scoring', status: 'done' as const, component: 'InvestorDNAAdminPanel' },
];

const flywheelChecks = [
  { signal: 'Demand signal capture (behavioral_events)', status: 'done' as const, score: 95 },
  { signal: 'Investor behavior tracking (14 event types)', status: 'done' as const, score: 90 },
  { signal: 'Vendor service integration', status: 'partial' as const, score: 70 },
  { signal: 'Deal closure acceleration (stage rules)', status: 'done' as const, score: 85 },
  { signal: 'Post-transaction engagement loops', status: 'partial' as const, score: 55 },
  { signal: 'Liquidity score computation', status: 'done' as const, score: 88 },
  { signal: 'Investor-property matching', status: 'done' as const, score: 82 },
  { signal: 'Price prediction engine', status: 'done' as const, score: 80 },
];

const roadmap = [
  { week: 'Week 1-2', phase: 'Database Hardening', tasks: [
    'Consolidate admin_users → user_roles system',
    'Create vendor_jobs + vendor_products tables',
    'Add visibility_score / liquidity_score to properties or materialized view',
    'AdminOnlyRoute guard on /admin-dashboard',
  ]},
  { week: 'Week 2-3', phase: 'Monetization Activation', tasks: [
    'Wire subscription_plans CRUD to live DB',
    'Commission override edge function',
    'Premium listing slot purchase flow',
    'Payment gateway integration (Midtrans/Xendit)',
  ]},
  { week: 'Week 3-4', phase: 'Vendor Economy Launch', tasks: [
    'Auto lead routing edge function',
    'Vendor job lifecycle tracking',
    'Vendor SLA monitoring alerts',
    'Post-deal vendor upsell automation',
  ]},
  { week: 'Week 4', phase: 'Launch Readiness', tasks: [
    'End-to-end deal flow smoke test',
    'RLS policy audit (no permissive write)',
    'Performance optimization (bundle < 250KB)',
    'City-level campaign launch controls',
  ]},
];

const calcScore = (items: { status: string }[]) => {
  const done = items.filter(i => i.status === 'done').length;
  const partial = items.filter(i => i.status === 'partial').length;
  return Math.round(((done + partial * 0.5) / items.length) * 100);
};

const ProductionSystemOrganizer = () => {
  const [activeTab, setActiveTab] = useState('roles');

  const scores = {
    roles: calcScore(roleInfra),
    property: calcScore(propertySchema),
    vendor: calcScore(vendorItems),
    monetization: calcScore(monetization),
    admin: calcScore(adminControls),
    flywheel: Math.round(flywheelChecks.reduce((a, c) => a + c.score, 0) / flywheelChecks.length),
  };
  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Production System Organizer</h2>
          <p className="text-muted-foreground text-sm mt-1">Market launch readiness audit & execution roadmap</p>
        </div>
        <div className="text-center">
          <div className="text-4xl font-black tabular-nums" style={{ color: overallScore >= 80 ? '#10b981' : overallScore >= 60 ? '#f59e0b' : '#ef4444' }}>
            {overallScore}%
          </div>
          <p className="text-xs text-muted-foreground font-medium">LAUNCH READY</p>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Roles', score: scores.roles, icon: Users },
          { label: 'Properties', score: scores.property, icon: Building },
          { label: 'Vendors', score: scores.vendor, icon: Store },
          { label: 'Revenue', score: scores.monetization, icon: DollarSign },
          { label: 'Admin', score: scores.admin, icon: Shield },
          { label: 'Flywheel', score: scores.flywheel, icon: Activity },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 text-center">
              <s.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-2xl font-bold tabular-nums">{s.score}%</div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <Progress value={s.score} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="roles" className="text-xs">1️⃣ Roles</TabsTrigger>
          <TabsTrigger value="property" className="text-xs">2️⃣ Properties</TabsTrigger>
          <TabsTrigger value="vendor" className="text-xs">3️⃣ Vendors</TabsTrigger>
          <TabsTrigger value="monetization" className="text-xs">4️⃣ Revenue</TabsTrigger>
          <TabsTrigger value="admin" className="text-xs">5️⃣ Admin</TabsTrigger>
          <TabsTrigger value="flywheel" className="text-xs">6️⃣ Flywheel</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">🗺️ Roadmap</TabsTrigger>
        </TabsList>

        {/* STEP 1 — ROLES */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Unified Role System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3 text-sm">12 Supported Roles (user_role enum)</h4>
                  <div className="space-y-2">
                    {roles.map(r => (
                      <div key={r.role} className="flex items-center gap-2 text-sm">
                        <StatusIcon status={r.status} />
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{r.role}</code>
                        <span className="text-muted-foreground text-xs">{r.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm">Infrastructure Components</h4>
                  <div className="space-y-2">
                    {roleInfra.map(r => (
                      <div key={r.item} className="flex items-start gap-2 text-sm">
                        <StatusIcon status={r.status} />
                        <div>
                          <span>{r.item}</span>
                          {'note' in r && r.note && <p className="text-xs text-amber-600 mt-0.5">⚠ {r.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STEP 2 — PROPERTIES */}
        <TabsContent value="property" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Building className="h-5 w-5" /> Property Schema & Deal Lifecycle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-sm">Properties Table (115+ columns)</h4>
                <div className="space-y-2">
                  {propertySchema.map(p => (
                    <div key={p.field} className="flex items-start gap-2 text-sm">
                      <StatusIcon status={p.status} />
                      <div>
                        <span className="font-medium">{p.field}</span>
                        <p className="text-xs text-muted-foreground">{p.cols}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-sm">Deal Lifecycle (7-stage state machine)</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {dealLifecycle.map((d, i) => (
                    <React.Fragment key={d.stage}>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon status={d.status} />
                        <Badge variant="outline" className="text-xs">{d.stage}</Badge>
                      </div>
                      {i < dealLifecycle.length - 1 && <span className="text-muted-foreground">→</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {dealLifecycle.map(d => (
                    <div key={d.stage} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <StatusIcon status={d.status} />
                      <span className="font-medium w-32">{d.stage}</span>
                      <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{d.table}</code>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STEP 3 — VENDORS */}
        <TabsContent value="vendor" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Store className="h-5 w-5" /> Vendor Marketplace Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {vendorItems.map(v => (
                  <div key={v.item} className="flex items-start gap-2 text-sm border-b border-border/30 pb-2">
                    <StatusIcon status={v.status} />
                    <div className="flex-1">
                      <span>{v.item}</span>
                      {v.note && <p className="text-xs text-amber-600 mt-0.5">→ {v.note}</p>}
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STEP 4 — MONETIZATION */}
        <TabsContent value="monetization" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><DollarSign className="h-5 w-5" /> Monetization & Transaction System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {monetization.map(m => (
                  <div key={m.item} className="flex items-start gap-2 text-sm border-b border-border/30 pb-2">
                    <StatusIcon status={m.status} />
                    <div className="flex-1">
                      <span>{m.item}</span>
                      {m.note && <p className="text-xs text-amber-600 mt-0.5">→ {m.note}</p>}
                    </div>
                    <StatusBadge status={m.status} />
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Revenue Streams Architecture</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {['Transaction Commission (2.5%)', 'Vendor SaaS Subscriptions', 'Investor Intelligence Plans', 'Premium Listing Slots', 'Escrow Service Fee', 'Data Licensing API'].map(s => (
                    <div key={s} className="flex items-center gap-1.5">
                      <Zap className="h-3 w-3 text-primary" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STEP 5 — ADMIN */}
        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" /> Admin Command Control Surface</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {adminControls.map(a => (
                  <div key={a.control} className="flex items-start gap-2 text-sm border-b border-border/30 pb-2">
                    <StatusIcon status={a.status} />
                    <div className="flex-1">
                      <span className="font-medium">{a.control}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.component}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STEP 6 — FLYWHEEL */}
        <TabsContent value="flywheel" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5" /> Marketplace Liquidity Flywheel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flywheelChecks.map(f => (
                  <div key={f.signal} className="flex items-center gap-3 text-sm">
                    <StatusIcon status={f.status} />
                    <div className="flex-1">
                      <span>{f.signal}</span>
                    </div>
                    <div className="w-24">
                      <Progress value={f.score} className="h-2" />
                    </div>
                    <span className="text-xs tabular-nums font-medium w-8 text-right">{f.score}%</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Flywheel Loop</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  More Listings → More Investor Views → Behavioral Data → Smarter Matching → Faster Deals → More Vendors → Better Services → Higher Retention → More Listings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROADMAP */}
        <TabsContent value="roadmap" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" /> 30-Day Execution Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roadmap.map((r, i) => (
                  <div key={r.week} className="relative pl-8">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    {i < roadmap.length - 1 && (
                      <div className="absolute left-[11px] top-6 w-0.5 h-full bg-border" />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-sm">{r.phase}</span>
                        <Badge variant="outline" className="text-xs">{r.week}</Badge>
                      </div>
                      <ul className="space-y-1">
                        {r.tasks.map(t => (
                          <li key={t} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <Layers className="h-3 w-3 mt-0.5 shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionSystemOrganizer;
