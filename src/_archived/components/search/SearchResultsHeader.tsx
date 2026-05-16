/**
 * Search Results Header - Shows result count, sort options, and active filters
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Clock, TrendingUp, DollarSign, ArrowUpDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

interface SearchResultsHeaderProps {
  totalResults: number;
  searchTimeMs?: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (key: string) => void;
  onClearAllFilters: () => void;
  isLoading?: boolean;
  className?: string;
}

const sortOptions = [
  { value: 'deal_score', label: 'Best Opportunity', icon: Sparkles },
  { value: 'newest', label: 'Newest Listings', icon: Clock },
  { value: 'price_asc', label: 'Best Value First', icon: DollarSign },
  { value: 'price_desc', label: 'Premium First', icon: DollarSign },
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
  { value: 'oldest', label: 'Oldest First', icon: Clock },
];

const SearchResultsHeader = ({
  totalResults,
  searchTimeMs,
  sortBy,
  onSortChange,
  activeFilters,
  onRemoveFilter,
  onClearAllFilters,
  isLoading,
  className
}: SearchResultsHeaderProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Results count and sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-sm text-muted-foreground">
                Searching...
              </span>
            </div>
          ) : (
            <>
              <span className="text-lg font-bold text-foreground tabular-nums">
                {totalResults.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {totalResults === 1 ? 'property found' : 'properties found'}
              </span>
              {searchTimeMs !== undefined && searchTimeMs > 0 && (
                <span className="text-[11px] text-muted-foreground/60 tabular-nums">
                  ({searchTimeMs}ms)
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className={cn(
                      "h-4 w-4",
                      option.value === 'deal_score' && "text-primary"
                    )} />
                    <span className={cn(
                      option.value === 'deal_score' && "font-semibold text-primary"
                    )}>
                      {option.label}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filters:</span>
          {activeFilters.map(filter => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 pr-1 bg-primary/10 border-primary/20 text-foreground"
            >
              <span className="text-[10px] text-muted-foreground font-medium">{filter.label}:</span>
              <span className="text-[11px] font-semibold">{filter.value}</span>
              <button
                onClick={() => onRemoveFilter(filter.key)}
                className="ml-1 p-0.5 hover:bg-destructive/20 rounded transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsHeader;
