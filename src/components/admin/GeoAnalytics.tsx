import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, TrendingUp, Building, Users, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface CityData {
  city: string;
  province: string;
  listings: number;
  views: number;
  inquiries: number;
  transactions: number;
  growthRate: number;
  avgPrice: string;
}

const cityData: CityData[] = [
  { city: "Jakarta Selatan", province: "DKI Jakarta", listings: 4500, views: 125000, inquiries: 3200, transactions: 180, growthRate: 12, avgPrice: "Rp 5.2B" },
  { city: "Tangerang Selatan", province: "Banten", listings: 3200, views: 89000, inquiries: 2100, transactions: 145, growthRate: 18, avgPrice: "Rp 3.8B" },
  { city: "Badung (Bali)", province: "Bali", listings: 2800, views: 156000, inquiries: 4500, transactions: 220, growthRate: 25, avgPrice: "Rp 8.5B" },
  { city: "Surabaya", province: "Jawa Timur", listings: 2100, views: 62000, inquiries: 1800, transactions: 95, growthRate: 8, avgPrice: "Rp 2.1B" },
  { city: "Bandung", province: "Jawa Barat", listings: 1800, views: 54000, inquiries: 1500, transactions: 82, growthRate: 15, avgPrice: "Rp 1.8B" },
  { city: "Bekasi", province: "Jawa Barat", listings: 1600, views: 48000, inquiries: 1200, transactions: 78, growthRate: 10, avgPrice: "Rp 1.5B" },
  { city: "Depok", province: "Jawa Barat", listings: 1400, views: 42000, inquiries: 1100, transactions: 65, growthRate: 14, avgPrice: "Rp 1.2B" },
  { city: "Semarang", province: "Jawa Tengah", listings: 900, views: 28000, inquiries: 750, transactions: 42, growthRate: 6, avgPrice: "Rp 1.5B" },
  { city: "Yogyakarta", province: "DIY", listings: 750, views: 35000, inquiries: 900, transactions: 38, growthRate: 20, avgPrice: "Rp 1.1B" },
  { city: "Medan", province: "Sumatera Utara", listings: 650, views: 22000, inquiries: 600, transactions: 28, growthRate: 5, avgPrice: "Rp 1.3B" },
];

const provinceData = [
  { name: "DKI Jakarta", value: 35, color: "hsl(var(--primary))" },
  { name: "Bali", value: 20, color: "hsl(var(--chart-2))" },
  { name: "Jawa Barat", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Banten", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Others", value: 15, color: "hsl(var(--muted-foreground))" },
];

const GeoAnalytics = () => {
  const [sortBy, setSortBy] = useState<"listings" | "views" | "inquiries" | "growthRate">("listings");

  const sorted = useMemo(() => [...cityData].sort((a, b) => b[sortBy] - a[sortBy]), [sortBy]);
  const topCities = sorted.slice(0, 6);

  const totalListings = cityData.reduce((s, c) => s + c.listings, 0);
  const totalViews = cityData.reduce((s, c) => s + c.views, 0);
  const totalInquiries = cityData.reduce((s, c) => s + c.inquiries, 0);
  const totalTransactions = cityData.reduce((s, c) => s + c.transactions, 0);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Geo Analytics</h2>
          <p className="text-sm text-muted-foreground">Regional performance across Indonesian cities</p>
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="listings">By Listings</SelectItem>
            <SelectItem value="views">By Views</SelectItem>
            <SelectItem value="inquiries">By Inquiries</SelectItem>
            <SelectItem value="growthRate">By Growth</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Building className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{totalListings.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Listings</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Eye className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{(totalViews / 1000).toFixed(0)}K</p>
          <p className="text-[10px] text-muted-foreground">Total Views</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-foreground">{totalInquiries.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Inquiries</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{totalTransactions}</p>
          <p className="text-[10px] text-muted-foreground">Transactions</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Cities by {sortBy === "growthRate" ? "Growth %" : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topCities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="city" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey={sortBy} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">By Province</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={provinceData} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {provinceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* City Table */}
      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">All Cities</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sorted.map((city, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/30">
                <div className="w-6 text-center">
                  <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                </div>
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{city.city}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{city.province}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                  <span>{city.listings.toLocaleString()} listings</span>
                  <span>{(city.views / 1000).toFixed(0)}K views</span>
                  <span>{city.avgPrice}</span>
                  <Badge variant={city.growthRate >= 15 ? "default" : "secondary"} className="text-[9px]">
                    +{city.growthRate}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeoAnalytics;
