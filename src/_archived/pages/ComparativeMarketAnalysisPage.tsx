import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useComparativeMarketAnalysis, type CMAInput, type CMAResult } from "@/hooks/useComparativeMarketAnalysis";
import { toast } from "sonner";
import {
  BarChart3, Loader2, TrendingUp, TrendingDown, Minus, DollarSign, Home,
  Target, Shield, Zap, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Building, MapPin, Calendar
} from "lucide-react";

const formatIDR = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const positioningColors: Record<string, string> = {
  significantly_underpriced: "bg-green-600 text-white",
  underpriced: "bg-green-500/20 text-green-700",
  fair_value: "bg-blue-500/20 text-blue-700",
  overpriced: "bg-orange-500/20 text-orange-700",
  significantly_overpriced: "bg-red-500/20 text-red-700",
};

const positioningLabels: Record<string, string> = {
  significantly_underpriced: "Significantly Underpriced",
  underpriced: "Underpriced",
  fair_value: "Fair Value",
  overpriced: "Overpriced",
  significantly_overpriced: "Significantly Overpriced",
};

const trendIcons: Record<string, typeof TrendingUp> = {
  declining: TrendingDown,
  stable: Minus,
  growing: TrendingUp,
  booming: TrendingUp,
};

const gradeColors: Record<string, string> = {
  A: "bg-green-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-yellow-500 text-black",
  D: "bg-red-500 text-white",
};

export default function ComparativeMarketAnalysisPage() {
  const cma = useComparativeMarketAnalysis();
  const [result, setResult] = useState<CMAResult | null>(null);
  const [form, setForm] = useState<CMAInput>({
    property_title: "",
    city: "",
    district: "",
    property_type: "house",
    listing_price: 0,
    land_area_sqm: undefined,
    building_area_sqm: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    year_built: undefined,
    condition: "good",
    legal_status: "SHM",
  });

  const update = (field: keyof CMAInput, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.city || !form.property_type || !form.listing_price) {
      toast.error("Please fill in city, property type, and listing price");
      return;
    }
    try {
      const res = await cma.mutateAsync(form);
      setResult(res);
      toast.success("CMA report generated");
    } catch (err: any) {
      toast.error(err?.message || "Analysis failed");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Comparative Market Analysis</h1>
            <p className="text-muted-foreground">Benchmark your property against the market with AI-powered insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form - 1 col */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Home className="h-4 w-4" /> Subject Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Property Title</Label>
                  <Input value={form.property_title} onChange={(e) => update("property_title", e.target.value)} placeholder="e.g. Modern Villa Canggu" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">City *</Label>
                    <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Bali" />
                  </div>
                  <div>
                    <Label className="text-xs">District</Label>
                    <Input value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="Canggu" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Property Type *</Label>
                    <Select value={form.property_type} onValueChange={(v) => update("property_type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Legal Status</Label>
                    <Select value={form.legal_status || "SHM"} onValueChange={(v) => update("legal_status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SHM">SHM</SelectItem>
                        <SelectItem value="HGB">HGB</SelectItem>
                        <SelectItem value="Leasehold">Leasehold</SelectItem>
                        <SelectItem value="Strata">Strata</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Listing Price (IDR) *</Label>
                  <Input type="number" value={form.listing_price || ""} onChange={(e) => update("listing_price", +e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Land Area (m²)</Label>
                    <Input type="number" value={form.land_area_sqm || ""} onChange={(e) => update("land_area_sqm", +e.target.value || undefined)} />
                  </div>
                  <div>
                    <Label className="text-xs">Building Area (m²)</Label>
                    <Input type="number" value={form.building_area_sqm || ""} onChange={(e) => update("building_area_sqm", +e.target.value || undefined)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Beds</Label>
                    <Input type="number" value={form.bedrooms || ""} onChange={(e) => update("bedrooms", +e.target.value || undefined)} />
                  </div>
                  <div>
                    <Label className="text-xs">Baths</Label>
                    <Input type="number" value={form.bathrooms || ""} onChange={(e) => update("bathrooms", +e.target.value || undefined)} />
                  </div>
                  <div>
                    <Label className="text-xs">Year Built</Label>
                    <Input type="number" value={form.year_built || ""} onChange={(e) => update("year_built", +e.target.value || undefined)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Condition</Label>
                  <Select value={form.condition || "good"} onValueChange={(v) => update("condition", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="needs_renovation">Needs Renovation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            <Button type="submit" className="w-full" disabled={cma.isPending}>
              {cma.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Market...</> : <><BarChart3 className="mr-2 h-4 w-4" /> Generate CMA Report</>}
            </Button>
          </form>

          {/* Results - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {!result && !cma.isPending && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">No CMA report yet</p>
                  <p className="text-sm">Fill in the property details and generate a report</p>
                </CardContent>
              </Card>
            )}

            {cma.isPending && (
              <Card><CardContent className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="font-medium text-foreground">Analyzing market data...</p>
                <p className="text-sm text-muted-foreground">Comparing against {form.city} listings</p>
              </CardContent></Card>
            )}

            {result && (
              <>
                {/* Valuation Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Estimated Market Value</p>
                      <p className="text-2xl font-bold text-primary">{formatIDR(result.estimated_market_value)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Range: {formatIDR(result.value_range.low)} – {formatIDR(result.value_range.high)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Price Positioning</p>
                      <Badge className={`text-sm ${positioningColors[result.price_positioning] || ""}`}>
                        {positioningLabels[result.price_positioning] || result.price_positioning}
                      </Badge>
                      <p className={`text-lg font-bold mt-2 ${result.price_deviation_percent > 0 ? "text-red-500" : "text-green-500"}`}>
                        {result.price_deviation_percent > 0 ? "+" : ""}{result.price_deviation_percent?.toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Investment Grade</p>
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${gradeColors[result.investment_outlook.investment_grade] || "bg-muted"}`}>
                        {result.investment_outlook.investment_grade}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{result.total_comparables_found} comparables analyzed</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Executive Summary */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Executive Summary</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{result.executive_summary}</p></CardContent>
                </Card>

                {/* Pricing Recommendations */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Pricing Strategy</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                        <p className="text-xs text-muted-foreground">Quick Sale</p>
                        <p className="text-lg font-bold text-green-600">{formatIDR(result.pricing_recommendations.quick_sale_price)}</p>
                        <Zap className="h-4 w-4 text-green-500 mx-auto mt-1" />
                      </div>
                      <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <p className="text-xs text-muted-foreground">Optimal Price</p>
                        <p className="text-lg font-bold text-primary">{formatIDR(result.pricing_recommendations.optimal_listing_price)}</p>
                        <Target className="h-4 w-4 text-primary mx-auto mt-1" />
                      </div>
                      <div className="text-center p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                        <p className="text-xs text-muted-foreground">Premium</p>
                        <p className="text-lg font-bold text-purple-600">{formatIDR(result.pricing_recommendations.premium_price)}</p>
                        <ArrowUpRight className="h-4 w-4 text-purple-500 mx-auto mt-1" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.pricing_recommendations.reasoning}</p>
                  </CardContent>
                </Card>

                {/* Market Conditions */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Market Conditions</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Demand", value: result.market_conditions.demand_level },
                        { label: "Supply", value: result.market_conditions.supply_level },
                        { label: "Trend", value: result.market_conditions.market_trend },
                        { label: "Avg. Days on Market", value: `${result.market_conditions.avg_days_on_market}d` },
                      ].map((item, i) => (
                        <div key={i} className="text-center">
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-semibold capitalize">{String(item.value).replace(/_/g, " ")}</p>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Predicted Days to Sell</span>
                      <Badge variant="outline">{result.market_conditions.predicted_days_to_sell} days</Badge>
                    </div>
                    {result.market_conditions.absorption_rate && (
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Absorption Rate</span>
                        <Badge variant="outline">{result.market_conditions.absorption_rate}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* SWOT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: "Strengths", items: result.strengths, icon: CheckCircle2, color: "text-green-500" },
                    { title: "Weaknesses", items: result.weaknesses, icon: AlertTriangle, color: "text-orange-500" },
                    { title: "Opportunities", items: result.opportunities, icon: ArrowUpRight, color: "text-blue-500" },
                    { title: "Threats", items: result.threats, icon: ArrowDownRight, color: "text-red-500" },
                  ].map(({ title, items, icon: Icon, color }) => (
                    <Card key={title}>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Icon className={`h-4 w-4 ${color}`} /> {title}</CardTitle></CardHeader>
                      <CardContent>
                        <ul className="space-y-1">{items.map((item, i) => <li key={i} className="text-sm">• {item}</li>)}</ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Investment Outlook */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" /> Investment Outlook</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Annual Appreciation</p>
                        <p className="text-lg font-bold text-primary">{result.investment_outlook.annual_appreciation_estimate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Rental Yield</p>
                        <p className="text-lg font-bold text-primary">{result.investment_outlook.rental_yield_estimate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">5-Year Projection</p>
                        <p className="text-lg font-bold text-primary">{formatIDR(result.investment_outlook.five_year_projection)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{result.investment_outlook.recommendation}</p>
                  </CardContent>
                </Card>

                {/* Comparables */}
                {result.comparables_summary.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Building className="h-4 w-4" /> Comparable Properties</CardTitle></CardHeader>
                    <CardContent>
                      <Accordion type="multiple">
                        {result.comparables_summary.map((comp, i) => (
                          <AccordionItem key={i} value={`comp-${i}`}>
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex items-center justify-between w-full mr-4">
                                <span className="text-sm font-medium truncate max-w-[200px]">{comp.title}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-semibold">{formatIDR(comp.price)}</span>
                                  <Badge variant={comp.advantage === "subject" ? "default" : comp.advantage === "comparable" ? "secondary" : "outline"} className="text-xs">
                                    {comp.similarity_score}% match
                                  </Badge>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              {comp.price_per_sqm && <p className="text-xs text-muted-foreground mb-2">{formatIDR(comp.price_per_sqm)}/m²</p>}
                              <p className="text-xs font-medium text-muted-foreground mb-1">Key Differences:</p>
                              <ul className="space-y-1">{comp.key_differences.map((d, j) => <li key={j} className="text-sm">• {d}</li>)}</ul>
                              <Badge variant="outline" className="mt-2 text-xs capitalize">Advantage: {comp.advantage === "subject" ? "Your Property" : comp.advantage}</Badge>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
