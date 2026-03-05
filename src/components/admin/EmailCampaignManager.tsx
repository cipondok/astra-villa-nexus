import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Mail, Plus, Send, Eye, MousePointer, Users, Clock, Trash2, Copy, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sending" | "sent" | "paused";
  audience: string;
  recipientCount: number;
  sentCount: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

const initialCampaigns: Campaign[] = [
  { id: "1", name: "March Newsletter", subject: "🏠 New Premium Listings in Jakarta & Bali", status: "sent", audience: "All Users", recipientCount: 15200, sentCount: 15200, openRate: 32.5, clickRate: 8.2, unsubscribeRate: 0.3, scheduledAt: null, sentAt: "2026-03-01", createdAt: "2026-02-28" },
  { id: "2", name: "VIP Exclusive Deals", subject: "💎 Exclusive: Pre-launch Access to Luxury Villas", status: "sent", audience: "VIP Members", recipientCount: 2800, sentCount: 2800, openRate: 48.5, clickRate: 15.2, unsubscribeRate: 0.1, scheduledAt: null, sentAt: "2026-02-25", createdAt: "2026-02-24" },
  { id: "3", name: "Agent Commission Update", subject: "New Commission Structure - Effective April 1", status: "scheduled", audience: "Agents", recipientCount: 1200, sentCount: 0, openRate: 0, clickRate: 0, unsubscribeRate: 0, scheduledAt: "2026-03-10 09:00", sentAt: null, createdAt: "2026-03-04" },
  { id: "4", name: "Abandoned Search Reminder", subject: "Still looking? Check out these matches", status: "sending", audience: "Inactive Users (7d)", recipientCount: 5400, sentCount: 3200, openRate: 22.1, clickRate: 6.8, unsubscribeRate: 0.5, scheduledAt: null, sentAt: null, createdAt: "2026-03-05" },
  { id: "5", name: "Investment Opportunities Q2", subject: "📈 Top ROI Properties for Q2 2026", status: "draft", audience: "Investors", recipientCount: 3500, sentCount: 0, openRate: 0, clickRate: 0, unsubscribeRate: 0, scheduledAt: null, sentAt: null, createdAt: "2026-03-05" },
];

const performanceData = [
  { month: "Oct", sent: 12000, opened: 3600, clicked: 960 },
  { month: "Nov", sent: 14500, opened: 4640, clicked: 1160 },
  { month: "Dec", sent: 11000, opened: 3850, clicked: 880 },
  { month: "Jan", sent: 16000, opened: 5440, clicked: 1440 },
  { month: "Feb", sent: 18000, opened: 6300, clicked: 1620 },
  { month: "Mar", sent: 20600, opened: 7210, clicked: 1854 },
];

const statusColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "outline", scheduled: "secondary", sending: "default", sent: "default", paused: "destructive"
};

const EmailCampaignManager = () => {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", audience: "all" });

  const handleCreate = () => {
    if (!form.name || !form.subject) { toast.error("Name and subject required"); return; }
    setCampaigns(prev => [{ id: Date.now().toString(), ...form, status: "draft" as const, audience: form.audience, recipientCount: 0, sentCount: 0, openRate: 0, clickRate: 0, unsubscribeRate: 0, scheduledAt: null, sentAt: null, createdAt: new Date().toISOString().split("T")[0] }, ...prev]);
    setForm({ name: "", subject: "", audience: "all" });
    setDialogOpen(false);
    toast.success("Campaign created as draft");
  };

  const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0);
  const avgOpenRate = campaigns.filter(c => c.sentCount > 0).reduce((s, c) => s + c.openRate, 0) / (campaigns.filter(c => c.sentCount > 0).length || 1);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Email Campaign Manager</h2>
          <p className="text-sm text-muted-foreground">Create, schedule, and track email campaigns</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Campaign</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Email Campaign</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Campaign Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><Label>Subject Line</Label><Input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} /></div>
              <div><Label>Audience</Label>
                <Select value={form.audience} onValueChange={v => setForm(f => ({ ...f, audience: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="vip">VIP Members</SelectItem>
                    <SelectItem value="agents">Agents</SelectItem>
                    <SelectItem value="investors">Investors</SelectItem>
                    <SelectItem value="inactive">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleCreate}>Create Draft</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Send className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{totalSent.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Emails Sent</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Eye className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{avgOpenRate.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Open Rate</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <MousePointer className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{(campaigns.filter(c => c.sentCount > 0).reduce((s, c) => s + c.clickRate, 0) / (campaigns.filter(c => c.sentCount > 0).length || 1)).toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Click Rate</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <BarChart3 className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{campaigns.length}</p>
          <p className="text-[10px] text-muted-foreground">Campaigns</p>
        </CardContent></Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Performance</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="sent" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} name="Sent" />
              <Bar dataKey="opened" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Opened" />
              <Bar dataKey="clicked" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Clicked" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {campaigns.map(c => (
          <Card key={c.id} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0"><Mail className="h-4 w-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm text-foreground">{c.name}</h4>
                    <Badge variant={statusColors[c.status]} className="text-[9px]">{c.status}</Badge>
                    <Badge variant="outline" className="text-[9px]">{c.audience}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">📧 {c.subject}</p>
                  {c.sentCount > 0 && (
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>{c.sentCount.toLocaleString()} sent</span>
                      <span className="text-chart-2">{c.openRate}% opens</span>
                      <span className="text-primary">{c.clickRate}% clicks</span>
                      <span className="text-destructive">{c.unsubscribeRate}% unsub</span>
                    </div>
                  )}
                  {c.status === "sending" && <Progress value={(c.sentCount / c.recipientCount) * 100} className="h-1.5 mt-2" />}
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {c.sentAt ? `Sent: ${c.sentAt}` : c.scheduledAt ? `Scheduled: ${c.scheduledAt}` : `Created: ${c.createdAt}`}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  {c.status === "draft" && <Button size="sm" variant="outline" className="h-7 text-xs"><Send className="h-3 w-3 mr-1" />Send</Button>}
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setCampaigns(prev => prev.filter(x => x.id !== c.id)); toast.success("Deleted"); }}>
                    <Trash2 className="h-3 w-3 text-destructive" />
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

export default EmailCampaignManager;
