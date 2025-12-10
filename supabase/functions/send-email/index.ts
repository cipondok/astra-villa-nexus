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
      primary_color: '#B8860B', // Gold - luxury accent
      secondary_color: '#0066FF', // Samsung Blue
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

      // Build social links HTML with elegant styling
      const socialLinksHtml = branding.social_facebook || branding.social_instagram || branding.social_twitter || branding.social_linkedin
        ? `<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E8E0D5;">
            ${branding.social_facebook ? `<a href="${branding.social_facebook}" style="display: inline-block; margin: 0 8px; color: ${branding.primary_color}; text-decoration: none; font-size: 13px;">Facebook</a>` : ''}
            ${branding.social_instagram ? `<a href="${branding.social_instagram}" style="display: inline-block; margin: 0 8px; color: ${branding.primary_color}; text-decoration: none; font-size: 13px;">Instagram</a>` : ''}
            ${branding.social_twitter ? `<a href="${branding.social_twitter}" style="display: inline-block; margin: 0 8px; color: ${branding.primary_color}; text-decoration: none; font-size: 13px;">Twitter</a>` : ''}
            ${branding.social_linkedin ? `<a href="${branding.social_linkedin}" style="display: inline-block; margin: 0 8px; color: ${branding.primary_color}; text-decoration: none; font-size: 13px;">LinkedIn</a>` : ''}
          </div>`
        : '';

      // Luxury light email template matching website design
      emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  ${emailTemplate.preheader ? `<meta name="x-apple-disable-message-reformatting"><!--[if !mso]><!--><style>*{-webkit-text-size-adjust:none;}</style><!--<![endif]--><span style="display:none!important;visibility:hidden;mso-hide:all;font-size:0;max-height:0;line-height:0;">${replaceVariables(emailTemplate.preheader)}</span>` : ''}
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 50%, #FFFDF9 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 50%, #FFFDF9 100%);">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; max-width: 100%; box-shadow: 0 4px 24px rgba(184, 134, 11, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);">
          
          <!-- Elegant Header with Gold Accent -->
          <tr>
            <td style="padding: 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="height: 4px; background: linear-gradient(90deg, ${branding.primary_color} 0%, #D4AF37 50%, ${branding.primary_color} 100%);"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px; background: linear-gradient(180deg, #FFFDF9 0%, #FFFFFF 100%);">
              ${branding.company_logo_url 
                ? `<img src="${branding.company_logo_url}" alt="${branding.company_name}" style="max-height: 56px; max-width: 200px;">`
                : `<div style="font-family: 'Playfair Display', Georgia, serif;">
                    <span style="color: ${branding.primary_color}; font-size: 32px; font-weight: 600; letter-spacing: 2px;">ASTRA</span>
                    <span style="color: #2D2A26; font-size: 32px; font-weight: 400; letter-spacing: 2px;"> Villa</span>
                  </div>
                  <p style="margin: 8px 0 0 0; color: #8B7355; font-size: 12px; letter-spacing: 3px; text-transform: uppercase;">Luxury Real Estate</p>`
              }
            </td>
          </tr>
          
          <!-- Decorative Divider -->
          <tr>
            <td align="center" style="padding: 0 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-bottom: 1px solid #E8E0D5;"></td>
                  <td style="padding: 0 16px;">
                    <div style="width: 8px; height: 8px; background: ${branding.primary_color}; transform: rotate(45deg); display: inline-block;"></div>
                  </td>
                  <td style="border-bottom: 1px solid #E8E0D5;"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Content Section -->
          <tr>
            <td style="padding: 40px 40px 32px 40px;">
              ${headerText ? `<h1 style="margin: 0 0 24px 0; color: #2D2A26; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 600; line-height: 1.3; text-align: center;">${headerText}</h1>` : ''}
              <div style="color: #4A4540; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${bodyContent}</div>
              ${buttonText && buttonUrl ? `
                <div style="margin-top: 32px; text-align: center;">
                  <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, ${branding.primary_color} 0%, #D4AF37 100%); color: #FFFFFF; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(184, 134, 11, 0.25);">${buttonText}</a>
                </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td style="background: linear-gradient(180deg, #FAFAF8 0%, #F5F3F0 100%); padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 12px 0; color: #6B635A; font-size: 14px; font-style: italic;">${branding.footer_text}</p>
              <p style="margin: 0 0 8px 0; color: #8B8580; font-size: 13px;">${branding.company_address}</p>
              <p style="margin: 0; color: #8B8580; font-size: 13px;">
                <a href="tel:${branding.company_phone}" style="color: ${branding.primary_color}; text-decoration: none;">${branding.company_phone}</a>
                &nbsp;•&nbsp;
                <a href="mailto:${branding.support_email}" style="color: ${branding.primary_color}; text-decoration: none;">${branding.support_email}</a>
              </p>
              ${emailTemplate.show_social_links !== false ? socialLinksHtml : ''}
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E8E0D5;">
                <p style="margin: 0; color: #A8A29E; font-size: 11px; letter-spacing: 0.5px;">${branding.copyright_text}</p>
                ${emailTemplate.show_unsubscribe !== false ? `<p style="margin: 8px 0 0 0;"><a href="${branding.company_website}/unsubscribe" style="color: #A8A29E; font-size: 11px; text-decoration: underline;">Unsubscribe from emails</a></p>` : ''}
              </div>
            </td>
          </tr>
          
          <!-- Bottom Gold Accent -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${branding.primary_color} 0%, #D4AF37 50%, ${branding.primary_color} 100%);"></td>
          </tr>
        </table>
        
        <!-- Footer Tagline -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 100%;">
          <tr>
            <td align="center" style="padding: 24px 20px;">
              <p style="margin: 0; color: #A8A29E; font-size: 11px; font-family: 'Playfair Display', Georgia, serif; letter-spacing: 1px;">Experience Luxury Living</p>
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
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=Inter:wght@400;500&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 40px 20px; background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 100%); font-family: 'Inter', -apple-system, sans-serif;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 24px rgba(184, 134, 11, 0.08);">
    <tr><td style="height: 4px; background: linear-gradient(90deg, ${branding.primary_color} 0%, #D4AF37 100%);"></td></tr>
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px 0; color: #2D2A26; font-family: 'Playfair Display', Georgia, serif; font-size: 24px;">${emailSubject}</h1>
        <p style="margin: 0 0 24px 0; color: #4A4540; font-size: 15px; line-height: 1.7;">${text || variables?.message || 'No content'}</p>
        <hr style="border: none; border-top: 1px solid #E8E0D5; margin: 24px 0;">
        <p style="margin: 0; color: #8B8580; font-size: 12px;">${branding.company_name} • ${branding.copyright_text}</p>
      </td>
    </tr>
    <tr><td style="height: 4px; background: linear-gradient(90deg, ${branding.primary_color} 0%, #D4AF37 100%);"></td></tr>
  </table>
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
