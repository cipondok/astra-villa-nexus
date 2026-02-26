import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Megaphone, Plus, Pin, Trash2, Eye, Clock, AlertTriangle, Send, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Rendah", color: "bg-muted text-muted-foreground" },
  normal: { label: "Normal", color: "bg-primary/10 text-primary" },
  high: { label: "Penting", color: "bg-chart-3/10 text-chart-3" },
  urgent: { label: "Darurat", color: "bg-destructive/10 text-destructive" },
};

const categoryConfig: Record<string, string> = {
  general: "Umum",
  maintenance: "Pemeliharaan",
  billing: "Pembayaran",
  rules: "Aturan",
  event: "Acara",
  emergency: "Darurat",
};

const OwnerAnnouncementHub = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "normal",
    category: "general",
    is_pinned: false,
    property_id: "",
  });

  // Fetch owner properties
  const { data: properties = [] } = useQuery({
    queryKey: ["owner-properties-list", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("properties")
        .select("id, title")
        .eq("owner_id", user.id)
        .eq("status", "active");
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch announcements
  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["owner-announcements", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("property_announcements")
        .select("*, properties(title), announcement_reads(tenant_id)")
        .eq("owner_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("property_announcements").insert({
        ...form,
        owner_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pengumuman berhasil dikirim!");
      queryClient.invalidateQueries({ queryKey: ["owner-announcements"] });
      setShowForm(false);
      setForm({ title: "", content: "", priority: "normal", category: "general", is_pinned: false, property_id: "" });
    },
    onError: () => toast.error("Gagal mengirim pengumuman"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("property_announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pengumuman dihapus");
      queryClient.invalidateQueries({ queryKey: ["owner-announcements"] });
    },
  });

  const togglePin = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from("property_announcements")
        .update({ is_pinned: !pinned })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["owner-announcements"] }),
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Pengumuman</h2>
          <Badge variant="secondary" className="text-[9px]">{announcements.length}</Badge>
        </div>
        <Button size="sm" className="h-7 text-xs" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-3 w-3 mr-1" /> Batal</> : <><Plus className="h-3 w-3 mr-1" /> Buat</>}
        </Button>
      </div>

      {showForm && (
        <Card className="p-3 border-primary/20">
          <div className="space-y-2.5">
            <Select value={form.property_id} onValueChange={v => setForm(f => ({ ...f, property_id: v }))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Pilih Properti" />
              </SelectTrigger>
              <SelectContent>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Judul pengumuman..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="h-8 text-xs"
            />
            <Textarea
              placeholder="Isi pengumuman untuk tenant..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="text-xs min-h-[60px]"
            />
            <div className="flex gap-2">
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                <SelectTrigger className="h-7 text-[10px] flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="h-7 text-[10px] flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_pinned} onCheckedChange={v => setForm(f => ({ ...f, is_pinned: v }))} />
                <Label className="text-[10px]">Pin di atas</Label>
              </div>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={!form.title || !form.content || !form.property_id || createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                <Send className="h-3 w-3 mr-1" /> Kirim
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        </div>
      ) : announcements.length === 0 ? (
        <Card className="p-6 text-center">
          <Megaphone className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-xs font-medium text-foreground">Belum ada pengumuman</p>
          <p className="text-[10px] text-muted-foreground">Buat pengumuman untuk tenant properti Anda</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {announcements.map((a: any) => {
            const priority = priorityConfig[a.priority] || priorityConfig.normal;
            const readCount = a.announcement_reads?.length || 0;
            return (
              <Card key={a.id} className={`p-2.5 ${a.is_pinned ? "border-primary/30 bg-primary/5" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {a.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                      <h3 className="text-xs font-semibold text-foreground truncate">{a.title}</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{a.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className={`text-[8px] px-1.5 py-0 ${priority.color}`}>{priority.label}</Badge>
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0">{categoryConfig[a.category] || a.category}</Badge>
                      <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                        <Eye className="h-2.5 w-2.5" /> {readCount} dibaca
                      </span>
                      <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" /> {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: idLocale })}
                      </span>
                    </div>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{(a as any).properties?.title}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => togglePin.mutate({ id: a.id, pinned: a.is_pinned })}
                    >
                      <Pin className={`h-3 w-3 ${a.is_pinned ? "text-primary" : "text-muted-foreground"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => deleteMutation.mutate(a.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerAnnouncementHub;
