import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Monitor, Database, Brain, DollarSign, Shield,
  ArrowDown, CheckCircle, Server, Cpu, Globe, Users, Building2, Activity
} from "lucide-react";

interface ArchLayer {
  label: string;
  icon: React.ElementType;
  color: string;
  modules: { name: string; status: "live" | "ready" | "planned"; health: number }[];
}

const layers: ArchLayer[] = [
  {
    label: "User Experience Layer", icon: Monitor, color: "text-primary",
    modules: [
      { name: "Buyer Discovery App", status: "live", health: 98 },
      { name: "Seller Dashboard", status: "live", health: 95 },
      { name: "Agent CRM Interface", status: "live", health: 92 },
      { name: "Investor Terminal", status: "live", health: 88 },
    ]
  },
  {
    label: "Marketplace Operations", icon: Building2, color: "text-chart-1",
    modules: [
      { name: "Listing Management", status: "live", health: 96 },
      { name: "Deal Pipeline CRM", status: "live", health: 90 },
      { name: "Viewing Scheduler", status: "live", health: 88 },
      { name: "Negotiation Engine", status: "ready", health: 82 },
    ]
  },
  {
    label: "Intelligence & Analytics", icon: Brain, color: "text-chart-2",
    modules: [
      { name: "Liquidity Scoring", status: "live", health: 94 },
      { name: "AI Pricing Engine", status: "live", health: 86 },
      { name: "Demand Signal Processing", status: "live", health: 90 },
      { name: "Predictive Valuation", status: "ready", health: 78 },
    ]
  },
  {
    label: "Monetization Layer", icon: DollarSign, color: "text-chart-3",
    modules: [
      { name: "Premium Listings", status: "live", health: 95 },
      { name: "Subscription Engine", status: "live", health: 88 },
      { name: "Commission Tracking", status: "live", health: 92 },
      { name: "Data Products", status: "planned", health: 0 },
    ]
  },
  {
    label: "Infrastructure Layer", icon: Server, color: "text-muted-foreground",
    modules: [
      { name: "PostgreSQL / Supabase", status: "live", health: 99 },
      { name: "Edge Functions API", status: "live", health: 96 },
      { name: "AI Model Registry", status: "live", health: 90 },
      { name: "Real-time Event Bus", status: "live", health: 94 },
    ]
  },
];

const statusBadge = (s: string) => s === "live" ? "bg-chart-1/15 text-chart-1 border-chart-1/30" : s === "ready" ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground border-border";
const overallHealth = Math.round(layers.flatMap(l => l.modules).filter(m => m.health > 0).reduce((s, m) => s + m.health, 0) / layers.flatMap(l => l.modules).filter(m => m.health > 0).length);
const liveCount = layers.flatMap(l => l.modules).filter(m => m.status === "live").length;
const totalCount = layers.flatMap(l => l.modules).length;

const PlatformIntegrationArchitecture: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            Platform Integration Architecture
          </h2>
          <p className="text-sm text-muted-foreground mt-1">End-to-end system connectivity & health</p>
        </div>
        <div className="flex gap-2">
          <Card className="border-primary/20 bg-primary/5 px-4 py-2">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">{overallHealth}%</div>
              <div className="text-[9px] text-muted-foreground uppercase">System Health</div>
            </div>
          </Card>
          <Card className="border-chart-1/20 bg-chart-1/5 px-4 py-2">
            <div className="text-center">
              <div className="text-xl font-bold text-chart-1">{liveCount}/{totalCount}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Modules Live</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Architecture Layers */}
      <div className="space-y-2">
        {layers.map((layer, li) => (
          <motion.div key={layer.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: li * 0.08 }}>
            <Card className={`border-border/50 cursor-pointer transition-colors hover:bg-muted/10 ${expanded === li ? "border-primary/20" : ""}`}
              onClick={() => setExpanded(expanded === li ? null : li)}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <layer.icon className={`h-5 w-5 ${layer.color}`} />
                  <span className="text-sm font-bold text-foreground flex-1">{layer.label}</span>
                  <div className="flex gap-1">
                    {layer.modules.map((m, mi) => (
                      <div key={mi} className={`w-2 h-2 rounded-full ${m.status === "live" ? "bg-chart-1" : m.status === "ready" ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <Progress value={layer.modules.filter(m => m.health > 0).reduce((s, m) => s + m.health, 0) / layer.modules.filter(m => m.health > 0).length} className="w-20 h-1.5" />
                  <span className="text-[10px] font-mono text-foreground w-8">
                    {Math.round(layer.modules.filter(m => m.health > 0).reduce((s, m) => s + m.health, 0) / Math.max(1, layer.modules.filter(m => m.health > 0).length))}%
                  </span>
                </div>

                <AnimatePresence>
                  {expanded === li && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-border/30 grid grid-cols-2 gap-2">
                        {layer.modules.map((mod, mi) => (
                          <div key={mi} className="flex items-center gap-2 p-2 rounded-lg border border-border/20 bg-muted/10">
                            <CheckCircle className={`h-3 w-3 flex-shrink-0 ${mod.status === "live" ? "text-chart-1" : mod.status === "ready" ? "text-primary" : "text-muted-foreground"}`} />
                            <span className="text-[11px] text-foreground flex-1 truncate">{mod.name}</span>
                            <Badge className={`${statusBadge(mod.status)} text-[9px]`}>{mod.status}</Badge>
                            {mod.health > 0 && <span className="text-[9px] font-mono text-muted-foreground">{mod.health}%</span>}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {li < layers.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="h-3 w-3 text-border" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Scalability Readiness */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" /> Scalability Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "Database Capacity", value: 72, target: "100K+ listings" },
            { label: "API Throughput", value: 85, target: "10K req/min" },
            { label: "AI Pipeline", value: 68, target: "Real-time scoring" },
            { label: "CDN / Edge", value: 90, target: "Global <200ms" },
            { label: "Event Processing", value: 78, target: "1M events/day" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-2 rounded-lg border border-border/30">
              <span className="text-[10px] text-foreground w-28">{s.label}</span>
              <div className="flex-1"><Progress value={s.value} className="h-1.5" /></div>
              <span className="text-xs font-mono text-foreground w-8">{s.value}%</span>
              <span className="text-[9px] text-muted-foreground w-24 text-right">{s.target}</span>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformIntegrationArchitecture;
