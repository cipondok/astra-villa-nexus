import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { company_name, user_id } = await req.json();

    if (!company_name || !user_id) {
      return new Response(
        JSON.stringify({ error: 'company_name and user_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Attempting to verify company: ${company_name}`);

    // Normalize company name for search
    const normalizedName = company_name.trim().toUpperCase();
    
    // Try to fetch from AHU website
    // Note: AHU may block direct requests, so we attempt and handle failures gracefully
    let verificationResult = {
      status: 'pending_manual_review',
      message: 'Auto-verification unavailable, submitted for manual admin review',
      ahu_checked: false,
      company_found: false,
      company_data: null as any
    };

    try {
      // Attempt to query AHU's search endpoint
      // The AHU website uses this pattern for company searches
      const ahuSearchUrl = `https://ahu.go.id/pencarian/nama-pt?q=${encodeURIComponent(normalizedName)}`;
      
      console.log(`Fetching from AHU: ${ahuSearchUrl}`);
      
      const ahuResponse = await fetch(ahuSearchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        },
      });

      if (ahuResponse.ok) {
        const htmlContent = await ahuResponse.text();
        console.log(`Received HTML response, length: ${htmlContent.length}`);
        
        // Check if the company name appears in the response
        // AHU returns a table with company information
        const companyNameLower = normalizedName.toLowerCase();
        const htmlLower = htmlContent.toLowerCase();
        
        if (htmlLower.includes(companyNameLower) || htmlLower.includes(company_name.toLowerCase())) {
          // Try to extract basic info from HTML
          // Look for patterns like "PT NAMA PERUSAHAAN" in the results
          const ptPattern = new RegExp(`(PT\\.?\\s*${company_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
          const match = htmlContent.match(ptPattern);
          
          if (match) {
            verificationResult = {
              status: 'verified',
              message: 'Company found in AHU database',
              ahu_checked: true,
              company_found: true,
              company_data: {
                name: match[1],
                source: 'AHU Indonesia',
                verified_at: new Date().toISOString()
              }
            };
            console.log(`Company verified: ${match[1]}`);
          } else {
            // Company name found but couldn't extract exact match
            verificationResult = {
              status: 'pending_manual_review',
              message: 'Company name found in AHU, requires manual verification',
              ahu_checked: true,
              company_found: true,
              company_data: null
            };
          }
        } else {
          // Company not found in search results
          verificationResult = {
            status: 'not_found',
            message: 'Company not found in AHU database',
            ahu_checked: true,
            company_found: false,
            company_data: null
          };
        }
      } else {
        console.log(`AHU returned status: ${ahuResponse.status}`);
        // AHU blocked or returned error - fall back to manual review
        verificationResult.message = 'AHU website unavailable, submitted for manual review';
      }
    } catch (fetchError) {
      console.error('Error fetching from AHU:', fetchError);
      // Network error or AHU blocking - fall back to manual review
      verificationResult.message = 'Could not reach AHU website, submitted for manual review';
    }

    // Initialize Supabase client to update records
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update profile based on verification result
    if (verificationResult.status === 'verified') {
      await supabase
        .from('profiles')
        .update({
          company_verified: true,
          company_verified_at: new Date().toISOString(),
        })
        .eq('id', user_id);

      console.log(`Profile updated as verified for user: ${user_id}`);
    } else if (verificationResult.status === 'pending_manual_review') {
      // Create admin alert for manual review
      await supabase
        .from('admin_alerts')
        .insert({
          type: 'verification_request',
          title: 'Company Verification Request - Manual Review Required',
          message: `Company "${company_name}" requires manual verification against AHU database. ${verificationResult.message}`,
          priority: 'medium',
          action_required: true,
          reference_type: 'company_verification',
          reference_id: user_id,
          metadata: {
            user_id,
            company_name,
            ahu_checked: verificationResult.ahu_checked,
            company_found: verificationResult.company_found,
            ahu_search_url: `https://ahu.go.id/pencarian/nama-pt?q=${encodeURIComponent(company_name)}`
          }
        });

      console.log(`Admin alert created for manual review of: ${company_name}`);
    }

    return new Response(
      JSON.stringify(verificationResult),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in verify-ahu-company:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
