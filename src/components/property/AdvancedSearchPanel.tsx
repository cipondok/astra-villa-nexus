import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  MapPin, 
  Home, 
  Building, 
  Bed, 
  Bath, 
  Square, 
  Filter,
  X,
  SlidersHorizontal,
  Calendar,
  TrendingUp,
  Star,
  Zap
} from "lucide-react";

interface SearchFilters {
  searchTerm: string;
  propertyType: string;
  city: string;
  area: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
  minArea: number;
  maxArea: number;
  yearBuilt: string;
  condition: string;
  features: string[];
  sortBy: string;
}

interface AdvancedSearchPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  propertyTypes: string[];
  cities: string[];
  areas: string[];
}

const propertyFeatures = [
  { id: 'parking', label: 'Parkir', icon: '🚗' },
  { id: 'swimming_pool', label: 'Kolam Renang', icon: '🏊' },
  { id: 'gym', label: 'Gym/Fitness', icon: '💪' },
  { id: 'garden', label: 'Taman', icon: '🌿' },
  { id: 'balcony', label: 'Balkon', icon: '🏡' },
  { id: 'security', label: 'Keamanan 24h', icon: '🔒' },
  { id: 'elevator', label: 'Lift', icon: '🏢' },
  { id: 'furnished', label: 'Furnished', icon: '🛋️' },
];

const sortOptions = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_low', label: 'Harga Terendah' },
  { value: 'price_high', label: 'Harga Tertinggi' },
  { value: 'area_large', label: 'Luas Terbesar' },
  { value: 'most_viewed', label: 'Paling Dilihat' },
];

export const AdvancedSearchPanel = ({
  filters,
  onFiltersChange,
  onSearch,
  propertyTypes,
  cities,
  areas
}: AdvancedSearchPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState([filters.minPrice / 1000000, filters.maxPrice / 1000000]);
  const [areaRange, setAreaRange] = useState([filters.minArea, filters.maxArea]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleFeatureToggle = (featureId: string) => {
    const newFeatures = filters.features.includes(featureId)
      ? filters.features.filter(f => f !== featureId)
      : [...filters.features, featureId];
    updateFilter('features', newFeatures);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: '',
      propertyType: '',
      city: '',
      area: '',
      minPrice: 0,
      maxPrice: 10000000000,
      bedrooms: '',
      bathrooms: '',
      minArea: 0,
      maxArea: 1000,
      yearBuilt: '',
      condition: '',
      features: [],
      sortBy: 'newest'
    });
    setPriceRange([0, 10000]);
    setAreaRange([0, 1000]);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `${price / 1000} M`;
    return `${price} Jt`;
  };

  const activeFiltersCount = [
    filters.propertyType,
    filters.city,
    filters.area,
    filters.bedrooms,
    filters.bathrooms,
    filters.yearBuilt,
    filters.condition,
    ...filters.features
  ].filter(Boolean).length + 
  (filters.minPrice > 0 || filters.maxPrice < 10000000000 ? 1 : 0) +
  (filters.minArea > 0 || filters.maxArea < 1000 ? 1 : 0);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Search className="h-5 w-5 text-blue-600" />
            Pencarian Properti Dijual
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {activeFiltersCount} filter aktif
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              {isExpanded ? 'Tutup' : 'Lanjutan'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="search" className="text-sm font-medium text-gray-700">
              Cari Properti
            </Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Masukkan lokasi, nama properti, atau developer..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Tipe Properti</Label>
            <Select value={filters.propertyType} onValueChange={(value) => updateFilter('propertyType', value)}>
              <SelectTrigger className="h-11 mt-1 border-gray-200">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Kota</Label>
            <Select value={filters.city} onValueChange={(value) => updateFilter('city', value)}>
              <SelectTrigger className="h-11 mt-1 border-gray-200">
                <SelectValue placeholder="Pilih Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kota</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t border-gray-200">
            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Kisaran Harga: Rp {formatPrice(priceRange[0])} - Rp {formatPrice(priceRange[1])}
              </Label>
              <div className="mt-3">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => {
                    setPriceRange(value);
                    updateFilter('minPrice', value[0] * 1000000);
                    updateFilter('maxPrice', value[1] * 1000000);
                  }}
                  max={10000}
                  min={0}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Rp 0</span>
                  <span>Rp 10+ M</span>
                </div>
              </div>
            </div>

            {/* Area & Bedrooms/Bathrooms */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Area</Label>
                <Select value={filters.area} onValueChange={(value) => updateFilter('area', value)}>
                  <SelectTrigger className="h-11 mt-1">
                    <SelectValue placeholder="Pilih Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Area</SelectItem>
                    {areas.map(area => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Bed className="h-4 w-4" />
                  Kamar Tidur
                </Label>
                <Select value={filters.bedrooms} onValueChange={(value) => updateFilter('bedrooms', value)}>
                  <SelectTrigger className="h-11 mt-1">
                    <SelectValue placeholder="Jumlah KT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="1">1 KT</SelectItem>
                    <SelectItem value="2">2 KT</SelectItem>
                    <SelectItem value="3">3 KT</SelectItem>
                    <SelectItem value="4">4 KT</SelectItem>
                    <SelectItem value="5+">5+ KT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  Kamar Mandi
                </Label>
                <Select value={filters.bathrooms} onValueChange={(value) => updateFilter('bathrooms', value)}>
                  <SelectTrigger className="h-11 mt-1">
                    <SelectValue placeholder="Jumlah KM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="1">1 KM</SelectItem>
                    <SelectItem value="2">2 KM</SelectItem>
                    <SelectItem value="3">3 KM</SelectItem>
                    <SelectItem value="4+">4+ KM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Urutkan</Label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="h-11 mt-1">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Area Size Range */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Square className="h-4 w-4" />
                Luas Bangunan: {areaRange[0]} - {areaRange[1]} m²
              </Label>
              <div className="mt-3">
                <Slider
                  value={areaRange}
                  onValueChange={(value) => {
                    setAreaRange(value);
                    updateFilter('minArea', value[0]);
                    updateFilter('maxArea', value[1]);
                  }}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 m²</span>
                  <span>1000+ m²</span>
                </div>
              </div>
            </div>

            {/* Property Features */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                <Star className="h-4 w-4" />
                Fasilitas Properti
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {propertyFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.id}
                      checked={filters.features.includes(feature.id)}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                    <Label
                      htmlFor={feature.id}
                      className="text-sm font-normal cursor-pointer flex items-center gap-1"
                    >
                      <span>{feature.icon}</span>
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Tahun Dibangun
                </Label>
                <Select value={filters.yearBuilt} onValueChange={(value) => updateFilter('yearBuilt', value)}>
                  <SelectTrigger className="h-11 mt-1">
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Tahun</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                    <SelectItem value="2019-2015">2015-2019</SelectItem>
                    <SelectItem value="2014-2010">2010-2014</SelectItem>
                    <SelectItem value="below-2010">Sebelum 2010</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  Kondisi Properti
                </Label>
                <Select value={filters.condition} onValueChange={(value) => updateFilter('condition', value)}>
                  <SelectTrigger className="h-11 mt-1">
                    <SelectValue placeholder="Kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kondisi</SelectItem>
                    <SelectItem value="baru">Baru/Belum Ditempati</SelectItem>
                    <SelectItem value="bagus">Kondisi Bagus</SelectItem>
                    <SelectItem value="terawat">Terawat</SelectItem>
                    <SelectItem value="perlu_renovasi">Perlu Renovasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Hapus Semua Filter
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={onSearch}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-2.5 font-medium"
            >
              <Search className="h-4 w-4 mr-2" />
              Cari Properti
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};