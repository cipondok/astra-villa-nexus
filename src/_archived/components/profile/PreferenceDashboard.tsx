import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell,
} from 'recharts';
import {
  Brain, MapPin, TrendingUp, Eye, Heart, Home,
  Sparkles, Target, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Json } from '@/integrations/supabase/types';
import { getCurrencyFormatterShort } from '@/stores/currencyStore';

// ─── Types ───────────────────────────────────────────────────────────
interface LearnedPref {
  pattern_type: string;
  pattern_key: string;
  pattern_value: Json;
  confidence_score: number | null;
  sample_count: number | null;
  last_reinforced_at: string | null;
}

interface BehaviorSignal {
  property_id: string | null;
  signal_type: string;
  property_snapshot: Json;
  time_spent_seconds: number | null;
  created_at: string | null;
}

// ─── Data hooks ──────────────────────────────────────────────────────
function usePreferenceDashboardData() {
  const { user } = useAuth();

  const learnedQuery = useQuery({
    queryKey: ['preference-dashboard-learned', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('learned_preferences')
        .select('pattern_type, pattern_key, pattern_value, confidence_score, sample_count, last_reinforced_at')
        .eq('user_id', user!.id)
        .order('confidence_score', { ascending: false })
        .limit(50);
      return (data ?? []) as LearnedPref[];
    },
    enabled: !!user,
  });

  const profileQuery = useQuery({
    queryKey: ['preference-dashboard-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_preference_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const signalsQuery = useQuery({
    queryKey: ['preference-dashboard-signals', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_behavior_signals')
        .select('property_id, signal_type, property_snapshot, time_spent_seconds, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(200);
      return (data ?? []) as BehaviorSignal[];
    },
    enabled: !!user,
  });

  return {
    learned: learnedQuery.data ?? [],
    profile: profileQuery.data,
    signals: signalsQuery.data ?? [],
    isLoading: learnedQuery.isLoading || profileQuery.isLoading || signalsQuery.isLoading,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────
const formatPrice = getCurrencyFormatterShort();

function getPatternIcon(type: string) {
  switch (type) {
    case 'location': return MapPin;
    case 'budget': return TrendingUp;
    case 'property_type': return Home;
    case 'feature': return Heart;
    default: return Eye;
  }
}

function getConfidenceColor(score: number): string {
  if (score >= 0.8) return 'text-green-600 dark:text-green-400';
  if (score >= 0.5) return 'text-amber-600 dark:text-amber-400';
  return 'text-muted-foreground';
}

function getConfidenceLabel(score: number): string {
  if (score >= 0.8) return 'Strong';
  if (score >= 0.5) return 'Moderate';
  return 'Emerging';
}

// ─── Sub-components ──────────────────────────────────────────────────
const LearnedPatternsCard: React.FC<{ learned: LearnedPref[] }> = ({ learned }) => {
  if (learned.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Learned Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Browse more properties to build your preference profile.
          </p>
        </CardContent>
      </Card>
    );
  }

  const grouped = learned.reduce<Record<string, LearnedPref[]>>((acc, p) => {
    (acc[p.pattern_type] ??= []).push(p);
    return acc;
  }, {});

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Learned Patterns
          <Badge variant="secondary" className="text-[10px] ml-auto">{learned.length} patterns</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(grouped).map(([type, prefs]) => {
          const Icon = getPatternIcon(type);
          return (
            <div key={type} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium capitalize">{type.replace('_', ' ')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {prefs.slice(0, 6).map((p) => {
                  const confidence = p.confidence_score ?? 0;
                  const label = typeof p.pattern_value === 'object' && p.pattern_value !== null
                    ? (p.pattern_value as any).label || (p.pattern_value as any).value || p.pattern_key
                    : String(p.pattern_value ?? p.pattern_key);
                  return (
                    <div
                      key={p.pattern_key}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10"
                    >
                      <span className="text-xs font-medium truncate max-w-[120px]">{label}</span>
                      <span className={cn("text-[10px] font-semibold", getConfidenceColor(confidence))}>
                        {Math.round(confidence * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const LocationHeatmapCard: React.FC<{ signals: BehaviorSignal[] }> = ({ signals }) => {
  const locationData = useMemo(() => {
    const counts: Record<string, { views: number; totalTime: number }> = {};
    signals.forEach((s) => {
      const snap = s.property_snapshot as Record<string, unknown> | null;
      const city = (snap?.city as string) || (snap?.location as string) || 'Unknown';
      if (city === 'Unknown') return;
      if (!counts[city]) counts[city] = { views: 0, totalTime: 0 };
      counts[city].views += 1;
      counts[city].totalTime += s.time_spent_seconds ?? 0;
    });
    return Object.entries(counts)
      .map(([city, { views, totalTime }]) => ({
        city,
        views,
        avgTime: views > 0 ? Math.round(totalTime / views) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [signals]);

  const maxViews = Math.max(...locationData.map(d => d.views), 1);

  if (locationData.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Browsing by Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No browsing data yet. View some properties to see your location patterns.
          </p>
        </CardContent>
      </Card>
    );
  }

  const barColors = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Browsing Heatmap by Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locationData} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis
                dataKey="city"
                type="category"
                width={80}
                tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(var(--popover-foreground))',
                }}
                formatter={(value: number, name: string) => [value, name === 'views' ? 'Views' : 'Avg Time (s)']}
              />
              <Bar dataKey="views" radius={[0, 4, 4, 0]} barSize={16}>
                {locationData.map((_, idx) => (
                  <Cell key={idx} fill={barColors[idx % barColors.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Intensity grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {locationData.slice(0, 6).map((loc) => {
            const intensity = Math.round((loc.views / maxViews) * 100);
            return (
              <div
                key={loc.city}
                className="p-2.5 rounded-lg border border-border/50 space-y-1.5"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--primary) / ${intensity * 0.003}) 0%, transparent 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate">{loc.city}</span>
                  <span className="text-[10px] text-muted-foreground">{loc.views}x</span>
                </div>
                <Progress value={intensity} className="h-1" />
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  Avg {loc.avgTime}s
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const PriceRangeHistoryCard: React.FC<{ signals: BehaviorSignal[] }> = ({ signals }) => {
  const priceHistory = useMemo(() => {
    // Group signals by week and compute viewed price ranges
    const weekBuckets: Record<string, number[]> = {};
    signals.forEach((s) => {
      const snap = s.property_snapshot as Record<string, unknown> | null;
      const price = Number(snap?.price ?? 0);
      if (!price || !s.created_at) return;
      const date = new Date(s.created_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const key = weekStart.toISOString().split('T')[0];
      (weekBuckets[key] ??= []).push(price);
    });

    return Object.entries(weekBuckets)
      .map(([week, prices]) => {
        prices.sort((a, b) => a - b);
        const p10 = prices[Math.floor(prices.length * 0.1)] ?? prices[0];
        const p90 = prices[Math.floor(prices.length * 0.9)] ?? prices[prices.length - 1];
        const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
        return {
          week: new Date(week).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          min: p10,
          max: p90,
          avg: Math.round(avg),
          count: prices.length,
        };
      })
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);
  }, [signals]);

  if (priceHistory.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Price Range History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Browse more properties to see your price interest trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Price Range History
          <Badge variant="secondary" className="text-[10px] ml-auto">
            {priceHistory.reduce((s, w) => s + w.count, 0)} views
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistory} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => formatPrice(v)}
                width={65}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(var(--popover-foreground))',
                }}
                formatter={(value: number) => [formatPrice(value)]}
              />
              <Area
                type="monotone"
                dataKey="max"
                stackId="range"
                stroke="hsl(var(--chart-2))"
                fill="url(#priceGradient)"
                strokeWidth={1.5}
                name="Upper Range"
              />
              <Area
                type="monotone"
                dataKey="avg"
                stroke="hsl(var(--primary))"
                fill="none"
                strokeWidth={2}
                strokeDasharray="4 2"
                name="Average"
              />
              <Area
                type="monotone"
                dataKey="min"
                stackId="range2"
                stroke="hsl(var(--chart-4))"
                fill="none"
                strokeWidth={1.5}
                name="Lower Range"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(() => {
            const allAvg = priceHistory.map(w => w.avg);
            const overallAvg = allAvg.reduce((s, v) => s + v, 0) / allAvg.length;
            const trend = allAvg.length >= 2 ? allAvg[allAvg.length - 1] - allAvg[0] : 0;
            const allMin = Math.min(...priceHistory.map(w => w.min));
            const allMax = Math.max(...priceHistory.map(w => w.max));
            return [
              { label: 'Avg Interest', value: formatPrice(overallAvg) },
              { label: 'Range', value: `${formatPrice(allMin)} - ${formatPrice(allMax)}` },
              { label: 'Trend', value: trend >= 0 ? `↑ ${formatPrice(Math.abs(trend))}` : `↓ ${formatPrice(Math.abs(trend))}` },
            ].map(({ label, value }) => (
              <div key={label} className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-xs font-semibold truncate">{value}</p>
              </div>
            ));
          })()}
        </div>
      </CardContent>
    </Card>
  );
};

const PreferenceProfileSummary: React.FC<{ profile: any; learned: LearnedPref[] }> = ({ profile, learned }) => {
  const totalSignals = learned.reduce((s, l) => s + (l.sample_count ?? 0), 0);
  const avgConfidence = learned.length > 0
    ? learned.reduce((s, l) => s + (l.confidence_score ?? 0), 0) / learned.length
    : 0;

  const stats = [
    { icon: Target, label: 'Patterns Detected', value: learned.length },
    { icon: Eye, label: 'Total Signals', value: totalSignals },
    { icon: Sparkles, label: 'Avg Confidence', value: `${Math.round(avgConfidence * 100)}%` },
  ];

  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-transparent to-primary/3">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Preference Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center p-3 rounded-lg bg-background/60 border border-border/50">
              <Icon className="h-4 w-4 mx-auto mb-1.5 text-primary" />
              <p className="text-lg font-bold">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Explicit preferences from profile */}
        {profile && (
          <div className="mt-4 space-y-2">
            {profile.preferred_locations?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-muted-foreground mr-1">📍 Locations:</span>
                {profile.preferred_locations.map((l: string) => (
                  <Badge key={l} variant="outline" className="text-[10px] py-0">{l}</Badge>
                ))}
              </div>
            )}
            {profile.preferred_property_types?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-muted-foreground mr-1">🏠 Types:</span>
                {profile.preferred_property_types.map((t: string) => (
                  <Badge key={t} variant="outline" className="text-[10px] py-0">{t}</Badge>
                ))}
              </div>
            )}
            {(profile.min_budget || profile.max_budget) && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">💰 Budget:</span>
                <span className="text-xs font-medium">
                  {formatPrice(profile.min_budget ?? 0)} – {formatPrice(profile.max_budget ?? 0)}
                </span>
              </div>
            )}
            {profile.must_have_features?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] text-muted-foreground mr-1">✨ Must-have:</span>
                {profile.must_have_features.map((f: string) => (
                  <Badge key={f} variant="secondary" className="text-[10px] py-0">{f}</Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main Component ──────────────────────────────────────────────────
const PreferenceDashboard: React.FC = () => {
  const { user } = useAuth();
  const { learned, profile, signals, isLoading } = usePreferenceDashboardData();

  if (!user) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">Sign in to view your preference dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[140px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[260px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PreferenceProfileSummary profile={profile} learned={learned} />
      <LearnedPatternsCard learned={learned} />
      <LocationHeatmapCard signals={signals} />
      <PriceRangeHistoryCard signals={signals} />
    </div>
  );
};

export default PreferenceDashboard;
