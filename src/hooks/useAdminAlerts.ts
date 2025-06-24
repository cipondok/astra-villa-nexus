
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminAlerts = () => {
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    console.log('Setting up comprehensive admin alert monitoring...');

    // Create alert for new property
    const createPropertyAlert = async (propertyData: any) => {
      try {
        await supabase
          .from('admin_alerts')
          .insert({
            title: 'New Property Added',
            message: `Property "${propertyData.title}" has been added to the system.\n\nProperty Type: ${propertyData.property_type}\nLocation: ${propertyData.location}\nStatus: ${propertyData.status}\nListing Type: ${propertyData.listing_type}\n\nClick to review and approve if needed.`,
            type: 'property',
            priority: 'medium',
            action_required: propertyData.status === 'pending_approval',
            reference_type: 'property',
            reference_id: propertyData.id
          });
        console.log('Property alert created for:', propertyData.title);
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
            message: `New user has registered with the following details:\n\nEmail: ${userData.email}\nRole: ${userData.role}\nFull Name: ${userData.full_name || 'Not provided'}\nVerification Status: ${userData.verification_status}\n\nPlease review and verify if needed.`,
            type: 'user',
            priority: userData.role === 'agent' || userData.role === 'vendor' ? 'high' : 'low',
            action_required: userData.verification_status === 'pending',
            reference_type: 'user',
            reference_id: userData.id
          });
        console.log('User registration alert created for:', userData.email);
      } catch (error) {
        console.error('Error creating user alert:', error);
      }
    };

    // Create alert for vendor service submissions
    const createVendorServiceAlert = async (serviceData: any) => {
      try {
        await supabase
          .from('admin_alerts')
          .insert({
            title: 'New Vendor Service Submitted',
            message: `A vendor has submitted a new service:\n\nService: ${serviceData.service_name}\nCategory: ${serviceData.service_category}\nLocation Type: ${serviceData.location_type}\nStatus: ${serviceData.is_active ? 'Active' : 'Inactive'}\n\nReview service details and approve if appropriate.`,
            type: 'vendor',
            priority: 'medium',
            action_required: true,
            reference_type: 'vendor_service',
            reference_id: serviceData.id
          });
        console.log('Vendor service alert created');
      } catch (error) {
        console.error('Error creating vendor service alert:', error);
      }
    };

    // Create alert for property status changes
    const createPropertyStatusAlert = async (oldData: any, newData: any) => {
      if (oldData.status !== newData.status) {
        try {
          await supabase
            .from('admin_alerts')
            .insert({
              title: 'Property Status Changed',
              message: `Property "${newData.title}" status has been updated:\n\nPrevious Status: ${oldData.status}\nNew Status: ${newData.status}\nProperty Type: ${newData.property_type}\nLocation: ${newData.location}\n\nThis change may require your attention.`,
              type: 'property',
              priority: newData.status === 'rejected' ? 'high' : 'low',
              action_required: false,
              reference_type: 'property',
              reference_id: newData.id
            });
          console.log('Property status change alert created');
        } catch (error) {
          console.error('Error creating property status alert:', error);
        }
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

    // Create daily summary alert
    const createDailySummaryAlert = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's statistics
        const { data: todayProperties } = await supabase
          .from('properties')
          .select('id, status')
          .gte('created_at', today);
        
        const { data: todayUsers } = await supabase
          .from('profiles')
          .select('id, role')
          .gte('created_at', today);

        const propertiesCount = todayProperties?.length || 0;
        const usersCount = todayUsers?.length || 0;
        const pendingProperties = todayProperties?.filter(p => p.status === 'pending_approval').length || 0;

        if (propertiesCount > 0 || usersCount > 0) {
          await supabase
            .from('admin_alerts')
            .insert({
              title: 'Daily Activity Summary',
              message: `Today's platform activity summary:\n\n📊 New Properties: ${propertiesCount}\n👥 New Users: ${usersCount}\n⏳ Pending Approvals: ${pendingProperties}\n\nReview today's activities and take necessary actions.`,
              type: 'info',
              priority: 'low',
              action_required: pendingProperties > 0,
              reference_type: 'daily_summary',
              reference_id: today
            });
          console.log('Daily summary alert created');
        }
      } catch (error) {
        console.error('Error creating daily summary alert:', error);
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('Property updated:', payload.new);
          createPropertyStatusAlert(payload.old, payload.new);
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

    // Listen for vendor services
    const vendorServicesChannel = supabase
      .channel('vendor-services-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_services'
        },
        (payload) => {
          console.log('New vendor service detected:', payload.new);
          createVendorServiceAlert(payload.new);
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

    // Create daily summary on component mount (if it's a new day)
    const checkAndCreateDailySummary = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingSummary } = await supabase
        .from('admin_alerts')
        .select('id')
        .eq('reference_type', 'daily_summary')
        .eq('reference_id', today)
        .maybeSingle();

      if (!existingSummary) {
        // Wait a bit to ensure we get accurate counts
        setTimeout(() => {
          createDailySummaryAlert();
        }, 5000);
      }
    };

    checkAndCreateDailySummary();

    return () => {
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(vendorServicesChannel);
      supabase.removeChannel(loginAlertsChannel);
    };
  }, [user, profile]);
};
