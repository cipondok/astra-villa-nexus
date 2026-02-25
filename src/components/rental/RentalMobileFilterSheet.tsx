import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import RentalSidebarFilters from "./RentalSidebarFilters";
import type { AdvancedRentalFilters } from "./RentalSidebarFilters";

interface Props {
  filters: AdvancedRentalFilters;
  onFiltersChange: (updates: Partial<AdvancedRentalFilters>) => void;
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
    filters.province && filters.province !== "all" ? "prov" : "",
    filters.city !== "all" ? filters.city : "",
    filters.area ? "area" : "",
    filters.listingStatus && filters.listingStatus !== "all" ? "status" : "",
    filters.rentalPeriod.length > 0 ? "period" : "",
    filters.onlineBookingOnly ? "online" : "",
    filters.bedrooms !== "all" ? "bed" : "",
    filters.bathrooms !== "all" ? "bath" : "",
    filters.minPrice > 0 ? "minp" : "",
    filters.maxPrice < 100_000_000 ? "maxp" : "",
    filters.furnishing && filters.furnishing !== "all" ? "furn" : "",
    filters.minLandArea > 0 ? "mla" : "",
    filters.maxLandArea < 5000 ? "xla" : "",
    filters.minBuildingArea > 0 ? "mba" : "",
    filters.maxBuildingArea < 2000 ? "xba" : "",
    filters.floors && filters.floors !== "all" ? "fl" : "",
    filters.hasPool ? "pool" : "",
    filters.garageCount && filters.garageCount !== "all" ? "gar" : "",
    filters.viewType && filters.viewType !== "all" ? "view" : "",
    filters.minRoi > 0 ? "roi" : "",
    filters.minYield > 0 ? "yield" : "",
    filters.legalStatus && filters.legalStatus !== "all" ? "legal" : "",
    filters.foreignOwnershipFriendly ? "wna" : "",
    filters.paymentPlanAvailable ? "payplan" : "",
    filters.handoverYear && filters.handoverYear !== "all" ? "handover" : "",
    filters.has3DTour ? "3d" : "",
    filters.hasVR ? "vr" : "",
    filters.has360View ? "360" : "",
    filters.hasDroneVideo ? "drone" : "",
    filters.hasInteractiveFloorplan ? "floorplan" : "",
    (filters.nearbyFacilities || []).length > 0 ? "nearby" : "",
    filters.paymentMethod && filters.paymentMethod !== "all" ? "pay" : "",
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
