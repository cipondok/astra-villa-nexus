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
    const { property_id, mode, city: reqCity } = await req.json();
    const validModes = ['investment_score', 'price_suggestion', 'listing_health', 'days_to_sell_prediction', 'demand_heat_score', 'price_adjustment_strategy'];
    if (!mode || !validModes.includes(mode)) {
      return new Response(JSON.stringify({ error: 'Invalid mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

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

  } catch (err) {
    console.error('property-intelligence-engine error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
