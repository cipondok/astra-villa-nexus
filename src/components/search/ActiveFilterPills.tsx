import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PropertyFilters } from "./AdvancedPropertyFilters";

interface ActiveFilterPillsProps {
  filters: PropertyFilters;
  onRemoveFilter: (key: keyof PropertyFilters, value?: any) => void;
  onClearAll: () => void;
}

export const ActiveFilterPills = ({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterPillsProps) => {
  const activeFilters: Array<{
    key: keyof PropertyFilters;
    label: string;
    value?: any;
  }> = [];

  // Search query
  if (filters.searchQuery) {
    activeFilters.push({
      key: "searchQuery",
      label: `Search: "${filters.searchQuery}"`,
    });
  }

  // Location
  if (filters.location && filters.location !== "all") {
    activeFilters.push({
      key: "location",
      label: `Location: ${filters.location}`,
    });
  }

  // Listing type
  if (filters.listingType && filters.listingType !== "all") {
    activeFilters.push({
      key: "listingType",
      label: `Type: ${filters.listingType === "rent" ? "Rent" : "Sale"}`,
    });
  }

  // Property types
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    filters.propertyTypes.forEach((type) => {
      activeFilters.push({
        key: "propertyTypes",
        label: `Type: ${type}`,
        value: type,
      });
    });
  }

  // Bedrooms
  if (filters.bedrooms) {
    activeFilters.push({
      key: "bedrooms",
      label: `${filters.bedrooms}+ Bedrooms`,
    });
  }

  // Bathrooms
  if (filters.bathrooms) {
    activeFilters.push({
      key: "bathrooms",
      label: `${filters.bathrooms}+ Bathrooms`,
    });
  }

  // Price range
  if (
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 50000000000
  ) {
    const min = (filters.priceRange[0] / 1000000000).toFixed(1);
    const max = (filters.priceRange[1] / 1000000000).toFixed(1);
    activeFilters.push({
      key: "priceRange",
      label: `Price: IDR ${min}B - ${max}B`,
    });
  }

  // Area
  if (filters.minArea || filters.maxArea) {
    const parts = [];
    if (filters.minArea) parts.push(`min ${filters.minArea}m²`);
    if (filters.maxArea) parts.push(`max ${filters.maxArea}m²`);
    activeFilters.push({
      key: "minArea",
      label: `Area: ${parts.join(", ")}`,
    });
  }

  // Sort
  if (filters.sortBy && filters.sortBy !== "newest") {
    const sortLabels: Record<string, string> = {
      price_low: "Price: Low to High",
      price_high: "Price: High to Low",
      area_large: "Largest Area",
      popularity: "Most Popular",
    };
    activeFilters.push({
      key: "sortBy",
      label: `Sort: ${sortLabels[filters.sortBy] || filters.sortBy}`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border animate-in fade-in-50 slide-in-from-top-2 duration-300">
      <span className="text-xs font-medium text-muted-foreground">
        Active Filters:
      </span>
      {activeFilters.map((filter, index) => (
        <Badge
          key={`${filter.key}-${index}`}
          variant="secondary"
          className="gap-1.5 pr-1 pl-2.5 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors group"
        >
          <span className="text-xs font-medium">{filter.label}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveFilter(filter.key, filter.value)}
            className="h-4 w-4 p-0 hover:bg-primary/30 rounded-full ml-1"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive rounded-md"
        >
          <X className="h-3 w-3 mr-1" />
          Clear All
        </Button>
      )}
    </div>
  );
};
