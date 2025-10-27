import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Search, MapPin, Home, Building, DollarSign, Filter, Bed, Bath, X, Bot, Sparkles, Zap, Square, Star, Settings, ChevronDown, ChevronUp, Calendar as CalendarIcon, Clock, Users, TrendingUp } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<'all' | 'sale' | 'rent' | 'new_project'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [areaRange, setAreaRange] = useState([0, 1000]);
  const [useNearbyLocation, setUseNearbyLocation] = useState(false);
  const [nearbyRadius, setNearbyRadius] = useState(5); // Default 5km
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationButtons, setShowLocationButtons] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Ref for click outside detection
  const filterRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Detect mobile and scroll behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (window.innerWidth < 768) { // Only on mobile
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsMinimized(true);
        } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
          setIsMinimized(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);
  
  // Trending and smart suggestions
  const trendingSearches = [
    "Apartment Jakarta Selatan",
    "Villa Bali",
    "Rumah Bandung",
    "Office Space Sudirman"
  ];
  
  const smartSuggestions = [
    "🏠 Houses under 1B",
    "🏢 Apartments near MRT",
    "🏖️ Beach Villas",
    "💼 Commercial Properties"
  ];
  
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
      yearBuilt: "Year Built",
      condition: "Condition",
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
      yearBuilt: "Tahun Dibangun",
      condition: "Kondisi",
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setUseNearbyLocation(true);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert(currentText.locationError);
        setIsGettingLocation(false);
      }
    );
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
    { id: 'elevator', label: currentText.elevator, icon: '🛗' },
    { id: 'cctv', label: currentText.cctv, icon: '📹' },
    { id: 'balcony', label: currentText.balcony, icon: '🏢' },
    { id: 'storage', label: currentText.storage, icon: '📦' },
    { id: 'maid_room', label: currentText.maidRoom, icon: '🏠' },
    { id: 'study_room', label: currentText.studyRoom, icon: '📚' },
    { id: 'walk_in_closet', label: currentText.walkInCloset, icon: '👗' },
    { id: 'intercom', label: currentText.intercom, icon: '📞' },
    { id: 'generator', label: currentText.generator, icon: '⚡' },
    { id: 'water_heater', label: currentText.waterHeater, icon: '🚿' },
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
      { id: 'elevator', label: currentText.elevator, icon: '🛗' },
      { id: 'cctv', label: currentText.cctv, icon: '📹' },
      { id: 'balcony', label: currentText.balcony, icon: '🏢' },
      { id: 'storage', label: currentText.storage, icon: '📦' },
      { id: 'maid_room', label: currentText.maidRoom, icon: '🏠' },
      { id: 'study_room', label: currentText.studyRoom, icon: '📚' },
      { id: 'walk_in_closet', label: currentText.walkInCloset, icon: '👗' },
      { id: 'intercom', label: currentText.intercom, icon: '📞' },
      { id: 'generator', label: currentText.generator, icon: '⚡' },
      { id: 'water_heater', label: currentText.waterHeater, icon: '🚿' },
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
      { id: 'wifi', label: currentText.wifi, icon: '📶' },
      { id: 'ac', label: currentText.ac, icon: '❄️' },
      { id: 'parking', label: currentText.parking, icon: '🅿️' },
      { id: 'laundry', label: currentText.laundry, icon: '👕' },
      { id: 'kitchen', label: currentText.kitchen, icon: '🍳' },
      { id: 'pets_allowed', label: currentText.petsAllowed, icon: '🐕' },
      { id: 'swimming_pool', label: currentText.pool, icon: '🏊' },
      { id: 'gym', label: currentText.gym, icon: '💪' },
      { id: 'security', label: currentText.security, icon: '🔒' },
      { id: 'elevator', label: currentText.elevator, icon: '🛗' },
      { id: 'cctv', label: currentText.cctv, icon: '📹' },
      { id: 'balcony', label: currentText.balcony, icon: '🏢' },
      { id: 'storage', label: currentText.storage, icon: '📦' },
      { id: 'housekeeping', label: currentText.housekeeping, icon: '🧹' },
      { id: 'concierge', label: currentText.concierge, icon: '🛎️' },
      { id: 'coworking', label: currentText.coworking, icon: '💻' },
      { id: 'playground', label: currentText.playground, icon: '🎠' },
      { id: 'bbq_area', label: currentText.bbqArea, icon: '🔥' },
      { id: 'intercom', label: currentText.intercom, icon: '📞' },
      { id: 'generator', label: currentText.generator, icon: '⚡' },
      { id: 'water_heater', label: currentText.waterHeater, icon: '🚿' },
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

  // Close filters and suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close filters if clicking outside
      if (
        filterRef.current && 
        !filterRef.current.contains(target) && 
        showFilters &&
        !target.closest('[role="dialog"]') &&
        !target.closest('[role="listbox"]') &&
        !target.closest('[role="presentation"]') &&
        !target.closest('.pointer-events-auto')
      ) {
        setShowFilters(false);
      }
      
      // Close suggestions if clicking outside the suggestions dropdown
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(target) &&
        showSuggestions
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, showSuggestions]);

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
      sortBy: filters.sortBy,
      nearbySearch: useNearbyLocation,
      userLocation: userLocation,
      radius: nearbyRadius
    };

    console.log('Search data being sent:', searchData);
    onSearch(searchData);
  };

  // Simple mobile view - only input and button by default
  if (isMobile && !showFilters) {
    return (
      <div className="w-full sticky top-12 z-40 transition-all duration-300 px-1">
        <div className="backdrop-blur-xl bg-background/95 border-b border-border/30 shadow-lg rounded-b-xl">
          <div className="flex items-center gap-1.5 p-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={currentText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-2 h-9 text-xs bg-background/60 border-0 rounded-xl font-medium shadow-sm"
              />
            </div>
            <Button
              onClick={() => setShowFilters(true)}
              variant="outline"
              size="sm"
              className="h-9 px-2.5 border-0 bg-background/60 shadow-sm rounded-xl relative"
            >
              <Filter className="h-3.5 w-3.5" />
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-md">
                  {getActiveFiltersCount()}
                </span>
              )}
            </Button>
            <Button
              onClick={handleSearch}
              size="sm"
              className="h-9 px-3 text-xs btn-primary-ios shadow-md rounded-xl"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "w-full transition-all duration-300",
      isMobile ? "sticky top-12 z-40 px-1" : "max-w-7xl mx-auto"
    )}>
      {/* Modern Slim Glass Container */}
      <div className="backdrop-blur-xl border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className={cn(
          "space-y-2 bg-background/40 backdrop-blur-md rounded-2xl shadow-lg border border-border/30",
          isMobile ? "p-2" : "p-3 lg:p-4"
        )}>
          
          {/* Mobile close button when filters are open */}
          {isMobile && (
            <div className="flex justify-between items-center pb-1 border-b border-border/30">
              <span className="text-xs font-bold text-foreground">Search Filters</span>
              <Button
                onClick={() => setShowFilters(false)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-lg hover:bg-destructive/10"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          )}
          
          {/* Compact Tabs for Sale/Rent/All */}
          <div className="flex justify-center">
            <div className={cn(
              "inline-flex bg-background/60 rounded-xl border-0 shadow-sm relative",
              isMobile ? "p-0.5" : "p-1"
            )}>
              {/* Sliding background indicator */}
              <div 
                className="absolute inset-y-1 bg-primary rounded-lg shadow-md transition-all duration-300 ease-out"
                style={{
                  width: 'calc(25% - 2px)',
                  left: activeTab === 'all' ? '2px' : 
                        activeTab === 'sale' ? 'calc(25% + 1px)' : 
                        activeTab === 'rent' ? 'calc(50%)' : 
                        'calc(75% - 1px)',
                }}
              />
              
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  "relative z-10 rounded-lg font-bold uppercase tracking-wide transition-all duration-200 flex-1",
                  isMobile ? "px-2 py-1 text-[9px] min-w-[50px]" : "px-3 py-1.5 text-[10px] min-w-[60px]",
                  activeTab === 'all' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {currentText.all}
              </button>
              <button
                onClick={() => setActiveTab('sale')}
                className={cn(
                  "relative z-10 rounded-lg font-bold uppercase tracking-wide transition-all duration-200 flex-1",
                  isMobile ? "px-2 py-1 text-[9px] min-w-[50px]" : "px-3 py-1.5 text-[10px] min-w-[60px]",
                  activeTab === 'sale' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {currentText.forSale}
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={cn(
                  "relative z-10 rounded-lg font-bold uppercase tracking-wide transition-all duration-200 flex-1",
                  isMobile ? "px-2 py-1 text-[9px] min-w-[50px]" : "px-3 py-1.5 text-[10px] min-w-[60px]",
                  activeTab === 'rent' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {currentText.forRent}
              </button>
              <button
                onClick={() => setActiveTab('new_project')}
                className={cn(
                  "relative z-10 rounded-lg font-bold uppercase tracking-wide transition-all duration-200 flex-1",
                  isMobile ? "px-2 py-1 text-[9px] min-w-[50px]" : "px-3 py-1.5 text-[10px] min-w-[60px]",
                  activeTab === 'new_project' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {isMobile ? "New" : currentText.newProject}
              </button>
            </div>
          </div>
          
          
          {/* Compact Search Row with Location Options */}
          <div className={cn("flex", isMobile ? "gap-1" : "gap-2 lg:gap-3")}>
            <div className="flex-1 relative">
              <Search className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 text-primary pointer-events-none",
                isMobile ? "h-3 w-3 left-2" : "h-4 w-4"
              )} />
              <Input
                placeholder={currentText.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className={cn(
                  "bg-background/60 border-0 rounded-xl focus:ring-2 focus:ring-primary/50 transition-all shadow-sm font-medium",
                  isMobile ? "pl-8 pr-16 h-9 text-xs" : "pl-10 pr-20 h-11 text-sm"
                )}
              />
              
              {/* Location Options Inside Input */}
              <div className={cn(
                "absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center",
                isMobile ? "gap-0.5" : "gap-1"
              )}>
                <Button
                  onClick={() => toggleSearchType('location')}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-0 rounded-md",
                    isMobile ? "h-6 w-6" : "h-7 w-7",
                    !useNearbyLocation ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                  title={currentText.location}
                >
                  <MapPin className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                </Button>
                <Button
                  onClick={() => toggleSearchType('nearby')}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "p-0 rounded-md",
                    isMobile ? "h-6 w-6" : "h-7 w-7",
                    useNearbyLocation ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                  disabled={isGettingLocation}
                  title={isGettingLocation ? currentText.gettingLocation : currentText.nearMe}
                >
                  <MapPin className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} fill={useNearbyLocation ? "currentColor" : "none"} />
                </Button>
              </div>
              
              {/* Smart Suggestions Dropdown */}
              {showSuggestions && searchQuery.length === 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[100] max-h-64 overflow-y-auto"
                >
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <Sparkles className="h-3 w-3 text-yellow-500" />
                        Smart Selection
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSuggestions(false);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {smartSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const cleanText = suggestion.replace(/[🏠🏢🏖️💼]\s/, '');
                            setSearchQuery(cleanText);
                            setShowSuggestions(false);
                            handleSearch();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      Trending
                    </div>
                    <div className="space-y-1">
                      {trendingSearches.map((trend, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery(trend);
                            setShowSuggestions(false);
                            handleSearch();
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          {trend}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={cn("flex items-center", isMobile ? "gap-0.5" : "gap-1")}>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className={cn(
                  "relative bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all",
                  isMobile ? "h-9 px-2" : "h-11 px-4"
                )}
              >
                <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-2")}>
                  <Filter className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
                  {!isMobile && <span className="hidden sm:inline text-sm">Filters</span>}
                  {getActiveFiltersCount() > 0 && (
                    <span className={cn(
                      "bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-full",
                      isMobile ? "text-[9px] px-1.5 py-0.5" : "ml-1 text-xs px-2 py-0.5"
                    )}>
                      {getActiveFiltersCount()}
                    </span>
                  )}
                </div>
              </Button>
              {getActiveFiltersCount() > 0 && !isMobile && (
                <Button
                  onClick={clearAllFilters}
                  variant="ghost"
                  size="sm"
                  className="h-11 px-3 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                  title="Clear all filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              className={cn(
                "bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center",
                isMobile ? "h-9 px-3 text-xs gap-1" : "h-11 px-6 text-sm gap-2"
              )}
            >
              <Search className={cn(isMobile ? "h-3 w-3" : "h-4 w-4")} />
              {!isMobile && <span className="hidden sm:inline">{currentText.search}</span>}
            </Button>
          </div>
          
          {/* Radius Selector - Shows when Near Me is active */}
          {useNearbyLocation && userLocation && (
            <div className="flex items-center justify-center gap-2 animate-fade-in">
              <Select
                value={nearbyRadius.toString()}
                onValueChange={(value) => setNearbyRadius(parseInt(value))}
              >
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
            </div>
          )}

          {/* Results Count */}
          {resultsCount !== undefined && (
            <div className="text-center">
              <p className={cn(
                "text-muted-foreground bg-muted/30 rounded-md backdrop-blur-sm inline-block",
                isMobile ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1"
              )}>
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

          {/* Location Selection Row - 3 separate dropdowns - Only show when not using nearby search */}
          {!useNearbyLocation && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {/* State/Province Selection */}
              <Select value={filters.state || "all"} onValueChange={handleStateChange}>
                <SelectTrigger className="h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-md hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-blue-500" />
                    <SelectValue placeholder={currentText.selectProvince}>
                      <span className="truncate">
                        {filters.state && filters.state !== 'all' 
                          ? provinces.find(p => p.code === filters.state)?.name 
                          : currentText.any}
                      </span>
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-gray-900 border-border rounded-lg shadow-2xl max-h-56 overflow-y-auto z-[99999] backdrop-blur-sm">
                  <SelectItem value="all" className="text-xs hover:bg-accent rounded cursor-pointer">{currentText.any}</SelectItem>
                  {provinces.map((province) => (
                    <SelectItem key={province.code} value={province.code} className="text-xs hover:bg-accent rounded cursor-pointer">
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
                <SelectTrigger className="h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-md hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder={currentText.selectCity}>
                    <span className="truncate">
                      {filters.city && filters.city !== 'all' 
                        ? (() => {
                            const city = cities.find(c => c.code === filters.city);
                            return city ? `${city.type} ${city.name}` : currentText.any;
                          })()
                        : currentText.any}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-gray-900 border-border rounded-lg shadow-2xl max-h-56 overflow-y-auto z-[99999] backdrop-blur-sm">
                  <SelectItem value="all" className="text-xs hover:bg-accent rounded cursor-pointer">{currentText.any}</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.code} value={city.code} className="text-xs hover:bg-accent rounded cursor-pointer">
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
                <SelectTrigger className="h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-md hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue placeholder={currentText.selectArea}>
                    <span className="truncate">
                      {filters.area && filters.area !== 'all' 
                        ? areas.find(a => a.code === filters.area)?.name 
                        : currentText.any}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background dark:bg-gray-900 border-border rounded-lg shadow-2xl max-h-56 overflow-y-auto z-[99999] backdrop-blur-sm">
                  <SelectItem value="all" className="text-xs hover:bg-accent rounded cursor-pointer">{currentText.any}</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.code} value={area.code} className="text-xs hover:bg-accent rounded cursor-pointer">
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Property Type and Other Filters Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
            {/* Property Type Selection */}
            <Select value={filters.propertyType || "all"} onValueChange={(value) => handleFilterChange('propertyType', value)}>
              <SelectTrigger className="h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-md hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm">
                <div className="flex items-center gap-1.5">
                  <Home className="h-3 w-3 text-blue-500" />
                  <SelectValue placeholder={currentText.propertyType} />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-[100] animate-in fade-in-80">
                <SelectItem value="all" className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded m-0.5 cursor-pointer">{currentText.any}</SelectItem>
                {currentFilters.propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded m-0.5 cursor-pointer">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bedrooms Filter - Button style with value display */}
            <div className="hidden lg:block">
              <div className="flex flex-col gap-1">
                <Label className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <Bed className="h-2.5 w-2.5 text-blue-500" />
                  {currentText.bedrooms}
                  {filters.bedrooms && filters.bedrooms !== 'all' && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[9px]">
                      {filters.bedrooms}
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-1">
                  {/* Any button */}
                  <Button
                    type="button"
                    variant={(!filters.bedrooms || filters.bedrooms === 'all') ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('bedrooms', 'all')}
                    className="h-5 px-2 text-[10px] rounded-md"
                  >
                    Any
                  </Button>
                  
                  {/* Stepper only */}
                  <div className="inline-flex items-center border border-border rounded-md overflow-hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-6 p-0 rounded-none hover:bg-muted"
                      onClick={() => {
                        const current = (!filters.bedrooms || filters.bedrooms === 'all') ? 0 : parseInt(String(filters.bedrooms).replace('+',''));
                        if (current > 0) {
                          const next = current - 1;
                          handleFilterChange('bedrooms', next === 0 ? 'all' : String(next));
                        }
                      }}
                    >
                      <span className="text-sm font-bold">−</span>
                    </Button>
                    <span className="min-w-[28px] h-5 flex items-center justify-center bg-muted/30 px-1.5 text-[10px] font-semibold">
                      {(!filters.bedrooms || filters.bedrooms === 'all') ? '0' : String(filters.bedrooms).replace('+','')}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-6 p-0 rounded-none hover:bg-muted"
                      onClick={() => {
                        const current = (!filters.bedrooms || filters.bedrooms === 'all') ? 0 : parseInt(String(filters.bedrooms).replace('+',''));
                        if (current < 1000) {
                          handleFilterChange('bedrooms', String(current + 1));
                        }
                      }}
                    >
                      <span className="text-sm font-bold">+</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bathrooms Filter - Button style with value display */}
            <div className="hidden lg:block">
              <div className="flex flex-col gap-1">
                <Label className="text-[9px] text-muted-foreground flex items-center gap-1">
                  <Bath className="h-2.5 w-2.5 text-blue-500" />
                  {currentText.bathrooms}
                  {filters.bathrooms && filters.bathrooms !== 'all' && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[9px]">
                      {filters.bathrooms}
                    </span>
                  )}
                </Label>
                <div className="flex items-center gap-1">
                  {/* Any button */}
                  <Button
                    type="button"
                    variant={(!filters.bathrooms || filters.bathrooms === 'all') ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('bathrooms', 'all')}
                    className="h-5 px-2 text-[10px] rounded-md"
                  >
                    Any
                  </Button>
                  
                  {/* Stepper only */}
                  <div className="inline-flex items-center border border-border rounded-md overflow-hidden">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-6 p-0 rounded-none hover:bg-muted"
                      onClick={() => {
                        const current = (!filters.bathrooms || filters.bathrooms === 'all') ? 0 : parseInt(String(filters.bathrooms).replace('+',''));
                        if (current > 0) {
                          const next = current - 1;
                          handleFilterChange('bathrooms', next === 0 ? 'all' : String(next));
                        }
                      }}
                    >
                      <span className="text-sm font-bold">−</span>
                    </Button>
                    <span className="min-w-[28px] h-5 flex items-center justify-center bg-muted/30 px-1.5 text-[10px] font-semibold">
                      {(!filters.bathrooms || filters.bathrooms === 'all') ? '0' : String(filters.bathrooms).replace('+','')}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-6 p-0 rounded-none hover:bg-muted"
                      onClick={() => {
                        const current = (!filters.bathrooms || filters.bathrooms === 'all') ? 0 : parseInt(String(filters.bathrooms).replace('+',''));
                        if (current < 1000) {
                          handleFilterChange('bathrooms', String(current + 1));
                        }
                      }}
                    >
                      <span className="text-sm font-bold">+</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

           {/* Advanced Filters Modal */}
          {showFilters && (
            <div ref={filterRef} className="fixed z-[200] isolate pointer-events-auto left-0 right-0 top-14 bottom-0 md:top-24 md:bottom-auto md:h-[80vh] md:left-1/2 md:-translate-x-1/2 md:w-[min(92vw,1100px)] bg-gradient-to-br from-background/60 via-muted/40 to-background/60 backdrop-blur-xl border border-border/50 rounded-t-xl md:rounded-2xl p-3 md:p-4 space-y-2 shadow-2xl overflow-y-auto">
              <div className="flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 pb-1.5 border-b border-border/30">
                <h3 className="text-foreground font-semibold text-[10px] flex items-center gap-1.5">
                  <Filter className="h-2.5 w-2.5 text-primary" />
                  {currentText.advancedFilters}
                </h3>
                <div className="flex items-center gap-1.5">
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[9px] hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                  >
                    <X className="h-2.5 w-2.5 mr-0.5" />
                    {currentText.clearFilters}
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>


              {/* Filter Categories in Tabs */}
              <Tabs defaultValue="propertySpecs" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-7 bg-muted/50 p-0.5">
                  <TabsTrigger value="propertySpecs" className="text-[9px] px-1 py-0.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Home className="h-2.5 w-2.5 mr-0.5" />
                    Property
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="text-[9px] px-1 py-0.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <DollarSign className="h-2.5 w-2.5 mr-0.5" />
                    Price
                  </TabsTrigger>
                  <TabsTrigger value="location" className="text-[9px] px-1 py-0.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <MapPin className="h-2.5 w-2.5 mr-0.5" />
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="amenities" className="text-[9px] px-1 py-0.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Building className="h-2.5 w-2.5 mr-0.5" />
                    Amenities
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="propertySpecs" className="space-y-1.5 mt-2 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-2">
                
                {/* Room Configuration - Compact Row Layout */}
                <div>
                  <Label className="text-[9px] font-medium text-blue-700 dark:text-blue-300 mb-1 block">Rooms</Label>
                  
                  <div className="grid grid-cols-2 gap-1.5">
                    {/* Bedrooms - Compact */}
                    <div>
                      <Label className="text-[8px] text-blue-600 dark:text-blue-400 mb-0.5 flex items-center gap-0.5">
                        <Bed className="h-2 w-2 text-blue-500" />
                        {currentText.bedrooms}
                      </Label>
                      <div className="flex items-center gap-0.5">
                        <Button
                          type="button"
                          variant={(!filters.bedrooms || filters.bedrooms === 'all') ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('bedrooms', 'all')}
                          className="h-5 px-1.5 text-[9px] rounded-md flex-1"
                        >
                          Any
                        </Button>
                        <div className="inline-flex items-center border border-border rounded-md overflow-hidden">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 rounded-none hover:bg-muted"
                            onClick={() => {
                              const current = (!filters.bedrooms || filters.bedrooms === 'all') ? 0 : parseInt(String(filters.bedrooms).replace('+',''));
                              if (current > 0) {
                                const next = current - 1;
                                handleFilterChange('bedrooms', next === 0 ? 'all' : String(next));
                              }
                            }}
                          >
                            <span className="text-xs font-bold">−</span>
                          </Button>
                          <span className="min-w-[24px] h-5 flex items-center justify-center bg-muted/30 px-1 text-[9px] font-semibold">
                            {(!filters.bedrooms || filters.bedrooms === 'all') ? '0' : String(filters.bedrooms).replace('+','')}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 rounded-none hover:bg-muted"
                            onClick={() => {
                              const current = (!filters.bedrooms || filters.bedrooms === 'all') ? 0 : parseInt(String(filters.bedrooms).replace('+',''));
                              if (current < 1000) {
                                handleFilterChange('bedrooms', String(current + 1));
                              }
                            }}
                          >
                            <span className="text-xs font-bold">+</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bathrooms - Compact */}
                    <div>
                      <Label className="text-[8px] text-blue-600 dark:text-blue-400 mb-0.5 flex items-center gap-0.5">
                        <Bath className="h-2 w-2 text-blue-500" />
                        {currentText.bathrooms}
                      </Label>
                      <div className="flex items-center gap-0.5">
                        <Button
                          type="button"
                          variant={(!filters.bathrooms || filters.bathrooms === 'all') ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('bathrooms', 'all')}
                          className="h-5 px-1.5 text-[9px] rounded-md flex-1"
                        >
                          Any
                        </Button>
                        <div className="inline-flex items-center border border-border rounded-md overflow-hidden">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 rounded-none hover:bg-muted"
                            onClick={() => {
                              const current = (!filters.bathrooms || filters.bathrooms === 'all') ? 0 : parseInt(String(filters.bathrooms).replace('+',''));
                              if (current > 0) {
                                const next = current - 1;
                                handleFilterChange('bathrooms', next === 0 ? 'all' : String(next));
                              }
                            }}
                          >
                            <span className="text-xs font-bold">−</span>
                          </Button>
                          <span className="min-w-[24px] h-5 flex items-center justify-center bg-muted/30 px-1 text-[9px] font-semibold">
                            {(!filters.bathrooms || filters.bathrooms === 'all') ? '0' : String(filters.bathrooms).replace('+','')}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 rounded-none hover:bg-muted"
                            onClick={() => {
                              const current = (!filters.bathrooms || filters.bathrooms === 'all') ? 0 : parseInt(String(filters.bathrooms).replace('+',''));
                              if (current < 1000) {
                                handleFilterChange('bathrooms', String(current + 1));
                              }
                            }}
                          >
                            <span className="text-xs font-bold">+</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Details - Compact Grid Layout */}
                <div className="grid grid-cols-2 gap-1.5">
                  {/* Year Built */}
                  <div>
                    <Label className="text-[8px] text-blue-600 dark:text-blue-400 mb-0.5 flex items-center gap-0.5">
                      <Settings className="h-2 w-2 text-blue-500" />
                      {currentText.yearBuilt}
                    </Label>
                    <div className="flex flex-wrap gap-0.5">
                      <Button
                        type="button"
                        variant={(!filters.yearBuilt || filters.yearBuilt === 'all') ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('yearBuilt', 'all')}
                        className="h-5 px-1.5 text-[8px] border-blue-200 dark:border-blue-800"
                      >
                        Any
                      </Button>
                      {yearOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={filters.yearBuilt === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('yearBuilt', option.value)}
                          className="h-5 px-1.5 text-[8px] border-blue-200 dark:border-blue-800"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <Label className="text-[8px] text-blue-600 dark:text-blue-400 mb-0.5 flex items-center gap-0.5">
                      <Settings className="h-2 w-2 text-blue-500" />
                      {currentText.condition}
                    </Label>
                    <div className="flex flex-wrap gap-0.5">
                      <Button
                        type="button"
                        variant={(!filters.condition || filters.condition === 'all') ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('condition', 'all')}
                        className="h-5 px-1.5 text-[8px] border-blue-200 dark:border-blue-800"
                      >
                        Any
                      </Button>
                      {conditionOptions.map((option) => (
                        <Button
                          key={option.value}
                          type="button"
                          variant={filters.condition === option.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('condition', option.value)}
                          className="h-5 px-1.5 text-[8px] border-blue-200 dark:border-blue-800"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Furnishing - Compact */}
                <div>
                  <Label className="text-[8px] text-blue-600 dark:text-blue-400 mb-0.5 block">Furnishing</Label>
                  <div className="grid grid-cols-2 gap-0.5">
                    <Button
                      type="button"
                      variant={(!filters.furnishing || filters.furnishing === 'all') ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('furnishing', 'all')}
                      className="h-5 px-1.5 text-[8px] border-blue-200 dark:border-blue-800"
                    >
                      Any
                    </Button>
                    <Button
                      type="button"
                      variant={filters.furnishing === 'unfurnished' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('furnishing', 'unfurnished')}
                      className="h-5 px-1.5 text-[8px] border-blue-200 dark:border-blue-800"
                    >
                      Unfurnished
                    </Button>
                    <Button
                      type="button"
                      variant={filters.furnishing === 'semi_furnished' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('furnishing', 'semi_furnished')}
                      className="h-5 px-1.5 text-[8px] border-blue-200 dark:border-blue-800"
                    >
                      Semi
                    </Button>
                    <Button
                      type="button"
                      variant={filters.furnishing === 'fully_furnished' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('furnishing', 'fully_furnished')}
                      className="h-5 px-1.5 text-[8px] border-blue-200 dark:border-blue-800"
                    >
                      Fully
                    </Button>
                  </div>
                </div>
                </TabsContent>

                <TabsContent value="pricing" className="space-y-4 mt-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 rounded-lg p-4">

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
                </TabsContent>

                <TabsContent value="amenities" className="space-y-2.5 mt-2 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-2.5">
                
                <div className="grid grid-cols-2 gap-2">
                  {currentFilters.features.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-1.5 p-1.5 bg-white/50 dark:bg-purple-950/20 rounded-lg">
                      <Checkbox
                        id={feature.id}
                        checked={filters.features.includes(feature.id)}
                        onCheckedChange={() => handleFeatureToggle(feature.id)}
                        className="border-purple-300 dark:border-purple-700 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                      />
                      <Label
                        htmlFor={feature.id}
                        className="text-[9px] font-normal cursor-pointer flex items-center gap-0.5 text-purple-700 dark:text-purple-300"
                      >
                        <span className="text-[10px]">{feature.icon}</span>
                        <span>{feature.label}</span>
                      </Label>
                     </div>
                  ))}
                 </div>
                </TabsContent>
              </Tabs>

              {/* Rental Details Category - Only show for rent tab */}
              {activeTab === 'rent' && (
                <div className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-800/50 rounded-lg p-2.5 space-y-2.5 mt-2">
                    
                    {/* Date Selection */}
                    <div>
                      <Label className="text-[10px] font-medium text-orange-700 dark:text-orange-300 mb-2 block">Rental Dates</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[9px] text-orange-600 dark:text-orange-400 mb-1 block">{currentText.checkIn}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-7 justify-start text-left font-normal border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-orange-950/30 text-[9px]"
                              >
                                <CalendarIcon className="mr-1 h-2.5 w-2.5 text-orange-500" />
                                {filters.checkInDate ? format(filters.checkInDate, "PPP") : currentText.selectDate}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-950 border-orange-200 dark:border-orange-800 z-[210]" align="start">
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
                          <Label className="text-[9px] text-orange-600 dark:text-orange-400 mb-1 block">{currentText.checkOut}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full h-7 justify-start text-left font-normal border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-orange-950/30 text-[9px]"
                              >
                                <CalendarIcon className="mr-1 h-2.5 w-2.5 text-orange-500" />
                                {filters.checkOutDate ? format(filters.checkOutDate, "PPP") : currentText.selectDate}
                              </Button>
                            </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-950 border-orange-200 dark:border-orange-800 z-[210]" align="start">
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
                        <div className="mt-2 text-center p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <div className="text-[10px] font-semibold text-orange-700 dark:text-orange-300">
                            {calculateDays()} {currentText.days}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rental Duration */}
                    <div>
                      <Label className="text-[10px] font-medium text-orange-700 dark:text-orange-300 mb-2 block">Rental Duration</Label>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-2.5 w-2.5 text-orange-500" />
                        <Select value={filters.rentalDuration} onValueChange={(value) => handleFilterChange('rentalDuration', value)}>
                          <SelectTrigger className="h-7 text-[9px] border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-orange-950/30">
                            <SelectValue placeholder={`${currentText.any} ${currentText.rentalDuration.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-950 border-orange-200 dark:border-orange-800 z-[210]">
                            <SelectItem value="all" className="text-[9px]">{currentText.any}</SelectItem>
                            {rentalDurationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="text-[9px]">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Trip Purpose */}
                    <div>
                      <Label className="text-[10px] font-medium text-orange-700 dark:text-orange-300 mb-2 block">Trip Purpose</Label>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Users className="h-2.5 w-2.5 text-orange-500" />
                        <span className="text-[9px] text-orange-600 dark:text-orange-400">{currentText.tripPurpose}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {tripPurposeOptions.map((purpose) => (
                          <Button
                            key={purpose.value}
                            variant={filters.tripPurpose === purpose.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange('tripPurpose', purpose.value)}
                            className="h-6 text-[9px] justify-start gap-0.5 border-orange-200 dark:border-orange-800"
                          >
                            <span className="text-[10px]">{purpose.icon}</span>
                            {purpose.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                </div>
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
                  <SelectContent className="bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 z-[210]">
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