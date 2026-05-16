import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Trash2, Edit, Clock, FileText, Mail, Download, Play, Pause } from "lucide-react";
import { toast } from "sonner";

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  format: "csv" | "pdf" | "json";
  deliveryMethod: "email" | "download" | "both";
  recipients: string[];
  tables: string[];
  isActive: boolean;
  lastRun: string | null;
  nextRun: string;
  createdAt: string;
}

const initialReports: ScheduledReport[] = [
  {
    id: "1", name: "Daily Revenue Summary", description: "Transaction totals, commissions, and payment method breakdown",
    frequency: "daily", format: "csv", deliveryMethod: "email", recipients: ["admin@astravillarealty.com"],
    tables: ["transaction_logs", "affiliate_commissions"], isActive: true, lastRun: "2026-03-05 06:00", nextRun: "2026-03-06 06:00", createdAt: "2026-02-01"
  },
  {
    id: "2", name: "Weekly User Growth", description: "New signups, active users, retention metrics",
    frequency: "weekly", format: "pdf", deliveryMethod: "email", recipients: ["admin@astravillarealty.com", "growth@astravillarealty.com"],
    tables: ["profiles", "user_sessions"], isActive: true, lastRun: "2026-03-03 08:00", nextRun: "2026-03-10 08:00", createdAt: "2026-02-10"
  },
  {
    id: "3", name: "Monthly Property Analytics", description: "Listing performance, views, inquiries by region",
    frequency: "monthly", format: "pdf", deliveryMethod: "both", recipients: ["admin@astravillarealty.com"],
    tables: ["properties", "property_analytics"], isActive: true, lastRun: "2026-03-01 00:00", nextRun: "2026-04-01 00:00", createdAt: "2026-01-15"
  },
  {
    id: "4", name: "Quarterly Investor Report", description: "ROI metrics, market trends, portfolio analysis",
    frequency: "quarterly", format: "pdf", deliveryMethod: "email", recipients: ["investors@astravillarealty.com"],
    tables: ["investment_metrics", "properties"], isActive: false, lastRun: "2026-01-01 00:00", nextRun: "2026-04-01 00:00", createdAt: "2026-01-01"
  },
];

const frequencyColors = { daily: "default", weekly: "secondary", monthly: "outline", quarterly: "outline" } as const;

const ScheduledReportsManager = () => {
  const [reports, setReports] = useState(initialReports);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", frequency: "weekly" as ScheduledReport["frequency"],
    format: "csv" as ScheduledReport["format"], deliveryMethod: "email" as ScheduledReport["deliveryMethod"],
    recipients: ""
  });

  const handleCreate = () => {
    if (!form.name) { toast.error("Name is required"); return; }
    const newReport: ScheduledReport = {
      id: Date.now().toString(), ...form,
      recipients: form.recipients.split(",").map(r => r.trim()).filter(Boolean),
      tables: [], isActive: true, lastRun: null,
      nextRun: new Date(Date.now() + 86400000).toISOString().slice(0, 16).replace("T", " "),
      createdAt: new Date().toISOString().split("T")[0]
    };
    setReports(prev => [newReport, ...prev]);
    setForm({ name: "", description: "", frequency: "weekly", format: "csv", deliveryMethod: "email", recipients: "" });
    setDialogOpen(false);
    toast.success("Scheduled report created");
  };

  const toggleActive = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleDelete = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    toast.success("Report deleted");
  };

  const handleRunNow = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, lastRun: new Date().toISOString().slice(0, 16).replace("T", " ") } : r));
    toast.success("Report generation started");
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Scheduled Reports</h2>
          <p className="text-sm text-muted-foreground">Automated report generation and delivery</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Schedule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Scheduled Report</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Report Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Weekly Sales Report" /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Frequency</Label>
                  <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Format</Label>
                  <Select value={form.format} onValueChange={v => setForm(f => ({ ...f, format: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Delivery</Label>
                  <Select value={form.deliveryMethod} onValueChange={v => setForm(f => ({ ...f, deliveryMethod: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Recipients (comma-separated)</Label><Input value={form.recipients} onChange={e => setForm(f => ({ ...f, recipients: e.target.value }))} placeholder="admin@example.com" /></div>
              <Button className="w-full" onClick={handleCreate}>Create Schedule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Calendar className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{reports.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Schedules</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Play className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-2xl font-bold text-chart-2">{reports.filter(r => r.isActive).length}</p>
          <p className="text-[10px] text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <FileText className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-2xl font-bold text-foreground">{reports.filter(r => r.frequency === "daily").length}</p>
          <p className="text-[10px] text-muted-foreground">Daily Reports</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Mail className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-2xl font-bold text-foreground">{reports.reduce((s, r) => s + r.recipients.length, 0)}</p>
          <p className="text-[10px] text-muted-foreground">Recipients</p>
        </CardContent></Card>
      </div>

      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id} className={`border-border/40 ${!report.isActive ? "opacity-60" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm text-foreground">{report.name}</h4>
                    <Badge variant={frequencyColors[report.frequency]} className="text-[9px]">{report.frequency}</Badge>
                    <Badge variant="outline" className="text-[9px]">{report.format.toUpperCase()}</Badge>
                    <Badge variant="outline" className="text-[9px]">{report.deliveryMethod}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    {report.lastRun && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last: {report.lastRun}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Next: {report.nextRun}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {report.recipients.length} recipient(s)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleRunNow(report.id)}>
                    <Play className="h-3 w-3 mr-1" /> Run Now
                  </Button>
                  <Switch checked={report.isActive} onCheckedChange={() => toggleActive(report.id)} />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(report.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScheduledReportsManager;
