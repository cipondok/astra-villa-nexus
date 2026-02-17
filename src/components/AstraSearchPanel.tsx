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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showLocationButtons, setShowLocationButtons] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPropertyTypeOpen, setIsPropertyTypeOpen] = useState(false);
  const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(false);
  // Anchor for mobile suggestions positioning
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [suggestionsTop, setSuggestionsTop] = useState<number>(0);
  const [suggestionsRect, setSuggestionsRect] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });
  const { filters: dbFilters, loading: filtersLoading } = usePropertyFilters();
  
  // Image search functionality
  const { searchByImage, isSearching: isImageSearching, clearResults: clearImageSearch, searchResults, imageFeatures } = useImageSearch();
  const [recentSearchesKey, setRecentSearchesKey] = useState(0);
  const [currentSearchImage, setCurrentSearchImage] = useState<string | null>(null);
  const [recentSearchTerms, setRecentSearchTerms] = useState<string[]>([]);
  const [suggestionClicks, setSuggestionClicks] = useState<Record<string, { count: number; timestamps: number[] }>>({});
  const [liveResults, setLiveResults] = useState<{ id: string; title: string; location: string; price: number; type: string }[]>([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  
  // Location search state
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [areaSearch, setAreaSearch] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  const searchSuggestions = useMemo(() => language === 'id' ? [
    "Cari villa di Bali...",
    "Apartemen dekat MRT Jakarta...",
    "Rumah 3 kamar tidur di Bandung...",
    "Properti investasi di Lombok...",
    "Kos-kosan dekat kampus...",
  ] : [
    "Search villas in Bali...",
    "Apartments near MRT Jakarta...",
    "3 bedroom house in Bandung...",
    "Investment property in Lombok...",
    "Beachfront villa in Seminyak...",
  ], [language]);

  useEffect(() => {
    if (searchQuery) return;
    const interval = setInterval(() => {
      setSuggestionIndex(prev => (prev + 1) % searchSuggestions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [searchQuery, searchSuggestions.length]);

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

  // Lock scroll when advanced filters popup is open to prevent page jumping
  useScrollLock(showAdvancedFilters);
  
  // Add/remove body class for popup interaction - prevents scroll chaining
  useEffect(() => {
    if (showAdvancedFilters) {
      document.body.classList.add('filter-popup-open');
      document.documentElement.style.setProperty('--scroll-position', `-${window.scrollY}px`);
    } else {
      document.body.classList.remove('filter-popup-open');
    }
    return () => {
      document.body.classList.remove('filter-popup-open');
    };
  }, [showAdvancedFilters]);

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
    propertyType: true, // Open by default for All mode
    location: false,
    priceRange: false,
    propertySpecs: false,
    amenities: false,
    dates: false,
    rentalDetails: false
  });
  
  // Location search state (using existing provinces/cities/areas data fetched elsewhere)
  
  const [locationSearch, setLocationSearch] = useState("");
  const [locationActiveTab, setLocationActiveTab] = useState<'province' | 'city' | 'area'>('province');
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
                        filteredSuggestions.locations.length > 0 ||
                        searchQuery.length === 0; // Show popular categories when empty

  const popularCategories = useMemo(() => language === 'id' ? [
    { label: '🏡 Villa', query: 'Villa' },
    { label: '🏢 Apartemen', query: 'Apartment' },
    { label: '🏠 Rumah', query: 'Rumah' },
    { label: '🏘️ Townhouse', query: 'Townhouse' },
    { label: '🏗️ Tanah', query: 'Land' },
    { label: '🏬 Kantor', query: 'Office' },
    { label: '🌊 Beachfront', query: 'Beachfront' },
    { label: '🏔️ Mountain View', query: 'Mountain' },
  ] : [
    { label: '🏡 Villa', query: 'Villa' },
    { label: '🏢 Apartment', query: 'Apartment' },
    { label: '🏠 House', query: 'House' },
    { label: '🏘️ Townhouse', query: 'Townhouse' },
    { label: '🏗️ Land', query: 'Land' },
    { label: '🏬 Office', query: 'Office' },
    { label: '🌊 Beachfront', query: 'Beachfront' },
    { label: '🏔️ Mountain View', query: 'Mountain' },
  ], [language]);

  // Build flat list of all suggestion items for keyboard navigation
  const allSuggestionItems = useMemo(() => {
    const items: { type: string; value: string }[] = [];
    filteredSuggestions.recent.forEach(t => items.push({ type: 'recent', value: t }));
    filteredSuggestions.locations.forEach(l => items.push({ type: 'location', value: l }));
    filteredSuggestions.trending.forEach(t => items.push({ type: 'trending', value: t }));
    if (!searchQuery) popularCategories.forEach(c => items.push({ type: 'category', value: c.query }));
    return items;
  }, [filteredSuggestions, searchQuery, popularCategories]);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [allSuggestionItems.length]);

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
      const { data, error } = await supabase.rpc('get_distinct_provinces');
      if (error) throw error;

      const uniqueProvinces = (data || []).map((d: any) => ({
        code: d.province_code,
        name: d.province_name,
      }));
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

  // Live search from database
  useEffect(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
      setLiveResults([]);
      return;
    }
    let cancelled = false;
    setIsLiveSearching(true);
    const fetchLive = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, location, price, property_type')
          .or(`title.ilike.%${debouncedSearchQuery}%,location.ilike.%${debouncedSearchQuery}%,property_type.ilike.%${debouncedSearchQuery}%`)
          .limit(5);
        if (!cancelled && !error && data) {
          setLiveResults(data.map(p => ({ id: p.id, title: p.title || '', location: p.location || '', price: p.price || 0, type: p.property_type || '' })));
        }
      } catch (e) {
        console.error('Live search error:', e);
      } finally {
        if (!cancelled) setIsLiveSearching(false);
      }
    };
    fetchLive();
    return () => { cancelled = true; };
  }, [debouncedSearchQuery]);

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

  const updateSuggestionsPosition = () => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const top = rect.bottom + 4;
    setSuggestionsTop(top);
    setSuggestionsRect({ top, left: rect.left, width: rect.width });
  };

  // Keep suggestions dropdown aligned to input on scroll/resize
  useEffect(() => {
    if (showSuggestions) {
      updateSuggestionsPosition();
      window.addEventListener('resize', updateSuggestionsPosition);
      window.addEventListener('scroll', updateSuggestionsPosition, true);
    }
    return () => {
      window.removeEventListener('resize', updateSuggestionsPosition);
      window.removeEventListener('scroll', updateSuggestionsPosition, true);
    };
  }, [showSuggestions]);

  // Removed manual scroll locking useEffect in favor of useScrollLock hook above

  const formatPrice = (price: number) => {
    if (price >= 1000) return `${price / 1000} M`;
    return `${price} Jt`;
  };
  const getSelectedFiltersDisplay = () => {
    const selected: string[] = [];

    // Combine location parts with null safety
    const locationParts: string[] = [];
    if (filters.state && filters.state !== 'all') {
      const province = provinces.find((p) => p.code === filters.state);
      locationParts.push(province?.name || filters.state);
    }
    if (filters.city && filters.city !== 'all') {
      const city = cities.find((c) => c.code === filters.city);
      locationParts.push(city?.name || filters.city);
    }
    if (filters.area && filters.area !== 'all') {
      const area = areas.find((a) => a.code === filters.area);
      locationParts.push(area?.name || filters.area);
    }
    if (locationParts.length > 0) selected.push(locationParts.join(', '));

    if (filters.propertyType && filters.propertyType !== 'all') {
      selected.push(currentText[filters.propertyType as keyof typeof currentText] || filters.propertyType);
    }

    // Human-friendly price range label (avoid raw numbers like 0-1000000000)
    if (filters.priceRange && filters.priceRange !== 'all') {
      const priceLabel =
        filters.priceRange === '0-1000000000'
          ? '< 1B'
          : filters.priceRange === '1000000000-5000000000'
            ? '1B-5B'
            : filters.priceRange === '5000000000-99999999999'
              ? '> 5B'
              : filters.priceRange;
      selected.push(priceLabel);
    }

    if (filters.bedrooms && filters.bedrooms !== 'all') selected.push(`${filters.bedrooms} bed`);
    if (filters.bathrooms && filters.bathrooms !== 'all') selected.push(`${filters.bathrooms} bath`);

    if (filters.features.length > 0) selected.push(`${filters.features.length} features`);
    if (filters.yearBuilt && filters.yearBuilt !== 'all') selected.push(filters.yearBuilt);
    if (filters.condition && filters.condition !== 'all') selected.push(filters.condition);

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

  // Mobile view - inline search panel (not fixed)
  if (isMobile) {
    return (
      <div className="w-full px-0 py-3 space-y-3">
        {/* Compact Tabs for Sale/Rent/All */}
        <div className="flex justify-center">
          <div 
            className="grid grid-cols-4 gap-1 p-1"
            role="tablist"
          >
            <button
              onClick={() => setActiveTab("all")}
              role="tab"
              aria-selected={activeTab === "all"}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === "all" 
                  ? "bg-white text-primary shadow-md" 
                  : "text-white/90 hover:text-white hover:bg-white/20"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All</span>
            </button>
            
            <button
              onClick={() => setActiveTab("sale")}
              role="tab"
              aria-selected={activeTab === "sale"}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === "sale" 
                  ? "bg-white text-primary shadow-md" 
                  : "text-white/90 hover:text-white hover:bg-white/20"
              )}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Buy</span>
            </button>
            
            <button
              onClick={() => setActiveTab("rent")}
              role="tab"
              aria-selected={activeTab === "rent"}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === "rent" 
                  ? "bg-white text-primary shadow-md" 
                  : "text-white/90 hover:text-white hover:bg-white/20"
              )}
            >
              <Key className="h-3.5 w-3.5" />
              <span>Rent</span>
            </button>
            
            <button
              onClick={() => setActiveTab("new_project")}
              role="tab"
              aria-selected={activeTab === "new_project"}
              className={cn(
                "px-3 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                activeTab === "new_project" 
                  ? "bg-white text-primary shadow-md" 
                  : "text-white/90 hover:text-white hover:bg-white/20"
              )}
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Search Input Row */}
        <div className="flex items-center gap-2">
          <div ref={anchorRef} className="flex-1 relative">
            <Search
              className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none",
                searchQuery && "text-primary animate-pulse"
              )}
            />
            <Input
              type="search"
              placeholder={searchQuery ? '' : searchSuggestions[suggestionIndex]}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={(e) => {
                e.preventDefault();
                const currentScroll = window.scrollY;
                setShowSuggestions(true);
                if (anchorRef.current) {
                  const rect = anchorRef.current.getBoundingClientRect();
                  setSuggestionsTop(rect.bottom + 4);
                }
                requestAnimationFrame(() => window.scrollTo(0, currentScroll));
              }}
              onTouchStart={(e) => e.stopPropagation()}
              className="pl-10 pr-12 h-12 text-sm bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 focus:ring-2 focus:ring-primary/50 rounded-xl text-white placeholder:text-white/60 shadow-lg"
            />
            
            {/* Image Search Inside Input */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <ImageSearchButton
                onImageSelected={handleImageSearch}
                onClear={handleClearImageSearch}
                isSearching={isImageSearching}
                enableDragDrop={true}
                enablePaste={true}
                className="h-7 w-7"
              />
            </div>
          </div>
        </div>

        {/* Filter & Search Button Row */}
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <Button
            onClick={() => setShowAdvancedFilters(true)}
            variant="outline"
            size="lg"
            className={cn(
              "h-11 flex-1 rounded-xl flex items-center justify-center gap-2",
              "bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 shadow-md"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm font-medium">{currentText.filters}</span>
            {getActiveFiltersCount() > 0 && (
              <Badge
                variant="default"
                className="ml-1 h-5 min-w-[22px] px-1.5 flex items-center justify-center text-[10px] rounded-full bg-primary text-primary-foreground"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            size="lg"
            className="h-11 flex-1 rounded-xl flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-primary to-orange-500 hover:opacity-90 text-white shadow-lg"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm font-semibold">{currentText.search}</span>
          </Button>
        </div>

        {/* Mobile Suggestions Dropdown */}
        {showSuggestions && hasSuggestions && (
          <div
            ref={suggestionsRef}
            className="fixed left-2 right-2 rounded-xl shadow-2xl shadow-primary/30 z-[10040] max-h-[60vh] overflow-y-auto overscroll-contain glass-popup backdrop-blur-2xl border-primary/20"
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
      </div>
    );
  }
  return <div className="w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1800px] 3xl:max-w-[2000px] mx-auto transition-all duration-500">
    <div className={cn("sticky z-[999] transition-all duration-500", isMobile ? "top-[60px] md:top-[64px] lg:top-[68px] px-1 py-2" : "top-[48px] w-full px-0")}>
      {/* Transparent Full-Width Container */}
      <div className="relative bg-transparent overflow-visible rounded-none border-b border-white/10 dark:border-white/5">
        {/* Subtle top shine line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20 pointer-events-none" />
        <div className={cn("relative space-y-1.5 overflow-visible bg-yellow-400 dark:bg-yellow-500/80 backdrop-blur-xl border border-yellow-500/50 dark:border-yellow-400/30 rounded-xl shadow-[0_8px_32px_rgba(250,200,0,0.3)] dark:shadow-[0_8px_32px_rgba(250,200,0,0.15)]", isMobile ? "p-1.5" : "p-2 lg:p-3 xl:p-4")}>
          
          {/* Compact Tabs for Sale/Rent/All - Premium Blue Theme */}
          <div className="flex justify-center">
            <div className="search-tab-container grid grid-cols-4">
              {/* Animated sliding background indicator */}
              <div
                className="search-tab-slider inset-y-1"
                style={{
                  width: "calc(25% - 4px)",
                  left:
                    activeTab === "all"
                      ? "4px"
                      : activeTab === "sale"
                        ? "calc(25% + 2px)"
                        : activeTab === "rent"
                          ? "calc(50%)"
                          : "calc(75% - 2px)",
                }}
              />

              <button
                onClick={() => setActiveTab("all")}
                className={cn(
                  "search-tab-btn flex-1",
                  isMobile ? "px-2 py-1.5 text-[9px]" : "px-3 py-2 text-[10px]",
                  activeTab === "all" && "active"
                )}
              >
                <Layers className={cn("tab-icon", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                <span>{isMobile ? "" : currentText.all}</span>
              </button>
              
              <button
                onClick={() => setActiveTab("sale")}
                className={cn(
                  "search-tab-btn flex-1",
                  isMobile ? "px-2 py-1.5 text-[9px]" : "px-3 py-2 text-[10px]",
                  activeTab === "sale" && "active"
                )}
              >
                <ShoppingBag className={cn("tab-icon", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                <span>{isMobile ? "" : currentText.forSale}</span>
              </button>
              
              <button
                onClick={() => setActiveTab("rent")}
                className={cn(
                  "search-tab-btn flex-1",
                  isMobile ? "px-2 py-1.5 text-[9px]" : "px-3 py-2 text-[10px]",
                  activeTab === "rent" && "active"
                )}
              >
                <Key className={cn("tab-icon", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                <span>{isMobile ? "" : currentText.forRent}</span>
              </button>
              
              <button
                onClick={() => setActiveTab("new_project")}
                className={cn(
                  "search-tab-btn flex-1",
                  isMobile ? "px-2 py-1.5 text-[9px]" : "px-3 py-2 text-[10px]",
                  activeTab === "new_project" && "active"
                )}
              >
                <Rocket className={cn("tab-icon", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                <span>{isMobile ? "" : currentText.newProject}</span>
              </button>
            </div>
          </div>
          
          
          {/* Compact Search Row with Location Options */}
          <div className={cn("flex overflow-visible", isMobile ? "gap-1" : "gap-2 lg:gap-3")}>
            <div ref={anchorRef} className="flex-1 relative z-[100001]">
              <Search className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/70 pointer-events-none transition-all duration-300", 
                isMobile ? "h-3.5 w-3.5 left-2.5" : "h-4 w-4 left-3.5",
                searchQuery && "text-primary animate-pulse"
              )} />
              <Input 
                type="search"
                placeholder={searchQuery ? '' : searchSuggestions[suggestionIndex]} 
                value={searchQuery} 
                onChange={e => handleSearchChange(e.target.value)} 
                onFocus={() => {
                  setShowSuggestions(true);
                  requestAnimationFrame(() => updateSuggestionsPosition());
                }}
                onKeyDown={(e) => {
                  if (!showSuggestions || allSuggestionItems.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedIndex(prev => (prev + 1) % allSuggestionItems.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedIndex(prev => prev <= 0 ? allSuggestionItems.length - 1 : prev - 1);
                  } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                    e.preventDefault();
                    const item = allSuggestionItems[highlightedIndex];
                    setSearchQuery(item.value);
                    setShowSuggestions(false);
                    setHighlightedIndex(-1);
                    handleSearch();
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    setHighlightedIndex(-1);
                  }
                }}
                className={cn(
                  "w-full bg-white/90 dark:bg-white/10 border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl transition-all duration-300 shadow-sm font-medium",
                  "text-foreground placeholder:text-muted-foreground/60",
                  isMobile ? "pl-8 pr-24 h-10 text-xs" : "pl-11 pr-32 h-11 text-sm"
                )} 
              />
              
              {/* Action buttons inside input - right side */}
              <div className={cn(
                "absolute right-1.5 top-1/2 transform -translate-y-1/2 flex items-center bg-white/60 dark:bg-white/5 rounded-lg border border-primary/10",
                isMobile ? "gap-0 px-0.5 py-0.5" : "gap-0.5 px-1 py-0.5"
              )}>
                <ImageSearchButton
                  onImageSelected={handleImageSearch}
                  onClear={handleClearImageSearch}
                  isSearching={isImageSearching}
                  enableDragDrop={true}
                  enablePaste={true}
                  className="shrink-0"
                />
                <div className="w-px h-4 bg-border/50" />
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => window.location.href = '/location'} aria-label={currentText.location} className={cn("flex items-center justify-center rounded-md hover:bg-primary/10 transition-colors", isMobile ? "p-1" : "p-1.5")}>
                        <MapPin className={cn("text-orange-600 dark:text-orange-400", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-[100000] bg-background/90 backdrop-blur-md text-foreground border border-border/50 shadow-lg px-2 py-1 rounded-md">
                      <p className="text-[10px] font-medium">Map View</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="w-px h-4 bg-border/50" />
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => toggleSearchType('nearby')} aria-label={isGettingLocation ? currentText.gettingLocation : currentText.nearMe} className={cn("flex items-center justify-center rounded-md hover:bg-primary/10 transition-colors", isMobile ? "p-1" : "p-1.5")} disabled={isGettingLocation}>
                        {isGettingLocation ? <div className="animate-spin h-3.5 w-3.5 border-2 border-cyan-600 rounded-full border-t-transparent" /> : <svg className={cn("text-cyan-600 dark:text-cyan-400", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")} viewBox="0 0 24 24" fill={useNearbyLocation ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v3" />
                            <path d="M12 19v3" />
                            <path d="M2 12h3" />
                            <path d="M19 12h3" />
                          </svg>}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-[100000] bg-background/90 backdrop-blur-md text-foreground border border-border/50 shadow-lg px-2 py-1 rounded-md">
                      <p className="text-[10px] font-medium">{isGettingLocation ? "Getting Location..." : "Near Me"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Geolocation loading overlay */}
              {isGettingLocation && <div className="absolute inset-0 bg-white/50 dark:bg-black/30 backdrop-blur-sm flex items-center justify-center rounded-xl z-10 border border-primary/20">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent" />
                    <span className="text-primary">{currentText.gettingLocation}</span>
                  </div>
                </div>}
              
              {/* Smart Suggestions Dropdown */}
              {showSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-0.5 bg-white dark:bg-card/95 backdrop-blur-2xl border border-border/40 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-[100001] max-h-80 overflow-y-auto"
                >
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
                        {filteredSuggestions.recent.map((term, i) => {
                          const flatIdx = i;
                          return (
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
                               className={cn(
                                "w-full text-left px-2 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-200 flex items-center gap-2",
                                "text-foreground hover:text-primary-foreground",
                                highlightedIndex === flatIdx ? "bg-primary/20 text-primary scale-[1.02]" : "hover:bg-primary hover:text-primary-foreground hover:scale-105"
                              )}
                            >
                              <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                              {term}
                              {getDisplayCount(term) > 0 && (
                                <span className="ml-auto text-[8px] text-muted-foreground">
                                  {getDisplayCount(term)}x
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>}
                  
                  {/* Location Suggestions */}
                  {filteredSuggestions.locations.length > 0 && <div className="p-2 border-b border-border/50">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground mb-1.5">
                        <MapPin className="h-2.5 w-2.5 text-purple-500" />
                        Locations
                      </div>
                      <div className="space-y-0.5">
                        {filteredSuggestions.locations.map((location, i) => {
                          const flatIdx = filteredSuggestions.recent.length + i;
                          return (
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
                              className={cn(
                                "w-full text-left px-2 py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-2",
                                "text-foreground hover:text-primary-foreground",
                                highlightedIndex === flatIdx ? "bg-primary/20 text-primary" : "hover:bg-primary hover:text-primary-foreground"
                              )}
                            >
                              <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                              {location}
                              {getDisplayCount(location) > 0 && (
                                <span className="ml-auto text-[8px] text-muted-foreground">
                                  {getDisplayCount(location)}x
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>}
                  
                  {/* Trending */}
                  {filteredSuggestions.trending.length > 0 && <div className="p-2 border-b border-border/50">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground mb-1.5">
                        <TrendingUp className="h-2.5 w-2.5 text-green-500" />
                        Trending
                      </div>
                      <div className="space-y-0.5">
                        {filteredSuggestions.trending.map((trend, i) => {
                          const flatIdx = filteredSuggestions.recent.length + filteredSuggestions.locations.length + i;
                          return (
                            <button key={i} type="button" onClick={e => {
                              e.stopPropagation();
                              trackSuggestionClick(trend);
                              setSearchQuery(trend);
                              setShowSuggestions(false);
                              handleSearch();
                            }} className={cn(
                              "w-full text-left px-2 py-1.5 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-between",
                              "text-foreground hover:text-primary-foreground",
                              highlightedIndex === flatIdx ? "bg-primary/20 text-primary" : "hover:bg-primary hover:text-primary-foreground"
                            )}>
                              <span>{trend}</span>
                              {getDisplayCount(trend) > 0 && (
                                <span className="text-[8px] text-muted-foreground">
                                  {getDisplayCount(trend)}x
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>}

                  {/* Live Search Results */}
                  {searchQuery && (liveResults.length > 0 || isLiveSearching) && (
                    <div className="p-2 border-b border-border/50">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground mb-1.5">
                        <Sparkles className="h-2.5 w-2.5 text-primary" />
                        {language === 'id' ? 'Hasil Pencarian' : 'Live Results'}
                        {isLiveSearching && <div className="ml-1 h-2 w-2 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <div className="space-y-0.5">
                        {liveResults.map((result) => (
                          <button
                            key={result.id}
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSearchQuery(result.title);
                              setShowSuggestions(false);
                              handleSearch();
                            }}
                            className="w-full text-left px-2 py-2 text-[11px] text-foreground hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Home className="h-3 w-3 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold truncate">{result.title}</div>
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                <MapPin className="h-2 w-2" />
                                <span className="truncate">{result.location}</span>
                                <span className="ml-auto font-semibold text-primary">
                                  Rp {(result.price / 1000000).toFixed(0)} Jt
                                </span>
                              </div>
                            </div>
                          </button>
                        ))}
                        {isLiveSearching && liveResults.length === 0 && (
                          <div className="text-center py-2 text-[10px] text-muted-foreground">
                            {language === 'id' ? 'Mencari...' : 'Searching...'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Popular Categories */}
                  {!searchQuery && <div className="p-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground mb-2">
                      <span>🔥</span>
                      {language === 'id' ? 'Kategori Populer' : 'Popular Categories'}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {popularCategories.map((cat, i) => {
                        const flatIdx = filteredSuggestions.recent.length + filteredSuggestions.locations.length + filteredSuggestions.trending.length + i;
                        return (
                          <button
                            key={cat.query}
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSearchQuery(cat.query);
                              setShowSuggestions(false);
                              handleSearch();
                            }}
                            className={cn(
                              "px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all duration-200",
                              highlightedIndex === flatIdx
                                ? "bg-primary text-primary-foreground border-primary/40 scale-105"
                                : "bg-card/80 border-border/50 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary/30 hover:scale-105"
                            )}
                          >
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>}
                </div>
              )}
            </div>

            {/* Property Type Button */}
            <Popover open={isPropertyTypeOpen} onOpenChange={setIsPropertyTypeOpen}>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const currentScroll = window.scrollY;
                          setIsPropertyTypeOpen(!isPropertyTypeOpen);
                          requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                        }}
                        className="p-1 flex items-center justify-center transition-colors relative"
                      >
                        <Building className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                        {filters.propertyType && filters.propertyType !== 'all' && (
                          <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[8px] font-bold rounded-full bg-blue-500 text-white min-w-[14px] text-center">
                            1
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="z-[100000] bg-background/90 backdrop-blur-md text-foreground border border-border/50 shadow-lg px-2 py-1 rounded-md">
                    <p className="text-[10px] font-medium">Property Type</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <PopoverContent 
                className="w-56 bg-yellow-400/95 dark:bg-yellow-500/90 backdrop-blur-2xl backdrop-saturate-150 border border-yellow-500/50 dark:border-yellow-400/30 rounded-2xl shadow-[0_8px_32px_rgba(250,200,0,0.3)] dark:shadow-[0_8px_32px_rgba(250,200,0,0.15)] z-[99999] p-3 ring-1 ring-yellow-500/30" 
                align="start"
                sideOffset={8}
              >
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground mb-2">Property Type</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {propertyTypeOptions.slice(0, 8).map((type) => {
                      const IconComponent = type.icon || Building;
                      return (
                        <button
                          key={type.value}
                          onClick={() => {
                            handleFilterChange('propertyType', filters.propertyType === type.value ? 'all' : type.value);
                            setIsPropertyTypeOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                            filters.propertyType === type.value 
                              ? "bg-primary text-primary-foreground shadow-md" 
                              : "bg-black/10 dark:bg-black/20 text-foreground hover:bg-primary hover:text-primary-foreground"
                          )}
                        >
                          <IconComponent className="h-3 w-3" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                  {filters.propertyType && filters.propertyType !== 'all' && (
                    <button
                      onClick={() => {
                        handleFilterChange('propertyType', 'all');
                        setIsPropertyTypeOpen(false);
                      }}
                      className="w-full mt-2 px-2 py-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Location Button */}
            {!useNearbyLocation && <Popover open={isLocationOpen} onOpenChange={(open) => {
                setIsLocationOpen(open);
                // Reset to appropriate tab based on current selection
                if (open) {
                  if (!filters.state || filters.state === 'all') {
                    setLocationActiveTab('province');
                  } else if (!filters.city || filters.city === 'all') {
                    setLocationActiveTab('city');
                  } else {
                    setLocationActiveTab('area');
                  }
                }
              }}>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            const currentScroll = window.scrollY;
                            setIsLocationOpen(!isLocationOpen);
                            requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                          }}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="p-1 flex items-center justify-center transition-colors relative"
                        >
                          <MapPin className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                          {(filters.state && filters.state !== 'all' || filters.city && filters.city !== 'all' || filters.area && filters.area !== 'all') && (
                            <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[8px] font-bold rounded-full bg-purple-500 text-white min-w-[14px] text-center">
                              {[filters.state, filters.city, filters.area].filter(f => f && f !== 'all').length}
                            </span>
                          )}
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="z-[100000] bg-background/90 backdrop-blur-md text-foreground border border-border/50 shadow-lg px-2 py-1 rounded-md">
                      <p className="text-[10px] font-medium">Manual Location</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <PopoverContent 
                  className="w-64 bg-yellow-400/95 dark:bg-yellow-500/90 backdrop-blur-2xl border-2 border-yellow-500/50 dark:border-yellow-400/30 rounded-2xl shadow-[0_8px_32px_rgba(250,200,0,0.3)] dark:shadow-[0_8px_32px_rgba(250,200,0,0.15)] z-[99999] animate-in fade-in zoom-in duration-200 overflow-hidden overscroll-contain" 
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
                  <Tabs value={locationActiveTab} onValueChange={(v) => setLocationActiveTab(v as 'province' | 'city' | 'area')} className="w-full overscroll-contain">
                    <TabsList className="w-full grid grid-cols-3 h-9 rounded-xl bg-black/30 dark:bg-black/40 p-1 backdrop-blur-xl border border-white/15">
                      <TabsTrigger
                        value="province"
                        className="text-xs text-white/70 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-macos-light-blue data-[state=active]:to-macos-blue data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-macos-blue/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentScroll = window.scrollY;
                          requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        {currentText.selectProvince.replace("Select ", "")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="city"
                        disabled={!filters.state || filters.state === "all"}
                        className="text-xs text-white/70 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-macos-light-blue data-[state=active]:to-macos-blue data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-macos-blue/30 disabled:opacity-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentScroll = window.scrollY;
                          requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        {currentText.selectCity.replace("Select ", "")}
                      </TabsTrigger>
                      <TabsTrigger
                        value="area"
                        disabled={!filters.city || filters.city === "all"}
                        className="text-xs text-white/70 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-macos-light-blue data-[state=active]:to-macos-blue data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-macos-blue/30 disabled:opacity-40"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentScroll = window.scrollY;
                          requestAnimationFrame(() => window.scrollTo(0, currentScroll));
                        }}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        {currentText.selectArea.replace("Select ", "")}
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
                        className="h-48 border border-border/30 rounded-lg bg-transparent overscroll-contain" 
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
                                // Auto-switch to city tab after province selection
                                setTimeout(() => setLocationActiveTab('city'), 150);
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
                                // Auto-switch to area tab after city selection
                                setTimeout(() => setLocationActiveTab('area'), 150);
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

            {/* All Filters Button - Icon only with tooltip */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      setShowAdvancedFilters(true);
                    }} 
                    className="p-1 flex items-center justify-center transition-colors relative"
                  >
                    <SlidersHorizontal className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                    {getActiveFiltersCount() > 0 && (
                      <span className="absolute -top-1 -right-1 px-1 py-0.5 text-[8px] font-bold rounded-full bg-emerald-500 text-white min-w-[14px] text-center">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="z-[100000] bg-background/90 backdrop-blur-md text-foreground border border-border/50 shadow-lg px-2 py-1 rounded-md">
                  <p className="text-[10px] font-medium">Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Search Button - Original Style with Gradient Border Effect */}
            <div className="relative group p-[1.5px] rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient-x transition-all duration-500 hover:shadow-lg hover:shadow-primary/30">
              <button
                onClick={handleSearch}
                aria-label={currentText.search}
                className={cn(
                  "group inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 ease-out",
                  "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400",
                  "hover:from-violet-500 hover:via-fuchsia-400 hover:to-cyan-300",
                  "hover:scale-105 hover:-translate-y-0.5",
                  "text-white shadow-lg shadow-fuchsia-500/40 hover:shadow-xl hover:shadow-fuchsia-400/50",
                  "active:scale-95 active:shadow-md",
                  "relative overflow-hidden",
                  isMobile ? "h-8 px-4 text-xs gap-1.5" : "h-10 px-6 text-sm gap-2"
                )}
              >
                {/* Animated shimmer overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out pointer-events-none rounded-full" />
                {/* Glossy shine overlay */}
                <span className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none rounded-full" />
                <Search className={cn(isMobile ? "h-3.5 w-3.5" : "h-4 w-4", "relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]")} />
                <span className="font-medium relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]">{currentText.search}</span>
              </button>
            </div>
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
              <p className={cn("text-muted-foreground bg-transparent rounded-md inline-block", isMobile ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1")}>
                {resultsCount} {currentText.resultsFound}
              </p>
            </div>}

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
        <>
          {/* Google-style: subtle scrim overlay */}
          <div 
            className="fixed inset-0 z-[99998] bg-black/20 transition-opacity" 
            onClick={() => setShowAdvancedFilters(false)}
          />
          {/* Google-style clean filter panel */}
          <div 
            ref={advancedFiltersRef} 
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className={cn(
              "fixed z-[99999] rounded-2xl shadow-2xl shadow-primary/30 flex flex-col",
              "glass-popup backdrop-blur-2xl border-primary/20",
              "touch-none select-none",
              isMobile 
                ? "inset-x-2 top-16 bottom-4" 
                : "top-16 right-4 w-[420px] max-h-[calc(100vh-5rem)]"
            )}
            style={{ 
              animation: 'scaleIn 0.15s cubic-bezier(0.2, 0, 0, 1)',
              transformOrigin: 'top right',
              overscrollBehavior: 'contain',
            }}
          >
            {/* Google-style Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10 shrink-0">
              <h3 className="text-sm font-semibold text-foreground">Filters</h3>
              <div className="flex items-center gap-2">
                {getActiveFiltersCount() > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Reset all
                  </button>
                )}
                <button 
                  onClick={() => setShowAdvancedFilters(false)} 
                  className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-full text-muted-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Google-style Active Filter Pills */}
            {getActiveFiltersCount() > 0 && (
              <div className="px-4 py-2 border-b border-primary/10 shrink-0">
                <div className="flex flex-wrap gap-1.5">
                  {filters.listingType && (
                    <span className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {filters.listingType === 'sale' ? 'Buy' : filters.listingType === 'rent' ? 'Rent' : 'All'}
                      <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleFilterChange('listingType', '')} />
                    </span>
                  )}
                  {filters.propertyType && (
                    <span className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {filters.propertyType}
                      <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleFilterChange('propertyType', '')} />
                    </span>
                  )}
                  {filters.state && filters.state !== 'all' && (
                    <span className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {provinces.find(p => p.code === filters.state)?.name || filters.state}
                      <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleFilterChange('state', 'all')} />
                    </span>
                  )}
                  {filters.bedrooms && (
                    <span className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {filters.bedrooms} BR
                      <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => handleFilterChange('bedrooms', '')} />
                    </span>
                  )}
                  {(filters.minPrice > 0 || filters.maxPrice > 0) && (
                    <span className="inline-flex items-center gap-1 h-7 px-3 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      Price set
                      <X className="h-3 w-3 cursor-pointer hover:text-primary/70" onClick={() => { handleFilterChange('minPrice', 0); handleFilterChange('maxPrice', 0); setPriceRange([0, currentFilters.maxPrice]); }} />
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Content - Scrollable */}
            <div 
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain filter-scroll" 
              style={{ touchAction: 'pan-y', scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--primary) / 0.3) transparent' }}
            >
              <div className="p-4 space-y-1 touch-pan-y">
                
                {/* Listing Type - Google-style segmented control */}
                <div className="pb-3 border-b border-border">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Listing Type</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: '', label: 'All', icon: Layers },
                      { value: 'sale', label: 'Buy', icon: DollarSign },
                      { value: 'rent', label: 'Rent', icon: Key },
                    ].map(({ value, label, icon: Icon }) => (
                      <button 
                        key={value}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleFilterChange('listingType', value);
                        }} 
                        className={cn(
                          "h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all active:scale-95 touch-manipulation",
                          filters.listingType === value 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "bg-muted/50 text-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Property Type - Google-style clean grid */}
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
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between h-11 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg px-2 transition-colors touch-manipulation">
                      <span className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        Property Type
                        {filters.propertyType && <span className="text-xs text-primary font-semibold ml-1">· {filters.propertyType}</span>}
                      </span>
                      {openSections.propertyType ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="pb-3 border-b border-border">
                      <div className="grid grid-cols-3 gap-2 px-1">
                        {[
                          { type: 'House', icon: Home },
                          { type: 'Apartment', icon: Building },
                          { type: 'Villa', icon: Home },
                          { type: 'Land', icon: LandPlot },
                          { type: 'Office', icon: Briefcase },
                          { type: 'Shop', icon: ShoppingBag }
                        ].map(({ type, icon: Icon }) => (
                          <button 
                            key={type}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleFilterChange('propertyType', filters.propertyType === type ? '' : type);
                            }}
                            className={cn(
                              "h-11 flex items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 touch-manipulation border",
                              filters.propertyType === type 
                                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Location - Google-style */}
                <Collapsible
                  open={openSections.location}
                  onOpenChange={(open) => {
                    setOpenSections(prev => ({ 
                      ...prev, 
                      location: open,
                      propertyType: false,
                      priceRange: false,
                      propertySpecs: false,
                      amenities: false
                    }));
                    if (open) {
                      if (!filters.state || filters.state === 'all') {
                        setLocationActiveTab('province');
                      } else if (!filters.city || filters.city === 'all') {
                        setLocationActiveTab('city');
                      } else {
                        setLocationActiveTab('area');
                      }
                    }
                  }}
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between h-11 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg px-2 transition-colors touch-manipulation">
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        Location
                        {(filters.state && filters.state !== 'all') && (
                          <span className="text-xs text-primary font-semibold ml-1">· {[filters.state, filters.city, filters.area].filter(f => f && f !== 'all').length} selected</span>
                        )}
                      </span>
                      {openSections.location ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="pb-3 border-b border-border">
                      <Tabs value={locationActiveTab} onValueChange={(v) => setLocationActiveTab(v as 'province' | 'city' | 'area')} className="w-full">
                        <TabsList className="w-full grid grid-cols-3 h-9 rounded-lg bg-muted p-1">
                          <TabsTrigger value="province" className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Province
                          </TabsTrigger>
                          <TabsTrigger value="city" disabled={!filters.state || filters.state === "all"} className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm disabled:opacity-40">
                            City
                          </TabsTrigger>
                          <TabsTrigger value="area" disabled={!filters.city || filters.city === "all"} className="text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm disabled:opacity-40">
                            Area
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="province" className="mt-2">
                          <Input
                            value={provinceSearch}
                            onChange={(e) => setProvinceSearch(e.target.value)}
                            placeholder="Search province..."
                            className="h-8 text-xs rounded-lg bg-muted/50 mb-2"
                          />
                          <ScrollArea className="h-32 rounded-lg border border-border bg-background">
                            <div className="p-1 space-y-0.5">
                              <button
                                onClick={() => handleFilterChange('state', 'all')}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-xs rounded-md transition-colors",
                                  (!filters.state || filters.state === 'all') ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                )}
                              >
                                Any Province
                              </button>
                              {filteredProvinces.map(province => (
                                <button
                                  key={province.code}
                                  onClick={() => {
                                    handleFilterChange('state', province.code);
                                    setTimeout(() => setLocationActiveTab('city'), 150);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 text-xs rounded-md transition-colors",
                                    filters.state === province.code ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                  )}
                                >
                                  {province.name}
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="city" className="mt-2">
                          <Input
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            placeholder="Search city..."
                            className="h-8 text-xs rounded-lg bg-muted/50 mb-2"
                          />
                          <ScrollArea className="h-32 rounded-lg border border-border bg-background">
                            <div className="p-1 space-y-0.5">
                              <button
                                onClick={() => handleFilterChange('city', 'all')}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-xs rounded-md transition-colors",
                                  (!filters.city || filters.city === 'all') ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                )}
                              >
                                Any City
                              </button>
                              {filteredCities.map(city => (
                                <button
                                  key={city.code}
                                  onClick={() => {
                                    handleFilterChange('city', city.code);
                                    setTimeout(() => setLocationActiveTab('area'), 150);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 text-xs rounded-md transition-colors",
                                    filters.city === city.code ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                  )}
                                >
                                  {city.type} {city.name}
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>

                        <TabsContent value="area" className="mt-2">
                          <Input
                            value={areaSearch}
                            onChange={(e) => setAreaSearch(e.target.value)}
                            placeholder="Search area..."
                            className="h-8 text-xs rounded-lg bg-muted/50 mb-2"
                          />
                          <ScrollArea className="h-32 rounded-lg border border-border bg-background">
                            <div className="p-1 space-y-0.5">
                              <button
                                onClick={() => {
                                  handleFilterChange('area', 'all');
                                  setTimeout(() => setOpenSections(prev => ({ ...prev, location: false, priceRange: true })), 150);
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2 text-xs rounded-md transition-colors",
                                  (!filters.area || filters.area === 'all') ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                )}
                              >
                                Any Area
                              </button>
                              {filteredAreas.map(area => (
                                <button
                                  key={area.code}
                                  onClick={() => {
                                    handleFilterChange('area', area.code);
                                    setTimeout(() => setOpenSections(prev => ({ ...prev, location: false, priceRange: true })), 150);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 text-xs rounded-md transition-colors",
                                    filters.area === area.code ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
                                  )}
                                >
                                  {area.name}
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Price Range - Google-style */}
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
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between h-11 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg px-2 transition-colors touch-manipulation">
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        Price
                        {(priceRange[0] > 0 || priceRange[1] < currentFilters.maxPrice) && (
                          <span className="text-xs text-primary font-semibold ml-1">
                            · {activeTab === 'rent' ? `${priceRange[0]}-${priceRange[1]}jt` : `${priceRange[0] >= 1000 ? (priceRange[0] / 1000).toFixed(1) : priceRange[0]}M-${priceRange[1] >= 1000 ? (priceRange[1] / 1000).toFixed(1) : priceRange[1]}M`}
                          </span>
                        )}
                      </span>
                      {openSections.priceRange ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <div className="pb-3 border-b border-border space-y-3 px-1">
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
                        className="w-full" 
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {activeTab === 'rent' ? `${priceRange[0]}jt` : priceRange[0] >= 1000 ? `${(priceRange[0] / 1000).toFixed(1)}M` : `${priceRange[0]}jt`}
                        </span>
                        <span>
                          {activeTab === 'rent' ? (priceRange[1] >= currentFilters.maxPrice ? 'Any' : `${priceRange[1]}jt`) : (priceRange[1] >= currentFilters.maxPrice ? 'Any' : priceRange[1] >= 1000 ? `${(priceRange[1] / 1000).toFixed(1)}M` : `${priceRange[1]}jt`)}
                        </span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Database-driven filters by category */}
                {filtersLoading && (
                  <div className="space-y-3 animate-pulse py-2">
                    <div className="h-10 bg-muted rounded-lg" />
                    <div className="h-10 bg-muted rounded-lg" />
                    <div className="h-10 bg-muted rounded-lg" />
                  </div>
                )}
                
                {!filtersLoading && currentDbFilters.length > 0 && currentDbFilters.map((category) => {
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
                    >
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center justify-between h-11 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg px-2 transition-colors touch-manipulation">
                          <span className="flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                            {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                            {activeCount > 0 && (
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{activeCount}</span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {activeCount > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); clearCategoryFilters(category); }}
                                className="text-xs text-primary hover:underline"
                              >
                                Clear
                              </button>
                            )}
                            {openSections[category.name] ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <div className="pb-3 border-b border-border px-1">
                          <div className="grid grid-cols-1 gap-1.5">
                            {category.options.map((filter: any) => renderDatabaseFilter(filter))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}

                {/* Bedrooms - Fallback */}
                {!filtersLoading && filters.listingType && currentDbFilters.length === 0 && (
                  <>
                    <div className="pb-3 border-b border-border">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        Bedrooms
                      </h4>
                      <div className="grid grid-cols-6 gap-2">
                        {['1', '2', '3', '4', '5', '5+'].map(bed => (
                          <button 
                            key={bed} 
                            onClick={() => handleFilterChange('bedrooms', filters.bedrooms === bed ? '' : bed)} 
                            className={cn(
                              "h-9 text-xs font-medium rounded-lg border transition-all active:scale-95",
                              filters.bedrooms === bed 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-background text-foreground border-border hover:border-primary/50"
                            )}
                          >
                            {bed}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pb-3 border-b border-border">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        Bathrooms
                      </h4>
                      <div className="grid grid-cols-6 gap-2">
                        {['1', '2', '3', '4', '5', '5+'].map(bath => (
                          <button 
                            key={bath} 
                            onClick={() => handleFilterChange('bathrooms', filters.bathrooms === bath ? '' : bath)} 
                            className={cn(
                              "h-9 text-xs font-medium rounded-lg border transition-all active:scale-95",
                              filters.bathrooms === bath 
                                ? "bg-primary text-primary-foreground border-primary" 
                                : "bg-background text-foreground border-border hover:border-primary/50"
                            )}
                          >
                            {bath}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Area/Size - Google-style */}
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
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between h-11 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg px-2 transition-colors touch-manipulation">
                        <span className="flex items-center gap-2">
                          <Square className="h-4 w-4 text-muted-foreground" />
                          Area/Size
                          {(filters.minArea || filters.maxArea) && (
                            <span className="text-xs text-primary font-semibold ml-1">· {filters.minArea || 0}-{filters.maxArea || '∞'} sqm</span>
                          )}
                        </span>
                        {openSections.propertySpecs ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      <div className="pb-3 border-b border-border space-y-2 px-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Min (sqm)</Label>
                            <Input 
                              type="number" 
                              placeholder="0"
                              value={filters.minArea}
                              onChange={(e) => handleFilterChange('minArea', e.target.value)}
                              className="h-9 text-xs rounded-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Max (sqm)</Label>
                            <Input 
                              type="number" 
                              placeholder="∞"
                              value={filters.maxArea}
                              onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                              className="h-9 text-xs rounded-lg"
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
                            <button 
                              key={range.label}
                              onClick={() => {
                                handleFilterChange('minArea', range.min);
                                handleFilterChange('maxArea', range.max);
                                setTimeout(() => setOpenSections(prev => ({ ...prev, propertySpecs: false, amenities: true, propertyType: false, location: false, priceRange: false })), 150);
                              }}
                              className={cn(
                                "h-8 text-xs font-medium rounded-lg border transition-all active:scale-95",
                                (filters.minArea === range.min && filters.maxArea === range.max)
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background text-foreground border-border hover:border-primary/50"
                              )}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Amenities - Google-style chips */}
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
                  >
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between h-11 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg px-2 transition-colors touch-manipulation">
                        <span className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          Amenities
                          {filters.features.length > 0 && (
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{filters.features.length}</span>
                          )}
                        </span>
                        {openSections.amenities ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      <div className="pb-3 border-b border-border px-1">
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'pool', label: '🏊 Pool' },
                            { value: 'gym', label: '💪 Gym' },
                            { value: 'parking', label: '🚗 Parking' },
                            { value: 'security', label: '🛡️ Security' },
                            { value: 'wifi', label: '📶 WiFi' },
                            { value: 'ac', label: '❄️ AC' },
                            { value: 'garden', label: '🌳 Garden' },
                            { value: 'balcony', label: '🏡 Balcony' }
                          ].map(amenity => {
                            const isSelected = filters.features.includes(amenity.value);
                            return (
                              <button
                                key={amenity.value}
                                onClick={() => {
                                  setFilters(prev => ({
                                    ...prev,
                                    features: isSelected 
                                      ? prev.features.filter(f => f !== amenity.value)
                                      : [...prev.features, amenity.value]
                                  }));
                                }}
                                className={cn(
                                  "h-8 px-3 rounded-full text-xs font-medium border transition-all active:scale-95",
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-foreground border-border hover:border-primary/50"
                                )}
                              >
                                {amenity.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-primary/10 px-4 py-3 shrink-0 flex items-center gap-3">
              <button 
                onClick={clearAllFilters} 
                className="flex-1 h-10 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors active:scale-[0.98]"
              >
                Clear all
              </button>
              <Button 
                onClick={() => {
                  handleSearch();
                  setShowAdvancedFilters(false);
                }} 
                className="flex-1 h-10 text-sm font-semibold rounded-lg"
                size="sm"
              >
                <Search className="h-4 w-4 mr-2" />
                Show results
              </Button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  </div>
}
export default AstraSearchPanel;