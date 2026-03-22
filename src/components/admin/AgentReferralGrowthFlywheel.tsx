import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Share2, Users, TrendingUp, Award, Gift,
  ArrowUpRight, BarChart3, UserPlus, Zap
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const referralMetrics = {
  invitationsSent: 245,
  newAgentsViaReferral: 38,
  conversionRate: 15.5,
  activeReferrers: 22,
  networkVelocity: 4.2,
};

const leaderboard = [
  { name: "Rina S.", referrals: 8, converted: 6, bonus: 12000000, tier: "Gold Referrer" },
  { name: "Maya K.", referrals: 6, converted: 5, bonus: 10000000, tier: "Gold Referrer" },
  { name: "Budi A.", referrals: 5, converted: 3, bonus: 6000000, tier: "Silver Referrer" },
  { name: "Sari W.", referrals: 4, converted: 3, bonus: 6000000, tier: "Silver Referrer" },
  { name: "Dedi R.", referrals: 3, converted: 2, bonus: 4000000, tier: "Bronze Referrer" },
  { name: "Eko P.", referrals: 2, converted: 1, bonus: 2000000, tier: "Bronze Referrer" },
];

const growthCurve = [
  { month: "Jan", agents: 12, referral: 2, organic: 10 },
  { month: "Feb", agents: 18, referral: 5, organic: 13 },
  { month: "Mar", agents: 26, referral: 10, organic: 16 },
  { month: "Apr", agents: 35, referral: 16, organic: 19 },
  { month: "May", agents: 48, referral: 26, organic: 22 },
  { month: "Jun", agents: 62, referral: 38, organic: 24 },
];

const bonusTiers = [
  { tier: "Bronze", threshold: 2, reward: "Rp 2M", achieved: true },
  { tier: "Silver", threshold: 5, reward: "Rp 5M + Priority Leads", achieved: true },
  { tier: "Gold", threshold: 8, reward: "Rp 10M + Premium Badge", achieved: false },
  { tier: "Platinum", threshold: 15, reward: "Rp 25M + Revenue Share", achieved: false },
];

const tierColor = (t: string) => {
  switch (t) {
    case "Gold Referrer": return "bg-chart-3/15 text-chart-3 border-chart-3/30";
    case "Silver Referrer": return "bg-muted text-muted-foreground border-border";
    default: return "bg-chart-2/15 text-chart-2 border-chart-2/30";
  }
};

const AgentReferralGrowthFlywheel: React.FC = () => {
  const referralPct = Math.round((growthCurve[growthCurve.length - 1].referral / growthCurve[growthCurve.length - 1].agents) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Share2 className="h-6 w-6 text-primary" />
          Agent Referral Growth Flywheel
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Organic network expansion through agent incentives</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Invitations Sent", value: referralMetrics.invitationsSent, icon: UserPlus, color: "text-primary" },
          { label: "Agents via Referral", value: referralMetrics.newAgentsViaReferral, icon: Users, color: "text-chart-1" },
          { label: "Conversion Rate", value: `${referralMetrics.conversionRate}%`, icon: TrendingUp, color: "text-chart-2" },
          { label: "Active Referrers", value: referralMetrics.activeReferrers, icon: Share2, color: "text-chart-3" },
          { label: "Referral Share", value: `${referralPct}%`, icon: Zap, color: "text-primary" },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <div className="text-xl font-bold text-foreground">{m.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Growth Curve */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Network Growth Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={growthCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                <Line type="monotone" dataKey="agents" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Total Agents" />
                <Line type="monotone" dataKey="referral" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} name="Via Referral" />
                <Line type="monotone" dataKey="organic" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" name="Organic" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bonus Tiers */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gift className="h-4 w-4 text-chart-3" /> Referral Bonus Tiers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bonusTiers.map((bt, i) => (
              <motion.div key={bt.tier} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border ${bt.achieved ? "border-chart-1/20 bg-chart-1/5" : "border-border/40 bg-muted/20"}`}>
                <div className="flex items-center gap-2">
                  {bt.achieved ? <Award className="h-4 w-4 text-chart-1" /> : <Award className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <span className="text-xs font-bold text-foreground">{bt.tier}</span>
                    <p className="text-[10px] text-muted-foreground">{bt.threshold}+ referrals → {bt.reward}</p>
                  </div>
                </div>
                <Badge className={bt.achieved ? "bg-chart-1/15 text-chart-1 text-[10px]" : "text-[10px]"} variant={bt.achieved ? "default" : "secondary"}>
                  {bt.achieved ? "✅ Unlocked" : "Locked"}
                </Badge>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-chart-3" /> Top Referrer Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaderboard.map((agent, i) => (
            <motion.div key={agent.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-2 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
              <div className="text-lg font-bold text-primary w-6 text-center">#{i + 1}</div>
              <span className="text-xs font-bold text-foreground w-20">{agent.name}</span>
              <Badge className={`${tierColor(agent.tier)} text-[10px]`}>{agent.tier}</Badge>
              <div className="flex-1 flex gap-3 text-[10px] text-muted-foreground">
                <span>{agent.referrals} sent</span>
                <span>{agent.converted} converted</span>
                <span className="text-chart-1">Rp {(agent.bonus / 1e6).toFixed(0)}M earned</span>
              </div>
              <Progress value={(agent.converted / agent.referrals) * 100} className="w-16 h-1.5" />
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentReferralGrowthFlywheel;
