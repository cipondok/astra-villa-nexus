import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, DollarSign, Globe, Building2, FileText,
  AlertTriangle, CheckCircle, RefreshCw, Landmark
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCustodyDashboard, useRunReconciliation } from '@/hooks/useCustodySettlement';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const statusColor: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  restricted: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  suspended: 'bg-destructive/10 text-destructive border-destructive/30',
};

const CustodySettlementCommandCenter = () => {
  const { data: dashboard, isLoading } = useCustodyDashboard();
  const reconcile = useRunReconciliation();

  const d = dashboard || {
    total_assets_under_custody: 0, active_accounts: 0, discrepancy_alerts: 0,
    jurisdictions: [], accounts: [], recent_ledger: [], reconciliation: [],
    routing_profiles: [], spv_entities: [], regulatory_reports: [],
  };

  const jurisdictionData = (d.jurisdictions || []).map((j: string) => ({
    name: j,
    accounts: (d.accounts || []).filter((a: any) => a.jurisdiction_code === j).length,
  }));

  const entityTypeData = ['investor', 'fund', 'platform_spv', 'institutional_partner'].map(t => ({
    name: t.replace('_', ' '),
    count: (d.accounts || []).filter((a: any) => a.entity_type === t).length,
  })).filter(x => x.count > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Assets Under Custody', value: `$${((d.total_assets_under_custody || 0) / 1e6).toFixed(2)}M`, icon: Shield, color: 'text-primary' },
          { label: 'Active Accounts', value: d.active_accounts || 0, icon: Building2, color: 'text-emerald-400' },
          { label: 'Jurisdictions', value: (d.jurisdictions || []).length, icon: Globe, color: 'text-blue-400' },
          { label: 'Discrepancy Alerts', value: d.discrepancy_alerts || 0, icon: AlertTriangle, color: d.discrepancy_alerts > 0 ? 'text-destructive' : 'text-emerald-400' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  </div>
                  <kpi.icon className={`h-8 w-8 ${kpi.color} opacity-40`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="bg-muted/50 border border-border/50 mb-4">
          <TabsTrigger value="accounts">Custody Accounts</TabsTrigger>
          <TabsTrigger value="ledger">Asset Ledger</TabsTrigger>
          <TabsTrigger value="settlement">Settlement Routing</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="spv">SPV Entities</TabsTrigger>
          <TabsTrigger value="regulatory">Regulatory</TabsTrigger>
        </TabsList>

        {/* ACCOUNTS */}
        <TabsContent value="accounts">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-border/50 lg:col-span-2">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Custody Accounts</CardTitle></CardHeader>
              <CardContent>
                {(d.accounts || []).length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">No custody accounts created yet</p>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {(d.accounts || []).map((a: any) => (
                      <div key={a.id} className="flex justify-between items-center p-3 rounded border border-border/30 bg-muted/10">
                        <div>
                          <p className="text-sm font-medium text-foreground capitalize">{a.entity_type?.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">{a.custody_provider_code} · {a.jurisdiction_code} · {a.base_currency}</p>
                        </div>
                        <Badge className={statusColor[a.custody_status] || 'bg-muted'}>{a.custody_status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm">Entity Distribution</CardTitle></CardHeader>
              <CardContent>
                {entityTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={entityTypeData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                        {entityTypeData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-sm text-center py-6">No data</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LEDGER */}
        <TabsContent value="ledger">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Segregated Asset Ledger</CardTitle></CardHeader>
            <CardContent>
              {(d.recent_ledger || []).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No ledger entries</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border/30 text-muted-foreground text-xs">
                      <th className="text-left py-2">Date</th><th className="text-left py-2">Asset</th>
                      <th className="text-right py-2">Debit</th><th className="text-right py-2">Credit</th>
                      <th className="text-right py-2">Balance</th><th className="text-left py-2">Reason</th>
                    </tr></thead>
                    <tbody>
                      {(d.recent_ledger || []).map((e: any) => (
                        <tr key={e.id} className="border-b border-border/20">
                          <td className="py-2 text-muted-foreground text-xs">{new Date(e.created_at).toLocaleDateString()}</td>
                          <td className="py-2 text-foreground">{e.asset_type}</td>
                          <td className="py-2 text-right text-destructive">{e.debit_amount > 0 ? `$${e.debit_amount.toLocaleString()}` : '—'}</td>
                          <td className="py-2 text-right text-emerald-400">{e.credit_amount > 0 ? `$${e.credit_amount.toLocaleString()}` : '—'}</td>
                          <td className="py-2 text-right text-foreground font-medium">${(e.balance_snapshot || 0).toLocaleString()}</td>
                          <td className="py-2 text-muted-foreground text-xs">{e.entry_reason || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTLEMENT */}
        <TabsContent value="settlement">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Settlement Routing</CardTitle></CardHeader>
            <CardContent>
              {(d.routing_profiles || []).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No settlement routes configured</p>
              ) : (
                <div className="space-y-2">
                  {(d.routing_profiles || []).map((r: any) => (
                    <div key={r.id} className="flex justify-between items-center p-3 rounded border border-border/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.settlement_partner_code || 'Internal'}</p>
                        <p className="text-xs text-muted-foreground">SWIFT: {r.swift_bic || 'N/A'} · {r.settlement_currency} · {r.settlement_mode}</p>
                      </div>
                      <Badge variant="outline" className={r.active_flag ? 'text-emerald-400' : 'text-muted-foreground'}>
                        {r.active_flag ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RECONCILIATION */}
        <TabsContent value="reconciliation">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> Reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              {(d.reconciliation || []).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No reconciliation records. Run reconciliation on custody accounts.</p>
              ) : (
                <div className="space-y-2">
                  {(d.reconciliation || []).map((r: any) => (
                    <div key={r.id} className={`flex justify-between items-center p-3 rounded border ${r.discrepancy_flag ? 'border-destructive/50 bg-destructive/5' : 'border-border/30'}`}>
                      <div>
                        <p className="text-sm text-foreground">Account: {(r.custody_account_id || '').slice(0, 8)}…</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.reconciliation_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Expected: ${(r.expected_balance || 0).toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Actual: ${(r.actual_balance || 0).toLocaleString()}</p>
                        </div>
                        {r.discrepancy_flag ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/30">Discrepancy</Badge>
                        ) : (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Matched</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SPV */}
        <TabsContent value="spv">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> SPV Entities</CardTitle></CardHeader>
            <CardContent>
              {(d.spv_entities || []).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No SPV entities created</p>
              ) : (
                <div className="space-y-2">
                  {(d.spv_entities || []).map((s: any) => (
                    <div key={s.id} className="p-3 rounded border border-border/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.legal_structure_type} — {s.jurisdiction_code}</p>
                          <p className="text-xs text-muted-foreground">Trustee: {s.trustee_entity || 'Not assigned'}</p>
                        </div>
                        <Badge variant="outline">Property {(s.property_id || '').slice(0, 8)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGULATORY */}
        <TabsContent value="regulatory">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Regulatory Reports</CardTitle></CardHeader>
            <CardContent>
              {(d.regulatory_reports || []).length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No regulatory reports generated</p>
              ) : (
                <div className="space-y-2">
                  {(d.regulatory_reports || []).map((r: any) => (
                    <div key={r.id} className="flex justify-between items-center p-3 rounded border border-border/30">
                      <div>
                        <p className="text-sm font-medium text-foreground uppercase">{r.report_type?.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{r.jurisdiction_code} · {new Date(r.generated_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="outline">{r.report_type}</Badge>
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

export default CustodySettlementCommandCenter;
