import { supabase } from '@/integrations/supabase/client';

interface SendEmailOptions {
  to: string | string[];
  subject?: string;
  template?: string;
  variables?: Record<string, string>;
  html?: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-transactional-email', {
      body: options,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: data?.success ?? true };
  } catch (err: any) {
    console.error('Error invoking send-transactional-email function:', err);
    return { success: false, error: err.message };
  }
}

// Convenience functions for common email types
export const emailService = {
  async sendBookingConfirmation(
    email: string,
    variables: {
      user_name: string;
      property_title: string;
      booking_date: string;
      booking_time: string;
      property_address: string;
    }
  ) {
    return sendEmail({ to: email, template: 'booking_confirmation', variables });
  },

  async sendBookingCancellation(
    email: string,
    variables: {
      user_name: string;
      property_title: string;
      booking_date: string;
      cancellation_reason: string;
    }
  ) {
    return sendEmail({ to: email, template: 'booking_cancelled', variables });
  },

  async sendNewReviewNotification(
    email: string,
    variables: {
      owner_name: string;
      reviewer_name: string;
      rating: string;
      property_title: string;
      review_text: string;
    }
  ) {
    return sendEmail({ to: email, template: 'new_review', variables });
  },

  async sendVerificationApproved(
    email: string,
    variables: {
      user_name: string;
      verification_type: string;
    }
  ) {
    return sendEmail({ to: email, template: 'verification_approved', variables });
  },

  async sendVIPUpgradeConfirmation(
    email: string,
    variables: {
      user_name: string;
      membership_level: string;
      benefits_list: string;
    }
  ) {
    return sendEmail({ to: email, template: 'general', variables: { message: `Congratulations ${variables.user_name}! You've been upgraded to ${variables.membership_level}. Benefits: ${variables.benefits_list}` }, subject: `VIP Upgrade: ${variables.membership_level}` });
  },

  async sendForeignInvestmentInquiry(
    email: string,
    variables: {
      user_name: string;
      property_title: string;
      investment_type: string;
      investor_country: string;
    }
  ) {
    return sendEmail({ to: email, template: 'foreign_investment_inquiry', variables: { user_name: variables.user_name, inquiry_type: variables.investment_type, message: `Investment inquiry for ${variables.property_title} from ${variables.investor_country}` } });
  },

  async sendAdminNewPropertyNotification(
    adminEmails: string | string[],
    variables: {
      property_title: string;
      owner_name: string;
      property_location: string;
      submission_date: string;
    }
  ) {
    return sendEmail({ to: adminEmails, template: 'general', variables: { message: `New property listed: ${variables.property_title} by ${variables.owner_name} in ${variables.property_location} (${variables.submission_date})` }, subject: `New Property: ${variables.property_title}` });
  },

  async sendAdminReviewNotification(
    adminEmails: string | string[],
    variables: {
      property_title: string;
      reviewer_name: string;
      rating: string;
      review_text: string;
    }
  ) {
    return sendEmail({ to: adminEmails, template: 'general', variables: { message: `${variables.reviewer_name} left a ${variables.rating}★ review on ${variables.property_title}: "${variables.review_text}"` }, subject: `New Review: ${variables.rating}★ on ${variables.property_title}` });
  },

  async sendCustomEmail(email: string, subject: string, message: string) {
    return sendEmail({ to: email, template: 'general', variables: { message }, subject });
  },
};

export default emailService;
