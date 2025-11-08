import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, method, user_id } = await req.json();

    if (!code || !method || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch user's 2FA settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: '2FA not configured' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let isValid = false;

    if (method === 'totp') {
      // Verify TOTP code
      // In production, use a TOTP library like otpauth or speakeasy
      // For now, this is a placeholder
      isValid = code.length === 6 && /^\d+$/.test(code);
    } else if (method === 'sms') {
      // Verify SMS code
      // In production, verify against stored code with expiration
      isValid = code.length === 6 && /^\d+$/.test(code);
    }

    // Log the attempt
    await supabaseClient
      .from('user_2fa_attempts')
      .insert({
        user_id,
        method,
        success: isValid,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      });

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid verification code' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Verification successful' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});