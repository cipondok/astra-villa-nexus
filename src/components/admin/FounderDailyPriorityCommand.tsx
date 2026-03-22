import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Target, AlertTriangle, Users, DollarSign, Clock,
  ArrowRight, CheckCircle, Phone, Eye, MessageSquare,
  Zap, TrendingUp, Building2, UserCheck
} from "lucide-react";

const mockDeals = [
  { id: "D-401", property: "Seminyak Villa 4BR", buyer: "James L.", value: 4200000000, closingProb: 88, urgency: "critical", action: "Price gap mediation needed", daysStalled: 2 },
  { id: "D-387", property: "Canggu Modern House", buyer: "Sarah K.", value: 2800000000, closingProb: 75, urgency: "high", action: "Financing confirmation pending", daysStalled: 4 },
  { id: "D-412", property: "BSD Apartment 2BR", buyer: "Michael R.", value: 1500000000, closingProb: 72, urgency: "high", action: "Seller needs final push", daysStalled: 1 },
  { id: "D-395", property: "Jakarta Penthouse", buyer: "Diana W.", value: 8500000000, closingProb: 65, urgency: "medium", action: "Legal docs review", daysStalled: 6 },
  { id: "D-420", property: "Ubud Retreat Villa", buyer: "Tom H.", value: 3200000000, closingProb: 60, urgency: "medium", action: "Schedule final viewing", daysStalled: 3 },
];

const supplyGaps = [
  { district: "North Seminyak", current: 4, target: 12, gap: 8, priority: "critical" },
  { district: "East Canggu", current: 6, target: 15, gap: 9, priority: "high" },
  { district: "Central BSD", current: 10, target: 18, gap: 8, priority: "medium" },
];

const highIntentBuyers = [
  { name: "Alex M.", budget: "3-5B IDR", lastActive: "12 min ago", viewings: 3, intent: 92 },
  { name: "Linda S.", budget: "1-2B IDR", lastActive: "25 min ago", viewings: 5, intent: 88 },
  { name: "Robert P.", budget: "5-10B IDR", lastActive: "1 hour ago", viewings: 2, intent: 85 },
];

const expiringOpportunities = [
  { type: "Premium Listing", property: "Sanur Beachfront", expiresIn: "2 days", revenue: 5000000 },
  { type: "Exclusive Deal", property: "Nusa Dua Villa", expiresIn: "4 days", revenue: 12000000 },
];

const agentTasks = [
  { agent: "Agent Rina", task: "Complete onboarding docs", status: "pending", district: "Seminyak" },
  { agent: "Agent Budi", task: "First listing submission", status: "overdue", district: "Canggu" },
  { agent: "Agent Maya", task: "Respond to 3 buyer inquiries", status: "pending", district: "BSD" },
];

const urgencyColor = (u: string) => u === "critical" ? "destructive" : u === "high" ? "default" : "secondary";

const FounderDailyPriorityCommand: React.FC = () => {
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const tractionScore = 74;

  const toggleResolved = (id: string) => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Daily Founder Priority Command
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Focus on what moves the needle today</p>
        </div>
        <Card className="border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{tractionScore}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Traction Score</div>
            </div>
            <Progress value={tractionScore} className="w-24 h-2" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="deals" className="text-xs">🔥 Top Deals</TabsTrigger>
          <TabsTrigger value="supply" className="text-xs">📦 Supply Gaps</TabsTrigger>
          <TabsTrigger value="buyers" className="text-xs">🎯 High-Intent</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs">💰 Expiring</TabsTrigger>
          <TabsTrigger value="agents" className="text-xs">👥 Agent Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-3">
          {mockDeals.map((deal, i) => (
            <motion.div key={deal.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className={`border-border/50 ${resolvedIds.has(deal.id) ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={urgencyColor(deal.urgency)} className="text-[10px]">{deal.urgency.toUpperCase()}</Badge>
                        <span className="text-sm font-bold text-foreground">{deal.id}</span>
                        <span className="text-xs text-muted-foreground">• Stalled {deal.daysStalled}d</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">{deal.property}</p>
                      <p className="text-xs text-muted-foreground">Buyer: {deal.buyer} • Rp {(deal.value / 1e9).toFixed(1)}B</p>
                      <div className="flex items-center gap-2 mt-2">
                        <AlertTriangle className="h-3 w-3 text-chart-3" />
                        <span className="text-xs text-chart-3">{deal.action}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{deal.closingProb}%</div>
                        <div className="text-[10px] text-muted-foreground">Close Prob</div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => toggleResolved(deal.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />{resolvedIds.has(deal.id) ? 'Undo' : 'Resolve'}
                        </Button>
                        <Button size="sm" className="h-7 text-[10px] px-2">
                          <ArrowRight className="h-3 w-3 mr-1" />Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="supply" className="space-y-3">
          {supplyGaps.map((gap, i) => (
            <motion.div key={gap.district} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={gap.priority === "critical" ? "destructive" : "secondary"} className="text-[10px]">{gap.priority}</Badge>
                        <span className="text-sm font-bold text-foreground">{gap.district}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{gap.current} / {gap.target} listings • Need {gap.gap} more</p>
                      <Progress value={(gap.current / gap.target) * 100} className="w-48 h-1.5 mt-2" />
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Phone className="h-3 w-3 mr-1" />Assign Agent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="buyers" className="space-y-3">
          {highIntentBuyers.map((buyer, i) => (
            <motion.div key={buyer.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-chart-1" />
                        <span className="text-sm font-bold text-foreground">{buyer.name}</span>
                        <Badge variant="secondary" className="text-[10px]">Intent: {buyer.intent}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Budget: {buyer.budget} • {buyer.viewings} viewings • Active {buyer.lastActive}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-[10px]"><Eye className="h-3 w-3 mr-1" />Schedule Viewing</Button>
                      <Button size="sm" className="h-7 text-[10px]"><MessageSquare className="h-3 w-3 mr-1" />Message</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-3">
          {expiringOpportunities.map((opp, i) => (
            <motion.div key={opp.property} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-chart-3/20 bg-chart-3/5">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-chart-3" />
                      <span className="text-sm font-bold text-foreground">{opp.property}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{opp.type} • Expires in {opp.expiresIn} • Rp {(opp.revenue / 1e6).toFixed(0)}M potential</p>
                  </div>
                  <Button size="sm" className="text-xs"><Zap className="h-3 w-3 mr-1" />Act Now</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="agents" className="space-y-3">
          {agentTasks.map((task, i) => (
            <motion.div key={task.agent} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">{task.agent}</span>
                      <Badge variant={task.status === "overdue" ? "destructive" : "secondary"} className="text-[10px]">{task.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{task.task} • {task.district}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs"><Phone className="h-3 w-3 mr-1" />Follow Up</Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FounderDailyPriorityCommand;
