import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Calendar, AlertTriangle, CheckCircle, Clock, Users, DollarSign, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

interface Lease {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: "active" | "expiring" | "expired" | "renewed";
  paymentStatus: "current" | "late" | "overdue";
  daysRemaining: number;
}

const leases: Lease[] = [
  { id: "1", tenant: "Ahmad Rizki", property: "The Grove Suites", unit: "A-1204", startDate: "2025-06-01", endDate: "2026-06-01", monthlyRent: 15000000, status: "active", paymentStatus: "current", daysRemaining: 88 },
  { id: "2", tenant: "Sarah Dewi", property: "Pacific Place Residence", unit: "B-805", startDate: "2025-03-15", endDate: "2026-03-15", monthlyRent: 22000000, status: "active", paymentStatus: "current", daysRemaining: 10 },
  { id: "3", tenant: "Michael Tan", property: "Sudirman Hill", unit: "C-302", startDate: "2024-12-01", endDate: "2025-12-01", monthlyRent: 8500000, status: "expiring", paymentStatus: "late", daysRemaining: 271 },
  { id: "4", tenant: "Putri Anggraini", property: "Kemang Village", unit: "D-1501", startDate: "2025-01-01", endDate: "2026-01-01", monthlyRent: 18000000, status: "active", paymentStatus: "current", daysRemaining: 302 },
  { id: "5", tenant: "David Lim", property: "Menteng Park", unit: "E-607", startDate: "2024-09-01", endDate: "2025-09-01", monthlyRent: 12000000, status: "expired", paymentStatus: "overdue", daysRemaining: 0 },
  { id: "6", tenant: "Rina Sari", property: "Ciputra World", unit: "F-2301", startDate: "2025-04-01", endDate: "2026-04-01", monthlyRent: 25000000, status: "renewed", paymentStatus: "current", daysRemaining: 392 },
];

const statusDist = [
  { name: "Active", value: leases.filter(l => l.status === "active").length, color: "hsl(var(--chart-2))" },
  { name: "Expiring", value: leases.filter(l => l.status === "expiring").length, color: "hsl(var(--chart-3))" },
  { name: "Expired", value: leases.filter(l => l.status === "expired").length, color: "hsl(var(--destructive))" },
  { name: "Renewed", value: leases.filter(l => l.status === "renewed").length, color: "hsl(var(--primary))" },
];

const monthlyRevenue = [
  { month: "Oct", revenue: 95 },
  { month: "Nov", revenue: 98 },
  { month: "Dec", revenue: 92 },
  { month: "Jan", revenue: 105 },
  { month: "Feb", revenue: 108 },
  { month: "Mar", revenue: 100.5 },
];

const statusBadge: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default", expiring: "secondary", expired: "destructive", renewed: "outline"
};
const payBadge: Record<string, "default" | "secondary" | "destructive"> = {
  current: "default", late: "secondary", overdue: "destructive"
};

const TenantLeaseTracker = () => {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? leases : leases.filter(l => l.status === filter);
  const totalMRR = leases.filter(l => l.status !== "expired").reduce((s, l) => s + l.monthlyRent, 0);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tenant & Lease Tracker</h2>
          <p className="text-sm text-muted-foreground">Monitor lease agreements, payments, and renewals</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="renewed">Renewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <FileText className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{leases.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Leases</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <DollarSign className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">Rp {(totalMRR / 1e6).toFixed(0)}M</p>
          <p className="text-[10px] text-muted-foreground">Monthly Revenue</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-chart-3">{leases.filter(l => l.status === "expiring" || l.daysRemaining < 30).length}</p>
          <p className="text-[10px] text-muted-foreground">Expiring Soon</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{leases.filter(l => l.paymentStatus !== "current").length}</p>
          <p className="text-[10px] text-muted-foreground">Payment Issues</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Lease Status</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusDist} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40} label={({ name, value }) => `${name}: ${value}`}>
                  {statusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Rental Revenue (Rp M)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Lease Agreements ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {filtered.map(l => (
            <div key={l.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0"><Users className="h-4 w-4 text-primary" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{l.tenant}</span>
                  <Badge variant={statusBadge[l.status]} className="text-[9px]">{l.status}</Badge>
                  <Badge variant={payBadge[l.paymentStatus]} className="text-[9px]">{l.paymentStatus}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{l.property} • Unit {l.unit}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span><Calendar className="h-2.5 w-2.5 inline mr-0.5" />{l.startDate} → {l.endDate}</span>
                  <span>Rp {(l.monthlyRent / 1e6).toFixed(1)}M/mo</span>
                  {l.daysRemaining > 0 && <span>{l.daysRemaining}d remaining</span>}
                </div>
              </div>
              {l.status === "expiring" && (
                <Button size="sm" variant="outline" className="h-7 text-xs shrink-0" onClick={() => toast.success("Renewal reminder sent")}>
                  Remind
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantLeaseTracker;
