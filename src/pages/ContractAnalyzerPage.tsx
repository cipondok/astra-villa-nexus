import React, { useState } from "react";
import { useContractAnalysis, ContractAnalysisResult } from "@/hooks/useContractAnalysis";
import { getEdgeFunctionUserMessage } from "@/lib/supabaseFunctionErrors";
import { isAiTemporarilyDisabled, markAiTemporarilyDisabledFromError } from "@/lib/aiAvailability";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, AlertTriangle, Shield, DollarSign, Scale, Users,
  Loader2, CheckCircle, XCircle, Clock, ChevronRight, Gavel,
  Upload,
} from "lucide-react";

const CONTRACT_TYPES = [
  { value: "sale_purchase", label: "Sale & Purchase Agreement (AJB)" },
  { value: "lease", label: "Lease Agreement (Sewa)" },
  { value: "ppjb", label: "Binding Sale Agreement (PPJB)" },
  { value: "rental", label: "Rental Agreement (Kontrak)" },
  { value: "mortgage", label: "Mortgage Agreement (KPR)" },
  { value: "power_of_attorney", label: "Power of Attorney (Surat Kuasa)" },
  { value: "other", label: "Other Contract" },
];

const RISK_COLORS: Record<string, string> = {
  high: "text-red-500 bg-red-500/10 border-red-500/30",
  medium: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
  low: "text-green-500 bg-green-500/10 border-green-500/30",
  critical: "text-red-700 bg-red-700/10 border-red-700/30",
};

const RECOMMENDATION_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  proceed: { color: "text-green-500", icon: CheckCircle, label: "Safe to Proceed" },
  proceed_with_caution: { color: "text-yellow-500", icon: AlertTriangle, label: "Proceed with Caution" },
  negotiate: { color: "text-orange-500", icon: Scale, label: "Negotiate Terms" },
  seek_legal_counsel: { color: "text-red-400", icon: Gavel, label: "Seek Legal Counsel" },
  do_not_sign: { color: "text-red-600", icon: XCircle, label: "Do Not Sign" },
};

function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge className={`text-xs border ${RISK_COLORS[severity] || ""}`} variant="outline">
      {severity}
    </Badge>
  );
}

export default function ContractAnalyzerPage() {
  const [contractText, setContractText] = useState("");
  const [contractType, setContractType] = useState("other");
  const [result, setResult] = useState<ContractAnalysisResult | null>(null);

  const analysis = useContractAnalysis();
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (contractText.trim().length < 50) {
      toast({ title: "Text too short", description: "Please paste at least 50 characters of contract text.", variant: "destructive" });
      return;
    }
    if (isAiTemporarilyDisabled()) {
      toast({ title: "AI temporarily unavailable", description: "Please try again shortly.", variant: "destructive" });
      return;
    }

    try {
      const data = await analysis.mutateAsync({
        contract_text: contractText,
        contract_type: CONTRACT_TYPES.find((t) => t.value === contractType)?.label || contractType,
      });
      setResult(data);
    } catch (err) {
      markAiTemporarilyDisabledFromError(err);
      const msg = getEdgeFunctionUserMessage(err);
      toast({ title: msg.title, description: msg.description, variant: msg.variant });
    }
  };

  const recConfig = result ? RECOMMENDATION_CONFIG[result.overall_assessment.recommendation] : null;
  const RecIcon = recConfig?.icon || CheckCircle;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <FileText className="h-4 w-4" /> AI Contract Analyzer
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Analyze Your Contract</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">Paste your lease or sale contract to extract key terms, identify risks, and get actionable recommendations.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Input */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" />Contract Input</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Contract Type</label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Contract Text</label>
                  <Textarea
                    placeholder="Paste your contract text here..."
                    value={contractText}
                    onChange={(e) => setContractText(e.target.value)}
                    className="min-h-[350px] text-sm font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{contractText.length.toLocaleString()} characters</p>
                </div>
                <Button onClick={handleAnalyze} disabled={analysis.isPending || contractText.trim().length < 50} className="w-full" size="lg">
                  {analysis.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Analyzing...</> : <><Scale className="h-4 w-4 mr-2" />Analyze Contract</>}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-3">
            {!result ? (
              <Card className="border-border/50 h-full flex items-center justify-center min-h-[500px]">
                <div className="text-center text-muted-foreground space-y-2 p-8">
                  <FileText className="h-12 w-12 mx-auto opacity-30" />
                  <p className="text-lg font-medium">No analysis yet</p>
                  <p className="text-sm">Paste a contract and click Analyze to get started.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Overall Assessment Banner */}
                <Card className={`border ${RISK_COLORS[result.overall_assessment.risk_level] || "border-border/50"}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <RecIcon className={`h-5 w-5 ${recConfig?.color}`} />
                          <h3 className={`text-lg font-bold ${recConfig?.color}`}>{recConfig?.label}</h3>
                        </div>
                        <p className="text-sm text-foreground/80">{result.overall_assessment.reasoning}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <SeverityBadge severity={result.overall_assessment.risk_level} />
                        <p className="text-xs text-muted-foreground mt-1">{result.overall_assessment.favorability.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    {/* Compliance Score */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Legal Compliance</span>
                      <Progress value={result.legal_compliance.overall_score} className="h-2 flex-1" />
                      <span className="text-sm font-bold text-foreground">{result.legal_compliance.overall_score}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Tabs defaultValue="summary" className="space-y-4">
                  <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="risks">Risks</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                    <TabsTrigger value="obligations">Obligations</TabsTrigger>
                    <TabsTrigger value="financial">Financial</TabsTrigger>
                  </TabsList>

                  {/* Summary */}
                  <TabsContent value="summary" className="space-y-4">
                    <Card className="border-border/50">
                      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />Contract Summary</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Type</p>
                            <p className="font-medium text-foreground">{result.summary.contract_type}</p>
                          </div>
                          {result.summary.total_value && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">Total Value</p>
                              <p className="font-medium text-foreground">{result.summary.total_value}</p>
                            </div>
                          )}
                          {result.summary.effective_date && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">Effective Date</p>
                              <p className="font-medium text-foreground">{result.summary.effective_date}</p>
                            </div>
                          )}
                          {result.summary.expiry_date && (
                            <div className="bg-muted/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">Expiry Date</p>
                              <p className="font-medium text-foreground">{result.summary.expiry_date}</p>
                            </div>
                          )}
                        </div>
                        {result.summary.property_description && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Property</p>
                            <p className="text-foreground">{result.summary.property_description}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Users className="h-3 w-3" />Parties</p>
                          {result.summary.parties.map((p, i) => (
                            <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2 mb-1.5">
                              <Badge variant="outline" className="text-xs">{p.role}</Badge>
                              <span className="font-medium">{p.name}</span>
                              {p.details && <span className="text-muted-foreground text-xs">— {p.details}</span>}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Negotiation Points */}
                    {result.overall_assessment.negotiation_points && result.overall_assessment.negotiation_points.length > 0 && (
                      <Card className="border-border/50">
                        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4 text-primary" />Negotiation Points</CardTitle></CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {result.overall_assessment.negotiation_points.map((np, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span className="text-foreground">{np}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {/* Legal Compliance */}
                    <Card className="border-border/50">
                      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" />Legal Compliance</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        {result.legal_compliance.missing_clauses && result.legal_compliance.missing_clauses.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-red-500 mb-1.5">Missing Clauses</p>
                            {result.legal_compliance.missing_clauses.map((c, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm mb-1"><XCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" /><span className="text-muted-foreground">{c}</span></div>
                            ))}
                          </div>
                        )}
                        {result.legal_compliance.recommendations.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-primary mb-1.5">Recommendations</p>
                            {result.legal_compliance.recommendations.map((r, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm mb-1"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /><span className="text-muted-foreground">{r}</span></div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Risks */}
                  <TabsContent value="risks" className="space-y-3">
                    {result.risks.length === 0 ? (
                      <Card className="border-border/50 p-8 text-center text-muted-foreground"><CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" /><p>No significant risks identified.</p></Card>
                    ) : (
                      result.risks.map((risk, i) => (
                        <Card key={i} className={`border ${RISK_COLORS[risk.severity] || "border-border/50"}`}>
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className={`h-4 w-4 ${risk.severity === "high" ? "text-red-500" : risk.severity === "medium" ? "text-yellow-500" : "text-green-500"}`} />
                                <h4 className="font-semibold text-foreground text-sm">{risk.title}</h4>
                              </div>
                              <SeverityBadge severity={risk.severity} />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                            <div className="bg-muted/50 rounded-lg p-2.5 text-xs">
                              <span className="font-medium text-foreground">Recommendation: </span>
                              <span className="text-muted-foreground">{risk.recommendation}</span>
                            </div>
                            {risk.legal_reference && <p className="text-xs text-muted-foreground mt-1.5">📎 {risk.legal_reference}</p>}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  {/* Key Terms */}
                  <TabsContent value="terms" className="space-y-3">
                    {result.key_terms.map((term, i) => (
                      <Card key={i} className="border-border/50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{term.category}</Badge>
                              <h4 className="font-semibold text-foreground text-sm">{term.term}</h4>
                            </div>
                            <Badge variant={term.importance === "critical" ? "destructive" : term.importance === "important" ? "default" : "secondary"} className="text-xs">{term.importance}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{term.details}</p>
                          {term.clause_reference && <p className="text-xs text-muted-foreground mt-1">§ {term.clause_reference}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* Obligations */}
                  <TabsContent value="obligations" className="space-y-3">
                    {result.obligations.map((ob, i) => (
                      <Card key={i} className="border-border/50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground text-sm">{ob.party}</span>
                            </div>
                            {ob.status && <Badge variant="outline" className="text-xs">{ob.status}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{ob.obligation}</p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            {ob.deadline && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ob.deadline}</span>}
                            {ob.penalty_for_breach && <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-400" />{ob.penalty_for_breach}</span>}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  {/* Financial */}
                  <TabsContent value="financial" className="space-y-4">
                    {result.financial_breakdown ? (
                      <>
                        {result.financial_breakdown.total_cost && (
                          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
                            <CardContent className="pt-6 text-center">
                              <p className="text-xs text-muted-foreground">Total Cost</p>
                              <p className="text-2xl font-bold text-foreground">{result.financial_breakdown.total_cost}</p>
                            </CardContent>
                          </Card>
                        )}
                        {result.financial_breakdown.payment_schedule && result.financial_breakdown.payment_schedule.length > 0 && (
                          <Card className="border-border/50">
                            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Payment Schedule</CardTitle></CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {result.financial_breakdown.payment_schedule.map((p, i) => (
                                  <div key={i} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 text-sm">
                                    <span className="text-foreground">{p.description}</span>
                                    <div className="text-right">
                                      <span className="font-medium text-foreground">{p.amount}</span>
                                      {p.due_date && <p className="text-xs text-muted-foreground">{p.due_date}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {result.financial_breakdown.hidden_costs && result.financial_breakdown.hidden_costs.length > 0 && (
                          <Card className="border-border/50 border-yellow-500/30">
                            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2 text-yellow-500"><AlertTriangle className="h-4 w-4" />Hidden Costs</CardTitle></CardHeader>
                            <CardContent>
                              <ul className="space-y-1.5">
                                {result.financial_breakdown.hidden_costs.map((c, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0 mt-0.5" />{c}</li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    ) : (
                      <Card className="border-border/50 p-8 text-center text-muted-foreground">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p>No financial details extracted from this contract.</p>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
