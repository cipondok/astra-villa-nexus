import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Bell, CheckCheck, Trash2, Eye, AlertTriangle, Info, XCircle, Home, Building2, UserPlus, ExternalLink, ClipboardCopy, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AdminNotificationsCenterProps {
  onSectionChange?: (section: string) => void;
}

type CategoryFilter = 'all' | 'system' | 'property' | 'application' | 'other';

const categorize = (type: string): CategoryFilter => {
  if (['critical', 'security', 'warning', 'info'].includes(type)) return 'system';
  if (['property_owner_application', 'vendor_application', 'agent_application'].includes(type)) return 'application';
  if (type.includes('property') || type.includes('listing')) return 'property';
  return 'other';
};

const getCategoryTypes = (category: CategoryFilter): string[] => {
  switch (category) {
    case 'system': return ['critical', 'security', 'warning', 'info'];
    case 'property': return ['property', 'listing', 'property_status'];
    case 'application': return ['property_owner_application', 'vendor_application', 'agent_application'];
    case 'other': return ['user', 'vendor', 'daily_summary'];
    default: return [];
  }
};

const getCategoryLabel = (category: CategoryFilter): string => {
  switch (category) {
    case 'system': return 'System';
    case 'property': return 'Property';
    case 'application': return 'Application';
    case 'other': return 'Other';
    default: return '';
  }
};

export function AdminNotificationsCenter({ onSectionChange }: AdminNotificationsCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryTab, setCategoryTab] = useState<CategoryFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number; active: boolean }>({ current: 0, total: 0, active: false });
  const queryClient = useQueryClient();

  // Fetch actual total and unread counts from DB using RPC (bypasses row limits)
  const { data: actualCounts = { total: 0, unread: 0 } } = useQuery({
    queryKey: ['admin-notifications-counts'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_admin_alerts_counts');
      if (error) {
        console.error('Count query error:', error);
        return { total: 0, unread: 0 };
      }
      return data as { total: number; unread: number };
    },
    refetchInterval: 30000,
  });

  // Fetch displayed notifications (limited to 1000 for UI)
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['admin-all-notifications', filter],
    queryFn: async () => {
      let query = supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'read') {
        query = query.eq('is_read', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Category counts & filtered list
  const categoryCounts = useMemo(() => {
    const counts = { all: 0, system: 0, property: 0, application: 0, other: 0 };
    notifications.forEach(n => {
      counts.all++;
      counts[categorize(n.type)]++;
    });
    return counts;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (categoryTab === 'all') return notifications;
    return notifications.filter(n => categorize(n.type) === categoryTab);
  }, [notifications, categoryTab]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-counts'] });
      toast.success('Notification marked as read');
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-counts'] });
      toast.success('All notifications marked as read');
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-counts'] });
      toast.success('Notification deleted');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete notification');
    },
  });

  // Helper: batch delete by IDs with progress
  const batchDeleteIds = async (ids: string[]) => {
    const chunkSize = 20;
    let deleted = 0;
    setDeleteProgress({ current: 0, total: ids.length, active: true });
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const { error } = await supabase
        .from('admin_alerts')
        .delete()
        .in('id', chunk);
      if (error) {
        console.error('Batch delete chunk error:', error);
        // Continue with remaining chunks instead of failing entirely
      }
      deleted += chunk.length;
      setDeleteProgress({ current: deleted, total: ids.length, active: true });
    }
  };

  // Bulk delete mutation with progress
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await batchDeleteIds(ids);
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      setDeleteProgress(prev => ({ ...prev, active: false }));
      queryClient.invalidateQueries({ queryKey: ['admin-all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-counts'] });
      toast.success(`Notifications deleted successfully`);
    },
    onError: (error) => {
      setDeleteProgress(prev => ({ ...prev, active: false }));
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete selected notifications');
    },
  });

  // Clear all: fetch ALL ids from DB (not just displayed), then batch delete
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      // First get total count
      const { count, error: countErr } = await supabase
        .from('admin_alerts')
        .select('*', { count: 'exact', head: true });
      if (countErr) throw countErr;
      const total = count || 0;
      if (total === 0) return;

      setDeleteProgress({ current: 0, total, active: true });
      let deleted = 0;
      const batchSize = 500;

      // Loop: fetch a batch of IDs, delete them, repeat until none left
      while (true) {
        const { data: batch, error: fetchErr } = await supabase
          .from('admin_alerts')
          .select('id')
          .limit(batchSize);
        if (fetchErr) throw fetchErr;
        if (!batch || batch.length === 0) break;

        const ids = batch.map(r => r.id);
        const chunkSize = 20;
        for (let i = 0; i < ids.length; i += chunkSize) {
          const chunk = ids.slice(i, i + chunkSize);
          const { error: delErr } = await supabase
            .from('admin_alerts')
            .delete()
            .in('id', chunk);
          if (delErr) console.error('Clear chunk error:', delErr);
          deleted += chunk.length;
          setDeleteProgress({ current: deleted, total, active: true });
        }
      }
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      setDeleteProgress(prev => ({ ...prev, active: false }));
      queryClient.invalidateQueries({ queryKey: ['admin-all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-counts'] });
      toast.success('All notifications cleared');
    },
    onError: (error) => {
      setDeleteProgress(prev => ({ ...prev, active: false }));
      console.error('Clear all error:', error);
      toast.error('Failed to clear notifications');
    },
  });

  // Clear category: delete all notifications of a specific category type
  const clearCategoryMutation = useMutation({
    mutationFn: async (category: CategoryFilter) => {
      const types = getCategoryTypes(category);
      if (types.length === 0) return;

      // Get accurate count first
      const { data: countData, error: countErr } = await supabase.rpc('get_admin_alerts_count_by_types', { type_patterns: types });
      if (countErr) throw countErr;
      const total = (countData as number) || 0;
      if (total === 0) return;

      setDeleteProgress({ current: 0, total, active: true });

      // Use the server-side batch delete RPC
      // But we want progress, so do client-side batching
      let deleted = 0;
      const batchSize = 500;

      while (true) {
        // Build or-filter for types (exact match + pattern match for property/listing)
        const orFilter = types.map(t => `type.eq.${t},type.ilike.%${t}%`).join(',');
        const { data: batch, error: fetchErr } = await supabase
          .from('admin_alerts')
          .select('id')
          .or(orFilter)
          .limit(batchSize);
        if (fetchErr) throw fetchErr;
        if (!batch || batch.length === 0) break;

        const ids = batch.map(r => r.id);
        const chunkSize = 20;
        for (let i = 0; i < ids.length; i += chunkSize) {
          const chunk = ids.slice(i, i + chunkSize);
          const { error: delErr } = await supabase
            .from('admin_alerts')
            .delete()
            .in('id', chunk);
          if (delErr) console.error('Category delete chunk error:', delErr);
          deleted += chunk.length;
          setDeleteProgress({ current: deleted, total, active: true });
        }
      }
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      setDeleteProgress(prev => ({ ...prev, active: false }));
      queryClient.invalidateQueries({ queryKey: ['admin-all-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-counts'] });
      toast.success(`All ${getCategoryLabel(categoryTab)} notifications deleted`);
    },
    onError: (error) => {
      setDeleteProgress(prev => ({ ...prev, active: false }));
      console.error('Clear category error:', error);
      toast.error('Failed to delete category notifications');
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  const handleCopyToClipboard = (notification: any) => {
    const text = `[${notification.title}]: ${notification.message}`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard — paste in chat to fix');
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
      case 'security':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-chart-3" />;
      case 'property_owner_application':
        return <Home className="h-5 w-5 text-chart-2" />;
      case 'vendor_application':
        return <Building2 className="h-5 w-5 text-chart-4" />;
      case 'agent_application':
        return <UserPlus className="h-5 w-5 text-chart-1" />;
      default:
        return <Info className="h-5 w-5 text-chart-2" />;
    }
  };

  const isApplicationNotification = (type: string) => {
    return ['property_owner_application', 'vendor_application', 'agent_application'].includes(type);
  };

  const handleViewApplication = (notification: any) => {
    markAsReadMutation.mutate(notification.id);
    if (onSectionChange) {
      onSectionChange('upgrade-applications');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      case 'low':
        return 'bg-chart-2/10 text-chart-2 border-chart-2/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const unreadCount = actualCounts.unread;
  const totalCount = actualCounts.total;

  const handleCategoryChange = (tab: string) => {
    setCategoryTab(tab as CategoryFilter);
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Notifications Center
              </CardTitle>
              <CardDescription>
                Manage all system notifications and alerts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {unreadCount} Unread
              </Badge>
              <Badge variant="outline" className="text-sm">
                {totalCount.toLocaleString()} Total
              </Badge>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              {notifications.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={clearAllMutation.isPending || deleteProgress.active}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {clearAllMutation.isPending ? `Clearing...` : 'Clear All'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        Clear All Notifications
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete <strong>all {totalCount.toLocaleString()} notifications</strong> across every category. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => clearAllMutation.mutate()}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Yes, Delete All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar for delete/clear operations */}
          {deleteProgress.active && (
            <div className="mb-4 p-4 rounded-lg bg-muted/60 border border-border/40 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <Trash2 className="h-4 w-4 animate-pulse text-destructive" />
                  Deleting notifications...
                </span>
                <span className="text-muted-foreground font-mono">
                  {deleteProgress.current.toLocaleString()} / {deleteProgress.total.toLocaleString()}
                </span>
              </div>
              <Progress value={(deleteProgress.current / deleteProgress.total) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round((deleteProgress.current / deleteProgress.total) * 100)}% complete — {(deleteProgress.total - deleteProgress.current).toLocaleString()} remaining
              </p>
            </div>
          )}

          {/* Read status filter */}
          <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All ({totalCount.toLocaleString()})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount.toLocaleString()})</TabsTrigger>
              <TabsTrigger value="read">Read ({(totalCount - unreadCount).toLocaleString()})</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category tabs */}
          <Tabs value={categoryTab} onValueChange={handleCategoryChange}>
            <TabsList className="mb-4">
              {(['all', 'system', 'property', 'application', 'other'] as CategoryFilter[]).map(cat => (
                <TabsTrigger key={cat} value={cat} className="capitalize text-xs">
                  {cat} ({categoryCounts[cat]})
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-muted/60 border border-border/40">
                <Checkbox
                  checked={selectedIds.size === filteredNotifications.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium">{selectedIds.size} selected</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
                  disabled={bulkDeleteMutation.isPending || deleteProgress.active}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete Selected (${selectedIds.size})`}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            )}

            {/* Select all row + Delete All Category button when nothing selected */}
            {selectedIds.size === 0 && filteredNotifications.length > 0 && (
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={false}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select all</span>
                </div>
                {categoryTab !== 'all' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={clearCategoryMutation.isPending || deleteProgress.active}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {clearCategoryMutation.isPending ? 'Deleting...' : `Delete All ${getCategoryLabel(categoryTab)}`}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          Delete All {getCategoryLabel(categoryTab)} Notifications
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete <strong>all {getCategoryLabel(categoryTab)}</strong> notifications ({categoryCounts[categoryTab]} shown). This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => clearCategoryMutation.mutate(categoryTab)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Delete All {getCategoryLabel(categoryTab)}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}

            <TabsContent value={categoryTab} className="space-y-4 mt-0">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading notifications...
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-destructive mb-2">Error loading notifications</div>
                  <div className="text-sm text-muted-foreground">
                    {(error as Error).message || 'Please check your permissions'}
                  </div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications found in this category</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all ${
                      !notification.is_read
                        ? 'border-l-4 border-l-primary bg-accent/5'
                        : 'opacity-75'
                    } ${selectedIds.has(notification.id) ? 'ring-2 ring-primary/30' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div className="mt-1">
                          <Checkbox
                            checked={selectedIds.has(notification.id)}
                            onCheckedChange={() => toggleSelect(notification.id)}
                          />
                        </div>
                        <div className="mt-1">
                          {getAlertIcon(notification.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-base">
                                  {notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <span className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              {notification.action_required && (
                                <Badge variant="destructive" className="text-xs">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{new Date(notification.created_at).toLocaleString()}</span>
                              <span>•</span>
                              <span className="capitalize">{notification.alert_category}</span>
                              {notification.urgency_level && (
                                <>
                                  <span>•</span>
                                  <span>Urgency: {notification.urgency_level}/5</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {/* Copy to clipboard */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyToClipboard(notification)}
                                title="Copy to clipboard for chat"
                              >
                                <ClipboardCopy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                              {isApplicationNotification(notification.type) && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleViewApplication(notification)}
                                  className="bg-primary"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View Application
                                </Button>
                              )}
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsReadMutation.mutate(notification.id)}
                                  disabled={markAsReadMutation.isPending}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotificationMutation.mutate(notification.id)}
                                disabled={deleteNotificationMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
