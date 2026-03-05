import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCheck, FileX, Clock, Eye, User, Shield, CheckCircle, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface DocSubmission {
  id: string;
  user: string;
  docType: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "needs_resubmit";
  reviewNote: string | null;
  urgency: "low" | "medium" | "high";
}

const initialDocs: DocSubmission[] = [
  { id: "1", user: "Ahmad Rizki", docType: "KTP (National ID)", submittedAt: "2026-03-05 10:15", status: "pending", reviewNote: null, urgency: "high" },
  { id: "2", user: "Sarah Dewi", docType: "NPWP (Tax ID)", submittedAt: "2026-03-05 09:30", status: "pending", reviewNote: null, urgency: "medium" },
  { id: "3", user: "Michael Tan", docType: "SIUP (Business License)", submittedAt: "2026-03-04 16:45", status: "pending", reviewNote: null, urgency: "high" },
  { id: "4", user: "Putri Anggraini", docType: "KTP (National ID)", submittedAt: "2026-03-04 14:20", status: "approved", reviewNote: "Verified", urgency: "low" },
  { id: "5", user: "David Lim", docType: "Proof of Ownership", submittedAt: "2026-03-04 11:00", status: "rejected", reviewNote: "Document expired", urgency: "medium" },
  { id: "6", user: "Rina Sari", docType: "NPWP (Tax ID)", submittedAt: "2026-03-03 15:30", status: "needs_resubmit", reviewNote: "Name mismatch", urgency: "low" },
  { id: "7", user: "Budi Santoso", docType: "Agent License", submittedAt: "2026-03-05 11:00", status: "pending", reviewNote: null, urgency: "high" },
  { id: "8", user: "Citra Wulandari", docType: "KTP (National ID)", submittedAt: "2026-03-03 09:15", status: "approved", reviewNote: "Verified", urgency: "low" },
];

const weeklyVolume = [
  { day: "Mon", submitted: 12, approved: 8, rejected: 2 },
  { day: "Tue", submitted: 18, approved: 14, rejected: 3 },
  { day: "Wed", submitted: 15, approved: 11, rejected: 1 },
  { day: "Thu", submitted: 22, approved: 16, rejected: 4 },
  { day: "Fri", submitted: 14, approved: 12, rejected: 2 },
  { day: "Sat", submitted: 6, approved: 5, rejected: 0 },
  { day: "Sun", submitted: 3, approved: 2, rejected: 1 },
];

const statusBadge: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary", approved: "default", rejected: "destructive", needs_resubmit: "outline"
};

const DocumentVerificationQueue = () => {
  const [docs, setDocs] = useState(initialDocs);
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? docs : docs.filter(d => d.status === filter);
  const pending = docs.filter(d => d.status === "pending").length;

  const handleAction = (id: string, action: "approved" | "rejected") => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: action, reviewNote: action === "approved" ? "Verified" : "Does not meet requirements" } : d));
    toast.success(`Document ${action}`);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Document Verification Queue</h2>
          <p className="text-sm text-muted-foreground">KTP, NPWP, SIUP, and license verification</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-chart-3">{pending}</p>
          <p className="text-[10px] text-muted-foreground">Pending Review</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{docs.filter(d => d.status === "approved").length}</p>
          <p className="text-[10px] text-muted-foreground">Approved</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <FileX className="h-4 w-4 mx-auto mb-1 text-destructive" />
          <p className="text-xl font-bold text-destructive">{docs.filter(d => d.status === "rejected").length}</p>
          <p className="text-[10px] text-muted-foreground">Rejected</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <FileCheck className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{docs.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Submissions</p>
        </CardContent></Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Volume</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="submitted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Submitted" />
              <Bar dataKey="approved" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Approved" />
              <Bar dataKey="rejected" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {filtered.map(d => (
          <Card key={d.id} className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg shrink-0 ${d.status === "pending" ? "bg-chart-3/10" : d.status === "approved" ? "bg-chart-2/10" : "bg-destructive/10"}`}>
                  <Shield className={`h-3.5 w-3.5 ${d.status === "pending" ? "text-chart-3" : d.status === "approved" ? "text-chart-2" : "text-destructive"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{d.user}</span>
                    <Badge variant={statusBadge[d.status]} className="text-[9px]">{d.status.replace("_", " ")}</Badge>
                    {d.urgency === "high" && <Badge variant="destructive" className="text-[8px]">Urgent</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{d.docType} • {d.submittedAt}</p>
                  {d.reviewNote && <p className="text-[10px] text-muted-foreground mt-0.5">Note: {d.reviewNote}</p>}
                </div>
                {d.status === "pending" && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="outline" className="h-7 text-xs text-chart-2" onClick={() => handleAction(d.id, "approved")}>
                      <CheckCircle className="h-3 w-3 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={() => handleAction(d.id, "rejected")}>
                      <FileX className="h-3 w-3 mr-1" />Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentVerificationQueue;
