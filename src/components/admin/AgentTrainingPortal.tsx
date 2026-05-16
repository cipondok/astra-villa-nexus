import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, MessageSquare, Calendar, DollarSign,
  Trophy, Star, CheckCircle, Clock, Users, Target, ArrowUpRight, Award, Zap
} from "lucide-react";

const trainingModules = [
  { id: 1, title: "Creating High-Performing Listings", icon: Star, duration: "12 min", completed: true, score: 92, tips: "Photos, pricing, and description best practices" },
  { id: 2, title: "Fast Buyer Inquiry Response", icon: MessageSquare, duration: "8 min", completed: true, score: 88, tips: "Response templates and speed optimization" },
  { id: 3, title: "Viewing Scheduling Mastery", icon: Calendar, duration: "10 min", completed: false, score: 0, tips: "Booking workflow, confirmation, and follow-up" },
  { id: 4, title: "Negotiation & Deal Closing", icon: Target, duration: "15 min", completed: false, score: 0, tips: "Objection handling, price anchoring, closing techniques" },
  { id: 5, title: "Commission & Earnings Guide", icon: DollarSign, duration: "6 min", completed: false, score: 0, tips: "Revenue structure, bonuses, and tier progression" },
];

const completedCount = trainingModules.filter(m => m.completed).length;
const completionPct = Math.round((completedCount / trainingModules.length) * 100);

const certBadges = [
  { label: "Listing Pro", earned: true, icon: Star },
  { label: "Fast Responder", earned: true, icon: Zap },
  { label: "Scheduling Expert", earned: false, icon: Calendar },
  { label: "Closer Elite", earned: false, icon: Trophy },
];

const successStories = [
  { name: "Agent Rina", milestone: "10 deals in first month", earnings: "Rp 45M commission", avatar: "R" },
  { name: "Agent Budi", milestone: "Gold tier in 6 weeks", earnings: "Rp 38M commission", avatar: "B" },
  { name: "Agent Maya", milestone: "Top listing quality score", earnings: "Rp 52M commission", avatar: "M" },
];

const performanceTips = [
  "Agents who complete all modules close 2.4x more deals",
  "Responding to inquiries within 5 min increases conversion by 68%",
  "Listings with 8+ photos get 3.2x more views",
  "Follow-up within 24h after viewing increases offer rate by 42%",
];

const AgentTrainingPortal: React.FC = () => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Agent Training Portal
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Onboarding & performance coaching for new agents</p>
        </div>
        <div className="flex gap-2">
          <Card className="border-primary/20 bg-primary/5 px-3 py-1.5">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{completionPct}%</div>
              <div className="text-[9px] text-muted-foreground uppercase">Complete</div>
            </div>
          </Card>
          <Card className="border-chart-1/20 bg-chart-1/5 px-3 py-1.5">
            <div className="text-center">
              <div className="text-lg font-bold text-chart-1">{completedCount}/{trainingModules.length}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Modules</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">Training Progress</span>
            <span className="text-xs text-primary font-bold">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-2 mb-2" />
          <p className="text-[10px] text-muted-foreground">Complete all modules to earn your ASTRA Agent Certification</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Training Modules */}
        <div className="md:col-span-2 space-y-2">
          {trainingModules.map((mod, i) => (
            <motion.div key={mod.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`border-border/50 cursor-pointer transition-colors hover:bg-muted/10 ${expandedModule === mod.id ? "border-primary/20" : ""}`}
                onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mod.completed ? "bg-chart-1/15" : "bg-muted"}`}>
                      {mod.completed ? <CheckCircle className="h-4 w-4 text-chart-1" /> : <mod.icon className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-foreground">{mod.title}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                        <Clock className="h-2.5 w-2.5" /> {mod.duration}
                        {mod.completed && <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-[8px]">Score: {mod.score}%</Badge>}
                      </div>
                    </div>
                    <Button size="sm" variant={mod.completed ? "outline" : "default"} className="h-7 text-[10px]">
                      {mod.completed ? "Review" : "Start"}
                    </Button>
                  </div>
                  {expandedModule === mod.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-3 border-t border-border/30">
                      <p className="text-[11px] text-muted-foreground">{mod.tips}</p>
                      {mod.completed && (
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="outline" className="h-6 text-[9px]">Retake Quiz</Button>
                          <Button size="sm" variant="ghost" className="h-6 text-[9px]">View Certificate</Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Certification Badges */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-chart-1" /> Certification Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="grid grid-cols-2 gap-1.5">
                {certBadges.map((b) => (
                  <div key={b.label} className={`p-2 rounded-lg border text-center ${b.earned ? "border-chart-1/20 bg-chart-1/5" : "border-border/30 bg-muted/20 opacity-50"}`}>
                    <b.icon className={`h-4 w-4 mx-auto mb-0.5 ${b.earned ? "text-chart-1" : "text-muted-foreground"}`} />
                    <div className="text-[9px] font-medium text-foreground">{b.label}</div>
                    {b.earned && <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-[7px] mt-0.5">Earned</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* First Deal Milestone */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <Trophy className="h-5 w-5 text-primary mb-1" />
              <div className="text-xs font-bold text-foreground">First Deal Milestone</div>
              <div className="flex items-center justify-between mt-2 mb-1">
                <span className="text-[10px] text-muted-foreground">Progress</span>
                <span className="text-[10px] font-bold text-primary">65%</span>
              </div>
              <Progress value={65} className="h-1.5" />
              <p className="text-[9px] text-muted-foreground mt-2">Complete training + close your first deal to unlock Gold tier</p>
            </CardContent>
          </Card>

          {/* Success Stories */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" /> Agent Success Stories
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {successStories.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-1.5 rounded border border-border/20">
                  <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">{s.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-foreground">{s.name}</div>
                    <div className="text-[9px] text-muted-foreground">{s.milestone}</div>
                  </div>
                  <span className="text-[9px] font-bold text-chart-1">{s.earnings}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Tips */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-chart-1" /> Performance Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {performanceTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                  <ArrowUpRight className="h-3 w-3 text-chart-1 flex-shrink-0 mt-0.5" />
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentTrainingPortal;
