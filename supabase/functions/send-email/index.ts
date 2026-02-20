import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  to: string | string[];
  subject?: string;
  template?: string;
  variables?: Record<string, string>;
  html?: string;
  text?: string;
  skipAuth?: boolean;
}

interface SMTPConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  fromName: string;
  fromEmail: string;
  isEnabled: boolean;
}

interface EmailBranding {
  companyName: string;
  companyLogoUrl: string;
  companyWebsite: string;
  companyAddress: string;
  companyPhone: string;
  supportEmail: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialLinkedin: string;
  footerText: string;
  copyrightText: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preheader: string;
  headerText: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  showSocialLinks: boolean;
  showUnsubscribe: boolean;
  isActive: boolean;
  category: string;
}

const defaultSMTP: Partial<SMTPConfig> = {
  fromName: 'ASTRA Villa',
  fromEmail: 'noreply@astravilla.com',
  encryption: 'tls',
  port: '587',
  isEnabled: false,
};

const defaultBranding: EmailBranding = {
  companyName: 'ASTRA Villa',
  companyLogoUrl: '',
  companyWebsite: 'https://astravilla.com',
  companyAddress: 'Jakarta, Indonesia',
  companyPhone: '+62 857 1600 8080',
  supportEmail: 'support@astravilla.com',
  primaryColor: '#B8860B',
  secondaryColor: '#0066FF',
  accentColor: '#D4AF37',
  socialFacebook: '',
  socialInstagram: '',
  socialTwitter: '',
  socialLinkedin: '',
  footerText: 'Thank you for choosing ASTRA Villa - Your trusted partner in luxury real estate.',
  copyrightText: '© 2024 ASTRA Villa. All rights reserved.'
};

// Built-in fallback templates
const builtInTemplates: Record<string, Partial<EmailTemplate>> = {
  booking_confirmation: {
    subject: 'Booking Confirmed – {{property_title}}',
    preheader: 'Your viewing has been scheduled',
    headerText: 'Booking Confirmed ✅',
    body: 'Dear {{user_name}},\n\nYour booking request for <strong>{{property_title}}</strong> has been submitted successfully.\n\n📅 Date: {{booking_date}}\n🕐 Time: {{booking_time}}\n📍 Address: {{property_address}}\n\nOur team will confirm your appointment shortly. Please keep this email for your records.',
    buttonText: 'View My Bookings',
    buttonUrl: '{{site_url}}/profile?tab=bookings',
    showSocialLinks: true,
    showUnsubscribe: false,
  },
  booking_cancelled: {
    subject: 'Booking Cancelled – {{property_title}}',
    preheader: 'Your booking has been cancelled',
    headerText: 'Booking Cancelled',
    body: 'Dear {{user_name}},\n\nYour booking for <strong>{{property_title}}</strong> on {{booking_date}} has been cancelled.\n\n📝 Reason: {{cancellation_reason}}\n\nIf you have questions, please contact our support team.',
    buttonText: 'Browse Properties',
    buttonUrl: '{{site_url}}/properties',
    showSocialLinks: true,
    showUnsubscribe: false,
  },
  new_review: {
    subject: 'New Review on {{property_title}}',
    preheader: '{{reviewer_name}} left a {{rating}}-star review',
    headerText: 'New Review Received ⭐',
    body: 'Dear {{owner_name}},\n\n{{reviewer_name}} has left a {{rating}}-star review on your property <strong>{{property_title}}</strong>.\n\n💬 "{{review_text}}"\n\nLog in to respond to this review.',
    buttonText: 'View Review',
    buttonUrl: '{{site_url}}/dashboard',
    showSocialLinks: false,
    showUnsubscribe: false,
  },
  verification_approved: {
    subject: 'Verification Approved – {{verification_type}}',
    preheader: 'Your account has been verified',
    headerText: 'Verification Approved ✅',
    body: 'Dear {{user_name}},\n\nCongratulations! Your <strong>{{verification_type}}</strong> verification has been approved.\n\nYou now have full access to all verified member features on ASTRA Villa.',
    buttonText: 'Explore Benefits',
    buttonUrl: '{{site_url}}/dashboard',
    showSocialLinks: true,
    showUnsubscribe: false,
  },
  vip_upgrade: {
    subject: 'Welcome to {{membership_level}} – ASTRA Villa',
    preheader: 'Your VIP membership is now active',
    headerText: '🌟 VIP Membership Activated',
    body: 'Dear {{user_name}},\n\nWelcome to <strong>{{membership_level}}</strong>! Your exclusive membership is now active.\n\n{{benefits_list}}\n\nThank you for choosing the premium ASTRA Villa experience.',
    buttonText: 'Access VIP Portal',
    buttonUrl: '{{site_url}}/dashboard/vip',
    showSocialLinks: true,
    showUnsubscribe: false,
  },
  foreign_investment_inquiry: {
    subject: 'Foreign Investment Inquiry Received',
    preheader: 'We received your property investment inquiry',
    headerText: 'Investment Inquiry Received 🌏',
    body: 'Dear {{user_name}},\n\nThank you for your interest in investing in Indonesian real estate through ASTRA Villa.\n\n🏠 Property: {{property_title}}\n💰 Investment Type: {{investment_type}}\n🌏 Country: {{investor_country}}\n\nOur foreign investment specialists will contact you within 1-2 business days.',
    buttonText: 'View Investment Guide',
    buttonUrl: '{{site_url}}/foreign-investment',
    showSocialLinks: true,
    showUnsubscribe: true,
  },
  admin_new_property: {
    subject: '[Admin] New Property Listing: {{property_title}}',
    preheader: 'A new property requires review',
    headerText: 'New Property Listing 🏠',
    body: 'A new property has been submitted for review.\n\n📌 Title: {{property_title}}\n👤 Owner: {{owner_name}}\n📍 Location: {{property_location}}\n📅 Submitted: {{submission_date}}\n\nPlease review and approve or reject this listing.',
    buttonText: 'Review Listing',
    buttonUrl: '{{site_url}}/admin/properties',
    showSocialLinks: false,
    showUnsubscribe: false,
  },
  admin_review_notification: {
    subject: '[Admin] New Review Requires Moderation',
    preheader: 'A review is pending moderation',
    headerText: 'Review Pending Moderation',
    body: 'A new review has been submitted and requires moderation.\n\n📌 Property: {{property_title}}\n👤 Reviewer: {{reviewer_name}}\n⭐ Rating: {{rating}}\n💬 Review: {{review_text}}\n\nPlease review and approve or reject.',
    buttonText: 'Moderate Review',
    buttonUrl: '{{site_url}}/admin/reviews',
    showSocialLinks: false,
    showUnsubscribe: false,
  },
  general: {
    subject: 'Message from ASTRA Villa',
    preheader: '',
    headerText: '',
    body: '{{message}}',
    buttonText: '',
    buttonUrl: '',
    showSocialLinks: true,
    showUnsubscribe: true,
  }
};

async function sendViaSMTP(
  smtp: SMTPConfig,
  recipients: string[],
  subject: string,
  html: string
): Promise<void> {
  const port = parseInt(smtp.port || '587');
  const useTLS = smtp.encryption === 'tls' || smtp.encryption === 'ssl';

  const client = new SMTPClient({
    connection: {
      hostname: smtp.host,
      port,
      tls: useTLS,
      auth: {
        username: smtp.username,
        password: smtp.password,
      },
    },
  });

  try {
    for (const recipient of recipients) {
      await client.send({
        from: `${smtp.fromName} <${smtp.fromEmail}>`,
        to: recipient,
        subject,
        html,
      });
    }
    console.log(`SMTP email sent to: ${recipients.join(', ')}`);
  } finally {
    await client.close();
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, subject, template, variables, html, text, skipAuth }: EmailRequest = await req.json();

    // Authentication check (skip for system emails)
    if (!skipAuth) {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ success: false, error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
      if (userError || !userData?.user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid or expired token' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = userData.user.id;
      const userEmail = userData.user.email?.toLowerCase();
      const toAddresses = Array.isArray(to) ? to : [to];
      const { data: isAdmin } = await supabase.rpc('has_role', { user_id: userId, role: 'admin' });

      if (!isAdmin) {
        const allToOwnEmail = toAddresses.every(addr => addr.toLowerCase() === userEmail);
        if (!allToOwnEmail) {
          return new Response(
            JSON.stringify({ success: false, error: 'You can only send emails to your own address' }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Fetch config from DB
    const { data: configRows } = await supabase
      .from('system_settings')
      .select('key, value, category')
      .or('and(category.eq.smtp,key.eq.config),and(category.eq.email,key.eq.branding),and(category.eq.email,key.eq.templates)');

    let smtp: SMTPConfig = { ...defaultSMTP } as SMTPConfig;
    let branding: EmailBranding = { ...defaultBranding };
    let dbTemplates: EmailTemplate[] = [];
    let siteUrl = 'https://astravilla.com';

    configRows?.forEach((item) => {
      if (item.category === 'smtp' && item.key === 'config' && item.value) {
        smtp = { ...smtp, ...(item.value as Partial<SMTPConfig>) };
      }
      if (item.category === 'email' && item.key === 'branding' && item.value) {
        branding = { ...branding, ...(item.value as Partial<EmailBranding>) };
      }
      if (item.category === 'email' && item.key === 'templates' && Array.isArray(item.value)) {
        dbTemplates = item.value as EmailTemplate[];
      }
    });

    // Also check email config for site URL
    const { data: emailConfigRow } = await supabase
      .from('system_settings')
      .select('value')
      .eq('category', 'email')
      .eq('key', 'config')
      .maybeSingle();

    if (emailConfigRow?.value && typeof emailConfigRow.value === 'object') {
      const ec = emailConfigRow.value as any;
      if (ec.siteUrl) siteUrl = ec.siteUrl;
      if (!smtp.isEnabled && ec.isEnabled !== undefined) smtp.isEnabled = ec.isEnabled;
    }

    if (!smtp.isEnabled) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email sending is disabled. Enable SMTP in admin settings.' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!smtp.host || !smtp.username || !smtp.password) {
      return new Response(
        JSON.stringify({ success: false, error: 'SMTP not configured. Please set up SMTP in admin settings.' }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Merge all variables
    const allVariables: Record<string, string> = {
      company_name: branding.companyName,
      company_logo_url: branding.companyLogoUrl,
      company_website: branding.companyWebsite,
      company_address: branding.companyAddress,
      company_phone: branding.companyPhone,
      support_email: branding.supportEmail,
      primary_color: branding.primaryColor,
      secondary_color: branding.secondaryColor,
      accent_color: branding.accentColor,
      footer_text: branding.footerText,
      copyright_text: branding.copyrightText,
      site_url: siteUrl,
      ...variables
    };

    const replaceVariables = (str: string) => {
      let result = str;
      for (const [key, value] of Object.entries(allVariables)) {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
      }
      return result;
    };

    // Build email HTML
    let emailHtml = html;
    let emailSubject = subject;

    if (template) {
      const dbTemplate = dbTemplates.find(t => t.id === template);
      const builtIn = builtInTemplates[template];

      const tpl = dbTemplate || (builtIn ? {
        id: template,
        name: template,
        isActive: true,
        category: 'notification',
        subject: subject || 'Notification from ASTRA Villa',
        preheader: '',
        headerText: '',
        body: variables?.message || text || '',
        buttonText: '',
        buttonUrl: '',
        showSocialLinks: true,
        showUnsubscribe: true,
        ...builtIn,
      } as EmailTemplate : null);

      const activeTpl = tpl || {
        subject: subject || 'Notification from ASTRA Villa',
        preheader: '',
        headerText: '',
        body: variables?.message || text || '',
        buttonText: '',
        buttonUrl: '',
        showSocialLinks: true,
        showUnsubscribe: true,
      };

      emailSubject = replaceVariables(emailSubject || activeTpl.subject || 'Notification');
      const bodyContent = replaceVariables(activeTpl.body || '');
      const headerText = replaceVariables(activeTpl.headerText || '');
      const buttonText = replaceVariables(activeTpl.buttonText || '');
      const buttonUrl = replaceVariables(activeTpl.buttonUrl || '');
      const preheader = replaceVariables(activeTpl.preheader || '');

      const socialLinksHtml = (branding.socialFacebook || branding.socialInstagram || branding.socialTwitter || branding.socialLinkedin) && activeTpl.showSocialLinks
        ? `<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E8E0D5;">
            ${branding.socialFacebook ? `<a href="${branding.socialFacebook}" style="display: inline-block; margin: 0 8px; color: ${branding.primaryColor}; text-decoration: none; font-size: 13px;">Facebook</a>` : ''}
            ${branding.socialInstagram ? `<a href="${branding.socialInstagram}" style="display: inline-block; margin: 0 8px; color: ${branding.primaryColor}; text-decoration: none; font-size: 13px;">Instagram</a>` : ''}
            ${branding.socialTwitter ? `<a href="${branding.socialTwitter}" style="display: inline-block; margin: 0 8px; color: ${branding.primaryColor}; text-decoration: none; font-size: 13px;">Twitter</a>` : ''}
            ${branding.socialLinkedin ? `<a href="${branding.socialLinkedin}" style="display: inline-block; margin: 0 8px; color: ${branding.primaryColor}; text-decoration: none; font-size: 13px;">LinkedIn</a>` : ''}
          </div>`
        : '';

      emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<span style="display:none!important;visibility:hidden;mso-hide:all;font-size:0;max-height:0;line-height:0;">${preheader}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 50%, #FFFDF9 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; max-width: 100%; box-shadow: 0 4px 24px rgba(184, 134, 11, 0.08);">
          <tr><td style="height: 4px; background: linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.accentColor} 50%, ${branding.primaryColor} 100%);"></td></tr>
          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px;">
              ${branding.companyLogoUrl
                ? `<img src="${branding.companyLogoUrl}" alt="${branding.companyName}" style="max-height: 56px; max-width: 200px;">`
                : `<div><span style="color: ${branding.primaryColor}; font-size: 32px; font-weight: 600; letter-spacing: 2px;">ASTRA</span><span style="color: #2D2A26; font-size: 32px; font-weight: 400; letter-spacing: 2px;"> Villa</span></div>
                   <p style="margin: 8px 0 0 0; color: #8B7355; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Luxury Real Estate</p>`
              }
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              ${headerText ? `<h1 style="margin: 0 0 24px 0; color: #2D2A26; font-size: 26px; font-weight: 600; line-height: 1.3; text-align: center;">${headerText}</h1>` : ''}
              <div style="color: #4A4540; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${bodyContent}</div>
              ${buttonText && buttonUrl ? `
                <div style="margin-top: 32px; text-align: center;">
                  <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%); color: #FFFFFF; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px; letter-spacing: 0.5px;">${buttonText}</a>
                </div>
              ` : ''}
            </td>
          </tr>
          <tr>
            <td style="background: #F5F3F0; padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 12px 0; color: #6B635A; font-size: 14px; font-style: italic;">${branding.footerText}</p>
              <p style="margin: 0 0 8px 0; color: #8B8580; font-size: 13px;">${branding.companyAddress}</p>
              <p style="margin: 0; color: #8B8580; font-size: 13px;">
                <a href="tel:${branding.companyPhone}" style="color: ${branding.primaryColor}; text-decoration: none;">${branding.companyPhone}</a>
                &nbsp;•&nbsp;
                <a href="mailto:${branding.supportEmail}" style="color: ${branding.primaryColor}; text-decoration: none;">${branding.supportEmail}</a>
              </p>
              ${socialLinksHtml}
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E8E0D5;">
                <p style="margin: 0; color: #A8A29E; font-size: 11px;">${branding.copyrightText}</p>
                ${activeTpl.showUnsubscribe ? `<p style="margin: 8px 0 0 0;"><a href="${branding.companyWebsite}/unsubscribe" style="color: #A8A29E; font-size: 11px; text-decoration: underline;">Unsubscribe</a></p>` : ''}
              </div>
            </td>
          </tr>
          <tr><td style="height: 4px; background: linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.accentColor} 50%, ${branding.primaryColor} 100%);"></td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }

    // Fallback HTML
    if (!emailHtml) {
      emailHtml = `<!DOCTYPE html><html><body style="margin: 0; padding: 40px 20px; background: #FFFBF5; font-family: -apple-system, sans-serif;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background: #FFFFFF; border-radius: 16px;">
    <tr><td style="height: 4px; background: linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%);"></td></tr>
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px 0; color: #2D2A26; font-size: 24px;">${emailSubject || 'Notification'}</h1>
        <p style="margin: 0 0 24px 0; color: #4A4540; font-size: 15px; line-height: 1.7;">${text || allVariables.message || 'No content'}</p>
        <p style="margin: 0; color: #8B8580; font-size: 12px;">${branding.companyName} • ${branding.copyrightText}</p>
      </td>
    </tr>
    <tr><td style="height: 4px; background: linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%);"></td></tr>
  </table>
</body></html>`;
    }

    const toAddresses = Array.isArray(to) ? to : [to];
    const finalSubject = emailSubject || 'Notification';

    // Send via SMTP (only delivery method)
    await sendViaSMTP(smtp, toAddresses, finalSubject, emailHtml);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
