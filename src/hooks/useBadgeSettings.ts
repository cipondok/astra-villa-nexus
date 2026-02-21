import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BadgeLevelConfig {
  label: string;
  shieldColor: string;
  shieldLight: string;
  shieldDark: string;
}

export interface BadgeSettings {
  shieldStyle: "diamond" | "classic" | "minimal";
  badgeText: string;
  showBadgeText: boolean;
  badgeTextStyle: "pill" | "plain";
  levels: Record<string, BadgeLevelConfig>;
  logoUrl: string; // override logo, empty = use header logo
}

const DEFAULT_BADGE_SETTINGS: BadgeSettings = {
  shieldStyle: "diamond",
  badgeText: "Verified Partner",
  showBadgeText: true,
  badgeTextStyle: "pill",
  logoUrl: "",
  levels: {
    diamond: { label: "Diamond", shieldColor: "#38bdf8", shieldLight: "#7dd3fc", shieldDark: "#0284c7" },
    platinum: { label: "Platinum", shieldColor: "#22d3ee", shieldLight: "#67e8f9", shieldDark: "#0891b2" },
    gold: { label: "Gold", shieldColor: "#d4a017", shieldLight: "#facc15", shieldDark: "#a16207" },
    vip: { label: "VIP", shieldColor: "#a855f7", shieldLight: "#c084fc", shieldDark: "#7c3aed" },
    silver: { label: "Silver", shieldColor: "#94a3b8", shieldLight: "#cbd5e1", shieldDark: "#64748b" },
    premium: { label: "Premium", shieldColor: "#8b5cf6", shieldLight: "#a78bfa", shieldDark: "#6d28d9" },
  },
};

export const useBadgeSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["badge-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "badge_config")
        .maybeSingle();

      if (error) {
        console.error("Error fetching badge settings:", error);
        return DEFAULT_BADGE_SETTINGS;
      }

      if (!data?.value) return DEFAULT_BADGE_SETTINGS;

      try {
        const parsed = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        return { ...DEFAULT_BADGE_SETTINGS, ...parsed } as BadgeSettings;
      } catch {
        return DEFAULT_BADGE_SETTINGS;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: async (newSettings: BadgeSettings) => {
      const value = JSON.stringify(newSettings);

      // Upsert
      const { data: existing } = await supabase
        .from("system_settings")
        .select("id")
        .eq("key", "badge_config")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("system_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", "badge_config");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("system_settings")
          .insert({ key: "badge_config", value, category: "badge" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badge-settings"] });
    },
  });

  return {
    settings: settings || DEFAULT_BADGE_SETTINGS,
    isLoading,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};

export { DEFAULT_BADGE_SETTINGS };
