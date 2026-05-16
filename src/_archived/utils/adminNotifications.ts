import { supabase } from '@/integrations/supabase/client';

interface CreateAdminAlertParams {
  type: string;
  title: string;
  message: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  reference_id?: string;
  reference_type?: string;
  action_required?: boolean;
  metadata?: Record<string, any>;
  alert_category?: string;
}

export const createAdminAlert = async ({
  type,
  title,
  message,
  priority = 'medium',
  reference_id,
  reference_type,
  action_required = true,
  metadata = {},
  alert_category = 'application'
}: CreateAdminAlertParams): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_alerts')
      .insert({
        type,
        title,
        message,
        priority,
        reference_id,
        reference_type,
        action_required,
        metadata,
        alert_category,
        auto_generated: true,
        urgency_level: priority === 'critical' ? 4 : priority === 'high' ? 3 : priority === 'medium' ? 2 : 1
      });

    if (error) {
      console.error('Failed to create admin alert:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating admin alert:', error);
    return false;
  }
};

// Convenience functions for specific application types
export const notifyPropertyOwnerApplication = async (
  userId: string,
  userName: string,
  applicationId: string
) => {
  return createAdminAlert({
    type: 'property_owner_application',
    title: 'New Property Owner Application',
    message: `${userName} has submitted a property owner application and is awaiting review.`,
    priority: 'medium',
    reference_id: applicationId,
    reference_type: 'property_owner_requests',
    action_required: true,
    metadata: { user_id: userId, user_name: userName },
    alert_category: 'application'
  });
};

export const notifyVendorApplication = async (
  userId: string,
  userName: string,
  businessName: string,
  applicationId: string
) => {
  return createAdminAlert({
    type: 'vendor_application',
    title: 'New Vendor Application',
    message: `${userName} (${businessName}) has submitted a vendor application and is awaiting review.`,
    priority: 'medium',
    reference_id: applicationId,
    reference_type: 'vendor_requests',
    action_required: true,
    metadata: { user_id: userId, user_name: userName, business_name: businessName },
    alert_category: 'application'
  });
};

export const notifyAgentApplication = async (
  userId: string,
  userName: string,
  companyName: string | undefined,
  applicationId: string
) => {
  return createAdminAlert({
    type: 'agent_application',
    title: 'New Agent Application',
    message: `${userName}${companyName ? ` (${companyName})` : ''} has submitted an agent registration request and is awaiting review.`,
    priority: 'medium',
    reference_id: applicationId,
    reference_type: 'agent_registration_requests',
    action_required: true,
    metadata: { user_id: userId, user_name: userName, company_name: companyName },
    alert_category: 'application'
  });
};
