import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, BellOff, CheckCheck, CreditCard, Clock, Shield, Wrench, 
  ClipboardCheck, Wallet, MessageSquare, FileText, CalendarDays,
  Mail, Smartphone, Monitor, Moon, Loader2
} from "lucide-react";
import { useRentalNotificationSettings, useRentalNotificationLog } from "@/hooks/useRentalNotifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const notifTypeIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  payment_due: { icon: CreditCard, color: "text-chart-3", bg: "bg-chart-3/10" },
  payment_overdue: { icon: CreditCard, color: "text-destructive", bg: "bg-destructive/10" },
  lease_expiry: { icon: CalendarDays, color: "text-chart-3", bg: "bg-chart-3/10" },
  maintenance: { icon: Wrench, color: "text-primary", bg: "bg-primary/10" },
  inspection: { icon: ClipboardCheck, color: "text-chart-1", bg: "bg-chart-1/10" },
  deposit: { icon: Wallet, color: "text-chart-5", bg: "bg-chart-5/10" },
  chat: { icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
  document: { icon: FileText, color: "text-chart-1", bg: "bg-chart-1/10" },
  booking: { icon: CalendarDays, color: "text-chart-1", bg: "bg-chart-1/10" },
};

const RentalNotificationCenter = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const { settings, isLoading: settingsLoading, updateSettings, isSaving } = useRentalNotificationSettings();
  const { notifications, unreadCount, isLoading: notifLoading, markAsRead, markAllAsRead } = useRentalNotificationLog();

  const getNotifStyle = (type: string) => {
    const key = Object.keys(notifTypeIcons).find(k => type.includes(k));
    return notifTypeIcons[key || 'booking'] || notifTypeIcons.booking;
  };

  const SettingRow = ({ label, description, checked, onToggle }: { label: string; description: string; checked: boolean; onToggle: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} disabled={isSaving} />
    </div>
  );

  if (settingsLoading || notifLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Notifikasi Rental</h2>
          {unreadCount > 0 && (
            <Badge className="text-[10px] h-5 bg-destructive text-destructive-foreground">{unreadCount}</Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full h-8 p-0.5">
          <TabsTrigger value="notifications" className="text-xs h-6 gap-1 flex-1">
            <Bell className="h-3 w-3" /> Notifikasi
            {unreadCount > 0 && <Badge variant="destructive" className="text-[8px] h-3.5 px-1 ml-0.5">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs h-6 gap-1 flex-1">
            <Shield className="h-3 w-3" /> Pengaturan
          </TabsTrigger>
        </TabsList>

        {/* Notifications List */}
        <TabsContent value="notifications" className="mt-3 space-y-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs w-full" onClick={markAllAsRead}>
              <CheckCheck className="h-3.5 w-3.5 mr-1" /> Tandai Semua Terbaca
            </Button>
          )}

          {notifications.length === 0 ? (
            <Card className="p-6 border-border">
              <div className="text-center">
                <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">Belum Ada Notifikasi</p>
                <p className="text-xs text-muted-foreground">Notifikasi rental akan muncul di sini</p>
              </div>
            </Card>
          ) : (
            notifications.map((notif) => {
              const style = getNotifStyle(notif.notification_type);
              const Icon = style.icon;
              return (
                <Card
                  key={notif.id}
                  className={`p-2.5 border-border cursor-pointer transition-all hover:bg-muted/30 ${!notif.is_read ? 'border-l-2 border-l-primary bg-primary/5' : ''}`}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                >
                  <div className="flex gap-2">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-medium line-clamp-1 ${!notif.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                      <p className="text-[9px] text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-3 space-y-3">
          {/* Payment */}
          <Card className="border-border">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-chart-3" /> Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <SettingRow
                label="Pengingat Jatuh Tempo"
                description="Notifikasi sebelum tanggal pembayaran"
                checked={settings.payment_due_reminder}
                onToggle={(v) => updateSettings({ payment_due_reminder: v })}
              />
              {settings.payment_due_reminder && (
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <p className="text-[10px] text-muted-foreground">Ingatkan H-</p>
                  <Select
                    value={String(settings.payment_due_days_before)}
                    onValueChange={(v) => updateSettings({ payment_due_days_before: Number(v) })}
                  >
                    <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 5, 7].map(d => <SelectItem key={d} value={String(d)}>{d} hari</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <SettingRow
                label="Alert Keterlambatan"
                description="Peringatan saat pembayaran melewati jatuh tempo"
                checked={settings.payment_overdue_alert}
                onToggle={(v) => updateSettings({ payment_overdue_alert: v })}
              />
            </CardContent>
          </Card>

          {/* Lease */}
          <Card className="border-border">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-chart-1" /> Sewa & Kontrak
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <SettingRow
                label="Pengingat Berakhir Kontrak"
                description="Notifikasi sebelum kontrak sewa berakhir"
                checked={settings.lease_expiry_reminder}
                onToggle={(v) => updateSettings({ lease_expiry_reminder: v })}
              />
              {settings.lease_expiry_reminder && (
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <p className="text-[10px] text-muted-foreground">Ingatkan H-</p>
                  <Select
                    value={String(settings.lease_expiry_days_before)}
                    onValueChange={(v) => updateSettings({ lease_expiry_days_before: Number(v) })}
                  >
                    <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[7, 14, 30, 60].map(d => <SelectItem key={d} value={String(d)}>{d} hari</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <SettingRow
                label="Perubahan Status Booking"
                description="Konfirmasi, pembatalan, atau perubahan booking"
                checked={settings.booking_status_change}
                onToggle={(v) => updateSettings({ booking_status_change: v })}
              />
            </CardContent>
          </Card>

          {/* Maintenance & Inspection */}
          <Card className="border-border">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-primary" /> Perbaikan & Inspeksi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <SettingRow
                label="Update Status Perbaikan"
                description="Perubahan status permintaan maintenance"
                checked={settings.maintenance_status_update}
                onToggle={(v) => updateSettings({ maintenance_status_update: v })}
              />
              <SettingRow
                label="Permintaan Baru"
                description="Notifikasi saat ada request maintenance baru"
                checked={settings.maintenance_new_request}
                onToggle={(v) => updateSettings({ maintenance_new_request: v })}
              />
              <SettingRow
                label="Jadwal Inspeksi"
                description="Pengingat inspeksi properti"
                checked={settings.inspection_scheduled}
                onToggle={(v) => updateSettings({ inspection_scheduled: v })}
              />
            </CardContent>
          </Card>

          {/* Deposit & Communication */}
          <Card className="border-border">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-chart-5" /> Deposit & Komunikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <SettingRow
                label="Status Deposit"
                description="Perubahan status escrow deposit"
                checked={settings.deposit_status_change}
                onToggle={(v) => updateSettings({ deposit_status_change: v })}
              />
              <SettingRow
                label="Pesan Chat"
                description="Notifikasi pesan baru dari tenant/owner"
                checked={settings.chat_messages}
                onToggle={(v) => updateSettings({ chat_messages: v })}
              />
              <SettingRow
                label="Upload Dokumen"
                description="Notifikasi dokumen baru diunggah"
                checked={settings.document_uploads}
                onToggle={(v) => updateSettings({ document_uploads: v })}
              />
            </CardContent>
          </Card>

          {/* Delivery Preferences */}
          <Card className="border-border">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5 text-muted-foreground" /> Metode Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <SettingRow
                label="In-App"
                description="Notifikasi di dalam aplikasi"
                checked={settings.notify_in_app}
                onToggle={(v) => updateSettings({ notify_in_app: v })}
              />
              <SettingRow
                label="Email"
                description="Kirim notifikasi ke email"
                checked={settings.notify_email}
                onToggle={(v) => updateSettings({ notify_email: v })}
              />
              <SettingRow
                label="Push"
                description="Notifikasi push di perangkat"
                checked={settings.notify_push}
                onToggle={(v) => updateSettings({ notify_push: v })}
              />
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card className="border-border">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Moon className="h-3.5 w-3.5 text-chart-5" /> Jam Hening
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <SettingRow
                label="Aktifkan Jam Hening"
                description="Matikan notifikasi di jam tertentu"
                checked={settings.quiet_hours_enabled}
                onToggle={(v) => updateSettings({ quiet_hours_enabled: v })}
              />
              {settings.quiet_hours_enabled && (
                <div className="flex items-center gap-2 py-2 text-[10px] text-muted-foreground">
                  <span>Dari</span>
                  <input
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) => updateSettings({ quiet_hours_start: e.target.value })}
                    className="h-7 px-2 text-xs rounded border border-border bg-background"
                  />
                  <span>s/d</span>
                  <input
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) => updateSettings({ quiet_hours_end: e.target.value })}
                    className="h-7 px-2 text-xs rounded border border-border bg-background"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RentalNotificationCenter;
