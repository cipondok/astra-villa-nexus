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

    console.log(`Verifying company: ${company_name}`);
    const normalizedName = company_name.trim().toUpperCase();

    let verificationResult = {
      status: 'not_found' as string,
      message: '',
      ahu_checked: false,
      company_found: false,
      company_data: null as any,
      search_url: 'https://ahu.go.id/pencarian/profil-pt',
      requires_manual: false,
    };

    // ---- Attempt 1: AHU direct search ----
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Try AHU search page - attempt to POST search or parse page
      const ahuSearchUrl = 'https://ahu.go.id/pencarian/profil-pt';
      console.log(`Attempting AHU search: ${ahuSearchUrl}`);

      const response = await fetch(ahuSearchUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      console.log(`AHU status: ${response.status}`);
      const html = await response.text();

      const hasCaptcha = html.toLowerCase().includes('recaptcha') || 
                         html.toLowerCase().includes('captcha') ||
                         html.toLowerCase().includes('g-recaptcha');

      if (!hasCaptcha && response.status === 200) {
        // AHU is accessible without CAPTCHA! Try to find a search form/API
        console.log('AHU accessible without CAPTCHA — attempting search');

        // Look for CSRF token or form action
        const csrfMatch = html.match(/name="_token"\s+value="([^"]+)"/);
        const csrfToken = csrfMatch ? csrfMatch[1] : null;

        if (csrfToken) {
          // Try POST search with CSRF token
          const searchController = new AbortController();
          const searchTimeout = setTimeout(() => searchController.abort(), 10000);

          const searchResponse = await fetch(ahuSearchUrl, {
            method: 'POST',
            signal: searchController.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Content-Type': 'application/x-www-form-urlencoded',
              'Referer': ahuSearchUrl,
            },
            body: `_token=${encodeURIComponent(csrfToken)}&nama=${encodeURIComponent(company_name.trim())}`,
          });
          clearTimeout(searchTimeout);

          if (searchResponse.ok) {
            const searchHtml = await searchResponse.text();
            console.log(`Search response length: ${searchHtml.length}`);

            // Parse search results - look for company name in result table/list
            const companyNameUpper = normalizedName;
            const foundInResults = searchHtml.toUpperCase().includes(companyNameUpper) ||
                                    searchHtml.toUpperCase().includes(companyNameUpper.replace(/^PT\s+/, ''));

            if (foundInResults) {
              // Try to extract company details from HTML
              const companyData = extractCompanyData(searchHtml, company_name);
              
              verificationResult = {
                status: 'verified',
                message: `Company "${company_name}" found in AHU database.`,
                ahu_checked: true,
                company_found: true,
                company_data: companyData,
                search_url: ahuSearchUrl,
                requires_manual: false,
              };
              console.log('✅ Company found via AHU search!');
            } else {
              verificationResult = {
                status: 'not_found',
                message: `Company "${company_name}" was not found in AHU search results. Please verify the exact registered name.`,
                ahu_checked: true,
                company_found: false,
                company_data: null,
                search_url: ahuSearchUrl,
                requires_manual: true,
              };
              console.log('Company not found in AHU search results');
            }
          }
        } else {
          console.log('No CSRF token found — trying direct name match in page');
          // Check if the page itself contains company info
          if (html.toUpperCase().includes(normalizedName)) {
            verificationResult = {
              status: 'verified',
              message: `Company "${company_name}" reference found on AHU.`,
              ahu_checked: true,
              company_found: true,
              company_data: null,
              search_url: ahuSearchUrl,
              requires_manual: false,
            };
          } else {
            verificationResult.ahu_checked = true;
            verificationResult.requires_manual = true;
            verificationResult.message = 'AHU search page accessible but could not parse search form. Please verify manually.';
          }
        }
      } else if (hasCaptcha) {
        console.log('AHU has CAPTCHA — trying alternative source');
        verificationResult.message = 'AHU requires CAPTCHA verification.';
        verificationResult.requires_manual = true;
      } else {
        console.log(`AHU returned status ${response.status}`);
        verificationResult.message = `AHU returned status ${response.status}.`;
        verificationResult.requires_manual = true;
      }
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.log('AHU request timed out');
        verificationResult.message = 'AHU website timed out.';
      } else {
        console.error('Error reaching AHU:', fetchError.message);
        verificationResult.message = 'Could not reach AHU website.';
      }
      verificationResult.requires_manual = true;
    }

    // ---- Attempt 2: Try alternative source if AHU failed ----
    if (!verificationResult.company_found) {
      try {
        console.log('Trying alternative source: daftarperusahaan.com');
        const altController = new AbortController();
        const altTimeout = setTimeout(() => altController.abort(), 8000);

        const searchQuery = encodeURIComponent(company_name.trim());
        const altResponse = await fetch(`https://www.daftarperusahaan.com/cari/${searchQuery}`, {
          method: 'GET',
          signal: altController.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html',
          },
        });
        clearTimeout(altTimeout);

        if (altResponse.ok) {
          const altHtml = await altResponse.text();
          const altFound = altHtml.toUpperCase().includes(normalizedName) || 
                          altHtml.toUpperCase().includes(normalizedName.replace(/^PT\s+/, ''));

          if (altFound) {
            console.log('✅ Company found via daftarperusahaan.com');
            const altData = extractAltCompanyData(altHtml, company_name);
            
            if (!verificationResult.company_found) {
              verificationResult = {
                status: 'found_alternative',
                message: `Company "${company_name}" found in Indonesian company registry (daftarperusahaan.com). AHU verification recommended for full legal confirmation.`,
                ahu_checked: verificationResult.ahu_checked,
                company_found: true,
                company_data: altData,
                search_url: 'https://ahu.go.id/pencarian/profil-pt',
                requires_manual: true,
              };
            }
          } else {
            console.log('Company not found in alternative source either');
          }
        }
      } catch (altError) {
        console.log('Alternative source also failed:', altError.message);
      }
    }

    // If still not found, set final fallback message
    if (!verificationResult.company_found && !verificationResult.message) {
      verificationResult.message = 'Could not auto-verify. Please check manually via AHU popup.';
      verificationResult.requires_manual = true;
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create admin alert
    const alertPriority = verificationResult.company_found ? 'low' : 'medium';
    await supabase
      .from('admin_alerts')
      .insert({
        type: 'company_verification',
        title: verificationResult.company_found 
          ? `✅ Company Auto-Verified: ${company_name}`
          : `Company Verification Attempted: ${company_name}`,
        message: verificationResult.message,
        priority: alertPriority,
        action_required: !verificationResult.company_found,
        reference_type: 'company_verification',
        reference_id: user_id,
        metadata: {
          user_id,
          company_name,
          normalized_name: normalizedName,
          ahu_checked: verificationResult.ahu_checked,
          auto_check_result: verificationResult.status,
          company_found: verificationResult.company_found,
          company_data: verificationResult.company_data,
          ahu_search_url: 'https://ahu.go.id/pencarian/profil-pt',
        }
      });

    // If auto-verified, update user profile
    if (verificationResult.status === 'verified') {
      await supabase
        .from('profiles')
        .update({
          company_verified: true,
          company_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user_id);

      console.log(`Profile updated: company_verified=true for user ${user_id}`);
    }

    console.log(`Result: ${verificationResult.status}`);

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

// Extract company data from AHU search results HTML
function extractCompanyData(html: string, companyName: string): any {
  const data: any = {
    source: 'ahu.go.id',
    company_name: companyName,
  };

  // Try to extract common fields from HTML
  const patterns = [
    { key: 'sk_number', regex: /SK\s*(?:Nomor|No\.?)\s*:?\s*([^\s<]+)/i },
    { key: 'npwp', regex: /NPWP\s*:?\s*([\d.-]+)/i },
    { key: 'address', regex: /(?:Alamat|Address)\s*:?\s*([^<\n]+)/i },
    { key: 'notary', regex: /Notaris\s*:?\s*([^<\n]+)/i },
    { key: 'status', regex: /Status\s*(?:Badan Hukum)?\s*:?\s*(Aktif|Tidak Aktif|Active|Inactive)/i },
    { key: 'established_date', regex: /(?:Tanggal\s*)?(?:Pendirian|Didirikan)\s*:?\s*([^<\n]+)/i },
  ];

  for (const { key, regex } of patterns) {
    const match = html.match(regex);
    if (match) {
      data[key] = match[1].trim();
    }
  }

  return data;
}

// Extract company data from daftarperusahaan.com
function extractAltCompanyData(html: string, companyName: string): any {
  const data: any = {
    source: 'daftarperusahaan.com',
    company_name: companyName,
  };

  const patterns = [
    { key: 'npwp', regex: /NPWP\s*:?\s*([\d.-]+)/i },
    { key: 'address', regex: /(?:Alamat|Address)\s*:?\s*([^<\n]+)/i },
    { key: 'phone', regex: /(?:Telepon|Phone|Telp)\s*:?\s*([^<\n]+)/i },
    { key: 'status', regex: /Status\s*:?\s*(Aktif|Tidak Aktif|Active|Inactive)/i },
  ];

  for (const { key, regex } of patterns) {
    const match = html.match(regex);
    if (match) {
      data[key] = match[1].trim();
    }
  }

  return data;
}
