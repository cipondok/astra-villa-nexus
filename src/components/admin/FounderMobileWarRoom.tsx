import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap, TrendingUp, Home, MessageSquare, Eye, DollarSign, Crown, Coins,
  MapPin, AlertTriangle, Package, Users, Trophy, UserX, Activity,
  ChevronRight, ArrowUpRight, ArrowDownRight, Flame, Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const dealMomentum = {
  activeDeals: 24, activeDelta: +3,
  nearClosing: 7, nearDelta: +2,
  newOffers: 5, offerDelta: +1,
};

const marketplaceOxygen = {
  newListings: 18, listingDelta: +6,
  buyerInquiries: 43, inquiryDelta: +12,
  viewingsScheduled: 15, viewingDelta: -2,
};

const cashflow = {
  revenueToday: 48_500_000,
  premiumUpgrades: 6,
  commissionPipeline: 127_000_000,
};

const liquidityRadar = [
  { district: "Seminyak", score: 94, signal: "surge", label: "Demand Surge" },
  { district: "Canggu", score: 87, signal: "hot", label: "Hot Market" },
  { district: "Ubud", score: 62, signal: "slow", label: "Slow Inventory" },
  { district: "Sanur", score: 71, signal: "stable", label: "Stable" },
];

const agentForce = {
  activeOnline: 34,
  topCloser: { name: "Wayan S.", deals: 4 },
  inactiveAlert: 8,
};

const executionScore = 78;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatIDR = (n: number) => {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}K`;
  return `Rp ${n}`;
};

const DeltaBadge = ({ value }: { value: number }) => (
  <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${value >= 0 ? "text-emerald-400" : "text-red-400"}`}>
    {value >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
    {Math.abs(value)}
  </span>
);

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ─── Score Gauge ──────────────────────────────────────────────────────────────
const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 54;
  const stroke = 8;
  const circ = 2 * Math.PI * radius;
  const arc = circ * 0.75;
  const offset = arc - (arc * score) / 100;
  const color = score >= 80 ? "hsl(var(--primary))" : score >= 60 ? "hsl(45 100% 55%)" : "hsl(0 80% 60%)";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-[135deg]">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
        <motion.circle cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${arc} ${circ}`} strokeLinecap="round"
          initial={{ strokeDashoffset: arc }} animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2, ease: "easeOut" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground">{score}</span>
        <span className="text-[10px] text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  );
};

// ─── Metric Card ──────────────────────────────────────────────────────────────
const MetricCard = ({ icon: Icon, label, value, delta, accent = false }: {
  icon: React.ElementType; label: string; value: string | number; delta?: number; accent?: boolean;
}) => (
  <motion.div variants={fadeUp}>
    <Card className={`p-3 flex items-center gap-3 border-border/40 bg-card/80 backdrop-blur-sm ${accent ? "ring-1 ring-primary/20" : ""}`}>
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground font-medium truncate">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground leading-tight">{value}</span>
          {delta !== undefined && <DeltaBadge value={delta} />}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
    </Card>
  </motion.div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, badge }: { icon: React.ElementType; title: string; badge?: string }) => (
  <div className="flex items-center gap-2 mb-2 mt-5 first:mt-0">
    <Icon className="h-4 w-4 text-primary" />
    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{title}</h3>
    {badge && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{badge}</Badge>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const FounderMobileWarRoom = () => {
  const [activeTab, setActiveTab] = useState<"command" | "liquidity" | "agents">("command");

  return (
    <div className="max-w-lg mx-auto space-y-0 pb-8">
      {/* ── Sticky Summary Bar ── */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md border-b border-border/40 -mx-1 px-1 pb-2 pt-1">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-foreground">War Room</h2>
            <p className="text-[10px] text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[9px] px-1.5 h-5 border-primary/30 text-primary gap-1">
              <Activity className="h-3 w-3" /> Score {executionScore}
            </Badge>
            <Badge variant="outline" className="text-[9px] px-1.5 h-5 border-emerald-500/30 text-emerald-400 gap-1">
              <Zap className="h-3 w-3" /> {dealMomentum.activeDeals} deals
            </Badge>
          </div>
        </div>

        {/* Quick Tabs */}
        <div className="flex gap-1">
          {([
            { key: "command" as const, label: "Command", icon: Zap },
            { key: "liquidity" as const, label: "Liquidity", icon: MapPin },
            { key: "agents" as const, label: "Agents", icon: Users },
          ]).map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                activeTab === t.key ? "bg-primary/15 text-primary border border-primary/20" : "bg-muted/30 text-muted-foreground border border-transparent"
              }`}>
              <t.icon className="h-3 w-3" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "command" && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-0">

          {/* Deal Momentum */}
          <SectionHeader icon={TrendingUp} title="Deal Momentum" badge="Live" />
          <div className="space-y-2">
            <MetricCard icon={Zap} label="Active Deals Moving" value={dealMomentum.activeDeals} delta={dealMomentum.activeDelta} accent />
            <MetricCard icon={Flame} label="Deals Near Closing" value={dealMomentum.nearClosing} delta={dealMomentum.nearDelta} />
            <MetricCard icon={MessageSquare} label="New Offers Today" value={dealMomentum.newOffers} delta={dealMomentum.offerDelta} />
          </div>

          {/* Marketplace Oxygen */}
          <SectionHeader icon={Home} title="Marketplace Oxygen" />
          <div className="space-y-2">
            <MetricCard icon={Package} label="New Listings Added" value={marketplaceOxygen.newListings} delta={marketplaceOxygen.listingDelta} />
            <MetricCard icon={Eye} label="Buyer Inquiries" value={marketplaceOxygen.buyerInquiries} delta={marketplaceOxygen.inquiryDelta} accent />
            <MetricCard icon={Clock} label="Viewings Scheduled" value={marketplaceOxygen.viewingsScheduled} delta={marketplaceOxygen.viewingDelta} />
          </div>

          {/* Cashflow Signal */}
          <SectionHeader icon={DollarSign} title="Cashflow Signal" badge="Revenue" />
          <div className="space-y-2">
            <MetricCard icon={DollarSign} label="Revenue Generated Today" value={formatIDR(cashflow.revenueToday)} accent />
            <MetricCard icon={Crown} label="Premium Upgrades" value={cashflow.premiumUpgrades} />
            <MetricCard icon={Coins} label="Commission Pipeline" value={formatIDR(cashflow.commissionPipeline)} />
          </div>

          {/* Founder Execution Score */}
          <SectionHeader icon={Activity} title="Execution Score" />
          <motion.div variants={fadeUp}>
            <Card className="p-4 border-border/40 bg-card/80 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <ScoreGauge score={executionScore} />
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">Daily Traction</p>
                    <Progress value={82} className="h-1.5 mt-1" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">Revenue Velocity</p>
                    <Progress value={65} className="h-1.5 mt-1" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium">Agent Activation</p>
                    <Progress value={71} className="h-1.5 mt-1" />
                  </div>
                  <p className="text-[9px] text-primary font-medium">↑ 12% vs yesterday</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {activeTab === "liquidity" && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-0">
          <SectionHeader icon={MapPin} title="Liquidity Radar" badge="Intel" />
          <div className="space-y-2">
            {liquidityRadar.map((d) => (
              <motion.div key={d.district} variants={fadeUp}>
                <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{d.district}</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${
                      d.signal === "surge" ? "border-emerald-500/40 text-emerald-400" :
                      d.signal === "hot" ? "border-amber-500/40 text-amber-400" :
                      d.signal === "slow" ? "border-red-500/40 text-red-400" :
                      "border-border/60 text-muted-foreground"
                    }`}>
                      {d.signal === "surge" && <Flame className="h-2.5 w-2.5 mr-0.5" />}
                      {d.signal === "slow" && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                      {d.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={d.score} className="h-1.5 flex-1" />
                    <span className="text-xs font-bold text-foreground w-8 text-right">{d.score}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Hot District Highlight */}
          <motion.div variants={fadeUp} className="mt-4">
            <Card className="p-3 border-primary/20 bg-primary/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary">Hottest District Now</span>
              </div>
              <p className="text-lg font-bold text-foreground">Seminyak</p>
              <p className="text-[10px] text-muted-foreground">+34% inquiry velocity • 6 deals closing this week</p>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {activeTab === "agents" && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-0">
          <SectionHeader icon={Users} title="Agent Force Status" badge="Team" />
          <div className="space-y-2">
            <MetricCard icon={Users} label="Active Agents Online" value={agentForce.activeOnline} accent />

            <motion.div variants={fadeUp}>
              <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground font-medium">Top Closer Today</p>
                    <p className="text-sm font-bold text-foreground">{agentForce.topCloser.name}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-5">{agentForce.topCloser.deals} deals</Badge>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card className="p-3 border-red-500/20 bg-red-500/5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-red-500/15 flex items-center justify-center">
                    <UserX className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground font-medium">Inactive Alert</p>
                    <p className="text-sm font-bold text-foreground">{agentForce.inactiveAlert} agents</p>
                  </div>
                  <Badge variant="outline" className="text-[9px] h-5 border-red-500/30 text-red-400">Action needed</Badge>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Agent Activity Summary */}
          <SectionHeader icon={Activity} title="Agent Performance" />
          <motion.div variants={fadeUp}>
            <Card className="p-3 border-border/40 bg-card/80 backdrop-blur-sm space-y-2">
              {[
                { label: "Viewings Completed", value: 28, max: 40 },
                { label: "Inquiries Handled", value: 67, max: 100 },
                { label: "Listings Activated", value: 12, max: 20 },
                { label: "Deals Progressed", value: 9, max: 15 },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-muted-foreground font-medium">{m.label}</span>
                    <span className="text-foreground font-semibold">{m.value}/{m.max}</span>
                  </div>
                  <Progress value={(m.value / m.max) * 100} className="h-1.5" />
                </div>
              ))}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FounderMobileWarRoom;
