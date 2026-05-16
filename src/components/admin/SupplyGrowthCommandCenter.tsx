import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSupplyGrowthDashboard, useAgentSupplyScores, useGenerateSupplyNudges } from '@/hooks/useSupplyGrowthEngine';
import { Building, Users, TrendingUp, Target, Zap, MapPin, Star, Bell, BarChart3, Award } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

const FUNNEL_LABELS: Record<string, string> = {
  lead_contacted: 'Lead Contacted',
  listing_started: 'Listing Started',
  media_uploaded: 'Media Uploaded',
  verification_pending: 'Verification',
  listing_live: 'Listing Live',
  first_inquiry: 'First Inquiry',
  escrow_started: 'Escrow Started',
  sold_or_rented: 'Sold / Rented',
};

const SupplyGrowthCommandCenter = () => {
  const { data, isLoading } = useSupplyGrowthDashboard();
  const { data: agentScores } = useAgentSupplyScores();
  const nudgeMutation = useGenerateSupplyNudges();
  const [activeTab, setActiveTab] = useState('overview');

  const s = data?.summary;

  const handleNudge = () => {
    nudgeMutation.mutate(undefined, {
      onSuccess: (r) => toast.success(`${r.nudges_created} nudges generated`),
      onError: (e) => toast.error(e.message),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Supply Growth & Agent Acquisition Engine
          </h2>
          <p className="text-sm text-muted-foreground">Listing lifecycle, agent scoring, quality intelligence & geographic expansion</p>
        </div>
        <Button size="sm" onClick={handleNudge} disabled={nudgeMutation.isPending}>
          <Bell className="h-4 w-4 mr-1" /> Generate Nudges
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: 'Total Events', value: s?.total_events ?? 0, icon: BarChart3, color: 'text-blue-500' },
          { label: 'Live Listings', value: s?.live_listings ?? 0, icon: Building, color: 'text-green-500' },
          { label: 'Escrows', value: s?.escrows_started ?? 0, icon: Target, color: 'text-amber-500' },
          { label: 'Deals Closed', value: s?.deals_closed ?? 0, icon: Star, color: 'text-emerald-500' },
          { label: 'Avg Quality', value: `${s?.avg_listing_quality ?? 0}/100`, icon: Award, color: 'text-purple-500' },
          { label: 'Pending Nudges', value: s?.pending_nudges ?? 0, icon: Bell, color: 'text-orange-500' },
          { label: 'Zones Tracked', value: s?.zones_tracked ?? 0, icon: MapPin, color: 'text-cyan-500' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} {...anim} transition={{ delay: i * 0.05 }}>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-3 text-center">
                <kpi.icon className={`h-4 w-4 mx-auto mb-1 ${kpi.color}`} />
                <div className="text-lg font-bold text-foreground">{kpi.value}</div>
                <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Funnel</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        {/* Funnel Tab */}
        <TabsContent value="overview" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Supply Funnel Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(FUNNEL_LABELS).map(([key, label]) => {
                const count = data?.funnel?.[key] ?? 0;
                const max = Math.max(...Object.values(data?.funnel || { x: 1 }), 1);
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
                    <Progress value={(count / max) * 100} className="flex-1 h-3" />
                    <Badge variant="outline" className="text-xs w-10 text-center">{count}</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">By Channel</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {Object.entries(data?.by_channel || {}).sort((a, b) => b[1] - a[1]).map(([ch, count]) => (
                  <div key={ch} className="flex justify-between text-xs">
                    <span className="capitalize text-muted-foreground">{ch.replace(/_/g, ' ')}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {Object.keys(data?.by_channel || {}).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No channel data yet</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">By City</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {Object.entries(data?.by_city || {}).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([city, count]) => (
                  <div key={city} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{city}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {Object.keys(data?.by_city || {}).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No city data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agent Leaderboard Tab */}
        <TabsContent value="agents" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Agent Supply Performance Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!agentScores || agentScores.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-8">No agent data yet. Supply events will populate this leaderboard.</p>
              ) : (
                <div className="space-y-2">
                  {agentScores.slice(0, 15).map((a, i) => (
                    <div key={a.agent_user_id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-400/20 text-slate-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-muted/30 text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground truncate block">{a.agent_user_id.slice(0, 8)}...</span>
                      </div>
                      <Badge variant={a.score >= 70 ? 'default' : a.score >= 40 ? 'secondary' : 'outline'} className="text-xs">
                        Score: {a.score}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{a.listings_live} live</span>
                      <span className="text-xs text-muted-foreground">{a.deals_closed} closed</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" /> Listing Quality Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!data?.quality_signals || data.quality_signals.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-8">No quality signals recorded yet. Signals will appear as listings are evaluated.</p>
              ) : (
                <div className="space-y-2">
                  {data.quality_signals.slice(0, 15).map((q: any) => (
                    <div key={q.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground">{q.property_id?.slice(0, 8)}...</span>
                      </div>
                      <div className="flex gap-2 text-[10px] text-muted-foreground">
                        <span>📷 {q.image_quality_score}</span>
                        <span>📝 {q.description_completeness_score}</span>
                        <span>💰 {q.price_fairness_score}</span>
                      </div>
                      <Badge variant={q.quality_score >= 70 ? 'default' : q.quality_score >= 40 ? 'secondary' : 'destructive'} className="text-xs">
                        {q.quality_score}/100
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Supply Zone Metrics & Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!data?.zones || data.zones.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-8">No zone metrics recorded yet. Data will appear as market coverage expands.</p>
              ) : (
                <div className="space-y-2">
                  {data.zones.map((z: any) => (
                    <div key={z.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-medium text-foreground">{z.city}</span>
                        {z.district && <span className="text-[10px] text-muted-foreground ml-1">· {z.district}</span>}
                      </div>
                      <div className="flex gap-2 text-[10px]">
                        <span className="text-muted-foreground">{z.active_listing_count} listings</span>
                        <Badge variant={z.supply_gap_score > 50 ? 'destructive' : 'secondary'} className="text-[10px]">
                          Gap: {z.supply_gap_score}
                        </Badge>
                        <span className="text-muted-foreground">Demand: {z.investor_demand_index}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Seller Conversion Funnel Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(!data?.conversions || data.conversions.length === 0) ? (
                <p className="text-xs text-muted-foreground text-center py-8">No conversion data yet. Metrics will populate as properties move through the pipeline.</p>
              ) : (
                <div className="space-y-2">
                  {data.conversions.slice(0, 15).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground">{c.property_id?.slice(0, 8)}...</span>
                      </div>
                      <div className="flex gap-2 text-[10px] text-muted-foreground">
                        <span>View→Inq: {c.view_to_inquiry_rate}%</span>
                        <span>Inq→Visit: {c.inquiry_to_visit_rate}%</span>
                        <span>Visit→Esc: {c.visit_to_escrow_rate}%</span>
                        <span>Esc→Close: {c.escrow_to_close_rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplyGrowthCommandCenter;
