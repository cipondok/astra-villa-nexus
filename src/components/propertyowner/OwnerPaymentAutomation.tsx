import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, Receipt, Clock, AlertTriangle, Bell, Loader2, Save,
  CalendarDays, Percent, DollarSign, RefreshCw, CheckCircle
} from "lucide-react";
import { formatIDR } from "@/utils/currency";

interface AutomationSettings {
  id?: string;
  owner_id: string;
  auto_generate_invoices: boolean;
  invoice_day_of_month: number;
  invoice_description_template: string;
  late_fee_enabled: boolean;
  late_fee_type: string;
  late_fee_amount: number;
  late_fee_percentage: number;
  grace_period_days: number;
  max_late_fee_amount: number;
  reminder_enabled: boolean;
  reminder_days_before: number[];
  overdue_reminder_frequency: string;
}

const defaultSettings = (ownerId: string): AutomationSettings => ({
  owner_id: ownerId,
  auto_generate_invoices: false,
  invoice_day_of_month: 1,
  invoice_description_template: "Sewa bulan {month} {year}",
  late_fee_enabled: false,
  late_fee_type: "fixed",
  late_fee_amount: 0,
  late_fee_percentage: 0,
  grace_period_days: 3,
  max_late_fee_amount: 0,
  reminder_enabled: true,
  reminder_days_before: [7, 3, 1],
  overdue_reminder_frequency: "daily",
});

const OwnerPaymentAutomation = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["payment-automation", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_automation_settings" as any)
        .select("*")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data as any as AutomationSettings) || defaultSettings(user!.id);
    },
    enabled: !!user,
  });

  const [form, setForm] = useState<AutomationSettings | null>(null);
  const current = form || settings || defaultSettings(user?.id || "");

  const update = (patch: Partial<AutomationSettings>) => {
    setForm({ ...current, ...patch });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...current };
      delete (payload as any).id;
      
      if (settings?.id) {
        const { error } = await supabase
          .from("payment_automation_settings" as any)
          .update(payload)
          .eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("payment_automation_settings" as any)
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Tersimpan", "Pengaturan automasi pembayaran berhasil disimpan");
      queryClient.invalidateQueries({ queryKey: ["payment-automation"] });
      setForm(null);
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  const triggerReminders = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("payment-reminders");
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      showSuccess("Selesai", `${data?.alerts_created || 0} reminder terkirim`);
    },
    onError: (err: any) => showError("Gagal", err.message),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const hasChanges = form !== null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-chart-3" />
          <h2 className="text-sm font-bold text-foreground">Automasi Pembayaran</h2>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline" size="sm" className="h-7 text-[10px]"
            onClick={() => triggerReminders.mutate()}
            disabled={triggerReminders.isPending}
          >
            {triggerReminders.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
            Kirim Reminder
          </Button>
          {hasChanges && (
            <Button size="sm" className="h-7 text-[10px]" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              Simpan
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-2.5 border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Receipt className={`h-3 w-3 ${current.auto_generate_invoices ? 'text-chart-1' : 'text-muted-foreground'}`} />
            <span className="text-[9px] text-muted-foreground">Auto Invoice</span>
          </div>
          <Badge variant={current.auto_generate_invoices ? "default" : "secondary"} className="text-[8px]">
            {current.auto_generate_invoices ? "Aktif" : "Nonaktif"}
          </Badge>
        </Card>
        <Card className="p-2.5 border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle className={`h-3 w-3 ${current.late_fee_enabled ? 'text-chart-3' : 'text-muted-foreground'}`} />
            <span className="text-[9px] text-muted-foreground">Denda Otomatis</span>
          </div>
          <Badge variant={current.late_fee_enabled ? "default" : "secondary"} className="text-[8px]">
            {current.late_fee_enabled ? "Aktif" : "Nonaktif"}
          </Badge>
        </Card>
        <Card className="p-2.5 border-border">
          <div className="flex items-center gap-1.5 mb-1">
            <Bell className={`h-3 w-3 ${current.reminder_enabled ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-[9px] text-muted-foreground">Reminder</span>
          </div>
          <Badge variant={current.reminder_enabled ? "default" : "secondary"} className="text-[8px]">
            {current.reminder_enabled ? "Aktif" : "Nonaktif"}
          </Badge>
        </Card>
      </div>

      {/* Auto-Generate Invoices */}
      <Card className="border-border">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Receipt className="h-3.5 w-3.5 text-chart-1" /> Invoice Otomatis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">Generate Invoice Bulanan</p>
              <p className="text-[10px] text-muted-foreground">Buat invoice sewa otomatis setiap bulan</p>
            </div>
            <Switch
              checked={current.auto_generate_invoices}
              onCheckedChange={(v) => update({ auto_generate_invoices: v })}
            />
          </div>
          {current.auto_generate_invoices && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-[10px]">Tanggal Terbit</Label>
                  <Select
                    value={String(current.invoice_day_of_month)}
                    onValueChange={(v) => update({ invoice_day_of_month: Number(v) })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>Tanggal {d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-[10px]">Template Deskripsi</Label>
                <Input
                  className="h-8 text-xs"
                  value={current.invoice_description_template}
                  onChange={(e) => update({ invoice_description_template: e.target.value })}
                  placeholder="Sewa bulan {month} {year}"
                />
                <p className="text-[9px] text-muted-foreground mt-0.5">Gunakan {'{month}'} dan {'{year}'} sebagai variabel</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Late Fee */}
      <Card className="border-border">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-chart-3" /> Denda Keterlambatan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">Denda Otomatis</p>
              <p className="text-[10px] text-muted-foreground">Terapkan denda saat melewati jatuh tempo</p>
            </div>
            <Switch
              checked={current.late_fee_enabled}
              onCheckedChange={(v) => update({ late_fee_enabled: v })}
            />
          </div>
          {current.late_fee_enabled && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Tipe Denda</Label>
                  <Select
                    value={current.late_fee_type}
                    onValueChange={(v) => update({ late_fee_type: v })}
                  >
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Nominal Tetap</SelectItem>
                      <SelectItem value="percentage">Persentase</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[10px]">
                    {current.late_fee_type === "fixed" ? "Jumlah (IDR)" : "Persentase (%)"}
                  </Label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    value={current.late_fee_type === "fixed" ? current.late_fee_amount : current.late_fee_percentage}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (current.late_fee_type === "fixed") {
                        update({ late_fee_amount: val });
                      } else {
                        update({ late_fee_percentage: val });
                      }
                    }}
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px]">Masa Tenggang (hari)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    value={current.grace_period_days}
                    onChange={(e) => update({ grace_period_days: Number(e.target.value) })}
                    min="0" max="30"
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Maks. Denda (IDR)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs"
                    value={current.max_late_fee_amount}
                    onChange={(e) => update({ max_late_fee_amount: Number(e.target.value) })}
                    min="0"
                    placeholder="0 = tanpa batas"
                  />
                </div>
              </div>
              {current.late_fee_type === "fixed" && current.late_fee_amount > 0 && (
                <p className="text-[9px] text-muted-foreground bg-muted/50 rounded p-1.5">
                  💡 Denda {formatIDR(current.late_fee_amount)}/hari setelah {current.grace_period_days} hari masa tenggang
                  {current.max_late_fee_amount > 0 && `, maks ${formatIDR(current.max_late_fee_amount)}`}
                </p>
              )}
              {current.late_fee_type === "percentage" && current.late_fee_percentage > 0 && (
                <p className="text-[9px] text-muted-foreground bg-muted/50 rounded p-1.5">
                  💡 Denda {current.late_fee_percentage}% dari total invoice setelah {current.grace_period_days} hari masa tenggang
                  {current.max_late_fee_amount > 0 && `, maks ${formatIDR(current.max_late_fee_amount)}`}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Reminder Settings */}
      <Card className="border-border">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-primary" /> Pengingat Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">Kirim Reminder</p>
              <p className="text-[10px] text-muted-foreground">Ingatkan tenant sebelum jatuh tempo</p>
            </div>
            <Switch
              checked={current.reminder_enabled}
              onCheckedChange={(v) => update({ reminder_enabled: v })}
            />
          </div>
          {current.reminder_enabled && (
            <>
              <div>
                <Label className="text-[10px]">Kirim H- (hari sebelum jatuh tempo)</Label>
                <div className="flex gap-1.5 mt-1">
                  {[1, 3, 5, 7, 14].map((d) => {
                    const isActive = current.reminder_days_before.includes(d);
                    return (
                      <Button
                        key={d}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        className="h-7 text-[10px] px-2.5"
                        onClick={() => {
                          const days = isActive
                            ? current.reminder_days_before.filter((x) => x !== d)
                            : [...current.reminder_days_before, d].sort((a, b) => b - a);
                          update({ reminder_days_before: days });
                        }}
                      >
                        H-{d}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label className="text-[10px]">Frekuensi Reminder Overdue</Label>
                <Select
                  value={current.overdue_reminder_frequency}
                  onValueChange={(v) => update({ overdue_reminder_frequency: v })}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Setiap Hari</SelectItem>
                    <SelectItem value="every_3_days">Setiap 3 Hari</SelectItem>
                    <SelectItem value="weekly">Setiap Minggu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button (sticky) */}
      {hasChanges && (
        <div className="sticky bottom-2">
          <Button
            className="w-full h-9"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Simpan Pengaturan Automasi
          </Button>
        </div>
      )}
    </div>
  );
};

export default OwnerPaymentAutomation;
