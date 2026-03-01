import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { OffPlanProject } from '@/components/investment/OffPlanProjectCard';
import type { ConstructionPhase } from '@/components/investment/ConstructionTimeline';
import { DEMO_PROJECTS, DEMO_DEVELOPERS } from '@/data/demoOffPlanProjects';

/**
 * Maps a Supabase properties row (with off-plan columns) to the OffPlanProject interface.
 */
function mapRowToProject(row: any): OffPlanProject {
  // Parse construction_phases jsonb into ConstructionPhase[]
  let phases: ConstructionPhase[] = [];
  if (Array.isArray(row.construction_phases)) {
    phases = (row.construction_phases as any[]).map((p: any) => ({
      name: p.name ?? '',
      completed: !!p.completed,
      current: !!p.current,
      estimatedDate: p.estimatedDate ?? p.estimated_date ?? undefined,
    }));
  }

  // If no phases from DB, generate a simple one from construction_phase + completion_percentage
  if (phases.length === 0 && row.construction_phase) {
    const phaseNames = ['Planning', 'Groundbreaking', 'Structure', 'MEP', 'Finishing', 'Handover'];
    const currentIdx = phaseNames.findIndex(
      n => n.toLowerCase() === (row.construction_phase as string).toLowerCase()
    );
    phases = phaseNames.map((name, i) => ({
      name,
      completed: i < (currentIdx >= 0 ? currentIdx : 0),
      current: i === (currentIdx >= 0 ? currentIdx : 0),
    }));
  }

  const startingPrice = Number(row.price) || 0;
  const estimatedCompletionValue = Number(row.estimated_completion_value) || startingPrice * 1.3;
  const appreciationPct = startingPrice > 0
    ? Math.round(((estimatedCompletionValue - startingPrice) / startingPrice) * 100)
    : 0;

  return {
    id: row.id,
    title: row.title ?? 'Untitled Project',
    imageUrl: row.thumbnail_url ?? row.image_urls?.[0] ?? 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
    location: row.location ?? '',
    city: row.city ?? row.state ?? '',
    developerName: row.developer_id ?? 'Developer',
    developerRating: 4.5,
    startingPrice,
    estimatedCompletionValue,
    completionPct: row.completion_percentage ?? 0,
    launchDate: row.launch_date ?? '',
    estimatedCompletion: row.estimated_completion_date ?? '',
    phases,
    appreciationPct,
    rentalYieldPct: 0,
    propertyType: row.property_type ?? 'property',
    isEarlyBird: row.is_early_bird ?? false,
    isPreLaunch: row.is_pre_launch ?? false,
    totalUnits: row.total_units ?? undefined,
    unitsSold: row.units_sold ?? undefined,
  };
}

export function useOffPlanProjects() {
  return useQuery({
    queryKey: ['off-plan-projects'],
    queryFn: async (): Promise<{ projects: OffPlanProject[]; isDemo: boolean }> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .not('construction_phase', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch off-plan projects, using demo data:', error.message);
        return { projects: DEMO_PROJECTS, isDemo: true };
      }

      if (!data || data.length === 0) {
        return { projects: DEMO_PROJECTS, isDemo: true };
      }

      return { projects: data.map(mapRowToProject), isDemo: false };
    },
    staleTime: 60_000,
  });
}

export { DEMO_DEVELOPERS };
