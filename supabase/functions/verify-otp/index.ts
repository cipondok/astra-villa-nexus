import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  code: string;
  purpose: 'mfa' | 'email_verification' | 'password_reset';
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

    const { code, purpose }: VerifyOTPRequest = await req.json();

    if (!code || code.length !== 6) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the OTP code
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes' as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('purpose', purpose)
      .eq('is_used', false)
      .single();

    if (otpError || !otpData) {
      return new Response(
        JSON.stringify({ error: 'No valid OTP code found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if expired
    if (new Date(otpData.expires_at) < new Date()) {
      await supabase
        .from('otp_codes' as any)
        .update({ is_used: true })
        .eq('id', otpData.id);

      return new Response(
        JSON.stringify({ error: 'OTP code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check max attempts
    if (otpData.attempts >= otpData.max_attempts) {
      await supabase
        .from('otp_codes' as any)
        .update({ is_used: true })
        .eq('id', otpData.id);

      return new Response(
        JSON.stringify({ error: 'Maximum attempts exceeded' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify code
    if (otpData.code !== code) {
      // Increment attempts
      await supabase
        .from('otp_codes' as any)
        .update({ attempts: otpData.attempts + 1 })
        .eq('id', otpData.id);

      const remainingAttempts = otpData.max_attempts - (otpData.attempts + 1);
      
      return new Response(
        JSON.stringify({
          error: 'Invalid OTP code',
          remaining_attempts: remainingAttempts,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark as used
    await supabase
      .from('otp_codes' as any)
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq('id', otpData.id);

    // Update verification status based on purpose
    if (purpose === 'email_verification') {
      await supabase
        .from('user_verification' as any)
        .upsert({
          user_id: user.id,
          email_verified: true,
          email_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    } else if (purpose === 'mfa') {
      await supabase
        .from('mfa_settings' as any)
        .upsert({
          user_id: user.id,
          last_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
    }

    // Log security event
    await supabase.from('user_security_logs' as any).insert({
      user_id: user.id,
      event_type: `otp_verified_${purpose}`,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      metadata: {
        purpose,
        verified_at: new Date().toISOString(),
      },
    });

    console.log(`OTP verified for user ${user.id}, purpose: ${purpose}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP verified successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
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
