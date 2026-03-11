import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useAgentScanHistory, useRunAgentScan, AgentScanLog, AgentOpportunity,
} from '@/hooks/useAutonomousAgent2';
import { useRunDealHunterScan } from '@/hooks/useDealHunter';
import {
  Bot, Play, Loader2, Clock, Building2, TrendingDown, TrendingUp,
  DollarSign, Flame, Star, Activity, MapPin, BarChart3, Zap, History, Crosshair,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const signalConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  price_drop: { icon: TrendingDown, label: 'Harga Turun', color: 'text-chart-4', bg: 'bg-chart-4/10' },
  high_rental_yield: { icon: DollarSign, label: 'Yield Tinggi', color: 'text-chart-1', bg: 'bg-chart-1/10' },
  high_deal_score: { icon: Flame, label: 'Deal Score', color: 'text-destructive', bg: 'bg-destructive/10' },
  market_growth: { icon: TrendingUp, label: 'Pertumbuhan', color: 'text-primary', bg: 'bg-primary/10' },
  high_investment_score: { icon: Star, label: 'Skor Investasi', color: 'text-chart-2', bg: 'bg-chart-2/10' },
};

export default function AutonomousAgentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const scanHistory = useAgentScanHistory();
  const scanMutation = useRunAgentScan();
  const dealHunterScan = useRunDealHunterScan();
  const navigate = useNavigate();

  const result = scanMutation.data;
  const logs = scanHistory.data || [];
  const lastScan = logs[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            ASTRA Autonomous Property Agent
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor pasar properti otomatis & deteksi peluang investasi
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Agent Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-xs font-medium text-primary">Agent Active • Every 6h</span>
          </div>
          <Button
            onClick={() => dealHunterScan.mutate()}
            disabled={dealHunterScan.isPending}
            variant="outline"
            className="border-primary/30"
          >
            {dealHunterScan.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Hunting...</>
            ) : (
              <><Crosshair className="h-4 w-4 mr-1.5" /> Deal Hunter</>
            )}
          </Button>
          <Button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="shadow-lg shadow-primary/20"
          >
            {scanMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Scanning...</>
            ) : (
              <><Zap className="h-4 w-4 mr-1.5" /> Run Scan Now</>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats from last scan */}
      {lastScan && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard icon={Building2} label="Properties Scanned" value={`${lastScan.total_properties_scanned}`} />
          <StatCard icon={Activity} label="Alerts Created" value={`${lastScan.total_alerts_created}`} />
          <StatCard icon={BarChart3} label="Users Notified" value={`${lastScan.total_users_notified}`} />
          <StatCard icon={Clock} label="Scan Duration" value={`${(lastScan.duration_ms / 1000).toFixed(1)}s`} />
          <StatCard icon={History} label="Last Scan" value={new Date(lastScan.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} />
        </div>
      )}

      {/* Latest Scan Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Signal Summary */}
            <Card className="border-primary/20 bg-card/80 backdrop-blur mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" /> Scan Result — {result.total_opportunities} Peluang Terdeteksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                  {Object.entries(result.summary).map(([signal, count]) => {
                    const cfg = signalConfig[signal];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    return (
                      <div key={signal} className={cn('flex items-center gap-2 p-2 rounded-lg', cfg.bg)}>
                        <Icon className={cn('h-4 w-4', cfg.color)} />
                        <div>
                          <p className="text-xs text-muted-foreground">{cfg.label}</p>
                          <p className="text-lg font-bold text-foreground">{count}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Top Opportunities */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Top Opportunities</p>
                  {result.alerts.slice(0, 10).map((opp, i) => (
                    <OpportunityCard key={opp.property_id} opp={opp} rank={i + 1} onNavigate={() => navigate(`/property/${opp.property_id}`)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs: Scan History */}
      <Card className="bg-card/80 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <History className="h-4 w-4 text-primary" /> Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scanHistory.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Bot className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Belum ada riwayat scan. Klik "Run Scan Now" untuk memulai.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <ScanLogRow key={log.id} log={log} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="bg-card/80 backdrop-blur">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] text-muted-foreground">{label}</span>
        </div>
        <p className="text-sm font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function OpportunityCard({ opp, rank, onNavigate }: { opp: AgentOpportunity; rank: number; onNavigate: () => void }) {
  const scoreColor = opp.deal_score >= 70 ? 'text-destructive' : opp.deal_score >= 40 ? 'text-chart-2' : 'text-muted-foreground';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.03 }}
      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/40 hover:bg-background/80 cursor-pointer transition-all"
      onClick={onNavigate}
    >
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-primary">{rank}</span>
      </div>
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
        {opp.thumbnail_url ? (
          <img src={opp.thumbnail_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Building2 className="h-5 w-5 text-muted-foreground" /></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{opp.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{opp.city}</span>
          <span>{formatIDR(opp.price)}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {opp.signals.map(sig => {
            const cfg = signalConfig[sig];
            if (!cfg) return null;
            return (
              <Badge key={sig} variant="outline" className={cn('text-[9px] h-4 px-1.5', cfg.color, 'border-current/30')}>
                {cfg.label}
              </Badge>
            );
          })}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className={cn('text-lg font-bold', scoreColor)}>{opp.deal_score}</p>
        <p className="text-[10px] text-muted-foreground">Deal Score</p>
      </div>
    </motion.div>
  );
}

function ScanLogRow({ log }: { log: AgentScanLog }) {
  const statusColor = log.status === 'completed' ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive';
  const summary = (log.summary || {}) as Record<string, number>;

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/30 bg-background/30">
      <Badge variant="outline" className={cn('text-[10px] shrink-0', statusColor)}>
        {log.status}
      </Badge>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-foreground font-medium">{log.total_properties_scanned} properti</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-foreground">{log.total_alerts_created} alerts</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-foreground">{log.total_users_notified} users</span>
        </div>
        <div className="flex gap-2 mt-0.5">
          {Object.entries(summary).map(([sig, count]) => {
            if (!count) return null;
            const cfg = signalConfig[sig];
            return <span key={sig} className={cn('text-[10px]', cfg?.color || 'text-muted-foreground')}>{cfg?.label || sig}: {count}</span>;
          })}
        </div>
      </div>
      <div className="text-right shrink-0 text-xs text-muted-foreground">
        <p>{new Date(log.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
        <p>{new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
        <p className="text-[10px]">{(log.duration_ms / 1000).toFixed(1)}s</p>
      </div>
    </div>
  );
}
