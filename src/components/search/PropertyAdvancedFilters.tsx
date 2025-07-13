
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Filter, Search, MapPin, Home, DollarSign, Bed, Bath, Square } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatIDR } from '@/utils/currency';

interface PropertyAdvancedFiltersProps {
  language: "en" | "id";
  onFiltersChange: (filters: any) => void;
  onSearch: (searchData: any) => void;
  initialFilters?: any;
}

const PropertyAdvancedFilters = ({ 
  language, 
  onFiltersChange, 
  onSearch, 
  initialFilters = {} 
}: PropertyAdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  
  const [filters, setFilters] = useState({
    propertyType: initialFilters.propertyType || 'all',
    listingType: initialFilters.listingType || 'all',
    priceRange: initialFilters.priceRange || [0, 20000000000],
    bedrooms: initialFilters.bedrooms || 'all',
    bathrooms: initialFilters.bathrooms || 'all',
    areaRange: initialFilters.areaRange || [0, 2000],
    location: initialFilters.location || '',
    state: initialFilters.state || '',
    city: initialFilters.city || '',
    developmentStatus: initialFilters.developmentStatus || 'all',
    features: initialFilters.features || [],
    amenities: initialFilters.amenities || [],
    furnishing: initialFilters.furnishing || 'all',
    parking: initialFilters.parking || 'all',
    floorLevel: initialFilters.floorLevel || 'all',
    buildingAge: initialFilters.buildingAge || 'all',
    certification: initialFilters.certification || [],
    has3D: initialFilters.has3D || false,
    hasVirtualTour: initialFilters.hasVirtualTour || false,
    sortBy: initialFilters.sortBy || 'newest',
    ...initialFilters
  });

  const text = {
    en: {
      search: "Search properties, location, or developer...",
      advancedFilters: "Advanced Filters",
      propertyType: "Property Type",
      listingType: "Listing Type",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      areaRange: "Area (sqm)",
      location: "Location",
      state: "State/Province",
      city: "City",
      developmentStatus: "Development Status",
      features: "Property Features",
      amenities: "Amenities",
      furnishing: "Furnishing",
      parking: "Parking",
      floorLevel: "Floor Level",
      buildingAge: "Building Age",
      certification: "Certifications",
      searchBtn: "Search Properties",
      clearFilters: "Clear All",
      sortBy: "Sort By",
      any: "Any",
      // Property Types
      house: "House",
      apartment: "Apartment",
      villa: "Villa",
      townhouse: "Townhouse",
      condo: "Condo",
      land: "Land",
      commercial: "Commercial",
      // Listing Types
      sale: "For Sale",
      rent: "For Rent",
      lease: "For Lease",
      // Development Status
      completed: "Completed",
      underConstruction: "Under Construction",
      planned: "Planned",
      // Features
      pool: "Swimming Pool",
      gym: "Gym/Fitness Center",
      garden: "Garden",
      balcony: "Balcony/Terrace",
      garage: "Garage",
      security: "24/7 Security",
      elevator: "Elevator",
      aircon: "Air Conditioning",
      // Amenities
      nearSchool: "Near School",
      nearHospital: "Near Hospital",
      nearMall: "Near Shopping Mall",
      nearTransport: "Near Public Transport",
      nearBeach: "Near Beach",
      // Furnishing
      furnished: "Fully Furnished",
      semiFurnished: "Semi Furnished",
      unfurnished: "Unfurnished",
      // Parking
      noParking: "No Parking",
      oneSpace: "1 Parking Space",
      twoSpaces: "2+ Parking Spaces",
      // Floor Level
      groundFloor: "Ground Floor",
      lowFloor: "Low Floor (1-5)",
      midFloor: "Mid Floor (6-15)",
      highFloor: "High Floor (16+)",
      penthouse: "Penthouse",
      // Building Age
      newBuilding: "New (0-2 years)",
      recent: "Recent (3-10 years)",
      established: "Established (11-20 years)",
      mature: "Mature (20+ years)",
      // Certifications
      greenBuilding: "Green Building",
      halal: "Halal Certified",
      fireLife: "Fire & Life Safety",
      // Sort Options
      newest: "Newest First",
      oldest: "Oldest First",
      priceLowHigh: "Price: Low to High",
      priceHighLow: "Price: High to Low",
      areaLargeSmall: "Area: Large to Small",
      areaSmallLarge: "Area: Small to Large"
    },
    id: {
      search: "Cari properti, lokasi, atau pengembang...",
      advancedFilters: "Filter Lanjutan",
      propertyType: "Jenis Properti",
      listingType: "Tipe Listing",
      priceRange: "Rentang Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      areaRange: "Luas (sqm)",
      location: "Lokasi",
      state: "Provinsi",
      city: "Kota",
      developmentStatus: "Status Pembangunan",
      features: "Fitur Properti",
      amenities: "Fasilitas",
      furnishing: "Perabotan",
      parking: "Parkir",
      floorLevel: "Tingkat Lantai",
      buildingAge: "Usia Bangunan",
      certification: "Sertifikasi",
      searchBtn: "Cari Properti",
      clearFilters: "Hapus Semua",
      sortBy: "Urutkan",
      any: "Semua",
      // Property Types
      house: "Rumah",
      apartment: "Apartemen",
      villa: "Villa",
      townhouse: "Rumah Teres",
      condo: "Kondominium",
      land: "Tanah",
      commercial: "Komersial",
      // Listing Types
      sale: "Dijual",
      rent: "Disewa",
      lease: "Disewakan",
      // Development Status
      completed: "Selesai",
      underConstruction: "Dalam Pembangunan",
      planned: "Direncanakan",
      // Features
      pool: "Kolam Renang",
      gym: "Gym/Pusat Kebugaran",
      garden: "Taman",
      balcony: "Balkon/Teras",
      garage: "Garasi",
      security: "Keamanan 24/7",
      elevator: "Lift",
      aircon: "AC",
      // Amenities
      nearSchool: "Dekat Sekolah",
      nearHospital: "Dekat Rumah Sakit",
      nearMall: "Dekat Mall",
      nearTransport: "Dekat Transportasi Umum",
      nearBeach: "Dekat Pantai",
      // Furnishing
      furnished: "Furnished Lengkap",
      semiFurnished: "Semi Furnished",
      unfurnished: "Tidak Furnished",
      // Parking
      noParking: "Tanpa Parkir",
      oneSpace: "1 Tempat Parkir",
      twoSpaces: "2+ Tempat Parkir",
      // Floor Level
      groundFloor: "Lantai Dasar",
      lowFloor: "Lantai Rendah (1-5)",
      midFloor: "Lantai Menengah (6-15)",
      highFloor: "Lantai Tinggi (16+)",
      penthouse: "Penthouse",
      // Building Age
      newBuilding: "Baru (0-2 tahun)",
      recent: "Terbaru (3-10 tahun)",
      established: "Mapan (11-20 tahun)",
      mature: "Matang (20+ tahun)",
      // Certifications
      greenBuilding: "Green Building",
      halal: "Bersertifikat Halal",
      fireLife: "Keselamatan Kebakaran",
      // Sort Options
      newest: "Terbaru",
      oldest: "Terlama",
      priceLowHigh: "Harga: Rendah ke Tinggi",
      priceHighLow: "Harga: Tinggi ke Rendah",
      areaLargeSmall: "Luas: Besar ke Kecil",
      areaSmallLarge: "Luas: Kecil ke Besar"
    }
  };

  const currentText = text[language];

  const propertyTypes = [
    { value: 'house', label: currentText.house },
    { value: 'apartment', label: currentText.apartment },
    { value: 'villa', label: currentText.villa },
    { value: 'townhouse', label: currentText.townhouse },
    { value: 'condo', label: currentText.condo },
    { value: 'land', label: currentText.land },
    { value: 'commercial', label: currentText.commercial },
  ];

  const listingTypes = [
    { value: 'sale', label: currentText.sale },
    { value: 'rent', label: currentText.rent },
    { value: 'lease', label: currentText.lease },
  ];

  const developmentStatuses = [
    { value: 'completed', label: currentText.completed },
    { value: 'under_construction', label: currentText.underConstruction },
    { value: 'planned', label: currentText.planned },
  ];

  const availableFeatures = [
    'pool', 'gym', 'garden', 'balcony', 'garage', 'security', 'elevator', 'aircon'
  ];

  const availableAmenities = [
    'nearSchool', 'nearHospital', 'nearMall', 'nearTransport', 'nearBeach'
  ];

  const availableCertifications = [
    'greenBuilding', 'halal', 'fireLife'
  ];

  const indonesianStates = [
    "DKI Jakarta", "West Java", "East Java", "Central Java", "Bali", "North Sumatra",
    "South Sumatra", "West Sumatra", "Riau", "South Kalimantan", "East Kalimantan",
    "North Sulawesi", "South Sulawesi", "West Nusa Tenggara", "East Nusa Tenggara"
  ];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayToggle = (key: string, item: string) => {
    const currentArray = filters[key as keyof typeof filters] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(f => f !== item)
      : [...currentArray, item];
    handleFilterChange(key, newArray);
  };

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      ...filters
    });
  };

  const clearFilters = () => {
    const clearedFilters = {
      propertyType: 'all',
      listingType: 'all',
      priceRange: [0, 20000000000],
      bedrooms: 'all',
      bathrooms: 'all',
      areaRange: [0, 2000],
      location: '',
      state: '',
      city: '',
      developmentStatus: 'all',
      features: [],
      amenities: [],
      furnishing: 'all',
      parking: 'all',
      floorLevel: 'all',
      buildingAge: 'all',
      certification: [],
      has3D: false,
      hasVirtualTour: false,
      sortBy: 'newest'
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.propertyType !== 'all') count++;
    if (filters.listingType !== 'all') count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 20000000000) count++;
    if (filters.bedrooms !== 'all') count++;
    if (filters.bathrooms !== 'all') count++;
    if (filters.areaRange[0] > 0 || filters.areaRange[1] < 2000) count++;
    if (filters.location) count++;
    if (filters.state) count++;
    if (filters.city) count++;
    if (filters.developmentStatus !== 'all') count++;
    if (filters.features.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.furnishing !== 'all') count++;
    if (filters.parking !== 'all') count++;
    if (filters.floorLevel !== 'all') count++;
    if (filters.buildingAge !== 'all') count++;
    if (filters.certification.length > 0) count++;
    if (filters.has3D) count++;
    if (filters.hasVirtualTour) count++;
    return count;
  };

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters]);

  return (
    <Card className="w-full min-h-[60vh] xl:min-h-[70vh]">
      <CardHeader className="pb-6 xl:pb-8">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg xl:text-xl">
            <Search className="h-5 w-5 xl:h-6 xl:w-6" />
            Property Search
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} filters active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="xl:h-10 xl:px-4"
            >
              <Filter className="h-4 w-4 mr-2" />
              {currentText.advancedFilters}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 xl:space-y-8 pb-8 xl:pb-12">
        {/* Main Search */}
        <div className="flex gap-3 xl:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 xl:h-5 xl:w-5" />
            <Input
              placeholder={currentText.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 xl:pl-12 h-10 xl:h-12 text-base xl:text-lg"
            />
          </div>
          <Button onClick={handleSearch} className="px-6 xl:px-8 h-10 xl:h-12 text-base xl:text-lg">
            <Search className="h-4 w-4 mr-2 xl:h-5 xl:w-5" />
            {currentText.searchBtn}
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3 xl:gap-4">
          <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
            <SelectTrigger className="w-40 xl:w-48 h-10 xl:h-12">
              <Home className="h-4 w-4 mr-2 xl:h-5 xl:w-5" />
              <SelectValue placeholder={currentText.propertyType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{currentText.any}</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.listingType} onValueChange={(value) => handleFilterChange('listingType', value)}>
            <SelectTrigger className="w-40 xl:w-48 h-10 xl:h-12">
              <DollarSign className="h-4 w-4 mr-2 xl:h-5 xl:w-5" />
              <SelectValue placeholder={currentText.listingType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{currentText.any}</SelectItem>
              {listingTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
            <SelectTrigger className="w-32 xl:w-40 h-10 xl:h-12">
              <Bed className="h-4 w-4 mr-2 xl:h-5 xl:w-5" />
              <SelectValue placeholder={currentText.bedrooms} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{currentText.any}</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.bathrooms} onValueChange={(value) => handleFilterChange('bathrooms', value)}>
            <SelectTrigger className="w-32 xl:w-40 h-10 xl:h-12">
              <Bath className="h-4 w-4 mr-2 xl:h-5 xl:w-5" />
              <SelectValue placeholder={currentText.bathrooms} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{currentText.any}</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-8 xl:space-y-10 pt-6 xl:pt-8 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location Filters */}
              <div className="space-y-2">
                <Label className="font-medium">{currentText.location}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={currentText.location}
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">{currentText.state}</Label>
                <Select value={filters.state} onValueChange={(value) => handleFilterChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={currentText.state} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{currentText.any}</SelectItem>
                    {indonesianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">{currentText.developmentStatus}</Label>
                <Select value={filters.developmentStatus} onValueChange={(value) => handleFilterChange('developmentStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={currentText.developmentStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{currentText.any}</SelectItem>
                    {developmentStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <Label className="font-medium">{currentText.priceRange}</Label>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value)}
                  max={20000000000}
                  min={0}
                  step={100000000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{formatIDR(filters.priceRange[0])}</span>
                  <span>{formatIDR(filters.priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Area Range */}
            <div className="space-y-3">
              <Label className="font-medium">{currentText.areaRange}</Label>
              <div className="px-2">
                <Slider
                  value={filters.areaRange}
                  onValueChange={(value) => handleFilterChange('areaRange', value)}
                  max={2000}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{filters.areaRange[0]} sqm</span>
                  <span>{filters.areaRange[1]} sqm</span>
                </div>
              </div>
            </div>

            {/* Property Features */}
            <div className="space-y-3">
              <Label className="font-medium">{currentText.features}</Label>
              <div className="flex flex-wrap gap-2">
                {availableFeatures.map((feature) => (
                  <Badge
                    key={feature}
                    variant={filters.features.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleArrayToggle('features', feature)}
                  >
                    {currentText[feature as keyof typeof currentText]}
                    {filters.features.includes(feature) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label className="font-medium">{currentText.amenities}</Label>
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={filters.amenities.includes(amenity) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleArrayToggle('amenities', amenity)}
                  >
                    {currentText[amenity as keyof typeof currentText]}
                    {filters.amenities.includes(amenity) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">{currentText.furnishing}</Label>
                <Select value={filters.furnishing} onValueChange={(value) => handleFilterChange('furnishing', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{currentText.any}</SelectItem>
                    <SelectItem value="furnished">{currentText.furnished}</SelectItem>
                    <SelectItem value="semi_furnished">{currentText.semiFurnished}</SelectItem>
                    <SelectItem value="unfurnished">{currentText.unfurnished}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">{currentText.parking}</Label>
                <Select value={filters.parking} onValueChange={(value) => handleFilterChange('parking', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{currentText.any}</SelectItem>
                    <SelectItem value="none">{currentText.noParking}</SelectItem>
                    <SelectItem value="one">{currentText.oneSpace}</SelectItem>
                    <SelectItem value="multiple">{currentText.twoSpaces}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">{currentText.floorLevel}</Label>
                <Select value={filters.floorLevel} onValueChange={(value) => handleFilterChange('floorLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{currentText.any}</SelectItem>
                    <SelectItem value="ground">{currentText.groundFloor}</SelectItem>
                    <SelectItem value="low">{currentText.lowFloor}</SelectItem>
                    <SelectItem value="mid">{currentText.midFloor}</SelectItem>
                    <SelectItem value="high">{currentText.highFloor}</SelectItem>
                    <SelectItem value="penthouse">{currentText.penthouse}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">{currentText.buildingAge}</Label>
                <Select value={filters.buildingAge} onValueChange={(value) => handleFilterChange('buildingAge', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{currentText.any}</SelectItem>
                    <SelectItem value="new">{currentText.newBuilding}</SelectItem>
                    <SelectItem value="recent">{currentText.recent}</SelectItem>
                    <SelectItem value="established">{currentText.established}</SelectItem>
                    <SelectItem value="mature">{currentText.mature}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Special Features */}
            <div className="space-y-3">
              <Label className="font-medium">Special Features</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.has3D}
                    onCheckedChange={(checked) => handleFilterChange('has3D', checked)}
                  />
                  <Label className="text-sm">3D Virtual Tour</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.hasVirtualTour}
                    onCheckedChange={(checked) => handleFilterChange('hasVirtualTour', checked)}
                  />
                  <Label className="text-sm">Virtual Reality Tour</Label>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-3">
              <Label className="font-medium">{currentText.certification}</Label>
              <div className="flex flex-wrap gap-2">
                {availableCertifications.map((cert) => (
                  <Badge
                    key={cert}
                    variant={filters.certification.includes(cert) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleArrayToggle('certification', cert)}
                  >
                    {currentText[cert as keyof typeof currentText]}
                    {filters.certification.includes(cert) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label className="font-medium">{currentText.sortBy}</Label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{currentText.newest}</SelectItem>
                  <SelectItem value="oldest">{currentText.oldest}</SelectItem>
                  <SelectItem value="price_low_high">{currentText.priceLowHigh}</SelectItem>
                  <SelectItem value="price_high_low">{currentText.priceHighLow}</SelectItem>
                  <SelectItem value="area_large_small">{currentText.areaLargeSmall}</SelectItem>
                  <SelectItem value="area_small_large">{currentText.areaSmallLarge}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSearch} className="flex-1">
                <Search className="h-4 w-4 mr-2" />
                {currentText.searchBtn}
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                {currentText.clearFilters}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default PropertyAdvancedFilters;
