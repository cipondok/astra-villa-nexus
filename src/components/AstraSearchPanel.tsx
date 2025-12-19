import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CollapsibleSearchPanelMobile } from "@/components/CollapsibleSearchPanelMobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, MapPin, Home, Building, DollarSign, Filter, Bed, Bath, X, Bot, Sparkles, Zap, Square, Star, Settings, ChevronDown, ChevronUp, Calendar as CalendarIcon, Clock, Users, TrendingUp, Layers, ShoppingBag, Key, Rocket, Car, Shield, Wifi, Wind, Droplets, Tv, Warehouse, Building2, LandPlot, SlidersHorizontal, Package, Briefcase, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from 'date-fns';
import { useScrollLock } from "@/hooks/useScrollLock"; // 🔥 CRITICAL: Prevents layout shift
import { useDebounce } from "@/hooks/useDebounce";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { ImageSearchButton } from "@/components/search/ImageSearchButton";
import { RecentImageSearches, addRecentSearch } from "@/components/search/RecentImageSearches";
import { useImageSearch } from "@/hooks/useImageSearch";
import { toast } from "sonner";
import AdvancedFilters from "@/components/search/AdvancedFilters";
import {
  calculateTimeWeightedScore,
  sortByPopularity,
  getLocationSuggestions as getLocationSuggestionsUtil,
  getFilteredSuggestions as getFilteredSuggestionsUtil,
  trackSuggestionClick as trackSuggestionClickUtil,
  getDisplayCount as getDisplayCountUtil,
  type FilteredSuggestions
} from "@/utils/searchSuggestions";
interface AstraSearchPanelProps {
  language: "en" | "id";
  onSearch: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
  resultsCount?: number;
}
const AstraSearchPanel = ({
  language,
  onSearch,
  onLiveSearch,
  resultsCount
}: AstraSearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent' | 'new_project'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [areaRange, setAreaRange] = useState([0, 1000]);
  const [useNearbyLocation, setUseNearbyLocation] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(5); // Default 5km
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationButtons, setShowLocationButtons] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(false);
  // Anchor for mobile suggestions positioning
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [suggestionsTop, setSuggestionsTop] = useState<number>(0);
  const { filters: dbFilters, loading: filtersLoading } = usePropertyFilters();
  
  // Image search functionality
  const { searchByImage, isSearching: isImageSearching, clearResults: clearImageSearch, searchResults, imageFeatures } = useImageSearch();
  const [recentSearchesKey, setRecentSearchesKey] = useState(0);
  const [currentSearchImage, setCurrentSearchImage] = useState<string | null>(null);
  const [recentSearchTerms, setRecentSearchTerms] = useState<string[]>([]);
  const [suggestionClicks, setSuggestionClicks] = useState<Record<string, { count: number; timestamps: number[] }>>({});
  
  // Location search state
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');

  // Load recent search terms and click analytics from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearchTerms');
    if (stored) {
      try {
        setRecentSearchTerms(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }

    const clickData = localStorage.getItem('suggestionClickAnalytics');
    if (clickData) {
      try {
        const parsed = JSON.parse(clickData);
        // Migrate old format (number) to new format ({ count, timestamps })
        const migrated = Object.entries(parsed).reduce((acc, [key, value]) => {
          if (typeof value === 'number') {
            acc[key] = { count: value, timestamps: [] };
          } else {
            acc[key] = value as { count: number; timestamps: number[] };
          }
          return acc;
        }, {} as Record<string, { count: number; timestamps: number[] }>);
        setSuggestionClicks(migrated);
      } catch (error) {
        console.error('Failed to parse click analytics:', error);
      }
    }
  }, []);

  // Track suggestion click with timestamp (using utility)
  const trackSuggestionClick = (suggestion: string) => {
    const updatedClicks = trackSuggestionClickUtil(suggestion, suggestionClicks);
    setSuggestionClicks(updatedClicks);
    localStorage.setItem('suggestionClickAnalytics', JSON.stringify(updatedClicks));
  };

  // Get display count (using utility)
  const getDisplayCount = (suggestion: string): number => {
    return getDisplayCountUtil(suggestion, suggestionClicks);
  };

  // Listen for recent searches updates
  useEffect(() => {
    const handleUpdate = () => setRecentSearchesKey(prev => prev + 1);
    window.addEventListener('recentSearchesUpdated', handleUpdate);
    return () => window.removeEventListener('recentSearchesUpdated', handleUpdate);
  }, []);

  // Only lock scroll for modal dialogs, not for suggestions dropdown
  useScrollLock(showAdvancedFilters);

  // Ref for click outside detection
  const filterRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const advancedFiltersRef = useRef<HTMLDivElement>(null);

  // Detect mobile and scroll behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (window.innerWidth < 768) {
        // Only on mobile
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsMinimized(true);
        } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
          setIsMinimized(false);
        }
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isMinimized]);

  // Trending suggestions - sorted by time-weighted popularity
  const baseTrendingSearches = ["Apartment Jakarta Selatan", "Villa Bali", "Rumah Bandung", "Office Space Sudirman", "House Menteng", "Apartment Kemang", "Villa Seminyak", "Land Ubud"];
  
  // Sort by time-weighted popularity score (using utility)
  const trendingSearches = useMemo(
    () => sortByPopularity(baseTrendingSearches, suggestionClicks),
    [suggestionClicks]
  );

  // Collapsible states for each filter section
  const [openSections, setOpenSections] = useState({
    listingType: true,
    propertyType: false,
    location: false,
    priceRange: false,
    propertySpecs: false,
    amenities: false,
    dates: false,
    rentalDetails: false
  });
  
  // Popular locations for quick selection
  const popularLocations = [
    "Jakarta Selatan", "Jakarta Pusat", "Bandung", "Surabaya", 
    "Bali", "Tangerang", "Bekasi", "Depok"
  ];
  
  const [locationSearch, setLocationSearch] = useState("");
  const [filters, setFilters] = useState({
    location: '',
    state: '',
    city: '',
    area: '',
    listingType: '', // Sale or Rent
    propertyType: '',
    priceRange: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    minArea: '',
    maxArea: '',
    minPrice: 0,
    maxPrice: 0,
    features: [] as string[],
    facilities: [] as string[],
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

  // Helper function to check if any filters are active
  const hasActiveFilters = () => {
    return (
      (filters.bedrooms && filters.bedrooms !== 'all') ||
      (filters.bathrooms && filters.bathrooms !== 'all') ||
      (filters.parking && filters.parking !== 'all') ||
      filters.minPrice > 0 ||
      filters.maxPrice > 0 ||
      (filters.propertyType && filters.propertyType !== 'all') ||
      (filters.yearBuilt && filters.yearBuilt !== 'all') ||
      (filters.condition && filters.condition !== 'all') ||
      (filters.furnishing && filters.furnishing !== 'all') ||
      (filters.state && filters.state !== 'all') ||
      (filters.city && filters.city !== 'all') ||
      (filters.area && filters.area !== 'all') ||
      (filters.facilities && filters.facilities.length > 0)
    );
  };

  // Dynamic data from database
  const [provinces, setProvinces] = useState<{
    code: string;
    name: string;
  }[]>([]);
  const [cities, setCities] = useState<{
    code: string;
    name: string;
    type: string;
  }[]>([]);
  const [areas, setAreas] = useState<{
    code: string;
    name: string;
  }[]>([]);
  const [dynamicPropertyTypes, setDynamicPropertyTypes] = useState<{
    value: string;
    label: string;
  }[]>([]);

  // Filtered location lists based on search
  const filteredProvinces = useMemo(
    () => provinces.filter(p => p.name.toLowerCase().includes(provinceSearch.toLowerCase())),
    [provinces, provinceSearch]
  );
  
  const filteredCities = useMemo(
    () => cities.filter(c => `${c.type} ${c.name}`.toLowerCase().includes(citySearch.toLowerCase())),
    [cities, citySearch]
  );
  
  const filteredAreas = useMemo(
    () => areas.filter(a => a.name.toLowerCase().includes(areaSearch.toLowerCase())),
    [areas, areaSearch]
  );

  // Suggestions derived AFTER state is initialized to avoid TDZ (using utility)
  const filteredSuggestions = useMemo(
    () => getFilteredSuggestionsUtil(
      searchQuery,
      recentSearchTerms,
      trendingSearches,
      [],
      provinces,
      cities,
      areas,
      filters.state,
      filters.city
    ),
    [searchQuery, recentSearchTerms, trendingSearches, provinces, cities, areas, filters.state, filters.city]
  );
  
  const hasSuggestions = filteredSuggestions.recent.length > 0 || 
                        filteredSuggestions.trending.length > 0 ||
                        filteredSuggestions.locations.length > 0;

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
      setFilters(prev => ({
        ...prev,
        city: 'all',
        area: 'all'
      }));
    }
  }, [filters.state]);

  // Fetch areas when city changes
  useEffect(() => {
    if (filters.city && filters.city !== 'all' && filters.state && filters.state !== 'all') {
      fetchAreas(filters.state, filters.city);
    } else {
      setAreas([]);
      setFilters(prev => ({
        ...prev,
        area: 'all'
      }));
    }
  }, [filters.city, filters.state]);
  const fetchProvinces = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('locations').select('province_code, province_name').eq('is_active', true).order('province_name');
      if (error) throw error;

      // Remove duplicates
      const uniqueProvinces = data?.reduce((acc: Array<{
        code: string;
        name: string;
      }>, curr) => {
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
      const {
        data,
        error
      } = await supabase.from('locations').select('city_code, city_name, city_type').eq('province_code', provinceCode).eq('is_active', true).order('city_name');
      if (error) throw error;

      // Remove duplicates
      const uniqueCities = data?.reduce((acc: Array<{
        code: string;
        name: string;
        type: string;
      }>, curr) => {
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
      const {
        data,
        error
      } = await supabase.from('locations').select('district_code, district_name').eq('province_code', provinceCode).eq('city_code', cityCode).eq('is_active', true).order('district_name');
      if (error) throw error;

      // Remove duplicates
      const uniqueAreas = data?.reduce((acc: Array<{
        code: string;
        name: string;
      }>, curr) => {
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
      const {
        data: typeData
      } = await supabase.from('properties').select('property_type').not('property_type', 'is', null);
      if (typeData) {
        const uniqueTypes = [...new Set(typeData.map(item => item.property_type))].filter(Boolean).map(type => ({
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
      forSale: "Buy",
      forRent: "Rent",
      newProject: "New Project",
      location: "Location",
      propertyType: "Property Type",
      listingType: "Listing Type",
      priceRange: "Price Range",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      area: "Area (m²)",
      features: "Features",
      facilities: "Facilities",
      yearBuilt: "Year Built",
      condition: "Condition",
      furnishing: "Furnishing",
      sortBy: "Sort By",
      any: "Any",
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
      petsAllowed: "Pets Allowed",
      elevator: "Elevator",
      cctv: "CCTV",
      balcony: "Balcony/Terrace",
      storage: "Storage Room",
      maidRoom: "Maid Room",
      studyRoom: "Study Room",
      walkInCloset: "Walk-in Closet",
      intercom: "Intercom",
      generator: "Generator",
      waterHeater: "Water Heater",
      housekeeping: "Housekeeping Service",
      concierge: "Concierge",
      coworking: "Co-working Space",
      playground: "Children Playground",
      bbqArea: "BBQ Area",
      nearMe: "Near Me",
      searchNearby: "Search Nearby",
      radius: "Radius",
      gettingLocation: "Getting location...",
      locationError: "Location access denied",
      within: "Within",
      selectProvince: "Select Province",
      selectCity: "Select City",
      selectArea: "Select Area"
    },
    id: {
      searchPlaceholder: "Cari properti, lokasi, atau kata kunci...",
      search: "Cari",
      all: "Semua",
      forSale: "Beli",
      forRent: "Sewa",
      newProject: "Proyek Baru",
      location: "Lokasi",
      propertyType: "Jenis Properti",
      listingType: "Tipe Listing",
      priceRange: "Range Harga",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      area: "Luas (m²)",
      features: "Fasilitas",
      facilities: "Fasilitas Properti",
      yearBuilt: "Tahun Dibangun",
      condition: "Kondisi",
      furnishing: "Perabotan",
      sortBy: "Urutkan",
      any: "Semua",
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
      petsAllowed: "Hewan Diizinkan",
      elevator: "Lift",
      cctv: "CCTV",
      balcony: "Balkon/Teras",
      storage: "Ruang Penyimpanan",
      maidRoom: "Kamar Pembantu",
      studyRoom: "Ruang Belajar",
      walkInCloset: "Walk-in Closet",
      intercom: "Interkom",
      generator: "Generator",
      waterHeater: "Pemanas Air",
      housekeeping: "Layanan Kebersihan",
      concierge: "Concierge",
      coworking: "Ruang Co-working",
      playground: "Taman Bermain Anak",
      bbqArea: "Area BBQ",
      nearMe: "Dekat Saya",
      searchNearby: "Cari Sekitar",
      radius: "Radius",
      gettingLocation: "Mendapatkan lokasi...",
      locationError: "Akses lokasi ditolak",
      within: "Dalam",
      selectProvince: "Pilih Provinsi",
      selectCity: "Pilih Kota",
      selectArea: "Pilih Area"
    }
  };
  const currentText = text[language];

  // Get user's current location
  const getUserLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      alert(currentText.locationError);
      setIsGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setUseNearbyLocation(true);
      setIsGettingLocation(false);
    }, error => {
      console.error('Geolocation error:', error);
      alert(currentText.locationError);
      setIsGettingLocation(false);
    });
  };
  const toggleSearchType = (type: 'location' | 'nearby') => {
    if (type === 'nearby') {
      if (!userLocation) {
        getUserLocation();
      } else {
        setUseNearbyLocation(true);
      }
    } else {
      setUseNearbyLocation(false);
    }
  };
  const staticPropertyTypes = [{
    value: 'villa',
    label: currentText.villa,
    icon: Building
  }, {
    value: 'apartment',
    label: currentText.apartment,
    icon: Building
  }, {
    value: 'house',
    label: currentText.house,
    icon: Home
  }, {
    value: 'townhouse',
    label: currentText.townhouse,
    icon: Home
  }, {
    value: 'condo',
    label: currentText.condo,
    icon: Building
  }, {
    value: 'land',
    label: currentText.land,
    icon: MapPin
  }, {
    value: 'office',
    label: currentText.office,
    icon: Building
  }];
  const propertyFeatures = [{
    id: 'parking',
    label: currentText.parking,
    icon: '🚗'
  }, {
    id: 'swimming_pool',
    label: currentText.pool,
    icon: '🏊'
  }, {
    id: 'gym',
    label: currentText.gym,
    icon: '💪'
  }, {
    id: 'garden',
    label: currentText.garden,
    icon: '🌿'
  }, {
    id: 'security',
    label: currentText.security,
    icon: '🔒'
  }, {
    id: 'furnished',
    label: currentText.furnished,
    icon: '🛋️'
  }, {
    id: 'elevator',
    label: currentText.elevator,
    icon: '🛗'
  }, {
    id: 'cctv',
    label: currentText.cctv,
    icon: '📹'
  }, {
    id: 'balcony',
    label: currentText.balcony,
    icon: '🏢'
  }, {
    id: 'storage',
    label: currentText.storage,
    icon: '📦'
  }, {
    id: 'maid_room',
    label: currentText.maidRoom,
    icon: '🏠'
  }, {
    id: 'study_room',
    label: currentText.studyRoom,
    icon: '📚'
  }, {
    id: 'walk_in_closet',
    label: currentText.walkInCloset,
    icon: '👗'
  }, {
    id: 'intercom',
    label: currentText.intercom,
    icon: '📞'
  }, {
    id: 'generator',
    label: currentText.generator,
    icon: '⚡'
  }, {
    id: 'water_heater',
    label: currentText.waterHeater,
    icon: '🚿'
  }];
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
    const baseTypes = dynamicPropertyTypes.length > 0 ? dynamicPropertyTypes.map(type => ({
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
    priceRanges: [{
      value: '500000000-1000000000',
      label: '500jt - 1M'
    }, {
      value: '1000000000-2000000000',
      label: '1M - 2M'
    }, {
      value: '2000000000-5000000000',
      label: '2M - 5M'
    }, {
      value: '5000000000-10000000000',
      label: '5M - 10M'
    }, {
      value: '10000000000+',
      label: '10M+'
    }],
    propertyTypes: propertyTypeOptions.filter(type => ['villa', 'house', 'townhouse', 'apartment', 'condo', 'land'].includes(type.value)),
    features: [{
      id: 'parking',
      label: currentText.parking,
      icon: '🚗'
    }, {
      id: 'swimming_pool',
      label: currentText.pool,
      icon: '🏊'
    }, {
      id: 'gym',
      label: currentText.gym,
      icon: '💪'
    }, {
      id: 'garden',
      label: currentText.garden,
      icon: '🌿'
    }, {
      id: 'security',
      label: currentText.security,
      icon: '🔒'
    }, {
      id: 'elevator',
      label: currentText.elevator,
      icon: '🛗'
    }, {
      id: 'cctv',
      label: currentText.cctv,
      icon: '📹'
    }, {
      id: 'balcony',
      label: currentText.balcony,
      icon: '🏢'
    }, {
      id: 'storage',
      label: currentText.storage,
      icon: '📦'
    }, {
      id: 'maid_room',
      label: currentText.maidRoom,
      icon: '🏠'
    }, {
      id: 'study_room',
      label: currentText.studyRoom,
      icon: '📚'
    }, {
      id: 'walk_in_closet',
      label: currentText.walkInCloset,
      icon: '👗'
    }, {
      id: 'intercom',
      label: currentText.intercom,
      icon: '📞'
    }, {
      id: 'generator',
      label: currentText.generator,
      icon: '⚡'
    }, {
      id: 'water_heater',
      label: currentText.waterHeater,
      icon: '🚿'
    }],
    facilities: [{
      id: 'air_conditioning',
      label: 'Air Conditioning (AC)',
      icon: '❄️'
    }, {
      id: 'heating',
      label: 'Heating',
      icon: '🔥'
    }, {
      id: 'internet_wifi',
      label: 'Wi-Fi / Internet',
      icon: '📶'
    }, {
      id: 'parking_space',
      label: 'Parking',
      icon: '🚗'
    }, {
      id: 'elevator_lift',
      label: 'Elevator / Lift',
      icon: '🛗'
    }, {
      id: 'swimming_pool_facility',
      label: 'Swimming Pool',
      icon: '🏊'
    }, {
      id: 'gym_fitness',
      label: 'Gym / Fitness Center',
      icon: '🏋️'
    }, {
      id: 'laundry',
      label: 'Laundry',
      icon: '🧺'
    }, {
      id: 'dishwasher',
      label: 'Dishwasher',
      icon: '🍽️'
    }, {
      id: 'balcony_terrace',
      label: 'Balcony / Terrace',
      icon: '🌿'
    }, {
      id: 'pet_friendly',
      label: 'Pet-Friendly',
      icon: '🐶'
    }, {
      id: 'furnished',
      label: 'Furnished',
      icon: '🛋️'
    }, {
      id: 'security_system',
      label: 'Security System',
      icon: '🔒'
    }, {
      id: 'garden_yard',
      label: 'Garden/Yard',
      icon: '🌳'
    }, {
      id: 'bbq_area',
      label: 'BBQ Area',
      icon: '🍖'
    }, {
      id: 'playground',
      label: 'Children\'s Playground',
      icon: '🎠'
    }, {
      id: 'cctv_surveillance',
      label: 'CCTV Surveillance',
      icon: '📹'
    }, {
      id: 'backup_generator',
      label: 'Backup Generator',
      icon: '⚡'
    }, {
      id: 'clubhouse',
      label: 'Clubhouse',
      icon: '🏛️'
    }, {
      id: 'tennis_court',
      label: 'Tennis Court',
      icon: '🎾'
    }, {
      id: 'concierge',
      label: 'Concierge / 24-hr Doorman',
      icon: '🛎️'
    }, {
      id: 'rooftop_lounge',
      label: 'Rooftop Deck / Lounge',
      icon: '🌆'
    }, {
      id: 'sauna_spa',
      label: 'Sauna / Spa / Steam Room',
      icon: '♨️'
    }, {
      id: 'coworking',
      label: 'Business Center / Co-working',
      icon: '💼'
    }, {
      id: 'ev_charging',
      label: 'EV Charging Station',
      icon: '🔌'
    }, {
      id: 'storage_unit',
      label: 'Storage Unit / Locker',
      icon: '📦'
    }, {
      id: 'bike_storage',
      label: 'Bike Storage',
      icon: '🚲'
    }, {
      id: 'guest_suite',
      label: 'Guest Suite',
      icon: '🏠'
    }, {
      id: 'wheelchair_accessible',
      label: 'Wheelchair Accessible',
      icon: '♿'
    }, {
      id: 'ground_floor',
      label: 'Ground Floor Unit',
      icon: '⬇️'
    }, {
      id: 'grab_bars',
      label: 'Grab Bars in Bathroom',
      icon: '🚿'
    }, {
      id: 'smoke_free',
      label: 'Smoke-Free Building',
      icon: '🚭'
    }, {
      id: 'gated_community',
      label: 'Gated Community',
      icon: '🚧'
    }, {
      id: 'utilities_included',
      label: 'Utilities Included',
      icon: '💡'
    }, {
      id: 'trash_recycling',
      label: 'Trash / Recycling',
      icon: '♻️'
    }, {
      id: 'snow_removal',
      label: 'Snow Removal',
      icon: '❄️'
    }, {
      id: 'pest_control',
      label: 'Pest Control',
      icon: '🐛'
    }, {
      id: 'onsite_maintenance',
      label: 'On-Site Maintenance',
      icon: '🔧'
    }, {
      id: 'near_transit',
      label: 'Near Public Transit',
      icon: '🚇'
    }, {
      id: 'walk_bike_score',
      label: 'Walk Score / Bike Score',
      icon: '🚶'
    }, {
      id: 'near_parks',
      label: 'Near Parks / Trails',
      icon: '🌲'
    }, {
      id: 'waterfront_view',
      label: 'Waterfront / Lake View',
      icon: '🌊'
    }, {
      id: 'smart_thermostat',
      label: 'Smart Thermostat',
      icon: '🌡️'
    }, {
      id: 'keyless_entry',
      label: 'Keyless Entry',
      icon: '🔑'
    }, {
      id: 'video_doorbell',
      label: 'Video Doorbell',
      icon: '📹'
    }, {
      id: 'smart_lighting',
      label: 'Smart Lighting',
      icon: '💡'
    }],
    maxPrice: 20000,
    priceStep: 500
  });
  const getRentFilters = () => ({
    priceRanges: [{
      value: '1000000-3000000',
      label: '1jt - 3jt/month'
    }, {
      value: '3000000-5000000',
      label: '3jt - 5jt/month'
    }, {
      value: '5000000-10000000',
      label: '5jt - 10jt/month'
    }, {
      value: '10000000-20000000',
      label: '10jt - 20jt/month'
    }, {
      value: '20000000+',
      label: '20jt+/month'
    }],
    propertyTypes: propertyTypeOptions.filter(type => ['apartment', 'condo', 'villa', 'house', 'townhouse', 'office'].includes(type.value)),
    features: [{
      id: 'furnished',
      label: currentText.furnished,
      icon: '🛋️'
    }, {
      id: 'wifi',
      label: currentText.wifi,
      icon: '📶'
    }, {
      id: 'ac',
      label: currentText.ac,
      icon: '❄️'
    }, {
      id: 'parking',
      label: currentText.parking,
      icon: '🅿️'
    }, {
      id: 'laundry',
      label: currentText.laundry,
      icon: '👕'
    }, {
      id: 'kitchen',
      label: currentText.kitchen,
      icon: '🍳'
    }, {
      id: 'pets_allowed',
      label: currentText.petsAllowed,
      icon: '🐕'
    }, {
      id: 'swimming_pool',
      label: currentText.pool,
      icon: '🏊'
    }, {
      id: 'gym',
      label: currentText.gym,
      icon: '💪'
    }, {
      id: 'security',
      label: currentText.security,
      icon: '🔒'
    }, {
      id: 'elevator',
      label: currentText.elevator,
      icon: '🛗'
    }, {
      id: 'cctv',
      label: currentText.cctv,
      icon: '📹'
    }, {
      id: 'balcony',
      label: currentText.balcony,
      icon: '🏢'
    }, {
      id: 'storage',
      label: currentText.storage,
      icon: '📦'
    }, {
      id: 'housekeeping',
      label: currentText.housekeeping,
      icon: '🧹'
    }, {
      id: 'concierge',
      label: currentText.concierge,
      icon: '🛎️'
    }, {
      id: 'coworking',
      label: currentText.coworking,
      icon: '💻'
    }, {
      id: 'playground',
      label: currentText.playground,
      icon: '🎠'
    }, {
      id: 'bbq_area',
      label: currentText.bbqArea,
      icon: '🔥'
    }, {
      id: 'intercom',
      label: currentText.intercom,
      icon: '📞'
    }, {
      id: 'generator',
      label: currentText.generator,
      icon: '⚡'
    }, {
      id: 'water_heater',
      label: currentText.waterHeater,
      icon: '🚿'
    }],
    facilities: [{
      id: 'air_conditioning',
      label: 'Air Conditioning (AC)',
      icon: '❄️'
    }, {
      id: 'heating',
      label: 'Heating',
      icon: '🔥'
    }, {
      id: 'internet_wifi',
      label: 'Wi-Fi / Internet',
      icon: '📶'
    }, {
      id: 'parking_space',
      label: 'Parking',
      icon: '🚗'
    }, {
      id: 'elevator_lift',
      label: 'Elevator / Lift',
      icon: '🛗'
    }, {
      id: 'swimming_pool_facility',
      label: 'Swimming Pool',
      icon: '🏊'
    }, {
      id: 'gym_fitness',
      label: 'Gym / Fitness Center',
      icon: '🏋️'
    }, {
      id: 'laundry',
      label: 'Laundry',
      icon: '🧺'
    }, {
      id: 'dishwasher',
      label: 'Dishwasher',
      icon: '🍽️'
    }, {
      id: 'balcony_terrace',
      label: 'Balcony / Terrace',
      icon: '🌿'
    }, {
      id: 'pet_friendly',
      label: 'Pet-Friendly',
      icon: '🐶'
    }, {
      id: 'furnished',
      label: 'Furnished',
      icon: '🛋️'
    }, {
      id: 'security_system',
      label: 'Security System',
      icon: '🔒'
    }, {
      id: 'washing_machine',
      label: 'Washing Machine',
      icon: '🧺'
    }, {
      id: 'refrigerator',
      label: 'Refrigerator',
      icon: '🧊'
    }, {
      id: 'stove_oven',
      label: 'Stove/Oven',
      icon: '🍳'
    }, {
      id: 'microwave',
      label: 'Microwave',
      icon: '🔥'
    }, {
      id: 'bedding_linens',
      label: 'Bedding/Linens',
      icon: '🛏️'
    }, {
      id: 'kitchen_utensils',
      label: 'Kitchen Utensils',
      icon: '🔪'
    }],
    maxPrice: 100,
    priceStep: 5
  });
  const getAllFilters = () => ({
    priceRanges: [{
      value: '100000000-500000000',
      label: '100jt - 500jt'
    }, {
      value: '500000000-1000000000',
      label: '500jt - 1M'
    }, {
      value: '1000000000-5000000000',
      label: '1M - 5M'
    }, {
      value: '5000000000+',
      label: '5M+'
    }],
    propertyTypes: propertyTypeOptions,
    features: propertyFeatures,
    facilities: [{
      id: 'air_conditioning',
      label: 'Air Conditioning (AC)',
      icon: '❄️'
    }, {
      id: 'heating',
      label: 'Heating',
      icon: '🔥'
    }, {
      id: 'internet_wifi',
      label: 'Wi-Fi / Internet',
      icon: '📶'
    }, {
      id: 'parking_space',
      label: 'Parking',
      icon: '🚗'
    }, {
      id: 'elevator_lift',
      label: 'Elevator / Lift',
      icon: '🛗'
    }, {
      id: 'swimming_pool_facility',
      label: 'Swimming Pool',
      icon: '🏊'
    }, {
      id: 'gym_fitness',
      label: 'Gym / Fitness Center',
      icon: '🏋️'
    }, {
      id: 'laundry',
      label: 'Laundry',
      icon: '🧺'
    }, {
      id: 'dishwasher',
      label: 'Dishwasher',
      icon: '🍽️'
    }, {
      id: 'balcony_terrace',
      label: 'Balcony / Terrace',
      icon: '🌿'
    }, {
      id: 'pet_friendly',
      label: 'Pet-Friendly',
      icon: '🐶'
    }, {
      id: 'furnished',
      label: 'Furnished',
      icon: '🛋️'
    }, {
      id: 'security_system',
      label: 'Security System',
      icon: '🔒'
    }],
    maxPrice: 15000,
    priceStep: 100
  });

  // Get current filters based on active tab - Memoized for performance
  const currentFilters = useMemo(() => {
    switch (activeTab) {
      case 'sale':
        return getSaleFilters();
      case 'rent':
        return getRentFilters();
      default:
        return getAllFilters();
    }
  }, [activeTab, propertyTypeOptions]);
  
  // Get database filters for current listing type - only show when listing type is selected
  const currentDbFilters = useMemo(() => {
    if (!dbFilters || dbFilters.length === 0) return [];
    
    // Only show filters if listing type is explicitly selected (not "all")
    if (!filters.listingType || filters.listingType === '') return [];
    
    const listingType = filters.listingType === 'sale' ? 'sale' : 'rent';
    
    return dbFilters.map(category => ({
      ...category,
      options: category.options.filter(opt => opt.listing_type === listingType)
    })).filter(category => category.options.length > 0);
  }, [dbFilters, filters.listingType]);
  
  // Get icon for category
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: Record<string, any> = {
      'specifications': Settings,
      'facilities': Building2,
      'investment': TrendingUp,
      'amenities': Star,
      'features': Sparkles,
      'utilities': Zap,
      'security': Shield,
      'parking': Car,
      'outdoor': Layers,
      'default': Package
    };
    
    const normalizedName = categoryName.toLowerCase();
    return iconMap[normalizedName] || iconMap.default;
  };

  // Get tooltip description for category
  const getCategoryTooltip = (category: any) => {
    if (!category || !category.options || category.options.length === 0) {
      return `${category.name.charAt(0).toUpperCase() + category.name.slice(1)} filters`;
    }
    
    const filterNames = category.options
      .slice(0, 5)
      .map((opt: any) => opt.filter_name)
      .join(', ');
    
    const moreCount = category.options.length > 5 ? ` +${category.options.length - 5} more` : '';
    
    return `${category.name.charAt(0).toUpperCase() + category.name.slice(1)}: ${filterNames}${moreCount}`;
  };

  // Count active filters in a category
  const getActiveFiltersInCategory = (category: any) => {
    if (!category || !category.options) return 0;
    
    let count = 0;
    category.options.forEach((filter: any) => {
      const filterValue = filters[filter.filter_name as keyof typeof filters];
      
      // Check if filter has a value
      if (Array.isArray(filterValue)) {
        if (filterValue.length > 0) count++;
      } else if (filterValue && filterValue !== '' && filterValue !== 'all') {
        count++;
      }
    });
    
    return count;
  };

  // Clear all filters in a category
  const clearCategoryFilters = (category: any) => {
    if (!category || !category.options) return;
    
    const clearedFilters: any = {};
    category.options.forEach((filter: any) => {
      const filterValue = filters[filter.filter_name as keyof typeof filters];
      
      // Reset based on type
      if (Array.isArray(filterValue)) {
        clearedFilters[filter.filter_name] = [];
      } else {
        clearedFilters[filter.filter_name] = '';
      }
    });
    
    setFilters(prev => ({ ...prev, ...clearedFilters }));
  };

  // Render database filter based on type with input validation
  const renderDatabaseFilter = (filter: any) => {
    // Validation: Ensure filter has required properties
    if (!filter || !filter.id || !filter.filter_name || !filter.filter_type) {
      console.warn('Invalid filter configuration:', filter);
      return null;
    }
    
    const filterValue = filters[filter.filter_name] || (filter.filter_type === 'checkbox' ? [] : '');
    
    switch (filter.filter_type) {
      case 'select':
        // Validation: Ensure filter_options exists and is an array
        const selectOptions = Array.isArray(filter.filter_options) && filter.filter_options.length > 0 
          ? filter.filter_options 
          : [];
        
        if (selectOptions.length === 0) {
          console.warn(`No options available for filter: ${filter.filter_name}`);
          return null;
        }
        
        return (
          <div key={filter.id} className="space-y-2">
            <Label className="text-xs md:text-sm font-bold text-foreground">{filter.filter_name}</Label>
            <Select 
              value={filterValue as string} 
              onValueChange={(value) => handleFilterChange(filter.filter_name, value)}
            >
              <SelectTrigger className="h-8 md:h-9">
                <SelectValue placeholder={`Select ${filter.filter_name}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {selectOptions.map((option: string, idx: number) => (
                  <SelectItem key={`${option}-${idx}`} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'checkbox':
        // Validation: Ensure filter_options exists and is an array
        const checkboxOptions = Array.isArray(filter.filter_options) && filter.filter_options.length > 0
          ? filter.filter_options 
          : [];
        
        if (checkboxOptions.length === 0) {
          console.warn(`No options available for filter: ${filter.filter_name}`);
          return null;
        }
        
        const selectedValues = Array.isArray(filterValue) ? filterValue : [];
        return (
          <div key={filter.id} className="space-y-2">
            <Label className="text-xs md:text-sm font-bold text-foreground">{filter.filter_name}</Label>
            <div className="flex flex-wrap gap-1.5">
              {checkboxOptions.map((option: string, idx: number) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <Badge 
                    key={`${option}-${idx}`}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer h-7 md:h-8 px-2 md:px-3 text-[10px] md:text-xs font-medium rounded-lg hover:bg-primary/10 transition-colors",
                      isSelected && "shadow-md ring-1 ring-primary/30"
                    )}
                    onClick={() => {
                      const newValues = isSelected 
                        ? selectedValues.filter((v: string) => v !== option)
                        : [...selectedValues, option];
                      handleFilterChange(filter.filter_name, newValues);
                    }}
                  >
                    {option}
                  </Badge>
                );
              })}
            </div>
          </div>
        );
        
      case 'range':
        return (
          <div key={filter.id} className="space-y-2">
            <Label className="text-xs md:text-sm font-bold text-foreground">{filter.filter_name}</Label>
            <Input 
              type="number"
              placeholder={`Enter ${filter.filter_name}`}
              value={filterValue as string}
              onChange={(e) => handleFilterChange(filter.filter_name, e.target.value)}
              className="h-8 md:h-9 text-xs md:text-sm"
            />
          </div>
        );
        
      case 'radio':
        // Handle radio button filters similar to select
        const radioOptions = Array.isArray(filter.filter_options) && filter.filter_options.length > 0 
          ? filter.filter_options 
          : [];
        
        if (radioOptions.length === 0) {
          console.warn(`No options available for filter: ${filter.filter_name}`);
          return null;
        }
        
        return (
          <div key={filter.id} className="space-y-2">
            <Label className="text-xs md:text-sm font-bold text-foreground">{filter.filter_name}</Label>
            <div className="flex flex-wrap gap-1.5">
              {radioOptions.map((option: string, idx: number) => {
                const isSelected = filterValue === option;
                return (
                  <Badge 
                    key={`${option}-${idx}`}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer h-7 md:h-8 px-2 md:px-3 text-[10px] md:text-xs font-medium rounded-lg hover:bg-primary/10 transition-colors",
                      isSelected && "shadow-md ring-1 ring-primary/30"
                    )}
                    onClick={() => handleFilterChange(filter.filter_name, option)}
                  >
                    {option}
                  </Badge>
                );
              })}
            </div>
          </div>
        );
        
      default:
        console.warn(`Unknown filter type: ${filter.filter_type} for filter: ${filter.filter_name}`);
        return null;
    }
  };
  const sortOptions = [{
    value: 'newest',
    label: currentText.newest
  }, {
    value: 'price_low',
    label: currentText.priceLow
  }, {
    value: 'price_high',
    label: currentText.priceHigh
  }, {
    value: 'area_large',
    label: currentText.areaLarge
  }];
  const yearOptions = [{
    value: '2024',
    label: '2024'
  }, {
    value: '2023',
    label: '2023'
  }, {
    value: '2022',
    label: '2022'
  }, {
    value: '2021',
    label: '2021'
  }, {
    value: '2020',
    label: '2020'
  }, {
    value: '2015-2019',
    label: '2015-2019'
  }, {
    value: '2010-2014',
    label: '2010-2014'
  }, {
    value: 'below-2010',
    label: 'Before 2010'
  }];
  const conditionOptions = [{
    value: 'new',
    label: 'New/Unoccupied'
  }, {
    value: 'excellent',
    label: 'Excellent'
  }, {
    value: 'good',
    label: 'Good'
  }, {
    value: 'needs_renovation',
    label: 'Needs Renovation'
  }];
  const furnishingOptions = [{
    value: 'fully',
    label: 'Fully Furnished'
  }, {
    value: 'semi',
    label: 'Semi-Furnished'
  }, {
    value: 'unfurnished',
    label: 'Unfurnished'
  }];
  const bedroomOptions = ['1', '2', '3', '4', '5+'];
  const bathroomOptions = ['1', '2', '3', '4+'];
  const parkingOptions = ['1', '2', '3', '4+'];

  // Rental duration options (1-12 months)
  const rentalDurationOptions = Array.from({
    length: 12
  }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i === 0 ? currentText.month : currentText.months}`
  }));

  // Trip purpose options
  const tripPurposeOptions = [{
    value: 'solo',
    label: currentText.solo,
    icon: '🧳'
  }, {
    value: 'business',
    label: currentText.business,
    icon: '💼'
  }, {
    value: 'family',
    label: currentText.family,
    icon: '👨‍👩‍👧‍👦'
  }, {
    value: 'group',
    label: currentText.group,
    icon: '👥'
  }, {
    value: 'couple',
    label: currentText.couple,
    icon: '💑'
  }, {
    value: 'other',
    label: currentText.other,
    icon: '🎯'
  }];

  // Calculate days between dates
  const calculateDays = () => {
    if (filters.checkInDate && filters.checkOutDate) {
      return differenceInDays(filters.checkOutDate, filters.checkInDate);
    }
    return 0;
  };

  // Debounced search query for performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Trigger live search with debounced value
  useEffect(() => {
    if (onLiveSearch && debouncedSearchQuery !== undefined) {
      onLiveSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, onLiveSearch]);
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);
  const handleFilterChange = (key: string, value: any) => {
    const actualValue = value === "all" ? "" : value;
    setFilters(prev => ({
      ...prev,
      [key]: actualValue
    }));
  };
  const handleFeatureToggle = (featureId: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(featureId) ? prev.features.filter(f => f !== featureId) : [...prev.features, featureId]
    }));
  };
  const handleFacilityToggle = (facilityId: string) => {
    setFilters(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facilityId) ? prev.facilities.filter(f => f !== facilityId) : [...prev.facilities, facilityId]
    }));
  };
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      // Skip sortBy as it always has a default value
      if (key === 'sortBy') return;

      // Skip priceRange and areaRange if they're at default cleared values
      if (key === 'priceRange' && Array.isArray(value) && value.length === 2) {
        const [min, max] = value;
        if (typeof min === 'number' && typeof max === 'number' && (min !== 0 || max !== 10000000000)) {
          count++;
        }
        return;
      }
      if (key === 'areaRange' && Array.isArray(value) && value.length === 2) {
        const [min, max] = value;
        if (typeof min === 'number' && typeof max === 'number' && (min !== 0 || max !== 1000)) {
          count++;
        }
        return;
      }

      // Count arrays (features, facilities) only if they have items
      if (key === 'features' || key === 'facilities') {
        if (Array.isArray(value) && value.length > 0) count++;
        return;
      }

      // Count date fields only if they're set
      if (key === 'checkInDate' || key === 'checkOutDate') {
        if (value !== null) count++;
        return;
      }

      // Count other fields only if they're not empty/null/undefined/'all'
      if (value && value !== '' && value !== 'all') {
        count++;
      }
    });
    return count;
  };
  const clearAllFilters = () => {
    setFilters({
      location: '',
      state: '',
      city: '',
      area: '',
      listingType: '',
      propertyType: '',
      priceRange: '',
      bedrooms: '',
      bathrooms: '',
      parking: '',
      minArea: '',
      maxArea: '',
      minPrice: 0,
      maxPrice: 0,
      features: [],
      facilities: [],
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

  // Image search handlers
  const handleImageSearch = async (base64Image: string) => {
    try {
      // Store the current search image
      setCurrentSearchImage(base64Image);
      
      // Add to recent searches
      addRecentSearch(base64Image);
      
      // Convert base64 to File object
      const base64Data = base64Image.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const file = new File([blob], 'search-image.jpg', { type: 'image/jpeg' });

      const results = await searchByImage(file);
      
      if (results && results.properties.length > 0) {
        toast.success(`Found ${results.properties.length} similar properties`);
        // You can handle the results here - maybe pass them to parent or navigate
      } else {
        toast.info('No similar properties found');
      }
    } catch (error) {
      console.error('Image search error:', error);
      toast.error('Failed to search by image');
    }
  };

  const handleClearImageSearch = () => {
    clearImageSearch();
    setCurrentSearchImage(null);
  };

  const handleRerunSearch = async (thumbnail: string) => {
    await handleImageSearch(thumbnail);
  };

  // Close filters and suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close suggestions if clicking outside the suggestions dropdown
      if (suggestionsRef.current && !suggestionsRef.current.contains(target) && showSuggestions) {
        setShowSuggestions(false);
      }

      // Close advanced filters if clicking outside
      if (advancedFiltersRef.current && !advancedFiltersRef.current.contains(target) && showAdvancedFilters && target.closest('.fixed.inset-0') // Only if clicking on backdrop
      ) {
        setShowAdvancedFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions, showAdvancedFilters]);

  // Keep mobile dropdown aligned to input on scroll/resize
  useEffect(() => {
    if (!isMobile) return;
    const updateTop = () => {
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setSuggestionsTop(rect.bottom);
      }
    };
    if (showSuggestions) {
      updateTop();
      window.addEventListener('resize', updateTop);
      window.addEventListener('scroll', updateTop, true);
    }
    return () => {
      window.removeEventListener('resize', updateTop);
      window.removeEventListener('scroll', updateTop, true);
    };
  }, [showSuggestions, isMobile]);

  // Removed manual scroll locking useEffect in favor of useScrollLock hook above

  const formatPrice = (price: number) => {
    if (price >= 1000) return `${price / 1000} M`;
    return `${price} Jt`;
  };
  const getSelectedFiltersDisplay = () => {
    const selected = [];

    // Combine location parts with null safety
    const locationParts = [];
    if (filters.state && filters.state !== 'all') {
      const province = provinces.find(p => p.code === filters.state);
      locationParts.push(province?.name || filters.state);
    }
    if (filters.city && filters.city !== 'all') {
      const city = cities.find(c => c.code === filters.city);
      locationParts.push(city?.name || filters.city);
    }
    if (filters.area && filters.area !== 'all') {
      const area = areas.find(a => a.code === filters.area);
      locationParts.push(area?.name || filters.area);
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
    // 🔒 CRITICAL: Preserve scroll position to prevent iPhone Safari jump
    const currentScroll = window.scrollY;

    // 📳 PRO: Haptic feedback for search action on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
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
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      features: filters.features,
      yearBuilt: filters.yearBuilt === 'all' ? '' : filters.yearBuilt,
      condition: filters.condition === 'all' ? '' : filters.condition,
      sortBy: filters.sortBy,
      nearbySearch: useNearbyLocation,
      userLocation: userLocation,
      radius: nearbyRadius
    };
    console.log('Search data being sent:', searchData);
    
    // Save to recent searches if query is not empty
    if (searchQuery.trim()) {
      const updatedRecent = [
        searchQuery.trim(),
        ...recentSearchTerms.filter(term => term !== searchQuery.trim())
      ].slice(0, 5); // Keep only last 5 searches
      
      setRecentSearchTerms(updatedRecent);
      localStorage.setItem('recentSearchTerms', JSON.stringify(updatedRecent));
    }
    
    onSearch(searchData);

    // 🔒 CRITICAL: Restore scroll position after React updates
    requestAnimationFrame(() => window.scrollTo(0, currentScroll));
  };

  // Simple mobile view - fixed search panel at top
  if (isMobile) {
    return (
      <div className="w-full">
        <div className="fixed top-[56px] left-2 right-2 z-40 bg-gradient-to-b from-background/98 via-background/95 to-background/90 backdrop-blur-xl border-2 border-primary/30 shadow-lg shadow-primary/10 rounded-2xl">
      {/* Search Bar */}
      <div className="flex items-center gap-1.5 p-2">
        <div ref={anchorRef} className="flex-1 relative">
          <Search className={cn(
            "absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-blue-500 pointer-events-none transition-all",
            searchQuery && "animate-pulse"
          )} />
          <Input 
            placeholder={currentText.searchPlaceholder} 
            value={searchQuery} 
            onChange={e => handleSearchChange(e.target.value)} 
            onFocus={(e) => { 
              e.preventDefault();
              const currentScroll = window.scrollY;
              setShowSuggestions(true); 
              if (anchorRef.current) { 
                const rect = anchorRef.current.getBoundingClientRect(); 
                setSuggestionsTop(rect.bottom); 
              }
              requestAnimationFrame(() => window.scrollTo(0, currentScroll));
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            className="pl-9 pr-2 h-10 text-base bg-background/70 backdrop-blur-sm border-2 border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg focus:shadow-primary/20 rounded-2xl font-medium shadow-md transition-all duration-500 hover:border-primary/60 hover:shadow-primary/20" 
          />
        </div>
        
        <ImageSearchButton
          onImageSelected={handleImageSearch}
          onClear={handleClearImageSearch}
          isSearching={isImageSearching}
          enableDragDrop={true}
          enablePaste={true}
          className="shrink-0"
        />
        
        {/* Prominent All Filters Button */}
          <Button 
            onClick={() => {
              setShowAdvancedFilters(true);
            }} 
            variant="outline" 
            size="sm" 
            className="h-9 px-3 border-2 border-primary/60 bg-gradient-to-r from-primary/15 to-primary/10 hover:from-primary/25 hover:to-primary/20 shadow-md hover:shadow-lg hover:shadow-primary/20 rounded-2xl relative transition-all duration-500 hover:scale-110"
          >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          {getActiveFiltersCount() > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full animate-pulse shadow-lg ring-2 ring-primary/50 bg-gradient-to-br from-primary to-accent"
            >
              <span className="animate-in zoom-in duration-200">
                {getActiveFiltersCount()}
              </span>
            </Badge>
          )}
        </Button>
        
        <Button onClick={handleSearch} variant="default" size="sm" className="h-9 px-3 border-0 bg-gradient-to-r from-primary via-accent to-primary hover:from-accent hover:via-primary hover:to-accent shadow-lg shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 hover:scale-110 rounded-xl transition-all duration-500 animate-gradient">
          <Search className="h-4 w-4 transition-all duration-500" />
        </Button>
      </div>
            
            {/* Mobile Suggestions Dropdown */}
            {showSuggestions && hasSuggestions && (
              <div 
                ref={suggestionsRef} 
                className="fixed left-2 right-2 rounded-xl shadow-2xl shadow-primary/30 z-[1000] max-h-[60vh] overflow-y-auto overscroll-contain glass-popup backdrop-blur-2xl border-primary/20" 
                style={{ top: suggestionsTop }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {/* Recent Searches */}
                {filteredSuggestions.recent.length > 0 && (
                  <div className="p-2 border-b border-border/50">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                        <Clock className="h-2.5 w-2.5 text-blue-500" />
                        Recent
                      </div>
                      <button 
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentScroll = window.scrollY;
                          setRecentSearchTerms([]);
                          localStorage.removeItem('recentSearchTerms');
                          requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                        className="text-[9px] text-muted-foreground hover:text-destructive"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="space-y-0.5">
                      {filteredSuggestions.recent.map((term, i) => (
                        <button 
                          key={i} 
                          type="button" 
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentScroll = window.scrollY;
                            trackSuggestionClick(term);
                            setSearchQuery(term);
                            setShowSuggestions(false);
                            handleSearch();
                            requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="w-full text-left px-2 py-1.5 text-[10px] text-foreground hover:bg-primary/10 rounded-lg transition-all duration-500 flex items-center gap-2 hover:scale-105"
                        >
                          <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                          {term}
                          {getDisplayCount(term) > 0 && (
                            <span className="ml-auto text-[8px] text-muted-foreground">
                              {getDisplayCount(term)}x
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Location Suggestions */}
                {filteredSuggestions.locations.length > 0 && (
                  <div className="p-2 border-b border-border/50">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground mb-1.5">
                      <MapPin className="h-2.5 w-2.5 text-purple-500" />
                      Locations
                    </div>
                    <div className="space-y-0.5">
                      {filteredSuggestions.locations.map((location, i) => (
                        <button 
                          key={i} 
                          type="button" 
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentScroll = window.scrollY;
                            trackSuggestionClick(location);
                            setSearchQuery(location);
                            setShowSuggestions(false);
                            handleSearch();
                            requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="w-full text-left px-2 py-1.5 text-[10px] text-foreground hover:bg-purple-500/10 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                          {location}
                          {getDisplayCount(location) > 0 && (
                            <span className="ml-auto text-[8px] text-muted-foreground">
                              {getDisplayCount(location)}x
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Trending */}
                {filteredSuggestions.trending.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground mb-1.5">
                      <TrendingUp className="h-2.5 w-2.5 text-green-500" />
                      Trending
                    </div>
                    <div className="space-y-0.5">
                      {filteredSuggestions.trending.map((trend, i) => (
                        <button 
                          key={i} 
                          type="button" 
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentScroll = window.scrollY;
                            trackSuggestionClick(trend);
                            setSearchQuery(trend);
                            setShowSuggestions(false);
                            handleSearch();
                            requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="w-full text-left px-2 py-1.5 text-[10px] text-foreground hover:bg-primary/10 rounded-lg transition-all duration-500 flex items-center justify-between hover:scale-105"
                        >
                          <span>{trend}</span>
                          {getDisplayCount(trend) > 0 && (
                            <span className="text-[8px] text-muted-foreground">
                              {getDisplayCount(trend)}x
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Recent Image Searches */}
            <div className="px-2 pb-2">
              <RecentImageSearches 
                key={recentSearchesKey}
                onRerunSearch={handleRerunSearch}
              />
            </div>
            
            {/* Quick Preset Filters */}
            <div className="hidden px-2 pb-1">
              <div className="flex items-center gap-1 mb-1">
                <Zap className="h-2.5 w-2.5 text-yellow-500" />
                <span className="text-[9px] font-semibold text-muted-foreground">Quick Search</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {/* Under 1B Preset */}
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => {
                    handleFilterChange('minPrice', 0);
                    handleFilterChange('maxPrice', 1000000000);
                    handleSearch();
                  }}
                  className="h-6 px-2 text-[9px] rounded-lg shrink-0 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium animate-in fade-in duration-200"
                >
                  <DollarSign className="h-2.5 w-2.5 mr-0.5" />
                  Under 1B
                </Button>
                
                {/* Near MRT Preset */}
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => {
                    setSearchQuery('Near MRT');
                    setTimeout(handleSearch, 100);
                  }}
                  className="h-6 px-2 text-[9px] rounded-lg shrink-0 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium animate-in fade-in duration-200"
                  style={{ animationDelay: '50ms' }}
                >
                  <MapPin className="h-2.5 w-2.5 mr-0.5" />
                  Near MRT
                </Button>
                
                {/* 2+ Beds Preset */}
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => {
                    handleFilterChange('bedrooms', '2');
                    handleSearch();
                  }}
                  className="h-6 px-2 text-[9px] rounded-lg shrink-0 border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-medium animate-in fade-in duration-200"
                  style={{ animationDelay: '100ms' }}
                >
                  <Bed className="h-2.5 w-2.5 mr-0.5" />
                  2+ Beds
                </Button>
                
                {/* New Projects Preset */}
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => {
                    setActiveTab('new_project');
                    handleSearch();
                  }}
                  className="h-6 px-2 text-[9px] rounded-lg shrink-0 border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium animate-in fade-in duration-200"
                  style={{ animationDelay: '150ms' }}
                >
                  <Rocket className="h-2.5 w-2.5 mr-0.5" />
                  New
                </Button>
                
                {/* Apartments Preset */}
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => {
                    handleFilterChange('propertyType', 'apartment');
                    handleSearch();
                  }}
                  className="h-6 px-2 text-[9px] rounded-lg shrink-0 border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-medium animate-in fade-in duration-200"
                  style={{ animationDelay: '200ms' }}
                >
                  <Building className="h-2.5 w-2.5 mr-0.5" />
                  Apartments
                </Button>
              </div>
            </div>
            
            {/* Inline Quick Filters - Hidden on mobile */}
            <div className="hidden md:flex px-2 pb-2 gap-1.5 overflow-x-auto no-scrollbar">
              {/* Property Type Quick Filter */}
              <Button 
                variant={filters.propertyType && filters.propertyType !== 'all' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowAdvancedFilters(true)}
                className="h-7 px-2.5 text-[10px] rounded-lg shrink-0 border-0 bg-background/60"
              >
                <Home className="h-3 w-3 mr-1" />
                {filters.propertyType && filters.propertyType !== 'all' ? filters.propertyType : 'Type'}
              </Button>
              
              {/* Bedrooms Quick Filter */}
              <Button 
                variant={filters.bedrooms && filters.bedrooms !== 'all' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowAdvancedFilters(true)}
                className="h-7 px-2.5 text-[10px] rounded-lg shrink-0 border-0 bg-background/60"
              >
                <Bed className="h-3 w-3 mr-1" />
                {filters.bedrooms && filters.bedrooms !== 'all' ? `${filters.bedrooms} Bed` : 'Beds'}
              </Button>
              
              {/* Bathrooms Quick Filter */}
              <Button 
                variant={filters.bathrooms && filters.bathrooms !== 'all' ? "default" : "outline"} 
                size="sm" 
                onClick={() => setShowAdvancedFilters(true)}
                className="h-7 px-2.5 text-[10px] rounded-lg shrink-0 border-0 bg-background/60"
              >
                <Bath className="h-3 w-3 mr-1" />
                {filters.bathrooms && filters.bathrooms !== 'all' ? `${filters.bathrooms} Bath` : 'Baths'}
              </Button>
            </div>
          </div>

        {/* Advanced Filters Modal using slim component */}
        <AdvancedFilters 
          language={language}
          onFiltersChange={(newFilters) => {
            setFilters(prev => ({ ...prev, ...newFilters }));
          }}
          onSearch={(searchData) => {
            onSearch(searchData);
            setShowAdvancedFilters(false);
          }}
          open={showAdvancedFilters}
          onOpenChange={setShowAdvancedFilters}
        />
        {/* Spacer for fixed search panel */}
        <div className="h-14" />
      </div>
    );
  }
  return <div className="w-full transition-all duration-500">
    <div className={cn("sticky z-30 transition-all duration-500", isMobile ? "top-[60px] md:top-[64px] lg:top-[68px] px-1 py-2" : "top-0 max-w-7xl mx-auto")}>
      {/* Glassmorphic Luxury Container */}
      <div className="glass-popup backdrop-blur-2xl border border-primary/30 rounded-2xl shadow-2xl shadow-primary/40 hover:shadow-3xl hover:shadow-primary/60 transition-all duration-700 bg-gradient-to-br from-background/60 via-background/40 to-primary/5 overflow-hidden">
        <div className={cn("space-y-1.5 backdrop-blur-xl border border-primary/20 rounded-xl bg-gradient-to-br from-background/70 via-background/50 to-background/30 shadow-inner", isMobile ? "p-1.5" : "p-2 lg:p-3")}>
          
          {/* Compact Tabs for Sale/Rent/All */}
          <div className="flex justify-center">
            <div className={cn("inline-flex rounded-lg border-0 shadow-md shadow-primary/10 relative", isMobile ? "p-0.5 bg-muted/60" : "p-0.5 bg-background/40 backdrop-blur-xl")}>
              {/* Sliding gold gradient background indicator */}
              <div className="absolute inset-y-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-md shadow-lg shadow-primary/30 transition-all duration-500 ease-out animate-gradient" style={{
              width: 'calc(25% - 2px)',
              left: activeTab === 'all' ? '2px' : activeTab === 'sale' ? 'calc(25% + 1px)' : activeTab === 'rent' ? 'calc(50%)' : 'calc(75% - 1px)'
            }} />
              
              <button onClick={() => { setActiveTab('all'); }} className={cn("relative z-10 rounded-md font-semibold uppercase tracking-wide transition-all duration-500 flex-1 flex items-center justify-center gap-0.5 hover:scale-105", isMobile ? "px-1.5 py-1 text-[8px] min-w-[42px]" : "px-2 py-1 text-[9px] min-w-[50px]", activeTab === 'all' ? 'text-primary-foreground drop-shadow-lg' : 'text-muted-foreground hover:text-primary')}>
                <Layers className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "transition-all duration-500")} />
                <span className={cn(isMobile ? "hidden" : "inline")}>{currentText.all}</span>
              </button>
              <button onClick={() => { setActiveTab('sale'); }} className={cn("relative z-10 rounded-md font-semibold uppercase tracking-wide transition-all duration-500 flex-1 flex items-center justify-center gap-0.5 hover:scale-105", isMobile ? "px-1.5 py-1 text-[8px] min-w-[42px]" : "px-2 py-1 text-[9px] min-w-[50px]", activeTab === 'sale' ? 'text-primary-foreground drop-shadow-lg' : 'text-muted-foreground hover:text-primary')}>
                <ShoppingBag className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "transition-all duration-500")} />
                <span>{isMobile ? "Buy" : currentText.forSale}</span>
              </button>
              <button onClick={() => { setActiveTab('rent'); }} className={cn("relative z-10 rounded-md font-semibold uppercase tracking-wide transition-all duration-500 flex-1 flex items-center justify-center gap-0.5 hover:scale-105", isMobile ? "px-1.5 py-1 text-[8px] min-w-[42px]" : "px-2 py-1 text-[9px] min-w-[50px]", activeTab === 'rent' ? 'text-primary-foreground drop-shadow-lg' : 'text-muted-foreground hover:text-primary')}>
                <Key className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "transition-all duration-500")} />
                <span>{isMobile ? "Rent" : currentText.forRent}</span>
              </button>
              <button onClick={() => { setActiveTab('new_project'); }} className={cn("relative z-10 rounded-md font-semibold uppercase tracking-wide transition-all duration-500 flex-1 flex items-center justify-center gap-0.5 hover:scale-105", isMobile ? "px-1.5 py-1 text-[8px] min-w-[42px]" : "px-2 py-1 text-[9px] min-w-[50px]", activeTab === 'new_project' ? 'text-primary-foreground drop-shadow-lg' : 'text-muted-foreground hover:text-primary')}>
                <Rocket className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "transition-all duration-500")} />
                <span>{isMobile ? "New" : currentText.newProject}</span>
              </button>
            </div>
          </div>
          
          
          {/* Compact Search Row with Location Options */}
          <div className={cn("flex", isMobile ? "gap-1" : "gap-2 lg:gap-3")}>
            <div className="flex-1 relative">
              <Search className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 text-primary pointer-events-none transition-all duration-500", 
                isMobile ? "h-3 w-3 left-2" : "h-4 w-4",
                searchQuery && "animate-pulse"
              )} />
              <Input 
                placeholder={currentText.searchPlaceholder} 
                value={searchQuery} 
                onChange={e => handleSearchChange(e.target.value)} 
                onFocus={() => setShowSuggestions(true)} 
                className={cn(
                  "border-2 border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-lg focus:shadow-primary/30 rounded-xl transition-all duration-500 shadow-md font-medium hover:border-primary/60 hover:shadow-primary/20", 
                  isMobile ? "pl-8 pr-16 h-8 text-xs bg-background/80 backdrop-blur-sm" : "pl-10 pr-28 h-9 text-sm bg-background/70 backdrop-blur-md"
                )} 
              />
              
              {/* Location Options and Image Search Inside Input */}
              <div className={cn("absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center", isMobile ? "gap-0.5" : "gap-1")}>
                <ImageSearchButton
                  onImageSelected={handleImageSearch}
                  onClear={handleClearImageSearch}
                  isSearching={isImageSearching}
                  enableDragDrop={true}
                  enablePaste={true}
                  className="shrink-0"
                />
                <Button onClick={() => toggleSearchType('location')} variant="ghost" size="sm" aria-label={currentText.location} className={cn("p-0 rounded-md transition-all duration-500 hover:scale-110", isMobile ? "h-6 w-6" : "h-7 w-7", !useNearbyLocation ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-primary/5')} title={currentText.location}>
                  <MapPin className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "transition-all duration-500")} />
                </Button>
                <Button onClick={() => toggleSearchType('nearby')} variant="ghost" size="sm" aria-label={isGettingLocation ? currentText.gettingLocation : currentText.nearMe} className={cn("p-0 rounded-md relative transition-all duration-500 hover:scale-110", isMobile ? "h-6 w-6" : "h-7 w-7", useNearbyLocation ? 'bg-primary/10 text-primary hover:bg-primary/20 shadow-md shadow-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-primary/5')} disabled={isGettingLocation} title={isGettingLocation ? currentText.gettingLocation : currentText.nearMe}>
                  {isGettingLocation ? <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin h-3 w-3 border-2 border-primary rounded-full border-t-transparent" />
                    </div> : <MapPin className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "transition-all duration-500")} fill={useNearbyLocation ? "currentColor" : "none"} />}
                </Button>
                
                {/* 🔒 FIXED: Loading overlay for geolocation - Better UX */}
                {isGettingLocation && <div className="absolute inset-0 glass-effect flex items-center justify-center rounded-xl z-10 backdrop-blur-sm border border-primary/20">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent" />
                      <span className="text-primary">{currentText.gettingLocation}</span>
                    </div>
                  </div>}
              </div>
              
              {/* Smart Suggestions Dropdown */}
              {showSuggestions && hasSuggestions && <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 glass-popup backdrop-blur-2xl border-primary/20 rounded-xl shadow-2xl shadow-primary/30 z-[100] max-h-80 overflow-y-auto">
                  {/* Recent Searches */}
                  {filteredSuggestions.recent.length > 0 && <div className="p-2 border-b border-border/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                          <Clock className="h-2.5 w-2.5 text-primary" />
                          Recent Searches
                        </div>
                        <button 
                          onClick={e => {
                            e.stopPropagation();
                            setRecentSearchTerms([]);
                            localStorage.removeItem('recentSearchTerms');
                          }} 
                          className="text-[9px] text-muted-foreground hover:text-destructive"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {filteredSuggestions.recent.map((term, i) => (
                          <button 
                            key={i} 
                            type="button" 
                            onClick={e => {
                              e.stopPropagation();
                              trackSuggestionClick(term);
                              setSearchQuery(term);
                              setShowSuggestions(false);
                              handleSearch();
                            }} 
                            className="w-full text-left px-2 py-1.5 text-[10px] text-foreground hover:bg-primary/10 rounded-lg transition-all duration-500 flex items-center gap-2 hover:scale-105"
                          >
                            <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                            {term}
                            {getDisplayCount(term) > 0 && (
                              <span className="ml-auto text-[8px] text-muted-foreground">
                                {getDisplayCount(term)}x
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>}
                  
                  {/* Location Suggestions */}
                  {filteredSuggestions.locations.length > 0 && <div className="p-2 border-b border-border/50">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground mb-1.5">
                        <MapPin className="h-2.5 w-2.5 text-purple-500" />
                        Locations
                      </div>
                      <div className="space-y-0.5">
                        {filteredSuggestions.locations.map((location, i) => (
                          <button 
                            key={i} 
                            type="button" 
                            onClick={e => {
                              e.stopPropagation();
                              trackSuggestionClick(location);
                              setSearchQuery(location);
                              setShowSuggestions(false);
                              handleSearch();
                            }} 
                            className="w-full text-left px-2 py-1.5 text-[10px] text-foreground hover:bg-purple-500/10 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                            {location}
                            {getDisplayCount(location) > 0 && (
                              <span className="ml-auto text-[8px] text-muted-foreground">
                                {getDisplayCount(location)}x
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>}
                  
                  {/* Trending */}
                  {filteredSuggestions.trending.length > 0 && <div className="p-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground mb-1.5">
                        <TrendingUp className="h-2.5 w-2.5 text-green-500" />
                        Trending
                      </div>
                      <div className="space-y-0.5">
                        {filteredSuggestions.trending.map((trend, i) => <button key={i} type="button" onClick={e => {
                    e.stopPropagation();
                    trackSuggestionClick(trend);
                    setSearchQuery(trend);
                    setShowSuggestions(false);
                    handleSearch();
                  }} className="w-full text-left px-2 py-1.5 text-[10px] text-foreground hover:bg-green-500/10 rounded-lg transition-colors flex items-center justify-between">
                            <span>{trend}</span>
                            {getDisplayCount(trend) > 0 && (
                              <span className="text-[8px] text-muted-foreground">
                                {getDisplayCount(trend)}x
                              </span>
                            )}
                          </button>)}
                      </div>
                    </div>}
                </div>}
            </div>
            
            <Button onClick={handleSearch} aria-label={currentText.search} className={cn("bg-gradient-to-r from-primary via-accent to-primary hover:from-accent hover:via-primary hover:to-accent text-primary-foreground font-medium rounded-xl shadow-lg shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 flex items-center hover:scale-110 animate-gradient", isMobile ? "h-8 px-2.5 text-xs gap-1" : "h-9 px-4 text-sm gap-1.5")}>
              <Search className={cn(isMobile ? "h-3 w-3" : "h-4 w-4", "transition-all duration-500")} />
              {!isMobile && <span className="hidden sm:inline">{currentText.search}</span>}
            </Button>
          </div>
          
          {/* Recent Image Searches - Desktop */}
          <div className="px-2">
            <RecentImageSearches 
              key={recentSearchesKey}
              onRerunSearch={handleRerunSearch}
            />
          </div>
          
          {/* Radius Selector - Shows when Near Me is active */}
          {useNearbyLocation && userLocation && <div className="flex items-center justify-center gap-2 animate-fade-in">
              <Select value={nearbyRadius.toString()} onValueChange={value => setNearbyRadius(parseInt(value))}>
                <SelectTrigger className="w-32 h-7 text-[9px] rounded-lg border-blue-300 dark:border-blue-700">
                  <MapPin className="h-2 w-2 mr-1 text-blue-500" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1" className="text-[9px]">{currentText.within} 1 km</SelectItem>
                  <SelectItem value="3" className="text-[9px]">{currentText.within} 3 km</SelectItem>
                  <SelectItem value="5" className="text-[9px]">{currentText.within} 5 km</SelectItem>
                  <SelectItem value="10" className="text-[9px]">{currentText.within} 10 km</SelectItem>
                  <SelectItem value="20" className="text-[9px]">{currentText.within} 20 km</SelectItem>
                  <SelectItem value="50" className="text-[9px]">{currentText.within} 50 km</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-[9px] text-amber-600 dark:text-amber-400">⚠️ GPS Required</span>
            </div>}

          {/* Results Count */}
          {resultsCount !== undefined && <div className="text-center">
              <p className={cn("text-muted-foreground bg-muted/30 rounded-md backdrop-blur-sm inline-block", isMobile ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1")}>
                {resultsCount} {currentText.resultsFound}
              </p>
            </div>}

          {/* Selected Filters Display */}
          {getSelectedFiltersDisplay().length > 0 && <div className="flex flex-wrap gap-1 justify-center">
              {getSelectedFiltersDisplay().map((filter, index) => <span key={index} className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-md backdrop-blur-sm border border-primary/30">
                  {filter}
                </span>)}
            </div>}

          {/* Compact Filter Row - Property Type + Bedrooms + Bathrooms + Location Button */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Property Type Button - Opens Popover */}
            <Popover open={isPropertyTypeOpen} onOpenChange={setIsPropertyTypeOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    const currentScroll = window.scrollY;
                    setIsPropertyTypeOpen(!isPropertyTypeOpen);
                    requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  className={cn("rounded-lg transition-all shadow-sm", isMobile ? "h-7 px-2 text-[10px] bg-card border-border" : "h-8 px-3 text-xs bg-background border-border", filters.propertyType && filters.propertyType !== 'all' && "border-primary bg-primary/10")}
                >
                  <Home className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "mr-1 text-primary")} />
                  {filters.propertyType && filters.propertyType !== 'all' ? currentFilters.propertyTypes.find(t => t.value === filters.propertyType)?.label || currentText.propertyType : currentText.propertyType}
                  {filters.propertyType && filters.propertyType !== 'all' && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary" />}
                </Button>
              </PopoverTrigger>
                <PopoverContent 
                  className="w-64 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[99999]" 
                  align="start" 
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onCloseAutoFocus={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <Home className="h-3.5 w-3.5 text-blue-500" />
                      {currentText.propertyType}
                    </h4>
                  </div>
                  
                  {/* Property Type Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={!filters.propertyType || filters.propertyType === 'all' ? "default" : "outline"} 
                      size="sm" 
                      className="h-8 text-xs justify-start" 
                      onClick={(e) => {
                        e.preventDefault();
                        const currentScroll = window.scrollY;
                        handleFilterChange('propertyType', 'all');
                        requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                      }}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                      {currentText.any}
                    </Button>
                    {currentFilters.propertyTypes.map(type => <Button 
                      key={type.value} 
                      variant={filters.propertyType === type.value ? "default" : "outline"} 
                      size="sm" 
                      className="h-8 text-xs justify-start" 
                      onClick={(e) => {
                        e.preventDefault();
                        const currentScroll = window.scrollY;
                        handleFilterChange('propertyType', type.value);
                        requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                      }}
                      onTouchStart={(e) => e.stopPropagation()}
                    >
                        {type.label}
                      </Button>)}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Bedrooms +/- */}
            <div className={cn("inline-flex items-center rounded-lg overflow-hidden shadow-sm border", isMobile ? "bg-card border-border" : "bg-background border-border")}>
              <div className={cn("flex items-center gap-0.5 px-1", isMobile ? "h-7" : "h-8")}>
                <Bed className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "text-primary")} />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={cn("p-0 hover:bg-muted rounded", isMobile ? "h-5 w-5" : "h-6 w-6")} 
                  onClick={(e) => {
                    e.preventDefault();
                    const currentScroll = window.scrollY;
                    const current = !filters.bedrooms || filters.bedrooms === 'all' ? 0 : parseInt(String(filters.bedrooms).replace('+', ''));
                    if (current > 0) {
                      const next = current - 1;
                      handleFilterChange('bedrooms', next === 0 ? 'all' : String(next));
                    }
                    requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <span className={cn("font-bold", isMobile ? "text-xs" : "text-sm")}>−</span>
                </Button>
                <span className={cn("min-w-[20px] flex items-center justify-center font-semibold text-foreground", isMobile ? "text-[10px] px-1" : "text-xs px-1.5")}>
                  {!filters.bedrooms || filters.bedrooms === 'all' ? '0' : String(filters.bedrooms).replace('+', '')}
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={cn("p-0 hover:bg-muted rounded", isMobile ? "h-5 w-5" : "h-6 w-6")} 
                  onClick={(e) => {
                    e.preventDefault();
                    const currentScroll = window.scrollY;
                    const current = !filters.bedrooms || filters.bedrooms === 'all' ? 0 : parseInt(String(filters.bedrooms).replace('+', ''));
                    if (current < 10) {
                      handleFilterChange('bedrooms', String(current + 1));
                    }
                    requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <span className={cn("font-bold", isMobile ? "text-xs" : "text-sm")}>+</span>
                </Button>
              </div>
            </div>

            {/* Bathrooms +/- */}
            <div className={cn("inline-flex items-center rounded-lg overflow-hidden shadow-sm border", isMobile ? "bg-card border-border" : "bg-background border-border")}>
              <div className={cn("flex items-center gap-0.5 px-1", isMobile ? "h-7" : "h-8")}>
                <Bath className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "text-primary")} />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={cn("p-0 hover:bg-muted rounded", isMobile ? "h-5 w-5" : "h-6 w-6")} 
                  onClick={(e) => {
                    e.preventDefault();
                    const currentScroll = window.scrollY;
                    const current = !filters.bathrooms || filters.bathrooms === 'all' ? 0 : parseInt(String(filters.bathrooms).replace('+', ''));
                    if (current > 0) {
                      const next = current - 1;
                      handleFilterChange('bathrooms', next === 0 ? 'all' : String(next));
                    }
                    requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <span className={cn("font-bold", isMobile ? "text-xs" : "text-sm")}>−</span>
                </Button>
                <span className={cn("min-w-[20px] flex items-center justify-center font-semibold text-foreground", isMobile ? "text-[10px] px-1" : "text-xs px-1.5")}>
                  {!filters.bathrooms || filters.bathrooms === 'all' ? '0' : String(filters.bathrooms).replace('+', '')}
                </span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className={cn("p-0 hover:bg-muted rounded", isMobile ? "h-5 w-5" : "h-6 w-6")} 
                  onClick={(e) => {
                    e.preventDefault();
                    const currentScroll = window.scrollY;
                    const current = !filters.bathrooms || filters.bathrooms === 'all' ? 0 : parseInt(String(filters.bathrooms).replace('+', ''));
                    if (current < 10) {
                      handleFilterChange('bathrooms', String(current + 1));
                    }
                    requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <span className={cn("font-bold", isMobile ? "text-xs" : "text-sm")}>+</span>
                </Button>
              </div>
            </div>

            {/* Location Button - Opens Popover with 3 selects */}
            {!useNearbyLocation && <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault();
                      const currentScroll = window.scrollY;
                      setIsLocationOpen(!isLocationOpen);
                      requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={cn("group relative overflow-hidden bg-gradient-to-r from-background to-background/80 backdrop-blur-sm border-2 border-border/50 rounded-xl hover:border-primary/50 hover:shadow-lg transition-all duration-300", isMobile ? "h-9 px-3 text-xs" : "h-10 px-4 text-sm", (filters.state && filters.state !== 'all' || filters.city && filters.city !== 'all' || filters.area && filters.area !== 'all') && "border-primary/70 bg-primary/5 shadow-md")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <MapPin className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "mr-2 text-primary relative z-10 group-hover:scale-110 transition-transform duration-300")} />
                    <span className="relative z-10 font-medium">{currentText.location}</span>
                    {(filters.state && filters.state !== 'all' || filters.city && filters.city !== 'all' || filters.area && filters.area !== 'all') && <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm animate-in zoom-in duration-200 relative z-10">
                        {[filters.state, filters.city, filters.area].filter(f => f && f !== 'all').length}
                      </span>}
                  </Button>
                </PopoverTrigger>
                
                  {/* 🔥 CRITICAL: Portal renders outside main flow, preventing scrollbar-induced shifts */}
                  <PopoverContent 
                    className="w-64 glass-popup border-2 border-border/50 rounded-2xl shadow-2xl backdrop-blur-xl z-[99999] animate-in fade-in zoom-in duration-200 overflow-hidden overscroll-contain" 
                    align="start" 
                    sideOffset={8} 
                    avoidCollisions={true} 
                    collisionPadding={8} 
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                    onWheel={(e) => e.stopPropagation()}
                    style={{
                      paddingRight: 'var(--removed-body-scroll-bar-size, 0px)'
                    }}
                  >
                  <Tabs defaultValue="province" className="w-full overscroll-contain">
                    <TabsList className="w-full grid grid-cols-3 h-9 bg-muted/30 p-0.5">
                      <TabsTrigger 
                        value="province" 
                        className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentScroll = window.scrollY;
                          requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        {currentText.selectProvince.replace('Select ', '')}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="city" 
                        disabled={!filters.state || filters.state === 'all'}
                        className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground disabled:opacity-40"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentScroll = window.scrollY;
                          requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        {currentText.selectCity.replace('Select ', '')}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="area" 
                        disabled={!filters.city || filters.city === 'all'}
                        className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground disabled:opacity-40"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentScroll = window.scrollY;
                          requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        {currentText.selectArea.replace('Select ', '')}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="province" className="mt-2 overscroll-contain">
                      <div className="mb-2 flex items-center gap-2">
                        <Input
                          value={provinceSearch}
                          onChange={(e) => setProvinceSearch(e.target.value)}
                          placeholder="Type to search province..."
                          className="h-9 text-xs flex-1"
                          onFocus={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentScroll = window.scrollY;
                            requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                        />
                        {provinceSearch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2 text-xs"
                            onClick={() => setProvinceSearch('')}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {provinceSearch && (
                        <div className="text-xs text-muted-foreground mb-2 px-1">
                          {filteredProvinces.length} match{filteredProvinces.length !== 1 ? 'es' : ''}
                        </div>
                      )}
                      <ScrollArea 
                        className="h-48 border border-border/30 rounded-lg bg-muted/5 overscroll-contain" 
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-1 p-2">
                          <Button
                            variant={!filters.state || filters.state === 'all' ? 'default' : 'ghost'}
                            className="w-full justify-start text-xs h-9 active:scale-95 transition-transform"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentScroll = window.scrollY;
                              handleFilterChange('state', 'all');
                              requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                            }}
                            onTouchStart={(e) => e.stopPropagation()}
                          >
                            {currentText.any}
                          </Button>
                          {filteredProvinces.length > 0 ? filteredProvinces.map(province => (
                            <Button
                              key={province.code}
                              variant={filters.state === province.code ? 'default' : 'ghost'}
                              className="w-full justify-start text-xs h-9 active:scale-95 transition-transform"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentScroll = window.scrollY;
                                handleFilterChange('state', province.code);
                                requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                              }}
                              onTouchStart={(e) => e.stopPropagation()}
                            >
                              {province.name}
                            </Button>
                          )) : (
                            <div className="text-xs text-muted-foreground italic py-4 text-center">
                              {provinceSearch ? `No matches for "${provinceSearch}"` : '⚠️ No provinces found'}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="city" className="mt-2 overscroll-contain">
                      <div className="mb-2 flex items-center gap-2">
                        <Input
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          placeholder="Type to search city..."
                          className="h-9 text-xs flex-1"
                          onFocus={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentScroll = window.scrollY;
                            requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                        />
                        {citySearch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2 text-xs"
                            onClick={() => setCitySearch('')}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {citySearch && (
                        <div className="text-xs text-muted-foreground mb-2 px-1">
                          {filteredCities.length} match{filteredCities.length !== 1 ? 'es' : ''}
                        </div>
                      )}
                      <ScrollArea 
                        className="h-48 border border-border/30 rounded-lg bg-muted/5 overscroll-contain"
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-1 p-2">
                          <Button
                            variant={!filters.city || filters.city === 'all' ? 'default' : 'ghost'}
                            className="w-full justify-start text-xs h-9 active:scale-95 transition-transform"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentScroll = window.scrollY;
                              handleFilterChange('city', 'all');
                              requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                            }}
                            onTouchStart={(e) => e.stopPropagation()}
                          >
                            {currentText.any}
                          </Button>
                          {filteredCities.length > 0 ? filteredCities.map(city => (
                            <Button
                              key={city.code}
                              variant={filters.city === city.code ? 'default' : 'ghost'}
                              className="w-full justify-start text-xs h-9 active:scale-95 transition-transform"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentScroll = window.scrollY;
                                handleFilterChange('city', city.code);
                                requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                              }}
                              onTouchStart={(e) => e.stopPropagation()}
                            >
                              {city.type} {city.name}
                            </Button>
                          )) : (
                            <div className="text-xs text-muted-foreground italic py-4 text-center">
                              {citySearch ? `No matches for "${citySearch}"` : '⚠️ No cities found'}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="area" className="mt-2 overscroll-contain">
                      <div className="mb-2 flex items-center gap-2">
                        <Input
                          value={areaSearch}
                          onChange={(e) => setAreaSearch(e.target.value)}
                          placeholder="Type to search area..."
                          className="h-9 text-xs flex-1"
                          onFocus={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const currentScroll = window.scrollY;
                            requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                        />
                        {areaSearch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-2 text-xs"
                            onClick={() => setAreaSearch('')}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {areaSearch && (
                        <div className="text-xs text-muted-foreground mb-2 px-1">
                          {filteredAreas.length} match{filteredAreas.length !== 1 ? 'es' : ''}
                        </div>
                      )}
                      <ScrollArea 
                        className="h-48 border border-border/30 rounded-lg bg-muted/5 overscroll-contain"
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div className="space-y-1 p-2">
                          <Button
                            variant={!filters.area || filters.area === 'all' ? 'default' : 'ghost'}
                            className="w-full justify-start text-xs h-9 active:scale-95 transition-transform"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentScroll = window.scrollY;
                              handleFilterChange('area', 'all');
                              requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                            }}
                            onTouchStart={(e) => e.stopPropagation()}
                          >
                            {currentText.any}
                          </Button>
                          {filteredAreas.length > 0 ? filteredAreas.map(area => (
                            <Button
                              key={area.code}
                              variant={filters.area === area.code ? 'default' : 'ghost'}
                              className="w-full justify-start text-xs h-9 active:scale-95 transition-transform"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const currentScroll = window.scrollY;
                                handleFilterChange('area', area.code);
                                requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                              }}
                              onTouchStart={(e) => e.stopPropagation()}
                            >
                              {area.name}
                            </Button>
                          )) : (
                            <div className="text-xs text-muted-foreground italic py-4 text-center">
                              {areaSearch ? `No matches for "${areaSearch}"` : '⚠️ No areas found'}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </PopoverContent>
              </Popover>}
            
            {/* Prominent All Filters Button */}
            <Button 
              onClick={() => {
                setShowAdvancedFilters(true);
              }} 
              size="sm" 
              className={cn(
                "group relative overflow-hidden rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300",
                "h-8 px-2.5 text-[11px]",
                "bg-gradient-to-r from-primary via-primary to-accent",
                "hover:from-primary hover:via-accent hover:to-primary",
                "text-primary-foreground border-2 border-primary/30"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-ai-shimmer" />
              <SlidersHorizontal className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "mr-1.5 relative z-10 group-hover:rotate-90 transition-transform duration-300")} />
              <span className="relative z-10">All Filters</span>
              {getActiveFiltersCount() > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1.5 h-4 px-1.5 text-[10px] bg-primary-foreground text-primary border border-primary-foreground/50 font-bold relative z-10 animate-pulse shadow-lg"
                >
                  <span className="animate-in zoom-in duration-200">
                    {getActiveFiltersCount()}
                  </span>
                </Badge>
              )}
            </Button>
          </div>

          {/* Active Filters Summary Bar */}
          {hasActiveFilters() && <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex items-center gap-1.5 pb-1">
                  {(() => {
                let chipIndex = 0;
                return <>
                        {/* Property Type */}
                        {filters.propertyType && filters.propertyType !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {currentFilters.propertyTypes.find(t => t.value === filters.propertyType)?.label}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('propertyType', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Bedrooms */}
                        {filters.bedrooms && filters.bedrooms !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <Bed className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {filters.bedrooms} {isMobile ? 'bd' : 'bed'}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('bedrooms', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Bathrooms */}
                        {filters.bathrooms && filters.bathrooms !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <Bath className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {filters.bathrooms} {isMobile ? 'ba' : 'bath'}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('bathrooms', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Parking */}
                        {filters.parking && filters.parking !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <Car className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {filters.parking} parking
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('parking', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Price Range */}
                        {(filters.minPrice > 0 || filters.maxPrice > 0) && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <DollarSign className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {activeTab === 'rent' ? `${(filters.minPrice / 1000000).toFixed(0)}-${(filters.maxPrice / 1000000).toFixed(0)}jt` : filters.minPrice >= 1000000000 ? `${(filters.minPrice / 1000000000).toFixed(1)}-${(filters.maxPrice / 1000000000).toFixed(1)}M` : `${(filters.minPrice / 1000000).toFixed(0)}-${(filters.maxPrice / 1000000).toFixed(0)}jt`}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => {
                      handleFilterChange('minPrice', 0);
                      handleFilterChange('maxPrice', 0);
                      setPriceRange([0, currentFilters.maxPrice]);
                    }}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Year Built */}
                        {filters.yearBuilt && filters.yearBuilt !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <CalendarIcon className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {yearOptions.find(y => y.value === filters.yearBuilt)?.label}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('yearBuilt', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Condition */}
                        {filters.condition && filters.condition !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <Star className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {conditionOptions.find(c => c.value === filters.condition)?.label}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('condition', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Furnishing */}
                        {filters.furnishing && filters.furnishing !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <Home className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {furnishingOptions.find(f => f.value === filters.furnishing)?.label}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('furnishing', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Location filters */}
                        {filters.state && filters.state !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <MapPin className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {provinces.find(p => p.code === filters.state)?.name}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('state', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {filters.city && filters.city !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <MapPin className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {cities.find(c => c.code === filters.city)?.name}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('city', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {filters.area && filters.area !== 'all' && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <MapPin className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {areas.find(a => a.code === filters.area)?.name}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('area', 'all')}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Facilities count */}
                        {filters.facilities && filters.facilities.length > 0 && <div className={cn("inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full transition-all animate-in fade-in scale-in duration-200 hover:scale-105 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow-sm cursor-pointer", isMobile ? "px-2 py-0.5 text-[9px]" : "px-2.5 py-1 text-xs")} style={{
                    animationDelay: `${chipIndex++ * 50}ms`
                  }}>
                            <Building2 className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            <span className="text-blue-700 dark:text-blue-300 font-medium">
                              {filters.facilities.length} {isMobile ? 'fac' : 'facilities'}
                            </span>
                            <Button variant="ghost" size="sm" className={cn("h-auto p-0 hover:bg-transparent transition-transform hover:scale-110", isMobile ? "w-3 h-3" : "w-3.5 h-3.5")} onClick={() => handleFilterChange('facilities', [])}>
                              <X className={cn("text-blue-600 dark:text-blue-400", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                            </Button>
                          </div>}
                        
                        {/* Clear All button */}
                        <Button variant="ghost" size="sm" className={cn("text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium animate-in fade-in scale-in duration-200 hover:scale-105 transition-all", isMobile ? "h-5 px-2 text-[9px]" : "h-6 px-2.5 text-xs")} style={{
                    animationDelay: `${chipIndex * 50}ms`
                  }} onClick={clearAllFilters}>
                        {currentText.clearFilters}
                      </Button>
                    </>;
              })()}
                </div>
              </ScrollArea>
            </div>}


        </div>
      </div>
      
      {/* Advanced Filters Modal (mobile, tablet and desktop) */}
      {showAdvancedFilters && createPortal(
        <div 
          className="fixed inset-0 left-0 right-0 top-0 bottom-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300 p-2 md:p-4" 
          onClick={() => setShowAdvancedFilters(false)}
        >
          <div 
            ref={advancedFiltersRef} 
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "w-full mx-auto rounded-2xl shadow-2xl flex flex-col overflow-hidden glass-popup animate-in zoom-in duration-300",
              isMobile ? "max-h-[85vh]" : "max-w-lg max-h-[70vh]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/30 px-3 py-2 shrink-0 backdrop-blur-xl bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Advanced Filters</h3>
                  <p className="text-xs text-muted-foreground">Refine search</p>
                </div>
                <Badge variant="default" className="h-6 px-2 bg-primary text-primary-foreground text-xs font-bold animate-pulse">
                  {getActiveFiltersCount()}
                </Badge>
              </div>
              <Button onClick={() => setShowAdvancedFilters(false)} variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Active Filters Summary Bar - Moved to Header */}
            {getActiveFiltersCount() > 0 && (
              <div className="px-6 py-3 bg-accent/20 border-b border-accent/30 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-muted-foreground">ACTIVE FILTERS</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeTab && activeTab !== 'all' && (
                    <Badge variant="secondary" className="h-7 px-2.5 text-xs gap-1.5">
                      {activeTab === 'sale' ? 'For Sale' : activeTab === 'rent' ? 'For Rent' : activeTab === 'new_project' ? 'New Project' : 'All'}
                      <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => setActiveTab('all')} />
                    </Badge>
                  )}
                  {filters.propertyType && (
                    <Badge variant="secondary" className="h-7 px-2.5 text-xs gap-1.5">
                      {filters.propertyType}
                      <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => handleFilterChange('propertyType', '')} />
                    </Badge>
                  )}
                  {filters.location && (
                    <Badge variant="secondary" className="h-7 px-2.5 text-xs gap-1.5">
                      {filters.location}
                      <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => handleFilterChange('location', '')} />
                    </Badge>
                  )}
                  {filters.priceRange && (
                    <Badge variant="secondary" className="h-7 px-2.5 text-xs gap-1.5">
                      {filters.priceRange === '0-1000000000' ? '< 1B' : filters.priceRange === '1000000000-5000000000' ? '1B-5B' : '> 5B'}
                      <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => handleFilterChange('priceRange', '')} />
                    </Badge>
                  )}
                  {filters.bedrooms && (
                    <Badge variant="secondary" className="h-7 px-2.5 text-xs gap-1.5">
                      {filters.bedrooms} Bed
                      <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => handleFilterChange('bedrooms', '')} />
                    </Badge>
                  )}
                  {filters.bathrooms && (
                    <Badge variant="secondary" className="h-7 px-2.5 text-xs gap-1.5">
                      {filters.bathrooms} Bath
                      <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => handleFilterChange('bathrooms', '')} />
                    </Badge>
                  )}
                  {filters.condition && (
                    <Badge variant="secondary" className="h-7 px-2.5 text-xs gap-1.5">
                      {filters.condition}
                      <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => handleFilterChange('condition', '')} />
                    </Badge>
                  )}
                  {(filters.minArea || filters.maxArea) && (
                    <Badge variant="secondary" className="h-7 px-2.5 text-xs gap-1.5">
                      {filters.minArea || 0}-{filters.maxArea || '∞'} sqm
                      <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => {
                        handleFilterChange('minArea', '');
                        handleFilterChange('maxArea', '');
                      }} />
                    </Badge>
                  )}
                  {filters.features.length > 0 && filters.features.map(feature => (
                    <Badge key={feature} variant="secondary" className="h-7 px-2.5 text-xs gap-1.5">
                      {feature}
                      <X className="h-3.5 w-3.5 cursor-pointer" onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          features: prev.features.filter(f => f !== feature)
                        }));
                      }} />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Content - Scrollable */}
            <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-2 space-y-2 bg-background pb-3">
                
                {/* Listing Type - Always visible at top */}
                <div className="space-y-1.5 pb-2 border-b border-border/50">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-primary" />
                    Listing Type
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={filters.listingType === 'sale' ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => handleFilterChange('listingType', filters.listingType === 'sale' ? '' : 'sale')} 
                      className={cn("h-10 text-sm font-semibold rounded-lg", filters.listingType === 'sale' && "shadow-md ring-2 ring-primary/20")}
                    >
                      For Sale
                    </Button>
                    <Button 
                      variant={filters.listingType === 'rent' ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => handleFilterChange('listingType', filters.listingType === 'rent' ? '' : 'rent')} 
                      className={cn("h-10 text-sm font-semibold rounded-lg", filters.listingType === 'rent' && "shadow-md ring-2 ring-primary/20")}
                    >
                      For Rent
                    </Button>
                  </div>
                </div>

                {/* Property Type - Collapsible with auto-close */}
                {filters.listingType && (
                  <Collapsible
                    open={openSections.propertyType}
                    onOpenChange={(open) => setOpenSections(prev => ({ 
                      ...prev, 
                      propertyType: open,
                      location: false,
                      priceRange: false,
                      propertySpecs: false,
                      amenities: false
                    }))}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between h-9 px-2 hover:bg-accent/50">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                          <Home className="h-3.5 w-3.5 text-primary" />
                          Property Type
                          {filters.propertyType && <Badge variant="secondary" className="ml-1.5 h-5 px-2 text-xs">{filters.propertyType}</Badge>}
                        </Label>
                        {openSections.propertyType ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {['House', 'Apartment', 'Villa', 'Land', 'Office', 'Shop'].map(type => (
                          <Button 
                            key={type}
                            variant={filters.propertyType === type ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => {
                              handleFilterChange('propertyType', filters.propertyType === type ? '' : type);
                              setOpenSections(prev => ({ ...prev, propertyType: false }));
                            }} 
                            className={cn("h-9 text-xs font-semibold rounded-lg", filters.propertyType === type && "shadow-md ring-2 ring-primary/20")}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Location - Collapsible with auto-close */}
                {filters.listingType && (
                  <Collapsible
                    open={openSections.location}
                    onOpenChange={(open) => setOpenSections(prev => ({ 
                      ...prev, 
                      location: open,
                      propertyType: false,
                      priceRange: false,
                      propertySpecs: false,
                      amenities: false
                    }))}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between h-9 px-2 hover:bg-accent/50">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          Location
                          {filters.location && <Badge variant="secondary" className="ml-1.5 h-5 px-2 text-xs">{filters.location}</Badge>}
                        </Label>
                        {openSections.location ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <Input 
                        placeholder="Search location..." 
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        className="h-8 text-xs rounded-lg"
                      />
                      <div className="flex flex-wrap gap-2">
                        {popularLocations
                          .filter(loc => !locationSearch || loc.toLowerCase().includes(locationSearch.toLowerCase()))
                          .map(location => (
                            <Badge 
                              key={location}
                              variant={filters.location === location ? "default" : "outline"}
                              className={cn(
                                "cursor-pointer h-7 px-2.5 text-xs font-medium rounded-lg hover:bg-primary/10 transition-colors",
                                filters.location === location && "shadow-md ring-1 ring-primary/30"
                              )}
                              onClick={() => {
                                handleFilterChange('location', filters.location === location ? '' : location);
                                setLocationSearch('');
                                setOpenSections(prev => ({ ...prev, location: false }));
                              }}
                            >
                              {location}
                            </Badge>
                          ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Price Range - Collapsible */}
                {filters.listingType && (
                  <Collapsible
                    open={openSections.priceRange}
                    onOpenChange={(open) => setOpenSections(prev => ({ 
                      ...prev, 
                      priceRange: open,
                      propertyType: false,
                      location: false,
                      propertySpecs: false,
                      amenities: false
                    }))}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between h-9 px-2 hover:bg-accent/50">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                          Price Range
                          {(priceRange[0] > 0 || priceRange[1] < currentFilters.maxPrice) && (
                            <Badge variant="secondary" className="ml-1.5 h-5 px-2 text-xs">
                              {activeTab === 'rent' ? `${priceRange[0]}-${priceRange[1]}jt` : `${priceRange[0] >= 1000 ? (priceRange[0] / 1000).toFixed(1) : priceRange[0]}M-${priceRange[1] >= 1000 ? (priceRange[1] / 1000).toFixed(1) : priceRange[1]}M`}
                            </Badge>
                          )}
                        </Label>
                        {openSections.priceRange ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 pt-2">
                      <Slider 
                        value={priceRange} 
                        onValueChange={(value) => {
                          setPriceRange(value);
                          handleFilterChange('minPrice', value[0] * (activeTab === 'rent' ? 1000000 : 1000000000));
                          handleFilterChange('maxPrice', value[1] * (activeTab === 'rent' ? 1000000 : 1000000000));
                        }} 
                        min={0} 
                        max={currentFilters.maxPrice} 
                        step={currentFilters.priceStep} 
                        className="w-full px-1" 
                      />
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground mb-1">Min</span>
                          <span className="font-semibold text-foreground">
                            {activeTab === 'rent' ? `${priceRange[0]}jt` : priceRange[0] >= 1000 ? `${(priceRange[0] / 1000).toFixed(1)}M` : `${priceRange[0]}jt`}
                          </span>
                        </div>
                        <span className="text-muted-foreground">-</span>
                        <div className="flex flex-col items-end">
                          <span className="text-muted-foreground mb-1">Max</span>
                          <span className="font-semibold text-foreground">
                            {activeTab === 'rent' ? (priceRange[1] >= currentFilters.maxPrice ? 'Any' : `${priceRange[1]}jt`) : (priceRange[1] >= currentFilters.maxPrice ? 'Any' : priceRange[1] >= 1000 ? `${(priceRange[1] / 1000).toFixed(1)}M` : `${priceRange[1]}jt`)}
                          </span>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Database-driven filters by category */}
                {filtersLoading && (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-9 bg-muted/50 rounded-lg" />
                    <div className="h-24 bg-muted/30 rounded-lg" />
                    <div className="h-9 bg-muted/50 rounded-lg" />
                    <div className="h-28 bg-muted/30 rounded-lg" />
                    <div className="h-9 bg-muted/50 rounded-lg" />
                    <div className="h-20 bg-muted/30 rounded-lg" />
                  </div>
                )}
                
                {!filtersLoading && !filters.listingType && (
                  <div className="p-6 bg-accent/10 border border-accent/30 rounded-lg text-center">
                    <Key className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Please select a listing type (For Sale or For Rent) to see available filters
                    </p>
                  </div>
                )}
                
                {!filtersLoading && filters.listingType && currentDbFilters.length > 0 && currentDbFilters.map((category) => {
                  // Skip categories we're handling specially (location, price)
                  if (['location', 'price', 'search'].includes(category.name)) return null;
                  
                  const CategoryIcon = getCategoryIcon(category.name);
                  const activeCount = getActiveFiltersInCategory(category);
                  
                  return (
                    <Collapsible
                      key={category.id}
                      open={openSections[category.name]}
                      onOpenChange={(open) => {
                        setOpenSections(prev => ({
                          ...prev,
                          propertyType: false,
                          location: false,
                          priceRange: false,
                          propertySpecs: false,
                          amenities: false,
                          [category.name]: open
                        }));
                      }}
                      className="space-y-2"
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between h-9 px-2 hover:bg-accent/50">
                          <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-1.5">
                                    <CategoryIcon className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-[300px]">
                                  <p className="text-xs">{getCategoryTooltip(category)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span>{category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
                            {activeCount > 0 && (
                              <Badge variant="default" className="ml-1 h-5 px-2 text-xs font-bold">
                                {activeCount}
                              </Badge>
                            )}
                          </Label>
                          <div className="flex items-center gap-1.5">
                            {activeCount > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearCategoryFilters(category);
                                }}
                                className="h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
                              >
                                Clear
                              </Button>
                            )}
                            {openSections[category.name] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2">
                        <div className="grid grid-cols-1 gap-2">
                          {category.options.map((filter: any) => renderDatabaseFilter(filter))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}

                {/* Bedrooms - Fallback if no database filters */}
                {!filtersLoading && filters.listingType && currentDbFilters.length === 0 && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Bed className="h-4 w-4 text-primary" />
                        Bedrooms
                      </Label>
                      <div className="grid grid-cols-6 gap-2">
                        {['1', '2', '3', '4', '5', '5+'].map(bed => (
                          <Button 
                            key={bed} 
                            variant={filters.bedrooms === bed ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => handleFilterChange('bedrooms', filters.bedrooms === bed ? '' : bed)} 
                            className={cn("h-10 text-xs font-semibold rounded-lg", filters.bedrooms === bed && "shadow-md ring-2 ring-primary/20")}
                          >
                            {bed}
                          </Button>
                        ))}
                      </div>
                    </div>


                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Bath className="h-4 w-4 text-primary" />
                        Bathrooms
                      </Label>
                      <div className="grid grid-cols-6 gap-2">
                        {['1', '2', '3', '4', '5', '5+'].map(bath => (
                          <Button 
                            key={bath} 
                            variant={filters.bathrooms === bath ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => handleFilterChange('bathrooms', filters.bathrooms === bath ? '' : bath)} 
                            className={cn("h-10 text-xs font-semibold rounded-lg", filters.bathrooms === bath && "shadow-md ring-2 ring-primary/20")}
                          >
                            {bath}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Area/Size Filter - Only show when listing type selected */}
                {filters.listingType && (
                  <Collapsible
                    open={openSections.propertySpecs}
                    onOpenChange={(open) => setOpenSections(prev => ({ 
                      ...prev, 
                      propertySpecs: open,
                      propertyType: false,
                      location: false,
                      priceRange: false,
                      amenities: false
                    }))}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between h-9 px-2 hover:bg-accent/50">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                          <Square className="h-3.5 w-3.5 text-primary" />
                          Area/Size
                          {(filters.minArea || filters.maxArea) && (
                            <Badge variant="secondary" className="ml-1.5 h-5 px-2 text-xs">
                              {filters.minArea || 0}-{filters.maxArea || '∞'} sqm
                            </Badge>
                          )}
                        </Label>
                        {openSections.propertySpecs ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-1">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Min (sqm)</Label>
                          <Input 
                            type="number" 
                            placeholder="0"
                            value={filters.minArea}
                            onChange={(e) => handleFilterChange('minArea', e.target.value)}
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Max (sqm)</Label>
                          <Input 
                            type="number" 
                            placeholder="∞"
                            value={filters.maxArea}
                            onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                            className="h-8 text-xs rounded-lg"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { label: '< 50', min: '', max: '50' },
                          { label: '50-100', min: '50', max: '100' },
                          { label: '100-200', min: '100', max: '200' },
                          { label: '200-500', min: '200', max: '500' },
                          { label: '500+', min: '500', max: '' }
                        ].map(range => (
                          <Button 
                            key={range.label}
                            variant={(filters.minArea === range.min && filters.maxArea === range.max) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              handleFilterChange('minArea', range.min);
                              handleFilterChange('maxArea', range.max);
                              setOpenSections(prev => ({ ...prev, propertySpecs: false }));
                            }}
                            className="h-8 text-xs font-semibold rounded-lg"
                          >
                            {range.label}
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Amenities Filter - Only show when listing type selected */}
                {filters.listingType && (
                  <Collapsible
                    open={openSections.amenities}
                    onOpenChange={(open) => setOpenSections(prev => ({ 
                      ...prev, 
                      amenities: open,
                      propertyType: false,
                      location: false,
                      priceRange: false,
                      propertySpecs: false
                    }))}
                    className="space-y-2"
                  >
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between h-9 px-2 hover:bg-accent/50">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer">
                          <Star className="h-3.5 w-3.5 text-primary" />
                          Amenities
                          {filters.features.length > 0 && (
                            <Badge variant="secondary" className="ml-1.5 h-5 px-2 text-xs">
                              {filters.features.length}
                            </Badge>
                          )}
                        </Label>
                        {openSections.amenities ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { value: 'pool', label: '🏊 Pool', icon: Droplets },
                          { value: 'gym', label: '💪 Gym', icon: Users },
                          { value: 'parking', label: '🚗 Parking', icon: Car },
                          { value: 'security', label: '🛡️ Security', icon: Shield },
                          { value: 'wifi', label: '📶 WiFi', icon: Wifi },
                          { value: 'ac', label: '❄️ AC', icon: Wind },
                          { value: 'garden', label: '🌳 Garden', icon: Layers },
                          { value: 'balcony', label: '🏡 Balcony', icon: Home }
                        ].map(amenity => {
                          const isSelected = filters.features.includes(amenity.value);
                          return (
                            <Badge 
                              key={amenity.value}
                              variant={isSelected ? "default" : "outline"}
                              className={cn(
                                "cursor-pointer h-7 px-2.5 text-xs font-medium rounded-lg hover:bg-primary/10 transition-colors",
                                isSelected && "shadow-md ring-1 ring-primary/30"
                              )}
                              onClick={() => {
                                setFilters(prev => ({
                                  ...prev,
                                  features: isSelected 
                                    ? prev.features.filter(f => f !== amenity.value)
                                    : [...prev.features, amenity.value]
                                }));
                              }}
                            >
                              {amenity.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Clear All */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAllFilters} 
                  className="w-full h-10 text-sm font-semibold text-destructive hover:text-destructive hover:bg-destructive/10 border-2 border-destructive/30 hover:border-destructive rounded-lg"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </ScrollArea>

            {/* Footer - Sticky */}
            <div className="border-t border-border/30 backdrop-blur-xl bg-primary/5 px-2 py-1.5 shrink-0 shadow-lg">
              <Button 
                onClick={() => {
                  handleSearch();
                  setShowAdvancedFilters(false);
                }} 
                className="w-full h-8 text-xs font-bold shadow-md rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300" 
                size="sm"
              >
                <Search className="h-3.5 w-3.5 mr-1.5" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  </div>
}
export default AstraSearchPanel;