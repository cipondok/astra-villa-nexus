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
    // ── Auth ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.claims.sub as string;

    // ── Parse request ──
    const { property_id } = await req.json();
    if (!property_id) {
      return new Response(JSON.stringify({ error: 'property_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Fetch property ──
    const { data: property, error: pErr } = await supabase
      .from('properties')
      .select('id, city, property_type, building_area_sqm, price, investment_score, status, user_id, agent_id')
      .eq('id', property_id)
      .maybeSingle();

    if (pErr || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Authorization: owner, agent, or admin ──
    const isOwner = property.user_id === userId;
    const isAgent = property.agent_id === userId;

    let isAdmin = false;
    if (!isOwner && !isAgent) {
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      isAdmin = !!roleRow;
    }

    if (!isOwner && !isAgent && !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Validate required data ──
    const buildingArea = Number(property.building_area_sqm) || 0;
    if (buildingArea <= 0) {
      return new Response(JSON.stringify({ error: 'Property must have building_area_sqm to estimate price' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Fetch comparable listings ──
    const minArea = buildingArea * 0.7;
    const maxArea = buildingArea * 1.3;

    const { data: comparables, error: cErr } = await supabase
      .from('properties')
      .select('price, building_area_sqm')
      .eq('city', property.city)
      .eq('property_type', property.property_type)
      .eq('status', 'published')
      .not('price', 'is', null)
      .gte('building_area_sqm', minArea)
      .lte('building_area_sqm', maxArea)
      .neq('id', property_id)
      .limit(50);

    if (cErr) {
      console.error('Comparables query error:', cErr);
      return new Response(JSON.stringify({ error: 'Failed to fetch comparables' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validComps = (comparables || []).filter(
      (c) => Number(c.price) > 0 && Number(c.building_area_sqm) > 0
    );

    if (validComps.length === 0) {
      return new Response(JSON.stringify({
        error: 'Not enough comparable listings in this area',
        comparable_count: 0,
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Compute price per m² ──
    const pricesPerM2 = validComps
      .map((c) => Number(c.price) / Number(c.building_area_sqm))
      .sort((a, b) => a - b);

    const medianPricePerM2 = (() => {
      const mid = Math.floor(pricesPerM2.length / 2);
      return pricesPerM2.length % 2 !== 0
        ? pricesPerM2[mid]
        : (pricesPerM2[mid - 1] + pricesPerM2[mid]) / 2;
    })();

    // ── Calculate target price ──
    let targetPrice = medianPricePerM2 * buildingArea;

    // ── Adjust by investment score ──
    const invScore = Number(property.investment_score) || 0;
    if (invScore >= 80) {
      targetPrice *= 1.05;
    } else if (invScore >= 65) {
      targetPrice *= 1.03;
    } else if (invScore < 50) {
      targetPrice *= 0.95;
    }

    // ── Recommended range ──
    const recommendedMin = Math.round(targetPrice * 0.95);
    const recommendedMax = Math.round(targetPrice * 1.05);
    const suggestedPrice = Math.round(targetPrice);

    // ── Price position ──
    const currentPrice = Number(property.price) || 0;
    let pricePosition: string;
    if (currentPrice > recommendedMax) {
      pricePosition = 'overpriced';
    } else if (currentPrice < recommendedMin) {
      pricePosition = 'underpriced';
    } else {
      pricePosition = 'market-aligned';
    }

    // ── Confidence score (based on comparable count) ──
    const compCount = validComps.length;
    let confidenceScore: number;
    if (compCount >= 20) confidenceScore = 95;
    else if (compCount >= 10) confidenceScore = 80;
    else if (compCount >= 5) confidenceScore = 65;
    else confidenceScore = 40;

    console.log(`Price suggestion for property ${property_id}: ${suggestedPrice} (${compCount} comps, confidence ${confidenceScore}%)`);

    return new Response(JSON.stringify({
      recommended_min_price: recommendedMin,
      recommended_max_price: recommendedMax,
      suggested_price: suggestedPrice,
      confidence_score: confidenceScore,
      price_position: pricePosition,
      comparable_count: compCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('ai-price-suggestion-engine error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
