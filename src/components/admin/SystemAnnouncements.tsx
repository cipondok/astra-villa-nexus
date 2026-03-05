import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus, Trash2, Edit, Eye, Clock, Users, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "critical";
  audience: "all" | "agents" | "owners" | "vendors" | "vip";
  isActive: boolean;
  isPinned: boolean;
  createdAt: string;
  expiresAt: string | null;
  views: number;
}

const initialAnnouncements: Announcement[] = [
  {
    id: "1", title: "Scheduled Maintenance", message: "System will be under maintenance on March 10, 2026 from 2:00 AM - 4:00 AM WIB.",
    type: "warning", audience: "all", isActive: true, isPinned: true,
    createdAt: "2026-03-03", expiresAt: "2026-03-11", views: 1250
  },
  {
    id: "2", title: "New AI Features Launched", message: "We've launched AI-powered property matching and virtual staging. Try them now!",
    type: "success", audience: "all", isActive: true, isPinned: false,
    createdAt: "2026-03-01", expiresAt: null, views: 3420
  },
  {
    id: "3", title: "Agent Commission Update", message: "New commission structure effective April 1. Check your dashboard for details.",
    type: "info", audience: "agents", isActive: true, isPinned: false,
    createdAt: "2026-02-28", expiresAt: "2026-04-01", views: 890
  },
  {
    id: "4", title: "Critical Security Patch", message: "All users must update their passwords by March 15 due to enhanced security measures.",
    type: "critical", audience: "all", isActive: false, isPinned: false,
    createdAt: "2026-02-20", expiresAt: "2026-03-15", views: 5100
  },
];

const typeConfig = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  warning: { icon: AlertTriangle, color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30" },
  success: { icon: CheckCircle, color: "text-chart-2", bg: "bg-chart-2/10", border: "border-chart-2/30" },
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
};

const SystemAnnouncements = () => {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", message: "", type: "info" as const, audience: "all" as const, isPinned: false, expiresAt: "" });

  const handleSave = () => {
    if (!form.title || !form.message) { toast.error("Title and message are required"); return; }
    if (editId) {
      setAnnouncements(prev => prev.map(a => a.id === editId ? { ...a, ...form, expiresAt: form.expiresAt || null } : a));
      toast.success("Announcement updated");
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(), ...form, expiresAt: form.expiresAt || null,
        isActive: true, createdAt: new Date().toISOString().split("T")[0], views: 0
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      toast.success("Announcement created");
    }
    setForm({ title: "", message: "", type: "info", audience: "all", isPinned: false, expiresAt: "" });
    setEditId(null);
    setDialogOpen(false);
  };

  const handleEdit = (a: Announcement) => {
    setForm({ title: a.title, message: a.message, type: a.type, audience: a.audience, isPinned: a.isPinned, expiresAt: a.expiresAt || "" });
    setEditId(a.id);
    setDialogOpen(true);
  };

  const toggleActive = (id: string) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const handleDelete = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    toast.success("Announcement deleted");
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">System Announcements</h2>
          <p className="text-sm text-muted-foreground">Broadcast messages to platform users</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditId(null); setForm({ title: "", message: "", type: "info", audience: "all", isPinned: false, expiresAt: "" }); }}>
              <Plus className="h-4 w-4 mr-1" /> New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit" : "Create"} Announcement</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>Message</Label><Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Audience</Label>
                  <Select value={form.audience} onValueChange={v => setForm(f => ({ ...f, audience: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="agents">Agents</SelectItem>
                      <SelectItem value="owners">Owners</SelectItem>
                      <SelectItem value="vendors">Vendors</SelectItem>
                      <SelectItem value="vip">VIP Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Expires At (optional)</Label><Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} /></div>
              <div className="flex items-center gap-2"><Switch checked={form.isPinned} onCheckedChange={v => setForm(f => ({ ...f, isPinned: v }))} /><Label>Pin to top</Label></div>
              <Button className="w-full" onClick={handleSave}>{editId ? "Update" : "Create"} Announcement</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{announcements.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-chart-2">{announcements.filter(a => a.isActive).length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{announcements.filter(a => a.isPinned).length}</p>
          <p className="text-xs text-muted-foreground">Pinned</p>
        </CardContent></Card>
        <Card className="border-border/40"><CardContent className="p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{announcements.reduce((s, a) => s + a.views, 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Views</p>
        </CardContent></Card>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((a) => {
          const config = typeConfig[a.type];
          const Icon = config.icon;
          return (
            <Card key={a.id} className={`${config.border} border ${!a.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm text-foreground">{a.title}</h4>
                      {a.isPinned && <Badge variant="outline" className="text-[9px]">📌 Pinned</Badge>}
                      <Badge variant="secondary" className="text-[9px]">{a.audience}</Badge>
                      <Badge variant={a.isActive ? "default" : "outline"} className="text-[9px]">{a.isActive ? "Active" : "Inactive"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{a.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.createdAt}</span>
                      {a.expiresAt && <span>Expires: {a.expiresAt}</span>}
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {a.views.toLocaleString()} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch checked={a.isActive} onCheckedChange={() => toggleActive(a.id)} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(a)}><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SystemAnnouncements;
