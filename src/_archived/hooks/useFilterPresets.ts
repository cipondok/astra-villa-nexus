import { useState, useEffect } from "react";
import { PropertyFilters } from "@/components/search/AdvancedPropertyFilters";
import { toast } from "sonner";

export interface SavedPreset {
  id: string;
  name: string;
  filters: Partial<PropertyFilters>;
  createdAt: string;
}

const STORAGE_KEY = "property_filter_presets";

export const useFilterPresets = () => {
  const [savedPresets, setSavedPresets] = useState<SavedPreset[]>([]);

  // Load presets from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedPresets(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading presets:', error);
      }
    }
  }, []);

  const savePreset = (name: string, filters: PropertyFilters) => {
    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };

    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success(`Preset "${name}" saved successfully!`);
  };

  const deletePreset = (id: string) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    toast.success("Preset deleted");
  };

  const loadPreset = (id: string): Partial<PropertyFilters> | null => {
    const preset = savedPresets.find(p => p.id === id);
    if (preset) {
      toast.success(`Loaded preset "${preset.name}"`);
      return preset.filters;
    }
    return null;
  };

  return {
    savedPresets,
    savePreset,
    deletePreset,
    loadPreset,
  };
};
