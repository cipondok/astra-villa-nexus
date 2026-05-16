import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Star, ThumbsUp, ThumbsDown, Eye, TrendingUp, AlertTriangle,
  MessageSquare, CheckCircle, Home, Users
} from "lucide-react";

const overallMetrics = {
  avgSatisfaction: 4.2,
  totalViewings: 156,
  viewingToOffer: 32,
  conversionRate: 20.5,
  agentRating: 4.4,
  logisticsScore: 3.8,
};

const feedbackTrend = [
  { month: "Jan", score: 3.8 }, { month: "Feb", score: 3.9 }, { month: "Mar", score: 4.0 },
  { month: "Apr", score: 4.1 }, { month: "May", score: 4.2 }, { month: "Jun", score: 4.3 },
];

const topExperiences = [
  { property: "Seminyak Luxury Villa", score: 4.9, feedback: "Stunning property, excellent agent guide", agent: "Rina S.", tags: ["Well-staged", "Punctual", "Detailed info"] },
  { property: "BSD Premium Apartment", score: 4.8, feedback: "Professional viewing, great neighborhood tour", agent: "Budi A.", tags: ["Clean", "Good lighting", "Honest pricing"] },
  { property: "Canggu Modern House", score: 4.7, feedback: "Loved the virtual pre-tour before visit", agent: "Maya K.", tags: ["Tech-forward", "Responsive", "Accurate photos"] },
];

const negativeAlerts = [
  { property: "Kuta Studio Apt", score: 2.1, issue: "Property condition didn't match photos", agent: "Agent X", resolution: "Listing photos updated" },
  { property: "Denpasar House 3BR", score: 2.5, issue: "Agent arrived 25 minutes late", agent: "Agent Y", resolution: "Performance warning issued" },
];

const feedbackTags = [
  { tag: "Well-staged", count: 45, sentiment: "positive" },
  { tag: "Accurate photos", count: 38, sentiment: "positive" },
  { tag: "Punctual agent", count: 34, sentiment: "positive" },
  { tag: "Needs renovation", count: 22, sentiment: "neutral" },
  { tag: "Misleading price", count: 8, sentiment: "negative" },
  { tag: "Poor access", count: 6, sentiment: "negative" },
];

const improvements = [
  "Improve staging quality for mid-range apartment listings — 18% lower satisfaction vs. villas",
  "Add virtual pre-tour for all listings above Rp 2B to set accurate expectations",
  "Implement 15-min early arrival policy for agents to reduce logistics complaints by ~40%",
];

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star key={star} className={`h-3.5 w-3.5 ${star <= Math.round(rating) ? 'text-chart-3 fill-chart-3' : 'text-muted-foreground/30'}`} />
    ))}
    <span className="text-sm font-bold text-foreground ml-1">{rating.toFixed(1)}</span>
  </div>
);

const BuyerViewingFeedbackPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary" />
          Buyer Viewing Experience Feedback
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Optimize viewing quality for higher closing probability</p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Avg Satisfaction", value: overallMetrics.avgSatisfaction.toFixed(1), suffix: "/5", icon: Star, color: "text-chart-3" },
          { label: "Total Viewings", value: overallMetrics.totalViewings, icon: Eye, color: "text-primary" },
          { label: "Led to Offers", value: overallMetrics.viewingToOffer, icon: CheckCircle, color: "text-chart-1" },
          { label: "Conversion Rate", value: `${overallMetrics.conversionRate}%`, icon: TrendingUp, color: "text-chart-2" },
          { label: "Agent Rating", value: overallMetrics.agentRating.toFixed(1), suffix: "/5", icon: Users, color: "text-primary" },
          { label: "Logistics Score", value: overallMetrics.logisticsScore.toFixed(1), suffix: "/5", icon: Home, color: "text-chart-4" },
        ].map((m) => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
              <div className="text-lg font-bold text-foreground">{m.value}<span className="text-xs text-muted-foreground">{m.suffix || ''}</span></div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="positive" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="positive" className="text-xs">✅ Top Experiences</TabsTrigger>
          <TabsTrigger value="negative" className="text-xs">⚠️ Alerts</TabsTrigger>
          <TabsTrigger value="tags" className="text-xs">🏷️ Feedback Tags</TabsTrigger>
          <TabsTrigger value="improve" className="text-xs">💡 Improvements</TabsTrigger>
        </TabsList>

        <TabsContent value="positive" className="space-y-3">
          {topExperiences.map((exp, i) => (
            <motion.div key={exp.property} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-chart-1/20 bg-chart-1/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ThumbsUp className="h-4 w-4 text-chart-1" />
                        <span className="text-sm font-bold text-foreground">{exp.property}</span>
                      </div>
                      <StarRating rating={exp.score} />
                      <p className="text-xs text-muted-foreground mt-1 italic">"{exp.feedback}"</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Agent: {exp.agent}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {exp.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="negative" className="space-y-3">
          {negativeAlerts.map((alert, i) => (
            <motion.div key={alert.property} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <ThumbsDown className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-bold text-foreground">{alert.property}</span>
                    <StarRating rating={alert.score} />
                  </div>
                  <p className="text-xs text-destructive mt-1">{alert.issue}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Agent: {alert.agent}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <CheckCircle className="h-3 w-3 text-chart-1" />
                    <span className="text-[10px] text-chart-1">{alert.resolution}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="tags">
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              {feedbackTags.map((tag) => (
                <div key={tag.tag} className="flex items-center gap-3">
                  <Badge variant={tag.sentiment === "positive" ? "default" : tag.sentiment === "negative" ? "destructive" : "secondary"} className="text-[10px] w-28 justify-center">
                    {tag.tag}
                  </Badge>
                  <Progress value={Math.min((tag.count / 50) * 100, 100)} className="flex-1 h-2" />
                  <span className="text-xs text-muted-foreground w-8 text-right">{tag.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improve" className="space-y-3">
          {improvements.map((tip, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{tip}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BuyerViewingFeedbackPanel;
