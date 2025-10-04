import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InquiryEmailRequest {
  inquiry_id: string;
  customer_email: string;
  customer_name: string;
  inquiry_type: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { inquiry_id, customer_email, customer_name, inquiry_type, message }: InquiryEmailRequest = await req.json();

    console.log('Processing inquiry email for:', customer_email);

    // Get SMTP settings
    const { data: smtpData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('category', 'email')
      .eq('key', 'smtp_config')
      .single();

    if (!smtpData?.value?.enabled) {
      console.log('SMTP not enabled, skipping email');
      return new Response(
        JSON.stringify({ success: true, message: 'Email sending disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const smtpConfig = smtpData.value;

    // Get email template
    const { data: templateData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('category', 'email_templates')
      .eq('key', 'inquiry_received')
      .single();

    const template = templateData?.value || {
      subject: 'Thank you for your inquiry',
      body: 'Dear {{customer_name}},\n\nThank you for contacting us. We have received your inquiry regarding {{inquiry_type}}.\n\nYour message: {{message}}\n\nWe will get back to you as soon as possible.\n\nBest regards,\nYour Team'
    };

    // Replace template variables
    let emailSubject = template.subject;
    let emailBody = template.body
      .replace(/\{\{customer_name\}\}/g, customer_name)
      .replace(/\{\{inquiry_type\}\}/g, inquiry_type)
      .replace(/\{\{message\}\}/g, message);

    // Send email using SMTP
    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.host,
        port: parseInt(smtpConfig.port),
        tls: true,
        auth: {
          username: smtpConfig.username,
          password: smtpConfig.password,
        },
      },
    });

    await client.send({
      from: `${smtpConfig.from_name} <${smtpConfig.from_email}>`,
      to: customer_email,
      subject: emailSubject,
      content: emailBody,
    });

    await client.close();

    console.log('Inquiry email sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending inquiry email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
