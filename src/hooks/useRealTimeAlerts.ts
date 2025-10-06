
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AlertRule {
  id: string;
  rule_name: string;
  event_type: string;
  alert_template: {
    title: string;
    type: string;
    priority: string;
    alert_category: string;
  };
  is_active: boolean;
}

export const useRealTimeAlerts = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Create alert helper function
  const createAlert = async (alertData: any) => {
    try {
      const { error } = await supabase
        .from('admin_alerts')
        .insert({
          title: alertData.title,
          message: alertData.message,
          type: alertData.type,
          priority: alertData.priority || 'medium',
          alert_category: alertData.alert_category || 'general',
          urgency_level: alertData.urgency_level || 1,
          action_required: alertData.action_required || false,
          reference_type: alertData.reference_type,
          reference_id: alertData.reference_id,
          source_table: alertData.source_table,
          source_id: alertData.source_id,
          metadata: alertData.metadata || {}
        });

      if (error) {
        console.error('Error creating alert:', error);
      } else {
        console.log('Alert created:', alertData.title);
        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['admin-alerts'] });
        queryClient.invalidateQueries({ queryKey: ['admin-alerts-count'] });
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  // Alert handlers for different event types
  const handleUserRegistration = async (userData: any) => {
    await createAlert({
      title: '👤 New User Registration',
      message: `New user "${userData.full_name || userData.email}" has registered with role: ${userData.role}.\n\nEmail: ${userData.email}\nVerification Status: ${userData.verification_status}\nRegistered: ${new Date(userData.created_at).toLocaleString()}`,
      type: 'user_registration',
      priority: userData.role === 'agent' || userData.role === 'vendor' ? 'medium' : 'low',
      alert_category: 'users',
      urgency_level: userData.role === 'agent' || userData.role === 'vendor' ? 2 : 1,
      action_required: userData.verification_status === 'pending',
      reference_type: 'user',
      reference_id: userData.id,
      source_table: 'profiles',
      source_id: userData.id,
      metadata: {
        user_role: userData.role,
        verification_status: userData.verification_status,
        registration_time: userData.created_at
      }
    });
  };

  const handlePropertyListing = async (propertyData: any) => {
    await createAlert({
      title: '🏠 New Property Listed',
      message: `Property "${propertyData.title}" has been added.\n\nType: ${propertyData.property_type}\nListing: ${propertyData.listing_type}\nLocation: ${propertyData.location}\nStatus: ${propertyData.status}\nPrice: ${propertyData.price ? `$${propertyData.price.toLocaleString()}` : 'Not specified'}`,
      type: 'property_listing',
      priority: propertyData.status === 'pending_approval' ? 'medium' : 'low',
      alert_category: 'properties',
      urgency_level: propertyData.status === 'pending_approval' ? 3 : 1,
      action_required: propertyData.status === 'pending_approval',
      reference_type: 'property',
      reference_id: propertyData.id,
      source_table: 'properties',
      source_id: propertyData.id,
      metadata: {
        property_type: propertyData.property_type,
        listing_type: propertyData.listing_type,
        status: propertyData.status,
        price: propertyData.price
      }
    });
  };

  const handleCustomerComplaint = async (complaintData: any) => {
    await createAlert({
      title: '⚠️ New Customer Complaint',
      message: `Customer complaint received: "${complaintData.subject}"\n\nType: ${complaintData.complaint_type}\nPriority: ${complaintData.priority}\nDescription: ${complaintData.description.substring(0, 200)}${complaintData.description.length > 200 ? '...' : ''}`,
      type: 'customer_complaint',
      priority: complaintData.priority === 'urgent' ? 'high' : complaintData.priority,
      alert_category: 'support',
      urgency_level: complaintData.priority === 'urgent' ? 5 : complaintData.priority === 'high' ? 4 : 3,
      action_required: true,
      reference_type: 'complaint',
      reference_id: complaintData.id,
      source_table: 'customer_complaints',
      source_id: complaintData.id,
      metadata: {
        complaint_type: complaintData.complaint_type,
        priority: complaintData.priority,
        user_id: complaintData.user_id
      }
    });
  };

  const handleInquiry = async (inquiryData: any) => {
    await createAlert({
      title: '💬 New Inquiry Received',
      message: `New inquiry: "${inquiryData.subject}"\n\nType: ${inquiryData.inquiry_type}\nContact: ${inquiryData.contact_email || 'N/A'}\nMessage: ${inquiryData.message.substring(0, 200)}${inquiryData.message.length > 200 ? '...' : ''}`,
      type: 'inquiry',
      priority: 'medium',
      alert_category: 'support',
      urgency_level: 2,
      action_required: true,
      reference_type: 'inquiry',
      reference_id: inquiryData.id,
      source_table: 'inquiries',
      source_id: inquiryData.id,
      metadata: {
        inquiry_type: inquiryData.inquiry_type,
        contact_email: inquiryData.contact_email,
        property_id: inquiryData.property_id
      }
    });
  };

  const handleSystemReport = async (reportData: any) => {
    await createAlert({
      title: '🚨 New System Report',
      message: `System report filed against ${reportData.target_type}: "${reportData.reason}"\n\nType: ${reportData.report_type}\nTarget: ${reportData.target_type}\nDescription: ${reportData.description ? reportData.description.substring(0, 200) : 'No description'}${reportData.description && reportData.description.length > 200 ? '...' : ''}`,
      type: 'report',
      priority: 'high',
      alert_category: 'moderation',
      urgency_level: 4,
      action_required: true,
      reference_type: 'report',
      reference_id: reportData.id,
      source_table: 'system_reports',
      source_id: reportData.id,
      metadata: {
        report_type: reportData.report_type,
        target_type: reportData.target_type,
        target_id: reportData.target_id,
        reported_by: reportData.reported_by
      }
    });
  };

  const handleVendorService = async (serviceData: any) => {
    await createAlert({
      title: '🔧 New Vendor Service',
      message: `Vendor service submitted: "${serviceData.service_name}"\n\nCategory: ${serviceData.service_category}\nLocation Type: ${serviceData.location_type}\nStatus: ${serviceData.is_active ? 'Active' : 'Inactive'}`,
      type: 'vendor_request',
      priority: 'medium',
      alert_category: 'vendors',
      urgency_level: 2,
      action_required: true,
      reference_type: 'vendor_service',
      reference_id: serviceData.id,
      source_table: 'vendor_services',
      source_id: serviceData.id,
      metadata: {
        service_name: serviceData.service_name,
        service_category: serviceData.service_category,
        vendor_id: serviceData.vendor_id
      }
    });
  };

  const handleFeedbackSubmission = async (feedbackData: any) => {
    // Extract title from content for partner applications
    const isPartnerApp = feedbackData.content?.includes('Partner Network Application');
    const title = isPartnerApp ? '🤝 New Partner Application' : '💬 New Contact Submission';
    
    await createAlert({
      title,
      message: feedbackData.content.substring(0, 300) + (feedbackData.content.length > 300 ? '...' : ''),
      type: 'contact',
      priority: isPartnerApp ? 'medium' : 'low',
      alert_category: 'support',
      urgency_level: isPartnerApp ? 3 : 2,
      action_required: true,
      reference_type: 'feedback',
      reference_id: feedbackData.id,
      source_table: 'feedback_monitoring',
      source_id: feedbackData.id,
      metadata: {
        feedback_type: feedbackData.feedback_type,
        status: feedbackData.status,
        is_partner_app: isPartnerApp
      }
    });
  };

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    console.log('Setting up comprehensive real-time alert monitoring...');
    setIsMonitoring(true);

    // Listen for new user registrations
    const profilesChannel = supabase
      .channel('profiles-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('New user registration detected:', payload.new);
          handleUserRegistration(payload.new);
        }
      )
      .subscribe();

    // Listen for new properties
    const propertiesChannel = supabase
      .channel('properties-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('New property listing detected:', payload.new);
          handlePropertyListing(payload.new);
        }
      )
      .subscribe();

    // Listen for customer complaints
    const complaintsChannel = supabase
      .channel('complaints-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customer_complaints'
        },
        (payload) => {
          console.log('New customer complaint detected:', payload.new);
          handleCustomerComplaint(payload.new);
          toast.error('New customer complaint received!', {
            description: `Priority: ${payload.new.priority}`
          });
        }
      )
      .subscribe();

    // Listen for inquiries
    const inquiriesChannel = supabase
      .channel('inquiries-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inquiries'
        },
        (payload) => {
          console.log('New inquiry detected:', payload.new);
          handleInquiry(payload.new);
          toast.info('New inquiry received!', {
            description: payload.new.subject
          });
        }
      )
      .subscribe();

    // Listen for system reports
    const reportsChannel = supabase
      .channel('reports-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_reports'
        },
        (payload) => {
          console.log('New system report detected:', payload.new);
          handleSystemReport(payload.new);
          toast.warning('New system report filed!', {
            description: `Report type: ${payload.new.report_type}`
          });
        }
      )
      .subscribe();

    // Listen for vendor services
    const vendorServicesChannel = supabase
      .channel('vendor-services-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vendor_services'
        },
        (payload) => {
          console.log('New vendor service detected:', payload.new);
          handleVendorService(payload.new);
        }
      )
      .subscribe();

    // Listen for security alerts (login alerts)
    const securityChannel = supabase
      .channel('security-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_login_alerts'
        },
        (payload) => {
          console.log('Security alert detected:', payload.new);
          createAlert({
            title: '🔒 Security Alert',
            message: `Security alert: ${payload.new.alert_type}\n\n${payload.new.message}`,
            type: 'security',
            priority: 'high',
            alert_category: 'security',
            urgency_level: 4,
            action_required: true,
            reference_type: 'security_alert',
            reference_id: payload.new.id,
            source_table: 'user_login_alerts',
            source_id: payload.new.id,
            metadata: {
              alert_type: payload.new.alert_type,
              user_id: payload.new.user_id,
              device_info: payload.new.device_info
            }
          });
          toast.error('Security Alert!', {
            description: payload.new.alert_type
          });
        }
      )
      .subscribe();

    // Listen for feedback/contact submissions (including partner applications)
    const feedbackChannel = supabase
      .channel('feedback-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feedback_monitoring'
        },
        (payload) => {
          console.log('New feedback/contact submission detected:', payload.new);
          handleFeedbackSubmission(payload.new);
          const isPartnerApp = payload.new.content?.includes('Partner Network Application');
          toast.info(isPartnerApp ? 'New Partner Application!' : 'New Contact Submission!', {
            description: 'Check Contact Management'
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time alert monitoring...');
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(complaintsChannel);
      supabase.removeChannel(inquiriesChannel);
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(vendorServicesChannel);
      supabase.removeChannel(securityChannel);
      supabase.removeChannel(feedbackChannel);
      setIsMonitoring(false);
    };
  }, [user, profile?.role]);

  return {
    isMonitoring,
    createAlert
  };
};
