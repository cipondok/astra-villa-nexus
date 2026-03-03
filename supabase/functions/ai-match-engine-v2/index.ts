import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── 1. AUTH ──
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
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
      return json({ error: 'Unauthorized' }, 401);
    }

    const userId = claimsData.claims.sub as string;

    // Parse optional limit
    let limit = 50;
    try {
      const body = await req.json();
      if (body?.limit && typeof body.limit === 'number') {
        limit = Math.max(1, Math.min(100, body.limit));
      }
    } catch { /* no body or invalid json, use default */ }

    const supabase = createClient(supabaseUrl, serviceKey);
    const now = Date.now();
    const oneEightyDaysAgo = new Date(now - 180 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    // ── 2. FETCH USER BEHAVIOR (parallel) ──
    const [{ data: activityLogs }, { data: savedProps }] = await Promise.all([
      supabase
        .from('activity_logs')
        .select('activity_type, metadata, created_at')
        .eq('user_id', userId)
        .in('activity_type', ['view', 'save', 'contact'])
        .gte('created_at', oneEightyDaysAgo)
        .limit(500),
      supabase
        .from('saved_properties')
        .select('property_id, saved_at')
        .eq('user_id', userId)
        .gte('saved_at', oneEightyDaysAgo)
        .limit(500),
    ]);

    const ACTION_WEIGHTS: Record<string, number> = { view: 1, save: 3, contact: 5 };
    const propWeights: Record<string, number> = {};

    for (const log of activityLogs || []) {
      const meta = log.metadata as Record<string, unknown> | null;
      const propId = meta?.property_id as string | undefined;
      if (!propId) continue;
      const daysSince = Math.max(0, (now - new Date(log.created_at).getTime()) / 86_400_000);
      const w = (ACTION_WEIGHTS[log.activity_type] ?? 1) * (1 / (daysSince + 1));
      propWeights[propId] = (propWeights[propId] || 0) + w;
    }

    for (const sp of savedProps || []) {
      const daysSince = Math.max(0, (now - new Date(sp.saved_at).getTime()) / 86_400_000);
      const w = 3 * (1 / (daysSince + 1));
      propWeights[sp.property_id] = (propWeights[sp.property_id] || 0) + w;
    }

    const interactedIds = Object.keys(propWeights);

    // ── 3. BUILD USER_AI_PROFILE ──
    let preferredCity = '';
    let avgBudget = 0;
    let poolAffinityPercent = 0;
    let avgInvestmentScoreViewed = 0;
    let propertyTypePreference = '';
    let buyerType: 'investor' | 'balanced' | 'lifestyle' = 'balanced';
    let preferredProvince = '';

    if (interactedIds.length > 0) {
      const { data: props } = await supabase
        .from('properties')
        .select('id, city, province, price, has_pool, property_type, investment_score')
        .in('id', interactedIds.slice(0, 200));

      const items = props || [];
      if (items.length > 0) {
        const cityW: Record<string, number> = {};
        const typeW: Record<string, number> = {};
        let wPrice = 0, wPriceSum = 0;
        let poolCount = 0;
        let wInv = 0, wInvSum = 0;

        for (const p of items) {
          const w = propWeights[p.id] || 1;
          if (p.city) cityW[p.city] = (cityW[p.city] || 0) + w;
          if (p.price && Number(p.price) > 0) { wPrice += Number(p.price) * w; wPriceSum += w; }
          if (p.has_pool) poolCount++;
          if (p.property_type) typeW[p.property_type] = (typeW[p.property_type] || 0) + w;
          if (p.investment_score) { wInv += Number(p.investment_score) * w; wInvSum += w; }
        }

        const topCity = Object.entries(cityW).sort((a, b) => b[1] - a[1])[0];
        preferredCity = topCity?.[0] || '';
        // Resolve province for preferred city
        if (preferredCity) {
          const cityProp = items.find(p => p.city === preferredCity);
          preferredProvince = cityProp?.province || '';
        }

        avgBudget = wPriceSum > 0 ? wPrice / wPriceSum : 0;
        poolAffinityPercent = Math.round((poolCount / items.length) * 100);
        propertyTypePreference = Object.entries(typeW).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        avgInvestmentScoreViewed = wInvSum > 0 ? wInv / wInvSum : 0;

        // Buyer type
        if (avgInvestmentScoreViewed > 70) buyerType = 'investor';
        else if (poolAffinityPercent > 60) buyerType = 'lifestyle';
        else buyerType = 'balanced';
      }
    }

    console.log(`[ai-match-engine-v2] user_id=${userId} buyer_type=${buyerType} preferred_city=${preferredCity} avg_budget=${Math.round(avgBudget)}`);

    // ── 4. FETCH CANDIDATE PROPERTIES ──
    let query = supabase
      .from('properties')
      .select('id, city, province, price, has_pool, property_type, investment_score')
      .not('price', 'is', null)
      .gt('price', 0)
      .limit(200);

    // Try filtering by status if column exists; fall back gracefully
    query = query.eq('status', 'published');

    const { data: candidates, error: candErr } = await query;

    // If status filter fails (column may not exist), retry without it
    let finalCandidates = candidates;
    if (candErr) {
      const { data: fallback } = await supabase
        .from('properties')
        .select('id, city, province, price, has_pool, property_type, investment_score')
        .not('price', 'is', null)
        .gt('price', 0)
        .limit(200);
      finalCandidates = fallback;
    }

    if (!finalCandidates || finalCandidates.length === 0) {
      return json({ ranked_properties: [] });
    }

    // ── 5a. POPULARITY: batch save counts last 30 days ──
    const candidateIds = finalCandidates.map(c => c.id);
    const { data: recentSaves } = await supabase
      .from('saved_properties')
      .select('property_id')
      .in('property_id', candidateIds.slice(0, 200))
      .gte('saved_at', thirtyDaysAgo);

    const saveCounts: Record<string, number> = {};
    for (const s of recentSaves || []) {
      saveCounts[s.property_id] = (saveCounts[s.property_id] || 0) + 1;
    }

    // ── 5b. SCORING ENGINE ──
    const scored = finalCandidates.map(prop => {
      let score = 0;
      const price = Number(prop.price) || 0;
      const invScore = Number(prop.investment_score) || 0;

      // LOCATION (0–25)
      if (preferredCity && prop.city === preferredCity) {
        score += 25;
      } else if (preferredProvince && prop.province === preferredProvince) {
        score += 10;
      }

      // PRICE (0–20)
      if (avgBudget > 0 && price > 0) {
        const diff = Math.abs(price - avgBudget) / avgBudget;
        if (diff <= 0.20) score += 20;
        else if (diff <= 0.40) score += 10;
      }

      // FEATURE (0–20)
      if (poolAffinityPercent > 60 && prop.has_pool) score += 10;
      if (propertyTypePreference && prop.property_type === propertyTypePreference) score += 10;

      // INVESTMENT (0–20)
      if (buyerType === 'investor') {
        score += Math.min(20, Math.round(invScore * 0.2));
      } else if (buyerType === 'balanced') {
        score += Math.min(15, Math.round(invScore * 0.15));
      } else {
        // lifestyle — max 10
        score += Math.min(10, Math.round(invScore * 0.1));
      }

      // POPULARITY (0–15)
      const saves = saveCounts[prop.id] || 0;
      if (saves >= 20) score += 15;
      else if (saves >= 10) score += 10;
      else if (saves >= 5) score += 5;

      return { id: prop.id, ai_match_score_v2: Math.max(0, Math.min(100, score)) };
    });

    // ── 6. SORT & LIMIT ──
    scored.sort((a, b) => b.ai_match_score_v2 - a.ai_match_score_v2);

    return json({ ranked_properties: scored.slice(0, limit) });

  } catch (err) {
    console.error('ai-match-engine-v2 error:', err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});
