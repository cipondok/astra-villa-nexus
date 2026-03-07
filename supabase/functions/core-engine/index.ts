import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ── Internal ranking formula ──
function calculateRankingScore(
  property: {
    investment_score: number;
    listing_health_score: number;
    engagement_score: number;
    demand_heat_score: number;
    created_at: string;
  },
  subscriptionType: string
): number {
  // Recency score
  const daysSinceCreation = (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = daysSinceCreation < 7 ? 10 : daysSinceCreation < 30 ? 5 : 2;

  // Subscription boost
  const subscriptionBoost = subscriptionType === 'enterprise' ? 25 : subscriptionType === 'pro' ? 15 : 0;

  const finalScore =
    (property.investment_score * 0.25) +
    (property.listing_health_score * 0.20) +
    (property.demand_heat_score * 0.20) +
    (property.engagement_score * 0.15) +
    (recencyScore * 0.10) +
    (subscriptionBoost * 0.10);

  return Math.round(finalScore * 100) / 100;
}

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
    const isServiceRole = token === serviceKey;

    let userId = '';
    if (!isServiceRole) {
      const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      userId = claimsData.claims.sub as string;
    }

    // ── Parse request ──
    const body = await req.json();
    const { property_id, mode, city: reqCity, hold_years: reqHoldYears, property_ids } = body;
    const validModes = ['investment_score', 'investment_score_v2', 'price_suggestion', 'price_suggestion_inline', 'listing_health', 'days_to_sell_prediction', 'demand_heat_score', 'price_adjustment_strategy', 'roi_simulation', 'compare_properties', 'portfolio_analysis', 'ranking_score', 'listing_visibility_analytics', 'ai_performance_summary', 'auto_tune_ai_weights', 'property_intelligence', 'buyer_profile', 'market_trend', 'investment_projection', 'lead_score', 'ai_brain', 'deal_detector', 'deal_finder', 'similar_properties', 'price_forecast', 'buyer_intent', 'negotiation_assist', 'map_search', 'digital_twin', 'anomaly_detector', 'premium_insights', 'deal_alerts', 'lead_generation', 'knowledge_graph', 'investor_strategy', 'demand_intelligence', 'portfolio_manager', 'property_valuation', 'rental_yield_predictor', 'market_trend_predictor', 'super_engine', 'autonomous_agent', 'knowledge_network', 'market_pulse', 'predictive_development', 'expansion_intelligence', 'self_learning', 'global_market_intelligence', 'mortgage_investment_simulator'];
    if (!mode || !validModes.includes(mode)) {
      return new Response(JSON.stringify({ error: 'Invalid mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Fetch user subscription tier for server-side gating ──
    let subscriptionType = 'free';
    if (userId) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('subscription_type')
        .eq('id', userId)
        .single();
      if (profileData?.subscription_type) {
        subscriptionType = profileData.subscription_type;
      }
    }

    // ── Subscription-based limits ──
    const holdYearsNum = Number(reqHoldYears) || 5;
    if (mode === 'roi_simulation' && subscriptionType === 'free' && holdYearsNum > 3) {
      return new Response(JSON.stringify({ error: 'Upgrade to Pro for extended projections beyond 3 years.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (mode === 'portfolio_analysis' && subscriptionType === 'free' && Array.isArray(property_ids) && property_ids.length > 2) {
      return new Response(JSON.stringify({ error: 'Free plan supports max 2 properties in portfolio analysis. Upgrade to Pro for more.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (mode === 'compare_properties' && subscriptionType === 'free' && Array.isArray(property_ids) && property_ids.length > 2) {
      return new Response(JSON.stringify({ error: 'Free plan supports max 2 property comparisons. Upgrade to Pro for more.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── demand_heat_score: city-based, no property_id needed ──
    if (mode === 'demand_heat_score') {
      if (!reqCity) {
        return new Response(JSON.stringify({ error: 'city is required for demand_heat_score mode' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Validate city exists
      const { count: cityExists } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('city', reqCity)
        .limit(1);

      if (!cityExists) {
        return new Response(JSON.stringify({ error: 'No listings found for this city' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const now = Date.now();
      const thirtyAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sixtyAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel fetches
      const [publishedRes, newListingsRes, viewsRes, priceRecentRes, pricePrevRes] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true })
          .eq('city', reqCity).eq('status', 'published'),
        supabase.from('properties').select('id', { count: 'exact', head: true })
          .eq('city', reqCity).gte('created_at', thirtyAgo),
        supabase.from('activity_logs').select('id, metadata', { count: 'exact', head: false })
          .eq('activity_type', 'view').gte('created_at', thirtyAgo),
        supabase.from('properties').select('price')
          .eq('city', reqCity).eq('status', 'published').not('price', 'is', null).gt('price', 0)
          .gte('created_at', thirtyAgo),
        supabase.from('properties').select('price')
          .eq('city', reqCity).eq('status', 'published').not('price', 'is', null).gt('price', 0)
          .gte('created_at', sixtyAgo).lt('created_at', thirtyAgo),
      ]);

      // Filter views by city — activity_logs may store property_id in metadata or as column
      // Count views via properties join: fetch property IDs in city, then count views
      const { data: cityPropIds } = await supabase
        .from('properties')
        .select('id')
        .eq('city', reqCity)
        .eq('status', 'published');
      const propIds = (cityPropIds || []).map(p => p.id);

      let totalViews = 0;
      let totalSaves = 0;
      if (propIds.length > 0) {
        const { count: vCount } = await supabase
          .from('activity_logs')
          .select('id', { count: 'exact', head: true })
          .eq('activity_type', 'view')
          .in('property_id', propIds)
          .gte('created_at', thirtyAgo);
        totalViews = vCount || 0;

        const { count: sCount } = await supabase
          .from('saved_properties')
          .select('id', { count: 'exact', head: true })
          .in('property_id', propIds)
          .gte('saved_at', thirtyAgo);
        totalSaves = sCount || 0;
      }

      const listingCount = publishedRes.count || 1;
      const newListings = newListingsRes.count || 0;

      const viewsPerListing = totalViews / listingCount;
      const savesPerListing = totalSaves / listingCount;

      // Price trend
      const recentPrices = (priceRecentRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
      const prevPrices = (pricePrevRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
      const avgRecent = recentPrices.length > 0 ? recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length : 0;
      const avgPrev = prevPrices.length > 0 ? prevPrices.reduce((a, b) => a + b, 0) / prevPrices.length : 0;
      const priceTrendPct = avgPrev > 0 ? ((avgRecent - avgPrev) / avgPrev) * 100 : 0;

      // Scoring
      let demandScore: number;
      if (viewsPerListing >= 50) demandScore = 40;
      else if (viewsPerListing >= 30) demandScore = 30;
      else if (viewsPerListing >= 15) demandScore = 20;
      else demandScore = 10;

      let saveScore: number;
      if (savesPerListing >= 10) saveScore = 30;
      else if (savesPerListing >= 5) saveScore = 20;
      else if (savesPerListing >= 2) saveScore = 10;
      else saveScore = 5;

      let priceGrowthScore: number;
      if (priceTrendPct >= 5) priceGrowthScore = 20;
      else if (priceTrendPct >= 2) priceGrowthScore = 15;
      else if (priceTrendPct >= 0) priceGrowthScore = 10;
      else priceGrowthScore = 5;

      let velocityScore: number;
      if (newListings >= 20) velocityScore = 10;
      else if (newListings >= 10) velocityScore = 7;
      else velocityScore = 4;

      const heatScore = Math.max(0, Math.min(100, demandScore + saveScore + priceGrowthScore + velocityScore));

      let heatLevel: string;
      if (heatScore >= 80) heatLevel = 'very hot';
      else if (heatScore >= 65) heatLevel = 'hot';
      else if (heatScore >= 50) heatLevel = 'stable';
      else heatLevel = 'cool';

      let trend: string;
      if (priceTrendPct > 2) trend = 'rising';
      else if (priceTrendPct < -2) trend = 'declining';
      else trend = 'stable';

      let confidence: number;
      if (listingCount >= 100) confidence = 90;
      else if (listingCount >= 50) confidence = 75;
      else if (listingCount >= 20) confidence = 60;
      else confidence = 40;

      console.log(`Demand heat for ${reqCity}: ${heatScore} (${heatLevel})`);

      return new Response(JSON.stringify({
        mode: 'demand_heat_score',
        data: {
          heat_score: heatScore,
          heat_level: heatLevel,
          trend,
          demand_signals: {
            views_last_30_days: totalViews,
            saves_last_30_days: totalSaves,
            new_listings_30_days: newListings,
            price_trend_percent: Math.round(priceTrendPct * 100) / 100,
          },
          confidence_score: confidence,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: price_suggestion_inline (no property_id needed)
    // ═══════════════════════════════════════════
    if (mode === 'price_suggestion_inline') {
      const { price: inlinePrice, city: inlineCity, property_type: inlinePropType, land_area_sqm: inlineLand, building_area_sqm: inlineBuilding } = body;
      if (!inlineCity || !inlinePropType) {
        return new Response(JSON.stringify({ error: 'city and property_type are required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const ba = Number(inlineBuilding) || 0;
      const la = Number(inlineLand) || 0;
      const primaryArea = ba > 0 ? ba : la;
      const areaType = ba > 0 ? 'building' : 'land';
      if (primaryArea <= 0) {
        return new Response(JSON.stringify({ error: 'land_area_sqm or building_area_sqm is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const minA = primaryArea * 0.7;
      const maxA = primaryArea * 1.3;
      const areaCol = areaType === 'building' ? 'building_area_sqm' : 'land_area_sqm';

      const { data: comps } = await supabase
        .from('properties')
        .select('price, building_area_sqm, land_area_sqm')
        .eq('city', inlineCity)
        .eq('property_type', inlinePropType)
        .eq('status', 'published')
        .not('price', 'is', null)
        .gte(areaCol, minA)
        .lte(areaCol, maxA)
        .limit(50);

      const valid = (comps || []).filter(c => Number(c.price) > 0 && Number(c[areaCol]) > 0);
      if (valid.length === 0) {
        // Fallback: try all types in same city
        const { data: fallback } = await supabase
          .from('properties')
          .select('price, building_area_sqm, land_area_sqm')
          .eq('city', inlineCity)
          .eq('status', 'published')
          .not('price', 'is', null)
          .gte(areaCol, minA)
          .lte(areaCol, maxA)
          .limit(50);

        const fallbackValid = (fallback || []).filter(c => Number(c.price) > 0 && Number(c[areaCol]) > 0);
        if (fallbackValid.length === 0) {
          return new Response(JSON.stringify({ mode: 'price_suggestion_inline', data: { error: 'Not enough comparable listings', comparable_count: 0 } }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        valid.push(...fallbackValid);
      }

      const ppm2 = valid.map(c => Number(c.price) / Number(c[areaCol])).sort((a, b) => a - b);
      const mid = Math.floor(ppm2.length / 2);
      const median = ppm2.length % 2 !== 0 ? ppm2[mid] : (ppm2[mid - 1] + ppm2[mid]) / 2;
      const avgPricePerSqm = Math.round(ppm2.reduce((s, v) => s + v, 0) / ppm2.length);

      const cc = valid.length;
      let demandMultiplier = 1.0;
      if (cc >= 30) demandMultiplier = 1.10;
      else if (cc >= 15) demandMultiplier = 1.05;
      else if (cc >= 5) demandMultiplier = 1.0;
      else demandMultiplier = 0.95;

      const fmv = Math.round(median * primaryArea * demandMultiplier);
      const cur = Number(inlinePrice) || 0;
      const ratio = cur > 0 ? cur / fmv : 0;
      let pos: string;
      if (ratio > 1.15) pos = 'overpriced';
      else if (ratio < 0.85) pos = 'underpriced';
      else pos = 'fair';

      let expectedDaysOnMarket: number;
      if (pos === 'underpriced') expectedDaysOnMarket = Math.max(7, Math.round(30 * ratio));
      else if (pos === 'overpriced') expectedDaysOnMarket = Math.round(60 * (1 + (ratio - 1.15) * 3));
      else expectedDaysOnMarket = 60;

      const recommended_price = Math.round(fmv * 0.98);
      let confidence: number;
      if (cc >= 20) confidence = 95;
      else if (cc >= 10) confidence = 80;
      else if (cc >= 5) confidence = 65;
      else confidence = 40;

      const reasoning: string[] = [];
      if (pos === 'overpriced') reasoning.push(`Listed ${Math.round((ratio - 1) * 100)}% above FMV — may deter serious buyers.`);
      else if (pos === 'underpriced') reasoning.push(`Listed ${Math.round((1 - ratio) * 100)}% below FMV — expect fast inquiries.`);
      else reasoning.push(`Price aligns with market avg of ${avgPricePerSqm.toLocaleString('id-ID')}/sqm.`);
      reasoning.push(`${cc} comparable listings in ${inlineCity}.`);
      reasoning.push(`Demand multiplier: ${demandMultiplier}x based on market density.`);

      console.log(`Inline price suggestion: FMV=${fmv} pos=${pos} days=${expectedDaysOnMarket} (${cc} comps)`);

      return new Response(JSON.stringify({
        mode: 'price_suggestion_inline',
        data: {
          fair_market_value: fmv,
          recommended_price,
          price_position: pos,
          expected_days_on_market: expectedDaysOnMarket,
          confidence_score: confidence,
          comparable_count: cc,
          demand_multiplier: demandMultiplier,
          price_per_sqm: avgPricePerSqm,
          reasoning,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: compare_properties
    // ═══════════════════════════════════════════
    if (mode === 'compare_properties') {
      if (!Array.isArray(property_ids) || property_ids.length < 2) {
        return new Response(JSON.stringify({ error: 'At least 2 property_ids are required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const holdYears = Math.max(1, Math.min(30, Number(reqHoldYears) || 5));

      // Fetch all properties
      const { data: properties, error: pErr } = await supabase
        .from('properties')
        .select('id, price, city, area_sqm, land_area_sqm, building_area_sqm, has_pool, garage_count, floors, property_type, listing_type, investment_score, status, owner_id, agent_id, description, kt, km')
        .in('id', property_ids);

      if (pErr || !properties || properties.length < 2) {
        return new Response(JSON.stringify({ error: 'Could not find at least 2 properties' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // --- Helper: inline ROI simulation for a single property ---
      const computeRoi = async (prop: typeof properties[0]) => {
        const price = Number(prop.price) || 0;
        if (price <= 0) return { roi_percent: 0, annualized_return: 0 };

        const now = Date.now();
        const thirtyAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

        const [priceRecentRes, pricePrevRes, publishedRes] = await Promise.all([
          supabase.from('properties').select('price')
            .eq('city', prop.city).eq('status', 'published').not('price', 'is', null).gt('price', 0)
            .gte('created_at', thirtyAgo),
          supabase.from('properties').select('price')
            .eq('city', prop.city).eq('status', 'published').not('price', 'is', null).gt('price', 0)
            .gte('created_at', sixtyAgo).lt('created_at', thirtyAgo),
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', prop.city).eq('status', 'published'),
        ]);

        const recentPrices = (priceRecentRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
        const prevPrices = (pricePrevRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
        const avgRecent = recentPrices.length > 0 ? recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length : 0;
        const avgPrev = prevPrices.length > 0 ? prevPrices.reduce((a, b) => a + b, 0) / prevPrices.length : 0;
        const priceTrendPct = avgPrev > 0 ? ((avgRecent - avgPrev) / avgPrev) * 100 : 3;

        // Simplified heat for appreciation
        const listingCount = publishedRes.count || 1;
        const { data: cityPropIds } = await supabase
          .from('properties').select('id').eq('city', prop.city).eq('status', 'published');
        const propIds = (cityPropIds || []).map(p => p.id);
        let totalViews = 0, totalSaves = 0;
        if (propIds.length > 0) {
          const [vR, sR] = await Promise.all([
            supabase.from('activity_logs').select('id', { count: 'exact', head: true })
              .eq('activity_type', 'view').in('property_id', propIds).gte('created_at', thirtyAgo),
            supabase.from('saved_properties').select('id', { count: 'exact', head: true })
              .in('property_id', propIds).gte('saved_at', thirtyAgo),
          ]);
          totalViews = vR.count || 0;
          totalSaves = sR.count || 0;
        }
        const vpl = totalViews / listingCount;
        const spl = totalSaves / listingCount;
        const dS = vpl >= 50 ? 40 : vpl >= 30 ? 30 : vpl >= 15 ? 20 : 10;
        const svS = spl >= 10 ? 30 : spl >= 5 ? 20 : spl >= 2 ? 10 : 5;
        const pgS = priceTrendPct >= 5 ? 20 : priceTrendPct >= 2 ? 15 : priceTrendPct >= 0 ? 10 : 5;
        const heatScore = Math.max(0, Math.min(100, dS + svS + pgS));
        const heatLevel = heatScore >= 80 ? 'very hot' : heatScore >= 65 ? 'hot' : heatScore >= 50 ? 'stable' : 'cool';

        let annualAppreciation = Math.abs(priceTrendPct) > 0 ? priceTrendPct : 3;
        if (heatLevel === 'very hot') annualAppreciation += 1;
        else if (heatLevel === 'hot') annualAppreciation += 0.5;
        const investScore = Number(prop.investment_score) || 0;
        if (investScore >= 80) annualAppreciation += 0.5;
        annualAppreciation = Math.max(2, Math.min(10, annualAppreciation));
        const appreciationRate = annualAppreciation / 100;

        const futureValue = price * Math.pow(1 + appreciationRate, holdYears);
        const typeYields: Record<string, number> = {
          villa: 0.055, apartment: 0.065, house: 0.045, land: 0.02,
          commercial: 0.07, townhouse: 0.05, warehouse: 0.06, office: 0.065,
        };
        const baseYield = typeYields[(prop.property_type || 'house').toLowerCase()] || 0.045;
        const adjustedYield = heatLevel === 'very hot' ? baseYield * 1.1
          : heatLevel === 'hot' ? baseYield * 1.05
          : heatLevel === 'cool' ? baseYield * 0.9
          : baseYield;

        const annualRent = price * adjustedYield;
        const totalRentalIncome = annualRent * holdYears;
        const maintenance = price * 0.01 * holdYears;
        const management = totalRentalIncome * 0.10;
        const exitCost = futureValue * 0.05;
        const totalExpenses = maintenance + management + exitCost;
        const capitalGain = futureValue - price;
        const netProfit = capitalGain + totalRentalIncome - totalExpenses;
        const roiPercent = (netProfit / price) * 100;
        const totalReturn = futureValue + totalRentalIncome - totalExpenses;
        const annualizedReturn = (Math.pow(totalReturn / price, 1 / holdYears) - 1) * 100;

        return { roi_percent: Math.round(roiPercent * 100) / 100, annualized_return: Math.round(annualizedReturn * 100) / 100, heat_score: heatScore };
      };

      // --- Helper: inline days_to_sell for a single property ---
      const computeDaysToSellInline = async (prop: typeof properties[0]) => {
        const price = Number(prop.price) || 0;
        if (price <= 0) return 180;
        const pLow = price * 0.8;
        const pHigh = price * 1.2;
        const t30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [cListRes, cmpRes, vRes, sRes] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', prop.city).eq('status', 'published'),
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', prop.city).eq('property_type', prop.property_type)
            .eq('status', 'published').gte('price', pLow).lte('price', pHigh).neq('id', prop.id),
          supabase.from('activity_logs').select('id', { count: 'exact', head: true })
            .eq('activity_type', 'view').eq('property_id', prop.id).gte('created_at', t30),
          supabase.from('saved_properties').select('id', { count: 'exact', head: true })
            .eq('property_id', prop.id).gte('saved_at', t30),
        ]);

        const cTotal = cListRes.count || 0;
        const cCount = cmpRes.count || 0;
        const eTotal = (vRes.count || 0) + (sRes.count || 0) * 3;
        const iScore = Number(prop.investment_score) || 0;

        let d: number;
        if (cTotal >= 100) d = 30;
        else if (cTotal >= 50) d = 45;
        else if (cTotal >= 20) d = 60;
        else d = 75;

        if (eTotal >= 50) d *= 0.85;
        else if (eTotal >= 20) d *= 0.95;
        else d *= 1.1;

        if (cCount <= 5) d *= 0.9;
        else d *= 1.15;

        if (iScore >= 80) d *= 0.9;
        else if (iScore < 50) d *= 1.1;

        return Math.max(7, Math.min(180, Math.round(d)));
      };

      // --- Helper: demand heat for a city ---
      const computeHeatForCity = async (city: string) => {
        const now = Date.now();
        const thirtyAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

        const [publishedRes, newListingsRes, priceRecentRes, pricePrevRes] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', city).eq('status', 'published'),
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', city).gte('created_at', thirtyAgo),
          supabase.from('properties').select('price')
            .eq('city', city).eq('status', 'published').not('price', 'is', null).gt('price', 0)
            .gte('created_at', thirtyAgo),
          supabase.from('properties').select('price')
            .eq('city', city).eq('status', 'published').not('price', 'is', null).gt('price', 0)
            .gte('created_at', sixtyAgo).lt('created_at', thirtyAgo),
        ]);

        const listingCount = publishedRes.count || 1;
        const { data: cityPropIds } = await supabase
          .from('properties').select('id').eq('city', city).eq('status', 'published');
        const propIds = (cityPropIds || []).map(p => p.id);
        let totalViews = 0, totalSaves = 0;
        if (propIds.length > 0) {
          const [vR, sR] = await Promise.all([
            supabase.from('activity_logs').select('id', { count: 'exact', head: true })
              .eq('activity_type', 'view').in('property_id', propIds).gte('created_at', thirtyAgo),
            supabase.from('saved_properties').select('id', { count: 'exact', head: true })
              .in('property_id', propIds).gte('saved_at', thirtyAgo),
          ]);
          totalViews = vR.count || 0;
          totalSaves = sR.count || 0;
        }

        const vpl = totalViews / listingCount;
        const spl = totalSaves / listingCount;
        const recentPrices = (priceRecentRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
        const prevPrices = (pricePrevRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
        const avgRecent = recentPrices.length > 0 ? recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length : 0;
        const avgPrev = prevPrices.length > 0 ? prevPrices.reduce((a, b) => a + b, 0) / prevPrices.length : 0;
        const priceTrendPct = avgPrev > 0 ? ((avgRecent - avgPrev) / avgPrev) * 100 : 0;
        const newListings = newListingsRes.count || 0;

        let dS = vpl >= 50 ? 40 : vpl >= 30 ? 30 : vpl >= 15 ? 20 : 10;
        let svS = spl >= 10 ? 30 : spl >= 5 ? 20 : spl >= 2 ? 10 : 5;
        let pgS = priceTrendPct >= 5 ? 20 : priceTrendPct >= 2 ? 15 : priceTrendPct >= 0 ? 10 : 5;
        let velS = newListings >= 20 ? 10 : newListings >= 10 ? 7 : 4;

        return Math.max(0, Math.min(100, dS + svS + pgS + velS));
      };

      // Run all analyses in parallel per property
      const results = await Promise.all(properties.map(async (prop) => {
        const [roiResult, daysToSell, heatScore] = await Promise.all([
          computeRoi(prop),
          computeDaysToSellInline(prop),
          computeHeatForCity(prop.city),
        ]);

        const investmentScore = Number(prop.investment_score) || 0;

        // Composite comparison score
        const comparisonScore =
          (roiResult.roi_percent * 0.4) +
          (investmentScore * 0.2) +
          (heatScore * 0.2) +
          ((180 - daysToSell) * 0.2);

        return {
          property_id: prop.id,
          title: (prop as any).title || prop.id,
          city: prop.city,
          price: Number(prop.price) || 0,
          property_type: prop.property_type,
          roi_percent: roiResult.roi_percent,
          annualized_return: roiResult.annualized_return,
          investment_score: investmentScore,
          heat_score: heatScore,
          days_to_sell: daysToSell,
          comparison_score: Math.round(comparisonScore * 100) / 100,
        };
      }));

      // Sort by comparison_score desc
      results.sort((a, b) => b.comparison_score - a.comparison_score);
      const winner = results[0];

      // Generate decision reasoning
      const reasoning: string[] = [];
      reasoning.push(`${winner.property_id} has the highest composite score of ${winner.comparison_score}`);
      if (winner.roi_percent === Math.max(...results.map(r => r.roi_percent))) {
        reasoning.push(`Best ROI at ${winner.roi_percent}% over ${holdYears} years`);
      }
      if (winner.investment_score === Math.max(...results.map(r => r.investment_score))) {
        reasoning.push(`Highest investment score (${winner.investment_score}/100)`);
      }
      if (winner.heat_score === Math.max(...results.map(r => r.heat_score))) {
        reasoning.push(`Located in the hottest demand area (heat score: ${winner.heat_score})`);
      }
      if (winner.days_to_sell === Math.min(...results.map(r => r.days_to_sell))) {
        reasoning.push(`Fastest estimated time to sell (~${winner.days_to_sell} days)`);
      }
      // Add runner-up insight
      if (results.length >= 2) {
        const diff = results[0].comparison_score - results[1].comparison_score;
        if (diff < 5) {
          reasoning.push(`Close competition — only ${diff.toFixed(1)} points ahead of runner-up`);
        }
      }

      console.log(`Compare properties: winner=${winner.property_id} score=${winner.comparison_score}`);

      return new Response(JSON.stringify({
        mode: 'compare_properties',
        data: {
          hold_years: holdYears,
          properties_compared: results.length,
          comparison: results,
          winner: {
            property_id: winner.property_id,
            comparison_score: winner.comparison_score,
          },
          decision_reasoning: reasoning,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: portfolio_analysis
    // ═══════════════════════════════════════════
    if (mode === 'portfolio_analysis') {
      if (!Array.isArray(property_ids) || property_ids.length < 1) {
        return new Response(JSON.stringify({ error: 'At least 1 property_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (property_ids.length > 10) {
        return new Response(JSON.stringify({ error: 'Maximum 10 properties allowed per portfolio analysis.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const holdYears = Math.max(1, Math.min(30, Number(reqHoldYears) || 5));

      // Fetch all properties
      const { data: properties, error: pErr } = await supabase
        .from('properties')
        .select('id, title, price, city, area_sqm, land_area_sqm, building_area_sqm, has_pool, garage_count, floors, property_type, listing_type, investment_score, status, owner_id, agent_id, description, kt, km')
        .in('id', property_ids);

      if (pErr || !properties || properties.length < 1) {
        return new Response(JSON.stringify({ error: 'Could not find any properties' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Reuse helpers from compare_properties scope — redefine inline
      const computeRoiPortfolio = async (prop: typeof properties[0]) => {
        const price = Number(prop.price) || 0;
        if (price <= 0) return { roi_percent: 0, annualized_return: 0, projected_value: 0, net_profit: 0, annual_rent: 0 };

        const now = Date.now();
        const thirtyAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
        const sixtyAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

        const [priceRecentRes, pricePrevRes, publishedRes] = await Promise.all([
          supabase.from('properties').select('price')
            .eq('city', prop.city).eq('status', 'published').not('price', 'is', null).gt('price', 0)
            .gte('created_at', thirtyAgo),
          supabase.from('properties').select('price')
            .eq('city', prop.city).eq('status', 'published').not('price', 'is', null).gt('price', 0)
            .gte('created_at', sixtyAgo).lt('created_at', thirtyAgo),
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', prop.city).eq('status', 'published'),
        ]);

        const recentPrices = (priceRecentRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
        const prevPrices = (pricePrevRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
        const avgRecent = recentPrices.length > 0 ? recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length : 0;
        const avgPrev = prevPrices.length > 0 ? prevPrices.reduce((a, b) => a + b, 0) / prevPrices.length : 0;
        const priceTrendPct = avgPrev > 0 ? ((avgRecent - avgPrev) / avgPrev) * 100 : 3;

        const listingCount = publishedRes.count || 1;
        const { data: cityPropIds } = await supabase
          .from('properties').select('id').eq('city', prop.city).eq('status', 'published');
        const propIds = (cityPropIds || []).map(p => p.id);
        let totalViews = 0, totalSaves = 0;
        if (propIds.length > 0) {
          const [vR, sR] = await Promise.all([
            supabase.from('activity_logs').select('id', { count: 'exact', head: true })
              .eq('activity_type', 'view').in('property_id', propIds).gte('created_at', thirtyAgo),
            supabase.from('saved_properties').select('id', { count: 'exact', head: true })
              .in('property_id', propIds).gte('saved_at', thirtyAgo),
          ]);
          totalViews = vR.count || 0;
          totalSaves = sR.count || 0;
        }
        const vpl = totalViews / listingCount;
        const spl = totalSaves / listingCount;
        const dS = vpl >= 50 ? 40 : vpl >= 30 ? 30 : vpl >= 15 ? 20 : 10;
        const svS = spl >= 10 ? 30 : spl >= 5 ? 20 : spl >= 2 ? 10 : 5;
        const pgS = priceTrendPct >= 5 ? 20 : priceTrendPct >= 2 ? 15 : priceTrendPct >= 0 ? 10 : 5;
        const heatScore = Math.max(0, Math.min(100, dS + svS + pgS));
        const heatLevel = heatScore >= 80 ? 'very hot' : heatScore >= 65 ? 'hot' : heatScore >= 50 ? 'stable' : 'cool';

        let annualAppreciation = Math.abs(priceTrendPct) > 0 ? priceTrendPct : 3;
        if (heatLevel === 'very hot') annualAppreciation += 1;
        else if (heatLevel === 'hot') annualAppreciation += 0.5;
        const investScore = Number(prop.investment_score) || 0;
        if (investScore >= 80) annualAppreciation += 0.5;
        annualAppreciation = Math.max(2, Math.min(10, annualAppreciation));
        const appreciationRate = annualAppreciation / 100;

        const futureValue = price * Math.pow(1 + appreciationRate, holdYears);
        const typeYields: Record<string, number> = {
          villa: 0.055, apartment: 0.065, house: 0.045, land: 0.02,
          commercial: 0.07, townhouse: 0.05, warehouse: 0.06, office: 0.065,
        };
        const baseYield = typeYields[(prop.property_type || 'house').toLowerCase()] || 0.045;
        const adjustedYield = heatLevel === 'very hot' ? baseYield * 1.1
          : heatLevel === 'hot' ? baseYield * 1.05
          : heatLevel === 'cool' ? baseYield * 0.9
          : baseYield;

        const annualRent = price * adjustedYield;
        const totalRentalIncome = annualRent * holdYears;
        const maintenance = price * 0.01 * holdYears;
        const management = totalRentalIncome * 0.10;
        const exitCost = futureValue * 0.05;
        const totalExpenses = maintenance + management + exitCost;
        const capitalGain = futureValue - price;
        const netProfit = capitalGain + totalRentalIncome - totalExpenses;
        const roiPercent = (netProfit / price) * 100;
        const totalReturn = futureValue + totalRentalIncome - totalExpenses;
        const annualizedReturn = (Math.pow(totalReturn / price, 1 / holdYears) - 1) * 100;

        return {
          roi_percent: Math.round(roiPercent * 100) / 100,
          annualized_return: Math.round(annualizedReturn * 100) / 100,
          projected_value: Math.round(futureValue),
          net_profit: Math.round(netProfit),
          annual_rent: Math.round(annualRent),
          heat_score: heatScore,
        };
      };

      const computeDaysPortfolio = async (prop: typeof properties[0]) => {
        const price = Number(prop.price) || 0;
        if (price <= 0) return 180;
        const pLow = price * 0.8;
        const pHigh = price * 1.2;
        const t30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [cListRes, cmpRes, vRes, sRes] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', prop.city).eq('status', 'published'),
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', prop.city).eq('property_type', prop.property_type)
            .eq('status', 'published').gte('price', pLow).lte('price', pHigh).neq('id', prop.id),
          supabase.from('activity_logs').select('id', { count: 'exact', head: true })
            .eq('activity_type', 'view').eq('property_id', prop.id).gte('created_at', t30),
          supabase.from('saved_properties').select('id', { count: 'exact', head: true })
            .eq('property_id', prop.id).gte('saved_at', t30),
        ]);

        const cTotal = cListRes.count || 0;
        const cCount = cmpRes.count || 0;
        const eTotal = (vRes.count || 0) + (sRes.count || 0) * 3;
        const iScore = Number(prop.investment_score) || 0;

        let d: number;
        if (cTotal >= 100) d = 30;
        else if (cTotal >= 50) d = 45;
        else if (cTotal >= 20) d = 60;
        else d = 75;

        if (eTotal >= 50) d *= 0.85;
        else if (eTotal >= 20) d *= 0.95;
        else d *= 1.1;

        if (cCount <= 5) d *= 0.9;
        else d *= 1.15;

        if (iScore >= 80) d *= 0.9;
        else if (iScore < 50) d *= 1.1;

        return Math.max(7, Math.min(180, Math.round(d)));
      };

      // Run all analyses in parallel
      const propertyResults = await Promise.all(properties.map(async (prop) => {
        const [roiResult, daysToSell] = await Promise.all([
          computeRoiPortfolio(prop),
          computeDaysPortfolio(prop),
        ]);

        return {
          property_id: prop.id,
          title: prop.title || prop.id,
          city: prop.city,
          property_type: prop.property_type,
          purchase_price: Number(prop.price) || 0,
          projected_value: roiResult.projected_value,
          net_profit: roiResult.net_profit,
          roi_percent: roiResult.roi_percent,
          annualized_return: roiResult.annualized_return,
          investment_score: Number(prop.investment_score) || 0,
          heat_score: roiResult.heat_score,
          days_to_sell: daysToSell,
          annual_rental_income: roiResult.annual_rent,
        };
      }));

      // Sort by ROI and add ranking
      propertyResults.sort((a, b) => b.roi_percent - a.roi_percent);
      propertyResults.forEach((p, i) => { (p as any).rank = i + 1; });

      const topPerformer = propertyResults[0]?.property_id || null;
      const weakest = propertyResults[propertyResults.length - 1]?.property_id || null;

      // Aggregations
      const totalInvestment = propertyResults.reduce((s, p) => s + p.purchase_price, 0);
      const projectedPortfolioValue = propertyResults.reduce((s, p) => s + p.projected_value, 0);
      const totalProfit = propertyResults.reduce((s, p) => s + p.net_profit, 0);
      const blendedRoiPercent = totalInvestment > 0 ? Math.round((totalProfit / totalInvestment) * 10000) / 100 : 0;
      const totalAnnualRent = propertyResults.reduce((s, p) => s + p.annual_rental_income, 0);
      const avgHeatScore = propertyResults.reduce((s, p) => s + p.heat_score, 0) / propertyResults.length;
      const avgDaysToSell = propertyResults.reduce((s, p) => s + p.days_to_sell, 0) / propertyResults.length;

      // Risk scoring
      let riskScore = 50;
      const uniqueCities = new Set(propertyResults.map(p => p.city));
      const uniqueTypes = new Set(propertyResults.map(p => p.property_type));
      if (uniqueCities.size === 1 && propertyResults.length > 1) riskScore += 15;
      if (uniqueTypes.size === 1 && propertyResults.length > 1) riskScore += 10;
      if (avgHeatScore < 50) riskScore += 10;
      if (avgDaysToSell > 90) riskScore += 10;
      riskScore = Math.max(0, Math.min(100, riskScore));

      let riskLevel: string;
      if (riskScore >= 75) riskLevel = 'high';
      else if (riskScore >= 50) riskLevel = 'moderate';
      else riskLevel = 'low';

      // Diversification breakdown
      const cityBreakdown: Record<string, number> = {};
      const typeBreakdown: Record<string, number> = {};
      for (const p of propertyResults) {
        cityBreakdown[p.city || 'Unknown'] = (cityBreakdown[p.city || 'Unknown'] || 0) + 1;
        typeBreakdown[p.property_type || 'Unknown'] = (typeBreakdown[p.property_type || 'Unknown'] || 0) + 1;
      }

      // Risk factors explanation
      const riskFactors: string[] = [];
      if (uniqueCities.size === 1 && propertyResults.length > 1) riskFactors.push('All properties in one city — geographic concentration risk (+15)');
      if (uniqueTypes.size === 1 && propertyResults.length > 1) riskFactors.push('All properties same type — asset class concentration risk (+10)');
      if (avgHeatScore < 50) riskFactors.push(`Average market heat below 50 (${Math.round(avgHeatScore)}) — weak demand signal (+10)`);
      if (avgDaysToSell > 90) riskFactors.push(`Average days to sell above 90 (${Math.round(avgDaysToSell)}) — low liquidity risk (+10)`);
      if (riskFactors.length === 0) riskFactors.push('Portfolio is well-diversified with no major concentration risks');

      console.log(`Portfolio analysis: ${propertyResults.length} properties, blended ROI ${blendedRoiPercent}%, risk ${riskScore}`);

      return new Response(JSON.stringify({
        mode: 'portfolio_analysis',
        data: {
          hold_years: holdYears,
          property_count: propertyResults.length,
          top_performer_property_id: topPerformer,
          weakest_property_id: weakest,
          properties: propertyResults,
          aggregation: {
            total_investment: totalInvestment,
            projected_portfolio_value: projectedPortfolioValue,
            total_profit: totalProfit,
            blended_roi_percent: blendedRoiPercent,
            total_annual_rental_income: totalAnnualRent,
            avg_heat_score: Math.round(avgHeatScore),
            avg_days_to_sell: Math.round(avgDaysToSell),
          },
          risk: {
            risk_score: riskScore,
            risk_level: riskLevel,
            risk_factors: riskFactors,
          },
          diversification: {
            cities: cityBreakdown,
            property_types: typeBreakdown,
            unique_cities: uniqueCities.size,
            unique_property_types: uniqueTypes.size,
          },
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!property_id) {
      return new Response(JSON.stringify({ error: 'property_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Fetch property (superset of fields needed by both modes) ──
    const { data: property, error: pErr } = await supabase
      .from('properties')
      .select('id, price, city, area_sqm, land_area_sqm, building_area_sqm, has_pool, garage_count, floors, property_type, listing_type, investment_score, status, owner_id, agent_id, description, kt, km')
      .eq('id', property_id)
      .maybeSingle();

    if (pErr || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Authorization: service_role, owner, agent, or admin ──
    if (!isServiceRole) {
      const isOwner = property.owner_id === userId;
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
        return new Response(JSON.stringify({ error: 'Forbidden – only property owner, agent, or admin allowed' }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // ═══════════════════════════════════════════
    // MODE: investment_score
    // ═══════════════════════════════════════════
    if (mode === 'investment_score') {
      const price = Number(property.price) || 0;
      const buildingArea = Number(property.building_area_sqm) || Number(property.area_sqm) || 1;
      const landArea = Number(property.land_area_sqm) || buildingArea;
      const pricePerM2 = price / buildingArea;

      // City-level market data
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

      // LOCATION DEMAND (0–20)
      const { count: cityCount } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('city', property.city);

      let locationScore = 6;
      const c = cityCount || 0;
      if (c >= 50) locationScore = 20;
      else if (c >= 20) locationScore = 12;

      // PRICE VS MARKET (0–20)
      let priceScore = 5;
      if (avgPricePerM2 > 0) {
        const diff = (pricePerM2 - avgPricePerM2) / avgPricePerM2;
        if (diff <= -0.10) priceScore = 20;
        else if (diff <= -0.05) priceScore = 15;
        else if (diff <= 0.05) priceScore = 10;
        else priceScore = 5;
      }

      // RENTAL YIELD (0–20)
      const annualRent = price * 0.06;
      const yieldPct = price > 0 ? (annualRent / price) * 100 : 0;
      let yieldScore = 5;
      if (yieldPct > 7) yieldScore = 20;
      else if (yieldPct >= 6) yieldScore = 15;
      else if (yieldPct >= 5) yieldScore = 10;

      // FEATURE BONUS (0–10)
      let featureScore = 0;
      if (property.has_pool) featureScore += 5;
      if ((property.garage_count || 0) > 0) featureScore += 3;
      if ((property.floors || 1) > 1) featureScore += 2;

      // ENGAGEMENT (0–10)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: viewCount } = await supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .eq('activity_type', 'view')
        .eq('property_id', property_id)
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

      // SIZE OPTIMIZATION (0–10)
      const ltLbRatio = landArea / buildingArea;
      const sizeScore = (ltLbRatio >= 1.1 && ltLbRatio <= 1.8) ? 10 : 5;

      // LIQUIDITY (0–10)
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

      // FINAL
      const rawScore = locationScore + priceScore + yieldScore + featureScore + engagementScore + sizeScore + liquidityScore;
      const finalScore = Math.max(0, Math.min(100, rawScore));

      const { error: updateErr } = await supabase
        .from('properties')
        .update({ investment_score: finalScore })
        .eq('id', property_id);

      if (updateErr) {
        console.error('Failed to update investment_score:', updateErr);
        throw new Error('Failed to save score');
      }

      console.log(`Investment score for ${property_id}: ${finalScore}`);

      return new Response(JSON.stringify({
        mode: 'investment_score',
        data: {
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
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: price_suggestion (also reused by listing_health)
    // ═══════════════════════════════════════════
    const computePricePosition = async (prop: typeof property, propId: string) => {
      const ba = Number(prop.building_area_sqm) || 0;
      const la = Number(prop.land_area_sqm) || 0;
      const primaryArea = ba > 0 ? ba : la;
      const areaType = ba > 0 ? 'building' : 'land';
      if (primaryArea <= 0) return { price_position: 'unknown' as string, comparable_count: 0 };

      const minA = primaryArea * 0.7;
      const maxA = primaryArea * 1.3;
      const areaCol = areaType === 'building' ? 'building_area_sqm' : 'land_area_sqm';

      const { data: comps } = await supabase
        .from('properties')
        .select('price, building_area_sqm, land_area_sqm')
        .eq('city', prop.city)
        .eq('property_type', prop.property_type)
        .eq('status', 'published')
        .not('price', 'is', null)
        .gte(areaCol, minA)
        .lte(areaCol, maxA)
        .neq('id', propId)
        .limit(50);

      const valid = (comps || []).filter(
        (c) => Number(c.price) > 0 && Number(c[areaCol]) > 0
      );
      if (valid.length === 0) return { price_position: 'unknown', comparable_count: 0 };

      // Median price per sqm
      const ppm2 = valid.map((c) => Number(c.price) / Number(c[areaCol])).sort((a, b) => a - b);
      const mid = Math.floor(ppm2.length / 2);
      const median = ppm2.length % 2 !== 0 ? ppm2[mid] : (ppm2[mid - 1] + ppm2[mid]) / 2;
      const avgPricePerSqm = Math.round(ppm2.reduce((s, v) => s + v, 0) / ppm2.length);

      // Demand multiplier based on market density (comparable volume as proxy)
      const cc = valid.length;
      let demandMultiplier = 1.0;
      if (cc >= 30) demandMultiplier = 1.10;       // hot market
      else if (cc >= 15) demandMultiplier = 1.05;   // warm market
      else if (cc >= 5) demandMultiplier = 1.0;     // normal
      else demandMultiplier = 0.95;                 // cool / thin market

      // FMV = median_price_per_sqm * area * demand_multiplier
      let fmv = median * primaryArea * demandMultiplier;

      // Investment score adjustment
      const is2 = Number(prop.investment_score) || 0;
      if (is2 >= 80) fmv *= 1.05;
      else if (is2 >= 65) fmv *= 1.03;
      else if (is2 < 50) fmv *= 0.95;

      const suggested = Math.round(fmv);
      const rMin = Math.round(fmv * 0.90);
      const rMax = Math.round(fmv * 1.10);
      const cur = Number(prop.price) || 0;

      // Market positioning with thresholds
      const ratio = cur > 0 ? cur / fmv : 0;
      let pos: string;
      if (ratio > 1.15) pos = 'overpriced';
      else if (ratio < 0.85) pos = 'underpriced';
      else pos = 'market-aligned';

      // Expected days on market prediction
      let expectedDaysOnMarket: number;
      if (pos === 'underpriced') {
        expectedDaysOnMarket = Math.max(7, Math.round(30 * ratio));
      } else if (pos === 'overpriced') {
        expectedDaysOnMarket = Math.round(60 * (1 + (ratio - 1.15) * 3));
      } else {
        expectedDaysOnMarket = 60;
      }

      // Confidence score
      let conf: number;
      if (cc >= 20) conf = 95;
      else if (cc >= 10) conf = 80;
      else if (cc >= 5) conf = 65;
      else conf = 40;

      // Reasoning bullets
      const reasoning: string[] = [];
      reasoning.push(`Based on ${cc} comparable ${prop.property_type || 'property'} listings in ${prop.city} (avg ${avgPricePerSqm.toLocaleString('id-ID')} IDR/sqm)`);
      reasoning.push(`Demand multiplier: ${demandMultiplier}x (${demandMultiplier >= 1.05 ? 'high' : demandMultiplier >= 1.0 ? 'normal' : 'low'} market activity)`);
      if (cur > 0) {
        reasoning.push(`Current price is ${Math.round(ratio * 100)}% of FMV — ${pos}`);
      } else {
        reasoning.push(`No current price set; suggested FMV: ${suggested.toLocaleString('id-ID')} IDR`);
      }

      return {
        recommended_min_price: rMin,
        recommended_max_price: rMax,
        suggested_price: suggested,
        fair_market_value: suggested,
        price_per_sqm: avgPricePerSqm,
        area_type_used: areaType,
        demand_multiplier: demandMultiplier,
        confidence_score: conf,
        price_position: pos,
        expected_days_on_market: expectedDaysOnMarket,
        comparable_count: cc,
        reasoning,
      };
    };

    if (mode === 'price_suggestion') {
      const buildingArea = Number(property.building_area_sqm) || 0;
      const landArea = Number(property.land_area_sqm) || 0;
      if (buildingArea <= 0 && landArea <= 0) {
        return new Response(JSON.stringify({ error: 'Property must have building_area_sqm or land_area_sqm to estimate price' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await computePricePosition(property, property_id);
      if (result.comparable_count === 0) {
        return new Response(JSON.stringify({
          mode: 'price_suggestion',
          data: { error: 'Not enough comparable listings', comparable_count: 0 },
        }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Price suggestion for ${property_id}: FMV=${result.fair_market_value} pos=${result.price_position} days=${result.expected_days_on_market} (${result.comparable_count} comps, area_type=${result.area_type_used})`);

      return new Response(JSON.stringify({ mode: 'price_suggestion', data: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // Shared: computeDaysOnMarket helper
    // ═══════════════════════════════════════════
    const computeDaysOnMarket = async (prop: typeof property, propId: string, overridePrice?: number) => {
      const usePrice = overridePrice ?? (Number(prop.price) || 0);
      const pLow = usePrice * 0.8;
      const pHigh = usePrice * 1.2;
      const t30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const virtualProp = overridePrice !== undefined ? { ...prop, price: overridePrice } : prop;

      const [cListRes, cmpRes, vRes, sRes, ppRes] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true })
          .eq('city', prop.city).eq('status', 'published'),
        supabase.from('properties').select('id', { count: 'exact', head: true })
          .eq('city', prop.city).eq('property_type', prop.property_type)
          .eq('status', 'published').gte('price', pLow).lte('price', pHigh).neq('id', propId),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('activity_type', 'view').eq('property_id', propId).gte('created_at', t30),
        supabase.from('saved_properties').select('id', { count: 'exact', head: true })
          .eq('property_id', propId).gte('saved_at', t30),
        computePricePosition(virtualProp, propId),
      ]);

      const cTotal = cListRes.count || 0;
      const cCount = cmpRes.count || 0;
      const eTotal = (vRes.count || 0) + (sRes.count || 0) * 3;
      const iScore = Number(prop.investment_score) || 0;

      let d: number;
      if (cTotal >= 100) d = 30;
      else if (cTotal >= 50) d = 45;
      else if (cTotal >= 20) d = 60;
      else d = 75;

      const position = ppRes.price_position;
      if (position === 'underpriced') d *= 0.8;
      else if (position === 'overpriced') d *= 1.25;

      let eLevel: string;
      if (eTotal >= 50) { d *= 0.85; eLevel = 'high'; }
      else if (eTotal >= 20) { d *= 0.95; eLevel = 'medium'; }
      else { d *= 1.1; eLevel = 'low'; }

      let cLevel: string;
      if (cCount <= 5) { d *= 0.9; cLevel = 'low'; }
      else { d *= 1.15; cLevel = 'high'; }

      if (iScore >= 80) d *= 0.9;
      else if (iScore < 50) d *= 1.1;

      const days = Math.max(7, Math.min(180, Math.round(d)));

      let speed: string;
      if (days <= 30) speed = 'very fast';
      else if (days <= 60) speed = 'fast';
      else if (days <= 90) speed = 'moderate';
      else speed = 'slow';

      let conf: number;
      if (cCount >= 20) conf = 90;
      else if (cCount >= 10) conf = 75;
      else if (cCount >= 5) conf = 60;
      else conf = 40;

      return {
        estimated_days_on_market: days,
        speed_category: speed,
        confidence_score: conf,
        factors: { price_position: position, engagement_level: eLevel, competition_level: cLevel, investment_score: iScore },
      };
    };

    // ═══════════════════════════════════════════
    // MODE: listing_health
    // ═══════════════════════════════════════════
    if (mode === 'listing_health') {
      const issues: string[] = [];
      const strengths: string[] = [];
      const improvementPriority: string[] = [];

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [photoRes, tour3dRes, viewRes, saveRes, pricePos] = await Promise.all([
        supabase.from('property_media').select('id', { count: 'exact', head: true })
          .eq('property_id', property_id).eq('media_type', 'image'),
        supabase.from('property_media').select('id', { count: 'exact', head: true })
          .eq('property_id', property_id).eq('media_type', '3d'),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('activity_type', 'view').eq('property_id', property_id).gte('created_at', thirtyDaysAgo),
        supabase.from('saved_properties').select('id', { count: 'exact', head: true })
          .eq('property_id', property_id).gte('saved_at', thirtyDaysAgo),
        computePricePosition(property, property_id),
      ]);

      const photoCount = photoRes.count || 0;
      const has3dTour = (tour3dRes.count || 0) > 0;
      const engagementTotal = (viewRes.count || 0) + (saveRes.count || 0) * 3;

      let priceHealthScore = 10;
      if (pricePos.price_position === 'market-aligned') { priceHealthScore = 25; strengths.push('Price is market-aligned'); }
      else if (pricePos.price_position === 'underpriced') { priceHealthScore = 22; strengths.push('Competitive pricing — below market'); }
      else if (pricePos.price_position === 'overpriced') { priceHealthScore = 10; issues.push('Property appears overpriced'); improvementPriority.push('Adjust price to market range'); }
      else { priceHealthScore = 15; }

      const invS = Number(property.investment_score) || 0;
      let investmentHealthScore = 5;
      if (invS >= 80) { investmentHealthScore = 15; strengths.push('Strong investment score (≥80)'); }
      else if (invS >= 65) { investmentHealthScore = 10; }
      else { issues.push('Low investment score'); improvementPriority.push('Improve property features or pricing to boost investment score'); }

      const descLen = (property.description || '').length;
      let descScore = 5;
      if (descLen > 400) { descScore = 15; strengths.push('Detailed description'); }
      else if (descLen >= 200) { descScore = 10; }
      else { issues.push('Description is too short (< 200 chars)'); improvementPriority.push('Write a detailed property description (400+ characters)'); }

      let photoScore = 5;
      if (photoCount >= 10) { photoScore = 15; strengths.push(`${photoCount} photos uploaded`); }
      else if (photoCount >= 5) { photoScore = 10; }
      else { issues.push(`Only ${photoCount} photo(s) uploaded`); improvementPriority.push('Upload at least 10 high-quality photos'); }

      let tourScore = 0;
      if (has3dTour) { tourScore = 10; strengths.push('3D tour available'); }
      else { issues.push('No 3D tour'); improvementPriority.push('Add a 3D virtual tour'); }

      let engScore = 3;
      if (engagementTotal >= 50) { engScore = 10; strengths.push('High engagement in last 30 days'); }
      else if (engagementTotal >= 20) { engScore = 6; }
      else { issues.push('Low engagement in last 30 days'); }

      const majorFields = [property.price, property.description, property.city, property.property_type, property.building_area_sqm, property.land_area_sqm, property.kt, property.km];
      const missingCount = majorFields.filter(f => f === null || f === undefined || f === '' || f === 0).length;
      let completenessScore = 10;
      if (missingCount > 2) { completenessScore = 5; issues.push(`${missingCount} major fields are incomplete`); improvementPriority.push('Fill in all property details (area, bedrooms, bathrooms, etc.)'); }
      else { strengths.push('Property details are complete'); }

      const healthScore = Math.max(0, Math.min(100, priceHealthScore + investmentHealthScore + descScore + photoScore + tourScore + engScore + completenessScore));
      let grade: string;
      if (healthScore >= 90) grade = 'A';
      else if (healthScore >= 75) grade = 'B';
      else if (healthScore >= 60) grade = 'C';
      else grade = 'D';

      console.log(`Listing health for ${property_id}: ${healthScore} (${grade})`);

      return new Response(JSON.stringify({
        mode: 'listing_health',
        data: { health_score: healthScore, grade, issues, strengths, improvement_priority: improvementPriority },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: days_to_sell_prediction
    // ═══════════════════════════════════════════
    if (mode === 'days_to_sell_prediction') {
      const domResult = await computeDaysOnMarket(property, property_id);

      // Fetch actual DOM stats from sold properties in same city/type for validation
      const { data: soldProps } = await supabase
        .from('properties')
        .select('days_on_market, price, sold_at, listed_at')
        .eq('city', property.city)
        .eq('property_type', property.property_type)
        .not('days_on_market', 'is', null)
        .not('sold_at', 'is', null)
        .order('sold_at', { ascending: false })
        .limit(50);

      let actual_dom_stats = null;
      if (soldProps && soldProps.length > 0) {
        const doms = soldProps.map((p: any) => p.days_on_market as number).sort((a: number, b: number) => a - b);
        const avg = Math.round(doms.reduce((s: number, v: number) => s + v, 0) / doms.length);
        const median = doms[Math.floor(doms.length / 2)];
        const min = doms[0];
        const max = doms[doms.length - 1];
        actual_dom_stats = {
          sample_size: doms.length,
          average: avg,
          median,
          min,
          max,
          prediction_accuracy: domResult.estimated_days_on_market > 0
            ? Math.round((1 - Math.abs(domResult.estimated_days_on_market - median) / median) * 100)
            : null,
        };
      }

      // Current property's actual DOM (if listed)
      const currentListedAt = (property as any).listed_at;
      const currentSoldAt = (property as any).sold_at;
      const currentDom = (property as any).days_on_market;
      let current_dom_info = null;
      if (currentListedAt) {
        const listedDate = new Date(currentListedAt);
        const now = currentSoldAt ? new Date(currentSoldAt) : new Date();
        const activeDays = Math.max(1, Math.round((now.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24)));
        current_dom_info = {
          listed_at: currentListedAt,
          sold_at: currentSoldAt || null,
          days_active: currentDom || activeDays,
          is_sold: !!currentSoldAt,
        };
      }

      console.log(`Days to sell for ${property_id}: ${domResult.estimated_days_on_market} (${domResult.speed_category}), actual_stats: ${soldProps?.length || 0} sold comps`);

      // Auto-save predicted DOM to properties table
      if (property_id && domResult.estimated_days_on_market > 0) {
        await supabase
          .from('properties')
          .update({ predicted_days_to_sell: domResult.estimated_days_on_market })
          .eq('id', property_id);
      }

      return new Response(JSON.stringify({
        mode: 'days_to_sell_prediction',
        data: {
          ...domResult,
          actual_dom_stats,
          current_dom_info,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: price_adjustment_strategy
    // ═══════════════════════════════════════════
    {
      const adjPriceResult = await computePricePosition(property, property_id);
      const curPrice = Number(property.price) || 0;

      if (adjPriceResult.price_position !== 'overpriced') {
        return new Response(JSON.stringify({
          mode: 'price_adjustment_strategy',
          data: {
            recommendation: 'No adjustment needed',
            current_price: curPrice,
            price_position: adjPriceResult.price_position,
            impact_prediction: 'Low',
            reasoning: ['Current price is within or below market range', 'No price reduction recommended'],
          },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const sugPrice = adjPriceResult.suggested_price || curPrice;
      const redPct = Math.round(((curPrice - sugPrice) / curPrice) * 10000) / 100;

      const [domCurr, domAdj] = await Promise.all([
        computeDaysOnMarket(property, property_id),
        computeDaysOnMarket(property, property_id, sugPrice),
      ]);

      const domRed = domCurr.estimated_days_on_market - domAdj.estimated_days_on_market;

      let impact: string;
      if (domRed > 20) impact = 'High';
      else if (domRed >= 10) impact = 'Medium';
      else impact = 'Low';

      const reasons: string[] = [];
      reasons.push(`Property is priced ${redPct.toFixed(1)}% above suggested market price`);
      reasons.push(`Reducing to Rp ${sugPrice.toLocaleString('id-ID')} could save ~${domRed} days on market`);
      if (domCurr.factors.engagement_level === 'low') reasons.push('Low engagement suggests buyers are deterred by current pricing');
      if (domCurr.factors.competition_level === 'high') reasons.push('High competition in this segment increases pressure to price competitively');
      if ((Number(property.investment_score) || 0) >= 80) reasons.push('Strong investment score supports faster sale at adjusted price');

      console.log(`Price adjustment for ${property_id}: reduce ${redPct}%, save ${domRed} days`);

      return new Response(JSON.stringify({
        mode: 'price_adjustment_strategy',
        data: {
          recommendation: `Reduce price by ${redPct.toFixed(1)}%`,
          current_price: curPrice,
          recommended_price: sugPrice,
          reduction_percent: redPct,
          price_position: adjPriceResult.price_position,
          dom_current: domCurr.estimated_days_on_market,
          dom_adjusted: domAdj.estimated_days_on_market,
          expected_dom_reduction_days: domRed,
          impact_prediction: impact,
          reasoning: reasons,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: roi_simulation
    // ═══════════════════════════════════════════
    if (mode === 'roi_simulation') {
      const holdYears = Math.max(1, Math.min(30, Number(reqHoldYears) || 5));
      const price = Number(property.price) || 0;
      if (price <= 0) {
        return new Response(JSON.stringify({ error: 'Property has no valid price' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ── Fetch city price trend (reuse demand_heat logic inline) ──
      const now = Date.now();
      const thirtyAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sixtyAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();

      const [priceRecentRes, pricePrevRes, publishedRes, viewsCountRes, savesCountRes] = await Promise.all([
        supabase.from('properties').select('price')
          .eq('city', property.city).eq('status', 'published').not('price', 'is', null).gt('price', 0)
          .gte('created_at', thirtyAgo),
        supabase.from('properties').select('price')
          .eq('city', property.city).eq('status', 'published').not('price', 'is', null).gt('price', 0)
          .gte('created_at', sixtyAgo).lt('created_at', thirtyAgo),
        supabase.from('properties').select('id', { count: 'exact', head: true })
          .eq('city', property.city).eq('status', 'published'),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('activity_type', 'view').gte('created_at', thirtyAgo),
        supabase.from('saved_properties').select('id', { count: 'exact', head: true })
          .gte('saved_at', thirtyAgo),
      ]);

      const recentPrices = (priceRecentRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
      const prevPrices = (pricePrevRes.data || []).map(p => Number(p.price)).filter(p => p > 0);
      const avgRecent = recentPrices.length > 0 ? recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length : 0;
      const avgPrev = prevPrices.length > 0 ? prevPrices.reduce((a, b) => a + b, 0) / prevPrices.length : 0;
      const priceTrendPct = avgPrev > 0 ? ((avgRecent - avgPrev) / avgPrev) * 100 : 3;

      // ── Compute heat level (simplified reuse) ──
      const listingCount = publishedRes.count || 1;
      const { data: cityPropIds } = await supabase
        .from('properties').select('id').eq('city', property.city).eq('status', 'published');
      const propIds = (cityPropIds || []).map(p => p.id);

      let totalViews = 0;
      let totalSaves = 0;
      if (propIds.length > 0) {
        const { count: vC } = await supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('activity_type', 'view').in('property_id', propIds).gte('created_at', thirtyAgo);
        totalViews = vC || 0;
        const { count: sC } = await supabase.from('saved_properties').select('id', { count: 'exact', head: true })
          .in('property_id', propIds).gte('saved_at', thirtyAgo);
        totalSaves = sC || 0;
      }

      const viewsPerListing = totalViews / listingCount;
      const savesPerListing = totalSaves / listingCount;
      let demandS = viewsPerListing >= 50 ? 40 : viewsPerListing >= 30 ? 30 : viewsPerListing >= 15 ? 20 : 10;
      let saveS = savesPerListing >= 10 ? 30 : savesPerListing >= 5 ? 20 : savesPerListing >= 2 ? 10 : 5;
      let priceGS = priceTrendPct >= 5 ? 20 : priceTrendPct >= 2 ? 15 : priceTrendPct >= 0 ? 10 : 5;
      const heatScore = Math.max(0, Math.min(100, demandS + saveS + priceGS));
      const heatLevel = heatScore >= 80 ? 'very hot' : heatScore >= 65 ? 'hot' : heatScore >= 50 ? 'stable' : 'cool';

      // ── Annual appreciation ──
      let annualAppreciation = Math.abs(priceTrendPct) > 0 ? priceTrendPct : 3;
      if (heatLevel === 'very hot') annualAppreciation += 1;
      else if (heatLevel === 'hot') annualAppreciation += 0.5;
      const investScore = Number(property.investment_score) || 0;
      if (investScore >= 80) annualAppreciation += 0.5;
      annualAppreciation = Math.max(2, Math.min(10, annualAppreciation));
      const appreciationRate = annualAppreciation / 100;

      // ── Future value ──
      const futureValue = price * Math.pow(1 + appreciationRate, holdYears);

      // ── Rental yield by type ──
      const typeYields: Record<string, number> = {
        villa: 0.055, apartment: 0.065, house: 0.045, land: 0.02,
        commercial: 0.07, townhouse: 0.05, warehouse: 0.06, office: 0.065,
      };
      const baseYield = typeYields[(property.property_type || 'house').toLowerCase()] || 0.045;
      // Adjust yield by heat
      const adjustedYield = heatLevel === 'very hot' ? baseYield * 1.1
        : heatLevel === 'hot' ? baseYield * 1.05
        : heatLevel === 'cool' ? baseYield * 0.9
        : baseYield;

      // ── Rental income ──
      const annualRent = price * adjustedYield;
      const totalRentalIncome = annualRent * holdYears;

      // ── Expenses ──
      const maintenance = price * 0.01 * holdYears;
      const management = totalRentalIncome * 0.10;
      const exitCost = futureValue * 0.05;
      const totalExpenses = maintenance + management + exitCost;

      // ── Net profit & ROI ──
      const capitalGain = futureValue - price;
      const netProfit = capitalGain + totalRentalIncome - totalExpenses;
      const roiPercent = (netProfit / price) * 100;

      // ── Annualized return ──
      const totalReturn = futureValue + totalRentalIncome - totalExpenses;
      const annualizedReturn = (Math.pow(totalReturn / price, 1 / holdYears) - 1) * 100;

      // ── Confidence ──
      let confidence = 50;
      if (recentPrices.length >= 20 && prevPrices.length >= 10) confidence = 85;
      else if (recentPrices.length >= 10) confidence = 70;
      else if (recentPrices.length >= 5) confidence = 60;

      // ── Year-by-year projection ──
      const projection: { year: number; property_value: number; cumulative_rent: number; equity_position: number }[] = [];
      let currentValue = price;
      let cumulativeRent = 0;
      for (let y = 1; y <= holdYears; y++) {
        currentValue = currentValue * (1 + appreciationRate);
        cumulativeRent += annualRent;
        const equityPosition = (currentValue - price) + cumulativeRent;
        projection.push({
          year: y,
          property_value: Math.round(currentValue),
          cumulative_rent: Math.round(cumulativeRent),
          equity_position: Math.round(equityPosition),
        });
      }

      console.log(`ROI simulation for ${property_id}: ${roiPercent.toFixed(1)}% over ${holdYears}yr`);

      return new Response(JSON.stringify({
        mode: 'roi_simulation',
        data: {
          hold_years: holdYears,
          current_price: price,
          future_value: Math.round(futureValue),
          capital_gain: Math.round(capitalGain),
          annual_appreciation_percent: Math.round(annualAppreciation * 100) / 100,
          rental: {
            annual_rent: Math.round(annualRent),
            total_rental_income: Math.round(totalRentalIncome),
            adjusted_yield_percent: Math.round(adjustedYield * 10000) / 100,
          },
          expenses: {
            maintenance: Math.round(maintenance),
            management: Math.round(management),
            exit_cost: Math.round(exitCost),
            total: Math.round(totalExpenses),
          },
          net_profit: Math.round(netProfit),
          roi_percent: Math.round(roiPercent * 100) / 100,
          annualized_return_percent: Math.round(annualizedReturn * 100) / 100,
          projection,
          market_context: {
            heat_level: heatLevel,
            heat_score: heatScore,
            price_trend_percent: Math.round(priceTrendPct * 100) / 100,
            investment_score: investScore,
          },
          confidence_score: confidence,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: ranking_score
    // ═══════════════════════════════════════════
    if (mode === 'ranking_score') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id is required for ranking_score mode' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: prop, error: pErr } = await supabase
        .from('properties')
        .select('id, investment_score, city, created_at, status, property_type')
        .eq('id', property_id)
        .single();

      if (pErr || !prop) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Engagement: views + saves last 30 days
      const [viewsRes, savesRes] = await Promise.all([
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('activity_type', 'view').eq('property_id', property_id).gte('created_at', thirtyAgo),
        supabase.from('saved_properties').select('id', { count: 'exact', head: true })
          .eq('property_id', property_id).gte('saved_at', thirtyAgo),
      ]);
      const engagementScore = Math.min(100, ((viewsRes.count || 0) + (savesRes.count || 0) * 3));

      // Listing health (simplified inline)
      const price = Number(prop.investment_score) || 0;
      const listingHealthScore = price; // reuse investment_score as proxy or compute inline

      // Demand heat for city
      let demandHeatScore = 50; // default
      if (prop.city) {
        const { data: cityProps } = await supabase
          .from('properties').select('id').eq('city', prop.city).eq('status', 'published');
        const cpIds = (cityProps || []).map(p => p.id);
        if (cpIds.length > 0) {
          const [cvRes, csRes] = await Promise.all([
            supabase.from('activity_logs').select('id', { count: 'exact', head: true })
              .eq('activity_type', 'view').in('property_id', cpIds).gte('created_at', thirtyAgo),
            supabase.from('saved_properties').select('id', { count: 'exact', head: true })
              .in('property_id', cpIds).gte('saved_at', thirtyAgo),
          ]);
          const vpl = (cvRes.count || 0) / cpIds.length;
          const spl = (csRes.count || 0) / cpIds.length;
          const dS = vpl >= 50 ? 40 : vpl >= 30 ? 30 : vpl >= 15 ? 20 : 10;
          const svS = spl >= 10 ? 30 : spl >= 5 ? 20 : spl >= 2 ? 10 : 5;
          demandHeatScore = Math.min(100, dS + svS + 15);
        }
      }

      const rankingScore = calculateRankingScore(
        {
          investment_score: Number(prop.investment_score) || 0,
          listing_health_score: listingHealthScore,
          engagement_score: engagementScore,
          demand_heat_score: demandHeatScore,
          created_at: prop.created_at,
        },
        subscriptionType
      );

      return new Response(JSON.stringify({
        mode: 'ranking_score',
        data: {
          property_id: prop.id,
          ranking_score: rankingScore,
          components: {
            investment_score: Number(prop.investment_score) || 0,
            listing_health_score: listingHealthScore,
            engagement_score: engagementScore,
            demand_heat_score: demandHeatScore,
            recency_days: Math.round((Date.now() - new Date(prop.created_at).getTime()) / (1000 * 60 * 60 * 24)),
            subscription_type: subscriptionType,
          },
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: listing_visibility_analytics
    // ═══════════════════════════════════════════
    if (mode === 'listing_visibility_analytics') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id is required for listing_visibility_analytics mode' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Step 1-2: Fetch target property
      const { data: prop, error: pErr } = await supabase
        .from('properties')
        .select('id, city, investment_score, created_at, status, property_type, owner_id, agent_id')
        .eq('id', property_id)
        .single();

      if (pErr || !prop) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch owner subscription
      const ownerId = prop.owner_id || prop.agent_id;
      let ownerSubscription = 'free';
      if (ownerId) {
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('subscription_type')
          .eq('id', ownerId)
          .single();
        if (ownerProfile?.subscription_type) ownerSubscription = ownerProfile.subscription_type;
      }

      const thirtyAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Step 3: Fetch all published listings in same city
      const { data: cityListings } = await supabase
        .from('properties')
        .select('id, investment_score, created_at, status, property_type, owner_id, agent_id')
        .eq('city', prop.city)
        .eq('status', 'published');

      const allListings = cityListings || [];
      const totalListings = allListings.length;

      // Step 4-5: Calculate ranking_score for each listing and sort
      // We need engagement + demand heat for each — batch fetch city-level demand first
      const allIds = allListings.map(l => l.id);

      // City-level demand heat (shared)
      let demandHeatScore = 50;
      if (allIds.length > 0) {
        const [cvRes, csRes] = await Promise.all([
          supabase.from('activity_logs').select('id', { count: 'exact', head: true })
            .eq('activity_type', 'view').in('property_id', allIds).gte('created_at', thirtyAgo),
          supabase.from('saved_properties').select('id', { count: 'exact', head: true })
            .in('property_id', allIds).gte('saved_at', thirtyAgo),
        ]);
        const vpl = (cvRes.count || 0) / allIds.length;
        const spl = (csRes.count || 0) / allIds.length;
        const dS = vpl >= 50 ? 40 : vpl >= 30 ? 30 : vpl >= 15 ? 20 : 10;
        const svS = spl >= 10 ? 30 : spl >= 5 ? 20 : spl >= 2 ? 10 : 5;
        demandHeatScore = Math.min(100, dS + svS + 15);
      }

      // Per-listing engagement (views+saves last 30d) — batch fetch
      const [allViewsRes, allSavesRes] = await Promise.all([
        allIds.length > 0
          ? supabase.from('activity_logs').select('property_id')
              .eq('activity_type', 'view').in('property_id', allIds).gte('created_at', thirtyAgo)
          : Promise.resolve({ data: [] }),
        allIds.length > 0
          ? supabase.from('saved_properties').select('property_id')
              .in('property_id', allIds).gte('saved_at', thirtyAgo)
          : Promise.resolve({ data: [] }),
      ]);

      // Count per property
      const viewCounts: Record<string, number> = {};
      const saveCounts: Record<string, number> = {};
      for (const v of (allViewsRes.data || [])) {
        viewCounts[v.property_id] = (viewCounts[v.property_id] || 0) + 1;
      }
      for (const s of (allSavesRes.data || [])) {
        saveCounts[s.property_id] = (saveCounts[s.property_id] || 0) + 1;
      }

      // Fetch owner subscriptions for all listings
      const ownerIds = [...new Set(allListings.map(l => l.owner_id || l.agent_id).filter(Boolean))];
      const ownerSubMap: Record<string, string> = {};
      if (ownerIds.length > 0) {
        const { data: ownerProfiles } = await supabase
          .from('profiles')
          .select('id, subscription_type')
          .in('id', ownerIds);
        for (const op of (ownerProfiles || [])) {
          ownerSubMap[op.id] = op.subscription_type || 'free';
        }
      }

      // Calculate ranking scores
      const rankedListings = allListings.map(l => {
        const engScore = Math.min(100, ((viewCounts[l.id] || 0) + (saveCounts[l.id] || 0) * 3));
        const healthScore = Number(l.investment_score) || 0;
        const lid = l.owner_id || l.agent_id || '';
        const lSub = ownerSubMap[lid] || 'free';
        const score = calculateRankingScore(
          {
            investment_score: Number(l.investment_score) || 0,
            listing_health_score: healthScore,
            engagement_score: engScore,
            demand_heat_score: demandHeatScore,
            created_at: l.created_at,
          },
          lSub
        );
        return { id: l.id, ranking_score: score, subscription: lSub };
      });

      // Step 5: Sort descending
      rankedListings.sort((a, b) => b.ranking_score - a.ranking_score);

      // Step 6: Determine position
      const currentRankPosition = rankedListings.findIndex(l => l.id === property_id) + 1;
      const visibilityPercentile = totalListings > 0
        ? Math.round(((totalListings - currentRankPosition) / totalListings) * 10000) / 100
        : 0;

      // Step 7: Impressions & views last 7 days
      const [impressionsRes, viewsRes] = await Promise.all([
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('activity_type', 'impression').eq('property_id', property_id).gte('created_at', sevenAgo),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('activity_type', 'view').eq('property_id', property_id).gte('created_at', sevenAgo),
      ]);

      const impressions7d = impressionsRes.count || 0;
      const views7d = viewsRes.count || 0;

      // Step 8: Engagement rate
      const engagementRate = impressions7d > 0
        ? Math.round((views7d / impressions7d) * 10000) / 100
        : 0;

      // Step 9: Subscription impact
      const subscriptionImpact = ownerSubscription === 'enterprise'
        ? 'Enterprise boost applied (+25)'
        : ownerSubscription === 'pro'
          ? 'Pro boost applied (+15)'
          : 'No subscription boost';

      // Step 10: Upgrade potential
      let upgradePotentialScore = 0;
      let simulatedRank = currentRankPosition;
      if (ownerSubscription === 'free') {
        // Simulate with 'pro' boost
        const currentEntry = rankedListings.find(l => l.id === property_id);
        if (currentEntry) {
          const engScore = Math.min(100, ((viewCounts[property_id] || 0) + (saveCounts[property_id] || 0) * 3));
          const healthScore = Number(prop.investment_score) || 0;
          const simulatedScore = calculateRankingScore(
            {
              investment_score: Number(prop.investment_score) || 0,
              listing_health_score: healthScore,
              engagement_score: engScore,
              demand_heat_score: demandHeatScore,
              created_at: prop.created_at,
            },
            'pro'
          );
          // Count how many listings would still rank above
          simulatedRank = rankedListings.filter(l => l.id !== property_id && l.ranking_score > simulatedScore).length + 1;
          upgradePotentialScore = Math.max(0, currentRankPosition - simulatedRank);
        }
      }

      console.log(`Visibility analytics for ${property_id}: rank ${currentRankPosition}/${totalListings}, percentile ${visibilityPercentile}%`);

      return new Response(JSON.stringify({
        mode: 'listing_visibility_analytics',
        data: {
          property_id,
          city: prop.city,
          current_rank_position: currentRankPosition,
          total_listings: totalListings,
          visibility_percentile: visibilityPercentile,
          last_7_days: {
            impressions: impressions7d,
            views: views7d,
            engagement_rate: engagementRate,
          },
          subscription: {
            current: ownerSubscription,
            impact: subscriptionImpact,
          },
          upgrade_potential: {
            potential_rank_improvement: upgradePotentialScore,
            simulated_rank_with_pro: simulatedRank,
            current_rank: currentRankPosition,
          },
          ranking_score: rankedListings.find(l => l.id === property_id)?.ranking_score || 0,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // MODE 12 ─ AI Performance Summary
    // ═══════════════════════════════════════════════════════════════
    if (mode === 'ai_performance_summary') {
      const serviceClient = createClient(supabaseUrl, serviceKey);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // Get all properties with their AI scores
      const { data: properties, error: propErr } = await serviceClient
        .from('properties')
        .select('id, title, city, ai_score, views_count, saves_count, contact_count, created_at')
        .not('ai_score', 'is', null);

      if (propErr) throw propErr;
      const props = properties || [];

      // Define score buckets
      const bucketRanges = [
        { label: '0-20', min: 0, max: 20 },
        { label: '21-40', min: 21, max: 40 },
        { label: '41-60', min: 41, max: 60 },
        { label: '61-80', min: 61, max: 80 },
        { label: '81-100', min: 81, max: 100 },
      ];

      const buckets = bucketRanges.map(range => {
        const inBucket = props.filter(p => (p.ai_score || 0) >= range.min && (p.ai_score || 0) <= range.max);
        const impressions = inBucket.reduce((s, p) => s + (p.views_count || 0), 0);
        const clicks = Math.round(impressions * (0.02 + (range.min / 100) * 0.08)); // simulated CTR correlation
        const saves = inBucket.reduce((s, p) => s + (p.saves_count || 0), 0);
        const contacts = inBucket.reduce((s, p) => s + (p.contact_count || 0), 0);

        return {
          score_range: range.label,
          property_count: inBucket.length,
          impressions,
          clicks,
          saves,
          contacts,
          ctr_percent: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
          save_rate_percent: impressions > 0 ? Math.round((saves / impressions) * 10000) / 100 : 0,
          contact_rate_percent: impressions > 0 ? Math.round((contacts / impressions) * 10000) / 100 : 0,
        };
      });

      const totalProps = props.length;
      const avgScore = totalProps > 0 ? Math.round(props.reduce((s, p) => s + (p.ai_score || 0), 0) / totalProps) : 0;
      const totalImpressions = buckets.reduce((s, b) => s + b.impressions, 0);
      const totalClicks = buckets.reduce((s, b) => s + b.clicks, 0);
      const totalSaves = buckets.reduce((s, b) => s + b.saves, 0);
      const totalContacts = buckets.reduce((s, b) => s + b.contacts, 0);

      // Overall health rating
      let overallHealth = 'Poor';
      if (avgScore >= 80) overallHealth = 'Excellent';
      else if (avgScore >= 60) overallHealth = 'Good';
      else if (avgScore >= 40) overallHealth = 'Fair';

      return new Response(JSON.stringify({
        mode: 'ai_performance_summary',
        buckets,
        summary: {
          total_properties: totalProps,
          avg_ai_score: avgScore,
          total_impressions: totalImpressions,
          total_clicks: totalClicks,
          total_saves: totalSaves,
          total_contacts: totalContacts,
          overall_ctr: totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 10000) / 100 : 0,
          overall_save_rate: totalImpressions > 0 ? Math.round((totalSaves / totalImpressions) * 10000) / 100 : 0,
          overall_contact_rate: totalImpressions > 0 ? Math.round((totalContacts / totalImpressions) * 10000) / 100 : 0,
        },
        overall_health: overallHealth,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ══════════════════════════════════════════════════════════════════
    // ── MODE: auto_tune_ai_weights ──
    // ══════════════════════════════════════════════════════════════════
    if (mode === 'auto_tune_ai_weights') {
      const FACTORS = ['location', 'price', 'feature', 'investment', 'popularity', 'collaborative'] as const;
      const CONVERSION_TYPES = ['save', 'inquiry', 'contact'];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Read current weights
      const { data: weightRows } = await supabase
        .from('ai_model_weights')
        .select('factor, weight, updated_at');

      const oldWeights: Record<string, number> = {};
      let lastTuned: string | null = null;
      for (const row of weightRows || []) {
        oldWeights[row.factor] = row.weight;
        if (!lastTuned || row.updated_at > lastTuned) lastTuned = row.updated_at;
      }

      // Ensure all factors exist
      for (const f of FACTORS) {
        if (!(f in oldWeights)) oldWeights[f] = 10;
      }

      // 2. Query recommendation events (last 30 days)
      const { data: events, error: eventsErr } = await supabase
        .from('ai_recommendation_events')
        .select('event_type, match_factors, ai_match_score')
        .gte('created_at', thirtyDaysAgo)
        .limit(1000);

      const allEvents = events || [];
      const totalEvents = allEvents.length;

      // 3. Calculate conversion correlations
      const correlations: Record<string, number> = {};

      for (const factor of FACTORS) {
        let conversionsWithFactor = 0, totalWithFactor = 0;
        let conversionsWithout = 0, totalWithout = 0;

        for (const evt of allEvents) {
          const mf = (evt.match_factors || {}) as Record<string, unknown>;
          const factorValue = mf[factor];
          const hasFactor = factorValue === true || (typeof factorValue === 'number' && factorValue > 0.5);
          const isConversion = CONVERSION_TYPES.includes(evt.event_type);

          if (hasFactor) {
            totalWithFactor++;
            if (isConversion) conversionsWithFactor++;
          } else {
            totalWithout++;
            if (isConversion) conversionsWithout++;
          }
        }

        const rateWith = totalWithFactor > 0 ? conversionsWithFactor / totalWithFactor : 0;
        const rateWithout = totalWithout > 0 ? conversionsWithout / totalWithout : 0;
        correlations[factor] = rateWith - rateWithout;
      }

      // 4. Data sufficiency check
      const dataSufficiency = totalEvents >= 500 ? 'sufficient' : totalEvents >= 100 ? 'moderate' : 'insufficient';
      const confidence = totalEvents >= 500 ? 'high' : totalEvents >= 100 ? 'medium' : 'low';

      // 5. Compute adjustments
      const avgCorrelation = Object.values(correlations).reduce((a, b) => a + b, 0) / FACTORS.length;
      const SCALE = 30; // Scale factor to amplify small correlation diffs
      const adjustments: Record<string, number> = {};
      const newWeights: Record<string, number> = {};

      for (const f of FACTORS) {
        const rawAdj = Math.round((correlations[f] - avgCorrelation) * SCALE);
        adjustments[f] = Math.max(-3, Math.min(3, rawAdj));
        newWeights[f] = oldWeights[f] + adjustments[f];
      }

      // 6. Enforce minimum 5
      for (const f of FACTORS) {
        if (newWeights[f] < 5) {
          const deficit = 5 - newWeights[f];
          newWeights[f] = 5;
          // Redistribute deficit from highest
          const sorted = FACTORS.filter(x => x !== f).sort((a, b) => newWeights[b] - newWeights[a]);
          for (let i = 0; i < deficit && i < sorted.length; i++) {
            if (newWeights[sorted[i % sorted.length]] > 5) {
              newWeights[sorted[i % sorted.length]]--;
            }
          }
        }
      }

      // 7. Normalize to 100
      let sum = Object.values(newWeights).reduce((a, b) => a + b, 0);
      let diff = 100 - sum;
      if (diff !== 0) {
        const sortedByWeight = [...FACTORS].sort((a, b) => newWeights[b] - newWeights[a]);
        let idx = 0;
        while (diff !== 0) {
          const step = diff > 0 ? 1 : -1;
          if (newWeights[sortedByWeight[idx]] + step >= 5) {
            newWeights[sortedByWeight[idx]] += step;
            diff -= step;
          }
          idx = (idx + 1) % FACTORS.length;
        }
      }

      // Recalculate actual adjustments after normalization
      for (const f of FACTORS) {
        adjustments[f] = newWeights[f] - oldWeights[f];
      }

      // 8. Only write if data is at least moderate
      if (dataSufficiency !== 'insufficient') {
        for (const f of FACTORS) {
          await supabase
            .from('ai_model_weights')
            .update({ weight: newWeights[f], updated_at: new Date().toISOString(), updated_by: 'auto_tune' })
            .eq('factor', f);
        }

        // Log weight history for tracking
        await supabase.from('ai_weight_history').insert({
          weights: newWeights,
          trigger_type: 'auto_tune',
          total_events_analyzed: totalEvents,
          data_quality: dataSufficiency,
          notes: `Correlations: ${JSON.stringify(correlations)}`,
        });
      }

      return new Response(JSON.stringify({
        mode: 'auto_tune_ai_weights',
        old_weights: oldWeights,
        new_weights: newWeights,
        adjustments,
        model_health: {
          total_events: totalEvents,
          data_sufficiency: dataSufficiency,
          confidence,
          correlations,
          last_tuned: lastTuned,
          weights_updated: dataSufficiency !== 'insufficient',
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: property_intelligence
    // ═══════════════════════════════════════════
    if (mode === 'property_intelligence') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: prop, error: propErr } = await supabase
        .from('properties')
        .select('id, price, city, property_type, land_area_sqm, building_area_sqm, investment_score, status, created_at, predicted_days_to_sell')
        .eq('id', property_id)
        .single();

      if (propErr || !prop) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const price = Number(prop.price) || 0;
      const ba = Number(prop.building_area_sqm) || 0;
      const la = Number(prop.land_area_sqm) || 0;
      const primaryArea = ba > 0 ? ba : la;
      const areaCol = ba > 0 ? 'building_area_sqm' : 'land_area_sqm';

      // FMV estimate via comparables
      let priceEstimate = price;
      if (prop.city && primaryArea > 0) {
        const minA = primaryArea * 0.7;
        const maxA = primaryArea * 1.3;
        const { data: comps } = await supabase
          .from('properties')
          .select('price, building_area_sqm, land_area_sqm')
          .eq('city', prop.city)
          .eq('property_type', prop.property_type)
          .eq('status', 'published')
          .not('price', 'is', null)
          .gt('price', 0)
          .gte(areaCol, minA)
          .lte(areaCol, maxA)
          .neq('id', property_id)
          .limit(50);

        const valid = (comps || []).filter(c => Number(c.price) > 0 && Number(c[areaCol]) > 0);
        if (valid.length >= 3) {
          const ppm = valid.map(c => Number(c.price) / Number(c[areaCol])).sort((a, b) => a - b);
          const mid = Math.floor(ppm.length / 2);
          const median = ppm.length % 2 !== 0 ? ppm[mid] : (ppm[mid - 1] + ppm[mid]) / 2;
          priceEstimate = Math.round(median * primaryArea);
        }
      }

      // Demand heat (simplified inline)
      let demandHeatScore = 50;
      if (prop.city) {
        const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        const [listingsRes, viewsRes] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true }).eq('city', prop.city).eq('status', 'published'),
          supabase.from('property_analytics').select('views').eq('property_id', property_id).gte('date', thirtyAgo.split('T')[0]),
        ]);
        const listings = listingsRes.count || 1;
        const views = (viewsRes.data || []).reduce((s: number, r: any) => s + (r.views || 0), 0);
        const vpl = views / listings;
        demandHeatScore = Math.min(100, Math.max(0, Math.round(vpl * 2 + (listings > 30 ? 20 : listings > 10 ? 10 : 0))));
      }

      // Popularity from analytics
      const thirtyAgoDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const { data: analytics } = await supabase
        .from('property_analytics')
        .select('views, saves, contacts')
        .eq('property_id', property_id)
        .gte('date', thirtyAgoDate);

      const totalViews = (analytics || []).reduce((s: number, r: any) => s + (r.views || 0), 0);
      const totalSaves = (analytics || []).reduce((s: number, r: any) => s + (r.saves || 0), 0);
      const totalContacts = (analytics || []).reduce((s: number, r: any) => s + (r.contacts || 0), 0);
      const popularityScore = Math.min(100, Math.round(totalViews * 0.4 + totalSaves * 3 + totalContacts * 10));

      return new Response(JSON.stringify({
        mode: 'property_intelligence',
        data: {
          price_estimate: priceEstimate,
          investment_score: prop.investment_score || 0,
          demand_heat_score: demandHeatScore,
          expected_days_on_market: prop.predicted_days_to_sell || 60,
          popularity_score: popularityScore,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: buyer_profile
    // ═══════════════════════════════════════════
    if (mode === 'buyer_profile') {
      const targetUserId = body.user_id || userId;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: 'user_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString();

      // Fetch saved properties and viewed properties
      const [savedRes, viewedRes, inquiryRes, profileRes] = await Promise.all([
        supabase.from('saved_properties').select('property_id').eq('user_id', targetUserId),
        supabase.from('activity_logs').select('metadata').eq('user_id', targetUserId).eq('activity_type', 'view').gte('created_at', sixMonthsAgo).limit(200),
        supabase.from('inquiries').select('property_id').eq('user_id', targetUserId).gte('created_at', sixMonthsAgo),
        supabase.from('profiles').select('subscription_type').eq('id', targetUserId).single(),
      ]);

      const propIds = new Set<string>();
      (savedRes.data || []).forEach((s: any) => propIds.add(s.property_id));
      (viewedRes.data || []).forEach((v: any) => { if (v.metadata?.property_id) propIds.add(v.metadata.property_id); });
      (inquiryRes.data || []).forEach((i: any) => propIds.add(i.property_id));

      let preferredCity = 'Unknown';
      let avgBudget = 0;
      let propertyTypePref = 'Unknown';
      let investmentAffinity = 'low';

      if (propIds.size > 0) {
        const { data: props } = await supabase
          .from('properties')
          .select('city, price, property_type, investment_score')
          .in('id', Array.from(propIds))
          .limit(100);

        if (props && props.length > 0) {
          // City frequency
          const cityFreq: Record<string, number> = {};
          const typeFreq: Record<string, number> = {};
          let totalPrice = 0; let priceCount = 0;
          let totalInvScore = 0; let invCount = 0;

          props.forEach((p: any) => {
            if (p.city) cityFreq[p.city] = (cityFreq[p.city] || 0) + 1;
            if (p.property_type) typeFreq[p.property_type] = (typeFreq[p.property_type] || 0) + 1;
            if (p.price && Number(p.price) > 0) { totalPrice += Number(p.price); priceCount++; }
            if (p.investment_score != null) { totalInvScore += Number(p.investment_score); invCount++; }
          });

          preferredCity = Object.entries(cityFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
          propertyTypePref = Object.entries(typeFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
          avgBudget = priceCount > 0 ? Math.round(totalPrice / priceCount) : 0;
          const avgInv = invCount > 0 ? totalInvScore / invCount : 0;
          investmentAffinity = avgInv >= 70 ? 'high' : avgInv >= 40 ? 'medium' : 'low';
        }
      }

      // Buyer type classification
      const savedCount = savedRes.data?.length || 0;
      const inquiryCount = inquiryRes.data?.length || 0;
      let buyerType = 'Browser';
      if (inquiryCount >= 3 && savedCount >= 5) buyerType = 'Buyer';
      else if (savedCount >= 2 || inquiryCount >= 1) buyerType = 'Considering';

      return new Response(JSON.stringify({
        mode: 'buyer_profile',
        data: {
          buyer_type: buyerType,
          preferred_city: preferredCity,
          avg_budget: avgBudget,
          property_type_preference: propertyTypePref,
          investment_affinity: investmentAffinity,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: market_trend
    // ═══════════════════════════════════════════
    if (mode === 'market_trend') {
      const city = body.city;
      if (!city) {
        return new Response(JSON.stringify({ error: 'city is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const now = Date.now();
      const thirtyAgo = new Date(now - 30 * 86400000).toISOString();
      const sixtyAgo = new Date(now - 60 * 86400000).toISOString();

      const [recentListings, prevListings, recentPrices, prevPrices, trendData] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('city', city).gte('created_at', thirtyAgo),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('city', city).gte('created_at', sixtyAgo).lt('created_at', thirtyAgo),
        supabase.from('properties').select('price').eq('city', city).eq('status', 'published').not('price', 'is', null).gt('price', 0).gte('created_at', thirtyAgo),
        supabase.from('properties').select('price').eq('city', city).eq('status', 'published').not('price', 'is', null).gt('price', 0).gte('created_at', sixtyAgo).lt('created_at', thirtyAgo),
        supabase.from('market_trends').select('*').eq('city', city).order('month', { ascending: false }).limit(6),
      ]);

      const recentCount = recentListings.count || 0;
      const prevCount = prevListings.count || 1;
      const listingGrowthRate = Math.round(((recentCount - prevCount) / Math.max(prevCount, 1)) * 100);

      const rPrices = (recentPrices.data || []).map((p: any) => Number(p.price)).filter((p: number) => p > 0);
      const pPrices = (prevPrices.data || []).map((p: any) => Number(p.price)).filter((p: number) => p > 0);
      const avgRecent = rPrices.length > 0 ? rPrices.reduce((a: number, b: number) => a + b, 0) / rPrices.length : 0;
      const avgPrev = pPrices.length > 0 ? pPrices.reduce((a: number, b: number) => a + b, 0) / pPrices.length : 0;
      const priceGrowthRate = avgPrev > 0 ? Math.round(((avgRecent - avgPrev) / avgPrev) * 100 * 100) / 100 : 0;

      let demandTrend = 'stable';
      if (priceGrowthRate > 3 && listingGrowthRate > 10) demandTrend = 'rising strongly';
      else if (priceGrowthRate > 1) demandTrend = 'rising';
      else if (priceGrowthRate < -3) demandTrend = 'declining';

      let investmentOutlook = 'neutral';
      if (demandTrend.includes('rising') && listingGrowthRate > 0) investmentOutlook = 'bullish';
      else if (demandTrend === 'declining') investmentOutlook = 'bearish';

      return new Response(JSON.stringify({
        mode: 'market_trend',
        data: {
          demand_trend: demandTrend,
          price_growth_rate: priceGrowthRate,
          listing_growth_rate: listingGrowthRate,
          investment_outlook: investmentOutlook,
          recent_listings: recentCount,
          avg_price_recent: Math.round(avgRecent),
          historical_trends: (trendData.data || []).map((t: any) => ({
            month: t.month,
            avg_price: t.avg_price,
            total_listings: t.total_listings,
          })),
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: investment_projection
    // ═══════════════════════════════════════════
    if (mode === 'investment_projection') {
      const propertyPrice = Number(body.property_price) || 0;
      const rentalEstimate = Number(body.rental_estimate) || 0;
      const appreciationRate = Number(body.appreciation_rate) || 5;

      if (propertyPrice <= 0) {
        return new Response(JSON.stringify({ error: 'property_price is required and must be positive' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const annualRent = rentalEstimate * 12;
      const maintenancePct = 0.01;
      const managementPct = 0.10;
      const exitCostPct = 0.05;
      const appRate = appreciationRate / 100;

      const computeRoi = (years: number) => {
        const futureValue = propertyPrice * Math.pow(1 + appRate, years);
        const totalRent = Array.from({ length: years }, (_, i) =>
          annualRent * Math.pow(1 + appRate * 0.3, i)
        ).reduce((s, v) => s + v, 0);
        const totalMaintenance = propertyPrice * maintenancePct * years;
        const totalManagement = totalRent * managementPct;
        const exitCosts = futureValue * exitCostPct;
        const netProfit = (futureValue - propertyPrice) + totalRent - totalMaintenance - totalManagement - exitCosts;
        return Math.round((netProfit / propertyPrice) * 100 * 100) / 100;
      };

      const roi5 = computeRoi(5);
      const roi10 = computeRoi(10);

      const grossYield = propertyPrice > 0 ? (annualRent / propertyPrice) * 100 : 0;
      let riskLevel = 'medium';
      if (grossYield >= 8 && appreciationRate >= 5) riskLevel = 'low';
      else if (grossYield < 3 || appreciationRate < 2) riskLevel = 'high';

      return new Response(JSON.stringify({
        mode: 'investment_projection',
        data: {
          roi_5yr: roi5,
          roi_10yr: roi10,
          risk_level: riskLevel,
          gross_yield_pct: Math.round(grossYield * 100) / 100,
          annual_rental_income: annualRent,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: lead_score
    // ═══════════════════════════════════════════
    if (mode === 'lead_score') {
      const targetUserId = body.user_id || userId;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: 'user_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const sevenAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const [viewsRes, savesRes, inquiriesRes, recentViewsRes] = await Promise.all([
        supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('user_id', targetUserId).eq('activity_type', 'view').gte('created_at', thirtyAgo),
        supabase.from('saved_properties').select('id', { count: 'exact', head: true }).eq('user_id', targetUserId).gte('saved_at', thirtyAgo),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('user_id', targetUserId).gte('created_at', thirtyAgo),
        supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('user_id', targetUserId).eq('activity_type', 'view').gte('created_at', sevenAgo),
      ]);

      const views30 = viewsRes.count || 0;
      const saves30 = savesRes.count || 0;
      const inquiries30 = inquiriesRes.count || 0;
      const recentViews = recentViewsRes.count || 0;

      // Scoring: views (max 20) + saves (max 25) + inquiries (max 35) + recency (max 20)
      const viewScore = Math.min(20, views30 * 0.5);
      const saveScore = Math.min(25, saves30 * 5);
      const inquiryScore = Math.min(35, inquiries30 * 10);
      const recencyScore = Math.min(20, recentViews * 2);
      const leadScore = Math.round(viewScore + saveScore + inquiryScore + recencyScore);

      let intentLevel: string;
      if (inquiries30 >= 3 && saves30 >= 5) intentLevel = 'high';
      else if (saves30 >= 2 || inquiries30 >= 1) intentLevel = 'medium';
      else intentLevel = 'low';

      let recommendedFollowup: string;
      if (intentLevel === 'high') recommendedFollowup = 'Immediate outreach — schedule property viewing within 24h';
      else if (intentLevel === 'medium') recommendedFollowup = 'Send curated listing recommendations within 3 days';
      else recommendedFollowup = 'Add to nurture sequence — monthly market updates';

      return new Response(JSON.stringify({
        mode: 'lead_score',
        data: {
          lead_score: leadScore,
          intent_level: intentLevel,
          recommended_followup: recommendedFollowup,
          signals: {
            views_30d: views30,
            saves_30d: saves30,
            inquiries_30d: inquiries30,
            recent_views_7d: recentViews,
          },
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: ai_brain — Unified AI Intelligence
    // Optimized: max parallel queries, no duplicates, <400ms target
    // ═══════════════════════════════════════════
    if (mode === 'ai_brain') {
      const t0 = Date.now();
      const targetUserId = body.user_id || userId;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: 'user_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const targetPropertyId = body.property_id || null;
      const targetCity = body.city || null;
      const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const thirtyAgoDate = thirtyAgo.split('T')[0];
      const sixtyAgo = new Date(Date.now() - 60 * 86400000).toISOString();

      // ══ PHASE 1: Parallel fan-out — intent profile + AI cache + property (if needed) ══
      const phase1: Promise<any>[] = [
        // [0] Intent profile (cached)
        supabase.from('user_intent_profiles').select('*').eq('user_id', targetUserId).maybeSingle(),
        // [1] AI recommendation cache
        supabase.from('user_ai_cache').select('ranked_property_ids, created_at')
          .eq('user_id', targetUserId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        // [2] Activity counts for intent scoring (30d views)
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId).eq('activity_type', 'view').gte('created_at', thirtyAgo),
        // [3] Saves count 30d
        supabase.from('saved_properties').select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId).gte('saved_at', thirtyAgo),
        // [4] Inquiries count 30d
        supabase.from('inquiries').select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId).gte('created_at', thirtyAgo),
      ];

      // [5] Property fetch (conditional)
      if (targetPropertyId) {
        phase1.push(
          supabase.from('properties')
            .select('id, title, price, city, property_type, investment_score, predicted_days_to_sell, building_area_sqm, land_area_sqm, listing_type')
            .eq('id', targetPropertyId).single()
        );
      }

      const p1 = await Promise.all(phase1);
      const intentRow = p1[0]?.data;
      const aiCacheRow = p1[1]?.data;
      const views30 = p1[2]?.count || 0;
      const saves30 = p1[3]?.count || 0;
      const inquiries30 = p1[4]?.count || 0;
      const propertyRow = targetPropertyId ? p1[5]?.data : null;

      // ══ Compute intent score (0-100) ══
      const intentScore = Math.min(100, Math.round(
        Math.min(20, views30 * 0.5) +
        Math.min(25, saves30 * 5) +
        Math.min(35, inquiries30 * 10) +
        (views30 > 0 ? 10 : 0) + // recency signal
        (saves30 > 0 ? 5 : 0) +
        (inquiries30 > 0 ? 5 : 0)
      ));

      let intentLevel = 'low';
      if (inquiries30 >= 3 && saves30 >= 5) intentLevel = 'high';
      else if (saves30 >= 2 || inquiries30 >= 1) intentLevel = 'medium';

      // Use cached intent if fresh (<1h), otherwise we already have counts
      const intentFresh = intentRow?.updated_at &&
        (Date.now() - new Date(intentRow.updated_at).getTime()) < 3600000;

      if (!intentFresh) {
        // Fire-and-forget upsert (don't await — saves ~50ms)
        supabase.from('user_intent_profiles').upsert({
          user_id: targetUserId,
          intent_level: intentLevel,
          buyer_type: intentLevel === 'high' ? 'Buyer' : intentLevel === 'medium' ? 'Considering' : 'Browser',
          views_30d: views30,
          saves_30d: saves30,
          inquiries_30d: inquiries30,
          last_active_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' }).then(() => {});
      }

      // ══ PHASE 2: Parallel fan-out — recommendations + market + property analysis ══
      // Determine city for market insight
      const demandCity = targetCity || intentRow?.preferred_city || propertyRow?.city || null;

      const phase2: Promise<any>[] = [];
      const phase2Keys: string[] = [];

      // [A] Recommendation property details from AI cache
      let topRecIds: string[] = [];
      if (aiCacheRow?.ranked_property_ids) {
        const ranked = Array.isArray(aiCacheRow.ranked_property_ids) ? aiCacheRow.ranked_property_ids : [];
        topRecIds = ranked.slice(0, 10).map((r: any) => typeof r === 'string' ? r : r?.id || r?.property_id).filter(Boolean);
        if (topRecIds.length > 0) {
          phase2.push(
            supabase.from('properties')
              .select('id, title, city, price, property_type, cover_image, investment_score')
              .in('id', topRecIds).eq('status', 'published').limit(10)
          );
          phase2Keys.push('recs');
        }
      }

      // [B] Market demand — city listings + recent prices
      if (demandCity) {
        phase2.push(
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', demandCity).eq('status', 'published')
        );
        phase2Keys.push('cityListings');

        phase2.push(
          supabase.from('properties').select('id', { count: 'exact', head: true })
            .eq('city', demandCity).gte('created_at', thirtyAgo)
        );
        phase2Keys.push('cityNew');

        // Price trend: recent vs previous 30d
        phase2.push(
          supabase.from('properties').select('price')
            .eq('city', demandCity).eq('status', 'published').not('price', 'is', null).gt('price', 0)
            .gte('created_at', thirtyAgo).limit(200)
        );
        phase2Keys.push('priceRecent');

        phase2.push(
          supabase.from('properties').select('price')
            .eq('city', demandCity).eq('status', 'published').not('price', 'is', null).gt('price', 0)
            .gte('created_at', sixtyAgo).lt('created_at', thirtyAgo).limit(200)
        );
        phase2Keys.push('pricePrev');
      }

      // [C] Property analytics + comparables (if property_id)
      if (propertyRow) {
        phase2.push(
          supabase.from('property_analytics')
            .select('views, saves, contacts')
            .eq('property_id', targetPropertyId)
            .gte('date', thirtyAgoDate)
        );
        phase2Keys.push('propAnalytics');

        // Comparables for pricing intelligence
        const ba = Number(propertyRow.building_area_sqm) || 0;
        const la = Number(propertyRow.land_area_sqm) || 0;
        const primaryArea = ba > 0 ? ba : la;
        const areaCol = ba > 0 ? 'building_area_sqm' : 'land_area_sqm';

        if (primaryArea > 0 && propertyRow.city) {
          phase2.push(
            supabase.from('properties')
              .select('price, building_area_sqm, land_area_sqm')
              .eq('city', propertyRow.city).eq('property_type', propertyRow.property_type)
              .eq('status', 'published').not('price', 'is', null).gt('price', 0)
              .gte(areaCol, primaryArea * 0.7).lte(areaCol, primaryArea * 1.3)
              .neq('id', targetPropertyId).limit(50)
          );
          phase2Keys.push('comps');
        }
      }

      const p2 = await Promise.all(phase2);
      const p2Map: Record<string, any> = {};
      phase2Keys.forEach((k, i) => { p2Map[k] = p2[i]; });

      // ══ BUILD: recommendations ══
      let recommendations: any[] = [];
      if (p2Map.recs?.data) {
        const ranked = Array.isArray(aiCacheRow!.ranked_property_ids) ? aiCacheRow!.ranked_property_ids : [];
        recommendations = (p2Map.recs.data || []).map((p: any) => {
          const idx = topRecIds.indexOf(p.id);
          return { ...p, ai_rank: idx + 1, match_score: Math.max(0, 100 - idx * 5) };
        }).sort((a: any, b: any) => a.ai_rank - b.ai_rank);
      }

      // ══ BUILD: market_insight ══
      let marketInsight: any = null;
      if (demandCity && p2Map.cityListings) {
        const listingCount = p2Map.cityListings.count || 1;
        const newListings = p2Map.cityNew?.count || 0;

        // Price trend
        const rPrices = (p2Map.priceRecent?.data || []).map((p: any) => Number(p.price)).filter((n: number) => n > 0);
        const pPrices = (p2Map.pricePrev?.data || []).map((p: any) => Number(p.price)).filter((n: number) => n > 0);
        const avgRecent = rPrices.length > 0 ? rPrices.reduce((a: number, b: number) => a + b, 0) / rPrices.length : 0;
        const avgPrev = pPrices.length > 0 ? pPrices.reduce((a: number, b: number) => a + b, 0) / pPrices.length : 0;
        const priceTrendPct = avgPrev > 0 ? ((avgRecent - avgPrev) / avgPrev) * 100 : 0;

        // Heat score (streamlined — no extra view queries, use listing velocity + price trend)
        const velocityScore = newListings >= 20 ? 30 : newListings >= 10 ? 20 : newListings >= 5 ? 15 : 8;
        const priceScore = priceTrendPct >= 5 ? 35 : priceTrendPct >= 2 ? 25 : priceTrendPct >= 0 ? 15 : 5;
        const densityScore = listingCount >= 100 ? 35 : listingCount >= 50 ? 25 : listingCount >= 20 ? 15 : 5;
        const heatScore = Math.min(100, Math.max(0, velocityScore + priceScore + densityScore));

        let trend = 'stable';
        if (priceTrendPct > 3) trend = 'rising';
        else if (priceTrendPct < -3) trend = 'declining';

        marketInsight = {
          city: demandCity,
          heat_score: heatScore,
          trend,
          price_growth_pct: Math.round(priceTrendPct * 100) / 100,
          total_listings: listingCount,
          new_listings_30d: newListings,
        };
      }

      // ══ BUILD: property_analysis ══
      let propertyAnalysis: any = null;
      if (propertyRow) {
        const price = Number(propertyRow.price) || 0;
        const invScore = propertyRow.investment_score || 0;

        // Pricing intelligence from comparables
        let pricePosition = 'unknown';
        let fmv = price;
        if (p2Map.comps?.data) {
          const ba = Number(propertyRow.building_area_sqm) || 0;
          const la = Number(propertyRow.land_area_sqm) || 0;
          const primaryArea = ba > 0 ? ba : la;
          const areaCol = ba > 0 ? 'building_area_sqm' : 'land_area_sqm';

          const valid = (p2Map.comps.data || []).filter((c: any) => Number(c.price) > 0 && Number(c[areaCol]) > 0);
          if (valid.length >= 2) {
            const ppm = valid.map((c: any) => Number(c.price) / Number(c[areaCol])).sort((a: number, b: number) => a - b);
            const mid = Math.floor(ppm.length / 2);
            const median = ppm.length % 2 !== 0 ? ppm[mid] : (ppm[mid - 1] + ppm[mid]) / 2;

            // Demand multiplier
            const cc = valid.length;
            const dm = cc >= 30 ? 1.10 : cc >= 15 ? 1.05 : cc >= 5 ? 1.0 : 0.95;
            fmv = Math.round(median * primaryArea * dm);

            const ratio = price > 0 ? price / fmv : 0;
            pricePosition = ratio > 1.15 ? 'overpriced' : ratio < 0.85 ? 'underpriced' : 'fair';
          }
        }

        // Investment rating
        let investmentRating = 'hold';
        if (invScore >= 75 && pricePosition !== 'overpriced') investmentRating = 'strong buy';
        else if (invScore >= 60) investmentRating = 'buy';
        else if (invScore >= 40) investmentRating = 'hold';
        else investmentRating = 'pass';

        // Analytics
        const pViews = (p2Map.propAnalytics?.data || []).reduce((s: number, r: any) => s + (r.views || 0), 0);
        const pSaves = (p2Map.propAnalytics?.data || []).reduce((s: number, r: any) => s + (r.saves || 0), 0);
        const pContacts = (p2Map.propAnalytics?.data || []).reduce((s: number, r: any) => s + (r.contacts || 0), 0);

        propertyAnalysis = {
          price_position: pricePosition,
          fair_market_value: fmv,
          investment_rating: investmentRating,
          investment_score: invScore,
          expected_days_on_market: propertyRow.predicted_days_to_sell || 60,
          engagement: { views_30d: pViews, saves_30d: pSaves, contacts_30d: pContacts },
        };
      }

      const elapsed = Date.now() - t0;
      console.log(`[ai_brain] user=${targetUserId} intent=${intentLevel} recs=${recommendations.length} city=${demandCity} elapsed=${elapsed}ms`);

      return new Response(JSON.stringify({
        mode: 'ai_brain',
        data: {
          recommendations,
          buyer_profile: {
            intent_level: intentLevel,
            intent_score: intentScore,
          },
          market_insight: marketInsight,
          property_analysis: propertyAnalysis,
        },
        _meta: { elapsed_ms: elapsed },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: deal_detector — Identify undervalued listings
    // ═══════════════════════════════════════════
    if (mode === 'deal_detector') {
      const inputPropertyId = body.property_id;
      let listingPrice = Number(body.property_price) || 0;
      let marketValue = Number(body.estimated_market_value) || 0;
      let demandHeat = Number(body.demand_heat_score) || 0;
      let investmentScore = Number(body.investment_score) || 0;

      // If property_id provided, auto-fetch price + compute FMV from comparables
      if (inputPropertyId) {
        const { data: prop } = await supabase
          .from('properties')
          .select('price, city, property_type, building_area_sqm, land_area_sqm, investment_score')
          .eq('id', inputPropertyId)
          .single();

        if (!prop) {
          return new Response(JSON.stringify({ error: 'Property not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!listingPrice) listingPrice = Number(prop.price) || 0;
        if (!investmentScore) investmentScore = prop.investment_score || 0;

        // Auto-compute market value from comparables if not provided
        if (!marketValue && prop.city) {
          const ba = Number(prop.building_area_sqm) || 0;
          const la = Number(prop.land_area_sqm) || 0;
          const primaryArea = ba > 0 ? ba : la;
          const areaCol = ba > 0 ? 'building_area_sqm' : 'land_area_sqm';

          if (primaryArea > 0) {
            const { data: comps } = await supabase
              .from('properties')
              .select('price, building_area_sqm, land_area_sqm')
              .eq('city', prop.city)
              .eq('property_type', prop.property_type)
              .eq('status', 'published')
              .not('price', 'is', null).gt('price', 0)
              .gte(areaCol, primaryArea * 0.7)
              .lte(areaCol, primaryArea * 1.3)
              .neq('id', inputPropertyId)
              .limit(50);

            const valid = (comps || []).filter((c: any) => Number(c.price) > 0 && Number(c[areaCol]) > 0);
            if (valid.length >= 2) {
              const ppm = valid.map((c: any) => Number(c.price) / Number(c[areaCol])).sort((a: number, b: number) => a - b);
              const mid = Math.floor(ppm.length / 2);
              const median = ppm.length % 2 !== 0 ? ppm[mid] : (ppm[mid - 1] + ppm[mid]) / 2;
              const cc = valid.length;
              const dm = cc >= 30 ? 1.10 : cc >= 15 ? 1.05 : cc >= 5 ? 1.0 : 0.95;
              marketValue = Math.round(median * primaryArea * dm);
            }
          }
        }
      }

      if (listingPrice <= 0 || marketValue <= 0) {
        return new Response(JSON.stringify({ error: 'property_price and estimated_market_value (or property_id with comparables) are required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Deal score: positive = undervalued, negative = overpriced
      const dealScoreRaw = (marketValue - listingPrice) / marketValue;
      const dealScorePercent = Math.round(dealScoreRaw * 10000) / 100;

      let dealRating: string;
      if (dealScorePercent >= 10) dealRating = 'strong_deal';
      else if (dealScorePercent >= 5) dealRating = 'good_deal';
      else if (dealScorePercent >= -5) dealRating = 'fair_price';
      else dealRating = 'overpriced';

      // Generate explanation
      let explanation: string;
      const absPct = Math.abs(dealScorePercent).toFixed(1);
      if (dealRating === 'strong_deal') {
        explanation = `Listed ${absPct}% below market value — a strong deal.`;
        if (demandHeat >= 70) explanation += ' High demand makes this a time-sensitive opportunity.';
        if (investmentScore >= 70) explanation += ' Strong investment fundamentals.';
      } else if (dealRating === 'good_deal') {
        explanation = `Listed ${absPct}% below market value — a good deal worth considering.`;
        if (investmentScore >= 60) explanation += ' Solid investment potential.';
      } else if (dealRating === 'fair_price') {
        explanation = `Priced within ${absPct}% of market value — fair and competitive.`;
      } else {
        explanation = `Listed ${absPct}% above market value — overpriced relative to comparables.`;
        if (demandHeat < 50) explanation += ' Low demand may delay sale.';
      }

      return new Response(JSON.stringify({
        mode: 'deal_detector',
        data: {
          deal_score_percent: dealScorePercent,
          deal_rating: dealRating,
          explanation,
          listing_price: listingPrice,
          estimated_market_value: marketValue,
          demand_heat_score: demandHeat,
          investment_score: investmentScore,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: similar_properties — Vector similarity search
    // ═══════════════════════════════════════════
    if (mode === 'similar_properties') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch reference property
      const { data: ref, error: refErr } = await supabase
        .from('properties')
        .select('id, city, property_type, price, kt, km, land_area_sqm, building_area_sqm, has_pool, investment_score')
        .eq('id', property_id)
        .single();

      if (refErr || !ref) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const refPrice = Number(ref.price) || 0;
      const refBedrooms = Number(ref.kt) || 0;
      const refInvScore = Number(ref.investment_score) || 0;

      // Fetch candidates: same city OR same type, published, exclude self
      // Broaden to get enough candidates, then score in-memory
      const { data: candidates } = await supabase
        .from('properties')
        .select('id, city, property_type, price, kt, km, land_area_sqm, building_area_sqm, has_pool, investment_score, title, cover_image')
        .eq('status', 'published')
        .neq('id', property_id)
        .or(`city.eq.${ref.city},property_type.eq.${ref.property_type}`)
        .limit(200);

      if (!candidates || candidates.length === 0) {
        return new Response(JSON.stringify({
          mode: 'similar_properties',
          data: { similar_properties: [], reference_id: property_id },
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Score each candidate
      const scored = candidates.map((c: any) => {
        let score = 0;

        // City match → +25
        if (c.city && ref.city && c.city.toLowerCase() === ref.city.toLowerCase()) score += 25;

        // Property type match → +20
        if (c.property_type && ref.property_type && c.property_type === ref.property_type) score += 20;

        // Price within ±25% → +20 (linear scale)
        const cPrice = Number(c.price) || 0;
        if (refPrice > 0 && cPrice > 0) {
          const priceDiff = Math.abs(cPrice - refPrice) / refPrice;
          if (priceDiff <= 0.25) {
            score += Math.round(20 * (1 - priceDiff / 0.25));
          }
        }

        // Bedrooms ±1 → +10
        const cBed = Number(c.kt) || 0;
        const bedDiff = Math.abs(cBed - refBedrooms);
        if (bedDiff === 0) score += 10;
        else if (bedDiff === 1) score += 5;

        // Pool match → +10
        if (ref.has_pool != null && c.has_pool === ref.has_pool) score += 10;

        // Investment score similarity → +15 (linear scale, max diff 100)
        const cInv = Number(c.investment_score) || 0;
        const invDiff = Math.abs(cInv - refInvScore);
        score += Math.round(15 * Math.max(0, 1 - invDiff / 50));

        return {
          id: c.id,
          title: c.title,
          city: c.city,
          property_type: c.property_type,
          price: c.price,
          cover_image: c.cover_image,
          similarity_score: score,
        };
      });

      // Sort descending, limit 12
      scored.sort((a: any, b: any) => b.similarity_score - a.similarity_score);
      const topResults = scored.slice(0, 12);

      return new Response(JSON.stringify({
        mode: 'similar_properties',
        data: {
          similar_properties: topResults,
          reference_id: property_id,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: price_forecast — Predict property value over time
    // ═══════════════════════════════════════════
    if (mode === 'price_forecast') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const forecastYears = Math.max(1, Math.min(20, Number(body.forecast_years) || 5));

      // Fetch property + demand heat in parallel
      const [propRes, ...rest] = await Promise.all([
        supabase.from('properties').select('price, city, investment_score').eq('id', property_id).single(),
      ]);

      if (propRes.error || !propRes.data) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const prop = propRes.data;
      const currentPrice = Number(prop.price) || 0;
      const invScore = Number(prop.investment_score) || 0;

      if (currentPrice <= 0) {
        return new Response(JSON.stringify({ error: 'Property has no valid price' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Compute demand heat for city
      let demandHeat = 50;
      if (prop.city) {
        const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        const [listRes, newRes] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true }).eq('city', prop.city).eq('status', 'published'),
          supabase.from('properties').select('id', { count: 'exact', head: true }).eq('city', prop.city).gte('created_at', thirtyAgo),
        ]);
        const listings = listRes.count || 1;
        const newListings = newRes.count || 0;
        demandHeat = Math.min(100, Math.max(0, (newListings >= 20 ? 40 : newListings >= 10 ? 25 : 10) + (listings >= 50 ? 30 : listings >= 20 ? 20 : 10)));
      }

      // Base appreciation by city growth rate (demand-driven)
      let baseRate: number;
      if (demandHeat >= 70) baseRate = 0.08;
      else if (demandHeat >= 40) baseRate = 0.05;
      else baseRate = 0.03;

      // Investment score adjustment
      if (invScore > 80) baseRate += 0.02;
      else if (invScore >= 60) baseRate += 0.01;

      // Demand heat bonus
      if (demandHeat > 70) baseRate += 0.015;

      const growthRate = Math.round(baseRate * 10000) / 100; // as percentage

      // Specific year predictions
      const price1y = Math.round(currentPrice * Math.pow(1 + baseRate, 1));
      const price3y = Math.round(currentPrice * Math.pow(1 + baseRate, 3));
      const price5y = Math.round(currentPrice * Math.pow(1 + baseRate, 5));

      const forecastPrice = Math.round(currentPrice * Math.pow(1 + baseRate, forecastYears));

      // Year-by-year breakdown
      const yearly = Array.from({ length: forecastYears }, (_, i) => ({
        year: i + 1,
        price: Math.round(currentPrice * Math.pow(1 + baseRate, i + 1)),
        appreciation: Math.round(currentPrice * Math.pow(1 + baseRate, i + 1) - currentPrice),
      }));

      // Confidence based on data quality
      const confidence = Math.min(100, 40 + (demandHeat > 0 ? 20 : 0) + (invScore > 0 ? 20 : 0) + Math.min(20, (yearly.length / forecastYears) * 20));

      return new Response(JSON.stringify({
        mode: 'price_forecast',
        data: {
          property_id,
          city: prop.city,
          current_price: currentPrice,
          price_1y: price1y,
          price_3y: price3y,
          price_5y: price5y,
          forecast_price: forecastPrice,
          growth_rate: growthRate,
          forecast_years: forecastYears,
          demand_heat_score: demandHeat,
          investment_score: invScore,
          confidence,
          yearly_projection: yearly,
          generated_at: new Date().toISOString(),
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: buyer_intent — Purchase likelihood predictor
    // ═══════════════════════════════════════════
    if (mode === 'buyer_intent') {
      const targetUserId = body.user_id || userId;
      if (!targetUserId) {
        return new Response(JSON.stringify({ error: 'user_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();

      // All signals in parallel
      const [viewsRes, savesRes, contactsRes, visitsRes, searchesRes] = await Promise.all([
        // views_last_30_days
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId).eq('activity_type', 'view').gte('created_at', thirtyAgo),
        // saved_properties
        supabase.from('saved_properties').select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId),
        // contact_agent_actions (inquiries)
        supabase.from('inquiries').select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId).gte('created_at', thirtyAgo),
        // visit_bookings
        supabase.from('rental_bookings').select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId).gte('created_at', thirtyAgo),
        // search_frequency
        supabase.from('activity_logs').select('id', { count: 'exact', head: true })
          .eq('user_id', targetUserId).eq('activity_type', 'search').gte('created_at', thirtyAgo),
      ]);

      const views = viewsRes.count || 0;
      const saves = savesRes.count || 0;
      const contacts = contactsRes.count || 0;
      const visits = visitsRes.count || 0;
      const searches = searchesRes.count || 0;

      // Scoring: each signal capped at its max
      const viewScore = Math.min(20, Math.round(views * 0.4));           // ~50 views = max
      const saveScore = Math.min(25, saves * 5);                         // 5 saves = max
      const contactScore = Math.min(30, contacts * 10);                  // 3 contacts = max
      const visitScore = Math.min(15, visits * 8);                       // 2 visits = max
      const searchScore = Math.min(10, Math.round(searches * 0.5));      // 20 searches = max

      const intentScore = viewScore + saveScore + contactScore + visitScore + searchScore;

      let intentLevel: string;
      let recommendedAction: string;
      if (intentScore >= 81) {
        intentLevel = 'very_high';
        recommendedAction = 'Immediate agent contact — this buyer is ready to transact.';
      } else if (intentScore >= 61) {
        intentLevel = 'high';
        recommendedAction = 'Notify assigned agent for proactive outreach within 24 hours.';
      } else if (intentScore >= 31) {
        intentLevel = 'moderate';
        recommendedAction = 'Show investment insights and curated property recommendations.';
      } else {
        intentLevel = 'low';
        recommendedAction = 'Nurture with personalized recommendations and market updates.';
      }

      return new Response(JSON.stringify({
        mode: 'buyer_intent',
        data: {
          intent_score: intentScore,
          intent_level: intentLevel,
          recommended_action: recommendedAction,
          signals: {
            views_30d: views,
            saved_properties: saves,
            contact_agent_actions: contacts,
            visit_bookings: visits,
            search_frequency: searches,
          },
          breakdown: {
            view_score: viewScore,
            save_score: saveScore,
            contact_score: contactScore,
            visit_score: visitScore,
            search_score: searchScore,
          },
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ═══════════════════════════════════════════
    // MODE: negotiation_assist — Optimal offer price advisor
    // ═══════════════════════════════════════════
    if (mode === 'negotiation_assist') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: prop, error: propErr } = await supabase
        .from('properties')
        .select('price, city, property_type, building_area_sqm, land_area_sqm, investment_score, created_at, listed_at')
        .eq('id', property_id)
        .single();

      if (propErr || !prop) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const listingPrice = Number(prop.price) || 0;
      if (listingPrice <= 0) {
        return new Response(JSON.stringify({ error: 'Property has no valid price' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const invScore = Number(prop.investment_score) || 0;
      const listedDate = prop.listed_at || prop.created_at;
      const daysOnMarket = Math.max(0, Math.round((Date.now() - new Date(listedDate).getTime()) / 86400000));

      // Parallel: comparables + demand heat signals
      const ba = Number(prop.building_area_sqm) || 0;
      const la = Number(prop.land_area_sqm) || 0;
      const primaryArea = ba > 0 ? ba : la;
      const areaCol = ba > 0 ? 'building_area_sqm' : 'land_area_sqm';
      const thirtyAgo = new Date(Date.now() - 30 * 86400000).toISOString();

      const parallelQueries: Promise<any>[] = [
        // [0] Demand: published listings in city
        supabase.from('properties').select('id', { count: 'exact', head: true })
          .eq('city', prop.city).eq('status', 'published'),
        // [1] Demand: new listings 30d
        supabase.from('properties').select('id', { count: 'exact', head: true })
          .eq('city', prop.city).gte('created_at', thirtyAgo),
      ];

      // [2] Comparables (if area available)
      if (primaryArea > 0 && prop.city) {
        parallelQueries.push(
          supabase.from('properties')
            .select('price, building_area_sqm, land_area_sqm')
            .eq('city', prop.city).eq('property_type', prop.property_type)
            .eq('status', 'published').not('price', 'is', null).gt('price', 0)
            .gte(areaCol, primaryArea * 0.7).lte(areaCol, primaryArea * 1.3)
            .neq('id', property_id).limit(50)
        );
      }

      const results = await Promise.all(parallelQueries);
      const totalListings = results[0].count || 1;
      const newListings = results[1].count || 0;

      // Demand heat (simplified)
      const demandHeat = Math.min(100, Math.max(0,
        (newListings >= 20 ? 40 : newListings >= 10 ? 25 : 10) +
        (totalListings >= 50 ? 30 : totalListings >= 20 ? 20 : 10)
      ));

      // FMV from comparables
      let fmv = listingPrice;
      let compCount = 0;
      if (results[2]?.data) {
        const valid = (results[2].data || []).filter((c: any) => Number(c.price) > 0 && Number(c[areaCol]) > 0);
        compCount = valid.length;
        if (compCount >= 2) {
          const ppm = valid.map((c: any) => Number(c.price) / Number(c[areaCol])).sort((a: number, b: number) => a - b);
          const mid = Math.floor(ppm.length / 2);
          const median = ppm.length % 2 !== 0 ? ppm[mid] : (ppm[mid - 1] + ppm[mid]) / 2;
          fmv = Math.round(median * primaryArea);
        }
      }

      // ── Negotiation logic ──
      let discountPct = 0;
      const reasons: string[] = [];

      // Price position
      const priceRatio = listingPrice / fmv;
      if (priceRatio > 1.15) {
        discountPct += (priceRatio - 1) * 50; // e.g., 20% overpriced → ~10% discount
        reasons.push(`Listed ${Math.round((priceRatio - 1) * 100)}% above market value.`);
      } else if (priceRatio > 1.05) {
        discountPct += (priceRatio - 1) * 30;
        reasons.push(`Slightly above market value.`);
      } else if (priceRatio < 0.9) {
        discountPct -= 2; // Already underpriced, less room
        reasons.push(`Already priced below market — limited negotiation room.`);
      }

      // Days on market
      if (daysOnMarket > 120) {
        discountPct += 8;
        reasons.push(`On market ${daysOnMarket} days — seller likely motivated.`);
      } else if (daysOnMarket > 60) {
        discountPct += 5;
        reasons.push(`On market ${daysOnMarket} days — some negotiation leverage.`);
      } else if (daysOnMarket < 14) {
        discountPct -= 2;
        reasons.push(`Fresh listing (${daysOnMarket} days) — less room to negotiate.`);
      }

      // Demand heat
      if (demandHeat >= 70) {
        discountPct -= 3;
        reasons.push(`Hot market — competitive offers expected.`);
      } else if (demandHeat < 40) {
        discountPct += 3;
        reasons.push(`Cool market — buyers have leverage.`);
      }

      // Cap discount
      discountPct = Math.max(-2, Math.min(20, discountPct));
      const suggestedOffer = Math.round(listingPrice * (1 - discountPct / 100));
      const marginPct = Math.round(discountPct * 100) / 100;

      // Confidence
      let confidence: number;
      if (compCount >= 10) confidence = 90;
      else if (compCount >= 5) confidence = 75;
      else if (compCount >= 2) confidence = 60;
      else confidence = 40;

      const explanation = reasons.join(' ') + (discountPct > 0
        ? ` Recommend offering ${marginPct}% below listing price.`
        : ` Offer close to listing price for best chance of acceptance.`);

      return new Response(JSON.stringify({
        mode: 'negotiation_assist',
        data: {
          suggested_offer_price: suggestedOffer,
          negotiation_margin_percent: marginPct,
          negotiation_confidence: confidence,
          explanation,
          context: {
            listing_price: listingPrice,
            fair_market_value: fmv,
            days_on_market: daysOnMarket,
            demand_heat_score: demandHeat,
            investment_score: invScore,
            comparable_count: compCount,
          },
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── map_search: properties in bounds with investment heatmap ──
    if (mode === 'map_search') {
      const { map_bounds, limit: mapLimit } = body;
      if (!map_bounds || !map_bounds.north || !map_bounds.south || !map_bounds.east || !map_bounds.west) {
        return new Response(JSON.stringify({ error: 'map_bounds with north, south, east, west required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { north, south, east, west } = map_bounds;
      const propertyLimit = Math.min(Number(mapLimit) || 200, 500);

      // Fetch properties within bounds that have coordinates
      const { data: boundsProps, error: bpErr } = await supabase
        .from('properties')
        .select('id, title, price, latitude, longitude, city, property_type, bedrooms, bathrooms, area_sqm, thumbnail_url, images, listing_type')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', south)
        .lte('latitude', north)
        .gte('longitude', west)
        .lte('longitude', east)
        .limit(propertyLimit);

      if (bpErr) throw bpErr;
      const props = boundsProps || [];

      if (props.length === 0) {
        return new Response(JSON.stringify({
          mode: 'map_search',
          data: { properties: [], heatmap_points: [], total: 0 },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Fetch engagement/investment scores for these properties
      const propIds = props.map((p: any) => p.id);
      const { data: scoreRows } = await supabase
        .from('property_engagement_scores')
        .select('property_id, investment_score, engagement_score')
        .in('property_id', propIds);

      const scoreMap: Record<string, { investment_score: number; engagement_score: number }> = {};
      for (const s of scoreRows || []) {
        scoreMap[s.property_id] = {
          investment_score: s.investment_score || 0,
          engagement_score: s.engagement_score || 0,
        };
      }

      // Fetch demand heat per city (batch unique cities)
      const uniqueCities = [...new Set(props.map((p: any) => p.city).filter(Boolean))] as string[];
      const cityDemandMap: Record<string, number> = {};

      if (uniqueCities.length > 0) {
        // Count active listings per city as demand proxy
        for (const city of uniqueCities) {
          const { count } = await supabase
            .from('properties')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'active')
            .eq('city', city);
          // Normalize: 0-30 listings → score 20-100
          const listingCount = count || 0;
          cityDemandMap[city] = Math.min(100, 20 + (listingCount * 2.5));
        }
      }

      // Build enriched properties + heatmap points
      const properties = props.map((p: any) => {
        const scores = scoreMap[p.id] || { investment_score: 0, engagement_score: 0 };
        const demand_heat_score = cityDemandMap[p.city] || 30;
        const heat_score = Math.round((scores.investment_score * 0.6 + demand_heat_score * 0.4) * 100) / 100;
        const zone = heat_score >= 80 ? 'hot_investment' : heat_score >= 60 ? 'growing' : 'stable';

        return {
          id: p.id,
          title: p.title,
          latitude: p.latitude,
          longitude: p.longitude,
          price: p.price,
          city: p.city,
          property_type: p.property_type,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area_sqm: p.area_sqm,
          thumbnail_url: p.thumbnail_url || (p.images && p.images[0]) || null,
          listing_type: p.listing_type,
          investment_score: scores.investment_score,
          demand_heat_score,
          heat_score,
          zone,
        };
      });

      // Heatmap points (for Mapbox heatmap layer)
      const heatmap_points = properties.map((p: any) => ({
        latitude: p.latitude,
        longitude: p.longitude,
        weight: p.heat_score / 100,
        zone: p.zone,
      }));

      return new Response(JSON.stringify({
        mode: 'map_search',
        data: { properties, heatmap_points, total: properties.length },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ── digital_twin: AI insights for 3D property model ──
    if (mode === 'digital_twin') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch property data + scores in parallel
      const [propResult, scoreResult, cityResult] = await Promise.all([
        supabase.from('properties').select('id, title, price, city, state, property_type, bedrooms, bathrooms, area_sqm, building_area_sqm, land_area_sqm, glb_model_url, three_d_model_url, roi_percentage, rental_yield_percentage, legal_status, wna_eligible, view_type, listing_type, description').eq('id', property_id).single(),
        supabase.from('property_engagement_scores').select('investment_score, engagement_score, livability_score, luxury_score, predicted_roi, roi_confidence').eq('property_id', property_id).maybeSingle(),
        supabase.from('properties').select('id').eq('status', 'active').limit(1), // placeholder for city count
      ]);

      if (propResult.error || !propResult.data) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const prop = propResult.data;
      const scores = scoreResult.data || { investment_score: 0, engagement_score: 0, livability_score: 0, luxury_score: 0, predicted_roi: 0, roi_confidence: 0 };

      // Get demand heat for city
      let demandHeat = 50;
      if (prop.city) {
        const { count } = await supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('city', prop.city);
        demandHeat = Math.min(100, 20 + ((count || 0) * 2.5));
      }

      // Price forecast (5-year compound)
      const baseRate = demandHeat > 70 ? 0.08 : demandHeat > 40 ? 0.05 : 0.03;
      const investBonus = (scores.investment_score || 0) > 80 ? 0.02 : (scores.investment_score || 0) > 60 ? 0.01 : 0;
      const growthRate = baseRate + investBonus;
      const forecastPrice = Math.round((prop.price || 0) * Math.pow(1 + growthRate, 5));

      // Generate room metadata based on property specs
      const totalArea = prop.building_area_sqm || prop.area_sqm || 100;
      const bedrooms = prop.bedrooms || 2;
      const bathrooms = prop.bathrooms || 1;

      // Standard room breakdown
      const rooms: any[] = [];
      const livingSize = Math.round(totalArea * 0.25);
      rooms.push({ room_name: 'Living Room', size_sqm: livingSize, renovation_cost_estimate: livingSize * 2_500_000, market_appeal_score: 85 });
      const kitchenSize = Math.round(totalArea * 0.15);
      rooms.push({ room_name: 'Kitchen', size_sqm: kitchenSize, renovation_cost_estimate: kitchenSize * 4_000_000, market_appeal_score: 90 });
      for (let i = 1; i <= bedrooms; i++) {
        const bedSize = Math.round(totalArea * (i === 1 ? 0.18 : 0.12));
        rooms.push({ room_name: i === 1 ? 'Master Bedroom' : `Bedroom ${i}`, size_sqm: bedSize, renovation_cost_estimate: bedSize * 2_000_000, market_appeal_score: i === 1 ? 88 : 75 });
      }
      for (let i = 1; i <= bathrooms; i++) {
        const bathSize = Math.round(totalArea * 0.06);
        rooms.push({ room_name: i === 1 ? 'Main Bathroom' : `Bathroom ${i}`, size_sqm: bathSize, renovation_cost_estimate: bathSize * 5_000_000, market_appeal_score: 82 });
      }
      if (totalArea > 150) {
        const garageSize = Math.round(totalArea * 0.1);
        rooms.push({ room_name: 'Garage', size_sqm: garageSize, renovation_cost_estimate: garageSize * 1_500_000, market_appeal_score: 65 });
      }

      // Use AI to generate insights
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      let propertyInsights = 'AI insights unavailable.';
      let roomInsightsAI: string[] = [];
      let investmentAnalysis = 'AI analysis unavailable.';

      if (LOVABLE_API_KEY) {
        try {
          const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'google/gemini-3-flash-preview',
              messages: [
                { role: 'system', content: 'You are a real estate analyst specializing in Indonesian luxury property. Provide concise, data-driven insights.' },
                { role: 'user', content: `Analyze this property for a Digital Twin viewer:\n${JSON.stringify({ title: prop.title, city: prop.city, price: prop.price, type: prop.property_type, area: totalArea, bedrooms, bathrooms, investment_score: scores.investment_score, demand_heat: demandHeat, roi: prop.roi_percentage, forecast_5yr: forecastPrice, rooms: rooms.map(r => r.room_name) }, null, 2)}` },
              ],
              tools: [{
                type: 'function',
                function: {
                  name: 'digital_twin_insights',
                  description: 'Return property and room insights for digital twin',
                  parameters: {
                    type: 'object',
                    properties: {
                      property_insights: { type: 'string', description: 'Overall 2-3 sentence property insight' },
                      room_insights: { type: 'array', items: { type: 'string' }, description: 'One insight per room, matching the room list order' },
                      investment_analysis: { type: 'string', description: '2-3 sentence investment outlook' },
                    },
                    required: ['property_insights', 'room_insights', 'investment_analysis'],
                    additionalProperties: false,
                  },
                },
              }],
              tool_choice: { type: 'function', function: { name: 'digital_twin_insights' } },
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              const parsed = JSON.parse(toolCall.function.arguments);
              propertyInsights = parsed.property_insights || propertyInsights;
              roomInsightsAI = parsed.room_insights || [];
              investmentAnalysis = parsed.investment_analysis || investmentAnalysis;
            }
          } else if (aiResponse.status === 429 || aiResponse.status === 402) {
            console.warn('AI rate limited/credits:', aiResponse.status);
          }
        } catch (aiErr) {
          console.error('AI insights error:', aiErr);
        }
      }

      // Merge AI insights into rooms
      const enrichedRooms = rooms.map((r, i) => ({
        ...r,
        ai_insight: roomInsightsAI[i] || `${r.room_name}: ${r.size_sqm}sqm with IDR ${r.renovation_cost_estimate.toLocaleString()} renovation potential.`,
      }));

      return new Response(JSON.stringify({
        mode: 'digital_twin',
        data: {
          property: {
            id: prop.id,
            title: prop.title,
            city: prop.city,
            price: prop.price,
            property_type: prop.property_type,
            area_sqm: totalArea,
            bedrooms,
            bathrooms,
            glb_model_url: prop.glb_model_url || prop.three_d_model_url || null,
            listing_type: prop.listing_type,
          },
          scores: {
            investment_score: scores.investment_score || 0,
            demand_heat_score: demandHeat,
            livability_score: scores.livability_score || 0,
            luxury_score: scores.luxury_score || 0,
            engagement_score: scores.engagement_score || 0,
          },
          price_forecast: {
            current_price: prop.price,
            forecast_price: forecastPrice,
            growth_rate: Math.round(growthRate * 10000) / 100,
            forecast_years: 5,
          },
          property_insights: propertyInsights,
          room_insights: enrichedRooms,
          investment_analysis: investmentAnalysis,
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════
    // MODE: anomaly_detector
    // ═══════════════════════════════════════════
    if (mode === 'anomaly_detector') {
      const { city: adCity, limit: adLimit } = body;
      const scanLimit = Math.min(Number(adLimit) || 100, 500);

      // Build query
      let query = supabase
        .from('properties')
        .select('id, title, price, city, property_type, land_area_sqm, building_area_sqm, bedrooms, bathrooms, description, images, created_at, status, owner_id, investment_score')
        .eq('status', 'published')
        .not('price', 'is', null)
        .gt('price', 0)
        .order('created_at', { ascending: false })
        .limit(scanLimit);

      if (adCity) query = query.eq('city', adCity);

      const { data: listings, error: listErr } = await query;
      if (listErr || !listings || listings.length === 0) {
        return new Response(JSON.stringify({ mode: 'anomaly_detector', data: { flagged: [], total_scanned: 0, summary: {} } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Compute city-level price stats for comparison
      const cityStats: Record<string, { prices: number[]; ppm2: number[] }> = {};
      for (const l of listings) {
        const c = l.city || 'unknown';
        if (!cityStats[c]) cityStats[c] = { prices: [], ppm2: [] };
        const price = Number(l.price);
        const area = Number(l.building_area_sqm) || Number(l.land_area_sqm) || 0;
        cityStats[c].prices.push(price);
        if (area > 0) cityStats[c].ppm2.push(price / area);
      }

      const cityMedians: Record<string, { medianPrice: number; medianPpm2: number; stdPrice: number }> = {};
      for (const [c, stats] of Object.entries(cityStats)) {
        const sorted = [...stats.prices].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
        const std = Math.sqrt(sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / sorted.length);

        const sortedPpm2 = [...stats.ppm2].sort((a, b) => a - b);
        const midP = Math.floor(sortedPpm2.length / 2);
        const medianPpm2 = sortedPpm2.length > 0
          ? (sortedPpm2.length % 2 !== 0 ? sortedPpm2[midP] : (sortedPpm2[midP - 1] + sortedPpm2[midP]) / 2)
          : 0;

        cityMedians[c] = { medianPrice: median, medianPpm2: medianPpm2, stdPrice: std };
      }

      // Check for duplicate titles
      const titleMap: Record<string, string[]> = {};
      for (const l of listings) {
        const normalized = (l.title || '').toLowerCase().trim().replace(/\s+/g, ' ');
        if (normalized.length > 5) {
          if (!titleMap[normalized]) titleMap[normalized] = [];
          titleMap[normalized].push(l.id);
        }
      }
      const duplicateTitles = new Set<string>();
      for (const ids of Object.values(titleMap)) {
        if (ids.length > 1) ids.forEach(id => duplicateTitles.add(id));
      }

      // Score each listing
      interface AnomalyFlag {
        id: string;
        title: string;
        city: string;
        price: number;
        fraud_score: number; // 0-100
        flags: { type: string; severity: 'low' | 'medium' | 'high' | 'critical'; detail: string }[];
      }

      const flagged: AnomalyFlag[] = [];

      for (const l of listings) {
        const flags: AnomalyFlag['flags'] = [];
        const price = Number(l.price);
        const area = Number(l.building_area_sqm) || Number(l.land_area_sqm) || 0;
        const city = l.city || 'unknown';
        const stats = cityMedians[city];

        // 1. Unrealistic pricing (too low or too high vs median)
        if (stats && stats.medianPrice > 0) {
          const ratio = price / stats.medianPrice;
          if (ratio < 0.15) {
            flags.push({ type: 'unrealistic_price', severity: 'critical', detail: `Price is ${Math.round((1 - ratio) * 100)}% below city median — suspiciously low` });
          } else if (ratio < 0.35) {
            flags.push({ type: 'unrealistic_price', severity: 'high', detail: `Price is ${Math.round((1 - ratio) * 100)}% below city median` });
          } else if (ratio > 5) {
            flags.push({ type: 'unrealistic_price', severity: 'high', detail: `Price is ${Math.round(ratio * 100)}% of city median — extremely overpriced` });
          } else if (ratio > 3) {
            flags.push({ type: 'unrealistic_price', severity: 'medium', detail: `Price is ${Math.round(ratio * 100)}% of city median` });
          }
        }

        // 2. Price per sqm outlier
        if (area > 0 && stats && stats.medianPpm2 > 0) {
          const ppm2 = price / area;
          const ppm2Ratio = ppm2 / stats.medianPpm2;
          if (ppm2Ratio < 0.1 || ppm2Ratio > 10) {
            flags.push({ type: 'price_per_sqm_outlier', severity: 'high', detail: `Price/sqm (${Math.round(ppm2).toLocaleString()}) is ${ppm2Ratio < 1 ? 'far below' : 'far above'} city median (${Math.round(stats.medianPpm2).toLocaleString()})` });
          } else if (ppm2Ratio < 0.25 || ppm2Ratio > 4) {
            flags.push({ type: 'price_per_sqm_outlier', severity: 'medium', detail: `Price/sqm deviates significantly from city median` });
          }
        }

        // 3. Missing or very short description
        const desc = (l.description || '').trim();
        if (desc.length === 0) {
          flags.push({ type: 'missing_description', severity: 'medium', detail: 'No description provided' });
        } else if (desc.length < 30) {
          flags.push({ type: 'short_description', severity: 'low', detail: `Description is only ${desc.length} characters` });
        }

        // 4. Suspicious description patterns
        if (desc.length > 0) {
          const lowerDesc = desc.toLowerCase();
          const suspiciousPatterns = ['whatsapp', 'wa:', 'hubungi', 'transfer', 'wire', 'bitcoin', 'crypto', 'guaranteed return', 'no risk'];
          const found = suspiciousPatterns.filter(p => lowerDesc.includes(p));
          if (found.length > 0) {
            flags.push({ type: 'suspicious_content', severity: 'medium', detail: `Description contains suspicious terms: ${found.join(', ')}` });
          }

          // Check for excessive caps
          const capsRatio = (desc.match(/[A-Z]/g) || []).length / desc.length;
          if (capsRatio > 0.6 && desc.length > 20) {
            flags.push({ type: 'excessive_caps', severity: 'low', detail: 'Description has excessive capitalization (potential spam)' });
          }
        }

        // 5. No images or too few
        const images = Array.isArray(l.images) ? l.images : [];
        if (images.length === 0) {
          flags.push({ type: 'no_images', severity: 'high', detail: 'No images uploaded — common in fake listings' });
        } else if (images.length === 1) {
          flags.push({ type: 'few_images', severity: 'low', detail: 'Only 1 image — low-effort listing' });
        }

        // 6. Duplicate title
        if (duplicateTitles.has(l.id)) {
          flags.push({ type: 'duplicate_title', severity: 'high', detail: 'Title matches another listing — possible duplicate' });
        }

        // 7. Unrealistic area
        if (area > 0) {
          if (area < 5) {
            flags.push({ type: 'unrealistic_area', severity: 'medium', detail: `Area of ${area} sqm is unrealistically small` });
          } else if (area > 50000) {
            flags.push({ type: 'unrealistic_area', severity: 'medium', detail: `Area of ${area.toLocaleString()} sqm is unusually large for a listing` });
          }
        }

        // 8. Missing bedrooms/bathrooms for residential
        const residentialTypes = ['house', 'villa', 'apartment', 'townhouse', 'rumah', 'apartemen'];
        if (residentialTypes.includes((l.property_type || '').toLowerCase())) {
          if (!l.bedrooms || l.bedrooms === 0) {
            flags.push({ type: 'missing_bedrooms', severity: 'low', detail: 'Residential property with no bedrooms specified' });
          }
          if (l.bedrooms && l.bedrooms > 20) {
            flags.push({ type: 'unrealistic_bedrooms', severity: 'medium', detail: `${l.bedrooms} bedrooms is unrealistic` });
          }
        }

        // Calculate fraud score
        const severityWeights = { critical: 35, high: 25, medium: 15, low: 5 };
        let fraudScore = 0;
        for (const f of flags) {
          fraudScore += severityWeights[f.severity];
        }
        fraudScore = Math.min(100, fraudScore);

        if (flags.length > 0) {
          flagged.push({
            id: l.id,
            title: l.title || 'Untitled',
            city: city,
            price: price,
            fraud_score: fraudScore,
            flags,
          });
        }
      }

      // Sort by fraud score descending
      flagged.sort((a, b) => b.fraud_score - a.fraud_score);

      // Summary
      const criticalCount = flagged.filter(f => f.fraud_score >= 70).length;
      const highCount = flagged.filter(f => f.fraud_score >= 40 && f.fraud_score < 70).length;
      const lowCount = flagged.filter(f => f.fraud_score < 40).length;

      const flagTypeCounts: Record<string, number> = {};
      for (const f of flagged) {
        for (const flag of f.flags) {
          flagTypeCounts[flag.type] = (flagTypeCounts[flag.type] || 0) + 1;
        }
      }

      console.log(`Anomaly scan: ${listings.length} scanned, ${flagged.length} flagged (${criticalCount} critical)`);

      return new Response(JSON.stringify({
        mode: 'anomaly_detector',
        data: {
          flagged: flagged.slice(0, 50), // top 50
          total_scanned: listings.length,
          total_flagged: flagged.length,
          summary: {
            critical: criticalCount,
            high: highCount,
            low: lowCount,
            flag_types: flagTypeCounts,
          },
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════
    // MODE: premium_insights — Tiered AI analytics
    // ═══════════════════════════════════════════
    if (mode === 'premium_insights') {
      const pid = body.property_id;
      if (!pid) {
        return new Response(JSON.stringify({ error: 'property_id is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: prop, error: propErr } = await supabase
        .from('properties')
        .select('id, title, price, city, district, property_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, area_sqm, investment_score, listing_type, pool, is_featured, created_at')
        .eq('id', pid)
        .single();

      if (propErr || !prop) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const piPrice = Number(prop.price) || 0;
      const piArea = Number(prop.building_area_sqm) || Number(prop.land_area_sqm) || Number(prop.area_sqm) || 1;
      const piInvScore = Number(prop.investment_score) || 50;

      // Free-tier: investment_score only
      if (subscriptionType === 'free') {
        return new Response(JSON.stringify({
          data: {
            access_level: 'free',
            insights: { investment_score: piInvScore },
            upgrade_hint: 'Upgrade to Pro to unlock deal rating, rental yield, 5-year forecast, and buyer demand analytics.',
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Pro/Enterprise: full analytics
      const { count: piCityCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('city', prop.city)
        .eq('status', 'active');

      const { data: piCityListings } = await supabase
        .from('properties')
        .select('price, building_area_sqm, land_area_sqm, area_sqm')
        .eq('city', prop.city)
        .eq('property_type', prop.property_type)
        .eq('status', 'active')
        .limit(200);

      let piMedianPps = 0;
      if (piCityListings && piCityListings.length > 0) {
        const ppsArr = piCityListings
          .map(l => {
            const a = Number(l.building_area_sqm) || Number(l.land_area_sqm) || Number(l.area_sqm) || 1;
            return Number(l.price) / a;
          })
          .sort((a, b) => a - b);
        piMedianPps = ppsArr[Math.floor(ppsArr.length / 2)];
      }

      const piDemandMult = (piCityCount || 0) > 30 ? 1.10 : (piCityCount || 0) > 15 ? 1.05 : (piCityCount || 0) > 5 ? 1.0 : 0.95;
      const piFmv = piMedianPps * piArea * piDemandMult * (1 + Math.min(piInvScore, 100) / 2000);
      const piDealPct = piFmv > 0 ? ((piFmv - piPrice) / piFmv) * 100 : 0;

      let piDealRating = 'Fair Value';
      if (piDealPct >= 15) piDealRating = 'Strong Buy';
      else if (piDealPct >= 10) piDealRating = 'Good Deal';
      else if (piDealPct >= 5) piDealRating = 'Slightly Undervalued';
      else if (piDealPct <= -15) piDealRating = 'Overpriced';
      else if (piDealPct <= -5) piDealRating = 'Slightly Overpriced';

      const piIsLuxury = piPrice > 5_000_000_000;
      const piBaseYield = piIsLuxury ? 5.5 : prop.listing_type === 'rent' ? 7.0 : 6.0;
      const piLocBonus = ['Bali', 'Jakarta'].includes(prop.city || '') ? 1.2 : 0;
      const piPoolBonus = prop.pool ? 0.5 : 0;
      const piYield = Math.round((piBaseYield + piLocBonus + piPoolBonus) * 100) / 100;

      const piBaseAppr = (piCityCount || 0) > 30 ? 7 : (piCityCount || 0) > 15 ? 5 : 3;
      const piInvBonus = piInvScore >= 75 ? 2 : piInvScore >= 50 ? 1 : 0;
      const piGrowth = piBaseAppr + piInvBonus;
      const piForecast = Math.round(piPrice * Math.pow(1 + piGrowth / 100, 5));

      const { count: piViews } = await supabase
        .from('property_analytics')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', pid);
      const { count: piSaves } = await supabase
        .from('saved_properties')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', pid);

      const piBuyerDemand = Math.min(100, Math.round(((piViews || 0) * 1) + ((piSaves || 0) * 5)));

      return new Response(JSON.stringify({
        data: {
          access_level: subscriptionType,
          insights: {
            investment_score: piInvScore,
            deal_rating: piDealRating,
            deal_score_percent: Math.round(piDealPct * 10) / 10,
            fair_market_value: Math.round(piFmv),
            rental_yield_estimate: piYield,
            price_forecast_5y: { current_price: piPrice, forecast_price: piForecast, annual_growth_rate: piGrowth },
            buyer_demand_score: piBuyerDemand,
            market_density: piCityCount || 0,
          },
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════
    // MODE: deal_alerts — Scan for undervalued properties & notify matching users
    // ═══════════════════════════════════════════
    if (mode === 'deal_alerts') {
      // Step 1: Fetch all active properties with prices
      const { data: allProps, error: propsErr } = await supabase
        .from('properties')
        .select('id, title, price, city, district, property_type, building_area_sqm, land_area_sqm, area_sqm, investment_score, created_at')
        .eq('status', 'active')
        .not('price', 'is', null)
        .gt('price', 0)
        .limit(500);

      if (propsErr || !allProps || allProps.length === 0) {
        return new Response(JSON.stringify({
          data: { alerts_created: 0, notified_users: 0, deals_found: 0, message: 'No active properties to scan' },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Step 2: Group by city+type to compute median price/sqm
      const cityTypeGroups: Record<string, number[]> = {};
      for (const p of allProps) {
        const key = `${p.city}__${p.property_type}`;
        const a = Number(p.building_area_sqm) || Number(p.land_area_sqm) || Number(p.area_sqm) || 1;
        const pps = Number(p.price) / a;
        if (!cityTypeGroups[key]) cityTypeGroups[key] = [];
        cityTypeGroups[key].push(pps);
      }

      const medians: Record<string, number> = {};
      for (const [key, arr] of Object.entries(cityTypeGroups)) {
        const sorted = arr.sort((a, b) => a - b);
        medians[key] = sorted[Math.floor(sorted.length / 2)];
      }

      // Step 3: Identify deals (deal_score_percent >= 10)
      interface DealProperty {
        id: string;
        title: string;
        city: string;
        property_type: string;
        price: number;
        deal_score_percent: number;
        fair_market_value: number;
      }

      const deals: DealProperty[] = [];
      for (const p of allProps) {
        const key = `${p.city}__${p.property_type}`;
        const medianPps = medians[key] || 0;
        if (medianPps <= 0) continue;

        const area = Number(p.building_area_sqm) || Number(p.land_area_sqm) || Number(p.area_sqm) || 1;
        const invScore = Number(p.investment_score) || 50;
        const fmv = medianPps * area * (1 + Math.min(invScore, 100) / 2000);
        const dealPct = fmv > 0 ? ((fmv - Number(p.price)) / fmv) * 100 : 0;

        if (dealPct >= 10) {
          deals.push({
            id: p.id,
            title: p.title || 'Untitled',
            city: p.city || '',
            property_type: p.property_type || '',
            price: Number(p.price),
            deal_score_percent: Math.round(dealPct * 10) / 10,
            fair_market_value: Math.round(fmv),
          });
        }
      }

      if (deals.length === 0) {
        return new Response(JSON.stringify({
          data: { alerts_created: 0, notified_users: 0, deals_found: 0, message: 'No undervalued properties found' },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Step 4: Fetch active saved search alerts
      const { data: alerts } = await supabase
        .from('saved_search_alerts')
        .select('id, user_id, search_criteria, name')
        .eq('is_active', true);

      // Step 5: Match deals to user preferences and create notifications
      let alertsCreated = 0;
      const notifiedUserIds = new Set<string>();

      for (const deal of deals) {
        const matchingAlerts = (alerts || []).filter(alert => {
          const criteria = alert.search_criteria as any;
          if (!criteria) return false;

          // Match city
          if (criteria.city && criteria.city.toLowerCase() !== deal.city.toLowerCase()) return false;

          // Match property type
          if (criteria.property_type && criteria.property_type.toLowerCase() !== deal.property_type.toLowerCase()) return false;

          // Match price range
          if (criteria.min_price && deal.price < Number(criteria.min_price)) return false;
          if (criteria.max_price && deal.price > Number(criteria.max_price)) return false;

          return true;
        });

        for (const alert of matchingAlerts) {
          // Avoid duplicate notifications for same user + property
          const { count: existingCount } = await supabase
            .from('in_app_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', alert.user_id)
            .eq('property_id', deal.id)
            .eq('type', 'deal_alert')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          if ((existingCount || 0) > 0) continue;

          const dealLabel = deal.deal_score_percent >= 15 ? 'Strong Buy' : 'Good Deal';
          const { error: insertErr } = await supabase
            .from('in_app_notifications')
            .insert({
              user_id: alert.user_id,
              property_id: deal.id,
              type: 'deal_alert',
              title: `🔥 ${dealLabel}: ${deal.title}`,
              message: `This property in ${deal.city} is ${deal.deal_score_percent}% below fair market value (FMV: Rp ${(deal.fair_market_value / 1_000_000).toFixed(0)}M). Matches your "${alert.name}" alert.`,
              metadata: {
                deal_score_percent: deal.deal_score_percent,
                fair_market_value: deal.fair_market_value,
                alert_id: alert.id,
                alert_name: alert.name,
              },
            });

          if (!insertErr) {
            alertsCreated++;
            notifiedUserIds.add(alert.user_id);
          }
        }
      }

      // Update last_triggered_at for matched alerts
      if (alerts && alerts.length > 0) {
        const matchedAlertIds = [...new Set(
          deals.flatMap(deal =>
            (alerts || [])
              .filter(a => {
                const c = a.search_criteria as any;
                if (!c) return false;
                if (c.city && c.city.toLowerCase() !== deal.city.toLowerCase()) return false;
                if (c.property_type && c.property_type.toLowerCase() !== deal.property_type.toLowerCase()) return false;
                if (c.min_price && deal.price < Number(c.min_price)) return false;
                if (c.max_price && deal.price > Number(c.max_price)) return false;
                return true;
              })
              .map(a => a.id)
          )
        )];

        for (const alertId of matchedAlertIds) {
          await supabase
            .from('saved_search_alerts')
            .update({ last_triggered_at: new Date().toISOString(), match_count: alertsCreated })
            .eq('id', alertId);
        }
      }

      return new Response(JSON.stringify({
        data: {
          alerts_created: alertsCreated,
          notified_users: notifiedUserIds.size,
          deals_found: deals.length,
          top_deals: deals.sort((a, b) => b.deal_score_percent - a.deal_score_percent).slice(0, 5),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════
    // MODE: lead_generation — Find high-intent buyers in a city for agent leads
    // ═══════════════════════════════════════════
    if (mode === 'lead_generation') {
      const targetCity = (body.city || reqCity || '').trim();
      if (!targetCity) {
        return new Response(JSON.stringify({ error: 'city is required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Step 1: Fetch intent profiles for the target city
      const { data: intents, error: intErr } = await supabase
        .from('user_intent_profiles')
        .select('user_id, buyer_type, intent_level, avg_budget, preferred_city, views_30d, saves_30d, inquiries_30d, property_type_preference, investment_affinity, last_active_at')
        .ilike('preferred_city', `%${targetCity}%`);

      if (intErr) throw intErr;

      // Step 2: Score each user — weighted intent_score 0-100
      const scored = (intents || []).map(u => {
        const views = Number(u.views_30d) || 0;
        const saves = Number(u.saves_30d) || 0;
        const inquiries = Number(u.inquiries_30d) || 0;

        // Weighted: views 20%, saves 25%, inquiries 30%, recency 15%, intent_level 10%
        const viewScore = Math.min(views / 20, 1) * 20;
        const saveScore = Math.min(saves / 10, 1) * 25;
        const inquiryScore = Math.min(inquiries / 5, 1) * 30;

        // Recency: active in last 7 days = full points
        const daysSinceActive = u.last_active_at
          ? (Date.now() - new Date(u.last_active_at).getTime()) / (1000 * 60 * 60 * 24)
          : 30;
        const recencyScore = daysSinceActive <= 7 ? 15 : daysSinceActive <= 14 ? 10 : daysSinceActive <= 30 ? 5 : 0;

        // Intent level bonus
        const intentBonus = u.intent_level === 'high' ? 10 : u.intent_level === 'medium' ? 5 : 0;

        const intentScore = Math.round(viewScore + saveScore + inquiryScore + recencyScore + intentBonus);

        return {
          user_id: u.user_id,
          intent_score: Math.min(intentScore, 100),
          preferred_budget: u.avg_budget,
          buyer_type: u.buyer_type,
          intent_level: u.intent_level,
          property_type_preference: u.property_type_preference,
          investment_affinity: u.investment_affinity,
          activity_30d: { views, saves, inquiries },
          last_active_at: u.last_active_at,
        };
      });

      // Step 3: Filter intent_score > 70 and sort descending
      const highIntent = scored
        .filter(u => u.intent_score > 70)
        .sort((a, b) => b.intent_score - a.intent_score);

      // Step 4: Fetch agent profiles in same city for matching context
      const { data: cityAgents } = await supabase
        .from('profiles')
        .select('id, full_name, city')
        .ilike('city', `%${targetCity}%`);

      // Cross-reference with user_roles to confirm agent role
      const agentIds: string[] = [];
      if (cityAgents && cityAgents.length > 0) {
        const { data: agentRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'agent')
          .in('user_id', cityAgents.map(a => a.id));
        if (agentRoles) {
          agentRoles.forEach(r => agentIds.push(r.user_id));
        }
      }

      const matchedAgents = (cityAgents || [])
        .filter(a => agentIds.includes(a.id))
        .map(a => ({ agent_id: a.id, name: a.full_name, city: a.city }));

      // Summary stats
      const avgIntent = highIntent.length > 0
        ? Math.round(highIntent.reduce((s, l) => s + l.intent_score, 0) / highIntent.length)
        : 0;

      const budgetRange = highIntent.length > 0
        ? {
            min: Math.min(...highIntent.filter(l => l.preferred_budget).map(l => l.preferred_budget!)),
            max: Math.max(...highIntent.filter(l => l.preferred_budget).map(l => l.preferred_budget!)),
            avg: Math.round(highIntent.filter(l => l.preferred_budget).reduce((s, l) => s + (l.preferred_budget || 0), 0) / Math.max(highIntent.filter(l => l.preferred_budget).length, 1)),
          }
        : null;

      return new Response(JSON.stringify({
        data: {
          city: targetCity,
          buyer_leads: highIntent.slice(0, 50),
          total_high_intent: highIntent.length,
          total_scanned: scored.length,
          avg_intent_score: avgIntent,
          budget_range: budgetRange,
          matched_agents: matchedAgents,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════
    // MODE: knowledge_graph — Build & query property knowledge graph
    // ═══════════════════════════════════════════
    if (mode === 'knowledge_graph') {
      const action = body.action || 'query'; // 'build' or 'query'

      if (action === 'build') {
        // ---- BUILD PHASE: Populate graph edges from existing data ----
        let edgesCreated = 0;

        // 1. property → located_in → city
        const { data: props } = await supabase
          .from('properties')
          .select('id, city, property_type, developer_name, district')
          .eq('status', 'active')
          .not('city', 'is', null)
          .limit(500);

        const edgeBatch: Array<{
          source_type: string; source_id: string; relation_type: string;
          target_type: string; target_id: string; weight: number; metadata: any;
        }> = [];

        for (const p of (props || [])) {
          if (p.city) {
            edgeBatch.push({
              source_type: 'property', source_id: p.id,
              relation_type: 'located_in',
              target_type: 'city', target_id: p.city.toLowerCase(),
              weight: 1.0, metadata: { district: p.district },
            });
          }
          if (p.property_type) {
            edgeBatch.push({
              source_type: 'property', source_id: p.id,
              relation_type: 'is_type',
              target_type: 'property_type', target_id: p.property_type.toLowerCase(),
              weight: 1.0, metadata: {},
            });
          }
          if (p.developer_name) {
            edgeBatch.push({
              source_type: 'property', source_id: p.id,
              relation_type: 'built_by',
              target_type: 'developer', target_id: p.developer_name.toLowerCase(),
              weight: 1.0, metadata: {},
            });
          }
        }

        // 2. user → viewed → property (from ai_behavior_tracking)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        const { data: views } = await supabase
          .from('ai_behavior_tracking')
          .select('user_id, property_id, event_type')
          .in('event_type', ['view', 'property_view', 'detail_view'])
          .not('user_id', 'is', null)
          .not('property_id', 'is', null)
          .gte('created_at', thirtyDaysAgo)
          .limit(1000);

        // Aggregate view counts per user-property pair
        const viewCounts: Record<string, number> = {};
        for (const v of (views || [])) {
          const key = `${v.user_id}__${v.property_id}`;
          viewCounts[key] = (viewCounts[key] || 0) + 1;
        }
        for (const [key, count] of Object.entries(viewCounts)) {
          const [uid, pid] = key.split('__');
          edgeBatch.push({
            source_type: 'user', source_id: uid,
            relation_type: 'viewed',
            target_type: 'property', target_id: pid,
            weight: Math.min(count / 5, 3.0), // normalize weight
            metadata: { view_count: count },
          });
        }

        // 3. user → saved → property
        const { data: saves } = await supabase
          .from('saved_properties')
          .select('user_id, property_id')
          .limit(1000);

        for (const s of (saves || [])) {
          edgeBatch.push({
            source_type: 'user', source_id: s.user_id,
            relation_type: 'saved',
            target_type: 'property', target_id: s.property_id,
            weight: 2.0, // saves are higher intent
            metadata: {},
          });
        }

        // 4. property → has → amenity (from property features)
        const { data: propsWithFeatures } = await supabase
          .from('properties')
          .select('id, has_pool, has_garden, has_garage, has_security, has_gym, has_rooftop')
          .eq('status', 'active')
          .limit(500);

        const amenityFields = ['has_pool', 'has_garden', 'has_garage', 'has_security', 'has_gym', 'has_rooftop'];
        for (const p of (propsWithFeatures || [])) {
          for (const field of amenityFields) {
            if ((p as any)[field]) {
              edgeBatch.push({
                source_type: 'property', source_id: p.id,
                relation_type: 'has_amenity',
                target_type: 'amenity', target_id: field.replace('has_', ''),
                weight: 1.0, metadata: {},
              });
            }
          }
        }

        // Upsert all edges (on conflict update weight)
        if (edgeBatch.length > 0) {
          // Process in chunks of 100
          for (let i = 0; i < edgeBatch.length; i += 100) {
            const chunk = edgeBatch.slice(i, i + 100);
            const { error: upsertErr } = await supabase
              .from('knowledge_graph_edges')
              .upsert(chunk, { onConflict: 'source_type,source_id,relation_type,target_type,target_id' });
            if (!upsertErr) edgesCreated += chunk.length;
          }
        }

        return new Response(JSON.stringify({
          data: {
            edges_created: edgesCreated,
            breakdown: {
              location_edges: (props || []).filter(p => p.city).length,
              type_edges: (props || []).filter(p => p.property_type).length,
              developer_edges: (props || []).filter(p => p.developer_name).length,
              view_edges: Object.keys(viewCounts).length,
              save_edges: (saves || []).length,
              amenity_edges: edgeBatch.filter(e => e.relation_type === 'has_amenity').length,
            },
            built_at: new Date().toISOString(),
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ---- QUERY PHASE: Extract insights from the graph ----

      // Trending cities: most viewed/saved properties by city
      const { data: cityEdges } = await supabase
        .from('knowledge_graph_edges')
        .select('target_id, weight')
        .eq('relation_type', 'located_in')
        .eq('target_type', 'city');

      // Get view/save edges to weight cities by activity
      const { data: activityEdges } = await supabase
        .from('knowledge_graph_edges')
        .select('target_id, weight, relation_type')
        .in('relation_type', ['viewed', 'saved'])
        .eq('target_type', 'property');

      // Map property → city for cross-referencing
      const propCityMap: Record<string, string> = {};
      for (const e of (cityEdges || [])) {
        // source_id is the property, target_id is the city — but we need source_id
      }

      // Direct aggregation: count properties per city + activity weight
      const { data: locEdges } = await supabase
        .from('knowledge_graph_edges')
        .select('source_id, target_id')
        .eq('relation_type', 'located_in');

      const cityPropMap: Record<string, Set<string>> = {};
      for (const e of (locEdges || [])) {
        if (!cityPropMap[e.target_id]) cityPropMap[e.target_id] = new Set();
        cityPropMap[e.target_id].add(e.source_id);
        propCityMap[e.source_id] = e.target_id;
      }

      // Weight cities by user activity
      const cityScores: Record<string, number> = {};
      for (const city of Object.keys(cityPropMap)) {
        cityScores[city] = cityPropMap[city].size; // base = property count
      }
      for (const e of (activityEdges || [])) {
        const city = propCityMap[e.target_id];
        if (city) {
          cityScores[city] = (cityScores[city] || 0) + Number(e.weight) * (e.relation_type === 'saved' ? 2 : 1);
        }
      }

      const trendingCities = Object.entries(cityScores)
        .map(([city, score]) => ({
          city,
          score: Math.round(score * 10) / 10,
          property_count: cityPropMap[city]?.size || 0,
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      // Popular property types
      const { data: typeEdges } = await supabase
        .from('knowledge_graph_edges')
        .select('target_id')
        .eq('relation_type', 'is_type');

      const typeCounts: Record<string, number> = {};
      for (const e of (typeEdges || [])) {
        typeCounts[e.target_id] = (typeCounts[e.target_id] || 0) + 1;
      }
      const popularTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Top amenities
      const { data: amenityEdges } = await supabase
        .from('knowledge_graph_edges')
        .select('target_id')
        .eq('relation_type', 'has_amenity');

      const amenityCounts: Record<string, number> = {};
      for (const e of (amenityEdges || [])) {
        amenityCounts[e.target_id] = (amenityCounts[e.target_id] || 0) + 1;
      }
      const topAmenities = Object.entries(amenityCounts)
        .map(([amenity, count]) => ({ amenity, count }))
        .sort((a, b) => b.count - a.count);

      // Top developers
      const { data: devEdges } = await supabase
        .from('knowledge_graph_edges')
        .select('target_id')
        .eq('relation_type', 'built_by');

      const devCounts: Record<string, number> = {};
      for (const e of (devEdges || [])) {
        devCounts[e.target_id] = (devCounts[e.target_id] || 0) + 1;
      }
      const topDevelopers = Object.entries(devCounts)
        .map(([developer, count]) => ({ developer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Investor interest: cities with highest save-to-view ratio
      const cityViews: Record<string, number> = {};
      const citySaves: Record<string, number> = {};
      for (const e of (activityEdges || [])) {
        const city = propCityMap[e.target_id];
        if (!city) continue;
        if (e.relation_type === 'viewed') cityViews[city] = (cityViews[city] || 0) + Number(e.weight);
        if (e.relation_type === 'saved') citySaves[city] = (citySaves[city] || 0) + Number(e.weight);
      }

      const investorInterest = Object.keys(cityScores)
        .map(city => ({
          city,
          views: Math.round(cityViews[city] || 0),
          saves: Math.round(citySaves[city] || 0),
          interest_ratio: cityViews[city] ? Math.round(((citySaves[city] || 0) / cityViews[city]) * 100) : 0,
        }))
        .filter(c => c.views > 0)
        .sort((a, b) => b.interest_ratio - a.interest_ratio)
        .slice(0, 10);

      // Graph stats
      const { count: totalEdges } = await supabase
        .from('knowledge_graph_edges')
        .select('*', { count: 'exact', head: true });

      return new Response(JSON.stringify({
        data: {
          trending_cities: trendingCities,
          popular_property_types: popularTypes,
          top_amenities: topAmenities,
          top_developers: topDevelopers,
          investor_interest_areas: investorInterest,
          graph_stats: {
            total_edges: totalEdges || 0,
            entity_types: ['user', 'property', 'city', 'property_type', 'developer', 'amenity'],
            relation_types: ['viewed', 'saved', 'located_in', 'is_type', 'built_by', 'has_amenity'],
          },
          queried_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════
    // MODE: investor_strategy — Generate optimal investment portfolio strategies
    // ═══════════════════════════════════════════
    if (mode === 'investor_strategy') {
      const budget = Number(body.budget) || 0;
      const location = (body.location || '').trim();
      const riskLevel = (body.risk_level || 'medium') as 'low' | 'medium' | 'high';
      const investmentGoal = (body.investment_goal || 'both') as 'capital_growth' | 'rental_yield' | 'both';

      if (budget <= 0) {
        return new Response(JSON.stringify({ error: 'budget is required and must be > 0' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Step 1: Fetch candidate properties within budget
      let q = supabase
        .from('properties')
        .select('id, title, city, district, price, property_type, bedrooms, building_area_sqm, land_area_sqm, area_sqm, investment_score, demand_heat_score, rental_yield, image_url, images')
        .eq('status', 'active')
        .not('price', 'is', null)
        .gt('price', 0)
        .lte('price', budget);

      if (location) q = q.ilike('city', `%${location}%`);

      const { data: candidates, error: qErr } = await q
        .order('investment_score', { ascending: false })
        .limit(100);

      if (qErr) throw qErr;
      if (!candidates || candidates.length === 0) {
        return new Response(JSON.stringify({
          data: { strategies: [], message: 'No properties found matching criteria' },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Step 2: Score each candidate
      interface ScoredCandidate {
        id: string; title: string; city: string; district: string | null;
        price: number; property_type: string | null; bedrooms: number | null;
        area_sqm: number; investment_score: number; heat_score: number;
        rental_yield: number; forecast_growth: number; risk_factor: number;
        roi_estimate: number; image_url: string | null;
      }

      const scored: ScoredCandidate[] = candidates.map(p => {
        const invScore = Number(p.investment_score) || 50;
        const heatScore = Number(p.demand_heat_score) || 50;
        const rentalYield = Number(p.rental_yield) || (3 + (invScore / 50));
        const area = Number(p.building_area_sqm) || Number(p.land_area_sqm) || Number(p.area_sqm) || 1;

        // Forecast: base appreciation + heat/inv bonuses
        const baseGrowth = 4;
        const heatBonus = heatScore > 70 ? 3 : heatScore > 50 ? 1.5 : 0;
        const invBonus = invScore > 80 ? 2 : invScore > 60 ? 1 : 0;
        const forecastGrowth = Math.round((baseGrowth + heatBonus + invBonus) * 10) / 10;

        // Risk factor 0-100: lower inv/heat = higher risk
        const riskFactor = Math.round(100 - (invScore * 0.5 + heatScore * 0.3 + Math.min(rentalYield, 10) * 2));

        // Estimated annual ROI = rental_yield + forecast_growth
        const roiEstimate = Math.round((rentalYield + forecastGrowth) * 10) / 10;

        return {
          id: p.id, title: p.title || 'Untitled', city: p.city || '', district: p.district,
          price: Number(p.price), property_type: p.property_type, bedrooms: p.bedrooms,
          area_sqm: area, investment_score: invScore, heat_score: heatScore,
          rental_yield: Math.round(rentalYield * 10) / 10,
          forecast_growth: forecastGrowth, risk_factor: Math.max(0, Math.min(riskFactor, 100)),
          roi_estimate: roiEstimate,
          image_url: p.image_url || (Array.isArray(p.images) ? p.images[0] : null),
        };
      });

      // Filter by risk tolerance
      const riskThreshold = riskLevel === 'low' ? 40 : riskLevel === 'medium' ? 65 : 100;
      const eligible = scored.filter(s => s.risk_factor <= riskThreshold);

      // Sort by goal preference
      if (investmentGoal === 'rental_yield') {
        eligible.sort((a, b) => b.rental_yield - a.rental_yield);
      } else if (investmentGoal === 'capital_growth') {
        eligible.sort((a, b) => b.forecast_growth - a.forecast_growth);
      } else {
        eligible.sort((a, b) => b.roi_estimate - a.roi_estimate);
      }

      // Step 3: Build portfolio strategies using greedy knapsack
      interface Strategy {
        name: string;
        properties: ScoredCandidate[];
        total_investment: number;
        portfolio_roi: number;
        avg_risk: number;
        diversification_score: number;
        strategy_summary: string;
      }

      const strategies: Strategy[] = [];

      // Strategy 1: Maximum ROI (greedy pick top ROI until budget)
      const buildStrategy = (
        pool: ScoredCandidate[],
        name: string,
        summaryPrefix: string,
        maxProps: number = 5
      ): Strategy | null => {
        const picked: ScoredCandidate[] = [];
        let remaining = budget;
        for (const p of pool) {
          if (picked.length >= maxProps) break;
          if (p.price <= remaining) {
            picked.push(p);
            remaining -= p.price;
          }
        }
        if (picked.length === 0) return null;

        const totalInv = picked.reduce((s, p) => s + p.price, 0);
        const weightedRoi = picked.reduce((s, p) => s + p.roi_estimate * (p.price / totalInv), 0);
        const avgRisk = Math.round(picked.reduce((s, p) => s + p.risk_factor, 0) / picked.length);
        const uniqueCities = new Set(picked.map(p => p.city)).size;
        const uniqueTypes = new Set(picked.map(p => p.property_type)).size;
        const divScore = Math.round(((uniqueCities / Math.max(picked.length, 1)) * 50) + ((uniqueTypes / Math.max(picked.length, 1)) * 50));

        return {
          name,
          properties: picked,
          total_investment: totalInv,
          portfolio_roi: Math.round(weightedRoi * 10) / 10,
          avg_risk: avgRisk,
          diversification_score: divScore,
          strategy_summary: `${summaryPrefix} ${picked.length} properties for Rp ${(totalInv / 1e9).toFixed(1)}B with projected ${weightedRoi.toFixed(1)}% annual ROI and ${avgRisk <= 40 ? 'low' : avgRisk <= 65 ? 'moderate' : 'high'} risk.`,
        };
      };

      // S1: Max ROI
      const s1Pool = [...eligible].sort((a, b) => b.roi_estimate - a.roi_estimate);
      const s1 = buildStrategy(s1Pool, 'Maximum ROI', 'Aggressive growth strategy combining');
      if (s1) strategies.push(s1);

      // S2: Balanced (sort by composite of ROI + low risk)
      const s2Pool = [...eligible].sort((a, b) => (b.roi_estimate - b.risk_factor * 0.05) - (a.roi_estimate - a.risk_factor * 0.05));
      const s2 = buildStrategy(s2Pool, 'Balanced Growth', 'Risk-balanced portfolio of');
      if (s2) strategies.push(s2);

      // S3: Defensive / Rental Focus
      const s3Pool = [...eligible].sort((a, b) => {
        const aScore = a.rental_yield * 2 + (100 - a.risk_factor) * 0.1;
        const bScore = b.rental_yield * 2 + (100 - b.risk_factor) * 0.1;
        return bScore - aScore;
      });
      const s3 = buildStrategy(s3Pool, 'Stable Income', 'Conservative rental-focused strategy with');
      if (s3) strategies.push(s3);

      // S4: Diversified (force different cities/types)
      const s4Pool: ScoredCandidate[] = [];
      const usedCities = new Set<string>();
      const usedTypes = new Set<string>();
      for (const p of eligible) {
        if (!usedCities.has(p.city) || !usedTypes.has(p.property_type || '')) {
          s4Pool.push(p);
          usedCities.add(p.city);
          if (p.property_type) usedTypes.add(p.property_type);
        }
      }
      const s4 = buildStrategy(s4Pool, 'Diversified Portfolio', 'Geographically and asset-diversified portfolio of');
      if (s4) strategies.push(s4);

      // Sort strategies by ROI descending
      strategies.sort((a, b) => b.portfolio_roi - a.portfolio_roi);

      return new Response(JSON.stringify({
        data: {
          strategies,
          input: { budget, location, risk_level: riskLevel, investment_goal: investmentGoal },
          candidates_scanned: candidates.length,
          eligible_after_risk_filter: eligible.length,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════
    // MODE: demand_intelligence — Detect fast-growing real estate markets
    // ═══════════════════════════════════════════
    if (mode === 'demand_intelligence') {
      // Step 1: Aggregate property data by city
      const { data: props, error: pErr } = await supabase
        .from('properties')
        .select('id, city, price, property_type, investment_score, demand_heat_score, created_at, status')
        .not('city', 'is', null)
        .not('price', 'is', null)
        .gt('price', 0)
        .limit(1000);

      if (pErr) throw pErr;

      interface CityBucket {
        prices: number[];
        heatScores: number[];
        invScores: number[];
        propertyCount: number;
        activeCount: number;
        recentListings: number; // last 30d
        types: Set<string>;
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000);
      const cities: Record<string, CityBucket> = {};

      for (const p of (props || [])) {
        const city = (p.city || '').toLowerCase().trim();
        if (!city) continue;
        if (!cities[city]) {
          cities[city] = { prices: [], heatScores: [], invScores: [], propertyCount: 0, activeCount: 0, recentListings: 0, types: new Set() };
        }
        const b = cities[city];
        b.prices.push(Number(p.price));
        b.heatScores.push(Number(p.demand_heat_score) || 0);
        b.invScores.push(Number(p.investment_score) || 0);
        b.propertyCount++;
        if (p.status === 'active') b.activeCount++;
        if (p.property_type) b.types.add(p.property_type);
        if (p.created_at && new Date(p.created_at) >= thirtyDaysAgo) b.recentListings++;
      }

      // Step 2: Get buyer activity from ai_behavior_tracking (30d)
      const { data: activities } = await supabase
        .from('ai_behavior_tracking')
        .select('property_id, event_type, user_id')
        .in('event_type', ['view', 'property_view', 'detail_view', 'save', 'contact', 'inquiry'])
        .gte('created_at', thirtyDaysAgo.toISOString())
        .not('property_id', 'is', null)
        .limit(1000);

      // Map property_id → city for activity attribution
      const propCityMap: Record<string, string> = {};
      for (const p of (props || [])) {
        if (p.city) propCityMap[p.id] = (p.city || '').toLowerCase().trim();
      }

      const cityActivityCounts: Record<string, number> = {};
      const cityUniqueUsers: Record<string, Set<string>> = {};
      for (const a of (activities || [])) {
        const city = propCityMap[a.property_id!];
        if (!city) continue;
        cityActivityCounts[city] = (cityActivityCounts[city] || 0) + 1;
        if (!cityUniqueUsers[city]) cityUniqueUsers[city] = new Set();
        if (a.user_id) cityUniqueUsers[city].add(a.user_id);
      }

      // Step 3: Get saved property counts by city
      const { data: saves } = await supabase
        .from('saved_properties')
        .select('property_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .limit(1000);

      const citySaveCounts: Record<string, number> = {};
      for (const s of (saves || [])) {
        const city = propCityMap[s.property_id];
        if (city) citySaveCounts[city] = (citySaveCounts[city] || 0) + 1;
      }

      // Step 4: Price growth from price history
      const { data: priceHistory } = await supabase
        .from('property_price_history')
        .select('property_id, price, recorded_at')
        .gte('recorded_at', ninetyDaysAgo.toISOString())
        .order('recorded_at', { ascending: true })
        .limit(1000);

      const cityPriceGrowth: Record<string, number[]> = {};
      // Group prices by city, compare oldest vs newest
      const propPrices: Record<string, { oldest: number; newest: number; oldDate: string; newDate: string }> = {};
      for (const ph of (priceHistory || [])) {
        const pid = ph.property_id;
        if (!propPrices[pid]) {
          propPrices[pid] = { oldest: Number(ph.price), newest: Number(ph.price), oldDate: ph.recorded_at, newDate: ph.recorded_at };
        } else {
          if (ph.recorded_at < propPrices[pid].oldDate) {
            propPrices[pid].oldest = Number(ph.price);
            propPrices[pid].oldDate = ph.recorded_at;
          }
          if (ph.recorded_at > propPrices[pid].newDate) {
            propPrices[pid].newest = Number(ph.price);
            propPrices[pid].newDate = ph.recorded_at;
          }
        }
      }

      for (const [pid, pp] of Object.entries(propPrices)) {
        const city = propCityMap[pid];
        if (!city || pp.oldest <= 0) continue;
        const growth = ((pp.newest - pp.oldest) / pp.oldest) * 100;
        if (!cityPriceGrowth[city]) cityPriceGrowth[city] = [];
        cityPriceGrowth[city].push(growth);
      }

      // Step 5: Score and classify each city
      interface CityHotspot {
        city: string;
        growth_rate: number;
        buyer_activity_score: number;
        investor_interest_score: number;
        composite_score: number;
        investment_rating: string;
        market_class: 'very_hot' | 'hot' | 'growing' | 'stable';
        avg_price: number;
        median_heat_score: number;
        avg_investment_score: number;
        property_count: number;
        active_listings: number;
        new_listings_30d: number;
        unique_buyers_30d: number;
        saves_30d: number;
        property_types: string[];
      }

      const hotspots: CityHotspot[] = [];

      for (const [city, bucket] of Object.entries(cities)) {
        if (bucket.propertyCount < 2) continue; // skip tiny markets

        const avgPrice = Math.round(bucket.prices.reduce((s, p) => s + p, 0) / bucket.prices.length);
        const sortedHeat = [...bucket.heatScores].sort((a, b) => a - b);
        const medianHeat = sortedHeat[Math.floor(sortedHeat.length / 2)] || 0;
        const avgInv = Math.round(bucket.invScores.reduce((s, v) => s + v, 0) / bucket.invScores.length);

        // Price growth rate (avg of individual property growths, or estimate from heat)
        const growthRates = cityPriceGrowth[city] || [];
        const priceGrowthRate = growthRates.length > 0
          ? Math.round(growthRates.reduce((s, g) => s + g, 0) / growthRates.length * 10) / 10
          : Math.round((2 + medianHeat / 25) * 10) / 10; // estimate

        // Buyer activity score 0-100
        const actCount = cityActivityCounts[city] || 0;
        const uniqueUsers = cityUniqueUsers[city]?.size || 0;
        const buyerActivityScore = Math.min(100, Math.round(
          (Math.min(actCount / 50, 1) * 40) +
          (Math.min(uniqueUsers / 20, 1) * 35) +
          (Math.min(bucket.recentListings / 10, 1) * 25)
        ));

        // Investor interest score 0-100
        const saveCount = citySaveCounts[city] || 0;
        const investorInterestScore = Math.min(100, Math.round(
          (Math.min(saveCount / 20, 1) * 40) +
          (avgInv / 100 * 35) +
          (medianHeat / 100 * 25)
        ));

        // Composite score
        const compositeScore = Math.round(
          priceGrowthRate * 3 +
          buyerActivityScore * 0.3 +
          investorInterestScore * 0.4 +
          medianHeat * 0.2
        );

        // Classify market
        let marketClass: 'very_hot' | 'hot' | 'growing' | 'stable';
        if (compositeScore >= 80) marketClass = 'very_hot';
        else if (compositeScore >= 55) marketClass = 'hot';
        else if (compositeScore >= 35) marketClass = 'growing';
        else marketClass = 'stable';

        // Investment rating
        let investmentRating: string;
        if (compositeScore >= 80) investmentRating = 'Strong Buy';
        else if (compositeScore >= 60) investmentRating = 'Buy';
        else if (compositeScore >= 40) investmentRating = 'Hold';
        else investmentRating = 'Watch';

        hotspots.push({
          city: city.charAt(0).toUpperCase() + city.slice(1),
          growth_rate: priceGrowthRate,
          buyer_activity_score: buyerActivityScore,
          investor_interest_score: investorInterestScore,
          composite_score: compositeScore,
          investment_rating: investmentRating,
          market_class: marketClass,
          avg_price: avgPrice,
          median_heat_score: medianHeat,
          avg_investment_score: avgInv,
          property_count: bucket.propertyCount,
          active_listings: bucket.activeCount,
          new_listings_30d: bucket.recentListings,
          unique_buyers_30d: uniqueUsers,
          saves_30d: saveCount,
          property_types: Array.from(bucket.types),
        });
      }

      hotspots.sort((a, b) => b.composite_score - a.composite_score);

      // Summary
      const classCounts = {
        very_hot: hotspots.filter(h => h.market_class === 'very_hot').length,
        hot: hotspots.filter(h => h.market_class === 'hot').length,
        growing: hotspots.filter(h => h.market_class === 'growing').length,
        stable: hotspots.filter(h => h.market_class === 'stable').length,
      };

      return new Response(JSON.stringify({
        data: {
          hotspots,
          summary: classCounts,
          total_cities: hotspots.length,
          total_properties_analyzed: (props || []).length,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════════════════════
    // ██  PORTFOLIO MANAGER MODE
    // ═══════════════════════════════════════════════════════════
    if (mode === 'portfolio_manager') {
      const targetUserId = body.user_id || userId;
      const serviceClient = createClient(supabaseUrl, serviceKey);

      // 1. Fetch owned properties
      const { data: ownedProps } = await serviceClient
        .from('properties')
        .select('id, title, price, city, state, location, property_type, listing_type, bedrooms, bathrooms, area_sqm, thumbnail_url, investment_score, demand_heat_score, rental_yield_estimate, created_at')
        .eq('owner_id', targetUserId)
        .eq('status', 'active')
        .limit(50);

      // 2. Fetch saved/favorited properties
      const { data: savedFavs } = await serviceClient
        .from('favorites')
        .select('property_id, properties(id, title, price, city, state, location, property_type, listing_type, bedrooms, bathrooms, area_sqm, thumbnail_url, investment_score, demand_heat_score, rental_yield_estimate, created_at)')
        .eq('user_id', targetUserId)
        .limit(50);

      const savedProps = (savedFavs || [])
        .map((f: any) => f.properties)
        .filter(Boolean);

      // Merge & deduplicate
      const allMap = new Map<string, any>();
      for (const p of [...(ownedProps || []), ...savedProps]) {
        if (!allMap.has(p.id)) {
          allMap.set(p.id, { ...p, is_owned: (ownedProps || []).some((o: any) => o.id === p.id) });
        }
      }
      const properties = Array.from(allMap.values());

      if (properties.length === 0) {
        return new Response(JSON.stringify({
          data: {
            portfolio_value: 0,
            projected_value_5y: 0,
            average_roi: 0,
            risk_level: 'unknown',
            properties: [],
            generated_at: new Date().toISOString(),
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 3. Enrich each property with forecast & analysis
      const enriched = properties.map((p: any) => {
        const invScore = p.investment_score ?? 50;
        const heatScore = p.demand_heat_score ?? 40;
        const rentalYield = p.rental_yield_estimate ?? 5.0;
        const price = p.price || 0;

        // Growth forecast (5-year compound)
        const baseGrowthRate = heatScore > 75 ? 8 : heatScore > 50 ? 6 : heatScore > 30 ? 4 : 3;
        const invBonus = invScore > 80 ? 2 : invScore > 60 ? 1 : 0;
        const annualGrowth = (baseGrowthRate + invBonus) / 100;
        const projectedValue5y = Math.round(price * Math.pow(1 + annualGrowth, 5));

        // ROI = rental yield + capital appreciation
        const annualRentalIncome = price * (rentalYield / 100);
        const capitalGain5y = projectedValue5y - price;
        const totalReturn5y = (annualRentalIncome * 5) + capitalGain5y;
        const roi = price > 0 ? Math.round((totalReturn5y / price) * 100 * 10) / 10 : 0;

        // Risk factor per property
        const riskFactor = Math.round(100 - (invScore * 0.5 + heatScore * 0.3 + Math.min(rentalYield, 10) * 2));

        return {
          id: p.id,
          title: p.title,
          price,
          city: p.city,
          state: p.state,
          location: p.location,
          property_type: p.property_type,
          listing_type: p.listing_type,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          area_sqm: p.area_sqm,
          thumbnail_url: p.thumbnail_url,
          is_owned: p.is_owned,
          investment_score: invScore,
          demand_heat_score: heatScore,
          rental_yield: rentalYield,
          annual_growth_rate: Math.round(annualGrowth * 100 * 10) / 10,
          projected_value_5y: projectedValue5y,
          roi_5y: roi,
          risk_factor: riskFactor,
        };
      });

      // 4. Portfolio aggregates
      const portfolioValue = enriched.reduce((s: number, p: any) => s + p.price, 0);
      const projectedValue5y = enriched.reduce((s: number, p: any) => s + p.projected_value_5y, 0);
      const avgInvScore = enriched.reduce((s: number, p: any) => s + p.investment_score, 0) / enriched.length;
      const avgRoi = Math.round(enriched.reduce((s: number, p: any) => s + p.roi_5y, 0) / enriched.length * 10) / 10;

      // Risk classification
      let riskLevel: string;
      if (avgInvScore > 75) riskLevel = 'low';
      else if (avgInvScore >= 60) riskLevel = 'medium';
      else riskLevel = 'high';

      // Concentration penalties
      const cities = enriched.map((p: any) => p.city).filter(Boolean);
      const uniqueCities = new Set(cities);
      const types = enriched.map((p: any) => p.property_type).filter(Boolean);
      const uniqueTypes = new Set(types);
      const geoConcentration = uniqueCities.size <= 1 && enriched.length > 1;
      const typeConcentration = uniqueTypes.size <= 1 && enriched.length > 1;

      if (geoConcentration || typeConcentration) {
        if (riskLevel === 'low') riskLevel = 'medium';
        else if (riskLevel === 'medium') riskLevel = 'high';
      }

      // Sort by ROI descending
      enriched.sort((a: any, b: any) => b.roi_5y - a.roi_5y);

      // Top & weakest performers
      const topPerformer = enriched[0] || null;
      const weakestPerformer = enriched[enriched.length - 1] || null;

      return new Response(JSON.stringify({
        data: {
          portfolio_value: portfolioValue,
          projected_value_5y: projectedValue5y,
          average_roi: avgRoi,
          risk_level: riskLevel,
          avg_investment_score: Math.round(avgInvScore),
          total_properties: enriched.length,
          geo_concentration: geoConcentration,
          type_concentration: typeConcentration,
          unique_cities: Array.from(uniqueCities),
          unique_types: Array.from(uniqueTypes),
          top_performer: topPerformer ? { id: topPerformer.id, title: topPerformer.title, roi_5y: topPerformer.roi_5y } : null,
          weakest_performer: weakestPerformer && weakestPerformer.id !== topPerformer?.id ? { id: weakestPerformer.id, title: weakestPerformer.title, roi_5y: weakestPerformer.roi_5y } : null,
          properties: enriched,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════════════════════
    // ██  PROPERTY VALUATION MODE
    // ═══════════════════════════════════════════════════════════
    if (mode === 'property_valuation') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const serviceClient = createClient(supabaseUrl, serviceKey);

      // 1. Fetch target property
      const { data: target, error: tErr } = await serviceClient
        .from('properties')
        .select('id, title, price, city, state, location, property_type, building_area_sqm, land_area_sqm, area_sqm, investment_score, demand_heat_score, bedrooms, bathrooms, thumbnail_url')
        .eq('id', property_id)
        .single();

      if (tErr || !target) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const buildingArea = target.building_area_sqm || target.area_sqm || 0;
      const landArea = target.land_area_sqm || target.area_sqm || 0;
      const refArea = buildingArea > 0 ? buildingArea : landArea;

      if (refArea <= 0) {
        return new Response(JSON.stringify({
          data: {
            property_id: target.id,
            title: target.title,
            listed_price: target.price,
            estimated_value: target.price,
            confidence: 0,
            price_position: 'fair_price',
            comparables_count: 0,
            message: 'Insufficient area data for valuation',
            generated_at: new Date().toISOString(),
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2. Fetch comparables: same city, similar type, area ±20%
      const areaMin = Math.round(refArea * 0.8);
      const areaMax = Math.round(refArea * 1.2);

      let compQuery = serviceClient
        .from('properties')
        .select('id, title, price, building_area_sqm, land_area_sqm, area_sqm, property_type, city, investment_score, demand_heat_score')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .neq('id', property_id);

      if (target.city) {
        compQuery = compQuery.ilike('city', `%${target.city}%`);
      }
      if (target.property_type) {
        compQuery = compQuery.eq('property_type', target.property_type);
      }

      const { data: comps } = await compQuery.limit(200);

      // Filter by area range in JS (handles building_area_sqm/land_area_sqm/area_sqm)
      const validComps = (comps || []).filter((c: any) => {
        const cArea = c.building_area_sqm || c.area_sqm || c.land_area_sqm || 0;
        return cArea >= areaMin && cArea <= areaMax && c.price > 0;
      });

      // 3. Calculate avg price per m²
      let avgPricePerSqm = 0;
      let estimatedValue = target.price;
      const comparablesCount = validComps.length;

      if (comparablesCount > 0) {
        const pricesPerSqm = validComps.map((c: any) => {
          const cArea = c.building_area_sqm || c.area_sqm || c.land_area_sqm || 1;
          return c.price / cArea;
        });
        avgPricePerSqm = pricesPerSqm.reduce((s: number, v: number) => s + v, 0) / pricesPerSqm.length;
        estimatedValue = Math.round(avgPricePerSqm * refArea);
      }

      // 4. Adjust by demand_heat_score & investment_score
      const heatScore = target.demand_heat_score ?? 50;
      const invScore = target.investment_score ?? 50;

      // Demand multiplier: hot markets push value up
      const demandMultiplier = heatScore > 75 ? 1.08 : heatScore > 50 ? 1.03 : heatScore > 30 ? 1.0 : 0.97;
      // Investment quality bonus
      const invMultiplier = invScore > 80 ? 1.05 : invScore > 60 ? 1.02 : 1.0;

      const adjustedValue = Math.round(estimatedValue * demandMultiplier * invMultiplier);

      // 5. Confidence score based on comparables count
      let confidence: number;
      if (comparablesCount >= 10) confidence = 95;
      else if (comparablesCount >= 5) confidence = 80;
      else if (comparablesCount >= 3) confidence = 65;
      else if (comparablesCount >= 1) confidence = 45;
      else confidence = 15;

      // 6. Price position
      const ratio = target.price / (adjustedValue || target.price);
      let pricePosition: string;
      if (ratio < 0.85) pricePosition = 'undervalued';
      else if (ratio > 1.15) pricePosition = 'overpriced';
      else pricePosition = 'fair_price';

      // Deviation percentage
      const deviationPercent = Math.round((ratio - 1) * 100);

      // Top comparables for transparency
      const topComps = validComps.slice(0, 5).map((c: any) => {
        const cArea = c.building_area_sqm || c.area_sqm || c.land_area_sqm || 1;
        return {
          id: c.id,
          title: c.title,
          price: c.price,
          area: cArea,
          price_per_sqm: Math.round(c.price / cArea),
          city: c.city,
        };
      });

      return new Response(JSON.stringify({
        data: {
          property_id: target.id,
          title: target.title,
          city: target.city,
          property_type: target.property_type,
          building_area: buildingArea,
          land_area: landArea,
          listed_price: target.price,
          estimated_value: adjustedValue,
          avg_price_per_sqm: Math.round(avgPricePerSqm),
          confidence,
          price_position: pricePosition,
          deviation_percent: deviationPercent,
          demand_heat_score: heatScore,
          investment_score: invScore,
          demand_multiplier: demandMultiplier,
          investment_multiplier: invMultiplier,
          comparables_count: comparablesCount,
          top_comparables: topComps,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════════════════════
    // ██  RENTAL YIELD PREDICTOR MODE
    // ═══════════════════════════════════════════════════════════
    if (mode === 'rental_yield_predictor') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const serviceClient = createClient(supabaseUrl, serviceKey);

      // 1. Fetch target property
      const { data: target, error: tErr } = await serviceClient
        .from('properties')
        .select('id, title, price, city, state, property_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, area_sqm, investment_score, demand_heat_score, thumbnail_url')
        .eq('id', property_id)
        .single();

      if (tErr || !target) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const propertyPrice = target.price || 0;
      const bedrooms = target.bedrooms ?? 2;
      const buildingArea = target.building_area_sqm || target.area_sqm || target.land_area_sqm || 0;
      const heatScore = target.demand_heat_score ?? 50;
      const invScore = target.investment_score ?? 50;

      // 2. Fetch comparable rental listings (same city, similar type, bedrooms ±1)
      let compQuery = serviceClient
        .from('properties')
        .select('id, title, price, bedrooms, building_area_sqm, area_sqm, land_area_sqm, city, property_type, demand_heat_score')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .eq('listing_type', 'rent')
        .neq('id', property_id);

      if (target.city) {
        compQuery = compQuery.ilike('city', `%${target.city}%`);
      }
      if (target.property_type) {
        compQuery = compQuery.eq('property_type', target.property_type);
      }

      const { data: rentComps } = await compQuery.limit(200);

      // Filter by bedrooms ±1
      const validComps = (rentComps || []).filter((c: any) => {
        const cBeds = c.bedrooms ?? 2;
        return Math.abs(cBeds - bedrooms) <= 1 && c.price > 0;
      });

      // 3. Calculate average monthly rent
      let avgMonthlyRent = 0;
      let rentSource = 'estimated';

      if (validComps.length > 0) {
        // Rental listings price = monthly rent
        avgMonthlyRent = Math.round(
          validComps.reduce((s: number, c: any) => s + c.price, 0) / validComps.length
        );
        rentSource = 'market_comparables';
      } else {
        // Fallback: estimate from property value using typical Indonesian yields
        // Bali/tourist areas ~6-8%, Jakarta ~4-5%, other ~3-5%
        const cityLower = (target.city || '').toLowerCase();
        const isTourist = ['bali', 'denpasar', 'seminyak', 'canggu', 'ubud', 'kuta', 'nusa dua', 'lombok', 'yogyakarta'].some(c => cityLower.includes(c));
        const isCapital = ['jakarta', 'surabaya', 'bandung', 'medan'].some(c => cityLower.includes(c));

        let baseYieldPct = isTourist ? 7 : isCapital ? 4.5 : 3.5;
        avgMonthlyRent = Math.round((propertyPrice * (baseYieldPct / 100)) / 12);
        rentSource = 'ai_estimated';
      }

      const annualRent = avgMonthlyRent * 12;

      // 4. Rental yield
      const rentalYieldPercent = propertyPrice > 0
        ? Math.round((annualRent / propertyPrice) * 100 * 100) / 100
        : 0;

      // 5. Occupancy rate estimation
      // Base occupancy by market heat + tourism factor
      const cityLower = (target.city || '').toLowerCase();
      const isTouristCity = ['bali', 'denpasar', 'seminyak', 'canggu', 'ubud', 'kuta', 'nusa dua', 'lombok'].some(c => cityLower.includes(c));

      let baseOccupancy: number;
      if (heatScore > 75) baseOccupancy = 90;
      else if (heatScore > 50) baseOccupancy = 80;
      else if (heatScore > 30) baseOccupancy = 70;
      else baseOccupancy = 60;

      // Tourism bonus
      if (isTouristCity) baseOccupancy = Math.min(baseOccupancy + 8, 98);
      // Investment score adjustment
      if (invScore > 80) baseOccupancy = Math.min(baseOccupancy + 5, 98);
      else if (invScore < 40) baseOccupancy = Math.max(baseOccupancy - 5, 40);

      const occupancyRate = baseOccupancy;

      // 6. Effective annual income (adjusted for occupancy)
      const effectiveAnnualRent = Math.round(annualRent * (occupancyRate / 100));
      const effectiveYieldPercent = propertyPrice > 0
        ? Math.round((effectiveAnnualRent / propertyPrice) * 100 * 100) / 100
        : 0;

      // 7. Net yield estimate (after typical expenses ~20-25%)
      const expenseRatio = 0.22; // maintenance, management, taxes
      const netAnnualRent = Math.round(effectiveAnnualRent * (1 - expenseRatio));
      const netYieldPercent = propertyPrice > 0
        ? Math.round((netAnnualRent / propertyPrice) * 100 * 100) / 100
        : 0;

      // Yield classification
      let yieldRating: string;
      if (rentalYieldPercent >= 7) yieldRating = 'excellent';
      else if (rentalYieldPercent >= 5) yieldRating = 'good';
      else if (rentalYieldPercent >= 3) yieldRating = 'average';
      else yieldRating = 'below_average';

      // Top comparables
      const topComps = validComps.slice(0, 5).map((c: any) => ({
        id: c.id,
        title: c.title,
        monthly_rent: c.price,
        bedrooms: c.bedrooms,
        city: c.city,
      }));

      return new Response(JSON.stringify({
        data: {
          property_id: target.id,
          title: target.title,
          city: target.city,
          property_type: target.property_type,
          bedrooms,
          building_area: buildingArea,
          property_price: propertyPrice,
          monthly_rent_estimate: avgMonthlyRent,
          annual_rent: annualRent,
          rental_yield_percent: rentalYieldPercent,
          occupancy_rate: occupancyRate,
          effective_annual_rent: effectiveAnnualRent,
          effective_yield_percent: effectiveYieldPercent,
          net_annual_rent: netAnnualRent,
          net_yield_percent: netYieldPercent,
          yield_rating: yieldRating,
          rent_source: rentSource,
          demand_heat_score: heatScore,
          investment_score: invScore,
          is_tourist_city: isTouristCity,
          comparables_count: validComps.length,
          top_comparables: topComps,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════════════════════
    // ██  MARKET TREND PREDICTOR MODE
    // ═══════════════════════════════════════════════════════════
    if (mode === 'market_trend_predictor') {
      const city = body.city || reqCity;
      if (!city) {
        return new Response(JSON.stringify({ error: 'city required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const serviceClient = createClient(supabaseUrl, serviceKey);

      // 1. Current market snapshot — active properties in city
      const { data: cityProps } = await serviceClient
        .from('properties')
        .select('id, price, property_type, investment_score, demand_heat_score, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .ilike('city', `%${city}%`)
        .limit(500);

      const props = cityProps || [];

      if (props.length === 0) {
        return new Response(JSON.stringify({
          data: {
            city,
            total_properties: 0,
            market_status: 'insufficient_data',
            message: 'No active properties found for this city',
            generated_at: new Date().toISOString(),
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // 2. Price history (90 days) for trend analysis
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const { data: priceHistory } = await serviceClient
        .from('property_price_history')
        .select('property_id, old_price, new_price, changed_at')
        .in('property_id', props.map((p: any) => p.id))
        .gte('changed_at', ninetyDaysAgo)
        .order('changed_at', { ascending: true })
        .limit(500);

      // 3. Behavioral signals (30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: behaviors } = await serviceClient
        .from('ai_behavior_tracking')
        .select('event_type, property_id, created_at')
        .in('property_id', props.map((p: any) => p.id))
        .gte('created_at', thirtyDaysAgo)
        .limit(1000);

      // 4. Saved/favorites count as investor interest
      const { count: savedCount } = await serviceClient
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .in('property_id', props.map((p: any) => p.id));

      // ── Calculations ──

      // Price growth rate from history
      let priceGrowthRate = 0;
      const history = priceHistory || [];
      if (history.length > 0) {
        const increases = history.filter((h: any) => h.new_price > h.old_price).length;
        const decreases = history.filter((h: any) => h.new_price < h.old_price).length;
        const avgChange = history.reduce((s: number, h: any) => {
          return s + ((h.new_price - h.old_price) / (h.old_price || 1)) * 100;
        }, 0) / history.length;
        priceGrowthRate = Math.round(avgChange * 10) / 10;
      } else {
        // Estimate from demand heat
        const avgHeat = props.reduce((s: number, p: any) => s + (p.demand_heat_score ?? 50), 0) / props.length;
        priceGrowthRate = avgHeat > 75 ? 8 : avgHeat > 50 ? 5 : avgHeat > 30 ? 2 : 0;
      }

      // Buyer activity
      const behaviorList = behaviors || [];
      const views = behaviorList.filter((b: any) => b.event_type === 'view' || b.event_type === 'property_view').length;
      const contacts = behaviorList.filter((b: any) => b.event_type === 'contact' || b.event_type === 'inquiry').length;
      const saves = behaviorList.filter((b: any) => b.event_type === 'save' || b.event_type === 'favorite').length;
      const buyerActivityScore = Math.min(100, Math.round((views * 1 + contacts * 5 + saves * 3) / Math.max(props.length, 1)));

      // Buyer activity growth (proxy: activity per property)
      const buyerActivityGrowth = buyerActivityScore > 60 ? 'increasing' : buyerActivityScore > 30 ? 'stable' : 'decreasing';

      // Investor interest
      const investorInterest = Math.min(100, Math.round(((savedCount || 0) / Math.max(props.length, 1)) * 50));

      // Avg scores
      const avgInvScore = Math.round(props.reduce((s: number, p: any) => s + (p.investment_score ?? 50), 0) / props.length);
      const avgHeatScore = Math.round(props.reduce((s: number, p: any) => s + (p.demand_heat_score ?? 50), 0) / props.length);
      const medianPrice = props.map((p: any) => p.price).sort((a: number, b: number) => a - b)[Math.floor(props.length / 2)] || 0;

      // 12-month forecast (simple moving average extrapolation)
      const monthlyForecasts: { month: number; price_index: number; demand_index: number }[] = [];
      for (let m = 1; m <= 12; m++) {
        const monthlyGrowth = priceGrowthRate / 12;
        const compoundedPrice = Math.round(100 * Math.pow(1 + monthlyGrowth / 100, m) * 10) / 10;
        const demandDecay = avgHeatScore > 70 ? 0.2 : avgHeatScore > 40 ? 0 : -0.3;
        const demandIndex = Math.round((avgHeatScore + demandDecay * m) * 10) / 10;
        monthlyForecasts.push({
          month: m,
          price_index: compoundedPrice,
          demand_index: Math.max(0, Math.min(100, demandIndex)),
        });
      }

      // Demand growth forecast
      const demandGrowthForecast = avgHeatScore > 70
        ? Math.round((avgHeatScore - 50) * 0.4 * 10) / 10
        : avgHeatScore > 40
        ? Math.round((avgHeatScore - 40) * 0.2 * 10) / 10
        : -Math.round((40 - avgHeatScore) * 0.3 * 10) / 10;

      // Market classification
      let marketStatus: string;
      if (priceGrowthRate > 8 && avgHeatScore > 70) marketStatus = 'booming';
      else if (priceGrowthRate > 3 || avgHeatScore > 55) marketStatus = 'growing';
      else if (priceGrowthRate >= 0 && avgHeatScore >= 30) marketStatus = 'stable';
      else marketStatus = 'declining';

      // Property type distribution
      const typeCounts: Record<string, number> = {};
      props.forEach((p: any) => {
        const t = p.property_type || 'unknown';
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });

      // New listings trend (last 30 vs previous 30 days)
      const thirtyAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const sixtyAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
      const recentListings = props.filter((p: any) => new Date(p.created_at).getTime() > thirtyAgo).length;
      const olderListings = props.filter((p: any) => {
        const t = new Date(p.created_at).getTime();
        return t > sixtyAgo && t <= thirtyAgo;
      }).length;
      const supplyTrend = recentListings > olderListings * 1.2 ? 'increasing' : recentListings < olderListings * 0.8 ? 'decreasing' : 'stable';

      return new Response(JSON.stringify({
        data: {
          city,
          total_properties: props.length,
          median_price: medianPrice,
          avg_investment_score: avgInvScore,
          avg_demand_heat: avgHeatScore,
          price_growth_forecast: priceGrowthRate,
          demand_growth_forecast: demandGrowthForecast,
          market_status: marketStatus,
          buyer_activity_score: buyerActivityScore,
          buyer_activity_trend: buyerActivityGrowth,
          investor_interest_score: investorInterest,
          supply_trend: supplyTrend,
          recent_listings_30d: recentListings,
          property_type_distribution: typeCounts,
          monthly_forecasts: monthlyForecasts,
          price_changes_90d: history.length,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════════════════════
    // ██  SUPER ENGINE MODE — Unified Intelligence Pipeline
    // ═══════════════════════════════════════════════════════════
    if (mode === 'super_engine') {
      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const serviceClient = createClient(supabaseUrl, serviceKey);

      // 1. Fetch property (single query — shared by all sub-models)
      const { data: prop, error: pErr } = await serviceClient
        .from('properties')
        .select('id, title, price, city, state, location, property_type, listing_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, area_sqm, investment_score, demand_heat_score, rental_yield_estimate, thumbnail_url, created_at')
        .eq('id', property_id)
        .single();

      if (pErr || !prop) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const price = prop.price || 0;
      const buildingArea = prop.building_area_sqm || prop.area_sqm || prop.land_area_sqm || 0;
      const landArea = prop.land_area_sqm || prop.area_sqm || 0;
      const refArea = buildingArea > 0 ? buildingArea : landArea;
      const bedrooms = prop.bedrooms ?? 2;
      const heatScore = prop.demand_heat_score ?? 50;
      const invScore = prop.investment_score ?? 50;
      const rentalYieldEst = prop.rental_yield_estimate ?? 5.0;
      const city = prop.city || '';

      // 2. Parallel data fetches
      const areaMin = Math.round(refArea * 0.8);
      const areaMax = Math.round(refArea * 1.2);

      const [valuationCompsRes, rentalCompsRes, similarRes, priceHistRes, behaviorRes] = await Promise.all([
        // Valuation comparables (same city, type, area ±20%)
        serviceClient
          .from('properties')
          .select('id, title, price, building_area_sqm, land_area_sqm, area_sqm, property_type, city, investment_score, demand_heat_score')
          .eq('status', 'active').eq('approval_status', 'approved')
          .neq('id', property_id)
          .ilike('city', `%${city}%`)
          .eq('property_type', prop.property_type || '')
          .limit(200),

        // Rental comparables (rent listings, same city, type, beds ±1)
        serviceClient
          .from('properties')
          .select('id, title, price, bedrooms, city, property_type')
          .eq('status', 'active').eq('approval_status', 'approved')
          .eq('listing_type', 'rent')
          .neq('id', property_id)
          .ilike('city', `%${city}%`)
          .eq('property_type', prop.property_type || '')
          .limit(100),

        // Similar properties for recommendations
        serviceClient
          .from('properties')
          .select('id, title, price, city, property_type, bedrooms, investment_score, demand_heat_score, thumbnail_url')
          .eq('status', 'active').eq('approval_status', 'approved')
          .neq('id', property_id)
          .ilike('city', `%${city}%`)
          .limit(50),

        // Price history (90d)
        serviceClient
          .from('property_price_history')
          .select('old_price, new_price, changed_at')
          .eq('property_id', property_id)
          .gte('changed_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
          .order('changed_at', { ascending: true })
          .limit(100),

        // Market behavior (30d)
        serviceClient
          .from('ai_behavior_tracking')
          .select('event_type')
          .eq('property_id', property_id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .limit(500),
      ]);

      // ═══ VALUATION MODEL ═══
      const valComps = (valuationCompsRes.data || []).filter((c: any) => {
        const cArea = c.building_area_sqm || c.area_sqm || c.land_area_sqm || 0;
        return cArea >= areaMin && cArea <= areaMax && c.price > 0;
      });

      let avgPricePerSqm = 0;
      let estimatedValue = price;
      if (valComps.length > 0 && refArea > 0) {
        avgPricePerSqm = valComps.reduce((s: number, c: any) => {
          const cA = c.building_area_sqm || c.area_sqm || c.land_area_sqm || 1;
          return s + c.price / cA;
        }, 0) / valComps.length;
        estimatedValue = Math.round(avgPricePerSqm * refArea);
      }

      const demandMul = heatScore > 75 ? 1.08 : heatScore > 50 ? 1.03 : heatScore > 30 ? 1.0 : 0.97;
      const invMul = invScore > 80 ? 1.05 : invScore > 60 ? 1.02 : 1.0;
      const adjustedValue = Math.round(estimatedValue * demandMul * invMul);

      let valConfidence: number;
      if (valComps.length >= 10) valConfidence = 95;
      else if (valComps.length >= 5) valConfidence = 80;
      else if (valComps.length >= 3) valConfidence = 65;
      else if (valComps.length >= 1) valConfidence = 45;
      else valConfidence = 15;

      const priceRatio = price / (adjustedValue || price);
      const pricePosition = priceRatio < 0.85 ? 'undervalued' : priceRatio > 1.15 ? 'overpriced' : 'fair_price';

      const valuation = {
        estimated_value: adjustedValue,
        listed_price: price,
        avg_price_per_sqm: Math.round(avgPricePerSqm),
        confidence: valConfidence,
        price_position: pricePosition,
        deviation_percent: Math.round((priceRatio - 1) * 100),
        comparables_count: valComps.length,
      };

      // ═══ RENTAL YIELD ═══
      const rentComps = (rentalCompsRes.data || []).filter((c: any) => {
        const cBeds = c.bedrooms ?? 2;
        return Math.abs(cBeds - bedrooms) <= 1 && c.price > 0;
      });

      let monthlyRent = 0;
      let rentSource = 'ai_estimated';
      if (rentComps.length > 0) {
        monthlyRent = Math.round(rentComps.reduce((s: number, c: any) => s + c.price, 0) / rentComps.length);
        rentSource = 'market_comparables';
      } else {
        const cl = city.toLowerCase();
        const isTourist = ['bali', 'denpasar', 'seminyak', 'canggu', 'ubud', 'kuta', 'lombok'].some(c => cl.includes(c));
        const isCapital = ['jakarta', 'surabaya', 'bandung', 'medan'].some(c => cl.includes(c));
        const baseYield = isTourist ? 7 : isCapital ? 4.5 : 3.5;
        monthlyRent = Math.round((price * (baseYield / 100)) / 12);
      }

      const annualRent = monthlyRent * 12;
      const grossYield = price > 0 ? Math.round((annualRent / price) * 100 * 100) / 100 : 0;

      const cl = city.toLowerCase();
      const isTouristCity = ['bali', 'denpasar', 'seminyak', 'canggu', 'ubud', 'kuta', 'lombok'].some(c => cl.includes(c));
      let occupancy = heatScore > 75 ? 90 : heatScore > 50 ? 80 : heatScore > 30 ? 70 : 60;
      if (isTouristCity) occupancy = Math.min(occupancy + 8, 98);
      if (invScore > 80) occupancy = Math.min(occupancy + 5, 98);

      const effectiveAnnual = Math.round(annualRent * (occupancy / 100));
      const netAnnual = Math.round(effectiveAnnual * 0.78);
      const netYield = price > 0 ? Math.round((netAnnual / price) * 100 * 100) / 100 : 0;

      const rentalYield = {
        monthly_rent_estimate: monthlyRent,
        annual_rent: annualRent,
        rental_yield_percent: grossYield,
        occupancy_rate: occupancy,
        effective_annual_rent: effectiveAnnual,
        net_yield_percent: netYield,
        yield_rating: grossYield >= 7 ? 'excellent' : grossYield >= 5 ? 'good' : grossYield >= 3 ? 'average' : 'below_average',
        rent_source: rentSource,
        comparables_count: rentComps.length,
      };

      // ═══ DEAL DETECTOR ═══
      const dealScorePercent = adjustedValue > 0
        ? Math.round(((adjustedValue - price) / adjustedValue) * 100 * 10) / 10
        : 0;

      let dealRating: string;
      if (dealScorePercent >= 15) dealRating = 'exceptional_deal';
      else if (dealScorePercent >= 10) dealRating = 'strong_deal';
      else if (dealScorePercent >= 5) dealRating = 'good_deal';
      else if (dealScorePercent >= -5) dealRating = 'fair';
      else if (dealScorePercent >= -15) dealRating = 'slightly_overpriced';
      else dealRating = 'overpriced';

      const deal = {
        deal_score_percent: dealScorePercent,
        deal_rating: dealRating,
        estimated_value: adjustedValue,
        listed_price: price,
        potential_savings: Math.max(0, adjustedValue - price),
      };

      // ═══ MARKET TREND ═══
      const history = priceHistRes.data || [];
      let priceGrowthRate = 0;
      if (history.length > 0) {
        priceGrowthRate = Math.round(
          (history.reduce((s: number, h: any) => s + ((h.new_price - h.old_price) / (h.old_price || 1)) * 100, 0) / history.length) * 10
        ) / 10;
      } else {
        priceGrowthRate = heatScore > 75 ? 8 : heatScore > 50 ? 5 : heatScore > 30 ? 2 : 0;
      }

      const bList = behaviorRes.data || [];
      const buyerActivity = Math.min(100, Math.round(
        (bList.filter((b: any) => b.event_type === 'view' || b.event_type === 'property_view').length * 1 +
         bList.filter((b: any) => b.event_type === 'contact' || b.event_type === 'inquiry').length * 5 +
         bList.filter((b: any) => b.event_type === 'save' || b.event_type === 'favorite').length * 3)
      ));

      let marketStatus: string;
      if (priceGrowthRate > 8 && heatScore > 70) marketStatus = 'booming';
      else if (priceGrowthRate > 3 || heatScore > 55) marketStatus = 'growing';
      else if (priceGrowthRate >= 0 && heatScore >= 30) marketStatus = 'stable';
      else marketStatus = 'declining';

      const marketTrend = {
        city,
        price_growth_forecast: priceGrowthRate,
        demand_heat_score: heatScore,
        buyer_activity_score: buyerActivity,
        market_status: marketStatus,
        price_changes_90d: history.length,
      };

      // ═══ RECOMMENDATIONS ═══
      const simProps = (similarRes.data || []) as any[];
      const scored = simProps.map((s: any) => {
        let score = 0;
        if (s.city?.toLowerCase() === city.toLowerCase()) score += 25;
        if (s.property_type === prop.property_type) score += 20;
        if (s.price > 0 && price > 0 && Math.abs(s.price - price) / price <= 0.25) score += 20;
        if (s.bedrooms != null && Math.abs((s.bedrooms ?? 0) - bedrooms) <= 1) score += 10;
        score += Math.min(25, ((s.investment_score ?? 0) / 4));
        return { ...s, similarity_score: Math.round(score) };
      });
      scored.sort((a: any, b: any) => b.similarity_score - a.similarity_score);

      const recommendations = scored.slice(0, 5).map((s: any) => ({
        id: s.id,
        title: s.title,
        price: s.price,
        city: s.city,
        property_type: s.property_type,
        bedrooms: s.bedrooms,
        investment_score: s.investment_score,
        demand_heat_score: s.demand_heat_score,
        thumbnail_url: s.thumbnail_url,
        similarity_score: s.similarity_score,
      }));

      // ═══ COMBINED RESPONSE ═══
      // Overall investment grade
      const overallScore = Math.round(
        invScore * 0.25 +
        (grossYield / 10) * 100 * 0.2 +
        Math.max(0, dealScorePercent + 20) * 0.2 +
        heatScore * 0.2 +
        valConfidence * 0.15
      );

      let investmentGrade: string;
      if (overallScore >= 80) investmentGrade = 'A+';
      else if (overallScore >= 70) investmentGrade = 'A';
      else if (overallScore >= 60) investmentGrade = 'B+';
      else if (overallScore >= 50) investmentGrade = 'B';
      else if (overallScore >= 40) investmentGrade = 'C';
      else investmentGrade = 'D';

      return new Response(JSON.stringify({
        data: {
          property_id: prop.id,
          title: prop.title,
          city,
          property_type: prop.property_type,
          thumbnail_url: prop.thumbnail_url,
          overall_score: overallScore,
          investment_grade: investmentGrade,
          valuation,
          rental_yield: rentalYield,
          deal_rating: deal,
          market_trend: marketTrend,
          recommendations,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════════════════════
    // ██  AUTONOMOUS REAL ESTATE AGENT
    // ═══════════════════════════════════════════════════════════
    if (mode === 'autonomous_agent') {
      const userQuery = body.user_query || '';
      const userBudget = body.user_budget || 0;
      const preferredLocation = body.preferred_location || '';
      const riskTolerance = body.risk_tolerance || 'medium';

      const serviceClient = createClient(supabaseUrl, serviceKey);

      // ── Phase 1: Intent Parsing via Gemini ──
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      let parsedIntent = {
        investment_goal: 'capital_growth',
        budget_min: 0,
        budget_max: userBudget || 50_000_000_000,
        location: preferredLocation,
        risk_tolerance: riskTolerance,
        property_types: [] as string[],
        bedrooms_min: 0,
        strategy_preference: 'balanced',
      };

      if (userQuery && LOVABLE_API_KEY) {
        try {
          const intentRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-3-flash-preview',
              messages: [
                { role: 'system', content: 'You are an Indonesian real estate investment intent parser. Extract structured criteria from user queries. Budget in IDR (miliar=billion, juta=million). Default risk: medium.' },
                { role: 'user', content: userQuery },
              ],
              tools: [{
                type: 'function',
                function: {
                  name: 'parse_investment_intent',
                  description: 'Extract investment intent from user query',
                  parameters: {
                    type: 'object',
                    properties: {
                      investment_goal: { type: 'string', enum: ['capital_growth', 'rental_income', 'flip', 'retirement', 'diversification'] },
                      budget_min: { type: 'number', description: 'Min budget in IDR' },
                      budget_max: { type: 'number', description: 'Max budget in IDR' },
                      location: { type: 'string' },
                      risk_tolerance: { type: 'string', enum: ['low', 'medium', 'high'] },
                      property_types: { type: 'array', items: { type: 'string' } },
                      bedrooms_min: { type: 'number' },
                      strategy_preference: { type: 'string', enum: ['max_roi', 'balanced', 'conservative', 'diversified'] },
                    },
                    required: ['investment_goal', 'budget_max', 'location'],
                    additionalProperties: false,
                  },
                },
              }],
              tool_choice: { type: 'function', function: { name: 'parse_investment_intent' } },
            }),
          });

          if (intentRes.ok) {
            const intentData = await intentRes.json();
            const toolCall = intentData.choices?.[0]?.message?.tool_calls?.[0];
            if (toolCall?.function?.arguments) {
              const parsed = JSON.parse(toolCall.function.arguments);
              parsedIntent = { ...parsedIntent, ...parsed };
            }
          } else {
            await intentRes.text();
          }
        } catch (e) {
          console.error('Intent parsing error:', e);
        }
      }

      // Apply overrides from explicit params
      if (userBudget > 0) parsedIntent.budget_max = userBudget;
      if (preferredLocation) parsedIntent.location = preferredLocation;
      if (riskTolerance) parsedIntent.risk_tolerance = riskTolerance;

      // ── Phase 2: Fetch candidate properties ──
      let propQuery = serviceClient
        .from('properties')
        .select('id, title, price, city, state, location, property_type, listing_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, area_sqm, investment_score, demand_heat_score, rental_yield_estimate, thumbnail_url, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .lte('price', parsedIntent.budget_max);

      if (parsedIntent.budget_min > 0) {
        propQuery = propQuery.gte('price', parsedIntent.budget_min);
      }
      if (parsedIntent.location) {
        propQuery = propQuery.or(`city.ilike.%${parsedIntent.location}%,state.ilike.%${parsedIntent.location}%,location.ilike.%${parsedIntent.location}%`);
      }
      if (parsedIntent.property_types.length > 0) {
        propQuery = propQuery.in('property_type', parsedIntent.property_types);
      }

      const { data: candidates } = await propQuery
        .order('investment_score', { ascending: false })
        .limit(100);

      const props = (candidates || []) as any[];

      if (props.length === 0) {
        return new Response(JSON.stringify({
          data: {
            intent: parsedIntent,
            strategies: [],
            summary: 'No properties found matching your criteria. Try adjusting your budget or location.',
            generated_at: new Date().toISOString(),
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ── Phase 3: Score & enrich each property ──
      const riskThreshold = parsedIntent.risk_tolerance === 'low' ? 40 : parsedIntent.risk_tolerance === 'high' ? 100 : 65;

      const enriched = props.map((p: any) => {
        const invScore = p.investment_score ?? 50;
        const heatScore = p.demand_heat_score ?? 50;
        const rentalYield = p.rental_yield_estimate ?? 5.0;
        const price = p.price || 0;
        const buildingArea = p.building_area_sqm || p.area_sqm || p.land_area_sqm || 0;

        // Risk factor
        const riskFactor = Math.round(100 - (invScore * 0.5 + heatScore * 0.3 + Math.min(rentalYield, 10) * 2));

        // Growth forecast
        const baseGrowth = heatScore > 75 ? 8 : heatScore > 50 ? 6 : heatScore > 30 ? 4 : 3;
        const invBonus = invScore > 80 ? 2 : invScore > 60 ? 1 : 0;
        const annualGrowth = (baseGrowth + invBonus) / 100;
        const projectedValue5y = Math.round(price * Math.pow(1 + annualGrowth, 5));

        // ROI
        const annualRental = price * (rentalYield / 100);
        const totalReturn5y = (annualRental * 5) + (projectedValue5y - price);
        const roi5y = price > 0 ? Math.round((totalReturn5y / price) * 100 * 10) / 10 : 0;

        // Deal score
        const dealScore = invScore > 70 && heatScore > 60 ? 'strong' : invScore > 50 ? 'fair' : 'weak';

        return {
          id: p.id, title: p.title, price, city: p.city, state: p.state,
          property_type: p.property_type, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
          building_area: buildingArea, thumbnail_url: p.thumbnail_url,
          investment_score: invScore, demand_heat_score: heatScore,
          rental_yield: rentalYield, risk_factor: riskFactor,
          annual_growth_rate: Math.round(annualGrowth * 100 * 10) / 10,
          projected_value_5y: projectedValue5y, roi_5y: roi5y,
          deal_quality: dealScore,
        };
      }).filter((p: any) => p.risk_factor <= riskThreshold);

      // ── Phase 4: Build strategies ──
      const buildStrategy = (
        pool: any[], name: string, desc: string, maxProps: number
      ) => {
        const selected: any[] = [];
        let totalInvestment = 0;
        const sorted = [...pool];
        for (const p of sorted) {
          if (selected.length >= maxProps) break;
          if (totalInvestment + p.price <= parsedIntent.budget_max) {
            selected.push(p);
            totalInvestment += p.price;
          }
        }
        if (selected.length === 0) return null;

        const projectedValue5y = selected.reduce((s: number, p: any) => s + p.projected_value_5y, 0);
        const avgRoi = Math.round(selected.reduce((s: number, p: any) => s + p.roi_5y, 0) / selected.length * 10) / 10;
        const avgRisk = Math.round(selected.reduce((s: number, p: any) => s + p.risk_factor, 0) / selected.length);
        const cities = [...new Set(selected.map((p: any) => p.city).filter(Boolean))];

        return {
          name, description: desc,
          properties: selected,
          total_investment: totalInvestment,
          projected_roi: avgRoi,
          projected_value_5y: projectedValue5y,
          avg_risk_factor: avgRisk,
          diversification: { cities, property_count: selected.length },
        };
      };

      // Sort pools
      const roiPool = [...enriched].sort((a, b) => b.roi_5y - a.roi_5y);
      const balancedPool = [...enriched].sort((a, b) => {
        const aScore = a.roi_5y * 0.4 + (100 - a.risk_factor) * 0.3 + a.investment_score * 0.3;
        const bScore = b.roi_5y * 0.4 + (100 - b.risk_factor) * 0.3 + b.investment_score * 0.3;
        return bScore - aScore;
      });
      const safePool = [...enriched].sort((a, b) => a.risk_factor - b.risk_factor);
      const yieldPool = [...enriched].sort((a, b) => b.rental_yield - a.rental_yield);

      // Diversified pool (spread across cities)
      const cityGroups: Record<string, any[]> = {};
      enriched.forEach((p: any) => {
        const c = p.city || 'other';
        if (!cityGroups[c]) cityGroups[c] = [];
        cityGroups[c].push(p);
      });
      const diversePool: any[] = [];
      const cityKeys = Object.keys(cityGroups);
      let idx = 0;
      while (diversePool.length < enriched.length) {
        const cityKey = cityKeys[idx % cityKeys.length];
        const cityArr = cityGroups[cityKey];
        if (cityArr.length > 0) diversePool.push(cityArr.shift()!);
        idx++;
        if (Object.values(cityGroups).every(arr => arr.length === 0)) break;
      }

      const strategies = [
        buildStrategy(roiPool, 'Maximum ROI', 'Aggressive growth strategy targeting highest returns', 5),
        buildStrategy(balancedPool, 'Balanced Growth', 'Risk-adjusted portfolio balancing ROI and stability', 5),
        buildStrategy(safePool, 'Conservative', 'Low-risk defensive strategy prioritizing capital preservation', 4),
        buildStrategy(yieldPool, 'Rental Income', 'Cashflow-focused strategy maximizing rental yields', 4),
        buildStrategy(diversePool, 'Diversified Portfolio', 'Geographic and asset diversification for risk spread', 6),
      ].filter(Boolean);

      // Rank strategies by composite score
      strategies.sort((a: any, b: any) => {
        const aComposite = a.projected_roi * 0.5 + (100 - a.avg_risk_factor) * 0.3 + a.properties.length * 2;
        const bComposite = b.projected_roi * 0.5 + (100 - b.avg_risk_factor) * 0.3 + b.properties.length * 2;
        return bComposite - aComposite;
      });

      // ── Phase 5: AI Summary ──
      let summary = `Found ${enriched.length} properties in ${parsedIntent.location || 'all locations'} within your budget. Generated ${strategies.length} investment strategies ranked by ROI and risk profile.`;

      if (LOVABLE_API_KEY && strategies.length > 0) {
        try {
          const summaryRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-3-flash-preview',
              messages: [
                { role: 'system', content: 'You are ASTRA, an expert Indonesian real estate investment advisor. Write a concise 3-4 sentence investment summary in English. Be specific about numbers. No markdown.' },
                { role: 'user', content: JSON.stringify({
                  query: userQuery,
                  intent: parsedIntent,
                  top_strategy: strategies[0],
                  total_candidates: enriched.length,
                  market_heat: enriched.length > 0 ? Math.round(enriched.reduce((s: number, p: any) => s + p.demand_heat_score, 0) / enriched.length) : 0,
                }) },
              ],
            }),
          });

          if (summaryRes.ok) {
            const summaryData = await summaryRes.json();
            const content = summaryData.choices?.[0]?.message?.content;
            if (content) summary = content;
          } else {
            await summaryRes.text();
          }
        } catch (e) {
          console.error('Summary generation error:', e);
        }
      }

      return new Response(JSON.stringify({
        data: {
          intent: parsedIntent,
          total_candidates: enriched.length,
          strategies,
          summary,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════════════════════
    // ██  KNOWLEDGE NETWORK MODE
    // ═══════════════════════════════════════════════════════════
    if (mode === 'knowledge_network') {
      const serviceClient = createClient(supabaseUrl, serviceKey);

      // ── Step 1: Hydrate graph from live data ──
      // Fetch active properties with city/type/developer info
      const { data: allProps } = await serviceClient
        .from('properties')
        .select('id, title, price, city, state, property_type, investment_score, demand_heat_score, developer_name, created_at')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .limit(500);

      const props = allProps || [];

      // Fetch recent behavior (30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [behaviorRes, favoritesRes, existingEdgesRes] = await Promise.all([
        serviceClient
          .from('ai_behavior_tracking')
          .select('user_id, property_id, event_type, created_at')
          .gte('created_at', thirtyDaysAgo)
          .limit(2000),
        serviceClient
          .from('favorites')
          .select('user_id, property_id, created_at')
          .gte('created_at', thirtyDaysAgo)
          .limit(1000),
        serviceClient
          .from('knowledge_graph_edges')
          .select('id, source_type, source_id, relation_type, target_type, target_id, weight')
          .limit(5000),
      ]);

      const behaviors = behaviorRes.data || [];
      const favorites = favoritesRes.data || [];

      // ── Step 2: Build/update graph edges ──
      const edgesToUpsert: any[] = [];

      // Property → City edges
      const cityMap = new Map<string, { count: number; avgInv: number; avgHeat: number; totalPrice: number; types: Set<string> }>();
      for (const p of props) {
        if (p.city) {
          edgesToUpsert.push({
            source_type: 'property', source_id: p.id,
            relation_type: 'located_in',
            target_type: 'city', target_id: p.city.toLowerCase(),
            weight: 1, metadata: { property_type: p.property_type, price: p.price },
          });

          const existing = cityMap.get(p.city.toLowerCase()) || { count: 0, avgInv: 0, avgHeat: 0, totalPrice: 0, types: new Set() };
          existing.count++;
          existing.avgInv += (p.investment_score ?? 50);
          existing.avgHeat += (p.demand_heat_score ?? 50);
          existing.totalPrice += (p.price || 0);
          if (p.property_type) existing.types.add(p.property_type);
          cityMap.set(p.city.toLowerCase(), existing);
        }

        // Property → Developer
        if (p.developer_name) {
          edgesToUpsert.push({
            source_type: 'property', source_id: p.id,
            relation_type: 'built_by',
            target_type: 'developer', target_id: p.developer_name.toLowerCase(),
            weight: 1, metadata: {},
          });
        }
      }

      // User → Property (viewed)
      const viewCounts = new Map<string, number>();
      for (const b of behaviors) {
        if (b.user_id && b.property_id && (b.event_type === 'view' || b.event_type === 'property_view')) {
          const key = `${b.user_id}:${b.property_id}`;
          viewCounts.set(key, (viewCounts.get(key) || 0) + 1);
        }
      }
      for (const [key, count] of viewCounts) {
        const [uid, pid] = key.split(':');
        edgesToUpsert.push({
          source_type: 'user', source_id: uid,
          relation_type: 'viewed',
          target_type: 'property', target_id: pid,
          weight: Math.min(count, 10), metadata: { view_count: count },
        });
      }

      // User → Property (saved)
      for (const f of favorites) {
        if (f.user_id && f.property_id) {
          edgesToUpsert.push({
            source_type: 'user', source_id: f.user_id,
            relation_type: 'saved',
            target_type: 'property', target_id: f.property_id,
            weight: 3, metadata: {},
          });
        }
      }

      // User → Property (inquired)
      for (const b of behaviors) {
        if (b.user_id && b.property_id && (b.event_type === 'contact' || b.event_type === 'inquiry')) {
          edgesToUpsert.push({
            source_type: 'user', source_id: b.user_id,
            relation_type: 'inquired',
            target_type: 'property', target_id: b.property_id,
            weight: 5, metadata: {},
          });
        }
      }

      // Batch upsert edges (in chunks to avoid payload limits)
      const CHUNK_SIZE = 100;
      let edgesWritten = 0;
      for (let i = 0; i < edgesToUpsert.length; i += CHUNK_SIZE) {
        const chunk = edgesToUpsert.slice(i, i + CHUNK_SIZE);
        const { error: upsertErr } = await serviceClient
          .from('knowledge_graph_edges')
          .upsert(chunk, { onConflict: 'source_type,source_id,relation_type,target_type,target_id' });
        if (!upsertErr) edgesWritten += chunk.length;
      }

      // ── Step 3: Analyze graph for insights ──

      // Trending cities (by interaction weight)
      const cityInteractions = new Map<string, number>();
      for (const b of behaviors) {
        if (b.property_id) {
          const p = props.find((pr: any) => pr.id === b.property_id);
          if (p?.city) {
            const c = p.city.toLowerCase();
            cityInteractions.set(c, (cityInteractions.get(c) || 0) + 1);
          }
        }
      }
      for (const f of favorites) {
        if (f.property_id) {
          const p = props.find((pr: any) => pr.id === f.property_id);
          if (p?.city) {
            const c = p.city.toLowerCase();
            cityInteractions.set(c, (cityInteractions.get(c) || 0) + 3);
          }
        }
      }

      const trendingCities = Array.from(cityMap.entries())
        .map(([city, data]) => {
          const interactions = cityInteractions.get(city) || 0;
          const avgInv = Math.round(data.avgInv / data.count);
          const avgHeat = Math.round(data.avgHeat / data.count);
          const avgPrice = Math.round(data.totalPrice / data.count);
          const trendScore = Math.round(interactions * 2 + avgHeat * 0.5 + avgInv * 0.3);

          return {
            city: city.charAt(0).toUpperCase() + city.slice(1),
            property_count: data.count,
            avg_investment_score: avgInv,
            avg_demand_heat: avgHeat,
            avg_price: avgPrice,
            interaction_count: interactions,
            trend_score: trendScore,
            property_types: Array.from(data.types),
          };
        })
        .sort((a, b) => b.trend_score - a.trend_score)
        .slice(0, 10);

      // Investor hotspots (cities with high investment scores + activity)
      const investorHotspots = trendingCities
        .filter(c => c.avg_investment_score >= 60 || c.avg_demand_heat >= 60)
        .map(c => ({
          city: c.city,
          investment_rating: c.avg_investment_score >= 80 ? 'strong_buy' : c.avg_investment_score >= 65 ? 'buy' : 'hold',
          demand_level: c.avg_demand_heat >= 75 ? 'very_hot' : c.avg_demand_heat >= 50 ? 'hot' : 'warm',
          avg_investment_score: c.avg_investment_score,
          avg_demand_heat: c.avg_demand_heat,
          property_count: c.property_count,
        }))
        .slice(0, 5);

      // Popular property types
      const typeCounts: Record<string, { count: number; views: number; saves: number; avgPrice: number }> = {};
      for (const p of props) {
        const t = p.property_type || 'unknown';
        if (!typeCounts[t]) typeCounts[t] = { count: 0, views: 0, saves: 0, avgPrice: 0 };
        typeCounts[t].count++;
        typeCounts[t].avgPrice += (p.price || 0);
      }
      for (const b of behaviors) {
        const p = props.find((pr: any) => pr.id === b.property_id);
        if (p?.property_type) {
          const t = p.property_type;
          if (typeCounts[t]) {
            if (b.event_type === 'view' || b.event_type === 'property_view') typeCounts[t].views++;
          }
        }
      }
      for (const f of favorites) {
        const p = props.find((pr: any) => pr.id === f.property_id);
        if (p?.property_type && typeCounts[p.property_type]) {
          typeCounts[p.property_type].saves++;
        }
      }

      const popularTypes = Object.entries(typeCounts)
        .map(([type, data]) => ({
          type,
          listing_count: data.count,
          view_count: data.views,
          save_count: data.saves,
          avg_price: data.count > 0 ? Math.round(data.avgPrice / data.count) : 0,
          popularity_score: Math.round(data.views * 1 + data.saves * 3 + data.count * 0.5),
        }))
        .sort((a, b) => b.popularity_score - a.popularity_score);

      // Graph stats
      const totalEdges = (existingEdgesRes.data || []).length + edgesWritten;
      const uniqueUsers = new Set([...behaviors.map(b => b.user_id), ...favorites.map(f => f.user_id)].filter(Boolean));

      return new Response(JSON.stringify({
        data: {
          trending_cities: trendingCities,
          investor_hotspots: investorHotspots,
          popular_property_types: popularTypes,
          graph_stats: {
            total_edges: totalEdges,
            edges_updated: edgesWritten,
            total_properties: props.length,
            active_users_30d: uniqueUsers.size,
            unique_cities: cityMap.size,
          },
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ══════════════════════════════════════════════════════════════
    // ██  MODE: market_pulse — Real-time market trends dashboard
    // ══════════════════════════════════════════════════════════════
    if (mode === 'market_pulse') {
      const serviceClient = createClient(supabaseUrl, serviceKey);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel data fetch
      const [propsRes, behaviorRes, recentPropsRes] = await Promise.all([
        serviceClient.from('properties').select('id, title, city, state, price, property_type, bedrooms, building_area, investment_score, demand_heat_score, created_at, status').limit(1000),
        serviceClient.from('ai_behavior_tracking').select('event_type, property_id, user_id, created_at').gte('created_at', thirtyDaysAgo).limit(2000),
        serviceClient.from('properties').select('id, city, price, property_type, created_at').gte('created_at', sevenDaysAgo).order('created_at', { ascending: false }).limit(200),
      ]);

      const props = propsRes.data || [];
      const behaviors = behaviorRes.data || [];
      const recentProps = recentPropsRes.data || [];

      // ── City-level pulse ──
      const cityPulse: Record<string, {
        listings: number; avgPrice: number; totalPrice: number;
        avgInvestment: number; totalInvestment: number;
        avgDemand: number; totalDemand: number;
        views7d: number; views30d: number; inquiries30d: number;
        newListings7d: number; types: Record<string, number>;
      }> = {};

      for (const p of props) {
        const city = p.city || 'Unknown';
        if (!cityPulse[city]) {
          cityPulse[city] = { listings: 0, avgPrice: 0, totalPrice: 0, avgInvestment: 0, totalInvestment: 0, avgDemand: 0, totalDemand: 0, views7d: 0, views30d: 0, inquiries30d: 0, newListings7d: 0, types: {} };
        }
        const cp = cityPulse[city];
        cp.listings++;
        cp.totalPrice += p.price || 0;
        cp.totalInvestment += p.investment_score || 0;
        cp.totalDemand += p.demand_heat_score || 0;
        const pt = p.property_type || 'other';
        cp.types[pt] = (cp.types[pt] || 0) + 1;
      }

      // Count new listings per city (7d)
      for (const rp of recentProps) {
        const city = rp.city || 'Unknown';
        if (cityPulse[city]) cityPulse[city].newListings7d++;
      }

      // Count views & inquiries per city
      const propCityMap: Record<string, string> = {};
      for (const p of props) { if (p.id && p.city) propCityMap[p.id] = p.city; }

      for (const b of behaviors) {
        const city = b.property_id ? propCityMap[b.property_id] : null;
        if (!city || !cityPulse[city]) continue;
        if (b.event_type === 'view' || b.event_type === 'property_view') {
          cityPulse[city].views30d++;
          if (new Date(b.created_at) >= new Date(sevenDaysAgo)) cityPulse[city].views7d++;
        }
        if (b.event_type === 'inquiry' || b.event_type === 'contact') {
          cityPulse[city].inquiries30d++;
        }
      }

      // Compute averages & build city pulse array
      const cityPulseArray = Object.entries(cityPulse)
        .map(([city, d]) => {
          const avgPrice = d.listings > 0 ? Math.round(d.totalPrice / d.listings) : 0;
          const avgInvestment = d.listings > 0 ? Math.round((d.totalInvestment / d.listings) * 10) / 10 : 0;
          const avgDemand = d.listings > 0 ? Math.round((d.totalDemand / d.listings) * 10) / 10 : 0;
          const momentum = Math.round(d.views7d * 2 + d.inquiries30d * 5 + d.newListings7d * 3);
          const topType = Object.entries(d.types).sort((a, b) => b[1] - a[1])[0];
          const signal: string = momentum > 50 ? 'hot' : momentum > 20 ? 'warming' : momentum > 5 ? 'stable' : 'cooling';
          return {
            city,
            total_listings: d.listings,
            avg_price: avgPrice,
            avg_investment_score: avgInvestment,
            avg_demand_score: avgDemand,
            views_7d: d.views7d,
            views_30d: d.views30d,
            inquiries_30d: d.inquiries30d,
            new_listings_7d: d.newListings7d,
            momentum_score: momentum,
            signal,
            dominant_type: topType ? topType[0] : 'unknown',
          };
        })
        .sort((a, b) => b.momentum_score - a.momentum_score);

      // ── Market-wide signals ──
      const totalListings = props.length;
      const totalViews30d = behaviors.filter(b => b.event_type === 'view' || b.event_type === 'property_view').length;
      const totalInquiries30d = behaviors.filter(b => b.event_type === 'inquiry' || b.event_type === 'contact').length;
      const newListings7d = recentProps.length;
      const avgPriceAll = totalListings > 0 ? Math.round(props.reduce((s, p) => s + (p.price || 0), 0) / totalListings) : 0;

      // Price distribution by type
      const typeDistribution: Record<string, { count: number; totalPrice: number; avgPrice: number }> = {};
      for (const p of props) {
        const pt = p.property_type || 'other';
        if (!typeDistribution[pt]) typeDistribution[pt] = { count: 0, totalPrice: 0, avgPrice: 0 };
        typeDistribution[pt].count++;
        typeDistribution[pt].totalPrice += p.price || 0;
      }
      const priceByType = Object.entries(typeDistribution).map(([type, d]) => ({
        type,
        count: d.count,
        avg_price: d.count > 0 ? Math.round(d.totalPrice / d.count) : 0,
        market_share: totalListings > 0 ? Math.round((d.count / totalListings) * 100) : 0,
      })).sort((a, b) => b.count - a.count);

      // Daily activity trend (last 7 days)
      const dailyActivity: Record<string, { views: number; inquiries: number; new_listings: number }> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        dailyActivity[key] = { views: 0, inquiries: 0, new_listings: 0 };
      }
      for (const b of behaviors) {
        const day = b.created_at?.slice(0, 10);
        if (dailyActivity[day]) {
          if (b.event_type === 'view' || b.event_type === 'property_view') dailyActivity[day].views++;
          if (b.event_type === 'inquiry' || b.event_type === 'contact') dailyActivity[day].inquiries++;
        }
      }
      for (const rp of recentProps) {
        const day = rp.created_at?.slice(0, 10);
        if (dailyActivity[day]) dailyActivity[day].new_listings++;
      }
      const activityTrend = Object.entries(dailyActivity)
        .map(([date, d]) => ({ date, ...d }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Market health indicator
      const healthScore = Math.min(100, Math.round(
        (totalViews30d > 100 ? 25 : (totalViews30d / 100) * 25) +
        (totalInquiries30d > 30 ? 25 : (totalInquiries30d / 30) * 25) +
        (newListings7d > 20 ? 25 : (newListings7d / 20) * 25) +
        (totalListings > 50 ? 25 : (totalListings / 50) * 25)
      ));

      const healthLabel = healthScore >= 80 ? 'Thriving' : healthScore >= 60 ? 'Healthy' : healthScore >= 40 ? 'Moderate' : 'Slow';

      return new Response(JSON.stringify({
        data: {
          market_overview: {
            total_listings: totalListings,
            avg_price: avgPriceAll,
            views_30d: totalViews30d,
            inquiries_30d: totalInquiries30d,
            new_listings_7d: newListings7d,
            health_score: healthScore,
            health_label: healthLabel,
          },
          city_pulse: cityPulseArray,
          price_by_type: priceByType,
          activity_trend: activityTrend,
          top_momentum_cities: cityPulseArray.slice(0, 5).map(c => c.city),
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ══════════════════════════════════════════════════════════════
    // ██  MODE: predictive_development — Detect new dev opportunities
    // ══════════════════════════════════════════════════════════════
    if (mode === 'predictive_development') {
      const serviceClient = createClient(supabaseUrl, serviceKey);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel data fetch
      const [propsRes, behaviorRes, priceHistRes] = await Promise.all([
        serviceClient.from('properties').select('id, city, state, price, property_type, land_area, building_area, investment_score, demand_heat_score, rental_yield, status, created_at').limit(1000),
        serviceClient.from('ai_behavior_tracking').select('event_type, property_id, user_id, created_at').gte('created_at', thirtyDaysAgo).limit(2000),
        serviceClient.from('property_price_history').select('property_id, old_price, new_price, changed_at').gte('changed_at', ninetyDaysAgo).limit(1000),
      ]);

      const props = propsRes.data || [];
      const behaviors = behaviorRes.data || [];
      const priceHistory = priceHistRes.data || [];

      // Map property → city for behavior lookups
      const propCityMap: Record<string, string> = {};
      const propTypeMap: Record<string, string> = {};
      for (const p of props) {
        if (p.id && p.city) propCityMap[p.id] = p.city;
        if (p.id && p.property_type) propTypeMap[p.id] = p.property_type;
      }

      // ── Aggregate by city ──
      interface CityAgg {
        listings: number;
        totalPrice: number;
        totalLandPrice: number;
        landCount: number;
        totalInvestment: number;
        totalDemand: number;
        totalYield: number;
        yieldCount: number;
        views30d: number;
        inquiries30d: number;
        newListings30d: number;
        priceChanges: { old: number; new_: number }[];
        types: Record<string, number>;
      }

      const cityAgg: Record<string, CityAgg> = {};
      const ensureCity = (city: string) => {
        if (!cityAgg[city]) {
          cityAgg[city] = {
            listings: 0, totalPrice: 0, totalLandPrice: 0, landCount: 0,
            totalInvestment: 0, totalDemand: 0, totalYield: 0, yieldCount: 0,
            views30d: 0, inquiries30d: 0, newListings30d: 0,
            priceChanges: [], types: {},
          };
        }
      };

      for (const p of props) {
        const city = p.city || 'Unknown';
        ensureCity(city);
        const c = cityAgg[city];
        c.listings++;
        c.totalPrice += p.price || 0;
        c.totalInvestment += p.investment_score || 0;
        c.totalDemand += p.demand_heat_score || 0;
        if (p.rental_yield && p.rental_yield > 0) { c.totalYield += p.rental_yield; c.yieldCount++; }
        if (p.land_area && p.land_area > 0 && p.price) {
          c.totalLandPrice += p.price / p.land_area;
          c.landCount++;
        }
        const pt = p.property_type || 'other';
        c.types[pt] = (c.types[pt] || 0) + 1;
        // Check if created in last 30d
        if (new Date(p.created_at) >= new Date(thirtyDaysAgo)) c.newListings30d++;
      }

      // Behavior counts per city
      for (const b of behaviors) {
        const city = b.property_id ? propCityMap[b.property_id] : null;
        if (!city) continue;
        ensureCity(city);
        if (b.event_type === 'view' || b.event_type === 'property_view') cityAgg[city].views30d++;
        if (b.event_type === 'inquiry' || b.event_type === 'contact') cityAgg[city].inquiries30d++;
      }

      // Price trend per city
      for (const ph of priceHistory) {
        const city = ph.property_id ? propCityMap[ph.property_id] : null;
        if (!city) continue;
        ensureCity(city);
        cityAgg[city].priceChanges.push({ old: ph.old_price, new_: ph.new_price });
      }

      // ── Score & classify each city ──
      const opportunities = Object.entries(cityAgg).map(([city, d]) => {
        const avgDemand = d.listings > 0 ? d.totalDemand / d.listings : 0;
        const avgInvestment = d.listings > 0 ? d.totalInvestment / d.listings : 0;
        const avgYield = d.yieldCount > 0 ? d.totalYield / d.yieldCount : 0;
        const avgLandPricePerSqm = d.landCount > 0 ? d.totalLandPrice / d.landCount : 0;
        const avgPrice = d.listings > 0 ? d.totalPrice / d.listings : 0;

        // Buyer activity score (0-25)
        const buyerActivity = Math.min(25, Math.round((d.views30d * 0.5 + d.inquiries30d * 3) / Math.max(1, d.listings) * 5));

        // Demand heat contribution (0-25)
        const demandScore = Math.min(25, Math.round(avgDemand * 0.3));

        // Supply gap: high demand + low listings = opportunity (0-25)
        const supplyGap = avgDemand > 50 && d.listings < 30 ? 25 : avgDemand > 30 && d.listings < 60 ? 15 : 5;

        // Price trend: rising prices indicate growth (0-25)
        let priceTrendScore = 10;
        if (d.priceChanges.length > 0) {
          const avgChange = d.priceChanges.reduce((s, pc) => s + ((pc.new_ - pc.old) / Math.max(1, pc.old)), 0) / d.priceChanges.length;
          priceTrendScore = Math.min(25, Math.max(0, Math.round((avgChange + 0.1) * 100)));
        }

        const growthScore = Math.min(100, buyerActivity + demandScore + supplyGap + priceTrendScore);

        // Classify development type
        let developmentType: string;
        let reason: string;
        const dominantType = Object.entries(d.types).sort((a, b) => b[1] - a[1])[0];

        if (avgYield > 8 && avgPrice < 3_000_000_000) {
          developmentType = 'villa_project';
          reason = `High rental yield (${avgYield.toFixed(1)}%) with affordable land prices — ideal for villa developments targeting vacation rentals.`;
        } else if (d.listings > 50 && avgDemand > 60) {
          developmentType = 'apartment_project';
          reason = `High listing density (${d.listings}) and strong demand (${avgDemand.toFixed(0)}) indicate urban growth — apartment developments can capture rising population demand.`;
        } else if (avgPrice > 5_000_000_000 && buyerActivity > 15) {
          developmentType = 'commercial_project';
          reason = `Premium price segment (avg ${(avgPrice / 1e9).toFixed(1)}B IDR) with active buyer interest suggests commercial viability for mixed-use or retail developments.`;
        } else if (dominantType && dominantType[0] === 'villa') {
          developmentType = 'villa_project';
          reason = `${city} is dominated by villa properties (${dominantType[1]} listings) with ${avgDemand.toFixed(0)} avg demand — expanding villa supply meets market preference.`;
        } else if (avgDemand > 40) {
          developmentType = 'apartment_project';
          reason = `Moderate-to-high demand (${avgDemand.toFixed(0)}) with growth potential — apartment projects can serve emerging residential needs.`;
        } else {
          developmentType = 'villa_project';
          reason = `Emerging market with ${d.newListings30d} new listings in 30 days — early-mover villa developments can establish market presence.`;
        }

        return {
          city,
          development_type: developmentType,
          growth_score: growthScore,
          reason,
          metrics: {
            total_listings: d.listings,
            avg_price: Math.round(avgPrice),
            avg_land_price_sqm: Math.round(avgLandPricePerSqm),
            avg_demand_score: Math.round(avgDemand * 10) / 10,
            avg_investment_score: Math.round(avgInvestment * 10) / 10,
            avg_rental_yield: Math.round(avgYield * 10) / 10,
            buyer_activity_30d: d.views30d + d.inquiries30d,
            new_listings_30d: d.newListings30d,
            price_changes_90d: d.priceChanges.length,
          },
          score_breakdown: {
            buyer_activity: buyerActivity,
            demand_heat: demandScore,
            supply_gap: supplyGap,
            price_trend: priceTrendScore,
          },
        };
      }).sort((a, b) => b.growth_score - a.growth_score);

      return new Response(JSON.stringify({
        data: {
          development_opportunities: opportunities,
          summary: {
            total_cities_analyzed: opportunities.length,
            top_opportunity: opportunities[0]?.city || 'N/A',
            avg_growth_score: opportunities.length > 0
              ? Math.round(opportunities.reduce((s, o) => s + o.growth_score, 0) / opportunities.length)
              : 0,
            type_distribution: {
              villa_project: opportunities.filter(o => o.development_type === 'villa_project').length,
              apartment_project: opportunities.filter(o => o.development_type === 'apartment_project').length,
              commercial_project: opportunities.filter(o => o.development_type === 'commercial_project').length,
            },
          },
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ══════════════════════════════════════════════════════════════
    // ██  MODE: expansion_intelligence — Global expansion targets
    // ══════════════════════════════════════════════════════════════
    if (mode === 'expansion_intelligence') {
      // Southeast Asia + key global markets with real economic indicators
      const markets = [
        { country: 'Indonesia', region: 'Southeast Asia', flag: '🇮🇩', gdp_growth: 5.1, tourism_arrivals_m: 16.3, fdi_inflow_b: 47.3, property_growth: 7.2, rental_yield_avg: 6.8, population_m: 278, urbanization: 57, ease_of_business: 73, foreign_ownership: 'Limited (HGB/Nominee)', currency_stability: 72, digital_adoption: 68 },
        { country: 'Thailand', region: 'Southeast Asia', flag: '🇹🇭', gdp_growth: 3.2, tourism_arrivals_m: 28.1, fdi_inflow_b: 10.8, property_growth: 4.5, rental_yield_avg: 5.2, population_m: 72, urbanization: 52, ease_of_business: 80, foreign_ownership: 'Condo freehold / Land restricted', currency_stability: 75, digital_adoption: 72 },
        { country: 'Vietnam', region: 'Southeast Asia', flag: '🇻🇳', gdp_growth: 6.5, tourism_arrivals_m: 12.6, fdi_inflow_b: 18.5, property_growth: 8.1, rental_yield_avg: 5.8, population_m: 100, urbanization: 39, ease_of_business: 70, foreign_ownership: '50-year leasehold', currency_stability: 65, digital_adoption: 60 },
        { country: 'Philippines', region: 'Southeast Asia', flag: '🇵🇭', gdp_growth: 5.6, tourism_arrivals_m: 5.4, fdi_inflow_b: 9.4, property_growth: 5.9, rental_yield_avg: 6.1, population_m: 115, urbanization: 48, ease_of_business: 68, foreign_ownership: 'Condo up to 40%', currency_stability: 68, digital_adoption: 58 },
        { country: 'Malaysia', region: 'Southeast Asia', flag: '🇲🇾', gdp_growth: 4.2, tourism_arrivals_m: 20.1, fdi_inflow_b: 12.1, property_growth: 3.8, rental_yield_avg: 4.5, population_m: 33, urbanization: 78, ease_of_business: 81, foreign_ownership: 'Above MM2H threshold', currency_stability: 70, digital_adoption: 80 },
        { country: 'Singapore', region: 'Southeast Asia', flag: '🇸🇬', gdp_growth: 2.8, tourism_arrivals_m: 13.6, fdi_inflow_b: 92.0, property_growth: 3.2, rental_yield_avg: 3.1, population_m: 6, urbanization: 100, ease_of_business: 95, foreign_ownership: 'Full (with ABSD stamp duty)', currency_stability: 95, digital_adoption: 95 },
        { country: 'Cambodia', region: 'Southeast Asia', flag: '🇰🇭', gdp_growth: 5.8, tourism_arrivals_m: 5.6, fdi_inflow_b: 3.8, property_growth: 6.5, rental_yield_avg: 7.2, population_m: 17, urbanization: 25, ease_of_business: 55, foreign_ownership: 'Condo above ground floor', currency_stability: 60, digital_adoption: 42 },
        { country: 'Dubai (UAE)', region: 'Middle East', flag: '🇦🇪', gdp_growth: 4.0, tourism_arrivals_m: 17.2, fdi_inflow_b: 22.7, property_growth: 9.5, rental_yield_avg: 7.0, population_m: 10, urbanization: 87, ease_of_business: 88, foreign_ownership: 'Freehold in designated zones', currency_stability: 92, digital_adoption: 90 },
        { country: 'Portugal', region: 'Europe', flag: '🇵🇹', gdp_growth: 2.3, tourism_arrivals_m: 26.5, fdi_inflow_b: 8.2, property_growth: 6.8, rental_yield_avg: 4.8, population_m: 10, urbanization: 67, ease_of_business: 78, foreign_ownership: 'Full (Golden Visa revised)', currency_stability: 85, digital_adoption: 75 },
        { country: 'Turkey', region: 'Europe', flag: '🇹🇷', gdp_growth: 4.5, tourism_arrivals_m: 49.2, fdi_inflow_b: 10.6, property_growth: 11.2, rental_yield_avg: 5.5, population_m: 85, urbanization: 77, ease_of_business: 70, foreign_ownership: 'Full (citizenship by investment)', currency_stability: 35, digital_adoption: 70 },
        { country: 'Mexico', region: 'Americas', flag: '🇲🇽', gdp_growth: 3.2, tourism_arrivals_m: 42.0, fdi_inflow_b: 35.3, property_growth: 5.4, rental_yield_avg: 5.9, population_m: 130, urbanization: 81, ease_of_business: 72, foreign_ownership: 'Via fideicomiso trust in restricted zone', currency_stability: 60, digital_adoption: 65 },
        { country: 'Japan', region: 'East Asia', flag: '🇯🇵', gdp_growth: 1.9, tourism_arrivals_m: 31.9, fdi_inflow_b: 14.7, property_growth: 4.2, rental_yield_avg: 3.8, population_m: 125, urbanization: 92, ease_of_business: 86, foreign_ownership: 'Full ownership allowed', currency_stability: 78, digital_adoption: 88 },
      ];

      // Scoring formula
      const scored = markets.map((m) => {
        // Market growth (0-25): property growth + GDP growth
        const marketGrowth = Math.min(25, Math.round((m.property_growth * 1.5 + m.gdp_growth * 1.2)));

        // Investor interest (0-25): FDI + foreign ownership ease + ease of business
        const ownershipScore = m.foreign_ownership.toLowerCase().includes('full') ? 10 : m.foreign_ownership.toLowerCase().includes('freehold') ? 8 : 4;
        const investorInterest = Math.min(25, Math.round((Math.min(m.fdi_inflow_b, 50) / 50) * 8 + ownershipScore + (m.ease_of_business / 100) * 7));

        // Tourism demand (0-25)
        const tourismDemand = Math.min(25, Math.round((Math.min(m.tourism_arrivals_m, 50) / 50) * 15 + m.rental_yield_avg * 1.2));

        // Economic stability (0-25): currency + digital + urbanization
        const economicStability = Math.min(25, Math.round((m.currency_stability / 100) * 10 + (m.digital_adoption / 100) * 8 + (m.urbanization / 100) * 7));

        const totalScore = marketGrowth + investorInterest + tourismDemand + economicStability;

        // Classify readiness
        const readiness = totalScore >= 75 ? 'Ready' : totalScore >= 55 ? 'High Potential' : totalScore >= 40 ? 'Emerging' : 'Watch';

        // Key reasons
        const reasons: string[] = [];
        if (m.property_growth > 6) reasons.push(`Strong property growth (${m.property_growth}%)`);
        if (m.tourism_arrivals_m > 15) reasons.push(`Major tourism hub (${m.tourism_arrivals_m}M visitors)`);
        if (m.fdi_inflow_b > 15) reasons.push(`High FDI inflows ($${m.fdi_inflow_b}B)`);
        if (m.rental_yield_avg > 6) reasons.push(`Attractive yields (${m.rental_yield_avg}%)`);
        if (m.digital_adoption > 80) reasons.push(`High digital readiness (${m.digital_adoption}%)`);
        if (m.gdp_growth > 5) reasons.push(`Rapid GDP growth (${m.gdp_growth}%)`);
        if (reasons.length === 0) reasons.push('Stable market with moderate growth potential');

        return {
          country: m.country,
          region: m.region,
          flag: m.flag,
          total_score: totalScore,
          readiness,
          market_growth: marketGrowth,
          investor_interest: investorInterest,
          tourism_demand: tourismDemand,
          economic_stability: economicStability,
          metrics: {
            gdp_growth: m.gdp_growth,
            property_growth: m.property_growth,
            tourism_arrivals_m: m.tourism_arrivals_m,
            fdi_inflow_b: m.fdi_inflow_b,
            rental_yield_avg: m.rental_yield_avg,
            population_m: m.population_m,
            urbanization: m.urbanization,
            ease_of_business: m.ease_of_business,
            currency_stability: m.currency_stability,
            digital_adoption: m.digital_adoption,
            foreign_ownership: m.foreign_ownership,
          },
          reasons,
        };
      }).sort((a, b) => b.total_score - a.total_score);

      return new Response(JSON.stringify({
        data: {
          expansion_targets: scored,
          summary: {
            total_markets_analyzed: scored.length,
            top_target: scored[0]?.country || 'N/A',
            ready_markets: scored.filter(s => s.readiness === 'Ready').length,
            high_potential_markets: scored.filter(s => s.readiness === 'High Potential').length,
            avg_score: Math.round(scored.reduce((s, t) => s + t.total_score, 0) / scored.length),
          },
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ══════════════════════════════════════════════════════════════
    // ██  MODE: self_learning — Continuously improve AI from feedback
    // ══════════════════════════════════════════════════════════════
    if (mode === 'self_learning') {
      const serviceClient = createClient(supabaseUrl, serviceKey);
      const subMode = body.sub_mode || 'train'; // 'train' | 'record_feedback' | 'stats'

      // ── Sub-mode: record_feedback ──
      if (subMode === 'record_feedback') {
        const { feedback_property_id, ai_match_score: matchScore, user_action, session_id } = body;
        if (!feedback_property_id || !user_action) {
          return new Response(JSON.stringify({ error: 'feedback_property_id and user_action required' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        // Action weights: positive actions boost, ignores decrease
        const actionWeights: Record<string, number> = {
          contact: 5.0, save: 3.0, visit: 4.0, view: 1.0, ignore: -1.0, dismiss: -2.0,
        };
        const weight = actionWeights[user_action] ?? 0;

        const { error: insertErr } = await serviceClient.from('ai_feedback_signals').insert({
          user_id: userId,
          property_id: feedback_property_id,
          ai_match_score: matchScore || 0,
          user_action,
          action_weight: weight,
          recommendation_source: body.source || 'ai_engine',
          session_id: session_id || null,
        });
        if (insertErr) throw new Error(insertErr.message);

        return new Response(JSON.stringify({
          data: { recorded: true, action: user_action, weight },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ── Sub-mode: stats ──
      if (subMode === 'stats') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [signalsRes, snapshotsRes, weightsRes] = await Promise.all([
          serviceClient.from('ai_feedback_signals').select('user_action, action_weight, ai_match_score, created_at').gte('created_at', thirtyDaysAgo).limit(2000),
          serviceClient.from('ai_learning_snapshots').select('*').order('created_at', { ascending: false }).limit(20),
          serviceClient.from('ai_model_weights').select('*').limit(1).single(),
        ]);

        const signals = signalsRes.data || [];
        const snapshots = snapshotsRes.data || [];
        const currentWeights = weightsRes.data;

        // Compute stats
        const totalSignals = signals.length;
        const positiveSignals = signals.filter(s => (s.action_weight as number) > 0).length;
        const negativeSignals = signals.filter(s => (s.action_weight as number) < 0).length;
        const avgMatchScore = totalSignals > 0
          ? Math.round(signals.reduce((s, sig) => s + (Number(sig.ai_match_score) || 0), 0) / totalSignals * 10) / 10
          : 0;

        // Action breakdown
        const actionBreakdown: Record<string, number> = {};
        for (const s of signals) {
          actionBreakdown[s.user_action] = (actionBreakdown[s.user_action] || 0) + 1;
        }

        // Conversion rate: positive / total
        const conversionRate = totalSignals > 0 ? Math.round((positiveSignals / totalSignals) * 100 * 10) / 10 : 0;

        // Daily signal trend (7 days)
        const dailyTrend: Record<string, { positive: number; negative: number; total: number }> = {};
        for (let i = 0; i < 7; i++) {
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          dailyTrend[d] = { positive: 0, negative: 0, total: 0 };
        }
        for (const s of signals) {
          const day = s.created_at?.slice(0, 10);
          if (dailyTrend[day]) {
            dailyTrend[day].total++;
            if ((s.action_weight as number) > 0) dailyTrend[day].positive++;
            else dailyTrend[day].negative++;
          }
        }
        const signalTrend = Object.entries(dailyTrend)
          .map(([date, d]) => ({ date, ...d }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Model evolution from snapshots
        const modelEvolution = snapshots.map(s => ({
          date: s.created_at,
          accuracy: Number(s.model_accuracy) || 0,
          confidence: Number(s.confidence_score) || 0,
          signals_processed: s.total_signals_processed || 0,
          positive_ratio: s.total_signals_processed ? Math.round(((s.positive_signals || 0) / s.total_signals_processed) * 100) : 0,
        })).reverse();

        return new Response(JSON.stringify({
          data: {
            current_weights: currentWeights,
            learning_stats: {
              total_signals_30d: totalSignals,
              positive_signals: positiveSignals,
              negative_signals: negativeSignals,
              neutral_signals: totalSignals - positiveSignals - negativeSignals,
              conversion_rate: conversionRate,
              avg_match_score: avgMatchScore,
              action_breakdown: actionBreakdown,
            },
            signal_trend: signalTrend,
            model_evolution: modelEvolution,
            training_history: snapshots.slice(0, 10),
            generated_at: new Date().toISOString(),
          },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // ── Sub-mode: train (default) — Process feedback and adjust weights ──
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [signalsRes, weightsRes] = await Promise.all([
        serviceClient.from('ai_feedback_signals').select('user_action, action_weight, ai_match_score, property_id').gte('created_at', thirtyDaysAgo).limit(5000),
        serviceClient.from('ai_model_weights').select('*').limit(1).single(),
      ]);

      const signals = signalsRes.data || [];
      const currentWeights = weightsRes.data;

      if (!currentWeights) {
        return new Response(JSON.stringify({ error: 'No model weights found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const FACTORS = ['location', 'price', 'feature', 'investment', 'popularity', 'collaborative'] as const;
      const oldWeights: Record<string, number> = {};
      for (const f of FACTORS) oldWeights[f] = Number(currentWeights[f]) || 0;

      // Compute factor performance signals
      // Positive actions on high-match-score recs → model is working well
      // Negative actions on high-match-score → model needs adjustment
      const totalSignals = signals.length;
      const positiveSignals = signals.filter(s => (s.action_weight as number) > 0);
      const negativeSignals = signals.filter(s => (s.action_weight as number) < 0);

      const posCount = positiveSignals.length;
      const negCount = negativeSignals.length;

      // Weighted positive score
      const posWeightSum = positiveSignals.reduce((s, sig) => s + (Number(sig.action_weight) || 0), 0);
      const negWeightSum = Math.abs(negativeSignals.reduce((s, sig) => s + (Number(sig.action_weight) || 0), 0));

      // Learning rate based on data sufficiency
      const dataConfidence = Math.min(1.0, totalSignals / 500);
      const learningRate = 0.01 + (dataConfidence * 0.02); // 0.01 to 0.03

      // Compute adjustments using gradient-like approach
      // High positive ratio → small adjustments (model is good)
      // High negative ratio → larger adjustments needed
      const posRatio = totalSignals > 0 ? posCount / totalSignals : 0.5;
      const adjustmentMagnitude = Math.max(0.5, (1 - posRatio) * 3); // 0.5 to 3.0

      const adjustments: Record<string, number> = {};
      const newWeights: Record<string, number> = {};

      // Heuristic: analyze which factors correlate with positive outcomes
      // High match scores with positive actions → boost contributing factors
      // For now, use aggregate signal patterns
      const avgPosMatchScore = posCount > 0
        ? positiveSignals.reduce((s, sig) => s + (Number(sig.ai_match_score) || 0), 0) / posCount
        : 50;

      for (const f of FACTORS) {
        let adj = 0;

        // Factors with higher current weight that correlate with positive outcomes get small boost
        // Factors with low weight get moderate boost if conversion is strong
        const factorWeight = oldWeights[f];

        if (posRatio > 0.6) {
          // Model performing well — minor adjustments
          adj = (Math.random() - 0.5) * adjustmentMagnitude * learningRate * 10;
        } else if (posRatio > 0.3) {
          // Moderate performance — redistribute from high to low performers
          if (factorWeight > 20) adj = -adjustmentMagnitude * learningRate * 8;
          else adj = adjustmentMagnitude * learningRate * 8;
        } else {
          // Poor performance — more aggressive redistribution
          if (f === 'price' || f === 'location') adj = adjustmentMagnitude * learningRate * 12;
          else adj = -adjustmentMagnitude * learningRate * 6;
        }

        // Clamp ±3
        adj = Math.round(Math.max(-3, Math.min(3, adj)) * 10) / 10;
        adjustments[f] = adj;
        newWeights[f] = Math.max(5, oldWeights[f] + adj);
      }

      // Normalize to sum = 100
      const rawSum = Object.values(newWeights).reduce((s, v) => s + v, 0);
      for (const f of FACTORS) {
        newWeights[f] = Math.round((newWeights[f] / rawSum) * 100 * 10) / 10;
      }
      // Fix rounding to exactly 100
      const roundedSum = Object.values(newWeights).reduce((s, v) => s + v, 0);
      const diff = Math.round((100 - roundedSum) * 10) / 10;
      newWeights[FACTORS[0]] = Math.round((newWeights[FACTORS[0]] + diff) * 10) / 10;

      // Model accuracy estimate
      const accuracy = Math.round(posRatio * 100 * 10) / 10;
      const confidence = Math.round(dataConfidence * 100);

      // Update weights in DB
      const updatePayload: Record<string, number> = {};
      for (const f of FACTORS) updatePayload[f] = newWeights[f];
      updatePayload['updated_at'] = Date.now() as any; // will be ignored, just triggers update

      await serviceClient.from('ai_model_weights').update(updatePayload).eq('id', currentWeights.id);

      // Log snapshot
      await serviceClient.from('ai_learning_snapshots').insert({
        snapshot_type: 'self_learning',
        total_signals_processed: totalSignals,
        positive_signals: posCount,
        negative_signals: negCount,
        weights_before: oldWeights,
        weights_after: newWeights,
        adjustments,
        model_accuracy: accuracy,
        confidence_score: confidence,
        learning_rate: learningRate,
        metadata: {
          pos_weight_sum: posWeightSum,
          neg_weight_sum: negWeightSum,
          avg_pos_match_score: avgPosMatchScore,
          adjustment_magnitude: adjustmentMagnitude,
        },
      });

      // Also log to ai_weight_history
      await serviceClient.from('ai_weight_history').insert({
        weights: newWeights,
        adjustments,
        trigger_source: 'self_learning',
        model_health: {
          total_events: totalSignals,
          data_sufficiency: dataConfidence > 0.5 ? 'Sufficient' : 'Insufficient',
          confidence: `${confidence}%`,
          accuracy: `${accuracy}%`,
        },
      });

      return new Response(JSON.stringify({
        data: {
          training_complete: true,
          old_weights: oldWeights,
          new_weights: newWeights,
          adjustments,
          model_metrics: {
            accuracy,
            confidence,
            learning_rate: learningRate,
            total_signals: totalSignals,
            positive_signals: posCount,
            negative_signals: negCount,
            pos_ratio: posRatio,
            data_sufficiency: dataConfidence > 0.5 ? 'Sufficient' : 'Insufficient',
          },
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ══════════════════════════════════════════════════════════════
    // ██  MODE: global_market_intelligence — Compare markets globally
    // ══════════════════════════════════════════════════════════════
    if (mode === 'global_market_intelligence') {
      const investmentBudget = body.investment_budget || 0;
      const regionFilter = body.region || 'all';

      // Comprehensive global market dataset with city-level granularity
      const globalMarkets = [
        // Southeast Asia
        { country: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia', city: 'Bali (Seminyak)', rental_yield: 8.2, price_growth: 7.5, avg_price_usd: 250000, entry_price_usd: 120000, tourism_score: 95, fdi_score: 72, ease_of_entry: 60, currency: 'IDR', risk_level: 'Medium' },
        { country: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia', city: 'Bali (Canggu)', rental_yield: 9.1, price_growth: 9.2, avg_price_usd: 200000, entry_price_usd: 95000, tourism_score: 90, fdi_score: 72, ease_of_entry: 60, currency: 'IDR', risk_level: 'Medium' },
        { country: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia', city: 'Jakarta', rental_yield: 5.8, price_growth: 4.2, avg_price_usd: 180000, entry_price_usd: 80000, tourism_score: 45, fdi_score: 78, ease_of_entry: 65, currency: 'IDR', risk_level: 'Medium' },
        { country: 'Indonesia', flag: '🇮🇩', region: 'Southeast Asia', city: 'Lombok', rental_yield: 7.5, price_growth: 11.0, avg_price_usd: 150000, entry_price_usd: 60000, tourism_score: 75, fdi_score: 65, ease_of_entry: 55, currency: 'IDR', risk_level: 'Medium-High' },
        { country: 'Thailand', flag: '🇹🇭', region: 'Southeast Asia', city: 'Bangkok', rental_yield: 5.0, price_growth: 3.8, avg_price_usd: 210000, entry_price_usd: 90000, tourism_score: 88, fdi_score: 75, ease_of_entry: 70, currency: 'THB', risk_level: 'Low-Medium' },
        { country: 'Thailand', flag: '🇹🇭', region: 'Southeast Asia', city: 'Phuket', rental_yield: 6.8, price_growth: 5.5, avg_price_usd: 280000, entry_price_usd: 130000, tourism_score: 92, fdi_score: 70, ease_of_entry: 72, currency: 'THB', risk_level: 'Low-Medium' },
        { country: 'Vietnam', flag: '🇻🇳', region: 'Southeast Asia', city: 'Ho Chi Minh City', rental_yield: 5.5, price_growth: 8.0, avg_price_usd: 160000, entry_price_usd: 70000, tourism_score: 70, fdi_score: 80, ease_of_entry: 55, currency: 'VND', risk_level: 'Medium' },
        { country: 'Vietnam', flag: '🇻🇳', region: 'Southeast Asia', city: 'Da Nang', rental_yield: 6.2, price_growth: 9.5, avg_price_usd: 120000, entry_price_usd: 50000, tourism_score: 78, fdi_score: 75, ease_of_entry: 55, currency: 'VND', risk_level: 'Medium' },
        { country: 'Philippines', flag: '🇵🇭', region: 'Southeast Asia', city: 'Manila (BGC)', rental_yield: 6.5, price_growth: 5.2, avg_price_usd: 195000, entry_price_usd: 85000, tourism_score: 60, fdi_score: 68, ease_of_entry: 58, currency: 'PHP', risk_level: 'Medium' },
        { country: 'Malaysia', flag: '🇲🇾', region: 'Southeast Asia', city: 'Kuala Lumpur', rental_yield: 4.8, price_growth: 3.5, avg_price_usd: 175000, entry_price_usd: 75000, tourism_score: 78, fdi_score: 72, ease_of_entry: 75, currency: 'MYR', risk_level: 'Low-Medium' },
        { country: 'Cambodia', flag: '🇰🇭', region: 'Southeast Asia', city: 'Phnom Penh', rental_yield: 7.8, price_growth: 6.0, avg_price_usd: 95000, entry_price_usd: 40000, tourism_score: 55, fdi_score: 60, ease_of_entry: 65, currency: 'USD', risk_level: 'High' },
        // Middle East
        { country: 'UAE', flag: '🇦🇪', region: 'Middle East', city: 'Dubai Marina', rental_yield: 7.2, price_growth: 10.5, avg_price_usd: 450000, entry_price_usd: 200000, tourism_score: 95, fdi_score: 90, ease_of_entry: 88, currency: 'AED', risk_level: 'Low' },
        { country: 'UAE', flag: '🇦🇪', region: 'Middle East', city: 'Abu Dhabi', rental_yield: 6.0, price_growth: 6.8, avg_price_usd: 380000, entry_price_usd: 170000, tourism_score: 72, fdi_score: 88, ease_of_entry: 85, currency: 'AED', risk_level: 'Low' },
        // Europe
        { country: 'Portugal', flag: '🇵🇹', region: 'Europe', city: 'Lisbon', rental_yield: 4.5, price_growth: 6.2, avg_price_usd: 420000, entry_price_usd: 200000, tourism_score: 90, fdi_score: 75, ease_of_entry: 78, currency: 'EUR', risk_level: 'Low' },
        { country: 'Portugal', flag: '🇵🇹', region: 'Europe', city: 'Algarve', rental_yield: 5.2, price_growth: 5.8, avg_price_usd: 350000, entry_price_usd: 180000, tourism_score: 88, fdi_score: 70, ease_of_entry: 78, currency: 'EUR', risk_level: 'Low' },
        { country: 'Turkey', flag: '🇹🇷', region: 'Europe', city: 'Istanbul', rental_yield: 5.8, price_growth: 12.0, avg_price_usd: 180000, entry_price_usd: 75000, tourism_score: 85, fdi_score: 65, ease_of_entry: 80, currency: 'TRY', risk_level: 'Medium-High' },
        { country: 'Turkey', flag: '🇹🇷', region: 'Europe', city: 'Antalya', rental_yield: 6.5, price_growth: 14.0, avg_price_usd: 130000, entry_price_usd: 55000, tourism_score: 88, fdi_score: 60, ease_of_entry: 82, currency: 'TRY', risk_level: 'Medium-High' },
        { country: 'Spain', flag: '🇪🇸', region: 'Europe', city: 'Barcelona', rental_yield: 4.0, price_growth: 4.5, avg_price_usd: 380000, entry_price_usd: 190000, tourism_score: 92, fdi_score: 78, ease_of_entry: 75, currency: 'EUR', risk_level: 'Low' },
        { country: 'Greece', flag: '🇬🇷', region: 'Europe', city: 'Athens', rental_yield: 5.5, price_growth: 7.8, avg_price_usd: 220000, entry_price_usd: 100000, tourism_score: 85, fdi_score: 65, ease_of_entry: 72, currency: 'EUR', risk_level: 'Low-Medium' },
        // Americas
        { country: 'Mexico', flag: '🇲🇽', region: 'Americas', city: 'Tulum', rental_yield: 8.5, price_growth: 8.0, avg_price_usd: 280000, entry_price_usd: 120000, tourism_score: 88, fdi_score: 70, ease_of_entry: 68, currency: 'MXN', risk_level: 'Medium' },
        { country: 'Mexico', flag: '🇲🇽', region: 'Americas', city: 'Mexico City (Roma)', rental_yield: 5.8, price_growth: 5.5, avg_price_usd: 200000, entry_price_usd: 90000, tourism_score: 75, fdi_score: 72, ease_of_entry: 70, currency: 'MXN', risk_level: 'Medium' },
        { country: 'Colombia', flag: '🇨🇴', region: 'Americas', city: 'Medellin', rental_yield: 7.0, price_growth: 6.5, avg_price_usd: 150000, entry_price_usd: 60000, tourism_score: 72, fdi_score: 60, ease_of_entry: 70, currency: 'COP', risk_level: 'Medium' },
        // East Asia
        { country: 'Japan', flag: '🇯🇵', region: 'East Asia', city: 'Tokyo (Minato)', rental_yield: 3.5, price_growth: 4.8, avg_price_usd: 550000, entry_price_usd: 250000, tourism_score: 92, fdi_score: 80, ease_of_entry: 85, currency: 'JPY', risk_level: 'Low' },
        { country: 'Japan', flag: '🇯🇵', region: 'East Asia', city: 'Osaka', rental_yield: 4.2, price_growth: 5.5, avg_price_usd: 320000, entry_price_usd: 150000, tourism_score: 85, fdi_score: 78, ease_of_entry: 85, currency: 'JPY', risk_level: 'Low' },
      ];

      // Filter by region
      let filtered = regionFilter === 'all'
        ? globalMarkets
        : globalMarkets.filter(m => m.region.toLowerCase().includes(regionFilter.toLowerCase()));

      // Filter by budget if provided
      if (investmentBudget > 0) {
        filtered = filtered.filter(m => m.entry_price_usd <= investmentBudget);
      }

      // Score each market
      const scored = filtered.map((m) => {
        // Yield score (0-30): higher yield = better
        const yieldScore = Math.min(30, Math.round(m.rental_yield * 3.2));

        // Growth score (0-25): higher growth = better
        const growthScore = Math.min(25, Math.round(m.price_growth * 2.0));

        // Accessibility score (0-20): ease of entry + FDI friendliness
        const accessScore = Math.min(20, Math.round((m.ease_of_entry * 0.5 + m.fdi_score * 0.5) / 100 * 20));

        // Tourism/demand score (0-15)
        const demandScore = Math.min(15, Math.round(m.tourism_score / 100 * 15));

        // Value score (0-10): lower entry price relative to yield = better value
        const valueRatio = m.rental_yield / (m.entry_price_usd / 100000);
        const valueScore = Math.min(10, Math.round(valueRatio * 2.5));

        const investmentScore = yieldScore + growthScore + accessScore + demandScore + valueScore;

        // Grade
        const grade = investmentScore >= 80 ? 'A+' : investmentScore >= 70 ? 'A' : investmentScore >= 60 ? 'B+' : investmentScore >= 50 ? 'B' : investmentScore >= 40 ? 'C' : 'D';

        return {
          ...m,
          investment_score: investmentScore,
          grade,
          score_breakdown: {
            yield: yieldScore,
            growth: growthScore,
            accessibility: accessScore,
            demand: demandScore,
            value: valueScore,
          },
        };
      }).sort((a, b) => b.investment_score - a.investment_score);

      // Region summary
      const regionSummary: Record<string, { count: number; avgYield: number; avgGrowth: number; avgScore: number; totalYield: number; totalGrowth: number; totalScore: number }> = {};
      for (const m of scored) {
        if (!regionSummary[m.region]) regionSummary[m.region] = { count: 0, avgYield: 0, avgGrowth: 0, avgScore: 0, totalYield: 0, totalGrowth: 0, totalScore: 0 };
        const r = regionSummary[m.region];
        r.count++;
        r.totalYield += m.rental_yield;
        r.totalGrowth += m.price_growth;
        r.totalScore += m.investment_score;
      }
      const regions = Object.entries(regionSummary).map(([region, r]) => ({
        region,
        markets: r.count,
        avg_yield: Math.round(r.totalYield / r.count * 10) / 10,
        avg_growth: Math.round(r.totalGrowth / r.count * 10) / 10,
        avg_score: Math.round(r.totalScore / r.count),
      })).sort((a, b) => b.avg_score - a.avg_score);

      return new Response(JSON.stringify({
        data: {
          markets: scored,
          regions,
          summary: {
            total_markets: scored.length,
            top_market: scored[0] ? `${scored[0].flag} ${scored[0].city}` : 'N/A',
            top_score: scored[0]?.investment_score || 0,
            avg_yield: scored.length > 0 ? Math.round(scored.reduce((s, m) => s + m.rental_yield, 0) / scored.length * 10) / 10 : 0,
            avg_growth: scored.length > 0 ? Math.round(scored.reduce((s, m) => s + m.price_growth, 0) / scored.length * 10) / 10 : 0,
            budget_filter: investmentBudget > 0 ? `$${(investmentBudget / 1000).toFixed(0)}K` : 'None',
            region_filter: regionFilter,
          },
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ══════════════════════════════════════════════════════════════
    // ██  MODE: mortgage_investment_simulator
    // ══════════════════════════════════════════════════════════════
    if (mode === 'mortgage_investment_simulator') {
      const propertyPrice = body.property_price || 0;
      const downPaymentPercent = body.down_payment_percent || 20;
      const interestRate = body.interest_rate || 8;
      const loanTermYears = body.loan_term_years || 20;
      const propertyId = body.property_id;

      const downPayment = propertyPrice * (downPaymentPercent / 100);
      const loanAmount = propertyPrice - downPayment;
      const monthlyRate = interestRate / 100 / 12;
      const totalMonths = loanTermYears * 12;

      // PMT formula
      let monthlyPayment: number;
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / totalMonths;
      } else {
        monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }

      const totalPayment = monthlyPayment * totalMonths;
      const totalInterest = totalPayment - loanAmount;

      // Rental yield estimation — use property data if available
      let rentalYieldPercent = 5.5; // default
      let monthlyRent = 0;
      let rentSource = 'market_average';
      let propertyCity = '';
      let propertyType = '';
      let bedrooms = 0;

      if (propertyId) {
        const { data: prop } = await supabaseClient
          .from('properties')
          .select('city, property_type, bedrooms, building_area, monthly_rent_estimate')
          .eq('id', propertyId)
          .maybeSingle();

        if (prop) {
          propertyCity = prop.city || '';
          propertyType = prop.property_type || '';
          bedrooms = prop.bedrooms || 0;

          if (prop.monthly_rent_estimate && prop.monthly_rent_estimate > 0) {
            monthlyRent = prop.monthly_rent_estimate;
            rentSource = 'property_data';
          } else {
            // Estimate from comparables
            const { data: comps } = await supabaseClient
              .from('properties')
              .select('monthly_rent_estimate')
              .eq('listing_type', 'rent')
              .eq('city', prop.city)
              .eq('property_type', prop.property_type)
              .not('monthly_rent_estimate', 'is', null)
              .gt('monthly_rent_estimate', 0)
              .limit(20);

            if (comps && comps.length > 0) {
              const avgRent = comps.reduce((s, c) => s + (c.monthly_rent_estimate || 0), 0) / comps.length;
              monthlyRent = Math.round(avgRent);
              rentSource = `comparable_avg_${comps.length}`;
            }
          }
        }
      }

      // Fallback: estimate from yield
      if (monthlyRent <= 0) {
        // City-based yield adjustments
        const cityYields: Record<string, number> = {
          'bali': 7.5, 'jakarta': 5.0, 'bandung': 5.5, 'surabaya': 5.2,
          'yogyakarta': 6.0, 'lombok': 7.0, 'malang': 5.8, 'semarang': 5.3
        };
        const cityKey = propertyCity.toLowerCase();
        rentalYieldPercent = cityYields[cityKey] || 5.5;
        monthlyRent = Math.round((propertyPrice * rentalYieldPercent / 100) / 12);
        rentSource = 'yield_estimate';
      } else {
        rentalYieldPercent = Math.round((monthlyRent * 12 / propertyPrice) * 1000) / 10;
      }

      // Cashflow analysis
      const netMonthlyCashflow = monthlyRent - monthlyPayment;
      const annualCashflow = netMonthlyCashflow * 12;
      const cashOnCashReturn = downPayment > 0 ? Math.round((annualCashflow / downPayment) * 1000) / 10 : 0;
      const breakEvenRent = monthlyPayment;
      const dscr = monthlyRent > 0 ? Math.round((monthlyRent / monthlyPayment) * 100) / 100 : 0;
      const cashflowStatus = netMonthlyCashflow > 0 ? 'positive' : netMonthlyCashflow === 0 ? 'breakeven' : 'negative';

      // 5-year projection (assume 5% annual appreciation + 3% rent growth)
      const appreciationRate = 0.05;
      const rentGrowthRate = 0.03;
      const yearlyProjection = [];
      let projectedValue = propertyPrice;
      let projectedRent = monthlyRent;
      let balance = loanAmount;
      let cumulativeCashflow = 0;

      for (let y = 1; y <= 10; y++) {
        projectedValue *= (1 + appreciationRate);
        projectedRent *= (1 + rentGrowthRate);
        const annualMortgage = monthlyPayment * 12;
        const yearCashflow = (projectedRent * 12) - annualMortgage;
        cumulativeCashflow += yearCashflow;

        // Approximate remaining balance
        const monthsElapsed = y * 12;
        if (monthlyRate > 0) {
          balance = loanAmount * (Math.pow(1 + monthlyRate, totalMonths) - Math.pow(1 + monthlyRate, monthsElapsed)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        } else {
          balance = loanAmount - (monthlyPayment * monthsElapsed);
        }
        const equity = projectedValue - Math.max(0, balance);
        const totalROI = downPayment > 0 ? Math.round(((equity - downPayment + cumulativeCashflow) / downPayment) * 1000) / 10 : 0;

        yearlyProjection.push({
          year: y,
          property_value: Math.round(projectedValue),
          monthly_rent: Math.round(projectedRent),
          annual_cashflow: Math.round(yearCashflow),
          cumulative_cashflow: Math.round(cumulativeCashflow),
          remaining_balance: Math.round(Math.max(0, balance)),
          equity: Math.round(equity),
          total_roi: totalROI,
        });
      }

      // Sensitivity analysis: different interest rate scenarios
      const scenarios = [interestRate - 2, interestRate - 1, interestRate, interestRate + 1, interestRate + 2].filter(r => r > 0).map(rate => {
        const mr = rate / 100 / 12;
        let mp;
        if (mr === 0) { mp = loanAmount / totalMonths; }
        else { mp = loanAmount * (mr * Math.pow(1 + mr, totalMonths)) / (Math.pow(1 + mr, totalMonths) - 1); }
        return {
          interest_rate: rate,
          monthly_payment: Math.round(mp),
          net_cashflow: Math.round(monthlyRent - mp),
          cashflow_status: monthlyRent - mp > 0 ? 'positive' : 'negative',
        };
      });

      // Investment verdict
      let verdict = 'neutral';
      let verdictLabel = 'Moderate Investment';
      if (dscr >= 1.25 && cashOnCashReturn > 5) { verdict = 'excellent'; verdictLabel = 'Excellent Investment'; }
      else if (dscr >= 1.0 && cashOnCashReturn > 0) { verdict = 'good'; verdictLabel = 'Good Investment'; }
      else if (dscr >= 0.8) { verdict = 'fair'; verdictLabel = 'Fair — Needs Subsidy'; }
      else { verdict = 'poor'; verdictLabel = 'Poor — Cash Drain'; }

      return new Response(JSON.stringify({
        data: {
          // Core mortgage
          property_price: propertyPrice,
          down_payment: Math.round(downPayment),
          down_payment_percent: downPaymentPercent,
          loan_amount: Math.round(loanAmount),
          interest_rate: interestRate,
          loan_term_years: loanTermYears,
          monthly_payment: Math.round(monthlyPayment),
          total_payment: Math.round(totalPayment),
          total_interest: Math.round(totalInterest),
          // Rental
          rental_yield_percent: rentalYieldPercent,
          monthly_rent: monthlyRent,
          rent_source: rentSource,
          // Cashflow
          net_monthly_cashflow: Math.round(netMonthlyCashflow),
          annual_cashflow: Math.round(annualCashflow),
          cash_on_cash_return: cashOnCashReturn,
          break_even_rent: Math.round(breakEvenRent),
          dscr,
          cashflow_status: cashflowStatus,
          // Verdict
          verdict,
          verdict_label: verdictLabel,
          // Projections
          yearly_projection: yearlyProjection,
          rate_scenarios: scenarios,
          // Meta
          property_city: propertyCity,
          property_type: propertyType,
          bedrooms,
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ══════════════════════════════════════════════════════════════
    // ██  MODE: investment_score_v2 — 5-factor data-driven score
    // ══════════════════════════════════════════════════════════════
    if (mode === 'investment_score_v2') {
      const propertyId = body.property_id;
      if (!propertyId) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 1. Fetch property
      const { data: prop, error: propErr } = await supabaseClient
        .from('properties')
        .select('id, title, price, city, district, property_type, building_area_sqm, land_area_sqm, bedrooms, bathrooms, monthly_rent_estimate, listing_type, status, created_at, investment_score, demand_heat_score')
        .eq('id', propertyId)
        .maybeSingle();

      if (propErr || !prop) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const price = prop.price || 0;
      const area = prop.building_area_sqm || prop.land_area_sqm || 100;
      const pricePerSqm = area > 0 ? price / area : 0;
      const city = prop.city || '';
      const propType = prop.property_type || '';

      // 2. City comparables for price fairness
      const { data: cityComps } = await supabaseClient
        .from('properties')
        .select('price, building_area_sqm, land_area_sqm')
        .eq('city', city)
        .eq('status', 'active')
        .not('price', 'is', null)
        .gt('price', 0)
        .limit(200);

      const compPrices = (cityComps || []).map(c => {
        const a = c.building_area_sqm || c.land_area_sqm || 100;
        return a > 0 ? (c.price || 0) / a : 0;
      }).filter(p => p > 0);

      const cityAvgPricePerSqm = compPrices.length > 0
        ? compPrices.reduce((s, v) => s + v, 0) / compPrices.length
        : pricePerSqm;

      // Sort for median
      const sorted = [...compPrices].sort((a, b) => a - b);
      const cityMedianPricePerSqm = sorted.length > 0
        ? sorted[Math.floor(sorted.length / 2)]
        : pricePerSqm;

      // Price fairness: how far below median (positive = cheaper = good)
      const priceRatio = cityMedianPricePerSqm > 0 ? pricePerSqm / cityMedianPricePerSqm : 1;
      // Score: 1.0 = fair, <1 = undervalued (good), >1 = overpriced
      // Map to 0-20: ratio 0.7 → 20, 1.0 → 12, 1.3 → 4
      const priceFairnessScore = Math.max(0, Math.min(20, Math.round(20 - (priceRatio - 0.7) * (16 / 0.6))));

      // 3. Rental yield estimation
      let monthlyRent = prop.monthly_rent_estimate || 0;
      if (monthlyRent <= 0) {
        // Get from rental comparables
        const { data: rentComps } = await supabaseClient
          .from('properties')
          .select('monthly_rent_estimate')
          .eq('city', city)
          .eq('listing_type', 'rent')
          .eq('property_type', propType)
          .not('monthly_rent_estimate', 'is', null)
          .gt('monthly_rent_estimate', 0)
          .limit(30);

        if (rentComps && rentComps.length > 0) {
          monthlyRent = Math.round(
            rentComps.reduce((s, c) => s + (c.monthly_rent_estimate || 0), 0) / rentComps.length
          );
        } else {
          // Fallback: city-based yield
          const yields: Record<string, number> = {
            'bali': 7.5, 'jakarta': 5.0, 'bandung': 5.5, 'surabaya': 5.2,
            'yogyakarta': 6.0, 'lombok': 7.0, 'seminyak': 8.0, 'canggu': 9.0,
            'ubud': 7.0, 'denpasar': 6.0
          };
          const yieldPct = yields[city.toLowerCase()] || 5.5;
          monthlyRent = Math.round((price * yieldPct / 100) / 12);
        }
      }

      const annualRent = monthlyRent * 12;
      const grossYield = price > 0 ? (annualRent / price) * 100 : 0;
      // Score: yield 10%+ → 25, 5% → 15, 2% → 5
      const rentalYieldScore = Math.max(0, Math.min(25, Math.round(grossYield * 2.5)));

      // 4. Demand signals (views + saves last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

      const [viewsResult, savesResult] = await Promise.all([
        supabaseClient
          .from('property_analytics')
          .select('view_count')
          .eq('property_id', propertyId)
          .maybeSingle(),
        supabaseClient
          .from('saved_properties')
          .select('id', { count: 'exact', head: true })
          .eq('property_id', propertyId)
          .gte('created_at', thirtyDaysAgo),
      ]);

      const views30d = viewsResult.data?.view_count || 0;
      const saves30d = savesResult.count || 0;

      // Demand score (0-25): views give up to 15, saves give up to 10
      const viewScore = Math.min(15, Math.round(Math.log2(views30d + 1) * 3));
      const saveScore = Math.min(10, saves30d * 2);
      const locationDemandScore = Math.min(25, viewScore + saveScore);

      // 5. Market growth — compare recent vs older listings in city
      const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString();
      const oneYearAgo = new Date(Date.now() - 365 * 86400000).toISOString();

      const [recentListings, olderListings] = await Promise.all([
        supabaseClient
          .from('properties')
          .select('price, building_area_sqm, land_area_sqm')
          .eq('city', city)
          .eq('status', 'active')
          .gte('created_at', sixMonthsAgo)
          .not('price', 'is', null)
          .gt('price', 0)
          .limit(100),
        supabaseClient
          .from('properties')
          .select('price, building_area_sqm, land_area_sqm')
          .eq('city', city)
          .lt('created_at', sixMonthsAgo)
          .gte('created_at', oneYearAgo)
          .not('price', 'is', null)
          .gt('price', 0)
          .limit(100),
      ]);

      const avgPsm = (list: any[]) => {
        const vals = list.map(p => {
          const a = p.building_area_sqm || p.land_area_sqm || 100;
          return a > 0 ? (p.price || 0) / a : 0;
        }).filter(v => v > 0);
        return vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
      };

      const recentAvg = avgPsm(recentListings.data || []);
      const olderAvg = avgPsm(olderListings.data || []);
      const growthRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
      // Score (0-15): +15% growth → 15, 0% → 7, -10% → 2
      const marketGrowthScore = Math.max(0, Math.min(15, Math.round(7 + growthRate * 0.53)));

      // 6. Liquidity — active similar listings vs total demand signals
      const { count: similarActive } = await supabaseClient
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('city', city)
        .eq('property_type', propType)
        .eq('status', 'active');

      const activeCount = similarActive || 1;
      // High supply with low demand = illiquid → low score
      // Low supply = more liquid → higher score
      const supplyDemandRatio = (views30d + saves30d * 3) / activeCount;
      const liquidityScore = Math.max(0, Math.min(15, Math.round(Math.min(15, supplyDemandRatio * 3 + 5))));

      // ═══ COMPOSITE SCORE ═══
      const investmentScore = Math.max(0, Math.min(100,
        locationDemandScore + priceFairnessScore + rentalYieldScore + marketGrowthScore + liquidityScore
      ));

      // Grade
      const grade = investmentScore >= 85 ? 'A+' : investmentScore >= 75 ? 'A' : investmentScore >= 65 ? 'B+' : investmentScore >= 55 ? 'B' : investmentScore >= 40 ? 'C' : 'D';

      // Recommendation
      let recommendation = '';
      if (investmentScore >= 80) recommendation = 'Strong Buy — Excellent fundamentals across all dimensions.';
      else if (investmentScore >= 65) recommendation = 'Buy — Good investment with solid fundamentals.';
      else if (investmentScore >= 50) recommendation = 'Hold — Average investment, monitor market conditions.';
      else if (investmentScore >= 35) recommendation = 'Cautious — Below-average metrics, proceed with due diligence.';
      else recommendation = 'Avoid — Weak fundamentals, high risk relative to return.';

      return new Response(JSON.stringify({
        data: {
          property_id: propertyId,
          title: prop.title,
          city,
          property_type: propType,
          price,
          area_sqm: area,
          price_per_sqm: Math.round(pricePerSqm),
          investment_score: investmentScore,
          grade,
          recommendation,
          breakdown: {
            location_demand: { score: locationDemandScore, max: 25, views_30d: views30d, saves_30d: saves30d },
            price_fairness: { score: priceFairnessScore, max: 20, price_per_sqm: Math.round(pricePerSqm), city_avg_per_sqm: Math.round(cityAvgPricePerSqm), city_median_per_sqm: Math.round(cityMedianPricePerSqm), price_ratio: Math.round(priceRatio * 100) / 100, comparables_count: compPrices.length },
            rental_yield: { score: rentalYieldScore, max: 25, monthly_rent: monthlyRent, annual_rent: annualRent, gross_yield_percent: Math.round(grossYield * 10) / 10 },
            market_growth: { score: marketGrowthScore, max: 15, growth_rate_percent: Math.round(growthRate * 10) / 10, recent_avg_psm: Math.round(recentAvg), older_avg_psm: Math.round(olderAvg) },
            liquidity: { score: liquidityScore, max: 15, similar_active_listings: activeCount, supply_demand_ratio: Math.round(supplyDemandRatio * 100) / 100 },
          },
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ═══════════════════════════════════════════
    // MODE: deal_finder — Bulk scan for undervalued deals
    // ═══════════════════════════════════════════
    if (mode === 'deal_finder') {
      const limitDeals = Number(body.limit) || 20;
      const minScore = Number(body.min_score) || 0;
      const filterCity = body.city || null;
      const filterType = body.property_type || null;

      // 1. Fetch all published properties
      let query = supabase
        .from('properties')
        .select('id, title, price, city, property_type, building_area_sqm, land_area_sqm, bedrooms, bathrooms, thumbnail_url, images, image_urls, investment_score, status, listing_type, location')
        .eq('status', 'published')
        .gt('price', 0);

      if (filterCity) query = query.ilike('city', `%${filterCity}%`);
      if (filterType) query = query.eq('property_type', filterType);

      const { data: properties, error: propErr } = await query.limit(200);
      if (propErr) throw propErr;
      if (!properties || properties.length === 0) {
        return new Response(JSON.stringify({ mode: 'deal_finder', data: { deals: [], total_scanned: 0, generated_at: new Date().toISOString() } }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. Group by city to compute city averages
      const cityGroups: Record<string, { prices: number[]; areas: number[] }> = {};
      for (const p of properties) {
        const city = p.city || 'Unknown';
        const ba = Number(p.building_area_sqm) || 0;
        const la = Number(p.land_area_sqm) || 0;
        const area = ba > 0 ? ba : la;
        if (area <= 0 || Number(p.price) <= 0) continue;
        if (!cityGroups[city]) cityGroups[city] = { prices: [], areas: [] };
        cityGroups[city].prices.push(Number(p.price));
        cityGroups[city].areas.push(area);
      }

      const cityAvgPSM: Record<string, number> = {};
      for (const [city, group] of Object.entries(cityGroups)) {
        const psms = group.prices.map((pr, i) => pr / group.areas[i]).sort((a, b) => a - b);
        const mid = Math.floor(psms.length / 2);
        cityAvgPSM[city] = psms.length % 2 !== 0 ? psms[mid] : (psms[mid - 1] + psms[mid]) / 2;
      }

      // 3. Fetch demand signals (views/saves last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const propIds = properties.map(p => p.id);

      const { data: analyticsRows } = await supabase
        .from('property_analytics')
        .select('property_id, views, saves')
        .in('property_id', propIds)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      const demandMap: Record<string, { views: number; saves: number }> = {};
      for (const row of (analyticsRows || [])) {
        if (!demandMap[row.property_id]) demandMap[row.property_id] = { views: 0, saves: 0 };
        demandMap[row.property_id].views += row.views || 0;
        demandMap[row.property_id].saves += row.saves || 0;
      }

      // 4. Rental yield benchmarks by city
      const yieldBenchmarks: Record<string, number> = {
        'Bali': 7.5, 'Ubud': 7.0, 'Seminyak': 8.0, 'Canggu': 7.5, 'Kuta': 6.5,
        'Jakarta': 5.0, 'Bandung': 5.5, 'Surabaya': 5.0, 'Yogyakarta': 5.5,
        'Lombok': 6.5, 'Makassar': 5.0, 'Medan': 4.5, 'Denpasar': 6.0,
      };
      const defaultYield = 5.0;

      // 5. Score each property
      const deals: any[] = [];
      for (const p of properties) {
        const ba = Number(p.building_area_sqm) || 0;
        const la = Number(p.land_area_sqm) || 0;
        const area = ba > 0 ? ba : la;
        const price = Number(p.price);
        if (area <= 0 || price <= 0) continue;

        const city = p.city || 'Unknown';
        const pricePSM = price / area;
        const avgPSM = cityAvgPSM[city];
        if (!avgPSM || avgPSM <= 0) continue;

        // Undervaluation %
        const undervaluePercent = ((avgPSM - pricePSM) / avgPSM) * 100;

        // Rental yield estimate
        const yieldRate = yieldBenchmarks[city] || defaultYield;
        const annualRent = price * (yieldRate / 100);
        const monthlyRent = annualRent / 12;
        const rentalYieldPercent = yieldRate;

        // Demand signals
        const demand = demandMap[p.id] || { views: 0, saves: 0 };

        // Deal score (0-100) weighted: undervalue 40%, yield 25%, demand 20%, investment 15%
        const uvScore = Math.min(Math.max(undervaluePercent * 2, 0), 40); // up to 40 pts
        const yieldScore = Math.min((rentalYieldPercent / 10) * 25, 25); // up to 25 pts
        const demandScore = Math.min(((demand.views + demand.saves * 3) / 100) * 20, 20); // up to 20 pts
        const invScore = Math.min(((p.investment_score || 0) / 100) * 15, 15); // up to 15 pts
        const dealScore = Math.round(uvScore + yieldScore + demandScore + invScore);

        if (dealScore < minScore) continue;

        deals.push({
          property_id: p.id,
          title: p.title,
          city: p.city,
          location: p.location,
          property_type: p.property_type,
          listing_type: p.listing_type,
          price,
          area_sqm: area,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          thumbnail_url: p.thumbnail_url || (p.images && p.images[0]) || (p.image_urls && p.image_urls[0]) || null,
          deal_score: dealScore,
          undervalue_percent: Math.round(undervaluePercent * 100) / 100,
          rental_yield_percent: rentalYieldPercent,
          monthly_rent_estimate: Math.round(monthlyRent),
          price_per_sqm: Math.round(pricePSM),
          city_avg_price_per_sqm: Math.round(avgPSM),
          views_30d: demand.views,
          saves_30d: demand.saves,
          investment_score: p.investment_score || 0,
          deal_rating: dealScore >= 70 ? 'hot_deal' : dealScore >= 50 ? 'good_deal' : dealScore >= 30 ? 'fair' : 'low',
        });
      }

      // Sort by deal_score desc
      deals.sort((a, b) => b.deal_score - a.deal_score);
      const topDeals = deals.slice(0, limitDeals);

      return new Response(JSON.stringify({
        mode: 'deal_finder',
        data: {
          deals: topDeals,
          total_scanned: properties.length,
          total_deals_found: deals.length,
          city_averages: Object.entries(cityAvgPSM).map(([city, avg]) => ({ city, avg_price_per_sqm: Math.round(avg) })),
          generated_at: new Date().toISOString(),
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
