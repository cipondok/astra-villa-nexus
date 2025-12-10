import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject?: string;
  template?: string;
  variables?: Record<string, string>;
  html?: string;
  text?: string;
}

interface EmailBranding {
  company_name: string;
  company_logo_url: string;
  company_website: string;
  company_address: string;
  company_phone: string;
  support_email: string;
  primary_color: string;
  secondary_color: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  social_linkedin: string;
  footer_text: string;
  copyright_text: string;
}

interface SMTPConfig {
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  isEnabled: boolean;
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

    const { to, subject, template, variables, html, text }: EmailRequest = await req.json();

    // Fetch SMTP config
    const { data: smtpData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('category', 'smtp')
      .eq('key', 'config')
      .single();

    const smtpConfig = smtpData?.value as SMTPConfig || {
      fromEmail: 'noreply@astravilla.com',
      fromName: 'ASTRA Villa',
      isEnabled: true
    };

    if (!smtpConfig.isEnabled) {
      console.log('Email sending is disabled');
      return new Response(JSON.stringify({ success: false, error: 'Email sending is disabled' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch branding
    const { data: brandingData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('category', 'email_branding')
      .eq('key', 'config')
      .single();

    const branding = brandingData?.value as EmailBranding || {
      company_name: 'ASTRA Villa',
      company_logo_url: '',
      company_website: 'https://astravilla.com',
      company_address: 'Jakarta, Indonesia',
      company_phone: '+62 857 1600 8080',
      support_email: 'support@astravilla.com',
      primary_color: '#0ea5e9',
      secondary_color: '#6366f1',
      social_facebook: '',
      social_instagram: '',
      social_twitter: '',
      social_linkedin: '',
      footer_text: 'Thank you for choosing ASTRA Villa.',
      copyright_text: '© 2024 ASTRA Villa. All rights reserved.'
    };

    // Merge branding variables
    const allVariables = {
      company_name: branding.company_name,
      company_logo_url: branding.company_logo_url,
      company_website: branding.company_website,
      company_address: branding.company_address,
      company_phone: branding.company_phone,
      support_email: branding.support_email,
      primary_color: branding.primary_color,
      secondary_color: branding.secondary_color,
      footer_text: branding.footer_text,
      copyright_text: branding.copyright_text,
      ...variables
    };

    // Build email HTML
    let emailHtml = html;
    let emailSubject = subject;

    if (template) {
      // Fetch template
      const { data: templateData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('category', 'email_templates')
        .eq('key', template)
        .single();

      const emailTemplate = templateData?.value as {
        subject?: string;
        preheader?: string;
        header_text?: string;
        body?: string;
        button_text?: string;
        button_url?: string;
        show_social_links?: boolean;
        show_unsubscribe?: boolean;
      } || {};

      emailSubject = emailSubject || emailTemplate.subject || 'Notification from ASTRA Villa';
      
      // Replace variables in template
      const replaceVariables = (text: string) => {
        let result = text;
        for (const [key, value] of Object.entries(allVariables)) {
          result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
        }
        return result;
      };

      emailSubject = replaceVariables(emailSubject);
      const bodyContent = replaceVariables(emailTemplate.body || allVariables.message || '');
      const headerText = replaceVariables(emailTemplate.header_text || '');
      const buttonText = replaceVariables(emailTemplate.button_text || '');
      const buttonUrl = replaceVariables(emailTemplate.button_url || '');

      // Build social links HTML
      const socialLinksHtml = branding.social_facebook || branding.social_instagram || branding.social_twitter || branding.social_linkedin
        ? `<div style="margin-top: 16px;">
            ${branding.social_facebook ? `<a href="${branding.social_facebook}" style="margin: 0 8px; color: #666;">Facebook</a>` : ''}
            ${branding.social_instagram ? `<a href="${branding.social_instagram}" style="margin: 0 8px; color: #666;">Instagram</a>` : ''}
            ${branding.social_twitter ? `<a href="${branding.social_twitter}" style="margin: 0 8px; color: #666;">Twitter</a>` : ''}
            ${branding.social_linkedin ? `<a href="${branding.social_linkedin}" style="margin: 0 8px; color: #666;">LinkedIn</a>` : ''}
          </div>`
        : '';

      emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${emailTemplate.preheader ? `<meta name="x-apple-disable-message-reformatting"><!--[if !mso]><!--><style>*{-webkit-text-size-adjust:none;}</style><!--<![endif]--><span style="display:none!important;visibility:hidden;mso-hide:all;font-size:0;max-height:0;line-height:0;">${replaceVariables(emailTemplate.preheader)}</span>` : ''}
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; max-width: 100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: ${branding.primary_color}; padding: 24px;">
              ${branding.company_logo_url 
                ? `<img src="${branding.company_logo_url}" alt="${branding.company_name}" style="max-height: 48px; max-width: 200px;">`
                : `<span style="color: #ffffff; font-size: 24px; font-weight: bold;">${branding.company_name}</span>`
              }
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              ${headerText ? `<h1 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">${headerText}</h1>` : ''}
              <div style="color: #4a4a4a; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${bodyContent}</div>
              ${buttonText && buttonUrl ? `
                <div style="margin-top: 24px; text-align: center;">
                  <a href="${buttonUrl}" style="display: inline-block; background-color: ${branding.primary_color}; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">${buttonText}</a>
                </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${branding.footer_text}</p>
              <p style="margin: 0 0 8px 0; color: #888; font-size: 12px;">${branding.company_address}</p>
              <p style="margin: 0 0 8px 0; color: #888; font-size: 12px;">${branding.company_phone}</p>
              ${emailTemplate.show_social_links !== false ? socialLinksHtml : ''}
              <p style="margin: 16px 0 0 0; color: #aaa; font-size: 11px;">${branding.copyright_text}</p>
              ${emailTemplate.show_unsubscribe !== false ? `<p style="margin: 8px 0 0 0;"><a href="${branding.company_website}/unsubscribe" style="color: #888; font-size: 11px;">Unsubscribe</a></p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    }

    // Use fallback HTML if neither template nor custom HTML provided
    if (!emailHtml) {
      emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px;">
  <h1>${emailSubject}</h1>
  <p>${text || variables?.message || 'No content'}</p>
  <hr>
  <p style="color: #666; font-size: 12px;">${branding.company_name} - ${branding.copyright_text}</p>
</body>
</html>`;
    }

    // Send email via Resend
    const fromAddress = `${smtpConfig.fromName} <${smtpConfig.fromEmail || 'onboarding@resend.dev'}>`;
    
    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject || 'Notification',
      html: emailHtml,
      reply_to: smtpConfig.replyToEmail || undefined,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
