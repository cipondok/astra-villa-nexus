import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { MapPin, Users, Building2, AlertTriangle, TrendingUp, Target, Layers } from "lucide-react";

const districts = [
  { name: "Seminyak", agents: 8, listings: 24, target: 35, deals: 12, avgDealsPerAgent: 1.5, status: "strong", color: "bg-chart-1" },
  { name: "Canggu", agents: 5, listings: 18, target: 30, deals: 7, avgDealsPerAgent: 1.4, status: "moderate", color: "bg-chart-2" },
  { name: "Ubud", agents: 3, listings: 10, target: 20, deals: 4, avgDealsPerAgent: 1.3, status: "weak", color: "bg-chart-3" },
  { name: "Kuta", agents: 6, listings: 20, target: 25, deals: 9, avgDealsPerAgent: 1.5, status: "strong", color: "bg-chart-1" },
  { name: "Sanur", agents: 2, listings: 6, target: 15, deals: 2, avgDealsPerAgent: 1.0, status: "critical", color: "bg-destructive" },
  { name: "Nusa Dua", agents: 4, listings: 14, target: 22, deals: 5, avgDealsPerAgent: 1.25, status: "moderate", color: "bg-chart-2" },
  { name: "Jimbaran", agents: 1, listings: 3, target: 12, deals: 1, avgDealsPerAgent: 1.0, status: "critical", color: "bg-destructive" },
  { name: "Denpasar", agents: 7, listings: 22, target: 28, deals: 10, avgDealsPerAgent: 1.43, status: "strong", color: "bg-chart-1" },
];

const expansionPriorities = [
  { district: "Sanur", reason: "High buyer demand, low agent coverage", agentsNeeded: 4, priority: "critical" },
  { district: "Jimbaran", reason: "Luxury segment underserved", agentsNeeded: 3, priority: "critical" },
  { district: "Ubud", reason: "Growing expat interest", agentsNeeded: 2, priority: "high" },
];

const statusBadge = (s: string) => {
  switch (s) {
    case "strong": return <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-[10px]">Strong</Badge>;
    case "moderate": return <Badge className="bg-chart-2/15 text-chart-2 border-chart-2/30 text-[10px]">Moderate</Badge>;
    case "weak": return <Badge className="bg-chart-3/15 text-chart-3 border-chart-3/30 text-[10px]">Weak</Badge>;
    case "critical": return <Badge variant="destructive" className="text-[10px]">Critical Gap</Badge>;
    default: return null;
  }
};

const AgentTerritoryCoverageMap: React.FC = () => {
  const totalAgents = districts.reduce((sum, d) => sum + d.agents, 0);
  const totalListings = districts.reduce((sum, d) => sum + d.listings, 0);
  const totalDeals = districts.reduce((sum, d) => sum + d.deals, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Agent Territory Coverage Map
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Geo-performance strength across city districts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Agents", value: totalAgents, icon: Users, color: "text-primary" },
          { label: "Active Listings", value: totalListings, icon: Building2, color: "text-chart-1" },
          { label: "Deals Closed", value: totalDeals, icon: TrendingUp, color: "text-chart-2" },
          { label: "Coverage Gaps", value: expansionPriorities.length, icon: AlertTriangle, color: "text-destructive" },
        ].map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Territory Grid — Map Placeholder */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            District Coverage Grid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {districts.map((district, i) => (
              <motion.div key={district.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className="border-border/40 hover:border-primary/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground">{district.name}</span>
                      {statusBadge(district.status)}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Agents: {district.agents}</span>
                        <span>Deals: {district.deals}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Progress value={(district.listings / district.target) * 100} className="h-1.5 flex-1" />
                        <span className="text-[10px] text-muted-foreground">{Math.round((district.listings / district.target) * 100)}%</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{district.listings}/{district.target} listings</div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${district.color}`} />
                        <span className="text-[10px] text-muted-foreground">{district.avgDealsPerAgent} deals/agent</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expansion Priority */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-chart-3" />
            Territory Expansion Priorities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {expansionPriorities.map((ep, i) => (
            <motion.div key={ep.district} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/30">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={ep.priority === "critical" ? "destructive" : "default"} className="text-[10px]">{ep.priority}</Badge>
                  <span className="text-sm font-bold text-foreground">{ep.district}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{ep.reason}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">+{ep.agentsNeeded}</div>
                <div className="text-[10px] text-muted-foreground">agents needed</div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentTerritoryCoverageMap;
