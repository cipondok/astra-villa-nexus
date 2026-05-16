import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  GraduationCap, Users, TrendingUp, Clock, Star, MessageSquare,
  BookOpen, Award, Target, BarChart3, CheckCircle, Calendar
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const agents = [
  { name: "Rina S.", responseTime: 8, viewingConv: 32, listingQuality: 85, negotiation: 78, satisfaction: 4.6, tier: "Gold", trainingsCompleted: 6 },
  { name: "Budi A.", responseTime: 12, viewingConv: 28, listingQuality: 72, negotiation: 65, satisfaction: 4.2, tier: "Silver", trainingsCompleted: 4 },
  { name: "Maya K.", responseTime: 5, viewingConv: 38, listingQuality: 90, negotiation: 85, satisfaction: 4.8, tier: "Elite", trainingsCompleted: 8 },
  { name: "Dedi R.", responseTime: 18, viewingConv: 22, listingQuality: 60, negotiation: 55, satisfaction: 3.8, tier: "Bronze", trainingsCompleted: 2 },
  { name: "Sari W.", responseTime: 10, viewingConv: 30, listingQuality: 78, negotiation: 70, satisfaction: 4.4, tier: "Gold", trainingsCompleted: 5 },
  { name: "Eko P.", responseTime: 22, viewingConv: 18, listingQuality: 55, negotiation: 45, satisfaction: 3.5, tier: "Bronze", trainingsCompleted: 1 },
];

const trainingModules = [
  { name: "Negotiation Mastery", category: "Sales", completionRate: 65, impact: "+18% close rate", enrolled: 12, status: "active" },
  { name: "Listing Photography", category: "Quality", completionRate: 80, impact: "+25% inquiry rate", enrolled: 8, status: "active" },
  { name: "Price Positioning", category: "Market", completionRate: 45, impact: "+12% faster sales", enrolled: 15, status: "active" },
  { name: "Client Communication", category: "Service", completionRate: 70, impact: "+30% satisfaction", enrolled: 10, status: "active" },
  { name: "Digital Marketing", category: "Growth", completionRate: 30, impact: "+40% lead gen", enrolled: 6, status: "new" },
];

const growthTrend = [
  { month: "Jan", avgScore: 58, responseTime: 18, closeRate: 20 },
  { month: "Feb", avgScore: 62, responseTime: 16, closeRate: 22 },
  { month: "Mar", avgScore: 65, responseTime: 14, closeRate: 25 },
  { month: "Apr", avgScore: 70, responseTime: 12, closeRate: 28 },
  { month: "May", avgScore: 74, responseTime: 10, closeRate: 30 },
  { month: "Jun", avgScore: 78, responseTime: 9, closeRate: 33 },
];

const tierColor = (t: string) => {
  switch (t) {
    case "Elite": return "bg-primary/15 text-primary border-primary/30";
    case "Gold": return "bg-chart-3/15 text-chart-3 border-chart-3/30";
    case "Silver": return "bg-muted text-muted-foreground border-border";
    default: return "bg-chart-2/15 text-chart-2 border-chart-2/30";
  }
};

const AgentTrainingCoachingDashboard: React.FC = () => {
  const avgResponse = Math.round(agents.reduce((s, a) => s + a.responseTime, 0) / agents.length);
  const avgSatisfaction = (agents.reduce((s, a) => s + a.satisfaction, 0) / agents.length).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Agent Training & Performance Coaching
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Build a progressively more effective agent network</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Agents", value: agents.length, icon: Users, color: "text-primary" },
          { label: "Avg Response", value: `${avgResponse}min`, icon: Clock, color: "text-chart-2" },
          { label: "Avg Satisfaction", value: `${avgSatisfaction}/5`, icon: Star, color: "text-chart-3" },
          { label: "Training Modules", value: trainingModules.length, icon: BookOpen, color: "text-chart-1" },
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

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="performance" className="text-xs">📊 Performance</TabsTrigger>
          <TabsTrigger value="training" className="text-xs">📚 Training</TabsTrigger>
          <TabsTrigger value="growth" className="text-xs">📈 Growth Trend</TabsTrigger>
          <TabsTrigger value="coaching" className="text-xs">🎯 Coaching</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-2">
          {agents.sort((a, b) => b.satisfaction - a.satisfaction).map((agent, i) => (
            <motion.div key={agent.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border-border/40">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{agent.name}</span>
                      <Badge className={`${tierColor(agent.tier)} text-[10px]`}>{agent.tier}</Badge>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= Math.round(agent.satisfaction) ? "text-chart-3 fill-chart-3" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-xs text-foreground ml-1">{agent.satisfaction}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Response", value: `${agent.responseTime}min`, pct: Math.max(0, 100 - agent.responseTime * 4) },
                      { label: "Viewing Conv", value: `${agent.viewingConv}%`, pct: agent.viewingConv },
                      { label: "Listing Quality", value: `${agent.listingQuality}`, pct: agent.listingQuality },
                      { label: "Negotiation", value: `${agent.negotiation}`, pct: agent.negotiation },
                    ].map((m) => (
                      <div key={m.label}>
                        <div className="text-[10px] text-muted-foreground mb-0.5">{m.label}</div>
                        <Progress value={m.pct} className="h-1.5" />
                        <div className="text-[10px] text-foreground mt-0.5">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="training" className="space-y-3">
          <Card className="border-primary/20 bg-primary/5 p-3">
            <p className="text-xs text-primary flex items-center gap-1">
              <Award className="h-3 w-3" />
              Agents completing negotiation training close 18% more deals.
            </p>
          </Card>
          {trainingModules.map((tm, i) => (
            <motion.div key={tm.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-border/40">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">{tm.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{tm.category}</Badge>
                      {tm.status === "new" && <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-[10px]">New</Badge>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={tm.completionRate} className="flex-1 h-2 max-w-48" />
                      <span className="text-xs text-muted-foreground">{tm.completionRate}% complete</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{tm.enrolled} enrolled • Impact: {tm.impact}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="growth">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Agent Performance Growth Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={growthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--popover-foreground))", fontSize: 12 }} />
                  <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Avg Score" />
                  <Line type="monotone" dataKey="closeRate" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} name="Close Rate %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coaching" className="space-y-3">
          {agents.filter(a => a.tier === "Bronze").map((agent, i) => (
            <motion.div key={agent.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-chart-3/20 bg-chart-3/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-chart-3" />
                        <span className="text-sm font-bold text-foreground">{agent.name}</span>
                        <Badge className={`${tierColor(agent.tier)} text-[10px]`}>{agent.tier}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Focus: {agent.responseTime > 15 ? "Response speed" : agent.viewingConv < 25 ? "Viewing conversion" : "Negotiation skills"}
                      </p>
                      <p className="text-[10px] text-chart-3 mt-0.5">
                        {agent.trainingsCompleted} trainings completed — needs {Math.max(0, 4 - agent.trainingsCompleted)} more for Silver
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs"><Calendar className="h-3 w-3 mr-1" />Schedule Session</Button>
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

export default AgentTrainingCoachingDashboard;
