import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, MapPin, DollarSign, Home, BarChart3, ArrowUpRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from "recharts";

const priceIndex = [
  { month: "Sep", jakarta: 42, bali: 38, surabaya: 28, bandung: 22 },
  { month: "Oct", jakarta: 43, bali: 39, surabaya: 28, bandung: 23 },
  { month: "Nov", jakarta: 44, bali: 41, surabaya: 29, bandung: 23 },
  { month: "Dec", jakarta: 43, bali: 42, surabaya: 29, bandung: 24 },
  { month: "Jan", jakarta: 45, bali: 44, surabaya: 30, bandung: 24 },
  { month: "Feb", jakarta: 46, bali: 45, surabaya: 31, bandung: 25 },
  { month: "Mar", jakarta: 47, bali: 46, surabaya: 31, bandung: 25 },
];

const supplyDemand = [
  { month: "Oct", listings: 4200, inquiries: 12500 },
  { month: "Nov", listings: 4500, inquiries: 13200 },
  { month: "Dec", listings: 4100, inquiries: 11800 },
  { month: "Jan", listings: 4800, inquiries: 14500 },
  { month: "Feb", listings: 5100, inquiries: 15800 },
  { month: "Mar", listings: 5400, inquiries: 16200 },
];

const propertyTypes = [
  { type: "Apartment", avgPrice: 3.2, growth: 8.5, demand: "High", listings: 2800 },
  { type: "House", avgPrice: 5.8, growth: 5.2, demand: "Medium", listings: 1500 },
  { type: "Villa", avgPrice: 8.5, growth: 12.1, demand: "Very High", listings: 650 },
  { type: "Commercial", avgPrice: 12.0, growth: 3.8, demand: "Low", listings: 420 },
  { type: "Land", avgPrice: 2.1, growth: 15.5, demand: "High", listings: 380 },
];

const hotAreas = [
  { area: "Menteng, Central Jakarta", growth: 18.2, avgPrice: 65, trend: "up" },
  { area: "Canggu, Bali", growth: 22.5, avgPrice: 48, trend: "up" },
  { area: "BSD City, Tangerang", growth: 14.8, avgPrice: 28, trend: "up" },
  { area: "Kemang, South Jakarta", growth: -2.1, avgPrice: 52, trend: "down" },
  { area: "Ubud, Bali", growth: 16.5, avgPrice: 35, trend: "up" },
  { area: "PIK 2, North Jakarta", growth: 25.0, avgPrice: 32, trend: "up" },
];

const MarketTrendsDashboard = () => {
  const [region, setRegion] = useState("all");

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Market Trends</h2>
          <p className="text-sm text-muted-foreground">Real estate market intelligence and price movements</p>
        </div>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="jakarta">Jakarta</SelectItem>
            <SelectItem value="bali">Bali</SelectItem>
            <SelectItem value="surabaya">Surabaya</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp 47M</p>
          <p className="text-[10px] text-muted-foreground">Avg Price/sqm (JKT)</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <ArrowUpRight className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">+8.5%</p>
          <p className="text-[10px] text-muted-foreground">YoY Growth</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Home className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">5,400</p>
          <p className="text-[10px] text-muted-foreground">Active Listings</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <BarChart3 className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">3.0x</p>
          <p className="text-[10px] text-muted-foreground">Demand/Supply Ratio</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Price Index by Region (Rp M/sqm)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={priceIndex}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="jakarta" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Jakarta" />
                <Line type="monotone" dataKey="bali" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} name="Bali" />
                <Line type="monotone" dataKey="surabaya" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} name="Surabaya" />
                <Line type="monotone" dataKey="bandung" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} name="Bandung" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Supply vs Demand</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={supplyDemand}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="inquiries" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Inquiries" />
                <Area type="monotone" dataKey="listings" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} name="Listings" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Property Type Performance</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {propertyTypes.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <Home className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground flex-1">{t.type}</span>
                <span className="text-xs text-muted-foreground">Rp {t.avgPrice}B avg</span>
                <Badge variant={t.growth > 10 ? "default" : "secondary"} className="text-[9px]">
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5" />+{t.growth}%
                </Badge>
                <Badge variant="outline" className="text-[9px]">{t.demand}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Hot Areas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {hotAreas.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <MapPin className={`h-3.5 w-3.5 shrink-0 ${a.trend === "up" ? "text-chart-2" : "text-destructive"}`} />
                <span className="text-xs font-medium text-foreground flex-1">{a.area}</span>
                <span className="text-[10px] text-muted-foreground">Rp {a.avgPrice}M/sqm</span>
                <span className={`text-xs font-semibold ${a.growth > 0 ? "text-chart-2" : "text-destructive"}`}>
                  {a.growth > 0 ? "+" : ""}{a.growth}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketTrendsDashboard;
