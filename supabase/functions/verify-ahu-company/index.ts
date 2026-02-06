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
      status: 'pending_manual_review',
      message: 'Auto-verification unavailable, submitted for manual admin review',
      ahu_checked: false,
      company_found: false,
      company_data: null as any,
      search_url: ''
    };

    try {
      // AHU uses POST form submission for search at /pencarian/profil-pt
      // The search form submits to the same page with form data
      const ahuBaseUrl = 'https://ahu.go.id/pencarian/profil-pt';
      
      // First try to get the main search page
      console.log(`Fetching AHU search page: ${ahuBaseUrl}`);
      
      const searchPageResponse = await fetch(ahuBaseUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        },
      });

      console.log(`AHU search page status: ${searchPageResponse.status}`);

      if (searchPageResponse.ok) {
        const searchPageHtml = await searchPageResponse.text();
        console.log(`Search page HTML length: ${searchPageHtml.length}`);
        
        // Try to submit search form with company name
        // AHU form typically uses 'nama' or 'keyword' as the search parameter
        const formData = new URLSearchParams();
        formData.append('nama', company_name.trim());
        formData.append('keyword', company_name.trim());
        
        const searchResponse = await fetch(ahuBaseUrl, {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://ahu.go.id',
            'Referer': ahuBaseUrl,
          },
          body: formData.toString(),
        });

        console.log(`AHU search response status: ${searchResponse.status}`);

        if (searchResponse.ok) {
          const resultHtml = await searchResponse.text();
          console.log(`Search result HTML length: ${resultHtml.length}`);
          
          // Check if company name appears in results
          const companyNameLower = company_name.toLowerCase();
          const htmlLower = resultHtml.toLowerCase();
          
          // Look for common patterns in AHU search results
          // AHU typically shows results in a table with company names
          const hasResults = htmlLower.includes(companyNameLower) || 
                            htmlLower.includes(normalizedName.toLowerCase()) ||
                            (htmlLower.includes('pt ') && htmlLower.includes(companyNameLower.replace('pt ', '')));
          
          // Check for "tidak ditemukan" (not found) message
          const notFound = htmlLower.includes('tidak ditemukan') || 
                          htmlLower.includes('data tidak ada') ||
                          htmlLower.includes('no results') ||
                          htmlLower.includes('tidak ada data');

          if (hasResults && !notFound) {
            // Extract company info if possible
            const ptPattern = new RegExp(`(PT\\.?\\s*[^<]+${company_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('PT ', '').replace('pt ', '')}[^<]*)`, 'i');
            const match = resultHtml.match(ptPattern);
            
            verificationResult = {
              status: 'verified',
              message: 'Company found in AHU database',
              ahu_checked: true,
              company_found: true,
              company_data: {
                name: match ? match[1].trim() : company_name,
                source: 'AHU Indonesia - Pencarian Profil PT',
                verified_at: new Date().toISOString()
              },
              search_url: ahuBaseUrl
            };
            console.log(`Company verified: ${company_name}`);
          } else if (notFound) {
            verificationResult = {
              status: 'not_found',
              message: 'Company not found in AHU database. Please verify the exact company name.',
              ahu_checked: true,
              company_found: false,
              company_data: null,
              search_url: ahuBaseUrl
            };
            console.log(`Company not found in AHU: ${company_name}`);
          } else {
            // Results ambiguous - submit for manual review
            verificationResult = {
              status: 'pending_manual_review',
              message: 'Search completed but requires manual verification. Admin will review.',
              ahu_checked: true,
              company_found: false,
              company_data: null,
              search_url: ahuBaseUrl
            };
          }
        } else {
          console.log(`AHU search POST failed with status: ${searchResponse.status}`);
          await searchResponse.text(); // Consume body
        }
      } else {
        console.log(`AHU search page GET failed with status: ${searchPageResponse.status}`);
        await searchPageResponse.text(); // Consume body
      }
    } catch (fetchError) {
      console.error('Error fetching from AHU:', fetchError);
      verificationResult.message = 'Could not reach AHU website, submitted for manual review';
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update profile based on result
    if (verificationResult.status === 'verified') {
      await supabase
        .from('profiles')
        .update({
          company_verified: true,
          company_verified_at: new Date().toISOString(),
        })
        .eq('id', user_id);

      console.log(`Profile updated as verified for user: ${user_id}`);
    } else if (verificationResult.status === 'pending_manual_review' || verificationResult.status === 'not_found') {
      // Create admin alert for manual review
      await supabase
        .from('admin_alerts')
        .insert({
          type: 'verification_request',
          title: `Company Verification - ${verificationResult.status === 'not_found' ? 'Not Found in AHU' : 'Manual Review Required'}`,
          message: `Company "${company_name}" ${verificationResult.status === 'not_found' ? 'was not found' : 'requires verification'} in AHU database. ${verificationResult.message}`,
          priority: 'medium',
          action_required: true,
          reference_type: 'company_verification',
          reference_id: user_id,
          metadata: {
            user_id,
            company_name,
            ahu_checked: verificationResult.ahu_checked,
            company_found: verificationResult.company_found,
            ahu_search_url: 'https://ahu.go.id/pencarian/profil-pt',
            verification_status: verificationResult.status
          }
        });

      console.log(`Admin alert created for: ${company_name} (${verificationResult.status})`);
    }

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
        details: error.message 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
