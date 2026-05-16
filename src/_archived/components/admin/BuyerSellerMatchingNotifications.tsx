import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Users, Bell, Eye, Phone, Calendar, TrendingUp,
  ArrowRight, MessageSquare, Clock, Target
} from "lucide-react";

const matches = [
  { id: "M-01", buyer: "Sarah K.", listing: "Seminyak Villa 4BR", score: 94, urgency: "hot", budget: "4-5B", time: "2 min ago", status: "new" },
  { id: "M-02", buyer: "James L.", listing: "Canggu Modern House", score: 88, urgency: "hot", budget: "2-3B", time: "8 min ago", status: "new" },
  { id: "M-03", buyer: "Rina A.", listing: "Ubud Eco Retreat", score: 82, urgency: "warm", budget: "3-4B", time: "15 min ago", status: "contacted" },
  { id: "M-04", buyer: "David W.", listing: "Nusa Dua Waterfront", score: 76, urgency: "warm", budget: "7-10B", time: "32 min ago", status: "contacted" },
  { id: "M-05", buyer: "Maya S.", listing: "BSD Premium Apt", score: 68, urgency: "low", budget: "1-2B", time: "1 hour ago", status: "viewed" },
  { id: "M-06", buyer: "Budi R.", listing: "Sanur Beach Villa", score: 62, urgency: "low", budget: "5-8B", time: "2 hours ago", status: "viewed" },
];

const ticker = [
  "🔥 New match: Sarah K. → Seminyak Villa 4BR (94% compatibility)",
  "📞 James L. responded — viewing scheduled for tomorrow",
  "⚡ High-intent buyer detected in Canggu zone",
  "🏠 New listing matches 3 active buyer profiles",
];

const urgencyColor = (u: string) => u === "hot" ? "bg-destructive/15 text-destructive border-destructive/30" : u === "warm" ? "bg-chart-3/15 text-chart-3 border-chart-3/30" : "bg-muted text-muted-foreground border-border";

const BuyerSellerMatchingNotifications: React.FC = () => {
  const [tickIdx, setTickIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setTickIdx(p => (p + 1) % ticker.length), 3500);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Instant Buyer-Seller Matching
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time match alerts & conversion tracking</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 animate-pulse text-xs px-3 py-1">
          <Bell className="h-3 w-3 mr-1" /> LIVE
        </Badge>
      </div>

      {/* Ticker */}
      <Card className="border-primary/20 bg-primary/5 overflow-hidden">
        <CardContent className="p-3">
          <AnimatePresence mode="wait">
            <motion.div key={tickIdx} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.3 }}
              className="text-sm text-foreground">{ticker[tickIdx]}</motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Matches", value: "18", icon: Users, color: "text-primary" },
          { label: "High Probability", value: "6", icon: Target, color: "text-chart-1" },
          { label: "Avg Response", value: "12m", icon: Clock, color: "text-chart-2" },
          { label: "Match→View Rate", value: "42%", icon: TrendingUp, color: "text-chart-3" },
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

      {/* Match Feed */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" /> Live Match Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {matches.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`border-border/40 ${m.urgency === "hot" ? "bg-destructive/5 border-destructive/15" : ""}`}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${urgencyColor(m.urgency)} text-[10px]`}>
                          {m.urgency === "hot" ? "🔥" : m.urgency === "warm" ? "⚡" : "💤"} {m.urgency}
                        </Badge>
                        <span className="text-xs font-bold text-foreground">{m.buyer}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-foreground truncate">{m.listing}</span>
                      </div>
                      <div className="flex gap-3 text-[10px] text-muted-foreground">
                        <span>Budget: Rp {m.budget}</span>
                        <span>{m.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{m.score}%</div>
                        <div className="text-[9px] text-muted-foreground">match</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                          <Calendar className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerSellerMatchingNotifications;
