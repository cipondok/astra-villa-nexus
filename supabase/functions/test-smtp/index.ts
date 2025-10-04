import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  from_email: string;
  from_name: string;
  enabled: boolean;
}

interface TestEmailRequest {
  smtp_config: SMTPConfig;
  test_email: {
    to: string;
    subject: string;
    message: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { smtp_config, test_email }: TestEmailRequest = await req.json();

    console.log('Testing SMTP configuration:', {
      host: smtp_config.host,
      port: smtp_config.port,
      encryption: smtp_config.encryption,
      from_email: smtp_config.from_email,
      to: test_email.to
    });

    // Validate required fields
    if (!smtp_config.host || !smtp_config.port || !smtp_config.username || !smtp_config.password) {
      throw new Error('Missing required SMTP configuration fields');
    }

    if (!smtp_config.enabled) {
      throw new Error('SMTP is disabled in configuration');
    }

    if (!test_email.to) {
      throw new Error('Test email address is required');
    }

    console.log('Testing SMTP connection with real email send...');

    // Configure SMTP client based on encryption type
    const clientConfig: any = {
      connection: {
        hostname: smtp_config.host,
        port: parseInt(smtp_config.port),
        auth: {
          username: smtp_config.username,
          password: smtp_config.password,
        },
      },
    };

    // Set TLS/SSL based on encryption type
    if (smtp_config.encryption === 'tls') {
      clientConfig.connection.tls = true;
    } else if (smtp_config.encryption === 'ssl') {
      clientConfig.connection.tls = true;
      clientConfig.connection.tls = { ciphers: "SSLv3" };
    }

    const client = new SMTPClient(clientConfig);

    // Prepare email HTML
    const emailHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">SMTP Test Email</h2>
            <p>${test_email.message.replace(/\n/g, '<br>')}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              <strong>Test Details:</strong><br>
              SMTP Host: ${smtp_config.host}:${smtp_config.port}<br>
              Encryption: ${smtp_config.encryption.toUpperCase()}<br>
              From: ${smtp_config.from_email}<br>
              Sent at: ${new Date().toISOString()}
            </p>
          </div>
        </body>
      </html>
    `;

    // Send the actual email
    await client.send({
      from: `${smtp_config.from_name} <${smtp_config.from_email}>`,
      to: test_email.to,
      subject: test_email.subject,
      html: emailHtml,
    });

    await client.close();

    const response = {
      success: true,
      message: 'Test email sent successfully',
      details: {
        from: `${smtp_config.from_name} <${smtp_config.from_email}>`,
        to: test_email.to,
        subject: test_email.subject,
        smtp_host: smtp_config.host,
        smtp_port: smtp_config.port,
        encryption: smtp_config.encryption,
        timestamp: new Date().toISOString()
      }
    };

    console.log('SMTP test completed successfully - Real email sent:', response.details);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('SMTP test failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 400,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
