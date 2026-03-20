import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  projectRevenue,
  sensitivityAnalysis,
  detectHighMarginOpportunities,
  type ProjectionInputs,
  type ProjectionResult,
  type SensitivityPoint,
  type HighMarginOpportunity,
  type ScenarioKey,
} from '@/utils/revenueProjectionEngine';

export interface RevenueForecastInsights {
  inputs: ProjectionInputs;
  scenarios: Record<ScenarioKey, ProjectionResult>;
  sensitivity: SensitivityPoint[];
  opportunities: HighMarginOpportunity[];
}

/**
 * Pulls live platform metrics from Supabase, feeds them into
 * the projection engine, and returns multi-scenario forecasts.
 */
export function useRevenueForecastInsights(months = 24) {
  return useQuery({
    queryKey: ['revenue-forecast-insights', months],
    queryFn: async (): Promise<RevenueForecastInsights> => {
      const now = new Date();
      const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();

      // Parallel data fetch
      const [
        listingsRes,
        offersRes,
        commRes,
        subsRes,
        vendorRes,
        planRes,
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('property_offers').select('offer_price').gte('created_at', d30).in('status', ['accepted', 'completed']),
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d30),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('vendor_services').select('id', { count: 'exact', head: true }),
        supabase.from('subscription_plans').select('price_monthly').neq('slug', 'free'),
      ]);

      const activeListings = listingsRes.count ?? 80;
      const offers = offersRes.data ?? [];
      const dealCount = offers.length || 1;
      const avgTxnValue = offers.length > 0
        ? offers.reduce((s, o) => s + (o.offer_price || 0), 0) / offers.length
        : 1_800_000_000;
      const conversionRate = activeListings > 0 ? Math.min(0.12, dealCount / activeListings) : 0.035;

      const commissions = commRes.data ?? [];
      const totalComm = commissions.reduce((s, c) => s + (c.commission_amount || 0), 0);
      const impliedCommPct = avgTxnValue > 0 && dealCount > 0
        ? totalComm / (dealCount * avgTxnValue)
        : 0.011;

      const activeSubs = subsRes.count ?? 0;
      const plans = planRes.data ?? [];
      const avgSubPrice = plans.length > 0
        ? Math.round(plans.reduce((s, p) => s + (p.price_monthly || 0), 0) / plans.length)
        : 500_000;

      const activeVendors = vendorRes.count ?? 0;

      const inputs: ProjectionInputs = {
        activeListings,
        monthlyDealConversionRate: Math.max(0.01, conversionRate),
        avgTransactionValue: avgTxnValue,
        commissionPct: Math.max(0.005, Math.min(0.03, impliedCommPct || 0.011)),
        activeSubscribers: activeSubs,
        avgSubscriptionPrice: avgSubPrice,
        premiumSlotsSold: Math.round(activeListings * 0.08),
        premiumSlotPrice: 350_000,
        activeVendors,
        avgVendorFee: 490_000,
        monthlyFixedCosts: 45_000_000,
        monthlyVariableCostPct: 0.18,
      };

      const scenarios: Record<ScenarioKey, ProjectionResult> = {
        conservative: projectRevenue(inputs, 'conservative', months),
        base: projectRevenue(inputs, 'base', months),
        aggressive: projectRevenue(inputs, 'aggressive', months),
      };

      const sensitivity = sensitivityAnalysis(inputs, 'base');
      const opportunities = detectHighMarginOpportunities(inputs, scenarios.base);

      return { inputs, scenarios, sensitivity, opportunities };
    },
    staleTime: 5 * 60_000,
  });
}
