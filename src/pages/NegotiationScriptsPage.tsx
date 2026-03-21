import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNegotiationScripts } from '@/hooks/useNegotiationScripts';
import {
  MessageSquare, Target, Clock, Users, BookOpen, Shield,
  Lightbulb, ArrowRight, BarChart3, GraduationCap,
} from 'lucide-react';

const moduleIcon: Record<string, React.ReactNode> = {
  'Buyer Engagement': <Users className="w-4 h-4" />,
  'Seller Alignment': <Target className="w-4 h-4" />,
  'Objection Handling': <Shield className="w-4 h-4" />,
  'Closing Confirmation': <BookOpen className="w-4 h-4" />,
};

const speakerStyle: Record<string, { bg: string; label: string }> = {
  agent: { bg: 'bg-primary/10 border-primary/20', label: 'Agent' },
  system: { bg: 'bg-accent/10 border-accent/20', label: 'System' },
  note: { bg: 'bg-muted border-border', label: 'Direction' },
};

export default function NegotiationScriptsPage() {
  const { scripts, timingGuide, closingKPIs, trainingPlan, modules } = useNegotiationScripts();
  const [activeModule, setActiveModule] = useState<string>(modules[0]);

  const moduleScripts = scripts.filter(s => s.module === activeModule);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Negotiation & Closing Script System
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Structured communication scripts for deal closure excellence</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Module Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {modules.map(m => (
            <Card
              key={m}
              className={`border cursor-pointer transition-all ${m === activeModule ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/20'}`}
              onClick={() => setActiveModule(m)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <div className="text-primary">{moduleIcon[m]}</div>
                <span className="text-xs font-medium text-foreground">{m}</span>
                <Badge variant="outline" className="text-[9px] ml-auto">{scripts.filter(s => s.module === m).length}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="scripts" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="scripts" className="text-xs">Scripts</TabsTrigger>
            <TabsTrigger value="timing" className="text-xs">Timing Guide</TabsTrigger>
            <TabsTrigger value="kpis" className="text-xs">Closing KPIs</TabsTrigger>
            <TabsTrigger value="training" className="text-xs">Training Plan</TabsTrigger>
          </TabsList>

          {/* ── Scripts ── */}
          <TabsContent value="scripts" className="space-y-4">
            {moduleScripts.map((script, si) => (
              <motion.div key={script.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {moduleIcon[script.module]}
                        {script.title}
                      </CardTitle>
                      <div className="flex gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{script.stage}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{script.objective}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {script.lines.map((line, li) => {
                      const style = speakerStyle[line.speaker];
                      return (
                        <div key={li} className={`rounded-lg border p-3 ${style.bg}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[9px]">{style.label}</Badge>
                            {line.tone && <span className="text-[10px] text-muted-foreground italic">{line.tone}</span>}
                          </div>
                          <p className="text-xs text-foreground leading-relaxed">{line.text}</p>
                        </div>
                      );
                    })}

                    {/* Tips */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Pro Tips</span>
                      </div>
                      <ul className="space-y-1">
                        {script.tips.map((tip, ti) => (
                          <li key={ti} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                            <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          {/* ── Timing Guide ── */}
          <TabsContent value="timing">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Deal Stage Communication Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {['Stage', 'Action', 'Timing', 'Channel', 'Owner'].map(h => (
                          <th key={h} className="px-4 py-2 text-left font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timingGuide.map((t, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-2.5 font-medium text-foreground">{t.stage}</td>
                          <td className="px-4 py-2.5 text-foreground">{t.action}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant="outline" className="text-[10px]">{t.timing}</Badge>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{t.channel}</td>
                          <td className="px-4 py-2.5">
                            <Badge variant="secondary" className="text-[10px]">{t.owner}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Closing KPIs ── */}
          <TabsContent value="kpis">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {closingKPIs.map((kpi) => (
                <Card key={kpi.label} className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{kpi.label}</span>
                      <Badge className="text-xs bg-primary/15 text-primary">{kpi.benchmark}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{kpi.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Training Plan ── */}
          <TabsContent value="training" className="space-y-3">
            {trainingPlan.map((step, i) => (
              <motion.div key={step.phase} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">{step.phase}: {step.title}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{step.duration}</Badge>
                    </div>
                    <ul className="space-y-1">
                      {step.activities.map((a, ai) => (
                        <li key={ai} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
