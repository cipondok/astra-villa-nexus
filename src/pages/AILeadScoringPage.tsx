import React, { useState, useMemo } from "react";
import { usePropertyLeads, PropertyLead } from "@/hooks/usePropertyLeads";
import { useAILeadScoring, ScoredLead, LeadScoringResult } from "@/hooks/useAILeadScoring";
import { useAuth } from "@/contexts/AuthContext";
import { getEdgeFunctionUserMessage } from "@/lib/supabaseFunctionErrors";
import { isAiTemporarilyDisabled, markAiTemporarilyDisabledFromError } from "@/lib/aiAvailability";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Flame, Thermometer, Snowflake, TrendingUp, Brain,
  Loader2, Target, Zap, AlertTriangle, Clock, UserCheck,
  BarChart3, Lightbulb, Phone,
} from "lucide-react";

const TEMP_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  hot: { icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
  warm: { icon: Thermometer, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  cold: { icon: Snowflake, color: "text-blue-400", bg: "bg-blue-400/10" },
};

const HEALTH_CONFIG: Record<string, { color: string; label: string }> = {
  excellent: { color: "text-green-500", label: "Excellent" },
  good: { color: "text-blue-500", label: "Good" },
  needs_attention: { color: "text-yellow-500", label: "Needs Attention" },
  critical: { color: "text-red-500", label: "Critical" },
};

export default function AILeadScoringPage() {
  const { user } = useAuth();
  const { leads, isLoading: leadsLoading } = usePropertyLeads();
  const scoring = useAILeadScoring();
  const { toast } = useToast();
  const [result, setResult] = useState<LeadScoringResult | null>(null);
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all");

  const handleScore = async () => {
    if (!leads || leads.length === 0) {
      toast({ title: "No leads", description: "You have no leads to score.", variant: "destructive" });
      return;
    }
    if (isAiTemporarilyDisabled()) {
      toast({ title: "AI temporarily unavailable", description: "Please try again shortly.", variant: "destructive" });
      return;
    }

    try {
      const data = await scoring.mutateAsync({
        leads: leads.map((l) => ({
          id: l.id,
          lead_name: l.lead_name,
          lead_email: l.lead_email,
          lead_phone: l.lead_phone,
          lead_source: l.lead_source,
          status: l.status,
          property_id: l.property_id,
          notes: l.notes,
          last_contacted_at: l.last_contacted_at,
          created_at: l.created_at,
        })),
        agent_id: user?.id,
      });
      setResult(data);
    } catch (err) {
      markAiTemporarilyDisabledFromError(err);
      const msg = getEdgeFunctionUserMessage(err);
      toast({ title: msg.title, description: msg.description, variant: msg.variant });
    }
  };

  const scoredMap = useMemo(() => {
    if (!result) return new Map<string, ScoredLead>();
    return new Map(result.scored_leads.map((s) => [s.lead_id, s]));
  }, [result]);

  const filteredLeads = useMemo(() => {
    if (!result) return [];
    let sorted = [...result.scored_leads].sort((a, b) => b.ai_score - a.ai_score);
    if (filter !== "all") sorted = sorted.filter((s) => s.temperature === filter);
    return sorted;
  }, [result, filter]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Brain className="h-4 w-4" /> AI Lead Scoring
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Lead Intelligence Engine</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">AI-powered lead scoring that analyzes behavior, engagement, and intent to prioritize your pipeline.</p>
        </div>

        {/* Action */}
        <div className="flex justify-center mb-8">
          <Button onClick={handleScore} disabled={scoring.isPending || leadsLoading} size="lg" className="gap-2">
            {scoring.isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Scoring {leads?.length || 0} leads...</> : <><Zap className="h-4 w-4" />Score {leads?.length || 0} Leads with AI</>}
          </Button>
        </div>

        {!result ? (
          <Card className="border-border/50 flex items-center justify-center min-h-[400px]">
            <div className="text-center text-muted-foreground space-y-2 p-8">
              <Target className="h-12 w-12 mx-auto opacity-30" />
              <p className="text-lg font-medium">{leadsLoading ? "Loading leads..." : leads && leads.length > 0 ? `${leads.length} leads ready to score` : "No leads found"}</p>
              <p className="text-sm">Click the button above to run AI analysis on your leads.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold text-foreground">{result.summary.total_leads}</p>
                  <p className="text-xs text-muted-foreground">Total Leads</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <Flame className="h-5 w-5 mx-auto mb-1 text-red-500" />
                  <p className="text-2xl font-bold text-red-500">{result.summary.hot_count}</p>
                  <p className="text-xs text-muted-foreground">Hot</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <Thermometer className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-2xl font-bold text-yellow-500">{result.summary.warm_count}</p>
                  <p className="text-xs text-muted-foreground">Warm</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <Snowflake className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                  <p className="text-2xl font-bold text-blue-400">{result.summary.cold_count}</p>
                  <p className="text-xs text-muted-foreground">Cold</p>
                </CardContent>
              </Card>
              <Card className="border-border/50">
                <CardContent className="pt-4 text-center">
                  <BarChart3 className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold text-foreground">{Math.round(result.summary.avg_score)}</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline Health + Recommendations */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />Pipeline Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-lg font-bold ${HEALTH_CONFIG[result.summary.pipeline_health]?.color}`}>
                      {HEALTH_CONFIG[result.summary.pipeline_health]?.label}
                    </span>
                  </div>
                  {result.summary.avg_conversion_probability != null && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg Conversion Probability</span>
                        <span className="font-medium text-foreground">{Math.round(result.summary.avg_conversion_probability)}%</span>
                      </div>
                      <Progress value={result.summary.avg_conversion_probability} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" />Top Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.summary.top_recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{r}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Lead List */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Scored Leads</CardTitle>
                  <div className="flex gap-1">
                    {(["all", "hot", "warm", "cold"] as const).map((f) => (
                      <Badge
                        key={f}
                        variant={filter === f ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => setFilter(f)}
                      >
                        {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredLeads.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">No leads match this filter.</p>
                ) : (
                  filteredLeads.map((scored) => {
                    const lead = leads?.find((l) => l.id === scored.lead_id);
                    const tempCfg = TEMP_CONFIG[scored.temperature];
                    const TempIcon = tempCfg?.icon || Thermometer;

                    return (
                      <Card key={scored.lead_id} className="border-border/30">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${tempCfg?.bg} flex items-center justify-center`}>
                                <TempIcon className={`h-5 w-5 ${tempCfg?.color}`} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground text-sm">{lead?.lead_name || scored.lead_id}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {lead?.lead_email && <span>{lead.lead_email}</span>}
                                  {lead?.lead_source && <Badge variant="outline" className="text-[10px] h-4">{lead.lead_source}</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-foreground">{scored.ai_score}</div>
                              <div className="text-xs text-muted-foreground">{scored.conversion_probability}% conv.</div>
                            </div>
                          </div>

                          {/* Score breakdown */}
                          {scored.score_breakdown && (
                            <div className="grid grid-cols-3 gap-2 mb-3">
                              {Object.entries(scored.score_breakdown).map(([key, val]) => (
                                <div key={key} className="bg-muted/30 rounded-lg px-2 py-1.5 text-center">
                                  <p className="text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                                  <p className="text-xs font-bold text-foreground">{val}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Action + Insights */}
                          <div className="bg-primary/5 rounded-lg p-2.5 mb-2">
                            <p className="text-xs font-medium text-primary flex items-center gap-1"><Phone className="h-3 w-3" />Recommended Action</p>
                            <p className="text-xs text-foreground mt-0.5">{scored.recommended_action}</p>
                            {scored.best_contact_time && (
                              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />Best time: {scored.best_contact_time}</p>
                            )}
                          </div>

                          {scored.insights.length > 0 && (
                            <div className="space-y-1">
                              {scored.insights.slice(0, 3).map((insight, i) => (
                                <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                                  <Lightbulb className="h-3 w-3 text-yellow-500 shrink-0 mt-0.5" />{insight}
                                </p>
                              ))}
                            </div>
                          )}

                          {scored.risk_factors && scored.risk_factors.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {scored.risk_factors.map((r, i) => (
                                <p key={i} className="text-[11px] text-red-400 flex items-start gap-1.5">
                                  <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />{r}
                                </p>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            {scored.buyer_type && scored.buyer_type !== "unknown" && (
                              <Badge variant="secondary" className="text-[10px]">
                                <UserCheck className="h-2.5 w-2.5 mr-1" />{scored.buyer_type.replace(/_/g, " ")}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
