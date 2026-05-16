import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, RefreshCw, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const rates = [
  { currency: "USD/IDR", rate: "15,842", change: "+0.32%", trend: "up", flag: "🇺🇸" },
  { currency: "SGD/IDR", rate: "11,890", change: "-0.15%", trend: "down", flag: "🇸🇬" },
  { currency: "AUD/IDR", rate: "10,320", change: "+0.48%", trend: "up", flag: "🇦🇺" },
  { currency: "EUR/IDR", rate: "17,245", change: "+0.21%", trend: "up", flag: "🇪🇺" },
  { currency: "GBP/IDR", rate: "20,115", change: "-0.08%", trend: "down", flag: "🇬🇧" },
  { currency: "JPY/IDR", rate: "105.8", change: "+0.55%", trend: "up", flag: "🇯🇵" },
  { currency: "CNY/IDR", rate: "2,185", change: "-0.12%", trend: "down", flag: "🇨🇳" },
  { currency: "MYR/IDR", rate: "3,412", change: "+0.09%", trend: "up", flag: "🇲🇾" },
];

const usdHistory = [
  { date: "Jan", rate: 15620 },
  { date: "Feb", rate: 15780 },
  { date: "Mar", rate: 15690 },
  { date: "Apr", rate: 15820 },
  { date: "May", rate: 15750 },
  { date: "Jun", rate: 15842 },
];

const transactionVolume = [
  { month: "Jan", usd: 2400, sgd: 1200, aud: 800, eur: 600 },
  { month: "Feb", usd: 2800, sgd: 1400, aud: 900, eur: 700 },
  { month: "Mar", usd: 3200, sgd: 1600, aud: 1100, eur: 850 },
  { month: "Apr", usd: 2900, sgd: 1350, aud: 950, eur: 720 },
  { month: "May", usd: 3500, sgd: 1800, aud: 1200, eur: 900 },
  { month: "Jun", usd: 3800, sgd: 1950, aud: 1350, eur: 1050 },
];

const CurrencyExchangeMonitor = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Currency Exchange Monitor</h2>
          <p className="text-muted-foreground text-sm">Live FX rates, conversion tracking, and foreign buyer transaction volumes</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh Rates
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {rates.map((r) => (
          <Card key={r.currency} className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{r.flag}</span>
                <span className="text-xs font-medium text-muted-foreground">{r.currency}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{r.rate}</p>
              <div className="flex items-center gap-1">
                {r.trend === "up" ? (
                  <ArrowUp className="h-3 w-3 text-chart-2" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs font-medium ${r.trend === "up" ? "text-chart-2" : "text-destructive"}`}>
                  {r.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">USD/IDR 6-Month Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={usdHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Area type="monotone" dataKey="rate" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transaction Volume by Currency (M IDR)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={transactionVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Line type="monotone" dataKey="usd" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sgd" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="aud" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="eur" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-3">
              {[
                { label: "USD", color: "bg-chart-1" },
                { label: "SGD", color: "bg-chart-2" },
                { label: "AUD", color: "bg-chart-3" },
                { label: "EUR", color: "bg-chart-4" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${l.color}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Foreign Buyer Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Foreign Transactions (MTD)", value: "Rp 47.2B", sub: "+22% vs last month" },
              { label: "Most Used Currency", value: "USD", sub: "42% of FX transactions" },
              { label: "Avg Transaction Size", value: "Rp 3.8B", sub: "Foreign buyers" },
              { label: "FX Spread Revenue", value: "Rp 128M", sub: "0.27% avg spread" },
            ].map((s) => (
              <div key={s.label} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-lg font-bold text-foreground">{s.value}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{s.label}</p>
                <p className="text-[10px] text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyExchangeMonitor;
