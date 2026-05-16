import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import Price from '@/components/ui/Price';
import { useDealAlerts, useMarkDealAlertRead, useRunDealAlertsScan, DealAlert } from '@/hooks/useDealAlerts';
import { useNavigate } from 'react-router-dom';
import {
  Flame, Bell, Check, ExternalLink, TrendingDown,
  Sparkles, RefreshCw, ChevronRight, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface DealAlertsListProps {
  className?: string;
  compact?: boolean;
}

function DealAlertItem({ alert, onRead, onView }: {
  alert: DealAlert;
  onRead: (id: string) => void;
  onView: (propertyId: string) => void;
}) {
  const dealPct = alert.metadata?.deal_score_percent || 0;
  const isStrong = dealPct >= 15;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group relative p-3 rounded-xl border transition-all cursor-pointer",
        alert.is_read
          ? "border-border/30 bg-card/50"
          : "border-primary/20 bg-primary/[0.03] hover:border-primary/40"
      )}
      onClick={() => {
        if (!alert.is_read) onRead(alert.id);
        if (alert.property_id) onView(alert.property_id);
      }}
    >
      {/* Unread indicator */}
      {!alert.is_read && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
          isStrong ? "bg-emerald-500/15" : "bg-amber-500/15"
        )}>
          <Flame className={cn("h-4 w-4", isStrong ? "text-emerald-500" : "text-amber-500")} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-xs font-semibold text-foreground truncate">{alert.title}</p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{alert.message}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {dealPct > 0 && (
              <Badge className={cn(
                "text-[9px] font-semibold",
                isStrong
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              )}>
                <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                {dealPct}% below FMV
              </Badge>
            )}
            {alert.metadata?.fair_market_value && (
              <span className="text-[9px] text-muted-foreground">
                FMV: <Price amount={alert.metadata.fair_market_value} short />
              </span>
            )}
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 ml-auto">
              <Clock className="h-2.5 w-2.5" />
              {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Action */}
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}

const DealAlertsList: React.FC<DealAlertsListProps> = ({ className, compact }) => {
  const { data: alerts, isLoading, unreadCount } = useDealAlerts();
  const markRead = useMarkDealAlertRead();
  const runScan = useRunDealAlertsScan();
  const navigate = useNavigate();

  const handleView = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  if (isLoading) {
    return (
      <Card className={cn("border-border/40", className)}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  const displayAlerts = compact ? (alerts || []).slice(0, 5) : (alerts || []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className={cn("border-border/40 overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <Bell className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <CardTitle className="text-sm font-bold">Deal Alerts</CardTitle>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0 h-4">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => runScan.mutate()}
              disabled={runScan.isPending}
            >
              <RefreshCw className={cn("h-3 w-3", runScan.isPending && "animate-spin")} />
              Scan Now
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {displayAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">No deal alerts yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set up saved searches to receive alerts when undervalued properties match your criteria
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => runScan.mutate()}
                disabled={runScan.isPending}
              >
                <RefreshCw className={cn("h-3 w-3", runScan.isPending && "animate-spin")} />
                Run Manual Scan
              </Button>
            </div>
          ) : (
            <ScrollArea className={compact ? "max-h-[400px]" : "max-h-[600px]"}>
              <div className="space-y-2 pr-2">
                <AnimatePresence>
                  {displayAlerts.map((alert) => (
                    <DealAlertItem
                      key={alert.id}
                      alert={alert}
                      onRead={(id) => markRead.mutate(id)}
                      onView={handleView}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DealAlertsList;
