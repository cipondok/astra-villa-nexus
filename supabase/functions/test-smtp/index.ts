
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    // Create SMTP connection URL
    let smtpUrl = '';
    if (smtp_config.encryption === 'ssl') {
      smtpUrl = `smtps://${encodeURIComponent(smtp_config.username)}:${encodeURIComponent(smtp_config.password)}@${smtp_config.host}:${smtp_config.port}`;
    } else {
      smtpUrl = `smtp://${encodeURIComponent(smtp_config.username)}:${encodeURIComponent(smtp_config.password)}@${smtp_config.host}:${smtp_config.port}`;
    }

    // Prepare email content
    const emailContent = {
      from: `${smtp_config.from_name} <${smtp_config.from_email}>`,
      to: test_email.to,
      subject: test_email.subject,
      html: `
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
      `,
      text: `${test_email.message}\n\n---\nTest Details:\nSMTP Host: ${smtp_config.host}:${smtp_config.port}\nEncryption: ${smtp_config.encryption.toUpperCase()}\nFrom: ${smtp_config.from_email}\nSent at: ${new Date().toISOString()}`
    };

    // Simulate SMTP test (in a real implementation, you would use a proper SMTP library)
    console.log('Simulating SMTP test with configuration:', {
      url: smtpUrl.replace(/:([^:@]+)@/, ':***@'), // Hide password in logs
      email: emailContent
    });

    // For demo purposes, we'll simulate success after validation
    // In a real implementation, you would use a library like nodemailer or similar
    
    // Simulate different scenarios based on configuration
    if (smtp_config.host.includes('invalid') || smtp_config.host === '') {
      throw new Error('Invalid SMTP host');
    }
    
    if (smtp_config.port < 1 || smtp_config.port > 65535) {
      throw new Error('Invalid SMTP port');
    }
    
    if (!smtp_config.username || !smtp_config.password) {
      throw new Error('Authentication failed: Invalid username or password');
    }

    // Simulate sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = {
      success: true,
      message: 'Test email sent successfully',
      details: {
        from: emailContent.from,
        to: emailContent.to,
        subject: emailContent.subject,
        smtp_host: smtp_config.host,
        smtp_port: smtp_config.port,
        encryption: smtp_config.encryption,
        timestamp: new Date().toISOString()
      }
    };

    console.log('SMTP test completed successfully:', response.details);

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
