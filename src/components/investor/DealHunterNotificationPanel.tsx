import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, BellRing, X, Clock, Flame, Eye, Zap, CheckCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useDealHunterNotifications,
  useDealHunterUnreadCount,
  useMarkDealNotificationRead,
  useDismissDealNotification,
  getUrgencyCountdown,
  type DealHunterNotification,
} from '@/hooks/useDealHunterNotifications';
import { DEAL_CLASSIFICATIONS, DEAL_TIERS } from '@/hooks/useDealHunter';
import { useNavigate } from 'react-router-dom';

const UrgencyBadge = ({ expiresAt }: { expiresAt: string | null }) => {
  const [countdown, setCountdown] = useState(() => getUrgencyCountdown(expiresAt));

  useEffect(() => {
    if (!expiresAt) return;
    const iv = setInterval(() => setCountdown(getUrgencyCountdown(expiresAt)), 30000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  if (countdown.isExpired) {
    return <Badge variant="destructive" className="text-[10px] animate-pulse">Expired</Badge>;
  }

  const colors = {
    critical: 'bg-destructive/10 text-destructive border-destructive/30',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    normal: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Badge variant="outline" className={`text-[10px] gap-1 ${colors[countdown.urgencyLevel]}`}>
      <Clock className="h-3 w-3" />
      {countdown.label}
    </Badge>
  );
};

const NotificationItem = ({ notif, onRead, onDismiss }: {
  notif: DealHunterNotification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
  const navigate = useNavigate();
  const cls = DEAL_CLASSIFICATIONS[notif.deal_classification as keyof typeof DEAL_CLASSIFICATIONS];
  const tier = DEAL_TIERS[notif.deal_tier as keyof typeof DEAL_TIERS];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
        notif.is_read
          ? 'bg-muted/20 border-border/30'
          : 'bg-primary/5 border-primary/20 shadow-sm'
      }`}
      onClick={() => {
        if (!notif.is_read) onRead(notif.id);
        navigate(`/property/${notif.property_id}`);
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-sm">{cls?.icon}</span>
            <Badge variant="outline" className={`text-[9px] ${cls?.color}`}>{cls?.label}</Badge>
            {(notif.deal_tier === 'vip' || notif.deal_tier === 'institutional') && (
              <Badge variant="outline" className={`text-[9px] ${tier?.color}`}>{tier?.label}</Badge>
            )}
            <UrgencyBadge expiresAt={notif.expires_at} />
            {!notif.is_read && (
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
            )}
          </div>
          <p className="text-sm font-medium text-foreground truncate">{notif.property_title || notif.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5"><Zap className="h-3 w-3" /> Score {notif.deal_score}</span>
            <span className="flex items-center gap-0.5"><Flame className="h-3 w-3" /> Urgency {notif.urgency_score}</span>
            {notif.undervaluation_percent > 0 && (
              <span className="text-emerald-500">-{notif.undervaluation_percent.toFixed(1)}%</span>
            )}
            {notif.match_reason?.length > 0 && (
              <span className="text-primary">{notif.match_reason.length} DNA match{notif.match_reason.length > 1 ? 'es' : ''}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
          >
            <X className="h-3 w-3" />
          </Button>
          {notif.property_price && (
            <div className="text-[10px] text-right font-medium">
              Rp {(notif.property_price / 1e9).toFixed(1)}B
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DealHunterNotificationPanel = () => {
  const { data: notifications = [], isLoading } = useDealHunterNotifications(30);
  const { data: unreadCount = 0 } = useDealHunterUnreadCount();
  const markRead = useMarkDealNotificationRead();
  const dismiss = useDismissDealNotification();

  const vipNotifs = notifications.filter(n => n.deal_tier === 'vip' || n.deal_tier === 'institutional');
  const otherNotifs = notifications.filter(n => n.deal_tier === 'public');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {unreadCount > 0 ? (
              <BellRing className="h-4 w-4 text-primary animate-pulse" />
            ) : (
              <Bell className="h-4 w-4 text-muted-foreground" />
            )}
            Deal Alerts
            {unreadCount > 0 && (
              <Badge variant="default" className="text-[10px] h-5 min-w-[20px] justify-center">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => {
                notifications.filter(n => !n.is_read).forEach(n => markRead.mutate(n.id));
              }}
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground text-center">Loading alerts…</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No deal alerts yet</p>
            <p className="text-xs text-muted-foreground mt-1">DNA-matched opportunities will appear here</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="px-3 pb-3 space-y-3">
              {vipNotifs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 pt-1">
                    <Eye className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">VIP / Institutional</span>
                  </div>
                  <AnimatePresence mode="popLayout">
                    {vipNotifs.map(n => (
                      <NotificationItem
                        key={n.id}
                        notif={n}
                        onRead={(id) => markRead.mutate(id)}
                        onDismiss={(id) => dismiss.mutate(id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
              {otherNotifs.length > 0 && (
                <div className="space-y-2">
                  {vipNotifs.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Public Deals</span>
                    </div>
                  )}
                  <AnimatePresence mode="popLayout">
                    {otherNotifs.map(n => (
                      <NotificationItem
                        key={n.id}
                        notif={n}
                        onRead={(id) => markRead.mutate(id)}
                        onDismiss={(id) => dismiss.mutate(id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default DealHunterNotificationPanel;
