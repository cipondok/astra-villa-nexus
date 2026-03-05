import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const complianceAreas = [
  { area: "KYC/AML", score: 92, status: "compliant", issues: 3 },
  { area: "Data Privacy (PDPA)", score: 85, status: "review", issues: 8 },
  { area: "Tax Reporting", score: 78, status: "review", issues: 12 },
  { area: "Property Licensing", score: 95, status: "compliant", issues: 1 },
  { area: "Consumer Protection", score: 88, status: "compliant", issues: 5 },
  { area: "Anti-Fraud", score: 90, status: "compliant", issues: 4 },
];

const radarData = complianceAreas.map(a => ({ subject: a.area, score: a.score, fullMark: 100 }));

const monthlyAudits = [
  { month: "Oct", passed: 12, failed: 3, pending: 2 },
  { month: "Nov", passed: 15, failed: 2, pending: 1 },
  { month: "Dec", passed: 10, failed: 4, pending: 3 },
  { month: "Jan", passed: 18, failed: 1, pending: 2 },
  { month: "Feb", passed: 16, failed: 2, pending: 1 },
  { month: "Mar", passed: 20, failed: 1, pending: 0 },
];

const recentFindings = [
  { id: "CR-2024-042", area: "Data Privacy", severity: "high", description: "User data retention exceeds 90-day policy", dueDate: "Mar 15", status: "open" },
  { id: "CR-2024-041", area: "Tax Reporting", severity: "medium", description: "Missing PPh 21 filing for Q4 vendor payments", dueDate: "Mar 20", status: "in-progress" },
  { id: "CR-2024-040", area: "KYC/AML", severity: "low", description: "3 accounts pending enhanced due diligence review", dueDate: "Mar 25", status: "open" },
  { id: "CR-2024-039", area: "Consumer Protection", severity: "medium", description: "Refund policy disclosure update needed on checkout", dueDate: "Mar 10", status: "resolved" },
];

const sevColor: Record<string, string> = { high: "text-destructive", medium: "text-chart-4", low: "text-chart-2" };
const statusIcon: Record<string, React.ReactNode> = {
  open: <AlertTriangle className="h-3 w-3 text-chart-4" />,
  "in-progress": <Clock className="h-3 w-3 text-primary" />,
  resolved: <CheckCircle className="h-3 w-3 text-chart-2" />,
};

const ComplianceReportingCenter = () => {
  const overallScore = Math.round(complianceAreas.reduce((s, a) => s + a.score, 0) / complianceAreas.length);
  const totalIssues = complianceAreas.reduce((s, a) => s + a.issues, 0);

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Compliance Reporting</h2>
        <p className="text-sm text-muted-foreground">Regulatory compliance status, audit results, and finding management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Shield className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{overallScore}%</p>
          <p className="text-[10px] text-muted-foreground">Overall Score</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">4/6</p>
          <p className="text-[10px] text-muted-foreground">Areas Compliant</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-chart-4" />
          <p className="text-xl font-bold text-chart-4">{totalIssues}</p>
          <p className="text-[10px] text-muted-foreground">Open Issues</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <FileText className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">91</p>
          <p className="text-[10px] text-muted-foreground">Audits Completed</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Audit Results</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={monthlyAudits}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="passed" fill="hsl(var(--chart-2))" name="Passed" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="failed" fill="hsl(var(--destructive))" name="Failed" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" fill="hsl(var(--chart-4))" name="Pending" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Compliance Radar</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={210}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Findings</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {recentFindings.map((f) => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              {statusIcon[f.status]}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{f.id}</span>
                  <Badge variant="outline" className={`text-[9px] ${sevColor[f.severity]}`}>{f.severity}</Badge>
                  <Badge variant="outline" className="text-[9px]">{f.area}</Badge>
                </div>
                <p className="text-xs text-foreground mt-0.5">{f.description}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">Due {f.dueDate}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceReportingCenter;
