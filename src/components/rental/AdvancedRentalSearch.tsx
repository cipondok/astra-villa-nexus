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

  const handleRentalPeriodChange = (period: string, checked: boolean) => {
    const updatedPeriods = checked 
      ? [...filters.rentalPeriod, period]
      : filters.rentalPeriod.filter(p => p !== period);
    
    onFiltersChange({
      ...filters,
      rentalPeriod: updatedPeriods
    });
  };

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
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Sembunyikan' : 'Lanjutan'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Property Type Categories */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Kategori Properti</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {[
              { value: 'apartment', label: 'Apartemen', icon: Building, color: 'bg-blue-100 text-blue-800' },
              { value: 'house', label: 'Rumah', icon: Home, color: 'bg-green-100 text-green-800' },
              { value: 'shop', label: 'Toko', icon: Store, color: 'bg-orange-100 text-orange-800' },
              { value: 'kios', label: 'Kios', icon: Store, color: 'bg-yellow-100 text-yellow-800' },
              { value: 'office', label: 'Kantor', icon: Briefcase, color: 'bg-purple-100 text-purple-800' },
              { value: 'virtual_office', label: 'Virtual Office', icon: Monitor, color: 'bg-indigo-100 text-indigo-800' },
              { value: 'office_space', label: 'Office Space', icon: Building, color: 'bg-gray-100 text-gray-800' },
              { value: 'empty_land', label: 'Lahan Kosong', icon: Square, color: 'bg-emerald-100 text-emerald-800' },
              { value: 'business_place', label: 'Tempat Usaha', icon: Briefcase, color: 'bg-rose-100 text-rose-800' }
            ].map(type => (
              <div
                key={type.value}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  filters.propertyType === type.value 
                    ? `border-purple-500 ${type.color}` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onFiltersChange({
                  ...filters, 
                  propertyType: filters.propertyType === type.value ? 'all' : type.value
                })}
              >
                <type.icon className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <p className="text-xs text-center font-medium">{type.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Search */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari lokasi atau nama properti..."
              value={filters.searchTerm}
              onChange={(e) => onFiltersChange({...filters, searchTerm: e.target.value})}
              className="pl-10"
            />
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
            {(filters.rentalPeriod.length > 0 || filters.onlineBookingOnly || filters.checkInDate) && (
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