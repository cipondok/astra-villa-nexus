import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ── Signal Classification Engine ──

interface PlatformMetrics {
  mrr: number;
  prev_mrr: number;
  total_commissions: number;
  prev_commissions: number;
  marketing_spend: number;
  marketing_conversions: number;
  vendor_incentive_spend: number;
  vendor_retention_rate: number;
  partner_retention_rate: number;
  active_subscribers: number;
  churned_subscribers: number;
  avg_deal_value: number;
  total_transactions: number;
  premium_listing_revenue: number;
  cost_per_acquisition: number;
}

function classifySignalDomain(metric: string): string {
  const domainMap: Record<string, string> = {
    premium_underpriced: 'dynamic_pricing',
    subscription_upgrade_opportunity: 'dynamic_pricing',
    commission_elasticity: 'dynamic_pricing',
    marketing_waste: 'cost_efficiency',
    vendor_incentive_excess: 'cost_efficiency',
    operational_bloat: 'cost_efficiency',
    high_margin_segment: 'revenue_opportunity',
    investor_upsell: 'revenue_opportunity',
    underserved_market: 'revenue_opportunity',
    retention_risk: 'risk_control',
    revenue_volatility: 'risk_control',
    churn_spike: 'risk_control',
  };
  return domainMap[metric] || 'revenue_opportunity';
}

function computeConfidence(strength: number, dataPoints: number): number {
  const baseConfidence = Math.min(95, strength * 0.8);
  const dataBonus = Math.min(15, dataPoints * 0.5);
  return Math.round(Math.min(100, baseConfidence + dataBonus));
}

function assessRisk(impact: number, retention: number): string {
  if (retention < 80 || impact < -10) return 'critical';
  if (retention < 90 || impact < -5) return 'high';
  if (retention < 95 || impact < 0) return 'medium';
  return 'low';
}

// ── Dynamic Pricing Signals ──

function analyzeDynamicPricing(metrics: PlatformMetrics) {
  const signals: any[] = [];

  // Premium listing underpricing detection
  const premiumPerTransaction = metrics.premium_listing_revenue / Math.max(metrics.total_transactions, 1);
  if (premiumPerTransaction < metrics.avg_deal_value * 0.005) {
    const potential = metrics.avg_deal_value * 0.008;
    signals.push({
      signal_domain: 'dynamic_pricing',
      signal_type: 'premium_underpriced',
      signal_strength: 72,
      confidence_score: computeConfidence(72, metrics.total_transactions),
      current_value: premiumPerTransaction,
      recommended_value: potential,
      projected_impact_pct: Math.round(((potential - premiumPerTransaction) / Math.max(premiumPerTransaction, 1)) * 100),
      projected_revenue_impact: (potential - premiumPerTransaction) * metrics.total_transactions,
      risk_level: 'low',
      auto_executable: false,
      requires_approval: true,
      metadata: { analysis: 'premium_slot_pricing_below_market_rate' },
    });
  }

  // Subscription upgrade opportunity
  const mrrGrowth = metrics.prev_mrr > 0 ? ((metrics.mrr - metrics.prev_mrr) / metrics.prev_mrr) * 100 : 0;
  if (mrrGrowth > 5 && metrics.churned_subscribers < metrics.active_subscribers * 0.03) {
    signals.push({
      signal_domain: 'dynamic_pricing',
      signal_type: 'subscription_upgrade_opportunity',
      signal_strength: 65,
      confidence_score: computeConfidence(65, metrics.active_subscribers),
      current_value: metrics.mrr,
      recommended_value: metrics.mrr * 1.08,
      projected_impact_pct: 8,
      projected_revenue_impact: metrics.mrr * 0.08,
      risk_level: assessRisk(8, metrics.partner_retention_rate),
      auto_executable: false,
      requires_approval: true,
      metadata: { mrr_growth_pct: mrrGrowth, churn_rate: (metrics.churned_subscribers / Math.max(metrics.active_subscribers, 1)) * 100 },
    });
  }

  return signals;
}

// ── Cost Efficiency Signals ──

function analyzeCostEfficiency(metrics: PlatformMetrics) {
  const signals: any[] = [];

  // Marketing waste detection
  if (metrics.marketing_conversions > 0) {
    const effectiveCPA = metrics.marketing_spend / metrics.marketing_conversions;
    if (effectiveCPA > metrics.cost_per_acquisition * 1.5) {
      signals.push({
        signal_domain: 'cost_efficiency',
        signal_type: 'marketing_waste',
        signal_strength: 80,
        confidence_score: computeConfidence(80, metrics.marketing_conversions),
        current_value: effectiveCPA,
        recommended_value: metrics.cost_per_acquisition * 1.1,
        projected_impact_pct: -Math.round(((effectiveCPA - metrics.cost_per_acquisition * 1.1) / effectiveCPA) * 100),
        projected_revenue_impact: -(effectiveCPA - metrics.cost_per_acquisition * 1.1) * metrics.marketing_conversions,
        risk_level: 'low',
        auto_executable: true,
        requires_approval: false,
        metadata: { effective_cpa: effectiveCPA, target_cpa: metrics.cost_per_acquisition },
      });
    }
  }

  // Vendor incentive excess
  if (metrics.vendor_incentive_spend > 0 && metrics.vendor_retention_rate > 95) {
    const savingsPotential = metrics.vendor_incentive_spend * 0.15;
    signals.push({
      signal_domain: 'cost_efficiency',
      signal_type: 'vendor_incentive_excess',
      signal_strength: 55,
      confidence_score: computeConfidence(55, 30),
      current_value: metrics.vendor_incentive_spend,
      recommended_value: metrics.vendor_incentive_spend * 0.85,
      projected_impact_pct: -15,
      projected_revenue_impact: savingsPotential,
      risk_level: assessRisk(-2, metrics.vendor_retention_rate),
      auto_executable: false,
      requires_approval: true,
      metadata: { vendor_retention: metrics.vendor_retention_rate },
    });
  }

  return signals;
}

// ── Revenue Opportunity Signals ──

function analyzeRevenueOpportunities(metrics: PlatformMetrics) {
  const signals: any[] = [];

  // High-margin segment detection
  const commissionRate = metrics.total_transactions > 0
    ? metrics.total_commissions / (metrics.avg_deal_value * metrics.total_transactions) * 100
    : 0;

  if (commissionRate > 0 && commissionRate < 2.0) {
    signals.push({
      signal_domain: 'revenue_opportunity',
      signal_type: 'commission_elasticity',
      signal_strength: 60,
      confidence_score: computeConfidence(60, metrics.total_transactions),
      current_value: commissionRate,
      recommended_value: Math.min(commissionRate * 1.15, 2.5),
      projected_impact_pct: 15,
      projected_revenue_impact: metrics.total_commissions * 0.15,
      risk_level: assessRisk(15, metrics.partner_retention_rate),
      auto_executable: false,
      requires_approval: true,
      metadata: { current_rate: commissionRate },
    });
  }

  // Investor upsell pathway
  if (metrics.active_subscribers > 50) {
    const upsellPotential = metrics.active_subscribers * 0.12 * (metrics.mrr / Math.max(metrics.active_subscribers, 1)) * 1.5;
    signals.push({
      signal_domain: 'revenue_opportunity',
      signal_type: 'investor_upsell',
      signal_strength: 68,
      confidence_score: computeConfidence(68, metrics.active_subscribers),
      current_value: metrics.mrr,
      recommended_value: metrics.mrr + upsellPotential,
      projected_impact_pct: Math.round((upsellPotential / Math.max(metrics.mrr, 1)) * 100),
      projected_revenue_impact: upsellPotential,
      risk_level: 'low',
      auto_executable: false,
      requires_approval: true,
      metadata: { target_segment: 'active_investors', upsell_rate: 12 },
    });
  }

  return signals;
}

// ── Risk Control Signals ──

function analyzeRiskControl(metrics: PlatformMetrics) {
  const signals: any[] = [];

  // Retention risk
  if (metrics.partner_retention_rate < 90) {
    signals.push({
      signal_domain: 'risk_control',
      signal_type: 'retention_risk',
      signal_strength: 90,
      confidence_score: computeConfidence(90, 100),
      current_value: metrics.partner_retention_rate,
      recommended_value: 95,
      projected_impact_pct: -(100 - metrics.partner_retention_rate),
      projected_revenue_impact: -(metrics.mrr * (100 - metrics.partner_retention_rate) / 100),
      risk_level: metrics.partner_retention_rate < 80 ? 'critical' : 'high',
      auto_executable: false,
      requires_approval: true,
      metadata: { alert: 'partner_retention_below_threshold' },
    });
  }

  // Churn spike
  const churnRate = metrics.active_subscribers > 0
    ? (metrics.churned_subscribers / metrics.active_subscribers) * 100
    : 0;
  if (churnRate > 5) {
    signals.push({
      signal_domain: 'risk_control',
      signal_type: 'churn_spike',
      signal_strength: 85,
      confidence_score: computeConfidence(85, metrics.active_subscribers),
      current_value: churnRate,
      recommended_value: 3,
      projected_impact_pct: -(churnRate - 3),
      projected_revenue_impact: -(metrics.mrr * (churnRate - 3) / 100),
      risk_level: churnRate > 10 ? 'critical' : 'high',
      auto_executable: false,
      requires_approval: true,
      metadata: { churn_rate: churnRate, threshold: 5 },
    });
  }

  return signals;
}

// ── Main Handler ──

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { mode } = await req.json();

    if (mode === 'scan') {
      // Gather platform metrics from existing data
      const [revenueRes, subsRes, analyticsRes] = await Promise.all([
        supabase.rpc('get_admin_revenue_stats'),
        supabase.from('subscription_plans').select('*'),
        supabase.from('acquisition_analytics')
          .select('spend, conversions, cpa')
          .gte('date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]),
      ]);

      const rev = revenueRes.data || {};
      const totalSpend = (analyticsRes.data || []).reduce((s: number, r: any) => s + (r.spend || 0), 0);
      const totalConversions = (analyticsRes.data || []).reduce((s: number, r: any) => s + (r.conversions || 0), 0);
      const avgCPA = (analyticsRes.data || []).reduce((s: number, r: any) => s + (r.cpa || 0), 0) / Math.max((analyticsRes.data || []).length, 1);

      const metrics: PlatformMetrics = {
        mrr: rev.monthly_revenue || 0,
        prev_mrr: rev.prev_monthly_revenue || 0,
        total_commissions: rev.total_commissions || 0,
        prev_commissions: rev.total_commissions || 0,
        marketing_spend: totalSpend,
        marketing_conversions: totalConversions,
        vendor_incentive_spend: 0,
        vendor_retention_rate: 92,
        partner_retention_rate: rev.active_affiliates > 0 ? 88 : 95,
        active_subscribers: rev.active_affiliates || 0,
        churned_subscribers: 0,
        avg_deal_value: rev.total_transactions > 0 ? rev.total_revenue / rev.total_transactions : 1800000000,
        total_transactions: rev.total_transactions || 0,
        premium_listing_revenue: rev.monthly_revenue * 0.3 || 0,
        cost_per_acquisition: avgCPA || 180000,
      };

      // Generate signals from all domains
      const allSignals = [
        ...analyzeDynamicPricing(metrics),
        ...analyzeCostEfficiency(metrics),
        ...analyzeRevenueOpportunities(metrics),
        ...analyzeRiskControl(metrics),
      ];

      // Persist signals
      if (allSignals.length > 0) {
        await supabase.from('profit_optimization_signals').insert(allSignals);

        // Audit log
        for (const sig of allSignals) {
          await supabase.from('profit_audit_log').insert({
            action_type: 'signal_generated',
            decision: `${sig.signal_type}: strength ${sig.signal_strength}, confidence ${sig.confidence_score}%`,
            confidence_at_decision: sig.confidence_score,
            risk_assessment: sig.risk_level,
            decided_by: 'profit_optimizer_ai',
          });
        }
      }

      return new Response(JSON.stringify({
        signals_generated: allSignals.length,
        by_domain: {
          dynamic_pricing: allSignals.filter(s => s.signal_domain === 'dynamic_pricing').length,
          cost_efficiency: allSignals.filter(s => s.signal_domain === 'cost_efficiency').length,
          revenue_opportunity: allSignals.filter(s => s.signal_domain === 'revenue_opportunity').length,
          risk_control: allSignals.filter(s => s.signal_domain === 'risk_control').length,
        },
        signals: allSignals,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'dashboard') {
      const { data, error } = await supabase.rpc('get_profit_optimization_dashboard');
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'approve_signal') {
      const { signal_id, user_id } = await req.json();
      const { error } = await supabase.from('profit_optimization_signals')
        .update({ execution_status: 'approved', approved_by: user_id, approved_at: new Date().toISOString() })
        .eq('id', signal_id);
      if (error) throw error;

      await supabase.from('profit_audit_log').insert({
        action_type: 'signal_approved',
        signal_id,
        decision: 'Admin approved signal for execution',
        decided_by: 'admin',
        admin_override: true,
        override_by: user_id,
      });

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (mode === 'rollback_signal') {
      const { signal_id, reason, user_id } = await req.json();
      const { error } = await supabase.from('profit_optimization_signals')
        .update({ execution_status: 'rolled_back', rollback_reason: reason, updated_at: new Date().toISOString() })
        .eq('id', signal_id);
      if (error) throw error;

      await supabase.from('profit_audit_log').insert({
        action_type: 'signal_rolled_back',
        signal_id,
        decision: `Rolled back: ${reason}`,
        decided_by: 'admin',
        admin_override: true,
        override_by: user_id,
      });

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Invalid mode. Use: scan, dashboard, approve_signal, rollback_signal' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('profit-optimizer-ai error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
