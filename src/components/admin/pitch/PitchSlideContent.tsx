import React from 'react';
import { CheckCircle2, TrendingUp, Building, Users, Zap, BarChart3, Target, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedCounter from './AnimatedCounter';
import type { PitchMetrics } from './usePitchMetrics';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

// ── Reusable slide content builders ──

export function KeyPointsGrid({ points, color }: { points: { point: string; detail: string }[]; color: string }) {
  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      {points.map((kp, i) => (
        <div key={i} className="flex items-start gap-4">
          <CheckCircle2 className={cn('h-7 w-7 shrink-0 mt-1', color)} />
          <div>
            <p className="text-2xl font-bold leading-snug">{kp.point}</p>
            <p className="text-lg opacity-60 mt-1 leading-relaxed">{kp.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LiveMetricsSlide({ metrics }: { metrics: PitchMetrics | undefined }) {
  const items = [
    { label: 'Properties Listed', value: metrics?.totalProperties ?? 0, icon: Building, suffix: '+', color: 'text-primary' },
    { label: 'Active Investors', value: metrics?.activeInvestors ?? 0, icon: Users, suffix: '+', color: 'text-chart-3' },
    { label: 'Elite Opportunities', value: metrics?.eliteOpportunities ?? 0, icon: Zap, color: 'text-chart-1' },
    { label: 'Avg Opportunity Score', value: metrics?.avgOpportunityScore ?? 0, icon: Target, suffix: '/100', color: 'text-chart-4' },
    { label: 'Deal Alerts Generated', value: metrics?.dealAlertsGenerated ?? 0, icon: BarChart3, color: 'text-primary' },
    { label: 'Market Heat Clusters', value: metrics?.marketHeatClusters ?? 0, icon: TrendingUp, color: 'text-chart-1' },
  ];
  return (
    <div className="grid grid-cols-3 gap-8 h-full items-center">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex flex-col items-center text-center gap-3">
            <Icon className={cn('h-10 w-10', item.color)} />
            <AnimatedCounter
              value={item.value}
              suffix={item.suffix}
              className={cn('text-[52px]', item.color)}
              duration={2000}
            />
            <span className="text-xl opacity-50">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function OpportunityDistributionChart() {
  const data = [
    { range: '0-20', count: 45, fill: 'hsl(var(--muted-foreground))' },
    { range: '21-40', count: 120, fill: 'hsl(var(--chart-3))' },
    { range: '41-60', count: 280, fill: 'hsl(var(--chart-4))' },
    { range: '61-80', count: 190, fill: 'hsl(var(--chart-1))' },
    { range: '81-100', count: 65, fill: 'hsl(var(--primary))' },
  ];
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-4">AI Opportunity Score Distribution</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 30, left: 0 }}>
            <XAxis dataKey="range" tick={{ fontSize: 18 }} label={{ value: 'Score Range', position: 'bottom', fontSize: 18 }} />
            <YAxis tick={{ fontSize: 16 }} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RevenueProjectionChart() {
  const data = [
    { month: 'M1', revenue: 50 },
    { month: 'M3', revenue: 200 },
    { month: 'M6', revenue: 600 },
    { month: 'M9', revenue: 1400 },
    { month: 'M12', revenue: 2300 },
    { month: 'M18', revenue: 5000 },
  ];
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-4">Revenue Trajectory (Rp M/month)</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.3)" />
            <XAxis dataKey="month" tick={{ fontSize: 18 }} />
            <YAxis tick={{ fontSize: 16 }} tickFormatter={(v) => `${v}M`} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={4}
              dot={{ r: 6, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CompetitiveMatrixChart() {
  const data = [
    { subject: 'AI Intelligence', us: 95, competitors: 15 },
    { subject: 'Listings', us: 70, competitors: 85 },
    { subject: 'UX Quality', us: 90, competitors: 60 },
    { subject: 'Data Depth', us: 92, competitors: 30 },
    { subject: 'Agent Tools', us: 85, competitors: 40 },
    { subject: 'Predictive', us: 88, competitors: 5 },
  ];
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-4">Competitive Intelligence Comparison</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border) / 0.3)" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 16 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Radar name="ASTRA Villa" dataKey="us" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
            <Radar name="Competitors" dataKey="competitors" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FundAllocationChart() {
  const data = [
    { name: 'Team (40%)', value: 40, fill: 'hsl(var(--primary))' },
    { name: 'Growth (35%)', value: 35, fill: 'hsl(var(--chart-1))' },
    { name: 'Product (25%)', value: 25, fill: 'hsl(var(--chart-4))' },
  ];
  return (
    <div className="h-full flex items-center gap-12">
      <div className="flex-1 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="75%"
              dataKey="value"
              stroke="hsl(var(--background))"
              strokeWidth={3}
            >
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-6">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-4">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: d.fill }} />
            <span className="text-2xl font-bold">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
