import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bell, Send, Users, CheckCircle, Clock, Plus, Trash2, Eye, Megaphone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "push" | "email" | "in-app" | "sms";
  audience: string;
  sentCount: number;
  readRate: number;
  clickRate: number;
  status: "sent" | "scheduled" | "draft";
  sentAt: string | null;
}

const initialNotifs: Notification[] = [
  { id: "1", title: "New Feature: AI Property Match", message: "Discover your dream property with our AI-powered matching engine", type: "push", audience: "All Users", sentCount: 45000, readRate: 42, clickRate: 12, status: "sent", sentAt: "2026-03-04" },
  { id: "2", title: "Price Drop Alert", message: "Properties in your saved searches have dropped in price", type: "in-app", audience: "Active Searchers", sentCount: 8200, readRate: 68, clickRate: 28, status: "sent", sentAt: "2026-03-03" },
  { id: "3", title: "Complete Your Profile", message: "Get better recommendations by completing your profile", type: "email", audience: "Incomplete Profiles", sentCount: 3500, readRate: 35, clickRate: 18, status: "sent", sentAt: "2026-03-02" },
  { id: "4", title: "Weekend Open House", message: "Visit featured properties this weekend", type: "push", audience: "Jakarta Users", sentCount: 0, readRate: 0, clickRate: 0, status: "scheduled", sentAt: null },
  { id: "5", title: "System Maintenance", message: "Scheduled maintenance on March 10", type: "in-app", audience: "All Users", sentCount: 0, readRate: 0, clickRate: 0, status: "draft", sentAt: null },
];

const deliveryData = [
  { day: "Mon", push: 12000, email: 5000, inApp: 8000, sms: 1200 },
  { day: "Tue", push: 15000, email: 6200, inApp: 9500, sms: 1500 },
  { day: "Wed", push: 11000, email: 4800, inApp: 7200, sms: 900 },
  { day: "Thu", push: 18000, email: 7500, inApp: 11000, sms: 2000 },
  { day: "Fri", push: 14000, email: 5500, inApp: 8800, sms: 1100 },
  { day: "Sat", push: 8000, email: 2200, inApp: 5500, sms: 600 },
  { day: "Sun", push: 6000, email: 1800, inApp: 4200, sms: 400 },
];

const typeBadge: Record<string, "default" | "secondary" | "outline"> = {
  push: "default", email: "secondary", "in-app": "outline", sms: "secondary"
};

const NotificationCenterManager = () => {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "push", audience: "all" });

  const handleCreate = () => {
    if (!form.title) { toast.error("Title required"); return; }
    setNotifs(prev => [{ id: Date.now().toString(), title: form.title, message: "", type: form.type as any, audience: form.audience, sentCount: 0, readRate: 0, clickRate: 0, status: "draft", sentAt: null }, ...prev]);
    setForm({ title: "", type: "push", audience: "all" });
    setDialogOpen(false);
    toast.success("Notification draft created");
  };

  const totalSent = notifs.reduce((s, n) => s + n.sentCount, 0);
  const avgReadRate = notifs.filter(n => n.sentCount > 0).reduce((s, n) => s + n.readRate, 0) / (notifs.filter(n => n.sentCount > 0).length || 1);

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notification Center</h2>
          <p className="text-sm text-muted-foreground">Manage push, email, in-app, and SMS notifications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Notification</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Notification</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Notification title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="in-app">In-App</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.audience} onValueChange={v => setForm(f => ({ ...f, audience: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users</SelectItem>
                  <SelectItem value="vip">VIP Members</SelectItem>
                  <SelectItem value="agents">Agents</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={handleCreate}>Create Draft</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Send className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{(totalSent / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground">Total Sent</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Eye className="h-4 w-4 mx-auto mb-1 text-chart-2" />
          <p className="text-xl font-bold text-chart-2">{avgReadRate.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Avg Read Rate</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Megaphone className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xl font-bold text-foreground">{notifs.length}</p>
          <p className="text-[10px] text-muted-foreground">Campaigns</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-chart-3" />
          <p className="text-xl font-bold text-foreground">{notifs.filter(n => n.status === "scheduled").length}</p>
          <p className="text-[10px] text-muted-foreground">Scheduled</p>
        </CardContent></Card>
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-2"><CardTitle className="text-sm">Weekly Delivery by Channel</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deliveryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="push" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Push" />
              <Bar dataKey="email" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Email" />
              <Bar dataKey="inApp" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="In-App" />
              <Bar dataKey="sms" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="SMS" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {notifs.map(n => (
          <Card key={n.id} className="border-border/40">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0"><Bell className="h-4 w-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm text-foreground">{n.title}</h4>
                    <Badge variant={typeBadge[n.type] || "outline"} className="text-[9px]">{n.type}</Badge>
                    <Badge variant={n.status === "sent" ? "default" : n.status === "scheduled" ? "secondary" : "outline"} className="text-[9px]">{n.status}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{n.audience} • {n.sentAt || "Not sent"}</p>
                  {n.sentCount > 0 && (
                    <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground">
                      <span>{n.sentCount.toLocaleString()} sent</span>
                      <span className="text-chart-2">{n.readRate}% read</span>
                      <span className="text-primary">{n.clickRate}% clicked</span>
                    </div>
                  )}
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => { setNotifs(prev => prev.filter(x => x.id !== n.id)); toast.success("Deleted"); }}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationCenterManager;
