/**
 * Faceted Filter Panel - Shows filter options with live counts
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  X, 
  Home, 
  Building2, 
  MapPin,
  Bed,
  Bath,
  Maximize,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { getCurrencyFormatterShort } from "@/stores/currencyStore";

export interface FacetedFilters {
  listingType?: string;
  propertyTypes: string[];
  cities: string[];
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  priceRange: [number, number];
  areaRange: [number, number];
}

interface FacetCount {
  value: string;
  count: number;
}

interface FacetedFilterPanelProps {
  filters: FacetedFilters;
  onFiltersChange: (filters: FacetedFilters) => void;
  className?: string;
}

const defaultFilters: FacetedFilters = {
  listingType: undefined,
  propertyTypes: [],
  cities: [],
  minBedrooms: undefined,
  maxBedrooms: undefined,
  minBathrooms: undefined,
  priceRange: [0, 100000000000],
  areaRange: [0, 10000]
};

const FacetedFilterPanel = ({
  filters,
  onFiltersChange,
  className
}: FacetedFilterPanelProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    listingType: true,
    propertyType: true,
    location: true,
    bedrooms: false,
    price: false,
    area: false
  });

  // Fetch facet counts for property types
  const { data: propertyTypeFacets = [] } = useQuery({
    queryKey: ['facets-property-type', filters.listingType],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('property_type')
        .eq('status', 'active')
        .eq('approval_status', 'approved');

      if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }

      const { data } = await query;
      const counts = new Map<string, number>();
      (data || []).forEach(p => {
        if (p.property_type) {
          counts.set(p.property_type, (counts.get(p.property_type) || 0) + 1);
        }
      });
      
      return Array.from(counts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 60000
  });

  // Fetch facet counts for listing types
  const { data: listingTypeFacets = [] } = useQuery({
    queryKey: ['facets-listing-type'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('listing_type')
        .eq('status', 'active')
        .eq('approval_status', 'approved');
      
      const counts = new Map<string, number>();
      (data || []).forEach(p => {
        if (p.listing_type) {
          counts.set(p.listing_type, (counts.get(p.listing_type) || 0) + 1);
        }
      });
      
      return Array.from(counts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 60000
  });

  // Fetch facet counts for cities
  const { data: cityFacets = [] } = useQuery({
    queryKey: ['facets-city', filters.listingType, filters.propertyTypes],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('city')
        .eq('status', 'active')
        .eq('approval_status', 'approved');

      if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }
      if (filters.propertyTypes.length > 0) {
        query = query.in('property_type', filters.propertyTypes);
      }

      const { data } = await query;
      const counts = new Map<string, number>();
      (data || []).forEach(p => {
        if (p.city) {
          counts.set(p.city, (counts.get(p.city) || 0) + 1);
        }
      });
      
      return Array.from(counts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);
    },
    staleTime: 60000
  });

  // Fetch bedroom facets
  const { data: bedroomFacets = [] } = useQuery({
    queryKey: ['facets-bedrooms', filters.listingType, filters.propertyTypes],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('bedrooms')
        .eq('status', 'active')
        .eq('approval_status', 'approved');

      if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }
      if (filters.propertyTypes.length > 0) {
        query = query.in('property_type', filters.propertyTypes);
      }

      const { data } = await query;
      const counts = new Map<number, number>();
      (data || []).forEach(p => {
        if (p.bedrooms !== null) {
          counts.set(p.bedrooms, (counts.get(p.bedrooms) || 0) + 1);
        }
      });
      
      return Array.from(counts.entries())
        .map(([value, count]) => ({ value: String(value), count }))
        .sort((a, b) => Number(a.value) - Number(b.value));
    },
    staleTime: 60000
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const togglePropertyType = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    onFiltersChange({ ...filters, propertyTypes: newTypes });
  };

  const toggleCity = (city: string) => {
    const newCities = filters.cities.includes(city)
      ? filters.cities.filter(c => c !== city)
      : [...filters.cities, city];
    onFiltersChange({ ...filters, cities: newCities });
  };

  const setListingType = (type: string | undefined) => {
    onFiltersChange({ ...filters, listingType: type === filters.listingType ? undefined : type });
  };

  const clearAllFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const activeFilterCount = [
    filters.listingType,
    filters.propertyTypes.length > 0,
    filters.cities.length > 0,
    filters.minBedrooms,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100000000000,
    filters.areaRange[0] > 0 || filters.areaRange[1] < 10000
  ].filter(Boolean).length;

  const formatPrice = (price: number) => {
    if (price >= 1000000000) return `${(price / 1000000000).toFixed(0)}B`;
    if (price >= 1000000) return `${(price / 1000000).toFixed(0)}M`;
    return price.toLocaleString();
  };

  const getPropertyTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      house: <Home className="h-4 w-4" />,
      apartment: <Building2 className="h-4 w-4" />,
      villa: <Home className="h-4 w-4" />,
      land: <Maximize className="h-4 w-4" />,
    };
    return icons[type.toLowerCase()] || <Home className="h-4 w-4" />;
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear all
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
          <div className="space-y-4">
            {/* Listing Type */}
            <Collapsible open={openSections.listingType} onOpenChange={() => toggleSection('listingType')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium text-sm">Listing Type</span>
                {openSections.listingType ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {listingTypeFacets.map(facet => (
                  <button
                    key={facet.value}
                    onClick={() => setListingType(facet.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                      filters.listingType === facet.value
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    <span className="capitalize">{facet.value.replace('_', ' ')}</span>
                    <Badge variant={filters.listingType === facet.value ? "secondary" : "outline"} className="text-xs">
                      {facet.count}
                    </Badge>
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Property Type */}
            <Collapsible open={openSections.propertyType} onOpenChange={() => toggleSection('propertyType')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium text-sm">Property Type</span>
                {openSections.propertyType ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-1">
                {propertyTypeFacets.map(facet => (
                  <div key={facet.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`pt-${facet.value}`}
                      checked={filters.propertyTypes.includes(facet.value)}
                      onCheckedChange={() => togglePropertyType(facet.value)}
                    />
                    <Label
                      htmlFor={`pt-${facet.value}`}
                      className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {getPropertyTypeIcon(facet.value)}
                        <span className="capitalize">{facet.value.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{facet.count}</Badge>
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Location */}
            <Collapsible open={openSections.location} onOpenChange={() => toggleSection('location')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium text-sm">Location</span>
                {openSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-1">
                {cityFacets.map(facet => (
                  <div key={facet.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`city-${facet.value}`}
                      checked={filters.cities.includes(facet.value)}
                      onCheckedChange={() => toggleCity(facet.value)}
                    />
                    <Label
                      htmlFor={`city-${facet.value}`}
                      className="flex-1 flex items-center justify-between text-sm cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{facet.value}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{facet.count}</Badge>
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Bedrooms */}
            <Collapsible open={openSections.bedrooms} onOpenChange={() => toggleSection('bedrooms')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium text-sm">Bedrooms</span>
                {openSections.bedrooms ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="flex flex-wrap gap-2">
                  {bedroomFacets.slice(0, 6).map(facet => (
                    <button
                      key={facet.value}
                      onClick={() => onFiltersChange({
                        ...filters,
                        minBedrooms: filters.minBedrooms === Number(facet.value) ? undefined : Number(facet.value)
                      })}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors",
                        filters.minBedrooms === Number(facet.value)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-accent border-border"
                      )}
                    >
                      <Bed className="h-3 w-3" />
                      {facet.value}+
                      <span className="text-xs opacity-70">({facet.count})</span>
                    </button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Price Range */}
            <Collapsible open={openSections.price} onOpenChange={() => toggleSection('price')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium text-sm">Price Range</span>
                {openSections.price ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <Slider
                  value={[filters.priceRange[0] / 1000000000, filters.priceRange[1] / 1000000000]}
                  onValueChange={([min, max]) => 
                    onFiltersChange({ ...filters, priceRange: [min * 1000000000, max * 1000000000] })
                  }
                  min={0}
                  max={100}
                  step={0.5}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{getCurrencyFormatterShort()(filters.priceRange[0])}</span>
                  <span>{getCurrencyFormatterShort()(filters.priceRange[1])}</span>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Area Range */}
            <Collapsible open={openSections.area} onOpenChange={() => toggleSection('area')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
                <span className="font-medium text-sm">Area (m²)</span>
                {openSections.area ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                <Slider
                  value={filters.areaRange}
                  onValueChange={([min, max]) => 
                    onFiltersChange({ ...filters, areaRange: [min, max] })
                  }
                  min={0}
                  max={10000}
                  step={50}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{filters.areaRange[0]} m²</span>
                  <span>{filters.areaRange[1]} m²</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export { defaultFilters as defaultFacetedFilters };
export default FacetedFilterPanel;
