import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Users, MessageSquare, MapPin, TrendingUp,
  Zap, BarChart3, Home, Building2, DollarSign
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const hourlyTrend = [
  { hour: "06", inquiries: 4, views: 32 }, { hour: "07", inquiries: 8, views: 65 },
  { hour: "08", inquiries: 15, views: 120 }, { hour: "09", inquiries: 22, views: 180 },
  { hour: "10", inquiries: 28, views: 210 }, { hour: "11", inquiries: 32, views: 245 },
  { hour: "12", inquiries: 25, views: 190 }, { hour: "13", inquiries: 20, views: 170 },
  { hour: "14", inquiries: 30, views: 230 }, { hour: "15", inquiries: 35, views: 260 },
  { hour: "16", inquiries: 38, views: 280 }, { hour: "17", inquiries: 30, views: 220 },
];

const districtDemand = [
  { district: "Seminyak", searches: 450, inquiries: 38, intensity: 92 },
  { district: "Canggu", searches: 380, inquiries: 32, intensity: 85 },
  { district: "Kuta", searches: 310, inquiries: 25, intensity: 72 },
  { district: "Ubud", searches: 280, inquiries: 22, intensity: 68 },
  { district: "Denpasar", searches: 240, inquiries: 18, intensity: 58 },
  { district: "Nusa Dua", searches: 200, inquiries: 15, intensity: 52 },
  { district: "Sanur", searches: 150, inquiries: 10, intensity: 38 },
  { district: "Jimbaran", searches: 120, inquiries: 8, intensity: 32 },
];

const priceRanges = [
  { range: "< 500M", demand: 15, pct: 8 },
  { range: "500M-1B", demand: 28, pct: 15 },
  { range: "1B-2B", demand: 45, pct: 24 },
  { range: "2B-5B", demand: 55, pct: 30 },
  { range: "5B-10B", demand: 30, pct: 16 },
  { range: "10B+", demand: 12, pct: 7 },
];

const propertyTypes = [
  { type: "Villa", demand: 42, icon: Home },
  { type: "House", demand: 28, icon: Building2 },
  { type: "Apartment", demand: 18, icon: Building2 },
  { type: "Land", demand: 12, icon: MapPin },
];

const surgeAlerts = [
  { district: "Seminyak", signal: "Demand spike for 2-3BR villas under Rp 3B", time: "12 min ago", intensity: "high" },
  { district: "Canggu", signal: "Buyer search volume +45% in last 2 hours", time: "28 min ago", intensity: "high" },
  { district: "Ubud", signal: "Expat inquiry surge for eco-friendly properties", time: "1 hour ago", intensity: "medium" },
];

const activityTicker = [
  "Buyer viewed Seminyak Villa 4BR — Rp 4.2B",
  "New inquiry on Canggu Modern House",
  "Buyer saved Ubud Retreat to wishlist",
  "Viewing booked for BSD Premium Apt",
  "Price alert triggered for Sanur listing",
  "New buyer registered — Budget 2-5B",
  "Inquiry on Nusa Dua waterfront villa",
  "Buyer requested virtual tour — Kuta",
];

const RealTimeBuyerDemandPulse: React.FC = () => {
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTickerIdx(p => (p + 1) % activityTicker.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Real-Time Buyer Demand Pulse
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Live marketplace demand intelligence</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 animate-pulse text-xs px-3 py-1">
          <Activity className="h-3 w-3 mr-1" /> LIVE
        </Badge>
      </div>

      {/* Activity Ticker */}
      <Card className="border-primary/20 bg-primary/5 overflow-hidden">
        <CardContent className="p-3">
          <AnimatePresence mode="wait">
            <motion.div key={tickerIdx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-sm text-foreground">
              <Zap className="h-4 w-4 text-primary flex-shrink-0" />
              {activityTicker[tickerIdx]}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Buyers Now", value: "142", icon: Users, color: "text-primary" },
          { label: "Inquiries/Hour", value: "35", icon: MessageSquare, color: "text-chart-1" },
          { label: "Top District", value: "Seminyak", icon: MapPin, color: "text-chart-2" },
          { label: "Demand Index", value: "78/100", icon: TrendingUp, color: "text-chart-3" },
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

      <Tabs defaultValue="hourly" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="hourly" className="text-xs">📈 Hourly Trend</TabsTrigger>
          <TabsTrigger value="districts" className="text-xs">🗺️ District Heat</TabsTrigger>
          <TabsTrigger value="pricing" className="text-xs">💰 Price Demand</TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs">⚡ Surge Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Hourly Demand Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={hourlyTrend}>
                  <defs>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#demandGrad)" strokeWidth={2} name="Views" />
                  <Area type="monotone" dataKey="inquiries" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1} strokeWidth={2} name="Inquiries" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="districts">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">District Demand Heatmap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {districtDemand.map((d, i) => (
                <motion.div key={d.district} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-2 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors">
                  <span className="text-xs font-bold text-foreground w-20">{d.district}</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${d.intensity}%`,
                      background: d.intensity > 80 ? "hsl(var(--chart-1))" : d.intensity > 60 ? "hsl(var(--primary))" : d.intensity > 40 ? "hsl(var(--chart-3))" : "hsl(var(--muted-foreground))"
                    }} />
                  </div>
                  <span className="text-xs font-mono text-foreground w-8">{d.intensity}</span>
                  <div className="text-[10px] text-muted-foreground w-24 text-right">{d.searches} searches • {d.inquiries} inq</div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" /> Popular Price Ranges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={priceRanges}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                    <Bar dataKey="demand" name="Demand Score" radius={[4, 4, 0, 0]}>
                      {priceRanges.map((_, idx) => (
                        <Cell key={idx} fill={idx === 3 ? "hsl(var(--chart-1))" : "hsl(var(--primary))"} fillOpacity={0.7 + idx * 0.05} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Home className="h-4 w-4 text-primary" /> Property Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {propertyTypes.map((pt) => (
                  <div key={pt.type} className="flex items-center gap-3">
                    <pt.icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground w-20">{pt.type}</span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pt.demand}%` }} />
                    </div>
                    <span className="text-xs text-foreground w-8">{pt.demand}%</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-3">
          {surgeAlerts.map((alert, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={`${alert.intensity === "high" ? "border-chart-1/20 bg-chart-1/5" : "border-chart-3/20 bg-chart-3/5"}`}>
                <CardContent className="p-4 flex items-start gap-3">
                  <Zap className={`h-5 w-5 flex-shrink-0 mt-0.5 ${alert.intensity === "high" ? "text-chart-1" : "text-chart-3"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant={alert.intensity === "high" ? "default" : "secondary"} className="text-[10px]">{alert.district}</Badge>
                      <span className="text-[10px] text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-sm text-foreground">{alert.signal}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeBuyerDemandPulse;
