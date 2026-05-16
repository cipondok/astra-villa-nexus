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
      case 'invest_infrastructure': {
        const planet = (params.planet as string) || 'Mars';
        const habitats = [
          { name: 'Ares Prime', type: 'urban_zone', class: 'settlement', pop: 50000 },
          { name: 'Hellas Basin Hub', type: 'resource_extraction', class: 'mining', pop: 8000 },
          { name: 'Olympus Station', type: 'space_habitat', class: 'orbital', pop: 2000 },
          { name: 'Valles Gateway', type: 'transit_hub', class: 'logistics', pop: 15000 },
          { name: 'Elysium Research', type: 'science_campus', class: 'research', pop: 5000 },
        ];
        const rows = habitats.map((h) => {
          const productivity = 20 + Math.random() * 75;
          const capital = Math.round(1e9 + Math.random() * 50e9);
          return {
            habitat_name: h.name,
            planet,
            habitat_type: h.type,
            capital_allocated_usd: capital,
            productivity_signal: +productivity.toFixed(2),
            resource_extraction_value: h.type === 'resource_extraction' ? Math.round(5e8 + Math.random() * 20e9) : 0,
            construction_phase: productivity > 60 ? 'active' : productivity > 30 ? 'foundation' : 'planning',
            estimated_roi_decade: +(2 + Math.random() * 18).toFixed(2),
            risk_tier: productivity > 60 ? 'established' : productivity > 35 ? 'developing' : 'frontier',
            infrastructure_class: h.class,
            population_capacity: h.pop,
            operational_readiness: +((productivity * 0.8 + Math.random() * 20).toFixed(2)),
          };
        });
        const { error } = await supabase.from('mpeem_infrastructure_investment').insert(rows);
        if (error) throw error;
        result = { planet, habitats_funded: rows.length, total_capital: rows.reduce((a, r) => a + r.capital_allocated_usd, 0) };
        break;
      }

      case 'register_property_rights': {
        const planet = (params.planet as string) || 'Mars';
        const zones = ['Alpha Sector', 'Beta District', 'Gamma Commons', 'Delta Industrial', 'Epsilon Residential'];
        const rows = zones.map((z, i) => {
          const claimValue = Math.round(1e7 + Math.random() * 5e9);
          return {
            planet,
            zone_name: z,
            jurisdiction_model: i < 2 ? 'multi_sovereign' : i < 4 ? 'corporate_charter' : 'dao_governed',
            tokenized_claim_id: `${planet.toUpperCase()}-${z.replace(/\s/g, '-').toUpperCase()}-${Date.now()}`,
            ownership_structure: i % 2 === 0 ? 'fractional_tokenized' : 'pooled_institutional',
            shared_pool_contributors: 50 + Math.floor(Math.random() * 500),
            total_claim_value_usd: claimValue,
            governance_framework: {
              voting_model: i < 2 ? 'stake_weighted' : 'one_entity_one_vote',
              amendment_threshold: 0.67,
              dispute_forum: 'interplanetary_arbitration_court',
            },
            dispute_resolution_protocol: 'arbitration_dao',
            legal_recognition_status: i === 0 ? 'recognized' : 'pending_framework',
            infrastructure_share_pct: +(10 + Math.random() * 30).toFixed(2),
          };
        });
        const { error } = await supabase.from('mpeem_property_rights').insert(rows);
        if (error) throw error;
        result = { planet, zones_registered: rows.length, total_value: rows.reduce((a, r) => a + r.total_claim_value_usd, 0) };
        break;
      }

      case 'route_capital_flows': {
        const routes = [
          { from: 'Earth', to: 'Mars', latency: 1260 },
          { from: 'Earth', to: 'Moon', latency: 2.6 },
          { from: 'Mars', to: 'Earth', latency: 1260 },
          { from: 'Earth', to: 'Orbital', latency: 0.5 },
          { from: 'Moon', to: 'Mars', latency: 1200 },
        ];
        const rows = routes.map((r) => {
          const volume = Math.round(1e8 + Math.random() * 10e9);
          const riskReturn = 3 + Math.random() * 25;
          return {
            origin_planet: r.from,
            destination_planet: r.to,
            flow_type: volume > 5e9 ? 'institutional' : 'diversification',
            flow_volume_usd: volume,
            risk_adjusted_return: +riskReturn.toFixed(2),
            latency_seconds: r.latency,
            transaction_protocol: r.latency > 100 ? 'quantum_ledger' : 'atomic_swap',
            diversification_index: +(30 + Math.random() * 65).toFixed(2),
            settlement_mechanism: r.latency > 100 ? 'delayed_confirmation' : 'instant_settlement',
            flow_velocity: +(volume / (r.latency + 1) / 1e6).toFixed(4),
            cross_planet_hedge_ratio: +(0.1 + Math.random() * 0.5).toFixed(3),
          };
        });
        const { error } = await supabase.from('mpeem_capital_flows').insert(rows);
        if (error) throw error;
        result = { routes: rows.length, total_volume: rows.reduce((a, r) => a + r.flow_volume_usd, 0) };
        break;
      }

      case 'forecast_frontier_growth': {
        const colonies = [
          { name: 'Ares Prime', planet: 'Mars' },
          { name: 'Artemis Base', planet: 'Moon' },
          { name: 'Orbital One', planet: 'LEO' },
          { name: 'Ceres Station', planet: 'Ceres' },
        ];
        const rows = colonies.map((c) => {
          const migration = Math.random() * 90;
          const clustering = 20 + Math.random() * 75;
          const sufficiency = Math.random() * 80;
          return {
            colony_name: c.name,
            planet: c.planet,
            projected_population_5y: Math.round(1000 + Math.random() * 100000),
            projected_population_25y: Math.round(50000 + Math.random() * 2000000),
            migration_velocity: +migration.toFixed(2),
            economic_clustering_score: +clustering.toFixed(2),
            infrastructure_lifecycle_years: 25 + Math.floor(Math.random() * 75),
            urban_density_target: +(500 + Math.random() * 5000).toFixed(0),
            self_sufficiency_index: +sufficiency.toFixed(2),
            growth_phase: sufficiency > 60 ? 'expanding' : sufficiency > 30 ? 'establishing' : 'frontier',
            anchor_industries: c.planet === 'Mars'
              ? ['mining', 'agriculture', 'manufacturing']
              : c.planet === 'Moon'
                ? ['helium3_extraction', 'tourism', 'research']
                : ['logistics', 'manufacturing', 'research'],
          };
        });
        const { error } = await supabase.from('mpeem_frontier_growth').insert(rows);
        if (error) throw error;
        result = { colonies_forecasted: rows.length, expanding: rows.filter((r) => r.growth_phase === 'expanding').length };
        break;
      }

      case 'spin_expansion_flywheel': {
        const cycleId = `MPEEM-${Date.now()}`;
        const newAssets = 2 + Math.floor(Math.random() * 8);
        const wealthExpansion = Math.round(1e10 + Math.random() * 500e10);
        const techAccel = 30 + Math.random() * 65;
        const momentum = newAssets * 8 + techAccel * 0.3 + Math.random() * 15;
        const breakthroughs = Math.floor(Math.random() * 6);
        const stage = momentum >= 85 ? 'type_1.0' : momentum >= 65 ? 'type_0.9' : momentum >= 45 ? 'type_0.8' : 'type_0.7';
        const row = {
          cycle_id: cycleId,
          new_asset_classes_created: newAssets,
          global_wealth_expansion_usd: wealthExpansion,
          tech_acceleration_index: +techAccel.toFixed(2),
          frontier_market_cap_usd: Math.round(wealthExpansion * (0.05 + Math.random() * 0.15)),
          investment_multiplier: +(1 + newAssets * 0.3 + techAccel * 0.01).toFixed(2),
          civilization_stage: stage,
          flywheel_momentum: +momentum.toFixed(2),
          breakthroughs_unlocked: breakthroughs,
          decade_span: '2030-2040',
        };
        const { error } = await supabase.from('mpeem_expansion_flywheel').insert(row);
        if (error) throw error;
        result = { cycle_id: cycleId, momentum: row.flywheel_momentum, stage, breakthroughs };
        break;
      }

      case 'dashboard': {
        const [infra, rights, flows, growth, flywheel] = await Promise.all([
          supabase.from('mpeem_infrastructure_investment').select('*').order('computed_at', { ascending: false }).limit(20),
          supabase.from('mpeem_property_rights').select('*').order('computed_at', { ascending: false }).limit(15),
          supabase.from('mpeem_capital_flows').select('*').order('computed_at', { ascending: false }).limit(15),
          supabase.from('mpeem_frontier_growth').select('*').order('computed_at', { ascending: false }).limit(15),
          supabase.from('mpeem_expansion_flywheel').select('*').order('computed_at', { ascending: false }).limit(10),
        ]);

        const i = infra.data || [];
        const f = flows.data || [];

        result = {
          summary: {
            habitats_funded: i.length,
            total_infrastructure_capital: i.reduce((a: number, r: any) => a + (r.capital_allocated_usd || 0), 0),
            planets_with_rights: new Set((rights.data || []).map((r: any) => r.planet)).size,
            total_flow_volume: f.reduce((a: number, r: any) => a + (r.flow_volume_usd || 0), 0),
            colonies_tracked: (growth.data || []).length,
            flywheel_cycles: (flywheel.data || []).length,
          },
          infrastructure: i,
          property_rights: rights.data || [],
          capital_flows: f,
          frontier_growth: growth.data || [],
          expansion_flywheel: flywheel.data || [],
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
