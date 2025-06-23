
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminAlerts = () => {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    console.log('Setting up admin alert monitoring...');

    // Create alert for new property
    const createPropertyAlert = async (propertyData: any) => {
      try {
        await supabase
          .from('admin_alerts')
          .insert({
            title: 'New Property Added',
            message: `A new property "${propertyData.title}" has been added to the system`,
            type: 'info',
            priority: 'medium',
            action_required: true,
            reference_type: 'property',
            reference_id: propertyData.id
          });
        console.log('Property alert created');
      } catch (error) {
        console.error('Error creating property alert:', error);
      }
    };

    // Create alert for new user registration
    const createUserAlert = async (userData: any) => {
      try {
        await supabase
          .from('admin_alerts')
          .insert({
            title: 'New User Registration',
            message: `New user "${userData.email}" has registered with role: ${userData.role}`,
            type: 'info',
            priority: 'low',
            action_required: false,
            reference_type: 'user',
            reference_id: userData.id
          });
        console.log('User registration alert created');
      } catch (error) {
        console.error('Error creating user alert:', error);
      }
    };

    // Create alert for login security issues
    const createSecurityAlert = async (alertData: any) => {
      try {
        await supabase
          .from('admin_alerts')
          .insert({
            title: 'Security Alert',
            message: alertData.message,
            type: 'warning',
            priority: 'high',
            action_required: true,
            reference_type: 'security',
            reference_id: alertData.user_id
          });
        console.log('Security alert created');
      } catch (error) {
        console.error('Error creating security alert:', error);
      }
    };

    // Listen for new properties
    const propertiesChannel = supabase
      .channel('properties-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('New property detected:', payload.new);
          createPropertyAlert(payload.new);
        }
      )
      .subscribe();

    // Listen for new user profiles (new registrations)
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('New user registration detected:', payload.new);
          createUserAlert(payload.new);
        }
      )
      .subscribe();

    // Listen for login alerts
    const loginAlertsChannel = supabase
      .channel('login-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_login_alerts'
        },
        (payload) => {
          console.log('New login alert detected:', payload.new);
          createSecurityAlert(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(loginAlertsChannel);
    };
  }, [user, profile]);
};
