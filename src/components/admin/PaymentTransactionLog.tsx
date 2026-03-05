import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Search, DollarSign, CheckCircle, Clock, AlertTriangle, ArrowUpRight, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface Transaction {
  id: string;
  user: string;
  type: string;
  amount: number;
  method: string;
  status: "success" | "pending" | "failed" | "refunded";
  reference: string;
  createdAt: string;
}

const transactions: Transaction[] = [
  { id: "1", user: "Ahmad Rizki", type: "Subscription", amount: 299000, method: "Credit Card", status: "success", reference: "TXN-20260305-001", createdAt: "2026-03-05 14:30" },
  { id: "2", user: "Sarah Dewi", type: "Featured Listing", amount: 500000, method: "Bank Transfer", status: "success", reference: "TXN-20260305-002", createdAt: "2026-03-05 13:15" },
  { id: "3", user: "Michael Tan", type: "Subscription", amount: 99000, method: "E-Wallet", status: "pending", reference: "TXN-20260305-003", createdAt: "2026-03-05 12:00" },
  { id: "4", user: "Putri Anggraini", type: "Commission Payout", amount: -54000000, method: "Bank Transfer", status: "success", reference: "TXN-20260305-004", createdAt: "2026-03-05 11:00" },
  { id: "5", user: "David Lim", type: "Subscription", amount: 999000, method: "Credit Card", status: "failed", reference: "TXN-20260305-005", createdAt: "2026-03-05 10:30" },
  { id: "6", user: "Rina Sari", type: "Featured Listing", amount: 750000, method: "E-Wallet", status: "success", reference: "TXN-20260305-006", createdAt: "2026-03-05 09:45" },
  { id: "7", user: "Budi Santoso", type: "Refund", amount: -299000, method: "Credit Card", status: "refunded", reference: "TXN-20260304-012", createdAt: "2026-03-04 16:20" },
  { id: "8", user: "Citra Wulandari", type: "Subscription", amount: 299000, method: "Bank Transfer", status: "success", reference: "TXN-20260304-011", createdAt: "2026-03-04 15:00" },
];

const dailyVolume = [
  { day: "Mon", volume: 42, amount: 28 },
  { day: "Tue", volume: 55, amount: 38 },
  { day: "Wed", volume: 48, amount: 32 },
  { day: "Thu", volume: 62, amount: 45 },
  { day: "Fri", volume: 58, amount: 42 },
  { day: "Sat", volume: 25, amount: 18 },
  { day: "Sun", volume: 18, amount: 12 },
];

const successRate = [
  { week: "W1", rate: 94 }, { week: "W2", rate: 96 }, { week: "W3", rate: 93 },
  { week: "W4", rate: 97 }, { week: "W5", rate: 95 }, { week: "W6", rate: 98 },
];

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default", pending: "secondary", failed: "destructive", refunded: "outline"
};

const PaymentTransactionLog = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = transactions.filter(t => {
    const matchSearch = !search || t.user.toLowerCase().includes(search.toLowerCase()) || t.reference.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = transactions.filter(t => t.amount > 0 && t.status === "success").reduce((s, t) => s + t.amount, 0);
  const successCount = transactions.filter(t => t.status === "success").length;

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Payment Transactions</h2>
        <p className="text-sm text-muted-foreground">Transaction log, payment methods, and success rates</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {(totalRevenue / 1e6).toFixed(1)}M</p>
          <p className="text-[10px] text-muted-foreground">Revenue Today</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CreditCard className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-foreground">{transactions.length}</p>
          <p className="text-[10px] text-muted-foreground">Transactions</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{Math.round((successCount / transactions.length) * 100)}%</p>
          <p className="text-[10px] text-muted-foreground">Success Rate</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{transactions.filter(t => t.status === "failed").length}</p>
          <p className="text-[10px] text-muted-foreground">Failed</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Daily Volume</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Success Rate Trend (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={successRate}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))" }} name="Success %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search user or reference..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map(t => (
          <Card key={t.id} className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <CreditCard className={`h-4 w-4 shrink-0 ${t.amount > 0 ? "text-chart-2" : "text-destructive"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{t.user}</span>
                    <Badge variant={statusBadge[t.status]} className="text-[9px]">{t.status}</Badge>
                    <Badge variant="outline" className="text-[9px]">{t.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                    <span>{t.method}</span>
                    <code className="text-[9px]">{t.reference}</code>
                    <span>{t.createdAt}</span>
                  </div>
                </div>
                <span className={`text-sm font-bold shrink-0 ${t.amount > 0 ? "text-chart-2" : "text-destructive"}`}>
                  {t.amount > 0 ? "+" : ""}Rp {Math.abs(t.amount).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentTransactionLog;
