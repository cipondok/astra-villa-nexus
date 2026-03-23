import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  PieChart, Users, DollarSign, TrendingUp, Building, Target,
  Shield, BarChart3, Layers, Clock, CheckCircle2, AlertTriangle,
  RefreshCw, ArrowUpRight,
} from "lucide-react";
import { useFractionalDashboard, useFractionalOffers } from "@/hooks/useFractionalInvestment";

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const fmtIDR = (n: number) => `Rp ${fmt(n)}`;

const anim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const MetricCard = ({ icon: Icon, label, value, sub, color = "text-primary" }: any) => (
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

const OfferCard = ({ offer }: { offer: any }) => {
  const pct = offer.total_shares_available > 0
    ? Math.round((offer.shares_allocated / offer.total_shares_available) * 100)
    : 0;
  const escrow = offer.pooled_escrow_records?.[0];
  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    fully_funded: "bg-blue-500/20 text-blue-400",
    draft: "bg-muted text-muted-foreground",
    closed: "bg-red-500/20 text-red-400",
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
              {offer.property_id?.slice(0, 8)}…
            </span>
          </div>
          <Badge className={statusColors[offer.offer_status] || "bg-muted"}>
            {offer.offer_status?.replace("_", " ")}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-muted-foreground">Total Value</span><br /><span className="font-semibold text-foreground">{fmtIDR(offer.total_property_value_idr)}</span></div>
          <div><span className="text-muted-foreground">Per Share</span><br /><span className="font-semibold text-foreground">{fmtIDR(offer.price_per_share_idr || 0)}</span></div>
          <div><span className="text-muted-foreground">Min Ticket</span><br /><span className="font-semibold text-foreground">{fmtIDR(offer.minimum_investment_ticket_idr)}</span></div>
          <div><span className="text-muted-foreground">Yield</span><br /><span className="font-semibold text-emerald-400">{offer.expected_annual_yield_pct}%</span></div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{offer.shares_allocated}/{offer.total_shares_available} shares</span>
            <span className="font-semibold text-foreground">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        {escrow && (
          <div className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50">
            <span className="text-muted-foreground">Escrow Pool</span>
            <span className="font-semibold text-foreground">{fmtIDR(escrow.total_amount_committed_idr)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const FractionalInvestmentCommandCenter: React.FC = () => {
  const { data: dashboard, isLoading: dashLoading, refetch } = useFractionalDashboard();
  const { data: offers, isLoading: offersLoading } = useFractionalOffers();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Fractional Investment Command Center</h1>
            <p className="text-sm text-muted-foreground">Syndication & pooled capital management</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
      </div>

      {/* KPI Grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Layers} label="Total Offers" value={dashboard?.total_offers ?? "—"} />
        <MetricCard icon={Target} label="Active Offers" value={dashboard?.active_offers ?? "—"} color="text-emerald-400" />
        <MetricCard icon={CheckCircle2} label="Fully Funded" value={dashboard?.fully_funded ?? "—"} color="text-blue-400" />
        <MetricCard icon={Users} label="Unique Investors" value={dashboard?.unique_investors ?? "—"} color="text-amber-400" />
        <MetricCard icon={DollarSign} label="Capital Committed" value={dashboard ? fmtIDR(dashboard.total_capital_committed_idr) : "—"} />
        <MetricCard icon={BarChart3} label="Total Positions" value={dashboard?.total_positions ?? "—"} />
        <MetricCard icon={Shield} label="Escrow Pools" value={dashboard?.escrow_pools ?? "—"} color="text-cyan-400" />
        <MetricCard icon={TrendingUp} label="Avg Funding %" value={dashboard ? `${dashboard.avg_funding_completion}%` : "—"} color="text-emerald-400" />
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="offers" className="space-y-3">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="offers">Active Offers</TabsTrigger>
          <TabsTrigger value="syndication">Syndication</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="offers">
          {offersLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading offers…</div>
          ) : !offers?.length ? (
            <Card className="border-border/50">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active fractional offers yet</p>
                <p className="text-xs mt-1">Create your first offer to start pooling capital</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {offers.map((o: any) => <OfferCard key={o.id} offer={o} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="syndication">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Syndication Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Lead Investors", icon: Target, desc: "Designated deal organizers with governance authority" },
                  { label: "Sponsors", icon: DollarSign, desc: "Fee-earning capital allocators with performance tracking" },
                  { label: "Co-Leads", icon: Users, desc: "Supporting organizers with shared management rights" },
                  { label: "Advisors", icon: Shield, desc: "Strategic guidance without direct capital commitment" },
                ].map((r) => (
                  <Card key={r.label} className="border-border/30 bg-muted/30">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <r.icon className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{r.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Compliance & Risk Safety
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Investor Verification", status: "Active", icon: CheckCircle2, desc: "KYC tier check before share allocation" },
                  { label: "Concentration Limits", status: "Enforced", icon: AlertTriangle, desc: "Max 25% ownership per single investor" },
                  { label: "Pooled Funding Transparency", status: "Real-time", icon: BarChart3, desc: "Live escrow tracking and audit trail" },
                  { label: "Regulatory Reporting", status: "Ready", icon: Shield, desc: "Structured data export for compliance" },
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

export default FractionalInvestmentCommandCenter;
