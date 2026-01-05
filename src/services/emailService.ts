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
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: options,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: data?.success ?? true };
  } catch (err: any) {
    console.error('Error invoking send-email function:', err);
    return { success: false, error: err.message };
  }
}

// Convenience functions for common email types
export const emailService = {
  // Send booking confirmation
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
    return sendEmail({
      to: email,
      template: 'booking_confirmation',
      variables,
    });
  },

  // Send booking cancellation
  async sendBookingCancellation(
    email: string,
    variables: {
      user_name: string;
      property_title: string;
      booking_date: string;
      cancellation_reason: string;
    }
  ) {
    return sendEmail({
      to: email,
      template: 'booking_cancelled',
      variables,
    });
  },

  // Send new review notification
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
    return sendEmail({
      to: email,
      template: 'new_review',
      variables,
    });
  },

  // Send verification approved
  async sendVerificationApproved(
    email: string,
    variables: {
      user_name: string;
      verification_type: string;
    }
  ) {
    return sendEmail({
      to: email,
      template: 'verification_approved',
      variables,
    });
  },

  // Send VIP upgrade confirmation
  async sendVIPUpgradeConfirmation(
    email: string,
    variables: {
      user_name: string;
      membership_level: string;
      benefits_list: string;
    }
  ) {
    return sendEmail({
      to: email,
      template: 'vip_upgrade',
      variables,
    });
  },

  // Send custom email
  async sendCustomEmail(
    email: string,
    subject: string,
    message: string
  ) {
    return sendEmail({
      to: email,
      template: 'general',
      variables: { message },
      subject,
    });
  },
};

export default emailService;
