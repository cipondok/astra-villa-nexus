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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Search, MapPin, Home, Building2, Hotel, Store, Briefcase, Castle,
  CalendarIcon, Bed, Bath, Maximize2, Zap, Sofa, X, SlidersHorizontal, RotateCcw,
  ChevronDown, TrendingUp, ShieldCheck, Globe, CreditCard, Eye,
  Layers, Waves, Car, Mountain, TreePine, Landmark,
  Video, View, Box, Plane
} from "lucide-react";

export interface AdvancedRentalFilters {
  searchTerm: string;
  propertyType: string;
  province: string;
  city: string;
  area: string;
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
  furnishing: string;
  minArea: number;
  maxArea: number;
  // Indonesian specs
  minLandArea: number;
  maxLandArea: number;
  minBuildingArea: number;
  maxBuildingArea: number;
  floors: string;
  hasPool: boolean;
  garageCount: string;
  viewType: string;
  // Investment
  minRoi: number;
  maxRoi: number;
  minYield: number;
  maxYield: number;
  legalStatus: string;
  foreignOwnershipFriendly: boolean;
  paymentPlanAvailable: boolean;
  handoverYear: string;
  // Technology
  has3DTour: boolean;
  hasVR: boolean;
  has360View: boolean;
  hasDroneVideo: boolean;
  hasInteractiveFloorplan: boolean;
  // Status
  listingStatus: string;
}

interface RentalSidebarFiltersProps {
  filters: AdvancedRentalFilters;
  onFiltersChange: (updates: Partial<AdvancedRentalFilters>) => void;
  propertyTypes: string[];
  cities: string[];
  resultCount: number;
  className?: string;
}

const PROPERTY_TYPE_OPTIONS = [
  { value: "all", label: "Semua", icon: Home },
  { value: "villa", label: "Villa", icon: Castle },
  { value: "apartment", label: "Apartemen", icon: Building2 },
  { value: "house", label: "Rumah", icon: Home },
  { value: "land", label: "Tanah", icon: TreePine },
  { value: "commercial", label: "Komersial", icon: Store },
  { value: "kos", label: "Kos", icon: Hotel },
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
  { value: "semi", label: "Semi" },
  { value: "unfurnished", label: "Kosong" },
];

const LEGAL_STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "shm", label: "SHM (Hak Milik)" },
  { value: "hgb", label: "HGB (Hak Guna Bangunan)" },
  { value: "leasehold", label: "Leasehold" },
  { value: "strata", label: "Strata Title" },
  { value: "girik", label: "Girik" },
];

const VIEW_TYPE_OPTIONS = [
  { value: "all", label: "Semua", icon: Eye },
  { value: "ocean", label: "Ocean", icon: Waves },
  { value: "mountain", label: "Mountain", icon: Mountain },
  { value: "rice_field", label: "Rice Field", icon: TreePine },
  { value: "city", label: "City", icon: Building2 },
  { value: "garden", label: "Garden", icon: TreePine },
  { value: "pool", label: "Pool", icon: Waves },
];

const LISTING_STATUS_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "sale", label: "Dijual" },
  { value: "rent", label: "Disewa" },
  { value: "leasehold", label: "Leasehold" },
  { value: "freehold", label: "Freehold" },
  { value: "off-plan", label: "Off-Plan" },
];

const HANDOVER_YEARS = [
  { value: "all", label: "Semua" },
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028+" },
];

const formatPriceLabel = (val: number) => {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}Jt`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}Rb`;
  return String(val);
};

const FilterSection = ({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</span>
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pb-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
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
    filters.onlineBookingOnly ? "online" : "",
    filters.bedrooms !== "all" ? "bed" : "",
    filters.bathrooms !== "all" ? "bath" : "",
    filters.minPrice > 0 ? "minp" : "",
    filters.maxPrice < 100_000_000 ? "maxp" : "",
    filters.furnishing !== "all" ? "furn" : "",
    filters.listingStatus !== "all" ? "status" : "",
    filters.legalStatus !== "all" ? "legal" : "",
    filters.viewType !== "all" ? "view" : "",
    filters.hasPool ? "pool" : "",
    filters.foreignOwnershipFriendly ? "wna" : "",
    filters.paymentPlanAvailable ? "payment" : "",
    filters.has3DTour ? "3d" : "",
    filters.hasVR ? "vr" : "",
    filters.has360View ? "360" : "",
    filters.hasDroneVideo ? "drone" : "",
    filters.hasInteractiveFloorplan ? "floor" : "",
    filters.minRoi > 0 ? "roi" : "",
    filters.minYield > 0 ? "yield" : "",
    filters.minLandArea > 0 ? "lt" : "",
    filters.minBuildingArea > 0 ? "lb" : "",
  ].filter(Boolean).length;

  const handleClearAll = () => {
    onFiltersChange({
      searchTerm: "", propertyType: "all", province: "all", city: "all", area: "",
      priceRange: "all", rentalPeriod: [], checkInDate: undefined, checkOutDate: undefined,
      onlineBookingOnly: false, minimumDays: 0, bedrooms: "all", bathrooms: "all",
      minPrice: 0, maxPrice: 100_000_000, furnishing: "all", minArea: 0, maxArea: 1000,
      minLandArea: 0, maxLandArea: 5000, minBuildingArea: 0, maxBuildingArea: 2000,
      floors: "all", hasPool: false, garageCount: "all", viewType: "all",
      minRoi: 0, maxRoi: 50, minYield: 0, maxYield: 30,
      legalStatus: "all", foreignOwnershipFriendly: false, paymentPlanAvailable: false,
      handoverYear: "all", has3DTour: false, hasVR: false, has360View: false,
      hasDroneVideo: false, hasInteractiveFloorplan: false, listingStatus: "all",
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
            <span className="font-semibold text-sm text-foreground">Advanced Filter</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1">
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{resultCount.toLocaleString()} properti ditemukan</p>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="p-4 space-y-1">

          {/* ─── BASIC FILTERS ─── */}
          <FilterSection title="Pencarian" icon={Search} defaultOpen>
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
          </FilterSection>

          <Separator />

          {/* Location */}
          <FilterSection title="Lokasi" icon={MapPin} defaultOpen>
            <Select value={filters.province} onValueChange={v => onFiltersChange({ province: v, city: "all" })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Provinsi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Provinsi</SelectItem>
                <SelectItem value="bali">Bali</SelectItem>
                <SelectItem value="jakarta">DKI Jakarta</SelectItem>
                <SelectItem value="jawa_barat">Jawa Barat</SelectItem>
                <SelectItem value="jawa_timur">Jawa Timur</SelectItem>
                <SelectItem value="ntt">NTT (Lombok)</SelectItem>
                <SelectItem value="yogyakarta">Yogyakarta</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.city} onValueChange={v => onFiltersChange({ city: v })}>
              <SelectTrigger className="h-9 text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Kota / Kabupaten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kota</SelectItem>
                {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              placeholder="Area / Kecamatan..."
              value={filters.area || ""}
              onChange={e => onFiltersChange({ area: e.target.value })}
              className="h-9 text-sm"
            />
          </FilterSection>

          <Separator />

          {/* Status */}
          <FilterSection title="Status Listing" icon={Landmark} defaultOpen>
            <div className="flex flex-wrap gap-1.5">
              {LISTING_STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onFiltersChange({ listingStatus: opt.value })}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    filters.listingStatus === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FilterSection>

          <Separator />

          {/* Property Type */}
          <FilterSection title="Tipe Properti" icon={Home} defaultOpen>
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
          </FilterSection>

          <Separator />

          {/* Price */}
          <FilterSection title="Harga" icon={CreditCard} defaultOpen>
            <Slider
              min={0} max={100_000_000} step={500_000}
              value={[filters.minPrice, filters.maxPrice]}
              onValueChange={([min, max]) => onFiltersChange({ minPrice: min, maxPrice: max })}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Rp {formatPriceLabel(filters.minPrice)}</span>
              <span>Rp {formatPriceLabel(filters.maxPrice)}</span>
            </div>
          </FilterSection>

          <Separator />

          {/* Rental Period */}
          <FilterSection title="Periode Sewa" icon={CalendarIcon}>
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
            {/* Check-in / Check-out */}
            <div className="grid grid-cols-2 gap-2 mt-2">
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
          </FilterSection>

          <Separator />

          {/* ─── INDONESIAN SPECS ─── */}
          <FilterSection title="Spesifikasi Properti" icon={Layers}>
            {/* Bedrooms */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Bed className="h-3 w-3" /> KT (Kamar Tidur)</Label>
              <div className="flex gap-1">
                {["all", "1", "2", "3", "4", "5+"].map(v => (
                  <button key={v} onClick={() => onFiltersChange({ bedrooms: v })} className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                    filters.bedrooms === v ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}>{v === "all" ? "All" : v}</button>
                ))}
              </div>
            </div>

            {/* Bathrooms */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Bath className="h-3 w-3" /> KM (Kamar Mandi)</Label>
              <div className="flex gap-1">
                {["all", "1", "2", "3", "4+"].map(v => (
                  <button key={v} onClick={() => onFiltersChange({ bathrooms: v })} className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                    filters.bathrooms === v ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}>{v === "all" ? "All" : v}</button>
                ))}
              </div>
            </div>

            {/* LT - Land Area */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Maximize2 className="h-3 w-3" /> LT (Luas Tanah m²)</Label>
              <Slider min={0} max={5000} step={50} value={[filters.minLandArea, filters.maxLandArea]} onValueChange={([min, max]) => onFiltersChange({ minLandArea: min, maxLandArea: max })} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{filters.minLandArea} m²</span>
                <span>{filters.maxLandArea} m²</span>
              </div>
            </div>

            {/* LB - Building Area */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> LB (Luas Bangunan m²)</Label>
              <Slider min={0} max={2000} step={25} value={[filters.minBuildingArea, filters.maxBuildingArea]} onValueChange={([min, max]) => onFiltersChange({ minBuildingArea: min, maxBuildingArea: max })} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{filters.minBuildingArea} m²</span>
                <span>{filters.maxBuildingArea} m²</span>
              </div>
            </div>

            {/* Floors */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Layers className="h-3 w-3" /> Lantai</Label>
              <div className="flex gap-1">
                {["all", "1", "2", "3", "4+"].map(v => (
                  <button key={v} onClick={() => onFiltersChange({ floors: v })} className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                    filters.floors === v ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}>{v === "all" ? "All" : v}</button>
                ))}
              </div>
            </div>

            {/* Pool / Garage */}
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground flex items-center gap-1.5"><Waves className="h-3.5 w-3.5 text-primary" /> Kolam Renang</Label>
              <Switch checked={filters.hasPool} onCheckedChange={v => onFiltersChange({ hasPool: v })} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Car className="h-3 w-3" /> Garasi</Label>
              <div className="flex gap-1">
                {["all", "1", "2", "3+"].map(v => (
                  <button key={v} onClick={() => onFiltersChange({ garageCount: v })} className={cn(
                    "flex-1 py-1.5 rounded-md text-xs font-medium border transition-colors",
                    filters.garageCount === v ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}>{v === "all" ? "All" : v}</button>
                ))}
              </div>
            </div>

            {/* View Type */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Mountain className="h-3 w-3" /> Pemandangan</Label>
              <div className="flex flex-wrap gap-1.5">
                {VIEW_TYPE_OPTIONS.map(opt => {
                  const VIcon = opt.icon;
                  return (
                    <button key={opt.value} onClick={() => onFiltersChange({ viewType: opt.value })} className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors",
                      filters.viewType === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
                    )}>
                      <VIcon className="h-3 w-3" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Furnishing */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><Sofa className="h-3 w-3" /> Perabotan</Label>
              <div className="flex flex-wrap gap-1.5">
                {FURNISHING_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => onFiltersChange({ furnishing: opt.value })} className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    filters.furnishing === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}>{opt.label}</button>
                ))}
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* ─── INVESTMENT FILTERS ─── */}
          <FilterSection title="Investasi" icon={TrendingUp}>
            {/* ROI */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">ROI (%)</Label>
              <Slider min={0} max={50} step={1} value={[filters.minRoi, filters.maxRoi]} onValueChange={([min, max]) => onFiltersChange({ minRoi: min, maxRoi: max })} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{filters.minRoi}%</span>
                <span>{filters.maxRoi}%</span>
              </div>
            </div>

            {/* Rental Yield */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Rental Yield (%)</Label>
              <Slider min={0} max={30} step={0.5} value={[filters.minYield, filters.maxYield]} onValueChange={([min, max]) => onFiltersChange({ minYield: min, maxYield: max })} />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{filters.minYield}%</span>
                <span>{filters.maxYield}%</span>
              </div>
            </div>

            {/* Legal Status */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Status Hukum</Label>
              <Select value={filters.legalStatus} onValueChange={v => onFiltersChange({ legalStatus: v })}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LEGAL_STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Foreign Ownership */}
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-primary" /> WNA Friendly</Label>
              <Switch checked={filters.foreignOwnershipFriendly} onCheckedChange={v => onFiltersChange({ foreignOwnershipFriendly: v })} />
            </div>

            {/* Payment Plan */}
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-primary" /> Cicilan Tersedia</Label>
              <Switch checked={filters.paymentPlanAvailable} onCheckedChange={v => onFiltersChange({ paymentPlanAvailable: v })} />
            </div>

            {/* Handover Year */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Tahun Serah Terima</Label>
              <div className="flex flex-wrap gap-1.5">
                {HANDOVER_YEARS.map(opt => (
                  <button key={opt.value} onClick={() => onFiltersChange({ handoverYear: opt.value })} className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    filters.handoverYear === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"
                  )}>{opt.label}</button>
                ))}
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* ─── TECHNOLOGY FILTERS ─── */}
          <FilterSection title="Teknologi" icon={Box}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground flex items-center gap-1.5"><Box className="h-3.5 w-3.5 text-primary" /> 3D Virtual Tour</Label>
                <Switch checked={filters.has3DTour} onCheckedChange={v => onFiltersChange({ has3DTour: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground flex items-center gap-1.5"><View className="h-3.5 w-3.5 text-primary" /> VR Ready</Label>
                <Switch checked={filters.hasVR} onCheckedChange={v => onFiltersChange({ hasVR: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-primary" /> 360° View</Label>
                <Switch checked={filters.has360View} onCheckedChange={v => onFiltersChange({ has360View: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground flex items-center gap-1.5"><Video className="h-3.5 w-3.5 text-primary" /> Drone Video</Label>
                <Switch checked={filters.hasDroneVideo} onCheckedChange={v => onFiltersChange({ hasDroneVideo: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground flex items-center gap-1.5"><Plane className="h-3.5 w-3.5 text-primary" /> Floor Plan Interaktif</Label>
                <Switch checked={filters.hasInteractiveFloorplan} onCheckedChange={v => onFiltersChange({ hasInteractiveFloorplan: v })} />
              </div>
            </div>
          </FilterSection>

          <Separator />

          {/* Online Booking */}
          <div className="flex items-center justify-between py-2">
            <Label className="text-sm text-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-chart-1" /> Online Booking
            </Label>
            <Switch checked={filters.onlineBookingOnly} onCheckedChange={v => onFiltersChange({ onlineBookingOnly: v })} />
          </div>

          <div className="pt-2 pb-4">
            <Button variant="default" className="w-full h-10" onClick={handleClearAll}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset Semua Filter
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default RentalSidebarFilters;
