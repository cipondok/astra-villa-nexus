import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, BarChart3,
  ArrowUpRight, ArrowDownRight, Target, Zap, Building2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const districtPricing = [
  { district: "Seminyak", avgListing: 4.2, median: 3.8, score: 78, status: "competitive", overpriced: 3, underpriced: 2, inquiryRate: 68 },
  { district: "Canggu", avgListing: 3.5, median: 3.2, score: 82, status: "competitive", overpriced: 2, underpriced: 4, inquiryRate: 74 },
  { district: "Kuta", avgListing: 2.1, median: 2.0, score: 90, status: "strong", overpriced: 1, underpriced: 3, inquiryRate: 82 },
  { district: "Ubud", avgListing: 2.8, median: 2.3, score: 62, status: "weak", overpriced: 5, underpriced: 1, inquiryRate: 45 },
  { district: "Denpasar", avgListing: 1.8, median: 1.7, score: 88, status: "strong", overpriced: 1, underpriced: 5, inquiryRate: 78 },
  { district: "Sanur", avgListing: 3.0, median: 2.5, score: 55, status: "weak", overpriced: 4, underpriced: 0, inquiryRate: 38 },
  { district: "Nusa Dua", avgListing: 5.5, median: 5.0, score: 72, status: "moderate", overpriced: 3, underpriced: 2, inquiryRate: 58 },
  { district: "Jimbaran", avgListing: 4.0, median: 3.5, score: 65, status: "moderate", overpriced: 4, underpriced: 1, inquiryRate: 50 },
];

const overpricedAlerts = [
  { id: "L-201", property: "Sanur Beachfront Villa", listed: 4.5, market: 2.8, gap: "+60%", risk: "critical" },
  { id: "L-188", property: "Ubud Jungle Retreat", listed: 3.2, market: 2.3, gap: "+39%", risk: "high" },
  { id: "L-215", property: "Jimbaran Cliff House", listed: 5.8, market: 4.2, gap: "+38%", risk: "high" },
];

const underpricedOpps = [
  { id: "L-177", property: "Denpasar Central Apt", listed: 1.2, market: 1.8, gap: "-33%", opportunity: "high" },
  { id: "L-195", property: "Canggu Modern Studio", listed: 1.8, market: 2.5, gap: "-28%", opportunity: "medium" },
];

const inquiryCorrelation = [
  { priceVsMedian: "-10%", inquiryRate: 92 },
  { priceVsMedian: "-5%", inquiryRate: 85 },
  { priceVsMedian: "0%", inquiryRate: 72 },
  { priceVsMedian: "+5%", inquiryRate: 58 },
  { priceVsMedian: "+10%", inquiryRate: 42 },
  { priceVsMedian: "+15%", inquiryRate: 28 },
  { priceVsMedian: "+20%", inquiryRate: 18 },
];

const statusColor = (s: string) => {
  switch (s) {
    case "strong": return "bg-chart-1/15 text-chart-1 border-chart-1/30";
    case "competitive": return "bg-primary/15 text-primary border-primary/30";
    case "moderate": return "bg-chart-3/15 text-chart-3 border-chart-3/30";
    default: return "bg-destructive/15 text-destructive border-destructive/30";
  }
};

const DistrictPriceCompetitivenessMonitor: React.FC = () => {
  const avgScore = Math.round(districtPricing.reduce((s, d) => s + d.score, 0) / districtPricing.length);
  const totalOverpriced = districtPricing.reduce((s, d) => s + d.overpriced, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          District Price Competitiveness Monitor
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Keep inventory realistically priced for faster movement</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Avg Competitiveness", value: `${avgScore}/100`, icon: Target, color: "text-primary" },
          { label: "Overpriced Listings", value: totalOverpriced, icon: TrendingUp, color: "text-destructive" },
          { label: "Underpriced Opps", value: districtPricing.reduce((s, d) => s + d.underpriced, 0), icon: TrendingDown, color: "text-chart-1" },
          { label: "Avg Inquiry Rate", value: `${Math.round(districtPricing.reduce((s, d) => s + d.inquiryRate, 0) / districtPricing.length)}%`, icon: Zap, color: "text-chart-2" },
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

      <Tabs defaultValue="districts" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="districts" className="text-xs">📊 Districts</TabsTrigger>
          <TabsTrigger value="overpriced" className="text-xs">🔴 Overpriced</TabsTrigger>
          <TabsTrigger value="underpriced" className="text-xs">🟢 Underpriced</TabsTrigger>
          <TabsTrigger value="correlation" className="text-xs">📈 Inquiry Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="districts" className="space-y-2">
          {districtPricing.sort((a, b) => b.score - a.score).map((d, i) => (
            <motion.div key={d.district} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
              <span className="text-xs font-bold text-foreground w-20">{d.district}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Progress value={d.score} className="flex-1 h-2" />
                  <span className="text-xs font-mono text-foreground w-8">{d.score}</span>
                </div>
                <div className="flex gap-2 text-[10px] text-muted-foreground">
                  <span>Listed: Rp {d.avgListing}B</span>
                  <span>Median: Rp {d.median}B</span>
                  <span>Inquiry: {d.inquiryRate}%</span>
                </div>
              </div>
              <Badge className={`${statusColor(d.status)} text-[10px]`}>{d.status}</Badge>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="overpriced" className="space-y-3">
          <Card className="border-chart-3/20 bg-chart-3/5 p-3">
            <p className="text-xs text-chart-3 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Listings priced 5%+ above district median show 40% lower inquiry probability.
            </p>
          </Card>
          {overpricedAlerts.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-destructive/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">{a.risk}</Badge>
                      <span className="text-sm font-bold text-foreground">{a.id}</span>
                    </div>
                    <p className="text-xs text-foreground mt-0.5">{a.property}</p>
                    <p className="text-[10px] text-muted-foreground">Listed: Rp {a.listed}B • Market: Rp {a.market}B</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-destructive flex items-center gap-1">
                      <ArrowUpRight className="h-4 w-4" />{a.gap}
                    </div>
                    <Badge variant="outline" className="text-[10px]">Adjust Price</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="underpriced" className="space-y-3">
          {underpricedOpps.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-chart-1/20 bg-chart-1/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-[10px]">{u.opportunity} opportunity</Badge>
                      <span className="text-sm font-bold text-foreground">{u.id}</span>
                    </div>
                    <p className="text-xs text-foreground mt-0.5">{u.property}</p>
                    <p className="text-[10px] text-muted-foreground">Listed: Rp {u.listed}B • Market: Rp {u.market}B</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-chart-1 flex items-center gap-1">
                      <ArrowDownRight className="h-4 w-4" />{u.gap}
                    </div>
                    <Badge variant="outline" className="text-[10px]">Quick Sale</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="correlation">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Price vs Inquiry Rate Correlation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={inquiryCorrelation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="priceVsMedian" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                  <Bar dataKey="inquiryRate" name="Inquiry Rate %" radius={[4, 4, 0, 0]}>
                    {inquiryCorrelation.map((_, idx) => (
                      <Cell key={idx} fill={idx < 3 ? "hsl(var(--chart-1))" : idx < 5 ? "hsl(var(--chart-3))" : "hsl(var(--destructive))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DistrictPriceCompetitivenessMonitor;
