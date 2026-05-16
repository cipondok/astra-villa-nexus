import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import {
  Bell, BellRing, CheckCheck, ArrowLeft, Clock,
  TrendingDown, Sparkles, Handshake, Building2,
  AlertTriangle, Eye, MessageSquare, ArrowUpRight,
  Flame, DollarSign, ChevronRight, Trash2, CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek } from "date-fns";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";

/* ─── Types ─── */
interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  user_id: string;
  metadata?: Record<string, unknown> | null;
  priority?: string | null;
  reference_id?: string | null;
  reference_type?: string | null;
}

type TabKey = 'all' | 'price' | 'elite' | 'deals' | 'system';

/* ─── Tab config ─── */
const tabs: { key: TabKey; label: string; icon: typeof Bell; types: string[] }[] = [
  { key: 'all', label: 'All Updates', icon: Bell, types: [] },
  { key: 'price', label: 'Price Alerts', icon: TrendingDown, types: ['price_drop', 'price_change', 'price_alert', 'price'] },
  { key: 'elite', label: 'Elite Opportunities', icon: Sparkles, types: ['elite_opportunity', 'opportunity', 'elite', 'investment'] },
  { key: 'deals', label: 'Deal Activity', icon: Handshake, types: ['deal', 'offer', 'transaction', 'negotiation', 'inquiry'] },
  { key: 'system', label: 'System', icon: AlertTriangle, types: ['system', 'admin', 'maintenance'] },
];

/* ─── Priority config ─── */
function getPriorityConfig(n: Notification) {
  const type = n.type?.toLowerCase() || '';
  const priority = (n.priority || '').toLowerCase();

  if (priority === 'critical' || priority === 'urgent' || type.includes('elite'))
    return { accent: 'border-l-chart-2', dot: 'bg-chart-2', label: 'Urgent', glow: true };
  if (priority === 'high' || type.includes('price_drop') || type.includes('price_alert'))
    return { accent: 'border-l-destructive', dot: 'bg-destructive', label: 'Important', glow: false };
  if (type.includes('deal') || type.includes('offer') || type.includes('transaction'))
    return { accent: 'border-l-primary', dot: 'bg-primary', label: null, glow: false };
  return { accent: 'border-l-transparent', dot: 'bg-muted-foreground', label: null, glow: false };
}

function getNotifIcon(type: string) {
  const t = type?.toLowerCase() || '';
  if (t.includes('price')) return <TrendingDown className="h-4 w-4 text-destructive" />;
  if (t.includes('elite') || t.includes('opportunity') || t.includes('investment')) return <Sparkles className="h-4 w-4 text-chart-2" />;
  if (t.includes('deal') || t.includes('offer') || t.includes('transaction')) return <Handshake className="h-4 w-4 text-primary" />;
  if (t.includes('inquiry')) return <MessageSquare className="h-4 w-4 text-chart-4" />;
  if (t.includes('property')) return <Building2 className="h-4 w-4 text-primary" />;
  if (t.includes('system') || t.includes('admin')) return <AlertTriangle className="h-4 w-4 text-chart-4" />;
  return <Bell className="h-4 w-4 text-muted-foreground" />;
}

/* ─── Date grouping ─── */
function getDateGroup(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isThisWeek(d)) return 'This Week';
  return format(d, 'MMMM d, yyyy');
}

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const groups = new Map<string, Notification[]>();
  for (const n of notifications) {
    const key = getDateGroup(n.created_at);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(n);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

/* ─── Swipeable notification card ─── */
function SwipeableNotifCard({
  notification,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (n: Notification) => void;
}) {
  const x = useMotionValue(0);
  const bg = useTransform(x, [-120, -60, 0], [
    'hsl(var(--destructive) / 0.15)',
    'hsl(var(--chart-2) / 0.1)',
    'transparent',
  ]);
  const opacity = useTransform(x, [-120, -80, 0], [0.6, 1, 1]);

  const pCfg = getPriorityConfig(notification);
  const meta = (notification.metadata || {}) as Record<string, string>;
  const thumb = meta.property_image || meta.propertyImage || meta.thumbnail;
  const propertyId = notification.reference_id || meta.property_id || meta.propertyId;

  const handleDragEnd = (_: never, info: PanInfo) => {
    if (info.offset.x < -100) {
      onDelete(notification.id);
    } else if (info.offset.x < -50) {
      onMarkRead(notification.id);
    }
  };

  return (
    <motion.div
      style={{ background: bg }}
      className="rounded-xl overflow-hidden relative"
    >
      {/* Swipe hint layer */}
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-end pr-3 pointer-events-none">
        <span className="text-[9px] text-muted-foreground">← swipe</span>
      </div>

      <motion.div
        style={{ x, opacity }}
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        className="relative z-10"
      >
        <Card
          className={cn(
            'border-border/50 border-l-2 overflow-hidden transition-colors duration-200 cursor-pointer',
            !notification.is_read ? 'bg-primary/[0.03]' : 'bg-card/60',
            pCfg.accent,
            pCfg.glow && !notification.is_read && 'shadow-[inset_0_0_20px_-8px_hsl(var(--chart-2)/0.08)]',
          )}
          onClick={() => onNavigate(notification)}
        >
          <CardContent className="p-2.5 sm:p-3">
            <div className="flex items-start gap-2.5">
              {/* Thumbnail or icon */}
              {thumb ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img src={thumb} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                  {getNotifIcon(notification.type)}
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className={cn(
                        'text-xs sm:text-sm truncate',
                        !notification.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80',
                      )}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', pCfg.dot)} />
                      )}
                      {pCfg.label && !notification.is_read && (
                        <Badge variant="outline" className="text-[7px] px-1 py-0 h-3.5 border-chart-2/30 text-chart-2 font-bold">
                          {pCfg.label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onMarkRead(notification.id); }}
                        className="h-6 w-6 p-0"
                        title="Mark as read"
                      >
                        <CheckCircle className="h-3 w-3 text-muted-foreground hover:text-chart-2" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); onDelete(notification.id); }}
                      className="h-6 w-6 p-0"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Footer: timestamp + quick actions */}
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/70">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </div>

                  {/* Quick action shortcuts */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {propertyId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[8px] text-primary hover:text-primary hover:bg-primary/10 gap-0.5"
                        onClick={() => onNavigate(notification)}
                      >
                        <Eye className="h-2.5 w-2.5" /> View
                      </Button>
                    )}
                    {(notification.type.includes('deal') || notification.type.includes('offer')) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[8px] text-chart-2 hover:text-chart-2 hover:bg-chart-2/10 gap-0.5"
                        onClick={() => onNavigate(notification)}
                      >
                        <Handshake className="h-2.5 w-2.5" /> Negotiate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════ */
const Notifications = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['user-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Notification[];
    },
    enabled: !!user?.id,
    staleTime: 15000,
  });

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('user_notifications').update({ is_read: true }).eq('id', id);
    refetch();
  }, [refetch]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    await supabase.from('user_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    refetch();
  }, [user?.id, refetch]);

  const deleteNotification = useCallback(async (id: string) => {
    await supabase.from('user_notifications').delete().eq('id', id);
    refetch();
  }, [refetch]);

  const handleNavigate = useCallback((n: Notification) => {
    // Mark read on click
    if (!n.is_read) markAsRead(n.id);

    const meta = (n.metadata || {}) as Record<string, string>;
    const propertyId = n.reference_id || meta.property_id || meta.propertyId;
    const type = n.type?.toLowerCase() || '';

    if (type.includes('offer') || type.includes('deal') || type.includes('negotiation')) {
      navigate('/my-offers');
    } else if (propertyId) {
      navigate(`/properties/${propertyId}`);
    }
  }, [navigate, markAsRead]);

  /* ── Filtered ── */
  const filtered = useMemo(() => {
    const tabCfg = tabs.find(t => t.key === activeTab);
    if (!tabCfg || tabCfg.types.length === 0) return notifications;
    return notifications.filter(n => {
      const t = n.type?.toLowerCase() || '';
      return tabCfg.types.some(tt => t.includes(tt));
    });
  }, [notifications, activeTab]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  /* ── Tab counts ── */
  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = { all: 0, price: 0, elite: 0, deals: 0, system: 0 };
    for (const n of notifications) {
      if (n.is_read) continue;
      counts.all++;
      const t = n.type?.toLowerCase() || '';
      for (const tab of tabs) {
        if (tab.key !== 'all' && tab.types.some(tt => t.includes(tt))) {
          counts[tab.key]++;
        }
      }
    }
    return counts;
  }, [notifications]);

  const totalUnread = tabCounts.all;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Notification Center" description="Real-time investment alerts and platform updates." noIndex />

      {/* ── Header ── */}
      <div className="border-b border-border/60 bg-card/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <BellRing className="h-5 w-5 text-primary" />
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-foreground">Notification Center</h1>
                <p className="text-[9px] sm:text-xs text-muted-foreground">
                  {totalUnread > 0 ? `${totalUnread} unread alert${totalUnread > 1 ? 's' : ''}` : 'All caught up'}
                </p>
              </div>
            </div>
            {totalUnread > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] sm:text-xs gap-1 text-primary hover:bg-primary/10"
              >
                <CheckCheck className="h-3 w-3" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-border/40 bg-background sticky top-[53px] sm:top-[57px] z-10">
        <div className="max-w-3xl mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium transition-colors flex-shrink-0 relative',
                  activeTab === tab.key
                    ? 'bg-primary/15 text-primary border border-primary/25'
                    : 'text-muted-foreground hover:bg-muted/50 border border-transparent',
                )}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
                {tabCounts[tab.key] > 0 && (
                  <span className={cn(
                    'min-w-[16px] h-4 rounded-full text-[8px] font-bold flex items-center justify-center px-1',
                    activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground',
                  )}>
                    {tabCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 border border-primary/15">
              <Bell className="h-8 w-8 text-primary/30" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {activeTab === 'all' ? 'No notifications yet' : `No ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {activeTab === 'price'
                ? 'Price change alerts will appear when tracked properties update'
                : activeTab === 'elite'
                  ? 'Elite opportunity signals will appear when high-score properties emerge'
                  : activeTab === 'deals'
                    ? 'Deal activity updates will show offer and negotiation progress'
                    : 'New alerts and updates will appear here'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.label}>
                {/* Date group header */}
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="text-[9px] text-muted-foreground/60">{group.items.length}</span>
                </div>

                {/* Notification cards */}
                <div className="space-y-1">
                  <AnimatePresence>
                    {group.items.map((notification, i) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -60, height: 0 }}
                        transition={{ delay: Math.min(i * 0.02, 0.2) }}
                      >
                        <SwipeableNotifCard
                          notification={notification}
                          onMarkRead={markAsRead}
                          onDelete={deleteNotification}
                          onNavigate={handleNavigate}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
