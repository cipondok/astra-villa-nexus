import { Suspense, lazy } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { List, Grid3X3, MapPin, SlidersHorizontal, Sparkles, TrendingUp, Clock, DollarSign, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = 'list' | 'grid' | 'map';

interface SearchResultsToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  totalResults: number;
  isSearching: boolean;
  searchQuery?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'best_opportunity', label: 'Best Opportunity', icon: Sparkles },
  { value: 'price_low', label: 'Lowest Price', icon: DollarSign },
  { value: 'price_high', label: 'Highest Price', icon: DollarSign },
  { value: 'popularity', label: 'Most Popular', icon: Flame },
  { value: 'area_large', label: 'Largest Area', icon: TrendingUp },
];

export default function SearchResultsToolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  totalResults,
  isSearching,
  searchQuery,
}: SearchResultsToolbarProps) {
  const currentSort = sortOptions.find(s => s.value === sortBy) || sortOptions[0];

  return (
    <div className="sticky top-12 md:top-13 lg:top-14 z-20 bg-background/95 backdrop-blur-sm border-b border-border/50 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Results count */}
        <div className="min-w-0 flex-shrink">
          <p className="text-sm sm:text-base font-semibold text-foreground truncate">
            {isSearching ? 'Searching...' : `${totalResults} Properties`}
          </p>
          {searchQuery && !isSearching && (
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
              Results for "<span className="text-primary font-medium">{searchQuery}</span>"
            </p>
          )}
        </div>

        {/* Sort + View controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sort dropdown */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-8 sm:h-9 w-[140px] sm:w-[170px] text-xs sm:text-sm border-border/60 bg-card">
              <div className="flex items-center gap-1.5 truncate">
                <currentSort.icon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && onViewModeChange(v as ViewMode)}
            className="border border-border/60 rounded-lg p-0.5 bg-card hidden sm:flex"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" className="h-7 w-7 sm:h-8 sm:w-8 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md">
              <Grid3X3 className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="h-7 w-7 sm:h-8 sm:w-8 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md">
              <List className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="map" aria-label="Map view" className="h-7 w-7 sm:h-8 sm:w-8 p-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md">
              <MapPin className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
}
