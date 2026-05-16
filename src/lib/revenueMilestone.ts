/**
 * First Revenue Milestone Engine
 *
 * Models monthly revenue from 3 streams and tracks progress toward target.
 * All amounts in IDR (Rp).
 */

export interface RevenueModelInput {
  // Transaction commission
  avg_deal_value: number;
  commission_rate_pct: number;
  deals_closed_month: number;
  // Subscriptions
  investor_subscribers: number;
  investor_arpu: number;
  vendor_subscribers: number;
  vendor_arpu: number;
  // Premium listings
  premium_slots_sold: number;
  slot_price: number;
  // Target
  monthly_revenue_target: number;
}

export interface RevenueStream {
  name: string;
  revenue: number;
  pct_of_total: number;
  pct_of_target: number;
}

export interface MilestoneGap {
  shortfall: number;
  deals_needed: number;
  subs_needed: number;
  slots_needed: number;
}

export type MilestoneStatus = 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'ACHIEVED';

export interface RevenueModelOutput {
  total_monthly_revenue: number;
  streams: RevenueStream[];
  target: number;
  progress_pct: number;
  status: MilestoneStatus;
  gap: MilestoneGap;
  priority_actions: string[];
  experiments: string[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export function modelRevenue(input: RevenueModelInput): RevenueModelOutput {
  const {
    avg_deal_value, commission_rate_pct, deals_closed_month,
    investor_subscribers, investor_arpu, vendor_subscribers, vendor_arpu,
    premium_slots_sold, slot_price, monthly_revenue_target,
  } = input;

  const txRevenue = avg_deal_value * (commission_rate_pct / 100) * deals_closed_month;
  const subRevenue = (investor_subscribers * investor_arpu) + (vendor_subscribers * vendor_arpu);
  const slotRevenue = premium_slots_sold * slot_price;
  const total = txRevenue + subRevenue + slotRevenue;

  const streams: RevenueStream[] = [
    { name: 'Transaction Commission', revenue: txRevenue, pct_of_total: total > 0 ? Math.round((txRevenue / total) * 100) : 0, pct_of_target: monthly_revenue_target > 0 ? Math.round((txRevenue / monthly_revenue_target) * 100) : 0 },
    { name: 'Subscriptions', revenue: subRevenue, pct_of_total: total > 0 ? Math.round((subRevenue / total) * 100) : 0, pct_of_target: monthly_revenue_target > 0 ? Math.round((subRevenue / monthly_revenue_target) * 100) : 0 },
    { name: 'Premium Listings', revenue: slotRevenue, pct_of_total: total > 0 ? Math.round((slotRevenue / total) * 100) : 0, pct_of_target: monthly_revenue_target > 0 ? Math.round((slotRevenue / monthly_revenue_target) * 100) : 0 },
  ];

  const progress = monthly_revenue_target > 0 ? Math.round((total / monthly_revenue_target) * 100) : 0;
  const status: MilestoneStatus = progress >= 100 ? 'ACHIEVED' : progress >= 75 ? 'ON_TRACK' : progress >= 50 ? 'AT_RISK' : 'BEHIND';

  const shortfall = Math.max(0, monthly_revenue_target - total);
  const perDeal = avg_deal_value * (commission_rate_pct / 100);
  const perSub = investor_arpu || vendor_arpu || 500_000;

  const gap: MilestoneGap = {
    shortfall,
    deals_needed: perDeal > 0 ? Math.ceil(shortfall / perDeal) : 0,
    subs_needed: perSub > 0 ? Math.ceil(shortfall / perSub) : 0,
    slots_needed: slot_price > 0 ? Math.ceil(shortfall / slot_price) : 0,
  };

  // Priority actions based on weakest stream
  const priority_actions: string[] = [];
  const sorted = [...streams].sort((a, b) => a.pct_of_target - b.pct_of_target);

  if (status !== 'ACHIEVED') {
    for (const s of sorted) {
      switch (s.name) {
        case 'Transaction Commission':
          if (s.pct_of_target < 40) priority_actions.push(`Akselerasi deal pipeline — butuh ${gap.deals_needed} deal tambahan untuk tutup gap ${fmt(shortfall)}`);
          priority_actions.push('Fokuskan agent ke properti high-value (>Rp 3B) untuk maximize commission per deal');
          break;
        case 'Subscriptions':
          if (s.pct_of_target < 30) priority_actions.push('Luncurkan free trial 30-hari untuk Investor Pro plan — target konversi 20% ke paid');
          priority_actions.push('Aktivasi vendor onboarding blitz — setiap vendor baru = recurring revenue');
          break;
        case 'Premium Listings':
          if (s.pct_of_target < 20) priority_actions.push(`Jual ${gap.slots_needed} premium slot tambahan — bundling dengan listing optimization service`);
          break;
      }
    }
  }

  const experiments: string[] = [
    'A/B test commission rate: 1.5% vs 2% — ukur dampak ke deal volume vs revenue per deal',
    'Upsell investor analytics add-on (Rp 199k/bulan) saat user mengakses market trends',
    'Flash sale premium slots: diskon 30% untuk 48 jam — ukur elastisitas demand',
    'Bundle vendor subscription + 3 premium slots di harga package discount 15%',
    'Referral reward: investor yang refer buyer mendapat 1 bulan Pro gratis',
  ];

  return { total_monthly_revenue: total, streams, target: monthly_revenue_target, progress_pct: progress, status, gap, priority_actions, experiments };
}
