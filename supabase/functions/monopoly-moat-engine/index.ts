import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { mode, params = {} } = await req.json();
    let result: unknown;

    switch (mode) {
      case 'measure_data_gravity': {
        const cities = (params.cities as string[]) || ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta'];
        const rows = cities.map((c) => {
          const signals = Math.round(10000 + Math.random() * 5000000);
          const txPatterns = Math.round(1000 + Math.random() * 500000);
          const liquidity = Math.round(500 + Math.random() * 200000);
          const predSup = 30 + Math.random() * 65;
          const replCost = Math.round(signals * 0.5 + txPatterns * 2 + liquidity * 10);
          const compounding = 2 + Math.random() * 12;
          const depth = predSup * 0.4 + Math.log10(replCost) * 5 + compounding * 2;
          const tier = depth >= 85 ? 'fortress' : depth >= 65 ? 'deep' : depth >= 40 ? 'building' : 'accumulating';
          return {
            city: c,
            behavioral_signals_ingested: signals,
            transaction_velocity_patterns: txPatterns,
            localized_liquidity_records: liquidity,
            prediction_superiority_index: +predSup.toFixed(2),
            data_half_life_months: +(24 + Math.random() * 36).toFixed(0),
            replication_cost_estimate_usd: replCost,
            gravity_tier: tier,
            compounding_rate_monthly: +compounding.toFixed(2),
            moat_depth_score: +Math.min(100, depth).toFixed(2),
          };
        });
        const { error } = await supabase.from('gmma_data_gravity').insert(rows);
        if (error) throw error;
        result = { cities_measured: rows.length, fortress_moats: rows.filter((r) => r.gravity_tier === 'fortress').length, total_replication_cost: rows.reduce((a, r) => a + r.replication_cost_estimate_usd, 0) };
        break;
      }

      case 'analyze_network_lockin': {
        const cities = (params.cities as string[]) || ['Jakarta', 'Bali', 'Surabaya'];
        const rows = cities.map((c) => {
          const investors = 500 + Math.floor(Math.random() * 20000);
          const deals = 100 + Math.floor(Math.random() * 5000);
          const vendors = 50 + Math.floor(Math.random() * 1000);
          const i2d = investors / Math.max(1, deals);
          const d2v = deals / Math.max(1, vendors);
          const loopStrength = Math.min(100, i2d * 10 + d2v * 5 + Math.log10(investors) * 15);
          const density = Math.min(100, (investors + deals + vendors) * 0.005);
          const irreversibility = loopStrength * 0.6 + density * 0.4;
          const churn = Math.max(5, 100 - irreversibility * 0.8);
          const tier = irreversibility >= 80 ? 'unbreakable' : irreversibility >= 60 ? 'strong' : irreversibility >= 35 ? 'growing' : 'forming';
          return {
            city: c,
            investor_count: investors,
            deal_count: deals,
            vendor_count: vendors,
            investor_to_deal_ratio: +i2d.toFixed(3),
            deal_to_vendor_ratio: +d2v.toFixed(3),
            feedback_loop_strength: +loopStrength.toFixed(2),
            network_density: +density.toFixed(2),
            irreversibility_index: +irreversibility.toFixed(2),
            churn_resistance: +churn.toFixed(2),
            lock_in_tier: tier,
          };
        });
        const { error } = await supabase.from('gmma_network_lockin').insert(rows);
        if (error) throw error;
        result = { networks_analyzed: rows.length, unbreakable: rows.filter((r) => r.lock_in_tier === 'unbreakable').length };
        break;
      }

      case 'assess_capital_dependency': {
        const channels = ['institutional', 'developer_funding', 'secondary_market', 'retail_investor', 'sovereign_fund'];
        const rows = channels.map((ch) => {
          const volume = Math.round(1e7 + Math.random() * 5e9);
          const platformShare = 10 + Math.random() * 60;
          const altFriction = 20 + Math.random() * 75;
          const switchCost = Math.round(volume * (altFriction / 100) * 0.05);
          const structural = platformShare > 40 && altFriction > 50;
          const depth = structural ? 'structural' : platformShare > 25 ? 'preferred' : platformShare > 10 ? 'integrated' : 'optional';
          return {
            channel_type: ch,
            flow_volume_usd: volume,
            platform_share_pct: +platformShare.toFixed(2),
            alternative_friction_score: +altFriction.toFixed(2),
            switching_cost_usd: switchCost,
            dependency_depth: depth,
            institutional_contracts: ch === 'institutional' ? Math.floor(5 + Math.random() * 50) : 0,
            developer_pipelines: ch === 'developer_funding' ? Math.floor(10 + Math.random() * 100) : 0,
            secondary_market_volume_usd: ch === 'secondary_market' ? Math.round(1e6 + Math.random() * 1e9) : 0,
            structural_lock_in: structural,
          };
        });
        const { error } = await supabase.from('gmma_capital_dependency').insert(rows);
        if (error) throw error;
        result = { channels_assessed: rows.length, structural_dependencies: rows.filter((r) => r.structural_lock_in).length, total_switching_cost: rows.reduce((a, r) => a + r.switching_cost_usd, 0) };
        break;
      }

      case 'measure_workflow_integration': {
        const participants = ['developer', 'agent', 'vendor', 'investor', 'institutional'];
        const rows = participants.map((p) => {
          const daw = Math.floor(10 + Math.random() * 500);
          const apiCalls = Math.round(1000 + Math.random() * 500000);
          const dataStored = +(0.1 + Math.random() * 50).toFixed(2);
          const switchHours = 20 + Math.random() * 500;
          const embedded = Math.floor(3 + Math.random() * 30);
          const retentionProb = Math.min(99, 50 + switchHours * 0.08 + embedded * 1.5);
          const complexity = switchHours > 200 ? 'extreme' : switchHours > 100 ? 'high' : switchHours > 40 ? 'moderate' : 'low';
          const tier = retentionProb >= 90 ? 'embedded' : retentionProb >= 75 ? 'integrated' : retentionProb >= 55 ? 'adopted' : 'peripheral';
          return {
            participant_type: p,
            integration_depth: tier,
            daily_active_workflows: daw,
            api_calls_monthly: apiCalls,
            data_stored_gb: dataStored,
            switching_cost_hours: +switchHours.toFixed(1),
            replacement_complexity: complexity,
            embedded_processes: embedded,
            retention_probability: +retentionProb.toFixed(2),
            integration_tier: tier,
          };
        });
        const { error } = await supabase.from('gmma_workflow_integration').insert(rows);
        if (error) throw error;
        result = { participants_measured: rows.length, embedded: rows.filter((r) => r.integration_tier === 'embedded').length, avg_retention: +(rows.reduce((a, r) => a + r.retention_probability, 0) / rows.length).toFixed(1) };
        break;
      }

      case 'assess_brand_authority': {
        const categories = ['proptech_intelligence', 'investment_advisory', 'property_marketplace', 'real_estate_data'];
        const rows = categories.map((cat) => {
          const recognition = 20 + Math.random() * 75;
          const catDef = 15 + Math.random() * 80;
          const standard = 10 + Math.random() * 70;
          const defaultProb = (recognition * 0.3 + catDef * 0.4 + standard * 0.3);
          const media = 20 + Math.random() * 75;
          const tier = defaultProb >= 75 ? 'category_king' : defaultProb >= 55 ? 'authority' : defaultProb >= 35 ? 'recognized' : 'emerging';
          return {
            category: cat,
            brand_recognition_score: +recognition.toFixed(2),
            category_definition_power: +catDef.toFixed(2),
            standard_setting_influence: +standard.toFixed(2),
            default_platform_probability: +defaultProb.toFixed(2),
            media_authority_index: +media.toFixed(2),
            thought_leadership_pieces: Math.floor(20 + Math.random() * 200),
            industry_citations: Math.floor(5 + Math.random() * 100),
            awards_recognitions: Math.floor(Math.random() * 15),
            authority_tier: tier,
          };
        });
        const { error } = await supabase.from('gmma_brand_authority').insert(rows);
        if (error) throw error;
        result = { categories_assessed: rows.length, category_kings: rows.filter((r) => r.authority_tier === 'category_king').length };
        break;
      }

      case 'dashboard': {
        const [gravity, lockin, capital, workflow, brand] = await Promise.all([
          supabase.from('gmma_data_gravity').select('*').order('moat_depth_score', { ascending: false }).limit(20),
          supabase.from('gmma_network_lockin').select('*').order('irreversibility_index', { ascending: false }).limit(15),
          supabase.from('gmma_capital_dependency').select('*').order('computed_at', { ascending: false }).limit(10),
          supabase.from('gmma_workflow_integration').select('*').order('retention_probability', { ascending: false }).limit(15),
          supabase.from('gmma_brand_authority').select('*').order('default_platform_probability', { ascending: false }).limit(10),
        ]);

        const g = gravity.data || [];
        const n = lockin.data || [];
        const w = workflow.data || [];

        result = {
          summary: {
            fortress_cities: g.filter((r: any) => r.gravity_tier === 'fortress').length,
            avg_moat_depth: g.length ? +(g.reduce((a: number, r: any) => a + (r.moat_depth_score || 0), 0) / g.length).toFixed(1) : 0,
            unbreakable_networks: n.filter((r: any) => r.lock_in_tier === 'unbreakable').length,
            structural_dependencies: (capital.data || []).filter((r: any) => r.structural_lock_in).length,
            embedded_participants: w.filter((r: any) => r.integration_tier === 'embedded').length,
            category_kings: (brand.data || []).filter((r: any) => r.authority_tier === 'category_king').length,
          },
          data_gravity: g,
          network_lockin: n,
          capital_dependency: capital.data || [],
          workflow_integration: w,
          brand_authority: brand.data || [],
        };
        break;
      }

      default:
        throw new Error(`Unknown mode: ${mode}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
