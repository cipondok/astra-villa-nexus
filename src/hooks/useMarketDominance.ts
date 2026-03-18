import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DominationLever = 'city_first' | 'developer_partnerships' | 'investor_education' | 'tech_differentiation';
export type ExpansionPhase = 'beachhead' | 'consolidation' | 'expansion' | 'dominance';

export interface CityPresence {
  city: string;
  listings: number;
  agents: number;
  inquiries: number;
  marketShare: number;
  phase: ExpansionPhase;
}

export interface LeverMetric {
  lever: DominationLever;
  label: string;
  score: number;
  signals: { label: string; value: number; target: number }[];
}

export interface ExpansionFramework {
  cities: CityPresence[];
  levers: LeverMetric[];
  overallDominanceScore: number;
  currentPhase: ExpansionPhase;
  topCity: string;
  totalListings: number;
  totalAgents: number;
  contentPieces: number;
  aiCoverage: number;
}

export function useMarketDominance(enabled = true) {
  return useQuery({
    queryKey: ['market-dominance-framework'],
    queryFn: async (): Promise<ExpansionFramework> => {
      const [propsRes, profilesRes, contentRes, aiJobsRes] = await Promise.all([
        (supabase as any).from('properties').select('id,city,status').eq('status', 'active'),
        (supabase as any).from('profiles').select('id,city,account_type'),
        (supabase as any).from('acquisition_seo_content').select('id,status').eq('status', 'published'),
        (supabase as any).from('ai_processing_jobs').select('id,status').eq('status', 'completed'),
      ]);

      const properties = (propsRes.data || []) as any[];
      const profiles = (profilesRes.data || []) as any[];
      const agents = profiles.filter((p: any) => p.account_type === 'agent');
      const content = (contentRes.data || []) as any[];
      const aiJobs = (aiJobsRes.data || []) as any[];

      // City aggregation
      const cityMap = new Map<string, { listings: number; agents: number }>();
      for (const p of properties) {
        const c = p.city || 'Unknown';
        const entry = cityMap.get(c) || { listings: 0, agents: 0 };
        entry.listings++;
        cityMap.set(c, entry);
      }
      for (const a of agents) {
        const c = a.city || 'Unknown';
        const entry = cityMap.get(c) || { listings: 0, agents: 0 };
        entry.agents++;
        cityMap.set(c, entry);
      }

      const totalListings = properties.length;
      const cities: CityPresence[] = Array.from(cityMap.entries())
        .map(([city, data]) => {
          const share = totalListings > 0 ? Math.round((data.listings / totalListings) * 100) : 0;
          let phase: ExpansionPhase = 'beachhead';
          if (data.listings >= 50 && data.agents >= 10) phase = 'dominance';
          else if (data.listings >= 20 && data.agents >= 5) phase = 'expansion';
          else if (data.listings >= 5) phase = 'consolidation';
          return { city, listings: data.listings, agents: data.agents, inquiries: 0, marketShare: share, phase };
        })
        .sort((a, b) => b.listings - a.listings);

      const topCity = cities[0]?.city || '—';
      const aiCoverage = totalListings > 0 ? Math.min(100, Math.round((aiJobs.length / totalListings) * 100)) : 0;

      // Lever scoring
      const cityScore = Math.min(100, cities.filter((c) => c.phase !== 'beachhead').length * 20 + (cities[0]?.listings || 0));
      const devScore = Math.min(100, Math.round((totalListings / 50) * 100));
      const eduScore = Math.min(100, content.length * 10);
      const techScore = Math.min(100, aiCoverage + Math.min(30, aiJobs.length));

      const levers: LeverMetric[] = [
        {
          lever: 'city_first', label: 'City-First Strategy', score: cityScore,
          signals: [
            { label: 'Cities with presence', value: cities.length, target: 10 },
            { label: 'Top city listings', value: cities[0]?.listings || 0, target: 50 },
            { label: 'Cities past beachhead', value: cities.filter((c) => c.phase !== 'beachhead').length, target: 5 },
          ],
        },
        {
          lever: 'developer_partnerships', label: 'Developer Partnerships', score: devScore,
          signals: [
            { label: 'Active listings', value: totalListings, target: 50 },
            { label: 'Agent partners', value: agents.length, target: 20 },
            { label: 'Exclusive projects', value: 0, target: 5 },
          ],
        },
        {
          lever: 'investor_education', label: 'Investor Education', score: eduScore,
          signals: [
            { label: 'Published content', value: content.length, target: 10 },
            { label: 'Learning sessions', value: 0, target: 4 },
            { label: 'Content engagement', value: 0, target: 500 },
          ],
        },
        {
          lever: 'tech_differentiation', label: 'Tech Differentiation', score: techScore,
          signals: [
            { label: 'AI scoring coverage', value: aiCoverage, target: 100 },
            { label: 'AI jobs completed', value: aiJobs.length, target: 100 },
            { label: 'Avg score confidence', value: 0, target: 80 },
          ],
        },
      ];

      const overallDominanceScore = Math.round(levers.reduce((s, l) => s + l.score, 0) / levers.length);
      let currentPhase: ExpansionPhase = 'beachhead';
      if (overallDominanceScore >= 75) currentPhase = 'dominance';
      else if (overallDominanceScore >= 50) currentPhase = 'expansion';
      else if (overallDominanceScore >= 25) currentPhase = 'consolidation';

      return {
        cities, levers, overallDominanceScore, currentPhase, topCity,
        totalListings, totalAgents: agents.length, contentPieces: content.length, aiCoverage,
      };
    },
    enabled,
    staleTime: 60_000,
  });
}
