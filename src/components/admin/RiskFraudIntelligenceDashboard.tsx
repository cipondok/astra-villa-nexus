import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ShieldAlert, AlertTriangle, Users, Activity, Eye, CheckCircle,
  XCircle, Clock, TrendingUp, Zap, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  useRiskDashboardStats,
  useRiskEvents,
  useRiskCases,
  useHighRiskUsers,
  useUpdateRiskCase,
} from '@/hooks/useRiskIntelligence';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-destructive/15 text-destructive border-destructive/30',
  high: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  medium: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  low: 'bg-chart-2/15 text-chart-2 border-chart-2/30',
};

const RISK_LEVEL_STYLES: Record<string, string> = {
  trusted: 'bg-chart-2/15 text-chart-2',
  normal: 'bg-secondary text-secondary-foreground',
  watchlist: 'bg-chart-3/15 text-chart-3',
  restricted: 'bg-destructive/15 text-destructive',
};

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const RiskFraudIntelligenceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const stats = useRiskDashboardStats();
  const events = useRiskEvents(50);
  const cases = useRiskCases();
  const highRiskUsers = useHighRiskUsers();
  const updateCase = useUpdateRiskCase();

  const signalChartData = Object.entries(stats.data?.signal_distribution || {})
    .map(([name, count]) => ({ name: name.replace(/_/g, ' '), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const severityDistribution = (events.data || []).reduce((acc, e) => {
    acc[e.severity_level] = (acc[e.severity_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(severityDistribution).map(([name, value]) => ({ name, value }));

  const handleCaseAction = async (caseId: string, status: string) => {
    try {
      await updateCase.mutateAsync({
        caseId,
        updates: { status, ...(status === 'cleared' || status === 'action_taken' ? { resolved_at: new Date().toISOString() } : {}) } as any,
      });
      toast.success(`Case ${status === 'cleared' ? 'cleared' : status === 'action_taken' ? 'actioned' : 'updated'}`);
    } catch { toast.error('Failed to update case'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            AI Risk & Fraud Intelligence Engine
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time behavioral intelligence • Proactive fraud prevention • Investor protection
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { stats.refetch(); events.refetch(); }}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Events (24h)', value: stats.data?.events_24h || 0, icon: Activity, color: 'text-chart-1' },
          { label: 'Events (7d)', value: stats.data?.events_7d || 0, icon: TrendingUp, color: 'text-chart-2' },
          { label: 'Open Cases', value: stats.data?.open_cases || 0, icon: AlertTriangle, color: 'text-chart-3' },
          { label: 'High Risk Users', value: stats.data?.high_risk_users || 0, icon: Users, color: 'text-destructive' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Risk Events</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
          <TabsTrigger value="users">High Risk Users</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Signal Type Distribution (7d)</CardTitle></CardHeader>
              <CardContent>
                {signalChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={signalChartData} layout="vertical">
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis type="category" dataKey="name" width={120} stroke="hsl(var(--muted-foreground))" fontSize={10} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-sm text-center py-8">No signals recorded yet</p>}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Severity Distribution</CardTitle></CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-sm text-center py-8">No events to chart</p>}
              </CardContent>
            </Card>
          </div>

          {/* Recent Critical Alerts */}
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-destructive" /> Recent Critical Events</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {(stats.data?.recent_critical || []).map((evt) => (
                    <div key={evt.id} className={`p-3 rounded-lg border ${SEVERITY_STYLES[evt.severity_level] || ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-sm">{evt.risk_signal_type.replace(/_/g, ' ')}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{evt.entity_type}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(evt.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Entity: {evt.entity_id.slice(0, 8)}… | Source: {evt.source_system}</p>
                    </div>
                  ))}
                  {(stats.data?.recent_critical || []).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-8">No critical events — system clear</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Event Stream</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {(events.data || []).map((evt) => (
                    <div key={evt.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                      <Badge variant="outline" className={`text-xs ${SEVERITY_STYLES[evt.severity_level] || ''}`}>
                        {evt.severity_level}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{evt.risk_signal_type.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">{evt.entity_type}: {evt.entity_id.slice(0, 12)}… • {evt.source_system}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(evt.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cases Tab */}
        <TabsContent value="cases">
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Risk Investigation Cases</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {(cases.data || []).map((c) => (
                    <div key={c.id} className="p-4 rounded-lg border border-border/50 bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={c.status === 'open' ? 'destructive' : c.status === 'investigating' ? 'default' : 'secondary'}>
                            {c.status}
                          </Badge>
                          <span className="text-sm font-medium">{c.related_entity_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Score: {c.risk_score}</span>
                          <Progress value={c.risk_score} className="w-16 h-2" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{c.risk_reason}</p>
                      <div className="flex gap-2">
                        {c.status === 'open' && (
                          <Button size="sm" variant="outline" onClick={() => handleCaseAction(c.id, 'investigating')}>
                            <Eye className="h-3 w-3 mr-1" /> Investigate
                          </Button>
                        )}
                        {(c.status === 'open' || c.status === 'investigating') && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleCaseAction(c.id, 'cleared')}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Clear
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleCaseAction(c.id, 'action_taken')}>
                              <XCircle className="h-3 w-3 mr-1" /> Action
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {(cases.data || []).length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-8">No active risk cases</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* High Risk Users Tab */}
        <TabsContent value="users">
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">High Risk Users</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {(highRiskUsers.data || []).map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                        {(u.full_name || 'U')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={RISK_LEVEL_STYLES[u.risk_level] || ''}>{u.risk_level}</Badge>
                        <div className="text-right">
                          <p className="text-sm font-bold">{u.risk_score}</p>
                          <Progress value={u.risk_score} className="w-16 h-1.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(highRiskUsers.data || []).length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 mx-auto text-chart-2 mb-3" />
                      <p className="text-muted-foreground">All users within normal risk thresholds</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trust UX Footer */}
      <Card className="border-chart-2/30 bg-chart-2/5">
        <CardContent className="py-3 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-chart-2" />
          <div>
            <p className="text-sm font-medium text-foreground">ASTRA Investor Protection Intelligence Active</p>
            <p className="text-xs text-muted-foreground">Continuous behavioral monitoring • AI-ready scoring pipeline • Explainable risk decisions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskFraudIntelligenceDashboard;
