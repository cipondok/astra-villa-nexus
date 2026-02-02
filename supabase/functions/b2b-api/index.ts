import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface ApiRequest {
  endpoint: string;
  params?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API key from header
    const apiKey = req.headers.get('x-api-key');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key required', code: 'MISSING_API_KEY' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate API key (check prefix and hash)
    const keyPrefix = apiKey.substring(0, 8);
    const { data: apiKeyData, error: keyError } = await supabase
      .from('b2b_api_keys')
      .select('*, b2b_clients(*)')
      .eq('api_key_prefix', keyPrefix)
      .eq('is_active', true)
      .single();

    if (keyError || !apiKeyData) {
      console.error('Invalid API key:', keyError);
      return new Response(
        JSON.stringify({ error: 'Invalid API key', code: 'INVALID_API_KEY' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if key is expired
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key expired', code: 'EXPIRED_API_KEY' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check client status
    const client = apiKeyData.b2b_clients;
    if (!client || !client.is_active) {
      return new Response(
        JSON.stringify({ error: 'Client account inactive', code: 'INACTIVE_ACCOUNT' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse URL and get endpoint
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const endpoint = pathParts[pathParts.length - 1] || 'info';

    // Check if endpoint is allowed
    const allowedEndpoints = apiKeyData.allowed_endpoints || ['leads', 'insights', 'demographics', 'valuations'];
    if (endpoint !== 'info' && !allowedEndpoints.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Endpoint not allowed for this API key', code: 'ENDPOINT_NOT_ALLOWED' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body for POST
    let body: Record<string, any> = {};
    if (req.method === 'POST') {
      body = await req.json();
    }

    // Get query params
    const params: Record<string, any> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    let response: any = {};
    let creditsUsed = 0;

    // Handle different endpoints
    switch (endpoint) {
      case 'info':
        response = {
          api_version: '1.0.0',
          client: {
            company_name: client.company_name,
            tier: client.tier,
            credits_balance: client.credits_balance
          },
          endpoints: allowedEndpoints,
          rate_limit: client.api_rate_limit || 100
        };
        break;

      case 'leads':
        // Check credits
        creditsUsed = 10; // Per lead
        if (client.credits_balance < creditsUsed) {
          return new Response(
            JSON.stringify({ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS', credits_needed: creditsUsed }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get available leads
        const { data: leads, error: leadsError } = await supabase
          .from('b2b_leads')
          .select('id, lead_source, property_type, property_location, lead_intent, lead_score, created_at')
          .eq('is_sold', false)
          .order('lead_score', { ascending: false })
          .limit(parseInt(params.limit) || 10);

        if (leadsError) throw leadsError;

        response = {
          leads: leads,
          credits_used: 0, // Listing is free, purchase costs credits
          total_available: leads?.length || 0
        };
        creditsUsed = 0; // Listing free
        break;

      case 'insights':
        creditsUsed = 15;
        if (client.credits_balance < creditsUsed) {
          return new Response(
            JSON.stringify({ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const region = params.region || body.region;
        const { data: insights, error: insightsError } = await supabase
          .from('b2b_market_insights')
          .select('*')
          .ilike('region', `%${region || ''}%`)
          .limit(parseInt(params.limit) || 10);

        if (insightsError) throw insightsError;

        response = {
          insights: insights,
          credits_used: creditsUsed,
          region: region
        };
        break;

      case 'demographics':
        creditsUsed = 30;
        if (client.credits_balance < creditsUsed) {
          return new Response(
            JSON.stringify({ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Return demographic data (simulated for now)
        response = {
          region: params.region || 'Indonesia',
          demographics: {
            population: 273500000,
            median_age: 29.7,
            urban_population_pct: 56.7,
            gdp_per_capita_usd: 4292,
            home_ownership_rate: 84.2,
            property_market_growth: 5.8
          },
          credits_used: creditsUsed
        };
        break;

      case 'valuations':
        creditsUsed = 5;
        if (client.credits_balance < creditsUsed) {
          return new Response(
            JSON.stringify({ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const propertyId = params.property_id || body.property_id;
        if (!propertyId) {
          return new Response(
            JSON.stringify({ error: 'property_id required', code: 'MISSING_PARAM' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get property valuation
        const { data: valuation, error: valError } = await supabase
          .from('property_valuations')
          .select('*')
          .eq('property_id', propertyId)
          .order('valuation_date', { ascending: false })
          .limit(1)
          .single();

        response = {
          property_id: propertyId,
          valuation: valuation || null,
          credits_used: creditsUsed
        };
        break;

      case 'purchase-lead':
        if (req.method !== 'POST') {
          return new Response(
            JSON.stringify({ error: 'POST method required', code: 'METHOD_NOT_ALLOWED' }),
            { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const leadId = body.lead_id;
        if (!leadId) {
          return new Response(
            JSON.stringify({ error: 'lead_id required', code: 'MISSING_PARAM' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get lead details
        const { data: lead, error: leadError } = await supabase
          .from('b2b_leads')
          .select('*')
          .eq('id', leadId)
          .eq('is_sold', false)
          .single();

        if (leadError || !lead) {
          return new Response(
            JSON.stringify({ error: 'Lead not available', code: 'LEAD_NOT_AVAILABLE' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        creditsUsed = lead.lead_score >= 70 ? 25 : 10;
        if (client.credits_balance < creditsUsed) {
          return new Response(
            JSON.stringify({ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS', credits_needed: creditsUsed }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Mark lead as sold
        await supabase
          .from('b2b_leads')
          .update({ is_sold: true, sold_to: client.id, sold_at: new Date().toISOString(), sold_price: creditsUsed })
          .eq('id', leadId);

        // Record purchase
        await supabase
          .from('b2b_lead_purchases')
          .insert({
            client_id: client.id,
            lead_id: leadId,
            credits_spent: creditsUsed,
            lead_data: lead
          });

        // Deduct credits
        await supabase
          .from('b2b_clients')
          .update({ 
            credits_balance: client.credits_balance - creditsUsed,
            lifetime_credits_used: (client.lifetime_credits_used || 0) + creditsUsed
          })
          .eq('id', client.id);

        // Record credit transaction
        await supabase
          .from('b2b_credit_transactions')
          .insert({
            client_id: client.id,
            transaction_type: 'usage',
            credits: -creditsUsed,
            balance_after: client.credits_balance - creditsUsed,
            reference_type: 'lead',
            reference_id: leadId,
            description: 'Lead purchase'
          });

        response = {
          success: true,
          lead: {
            ...lead,
            lead_email: lead.lead_email,
            lead_phone: lead.lead_phone,
            lead_name: lead.lead_name
          },
          credits_used: creditsUsed,
          credits_remaining: client.credits_balance - creditsUsed
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown endpoint', code: 'UNKNOWN_ENDPOINT' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const responseTime = Date.now() - startTime;

    // Log API usage
    await supabase
      .from('b2b_api_usage')
      .insert({
        client_id: client.id,
        api_key_id: apiKeyData.id,
        endpoint: endpoint,
        method: req.method,
        request_params: { ...params, ...body },
        response_status: 200,
        credits_used: creditsUsed,
        response_time_ms: responseTime,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
        user_agent: req.headers.get('user-agent')
      });

    // Update last used timestamp
    await supabase
      .from('b2b_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyData.id);

    console.log(`B2B API: ${endpoint} - ${client.company_name} - ${creditsUsed} credits - ${responseTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        data: response,
        meta: {
          endpoint,
          credits_used: creditsUsed,
          response_time_ms: responseTime
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('B2B API Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
