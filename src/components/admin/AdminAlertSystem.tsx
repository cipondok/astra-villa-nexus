
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Info, X, Eye, UserPlus, Building2, ShoppingCart, Shield, XCircle, ExternalLink, Trash2, CheckCheck, Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import ActivityDetailsModal from "./ActivityDetailsModal";
import { motion, AnimatePresence } from "framer-motion";

interface AdminAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  action_required: boolean;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

type AlertCategory = 'all' | 'verification' | 'property' | 'profile' | 'system' | 'other';

const PAGE_SIZE = 50;

const CATEGORY_TYPES: Record<AlertCategory, string[]> = {
  all: [],
  verification: ['kyc_verification', 'company_verification'],
  property: ['property_listing'],
  profile: ['profile_update', 'user_registration'],
  system: ['error', 'warning', 'system_error', 'success'],
  other: [],
};

const getCategory = (type: string): AlertCategory => {
  for (const [cat, types] of Object.entries(CATEGORY_TYPES)) {
    if (cat === 'all' || cat === 'other') continue;
    if (types.includes(type)) return cat as AlertCategory;
  }
  return 'other';
};

const AdminAlertSystem = () => {
  const [selectedAlert, setSelectedAlert] = useState<AdminAlert | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<AlertCategory>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteProgress, setDeleteProgress] = useState<{ total: number; deleted: number; isDeleting: boolean }>({ total: 0, deleted: 0, isDeleting: false });
  const [activityModal, setActivityModal] = useState<{
    isOpen: boolean;
    type: 'properties' | 'users';
    title: string;
  }>({
    isOpen: false,
    type: 'properties',
    title: ''
  });
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const invalidateAlertQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
    queryClient.invalidateQueries({ queryKey: ['admin-alerts-counts'] });
    queryClient.invalidateQueries({ queryKey: ['admin-alerts-type-counts'] });
  };

  // Get total/unread/read counts from server (no limit)
  const { data: alertCounts } = useQuery({
    queryKey: ['admin-alerts-counts'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('count_admin_alerts_by_status');
      if (error) throw error;
      return (data as { total: number; unread: number; read: number }) || { total: 0, unread: 0, read: 0 };
    },
  });

  // Get counts grouped by type from server
  const { data: typeCounts } = useQuery({
    queryKey: ['admin-alerts-type-counts'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('count_admin_alerts_by_type');
      if (error) throw error;
      return (data as Record<string, number>) || {};
    },
  });

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);
      
      if (error) throw error;
      return data as AdminAlert[];
    },
  });

  // Fetch today's new properties
  const { data: todayProperties } = useQuery({
    queryKey: ['today-properties'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, created_at, owner_id, status')
        .gte('created_at', today)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch today's new users
  const { data: todayUsers } = useQuery({
    queryKey: ['today-users'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .gte('created_at', today)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAlertQueries();
      showSuccess("Alert Marked", "Alert has been marked as read.");
    },
  });

  const clearAllReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_alerts')
        .delete()
        .eq('is_read', true);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAlertQueries();
      showSuccess("Cleared", "All read alerts have been removed.");
    },
  });

  const ALL_KNOWN_TYPES = [
    'kyc_verification', 'company_verification',
    'property_listing',
    'profile_update', 'user_registration',
    'error', 'warning', 'system_error', 'success',
  ];

  const deleteCategoryAlerts = async () => {
    const label = activeCategory === 'all' ? 'ALL' : activeCategory.toUpperCase();
    const count = activeCategory === 'all' ? (alertCounts?.total || alerts?.length || 0) : serverCategoryCounts[activeCategory];

    if (count === 0) return;
    if (!window.confirm(`Delete ${count} ${label} alerts permanently? This cannot be undone.`)) return;

    setDeleteProgress({ total: count, deleted: 0, isDeleting: true });

    try {
      let deletedCount = 0;

      if (activeCategory === 'all') {
        // Use RPC to delete ALL on server side
        const { data, error } = await (supabase.rpc as any)('delete_all_admin_alerts');
        if (error) throw error;
        deletedCount = data || count;
      } else {
        // Get types for this category
        const categoryTypes = CATEGORY_TYPES[activeCategory];

        if (activeCategory === 'other') {
          // "other" = types NOT in any known category
          const { data, error } = await (supabase.rpc as any)('delete_admin_alerts_except_types', {
            p_types: ALL_KNOWN_TYPES
          });
          if (error) throw error;
          deletedCount = data || 0;
        } else {
          const { data, error } = await (supabase.rpc as any)('delete_admin_alerts_by_types', {
            p_types: categoryTypes
          });
          if (error) throw error;
          deletedCount = data || 0;
        }
      }

      setDeleteProgress({ total: count, deleted: deletedCount, isDeleting: true });

      // Brief pause to show completed progress
      await new Promise(r => setTimeout(r, 500));

      invalidateAlertQueries();
      showSuccess("Deleted", `${deletedCount} ${label} alerts have been permanently deleted.`);
      setCurrentPage(1);
    } catch (error: any) {
      showError("Error", error.message || "Failed to delete alerts");
    } finally {
      setDeleteProgress({ total: 0, deleted: 0, isDeleting: false });
    }
  };

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_alerts')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAlertQueries();
      showSuccess("Done", "All alerts marked as read.");
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('admin_alerts')
        .delete()
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidateAlertQueries();
      showSuccess("Alert Deleted", "Alert has been deleted successfully.");
      setIsDialogOpen(false);
      setSelectedAlert(null);
    },
  });

  // Handle verification approval (KYC or Company)
  const handleApproveVerification = async () => {
    if (!selectedAlert?.reference_id) return;
    
    setIsProcessing(true);
    try {
      let userId: string | null = null;
      let notificationTitle = '';
      let notificationMessage = '';

      if (selectedAlert.type === 'kyc_verification') {
        // Get user_id from verification record
        const { data: verificationData } = await supabase
          .from('user_verification')
          .select('user_id')
          .eq('id', selectedAlert.reference_id)
          .single();
        
        userId = verificationData?.user_id || null;

        // Approve KYC verification
        const { error } = await supabase
          .from('user_verification')
          .update({
            identity_verified: true,
            verified_at: new Date().toISOString(),
            admin_notes: reviewNotes || 'Approved by admin'
          })
          .eq('id', selectedAlert.reference_id);
        
        if (error) throw error;

        notificationTitle = '✅ Identity Verification Approved';
        notificationMessage = 'Your identity verification has been approved. You now have full access to all platform features.';
      } else if (selectedAlert.type === 'company_verification') {
        userId = selectedAlert.reference_id; // reference_id is the user profile id

        // Approve company verification
        const { error } = await supabase
          .from('profiles')
          .update({
            company_verified: true,
            company_verified_at: new Date().toISOString()
          })
          .eq('id', selectedAlert.reference_id);
        
        if (error) throw error;

        notificationTitle = '✅ Company Verification Approved';
        notificationMessage = 'Your company/AHU has been verified. You can now list properties as a verified business.';
      }

      // Send notification to user
      if (userId) {
        await supabase.from('in_app_notifications').insert({
          user_id: userId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'verification',
          priority: 'high',
          action_url: '/settings',
          metadata: {
            verification_type: selectedAlert.type,
            status: 'approved',
            admin_notes: reviewNotes || null,
            approved_at: new Date().toISOString()
          }
        });
      }

      // Mark alert as resolved
      await supabase
        .from('admin_alerts')
        .update({ 
          action_required: false,
          metadata: {
            ...selectedAlert.metadata,
            resolved_at: new Date().toISOString(),
            resolution: 'approved',
            admin_notes: reviewNotes
          }
        })
        .eq('id', selectedAlert.id);

      invalidateAlertQueries();
      showSuccess("Approved", "Verification approved and user notified.");
      setIsDialogOpen(false);
      setSelectedAlert(null);
      setReviewNotes('');
    } catch (error: any) {
      showError("Error", error.message || "Failed to approve verification");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle verification denial
  const handleDenyVerification = async () => {
    if (!selectedAlert?.reference_id) return;
    if (!reviewNotes.trim()) {
      showError("Required", "Please provide a reason for denial");
      return;
    }
    
    setIsProcessing(true);
    try {
      let userId: string | null = null;
      let notificationTitle = '';
      let notificationMessage = '';

      if (selectedAlert.type === 'kyc_verification') {
        // Get user_id from verification record
        const { data: verificationData } = await supabase
          .from('user_verification')
          .select('user_id')
          .eq('id', selectedAlert.reference_id)
          .single();
        
        userId = verificationData?.user_id || null;

        // Deny KYC verification
        const { error } = await supabase
          .from('user_verification')
          .update({
            identity_verified: false,
            admin_notes: reviewNotes
          })
          .eq('id', selectedAlert.reference_id);
        
        if (error) throw error;

        notificationTitle = '❌ Identity Verification Denied';
        notificationMessage = `Your identity verification was not approved. Reason: ${reviewNotes}. Please review and resubmit your documents.`;
      } else if (selectedAlert.type === 'company_verification') {
        userId = selectedAlert.reference_id;

        // Deny company verification - keep as unverified
        const { error } = await supabase
          .from('profiles')
          .update({
            company_verified: false
          })
          .eq('id', selectedAlert.reference_id);
        
        if (error) throw error;

        notificationTitle = '❌ Company Verification Denied';
        notificationMessage = `Your company verification was not approved. Reason: ${reviewNotes}. Please check your company details and try again.`;
      }

      // Send notification to user
      if (userId) {
        await supabase.from('in_app_notifications').insert({
          user_id: userId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'verification',
          priority: 'high',
          action_url: '/settings',
          metadata: {
            verification_type: selectedAlert.type,
            status: 'denied',
            denial_reason: reviewNotes,
            denied_at: new Date().toISOString()
          }
        });
      }

      // Mark alert as resolved with denial
      await supabase
        .from('admin_alerts')
        .update({ 
          action_required: false,
          metadata: {
            ...selectedAlert.metadata,
            resolved_at: new Date().toISOString(),
            resolution: 'denied',
            denial_reason: reviewNotes
          }
        })
        .eq('id', selectedAlert.id);

      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
      showSuccess("Denied", "Verification denied and user notified.");
      setIsDialogOpen(false);
      setSelectedAlert(null);
      setReviewNotes('');
    } catch (error: any) {
      showError("Error", error.message || "Failed to deny verification");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle profile update approval (acknowledge changes are OK)
  const handleApproveProfileUpdate = async () => {
    if (!selectedAlert?.reference_id) return;
    setIsProcessing(true);
    try {
      // Notify user their profile changes were acknowledged
      await supabase.from('in_app_notifications').insert({
        user_id: selectedAlert.reference_id,
        title: '✅ Profile Update Approved',
        message: reviewNotes 
          ? `Your profile changes have been reviewed and approved. Note: ${reviewNotes}` 
          : 'Your recent profile changes have been reviewed and approved.',
        type: 'profile',
        priority: 'medium',
        action_url: '/profile',
        metadata: {
          status: 'approved',
          changed_fields: selectedAlert.metadata?.changed_fields,
          approved_at: new Date().toISOString()
        }
      });

      // Mark alert as resolved
      await supabase.from('admin_alerts').update({ 
        action_required: false,
        metadata: { ...selectedAlert.metadata, resolved_at: new Date().toISOString(), resolution: 'approved', admin_notes: reviewNotes }
      }).eq('id', selectedAlert.id);

      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
      showSuccess("Approved", "Profile changes approved and user notified.");
      setIsDialogOpen(false);
      setSelectedAlert(null);
      setReviewNotes('');
    } catch (error: any) {
      showError("Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle profile update denial (revert or flag)
  const handleDenyProfileUpdate = async () => {
    if (!selectedAlert?.reference_id || !reviewNotes.trim()) {
      showError("Required", "Please provide a reason for denial");
      return;
    }
    setIsProcessing(true);
    try {
      // Revert profile changes if we have the old values
      const changes = selectedAlert.metadata?.changes;
      if (changes && typeof changes === 'object') {
        const revertData: Record<string, any> = {};
        Object.keys(changes).forEach(field => {
          if (changes[field]?.old !== undefined) {
            revertData[field] = changes[field].old;
          }
        });
        if (Object.keys(revertData).length > 0) {
          await supabase.from('profiles').update(revertData).eq('id', selectedAlert.reference_id);
        }
      }

      // Notify user
      await supabase.from('in_app_notifications').insert({
        user_id: selectedAlert.reference_id,
        title: '❌ Profile Update Reverted',
        message: `Your recent profile changes were reverted by admin. Reason: ${reviewNotes}`,
        type: 'profile',
        priority: 'high',
        action_url: '/profile',
        metadata: {
          status: 'denied',
          denial_reason: reviewNotes,
          changed_fields: selectedAlert.metadata?.changed_fields,
          denied_at: new Date().toISOString()
        }
      });

      await supabase.from('admin_alerts').update({ 
        action_required: false,
        metadata: { ...selectedAlert.metadata, resolved_at: new Date().toISOString(), resolution: 'denied', denial_reason: reviewNotes }
      }).eq('id', selectedAlert.id);

      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] });
      showSuccess("Denied", "Profile changes reverted and user notified.");
      setIsDialogOpen(false);
      setSelectedAlert(null);
      setReviewNotes('');
    } catch (error: any) {
      showError("Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle property listing approval
  const handleApproveProperty = async () => {
    if (!selectedAlert?.reference_id) return;
    setIsProcessing(true);
    try {
      // Update property status to available
      await supabase.from('properties').update({ status: 'available' }).eq('id', selectedAlert.reference_id);

      // Notify property owner
      const ownerId = selectedAlert.metadata?.owner_id;
      if (ownerId) {
        await supabase.from('in_app_notifications').insert({
          user_id: ownerId,
          title: '✅ Property Listing Approved',
          message: `Your property "${selectedAlert.metadata?.title || 'listing'}" has been approved and is now live.`,
          type: 'property',
          priority: 'medium',
          action_url: `/property/${selectedAlert.reference_id}`,
          metadata: { property_id: selectedAlert.reference_id, status: 'approved', approved_at: new Date().toISOString() }
        });
      }

      await supabase.from('admin_alerts').update({ 
        action_required: false,
        metadata: { ...selectedAlert.metadata, resolved_at: new Date().toISOString(), resolution: 'approved', admin_notes: reviewNotes }
      }).eq('id', selectedAlert.id);

      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
      showSuccess("Approved", "Property listing approved and owner notified.");
      setIsDialogOpen(false);
      setSelectedAlert(null);
      setReviewNotes('');
    } catch (error: any) {
      showError("Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle property listing denial
  const handleDenyProperty = async () => {
    if (!selectedAlert?.reference_id || !reviewNotes.trim()) {
      showError("Required", "Please provide a reason for denial");
      return;
    }
    setIsProcessing(true);
    try {
      // Update property status to rejected
      await supabase.from('properties').update({ status: 'rejected' }).eq('id', selectedAlert.reference_id);

      const ownerId = selectedAlert.metadata?.owner_id;
      if (ownerId) {
        await supabase.from('in_app_notifications').insert({
          user_id: ownerId,
          title: '❌ Property Listing Denied',
          message: `Your property "${selectedAlert.metadata?.title || 'listing'}" was not approved. Reason: ${reviewNotes}`,
          type: 'property',
          priority: 'high',
          action_url: `/property/${selectedAlert.reference_id}`,
          metadata: { property_id: selectedAlert.reference_id, status: 'denied', denial_reason: reviewNotes, denied_at: new Date().toISOString() }
        });
      }

      await supabase.from('admin_alerts').update({ 
        action_required: false,
        metadata: { ...selectedAlert.metadata, resolved_at: new Date().toISOString(), resolution: 'denied', denial_reason: reviewNotes }
      }).eq('id', selectedAlert.id);

      queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
      showSuccess("Denied", "Property listing denied and owner notified.");
      setIsDialogOpen(false);
      setSelectedAlert(null);
      setReviewNotes('');
    } catch (error: any) {
      showError("Error", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check if alert is actionable
  const isActionableAlert = (type: string) => {
    return ['kyc_verification', 'company_verification', 'profile_update', 'property_listing'].includes(type);
  };

  const isVerificationAlert = (type: string) => {
    return ['kyc_verification', 'company_verification'].includes(type);
  };

  const handleViewAlert = (alert: AdminAlert) => {
    setSelectedAlert(alert);
    setIsDialogOpen(true);
    setReviewNotes('');
    
    // Mark as read when opened
    if (!alert.is_read) {
      markAsReadMutation.mutate(alert.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAlert(null);
    setReviewNotes('');
  };

  const handleShowPropertiesDetails = () => {
    setActivityModal({
      isOpen: true,
      type: 'properties',
      title: `Today's New Properties (${todayProperties?.length || 0})`
    });
  };

  const handleShowUsersDetails = () => {
    setActivityModal({
      isOpen: true,
      type: 'users',
      title: `Today's New Users (${todayUsers?.length || 0})`
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error':
      case 'warning':
      case 'system_error':
        return AlertTriangle;
      case 'success':
        return CheckCircle;
      case 'property_listing':
        return Building2;
      case 'user_registration':
        return UserPlus;
      case 'profile_update':
        return UserPlus;
      case 'sale':
        return ShoppingCart;
      case 'kyc_verification':
      case 'company_verification':
        return Shield;
      default:
        return Info;
    }
  };

  const getAlertColor = (type: string, priority: string) => {
    if (priority === 'high' || priority === 'critical') return 'text-destructive';
    if (type === 'error' || type === 'warning' || type === 'system_error') return 'text-chart-3';
    if (type === 'success') return 'text-chart-1';
    if (type === 'profile_update') return 'text-chart-3';
    if (type === 'property_listing') return 'text-chart-1';
    if (type === 'user_registration') return 'text-chart-2';
    if (type === 'kyc_verification' || type === 'company_verification') return 'text-primary';
    return 'text-chart-2';
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const unreadCount = alertCounts?.unread ?? alerts?.filter(alert => !alert.is_read).length ?? 0;
  const readCount = alertCounts?.read ?? alerts?.filter(alert => alert.is_read).length ?? 0;
  const todayPropertiesCount = todayProperties?.length || 0;
  const todayUsersCount = todayUsers?.length || 0;

  const serverCategoryCounts = useMemo(() => {
    if (!typeCounts) return { all: alertCounts?.total || 0, verification: 0, property: 0, profile: 0, system: 0, other: 0 };
    const counts = { all: alertCounts?.total || 0, verification: 0, property: 0, profile: 0, system: 0, other: 0 };
    for (const [type, cnt] of Object.entries(typeCounts)) {
      const cat = getCategory(type);
      counts[cat] += cnt as number;
    }
    return counts;
  }, [typeCounts, alertCounts]);

  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    if (activeCategory === 'all') return alerts;
    return alerts.filter(a => getCategory(a.type) === activeCategory);
  }, [alerts, activeCategory]);

  const totalPages = Math.ceil(filteredAlerts.length / PAGE_SIZE);
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAlerts.slice(start, start + PAGE_SIZE);
  }, [filteredAlerts, currentPage]);

  // Reset page when category changes
  const handleCategoryChange = (v: string) => {
    setActiveCategory(v as AlertCategory);
    setCurrentPage(1);
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const categoryTabs: { value: AlertCategory; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: serverCategoryCounts.all },
    { value: 'verification', label: 'Verification', count: serverCategoryCounts.verification },
    { value: 'property', label: 'Property', count: serverCategoryCounts.property },
    { value: 'profile', label: 'Profile', count: serverCategoryCounts.profile },
    { value: 'system', label: 'System', count: serverCategoryCounts.system },
    { value: 'other', label: 'Other', count: serverCategoryCounts.other },
  ];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4" />
              Admin Alerts & Today's Activity
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{alertCounts?.total ?? alerts?.length ?? 0} Total</Badge>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{unreadCount} Unread</Badge>
              <Badge variant="default" className="text-[10px] px-1.5 py-0">{readCount} Read</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Today's Activity Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="cursor-pointer rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors" onClick={handleShowPropertiesDetails}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Properties Today</p>
                  <p className="text-xl font-bold text-chart-1">{todayPropertiesCount}</p>
                </div>
                <Building2 className="h-5 w-5 text-chart-1 opacity-60" />
              </div>
            </div>
            <div className="cursor-pointer rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors" onClick={handleShowUsersDetails}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Users Today</p>
                  <p className="text-xl font-bold text-chart-2">{todayUsersCount}</p>
                </div>
                <UserPlus className="h-5 w-5 text-chart-2 opacity-60" />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList className="w-full h-auto flex flex-wrap gap-0.5 bg-muted/30 border border-border/30 p-0.5 rounded-md">
              {categoryTabs.map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-[10px] px-2 py-1 rounded data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 min-w-0"
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 text-[9px] opacity-70">({tab.count})</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Bulk Actions Bar */}
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="text-muted-foreground">
              Showing {filteredAlerts.length > 0 ? ((currentPage - 1) * PAGE_SIZE + 1) : 0}-{Math.min(currentPage * PAGE_SIZE, filteredAlerts.length)} of {filteredAlerts.length} alerts
            </span>
            <div className="flex gap-1.5 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending || unreadCount === 0}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark All Read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2 text-destructive hover:text-destructive"
                onClick={() => clearAllReadMutation.mutate()}
                disabled={clearAllReadMutation.isPending || readCount === 0}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear Read
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[10px] px-2 text-destructive hover:text-destructive"
                onClick={deleteCategoryAlerts}
                disabled={deleteProgress.isDeleting || filteredAlerts.length === 0}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {deleteProgress.isDeleting
                  ? `Deleting ${deleteProgress.deleted}/${deleteProgress.total}...`
                  : `Delete ${activeCategory === 'all' ? 'All' : activeCategory} (${filteredAlerts.length})`
                }
              </Button>
            </div>
          </div>

          {/* Delete Progress Bar */}
          {deleteProgress.isDeleting && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Deleting alerts...</span>
                <span>{deleteProgress.deleted} / {deleteProgress.total} · {deleteProgress.total - deleteProgress.deleted} remaining</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-destructive rounded-full transition-all duration-300"
                  style={{ width: `${(deleteProgress.deleted / deleteProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Slim Alert List */}
          <ScrollArea className="h-[400px] scroll-smooth">
            {isLoading ? (
              <div className="text-center py-4 text-xs text-muted-foreground">Loading alerts...</div>
            ) : paginatedAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No alerts in this category</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-0.5">
                  {paginatedAlerts.map((alert) => {
                    const Icon = getAlertIcon(alert.type);
                    return (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.15 }}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-muted/40 group ${
                          !alert.is_read ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                        }`}
                        onClick={() => handleViewAlert(alert)}
                      >
                        <Icon className={`h-3.5 w-3.5 shrink-0 ${getAlertColor(alert.type, alert.priority)}`} />
                        <span className={`text-xs truncate flex-1 min-w-0 ${!alert.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {alert.title}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 shrink-0 hidden sm:inline-flex">
                          {alert.type.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant={getPriorityVariant(alert.priority)} className="text-[9px] px-1 py-0 h-4 shrink-0">
                          {alert.priority}
                        </Badge>
                        {alert.action_required && (
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" title="Action required" />
                        )}
                        <span className="text-[9px] text-muted-foreground shrink-0 w-12 text-right">
                          {formatTimeAgo(alert.created_at)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAlertMutation.mutate(alert.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            )}
          </ScrollArea>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <span className="text-[10px] text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className="h-6 min-w-[24px] px-1.5 text-[10px]"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedAlert && (
                  <>
                    {(() => {
                      const Icon = getAlertIcon(selectedAlert.type);
                      return <Icon className={`h-5 w-5 ${getAlertColor(selectedAlert.type, selectedAlert.priority)}`} />;
                    })()}
                    {selectedAlert.title}
                  </>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDialog}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getPriorityVariant(selectedAlert.priority)}>
                  {selectedAlert.priority} priority
                </Badge>
                <Badge variant="outline">
                  {selectedAlert.type.replace('_', ' ')}
                </Badge>
                {selectedAlert.action_required && (
                  <Badge variant="destructive">
                    Action Required
                  </Badge>
                )}
                {!selectedAlert.action_required && selectedAlert.metadata?.resolution && (
                  <Badge variant="default" className={selectedAlert.metadata.resolution === 'approved' ? 'bg-chart-1 text-chart-1-foreground' : 'bg-chart-3 text-chart-3-foreground'}>
                    {selectedAlert.metadata.resolution === 'approved' ? 'Approved' : 'Denied'}
                  </Badge>
                )}
              </div>
              
              <Separator />
              
              <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap">
                {selectedAlert.message}
              </DialogDescription>

              {/* Metadata display for verification alerts */}
              {selectedAlert.metadata && isVerificationAlert(selectedAlert.type) && (
                <>
                  <Separator />
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">Verification Details</h4>
                    {selectedAlert.metadata.user_name && (
                      <p className="text-sm"><strong>User:</strong> {selectedAlert.metadata.user_name}</p>
                    )}
                    {selectedAlert.metadata.company_name && (
                      <p className="text-sm"><strong>Company:</strong> {selectedAlert.metadata.company_name}</p>
                    )}
                    {selectedAlert.metadata.registration_number && (
                      <p className="text-sm"><strong>Registration/SK:</strong> <span className="font-mono">{selectedAlert.metadata.registration_number}</span></p>
                    )}
                    {selectedAlert.metadata.user_found_in_ahu !== undefined && (
                      <p className="text-sm">
                        <strong>User Found in AHU:</strong>{' '}
                        <Badge variant={selectedAlert.metadata.user_found_in_ahu ? 'default' : 'destructive'} className="text-xs">
                          {selectedAlert.metadata.user_found_in_ahu ? 'Yes ✓' : 'No ✗'}
                        </Badge>
                      </p>
                    )}

                    {/* AHU Company Data from user */}
                    {selectedAlert.metadata.ahu_data && (
                      <div className="mt-3 p-3 rounded-lg bg-background border border-border space-y-2">
                        <h5 className="text-xs font-semibold text-primary uppercase flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          Data dari AHU (diisi oleh user)
                        </h5>
                        {selectedAlert.metadata.ahu_data.sk_number && (
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Nomor SK:</span>{' '}
                            <span className="font-mono text-foreground">{selectedAlert.metadata.ahu_data.sk_number}</span>
                          </div>
                        )}
                        {selectedAlert.metadata.ahu_data.company_address && (
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Alamat:</span>{' '}
                            <span className="text-foreground">{selectedAlert.metadata.ahu_data.company_address}</span>
                          </div>
                        )}
                        {selectedAlert.metadata.ahu_data.npwp && (
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">NPWP:</span>{' '}
                            <span className="font-mono text-foreground">{selectedAlert.metadata.ahu_data.npwp}</span>
                          </div>
                        )}
                        {selectedAlert.metadata.ahu_data.notary_name && (
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Notaris:</span>{' '}
                            <span className="text-foreground">{selectedAlert.metadata.ahu_data.notary_name}</span>
                          </div>
                        )}
                        {selectedAlert.metadata.ahu_data.company_phone && (
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Telepon:</span>{' '}
                            <span className="text-foreground">{selectedAlert.metadata.ahu_data.company_phone}</span>
                          </div>
                        )}
                        {selectedAlert.metadata.ahu_data.company_email && (
                          <div className="text-xs">
                            <span className="font-medium text-muted-foreground">Email:</span>{' '}
                            <span className="text-foreground">{selectedAlert.metadata.ahu_data.company_email}</span>
                          </div>
                        )}
                        {!selectedAlert.metadata.ahu_data.sk_number && !selectedAlert.metadata.ahu_data.company_address && (
                          <p className="text-xs text-muted-foreground italic">User tidak mengisi data AHU</p>
                        )}
                      </div>
                    )}

                    {selectedAlert.metadata.ahu_search_url && (
                      <a href={selectedAlert.metadata.ahu_search_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center gap-1 hover:underline mt-2">
                        <ExternalLink className="h-3 w-3" />
                        Open AHU Search Portal
                      </a>
                    )}
                    {selectedAlert.metadata.resolution && (
                      <p className="text-sm"><strong>Resolution:</strong> {selectedAlert.metadata.resolution}</p>
                    )}
                    {selectedAlert.metadata.admin_notes && (
                      <p className="text-sm"><strong>Admin Notes:</strong> {selectedAlert.metadata.admin_notes}</p>
                    )}
                    {selectedAlert.metadata.denial_reason && (
                      <p className="text-sm"><strong>Denial Reason:</strong> {selectedAlert.metadata.denial_reason}</p>
                    )}
                  </div>
                </>
              )}

              {/* Metadata display for profile update alerts */}
              {selectedAlert.metadata && selectedAlert.type === 'profile_update' && (
                <>
                  <Separator />
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">Profile Change Details</h4>
                    {selectedAlert.metadata.user_name && (
                      <p className="text-sm"><strong>User:</strong> {selectedAlert.metadata.user_name}</p>
                    )}
                    {selectedAlert.metadata.email && (
                      <p className="text-sm"><strong>Email:</strong> {selectedAlert.metadata.email}</p>
                    )}
                    {selectedAlert.metadata.changed_fields && (
                      <p className="text-sm"><strong>Changed Fields:</strong> {Array.isArray(selectedAlert.metadata.changed_fields) ? selectedAlert.metadata.changed_fields.join(', ') : selectedAlert.metadata.changed_fields}</p>
                    )}
                    {selectedAlert.metadata.changes && typeof selectedAlert.metadata.changes === 'object' && (
                      <div className="space-y-1 mt-2">
                        <h5 className="text-xs font-semibold text-muted-foreground uppercase">Changes</h5>
                        {Object.entries(selectedAlert.metadata.changes).map(([field, vals]: [string, any]) => (
                          <div key={field} className="text-xs bg-background p-2 rounded border">
                            <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>{' '}
                            <span className="text-destructive line-through">{vals?.old || '(empty)'}</span>
                            {' → '}
                            <span className="text-chart-1">{vals?.new || '(empty)'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedAlert.metadata.resolution && (
                      <p className="text-sm mt-2"><strong>Resolution:</strong> {selectedAlert.metadata.resolution}</p>
                    )}
                    {selectedAlert.metadata.denial_reason && (
                      <p className="text-sm"><strong>Denial Reason:</strong> {selectedAlert.metadata.denial_reason}</p>
                    )}
                  </div>
                </>
              )}

              {/* Metadata display for property listing alerts */}
              {selectedAlert.metadata && selectedAlert.type === 'property_listing' && (
                <>
                  <Separator />
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">Property Details</h4>
                    {selectedAlert.metadata.title && (
                      <p className="text-sm"><strong>Title:</strong> {selectedAlert.metadata.title}</p>
                    )}
                    {selectedAlert.metadata.property_type && (
                      <p className="text-sm"><strong>Type:</strong> {selectedAlert.metadata.property_type}</p>
                    )}
                    {selectedAlert.metadata.listing_type && (
                      <p className="text-sm"><strong>Listing:</strong> {selectedAlert.metadata.listing_type}</p>
                    )}
                    {selectedAlert.metadata.location && (
                      <p className="text-sm"><strong>Location:</strong> {selectedAlert.metadata.location}</p>
                    )}
                    {selectedAlert.metadata.price && (
                      <p className="text-sm"><strong>Price:</strong> ${Number(selectedAlert.metadata.price).toLocaleString()}</p>
                    )}
                    {selectedAlert.metadata.status && (
                      <p className="text-sm"><strong>Status:</strong> {selectedAlert.metadata.status}</p>
                    )}
                    {selectedAlert.metadata.resolution && (
                      <p className="text-sm mt-2"><strong>Resolution:</strong> {selectedAlert.metadata.resolution}</p>
                    )}
                  </div>
                </>
              )}

              {/* Review notes for actionable alerts */}
              {isActionableAlert(selectedAlert.type) && selectedAlert.action_required && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="review-notes">Admin Review Notes</Label>
                    <Textarea
                      id="review-notes"
                      placeholder="Add notes (required for denial)..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              {selectedAlert.reference_type && selectedAlert.reference_id && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <strong>Reference:</strong> {selectedAlert.reference_type} ({selectedAlert.reference_id.slice(0, 8)}...)
                  </div>
                </>
              )}
              
              <div className="text-sm text-muted-foreground">
                <strong>Created:</strong> {new Date(selectedAlert.created_at).toLocaleString()}
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                {/* Verification action buttons */}
                {isVerificationAlert(selectedAlert.type) && selectedAlert.action_required && (
                  <>
                    <Button variant="outline" onClick={handleDenyVerification} disabled={isProcessing}
                      className="text-destructive border-destructive hover:bg-destructive/10">
                      <XCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Deny'}
                    </Button>
                    <Button variant="default" onClick={handleApproveVerification} disabled={isProcessing}
                      className="bg-chart-1 text-chart-1-foreground hover:bg-chart-1/90">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </Button>
                  </>
                )}

                {/* Profile update action buttons */}
                {selectedAlert.type === 'profile_update' && selectedAlert.action_required && (
                  <>
                    <Button variant="outline" onClick={handleDenyProfileUpdate} disabled={isProcessing}
                      className="text-destructive border-destructive hover:bg-destructive/10">
                      <XCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Revert Changes'}
                    </Button>
                    <Button variant="default" onClick={handleApproveProfileUpdate} disabled={isProcessing}
                      className="bg-chart-1 text-chart-1-foreground hover:bg-chart-1/90">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Approve Changes'}
                    </Button>
                  </>
                )}

                {/* Property listing action buttons */}
                {selectedAlert.type === 'property_listing' && selectedAlert.action_required && (
                  <>
                    <Button variant="outline" onClick={handleDenyProperty} disabled={isProcessing}
                      className="text-destructive border-destructive hover:bg-destructive/10">
                      <XCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Reject Listing'}
                    </Button>
                    <Button variant="default" onClick={handleApproveProperty} disabled={isProcessing}
                      className="bg-chart-1 text-chart-1-foreground hover:bg-chart-1/90">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processing...' : 'Approve Listing'}
                    </Button>
                  </>
                )}

                {/* Standard alert buttons */}
                <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
                {!selectedAlert.is_read && (
                  <Button variant="secondary" onClick={() => markAsReadMutation.mutate(selectedAlert.id)}
                    disabled={markAsReadMutation.isPending}>
                    {markAsReadMutation.isPending ? 'Marking...' : 'Mark as Read'}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => deleteAlertMutation.mutate(selectedAlert.id)}
                  disabled={deleteAlertMutation.isPending} className="text-destructive hover:text-destructive">
                  {deleteAlertMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        isOpen={activityModal.isOpen}
        onClose={() => setActivityModal({ ...activityModal, isOpen: false })}
        type={activityModal.type}
        title={activityModal.title}
        data={activityModal.type === 'properties' ? (todayProperties || []) : (todayUsers || [])}
      />
    </>
  );
};

export default AdminAlertSystem;
