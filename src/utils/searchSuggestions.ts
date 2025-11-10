/**
 * Search Suggestions Utilities
 * Extracted for testability and reusability
 */

interface Province {
  code: string;
  name: string;
}

interface City {
  code: string;
  name: string;
  type: string;
}

interface Area {
  code: string;
  name: string;
}

interface SuggestionClickData {
  count: number;
  timestamps: number[];
}

export interface FilteredSuggestions {
  recent: string[];
  smart: string[];
  trending: string[];
  locations: string[];
}

/**
 * Calculate time-weighted popularity score for a suggestion
 * Recent clicks have higher weight, older clicks decay exponentially
 */
export const calculateTimeWeightedScore = (
  suggestion: string,
  clickData: Record<string, SuggestionClickData>
): number => {
  const data = clickData[suggestion];
  if (!data || !data.timestamps || data.timestamps.length === 0) {
    return 0;
  }

  const now = Date.now();
  const DECAY_RATE = 0.1; // Higher = faster decay
  const ONE_DAY = 24 * 60 * 60 * 1000;

  // Calculate weighted score: each click's weight decreases exponentially with age
  const weightedScore = data.timestamps.reduce((total, timestamp) => {
    const ageInDays = (now - timestamp) / ONE_DAY;
    const weight = Math.exp(-DECAY_RATE * ageInDays); // Exponential decay
    return total + weight;
  }, 0);

  return weightedScore;
};

/**
 * Sort items by time-weighted popularity
 */
export const sortByPopularity = (
  items: string[],
  clickData: Record<string, SuggestionClickData>
): string[] => {
  return [...items].sort((a, b) => {
    const scoreA = calculateTimeWeightedScore(a, clickData);
    const scoreB = calculateTimeWeightedScore(b, clickData);
    return scoreB - scoreA; // Higher weighted score first
  });
};

/**
 * Get location-based suggestions matching the search query
 */
export const getLocationSuggestions = (
  searchQuery: string,
  provinces: Province[],
  cities: City[],
  areas: Area[],
  currentState?: string,
  currentCity?: string
): string[] => {
  if (!searchQuery || searchQuery.trim().length < 2) return [];
  
  const query = searchQuery.toLowerCase().trim();
  const locationMatches: string[] = [];
  
  // Match provinces
  provinces.forEach(province => {
    if (province.name.toLowerCase().includes(query)) {
      locationMatches.push(province.name);
    }
  });
  
  // Match cities
  cities.forEach(city => {
    if (city.name.toLowerCase().includes(query)) {
      const provinceName = provinces.find(p => p.code === currentState)?.name || '';
      locationMatches.push(`${city.name}, ${provinceName}`);
    }
  });
  
  // Match areas
  areas.forEach(area => {
    if (area.name.toLowerCase().includes(query)) {
      const city = cities.find(c => c.code === currentCity);
      const province = provinces.find(p => p.code === currentState);
      locationMatches.push(`${area.name}, ${city?.name || ''}, ${province?.name || ''}`);
    }
  });
  
  return locationMatches.slice(0, 5);
};

/**
 * Filter and organize all suggestion types based on search query
 */
export const getFilteredSuggestions = (
  searchQuery: string,
  recentSearchTerms: string[],
  trendingSearches: string[],
  smartSuggestions: string[],
  provinces: Province[],
  cities: City[],
  areas: Area[],
  currentState?: string,
  currentCity?: string
): FilteredSuggestions => {
  // If no query, show default suggestions
  if (!searchQuery || searchQuery.trim().length === 0) {
    return {
      recent: recentSearchTerms.slice(0, 3),
      smart: smartSuggestions.slice(0, 3),
      trending: trendingSearches.slice(0, 4),
      locations: []
    };
  }

  const query = searchQuery.toLowerCase().trim();
  
  // Filter recent searches
  const filteredRecent = recentSearchTerms.filter(term => 
    term.toLowerCase().includes(query)
  ).slice(0, 3);
  
  // Filter trending and smart
  const filteredTrending = trendingSearches.filter(item => 
    item.toLowerCase().includes(query)
  );
  const filteredSmart = smartSuggestions.filter(item => 
    item.toLowerCase().includes(query)
  );
  
  // Get location matches
  const locationMatches = getLocationSuggestions(
    searchQuery,
    provinces,
    cities,
    areas,
    currentState,
    currentCity
  );
  
  return {
    recent: filteredRecent,
    smart: filteredSmart.slice(0, 3),
    trending: filteredTrending.slice(0, 4),
    locations: locationMatches
  };
};

/**
 * Track a suggestion click with timestamp
 */
export const trackSuggestionClick = (
  suggestion: string,
  currentClicks: Record<string, SuggestionClickData>
): Record<string, SuggestionClickData> => {
  const now = Date.now();
  const existing = currentClicks[suggestion] || { count: 0, timestamps: [] };
  
  return {
    ...currentClicks,
    [suggestion]: {
      count: existing.count + 1,
      timestamps: [...existing.timestamps, now].slice(-50) // Keep last 50 clicks
    }
  };
};

/**
 * Get display count (total clicks) for a suggestion
 */
export const getDisplayCount = (
  suggestion: string,
  clickData: Record<string, SuggestionClickData>
): number => {
  return clickData[suggestion]?.count || 0;
};
