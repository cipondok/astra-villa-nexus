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
    const supabase = createClient(supabaseUrl, serviceKey);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

    // ── 1. Fetch user activity (views) ──
    const { data: viewLogs } = await supabase
      .from('activity_logs')
      .select('metadata')
      .eq('user_id', userId)
      .eq('activity_type', 'view')
      .gte('created_at', sixtyDaysAgo)
      .limit(500);

    const viewedPropertyIds: string[] = [];
    for (const log of viewLogs || []) {
      const meta = log.metadata as Record<string, unknown> | null;
      if (meta?.property_id) viewedPropertyIds.push(meta.property_id as string);
    }

    // ── 2. Fetch saved properties ──
    const { data: savedProps } = await supabase
      .from('saved_properties')
      .select('property_id')
      .eq('user_id', userId)
      .gte('saved_at', sixtyDaysAgo)
      .limit(500);

    const savedPropertyIds = (savedProps || []).map(s => s.property_id);
    const interactedIds = [...new Set([...viewedPropertyIds, ...savedPropertyIds])];

    // ── 3. Build user preference profile from interacted properties ──
    let prefCity = '';
    let avgPrice = 0;
    let poolPref = 0;
    let avgFloors = 1;
    let prefPropertyType = '';
    let avgInvestmentScore = 0;

    if (interactedIds.length > 0) {
      const { data: interactedProps } = await supabase
        .from('properties')
        .select('city, price, has_pool, floors, property_type, investment_score')
        .in('id', interactedIds.slice(0, 200));

      const props = interactedProps || [];
      if (props.length > 0) {
        // Most viewed city
        const cityCount: Record<string, number> = {};
        let totalPrice = 0; let priceCount = 0;
        let poolCount = 0; let totalFloors = 0;
        const typeCount: Record<string, number> = {};
        let totalInvScore = 0; let invCount = 0;

        for (const p of props) {
          if (p.city) cityCount[p.city] = (cityCount[p.city] || 0) + 1;
          if (p.price && Number(p.price) > 0) { totalPrice += Number(p.price); priceCount++; }
          if (p.has_pool) poolCount++;
          totalFloors += Number(p.floors) || 1;
          if (p.property_type) typeCount[p.property_type] = (typeCount[p.property_type] || 0) + 1;
          if (p.investment_score) { totalInvScore += Number(p.investment_score); invCount++; }
        }

        prefCity = Object.entries(cityCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;
        poolPref = poolCount / props.length;
        avgFloors = totalFloors / props.length;
        prefPropertyType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
        avgInvestmentScore = invCount > 0 ? totalInvScore / invCount : 0;
      }
    }

    // ── 4. Fetch candidate properties ──
    const { data: candidates } = await supabase
      .from('properties')
      .select('id, city, price, has_pool, floors, property_type, investment_score, province')
      .not('price', 'is', null)
      .gt('price', 0)
      .limit(100);

    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── 5. Fetch save counts per property in preferred city ──
    let saveCounts: Record<string, number> = {};
    if (prefCity) {
      const candidateIds = candidates.filter(c => c.city === prefCity).map(c => c.id);
      if (candidateIds.length > 0) {
        const { data: saves } = await supabase
          .from('saved_properties')
          .select('property_id')
          .in('property_id', candidateIds.slice(0, 200))
          .gte('saved_at', sixtyDaysAgo);

        for (const s of saves || []) {
          saveCounts[s.property_id] = (saveCounts[s.property_id] || 0) + 1;
        }
      }
    }

    // ── 6. Score each candidate ──
    const userPrefersHighScore = avgInvestmentScore >= 65;

    const scored = candidates.map(prop => {
      let score = 0;
      const price = Number(prop.price) || 0;

      // LOCATION MATCH (0–30)
      if (prefCity && prop.city === prefCity) {
        score += 30;
      } else if (prop.province && prefCity) {
        // province-level fallback — same province check via city prefix heuristic
        score += 0; // No province data available in preferences, skip
      }

      // PRICE MATCH (0–25)
      if (avgPrice > 0 && price > 0) {
        const diff = Math.abs(price - avgPrice) / avgPrice;
        if (diff <= 0.15) score += 25;
        else if (diff <= 0.30) score += 15;
        else score += 5;
      }

      // FEATURE MATCH (0–20)
      if (poolPref >= 0.4 && prop.has_pool) score += 10;
      if (Math.abs((Number(prop.floors) || 1) - avgFloors) <= 1) score += 5;
      if (prefPropertyType && prop.property_type === prefPropertyType) score += 5;

      // BEHAVIOR SIMILARITY (0–25)
      const saves = saveCounts[prop.id] || 0;
      if (saves >= 3) score += 15;
      else if (saves >= 1) score += 8;

      if (userPrefersHighScore && (Number(prop.investment_score) || 0) >= 75) score += 10;

      return { property_id: prop.id, ai_match_score: Math.min(100, score) };
    });

    scored.sort((a, b) => b.ai_match_score - a.ai_match_score);

    return new Response(JSON.stringify(scored), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('ai-match-engine error:', err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
