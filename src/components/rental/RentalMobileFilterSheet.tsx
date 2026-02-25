import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import RentalSidebarFilters from "./RentalSidebarFilters";

interface RentalFilters {
  searchTerm: string;
  propertyType: string;
  province: string;
  city: string;
  priceRange: string;
  rentalPeriod: string[];
  checkInDate: Date | undefined;
  checkOutDate: Date | undefined;
  onlineBookingOnly: boolean;
  minimumDays: number;
  nearMe: boolean;
  userLocation: { lat: number; lng: number } | null;
  bedrooms: string;
  bathrooms: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  furnishing?: string;
  minArea?: number;
  maxArea?: number;
}

interface Props {
  filters: RentalFilters;
  onFiltersChange: (updates: Partial<RentalFilters>) => void;
  propertyTypes: string[];
  cities: string[];
  resultCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RentalMobileFilterSheet = ({ filters, onFiltersChange, propertyTypes, cities, resultCount, open, onOpenChange }: Props) => {
  const activeFilterCount = [
    filters.searchTerm,
    filters.propertyType !== "all" ? filters.propertyType : "",
    filters.city !== "all" ? filters.city : "",
    filters.rentalPeriod.length > 0 ? "period" : "",
    filters.onlineBookingOnly ? "online" : "",
    filters.bedrooms !== "all" ? "bed" : "",
    filters.bathrooms !== "all" ? "bath" : "",
    filters.minPrice > 0 ? "minp" : "",
    filters.maxPrice < 100_000_000 ? "maxp" : "",
  ].filter(Boolean).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden h-8 gap-1.5 text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
          {activeFilterCount > 0 && (
            <Badge variant="default" className="h-4 px-1 text-[10px] ml-0.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Filter Properti</SheetTitle>
          <SheetDescription>Atur filter pencarian properti sewa</SheetDescription>
        </SheetHeader>
        <RentalSidebarFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          propertyTypes={propertyTypes}
          cities={cities}
          resultCount={resultCount}
        />
      </SheetContent>
    </Sheet>
  );
};

export default RentalMobileFilterSheet;
