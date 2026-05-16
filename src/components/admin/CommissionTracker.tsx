import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Users, Calendar, CheckCircle, Clock, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface Commission {
  id: string;
  agent: string;
  property: string;
  salePrice: number;
  commissionRate: number;
  commissionAmount: number;
  status: "paid" | "pending" | "processing";
  closedDate: string;
  paidDate: string | null;
}

const commissions: Commission[] = [
  { id: "1", agent: "Ahmad Rizki", property: "The Grove Suites A-1204", salePrice: 3500000000, commissionRate: 2.5, commissionAmount: 87500000, status: "paid", closedDate: "2026-02-28", paidDate: "2026-03-05" },
  { id: "2", agent: "Sarah Dewi", property: "Pacific Place B-805", salePrice: 5200000000, commissionRate: 2.0, commissionAmount: 104000000, status: "paid", closedDate: "2026-02-20", paidDate: "2026-03-01" },
  { id: "3", agent: "Michael Tan", property: "Sudirman Hill C-302", salePrice: 1800000000, commissionRate: 3.0, commissionAmount: 54000000, status: "pending", closedDate: "2026-03-02", paidDate: null },
  { id: "4", agent: "Putri Anggraini", property: "Kemang Village D-1501", salePrice: 4200000000, commissionRate: 2.5, commissionAmount: 105000000, status: "processing", closedDate: "2026-03-04", paidDate: null },
  { id: "5", agent: "David Lim", property: "Menteng Park E-607", salePrice: 2800000000, commissionRate: 2.5, commissionAmount: 70000000, status: "pending", closedDate: "2026-03-05", paidDate: null },
  { id: "6", agent: "Rina Sari", property: "Ciputra World F-2301", salePrice: 6800000000, commissionRate: 2.0, commissionAmount: 136000000, status: "paid", closedDate: "2026-02-15", paidDate: "2026-02-25" },
];

const monthlyTrend = [
  { month: "Oct", total: 280, paid: 250 },
  { month: "Nov", total: 320, paid: 300 },
  { month: "Dec", total: 195, paid: 195 },
  { month: "Jan", total: 410, paid: 380 },
  { month: "Feb", total: 328, paid: 310 },
  { month: "Mar", total: 556, paid: 192 },
];

const statusDist = [
  { name: "Paid", value: commissions.filter(c => c.status === "paid").length, color: "hsl(var(--chart-2))" },
  { name: "Processing", value: commissions.filter(c => c.status === "processing").length, color: "hsl(var(--chart-3))" },
  { name: "Pending", value: commissions.filter(c => c.status === "pending").length, color: "hsl(var(--primary))" },
];

const statusBadge: Record<string, "default" | "secondary" | "outline"> = {
  paid: "default", processing: "secondary", pending: "outline"
};

const CommissionTracker = () => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? commissions : commissions.filter(c => c.status === filter);
  const totalCommission = commissions.reduce((s, c) => s + c.commissionAmount, 0);
  const paidTotal = commissions.filter(c => c.status === "paid").reduce((s, c) => s + c.commissionAmount, 0);
  const pendingTotal = totalCommission - paidTotal;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Commission Tracker</h2>
          <p className="text-sm text-muted-foreground">Agent commissions, payouts, and revenue splits</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {(totalCommission / 1e6).toFixed(0)}M</p>
          <p className="text-[10px] text-muted-foreground">Total Commissions</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">Rp {(paidTotal / 1e6).toFixed(0)}M</p>
          <p className="text-[10px] text-muted-foreground">Paid Out</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-chart-3">Rp {(pendingTotal / 1e6).toFixed(0)}M</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{new Set(commissions.map(c => c.agent)).size}</p>
          <p className="text-[10px] text-muted-foreground">Agents Earning</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Commission Trend (Rp M)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Total" />
                <Area type="monotone" dataKey="paid" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.2} name="Paid" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Status Breakdown</CardTitle></CardHeader>
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

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Commissions ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0"><DollarSign className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{c.agent}</span>
                  <Badge variant={statusBadge[c.status]} className="text-[9px]">{c.status}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{c.property}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>Sale: Rp {(c.salePrice / 1e9).toFixed(1)}B</span>
                  <span>{c.commissionRate}% rate</span>
                  <span className="text-chart-2 font-medium">Rp {(c.commissionAmount / 1e6).toFixed(0)}M</span>
                  <span><Calendar className="h-2.5 w-2.5 inline mr-0.5" />{c.closedDate}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionTracker;
