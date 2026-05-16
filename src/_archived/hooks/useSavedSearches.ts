import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, any>;
  query: string | null;
  email_notifications: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSavedSearches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchSearches = useCallback(async () => {
    if (!user) {
      setSavedSearches([]);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedSearches((data || []).map(d => ({
        ...d,
        filters: (d.filters as Record<string, any>) || {},
        email_notifications: (d as any).email_notifications ?? false,
        is_active: (d as any).is_active ?? true,
      })));
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const { count } = await supabase
        .from('search_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadNotifications(count || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchSearches();
    fetchUnreadCount();
  }, [fetchSearches, fetchUnreadCount]);

  const saveSearch = async (
    name: string,
    filters: Record<string, any>,
    searchQuery?: string,
    emailNotifications = false
  ) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to save searches', variant: 'destructive' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_searches')
        .insert({
          user_id: user.id,
          name,
          filters: filters as any,
          query: searchQuery || null,
          timestamp: Date.now(),
          email_notifications: emailNotifications,
          is_active: true,
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Search saved', description: `"${name}" saved${emailNotifications ? ' with email alerts' : ''}` });
      await fetchSearches();
      return data;
    } catch (error: any) {
      console.error('Error saving search:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
  };

  const updateSearch = async (id: string, updates: Partial<Pick<SavedSearch, 'name' | 'email_notifications' | 'is_active'>>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_searches')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchSearches();

      if ('email_notifications' in updates) {
        toast({
          title: updates.email_notifications ? 'Alerts enabled' : 'Alerts disabled',
          description: updates.email_notifications
            ? 'You\'ll receive email notifications for new matches'
            : 'Email notifications turned off for this search',
        });
      }
    } catch (error: any) {
      console.error('Error updating search:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteSearch = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('user_searches')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Search deleted', description: 'Saved search has been removed' });
      await fetchSearches();
    } catch (error: any) {
      console.error('Error deleting search:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const markNotificationsRead = async (searchId?: string) => {
    if (!user) return;
    try {
      let query = supabase
        .from('search_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (searchId) query = query.eq('search_id', searchId);
      await query;
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  };

  return {
    savedSearches,
    isLoading,
    unreadNotifications,
    saveSearch,
    updateSearch,
    deleteSearch,
    markNotificationsRead,
    refetch: fetchSearches,
  };
};
