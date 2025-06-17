
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";

export const useAdminAlerts = () => {
  const queryClient = useQueryClient();
  const { showInfo } = useAlert();

  useEffect(() => {
    // Subscribe to real-time updates for admin alerts
    const channel = supabase
      .channel('admin-alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_alerts'
        },
        (payload) => {
          console.log('New admin alert:', payload);
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
          queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
          
          // Show notification for new alert
          const newAlert = payload.new as any;
          showInfo(
            "New Alert",
            `${newAlert.title}: ${newAlert.message.substring(0, 100)}...`
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'admin_alerts'
        },
        () => {
          // Invalidate queries when alerts are updated
          queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
          queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
        }
      )
      .subscribe();

    // Monitor for new registrations, property listings, etc.
    const registrationChannel = supabase
      .channel('registration-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        async (payload) => {
          const newUser = payload.new as any;
          
          // Create alert for new user registration
          await (supabase as any).from('admin_alerts').insert({
            type: 'user_registration',
            title: 'New User Registration',
            message: `New user registered: ${newUser.full_name || newUser.email} with role ${newUser.role}`,
            priority: newUser.role === 'agent' ? 'high' : 'medium',
            reference_id: newUser.id,
            reference_type: 'user',
            action_required: newUser.role === 'agent'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'properties'
        },
        async (payload) => {
          const newProperty = payload.new as any;
          
          // Create alert for new property listing
          await (supabase as any).from('admin_alerts').insert({
            type: 'property_listing',
            title: 'New Property Listed',
            message: `New property "${newProperty.title}" listed for ${newProperty.listing_type} in ${newProperty.location}`,
            priority: 'medium',
            reference_id: newProperty.id,
            reference_type: 'property',
            action_required: newProperty.status === 'pending_approval'
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_registration_requests'
        },
        async (payload) => {
          const newRequest = payload.new as any;
          
          // Create alert for new agent registration request
          await (supabase as any).from('admin_alerts').insert({
            type: 'agent_request',
            title: 'New Agent Registration Request',
            message: `${newRequest.full_name} applied to become an agent for ${newRequest.company_name}`,
            priority: 'high',
            reference_id: newRequest.id,
            reference_type: 'agent_request',
            action_required: true
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(registrationChannel);
    };
  }, [queryClient, showInfo]);
};
