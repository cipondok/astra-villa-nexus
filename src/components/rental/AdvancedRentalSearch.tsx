import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Filter,
  MapPin,
  Home,
  Clock,
  Settings,
  Building,
  Store,
  Briefcase,
  Monitor,
  Square
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

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
  propertyTypes,
  cities,
  loading
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleSearchNearMe = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        onFiltersChange({
          ...filters,
          nearMe: true,
          userLocation,
          searchTerm: "Lokasi Saya"
        });
        
        setGettingLocation(false);
        // Trigger search automatically
        setTimeout(() => onSearch(), 100);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = "Tidak dapat mengakses lokasi Anda";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Izin akses lokasi ditolak. Mohon aktifkan izin lokasi untuk browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Informasi lokasi tidak tersedia.";
            break;
          case error.TIMEOUT:
            errorMessage = "Permintaan lokasi timeout.";
            break;
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleRentalPeriodChange = (period: string, checked: boolean) => {
    const updatedPeriods = checked 
      ? [...filters.rentalPeriod, period]
      : filters.rentalPeriod.filter(p => p !== period);
    
    onFiltersChange({
      ...filters,
      rentalPeriod: updatedPeriods
    });
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
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

  // Clear all filters
  const clearAllFilters = () => {
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
      nearMe: false,
      userLocation: null
    });
  };

  const activeFiltersCount = getActiveFiltersCount();

  const rentalPeriods = [
    { value: 'daily', label: 'Sewa Harian', icon: '📅' },
    { value: 'weekly', label: 'Sewa Mingguan', icon: '📆' },
    { value: 'monthly', label: 'Sewa Bulanan', icon: '🗓️' },
    { value: 'yearly', label: 'Sewa Tahunan', icon: '📊' }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Pencarian Properti Sewa
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-800">
                {activeFiltersCount} Filter
              </Badge>
            )}
          </span>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Hapus Semua
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Sembunyikan' : 'Lanjutan'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Property Type Categories */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Kategori Properti</Label>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-2">
            {[
              { value: 'apartment', label: 'Apartemen', icon: Building, color: 'hover:bg-blue-50 border-blue-200', description: 'Unit apartemen untuk sewa harian, mingguan, atau bulanan' },
              { value: 'house', label: 'Rumah', icon: Home, color: 'hover:bg-green-50 border-green-200', description: 'Rumah tinggal lengkap dengan fasilitas keluarga' },
              { value: 'shop', label: 'Toko', icon: Store, color: 'hover:bg-orange-50 border-orange-200', description: 'Ruang toko untuk keperluan retail dan penjualan' },
              { value: 'kios', label: 'Kios', icon: Store, color: 'hover:bg-yellow-50 border-yellow-200', description: 'Kios kecil untuk usaha dagang dan jual beli' },
              { value: 'office', label: 'Kantor', icon: Briefcase, color: 'hover:bg-purple-50 border-purple-200', description: 'Ruang kantor untuk kegiatan bisnis dan administrasi' },
              { value: 'virtual_office', label: 'Virtual Office', icon: Monitor, color: 'hover:bg-indigo-50 border-indigo-200', description: 'Alamat bisnis virtual dengan layanan administrasi' },
              { value: 'office_space', label: 'Office Space', icon: Building, color: 'hover:bg-slate-50 border-slate-200', description: 'Ruang kerja fleksibel dan co-working space' },
              { value: 'empty_land', label: 'Lahan Kosong', icon: Square, color: 'hover:bg-emerald-50 border-emerald-200', description: 'Tanah kosong untuk berbagai keperluan pengembangan' },
              { value: 'business_place', label: 'Tempat Usaha', icon: Briefcase, color: 'hover:bg-rose-50 border-rose-200', description: 'Lokasi strategis untuk berbagai jenis usaha' }
            ].map(type => (
              <div
                key={type.value}
                className={`group relative p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
                  filters.propertyType === type.value 
                    ? 'border-primary bg-primary/10 shadow-sm' 
                    : `border-gray-200 ${type.color}`
                }`}
                onClick={() => onFiltersChange({
                  ...filters, 
                  propertyType: filters.propertyType === type.value ? 'all' : type.value
                })}
                title={type.description}
              >
                <type.icon className={`h-4 w-4 mx-auto mb-1 transition-colors ${
                  filters.propertyType === type.value ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <p className={`text-xs text-center font-medium leading-tight ${
                  filters.propertyType === type.value ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {type.label}
                </p>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                  {type.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Search */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari lokasi atau nama properti..."
                value={filters.searchTerm}
                onChange={(e) => onFiltersChange({...filters, searchTerm: e.target.value})}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={handleSearchNearMe}
              disabled={loading || gettingLocation}
              className="px-4 whitespace-nowrap"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {gettingLocation ? 'Mencari...' : filters.nearMe ? 'Sekitar Saya ✓' : 'Cari Sekitar'}
            </Button>
          </div>

          {/* Location Selection */}
          <LocationSelector
            selectedProvince={filters.province}
            selectedCity={filters.city}
            onProvinceChange={(province) => onFiltersChange({...filters, province})}
            onCityChange={(city) => onFiltersChange({...filters, city})}
          />

          <Button 
            onClick={onSearch}
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            <Filter className="h-4 w-4 mr-2" />
            {loading ? 'Mencari...' : 'Cari'}
          </Button>
        </div>

        {/* Rental Period Selection */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Periode Sewa</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rentalPeriods.map(period => (
              <div key={period.value} className="flex items-center space-x-2">
                <Checkbox
                  id={period.value}
                  checked={filters.rentalPeriod.includes(period.value)}
                  onCheckedChange={(checked) => 
                    handleRentalPeriodChange(period.value, checked as boolean)
                  }
                />
                <Label htmlFor={period.value} className="text-sm cursor-pointer">
                  {period.icon} {period.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold mb-2 block">Tanggal Check-in</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.checkInDate ? (
                    format(filters.checkInDate, "dd MMMM yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal masuk</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.checkInDate}
                  onSelect={(date) => onFiltersChange({...filters, checkInDate: date})}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-sm font-semibold mb-2 block">Tanggal Check-out</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.checkOutDate ? (
                    format(filters.checkOutDate, "dd MMMM yyyy", { locale: id })
                  ) : (
                    <span>Pilih tanggal keluar</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.checkOutDate}
                  onSelect={(date) => onFiltersChange({...filters, checkOutDate: date})}
                  disabled={(date) => 
                    date < new Date() || 
                    (filters.checkInDate && date <= filters.checkInDate)
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Filter Lanjutan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select 
                value={filters.priceRange} 
                onValueChange={(value) => onFiltersChange({...filters, priceRange: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kisaran Harga" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Harga</SelectItem>
                  <SelectItem value="under-1m">Di bawah Rp 1 Jt</SelectItem>
                  <SelectItem value="1m-5m">Rp 1-5 Jt</SelectItem>
                  <SelectItem value="5m-10m">Rp 5-10 Jt</SelectItem>
                  <SelectItem value="10m-20m">Rp 10-20 Jt</SelectItem>
                  <SelectItem value="over-20m">Di atas Rp 20 Jt</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <Label className="text-sm font-semibold mb-2 block">Minimum Hari Sewa</Label>
                <Input
                  type="number"
                  placeholder="Misal: 7"
                  value={filters.minimumDays}
                  onChange={(e) => onFiltersChange({
                    ...filters, 
                    minimumDays: parseInt(e.target.value) || 0
                  })}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="online-booking"
                  checked={filters.onlineBookingOnly}
                  onCheckedChange={(checked) => 
                    onFiltersChange({...filters, onlineBookingOnly: checked as boolean})
                  }
                />
                <Label htmlFor="online-booking" className="text-sm cursor-pointer">
                  🏠 Booking Online via ASTRA Villa saja
                </Label>
              </div>
            </div>

            {/* Current Active Filters */}
            {(filters.rentalPeriod.length > 0 || filters.onlineBookingOnly || filters.checkInDate || filters.nearMe) && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">Filter Aktif:</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.rentalPeriod.map(period => {
                    const periodInfo = rentalPeriods.find(p => p.value === period);
                    return (
                      <Badge key={period} variant="secondary" className="bg-purple-100 text-purple-800">
                        {periodInfo?.icon} {periodInfo?.label}
                      </Badge>
                    );
                  })}
                   {filters.nearMe && (
                     <Badge variant="secondary" className="bg-green-100 text-green-800">
                       📍 Sekitar Saya
                     </Badge>
                   )}
                   {filters.onlineBookingOnly && (
                     <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                       🏠 Online Booking
                     </Badge>
                   )}
                  {filters.checkInDate && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      📅 {format(filters.checkInDate, "dd MMM", { locale: id })}
                      {filters.checkOutDate && ` - ${format(filters.checkOutDate, "dd MMM", { locale: id })}`}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedRentalSearch;