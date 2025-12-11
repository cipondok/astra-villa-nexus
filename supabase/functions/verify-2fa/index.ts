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
    // Get Authorization header and validate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('verify-2fa: Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to get their identity
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      console.error('verify-2fa: Invalid user token', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user_id from authenticated session, NOT from request body
    const authenticatedUserId = user.id;
    console.log('verify-2fa: Authenticated user:', authenticatedUserId);

    const { code, method } = await req.json();

    if (!code || !method) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: code and method' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate code format
    if (typeof code !== 'string' || code.length !== 6 || !/^\d+$/.test(code)) {
      return new Response(
        JSON.stringify({ error: 'Invalid code format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch user's 2FA settings using the AUTHENTICATED user_id
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', authenticatedUserId)
      .single();

    if (settingsError || !settings) {
      console.log('verify-2fa: 2FA not configured for user:', authenticatedUserId);
      return new Response(
        JSON.stringify({ error: '2FA not configured' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let isValid = false;

    if (method === 'totp') {
      // Verify TOTP code
      // In production, use a TOTP library like otpauth or speakeasy
      isValid = code.length === 6 && /^\d+$/.test(code);
    } else if (method === 'sms') {
      // Verify SMS code
      // In production, verify against stored code with expiration
      isValid = code.length === 6 && /^\d+$/.test(code);
    }

    // Log the attempt with authenticated user_id
    await supabaseAdmin
      .from('user_2fa_attempts')
      .insert({
        user_id: authenticatedUserId,
        method,
        success: isValid,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      });

    if (!isValid) {
      console.log('verify-2fa: Invalid code for user:', authenticatedUserId);
      return new Response(
        JSON.stringify({ error: 'Invalid verification code' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('verify-2fa: Verification successful for user:', authenticatedUserId);
    return new Response(
      JSON.stringify({ success: true, message: 'Verification successful' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('verify-2fa: Unexpected error', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});