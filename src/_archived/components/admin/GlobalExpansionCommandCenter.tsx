import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Globe, Flag, DollarSign, Users, TrendingUp, Shield,
  Building, Handshake, ArrowRightLeft, MapPin, RefreshCw,
  CreditCard, BarChart3, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";
import { useExpansionDashboard } from "@/hooks/useGlobalExpansion";

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const fmtB = (n: number) => n >= 1e9 ? `Rp ${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `Rp ${(n / 1e6).toFixed(1)}M` : `Rp ${fmt(n)}`;

const anim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const Metric = ({ icon: Icon, label, value, sub, color = "text-primary" }: any) => (
  <motion.div variants={anim}>
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="h-4 w-4" /></div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  pilot: "bg-amber-500/20 text-amber-400",
  planned: "bg-blue-500/20 text-blue-400",
  restricted: "bg-destructive/20 text-destructive",
};

const CountryRow = ({ country }: { country: any }) => (
  <Card className="border-border/50 bg-card/80">
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{country.flag_emoji || "🏳️"}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{country.country_name}</h3>
            <p className="text-xs text-muted-foreground">{country.country_code} · {country.base_currency}</p>
          </div>
        </div>
        <Badge className={statusColors[country.regulatory_status] || "bg-muted"}>{country.regulatory_status}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-muted-foreground">Priority</span>
          <p className="font-semibold text-foreground">{country.launch_priority_score}/10</p>
        </div>
        <div>
          <span className="text-muted-foreground">Ownership</span>
          <p className="font-semibold text-foreground">{country.max_foreign_ownership_pct}%</p>
        </div>
        <div>
          <span className="text-muted-foreground">Partner Req</span>
          <p className="font-semibold text-foreground">{country.local_partner_required ? "Yes" : "No"}</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Readiness</span>
          <span className="font-semibold text-foreground">{Math.round(country.launch_priority_score * 10)}%</span>
        </div>
        <Progress value={country.launch_priority_score * 10} className="h-1.5" />
      </div>
    </CardContent>
  </Card>
);

const PartnerRow = ({ partner }: { partner: any }) => {
  const typeIcons: Record<string, any> = {
    agent_network: Users, developer: Building, legal_firm: Shield,
    inspection_service: CheckCircle2, payment_provider: CreditCard, escrow_partner: ArrowRightLeft,
  };
  const Icon = typeIcons[partner.partner_type] || Handshake;
  const statusMap: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    onboarding: "bg-amber-500/20 text-amber-400",
    pending: "bg-blue-500/20 text-blue-400",
    suspended: "bg-destructive/20 text-destructive",
  };
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">{partner.partner_name}</p>
          <p className="text-xs text-muted-foreground">{partner.country_code} · {partner.partner_type.replace(/_/g, " ")}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">★ {partner.reliability_score}</span>
        <Badge className={statusMap[partner.onboarding_status] || "bg-muted"} variant="outline">{partner.onboarding_status}</Badge>
      </div>
    </div>
  );
};

const GlobalExpansionCommandCenter: React.FC = () => {
  const { data: dashboard, isLoading, refetch } = useExpansionDashboard();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Global Expansion Command Center</h1>
            <p className="text-sm text-muted-foreground">Multi-country marketplace, FX routing, partners & compliance</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
      </div>

      {/* KPIs */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric icon={Flag} label="Total Countries" value={dashboard?.total_countries ?? "—"} />
        <Metric icon={CheckCircle2} label="Active Markets" value={dashboard?.active_countries ?? "—"} color="text-emerald-400" />
        <Metric icon={Clock} label="Pilot Markets" value={dashboard?.pilot_countries ?? "—"} color="text-amber-400" />
        <Metric icon={MapPin} label="Planned" value={dashboard?.planned_countries ?? "—"} color="text-blue-400" />
        <Metric icon={Handshake} label="Partners" value={dashboard?.total_partners ?? "—"} />
        <Metric icon={Users} label="Global Investors" value={dashboard?.global_investors ?? "—"} color="text-cyan-400" />
        <Metric icon={ArrowRightLeft} label="FX Volume" value={dashboard ? fmtB(dashboard.total_fx_volume) : "—"} />
        <Metric icon={Shield} label="XBorder Escrow" value={dashboard ? fmtB(dashboard.total_crossborder_escrow) : "—"} color="text-rose-400" />
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="countries" className="space-y-3">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="countries">Countries</TabsTrigger>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="insights">Market Intelligence</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="countries">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading countries…</div>
          ) : !dashboard?.countries?.length ? (
            <Card className="border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No countries configured yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dashboard.countries.map((c: any) => <CountryRow key={c.id} country={c} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="partners">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Handshake className="h-4 w-4 text-primary" /> Regional Partner Network
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.partners?.length ? (
                <div className="space-y-2">
                  {dashboard.partners.map((p: any) => <PartnerRow key={p.id} partner={p} />)}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No partners registered</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gateways">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Payment Gateway Routing
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.gateways?.length ? (
                <div className="space-y-2">
                  {dashboard.gateways.map((g: any) => (
                    <div key={g.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{g.region_label || g.country_code}</p>
                          <p className="text-xs text-muted-foreground">
                            {g.preferred_provider} → {g.fallback_provider || "none"} · {g.settlement_currency}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{g.settlement_latency_hours}h settle</span>
                        <Badge variant="outline" className={g.is_active ? "text-emerald-400 border-emerald-400/30" : "text-muted-foreground"}>
                          {g.is_active ? "Active" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No gateways configured</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Global Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboard?.insights?.length ? (
                <div className="space-y-2">
                  {dashboard.insights.map((i: any) => (
                    <div key={i.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div>
                        <p className="text-sm font-medium text-foreground">{i.city}{i.district ? `, ${i.district}` : ""}</p>
                        <p className="text-xs text-muted-foreground">{i.country_code} · Demand: {i.demand_index} · Yield: {i.yield_benchmark_pct}%</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Liquidity {i.liquidity_score}</span>
                        <Badge variant="outline" className={
                          i.risk_indicator === "low" ? "text-emerald-400 border-emerald-400/30" :
                          i.risk_indicator === "high" ? "text-rose-400 border-rose-400/30" :
                          "text-amber-400 border-amber-400/30"
                        }>{i.risk_indicator}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No market insights available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Global Compliance & Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Cross-Border KYC/AML", status: "Integrated", icon: Shield, desc: "Identity verification across jurisdictions" },
                  { label: "Foreign Ownership Rules", status: "Per-Country", icon: Flag, desc: "Dynamic ownership limits by country regulation" },
                  { label: "FX Compliance Logging", status: "Active", icon: ArrowRightLeft, desc: "All currency conversions recorded with audit trail" },
                  { label: "Escrow Jurisdiction", status: "Tagged", icon: CheckCircle2, desc: "Settlement jurisdiction tracking per transaction" },
                  { label: "Investor Accreditation", status: "4-Tier", icon: Users, desc: "Retail / Accredited / Qualified / Institutional" },
                  { label: "Regulatory Reporting", status: "Ready", icon: BarChart3, desc: "Export-ready compliance data per country" },
                  { label: "Suspicious Activity Detection", status: "Monitored", icon: AlertTriangle, desc: "Price manipulation & unusual FX pattern flagging" },
                ].map((c) => (
                  <div key={c.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-3">
                      <c.icon className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.label}</p>
                        <p className="text-xs text-muted-foreground">{c.desc}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">{c.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalExpansionCommandCenter;
