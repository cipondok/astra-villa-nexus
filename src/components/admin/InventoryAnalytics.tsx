import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, TrendingUp, Clock, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const inventoryByType = [
  { type: "Apartment", available: 124, reserved: 38, sold: 86, total: 248 },
  { type: "House", available: 89, reserved: 22, sold: 64, total: 175 },
  { type: "Villa", available: 34, reserved: 12, sold: 28, total: 74 },
  { type: "Land", available: 56, reserved: 8, sold: 18, total: 82 },
  { type: "Commercial", available: 28, reserved: 6, sold: 14, total: 48 },
];

const turnoverTrend = [
  { month: "Oct", listed: 45, sold: 28, days: 42 },
  { month: "Nov", listed: 52, sold: 34, days: 38 },
  { month: "Dec", listed: 38, sold: 22, days: 48 },
  { month: "Jan", listed: 61, sold: 42, days: 35 },
  { month: "Feb", listed: 58, sold: 38, days: 32 },
  { month: "Mar", listed: 72, sold: 48, days: 29 },
];

const statusDist = [
  { name: "Available", value: 331, color: "hsl(var(--chart-2))" },
  { name: "Reserved", value: 86, color: "hsl(var(--primary))" },
  { name: "Sold", value: 210, color: "hsl(var(--chart-3))" },
  { name: "Off-Market", value: 42, color: "hsl(var(--chart-4))" },
];

const staleListings = [
  { title: "Luxury Penthouse BSD", days: 120, price: "Rp 8.5B", views: 45 },
  { title: "3BR Apartment Kelapa Gading", days: 98, price: "Rp 2.1B", views: 112 },
  { title: "Commercial Space Sudirman", days: 87, price: "Rp 15B", views: 28 },
  { title: "Land Plot Serpong", days: 76, price: "Rp 3.2B", views: 34 },
];

const InventoryAnalytics = () => {
  const totalProperties = statusDist.reduce((s, d) => s + d.value, 0);
  const avgDaysOnMarket = Math.round(turnoverTrend.reduce((s, t) => s + t.days, 0) / turnoverTrend.length);
  const totalSold = turnoverTrend.reduce((s, t) => s + t.sold, 0);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Inventory Analytics</h2>
        <p className="text-sm text-muted-foreground">Property stock levels, turnover rates, and availability tracking</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Package className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{totalProperties}</p>
          <p className="text-[10px] text-muted-foreground">Total Inventory</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">331</p>
          <p className="text-[10px] text-muted-foreground">Available Now</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{avgDaysOnMarket}d</p>
          <p className="text-[10px] text-muted-foreground">Avg Days on Market</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-chart-3">{totalSold}</p>
          <p className="text-[10px] text-muted-foreground">Sold (6mo)</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Inventory Turnover Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={turnoverTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="listed" fill="hsl(var(--primary))" name="New Listings" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sold" fill="hsl(var(--chart-2))" name="Sold" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Status Distribution</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${name}: ${value}`}>
                  {statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Inventory by Property Type</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {inventoryByType.map((item) => (
              <div key={item.type} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.type}</span>
                  <span className="text-muted-foreground">{item.available}/{item.total} available</span>
                </div>
                <Progress value={(item.available / item.total) * 100} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-chart-4" /> Stale Listings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {staleListings.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                  <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span>{item.price}</span>
                    <span>{item.views} views</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] text-chart-4 shrink-0">{item.days}d</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryAnalytics;
