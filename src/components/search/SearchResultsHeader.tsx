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
import { X, Clock, TrendingUp, DollarSign, ArrowUpDown } from "lucide-react";
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
  { value: 'newest', label: 'Newest First', icon: Clock },
  { value: 'oldest', label: 'Oldest First', icon: Clock },
  { value: 'price_asc', label: 'Price: Low to High', icon: DollarSign },
  { value: 'price_desc', label: 'Price: High to Low', icon: DollarSign },
  { value: 'popular', label: 'Most Popular', icon: TrendingUp },
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
            <span className="text-sm text-muted-foreground animate-pulse">
              Searching...
            </span>
          ) : (
            <>
              <span className="font-semibold">
                {totalResults.toLocaleString()} {totalResults === 1 ? 'property' : 'properties'}
              </span>
              {searchTimeMs !== undefined && searchTimeMs > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({searchTimeMs}ms)
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    {option.label}
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
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {activeFilters.map(filter => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs text-muted-foreground">{filter.label}:</span>
              <span>{filter.value}</span>
              <button
                onClick={() => onRemoveFilter(filter.key)}
                className="ml-1 p-0.5 hover:bg-secondary-foreground/10 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
            className="text-xs h-7"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsHeader;
