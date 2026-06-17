import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ReosMarketStat {
  city: string;
  active_listings: number;
  avg_price_idr: number;
  avg_yield: number;
  avg_roi: number;
  avg_demand: number;
}

export interface ReosMarketSnapshot {
  totals: {
    active_listings: number;
    avg_price_idr: number;
    avg_yield: number;
    avg_roi: number;
    investors_tracked: number;
  };
  by_city: ReosMarketStat[];
  trend: { i: number; label: string; listings: number; avg_price: number }[];
  featured: any[];
}

const TOP_CITIES = ["Bali", "Jakarta", "Lombok", "Batam", "Phuket", "Kuala Lumpur", "Singapore", "Surabaya"];

export function useReosMarket() {
  const [data, setData] = useState<ReosMarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        // Pull a working slice of active properties — enough for client aggregation
        const { data: rows, error: e1 } = await supabase
          .from("properties")
          .select("id, title, slug, city, state, location, property_type, price, rental_yield_percentage, roi_percentage, investment_score, demand_score, liquidity_score, cover_image, images, listed_at, created_at, is_featured")
          .eq("status", "active")
          .order("investment_score", { ascending: false, nullsFirst: false })
          .limit(800);
        if (e1) throw e1;
        if (cancelled) return;

        const list = rows ?? [];

        // Aggregate by city
        const cityMap = new Map<string, { n: number; price: number; yld: number; roi: number; dem: number; yn: number; rn: number; dn: number }>();
        for (const r of list) {
          const c = (r.city || "").toString();
          if (!c) continue;
          const m = cityMap.get(c) ?? { n: 0, price: 0, yld: 0, roi: 0, dem: 0, yn: 0, rn: 0, dn: 0 };
          m.n++;
          if (r.price) m.price += Number(r.price);
          if (r.rental_yield_percentage != null) { m.yld += Number(r.rental_yield_percentage); m.yn++; }
          if (r.roi_percentage != null) { m.roi += Number(r.roi_percentage); m.rn++; }
          if (r.demand_score != null) { m.dem += Number(r.demand_score); m.dn++; }
          cityMap.set(c, m);
        }
        const by_city: ReosMarketStat[] = Array.from(cityMap.entries())
          .map(([city, m]) => ({
            city,
            active_listings: m.n,
            avg_price_idr: m.n ? Math.round(m.price / m.n) : 0,
            avg_yield: m.yn ? +(m.yld / m.yn).toFixed(2) : 0,
            avg_roi: m.rn ? +(m.roi / m.rn).toFixed(2) : 0,
            avg_demand: m.dn ? +(m.dem / m.dn).toFixed(1) : 0,
          }))
          .sort((a, b) => b.active_listings - a.active_listings)
          .slice(0, 8);

        // 12-week trend by listed_at / created_at
        const now = Date.now();
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        const buckets: { i: number; label: string; listings: number; sumPrice: number; n: number }[] =
          Array.from({ length: 12 }, (_, i) => ({
            i, label: `W${i + 1}`, listings: 0, sumPrice: 0, n: 0,
          }));
        for (const r of list) {
          const ts = new Date(r.listed_at || r.created_at || 0).getTime();
          if (!ts) continue;
          const weeksAgo = Math.floor((now - ts) / weekMs);
          if (weeksAgo < 0 || weeksAgo > 11) continue;
          const idx = 11 - weeksAgo;
          buckets[idx].listings++;
          if (r.price) { buckets[idx].sumPrice += Number(r.price); buckets[idx].n++; }
        }
        const trend = buckets.map(b => ({
          i: b.i, label: b.label,
          listings: b.listings,
          avg_price: b.n ? Math.round(b.sumPrice / b.n) : 0,
        }));

        // Totals
        const priced = list.filter(r => r.price);
        const yieldsArr = list.map(r => Number(r.rental_yield_percentage)).filter(v => !Number.isNaN(v) && v > 0);
        const roisArr = list.map(r => Number(r.roi_percentage)).filter(v => !Number.isNaN(v) && v > 0);
        const totals = {
          active_listings: list.length,
          avg_price_idr: priced.length ? Math.round(priced.reduce((s, r) => s + Number(r.price), 0) / priced.length) : 0,
          avg_yield: yieldsArr.length ? +(yieldsArr.reduce((a, b) => a + b, 0) / yieldsArr.length).toFixed(2) : 0,
          avg_roi: roisArr.length ? +(roisArr.reduce((a, b) => a + b, 0) / roisArr.length).toFixed(2) : 0,
          investors_tracked: 0,
        };

        // Optional: investor count
        try {
          const { count } = await supabase.from("investor_profiles").select("*", { count: "exact", head: true });
          if (count != null) totals.investors_tracked = count;
        } catch { /* ignore */ }

        // Featured
        const featured = list
          .filter(r => r.is_featured)
          .slice(0, 4);
        const final = featured.length ? featured : list.slice(0, 4);

        if (!cancelled) setData({ totals, by_city, trend, featured: final });
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "load_error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error, TOP_CITIES };
}

export function formatIDR(n: number): string {
  if (!n) return "—";
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}jt`;
  return new Intl.NumberFormat("id-ID").format(n);
}
