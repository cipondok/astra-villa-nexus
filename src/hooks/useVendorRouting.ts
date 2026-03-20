import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  computeVendorScore,
  detectSupplyGaps,
  type VendorProfile,
  type VendorLeadStats,
  type VendorScoreResult,
  type CategorySupplyGap,
  type SLAThresholds,
} from '@/utils/vendorScoringEngine';

/**
 * Fetch all vendors with computed intelligence scores.
 */
export function useVendorRouting(slaThresholds?: SLAThresholds) {
  return useQuery({
    queryKey: ['vendor-routing', JSON.stringify(slaThresholds)],
    queryFn: async () => {
      // Fetch vendor profiles
      const { data: vendors, error: vErr } = await (supabase as any)
        .from('vendor_business_profiles')
        .select('id, vendor_id, business_name, business_type, business_city, rating, deal_conversion_rate, avg_response_minutes, total_deals_closed, total_leads_received, total_reviews, is_active, is_verified, tarif_harian_min, tarif_harian_max')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(200);

      if (vErr) throw vErr;
      if (!vendors?.length) return { scoredVendors: [], supplyGaps: [] };

      // Fetch lead pipeline stats per vendor
      const vendorIds = vendors.map((v: any) => v.id);
      const { data: leads } = await (supabase as any)
        .from('vendor_leads_pipeline')
        .select('vendor_id, status, first_response_at, created_at')
        .in('vendor_id', vendorIds);

      // Aggregate lead stats per vendor
      const leadMap = new Map<string, VendorLeadStats>();
      for (const v of vendors) {
        const vLeads = (leads ?? []).filter((l: any) => l.vendor_id === v.id);
        leadMap.set(v.id, {
          totalLeads: vLeads.length,
          convertedLeads: vLeads.filter((l: any) => l.status === 'converted').length,
          avgResponseMinutes: v.avg_response_minutes ?? 0,
          pendingLeads: vLeads.filter((l: any) => l.status === 'new' || l.status === 'pending').length,
          lostLeads: vLeads.filter((l: any) => l.status === 'lost').length,
        });
      }

      // Score each vendor
      const scoredVendors = vendors.map((v: VendorProfile) => {
        const stats = leadMap.get(v.id) ?? { totalLeads: 0, convertedLeads: 0, avgResponseMinutes: 0, pendingLeads: 0, lostLeads: 0 };
        const score = computeVendorScore(v, stats, slaThresholds);
        return { vendor: v, leadStats: stats, score };
      });

      // Sort by routing priority
      scoredVendors.sort((a: any, b: any) => b.score.routingPriority - a.score.routingPriority);

      // Detect category supply gaps
      const categoryMap = new Map<string, { vendorCount: number; demandSignal: number }>();
      for (const v of vendors) {
        const cat = (v as any).business_type || 'Other';
        const existing = categoryMap.get(cat) ?? { vendorCount: 0, demandSignal: 10 };
        existing.vendorCount++;
        categoryMap.set(cat, existing);
      }
      const supplyGaps = detectSupplyGaps(
        Array.from(categoryMap.entries()).map(([name, data]) => ({ name, ...data }))
      );

      return { scoredVendors, supplyGaps };
    },
    staleTime: 30_000,
  });
}

/**
 * Trigger the vendor-marketplace-engine edge function.
 */
export async function triggerVendorEngine(mode: 'full' | 'score' | 'match' | 'route' = 'full') {
  const { data, error } = await supabase.functions.invoke('vendor-marketplace-engine', {
    body: { mode },
  });
  if (error) throw error;
  return data;
}
