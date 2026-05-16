import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useRevenueAlertConfig, useRevenueAlerts } from '@/hooks/useRevenueAlertConfig';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Bell, BellOff, AlertTriangle, TrendingDown, DollarSign,
  Building2, Clock, Save, Loader2, CheckCircle2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ALERT_TYPE_META: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  revenue_drop: { icon: TrendingDown, color: 'text-destructive', label: 'Revenue Drop' },
  commission_overbudget: { icon: DollarSign, color: 'text-chart-3', label: 'Commission Over Budget' },
  rental_revenue_low: { icon: Building2, color: 'text-chart-4', label: 'Low Rental Revenue' },
};

export default function RevenueAlertSettings() {
  const { config, updateConfig } = useRevenueAlertConfig();
  const { data: alerts = [], isLoading: alertsLoading } = useRevenueAlerts();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    is_enabled: true,
    daily_revenue_min: 0,
    daily_commission_max: 0,
    rental_revenue_min: 0,
    alert_cooldown_hours: 24,
  });

  useEffect(() => {
    if (config.data) {
      setForm({
        is_enabled: config.data.is_enabled,
        daily_revenue_min: config.data.daily_revenue_min,
        daily_commission_max: config.data.daily_commission_max,
        rental_revenue_min: config.data.rental_revenue_min,
        alert_cooldown_hours: config.data.alert_cooldown_hours,
      });
    }
  }, [config.data]);

  // Real-time subscription for revenue alerts
  useEffect(() => {
    const channel = supabase
      .channel('revenue-alerts-rt')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_alerts',
        filter: 'alert_category=eq.revenue',
      }, (payload) => {
        const alert = payload.new as any;
        const meta = ALERT_TYPE_META[alert.type];
        toast.warning(alert.title, { description: alert.message, duration: 8000 });
        queryClient.invalidateQueries({ queryKey: ['revenue-alerts'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const handleSave = () => {
    updateConfig.mutate({
      is_enabled: form.is_enabled,
      daily_revenue_min: form.daily_revenue_min,
      daily_commission_max: form.daily_commission_max,
      rental_revenue_min: form.rental_revenue_min,
      alert_cooldown_hours: form.alert_cooldown_hours,
    });
  };

  const isDirty = config.data && (
    form.is_enabled !== config.data.is_enabled ||
    form.daily_revenue_min !== config.data.daily_revenue_min ||
    form.daily_commission_max !== config.data.daily_commission_max ||
    form.rental_revenue_min !== config.data.rental_revenue_min ||
    form.alert_cooldown_hours !== config.data.alert_cooldown_hours
  );

  if (config.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4 text-chart-3" /> Revenue Alert Configuration
            </CardTitle>
            <div className="flex items-center gap-3">
              <Label htmlFor="alert-toggle" className="text-xs text-muted-foreground cursor-pointer">
                {form.is_enabled ? 'Active' : 'Disabled'}
              </Label>
              <Switch
                id="alert-toggle"
                checked={form.is_enabled}
                onCheckedChange={(v) => setForm(prev => ({ ...prev, is_enabled: v }))}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!form.is_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                Min Daily Revenue (IDR)
              </Label>
              <Input
                type="number"
                value={form.daily_revenue_min}
                onChange={(e) => setForm(prev => ({ ...prev, daily_revenue_min: Number(e.target.value) }))}
                placeholder="0 = disabled"
                className="bg-background/50"
              />
              <p className="text-[10px] text-muted-foreground">Alert when total daily revenue drops below this amount</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-chart-3" />
                Max Daily Commission (IDR)
              </Label>
              <Input
                type="number"
                value={form.daily_commission_max}
                onChange={(e) => setForm(prev => ({ ...prev, daily_commission_max: Number(e.target.value) }))}
                placeholder="0 = disabled"
                className="bg-background/50"
              />
              <p className="text-[10px] text-muted-foreground">Alert when commission payouts exceed this budget</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-chart-4" />
                Min Daily Rental Revenue (IDR)
              </Label>
              <Input
                type="number"
                value={form.rental_revenue_min}
                onChange={(e) => setForm(prev => ({ ...prev, rental_revenue_min: Number(e.target.value) }))}
                placeholder="0 = disabled"
                className="bg-background/50"
              />
              <p className="text-[10px] text-muted-foreground">Alert when rental revenue falls below this threshold</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                Cooldown Period (hours)
              </Label>
              <Input
                type="number"
                min={1}
                max={168}
                value={form.alert_cooldown_hours}
                onChange={(e) => setForm(prev => ({ ...prev, alert_cooldown_hours: Number(e.target.value) }))}
                className="bg-background/50"
              />
              <p className="text-[10px] text-muted-foreground">Prevent duplicate alerts within this window</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            {config.data?.updated_at && (
              <p className="text-[10px] text-muted-foreground">
                Last updated {formatDistanceToNow(new Date(config.data.updated_at), { addSuffix: true })}
              </p>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty || updateConfig.isPending}
              className="gap-1.5"
            >
              {updateConfig.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Revenue Alerts */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-chart-3" /> Recent Revenue Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-8 w-8 text-chart-1 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">All Clear</p>
              <p className="text-xs text-muted-foreground mt-1">No revenue alerts triggered recently</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => {
                const meta = ALERT_TYPE_META[alert.type] || { icon: Bell, color: 'text-muted-foreground', label: alert.type };
                const Icon = meta.icon;
                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      alert.is_read ? 'border-border/30 bg-background/30' : 'border-chart-3/30 bg-chart-3/5'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md ${alert.is_read ? 'bg-muted/50' : 'bg-chart-3/10'}`}>
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{alert.title}</p>
                        <Badge variant="outline" className={`text-[10px] ${
                          alert.priority === 'high' ? 'text-destructive border-destructive/30' :
                          alert.priority === 'critical' ? 'text-destructive border-destructive/50' :
                          'text-muted-foreground border-border'
                        }`}>
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {!alert.is_read && (
                      <div className="w-2 h-2 rounded-full bg-chart-3 flex-shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
