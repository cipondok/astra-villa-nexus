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
    // ── Auth: admin or service-role only ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify caller identity
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);

    // Allow service_role calls (no claims needed) or admin users
    const isServiceRole = token === serviceKey;
    if (!isServiceRole) {
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Check admin role
      const userId = claimsData.claims.sub as string;
      const adminClient = createClient(supabaseUrl, serviceKey);
      const { data: roleRow } = await adminClient
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleRow) {
        return new Response(JSON.stringify({ error: 'Forbidden – admin only' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── Parse request ──
    const { property_id } = await req.json();
    if (!property_id) {
      return new Response(JSON.stringify({ error: 'property_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // ── 1. Fetch property ──
    const { data: property, error: pErr } = await supabase
      .from('properties')
      .select('id, price, city, area_sqm, land_area_sqm, building_area_sqm, has_pool, garage_count, floors, property_type, listing_type')
      .eq('id', property_id)
      .maybeSingle();

    if (pErr || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const price = Number(property.price) || 0;
    const buildingArea = Number(property.building_area_sqm) || Number(property.area_sqm) || 1;
    const landArea = Number(property.land_area_sqm) || buildingArea;
    const pricePerM2 = price / buildingArea;

    // ── 2. Fetch city-level market data ──
    const { data: cityListings } = await supabase
      .from('properties')
      .select('price, building_area_sqm, area_sqm')
      .eq('city', property.city)
      .not('price', 'is', null)
      .gt('price', 0);

    const cityPrices = (cityListings || []).map(p => {
      const ba = Number(p.building_area_sqm) || Number(p.area_sqm) || 1;
      return Number(p.price) / ba;
    });
    const avgPricePerM2 = cityPrices.length > 0
      ? cityPrices.reduce((a, b) => a + b, 0) / cityPrices.length
      : pricePerM2;

    // ── 3. LOCATION DEMAND (0–20) ──
    // Count total listings per city and rank
    const { count: cityCount } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('city', property.city);

    let locationScore = 6;
    const c = cityCount || 0;
    if (c >= 50) locationScore = 20;
    else if (c >= 20) locationScore = 12;

    // ── 4. PRICE VS MARKET (0–20) ──
    let priceScore = 5;
    if (avgPricePerM2 > 0) {
      const diff = (pricePerM2 - avgPricePerM2) / avgPricePerM2;
      if (diff <= -0.10) priceScore = 20;
      else if (diff <= -0.05) priceScore = 15;
      else if (diff <= 0.05) priceScore = 10;
      else priceScore = 5;
    }

    // ── 5. RENTAL YIELD ESTIMATION (0–20) ──
    const annualRent = price * 0.06;
    const yieldPct = price > 0 ? (annualRent / price) * 100 : 0;
    let yieldScore = 5;
    if (yieldPct > 7) yieldScore = 20;
    else if (yieldPct >= 6) yieldScore = 15;
    else if (yieldPct >= 5) yieldScore = 10;

    // ── 6. FEATURE BONUS (0–10) ──
    let featureScore = 0;
    if (property.has_pool) featureScore += 5;
    if ((property.garage_count || 0) > 0) featureScore += 3;
    if ((property.floors || 1) > 1) featureScore += 2;

    // ── 7. ENGAGEMENT BOOST (0–10) ──
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { count: viewCount } = await supabase
      .from('activity_logs')
      .select('id', { count: 'exact', head: true })
      .eq('activity_type', 'view')
      .gte('created_at', thirtyDaysAgo);

    const { count: saveCount } = await supabase
      .from('saved_properties')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', property_id)
      .gte('saved_at', thirtyDaysAgo);

    const engagement = (viewCount || 0) + (saveCount || 0) * 3;
    let engagementScore = 3;
    if (engagement >= 50) engagementScore = 10;
    else if (engagement >= 20) engagementScore = 6;

    // ── 8. SIZE OPTIMIZATION (0–10) ──
    const ltLbRatio = landArea / buildingArea;
    const sizeScore = (ltLbRatio >= 1.1 && ltLbRatio <= 1.8) ? 10 : 5;

    // ── 9. LIQUIDITY SCORE (0–10) ──
    const priceLow = price * 0.8;
    const priceHigh = price * 1.2;
    const { count: competitorCount } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('city', property.city)
      .eq('property_type', property.property_type)
      .gte('price', priceLow)
      .lte('price', priceHigh)
      .neq('id', property_id);

    let liquidityScore = 3;
    if ((competitorCount || 0) <= 3) liquidityScore = 10;
    else if ((competitorCount || 0) <= 10) liquidityScore = 6;

    // ── FINAL SCORE ──
    const rawScore = locationScore + priceScore + yieldScore + featureScore + engagementScore + sizeScore + liquidityScore;
    const finalScore = Math.max(0, Math.min(100, rawScore));

    // ── Update property ──
    const { error: updateErr } = await supabase
      .from('properties')
      .update({ investment_score: finalScore })
      .eq('id', property_id);

    if (updateErr) {
      console.error('Failed to update investment_score:', updateErr);
      throw new Error('Failed to save score');
    }

    console.log(`Investment score for ${property_id}: ${finalScore} (loc:${locationScore} price:${priceScore} yield:${yieldScore} feat:${featureScore} eng:${engagementScore} size:${sizeScore} liq:${liquidityScore})`);

    return new Response(JSON.stringify({
      success: true,
      investment_score: finalScore,
      breakdown: {
        location_demand: locationScore,
        price_vs_market: priceScore,
        rental_yield: yieldScore,
        feature_bonus: featureScore,
        engagement_boost: engagementScore,
        size_optimization: sizeScore,
        liquidity_score: liquidityScore,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('investment-score-engine error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
