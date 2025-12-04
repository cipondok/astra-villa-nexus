import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import LocationSelector from "@/components/location/LocationSelector";
import { 
  Search, 
  Calendar as CalendarIcon,
  SlidersHorizontal,
  MapPin,
  Home,
  X,
  Building,
  Store,
  Briefcase,
  Monitor,
  Square,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

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
}

interface AdvancedRentalSearchProps {
  filters: RentalFilters;
  onFiltersChange: (filters: RentalFilters) => void;
  onSearch: () => void;
  propertyTypes: string[];
  cities: string[];
  loading: boolean;
}

const AdvancedRentalSearch: React.FC<AdvancedRentalSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  loading
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleSearchNearMe = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung oleh browser Anda');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onFiltersChange({
          ...filters,
          nearMe: true,
          userLocation: { lat: position.coords.latitude, lng: position.coords.longitude },
          searchTerm: "Lokasi Saya"
        });
        setGettingLocation(false);
        setTimeout(() => onSearch(), 100);
      },
      () => setGettingLocation(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleRentalPeriodChange = (period: string, checked: boolean) => {
    const updatedPeriods = checked 
      ? [...filters.rentalPeriod, period]
      : filters.rentalPeriod.filter(p => p !== period);
    onFiltersChange({ ...filters, rentalPeriod: updatedPeriods });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.propertyType !== 'all') count++;
    if (filters.province !== 'all') count++;
    if (filters.city !== 'all') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.rentalPeriod.length > 0) count++;
    if (filters.checkInDate) count++;
    if (filters.checkOutDate) count++;
    if (filters.onlineBookingOnly) count++;
    if (filters.minimumDays > 0) count++;
    if (filters.nearMe) count++;
    return count;
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: filters.searchTerm,
      propertyType: "all",
      province: "all",
      city: "all",
      priceRange: "all",
      rentalPeriod: [],
      checkInDate: undefined,
      checkOutDate: undefined,
      onlineBookingOnly: false,
      minimumDays: 0,
      nearMe: false,
      userLocation: null
    });
  };

  const activeFiltersCount = getActiveFiltersCount();

  const rentalPeriods = [
    { value: 'daily', label: 'Harian' },
    { value: 'weekly', label: 'Mingguan' },
    { value: 'monthly', label: 'Bulanan' },
    { value: 'yearly', label: 'Tahunan' }
  ];

  const propertyTypeOptions = [
    { value: 'apartment', label: 'Apartemen', icon: Building },
    { value: 'house', label: 'Rumah', icon: Home },
    { value: 'shop', label: 'Toko', icon: Store },
    { value: 'kios', label: 'Kios', icon: Store },
    { value: 'office', label: 'Kantor', icon: Briefcase },
    { value: 'virtual_office', label: 'Virtual Office', icon: Monitor },
    { value: 'office_space', label: 'Office Space', icon: Building },
    { value: 'empty_land', label: 'Lahan Kosong', icon: Square },
    { value: 'business_place', label: 'Tempat Usaha', icon: Briefcase }
  ];

  return (
    <div className="space-y-2">
      {/* Slim Search Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari properti..."
            value={filters.searchTerm}
            onChange={(e) => onFiltersChange({...filters, searchTerm: e.target.value})}
            className="pl-8 h-9 text-sm bg-input border-primary/20 focus:border-primary focus:ring-primary/30"
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        
        {/* Filter Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-9 px-3 border-primary/30 ${showFilters ? 'bg-primary/10 text-primary' : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Near Me Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleSearchNearMe}
          disabled={loading || gettingLocation}
          className={`h-9 px-3 border-primary/30 ${filters.nearMe ? 'bg-green-500/10 text-green-600 border-green-500/30' : ''}`}
        >
          <MapPin className="h-4 w-4" />
        </Button>

        {/* Search Button */}
        <Button 
          onClick={onSearch}
          size="sm"
          className="h-9 px-4 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
          disabled={loading}
        >
          <Search className="h-4 w-4 mr-1.5" />
          {loading ? '...' : 'Cari'}
        </Button>
      </div>

      {/* Collapsible Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 space-y-3 border-t border-primary/10 mt-2">
              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Hapus Filter
                  </Button>
                </div>
              )}

              {/* Property Type Grid */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipe Properti</Label>
                <div className="flex flex-wrap gap-1.5">
                  {propertyTypeOptions.map(type => (
                    <button
                      key={type.value}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
                        filters.propertyType === type.value 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                      onClick={() => onFiltersChange({
                        ...filters, 
                        propertyType: filters.propertyType === type.value ? 'all' : type.value
                      })}
                    >
                      <type.icon className="h-3 w-3" />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location & Price Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <LocationSelector
                  selectedProvince={filters.province}
                  selectedCity={filters.city}
                  onProvinceChange={(province) => onFiltersChange({...filters, province})}
                  onCityChange={(city) => onFiltersChange({...filters, city})}
                />
              </div>

              {/* Price & Period Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Select 
                  value={filters.priceRange} 
                  onValueChange={(value) => onFiltersChange({...filters, priceRange: value})}
                >
                  <SelectTrigger className="h-8 text-xs bg-popover border-border">
                    <SelectValue placeholder="Harga" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="all">Semua Harga</SelectItem>
                    <SelectItem value="under-1m">&lt; Rp 1 Jt</SelectItem>
                    <SelectItem value="1m-5m">Rp 1-5 Jt</SelectItem>
                    <SelectItem value="5m-10m">Rp 5-10 Jt</SelectItem>
                    <SelectItem value="10m-20m">Rp 10-20 Jt</SelectItem>
                    <SelectItem value="over-20m">&gt; Rp 20 Jt</SelectItem>
                  </SelectContent>
                </Select>

                {rentalPeriods.map(period => (
                  <button
                    key={period.value}
                    className={`h-8 px-2 rounded-md text-xs transition-all flex items-center justify-center ${
                      filters.rentalPeriod.includes(period.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                    onClick={() => handleRentalPeriodChange(period.value, !filters.rentalPeriod.includes(period.value))}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Date Pickers Row */}
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 text-xs justify-start bg-popover border-border">
                      <CalendarIcon className="mr-1.5 h-3 w-3" />
                      {filters.checkInDate ? format(filters.checkInDate, "dd/MM/yy") : "Check-in"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.checkInDate}
                      onSelect={(date) => onFiltersChange({...filters, checkInDate: date})}
                      disabled={(date) => date < new Date()}
                      className="p-2"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 text-xs justify-start bg-popover border-border">
                      <CalendarIcon className="mr-1.5 h-3 w-3" />
                      {filters.checkOutDate ? format(filters.checkOutDate, "dd/MM/yy") : "Check-out"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.checkOutDate}
                      onSelect={(date) => onFiltersChange({...filters, checkOutDate: date})}
                      disabled={(date) => date < new Date() || (filters.checkInDate && date <= filters.checkInDate)}
                      className="p-2"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Online Booking Only */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="online-booking"
                  checked={filters.onlineBookingOnly}
                  onCheckedChange={(checked) => onFiltersChange({...filters, onlineBookingOnly: checked as boolean})}
                  className="h-4 w-4"
                />
                <Label htmlFor="online-booking" className="text-xs cursor-pointer text-muted-foreground">
                  Online Booking saja
                </Label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedRentalSearch;
