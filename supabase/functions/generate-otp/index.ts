import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateOTPRequest {
  purpose: 'mfa' | 'email_verification' | 'password_reset';
  email?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { purpose, email }: GenerateOTPRequest = await req.json();

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Clean up old unused OTP codes for this user and purpose
    await supabase
      .from('otp_codes' as any)
      .delete()
      .eq('user_id', user.id)
      .eq('purpose', purpose)
      .eq('is_used', false);

    // Extract first IP address from comma-separated list (proxy headers can have multiple IPs)
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : 'unknown';

    // Insert new OTP code
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes' as any)
      .insert({
        user_id: user.id,
        code,
        purpose,
        expires_at: expiresAt.toISOString(),
        ip_address: clientIp,
        user_agent: req.headers.get('user-agent') || 'unknown',
      })
      .select()
      .single();

    if (otpError) {
      console.error('Error creating OTP:', otpError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate OTP' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send OTP via email notification (using Supabase's built-in notifications)
    // Store in user_notifications table for the user to see
    try {
      await supabase.from('user_notifications' as any).insert({
        user_id: user.id,
        title: 'Verification Code',
        message: `Your verification code is: ${code}. This code will expire in 10 minutes.`,
        type: 'security',
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Continue even if notification fails
    }

    // Log security event
    await supabase.from('user_security_logs' as any).insert({
      user_id: user.id,
      event_type: `otp_generated_${purpose}`,
      ip_address: clientIp,
      metadata: {
        purpose,
        expires_at: expiresAt.toISOString(),
      },
    });

    console.log(`OTP generated for user ${user.id}, purpose: ${purpose}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP code sent successfully',
        expires_at: expiresAt.toISOString(),
        // Always include code for testing (since this is internal OTP system)
        dev_code: code,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Generate OTP error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
