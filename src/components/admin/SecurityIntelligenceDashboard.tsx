import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, Users, Activity, Search, Clock, MapPin, Monitor,
  Ban, Eye, TrendingUp, CheckCircle, Globe, Lock, Fingerprint, RefreshCw,
  ChevronRight, AlertCircle, Zap, ShieldAlert, ShieldCheck, UserX,
  Smartphone, Laptop, FileText, Send, XCircle, ArrowUpRight, BarChart3,
  Skull, Radio, Target, Flag, MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────
interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  created_at: string;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  continent_code: string | null;
  risk_score: number | null;
  is_suspicious: boolean | null;
  geo_anomaly: boolean | null;
  failure_reason: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
}

interface SecurityAlert {
  id: string;
  user_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  is_read: boolean | null;
  is_resolved: boolean | null;
  location_data: any;
  metadata: any;
  created_at: string;
  escalation_level: string | null;
  investigation_status: string | null;
  resolved_at: string | null;
}

interface Lockout {
  id: string;
  email: string;
  failed_attempts: number;
  lockout_tier: number;
  locked_at: string;
  unlock_at: string;
  is_active: boolean;
  ip_address: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────
const SEVERITY_CONFIG: Record<string, { color: string; icon: React.ElementType; bg: string }> = {
  critical: { color: 'text-red-400', icon: Skull, bg: 'bg-red-500/10 border-red-500/20' },
  high: { color: 'text-orange-400', icon: ShieldAlert, bg: 'bg-orange-500/10 border-orange-500/20' },
  medium: { color: 'text-amber-400', icon: AlertTriangle, bg: 'bg-amber-500/10 border-amber-500/20' },
  low: { color: 'text-blue-400', icon: AlertCircle, bg: 'bg-blue-500/10 border-blue-500/20' },
};

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', GB: 'United Kingdom', ID: 'Indonesia', SG: 'Singapore',
  MY: 'Malaysia', AE: 'UAE', AU: 'Australia', JP: 'Japan', CN: 'China',
  IN: 'India', DE: 'Germany', FR: 'France', KR: 'South Korea', TH: 'Thailand',
  VN: 'Vietnam', PH: 'Philippines', HK: 'Hong Kong', TW: 'Taiwan',
  KP: 'North Korea', IR: 'Iran', SY: 'Syria', CU: 'Cuba', RU: 'Russia',
};

const HIGH_RISK_COUNTRIES = new Set(['KP', 'IR', 'SY', 'CU', 'SD']);

// ─── Hook: Security Data ────────────────────────────────────────────
function useSecurityData() {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [lockouts, setLockouts] = useState<Lockout[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [attemptsRes, alertsRes, lockoutsRes] = await Promise.all([
        supabase.from('server_login_attempts').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('security_alerts').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('server_lockouts').select('*').order('locked_at', { ascending: false }).limit(100),
      ]);
      if (attemptsRes.data) setAttempts(attemptsRes.data as unknown as LoginAttempt[]);
      if (alertsRes.data) setAlerts(alertsRes.data as unknown as SecurityAlert[]);
      if (lockoutsRes.data) setLockouts(lockoutsRes.data as unknown as Lockout[]);
    } catch (e) {
      console.error('Security data fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { attempts, alerts, lockouts, loading, refresh, setAlerts };
}

// ─── KPI Card ────────────────────────────────────────────────────────
const KPICard = ({ label, value, icon: Icon, trend, variant = 'default' }: {
  label: string; value: string | number; icon: React.ElementType;
  trend?: string; variant?: 'default' | 'danger' | 'warning' | 'success';
}) => {
  const variants = {
    default: 'border-border/50',
    danger: 'border-red-500/30 bg-red-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    success: 'border-emerald-500/30 bg-emerald-500/5',
  };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={`${variants[variant]} transition-all hover:shadow-md`}>
        <CardContent className="pt-4 pb-3 px-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
              <p className="text-2xl font-bold tabular-nums">{value}</p>
              {trend && <p className="text-[10px] text-muted-foreground">{trend}</p>}
            </div>
            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── Geo Login Map (Country Distribution) ────────────────────────────
const GeoLoginPanel = ({ attempts }: { attempts: LoginAttempt[] }) => {
  const countryData = useMemo(() => {
    const counts: Record<string, { total: number; suspicious: number; failed: number }> = {};
    attempts.forEach(a => {
      const c = a.country || 'Unknown';
      if (!counts[c]) counts[c] = { total: 0, suspicious: 0, failed: 0 };
      counts[c].total++;
      if (a.is_suspicious) counts[c].suspicious++;
      if (!a.success) counts[c].failed++;
    });
    return Object.entries(counts)
      .map(([code, data]) => ({
        code, name: COUNTRY_NAMES[code] || code,
        ...data, riskLevel: HIGH_RISK_COUNTRIES.has(code) ? 'critical' : data.suspicious > 2 ? 'high' : 'normal',
      }))
      .sort((a, b) => b.total - a.total);
  }, [attempts]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" />
          Global Login Geography
        </CardTitle>
        <CardDescription className="text-xs">Login distribution by country with risk indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          <div className="space-y-2">
            {countryData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No geographic data available</p>
            ) : countryData.map((c, i) => (
              <motion.div
                key={c.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                  c.riskLevel === 'critical' ? 'bg-red-500/5 border-red-500/20' :
                  c.riskLevel === 'high' ? 'bg-amber-500/5 border-amber-500/20' :
                  'bg-muted/30 border-border/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg w-8">{c.code.length === 2 ? String.fromCodePoint(...[...c.code].map(ch => 127397 + ch.charCodeAt(0))) : '🌐'}</div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.total} logins · {c.failed} failed</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.suspicious > 0 && (
                    <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400">
                      {c.suspicious} suspicious
                    </Badge>
                  )}
                  {c.riskLevel === 'critical' && (
                    <Badge variant="destructive" className="text-[10px]">HIGH RISK</Badge>
                  )}
                  <div className="w-16">
                    <Progress value={Math.min(100, (c.total / Math.max(1, countryData[0]?.total)) * 100)} className="h-1.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ─── Alert Timeline ──────────────────────────────────────────────────
const AlertTimeline = ({ alerts, onResolve, onEscalate, onInvestigate }: {
  alerts: SecurityAlert[];
  onResolve: (id: string) => void;
  onEscalate: (id: string, level: string) => void;
  onInvestigate: (alert: SecurityAlert) => void;
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts;
    if (filter === 'unresolved') return alerts.filter(a => !a.is_resolved);
    return alerts.filter(a => a.severity === filter);
  }, [alerts, filter]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary animate-pulse" />
            Security Alert Timeline
          </CardTitle>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Alerts</SelectItem>
              <SelectItem value="unresolved">Unresolved</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[420px]">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShieldCheck className="h-10 w-10 mb-3 text-emerald-500/50" />
                <p className="text-sm">All clear — no alerts matching filter</p>
              </div>
            ) : filtered.map((alert, i) => {
              const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.low;
              const SevIcon = config.icon;
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={`p-3 rounded-lg border mb-2 ${config.bg} transition-all`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <SevIcon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-tight">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <Badge variant="outline" className="text-[10px]">{alert.alert_type}</Badge>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="text-[10px]">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.location_data && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              {(alert.location_data as any)?.country || 'Unknown'}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!alert.is_resolved && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => onResolve(alert.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />Resolve
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px]" onClick={() => onInvestigate(alert)}>
                            <Eye className="h-3 w-3 mr-1" />Investigate
                          </Button>
                        </>
                      )}
                      {alert.is_resolved && (
                        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400">Resolved</Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

// ─── Account Investigation Dialog ────────────────────────────────────
const InvestigationDialog = ({ alert, open, onClose }: {
  alert: SecurityAlert | null; open: boolean; onClose: () => void;
}) => {
  const [userAttempts, setUserAttempts] = useState<LoginAttempt[]>([]);
  const [note, setNote] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  useEffect(() => {
    if (!alert?.user_id) return;
    supabase.from('server_login_attempts').select('*')
      .eq('email', (alert.metadata as any)?.email || '')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setUserAttempts(data as unknown as LoginAttempt[]); });
  }, [alert]);

  const handleSaveNote = async () => {
    if (!alert || !note.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('security_incident_notes' as any).insert({
      alert_id: alert.id,
      admin_id: user.id,
      note: note.trim(),
      action_taken: actionTaken || null,
    });
    toast.success('Investigation note saved');
    setNote('');
    setActionTaken('');
  };

  const handleSuspendAccount = async () => {
    if (!alert?.user_id) return;
    await supabase.from('profiles').update({ availability_status: 'suspended' } as any).eq('id', alert.user_id);
    toast.success('Account suspended');
  };

  const handleForceLogout = async () => {
    if (!alert?.user_id) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.functions.invoke('auth-engine', {
      body: { action: 'revoke_all_sessions', target_user_id: alert.user_id, current_fingerprint: '' },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    toast.success('All sessions revoked for this user');
  };

  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Account Risk Investigation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert Summary */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                  {alert.severity.toUpperCase()}
                </Badge>
                <span className="text-sm font-medium">{alert.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{alert.description}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString()}</p>
            </CardContent>
          </Card>

          {/* Recent Login Timeline */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Recent Login History
            </h4>
            <ScrollArea className="h-[180px]">
              <div className="space-y-1.5">
                {userAttempts.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No login history found</p>
                ) : userAttempts.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded border bg-muted/20 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant={a.success ? 'default' : 'destructive'} className="text-[10px]">
                        {a.success ? '✓' : '✗'}
                      </Badge>
                      <span className="text-muted-foreground">{a.ip_address}</span>
                      <span>{a.country ? `${COUNTRY_NAMES[a.country] || a.country}` : ''} {a.city || ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(a.risk_score || 0) > 50 && (
                        <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400">Risk: {a.risk_score}</Badge>
                      )}
                      <span className="text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Quick Actions
            </h4>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="destructive" onClick={handleSuspendAccount}>
                <UserX className="h-3.5 w-3.5 mr-1.5" />Suspend Account
              </Button>
              <Button size="sm" variant="outline" onClick={handleForceLogout}>
                <Lock className="h-3.5 w-3.5 mr-1.5" />Force Logout All
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info('Re-verification requirement sent')}>
                <Fingerprint className="h-3.5 w-3.5 mr-1.5" />Require Re-Verification
              </Button>
            </div>
          </div>

          <Separator />

          {/* Investigation Notes */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> Add Investigation Note
            </h4>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Describe findings..." className="min-h-[60px] text-sm" />
            <Input value={actionTaken} onChange={e => setActionTaken(e.target.value)} placeholder="Action taken (optional)" className="mt-2 text-sm" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button onClick={handleSaveNote} disabled={!note.trim()}>
            <Send className="h-3.5 w-3.5 mr-1.5" />Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Trust Health Metrics ────────────────────────────────────────────
const TrustHealthPanel = ({ attempts, alerts }: { attempts: LoginAttempt[]; alerts: SecurityAlert[] }) => {
  const weeklyTrend = useMemo(() => {
    const days: Record<string, { failed: number; suspicious: number; total: number }> = {};
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      days[key] = { failed: 0, suspicious: 0, total: 0 };
    }
    attempts.forEach(a => {
      const key = a.created_at.slice(0, 10);
      if (days[key]) {
        days[key].total++;
        if (!a.success) days[key].failed++;
        if (a.is_suspicious) days[key].suspicious++;
      }
    });
    return Object.entries(days).map(([date, data]) => ({ date: date.slice(5), ...data }));
  }, [attempts]);

  const totalAttempts = attempts.length;
  const successRate = totalAttempts ? Math.round(attempts.filter(a => a.success).length / totalAttempts * 100) : 100;
  const suspiciousRate = totalAttempts ? Math.round(attempts.filter(a => a.is_suspicious).length / totalAttempts * 100) : 0;
  const unresolvedAlerts = alerts.filter(a => !a.is_resolved).length;

  // Trust score: composite metric
  const trustScore = Math.max(0, Math.min(100,
    100 - (suspiciousRate * 2) - (unresolvedAlerts * 3) + (successRate > 90 ? 10 : 0)
  ));

  return (
    <div className="space-y-4">
      {/* Trust Score */}
      <Card className="border-primary/20">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Platform Trust Score</p>
              <p className={`text-4xl font-bold tabular-nums ${
                trustScore >= 80 ? 'text-emerald-400' : trustScore >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>{trustScore}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {trustScore >= 80 ? 'Healthy — system operating securely' :
                 trustScore >= 60 ? 'Caution — elevated threat activity detected' :
                 'Critical — immediate security review needed'}
              </p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-muted/30 flex items-center justify-center">
              <ShieldCheck className={`h-8 w-8 ${
                trustScore >= 80 ? 'text-emerald-400' : trustScore >= 60 ? 'text-amber-400' : 'text-red-400'
              }`} />
            </div>
          </div>
          <Progress value={trustScore} className="mt-3 h-2" />
        </CardContent>
      </Card>

      {/* 30-Day Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">30-Day Security Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="failedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <RechartsTooltip
                contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} strokeWidth={1.5} />
              <Area type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" fill="url(#failedGrad)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="suspicious" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.05} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Login Success Rate</p>
            <p className="text-xl font-bold text-emerald-400">{successRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Suspicious Activity Rate</p>
            <p className="text-xl font-bold text-amber-400">{suspiciousRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unresolved Alerts</p>
            <p className="text-xl font-bold text-red-400">{unresolvedAlerts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Unique Countries</p>
            <p className="text-xl font-bold">{new Set(attempts.map(a => a.country).filter(Boolean)).size}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────
const SecurityIntelligenceDashboard: React.FC = () => {
  const { attempts, alerts, lockouts, loading, refresh, setAlerts } = useSecurityData();
  const [investigateAlert, setInvestigateAlert] = useState<SecurityAlert | null>(null);

  // KPI computations
  const now = Date.now();
  const h24 = new Date(now - 24 * 3600000).toISOString();
  const failed24h = attempts.filter(a => !a.success && a.created_at >= h24).length;
  const activeLockouts = lockouts.filter(l => l.is_active && l.unlock_at > new Date().toISOString()).length;
  const suspiciousAlerts = alerts.filter(a => !a.is_resolved).length;
  const newDeviceEvents = attempts.filter(a => a.created_at >= h24 && a.device_fingerprint).length;
  const highRiskLogins = attempts.filter(a => a.country && HIGH_RISK_COUNTRIES.has(a.country)).length;

  // Hourly chart data
  const hourlyData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const hourAttempts = attempts.filter(a => new Date(a.created_at).getHours() === hour);
      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        success: hourAttempts.filter(a => a.success).length,
        failed: hourAttempts.filter(a => !a.success).length,
      };
    });
  }, [attempts]);

  const riskDistribution = useMemo(() => [
    { name: 'Low (0-30)', value: attempts.filter(a => (a.risk_score || 0) <= 30).length, fill: 'hsl(var(--chart-1))' },
    { name: 'Medium (31-60)', value: attempts.filter(a => (a.risk_score || 0) > 30 && (a.risk_score || 0) <= 60).length, fill: 'hsl(var(--chart-3))' },
    { name: 'High (61-100)', value: attempts.filter(a => (a.risk_score || 0) > 60).length, fill: 'hsl(var(--destructive))' },
  ], [attempts]);

  // Resolve alert handler
  const handleResolve = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('security_alerts').update({
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id,
      investigation_status: 'resolved',
    } as any).eq('id', id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true, investigation_status: 'resolved' } : a));
    toast.success('Alert resolved');
  };

  const handleEscalate = async (id: string, level: string) => {
    await supabase.from('security_alerts').update({ escalation_level: level } as any).eq('id', id);
    toast.success(`Alert escalated to ${level}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-primary" />
            Security Intelligence Center
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time threat monitoring, risk analytics, and incident response
          </p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Phase 1: KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <KPICard label="Failed Logins (24h)" value={failed24h} icon={AlertTriangle} variant={failed24h > 10 ? 'danger' : 'default'} />
        <KPICard label="Active Lockouts" value={activeLockouts} icon={Lock} variant={activeLockouts > 0 ? 'warning' : 'default'} />
        <KPICard label="Unresolved Alerts" value={suspiciousAlerts} icon={ShieldAlert} variant={suspiciousAlerts > 5 ? 'danger' : 'default'} />
        <KPICard label="Device Events (24h)" value={newDeviceEvents} icon={Smartphone} />
        <KPICard label="High-Risk Logins" value={highRiskLogins} icon={Globe} variant={highRiskLogins > 0 ? 'danger' : 'success'} />
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="alerts" className="text-xs">
            <Radio className="h-3.5 w-3.5 mr-1.5" />Alert Timeline
          </TabsTrigger>
          <TabsTrigger value="geo" className="text-xs">
            <Globe className="h-3.5 w-3.5 mr-1.5" />Geo Intelligence
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">
            <BarChart3 className="h-3.5 w-3.5 mr-1.5" />Analytics
          </TabsTrigger>
          <TabsTrigger value="lockouts" className="text-xs">
            <Lock className="h-3.5 w-3.5 mr-1.5" />Lockouts
          </TabsTrigger>
          <TabsTrigger value="trust" className="text-xs">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Trust Health
          </TabsTrigger>
        </TabsList>

        {/* Phase 2: Alert Timeline */}
        <TabsContent value="alerts">
          <AlertTimeline alerts={alerts} onResolve={handleResolve} onEscalate={handleEscalate} onInvestigate={setInvestigateAlert} />
        </TabsContent>

        {/* Phase 3: Geo Intelligence */}
        <TabsContent value="geo">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GeoLoginPanel attempts={attempts} />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Login by Continent</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const c: Record<string, number> = {};
                        attempts.forEach(a => { const k = a.continent_code || 'Unknown'; c[k] = (c[k] || 0) + 1; });
                        return Object.entries(c).map(([name, value]) => ({ name, value }));
                      })()}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))'].map((c, i) => (
                        <Cell key={i} fill={c} stroke="hsl(var(--background))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Phase 3 continued: Analytics */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hourly Login Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="hour" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                    <RechartsTooltip
                      contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                    />
                    <Bar dataKey="success" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="failed" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Risk Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={riskDistribution} dataKey="value" cx="50%" cy="50%" outerRadius={90} innerRadius={45} label>
                      {riskDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} stroke="hsl(var(--background))" strokeWidth={2} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lockouts Tab */}
        <TabsContent value="lockouts">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" />
                Active & Recent Lockouts ({lockouts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {lockouts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <ShieldCheck className="h-10 w-10 mb-3 text-emerald-500/50" />
                    <p className="text-sm">No lockout incidents recorded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lockouts.map((l, i) => {
                      const isActive = l.is_active && l.unlock_at > new Date().toISOString();
                      return (
                        <motion.div
                          key={l.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={`p-3 rounded-lg border ${isActive ? 'bg-red-500/5 border-red-500/20' : 'bg-muted/20 border-border/30'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium font-mono">{l.email}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={isActive ? 'destructive' : 'secondary'} className="text-[10px]">
                                  {isActive ? 'LOCKED' : 'Expired'}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">Tier {l.lockout_tier} · {l.failed_attempts} failures</span>
                                {l.ip_address && <span className="text-[10px] text-muted-foreground">IP: {l.ip_address}</span>}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">Locked: {new Date(l.locked_at).toLocaleString()}</p>
                              <p className="text-[10px] text-muted-foreground">Unlocks: {new Date(l.unlock_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase 6: Trust Health */}
        <TabsContent value="trust">
          <TrustHealthPanel attempts={attempts} alerts={alerts} />
        </TabsContent>
      </Tabs>

      {/* Phase 4: Investigation Dialog */}
      <InvestigationDialog
        alert={investigateAlert}
        open={!!investigateAlert}
        onClose={() => setInvestigateAlert(null)}
      />
    </div>
  );
};

export default SecurityIntelligenceDashboard;
