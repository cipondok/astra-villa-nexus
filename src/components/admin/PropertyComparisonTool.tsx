import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, Building, TrendingUp, TrendingDown, MapPin, Ruler, DollarSign, Bed } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

interface CompProperty {
  id: string;
  name: string;
  location: string;
  price: number;
  pricePerSqm: number;
  size: number;
  bedrooms: number;
  type: string;
  yearBuilt: number;
  investmentScore: number;
  demandScore: number;
  listingHealth: number;
  daysOnMarket: number;
}

const properties: CompProperty[] = [
  { id: "1", name: "The Grove Suites", location: "Kuningan, South Jakarta", price: 3500000000, pricePerSqm: 45000000, size: 78, bedrooms: 2, type: "Apartment", yearBuilt: 2022, investmentScore: 82, demandScore: 88, listingHealth: 92, daysOnMarket: 15 },
  { id: "2", name: "Pacific Place Residence", location: "SCBD, South Jakarta", price: 5200000000, pricePerSqm: 52000000, size: 100, bedrooms: 3, type: "Apartment", yearBuilt: 2020, investmentScore: 78, demandScore: 75, listingHealth: 85, daysOnMarket: 28 },
  { id: "3", name: "Sudirman Hill", location: "Sudirman, Central Jakarta", price: 1800000000, pricePerSqm: 36000000, size: 50, bedrooms: 1, type: "Studio+", yearBuilt: 2024, investmentScore: 90, demandScore: 92, listingHealth: 95, daysOnMarket: 8 },
  { id: "4", name: "Kemang Village", location: "Kemang, South Jakarta", price: 4200000000, pricePerSqm: 42000000, size: 100, bedrooms: 3, type: "Apartment", yearBuilt: 2018, investmentScore: 72, demandScore: 68, listingHealth: 78, daysOnMarket: 42 },
];

const PropertyComparisonTool = () => {
  const [selected, setSelected] = useState<string[]>(["1", "3"]);

  const compared = properties.filter(p => selected.includes(p.id));
  const radarData = compared.length >= 2 ? [
    { metric: "Investment", A: compared[0]?.investmentScore || 0, B: compared[1]?.investmentScore || 0 },
    { metric: "Demand", A: compared[0]?.demandScore || 0, B: compared[1]?.demandScore || 0 },
    { metric: "Health", A: compared[0]?.listingHealth || 0, B: compared[1]?.listingHealth || 0 },
    { metric: "Value/sqm", A: Math.min(100, (compared[0]?.pricePerSqm || 0) / 600000), B: Math.min(100, (compared[1]?.pricePerSqm || 0) / 600000) },
    { metric: "Size", A: Math.min(100, (compared[0]?.size || 0)), B: Math.min(100, (compared[1]?.size || 0)) },
  ] : [];

  const priceData = compared.map(p => ({ name: p.name.split(" ").slice(0, 2).join(" "), price: p.price / 1e9, perSqm: p.pricePerSqm / 1e6 }));

  const toggleProperty = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Property Comparison Tool</h2>
        <p className="text-sm text-muted-foreground">Side-by-side property analysis for admin review</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {properties.map(p => (
          <Button key={p.id} size="sm" variant={selected.includes(p.id) ? "default" : "outline"} className="text-xs" onClick={() => toggleProperty(p.id)}>
            <Building className="h-3 w-3 mr-1" />{p.name}
          </Button>
        ))}
      </div>

      {compared.length >= 2 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/40">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Score Comparison</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <PolarRadiusAxis tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                    <Radar name={compared[0]?.name || ""} dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                    <Radar name={compared[1]?.name || ""} dataKey="B" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.25} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Price Comparison</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="price" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Price (Rp B)" />
                    <Bar dataKey="perSqm" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Per sqm (Rp M)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/40">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Detail Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left p-2 text-muted-foreground font-medium">Metric</th>
                      {compared.map(p => <th key={p.id} className="text-right p-2 text-foreground font-medium">{p.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Price", render: (p: CompProperty) => `Rp ${(p.price / 1e9).toFixed(1)}B` },
                      { label: "Price/sqm", render: (p: CompProperty) => `Rp ${(p.pricePerSqm / 1e6).toFixed(0)}M` },
                      { label: "Size", render: (p: CompProperty) => `${p.size} sqm` },
                      { label: "Bedrooms", render: (p: CompProperty) => `${p.bedrooms}` },
                      { label: "Type", render: (p: CompProperty) => p.type },
                      { label: "Year Built", render: (p: CompProperty) => `${p.yearBuilt}` },
                      { label: "Location", render: (p: CompProperty) => p.location },
                      { label: "Investment Score", render: (p: CompProperty) => `${p.investmentScore}/100` },
                      { label: "Demand Score", render: (p: CompProperty) => `${p.demandScore}/100` },
                      { label: "Listing Health", render: (p: CompProperty) => `${p.listingHealth}/100` },
                      { label: "Days on Market", render: (p: CompProperty) => `${p.daysOnMarket}d` },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-border/20">
                        <td className="p-2 text-muted-foreground">{row.label}</td>
                        {compared.map(p => <td key={p.id} className="p-2 text-right text-foreground font-medium">{row.render(p)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {compared.length < 2 && (
        <Card className="border-border/40"><CardContent className="p-8 text-center text-muted-foreground">
          <ArrowLeftRight className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select at least 2 properties to compare</p>
        </CardContent></Card>
      )}
    </div>
  );
};

export default PropertyComparisonTool;
