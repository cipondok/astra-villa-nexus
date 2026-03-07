import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AutoRunCheckpoint {
  isAutoMode: boolean;
  completedProvinces: string[];
  currentProvince: string;
  currentOffset: number;
  totalCreated: number;
  totalSkipped: number;
  totalErrors: number;
  provincesQueue: string[];
  startedAt: number;
  lastUpdated: number;
  currentCity?: string;
  currentArea?: string;
}

export interface DoneProvinceCheckpoint {
  province: string;
  completedAt: string;
  created: number;
  skipped: number;
  errors: number;
  cities: string[];
  areas: string[];
}

export const useSpgCheckpoints = () => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  /** Save or update the auto-run checkpoint */
  const saveAutoRunCheckpoint = useCallback(async (state: AutoRunCheckpoint) => {
    const userId = await getUser();
    if (!userId) return;
    await (supabase as any).from('spg_checkpoints').upsert({
      user_id: userId,
      checkpoint_type: 'auto_run',
      is_auto_mode: state.isAutoMode,
      completed_provinces: state.completedProvinces,
      current_province: state.currentProvince,
      current_offset: state.currentOffset,
      total_created: state.totalCreated,
      total_skipped: state.totalSkipped,
      total_errors: state.totalErrors,
      provinces_queue: state.provincesQueue,
      current_city: state.currentCity || null,
      current_area: state.currentArea || null,
      started_at: new Date(state.startedAt).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id', ignoreDuplicates: false });
  }, []);

  /** Load auto-run checkpoint */
  const loadAutoRunCheckpoint = useCallback(async (): Promise<AutoRunCheckpoint | null> => {
    const userId = await getUser();
    if (!userId) return null;
    const { data } = await (supabase as any)
      .from('spg_checkpoints')
      .select('*')
      .eq('user_id', userId)
      .eq('checkpoint_type', 'auto_run')
      .maybeSingle();
    if (!data) return null;
    return {
      isAutoMode: data.is_auto_mode,
      completedProvinces: data.completed_provinces || [],
      currentProvince: data.current_province || '',
      currentOffset: data.current_offset || 0,
      totalCreated: data.total_created || 0,
      totalSkipped: data.total_skipped || 0,
      totalErrors: data.total_errors || 0,
      provincesQueue: data.provinces_queue || [],
      startedAt: data.started_at ? new Date(data.started_at).getTime() : Date.now(),
      lastUpdated: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
      currentCity: data.current_city || undefined,
      currentArea: data.current_area || undefined,
    };
  }, []);

  /** Clear auto-run checkpoint */
  const clearAutoRunCheckpoint = useCallback(async () => {
    const userId = await getUser();
    if (!userId) return;
    await (supabase as any)
      .from('spg_checkpoints')
      .delete()
      .eq('user_id', userId)
      .eq('checkpoint_type', 'auto_run');
  }, []);

  /** Save a done-province record */
  const saveDoneProvinceCheckpoint = useCallback(async (record: DoneProvinceCheckpoint) => {
    const userId = await getUser();
    if (!userId) return;
    await (supabase as any).from('spg_checkpoints').upsert({
      user_id: userId,
      checkpoint_type: 'done_province',
      province_name: record.province,
      province_created: record.created,
      province_skipped: record.skipped,
      province_errors: record.errors,
      province_cities: record.cities,
      province_areas: record.areas,
      province_completed_at: record.completedAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,province_name', ignoreDuplicates: false });
  }, []);

  /** Load all done-province records */
  const loadDoneProvinceCheckpoints = useCallback(async (): Promise<DoneProvinceCheckpoint[]> => {
    const userId = await getUser();
    if (!userId) return [];
    const { data } = await (supabase as any)
      .from('spg_checkpoints')
      .select('*')
      .eq('user_id', userId)
      .eq('checkpoint_type', 'done_province');
    if (!data) return [];
    return data.map((d: any) => ({
      province: d.province_name,
      completedAt: d.province_completed_at || d.updated_at,
      created: d.province_created || 0,
      skipped: d.province_skipped || 0,
      errors: d.province_errors || 0,
      cities: d.province_cities || [],
      areas: d.province_areas || [],
    }));
  }, []);

  /** Clear all checkpoints */
  const clearAllCheckpoints = useCallback(async () => {
    const userId = await getUser();
    if (!userId) return;
    await (supabase as any)
      .from('spg_checkpoints')
      .delete()
      .eq('user_id', userId);
  }, []);

  return {
    saveAutoRunCheckpoint,
    loadAutoRunCheckpoint,
    clearAutoRunCheckpoint,
    saveDoneProvinceCheckpoint,
    loadDoneProvinceCheckpoints,
    clearAllCheckpoints,
  };
};
