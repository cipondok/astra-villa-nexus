import React, { useState, useMemo } from 'react';
import { useInvestorAlertNotifications, useRunInvestorAlertsScan, useMarkInvestorAlertRead } from '@/hooks/useInvestorAlerts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bell, TrendingDown, TrendingUp, Flame, DollarSign, Play, Check, ExternalLink } from 'lucide-react';
import { formatDateID } from '@/lib/indonesianFormat';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const alertTypeConfig = {
  investor_price_drop: { icon: TrendingDown, label: 'Harga Turun', color: 'text-chart-4', bg: 'bg-chart-4/10', badge: 'bg-chart-4/15 text-chart-4 border-chart-4/30' },
  investor_high_rental_yield: { icon: DollarSign, label: 'Yield Tinggi', color: 'text-chart-1', bg: 'bg-chart-1/10', badge: 'bg-chart-1/15 text-chart-1 border-chart-1/30' },
  investor_high_deal_score: { icon: Flame, label: 'Deal Score', color: 'text-destructive', bg: 'bg-destructive/10', badge: 'bg-destructive/15 text-destructive border-destructive/30' },
  investor_undervalued_property: { icon: Flame, label: 'Di Bawah Pasar', color: 'text-destructive', bg: 'bg-destructive/10', badge: 'bg-destructive/15 text-destructive border-destructive/30' },
  investor_high_market_growth: { icon: TrendingUp, label: 'Pertumbuhan', color: 'text-primary', bg: 'bg-primary/10', badge: 'bg-primary/15 text-primary border-primary/30' },
  investor_high_investment_score: { icon: TrendingUp, label: 'Skor Investasi', color: 'text-chart-2', bg: 'bg-chart-2/10', badge: 'bg-chart-2/15 text-chart-2 border-chart-2/30' },
};

type AlertType = keyof typeof alertTypeConfig;

export default function InvestorAlertsPage() {
  const { data: notifications = [], isLoading } = useInvestorAlertNotifications();
  const scanMutation = useRunInvestorAlertsScan();
  const markReadMutation = useMarkInvestorAlertRead();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: notifications.length };
    for (const n of notifications) {
      counts[n.type] = (counts[n.type] || 0) + 1;
    }
    return counts;
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Alert Investor ASTRA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Notifikasi otomatis untuk peluang investasi properti
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">{unreadCount} belum dibaca</Badge>
          )}
          <Button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            size="sm"
          >
            {scanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            Scan Sekarang
          </Button>
        </div>
      </div>

      {/* Scan Result Summary */}
      {scanMutation.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(scanMutation.data.summary).map(([type, count]) => {
            const key = `investor_${type}` as AlertType;
            const config = alertTypeConfig[key];
            if (!config) return null;
            const Icon = config.icon;
            return (
              <Card key={type}>
                <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', config.bg)}>
                    <Icon className={cn('h-5 w-5', config.color)} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                    <p className="text-xl font-bold text-foreground">{count}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">Semua ({typeCounts.all || 0})</TabsTrigger>
          {Object.entries(alertTypeConfig).map(([type, config]) => (
            <TabsTrigger key={type} value={type} className="gap-1">
              <config.icon className="h-3.5 w-3.5" />
              {config.label} ({typeCounts[type] || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Belum ada alert investor.</p>
                <p className="text-xs mt-1">Klik "Scan Sekarang" untuk memulai analisis.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const config = alertTypeConfig[notif.type as AlertType];
                if (!config) return null;
                const Icon = config.icon;
                const metadata = (notif.metadata || {}) as Record<string, any>;

                return (
                  <Card
                    key={notif.id}
                    className={cn(
                      'transition-all hover:shadow-md cursor-pointer',
                      !notif.is_read && 'border-l-4 border-l-primary'
                    )}
                  >
                    <CardContent className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg shrink-0 mt-0.5', config.bg)}>
                          <Icon className={cn('h-4 w-4', config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-foreground line-clamp-1">{notif.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                            </div>
                            <Badge variant="outline" className={cn('text-[10px] shrink-0', config.badge)}>
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-muted-foreground">
                              {formatDateID(notif.created_at)}
                            </span>
                            {metadata.score && (
                              <span className="text-[10px] font-mono text-muted-foreground">
                                Skor: {metadata.score}
                              </span>
                            )}
                            <div className="flex-1" />
                            {!notif.is_read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-[10px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markReadMutation.mutate(notif.id);
                                }}
                              >
                                <Check className="h-3 w-3 mr-1" /> Tandai Dibaca
                              </Button>
                            )}
                            {notif.property_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-[10px]"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/property/${notif.property_id}`);
                                }}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" /> Lihat
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
