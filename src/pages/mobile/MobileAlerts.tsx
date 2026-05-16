import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bell, TrendingDown, TrendingUp, Gem, BarChart3, 
  ChevronRight, Zap, CheckCircle2 
} from 'lucide-react';
import { useDealAlerts, useMarkDealAlertRead, useRunDealAlertsScan, DealAlert } from '@/hooks/useDealAlerts';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const alertIcons: Record<string, React.ElementType> = {
  price_drop: TrendingDown,
  high_rental_yield: TrendingUp,
  undervalued_property: Gem,
  high_market_growth: BarChart3,
};

const alertColors: Record<string, string> = {
  price_drop: 'text-emerald-500 bg-emerald-500/10',
  high_rental_yield: 'text-blue-500 bg-blue-500/10',
  undervalued_property: 'text-gold-primary bg-gold-primary/10',
  high_market_growth: 'text-purple-500 bg-purple-500/10',
};

const MobileAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: alerts, isLoading, unreadCount } = useDealAlerts();
  const markRead = useMarkDealAlertRead();
  const runScan = useRunDealAlertsScan();

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Bell className="h-12 w-12 text-gold-primary mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Sign in for AI alerts</h2>
          <p className="text-sm text-muted-foreground">Get notified about investment opportunities</p>
          <button onClick={() => navigate('/auth')} className="btn-gold-orange px-8 py-3">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleAlertClick = (alert: DealAlert) => {
    if (!alert.is_read) markRead.mutate(alert.id);
    if (alert.property_id) navigate(`/properties/${alert.property_id}`);
  };

  const getAlertType = (alert: DealAlert): string => {
    const meta = alert.metadata as any;
    if (meta?.alert_name) {
      if (meta.alert_name.includes('price')) return 'price_drop';
      if (meta.alert_name.includes('yield')) return 'high_rental_yield';
      if (meta.alert_name.includes('undervalued') || meta.alert_name.includes('deal')) return 'undervalued_property';
      if (meta.alert_name.includes('growth')) return 'high_market_growth';
    }
    return 'price_drop';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">AI Alerts</h1>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} new opportunities` : 'Investment opportunities'}
            </p>
          </div>
          <button
            onClick={() => runScan.mutate()}
            disabled={runScan.isPending}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium active:scale-95 transition-all",
              "bg-gold-primary/10 text-gold-primary border border-gold-primary/20",
              runScan.isPending && "opacity-50"
            )}
          >
            <Zap className={cn("h-3.5 w-3.5", runScan.isPending && "animate-pulse")} />
            Scan Now
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="px-4 py-3 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))
        ) : !alerts?.length ? (
          <div className="text-center py-16 space-y-3">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No alerts yet</p>
            <p className="text-xs text-muted-foreground">Save search alerts to get notified about deals</p>
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const type = getAlertType(alert);
            const Icon = alertIcons[type] || Bell;
            const colorClass = alertColors[type] || 'text-muted-foreground bg-muted/50';

            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => handleAlertClick(alert)}
                className={cn(
                  "flex items-start gap-3 p-3.5 rounded-xl border active:scale-[0.98] transition-transform cursor-pointer",
                  alert.is_read
                    ? 'bg-card border-border/30'
                    : 'bg-gold-primary/[0.03] border-gold-primary/20'
                )}
              >
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", colorClass)}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={cn(
                      "text-xs line-clamp-1",
                      alert.is_read ? 'font-medium text-foreground' : 'font-semibold text-foreground'
                    )}>
                      {alert.title}
                    </h3>
                    {!alert.is_read && (
                      <span className="w-2 h-2 rounded-full bg-gold-primary shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{alert.message}</p>
                  <p className="text-[9px] text-muted-foreground/60 mt-1">
                    {new Date(alert.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MobileAlerts;
