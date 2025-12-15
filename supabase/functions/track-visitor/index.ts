import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    const {
      visitor_id,
      user_id,
      page_path,
      referrer,
      user_agent,
      device_type,
      browser,
      os,
      session_id,
      visit_duration,
      is_bounce,
      exit_page
    } = body;

    // Get IP address from request headers
    const ip_address = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                       req.headers.get('x-real-ip') ||
                       req.headers.get('cf-connecting-ip') ||
                       'unknown';

    console.log(`Tracking visitor from IP: ${ip_address}`);

    // Check if IP is blocked
    if (ip_address !== 'unknown') {
      const { data: blockedIP } = await supabaseClient
        .from('ip_blocks')
        .select('id, is_permanent, expires_at')
        .eq('ip_address', ip_address)
        .maybeSingle();

      if (blockedIP) {
        // Check if block has expired
        if (!blockedIP.is_permanent && blockedIP.expires_at) {
          const expiresAt = new Date(blockedIP.expires_at);
          if (expiresAt > new Date()) {
            return new Response(
              JSON.stringify({ error: 'Access denied', blocked: true }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else if (blockedIP.is_permanent) {
          return new Response(
            JSON.stringify({ error: 'Access denied', blocked: true }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    // Get country/city from IP using ip-api.com (free service)
    let country = null;
    let city = null;

    if (ip_address !== 'unknown' && !ip_address.startsWith('192.168') && !ip_address.startsWith('10.') && !ip_address.startsWith('127.')) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip_address}?fields=status,country,countryCode,city`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.status === 'success') {
            country = geoData.countryCode;
            city = geoData.city;

            // Check if country is blocked
            const { data: blockedCountry } = await supabaseClient
              .from('country_blocks')
              .select('id')
              .eq('country_code', geoData.countryCode)
              .eq('is_active', true)
              .maybeSingle();

            if (blockedCountry) {
              console.log(`Blocked access from country: ${geoData.country} (${geoData.countryCode})`);
              return new Response(
                JSON.stringify({ error: 'Access not available in your region', blocked: true, country_blocked: true }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
          }
        }
      } catch (geoError) {
        console.error('Geo lookup error:', geoError);
      }
    }

    // Insert visitor record
    const { data, error } = await supabaseClient
      .from('web_analytics')
      .insert({
        visitor_id,
        user_id: user_id || null,
        page_path,
        referrer: referrer || null,
        user_agent,
        ip_address: ip_address !== 'unknown' ? ip_address : null,
        country,
        city,
        device_type,
        browser,
        os,
        session_id,
        visit_duration: visit_duration || 0,
        is_bounce: is_bounce || false,
        exit_page: exit_page || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error tracking visitor:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, tracked: true, country, city }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
