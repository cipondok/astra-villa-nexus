import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  useDataMoatHealth,
  useIntelligenceAPIAccess,
  PILLAR_CONFIG,
  TREND_CONFIG,
  MOAT_DEPTH_TIER,
} from '@/hooks/useDataMoatGovernance';
import {
  Database, Shield, TrendingUp, Layers, Lock,
  RefreshCw, Activity, BarChart3, Globe, Cpu,
  ArrowUpRight, ArrowDownRight, Minus, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'deepening') return <ArrowUpRight className="h-3 w-3" />;
  if (trend === 'eroding') return <ArrowDownRight className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
};

const formatNum = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
};

const DataMoatGovernancePanel = () => {
  const { data: health, isLoading, refetch } = useDataMoatHealth();
  const { data: apiAccess } = useIntelligenceAPIAccess();

  const pillars = health?.pillars ?? [];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Data Moat Governance</h1>
            <p className="text-sm text-muted-foreground">Proprietary intelligence depth · competitive advantage · monetization readiness</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Overall Moat Health */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Moat Score</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold tabular-nums text-foreground">{health?.overallScore ?? 0}</span>
              <span className={cn("text-sm font-medium", MOAT_DEPTH_TIER(health?.overallScore ?? 0).color)}>
                {MOAT_DEPTH_TIER(health?.overallScore ?? 0).label}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Data Points</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{formatNum(health?.totalDataPoints ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">30-Day Growth</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{formatNum(health?.totalDataPoints30d ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Replication Difficulty</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{health?.avgReplicationDifficulty ?? 0}/100</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monetizable</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-1">{health?.monetizableCount ?? 0} metrics</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pillars" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="pillars" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" />Intelligence Pillars</TabsTrigger>
          <TabsTrigger value="depth" className="gap-1.5 text-xs"><Database className="h-3.5 w-3.5" />Moat Depth Map</TabsTrigger>
          <TabsTrigger value="monetize" className="gap-1.5 text-xs"><Globe className="h-3.5 w-3.5" />Monetization</TabsTrigger>
          <TabsTrigger value="governance" className="gap-1.5 text-xs"><Lock className="h-3.5 w-3.5" />Governance</TabsTrigger>
        </TabsList>

        {/* Intelligence Pillars */}
        <TabsContent value="pillars">
          <div className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Computing moat intelligence...</p>
            ) : (
              pillars.map(pillar => {
                const config = PILLAR_CONFIG[pillar.pillar];
                const trendCfg = TREND_CONFIG[pillar.trend];
                const tier = MOAT_DEPTH_TIER(pillar.moatDepth);
                return (
                  <Card key={pillar.pillar} className="border-border/40">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{config?.icon}</span>
                            <h3 className="text-sm font-medium text-foreground">{pillar.label}</h3>
                            <Badge variant="outline" className={cn('text-[10px] border', trendCfg.color)}>
                              <TrendIcon trend={pillar.trend} />
                              <span className="ml-0.5">{trendCfg.label}</span>
                            </Badge>
                            <span className={cn("text-xs font-bold", tier.color)}>{tier.label}</span>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1"><Progress value={pillar.moatDepth} className="h-2" /></div>
                            <span className="text-sm font-bold tabular-nums text-foreground w-12 text-right">{pillar.moatDepth}%</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Data Points</span>
                              <p className="font-bold tabular-nums text-foreground">{formatNum(pillar.totalDataPoints)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">30d Growth</span>
                              <p className="font-bold tabular-nums text-foreground">{formatNum(pillar.dataPoints30d)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Replication</span>
                              <p className="font-bold tabular-nums text-foreground">{pillar.avgReplicationDifficulty}/100</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Competitive Edge</span>
                              <p className="font-bold tabular-nums text-foreground">{pillar.avgCompetitiveAdvantage}/100</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Freshness</span>
                              <p className="font-bold tabular-nums text-foreground">{pillar.avgFreshness}h</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Moat Depth Map */}
        <TabsContent value="depth">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Pillar Depth Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pillars.map(p => {
                  const tier = MOAT_DEPTH_TIER(p.moatDepth);
                  return (
                    <div key={p.pillar} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{PILLAR_CONFIG[p.pillar]?.icon} {p.label}</span>
                        <span className={cn("font-bold tabular-nums", tier.color)}>{p.moatDepth}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700",
                            p.moatDepth >= 80 ? 'bg-emerald-500' :
                            p.moatDepth >= 60 ? 'bg-blue-500' :
                            p.moatDepth >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          )}
                          style={{ width: `${p.moatDepth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  Data Pipeline Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { pipeline: 'Behavioral Event Ingestion', source: 'behavioral_events', status: 'active', rate: 'Real-time' },
                  { pipeline: 'Intelligence Cache Refresh', source: 'ai_intelligence_cache', status: 'active', rate: 'Every 10m' },
                  { pipeline: 'Liquidity Signal Processing', source: 'liquidity_signal_queue', status: 'active', rate: 'Every 5m' },
                  { pipeline: 'Investor Score Computation', source: 'investor_scores', status: 'active', rate: 'Every 30m' },
                  { pipeline: 'Market Heat Aggregation', source: 'market_heat_scores', status: 'active', rate: 'Every 30m' },
                  { pipeline: 'Price Prediction Engine', source: 'price_predictions', status: 'active', rate: 'Every 60m' },
                ].map(pipe => (
                  <div key={pipe.pipeline} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{pipe.pipeline}</p>
                      <p className="text-xs text-muted-foreground">{pipe.source} · {pipe.rate}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                      {pipe.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monetization */}
        <TabsContent value="monetize">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Intelligence API Monetization Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { tier: 'Basic', price: 'Rp 5M/mo', endpoints: 'Market heat, listing counts, avg prices', clients: 'Property portals, media' },
                  { tier: 'Premium', price: 'Rp 25M/mo', endpoints: 'Price predictions, demand forecasts, absorption rates', clients: 'Developers, banks' },
                  { tier: 'Enterprise', price: 'Rp 75M/mo', endpoints: 'Full capital flow signals, institutional allocation models', clients: 'REITs, funds, sovereign wealth' },
                ].map(t => (
                  <div key={t.tier} className="rounded-lg border border-border/30 px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-bold">{t.tier}</Badge>
                        <span className="text-sm font-bold tabular-nums text-foreground">{t.price}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Endpoints:</span> {t.endpoints}</p>
                    <p className="text-xs text-muted-foreground mt-0.5"><span className="font-medium text-foreground">Target clients:</span> {t.clients}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  API Access Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!apiAccess?.length ? (
                  <div className="text-center py-8">
                    <Cpu className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">No API access recorded yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Intelligence API monetization activates when data moat reaches Fortress tier</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(apiAccess as any[]).slice(0, 10).map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between text-xs border-b border-border/20 pb-1.5">
                        <div>
                          <span className="font-medium text-foreground">{log.client_name}</span>
                          <span className="text-muted-foreground ml-2">{log.endpoint}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{log.data_tier}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Governance */}
        <TabsContent value="governance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Data Governance Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { control: 'RLS Enforcement', desc: 'All intelligence tables protected by row-level security', status: 'Enforced' },
                  { control: 'API Rate Limiting', desc: 'Throttle external intelligence API consumers', status: 'Configured' },
                  { control: 'Data Retention Policy', desc: 'Behavioral events: 36mo, Cache: 12mo, Signals: 6mo', status: 'Active' },
                  { control: 'Anonymization Pipeline', desc: 'PII stripped from all aggregated intelligence outputs', status: 'Active' },
                  { control: 'Audit Trail', desc: 'All admin data access logged with timestamp + user', status: 'Enforced' },
                  { control: 'Export Controls', desc: 'Bulk data export requires admin approval', status: 'Enforced' },
                ].map(ctrl => (
                  <div key={ctrl.control} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{ctrl.control}</p>
                      <p className="text-xs text-muted-foreground">{ctrl.desc}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                      {ctrl.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Moat Deepening Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { phase: 'Phase 1 (M1-3)', goal: 'Accumulate 100K+ behavioral events', status: 'active' },
                  { phase: 'Phase 2 (M3-6)', goal: 'Validate price prediction accuracy >85%', status: 'planned' },
                  { phase: 'Phase 3 (M6-12)', goal: 'Launch Basic intelligence API tier', status: 'planned' },
                  { phase: 'Phase 4 (M12-18)', goal: 'Institutional data partnerships (3+ banks)', status: 'planned' },
                  { phase: 'Phase 5 (M18-24)', goal: 'Enterprise API tier — proprietary dataset licensing', status: 'planned' },
                  { phase: 'Phase 6 (M24-36)', goal: 'Regional expansion — cross-border intelligence moat', status: 'planned' },
                ].map(phase => (
                  <div key={phase.phase} className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2.5">
                    <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
                      phase.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    )} />
                    <div>
                      <p className="text-xs font-bold text-foreground">{phase.phase}</p>
                      <p className="text-xs text-muted-foreground">{phase.goal}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataMoatGovernancePanel;
