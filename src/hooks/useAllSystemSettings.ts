import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemSettingRow {
  key: string;
  value: unknown;
  category: string | null;
  description: string | null;
  is_public: boolean | null;
}

const QUERY_KEY = ['all-system-settings'] as const;
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

/**
 * Single cached query for ALL system_settings rows.
 * Every hook that previously queried system_settings independently
 * should now call useAllSystemSettings() and derive what it needs.
 */
export const useAllSystemSettings = () => {
  return useQuery<SystemSettingRow[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value, category, description, is_public');

      if (error) throw error;
      return (data ?? []) as SystemSettingRow[];
    },
    staleTime: STALE_TIME,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });
};

// ── Selector helpers ────────────────────────────────────────────

/** Get a single setting value by key */
export const selectSettingByKey = (
  settings: SystemSettingRow[] | undefined,
  key: string,
): unknown | undefined => settings?.find((s) => s.key === key)?.value;

/** Get all settings whose key is in the provided list */
export const selectSettingsByKeys = (
  settings: SystemSettingRow[] | undefined,
  keys: string[],
): Record<string, unknown> => {
  if (!settings) return {};
  const keySet = new Set(keys);
  const result: Record<string, unknown> = {};
  for (const s of settings) {
    if (keySet.has(s.key)) result[s.key] = s.value;
  }
  return result;
};

/** Get all settings belonging to a category */
export const selectSettingsByCategory = (
  settings: SystemSettingRow[] | undefined,
  category: string,
): SystemSettingRow[] => settings?.filter((s) => s.category === category) ?? [];

/** Invalidate the global settings cache */
export const useInvalidateSystemSettings = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: QUERY_KEY });
};
