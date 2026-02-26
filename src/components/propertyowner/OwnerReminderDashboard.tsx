import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRentalNotificationSettings, useRentalNotificationLog } from '@/hooks/useRentalNotifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Bell, BellRing, Clock, CalendarDays, DollarSign, Settings, Wrench,
  ClipboardCheck, MessageSquare, FileText, Shield, CheckCircle, XCircle,
  Loader2, Send, Volume2, VolumeX, Mail, Smartphone, Monitor,
  AlertTriangle, ChevronRight, Eye, RefreshCw
} from 'lucide-react';

const OwnerReminderDashboard = () => {
  const { settings, isLoading, updateSettings, isSaving } = useRentalNotificationSettings();
  const { notifications, unreadCount, isLoading: notifLoading, markAsRead, markAllAsRead } = useRentalNotificationLog();
  const [isTesting, setIsTesting] = useState(false);

  const triggerPaymentReminders = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('payment-reminders');
      if (error) throw error;
      toast.success(`Reminder dijalankan: ${data?.alerts_created || 0} alert baru`);
    } catch (e: any) {
      toast.error('Gagal menjalankan reminder: ' + e.message);
    } finally {
      setIsTesting(false);
    }
  };

  const triggerVisitReminders = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('visit-reminders');
      if (error) throw error;
      toast.success(`Visit reminder: ${data?.results?.sent_24h || 0} sent`);
    } catch (e: any) {
      toast.error('Gagal: ' + e.message);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  const reminderCategories = [
    {
      title: 'Pembayaran',
      icon: DollarSign,
      color: 'text-chart-1',
      bg: 'bg-chart-1/10',
      items: [
        {
          key: 'payment_due_reminder',
          label: 'Reminder Jatuh Tempo',
          desc: 'Kirim pengingat sebelum pembayaran jatuh tempo',
          enabled: settings.payment_due_reminder,
          daysKey: 'payment_due_days_before',
          daysValue: settings.payment_due_days_before,
          daysLabel: 'hari sebelum',
        },
        {
          key: 'payment_overdue_alert',
          label: 'Alert Terlambat',
          desc: 'Notifikasi ketika pembayaran melewati batas waktu',
          enabled: settings.payment_overdue_alert,
        },
      ],
    },
    {
      title: 'Kontrak Sewa',
      icon: FileText,
      color: 'text-primary',
      bg: 'bg-primary/10',
      items: [
        {
          key: 'lease_expiry_reminder',
          label: 'Reminder Masa Sewa',
          desc: 'Pengingat sebelum kontrak sewa berakhir',
          enabled: settings.lease_expiry_reminder,
          daysKey: 'lease_expiry_days_before',
          daysValue: settings.lease_expiry_days_before,
          daysLabel: 'hari sebelum',
        },
      ],
    },
    {
      title: 'Maintenance',
      icon: Wrench,
      color: 'text-chart-3',
      bg: 'bg-chart-3/10',
      items: [
        {
          key: 'maintenance_new_request',
          label: 'Request Baru',
          desc: 'Notifikasi ketika tenant mengajukan perbaikan baru',
          enabled: settings.maintenance_new_request,
        },
        {
          key: 'maintenance_status_update',
          label: 'Update Status',
          desc: 'Notifikasi perubahan status perbaikan',
          enabled: settings.maintenance_status_update,
        },
      ],
    },
    {
      title: 'Inspeksi',
      icon: ClipboardCheck,
      color: 'text-chart-5',
      bg: 'bg-chart-5/10',
      items: [
        {
          key: 'inspection_scheduled',
          label: 'Jadwal Inspeksi',
          desc: 'Pengingat sebelum inspeksi properti',
          enabled: settings.inspection_scheduled,
          daysKey: 'inspection_days_before',
          daysValue: settings.inspection_days_before,
          daysLabel: 'hari sebelum',
        },
      ],
    },
    {
      title: 'Lainnya',
      icon: Bell,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      items: [
        {
          key: 'deposit_status_change',
          label: 'Perubahan Deposit',
          desc: 'Notifikasi status deposit tenant',
          enabled: settings.deposit_status_change,
        },
        {
          key: 'booking_status_change',
          label: 'Perubahan Booking',
          desc: 'Notifikasi status booking berubah',
          enabled: settings.booking_status_change,
        },
        {
          key: 'chat_messages',
          label: 'Pesan Chat',
          desc: 'Notifikasi pesan baru dari tenant',
          enabled: settings.chat_messages,
        },
        {
          key: 'document_uploads',
          label: 'Upload Dokumen',
          desc: 'Notifikasi ketika tenant upload dokumen',
          enabled: settings.document_uploads,
        },
      ],
    },
  ];

  const getNotifIcon = (type: string) => {
    if (type.includes('payment') || type.includes('invoice')) return DollarSign;
    if (type.includes('maintenance')) return Wrench;
    if (type.includes('inspection')) return ClipboardCheck;
    if (type.includes('lease')) return FileText;
    if (type.includes('visit')) return CalendarDays;
    if (type.includes('deposit')) return Shield;
    return Bell;
  };

  const getNotifColor = (type: string) => {
    if (type.includes('overdue') || type.includes('critical')) return 'text-destructive';
    if (type.includes('reminder') || type.includes('due')) return 'text-chart-3';
    if (type.includes('maintenance')) return 'text-chart-1';
    return 'text-primary';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5 text-primary" />
          <h2 className="text-sm sm:text-base font-bold text-foreground">Reminder Otomatis</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-5">
              {unreadCount} baru
            </Badge>
          )}
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[10px] sm:text-xs gap-1"
            onClick={triggerPaymentReminders}
            disabled={isTesting}
          >
            {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
            Test
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-3">
        <TabsList className="h-8 p-0.5 bg-muted/50">
          <TabsTrigger value="settings" className="text-[10px] sm:text-xs h-6 gap-1 px-2.5">
            <Settings className="h-3 w-3" /> Pengaturan
          </TabsTrigger>
          <TabsTrigger value="history" className="text-[10px] sm:text-xs h-6 gap-1 px-2.5">
            <Clock className="h-3 w-3" /> Riwayat
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-[8px] px-1 py-0 h-4 ml-0.5">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-[10px] sm:text-xs h-6 gap-1 px-2.5">
            <CalendarDays className="h-3 w-3" /> Jadwal
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-3 mt-2">
          {/* Delivery Channels */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5 text-primary" />
                Kanal Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'notify_in_app', icon: Monitor, label: 'In-App', enabled: settings.notify_in_app },
                  { key: 'notify_email', icon: Mail, label: 'Email', enabled: settings.notify_email },
                  { key: 'notify_push', icon: Smartphone, label: 'Push', enabled: settings.notify_push },
                ].map((ch) => (
                  <div
                    key={ch.key}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      ch.enabled ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'
                    }`}
                    onClick={() => updateSettings({ [ch.key]: !ch.enabled })}
                  >
                    <ch.icon className={`h-4 w-4 ${ch.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-[10px] sm:text-xs font-medium">{ch.label}</span>
                    <Switch checked={ch.enabled} className="scale-75" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.quiet_hours_enabled ? (
                    <VolumeX className="h-4 w-4 text-chart-3" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Jam Tenang</p>
                    <p className="text-[10px] text-muted-foreground">
                      Jeda notifikasi: {settings.quiet_hours_start} - {settings.quiet_hours_end}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.quiet_hours_enabled}
                  onCheckedChange={(v) => updateSettings({ quiet_hours_enabled: v })}
                />
              </div>
              {settings.quiet_hours_enabled && (
                <div className="flex gap-2 mt-2.5">
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground">Mulai</Label>
                    <Input
                      type="time"
                      value={settings.quiet_hours_start}
                      onChange={(e) => updateSettings({ quiet_hours_start: e.target.value })}
                      className="h-7 text-xs mt-0.5"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px] text-muted-foreground">Selesai</Label>
                    <Input
                      type="time"
                      value={settings.quiet_hours_end}
                      onChange={(e) => updateSettings({ quiet_hours_end: e.target.value })}
                      className="h-7 text-xs mt-0.5"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reminder Categories */}
          {reminderCategories.map((cat) => (
            <Card key={cat.title}>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
                  <cat.icon className={`h-3.5 w-3.5 ${cat.color}`} />
                  {cat.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2.5">
                {cat.items.map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                      {item.daysKey && item.enabled && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Input
                            type="number"
                            min={1}
                            max={90}
                            value={item.daysValue}
                            onChange={(e) => updateSettings({ [item.daysKey!]: parseInt(e.target.value) || 1 })}
                            className="h-6 w-14 text-[10px] text-center"
                          />
                          <span className="text-[10px] text-muted-foreground">{item.daysLabel}</span>
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={item.enabled}
                      onCheckedChange={(v) => updateSettings({ [item.key]: v })}
                      className="mt-0.5"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-2 mt-2">
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" onClick={markAllAsRead}>
                <CheckCircle className="h-3 w-3" /> Tandai semua terbaca
              </Button>
            </div>
          )}
          {notifLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <Card className="p-4">
              <div className="text-center py-6">
                <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs font-medium">Belum ada notifikasi</p>
                <p className="text-[10px] text-muted-foreground">Reminder otomatis akan muncul di sini</p>
              </div>
            </Card>
          ) : (
            notifications.map((notif) => {
              const Icon = getNotifIcon(notif.notification_type);
              const color = getNotifColor(notif.notification_type);
              return (
                <Card
                  key={notif.id}
                  className={`p-2.5 cursor-pointer transition-all hover:bg-muted/50 ${
                    !notif.is_read ? 'border-primary/30 bg-primary/5' : ''
                  }`}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      !notif.is_read ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={`text-xs font-medium truncate ${!notif.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
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

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-3 mt-2">
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-primary" />
                Jadwal Otomatis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2.5">
              {[
                {
                  name: 'Payment Reminders',
                  desc: 'Cek invoice jatuh tempo, keterlambatan, dan auto-generate denda',
                  schedule: 'Setiap hari, 08:00 WIB',
                  icon: DollarSign,
                  color: 'text-chart-1',
                  action: triggerPaymentReminders,
                },
                {
                  name: 'Visit Reminders',
                  desc: 'Kirim reminder 24 jam & 1 jam sebelum kunjungan properti',
                  schedule: 'Setiap jam',
                  icon: CalendarDays,
                  color: 'text-chart-5',
                  action: triggerVisitReminders,
                },
                {
                  name: 'Lease Expiry Check',
                  desc: `Cek kontrak yang akan berakhir dalam ${settings.lease_expiry_days_before} hari`,
                  schedule: 'Setiap hari, 09:00 WIB',
                  icon: FileText,
                  color: 'text-primary',
                  action: null,
                },
                {
                  name: 'Inspection Reminders',
                  desc: `Ingatkan inspeksi ${settings.inspection_days_before} hari sebelumnya`,
                  schedule: 'Setiap hari, 07:00 WIB',
                  icon: ClipboardCheck,
                  color: 'text-chart-3',
                  action: null,
                },
              ].map((sched) => (
                <div key={sched.name} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/30">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0 border border-border">
                    <sched.icon className={`h-4 w-4 ${sched.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{sched.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{sched.desc}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                      <span className="text-[9px] text-muted-foreground">{sched.schedule}</span>
                    </div>
                  </div>
                  {sched.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[9px] px-2 gap-1"
                      onClick={sched.action}
                      disabled={isTesting}
                    >
                      {isTesting ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Send className="h-2.5 w-2.5" />}
                      Run
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Info card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-foreground">Tentang Jadwal Otomatis</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    Reminder otomatis berjalan via edge function yang dapat di-schedule dengan cron job.
                    Gunakan tombol "Run" untuk menjalankan reminder secara manual dan memastikan konfigurasi benar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerReminderDashboard;
