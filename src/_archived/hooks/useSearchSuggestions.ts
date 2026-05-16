import { useState, useEffect, useCallback, useRef } from 'react';

const RECENT_SEARCHES_KEY = 'astra-recent-searches';
const MAX_RECENT = 8;

export interface SearchSuggestion {
  text: string;
  type: 'recent' | 'city' | 'type' | 'area';
  icon?: string;
}

const CITY_SUGGESTIONS = [
  'Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta', 'Medan',
  'Makassar', 'Semarang', 'Malang', 'Denpasar', 'Bekasi', 'Tangerang',
  'Bogor', 'Depok', 'Lombok', 'Balikpapan', 'Solo',
];

const TYPE_SUGGESTIONS = [
  { text: 'Villa', type: 'type' as const },
  { text: 'Rumah', type: 'type' as const },
  { text: 'Apartemen', type: 'type' as const },
  { text: 'Tanah', type: 'type' as const },
  { text: 'Komersial', type: 'type' as const },
];

export function useSearchSuggestions() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setRecentSearches(prev => {
      const updated = [query, ...prev.filter(s => s.toLowerCase() !== query.toLowerCase())].slice(0, MAX_RECENT);
      try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try { localStorage.removeItem(RECENT_SEARCHES_KEY); } catch { /* ignore */ }
  }, []);

  const getSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query.trim()) {
      return recentSearches.map(text => ({ text, type: 'recent' as const }));
    }

    const q = query.toLowerCase();
    const results: SearchSuggestion[] = [];

    // Recent matches first
    recentSearches
      .filter(s => s.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach(text => results.push({ text, type: 'recent' }));

    // City matches
    CITY_SUGGESTIONS
      .filter(c => c.toLowerCase().includes(q))
      .slice(0, 4)
      .forEach(text => results.push({ text, type: 'city' }));

    // Type matches
    TYPE_SUGGESTIONS
      .filter(t => t.text.toLowerCase().includes(q))
      .forEach(t => results.push({ text: t.text, type: 'type' }));

    return results.slice(0, 8);
  }, [recentSearches]);

  return { recentSearches, addRecentSearch, clearRecentSearches, getSuggestions };
}
