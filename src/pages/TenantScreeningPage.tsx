import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTenantScreening, type TenantApplication, type ScreeningResult } from "@/hooks/useTenantScreening";
import { toast } from "sonner";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ClipboardCheck, User, Briefcase, Home, Loader2 } from "lucide-react";

const riskColors: Record<string, string> = {
  low: "bg-green-500/10 text-green-700 border-green-500/30",
  moderate: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  high: "bg-orange-500/10 text-orange-700 border-orange-500/30",
  critical: "bg-red-500/10 text-red-700 border-red-500/30",
};

const actionColors: Record<string, string> = {
  approve: "bg-green-500/10 text-green-700",
  approve_with_conditions: "bg-yellow-500/10 text-yellow-700",
  further_review: "bg-orange-500/10 text-orange-700",
  decline: "bg-red-500/10 text-red-700",
};

const actionLabels: Record<string, string> = {
  approve: "✅ Approve",
  approve_with_conditions: "⚠️ Approve with Conditions",
  further_review: "🔍 Further Review Required",
  decline: "❌ Decline",
};

const statusIcons: Record<string, typeof CheckCircle2> = {
  verified: CheckCircle2,
  pending: AlertTriangle,
  not_provided: XCircle,
};

export default function TenantScreeningPage() {
  const screening = useTenantScreening();
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [form, setForm] = useState<TenantApplication>({
    full_name: "",
    email: "",
    phone: "",
    monthly_income: 0,
    employment_type: "full_time",
    employer_name: "",
    employment_duration_months: 0,
    previous_landlord_contact: "",
    reason_for_moving: "",
    requested_rent: 0,
    pets: "",
    num_occupants: 1,
    credit_score: undefined,
    has_criminal_record: false,
    eviction_history: "",
    references: "",
  });

  const update = (field: keyof TenantApplication, value: any) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.monthly_income || !form.requested_rent) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      const res = await screening.mutateAsync(form);
      setResult(res);
      toast.success("Screening complete");
    } catch (err: any) {
      toast.error(err?.message || "Screening failed");
    }
  };

  const scoreColor = (s: number) => (s >= 80 ? "text-green-600" : s >= 60 ? "text-yellow-600" : s >= 40 ? "text-orange-600" : "text-red-600");

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Tenant Screening</h1>
            <p className="text-muted-foreground">AI-powered risk assessment for tenant applications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Occupants</Label>
                    <Input type="number" min={1} value={form.num_occupants} onChange={(e) => update("num_occupants", +e.target.value)} />
                  </div>
                  <div>
                    <Label>Pets</Label>
                    <Input value={form.pets} onChange={(e) => update("pets", e.target.value)} placeholder="None / 1 cat / etc." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Financial & Employment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Monthly Income (IDR) *</Label>
                    <Input type="number" min={0} value={form.monthly_income || ""} onChange={(e) => update("monthly_income", +e.target.value)} />
                  </div>
                  <div>
                    <Label>Requested Rent (IDR) *</Label>
                    <Input type="number" min={0} value={form.requested_rent || ""} onChange={(e) => update("requested_rent", +e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Employment Type</Label>
                    <Select value={form.employment_type} onValueChange={(v) => update("employment_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="self_employed">Self Employed</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Employment Duration (months)</Label>
                    <Input type="number" min={0} value={form.employment_duration_months || ""} onChange={(e) => update("employment_duration_months", +e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Employer Name</Label>
                  <Input value={form.employer_name} onChange={(e) => update("employer_name", e.target.value)} />
                </div>
                <div>
                  <Label>Credit Score (optional)</Label>
                  <Input type="number" min={0} max={900} value={form.credit_score || ""} onChange={(e) => update("credit_score", +e.target.value || undefined)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" /> Rental History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Previous Landlord Contact</Label>
                  <Input value={form.previous_landlord_contact} onChange={(e) => update("previous_landlord_contact", e.target.value)} placeholder="Name & phone/email" />
                </div>
                <div>
                  <Label>Reason for Moving</Label>
                  <Textarea value={form.reason_for_moving} onChange={(e) => update("reason_for_moving", e.target.value)} rows={2} />
                </div>
                <div>
                  <Label>Eviction History</Label>
                  <Textarea value={form.eviction_history} onChange={(e) => update("eviction_history", e.target.value)} placeholder="None / details..." rows={2} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.has_criminal_record} onCheckedChange={(v) => update("has_criminal_record", v)} />
                  <Label>Has Criminal Record</Label>
                </div>
                <div>
                  <Label>References</Label>
                  <Textarea value={form.references} onChange={(e) => update("references", e.target.value)} placeholder="Name, relationship, contact..." rows={2} />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={screening.isPending}>
              {screening.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><Shield className="mr-2 h-4 w-4" /> Run AI Screening</>}
            </Button>
          </form>

          {/* Results */}
          <div className="space-y-6">
            {!result && !screening.isPending && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <ShieldCheck className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">No screening results yet</p>
                  <p className="text-sm">Fill out the application form and run the AI screening</p>
                </CardContent>
              </Card>
            )}

            {screening.isPending && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="text-lg font-medium text-foreground">Analyzing application...</p>
                  <p className="text-sm text-muted-foreground">AI is evaluating risk factors</p>
                </CardContent>
              </Card>
            )}

            {result && (
              <>
                {/* Overall Score */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Score</p>
                        <p className={`text-5xl font-bold ${scoreColor(result.overall_score)}`}>{result.overall_score}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={riskColors[result.risk_level]}>{result.risk_level.toUpperCase()} RISK</Badge>
                        <div>
                          <Badge className={actionColors[result.recommended_action]}>{actionLabels[result.recommended_action]}</Badge>
                        </div>
                      </div>
                    </div>
                    <Progress value={result.overall_score} className="h-3" />
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Income/Rent Ratio:</span>{" "}
                        <span className={`font-semibold ${result.income_to_rent_ratio >= 3 ? "text-green-600" : result.income_to_rent_ratio >= 2 ? "text-yellow-600" : "text-red-600"}`}>
                          {result.income_to_rent_ratio?.toFixed(1)}x
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Affordability:</span>{" "}
                        <span className="font-semibold capitalize">{result.affordability_rating}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Employment:</span>{" "}
                        <span className="font-semibold capitalize">{result.employment_stability}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                  <CardHeader><CardTitle className="text-base">AI Summary</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p></CardContent>
                </Card>

                {/* Conditions */}
                {result.conditions && result.conditions.length > 0 && (
                  <Card className="border-yellow-500/30">
                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-600" /> Conditions for Approval</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {result.conditions.map((c, i) => (
                          <li key={i} className="text-sm flex items-start gap-2"><span className="text-yellow-600 mt-0.5">•</span>{c}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Flags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.red_flags.length > 0 && (
                    <Card className="border-red-500/20">
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-500" /> Red Flags</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-1">{result.red_flags.map((f, i) => <li key={i} className="text-sm text-red-600">⚠ {f}</li>)}</ul>
                      </CardContent>
                    </Card>
                  )}
                  {result.green_flags.length > 0 && (
                    <Card className="border-green-500/20">
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Green Flags</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-1">{result.green_flags.map((f, i) => <li key={i} className="text-sm text-green-600">✓ {f}</li>)}</ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Categories */}
                <Card>
                  <CardHeader><CardTitle className="text-base">Detailed Category Scores</CardTitle></CardHeader>
                  <CardContent>
                    <Accordion type="multiple" className="w-full">
                      {result.categories.map((cat, i) => (
                        <AccordionItem key={i} value={`cat-${i}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full mr-4">
                              <span className="text-sm font-medium">{cat.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-muted-foreground">Weight: {cat.weight}%</span>
                                <span className={`text-sm font-bold ${scoreColor(cat.score)}`}>{cat.score}/100</span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="space-y-3">
                            <Progress value={cat.score} className="h-2" />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Findings:</p>
                              <ul className="space-y-1">{cat.findings.map((f, j) => <li key={j} className="text-sm">• {f}</li>)}</ul>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">Recommendation:</p>
                              <p className="text-sm">{cat.recommendation}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Verification Checklist */}
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Verification Checklist</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.verification_checklist.map((item, i) => {
                        const Icon = statusIcons[item.status] || XCircle;
                        const color = item.status === "verified" ? "text-green-500" : item.status === "pending" ? "text-yellow-500" : "text-muted-foreground";
                        return (
                          <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${color}`} />
                              <span className="text-sm">{item.item}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">{item.priority}</Badge>
                              <Badge variant="secondary" className="text-xs capitalize">{item.status.replace("_", " ")}</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
