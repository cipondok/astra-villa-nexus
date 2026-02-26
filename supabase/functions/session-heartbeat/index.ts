import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse body for device info
    let deviceInfo: Record<string, string> = {};
    try {
      const body = await req.json();
      deviceInfo = body || {};
    } catch {
      // No body or invalid JSON — that's fine
    }

    // Update last_seen_at in profiles
    await supabase
      .from('profiles')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', user.id);

    // Upsert session record if device_fingerprint provided
    if (deviceInfo.device_fingerprint) {
      const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || req.headers.get('cf-connecting-ip')
        || null;

      // Try to find existing session by user + fingerprint
      const { data: existing } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('device_fingerprint', deviceInfo.device_fingerprint)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('user_sessions')
          .update({
            last_activity_at: new Date().toISOString(),
            is_current: true,
            ...(clientIp ? { ip_address: clientIp } : {}),
          })
          .eq('id', existing.id);
      } else {
        // Create new session record
        const sessionToken = crypto.randomUUID();
        await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            session_token: sessionToken,
            device_fingerprint: deviceInfo.device_fingerprint,
            device_name: deviceInfo.device_name || null,
            device_type: deviceInfo.device_type || null,
            browser: deviceInfo.browser || null,
            os: deviceInfo.os || null,
            ip_address: clientIp,
            is_current: true,
            last_activity_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          });
      }

      // Mark all other sessions for this user as not current
      await supabase
        .from('user_sessions')
        .update({ is_current: false })
        .eq('user_id', user.id)
        .neq('device_fingerprint', deviceInfo.device_fingerprint);
    }

    return new Response(
      JSON.stringify({ valid: true, user_id: user.id, timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('Heartbeat error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
