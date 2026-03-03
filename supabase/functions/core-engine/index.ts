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
    const validModes = ['investment_score', 'price_suggestion', 'listing_health', 'days_to_sell_prediction', 'demand_heat_score', 'price_adjustment_strategy', 'roi_simulation', 'compare_properties', 'portfolio_analysis', 'ranking_score', 'listing_visibility_analytics', 'ai_performance_summary'];
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
        .select('id, price, city, area_sqm, land_area_sqm, building_area_sqm, has_pool, garage_count, floors, property_type, listing_type, investment_score, status, user_id, agent_id, description, kt, km')
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
        .select('id, title, price, city, area_sqm, land_area_sqm, building_area_sqm, has_pool, garage_count, floors, property_type, listing_type, investment_score, status, user_id, agent_id, description, kt, km')
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
      .select('id, price, city, area_sqm, land_area_sqm, building_area_sqm, has_pool, garage_count, floors, property_type, listing_type, investment_score, status, user_id, agent_id, description, kt, km')
      .eq('id', property_id)
      .maybeSingle();

    if (pErr || !property) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Authorization: service_role, owner, agent, or admin ──
    if (!isServiceRole) {
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
      if (ba <= 0) return { price_position: 'unknown' as string, comparable_count: 0 };

      const minA = ba * 0.7;
      const maxA = ba * 1.3;

      const { data: comps } = await supabase
        .from('properties')
        .select('price, building_area_sqm')
        .eq('city', prop.city)
        .eq('property_type', prop.property_type)
        .eq('status', 'published')
        .not('price', 'is', null)
        .gte('building_area_sqm', minA)
        .lte('building_area_sqm', maxA)
        .neq('id', propId)
        .limit(50);

      const valid = (comps || []).filter(
        (c) => Number(c.price) > 0 && Number(c.building_area_sqm) > 0
      );
      if (valid.length === 0) return { price_position: 'unknown', comparable_count: 0 };

      const ppm2 = valid.map((c) => Number(c.price) / Number(c.building_area_sqm)).sort((a, b) => a - b);
      const mid = Math.floor(ppm2.length / 2);
      const median = ppm2.length % 2 !== 0 ? ppm2[mid] : (ppm2[mid - 1] + ppm2[mid]) / 2;

      let tp = median * ba;
      const is2 = Number(prop.investment_score) || 0;
      if (is2 >= 80) tp *= 1.05;
      else if (is2 >= 65) tp *= 1.03;
      else if (is2 < 50) tp *= 0.95;

      const rMin = Math.round(tp * 0.95);
      const rMax = Math.round(tp * 1.05);
      const suggested = Math.round(tp);
      const cur = Number(prop.price) || 0;

      let pos: string;
      if (cur > rMax) pos = 'overpriced';
      else if (cur < rMin) pos = 'underpriced';
      else pos = 'market-aligned';

      const cc = valid.length;
      let conf: number;
      if (cc >= 20) conf = 95;
      else if (cc >= 10) conf = 80;
      else if (cc >= 5) conf = 65;
      else conf = 40;

      return {
        recommended_min_price: rMin,
        recommended_max_price: rMax,
        suggested_price: suggested,
        confidence_score: conf,
        price_position: pos,
        comparable_count: cc,
      };
    };

    if (mode === 'price_suggestion') {
      const buildingArea = Number(property.building_area_sqm) || 0;
      if (buildingArea <= 0) {
        return new Response(JSON.stringify({ error: 'Property must have building_area_sqm to estimate price' }), {
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

      console.log(`Price suggestion for ${property_id}: ${result.suggested_price} (${result.comparable_count} comps)`);

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
      console.log(`Days to sell for ${property_id}: ${domResult.estimated_days_on_market} (${domResult.speed_category})`);

      return new Response(JSON.stringify({ mode: 'days_to_sell_prediction', data: domResult }), {
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
        .select('id, city, investment_score, created_at, status, property_type, user_id, agent_id')
        .eq('id', property_id)
        .single();

      if (pErr || !prop) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch owner subscription
      const ownerId = prop.user_id || prop.agent_id;
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
        .select('id, investment_score, created_at, status, property_type, user_id, agent_id')
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
      const ownerIds = [...new Set(allListings.map(l => l.user_id || l.agent_id).filter(Boolean))];
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
        const lid = l.user_id || l.agent_id || '';
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

  } catch (err) {
    console.error('core-engine error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
