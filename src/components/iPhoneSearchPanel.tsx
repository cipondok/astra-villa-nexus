import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Calendar } from "@/components/ui/calendar";
import { Search, MapPin, Home, Building, DollarSign, Filter, Bed, Bath, X, Bot, Sparkles, Zap, Square, Star, Settings, ChevronDown, ChevronUp, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from 'date-fns';

interface IPhoneSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
  resultsCount?: number;
}

const IPhoneSearchPanel = ({ language, onSearch, onLiveSearch, resultsCount }: IPhoneSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [areaRange, setAreaRange] = useState([0, 1000]);
  
  // Collapsible states for each filter section
  const [openSections, setOpenSections] = useState({
    location: false,
    priceRange: false,
    propertySpecs: false,
    amenities: false,
    dates: false,
    rentalDetails: false
  });
  const [filters, setFilters] = useState({
    location: '',
    state: '',
    city: '',
    area: '',
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
    minArea: '',
    maxArea: '',
    features: [] as string[],
    yearBuilt: '',
    condition: '',
    sortBy: 'newest',
    floorLevel: '',
    landSize: '',
    stories: '',
    furnishing: '',
    // Rental-specific fields
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    rentalDuration: '',
    tripPurpose: ''
  });


  // Dynamic data from database
  const [provinces, setProvinces] = useState<{code: string, name: string}[]>([]);
  const [cities, setCities] = useState<{code: string, name: string, type: string}[]>([]);
  const [areas, setAreas] = useState<{code: string, name: string}[]>([]);
  const [dynamicPropertyTypes, setDynamicPropertyTypes] = useState<{value: string, label: string}[]>([]);

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces();
    fetchPropertyTypes();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (filters.state && filters.state !== 'all') {
      fetchCities(filters.state);
    } else {
      setCities([]);
      setFilters(prev => ({ ...prev, city: 'all', area: 'all' }));
    }
  }, [filters.state]);

  // Fetch areas when city changes
  useEffect(() => {
    if (filters.city && filters.city !== 'all' && filters.state && filters.state !== 'all') {
      fetchAreas(filters.state, filters.city);
    } else {
      setAreas([]);
      setFilters(prev => ({ ...prev, area: 'all' }));
    }
  }, [filters.city, filters.state]);

  const fetchProvinces = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('province_code, province_name')
        .eq('is_active', true)
        .order('province_name');

      if (error) throw error;

      // Remove duplicates
      const uniqueProvinces = data?.reduce((acc: Array<{code: string, name: string}>, curr) => {
        if (!acc.find(p => p.code === curr.province_code)) {
          acc.push({
            code: curr.province_code,
            name: curr.province_name
          });
        }
        return acc;
      }, []) || [];

      setProvinces(uniqueProvinces);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const fetchCities = async (provinceCode: string) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('city_code, city_name, city_type')
        .eq('province_code', provinceCode)
        .eq('is_active', true)
        .order('city_name');

      if (error) throw error;

      // Remove duplicates
      const uniqueCities = data?.reduce((acc: Array<{code: string, name: string, type: string}>, curr) => {
        if (!acc.find(c => c.code === curr.city_code)) {
          acc.push({
            code: curr.city_code,
            name: curr.city_name,
            type: curr.city_type
          });
        }
        return acc;
      }, []) || [];

      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchAreas = async (provinceCode: string, cityCode: string) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('district_code, district_name')
        .eq('province_code', provinceCode)
        .eq('city_code', cityCode)
        .eq('is_active', true)
        .order('district_name');

      if (error) throw error;

      // Remove duplicates
      const uniqueAreas = data?.reduce((acc: Array<{code: string, name: string}>, curr) => {
        if (!acc.find(a => a.code === curr.district_code)) {
          acc.push({
            code: curr.district_code,
            name: curr.district_name
          });
        }
        return acc;
      }, []) || [];

      setAreas(uniqueAreas);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchPropertyTypes = async () => {
    try {
      const { data: typeData } = await supabase
        .from('properties')
        .select('property_type')
        .not('property_type', 'is', null);

      if (typeData) {
        const uniqueTypes = [...new Set(typeData.map(item => item.property_type))]
          .filter(Boolean)
          .map(type => ({
            value: type,
            label: type.charAt(0).toUpperCase() + type.slice(1)
          }));
        setDynamicPropertyTypes(uniqueTypes);
      }
    } catch (error) {
      console.error('Error fetching property types:', error);
    }
  };

  const text = {
    en: {
      searchPlaceholder: "Search properties, locations, or keywords...",
      search: "Search",
      all: "All",
      location: "Location",
      propertyType: "Property Type",
      listingType: "Listing Type",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area (m²)",
      features: "Features",
      yearBuilt: "Year Built",
      condition: "Condition",
      sortBy: "Sort By",
      any: "Any",
      forSale: "For Sale",
      forRent: "For Rent",
      villa: "Villa",
      apartment: "Apartment",
      house: "House",
      townhouse: "Townhouse",
      land: "Land",
      condo: "Condo",
      office: "Office",
      under500k: "Under 500K",
      "500k-1m": "500K - 1M",
      "1m-2m": "1M - 2M",
      "2m-5m": "2M - 5M",
      "5m+": "5M+",
      resultsFound: "properties found",
      filters: "Filters",
      clearFilters: "Clear All",
      advancedFilters: "Advanced Filters",
      selectedFilters: "Selected Filters",
      newest: "Newest",
      priceLow: "Price: Low to High",
      priceHigh: "Price: High to Low",
      areaLarge: "Area: Largest",
      parking: "Parking",
      pool: "Swimming Pool",
      gym: "Gym",
      garden: "Garden",
      security: "24h Security",
      furnished: "Furnished",
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
      months: "months",
      rentalDetails: "Rental Details",
      wifi: "WiFi",
      ac: "Air Conditioning",
      laundry: "Laundry",
      kitchen: "Kitchen",
      petsAllowed: "Pets Allowed"
    },
    id: {
      searchPlaceholder: "Cari properti, lokasi, atau kata kunci...",
      search: "Cari",
      all: "Semua",
      location: "Lokasi",
      propertyType: "Jenis Properti",
      listingType: "Tipe Listing",
      priceRange: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      area: "Luas (m²)",
      features: "Fasilitas",
      yearBuilt: "Tahun Dibangun",
      condition: "Kondisi",
      sortBy: "Urutkan",
      any: "Semua",
      forSale: "Dijual",
      forRent: "Disewa",
      villa: "Villa",
      apartment: "Apartemen",
      house: "Rumah",
      townhouse: "Rumah Teres",
      land: "Tanah",
      condo: "Kondominium",
      office: "Kantor",
      under500k: "Dibawah 500K",
      "500k-1m": "500K - 1M",
      "1m-2m": "1M - 2M",
      "2m-5m": "2M - 5M",
      "5m+": "5M+",
      resultsFound: "properti ditemukan",
      filters: "Filter",
      clearFilters: "Hapus Semua",
      advancedFilters: "Filter Lanjutan",
      selectedFilters: "Filter Terpilih",
      newest: "Terbaru",
      priceLow: "Harga: Rendah ke Tinggi",
      priceHigh: "Harga: Tinggi ke Rendah",
      areaLarge: "Luas: Terbesar",
      parking: "Parkir",
      pool: "Kolam Renang",
      gym: "Gym",
      garden: "Taman",
      security: "Keamanan 24j",
      furnished: "Furnished",
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
      months: "bulan",
      rentalDetails: "Detail Sewa",
      wifi: "WiFi",
      ac: "AC",
      laundry: "Laundry",
      kitchen: "Dapur",
      petsAllowed: "Hewan Diizinkan"
    }
  };

  const currentText = text[language];

  const staticPropertyTypes = [
    { value: 'villa', label: currentText.villa, icon: Building },
    { value: 'apartment', label: currentText.apartment, icon: Building },
    { value: 'house', label: currentText.house, icon: Home },
    { value: 'townhouse', label: currentText.townhouse, icon: Home },
    { value: 'condo', label: currentText.condo, icon: Building },
    { value: 'land', label: currentText.land, icon: MapPin },
    { value: 'office', label: currentText.office, icon: Building },
  ];

  const propertyFeatures = [
    { id: 'parking', label: currentText.parking, icon: '🚗' },
    { id: 'swimming_pool', label: currentText.pool, icon: '🏊' },
    { id: 'gym', label: currentText.gym, icon: '💪' },
    { id: 'garden', label: currentText.garden, icon: '🌿' },
    { id: 'security', label: currentText.security, icon: '🔒' },
    { id: 'furnished', label: currentText.furnished, icon: '🛋️' },
  ];

  const handleStateChange = (stateCode: string) => {
    setFilters(prev => ({ 
      ...prev, 
      state: stateCode,
      city: 'all',
      area: 'all'
    }));
  };

  const handleCityChange = (cityCode: string) => {
    setFilters(prev => ({ 
      ...prev, 
      city: cityCode,
      area: 'all'
    }));
  };

  const handleAreaChange = (areaCode: string) => {
    setFilters(prev => ({ 
      ...prev, 
      area: areaCode
    }));
  };

  // Use different property types based on active tab
  const getFilteredPropertyTypes = () => {
    const baseTypes = dynamicPropertyTypes.length > 0 ? 
      dynamicPropertyTypes.map(type => ({
        ...type,
        icon: staticPropertyTypes.find(st => st.value === type.value)?.icon || Building
      })) : staticPropertyTypes;
    
    // For rent, exclude land
    if (activeTab === 'rent') {
      return baseTypes.filter(type => type.value !== 'land');
    }
    
    return baseTypes;
  };

  const propertyTypeOptions = getFilteredPropertyTypes();

  // Different filters based on active tab
  const getSaleFilters = () => ({
    priceRanges: [
      { value: '500000000-1000000000', label: '500jt - 1M' },
      { value: '1000000000-2000000000', label: '1M - 2M' },
      { value: '2000000000-5000000000', label: '2M - 5M' },
      { value: '5000000000-10000000000', label: '5M - 10M' },
      { value: '10000000000+', label: '10M+' },
    ],
    propertyTypes: propertyTypeOptions.filter(type => 
      ['villa', 'house', 'townhouse', 'apartment', 'condo', 'land'].includes(type.value)
    ),
    features: [
      { id: 'parking', label: currentText.parking, icon: '🚗' },
      { id: 'swimming_pool', label: currentText.pool, icon: '🏊' },
      { id: 'gym', label: currentText.gym, icon: '💪' },
      { id: 'garden', label: currentText.garden, icon: '🌿' },
      { id: 'security', label: currentText.security, icon: '🔒' },
    ],
    maxPrice: 20000,
    priceStep: 500
  });

  const getRentFilters = () => ({
    priceRanges: [
      { value: '1000000-3000000', label: '1jt - 3jt/month' },
      { value: '3000000-5000000', label: '3jt - 5jt/month' },
      { value: '5000000-10000000', label: '5jt - 10jt/month' },
      { value: '10000000-20000000', label: '10jt - 20jt/month' },
      { value: '20000000+', label: '20jt+/month' },
    ],
    propertyTypes: propertyTypeOptions.filter(type => 
      ['apartment', 'condo', 'villa', 'house', 'townhouse', 'office'].includes(type.value)
    ),
    features: [
      { id: 'furnished', label: currentText.furnished, icon: '🛋️' },
      { id: 'wifi', label: 'WiFi', icon: '📶' },
      { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
      { id: 'parking', label: currentText.parking, icon: '🅿️' },
      { id: 'laundry', label: 'Laundry', icon: '👕' },
      { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
      { id: 'pets_allowed', label: 'Pets Allowed', icon: '🐕' },
      { id: 'swimming_pool', label: currentText.pool, icon: '🏊' },
      { id: 'gym', label: currentText.gym, icon: '💪' },
      { id: 'security', label: currentText.security, icon: '🔒' },
    ],
    maxPrice: 100,
    priceStep: 5
  });

  const getAllFilters = () => ({
    priceRanges: [
      { value: '100000000-500000000', label: '100jt - 500jt' },
      { value: '500000000-1000000000', label: '500jt - 1M' },
      { value: '1000000000-5000000000', label: '1M - 5M' },
      { value: '5000000000+', label: '5M+' },
    ],
    propertyTypes: propertyTypeOptions,
    features: propertyFeatures,
    maxPrice: 15000,
    priceStep: 100
  });

  // Get current filters based on active tab
  const getCurrentFilters = () => {
    switch (activeTab) {
      case 'sale': return getSaleFilters();
      case 'rent': return getRentFilters();
      default: return getAllFilters();
    }
  };

  const currentFilters = getCurrentFilters();

  const sortOptions = [
    { value: 'newest', label: currentText.newest },
    { value: 'price_low', label: currentText.priceLow },
    { value: 'price_high', label: currentText.priceHigh },
    { value: 'area_large', label: currentText.areaLarge },
  ];

  const yearOptions = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2015-2019', label: '2015-2019' },
    { value: '2010-2014', label: '2010-2014' },
    { value: 'below-2010', label: 'Before 2010' },
  ];

  const conditionOptions = [
    { value: 'new', label: 'New/Unoccupied' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'needs_renovation', label: 'Needs Renovation' },
  ];

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
    const actualValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: actualValue }));
  };

  const handleFeatureToggle = (featureId: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'features') return Array.isArray(value) && value.length > 0;
      if (key === 'sortBy') return false; // Don't count sortBy as it has a default value
      if (key === 'checkInDate' || key === 'checkOutDate') return value !== null;
      // Exclude empty strings, null, undefined, and 'all' values
      return value !== '' && value !== null && value !== undefined && value !== 'all';
    }).length;
    
    return count;
  };

  const clearAllFilters = () => {
    setFilters({
      location: '',
      state: '',
      city: '', 
      area: '',
      propertyType: '',
      priceRange: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      maxArea: '',
      features: [],
      yearBuilt: '',
      condition: '',
      sortBy: 'newest',
      floorLevel: '',
      landSize: '',
      stories: '',
      furnishing: '',
      checkInDate: null,
      checkOutDate: null,
      rentalDuration: '',
      tripPurpose: ''
    });
    setPriceRange([0, 10000]);
    setAreaRange([0, 1000]);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `${price / 1000} M`;
    return `${price} Jt`;
  };

  const getSelectedFiltersDisplay = () => {
    const selected = [];
    
    // Combine location parts
    const locationParts = [];
    if (filters.state && filters.state !== 'all') {
      const province = provinces.find(p => p.code === filters.state);
      if (province) locationParts.push(province.name);
    }
    if (filters.city && filters.city !== 'all') {
      const city = cities.find(c => c.code === filters.city);
      if (city) locationParts.push(city.name);
    }
    if (filters.area && filters.area !== 'all') {
      const area = areas.find(a => a.code === filters.area);
      if (area) locationParts.push(area.name);
    }
    if (locationParts.length > 0) selected.push(locationParts.join(', '));
    
    if (filters.propertyType) selected.push(currentText[filters.propertyType as keyof typeof currentText] || filters.propertyType);
    if (filters.priceRange) selected.push(filters.priceRange);
    if (filters.bedrooms) selected.push(`${filters.bedrooms} bed`);
    if (filters.bathrooms) selected.push(`${filters.bathrooms} bath`);
    if (filters.features.length > 0) selected.push(`${filters.features.length} features`);
    if (filters.yearBuilt) selected.push(filters.yearBuilt);
    if (filters.condition) selected.push(filters.condition);
    return selected;
  };

  const handleSearch = () => {
    const listingType = activeTab === 'all' ? '' : activeTab;
    
    // Construct location from selected parts
    let locationValue = '';
    const locationParts = [];
    
    if (filters.state && filters.state !== 'all') {
      const province = provinces.find(p => p.code === filters.state);
      if (province) locationParts.push(province.name);
    }
    if (filters.city && filters.city !== 'all') {
      const city = cities.find(c => c.code === filters.city);
      if (city) locationParts.push(city.name);
    }
    if (filters.area && filters.area !== 'all') {
      const area = areas.find(a => a.code === filters.area);
      if (area) locationParts.push(area.name);
    }
    
    // Use the most specific location part for search
    if (locationParts.length > 0) {
      locationValue = locationParts[locationParts.length - 1]; // Use most specific (last) part
    }
    
    // Base search data
    const searchData: any = {
      searchQuery,
      listingType,
      location: locationValue,
      state: filters.state === 'all' ? '' : filters.state,
      city: filters.city === 'all' ? '' : filters.city,
      area: filters.area === 'all' ? '' : filters.area,
      propertyType: filters.propertyType === 'all' ? '' : filters.propertyType,
      priceRange: filters.priceRange === 'all' ? '' : filters.priceRange,
      bedrooms: filters.bedrooms === 'all' ? '' : filters.bedrooms,
      bathrooms: filters.bathrooms === 'all' ? '' : filters.bathrooms,
      minArea: areaRange[0],
      maxArea: areaRange[1],
      features: filters.features,
      yearBuilt: filters.yearBuilt === 'all' ? '' : filters.yearBuilt,
      condition: filters.condition === 'all' ? '' : filters.condition,
      sortBy: filters.sortBy
    };

    console.log('Search data being sent:', searchData);
    onSearch(searchData);
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Modern Slim Glass Container */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="p-4 lg:p-6 space-y-3">
          
          {/* Compact Tabs for Sale/Rent/All */}
          <div className="flex justify-center">
            <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'all' 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {currentText.all}
              </button>
              <button
                onClick={() => setActiveTab('sale')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'sale' 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {currentText.forSale}
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'rent' 
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {currentText.forRent}
              </button>
            </div>
          </div>
          
          {/* Compact Search Row */}
          <div className="flex gap-2 lg:gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                placeholder={currentText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-11 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-11 px-4 relative bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Filters</span>
              </div>
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
            <Button
              onClick={handleSearch}
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">{currentText.search}</span>
            </Button>
          </div>

          {/* Results Count */}
          {resultsCount !== undefined && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-1 rounded-md backdrop-blur-sm inline-block">
                {resultsCount} {currentText.resultsFound}
              </p>
            </div>
          )}

          {/* Selected Filters Display */}
          {getSelectedFiltersDisplay().length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {getSelectedFiltersDisplay().map((filter, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-md backdrop-blur-sm border border-primary/30"
                >
                  {filter}
                </span>
              ))}
            </div>
          )}

          {/* Location Selection Row - 3 separate dropdowns */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {/* State/Province Selection */}
            <Select value={filters.state || "all"} onValueChange={handleStateChange}>
              <SelectTrigger className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 focus:border-blue-500 transition-colors">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <SelectValue placeholder="State" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                <SelectItem value="all" className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">{currentText.any}</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province.code} value={province.code} className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* City Selection */}
            <Select 
              value={filters.city || "all"} 
              onValueChange={handleCityChange}
              disabled={!filters.state || filters.state === 'all'}
            >
              <SelectTrigger className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                <SelectItem value="all" className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">{currentText.any}</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.code} value={city.code} className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">
                    {city.type} {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Area Selection */}
            <Select 
              value={filters.area || "all"} 
              onValueChange={handleAreaChange}
              disabled={!filters.city || filters.city === 'all'}
            >
              <SelectTrigger className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 focus:border-blue-500 transition-colors">
                <SelectValue placeholder="Area" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                <SelectItem value="all" className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">{currentText.any}</SelectItem>
                {areas.map((area) => (
                  <SelectItem key={area.code} value={area.code} className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Type and Other Filters Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
            {/* Property Type Selection */}
            <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 focus:border-blue-500 transition-colors">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-500" />
                  <SelectValue placeholder={currentText.propertyType} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                <SelectItem value="all" className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">{currentText.any}</SelectItem>
                {currentFilters.propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bedrooms Filter - Only show on larger screens */}
            <div className="hidden lg:block">
              <Select value={filters.bedrooms || "all"} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                <SelectTrigger className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 focus:border-blue-500 transition-colors">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-blue-500" />
                    <SelectValue placeholder={currentText.bedrooms} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  <SelectItem value="all" className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">{currentText.any}</SelectItem>
                  {bedroomOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bathrooms Filter - Only show on larger screens */}
            <div className="hidden lg:block">
              <Select value={filters.bathrooms || "all"} onValueChange={(value) => handleFilterChange('bathrooms', value)}>
                <SelectTrigger className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 focus:border-blue-500 transition-colors">
                  <div className="flex items-center gap-2">
                    <Bath className="h-4 w-4 text-blue-500" />
                    <SelectValue placeholder={currentText.bathrooms} />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
                  <SelectItem value="all" className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">{currentText.any}</SelectItem>
                  {bathroomOptions.map((option) => (
                    <SelectItem key={option} value={option} className="text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg m-1">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

           {/* Advanced Filters Modal */}
          {showFilters && (
            <div className="bg-gradient-to-br from-background/60 via-muted/40 to-background/60 backdrop-blur-xl border border-border/50 rounded-xl p-4 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground font-semibold text-sm flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  {currentText.advancedFilters}
                </h3>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                >
                  <X className="h-3 w-3 mr-1" />
                  {currentText.clearFilters}
                </Button>
              </div>


              {/* Property Specifications Category */}
              <Collapsible open={openSections.propertySpecs} onOpenChange={() => toggleSection('propertySpecs')}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost" 
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center">
                            <Home className="h-3 w-3 text-white" />
                          </div>
                          <h4 className="font-medium text-sm text-blue-700 dark:text-blue-300">Property Specifications</h4>
                        </div>
                        {openSections.propertySpecs ? 
                          <ChevronUp className="h-4 w-4 text-blue-600" /> : 
                          <ChevronDown className="h-4 w-4 text-blue-600" />
                        }
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-4">
                
                {/* Room Configuration */}
                <div>
                  <Label className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 block">Room Configuration</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-blue-600 dark:text-blue-400 mb-1 block">{currentText.bedrooms}</Label>
                      <Select value={filters.bedrooms || "all"} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                        <SelectTrigger className="h-9 text-xs border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-blue-950/30">
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3 text-blue-500" />
                            <SelectValue placeholder={currentText.bedrooms} />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800">
                          <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                          {bedroomOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-xs">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-blue-600 dark:text-blue-400 mb-1 block">{currentText.bathrooms}</Label>
                      <Select value={filters.bathrooms || "all"} onValueChange={(value) => handleFilterChange('bathrooms', value)}>
                        <SelectTrigger className="h-9 text-xs border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-blue-950/30">
                          <div className="flex items-center gap-1">
                            <Bath className="h-3 w-3 text-blue-500" />
                            <SelectValue placeholder={currentText.bathrooms} />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800">
                          <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                          {bathroomOptions.map((option) => (
                            <SelectItem key={option} value={option} className="text-xs">
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Property Age & Condition */}
                <div>
                  <Label className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 block">Property Age & Condition</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-blue-600 dark:text-blue-400 mb-1 block">{currentText.yearBuilt}</Label>
                      <Select value={filters.yearBuilt || "all"} onValueChange={(value) => handleFilterChange('yearBuilt', value)}>
                         <SelectTrigger className="h-9 text-xs border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-blue-950/30">
                           <div className="flex items-center gap-1">
                             <Settings className="h-3 w-3 text-blue-500" />
                             <SelectValue placeholder={currentText.yearBuilt} />
                           </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800">
                          <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                          {yearOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-blue-600 dark:text-blue-400 mb-1 block">{currentText.condition}</Label>
                      <Select value={filters.condition || "all"} onValueChange={(value) => handleFilterChange('condition', value)}>
                        <SelectTrigger className="h-9 text-xs border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-blue-950/30">
                          <div className="flex items-center gap-1">
                            <Settings className="h-3 w-3 text-blue-500" />
                            <SelectValue placeholder={currentText.condition} />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800">
                          <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                          {conditionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Property Type Specific Features */}
                <div>
                  <Label className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 block">Type-Specific Features</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Floor Level (for apartments/condos) */}
                    {(['apartment', 'condo'].includes(filters.propertyType)) && (
                      <div>
                        <Label className="text-xs text-blue-600 dark:text-blue-400 mb-1 block">Floor Level</Label>
                        <Select value={filters.floorLevel || "all"} onValueChange={(value) => handleFilterChange('floorLevel', value)}>
                          <SelectTrigger className="h-9 text-xs border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-blue-950/30">
                            <SelectValue placeholder="Floor Level" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800">
                            <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                            <SelectItem value="low" className="text-xs">Low Floor (1-5)</SelectItem>
                            <SelectItem value="mid" className="text-xs">Mid Floor (6-15)</SelectItem>
                            <SelectItem value="high" className="text-xs">High Floor (16+)</SelectItem>
                            <SelectItem value="penthouse" className="text-xs">Penthouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Land Size (for houses/villas) */}
                    {(['house', 'villa', 'townhouse'].includes(filters.propertyType)) && (
                      <div>
                        <Label className="text-xs text-blue-600 dark:text-blue-400 mb-1 block">Land Size</Label>
                        <Select value={filters.landSize || "all"} onValueChange={(value) => handleFilterChange('landSize', value)}>
                          <SelectTrigger className="h-9 text-xs border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-blue-950/30">
                            <SelectValue placeholder="Land Size" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800">
                            <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                            <SelectItem value="small" className="text-xs">Small (&lt;100m²)</SelectItem>
                            <SelectItem value="medium" className="text-xs">Medium (100-300m²)</SelectItem>
                            <SelectItem value="large" className="text-xs">Large (300-500m²)</SelectItem>
                            <SelectItem value="xlarge" className="text-xs">Extra Large (500m²+)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Stories (for houses) */}
                    {(['house', 'villa', 'townhouse'].includes(filters.propertyType)) && (
                      <div>
                        <Label className="text-xs text-blue-600 dark:text-blue-400 mb-1 block">Stories</Label>
                        <Select value={filters.stories || "all"} onValueChange={(value) => handleFilterChange('stories', value)}>
                          <SelectTrigger className="h-9 text-xs border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-blue-950/30">
                            <SelectValue placeholder="Stories" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800">
                            <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                            <SelectItem value="1" className="text-xs">1 Story</SelectItem>
                            <SelectItem value="2" className="text-xs">2 Stories</SelectItem>
                            <SelectItem value="3" className="text-xs">3 Stories</SelectItem>
                            <SelectItem value="3+" className="text-xs">3+ Stories</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Furnishing Level */}
                    <div>
                      <Label className="text-xs text-blue-600 dark:text-blue-400 mb-1 block">Furnishing</Label>
                      <Select value={filters.furnishing || "all"} onValueChange={(value) => handleFilterChange('furnishing', value)}>
                        <SelectTrigger className="h-9 text-xs border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-blue-950/30">
                          <SelectValue placeholder="Furnishing" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800">
                          <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                          <SelectItem value="unfurnished" className="text-xs">Unfurnished</SelectItem>
                          <SelectItem value="semi_furnished" className="text-xs">Semi-Furnished</SelectItem>
                          <SelectItem value="fully_furnished" className="text-xs">Fully Furnished</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
              </Collapsible>

              {/* Price & Area Category */}
              <Collapsible open={openSections.priceRange} onOpenChange={() => toggleSection('priceRange')}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost" 
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 rounded-lg p-4 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                            <DollarSign className="h-3 w-3 text-white" />
                          </div>
                          <h4 className="font-medium text-sm text-green-700 dark:text-green-300">Price & Area Range</h4>
                        </div>
                        {openSections.priceRange ? 
                          <ChevronUp className="h-4 w-4 text-green-600" /> : 
                          <ChevronDown className="h-4 w-4 text-green-600" />
                        }
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-2 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 rounded-lg p-4">

                {/* Price Range Slider */}
                <div>
                  <Label className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {currentText.priceRange}: Rp {formatPrice(priceRange[0])} - Rp {formatPrice(priceRange[1])}
                  </Label>
                  <div className="mt-3 p-3 bg-white/50 dark:bg-green-950/20 rounded-lg">
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => {
                        setPriceRange(value);
                        handleFilterChange('minPrice', value[0] * (currentFilters.priceStep * 1000000));
                        handleFilterChange('maxPrice', value[1] * (currentFilters.priceStep * 1000000));
                      }}
                      max={currentFilters.maxPrice}
                      min={0}
                      step={currentFilters.priceStep}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-green-600 dark:text-green-400 mt-2">
                      <span>Rp 0</span>
                      <span>Rp {currentFilters.maxPrice >= 1000 ? `${currentFilters.maxPrice/1000}M+` : `${currentFilters.maxPrice}jt+`}</span>
                    </div>
                  </div>
                </div>

                {/* Area Range Slider */}
                <div>
                  <Label className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    {currentText.area}: {areaRange[0]} - {areaRange[1]} m²
                  </Label>
                  <div className="mt-3 p-3 bg-white/50 dark:bg-green-950/20 rounded-lg">
                    <Slider
                      value={areaRange}
                      onValueChange={(value) => {
                        setAreaRange(value);
                        handleFilterChange('minArea', value[0]);
                        handleFilterChange('maxArea', value[1]);
                      }}
                      max={1000}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-green-600 dark:text-green-400 mt-2">
                      <span>0 m²</span>
                      <span>1000+ m²</span>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
              </Collapsible>

              {/* Property Features Category */}
              <Collapsible open={openSections.amenities} onOpenChange={() => toggleSection('amenities')}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost" 
                    className="w-full justify-between p-0 h-auto hover:bg-transparent"
                  >
                    <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-4 w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                            <Star className="h-3 w-3 text-white" />
                          </div>
                          <h4 className="font-medium text-sm text-purple-700 dark:text-purple-300">{currentText.features}</h4>
                        </div>
                        {openSections.amenities ? 
                          <ChevronUp className="h-4 w-4 text-purple-600" /> : 
                          <ChevronDown className="h-4 w-4 text-purple-600" />
                        }
                      </div>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-2 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-4">
                
                <div className="grid grid-cols-2 gap-3">
                  {currentFilters.features.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2 p-2 bg-white/50 dark:bg-purple-950/20 rounded-lg">
                      <Checkbox
                        id={feature.id}
                        checked={filters.features.includes(feature.id)}
                        onCheckedChange={() => handleFeatureToggle(feature.id)}
                        className="border-purple-300 dark:border-purple-700 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <Label
                        htmlFor={feature.id}
                        className="text-sm font-normal cursor-pointer flex items-center gap-1 text-purple-700 dark:text-purple-300"
                      >
                        <span>{feature.icon}</span>
                        {feature.label}
                      </Label>
                    </div>
                  ))}
                 </div>
              </CollapsibleContent>
              </Collapsible>

              {/* Rental Details Category - Only show for rent tab */}
              {activeTab === 'rent' && (
                <Collapsible open={openSections.rentalDetails} onOpenChange={() => toggleSection('rentalDetails')}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost" 
                      className="w-full justify-between p-0 h-auto hover:bg-transparent"
                    >
                      <div className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-800/50 rounded-lg p-4 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 flex items-center justify-center">
                              <CalendarIcon className="h-3 w-3 text-white" />
                            </div>
                            <h4 className="font-medium text-sm text-orange-700 dark:text-orange-300">{currentText.rentalDetails}</h4>
                          </div>
                          {openSections.rentalDetails ? 
                            <ChevronUp className="h-4 w-4 text-orange-600" /> : 
                            <ChevronDown className="h-4 w-4 text-orange-600" />
                          }
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-2 bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-800/50 rounded-lg p-4">
                    
                    {/* Date Selection */}
                    <div>
                      <Label className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-3 block">Rental Dates</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-orange-600 dark:text-orange-400 mb-1 block">{currentText.checkIn}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-9 justify-start text-left font-normal border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-orange-950/30 text-xs"
                              >
                                <CalendarIcon className="mr-2 h-3 w-3 text-orange-500" />
                                {filters.checkInDate ? format(filters.checkInDate, "PPP") : currentText.selectDate}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-950 border-orange-200 dark:border-orange-800" align="start">
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

                        <div>
                          <Label className="text-xs text-orange-600 dark:text-orange-400 mb-1 block">{currentText.checkOut}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-9 justify-start text-left font-normal border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-orange-950/30 text-xs"
                              >
                                <CalendarIcon className="mr-2 h-3 w-3 text-orange-500" />
                                {filters.checkOutDate ? format(filters.checkOutDate, "PPP") : currentText.selectDate}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-950 border-orange-200 dark:border-orange-800" align="start">
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
                        <div className="mt-3 text-center p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                            {calculateDays()} {currentText.days}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rental Duration */}
                    <div>
                      <Label className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-3 block">Rental Duration</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <Select value={filters.rentalDuration} onValueChange={(value) => handleFilterChange('rentalDuration', value)}>
                          <SelectTrigger className="h-9 text-xs border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-orange-950/30">
                            <SelectValue placeholder={`${currentText.any} ${currentText.rentalDuration.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-950 border-orange-200 dark:border-orange-800">
                            <SelectItem value="all" className="text-xs">{currentText.any}</SelectItem>
                            {rentalDurationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="text-xs">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Trip Purpose */}
                    <div>
                      <Label className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-3 block">Trip Purpose</Label>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-orange-500" />
                        <span className="text-xs text-orange-600 dark:text-orange-400">{currentText.tripPurpose}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {tripPurposeOptions.map((purpose) => (
                          <Button
                            key={purpose.value}
                            variant={filters.tripPurpose === purpose.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange('tripPurpose', purpose.value)}
                            className="h-8 text-xs justify-start gap-1 border-orange-200 dark:border-orange-800"
                          >
                            <span>{purpose.icon}</span>
                            {purpose.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Sort By Category */}
              <div className="bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20 border border-gray-200/50 dark:border-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-gray-400 to-slate-400 flex items-center justify-center">
                    <Settings className="h-3 w-3 text-white" />
                  </div>
                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">{currentText.sortBy}</h4>
                </div>
                
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="h-9 text-xs border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/30">
                    <SelectValue placeholder={currentText.sortBy} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IPhoneSearchPanel;