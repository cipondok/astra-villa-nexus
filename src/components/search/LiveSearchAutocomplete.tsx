/**
 * Live Search Autocomplete - Real-time search suggestions from database
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MapPin, 
  Home, 
  Building2, 
  TrendingUp,
  Clock,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface AutocompleteSuggestion {
  type: 'property' | 'location' | 'recent' | 'trending';
  id?: string;
  title: string;
  subtitle?: string;
  price?: number;
  propertyType?: string;
  thumbnail?: string;
}

interface LiveSearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectProperty?: (propertyId: string) => void;
  onSelectLocation?: (location: string) => void;
  placeholder?: string;
  className?: string;
  showTrending?: boolean;
}

const LiveSearchAutocomplete = ({
  value,
  onChange,
  onSelectProperty,
  onSelectLocation,
  placeholder = "Search properties, locations...",
  className,
  showTrending = true
}: LiveSearchAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(value, 200);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentPropertySearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  // Save search to recent
  const saveToRecent = useCallback((search: string) => {
    if (!search.trim()) return;
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentPropertySearches', JSON.stringify(updated));
  }, [recentSearches]);

  // Fetch property suggestions
  const { data: propertySuggestions = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['search-autocomplete-properties', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, city, state, price, property_type, thumbnail_url, images')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .or(`title.ilike.%${debouncedQuery}%,city.ilike.%${debouncedQuery}%,location.ilike.%${debouncedQuery}%,description.ilike.%${debouncedQuery}%`)
        .limit(5);
      
      if (error) throw error;
      return (data || []).map(p => ({
        type: 'property' as const,
        id: p.id,
        title: p.title,
        subtitle: `${p.city || ''}, ${p.state || ''}`.replace(/^, |, $/g, ''),
        price: p.price,
        propertyType: p.property_type,
        thumbnail: p.thumbnail_url || (p.images as string[])?.[0]
      }));
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000
  });

  // Fetch location suggestions
  const { data: locationSuggestions = [] } = useQuery({
    queryKey: ['search-autocomplete-locations', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('city, state')
        .eq('status', 'active')
        .or(`city.ilike.%${debouncedQuery}%,state.ilike.%${debouncedQuery}%`)
        .limit(20);
      
      if (error) throw error;
      
      // Get unique locations with counts
      const locationCounts = new Map<string, number>();
      (data || []).forEach(p => {
        if (p.city) {
          const key = `${p.city}, ${p.state || 'Indonesia'}`;
          locationCounts.set(key, (locationCounts.get(key) || 0) + 1);
        }
      });
      
      return Array.from(locationCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([location, count]) => ({
          type: 'location' as const,
          title: location,
          subtitle: `${count} properties`
        }));
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 60000
  });

  // Fetch trending searches
  const { data: trendingSuggestions = [] } = useQuery({
    queryKey: ['search-trending'],
    queryFn: async () => {
      // Get most common property types and locations
      const { data, error } = await supabase
        .from('properties')
        .select('city, property_type')
        .eq('status', 'active')
        .limit(100);
      
      if (error) return [];
      
      const cityCounts = new Map<string, number>();
      (data || []).forEach(p => {
        if (p.city) cityCounts.set(p.city, (cityCounts.get(p.city) || 0) + 1);
      });
      
      return Array.from(cityCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([city]) => ({
          type: 'trending' as const,
          title: city
        }));
    },
    enabled: showTrending && !debouncedQuery,
    staleTime: 5 * 60 * 1000
  });

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: AutocompleteSuggestion) => {
    if (suggestion.type === 'property' && suggestion.id && onSelectProperty) {
      onSelectProperty(suggestion.id);
      saveToRecent(suggestion.title);
    } else {
      onChange(suggestion.title);
      saveToRecent(suggestion.title);
      if (suggestion.type === 'location' && onSelectLocation) {
        onSelectLocation(suggestion.title);
      }
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter') {
      saveToRecent(value);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const hasQuery = debouncedQuery.length >= 2;
  const hasSuggestions = propertySuggestions.length > 0 || locationSuggestions.length > 0;
  const showDropdown = isOpen && (hasQuery ? hasSuggestions : (recentSearches.length > 0 || trendingSuggestions.length > 0));

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)}B`;
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)}M`;
    return `Rp ${price.toLocaleString()}`;
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <ScrollArea className="max-h-[400px]">
            {/* Recent Searches */}
            {!hasQuery && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect({ type: 'recent', title: search })}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md text-left"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
                <Separator className="my-2" />
              </div>
            )}

            {/* Trending */}
            {!hasQuery && showTrending && trendingSuggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Trending Locations
                </div>
                <div className="flex flex-wrap gap-2 px-2 py-2">
                  {trendingSuggestions.map((s, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleSelect(s)}
                    >
                      {s.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Location Results */}
            {hasQuery && locationSuggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  Locations
                </div>
                {locationSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(s)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{s.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.subtitle}</span>
                  </button>
                ))}
                {propertySuggestions.length > 0 && <Separator className="my-2" />}
              </div>
            )}

            {/* Property Results */}
            {hasQuery && propertySuggestions.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Home className="h-3 w-3" />
                  Properties
                </div>
                {propertySuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(s)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md"
                  >
                    {s.thumbnail ? (
                      <img
                        src={s.thumbnail}
                        alt=""
                        className="h-12 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-12 w-16 bg-muted rounded flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium line-clamp-1">{s.title}</div>
                      <div className="text-xs text-muted-foreground">{s.subtitle}</div>
                    </div>
                    {s.price && (
                      <Badge variant="outline" className="text-xs">
                        {formatPrice(s.price)}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Loading state */}
            {hasQuery && loadingProperties && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {/* No results */}
            {hasQuery && !loadingProperties && !hasSuggestions && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results for "{debouncedQuery}"
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default LiveSearchAutocomplete;
