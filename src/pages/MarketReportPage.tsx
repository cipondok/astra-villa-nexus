import React, { useState, useRef } from "react";
import { useMarketReport, type MarketReportData } from "@/hooks/useMarketReport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText, Download, Loader2, TrendingUp, Building2,
  DollarSign, BarChart3, AlertTriangle, Lightbulb, MapPin, Calendar,
} from "lucide-react";
import { toast } from "sonner";

const CITIES = [
  "Denpasar", "Ubud", "Canggu", "Seminyak", "Kuta",
  "Jakarta", "Surabaya", "Bandung", "Yogyakarta", "Makassar",
  "Lombok", "Medan", "Tangerang", "Bekasi", "Bogor",
];

function formatIDR(n: number) {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)}M`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export default function MarketReportPage() {
  const [city, setCity] = useState("");
  const { mutate, data, isPending } = useMarketReport();
  const reportRef = useRef<HTMLDivElement>(null);

  const generate = () => {
    if (!city) return toast.error("Please select a city");
    mutate(city, {
      onError: (err: any) => {
        const msg = err?.message || "Failed to generate report";
        toast.error(msg);
      },
    });
  };

  const downloadPDF = async () => {
    if (!reportRef.current || !data) return;
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `Market-Report-${data.market_data.city}-${data.market_data.report_date}.pdf`,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(reportRef.current)
        .save();
      toast.success("PDF downloaded!");
    } catch {
      toast.error("PDF generation failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">AI Market Report Generator</h1>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Generate comprehensive AI-powered market analysis reports with price trends, investment ratings, and forecasts for any Indonesian city.
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">Select City</label>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a city..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={generate} disabled={isPending || !city} size="lg">
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
                ) : (
                  <><BarChart3 className="h-4 w-4 mr-2" /> Generate Report</>
                )}
              </Button>
              {data && (
                <Button variant="outline" onClick={downloadPDF} size="lg">
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        {data && <ReportView data={data} reportRef={reportRef} />}
      </div>
    </div>
  );
}

function ReportView({ data, reportRef }: { data: MarketReportData; reportRef: React.RefObject<HTMLDivElement> }) {
  const { market_data: md, narrative: n } = data;

  return (
    <div ref={reportRef} className="space-y-6">
      {/* Title Bar */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">{md.city} Market Report</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{md.report_date}</span>
                <Badge variant="secondary">AI Generated</Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <StatBadge label="Listings" value={String(md.total_listings)} />
              <StatBadge label="Inv. Score" value={`${md.avg_investment_score}/100`} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" /> Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{n.executive_summary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={DollarSign} label="Avg Price" value={formatIDR(md.price_stats.avg)} />
        <MetricCard icon={DollarSign} label="Median Price" value={formatIDR(md.price_stats.median)} />
        <MetricCard icon={Building2} label="Price/sqm" value={formatIDR(md.avg_price_per_sqm)} />
        <MetricCard icon={TrendingUp} label="New (30d)" value={`+${md.new_listings_30d}`} />
      </div>

      {/* Price Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Price Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Range:</span>
            <span className="text-foreground font-medium">{formatIDR(md.price_stats.min)} — {formatIDR(md.price_stats.max)}</span>
          </div>
          <Separator />
          <p className="text-foreground leading-relaxed">{n.price_analysis}</p>
        </CardContent>
      </Card>

      {/* Market Overview + Type Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Market Overview</CardTitle></CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">{n.market_overview}</p>
            <Separator className="my-4" />
            <p className="text-foreground leading-relaxed">{n.demand_indicators}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Property Types</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(md.type_distribution).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="capitalize text-foreground">{type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min(100, (count / md.total_listings) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
            <Separator className="my-3" />
            <div className="flex gap-4 text-sm">
              <span className="text-muted-foreground">Sale: <strong className="text-foreground">{md.listing_type_split.sale}</strong></span>
              <span className="text-muted-foreground">Rent: <strong className="text-foreground">{md.listing_type_split.rent}</strong></span>
            </div>
            <Separator className="my-3" />
            <p className="text-foreground text-sm leading-relaxed">{n.property_type_analysis}</p>
          </CardContent>
        </Card>
      </div>

      {/* Investment Outlook */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Investment Outlook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{n.investment_outlook}</p>
        </CardContent>
      </Card>

      {/* Recommendations + Risks */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-chart-1" /> Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(n.recommendations || []).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground">
                  <span className="text-primary font-bold mt-0.5">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(n.risk_factors || []).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground">
                  <span className="text-destructive font-bold mt-0.5">⚠</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> 6-12 Month Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{n.forecast}</p>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground pb-4">
        This report was generated by ASTRA Villa AI on {md.report_date}. Data is based on published listings and should not be considered financial advice.
      </p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 text-center">
        <Icon className="h-5 w-5 text-primary mx-auto mb-1" />
        <div className="text-lg font-bold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center px-3 py-1 bg-background rounded-lg border">
      <div className="text-sm font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
