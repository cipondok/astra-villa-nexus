import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { company_name, user_id } = await req.json();

    if (!company_name || !user_id) {
      return new Response(
        JSON.stringify({ error: 'company_name and user_id are required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Attempting to verify company: ${company_name}`);

    const normalizedName = company_name.trim().toUpperCase();
    
    let verificationResult = {
      status: 'captcha_blocked',
      message: 'AHU website requires CAPTCHA. Please verify manually.',
      ahu_checked: false,
      company_found: false,
      company_data: null as any,
      search_url: 'https://ahu.go.id/pencarian/profil-pt',
      requires_manual: true,
    };

    try {
      // AHU uses reCAPTCHA Enterprise — automated access is blocked.
      // We do a quick GET check with a 5-second timeout to see if the site is reachable.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const ahuBaseUrl = 'https://ahu.go.id/pencarian/profil-pt';
      console.log(`Quick-checking AHU availability: ${ahuBaseUrl}`);

      const response = await fetch(ahuBaseUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
      });
      clearTimeout(timeoutId);

      console.log(`AHU status: ${response.status}`);
      const html = await response.text();

      // Check if CAPTCHA is present (it always is)
      const hasCaptcha = html.toLowerCase().includes('recaptcha') || 
                         html.toLowerCase().includes('captcha');

      if (hasCaptcha) {
        console.log('AHU has CAPTCHA protection — automated search not possible');
        verificationResult = {
          status: 'captcha_blocked',
          message: 'AHU website is protected by CAPTCHA. Please verify manually via the popup window.',
          ahu_checked: false,
          company_found: false,
          company_data: null,
          search_url: ahuBaseUrl,
          requires_manual: true,
        };
      } else if (response.status === 403 || response.status === 503) {
        console.log(`AHU returned ${response.status} — site may be blocking automated access`);
        verificationResult.message = `AHU returned status ${response.status}. Please verify manually.`;
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.log('AHU request timed out after 5 seconds');
        verificationResult.message = 'AHU website timed out. Please verify manually via the popup window.';
      } else {
        console.error('Error reaching AHU:', fetchError);
        verificationResult.message = 'Could not reach AHU website. Please verify manually.';
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Always create an admin alert for tracking, since auto-verification isn't possible
    await supabase
      .from('admin_alerts')
      .insert({
        type: 'company_verification',
        title: `Company Verification - Auto-Check Attempted`,
        message: `Auto-verification attempted for "${company_name}" but AHU requires CAPTCHA. User will be prompted for manual verification via popup.`,
        priority: 'low',
        action_required: false,
        reference_type: 'company_verification',
        reference_id: user_id,
        metadata: {
          user_id,
          company_name,
          normalized_name: normalizedName,
          ahu_checked: verificationResult.ahu_checked,
          auto_check_result: verificationResult.status,
          ahu_search_url: 'https://ahu.go.id/pencarian/profil-pt',
        }
      });

    console.log(`Returning result: ${verificationResult.status}`);

    return new Response(
      JSON.stringify(verificationResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-ahu-company:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: 'Internal server error', 
        details: error.message,
        requires_manual: true,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
