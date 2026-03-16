
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import SectionErrorBoundary from "./shared/SectionErrorBoundary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { 
  Users, 
  Building2, 
  TrendingUp,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Server,
  Store,
  Eye,
  RefreshCw,
  Globe,
  Gauge,
  Bell,
  HardDrive,
  ShieldCheck,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wifi,
  Database,
  Cpu,
  MemoryStick,
  Monitor,
  MousePointer,
  FileText,
  UserCheck,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import AIHealthSummaryCard from "./AIHealthSummaryCard";
import LeadIntelligenceCard from "./LeadIntelligenceCard";
import MarketIntelligenceCard from "./MarketIntelligenceCard";
import AgentPerformanceCard from "./AgentPerformanceCard";
import DealPipelineCard from "./DealPipelineCard";
import GeoExpansionCard from "./GeoExpansionCard";
import AIBatchControlPanel from "./AIBatchControlPanel";
import AISchedulingDashboard from "./AISchedulingDashboard";
import JobQueueHealthCard from "./JobQueueHealthCard";
import AIJobObservabilityPanel from "./AIJobObservabilityPanel";
import MarketAnomalyCard from "./MarketAnomalyCard";
import ListingPerformanceOptimizerCard from "./ListingPerformanceOptimizerCard";
import PricingIntelligenceCard from "./PricingIntelligenceCard";
import DealClosingTimelineCard from "./DealClosingTimelineCard";
import InvestmentAttractivenessCard from "./InvestmentAttractivenessCard";
import BuyerListingMatchCard from "./BuyerListingMatchCard";
import PricingAutomationCard from "./PricingAutomationCard";
import MarketCyclePredictionCard from "./MarketCyclePredictionCard";
import DealTimingSignalCard from "./DealTimingSignalCard";
import NationalForecastCard from "./NationalForecastCard";
import PortfolioStrategyCard from "./PortfolioStrategyCard";
import CapitalFlowCard from "./CapitalFlowCard";
import MarketplaceOptimizationCard from "./MarketplaceOptimizationCard";
import { useAICommandCenterData } from "@/hooks/useAICommandCenterData";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import MetricRow from "./overview/MetricRow";
import ActionRow from "./overview/ActionRow";
import SummaryCard from "./overview/SummaryCard";
import HealthBar from "./overview/HealthBar";
import ServiceRow from "./overview/ServiceRow";
import ZoneSkeleton from "./overview/ZoneSkeleton";
interface AdminOverviewProps {
  onSectionChange?: (section: string) => void;
}

const AdminOverview = React.memo(function AdminOverview({ onSectionChange }: AdminOverviewProps) {
  const handleQuickAction = useCallback((section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  }, [onSectionChange]);

  // Track first render for activity feed animations (P2 #9)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      const timer = setTimeout(() => { isFirstRender.current = false; }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);


  const { data: sparkTrends } = useQuery({
    queryKey: ['admin-spark-trends-7d'],
    queryFn: async () => {
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        return d;
      });

      const [usersRes, propsRes, vendorsRes, viewsRes, activeRes] = await Promise.all(
        [
          // Users created per day
          Promise.all(days.map(d =>
            supabase.from('profiles').select('id', { count: 'exact', head: true })
              .lte('created_at', new Date(d.getTime() + 86400000).toISOString())
              .then(r => r.count || 0)
          )),
          // Properties per day
          Promise.all(days.map(d =>
            supabase.from('properties').select('id', { count: 'exact', head: true })
              .lte('created_at', new Date(d.getTime() + 86400000).toISOString())
              .then(r => r.count || 0)
          )),
          // Vendors per day
          Promise.all(days.map(d =>
            supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true })
              .eq('is_verified', true)
              .lte('created_at', new Date(d.getTime() + 86400000).toISOString())
              .then(r => r.count || 0)
          )),
          // Page views per day
          Promise.all(days.map(d =>
            supabase.from('web_analytics').select('id', { count: 'exact', head: true })
              .gte('created_at', d.toISOString())
              .lt('created_at', new Date(d.getTime() + 86400000).toISOString())
              .then(r => r.count || 0)
          )),
          // Active users per day
          Promise.all(days.map(d =>
            supabase.from('user_activity_logs').select('id', { count: 'exact', head: true })
              .gte('created_at', d.toISOString())
              .lt('created_at', new Date(d.getTime() + 86400000).toISOString())
              .then(r => r.count || 0)
          )),
        ]
      );

      return { users: usersRes, properties: propsRes, vendors: vendorsRes, views: viewsRes, active: activeRes };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  // Batched AI intelligence data
  const { data: aiData, dataUpdatedAt: aiUpdatedAt, isLoading: aiLoading } = useAICommandCenterData();

  // Fetch platform statistics
  const { data: platformStats, isLoading: statsLoading, refetch: refetchStats, dataUpdatedAt: statsUpdatedAt } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: async () => {
      try {
        const { data: platformStats } = await supabase.rpc('get_platform_stats');
        
        const statsData = (platformStats as Array<{
          total_users: number;
          total_properties: number;
          total_bookings: number;
          total_vendors: number;
          active_sessions: number;
        }> | null)?.[0];

        const [vendorsResult, ordersResult, analyticsResult, activeUsersResult] = await Promise.all([
          supabase.from('vendor_business_profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('web_analytics').select('*', { count: 'exact', head: true }),
          supabase.from('user_activity_logs').select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        ]);

        return {
          totalUsers: Number(statsData?.total_users) || 0,
          totalProperties: Number(statsData?.total_properties) || 0,
          totalVendors: vendorsResult.count || 0,
          totalOrders: ordersResult.count || 0,
          totalPageViews: analyticsResult.count || 0,
          activeUsers24h: activeUsersResult.count || 0,
          activeSessions: Number(statsData?.active_sessions) || 0,
        };
      } catch {
        return { totalUsers: 0, totalProperties: 0, totalVendors: 0, totalOrders: 0, totalPageViews: 0, activeUsers24h: 0, activeSessions: 0 };
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000, // was 30s
  });

  // Fetch system health + AI subsystem status
  const { data: systemHealth, dataUpdatedAt: healthUpdatedAt } = useQuery({
    queryKey: ['system-health-overview'],
    queryFn: async () => {
      const startTime = Date.now();
      try {
        const [dbErrorsRes, jobsRunning, jobsFailed, jobsPending, seoRes, valuationsRes] = await Promise.all([
          supabase.from('database_error_tracking').select('*', { count: 'exact', head: true }).eq('is_resolved', false),
          supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'running'),
          supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
          supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('property_seo_analysis').select('seo_score').not('seo_score', 'is', null).limit(100),
          supabase.from('property_valuations').select('id', { count: 'exact', head: true }),
        ]);

        const seoScores = (seoRes.data || []) as any[];
        const avgSeo = seoScores.length > 0
          ? Math.round(seoScores.reduce((s: number, p: any) => s + (p.seo_score || 0), 0) / seoScores.length)
          : 0;

        return {
          dbErrors: dbErrorsRes.count || 0,
          responseTime: Date.now() - startTime,
          uptime: 99.97,
          status: (dbErrorsRes.count || 0) === 0 ? 'healthy' : 'warning',
          aiSystems: {
            jobsRunning: jobsRunning.count || 0,
            jobsFailed: jobsFailed.count || 0,
            jobsPending: jobsPending.count || 0,
            avgSeoScore: avgSeo,
            totalValuations: valuationsRes.count || 0,
            seoStatus: avgSeo >= 50 ? 'operational' as const : avgSeo > 0 ? 'degraded' as const : 'unknown' as const,
            jobStatus: (jobsFailed.count || 0) > 5 ? 'degraded' as const : 'operational' as const,
            valuationStatus: (valuationsRes.count || 0) > 0 ? 'operational' as const : 'unknown' as const,
          },
        };
      } catch (error) {
        return {
          dbErrors: 0, responseTime: 0, uptime: 0, status: 'error',
          aiSystems: { jobsRunning: 0, jobsFailed: 0, jobsPending: 0, avgSeoScore: 0, totalValuations: 0, seoStatus: 'unknown' as const, jobStatus: 'unknown' as const, valuationStatus: 'unknown' as const },
        };
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000,
  });

  // Fetch recent activity
  const { data: recentActivity, dataUpdatedAt: activityUpdatedAt } = useQuery({
    queryKey: ['recent-activity-logs'],
    queryFn: async () => {
      try {
        const { data } = await supabase
          .from('activity_logs')
          .select('id, activity_type, activity_description, created_at')
          .order('created_at', { ascending: false })
          .limit(8);
        return data || [];
      } catch {
        return [];
      }
    },
    staleTime: 60 * 1000,
    refetchInterval: 60000, // was 10s
  });

  // Fetch pending items
  const { data: pendingItems } = useQuery({
    queryKey: ['pending-items-overview'],
    queryFn: async () => {
      try {
        const [propertyOwner, vendor, agent, alerts] = await Promise.all([
          supabase.from('property_owner_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('vendor_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('agent_registration_requests').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
          supabase.from('admin_alerts').select('*', { count: 'exact', head: true }).eq('is_read', false)
        ]);
        
        return {
          upgrades: (propertyOwner.count || 0) + (vendor.count || 0) + (agent.count || 0),
          alerts: alerts.count || 0,
        };
      } catch {
        return { upgrades: 0, alerts: 0 };
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 60000,
  });

  // Fetch hourly traffic - single batched query instead of 12 sequential calls
  const { data: hourlyTraffic, dataUpdatedAt: trafficUpdatedAt } = useQuery({
    queryKey: ['hourly-traffic'],
    queryFn: async () => {
      try {
        const since = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        const { data } = await supabase
          .from('activity_logs')
          .select('created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: true });

        // Group by hour in JS — much faster than 12 round trips
        const hourBuckets: Record<string, number> = {};
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setHours(d.getHours() - i, 0, 0, 0);
          hourBuckets[d.toLocaleTimeString('en', { hour: '2-digit', hour12: false })] = 0;
        }
        (data || []).forEach(row => {
          const label = new Date(row.created_at).toLocaleTimeString('en', { hour: '2-digit', hour12: false });
          if (label in hourBuckets) hourBuckets[label]++;
        });

        return Object.entries(hourBuckets).map(([hour, count]) => ({ hour, count }));
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Every 5 min is plenty for charts
  });

  const maxTraffic = useMemo(() => Math.max(...(hourlyTraffic?.map(h => h.count) || [1]), 1), [hourlyTraffic]);

  const statsAgo = useRelativeTime(statsUpdatedAt);
  const healthAgo = useRelativeTime(healthUpdatedAt);
  const activityAgo = useRelativeTime(activityUpdatedAt);
  const trafficAgo = useRelativeTime(trafficUpdatedAt);
  const aiAgo = useRelativeTime(aiUpdatedAt);

  return (
    <section aria-label="Admin overview dashboard" className="space-y-3 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between bg-card rounded-xl border border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Monitor className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold">Live Monitoring Dashboard</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1" role="status" aria-live="polite">
                <span className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" aria-hidden="true" />
                <span className="text-chart-1 font-medium">Online</span>
              </span>
              <span className="text-border">•</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => refetchStats()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Main Grid - 3 Column Layout */}
      <div className="grid grid-cols-12 gap-3">
        {/* Left Column - Stats & Quick Actions */}
        <div className="col-span-12 md:col-span-3 space-y-3">
         <SectionErrorBoundary sectionName="Platform Stats">
          {/* Key Metrics */}
          <Card className="border-border bg-card">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
                <Activity className="h-4 w-4 text-primary" /> Platform Stats
                {statsAgo && <span className="ml-auto text-[10px] font-normal text-muted-foreground">↻ {statsAgo}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <MetricRow icon={Users} label="Users" value={platformStats?.totalUsers || 0} loading={statsLoading} sparkData={sparkTrends?.users} />
              <MetricRow icon={Building2} label="Properties" value={platformStats?.totalProperties || 0} loading={statsLoading} sparkData={sparkTrends?.properties} />
              <MetricRow icon={Store} label="Vendors" value={platformStats?.totalVendors || 0} loading={statsLoading} sparkData={sparkTrends?.vendors} />
              <MetricRow icon={Eye} label="Page Views" value={platformStats?.totalPageViews || 0} loading={statsLoading} sparkData={sparkTrends?.views} />
              <MetricRow icon={Zap} label="Active (24h)" value={platformStats?.activeUsers24h || 0} highlight loading={statsLoading} sparkData={sparkTrends?.active} />
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card className="border-border bg-card">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
                <Bell className="h-4 w-4 text-chart-3" /> Pending
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              <ActionRow 
                icon={UserCheck} 
                label="Upgrades" 
                count={pendingItems?.upgrades || 0} 
                onClick={() => handleQuickAction('upgrade-applications')}
                urgent={!!pendingItems?.upgrades}
              />
              <ActionRow 
                icon={AlertTriangle} 
                label="Alerts" 
                count={pendingItems?.alerts || 0} 
                onClick={() => handleQuickAction('admin-alerts')}
                urgent={!!pendingItems?.alerts}
              />
            </CardContent>
          </Card>

          {/* Quick Nav */}
          <Card className="border-border bg-card">
            <CardContent className="p-3 grid grid-cols-3 gap-2">
              {[
                { icon: Users, label: "Users", id: "user-management" },
                { icon: Building2, label: "Props", id: "property-management-hub" },
                { icon: Store, label: "Vendors", id: "vendors-hub" },
                { icon: CreditCard, label: "Payments", id: "transaction-hub" },
                { icon: Globe, label: "Analytics", id: "analytics" },
                { icon: HardDrive, label: "System", id: "diagnostic" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickAction(item.id)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border hover:bg-accent/10 hover:border-primary/30 transition-all text-xs text-foreground"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </button>
              ))}
            </CardContent>
          </Card>
         </SectionErrorBoundary>
        </div>

        {/* Center Column - Activity & Traffic */}
        <div className="col-span-12 md:col-span-6 space-y-3">
         <SectionErrorBoundary sectionName="Traffic & Activity">
          {/* Live Traffic Chart - Recharts */}
          <Card className="border-border bg-card">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
                  <TrendingUp className="h-4 w-4 text-primary" /> Traffic (12h)
                </CardTitle>
                <div className="flex items-center gap-2">
                  {trafficAgo && <span className="text-[10px] text-muted-foreground">↻ {trafficAgo}</span>}
                  <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-chart-1/10 text-chart-1 border-chart-1/30">● Live</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={hourlyTraffic || []} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 11, fill: 'hsl(var(--foreground))', fontWeight: 500 }} 
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'hsl(var(--popover-foreground))',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px hsl(var(--foreground) / 0.1)',
                    }}
                    formatter={(value: number) => [`${value} activities`, 'Count']}
                    labelFormatter={(label) => `Hour: ${label}`}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={24}>
                    {(hourlyTraffic || []).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.count === maxTraffic 
                          ? 'hsl(var(--primary))' 
                          : 'hsl(var(--primary) / 0.35)'}
                        stroke={entry.count === maxTraffic ? 'hsl(var(--primary))' : 'transparent'}
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="border-border bg-card">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
                  <MousePointer className="h-4 w-4 text-chart-2" /> Live Activity
                </CardTitle>
                <span className="text-[10px] text-muted-foreground">{activityAgo ? `↻ ${activityAgo}` : 'Auto-refresh 60s'}</span>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ScrollArea className="h-[160px]">
                <div className="space-y-1.5">
                  {recentActivity && recentActivity.length > 0 ? (
                    recentActivity.map((activity, idx) => (
                      <motion.div
                        key={activity.id}
                        initial={isFirstRender.current ? { opacity: 0, x: -10 } : false}
                        animate={{ opacity: 1, x: 0 }}
                        transition={isFirstRender.current ? { delay: idx * 0.05 } : { duration: 0 }}
                        className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-card hover:bg-muted/30 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{activity.activity_type}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{activity.activity_description}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </span>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No recent activity
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-2">
            <SummaryCard label="Sessions" value={platformStats?.activeSessions || 0} icon={Wifi} color="green" />
            <SummaryCard label="Orders" value={platformStats?.totalOrders || 0} icon={FileText} color="blue" />
            <SummaryCard label="Response" value={`${systemHealth?.responseTime || 0}ms`} icon={Clock} color="purple" />
            <SummaryCard label="Uptime" value={`${systemHealth?.uptime || 99.9}%`} icon={CheckCircle} color="green" />
          </div>
         </SectionErrorBoundary>
        </div>

        {/* Right Column - Zoned Panels */}
        <div className="col-span-12 md:col-span-3 space-y-3">
         <SectionErrorBoundary sectionName="AI Intelligence & Health">
          
          {/* ═══ ZONE 1: System Health ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-chart-1/50 to-transparent" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-chart-1">System Health</span>
              {healthAgo && <span className="text-[10px] text-muted-foreground">↻ {healthAgo}</span>}
            </div>

            {/* System Status */}
            <Card className="border-border bg-card">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5 text-foreground font-semibold">
                  <Server className="h-4 w-4 text-chart-1" /> System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2.5">
                <div className={`flex items-center justify-between p-2.5 rounded-lg border ${
                  systemHealth?.status === 'healthy' 
                    ? 'bg-chart-1/5 border-chart-1/30 dark:bg-chart-1/10' 
                    : 'bg-chart-3/5 border-chart-3/30 dark:bg-chart-3/10'
                }`}>
                  <span className="text-xs font-medium text-foreground">Status</span>
                  <Badge variant={systemHealth?.status === 'healthy' ? 'default' : 'destructive'} className="text-[10px] h-5 px-2">
                    {systemHealth?.status === 'healthy' ? '● All Systems OK' : '⚠ Issues'}
                  </Badge>
                </div>
                
                <HealthBar label="Database" value={systemHealth?.dbErrors === 0 ? 100 : 70} icon={Database} isStatus />
                <HealthBar label="SEO Engine" value={systemHealth?.aiSystems.avgSeoScore || 0} icon={Globe} />
                <HealthBar label="Job Queue" value={
                  (systemHealth?.aiSystems.jobsFailed || 0) === 0 ? 100 :
                  Math.max(100 - (systemHealth?.aiSystems.jobsFailed || 0) * 10, 20)
                } icon={Cpu} isStatus />
              </CardContent>
            </Card>

            {/* AI Systems Status */}
            <Card className="border-border bg-card">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                  <ShieldCheck className="h-3.5 w-3.5" /> AI Systems
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1.5">
                <ServiceRow name="SEO Engine" status={systemHealth?.aiSystems.seoStatus || 'unknown'} detail={`${systemHealth?.aiSystems.avgSeoScore || 0}% avg`} />
                <ServiceRow name="Job Worker" status={systemHealth?.aiSystems.jobStatus || 'unknown'} detail={`${systemHealth?.aiSystems.jobsRunning || 0} running`} />
                <ServiceRow name="Valuations" status={systemHealth?.aiSystems.valuationStatus || 'unknown'} detail={`${systemHealth?.aiSystems.totalValuations || 0} total`} />
                <ServiceRow name="Database" status={systemHealth?.dbErrors === 0 ? 'operational' : 'degraded'} detail={`${systemHealth?.dbErrors || 0} errors`} />
                <ServiceRow name="Auth" status="operational" />
                {(systemHealth?.aiSystems.jobsPending || 0) > 0 && (
                  <div className="mt-1.5 p-2 rounded-lg bg-chart-2/5 border border-chart-2/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">Queued Jobs</span>
                      <Badge variant="secondary" className="text-[10px] h-5">{systemHealth?.aiSystems.jobsPending}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ═══ ZONE 2: AI Intelligence ═══ */}
          {aiLoading ? (
            <ZoneSkeleton label="AI Intelligence" cards={5} />
          ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">AI Intelligence</span>
              {aiAgo && <span className="text-[9px] text-muted-foreground/60">↻ {aiAgo}</span>}
            </div>

            {/* Tier 1: Active signal cards — elevated with glow */}
            <SectionErrorBoundary sectionName="AI Health Summary">
              <div className="shadow-md rounded-lg border border-primary/30 ring-1 ring-primary/10">
                <AIHealthSummaryCard onNavigate={() => handleQuickAction('ai-command-center')} data={aiData?.systemHealth} />
              </div>
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Lead Intelligence">
              <div className="shadow-md rounded-lg border border-primary/30 ring-1 ring-primary/10">
                <LeadIntelligenceCard onNavigate={() => handleQuickAction('lead-management')} data={aiData?.leadIntelligence} />
              </div>
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Market Anomaly">
              <div className="shadow-md rounded-lg border border-primary/30 ring-1 ring-primary/10">
                <MarketAnomalyCard data={aiData?.marketAnomalies} />
              </div>
            </SectionErrorBoundary>

            {/* Tier 2: Key intelligence — subtle shadow */}
            <SectionErrorBoundary sectionName="Market Intelligence">
              <div className="shadow-sm rounded-lg">
                <MarketIntelligenceCard onNavigate={() => handleQuickAction('ai-command-center')} data={aiData?.marketIntelligence} />
              </div>
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Agent Performance">
              <div className="shadow-sm rounded-lg">
                <AgentPerformanceCard onNavigate={() => handleQuickAction('agent-management')} data={aiData?.agentPerformance} />
              </div>
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Deal Pipeline">
              <div className="shadow-sm rounded-lg">
                <DealPipelineCard onNavigate={() => handleQuickAction('financial-management')} data={aiData?.dealPipeline} />
              </div>
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Geo Expansion">
              <div className="shadow-sm rounded-lg">
                <GeoExpansionCard onNavigate={() => handleQuickAction('ai-command-center')} data={aiData?.geoExpansion} />
              </div>
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Investment Attractiveness">
              <div className="shadow-sm rounded-lg">
                <InvestmentAttractivenessCard />
              </div>
            </SectionErrorBoundary>

            {/* Tier 3: Secondary insights — flat */}
            <SectionErrorBoundary sectionName="Buyer-Listing Match">
              <BuyerListingMatchCard data={aiData?.buyerListingMatch} />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="National Forecast">
              <NationalForecastCard data={aiData?.nationalForecast} />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Market Cycle">
              <MarketCyclePredictionCard data={aiData?.marketCycle} />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Capital Flow">
              <CapitalFlowCard data={aiData?.capitalFlow} />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Portfolio Strategy">
              <PortfolioStrategyCard />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Deal Timing">
              <DealTimingSignalCard data={aiData?.dealTiming} />
            </SectionErrorBoundary>
          </div>
          )}

          {/* ═══ ZONE 3: Operations ═══ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-chart-3/30 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-chart-3/70">Operations</span>
              <div className="h-px flex-1 bg-gradient-to-l from-chart-3/30 to-transparent" />
            </div>

            <SectionErrorBoundary sectionName="AI Batch Control">
              <AIBatchControlPanel />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="AI Scheduling">
              <AISchedulingDashboard />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Job Queue Health">
              <JobQueueHealthCard />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="AI Job Observability">
              <AIJobObservabilityPanel />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Listing Performance">
              <ListingPerformanceOptimizerCard onNavigate={() => onSectionChange?.("listing-optimization-center")} />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Pricing Intelligence">
              <PricingIntelligenceCard />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Deal Closing Timeline">
              <DealClosingTimelineCard />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Pricing Automation">
              <PricingAutomationCard />
            </SectionErrorBoundary>
            <SectionErrorBoundary sectionName="Marketplace Optimization">
              <MarketplaceOptimizationCard />
            </SectionErrorBoundary>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs gap-1.5"
                onClick={() => handleQuickAction('ai-command-center')}
              >
                <Zap className="h-3.5 w-3.5" />
                AI Center
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 text-xs gap-1.5"
                onClick={() => handleQuickAction('diagnostic')}
              >
                <Gauge className="h-3.5 w-3.5" />
                Diagnostics
              </Button>
            </div>
          </div>
         </SectionErrorBoundary>
        </div>
      </div>
    </section>
  );
});


export default AdminOverview;
