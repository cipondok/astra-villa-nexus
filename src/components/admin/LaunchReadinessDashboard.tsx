import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Rocket, Shield, CheckCircle2, XCircle, AlertTriangle, Clock,
  Database, Users, Building2, Code, Server, Lock, Eye, TestTube,
  FileCode, Layers, Activity, Bug, ChevronRight, ChevronDown,
  RefreshCw, Zap, Globe, Settings, HardDrive, Network,
  ClipboardCheck, Target, TrendingUp, Lightbulb, Star, 
  Sparkles, Box, Brain, BarChart3, CreditCard, Video,
  MessageSquare, Bell, Search, Map, Palette, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LaunchReadinessProps {
  onSectionChange?: (section: string) => void;
}

// ─── Phase Definitions with ALL features ───
interface Feature {
  name: string;
  status: 'done' | 'in_progress' | 'remaining';
  detail?: string;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  features: Feature[];
}

const projectPhases: Phase[] = [
  {
    id: 'phase1',
    name: 'Phase 1 — Core Platform',
    description: 'Authentication, property management, user system, admin dashboard',
    icon: Building2,
    features: [
      { name: 'Email/Password Authentication + OTP', status: 'done' },
      { name: 'Role-based Access Control (User, Owner, Vendor, Agent, Admin)', status: 'done' },
      { name: 'User Profiles & Avatar Upload', status: 'done' },
      { name: 'Property CRUD (Create, Read, Update, Delete)', status: 'done' },
      { name: 'Property Image Gallery & Upload', status: 'done' },
      { name: 'Advanced Property Search with Filters', status: 'done' },
      { name: 'Interactive Map (Mapbox) with Property Pins', status: 'done' },
      { name: 'Admin Dashboard with 80+ Sections', status: 'done' },
      { name: 'User Management & Role Upgrades', status: 'done' },
      { name: 'Activity Logs & Audit Trail', status: 'done' },
      { name: 'Error Logging & Monitoring', status: 'done' },
      { name: 'Responsive Design (Mobile/Tablet/Desktop)', status: 'done' },
      { name: 'Dark/Light Theme System', status: 'done' },
      { name: 'SEO Optimization & Meta Tags', status: 'done' },
      { name: 'Database RLS Security Policies', status: 'done' },
    ]
  },
  {
    id: 'phase2',
    name: 'Phase 2 — AI & Intelligence',
    description: 'AI assistant, smart recommendations, price prediction, investment scoring',
    icon: Brain,
    features: [
      { name: 'AI Chat Assistant (Supabase Edge + AI)', status: 'done' },
      { name: 'AI Property Recommendations', status: 'done' },
      { name: 'AI Price Estimator with Gauge Visualization', status: 'done' },
      { name: 'AI Investment Score (Luxury/Rental/Growth 0-100)', status: 'done' },
      { name: 'Smart Collection Badges', status: 'done' },
      { name: 'AI Behavior Tracking (view/click/scroll/search)', status: 'done' },
      { name: 'AI Feedback Analytics Dashboard', status: 'done' },
      { name: 'Algorithm Dashboard & Monitoring', status: 'done' },
      { name: 'Document OCR Scanner (KYC)', status: 'done' },
      { name: 'AHU Company Checker', status: 'done' },
      { name: 'Future Value Projection Simulator', status: 'done' },
      { name: 'AI-Powered Sample Property Generator', status: 'done' },
    ]
  },
  {
    id: 'phase3',
    name: 'Phase 3 — 3D & Immersive',
    description: '3D property viewer, VR tours, 360° panoramas, comparison mode',
    icon: Box,
    features: [
      { name: '3D Property Viewer (Three.js/React Three Fiber)', status: 'done' },
      { name: '360° Virtual Tour Panoramas', status: 'done' },
      { name: 'VR Tour Settings & Configuration', status: 'done' },
      { name: 'Smart 3D Compare Mode (Split-Screen Dual Viewer)', status: 'done' },
      { name: 'Synchronized Orbit Controls', status: 'done' },
      { name: 'Day/Night Lighting Toggle', status: 'done' },
      { name: 'Video Tours Management (Admin)', status: 'done' },
      { name: '3D Asset Management (threed_assets table)', status: 'done' },
      { name: 'AR Preview Mode (Mobile)', status: 'in_progress', detail: 'UI built, needs native AR SDK integration' },
    ]
  },
  {
    id: 'phase4',
    name: 'Phase 4 — Business & Revenue',
    description: 'Payments, tokens, vendors, bookings, transactions',
    icon: CreditCard,
    features: [
      { name: 'ASTRA Token System (Earn/Spend/Analytics)', status: 'done' },
      { name: 'Vendor Platform with KYC & Services', status: 'done' },
      { name: 'Booking Management System', status: 'done' },
      { name: 'Rental Management & Analytics', status: 'done' },
      { name: 'Transaction Management Hub', status: 'done' },
      { name: 'Transaction Logs Database (transaction_logs table)', status: 'done' },
      { name: 'Investment Metrics Database (investment_metrics table)', status: 'done' },
      { name: 'WNA Foreign Investment Settings', status: 'done' },
      { name: 'WNI KPR/Mortgage Settings', status: 'done' },
      { name: 'Mortgage (KPR) Management', status: 'done' },
      { name: 'Blockchain Management (Smart Contracts/Escrow)', status: 'done' },
      { name: 'B2B Data Marketplace', status: 'done' },
      { name: 'Partnership Programs', status: 'done' },
      { name: 'Affiliate System & Commissions', status: 'done' },
      { name: 'Billing & Subscription Management', status: 'done' },
      { name: 'Payment Gateway Integration (Stripe/Midtrans)', status: 'in_progress', detail: 'UI built, needs live API keys' },
      { name: 'Invoice Generation', status: 'done' },
      { name: 'Concierge Service (White-Glove 2%)', status: 'done' },
    ]
  },
  {
    id: 'phase5',
    name: 'Phase 5 — Growth & Scale',
    description: 'Analytics, marketing, acquisition, viral campaigns, expansion',
    icon: Rocket,
    features: [
      { name: 'Visitor Analytics & Access Control', status: 'done' },
      { name: 'VIP Analytics Dashboard', status: 'done' },
      { name: 'User Acquisition Platform (Referral, SEO, Influencers)', status: 'done' },
      { name: 'Viral Growth Campaigns', status: 'done' },
      { name: 'Media Coverage & PR Management', status: 'done' },
      { name: 'Social Commerce (Instagram/TikTok/Pinterest)', status: 'done' },
      { name: 'Media Network (YouTube/Podcast/Newsletter)', status: 'done' },
      { name: 'Innovation Lab (A/B Testing, Feature Flags)', status: 'done' },
      { name: 'Automation Platform', status: 'done' },
      { name: 'Team Management', status: 'done' },
      { name: 'City Expansion Planning', status: 'done' },
      { name: 'Design System (Admin Configurable)', status: 'done' },
      { name: 'Cloudflare CDN Configuration', status: 'done' },
      { name: 'Performance Monitor & Caching', status: 'done' },
      { name: 'Testing Dashboard (Unit/E2E/Load)', status: 'done' },
      { name: 'SMTP Email Service', status: 'in_progress', detail: 'Settings UI built, needs credentials' },
      { name: 'Push Notifications (Mobile PWA)', status: 'remaining', detail: 'Service worker + Firebase FCM needed' },
      { name: 'Multi-language (i18n: ID/EN/CN/RU)', status: 'remaining', detail: 'Architecture planned, translations needed' },
    ]
  }
];

// ─── Strategic Tips ───
const strategicTips = [
  {
    priority: 'critical',
    icon: Shield,
    title: 'Enable Payment Gateway',
    description: 'Configure Stripe or Midtrans live API keys to process real transactions. This is the #1 blocker for revenue.',
    action: 'system-settings',
    actionLabel: 'Go to System Settings'
  },
  {
    priority: 'critical',
    icon: Lock,
    title: 'Security Hardening',
    description: 'Enable leaked password protection in Supabase Auth, update Postgres, and review Security Definer Views.',
    action: 'security-monitoring',
    actionLabel: 'Security Panel'
  },
  {
    priority: 'high',
    icon: Globe,
    title: 'Add Multi-Language (i18n)',
    description: 'Indonesian market needs ID + EN minimum. Add CN + RU for foreign investors. Massive competitive advantage.',
    action: null,
    actionLabel: null
  },
  {
    priority: 'high',
    icon: CreditCard,
    title: 'Configure SMTP for Emails',
    description: 'Set up transactional emails for booking confirmations, verification, and marketing. Critical for user engagement.',
    action: 'smtp-settings',
    actionLabel: 'SMTP Settings'
  },
  {
    priority: 'medium',
    icon: Sparkles,
    title: 'Seed Sample Properties',
    description: 'Use the Sample Property Generator to create 50-100 realistic Bali villa listings. Investors need content to browse.',
    action: 'sample-property-generator',
    actionLabel: 'Generate Properties'
  },
  {
    priority: 'medium',
    icon: Video,
    title: 'Upload 3D Models & VR Tours',
    description: 'Your 3D viewer and VR tour system are built. Upload .GLB models and 360° panoramas for top listings.',
    action: 'video-tours',
    actionLabel: 'Video Tours'
  },
  {
    priority: 'tip',
    icon: TrendingUp,
    title: 'Position as AI + 3D Investment Platform',
    description: 'Your unique identity: AI Investment Score + 3D Compare Mode + Future Value Simulator. No Indonesian competitor has all three.',
    action: null,
    actionLabel: null
  },
  {
    priority: 'tip',
    icon: Crown,
    title: 'Launch Concierge Service First',
    description: 'The 2% commission Concierge Service (vs 5-6% traditional) is your killer revenue model. Market it aggressively.',
    action: 'concierge-service',
    actionLabel: 'Concierge Panel'
  }
];

const LaunchReadinessDashboard: React.FC<LaunchReadinessProps> = ({ onSectionChange }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  // Fetch live stats
  const { data: dbStats, refetch: refetchDb } = useQuery({
    queryKey: ['launch-db-stats'],
    queryFn: async () => {
      const { data: platformStats } = await supabase.rpc('get_platform_stats');
      const statsData = (platformStats as Array<{
        total_users: number;
        total_properties: number;
        total_bookings: number;
        total_vendors: number;
        active_sessions: number;
      }> | null)?.[0];

      const [activities, alerts, errors, admins] = await Promise.all([
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
        supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'super_admin']).eq('is_active', true)
      ]);
      
      return {
        totalUsers: Number(statsData?.total_users) || 0,
        totalProperties: Number(statsData?.total_properties) || 0,
        totalActivities: activities.count || 0,
        pendingAlerts: alerts.count || 0,
        errorCount: errors.count || 0,
        adminCount: admins.count || 0
      };
    },
    refetchInterval: 60000
  });

  // ─── Computed Stats ───
  const stats = useMemo(() => {
    const allFeatures = projectPhases.flatMap(p => p.features);
    const done = allFeatures.filter(f => f.status === 'done').length;
    const inProgress = allFeatures.filter(f => f.status === 'in_progress').length;
    const remaining = allFeatures.filter(f => f.status === 'remaining').length;
    const total = allFeatures.length;
    const percent = Math.round((done / total) * 100);

    const phaseStats = projectPhases.map(p => {
      const pDone = p.features.filter(f => f.status === 'done').length;
      const pTotal = p.features.length;
      return { id: p.id, name: p.name, done: pDone, total: pTotal, percent: Math.round((pDone / pTotal) * 100) };
    });

    return { done, inProgress, remaining, total, percent, phaseStats };
  }, []);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'high': return 'bg-chart-3/10 text-chart-3 border-chart-3/30';
      case 'medium': return 'bg-chart-4/10 text-chart-4 border-chart-4/30';
      case 'tip': return 'bg-primary/10 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* ─── Header ─── */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-border/40 shadow-sm">
        <div className="relative p-3 md:p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                <Rocket className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  ASTRA Villa — Project Progress
                </h1>
                <p className="text-muted-foreground text-[10px] md:text-xs">
                  Complete overview of {stats.total} features across 5 development phases
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={() => refetchDb()}>
                <RefreshCw className="h-3 w-3" />
                <span className="text-[10px]">Refresh</span>
              </Button>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                stats.percent >= 90 
                  ? 'bg-chart-1/10 border border-chart-1/30 text-chart-1' 
                  : 'bg-chart-4/10 border border-chart-4/30 text-chart-4'
              }`}>
                <Target className="h-3.5 w-3.5" />
                <span>{stats.percent}% Complete</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">
                {stats.done} done · {stats.inProgress} in progress · {stats.remaining} remaining
              </span>
              <span className="text-xs font-semibold text-primary">{stats.percent}%</span>
            </div>
            <Progress value={stats.percent} className="h-2" />
          </div>
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="border-chart-1/30 bg-chart-1/5">
          <CardContent className="p-3 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-chart-1 mb-1" />
            <p className="text-2xl font-bold text-chart-1">{stats.done}</p>
            <p className="text-[10px] text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-chart-4/30 bg-chart-4/5">
          <CardContent className="p-3 text-center">
            <Clock className="h-5 w-5 mx-auto text-chart-4 mb-1" />
            <p className="text-2xl font-bold text-chart-4">{stats.inProgress}</p>
            <p className="text-[10px] text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-chart-3/30 bg-chart-3/5">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto text-chart-3 mb-1" />
            <p className="text-2xl font-bold text-chart-3">{stats.remaining}</p>
            <p className="text-[10px] text-muted-foreground">Remaining</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 text-center">
            <Layers className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground">Total Features</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-9 p-1 bg-muted/50 rounded-lg grid grid-cols-4 gap-1">
          <TabsTrigger value="overview" className="h-7 text-[10px] rounded-md gap-1">
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="phases" className="h-7 text-[10px] rounded-md gap-1">
            <Layers className="h-3 w-3" />
            <span className="hidden sm:inline">All Phases</span>
          </TabsTrigger>
          <TabsTrigger value="remaining" className="h-7 text-[10px] rounded-md gap-1">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Remaining</span>
          </TabsTrigger>
          <TabsTrigger value="tips" className="h-7 text-[10px] rounded-md gap-1">
            <Lightbulb className="h-3 w-3" />
            <span className="hidden sm:inline">Tips & Next</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── OVERVIEW TAB ─── */}
        <TabsContent value="overview" className="mt-3 space-y-3">
          {/* Phase Progress Bars */}
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Phase Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              {stats.phaseStats.map((ps, i) => {
                const phase = projectPhases[i];
                const PhaseIcon = phase.icon;
                return (
                  <div key={ps.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PhaseIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-medium">{ps.name.replace(/Phase \d — /, '')}</span>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {ps.done}/{ps.total} ({ps.percent}%)
                      </span>
                    </div>
                    <Progress value={ps.percent} className="h-1.5" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <Card className="border-border/30 bg-background/50">
              <CardContent className="p-2 text-center">
                <Users className="h-4 w-4 mx-auto text-chart-4 mb-1" />
                <p className="text-lg font-bold">{dbStats?.totalUsers || 0}</p>
                <p className="text-[9px] text-muted-foreground">Users</p>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-background/50">
              <CardContent className="p-2 text-center">
                <Building2 className="h-4 w-4 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold">{dbStats?.totalProperties || 0}</p>
                <p className="text-[9px] text-muted-foreground">Properties</p>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-background/50">
              <CardContent className="p-2 text-center">
                <Activity className="h-4 w-4 mx-auto text-chart-1 mb-1" />
                <p className="text-lg font-bold">{dbStats?.totalActivities || 0}</p>
                <p className="text-[9px] text-muted-foreground">Activities</p>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-background/50">
              <CardContent className="p-2 text-center">
                <Shield className="h-4 w-4 mx-auto text-chart-5 mb-1" />
                <p className="text-lg font-bold">{dbStats?.adminCount || 0}</p>
                <p className="text-[9px] text-muted-foreground">Admins</p>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-background/50">
              <CardContent className="p-2 text-center">
                <Bug className="h-4 w-4 mx-auto text-destructive mb-1" />
                <p className="text-lg font-bold">{dbStats?.errorCount || 0}</p>
                <p className="text-[9px] text-muted-foreground">Errors</p>
              </CardContent>
            </Card>
            <Card className="border-border/30 bg-background/50">
              <CardContent className="p-2 text-center">
                <Bell className="h-4 w-4 mx-auto text-chart-3 mb-1" />
                <p className="text-lg font-bold">{dbStats?.pendingAlerts || 0}</p>
                <p className="text-[9px] text-muted-foreground">Alerts</p>
              </CardContent>
            </Card>
          </div>

          {/* Unique Competitive Features */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                🏆 Unique Killer Features (No Competitor Has These)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-chart-1/5 border border-chart-1/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-chart-1" />
                    <span className="text-xs font-semibold">AI Investment Score</span>
                    <Badge className="text-[8px] bg-chart-1/20 text-chart-1 border-0">✓ LIVE</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Luxury, Rental, Growth scores (0-100) on every property</p>
                </div>
                <div className="p-2.5 rounded-lg bg-chart-1/5 border border-chart-1/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Box className="h-4 w-4 text-chart-1" />
                    <span className="text-xs font-semibold">3D Compare Mode</span>
                    <Badge className="text-[8px] bg-chart-1/20 text-chart-1 border-0">✓ LIVE</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Split-screen dual 3D viewer with synced orbit controls</p>
                </div>
                <div className="p-2.5 rounded-lg bg-chart-1/5 border border-chart-1/20">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-chart-1" />
                    <span className="text-xs font-semibold">Future Value Simulator</span>
                    <Badge className="text-[8px] bg-chart-1/20 text-chart-1 border-0">✓ LIVE</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Investment projection with hold period & rental strategy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── ALL PHASES TAB ─── */}
        <TabsContent value="phases" className="mt-3 space-y-3">
          {projectPhases.map((phase) => {
            const isExpanded = expandedPhase === phase.id;
            const pDone = phase.features.filter(f => f.status === 'done').length;
            const pTotal = phase.features.length;
            const pPercent = Math.round((pDone / pTotal) * 100);
            const PhaseIcon = phase.icon;

            return (
              <Card key={phase.id} className="border-border/30 overflow-hidden">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                >
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${pPercent === 100 ? 'bg-chart-1/10' : 'bg-chart-4/10'}`}>
                          <PhaseIcon className={`h-4 w-4 ${pPercent === 100 ? 'text-chart-1' : 'text-chart-4'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-xs">{phase.name}</CardTitle>
                          <CardDescription className="text-[10px]">{phase.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[9px] ${pPercent === 100 ? 'bg-chart-1/10 text-chart-1 border-chart-1/30' : 'bg-chart-4/10 text-chart-4 border-chart-4/30'}`}>
                          {pDone}/{pTotal}
                        </Badge>
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                    </div>
                    <Progress value={pPercent} className="h-1.5 mt-2" />
                  </CardHeader>
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardContent className="p-3 pt-0 border-t border-border/20">
                        <ScrollArea className="max-h-[300px]">
                          <div className="space-y-1.5 pt-2">
                            {phase.features.map((feat, i) => (
                              <div key={i} className="flex items-start gap-2 p-1.5 rounded-md hover:bg-muted/30">
                                {feat.status === 'done' ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-chart-1 flex-shrink-0 mt-0.5" />
                                ) : feat.status === 'in_progress' ? (
                                  <Clock className="h-3.5 w-3.5 text-chart-4 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <span className={`text-[11px] ${feat.status === 'done' ? 'text-muted-foreground' : 'font-medium'}`}>
                                    {feat.name}
                                  </span>
                                  {feat.detail && (
                                    <p className="text-[9px] text-muted-foreground mt-0.5">{feat.detail}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </TabsContent>

        {/* ─── REMAINING TAB ─── */}
        <TabsContent value="remaining" className="mt-3 space-y-3">
          {/* In Progress */}
          <Card className="border-chart-4/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-chart-4" />
                In Progress ({stats.inProgress} items)
              </CardTitle>
              <CardDescription className="text-[10px]">Features that are built but need configuration or API keys</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {projectPhases.flatMap(p => 
                p.features.filter(f => f.status === 'in_progress').map(f => ({ ...f, phase: p.name }))
              ).map((feat, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-chart-4/5 border border-chart-4/20">
                  <Clock className="h-3.5 w-3.5 text-chart-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">{feat.name}</p>
                    {feat.detail && <p className="text-[10px] text-muted-foreground">{feat.detail}</p>}
                    <Badge variant="outline" className="text-[8px] mt-1">{feat.phase.replace(/Phase \d — /, '')}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Not Started */}
          <Card className="border-chart-3/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-chart-3" />
                Not Yet Built ({stats.remaining} items)
              </CardTitle>
              <CardDescription className="text-[10px]">Features that still need development</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {projectPhases.flatMap(p => 
                p.features.filter(f => f.status === 'remaining').map(f => ({ ...f, phase: p.name }))
              ).map((feat, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-chart-3/5 border border-chart-3/20">
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-chart-3/50 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">{feat.name}</p>
                    {feat.detail && <p className="text-[10px] text-muted-foreground">{feat.detail}</p>}
                    <Badge variant="outline" className="text-[8px] mt-1">{feat.phase.replace(/Phase \d — /, '')}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TIPS & NEXT STEPS TAB ─── */}
        <TabsContent value="tips" className="mt-3 space-y-3">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Strategic Tips & Next Steps
              </CardTitle>
              <CardDescription className="text-[10px]">
                Prioritized actions to launch and scale ASTRA Villa
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {strategicTips.map((tip, i) => {
                const TipIcon = tip.icon;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${getPriorityColor(tip.priority)}`}>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-bold w-4 h-4 rounded-full bg-background/50 flex items-center justify-center">
                        {i + 1}
                      </span>
                      <TipIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-xs font-semibold">{tip.title}</p>
                        <Badge variant="outline" className={`text-[8px] ${getPriorityColor(tip.priority)}`}>
                          {tip.priority}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{tip.description}</p>
                      {tip.action && onSectionChange && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-[10px] mt-1.5 gap-1 px-2"
                          onClick={() => onSectionChange(tip.action!)}
                        >
                          {tip.actionLabel} <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Platform Identity */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                  <Rocket className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">
                    🏆 Your Platform Identity
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    <strong>ASTRA Villa = AI + 3D Investment Platform</strong> (not just a marketplace)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/30">AI Investment Score</Badge>
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/30">3D Compare Mode</Badge>
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/30">Future Value Simulator</Badge>
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/30">ASTRA Tokens</Badge>
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/30">Concierge 2%</Badge>
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/30">VR Tours</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LaunchReadinessDashboard;
