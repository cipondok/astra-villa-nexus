import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, User, Home, MapPin, TrendingUp, BarChart3, ArrowRight, Target, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

const algorithmNodes = [
  { node: 'Buyer Behavior Scoring', icon: User, weight: '30%', desc: 'Browse history, search patterns, inquiry frequency, saved listings, time-on-page', inputs: ['Page views', 'Search queries', 'Saved listings', 'Inquiry count'] },
  { node: 'Property Similarity Engine', icon: Home, weight: '25%', desc: 'Feature vector matching across price, type, size, amenities, and photo quality score', inputs: ['Price range', 'Property type', 'Size (LT/LB)', 'Amenity overlap'] },
  { node: 'Demand-Supply Balancing', icon: BarChart3, weight: '15%', desc: 'District-level supply saturation vs active buyer demand ratio optimization', inputs: ['Listing density', 'Inquiry velocity', 'Days on market', 'Price trend'] },
  { node: 'Location Trend Weighting', icon: MapPin, weight: '20%', desc: 'Infrastructure proximity, appreciation forecast, neighborhood desirability signals', inputs: ['Transport access', 'School rating', 'Growth corridor', 'Appreciation %'] },
  { node: 'Listing Performance Ranking', icon: TrendingUp, weight: '10%', desc: 'Historical engagement metrics, photo quality, description completeness, agent response time', inputs: ['View count', 'CTR', 'Photo score', 'Response time'] },
];

const radarData = [
  { factor: 'Behavior', score: 85 },
  { factor: 'Similarity', score: 78 },
  { factor: 'Demand-Supply', score: 72 },
  { factor: 'Location', score: 88 },
  { factor: 'Performance', score: 65 },
];

const exampleRecommendations = [
  { property: 'Modern Villa — Menteng', confidence: 94, reason: 'High behavior match + premium location trend', status: 'Hot' },
  { property: '3BR Apartment — Sudirman', confidence: 87, reason: 'Price-range fit + strong demand signal', status: 'Warm' },
  { property: 'Townhouse — BSD City', confidence: 79, reason: 'Growth corridor + similar saved listings', status: 'Warm' },
  { property: 'Studio — Kelapa Gading', confidence: 68, reason: 'Budget match + high listing performance', status: 'Cool' },
];

const RecommendationAlgorithmFlow = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Recommendation Algorithm Flow</h2>
          <Badge variant="outline">✨ Matching Engine</Badge>
        </div>
        <p className="text-muted-foreground text-sm">How property recommendations are generated through weighted multi-factor decision logic</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Algorithm Factors', value: '5' },
          { label: 'Avg Confidence', value: '82%' },
          { label: 'Recommendations/Day', value: '~1,400' },
          { label: 'Click-Through Rate', value: '23%' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      {/* Algorithm Decision Nodes */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Weighted Decision Components</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {algorithmNodes.map((n, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <n.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{n.node}</p>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{n.weight}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 ml-11">
                  {n.inputs.map((inp, ii) => (
                    <Badge key={ii} variant="secondary" className="text-xs">{inp}</Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Radar Scoring */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Factor Weight Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="factor" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Example Output */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Sample Recommendation Output</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {exampleRecommendations.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border">
                <Target className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{r.property}</p>
                  <p className="text-xs text-muted-foreground">{r.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-primary">{r.confidence}%</p>
                  <Badge variant={r.status === 'Hot' ? 'destructive' : r.status === 'Warm' ? 'default' : 'secondary'} className="text-xs">{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Continuous Improvement</p>
            <p className="text-sm text-muted-foreground">Recommendation confidence increases as viewing engagement signals accumulate — each inquiry-to-viewing conversion validates and strengthens the matching model by approximately 0.3% accuracy per 100 validated interactions.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationAlgorithmFlow;
