import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
  skipAuth?: boolean; // For system emails (webhooks, cron)
}

interface EmailConfig {
  provider: string;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  isEnabled: boolean;
  siteUrl: string;
  verificationBaseUrl: string;
  passwordResetUrl: string;
  loginUrl: string;
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

const defaultConfig: EmailConfig = {
  provider: 'resend',
  fromEmail: 'noreply@astravilla.com',
  fromName: 'ASTRA Villa',
  replyToEmail: 'support@astravilla.com',
  isEnabled: true,
  siteUrl: 'https://astravilla.com',
  verificationBaseUrl: 'https://astravilla.com/verify',
  passwordResetUrl: 'https://astravilla.com/reset-password',
  loginUrl: 'https://astravilla.com/auth'
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
        console.error('send-email: Missing Authorization header');
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

      const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
      if (userError || !user) {
        console.error('send-email: Invalid user token', userError);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid or expired token' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check admin permission for sending to others
      const toAddresses = Array.isArray(to) ? to : [to];
      const { data: isAdmin } = await supabase.rpc('has_role', { user_id: user.id, role: 'admin' });
      
      if (!isAdmin) {
        const userEmail = user.email?.toLowerCase();
        const allToOwnEmail = toAddresses.every(addr => addr.toLowerCase() === userEmail);
        if (!allToOwnEmail) {
          return new Response(
            JSON.stringify({ success: false, error: 'You can only send emails to your own address' }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Fetch email config
    const { data: configData } = await supabase
      .from('system_settings')
      .select('key, value')
      .eq('category', 'email')
      .in('key', ['config', 'branding', 'templates']);

    let config = { ...defaultConfig };
    let branding = { ...defaultBranding };
    let templates: EmailTemplate[] = [];

    configData?.forEach((item) => {
      if (item.key === 'config' && item.value) config = { ...config, ...(item.value as Partial<EmailConfig>) };
      if (item.key === 'branding' && item.value) branding = { ...branding, ...(item.value as Partial<EmailBranding>) };
      if (item.key === 'templates' && Array.isArray(item.value)) templates = item.value as EmailTemplate[];
    });

    if (!config.isEnabled) {
      console.log('Email sending is disabled');
      return new Response(
        JSON.stringify({ success: false, error: 'Email sending is disabled' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      site_url: config.siteUrl,
      verification_url: config.verificationBaseUrl,
      reset_url: config.passwordResetUrl,
      login_url: config.loginUrl,
      ...variables
    };

    // Build email HTML
    let emailHtml = html;
    let emailSubject = subject;

    if (template) {
      const emailTemplate = templates.find(t => t.id === template);
      
      if (!emailTemplate) {
        console.warn(`Template "${template}" not found, using default template`);
      }

      const tpl = emailTemplate || {
        subject: subject || 'Notification from ASTRA Villa',
        preheader: '',
        headerText: '',
        body: variables?.message || text || '',
        buttonText: '',
        buttonUrl: '',
        showSocialLinks: true,
        showUnsubscribe: true
      };

      emailSubject = emailSubject || tpl.subject;
      
      // Replace variables in template
      const replaceVariables = (text: string) => {
        let result = text;
        for (const [key, value] of Object.entries(allVariables)) {
          result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
        }
        return result;
      };

      emailSubject = replaceVariables(emailSubject);
      const bodyContent = replaceVariables(tpl.body);
      const headerText = replaceVariables(tpl.headerText);
      const buttonText = replaceVariables(tpl.buttonText);
      const buttonUrl = replaceVariables(tpl.buttonUrl);
      const preheader = replaceVariables(tpl.preheader);

      // Build social links HTML
      const socialLinksHtml = (branding.socialFacebook || branding.socialInstagram || branding.socialTwitter || branding.socialLinkedin) && tpl.showSocialLinks
        ? `<div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E8E0D5;">
            ${branding.socialFacebook ? `<a href="${branding.socialFacebook}" style="display: inline-block; margin: 0 8px; color: ${branding.primaryColor}; text-decoration: none; font-size: 13px;">Facebook</a>` : ''}
            ${branding.socialInstagram ? `<a href="${branding.socialInstagram}" style="display: inline-block; margin: 0 8px; color: ${branding.primaryColor}; text-decoration: none; font-size: 13px;">Instagram</a>` : ''}
            ${branding.socialTwitter ? `<a href="${branding.socialTwitter}" style="display: inline-block; margin: 0 8px; color: ${branding.primaryColor}; text-decoration: none; font-size: 13px;">Twitter</a>` : ''}
            ${branding.socialLinkedin ? `<a href="${branding.socialLinkedin}" style="display: inline-block; margin: 0 8px; color: ${branding.primaryColor}; text-decoration: none; font-size: 13px;">LinkedIn</a>` : ''}
          </div>`
        : '';

      // Luxury email template
      emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  ${preheader ? `<span style="display:none!important;visibility:hidden;mso-hide:all;font-size:0;max-height:0;line-height:0;">${preheader}</span>` : ''}
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 50%, #FFFDF9 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 50%, #FFFDF9 100%);">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #FFFFFF; border-radius: 16px; overflow: hidden; max-width: 100%; box-shadow: 0 4px 24px rgba(184, 134, 11, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);">
          
          <!-- Top Gold Accent -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.accentColor} 50%, ${branding.primaryColor} 100%);"></td>
          </tr>
          
          <!-- Logo Section -->
          <tr>
            <td align="center" style="padding: 32px 24px 24px 24px; background: linear-gradient(180deg, #FFFDF9 0%, #FFFFFF 100%);">
              ${branding.companyLogoUrl 
                ? `<img src="${branding.companyLogoUrl}" alt="${branding.companyName}" style="max-height: 56px; max-width: 200px;">`
                : `<div style="font-family: 'Playfair Display', Georgia, serif;">
                    <span style="color: ${branding.primaryColor}; font-size: 32px; font-weight: 600; letter-spacing: 2px;">ASTRA</span>
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
                  <td style="padding: 0 16px; width: 20px;">
                    <div style="width: 8px; height: 8px; background: ${branding.primaryColor}; transform: rotate(45deg);"></div>
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
                  <a href="${buttonUrl}" style="display: inline-block; background: linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%); color: #FFFFFF; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(184, 134, 11, 0.25);">${buttonText}</a>
                </div>
              ` : ''}
            </td>
          </tr>
          
          <!-- Footer Section -->
          <tr>
            <td style="background: linear-gradient(180deg, #FAFAF8 0%, #F5F3F0 100%); padding: 32px 40px; text-align: center;">
              <p style="margin: 0 0 12px 0; color: #6B635A; font-size: 14px; font-style: italic;">${branding.footerText}</p>
              <p style="margin: 0 0 8px 0; color: #8B8580; font-size: 13px;">${branding.companyAddress}</p>
              <p style="margin: 0; color: #8B8580; font-size: 13px;">
                <a href="tel:${branding.companyPhone}" style="color: ${branding.primaryColor}; text-decoration: none;">${branding.companyPhone}</a>
                &nbsp;•&nbsp;
                <a href="mailto:${branding.supportEmail}" style="color: ${branding.primaryColor}; text-decoration: none;">${branding.supportEmail}</a>
              </p>
              ${socialLinksHtml}
              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E8E0D5;">
                <p style="margin: 0; color: #A8A29E; font-size: 11px; letter-spacing: 0.5px;">${branding.copyrightText}</p>
                ${tpl.showUnsubscribe ? `<p style="margin: 8px 0 0 0;"><a href="${branding.companyWebsite}/unsubscribe" style="color: #A8A29E; font-size: 11px; text-decoration: underline;">Unsubscribe from emails</a></p>` : ''}
              </div>
            </td>
          </tr>
          
          <!-- Bottom Gold Accent -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.accentColor} 50%, ${branding.primaryColor} 100%);"></td>
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

    // Fallback HTML if no template
    if (!emailHtml) {
      emailHtml = `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 40px 20px; background: linear-gradient(135deg, #FFFBF5 0%, #FFF8F0 100%); font-family: -apple-system, sans-serif;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="margin: 0 auto; background: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 24px rgba(184, 134, 11, 0.08);">
    <tr><td style="height: 4px; background: linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%);"></td></tr>
    <tr>
      <td style="padding: 40px;">
        <h1 style="margin: 0 0 24px 0; color: #2D2A26; font-size: 24px;">${emailSubject || 'Notification'}</h1>
        <p style="margin: 0 0 24px 0; color: #4A4540; font-size: 15px; line-height: 1.7;">${text || allVariables.message || 'No content'}</p>
        <hr style="border: none; border-top: 1px solid #E8E0D5; margin: 24px 0;">
        <p style="margin: 0; color: #8B8580; font-size: 12px;">${branding.companyName} • ${branding.copyrightText}</p>
      </td>
    </tr>
    <tr><td style="height: 4px; background: linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.accentColor} 100%);"></td></tr>
  </table>
</body>
</html>`;
    }

    // Send email via Resend
    const fromAddress = `${config.fromName} <${config.fromEmail || 'onboarding@resend.dev'}>`;
    
    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject || 'Notification',
      html: emailHtml,
      reply_to: config.replyToEmail || undefined,
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
