import { supabase } from '@/integrations/supabase/client';

export type FeatureStatus = 'active' | 'disabled' | 'beta' | 'archived';

export interface FeatureControl {
  id: string;
  feature_key: string;
  label: string;
  status: FeatureStatus;
  performance_impact_score: number;
  description: string;
  last_updated: string;
}

export async function fetchAllFeatureControls(): Promise<FeatureControl[]> {
  const { data, error } = await (supabase as any)
    .from('astra_feature_controls')
    .select('*')
    .order('label');
  if (error) throw error;
  return data as FeatureControl[];
}

export async function updateFeatureStatus(
  featureKey: string,
  status: FeatureStatus
): Promise<void> {
  const { error } = await (supabase as any)
    .from('astra_feature_controls')
    .update({ status, last_updated: new Date().toISOString() })
    .eq('feature_key', featureKey);
  if (error) throw error;
}

export function isFeatureEnabled(
  controls: FeatureControl[],
  featureKey: string,
  allowBeta = false
): boolean {
  const ctrl = controls.find(c => c.feature_key === featureKey);
  if (!ctrl) return true; // unknown features default enabled
  if (ctrl.status === 'active') return true;
  if (ctrl.status === 'beta' && allowBeta) return true;
  return false;
}
