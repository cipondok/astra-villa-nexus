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
    // ── Auth: extract user_id from JWT only ──
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
    const supabase = createClient(supabaseUrl, serviceKey);
    const now = Date.now();
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();

    // ── 1. Fetch user behavior ──
    const [{ data: activityLogs }, { data: savedProps }] = await Promise.all([
      supabase
        .from('activity_logs')
        .select('activity_type, metadata, created_at')
        .eq('user_id', userId)
        .in('activity_type', ['view', 'save', 'contact'])
        .gte('created_at', sixtyDaysAgo)
        .limit(500),
      supabase
        .from('saved_properties')
        .select('property_id, saved_at')
        .eq('user_id', userId)
        .gte('saved_at', sixtyDaysAgo)
        .limit(500),
    ]);

    // ── 2. Time-decay weighted interactions ──
    const ACTION_WEIGHTS: Record<string, number> = { view: 1, save: 3, contact: 5 };

    interface WeightedInteraction {
      property_id: string;
      weight: number;
    }

    const interactions: WeightedInteraction[] = [];

    for (const log of activityLogs || []) {
      const meta = log.metadata as Record<string, unknown> | null;
      const propId = meta?.property_id as string | undefined;
      if (!propId) continue;
      const daysSince = Math.max(0, (now - new Date(log.created_at).getTime()) / 86_400_000);
      const actionWeight = ACTION_WEIGHTS[log.activity_type] ?? 1;
      interactions.push({ property_id: propId, weight: actionWeight * (1 / (daysSince + 1)) });
    }

    for (const sp of savedProps || []) {
      const daysSince = Math.max(0, (now - new Date(sp.saved_at).getTime()) / 86_400_000);
      interactions.push({ property_id: sp.property_id, weight: 3 * (1 / (daysSince + 1)) });
    }

    // Aggregate weights per property
    const propWeights: Record<string, number> = {};
    for (const i of interactions) {
      propWeights[i.property_id] = (propWeights[i.property_id] || 0) + i.weight;
    }

    const interactedIds = Object.keys(propWeights);

    // ── 3. Build user_ai_profile ──
    let preferredCity = '';
    let avgBudget = 0;
    let poolAffinityPercent = 0;
    let avgInvestmentScoreViewed = 0;
    let propertyTypePreference = '';
    let buyerType: 'investor' | 'balanced' | 'lifestyle' = 'balanced';

    if (interactedIds.length > 0) {
      const { data: props } = await supabase
        .from('properties')
        .select('id, city, price, has_pool, floors, property_type, investment_score, province')
        .in('id', interactedIds.slice(0, 200));

      const items = props || [];
      if (items.length > 0) {
        const cityWeights: Record<string, number> = {};
        const typeWeights: Record<string, number> = {};
        let totalPrice = 0, priceCount = 0;
        let poolCount = 0;
        let totalInvScore = 0, invCount = 0;

        for (const p of items) {
          const w = propWeights[p.id] || 1;
          if (p.city) cityWeights[p.city] = (cityWeights[p.city] || 0) + w;
          if (p.price && Number(p.price) > 0) { totalPrice += Number(p.price) * w; priceCount += w; }
          if (p.has_pool) poolCount++;
          if (p.property_type) typeWeights[p.property_type] = (typeWeights[p.property_type] || 0) + w;
          if (p.investment_score) { totalInvScore += Number(p.investment_score) * w; invCount += w; }
        }

        preferredCity = Object.entries(cityWeights).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        avgBudget = priceCount > 0 ? totalPrice / priceCount : 0;
        poolAffinityPercent = Math.round((poolCount / items.length) * 100);
        propertyTypePreference = Object.entries(typeWeights).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        avgInvestmentScoreViewed = invCount > 0 ? totalInvScore / invCount : 0;

        // Determine buyer_type
        if (avgInvestmentScoreViewed >= 70) buyerType = 'investor';
        else if (avgInvestmentScoreViewed <= 40) buyerType = 'lifestyle';
        else buyerType = 'balanced';
      }
    }

    // ── 4. Fetch candidate properties (limit 200) ──
    const { data: candidates } = await supabase
      .from('properties')
      .select('id, city, province, price, has_pool, property_type, investment_score')
      .not('price', 'is', null)
      .gt('price', 0)
      .limit(200);

    if (!candidates || candidates.length === 0) {
      return json({ ranked_properties: [] });
    }

    // ── 5a. Popularity: save counts last 30 days ──
    const candidateIds = candidates.map(c => c.id);
    const { data: recentSaves } = await supabase
      .from('saved_properties')
      .select('property_id')
      .in('property_id', candidateIds.slice(0, 200))
      .gte('saved_at', thirtyDaysAgo);

    const saveCounts: Record<string, number> = {};
    for (const s of recentSaves || []) {
      saveCounts[s.property_id] = (saveCounts[s.property_id] || 0) + 1;
    }
    const maxSaves = Math.max(1, ...Object.values(saveCounts));

    // ── 5b. Score each candidate ──
    const scored = candidates.map(prop => {
      let score = 0;
      const price = Number(prop.price) || 0;

      // LOCATION (0–25)
      if (preferredCity && prop.city === preferredCity) {
        score += 25;
      } else if (preferredCity && prop.province) {
        // Province-level fallback — crude heuristic
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
      const invScore = Number(prop.investment_score) || 0;
      if (buyerType === 'investor') {
        score += Math.min(20, Math.round(invScore * 0.2));
      } else if (buyerType === 'lifestyle') {
        score += Math.min(10, Math.round(invScore * 0.1));
      } else {
        score += Math.min(15, Math.round(invScore * 0.15));
      }

      // POPULARITY (0–15)
      const saves = saveCounts[prop.id] || 0;
      score += Math.round((saves / maxSaves) * 15);

      return { id: prop.id, ai_match_score_v2: Math.min(100, score) };
    });

    scored.sort((a, b) => b.ai_match_score_v2 - a.ai_match_score_v2);

    return json({ ranked_properties: scored });

  } catch (err) {
    console.error('ai-match-engine-v2 error:', err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});
