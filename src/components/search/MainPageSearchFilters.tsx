
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, MapPin, Home, DollarSign, Bed, Bath, Filter, X, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface MainPageSearchFiltersProps {
  language: "en" | "id";
  onSearch: (filters: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
  activeTab?: "buy" | "rent";
}

const MainPageSearchFilters = ({ language, onSearch, onLiveSearch, activeTab = "buy" }: MainPageSearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    listingType: '',
    priceMin: '',
    priceMax: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [] as string[],
    // Rental-specific filters
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    rentalDuration: '',
    tripPurpose: '',
  });

  const text = {
    en: {
      searchPlaceholder: "Search by location, property type, or keywords...",
      location: "Location",
      propertyType: "Property Type",
      listingType: "Listing Type",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      amenities: "Amenities",
      search: "Search Properties",
      advancedFilters: "Advanced Filters",
      clearAll: "Clear All",
      from: "From",
      to: "To",
      any: "Any",
      forSale: "For Sale",
      forRent: "For Rent",
      villa: "Villa",
      apartment: "Apartment",
      house: "House",
      townhouse: "Townhouse",
      land: "Land",
      pool: "Swimming Pool",
      garage: "Garage",
      garden: "Garden",
      security: "Security",
      gym: "Gym",
      furnished: "Furnished",
      wifi: "WiFi",
      ac: "Air Conditioning",
      parking: "Parking",
      laundry: "Laundry",
      kitchen: "Kitchen",
      petsAllowed: "Pets Allowed",
      // Rental-specific text
      checkIn: "Check-in Date",
      checkOut: "Check-out Date",
      rentalDuration: "Rental Duration",
      tripPurpose: "Trip Purpose",
      selectDate: "Select Date",
      days: "days",
      solo: "Solo Trip",
      business: "Business",
      family: "Family",
      group: "Group Trip",
      couple: "Couple",
      other: "Other",
      month: "month",
      months: "months"
    },
    id: {
      searchPlaceholder: "Cari berdasarkan lokasi, jenis properti, atau kata kunci...",
      location: "Lokasi",
      propertyType: "Jenis Properti",
      listingType: "Tipe Listing",
      priceRange: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      amenities: "Fasilitas",
      search: "Cari Properti",
      advancedFilters: "Filter Lanjutan",
      clearAll: "Hapus Semua",
      from: "Dari",
      to: "Sampai",
      any: "Semua",
      forSale: "Dijual",
      forRent: "Disewa",
      villa: "Villa",
      apartment: "Apartemen",
      house: "Rumah",
      townhouse: "Rumah Teres",
      land: "Tanah",
      pool: "Kolam Renang",
      garage: "Garasi",
      garden: "Taman",
      security: "Keamanan",
      gym: "Gym",
      furnished: "Furnished",
      wifi: "WiFi",
      ac: "AC",
      parking: "Parkir",
      laundry: "Laundry",
      kitchen: "Dapur",
      petsAllowed: "Hewan Peliharaan Diizinkan",
      // Rental-specific text
      checkIn: "Tanggal Masuk",
      checkOut: "Tanggal Keluar",
      rentalDuration: "Durasi Sewa",
      tripPurpose: "Tujuan Perjalanan",
      selectDate: "Pilih Tanggal",
      days: "hari",
      solo: "Perjalanan Solo",
      business: "Bisnis",
      family: "Keluarga",
      group: "Perjalanan Grup",
      couple: "Pasangan",
      other: "Lainnya",
      month: "bulan",
      months: "bulan"
    }
  };

  const currentText = text[language];

  // Property types based on active tab - exclude land for rent
  const getAllPropertyTypes = () => [
    { value: 'villa', label: currentText.villa, icon: '🏖️' },
    { value: 'apartment', label: currentText.apartment, icon: '🏢' },
    { value: 'house', label: currentText.house, icon: '🏠' },
    { value: 'townhouse', label: currentText.townhouse, icon: '🏘️' },
    { value: 'land', label: currentText.land, icon: '🌿' },
  ];

  const propertyTypes = activeTab === "rent" 
    ? getAllPropertyTypes().filter(type => type.value !== 'land') // No land for rent
    : getAllPropertyTypes();

  const listingTypes = [
    { value: 'sale', label: currentText.forSale, icon: '💰' },
    { value: 'rent', label: currentText.forRent, icon: '🔑' },
  ];

  // Amenities based on active tab - different for rent vs sale
  const saleAmenities = [
    { value: 'pool', label: currentText.pool, icon: '🏊' },
    { value: 'garage', label: currentText.garage, icon: '🚗' },
    { value: 'garden', label: currentText.garden, icon: '🌳' },
    { value: 'security', label: currentText.security, icon: '🛡️' },
    { value: 'gym', label: currentText.gym, icon: '💪' },
    { value: 'furnished', label: currentText.furnished, icon: '🛋️' },
  ];

  const rentAmenities = [
    { value: 'furnished', label: currentText.furnished, icon: '🛋️' },
    { value: 'wifi', label: currentText.wifi, icon: '📶' },
    { value: 'ac', label: currentText.ac, icon: '❄️' },
    { value: 'parking', label: currentText.parking, icon: '🅿️' },
    { value: 'laundry', label: currentText.laundry, icon: '👕' },
    { value: 'kitchen', label: currentText.kitchen, icon: '🍳' },
    { value: 'petsAllowed', label: currentText.petsAllowed, icon: '🐕' },
  ];

  const amenitiesList = activeTab === "rent" ? rentAmenities : saleAmenities;

  const bedroomOptions = ['1', '2', '3', '4', '5+'];
  const bathroomOptions = ['1', '2', '3', '4+'];

  // Rental duration options (1-12 months)
  const rentalDurationOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i === 0 ? currentText.month : currentText.months}`
  }));

  // Trip purpose options
  const tripPurposeOptions = [
    { value: 'solo', label: currentText.solo, icon: '🧳' },
    { value: 'business', label: currentText.business, icon: '💼' },
    { value: 'family', label: currentText.family, icon: '👨‍👩‍👧‍👦' },
    { value: 'group', label: currentText.group, icon: '👥' },
    { value: 'couple', label: currentText.couple, icon: '💑' },
    { value: 'other', label: currentText.other, icon: '🎯' },
  ];

  // Calculate days between dates
  const calculateDays = () => {
    if (filters.checkInDate && filters.checkOutDate) {
      return differenceInDays(filters.checkOutDate, filters.checkInDate);
    }
    return 0;
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onLiveSearch) {
      onLiveSearch(value);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    // Convert "all" back to empty string for backend compatibility
    const actualValue = value === "all" ? "" : value;
    const newFilters = { ...filters, [key]: actualValue };
    setFilters(newFilters);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    handleFilterChange('amenities', newAmenities);
  };

  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      ...filters
    });
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      location: '',
      propertyType: '',
      listingType: '',
      priceMin: '',
      priceMax: '',
      bedrooms: '',
      bathrooms: '',
      amenities: [],
      checkInDate: null,
      checkOutDate: null,
      rentalDuration: '',
      tripPurpose: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  ) || searchQuery !== '';

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
      <CardContent className="p-6">
        {/* Main Search Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder={currentText.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 h-14 text-lg border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl shadow-sm"
            />
          </div>

          {/* Quick Filters Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select value={filters.location || "all"} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <SelectValue placeholder={currentText.location} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                <SelectItem value="jakarta" className="text-gray-900 dark:text-gray-100">Jakarta</SelectItem>
                <SelectItem value="bali" className="text-gray-900 dark:text-gray-100">Bali</SelectItem>
                <SelectItem value="surabaya" className="text-gray-900 dark:text-gray-100">Surabaya</SelectItem>
                <SelectItem value="bandung" className="text-gray-900 dark:text-gray-100">Bandung</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <SelectValue placeholder={currentText.propertyType} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-gray-100">
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.listingType || "all"} onValueChange={(value) => handleFilterChange('listingType', value)}>
              <SelectTrigger className="h-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <SelectValue placeholder={currentText.listingType} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                {listingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-gray-100">
                    {type.icon} {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="h-12 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              <Filter className="h-4 w-4 mr-2" />
              {currentText.advancedFilters}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentText.priceRange}</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={currentText.from}
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      className="pl-10 h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
                    />
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={currentText.to}
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="pl-10 h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    {currentText.bedrooms}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filters.bedrooms === '' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('bedrooms', '')}
                      className="text-xs"
                    >
                      {currentText.any}
                    </Button>
                    {bedroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.bedrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('bedrooms', option)}
                        className="text-xs"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Bath className="h-4 w-4" />
                    {currentText.bathrooms}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filters.bathrooms === '' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('bathrooms', '')}
                      className="text-xs"
                    >
                      {currentText.any}
                    </Button>
                    {bathroomOptions.map((option) => (
                      <Button
                        key={option}
                        variant={filters.bathrooms === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('bathrooms', option)}
                        className="text-xs"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rental-specific filters for rent tab */}
              {activeTab === "rent" && (
                <>
                  {/* Date Selection */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {currentText.checkIn}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-11 justify-start text-left font-normal border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.checkInDate ? format(filters.checkInDate, "PPP") : currentText.selectDate}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.checkInDate}
                            onSelect={(date) => handleFilterChange('checkInDate', date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {currentText.checkOut}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full h-11 justify-start text-left font-normal border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.checkOutDate ? format(filters.checkOutDate, "PPP") : currentText.selectDate}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.checkOutDate}
                            onSelect={(date) => handleFilterChange('checkOutDate', date)}
                            disabled={(date) => date < new Date() || (filters.checkInDate && date <= filters.checkInDate)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Days Counter */}
                  {filters.checkInDate && filters.checkOutDate && (
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                        {calculateDays()} {currentText.days}
                      </div>
                    </div>
                  )}

                  {/* Rental Duration */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {currentText.rentalDuration}
                    </label>
                    <Select value={filters.rentalDuration} onValueChange={(value) => handleFilterChange('rentalDuration', value)}>
                      <SelectTrigger className="h-11 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder={`${currentText.any} ${currentText.rentalDuration.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem value="all" className="text-gray-900 dark:text-gray-100">{currentText.any}</SelectItem>
                        {rentalDurationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="text-gray-900 dark:text-gray-100">
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Trip Purpose */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {currentText.tripPurpose}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant={filters.tripPurpose === '' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('tripPurpose', '')}
                        className="text-xs"
                      >
                        {currentText.any}
                      </Button>
                      {tripPurposeOptions.map((purpose) => (
                        <Button
                          key={purpose.value}
                          variant={filters.tripPurpose === purpose.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('tripPurpose', purpose.value)}
                          className="text-xs"
                        >
                          {purpose.icon} {purpose.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Amenities */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentText.amenities}</label>
                <div className="flex gap-2 flex-wrap">
                  {amenitiesList.map((amenity) => (
                    <Badge
                      key={amenity.value}
                      variant={filters.amenities.includes(amenity.value) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform text-xs px-3 py-1.5"
                      onClick={() => handleAmenityToggle(amenity.value)}
                    >
                      {amenity.icon} {amenity.label}
                      {filters.amenities.includes(amenity.value) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSearch}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Search className="h-5 w-5 mr-2" />
              {currentText.search}
            </Button>
            {hasActiveFilters && (
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="h-12 px-6 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-4 w-4 mr-2" />
                {currentText.clearAll}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MainPageSearchFilters;
