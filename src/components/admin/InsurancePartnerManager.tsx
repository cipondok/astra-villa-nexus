import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Building2, TrendingUp, Users, CheckCircle, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const partners = [
  { name: "Allianz Indonesia", type: "Property", policies: 342, premium: 8.5, claimRate: 4.2, status: "active" },
  { name: "AXA Mandiri", type: "Mortgage", policies: 285, premium: 6.2, claimRate: 3.8, status: "active" },
  { name: "Sinarmas MSIG", type: "Property", policies: 198, premium: 4.8, claimRate: 5.1, status: "active" },
  { name: "Zurich Indonesia", type: "Earthquake", policies: 156, premium: 3.2, claimRate: 1.2, status: "active" },
  { name: "FWD Insurance", type: "Rental", policies: 124, premium: 2.1, claimRate: 6.8, status: "review" },
];

const monthlyPolicies = [
  { month: "Oct", new: 85, renewed: 42, lapsed: 12 },
  { month: "Nov", new: 92, renewed: 55, lapsed: 8 },
  { month: "Dec", new: 68, renewed: 48, lapsed: 15 },
  { month: "Jan", new: 110, renewed: 62, lapsed: 10 },
  { month: "Feb", new: 98, renewed: 58, lapsed: 11 },
  { month: "Mar", new: 125, renewed: 72, lapsed: 9 },
];

const claimsTrend = [
  { month: "Oct", filed: 18, approved: 14, rejected: 4 },
  { month: "Nov", filed: 22, approved: 18, rejected: 4 },
  { month: "Dec", filed: 15, approved: 12, rejected: 3 },
  { month: "Jan", filed: 25, approved: 20, rejected: 5 },
  { month: "Feb", filed: 20, approved: 16, rejected: 4 },
  { month: "Mar", filed: 28, approved: 22, rejected: 6 },
];

const InsurancePartnerManager = () => {
  const totalPolicies = partners.reduce((s, p) => s + p.policies, 0);
  const totalPremium = partners.reduce((s, p) => s + p.premium, 0).toFixed(1);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Insurance Partners</h2>
        <p className="text-sm text-muted-foreground">Partner management, policy tracking, and claims analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Shield className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{partners.length}</p>
          <p className="text-[10px] text-muted-foreground">Active Partners</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <FileText className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{totalPolicies.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total Policies</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">Rp {totalPremium}B</p>
          <p className="text-[10px] text-muted-foreground">Total Premiums</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-chart-3">87%</p>
          <p className="text-[10px] text-muted-foreground">Claim Approval</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Policy Activity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={monthlyPolicies}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="new" fill="hsl(var(--primary))" name="New" radius={[4, 4, 0, 0]} />
                <Bar dataKey="renewed" fill="hsl(var(--chart-2))" name="Renewed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lapsed" fill="hsl(var(--chart-4))" name="Lapsed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Claims Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={claimsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="filed" stroke="hsl(var(--primary))" name="Filed" strokeWidth={2} />
                <Line type="monotone" dataKey="approved" stroke="hsl(var(--chart-2))" name="Approved" strokeWidth={2} />
                <Line type="monotone" dataKey="rejected" stroke="hsl(var(--destructive))" name="Rejected" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Partner Directory</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {partners.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                <Building2 className="h-3 w-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{p.name}</span>
                  <Badge variant="outline" className="text-[9px]">{p.type}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                  <span>{p.policies} policies</span>
                  <span>Rp {p.premium}B premium</span>
                  <span className="text-chart-4">{p.claimRate}% claim rate</span>
                </div>
              </div>
              <Progress value={100 - p.claimRate * 10} className="w-16 h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default InsurancePartnerManager;
