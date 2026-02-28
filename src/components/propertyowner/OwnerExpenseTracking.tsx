import { useState } from "react";
import { Card } from "@/components/ui/card";
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
import Price from "@/components/ui/Price";
import { 
  Receipt, Plus, Trash2, X, Send, Calendar, TrendingDown, 
  DollarSign, Wrench, Shield, Zap, Paintbrush, Scale, Building, MoreHorizontal,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const categoryConfig: Record<string, { label: string; icon: typeof Wrench; color: string; bg: string }> = {
  maintenance: { label: "Pemeliharaan", icon: Wrench, color: "text-chart-3", bg: "bg-chart-3/10" },
  tax: { label: "Pajak", icon: DollarSign, color: "text-destructive", bg: "bg-destructive/10" },
  insurance: { label: "Asuransi", icon: Shield, color: "text-primary", bg: "bg-primary/10" },
  utility: { label: "Utilitas", icon: Zap, color: "text-chart-1", bg: "bg-chart-1/10" },
  cleaning: { label: "Kebersihan", icon: Paintbrush, color: "text-chart-5", bg: "bg-chart-5/10" },
  renovation: { label: "Renovasi", icon: Building, color: "text-chart-2", bg: "bg-chart-2/10" },
  legal: { label: "Legal", icon: Scale, color: "text-accent-foreground", bg: "bg-accent/50" },
  management_fee: { label: "Biaya Kelola", icon: Receipt, color: "text-muted-foreground", bg: "bg-muted" },
  other: { label: "Lainnya", icon: MoreHorizontal, color: "text-muted-foreground", bg: "bg-muted" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: "Lunas", color: "bg-chart-1/10 text-chart-1" },
  pending: { label: "Belum Bayar", color: "bg-chart-3/10 text-chart-3" },
  cancelled: { label: "Dibatalkan", color: "bg-muted text-muted-foreground" },
};

const OwnerExpenseTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [form, setForm] = useState({
    property_id: "",
    category: "maintenance",
    title: "",
    description: "",
    amount: "",
    expense_date: format(new Date(), "yyyy-MM-dd"),
    vendor_name: "",
    is_recurring: false,
    recurring_interval: "" as string,
    status: "paid",
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["owner-props-expenses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("properties")
        .select("id, title")
        .eq("owner_id", user.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["owner-expenses", user?.id, filterCategory],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("property_expenses")
        .select("*, properties(title)")
        .eq("owner_id", user.id)
        .order("expense_date", { ascending: false })
        .limit(100);
      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }
      const { data } = await query;
      return data || [];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("property_expenses").insert({
        property_id: form.property_id,
        owner_id: user.id,
        category: form.category,
        title: form.title,
        description: form.description || null,
        amount: Number(form.amount),
        expense_date: form.expense_date,
        vendor_name: form.vendor_name || null,
        is_recurring: form.is_recurring,
        recurring_interval: form.is_recurring ? form.recurring_interval : null,
        status: form.status,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pengeluaran berhasil dicatat!");
      queryClient.invalidateQueries({ queryKey: ["owner-expenses"] });
      setShowForm(false);
      setForm({ property_id: "", category: "maintenance", title: "", description: "", amount: "", expense_date: format(new Date(), "yyyy-MM-dd"), vendor_name: "", is_recurring: false, recurring_interval: "", status: "paid" });
    },
    onError: () => toast.error("Gagal mencatat pengeluaran"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("property_expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Pengeluaran dihapus");
      queryClient.invalidateQueries({ queryKey: ["owner-expenses"] });
    },
  });

  // Summary calculations
  const totalExpenses = expenses.reduce((sum: number, e: any) => e.status !== "cancelled" ? sum + Number(e.amount) : sum, 0);
  const paidTotal = expenses.filter((e: any) => e.status === "paid").reduce((s: number, e: any) => s + Number(e.amount), 0);
  const pendingTotal = expenses.filter((e: any) => e.status === "pending").reduce((s: number, e: any) => s + Number(e.amount), 0);

  // Category breakdown
  const categoryBreakdown = expenses.reduce((acc: Record<string, number>, e: any) => {
    if (e.status !== "cancelled") {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    }
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-bold text-foreground">Pengeluaran Properti</h2>
        </div>
        <Button size="sm" className="h-7 text-xs" onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="h-3 w-3 mr-1" /> Batal</> : <><Plus className="h-3 w-3 mr-1" /> Catat</>}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-1.5">
        <Card className="p-2">
          <p className="text-[8px] text-muted-foreground">Total Pengeluaran</p>
          <p className="text-xs font-bold text-destructive"><Price amount={totalExpenses} /></p>
        </Card>
        <Card className="p-2">
          <p className="text-[8px] text-muted-foreground">Sudah Bayar</p>
          <p className="text-xs font-bold text-chart-1"><Price amount={paidTotal} /></p>
        </Card>
        <Card className="p-2">
          <p className="text-[8px] text-muted-foreground">Belum Bayar</p>
          <p className="text-xs font-bold text-chart-3"><Price amount={pendingTotal} /></p>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <Card className="p-2.5">
          <p className="text-[10px] font-semibold text-foreground mb-1.5">Breakdown Kategori</p>
          <div className="space-y-1">
            {Object.entries(categoryBreakdown)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([cat, amount]) => {
                const config = categoryConfig[cat] || categoryConfig.other;
                const CatIcon = config.icon;
                const pct = totalExpenses > 0 ? Math.round(((amount as number) / totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <div className={`h-5 w-5 rounded flex items-center justify-center ${config.bg}`}>
                      <CatIcon className={`h-2.5 w-2.5 ${config.color}`} />
                    </div>
                    <span className="text-[9px] text-muted-foreground flex-1">{config.label}</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${config.bg.replace('/10', '/40')}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[9px] font-medium text-foreground w-12 text-right">{pct}%</span>
                    <span className="text-[9px] font-semibold text-foreground"><Price amount={amount as number} /></span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Add Expense Form */}
      {showForm && (
        <Card className="p-3 border-primary/20">
          <div className="space-y-2">
            <Select value={form.property_id} onValueChange={v => setForm(f => ({ ...f, property_id: v }))}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pilih Properti" /></SelectTrigger>
              <SelectContent>
                {properties.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Judul pengeluaran..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="h-8 text-xs" />
            <div className="flex gap-2">
              <Input type="number" placeholder="Jumlah (Rp)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="h-8 text-xs flex-1" />
              <Input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} className="h-8 text-xs flex-1" />
            </div>
            <Input placeholder="Nama vendor (opsional)" value={form.vendor_name} onChange={e => setForm(f => ({ ...f, vendor_name: e.target.value }))} className="h-8 text-xs" />
            <Textarea placeholder="Deskripsi (opsional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="text-xs min-h-[50px]" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_recurring} onCheckedChange={v => setForm(f => ({ ...f, is_recurring: v }))} />
                <Label className="text-[10px]">Berulang</Label>
                {form.is_recurring && (
                  <Select value={form.recurring_interval} onValueChange={v => setForm(f => ({ ...f, recurring_interval: v }))}>
                    <SelectTrigger className="h-6 text-[10px] w-24"><SelectValue placeholder="Interval" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly" className="text-xs">Bulanan</SelectItem>
                      <SelectItem value="quarterly" className="text-xs">Triwulan</SelectItem>
                      <SelectItem value="yearly" className="text-xs">Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Button size="sm" className="h-7 text-xs" disabled={!form.title || !form.amount || !form.property_id || createMutation.isPending} onClick={() => createMutation.mutate()}>
                <Send className="h-3 w-3 mr-1" /> Simpan
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-3 w-3 text-muted-foreground" />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-7 text-[10px] w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Semua Kategori</SelectItem>
            {Object.entries(categoryConfig).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="secondary" className="text-[9px]">{expenses.length} item</Badge>
      </div>

      {/* Expense List */}
      {isLoading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" /></div>
      ) : expenses.length === 0 ? (
        <Card className="p-6 text-center">
          <Receipt className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-xs font-medium">Belum ada pengeluaran</p>
          <p className="text-[10px] text-muted-foreground">Catat pengeluaran properti Anda untuk tracking keuangan</p>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {expenses.map((e: any) => {
            const cat = categoryConfig[e.category] || categoryConfig.other;
            const CatIcon = cat.icon;
            const st = statusConfig[e.status] || statusConfig.paid;
            return (
              <Card key={e.id} className="p-2">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cat.bg}`}>
                    <CatIcon className={`h-3.5 w-3.5 ${cat.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[10px] font-semibold text-foreground truncate">{e.title}</h4>
                      {e.is_recurring && <Badge variant="outline" className="text-[7px] px-1 py-0 h-3">Berulang</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={`text-[7px] px-1 py-0 ${st.color}`}>{st.label}</Badge>
                      <span className="text-[8px] text-muted-foreground">{cat.label}</span>
                      <span className="text-[8px] text-muted-foreground">{(e as any).properties?.title}</span>
                      <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {format(new Date(e.expense_date), "dd MMM yyyy", { locale: idLocale })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-destructive"><Price amount={Number(e.amount)} /></p>
                    {e.vendor_name && <p className="text-[8px] text-muted-foreground">{e.vendor_name}</p>}
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive flex-shrink-0" onClick={() => deleteMutation.mutate(e.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerExpenseTracking;
