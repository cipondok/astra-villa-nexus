import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AdminPageHeader } from "./shared/AdminPageHeader";
import { Crosshair, Loader2, Clock, Flame, Eye, TrendingUp, Zap, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import { useAgentScanHistory } from "@/hooks/useAutonomousAgent2";
import { useDealHunterFeed, useRunDealHunterScan, DEAL_CLASSIFICATIONS, DEAL_TIERS, type DealHunterOpportunity } from "@/hooks/useDealHunter";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const DealHunterAdminPanel = () => {
  const { data: scanHistory = [], isLoading: historyLoading } = useAgentScanHistory();
  const { data: opportunities = [], isLoading: oppsLoading } = useDealHunterFeed(100);
  const scanMutation = useRunDealHunterScan();
  const [scanProgress, setScanProgress] = useState(0);

  // Simulate progress while scanning
  React.useEffect(() => {
    if (!scanMutation.isPending) { setScanProgress(0); return; }
    setScanProgress(5);
    const iv = setInterval(() => setScanProgress(p => Math.min(p + Math.random() * 8, 92)), 600);
    return () => clearInterval(iv);
  }, [scanMutation.isPending]);

  React.useEffect(() => {
    if (scanMutation.isSuccess) setScanProgress(100);
  }, [scanMutation.isSuccess]);

  // Breakdowns
  const classificationBreakdown = Object.entries(DEAL_CLASSIFICATIONS).map(([key, meta]) => ({
    key,
    ...meta,
    count: opportunities.filter(o => o.deal_classification === key).length,
  }));

  const tierBreakdown = Object.entries(DEAL_TIERS).map(([key, meta]) => ({
    key,
    ...meta,
    count: opportunities.filter(o => o.deal_tier === key).length,
  }));

  const avgScore = opportunities.length
    ? Math.round(opportunities.reduce((s, o) => s + o.deal_opportunity_signal_score, 0) / opportunities.length)
    : 0;

  const avgUrgency = opportunities.length
    ? Math.round(opportunities.reduce((s, o) => s + o.urgency_score, 0) / opportunities.length)
    : 0;

  const dealHunterScans = scanHistory.filter(s => s.scan_type === 'deal_hunter' || s.scan_type === 'manual');

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Deal Hunter Engine"
        description="AI-powered deal detection, classification, and investor alert routing"
        icon={Crosshair}
        badge={{ text: `${opportunities.length} Active`, variant: "default" }}
        actions={
          <Button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="gap-2"
          >
            {scanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />}
            {scanMutation.isPending ? "Scanning…" : "Run Deal Hunter Scan"}
          </Button>
        }
      />

      {/* Scan progress */}
      <AnimatePresence>
        {(scanMutation.isPending || scanProgress === 100) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    {scanProgress < 100 ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {scanProgress < 100 ? "Scanning properties for deals…" : "Scan complete!"}
                  </span>
                  <span className="text-muted-foreground">{Math.round(scanProgress)}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
                {scanMutation.isSuccess && scanMutation.data && (
                  <p className="text-xs text-muted-foreground">
                    Found {scanMutation.data.opportunities_found ?? 0} opportunities, sent {scanMutation.data.alerts_created ?? 0} alerts
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Flame} label="Active Deals" value={opportunities.length} color="text-red-500" />
        <StatCard icon={TrendingUp} label="Avg Signal Score" value={avgScore} suffix="/100" color="text-primary" />
        <StatCard icon={Zap} label="Avg Urgency" value={avgUrgency} suffix="/100" color="text-amber-500" />
        <StatCard icon={Clock} label="Total Scans" value={dealHunterScans.length} color="text-muted-foreground" />
      </div>

      {/* Classification & Tier breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> By Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classificationBreakdown.map(c => (
              <div key={c.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{c.icon}</span>
                  <Badge variant="outline" className={c.color}>{c.label}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${opportunities.length ? (c.count / opportunities.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{c.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> By Tier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tierBreakdown.map(t => (
              <div key={t.key} className="flex items-center justify-between">
                <Badge variant="outline" className={t.color}>{t.label}</Badge>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${opportunities.length ? (t.count / opportunities.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{t.count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Scan History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Recent Scan History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : dealHunterScans.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">No scans yet. Run your first scan above.</div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {dealHunterScans.slice(0, 10).map(scan => (
                <div key={scan.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    <Badge variant={scan.status === 'completed' ? 'default' : scan.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {scan.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{format(new Date(scan.created_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{scan.total_properties_scanned} scanned</span>
                    <span>{scan.total_alerts_created} alerts</span>
                    <span>{scan.duration_ms}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Opportunities */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Flame className="h-4 w-4 text-red-500" /> Top Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {oppsLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : opportunities.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4 text-center">No opportunities detected yet.</div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {opportunities.slice(0, 15).map(opp => {
                const cls = DEAL_CLASSIFICATIONS[opp.deal_classification];
                const tier = DEAL_TIERS[opp.deal_tier];
                return (
                  <div key={opp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{cls?.icon}</span>
                        <span className="text-sm font-medium truncate">{opp.property?.title || opp.property_id}</span>
                        <Badge variant="outline" className={`text-[10px] ${cls?.color}`}>{cls?.label}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${tier?.color}`}>{tier?.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{opp.property?.city}</span>
                        <span>Score: {opp.deal_opportunity_signal_score}</span>
                        <span>Urgency: {opp.urgency_score}</span>
                        {opp.undervaluation_percent > 0 && <span className="text-emerald-500">-{opp.undervaluation_percent.toFixed(1)}% undervalued</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <div className="text-sm font-semibold">Rp {(opp.property?.price ?? 0).toLocaleString('id-ID')}</div>
                      {opp.estimated_fair_value > 0 && (
                        <div className="text-[10px] text-muted-foreground">FMV: Rp {opp.estimated_fair_value.toLocaleString('id-ID')}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, suffix, color }: { icon: any; label: string; value: number; suffix?: string; color: string }) => (
  <Card>
    <CardContent className="pt-4 pb-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}{suffix && <span className="text-sm text-muted-foreground ml-0.5">{suffix}</span>}</div>
    </CardContent>
  </Card>
);

export default DealHunterAdminPanel;
