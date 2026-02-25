import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Search, MapPin, Home, Building2, Hotel, Store, Briefcase, Castle,
  CalendarIcon, Bed, Bath, Maximize2, Zap, Sofa, X, SlidersHorizontal, RotateCcw
} from "lucide-react";

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

interface RentalSidebarFiltersProps {
  filters: RentalFilters;
  onFiltersChange: (updates: Partial<RentalFilters>) => void;
  propertyTypes: string[];
  cities: string[];
  resultCount: number;
  className?: string;
}

const PROPERTY_TYPE_OPTIONS = [
  { value: "all", label: "Semua", icon: Home },
  { value: "apartment", label: "Apartemen", icon: Building2 },
  { value: "house", label: "Rumah", icon: Home },
  { value: "villa", label: "Villa", icon: Castle },
  { value: "kos", label: "Kos", icon: Hotel },
  { value: "kios", label: "Kios", icon: Store },
  { value: "office", label: "Kantor", icon: Briefcase },
];

const RENTAL_PERIODS = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "yearly", label: "Tahunan" },
];

const FURNISHING_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "furnished", label: "Furnished" },
  { value: "semi", label: "Semi Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

const formatPriceLabel = (val: number) => {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}Jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}Rb`;
  return String(val);
};

const RentalSidebarFilters = ({
  filters, onFiltersChange, propertyTypes, cities, resultCount, className,
}: RentalSidebarFiltersProps) => {
  const activeFilterCount = [
    filters.searchTerm,
    filters.propertyType !== "all" ? filters.propertyType : "",
    filters.city !== "all" ? filters.city : "",
    filters.rentalPeriod.length > 0 ? "period" : "",
    filters.checkInDate ? "checkin" : "",
    filters.checkOutDate ? "checkout" : "",
    filters.onlineBookingOnly ? "online" : "",
    filters.bedrooms !== "all" ? "bed" : "",
    filters.bathrooms !== "all" ? "bath" : "",
    filters.minPrice > 0 ? "minp" : "",
    filters.maxPrice < 100_000_000 ? "maxp" : "",
    filters.furnishing && filters.furnishing !== "all" ? "furn" : "",
  ].filter(Boolean).length;

  const handleClearAll = () => {
    onFiltersChange({
      searchTerm: "",
      propertyType: "all",
      province: "all",
      city: "all",
      priceRange: "all",
      rentalPeriod: [],
      checkInDate: undefined,
      checkOutDate: undefined,
      onlineBookingOnly: false,
      minimumDays: 0,
      bedrooms: "all",
      bathrooms: "all",
      minPrice: 0,
      maxPrice: 100_000_000,
      furnishing: "all",
      minArea: 0,
      maxArea: 1000,
    });
  };

  const toggleRentalPeriod = (period: string) => {
    const current = filters.rentalPeriod;
    const updated = current.includes(period)
      ? current.filter(p => p !== period)
      : [...current, period];
    onFiltersChange({ rentalPeriod: updated });
  };

  return (
    <div className={cn("bg-card border border-border rounded-xl overflow-hidden", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">Filter</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{resultCount} properti ditemukan</p>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-4 space-y-5">
          {/* Search */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pencarian</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari lokasi, nama properti..."
                value={filters.searchTerm}
                onChange={e => onFiltersChange({ searchTerm: e.target.value })}
                className="pl-9 h-9 text-sm"
              />
              {filters.searchTerm && (
                <Button variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => onFiltersChange({ searchTerm: "" })}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lokasi</Label>
            <Select value={filters.city} onValueChange={v => onFiltersChange({ city: v })}>
              <SelectTrigger className="h-9 text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Pilih kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kota</SelectItem>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Property Type Chips */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipe Properti</Label>
            <div className="flex flex-wrap gap-1.5">
              {PROPERTY_TYPE_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = filters.propertyType === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => onFiltersChange({ propertyType: opt.value })}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Price Range Slider */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Harga / Bulan</Label>
            <Slider
              min={0}
              max={100_000_000}
              step={500_000}
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={([min, max]) => onFiltersChange({ minPrice: min, maxPrice: max })}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rp {formatPriceLabel(filters.minPrice)}</span>
              <span>Rp {formatPriceLabel(filters.maxPrice)}</span>
            </div>
          </div>

          <Separator />

          {/* Rental Period */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Periode Sewa</Label>
            <div className="space-y-2">
              {RENTAL_PERIODS.map(rp => (
                <label key={rp.value} className="flex items-center gap-2 cursor-pointer group">
                  <Checkbox
                    checked={filters.rentalPeriod.includes(rp.value)}
                    onCheckedChange={() => toggleRentalPeriod(rp.value)}
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{rp.label}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          {/* Check-in / Check-out */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tanggal</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 text-xs justify-start", !filters.checkInDate && "text-muted-foreground")}>
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {filters.checkInDate ? format(filters.checkInDate, "dd/MM") : "Check-in"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filters.checkInDate} onSelect={d => onFiltersChange({ checkInDate: d })} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("h-9 text-xs justify-start", !filters.checkOutDate && "text-muted-foreground")}>
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {filters.checkOutDate ? format(filters.checkOutDate, "dd/MM") : "Check-out"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filters.checkOutDate} onSelect={d => onFiltersChange({ checkOutDate: d })} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Bed className="h-3 w-3" /> Kamar Tidur
            </Label>
            <div className="flex gap-1.5">
              {["all", "1", "2", "3", "4", "5+"].map(v => (
                <button
                  key={v}
                  onClick={() => onFiltersChange({ bedrooms: v })}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                    filters.bedrooms === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}
                >
                  {v === "all" ? "All" : v}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Bath className="h-3 w-3" /> Kamar Mandi
            </Label>
            <div className="flex gap-1.5">
              {["all", "1", "2", "3", "4+"].map(v => (
                <button
                  key={v}
                  onClick={() => onFiltersChange({ bathrooms: v })}
                  className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                    filters.bathrooms === v
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}
                >
                  {v === "all" ? "All" : v}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Area Range */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Maximize2 className="h-3 w-3" /> Luas (m²)
            </Label>
            <Slider
              min={0}
              max={1000}
              step={10}
              value={[filters.minArea || 0, filters.maxArea || 1000]}
              onValueChange={([min, max]) => onFiltersChange({ minArea: min, maxArea: max })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filters.minArea || 0} m²</span>
              <span>{filters.maxArea || 1000} m²</span>
            </div>
          </div>

          <Separator />

          {/* Online Booking Toggle */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-foreground flex items-center gap-1.5 cursor-pointer">
              <Zap className="h-3.5 w-3.5 text-chart-1" />
              Online Booking
            </Label>
            <Switch
              checked={filters.onlineBookingOnly}
              onCheckedChange={v => onFiltersChange({ onlineBookingOnly: v })}
            />
          </div>

          <Separator />

          {/* Furnishing */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sofa className="h-3 w-3" /> Perabotan
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {FURNISHING_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onFiltersChange({ furnishing: opt.value })}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    (filters.furnishing || "all") === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 pb-4">
            <Button variant="default" className="w-full h-10" onClick={handleClearAll}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Semua Filter
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default RentalSidebarFilters;
