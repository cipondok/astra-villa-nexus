import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileSignature, Send, CheckCircle, Clock, AlertTriangle, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const signingStats = [
  { label: "Pending Signatures", value: "34", icon: Clock, color: "text-chart-3" },
  { label: "Signed Today", value: "12", icon: CheckCircle, color: "text-chart-2" },
  { label: "Sent for Review", value: "8", icon: Send, color: "text-primary" },
  { label: "Expired/Rejected", value: "3", icon: AlertTriangle, color: "text-destructive" },
];

const documentTypes = [
  { name: "AJB (Sale Agreement)", value: 42, color: "hsl(var(--chart-1))" },
  { name: "Rental Contract", value: 28, color: "hsl(var(--chart-2))" },
  { name: "PPJB (Pre-Sale)", value: 18, color: "hsl(var(--chart-3))" },
  { name: "Power of Attorney", value: 12, color: "hsl(var(--chart-4))" },
];

const monthlyVolume = [
  { month: "Jan", signed: 45, pending: 12, rejected: 3 },
  { month: "Feb", signed: 52, pending: 8, rejected: 2 },
  { month: "Mar", signed: 61, pending: 15, rejected: 4 },
  { month: "Apr", signed: 48, pending: 10, rejected: 1 },
  { month: "May", signed: 58, pending: 14, rejected: 5 },
  { month: "Jun", signed: 67, pending: 9, rejected: 2 },
];

const recentDocuments = [
  { id: "DOC-4821", title: "AJB - Villa Canggu #18", parties: "Buyer: Tanaka H. • Seller: PT Bali Estates", status: "Awaiting Buyer", progress: 60, time: "2h ago" },
  { id: "DOC-4820", title: "Rental Contract - Apt Sudirman 12F", parties: "Tenant: Smith J. • Owner: Wijaya B.", status: "Fully Signed", progress: 100, time: "4h ago" },
  { id: "DOC-4819", title: "PPJB - BSD Residence Unit 8A", parties: "Buyer: Chen W. • Developer: PT BSD Tbk", status: "Notary Review", progress: 80, time: "6h ago" },
  { id: "DOC-4818", title: "Power of Attorney - Land Ubud", parties: "Principal: Nguyen T. • Attorney: Santoso Law", status: "Awaiting Notary", progress: 40, time: "1d ago" },
  { id: "DOC-4817", title: "AJB - Townhouse PIK #22", parties: "Buyer: Lee K. • Seller: Hartono R.", status: "Expired", progress: 30, time: "2d ago" },
];

const statusBadge = (status: string) => {
  switch (status) {
    case "Fully Signed": return "outline";
    case "Expired": return "destructive";
    default: return "secondary";
  }
};

const DocumentSigningHub = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Document Signing Hub</h2>
        <p className="text-muted-foreground text-sm">Digital document signing, notary coordination, and contract lifecycle tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {signingStats.map((s) => (
          <Card key={s.label} className="border-border/40">
            <CardContent className="p-4">
              <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Monthly Signing Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                <Bar dataKey="signed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Document Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={documentTypes} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                  {documentTypes.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {documentTypes.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{d.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <FileSignature className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{doc.id}</span>
                    <Badge variant={statusBadge(doc.status) as any} className="text-[10px]">{doc.status}</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{doc.time}</span>
                </div>
                <p className="text-xs text-foreground mb-0.5">{doc.title}</p>
                <p className="text-[10px] text-muted-foreground mb-2">{doc.parties}</p>
                <div className="flex items-center gap-2">
                  <Progress value={doc.progress} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-muted-foreground">{doc.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentSigningHub;
