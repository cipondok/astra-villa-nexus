import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ═══════════════════════════════════════════════════════
// SELF-LEARNING MARKET INTELLIGENCE BRAIN
// Autonomous AI that evolves prediction accuracy
// ═══════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { pipeline } = body;

    const validPipelines = [
      'prediction_feedback_loop',
      'behavioral_learning',
      'market_pattern_discovery',
      'model_drift_detection',
      'strategy_optimization',
      'full_learning_cycle',
      'system_status',
    ];

    if (!pipeline || !validPipelines.includes(pipeline)) {
      return new Response(JSON.stringify({ error: 'Invalid pipeline', valid: validPipelines }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[INTELLIGENCE-BRAIN] Running pipeline: ${pipeline}`);

    // ─── Start learning cycle log ───
    const cycleStart = Date.now();
    const { data: cycle } = await supabase.from('ai_learning_cycles').insert({
      cycle_type: pipeline,
      status: 'running',
      started_at: new Date().toISOString(),
    }).select('id').single();
    const cycleId = cycle?.id;

    let result: any = {};

    try {
      switch (pipeline) {
        case 'prediction_feedback_loop':
          result = await runPredictionFeedbackLoop(supabase);
          break;
        case 'behavioral_learning':
          result = await runBehavioralLearning(supabase);
          break;
        case 'market_pattern_discovery':
          result = await runMarketPatternDiscovery(supabase);
          break;
        case 'model_drift_detection':
          result = await runModelDriftDetection(supabase);
          break;
        case 'strategy_optimization':
          result = await runStrategyOptimization(supabase, body);
          break;
        case 'full_learning_cycle':
          result = await runFullLearningCycle(supabase);
          break;
        case 'system_status':
          result = await getSystemStatus(supabase);
          break;
      }

      // Complete cycle
      if (cycleId) {
        await supabase.from('ai_learning_cycles').update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - cycleStart,
          metrics_after: result.metrics || {},
          improvements: result.improvements || {},
          data_points_processed: result.data_points_processed || 0,
        }).eq('id', cycleId);
      }
    } catch (pipelineErr) {
      if (cycleId) {
        await supabase.from('ai_learning_cycles').update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          duration_ms: Date.now() - cycleStart,
          error_message: pipelineErr instanceof Error ? pipelineErr.message : 'Unknown error',
        }).eq('id', cycleId);
      }
      throw pipelineErr;
    }

    return new Response(JSON.stringify({
      pipeline,
      cycle_id: cycleId,
      duration_ms: Date.now() - cycleStart,
      ...result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[INTELLIGENCE-BRAIN] Error:', err);
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : 'Unknown error',
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


// ═══════════════════════════════════════════════════════
// 1️⃣ PREDICTION FEEDBACK LOOP
// Compare forecasts to actual outcomes, calibrate confidence
// ═══════════════════════════════════════════════════════

async function runPredictionFeedbackLoop(supabase: any) {
  console.log('[FEEDBACK-LOOP] Starting prediction feedback resolution...');

  // Step 1: Find unresolved predictions where we now have actual data
  // Check price predictions against current property prices
  const { data: unresolvedPredictions } = await supabase
    .from('ai_prediction_log')
    .select('id, model_name, prediction_type, property_id, predicted_value, confidence, created_at, prediction_horizon_days, city, region')
    .is('actual_value', null)
    .not('property_id', 'is', null)
    .order('created_at', { ascending: true })
    .limit(200);

  if (!unresolvedPredictions?.length) {
    return { status: 'no_unresolved_predictions', data_points_processed: 0 };
  }

  const propertyIds = [...new Set(unresolvedPredictions.map((p: any) => p.property_id))];
  
  // Get current property data in chunks
  let resolvedCount = 0;
  const errors: number[] = [];
  const modelPerformance: Record<string, { errors: number[], correct: number, total: number }> = {};

  for (let i = 0; i < propertyIds.length; i += 50) {
    const chunk = propertyIds.slice(i, i + 50);
    const { data: properties } = await supabase
      .from('properties')
      .select('id, price, rental_price, investment_score, days_on_market, sold_at, status')
      .in('id', chunk);

    if (!properties) continue;

    const propMap = new Map(properties.map((p: any) => [p.id, p]));

    for (const pred of unresolvedPredictions.filter((p: any) => chunk.includes(p.property_id))) {
      const prop = propMap.get(pred.property_id);
      if (!prop) continue;

      // Check if prediction horizon has elapsed
      const predDate = new Date(pred.created_at);
      const horizonEnd = new Date(predDate.getTime() + pred.prediction_horizon_days * 86400000);
      if (horizonEnd > new Date()) continue; // Not yet resolvable

      let actualValue: number | null = null;

      switch (pred.prediction_type) {
        case 'roi':
        case 'appreciation':
          actualValue = prop.price || null;
          break;
        case 'rental_yield':
          if (prop.rental_price && prop.price) {
            actualValue = (prop.rental_price * 12 / prop.price) * 100;
          }
          break;
        case 'days_to_sell':
          actualValue = prop.days_on_market || null;
          break;
        case 'deal_score':
        case 'investment_score':
          actualValue = prop.investment_score || null;
          break;
      }

      if (actualValue === null) continue;

      const error = actualValue - pred.predicted_value;
      const absError = Math.abs(error);
      const pctError = pred.predicted_value !== 0 ? (absError / Math.abs(pred.predicted_value)) * 100 : null;

      // Update prediction with actual value
      await supabase.from('ai_prediction_log').update({
        actual_value: actualValue,
        prediction_error: error,
        absolute_error: absError,
        percentage_error: pctError,
        resolved_at: new Date().toISOString(),
      }).eq('id', pred.id);

      resolvedCount++;
      errors.push(absError);

      // Track per-model performance
      if (!modelPerformance[pred.model_name]) {
        modelPerformance[pred.model_name] = { errors: [], correct: 0, total: 0 };
      }
      modelPerformance[pred.model_name].errors.push(pctError || absError);
      modelPerformance[pred.model_name].total++;
      if (pctError !== null && pctError < 10) {
        modelPerformance[pred.model_name].correct++;
      }
    }
  }

  // Step 2: Update model accuracy scores
  const modelUpdates: any[] = [];
  for (const [modelName, perf] of Object.entries(modelPerformance)) {
    const mae = perf.errors.reduce((a, b) => a + b, 0) / perf.errors.length;
    const accuracy = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;

    // Update model registry
    const { data: model } = await supabase
      .from('ai_model_registry')
      .select('id, total_predictions, correct_predictions')
      .eq('model_name', modelName)
      .eq('status', 'production')
      .single();

    if (model) {
      const newTotal = (model.total_predictions || 0) + perf.total;
      const newCorrect = (model.correct_predictions || 0) + perf.correct;
      await supabase.from('ai_model_registry').update({
        total_predictions: newTotal,
        correct_predictions: newCorrect,
        accuracy_score: newTotal > 0 ? (newCorrect / newTotal) * 100 : 0,
        updated_at: new Date().toISOString(),
      }).eq('id', model.id);

      modelUpdates.push({ model: modelName, mae, accuracy, total: perf.total });
    }
  }

  // Step 3: Compute confidence calibration
  const { data: recentResolved } = await supabase
    .from('ai_prediction_log')
    .select('confidence, percentage_error')
    .not('actual_value', 'is', null)
    .not('percentage_error', 'is', null)
    .order('resolved_at', { ascending: false })
    .limit(500);

  let calibrationScore = 0;
  if (recentResolved?.length) {
    // Group by confidence buckets and check if accuracy matches
    const buckets: Record<string, { count: number, accurate: number }> = {};
    for (const r of recentResolved) {
      const bucket = Math.round(r.confidence * 10) / 10; // 0.0, 0.1, ..., 1.0
      const key = bucket.toFixed(1);
      if (!buckets[key]) buckets[key] = { count: 0, accurate: 0 };
      buckets[key].count++;
      if (r.percentage_error < bucket * 100) buckets[key].accurate++;
    }
    // Calibration = avg diff between expected and actual accuracy
    const diffs = Object.entries(buckets).map(([conf, b]) => {
      const expected = parseFloat(conf);
      const actual = b.count > 0 ? b.accurate / b.count : 0;
      return Math.abs(expected - actual);
    });
    calibrationScore = 1 - (diffs.reduce((a, b) => a + b, 0) / diffs.length);
  }

  const overallMAE = errors.length > 0 ? errors.reduce((a, b) => a + b, 0) / errors.length : 0;

  return {
    status: 'completed',
    resolved_predictions: resolvedCount,
    overall_mae: Math.round(overallMAE * 100) / 100,
    calibration_score: Math.round(calibrationScore * 1000) / 1000,
    model_updates: modelUpdates,
    data_points_processed: resolvedCount,
    metrics: {
      resolved: resolvedCount,
      mae: overallMAE,
      calibration: calibrationScore,
    },
  };
}


// ═══════════════════════════════════════════════════════
// 2️⃣ BEHAVIORAL LEARNING INTELLIGENCE
// Cluster investors, evolve personas, adjust deal rankings
// ═══════════════════════════════════════════════════════

async function runBehavioralLearning(supabase: any) {
  console.log('[BEHAVIORAL-LEARNING] Starting investor clustering...');

  // Step 1: Gather behavioral signals per user
  const { data: behaviorData } = await supabase
    .from('ai_behavior_tracking')
    .select('user_id, event_type, property_id, duration_ms, event_data, created_at')
    .not('user_id', 'is', null)
    .gte('created_at', new Date(Date.now() - 90 * 86400000).toISOString()) // Last 90 days
    .order('created_at', { ascending: false })
    .limit(5000);

  if (!behaviorData?.length) {
    return { status: 'insufficient_data', data_points_processed: 0 };
  }

  // Step 2: Build user feature vectors
  const userFeatures: Record<string, {
    clicks: number, views: number, saves: number, inquiries: number,
    offers: number, avgViewDuration: number, durations: number[],
    propertyTypes: Record<string, number>, cities: Record<string, number>,
    priceRanges: number[], lastActive: string,
  }> = {};

  for (const ev of behaviorData) {
    if (!ev.user_id) continue;
    if (!userFeatures[ev.user_id]) {
      userFeatures[ev.user_id] = {
        clicks: 0, views: 0, saves: 0, inquiries: 0, offers: 0,
        avgViewDuration: 0, durations: [],
        propertyTypes: {}, cities: {}, priceRanges: [],
        lastActive: ev.created_at,
      };
    }
    const uf = userFeatures[ev.user_id];

    switch (ev.event_type) {
      case 'property_view': case 'view': uf.views++; break;
      case 'property_click': case 'click': uf.clicks++; break;
      case 'save': case 'watchlist_add': uf.saves++; break;
      case 'inquiry': case 'contact': uf.inquiries++; break;
      case 'offer': case 'offer_submit': uf.offers++; break;
    }

    if (ev.duration_ms) uf.durations.push(ev.duration_ms);

    const ed = ev.event_data as any;
    if (ed?.property_type) {
      uf.propertyTypes[ed.property_type] = (uf.propertyTypes[ed.property_type] || 0) + 1;
    }
    if (ed?.city) {
      uf.cities[ed.city] = (uf.cities[ed.city] || 0) + 1;
    }
    if (ed?.price) {
      uf.priceRanges.push(ed.price);
    }
  }

  // Step 3: Classify each user into a persona using heuristic clustering
  const PERSONAS = {
    luxury_flipper: { minAvgPrice: 5_000_000_000, highOfferRatio: true, shortHold: true },
    yield_hunter: { rentalFocus: true, longHold: true },
    long_term_holder: { lowTurnover: true, diversified: true },
    active_trader: { highActivity: true, frequentOffers: true },
    passive_browser: { lowActivity: true, fewOffers: true },
    emerging_investor: { moderateActivity: true, growingEngagement: true },
  };

  const clusterAssignments: Record<string, { persona: string, riskAppetite: string, style: string, score: number, vector: any }> = {};

  for (const [userId, features] of Object.entries(userFeatures)) {
    const totalActions = features.clicks + features.views + features.saves + features.inquiries + features.offers;
    const avgDuration = features.durations.length > 0 
      ? features.durations.reduce((a, b) => a + b, 0) / features.durations.length 
      : 0;
    const avgPrice = features.priceRanges.length > 0
      ? features.priceRanges.reduce((a, b) => a + b, 0) / features.priceRanges.length
      : 0;
    const offerRatio = totalActions > 0 ? features.offers / totalActions : 0;
    const saveRatio = totalActions > 0 ? features.saves / totalActions : 0;

    // Determine persona
    let persona = 'emerging_investor';
    let riskAppetite = 'moderate';
    let style = 'balanced';

    if (avgPrice > 5_000_000_000 && offerRatio > 0.1) {
      persona = 'luxury_flipper';
      riskAppetite = 'aggressive';
      style = 'flip';
    } else if (saveRatio > 0.3 && avgDuration > 30000) {
      persona = 'yield_hunter';
      riskAppetite = 'moderate';
      style = 'yield_focused';
    } else if (totalActions > 50 && offerRatio > 0.05) {
      persona = 'active_trader';
      riskAppetite = 'aggressive';
      style = 'appreciation_focused';
    } else if (totalActions > 20 && saveRatio > 0.2) {
      persona = 'long_term_holder';
      riskAppetite = 'conservative';
      style = 'balanced';
    } else if (totalActions < 10) {
      persona = 'passive_browser';
      riskAppetite = 'conservative';
      style = 'balanced';
    }

    const membershipScore = Math.min(1, totalActions / 100);

    clusterAssignments[userId] = {
      persona, riskAppetite, style, score: membershipScore,
      vector: {
        total_actions: totalActions,
        avg_duration: avgDuration,
        avg_price: avgPrice,
        offer_ratio: offerRatio,
        save_ratio: saveRatio,
        top_city: Object.entries(features.cities).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
        top_type: Object.entries(features.propertyTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
      },
    };
  }

  // Step 4: Ensure clusters exist and upsert memberships
  const personaNames = [...new Set(Object.values(clusterAssignments).map(c => c.persona))];
  
  for (const pName of personaNames) {
    const members = Object.entries(clusterAssignments).filter(([_, c]) => c.persona === pName);
    const avgScore = members.reduce((a, [_, c]) => a + c.score, 0) / members.length;

    await supabase.from('ai_investor_clusters').upsert({
      cluster_name: pName,
      cluster_type: 'auto',
      description: `Auto-discovered ${pName.replace(/_/g, ' ')} investor segment`,
      centroid_features: members[0]?.[1].vector || {},
      member_count: members.length,
      avg_risk_score: avgScore * 100,
      behavioral_signature: { persona: pName, sample_size: members.length },
      is_active: true,
      last_reclustered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'cluster_name' }).select();
  }

  // Get cluster IDs
  const { data: clusters } = await supabase
    .from('ai_investor_clusters')
    .select('id, cluster_name')
    .in('cluster_name', personaNames);

  const clusterMap = new Map((clusters || []).map((c: any) => [c.cluster_name, c.id]));

  // Upsert memberships
  let membershipCount = 0;
  const membershipBatch: any[] = [];

  for (const [userId, assignment] of Object.entries(clusterAssignments)) {
    const clusterId = clusterMap.get(assignment.persona);
    if (!clusterId) continue;

    membershipBatch.push({
      user_id: userId,
      cluster_id: clusterId,
      membership_score: assignment.score,
      persona_label: assignment.persona,
      risk_appetite: assignment.riskAppetite,
      investment_style: assignment.style,
      behavioral_vector: assignment.vector,
      last_action_at: userFeatures[userId]?.lastActive || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  // Batch insert in chunks
  for (let i = 0; i < membershipBatch.length; i += 50) {
    const chunk = membershipBatch.slice(i, i + 50);
    const { error } = await supabase.from('ai_investor_cluster_membership').upsert(chunk, {
      onConflict: 'user_id,cluster_id',
    });
    if (!error) membershipCount += chunk.length;
  }

  return {
    status: 'completed',
    users_analyzed: Object.keys(userFeatures).length,
    clusters_updated: personaNames.length,
    memberships_upserted: membershipCount,
    persona_distribution: personaNames.reduce((acc, p) => {
      acc[p] = Object.values(clusterAssignments).filter(c => c.persona === p).length;
      return acc;
    }, {} as Record<string, number>),
    data_points_processed: behaviorData.length,
    metrics: {
      users: Object.keys(userFeatures).length,
      clusters: personaNames.length,
    },
  };
}


// ═══════════════════════════════════════════════════════
// 3️⃣ AUTONOMOUS MARKET PATTERN DISCOVERY
// Statistical anomaly detection for emerging zones & inefficiencies
// ═══════════════════════════════════════════════════════

async function runMarketPatternDiscovery(supabase: any) {
  console.log('[PATTERN-DISCOVERY] Scanning for market anomalies...');

  const patterns: any[] = [];

  // Step 1: Detect emerging demand zones (cities with unusual view/inquiry spikes)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const sixtyDaysAgo = new Date(Date.now() - 60 * 86400000).toISOString();

  const { data: recentActivity } = await supabase
    .from('ai_behavior_tracking')
    .select('event_data, event_type')
    .gte('created_at', thirtyDaysAgo)
    .in('event_type', ['property_view', 'view', 'inquiry', 'contact', 'save'])
    .limit(3000);

  const { data: priorActivity } = await supabase
    .from('ai_behavior_tracking')
    .select('event_data, event_type')
    .gte('created_at', sixtyDaysAgo)
    .lt('created_at', thirtyDaysAgo)
    .in('event_type', ['property_view', 'view', 'inquiry', 'contact', 'save'])
    .limit(3000);

  // Aggregate by city
  const countByCity = (data: any[]) => {
    const counts: Record<string, number> = {};
    for (const d of data || []) {
      const city = (d.event_data as any)?.city;
      if (city) counts[city] = (counts[city] || 0) + 1;
    }
    return counts;
  };

  const recentCounts = countByCity(recentActivity || []);
  const priorCounts = countByCity(priorActivity || []);

  for (const [city, recentCount] of Object.entries(recentCounts)) {
    const priorCount = priorCounts[city] || 1;
    const growthRate = (recentCount - priorCount) / priorCount;

    if (growthRate > 0.5 && recentCount > 10) { // 50%+ growth
      patterns.push({
        pattern_type: 'emerging_zone',
        severity: growthRate > 1.0 ? 'high' : 'moderate',
        confidence: Math.min(0.95, 0.5 + growthRate * 0.2),
        location_city: city,
        pattern_data: {
          recent_activity: recentCount,
          prior_activity: priorCount,
          growth_rate: Math.round(growthRate * 100),
          trend: 'accelerating',
        },
        signal_strength: Math.min(100, Math.round(growthRate * 50 + recentCount)),
        discovery_method: 'statistical',
        supporting_evidence: [{ metric: 'activity_growth', value: growthRate }],
        recommended_action: `Monitor ${city} for investment opportunities - demand surge detected`,
        is_active: true,
        first_detected_at: new Date().toISOString(),
        last_confirmed_at: new Date().toISOString(),
      });
    }
  }

  // Step 2: Detect pricing inefficiencies (properties priced significantly below area median)
  const { data: priceData } = await supabase
    .from('properties')
    .select('id, price, city, property_type, building_area_sqm, land_area_sqm, status')
    .eq('status', 'active')
    .not('price', 'is', null)
    .not('city', 'is', null)
    .gt('price', 0)
    .limit(2000);

  if (priceData?.length) {
    // Calculate price per sqm by city
    const cityPrices: Record<string, number[]> = {};
    for (const p of priceData) {
      const area = p.building_area_sqm || p.land_area_sqm || 100;
      const ppsqm = p.price / area;
      if (!cityPrices[p.city]) cityPrices[p.city] = [];
      cityPrices[p.city].push(ppsqm);
    }

    for (const [city, prices] of Object.entries(cityPrices)) {
      if (prices.length < 5) continue;

      const sorted = [...prices].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const stdDev = Math.sqrt(
        prices.reduce((sum, p) => sum + Math.pow(p - median, 2), 0) / prices.length
      );

      // Properties significantly below median (> 1.5 std devs)
      const undervalued = prices.filter(p => p < median - 1.5 * stdDev).length;
      const inefficiencyRate = undervalued / prices.length;

      if (inefficiencyRate > 0.05 && undervalued > 2) {
        patterns.push({
          pattern_type: 'price_inefficiency',
          severity: inefficiencyRate > 0.15 ? 'high' : 'moderate',
          confidence: Math.min(0.9, 0.4 + prices.length / 100),
          location_city: city,
          pattern_data: {
            median_ppsqm: Math.round(median),
            q1_ppsqm: Math.round(q1),
            std_dev: Math.round(stdDev),
            undervalued_count: undervalued,
            total_properties: prices.length,
            inefficiency_rate: Math.round(inefficiencyRate * 100),
          },
          signal_strength: Math.min(100, Math.round(inefficiencyRate * 300 + undervalued * 5)),
          discovery_method: 'statistical',
          recommended_action: `${undervalued} properties in ${city} appear significantly undervalued`,
          is_active: true,
          first_detected_at: new Date().toISOString(),
          last_confirmed_at: new Date().toISOString(),
        });
      }
    }
  }

  // Step 3: Detect micro-cycles (price velocity changes)
  const { data: priceHistory } = await supabase
    .from('property_price_history')
    .select('property_id, old_price, new_price, changed_at, change_reason')
    .gte('changed_at', new Date(Date.now() - 90 * 86400000).toISOString())
    .order('changed_at', { ascending: false })
    .limit(1000);

  if (priceHistory?.length) {
    // Aggregate price changes by month
    const monthlyChanges: Record<string, { increases: number, decreases: number, avgChange: number[] }> = {};

    for (const ph of priceHistory) {
      if (!ph.old_price || !ph.new_price) continue;
      const month = ph.changed_at.substring(0, 7); // YYYY-MM
      if (!monthlyChanges[month]) monthlyChanges[month] = { increases: 0, decreases: 0, avgChange: [] };
      
      const changePct = ((ph.new_price - ph.old_price) / ph.old_price) * 100;
      monthlyChanges[month].avgChange.push(changePct);
      if (changePct > 0) monthlyChanges[month].increases++;
      else monthlyChanges[month].decreases++;
    }

    const months = Object.keys(monthlyChanges).sort();
    if (months.length >= 2) {
      const latest = monthlyChanges[months[months.length - 1]];
      const prior = monthlyChanges[months[months.length - 2]];
      
      const latestAvg = latest.avgChange.reduce((a, b) => a + b, 0) / latest.avgChange.length;
      const priorAvg = prior.avgChange.reduce((a, b) => a + b, 0) / prior.avgChange.length;
      const velocityChange = latestAvg - priorAvg;

      if (Math.abs(velocityChange) > 2) { // Significant velocity change
        patterns.push({
          pattern_type: 'micro_cycle',
          severity: Math.abs(velocityChange) > 5 ? 'high' : 'moderate',
          confidence: 0.6,
          pattern_data: {
            latest_month: months[months.length - 1],
            latest_avg_change: Math.round(latestAvg * 100) / 100,
            prior_avg_change: Math.round(priorAvg * 100) / 100,
            velocity_shift: Math.round(velocityChange * 100) / 100,
            direction: velocityChange > 0 ? 'accelerating' : 'decelerating',
            latest_increases: latest.increases,
            latest_decreases: latest.decreases,
          },
          signal_strength: Math.min(100, Math.round(Math.abs(velocityChange) * 15)),
          discovery_method: 'statistical',
          recommended_action: velocityChange > 0 
            ? 'Market pricing accelerating - consider early entry' 
            : 'Market pricing decelerating - potential correction ahead',
          is_active: true,
          first_detected_at: new Date().toISOString(),
          last_confirmed_at: new Date().toISOString(),
        });
      }
    }
  }

  // Step 4: Persist discovered patterns
  let patternsInserted = 0;
  if (patterns.length > 0) {
    // Expire old patterns of same types
    const patternTypes = [...new Set(patterns.map(p => p.pattern_type))];
    await supabase.from('ai_market_patterns')
      .update({ is_active: false, expired_at: new Date().toISOString() })
      .in('pattern_type', patternTypes)
      .eq('is_active', true);

    const { data: inserted } = await supabase
      .from('ai_market_patterns')
      .insert(patterns)
      .select('id');
    patternsInserted = inserted?.length || 0;
  }

  return {
    status: 'completed',
    patterns_discovered: patterns.length,
    patterns_inserted: patternsInserted,
    pattern_breakdown: {
      emerging_zones: patterns.filter(p => p.pattern_type === 'emerging_zone').length,
      price_inefficiencies: patterns.filter(p => p.pattern_type === 'price_inefficiency').length,
      micro_cycles: patterns.filter(p => p.pattern_type === 'micro_cycle').length,
    },
    data_points_processed: (recentActivity?.length || 0) + (priceData?.length || 0) + (priceHistory?.length || 0),
    metrics: {
      patterns: patterns.length,
      high_severity: patterns.filter(p => p.severity === 'high').length,
    },
  };
}


// ═══════════════════════════════════════════════════════
// 4️⃣ MODEL DRIFT DETECTION
// Detect when models degrade and trigger shadow testing
// ═══════════════════════════════════════════════════════

async function runModelDriftDetection(supabase: any) {
  console.log('[DRIFT-DETECTION] Scanning for model drift...');

  // Get all production models
  const { data: models } = await supabase
    .from('ai_model_registry')
    .select('*')
    .eq('status', 'production');

  if (!models?.length) {
    // Seed initial models if none exist
    const initialModels = [
      { model_name: 'investment_score_v1', model_type: 'scoring', status: 'production' },
      { model_name: 'price_prediction_v1', model_type: 'prediction', status: 'production' },
      { model_name: 'rental_yield_v1', model_type: 'prediction', status: 'production' },
      { model_name: 'deal_scoring_v1', model_type: 'scoring', status: 'production' },
      { model_name: 'days_to_sell_v1', model_type: 'prediction', status: 'production' },
      { model_name: 'demand_heat_v1', model_type: 'scoring', status: 'production' },
    ];
    await supabase.from('ai_model_registry').insert(initialModels);
    return { status: 'initialized', models_seeded: initialModels.length, data_points_processed: 0 };
  }

  const driftResults: any[] = [];

  for (const model of models) {
    // Get recent prediction accuracy (last 30 days vs prior 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000).toISOString();

    const { data: recentPreds } = await supabase
      .from('ai_prediction_log')
      .select('percentage_error')
      .eq('model_name', model.model_name)
      .not('percentage_error', 'is', null)
      .gte('resolved_at', thirtyDaysAgo)
      .limit(200);

    const { data: priorPreds } = await supabase
      .from('ai_prediction_log')
      .select('percentage_error')
      .eq('model_name', model.model_name)
      .not('percentage_error', 'is', null)
      .gte('resolved_at', sixtyDaysAgo)
      .lt('resolved_at', thirtyDaysAgo)
      .limit(200);

    const recentMAE = recentPreds?.length 
      ? recentPreds.reduce((a: number, b: any) => a + Math.abs(b.percentage_error), 0) / recentPreds.length 
      : null;
    const priorMAE = priorPreds?.length 
      ? priorPreds.reduce((a: number, b: any) => a + Math.abs(b.percentage_error), 0) / priorPreds.length 
      : null;

    let driftScore = 0;
    let driftDetected = false;

    if (recentMAE !== null && priorMAE !== null && priorMAE > 0) {
      driftScore = (recentMAE - priorMAE) / priorMAE; // Positive = degrading
      driftDetected = driftScore > 0.15; // 15% degradation threshold
    }

    // Update drift score
    await supabase.from('ai_model_registry').update({
      drift_score: Math.max(0, Math.min(1, driftScore)),
      updated_at: new Date().toISOString(),
    }).eq('id', model.id);

    // Log performance history
    await supabase.from('ai_model_performance_history').insert({
      model_id: model.id,
      period_start: thirtyDaysAgo,
      period_end: now.toISOString(),
      total_predictions: recentPreds?.length || 0,
      resolved_predictions: recentPreds?.length || 0,
      mae: recentMAE,
      mape: recentMAE, // Using MAPE as proxy
      drift_detected: driftDetected,
      drift_magnitude: driftScore,
    });

    driftResults.push({
      model: model.model_name,
      recent_mae: recentMAE ? Math.round(recentMAE * 100) / 100 : null,
      prior_mae: priorMAE ? Math.round(priorMAE * 100) / 100 : null,
      drift_score: Math.round(driftScore * 1000) / 1000,
      drift_detected: driftDetected,
      recent_samples: recentPreds?.length || 0,
      prior_samples: priorPreds?.length || 0,
    });

    // If drift detected, create shadow candidate
    if (driftDetected) {
      const newVersion = `${model.model_version.split('.').slice(0, 2).join('.')}.${parseInt(model.model_version.split('.')[2] || '0') + 1}`;
      await supabase.from('ai_model_registry').upsert({
        model_name: model.model_name.replace(/_v\d+$/, '') + '_v' + newVersion.replace(/\./g, ''),
        model_version: newVersion,
        model_type: model.model_type,
        status: 'shadow',
        hyperparameters: { ...model.hyperparameters, drift_retrain: true, parent_version: model.model_version },
        created_at: new Date().toISOString(),
      }, { onConflict: 'model_name,model_version' });

      console.log(`[DRIFT-DETECTION] Shadow model created for ${model.model_name} (drift: ${driftScore.toFixed(3)})`);
    }
  }

  return {
    status: 'completed',
    models_analyzed: models.length,
    drift_detected_count: driftResults.filter(r => r.drift_detected).length,
    drift_results: driftResults,
    data_points_processed: models.length,
    metrics: {
      models: models.length,
      drifting: driftResults.filter(r => r.drift_detected).length,
    },
  };
}


// ═══════════════════════════════════════════════════════
// 5️⃣ STRATEGY OPTIMIZER (Monte Carlo Simulation)
// Simulate investment scenarios, optimize capital deployment
// ═══════════════════════════════════════════════════════

async function runStrategyOptimization(supabase: any, body: any) {
  console.log('[STRATEGY-OPTIMIZER] Running Monte Carlo simulation...');

  const {
    initial_capital = 10_000_000_000, // 10B IDR default
    num_scenarios = 500,
    horizon_years = 5,
    target_cities = [],
    risk_tolerance = 'moderate', // conservative, moderate, aggressive
  } = body;

  // Get market data for simulations
  const { data: marketData } = await supabase
    .from('location_market_insights')
    .select('city, avg_price_per_sqm, yoy_growth, demand_score, total_listings')
    .not('avg_price_per_sqm', 'is', null)
    .limit(50);

  const { data: rentalData } = await supabase
    .from('rental_market_insights')
    .select('city, avg_rental_yield, occupancy_rate')
    .not('avg_rental_yield', 'is', null)
    .limit(50);

  // Build city return profiles
  const cityProfiles: Record<string, { avgGrowth: number, volatility: number, avgYield: number, occupancy: number }> = {};
  
  for (const m of marketData || []) {
    cityProfiles[m.city] = {
      avgGrowth: m.yoy_growth || 5,
      volatility: Math.abs(m.yoy_growth || 5) * 0.5 + 3, // Derived volatility
      avgYield: 0,
      occupancy: 0.85,
    };
  }

  for (const r of rentalData || []) {
    if (cityProfiles[r.city]) {
      cityProfiles[r.city].avgYield = r.avg_rental_yield || 5;
      cityProfiles[r.city].occupancy = r.occupancy_rate || 0.85;
    }
  }

  // Default profile if no data
  if (Object.keys(cityProfiles).length === 0) {
    cityProfiles['default'] = { avgGrowth: 6, volatility: 8, avgYield: 5, occupancy: 0.85 };
  }

  // Risk tolerance parameters
  const riskParams: Record<string, { allocationSpread: number, maxSingleAlloc: number, rebalanceThreshold: number }> = {
    conservative: { allocationSpread: 0.7, maxSingleAlloc: 0.25, rebalanceThreshold: 0.15 },
    moderate: { allocationSpread: 0.5, maxSingleAlloc: 0.35, rebalanceThreshold: 0.2 },
    aggressive: { allocationSpread: 0.3, maxSingleAlloc: 0.5, rebalanceThreshold: 0.3 },
  };
  const rp = riskParams[risk_tolerance] || riskParams.moderate;

  // Monte Carlo simulation
  const scenarioResults: number[] = [];
  const yearlyReturns: number[][] = Array.from({ length: horizon_years }, () => []);
  let bestScenario: any = null;
  let worstScenario: any = null;

  const cities = Object.keys(cityProfiles);

  for (let s = 0; s < num_scenarios; s++) {
    let portfolioValue = initial_capital;
    let totalRentalIncome = 0;

    // Random allocation across cities
    const allocation: Record<string, number> = {};
    let remaining = 1;
    for (let c = 0; c < cities.length && remaining > 0.05; c++) {
      const alloc = Math.min(remaining, rp.maxSingleAlloc, Math.random() * rp.maxSingleAlloc);
      allocation[cities[c]] = alloc;
      remaining -= alloc;
    }
    // Distribute remainder
    if (remaining > 0) {
      const firstCity = cities[0];
      allocation[firstCity] = (allocation[firstCity] || 0) + remaining;
    }

    // Simulate year by year
    for (let y = 0; y < horizon_years; y++) {
      let yearReturn = 0;

      for (const [city, alloc] of Object.entries(allocation)) {
        const profile = cityProfiles[city] || cityProfiles['default'] || { avgGrowth: 5, volatility: 8, avgYield: 4, occupancy: 0.8 };
        
        // Random return using normal distribution approximation (Box-Muller)
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        const appreciation = profile.avgGrowth + z * profile.volatility;
        const rentalReturn = profile.avgYield * profile.occupancy;
        const totalReturn = appreciation + rentalReturn;

        yearReturn += totalReturn * alloc;
        totalRentalIncome += portfolioValue * alloc * (rentalReturn / 100);
      }

      portfolioValue *= (1 + yearReturn / 100);
      yearlyReturns[y].push(yearReturn);
    }

    const totalReturn = ((portfolioValue - initial_capital) / initial_capital) * 100;
    scenarioResults.push(totalReturn);

    if (!bestScenario || totalReturn > bestScenario.return) {
      bestScenario = { return: totalReturn, allocation, finalValue: portfolioValue };
    }
    if (!worstScenario || totalReturn < worstScenario.return) {
      worstScenario = { return: totalReturn, allocation, finalValue: portfolioValue };
    }
  }

  // Compute statistics
  const sortedResults = [...scenarioResults].sort((a, b) => a - b);
  const mean = scenarioResults.reduce((a, b) => a + b, 0) / scenarioResults.length;
  const stdDev = Math.sqrt(scenarioResults.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / scenarioResults.length);
  const var95 = sortedResults[Math.floor(sortedResults.length * 0.05)]; // 5th percentile
  const median = sortedResults[Math.floor(sortedResults.length / 2)];
  const sharpe = stdDev > 0 ? (mean - 5) / stdDev : 0; // Using 5% as risk-free rate
  const maxDrawdown = Math.abs(Math.min(...sortedResults));

  // Create distribution buckets
  const distribution: Record<string, number> = {};
  for (const r of scenarioResults) {
    const bucket = `${Math.floor(r / 10) * 10}-${Math.floor(r / 10) * 10 + 10}%`;
    distribution[bucket] = (distribution[bucket] || 0) + 1;
  }

  // Save simulation result
  const simulationRecord = {
    simulation_type: 'portfolio_allocation',
    input_parameters: { initial_capital, num_scenarios, horizon_years, target_cities, risk_tolerance },
    num_scenarios,
    results_summary: {
      mean_return: Math.round(mean * 100) / 100,
      median_return: Math.round(median * 100) / 100,
      std_dev: Math.round(stdDev * 100) / 100,
      best_return: Math.round(bestScenario?.return * 100) / 100,
      worst_return: Math.round(worstScenario?.return * 100) / 100,
      positive_scenarios: scenarioResults.filter(r => r > 0).length,
      negative_scenarios: scenarioResults.filter(r => r <= 0).length,
    },
    optimal_strategy: {
      recommended_allocation: bestScenario?.allocation,
      risk_level: risk_tolerance,
      horizon: horizon_years,
    },
    expected_return: mean,
    risk_adjusted_return: sharpe,
    var_95: var95,
    max_drawdown: maxDrawdown,
    capital_efficiency: mean / stdDev,
    confidence_interval: {
      lower: sortedResults[Math.floor(sortedResults.length * 0.025)],
      upper: sortedResults[Math.floor(sortedResults.length * 0.975)],
      confidence: 0.95,
    },
    scenario_distribution: distribution,
    execution_time_ms: 0, // Will be set
  };

  const startTime = Date.now();
  const { data: saved } = await supabase
    .from('ai_strategy_simulations')
    .insert({ ...simulationRecord, execution_time_ms: Date.now() - startTime })
    .select('id')
    .single();

  return {
    status: 'completed',
    simulation_id: saved?.id,
    summary: simulationRecord.results_summary,
    optimal_strategy: simulationRecord.optimal_strategy,
    risk_metrics: {
      sharpe_ratio: Math.round(sharpe * 1000) / 1000,
      var_95: Math.round(var95 * 100) / 100,
      max_drawdown: Math.round(maxDrawdown * 100) / 100,
      capital_efficiency: Math.round((mean / stdDev) * 1000) / 1000,
    },
    confidence_interval: simulationRecord.confidence_interval,
    yearly_expected_returns: yearlyReturns.map((yr, i) => ({
      year: i + 1,
      mean: Math.round((yr.reduce((a, b) => a + b, 0) / yr.length) * 100) / 100,
      std: Math.round(Math.sqrt(yr.reduce((s, r) => s + Math.pow(r - yr.reduce((a, b) => a + b, 0) / yr.length, 2), 0) / yr.length) * 100) / 100,
    })),
    data_points_processed: num_scenarios,
    metrics: {
      scenarios: num_scenarios,
      mean_return: mean,
      sharpe: sharpe,
    },
  };
}


// ═══════════════════════════════════════════════════════
// FULL LEARNING CYCLE - Runs all pipelines sequentially
// ═══════════════════════════════════════════════════════

async function runFullLearningCycle(supabase: any) {
  console.log('[FULL-CYCLE] Starting complete autonomous learning cycle...');

  const results: Record<string, any> = {};
  const startTime = Date.now();

  // Run pipelines in order of dependency
  try {
    results.drift_detection = await runModelDriftDetection(supabase);
  } catch (e) {
    results.drift_detection = { status: 'error', error: (e as Error).message };
  }

  try {
    results.prediction_feedback = await runPredictionFeedbackLoop(supabase);
  } catch (e) {
    results.prediction_feedback = { status: 'error', error: (e as Error).message };
  }

  try {
    results.behavioral_learning = await runBehavioralLearning(supabase);
  } catch (e) {
    results.behavioral_learning = { status: 'error', error: (e as Error).message };
  }

  try {
    results.pattern_discovery = await runMarketPatternDiscovery(supabase);
  } catch (e) {
    results.pattern_discovery = { status: 'error', error: (e as Error).message };
  }

  const totalDataPoints = Object.values(results).reduce(
    (sum: number, r: any) => sum + (r.data_points_processed || 0), 0
  );

  return {
    status: 'completed',
    total_duration_ms: Date.now() - startTime,
    pipelines: results,
    data_points_processed: totalDataPoints,
    improvements: {
      models_analyzed: results.drift_detection?.models_analyzed || 0,
      predictions_resolved: results.prediction_feedback?.resolved_predictions || 0,
      users_clustered: results.behavioral_learning?.users_analyzed || 0,
      patterns_found: results.pattern_discovery?.patterns_discovered || 0,
    },
    metrics: {
      total_data_points: totalDataPoints,
      pipelines_succeeded: Object.values(results).filter((r: any) => r.status === 'completed').length,
      pipelines_failed: Object.values(results).filter((r: any) => r.status === 'error').length,
    },
  };
}


// ═══════════════════════════════════════════════════════
// SYSTEM STATUS - Overview of the intelligence brain
// ═══════════════════════════════════════════════════════

async function getSystemStatus(supabase: any) {
  const [
    { count: modelCount },
    { count: predictionCount },
    { count: patternCount },
    { count: clusterCount },
    { count: simulationCount },
    { data: recentCycles },
    { data: activeModels },
    { data: activePatterns },
  ] = await Promise.all([
    supabase.from('ai_model_registry').select('*', { count: 'exact', head: true }),
    supabase.from('ai_prediction_log').select('*', { count: 'exact', head: true }),
    supabase.from('ai_market_patterns').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('ai_investor_clusters').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('ai_strategy_simulations').select('*', { count: 'exact', head: true }),
    supabase.from('ai_learning_cycles').select('cycle_type, status, duration_ms, created_at').order('created_at', { ascending: false }).limit(10),
    supabase.from('ai_model_registry').select('model_name, status, accuracy_score, drift_score, total_predictions').eq('status', 'production'),
    supabase.from('ai_market_patterns').select('pattern_type, severity, confidence, signal_strength, location_city').eq('is_active', true).order('signal_strength', { ascending: false }).limit(10),
  ]);

  return {
    status: 'ok',
    brain_health: {
      total_models: modelCount || 0,
      production_models: activeModels?.length || 0,
      total_predictions_tracked: predictionCount || 0,
      active_market_patterns: patternCount || 0,
      investor_clusters: clusterCount || 0,
      strategy_simulations_run: simulationCount || 0,
    },
    models: activeModels || [],
    recent_patterns: activePatterns || [],
    recent_learning_cycles: recentCycles || [],
    data_points_processed: 0,
  };
}
