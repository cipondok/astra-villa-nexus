import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Sparkles, TrendingUp, MapPin, DollarSign, Eye, Heart,
  BarChart3, ArrowUpRight, Target, Zap, Star, Building2
} from "lucide-react";

const recommendations = [
  {
    title: "Premium 4BR Villa with Ocean View",
    location: "Uluwatu, Bali",
    price: "Rp 6.8B",
    roi: 14.2,
    liquidity: 82,
    momentum: "accelerating",
    confidence: 91,
    match: "Investment profile + location preference",
    image: null,
  },
  {
    title: "Modern 2BR Apartment Complex",
    location: "Kuta Selatan, Bali",
    price: "Rp 2.4B",
    roi: 11.8,
    liquidity: 75,
    momentum: "stable",
    confidence: 85,
    match: "Rental yield optimization",
    image: null,
  },
  {
    title: "Development Land — 800m²",
    location: "Tabanan, Bali",
    price: "Rp 1.2B",
    roi: 22.5,
    liquidity: 58,
    momentum: "emerging",
    confidence: 72,
    match: "High-growth zone detection",
    image: null,
  },
];

const growthAlerts = [
  { district: "Uluwatu", signal: "New airport road access — 25% price acceleration expected", impact: "high" },
  { district: "Tabanan", signal: "Zoning change enables commercial development", impact: "medium" },
  { district: "Sanur", signal: "International school opening driving family demand", impact: "medium" },
];

const watchlist = [
  { title: "Beach Villa Sanur", price: "Rp 5.2B", change: "+2.1%", days: 12 },
  { title: "Studio Denpasar", price: "Rp 890M", change: "+0.8%", days: 5 },
];

const momentumColor = (m: string) =>
  m === "accelerating" ? "bg-chart-1/15 text-chart-1" :
  m === "stable" ? "bg-primary/15 text-primary" :
  "bg-chart-3/15 text-chart-3";

const impactColor = (i: string) =>
  i === "high" ? "bg-destructive/15 text-destructive" : "bg-chart-3/15 text-chart-3";

const SmartPropertyRecommendationEngine: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Smart Property Recommendations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">AI-powered investment opportunity discovery</p>
        </div>
        <Badge className="bg-primary/15 text-primary border-primary/30 text-xs">
          <Zap className="h-3 w-3 mr-1" /> AI Active
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: "Matches Found", value: "12", icon: Target, color: "text-primary" },
          { label: "Avg ROI Potential", value: "16.2%", icon: TrendingUp, color: "text-chart-1" },
          { label: "Growth Alerts", value: "3", icon: Zap, color: "text-chart-3" },
          { label: "Watchlist", value: "2", icon: Heart, color: "text-destructive" },
          { label: "AI Confidence", value: "83%", icon: Sparkles, color: "text-primary" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="border-border/50">
              <CardContent className="p-2.5 text-center">
                <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                <div className="text-sm font-bold text-foreground">{m.value}</div>
                <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recommendations */}
        <div className="md:col-span-2 space-y-3">
          {recommendations.map((r, i) => (
            <motion.div key={r.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="text-xs font-bold text-foreground">{r.title}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{r.location}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-primary">{r.price}</div>
                          <Badge className={`${momentumColor(r.momentum)} text-[7px]`}>{r.momentum}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="text-center p-1.5 rounded border border-border/20">
                          <div className="text-[9px] text-muted-foreground">Expected ROI</div>
                          <div className="text-xs font-bold text-chart-1">{r.roi}%</div>
                        </div>
                        <div className="text-center p-1.5 rounded border border-border/20">
                          <div className="text-[9px] text-muted-foreground">Liquidity</div>
                          <div className="text-xs font-bold text-foreground">{r.liquidity}/100</div>
                        </div>
                        <div className="text-center p-1.5 rounded border border-border/20">
                          <div className="text-[9px] text-muted-foreground">AI Confidence</div>
                          <div className="text-xs font-bold text-primary">{r.confidence}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                          <Star className="h-2.5 w-2.5 text-chart-3" /> {r.match}
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-6 text-[9px]">
                            <Heart className="h-3 w-3 mr-0.5" /> Save
                          </Button>
                          <Button size="sm" className="h-6 text-[9px]">
                            <Eye className="h-3 w-3 mr-0.5" /> View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* AI Insight */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-foreground">AI Market Intelligence</div>
                <p className="text-[10px] text-muted-foreground mt-0.5">District South apartments showing strong appreciation probability over next 12 months. Current entry prices are 8-12% below projected Q4 valuations based on infrastructure development signals.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Growth Alerts */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-chart-3" /> Growth Alerts</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {growthAlerts.map((a, i) => (
                <Card key={i} className="border-border/30">
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <Badge variant="secondary" className="text-[8px]">{a.district}</Badge>
                      <Badge className={`${impactColor(a.impact)} text-[7px]`}>{a.impact}</Badge>
                    </div>
                    <p className="text-[10px] text-foreground mt-1">{a.signal}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-destructive" /> Watchlist</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1">
              {watchlist.map((w, i) => (
                <div key={i} className="p-2 rounded border border-border/20">
                  <div className="text-[10px] font-bold text-foreground">{w.title}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-primary font-bold">{w.price}</span>
                    <span className="text-[9px] text-chart-1 flex items-center gap-0.5">
                      <ArrowUpRight className="h-2.5 w-2.5" />{w.change}
                    </span>
                  </div>
                  <div className="text-[8px] text-muted-foreground mt-0.5">Watching for {w.days} days</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compare */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3 text-center">
              <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-xs font-bold text-foreground">Compare Opportunities</div>
              <p className="text-[9px] text-muted-foreground mt-1">Select 2-3 properties to compare ROI, liquidity, and growth potential side by side.</p>
              <Button size="sm" variant="outline" className="mt-2 w-full text-[10px] h-7">Open Comparison Tool</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SmartPropertyRecommendationEngine;
