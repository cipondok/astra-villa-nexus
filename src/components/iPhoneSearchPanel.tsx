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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Search, MapPin, Home, Building, DollarSign, Filter, Bed, Bath, X, Bot, Sparkles, Zap, Square, Star, Settings, ChevronDown, ChevronUp, Calendar as CalendarIcon, Clock, Users, TrendingUp, Layers, ShoppingBag, Key, Rocket, Car, Shield, Wifi, Wind, Droplets, Tv, Warehouse, Building2 } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
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
      // Pause header minimize logic while any menu/popover is open to prevent layout jumps
      if (showFilters || isMenuOpen) return;

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
  }, [lastScrollY, showFilters]);
  
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
      facilities: "Facilities",
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
      facilities: "Fasilitas Properti",
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
    facilities: [
      { id: 'air_conditioning', label: 'Air Conditioning (AC)', icon: '❄️' },
      { id: 'heating', label: 'Heating', icon: '🔥' },
      { id: 'internet_wifi', label: 'Wi-Fi / Internet', icon: '📶' },
      { id: 'parking_space', label: 'Parking', icon: '🚗' },
      { id: 'elevator_lift', label: 'Elevator / Lift', icon: '🛗' },
      { id: 'swimming_pool_facility', label: 'Swimming Pool', icon: '🏊' },
      { id: 'gym_fitness', label: 'Gym / Fitness Center', icon: '🏋️' },
      { id: 'laundry', label: 'Laundry', icon: '🧺' },
      { id: 'dishwasher', label: 'Dishwasher', icon: '🍽️' },
      { id: 'balcony_terrace', label: 'Balcony / Terrace', icon: '🌿' },
      { id: 'pet_friendly', label: 'Pet-Friendly', icon: '🐶' },
      { id: 'furnished', label: 'Furnished', icon: '🛋️' },
      { id: 'security_system', label: 'Security System', icon: '🔒' },
      { id: 'garden_yard', label: 'Garden/Yard', icon: '🌳' },
      { id: 'bbq_area', label: 'BBQ Area', icon: '🍖' },
      { id: 'playground', label: 'Children\'s Playground', icon: '🎠' },
      { id: 'cctv_surveillance', label: 'CCTV Surveillance', icon: '📹' },
      { id: 'backup_generator', label: 'Backup Generator', icon: '⚡' },
      { id: 'clubhouse', label: 'Clubhouse', icon: '🏛️' },
      { id: 'tennis_court', label: 'Tennis Court', icon: '🎾' },
      { id: 'concierge', label: 'Concierge / 24-hr Doorman', icon: '🛎️' },
      { id: 'rooftop_lounge', label: 'Rooftop Deck / Lounge', icon: '🌆' },
      { id: 'sauna_spa', label: 'Sauna / Spa / Steam Room', icon: '♨️' },
      { id: 'coworking', label: 'Business Center / Co-working', icon: '💼' },
      { id: 'ev_charging', label: 'EV Charging Station', icon: '🔌' },
      { id: 'storage_unit', label: 'Storage Unit / Locker', icon: '📦' },
      { id: 'bike_storage', label: 'Bike Storage', icon: '🚲' },
      { id: 'guest_suite', label: 'Guest Suite', icon: '🏠' },
      { id: 'wheelchair_accessible', label: 'Wheelchair Accessible', icon: '♿' },
      { id: 'ground_floor', label: 'Ground Floor Unit', icon: '⬇️' },
      { id: 'grab_bars', label: 'Grab Bars in Bathroom', icon: '🚿' },
      { id: 'smoke_free', label: 'Smoke-Free Building', icon: '🚭' },
      { id: 'gated_community', label: 'Gated Community', icon: '🚧' },
      { id: 'utilities_included', label: 'Utilities Included', icon: '💡' },
      { id: 'trash_recycling', label: 'Trash / Recycling', icon: '♻️' },
      { id: 'snow_removal', label: 'Snow Removal', icon: '❄️' },
      { id: 'pest_control', label: 'Pest Control', icon: '🐛' },
      { id: 'onsite_maintenance', label: 'On-Site Maintenance', icon: '🔧' },
      { id: 'near_transit', label: 'Near Public Transit', icon: '🚇' },
      { id: 'walk_bike_score', label: 'Walk Score / Bike Score', icon: '🚶' },
      { id: 'near_parks', label: 'Near Parks / Trails', icon: '🌲' },
      { id: 'waterfront_view', label: 'Waterfront / Lake View', icon: '🌊' },
      { id: 'smart_thermostat', label: 'Smart Thermostat', icon: '🌡️' },
      { id: 'keyless_entry', label: 'Keyless Entry', icon: '🔑' },
      { id: 'video_doorbell', label: 'Video Doorbell', icon: '📹' },
      { id: 'smart_lighting', label: 'Smart Lighting', icon: '💡' },
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
    facilities: [
      { id: 'air_conditioning', label: 'Air Conditioning (AC)', icon: '❄️' },
      { id: 'heating', label: 'Heating', icon: '🔥' },
      { id: 'internet_wifi', label: 'Wi-Fi / Internet', icon: '📶' },
      { id: 'parking_space', label: 'Parking', icon: '🚗' },
      { id: 'elevator_lift', label: 'Elevator / Lift', icon: '🛗' },
      { id: 'swimming_pool_facility', label: 'Swimming Pool', icon: '🏊' },
      { id: 'gym_fitness', label: 'Gym / Fitness Center', icon: '🏋️' },
      { id: 'laundry', label: 'Laundry', icon: '🧺' },
      { id: 'dishwasher', label: 'Dishwasher', icon: '🍽️' },
      { id: 'balcony_terrace', label: 'Balcony / Terrace', icon: '🌿' },
      { id: 'pet_friendly', label: 'Pet-Friendly', icon: '🐶' },
      { id: 'furnished', label: 'Furnished', icon: '🛋️' },
      { id: 'security_system', label: 'Security System', icon: '🔒' },
      { id: 'washing_machine', label: 'Washing Machine', icon: '🧺' },
      { id: 'refrigerator', label: 'Refrigerator', icon: '🧊' },
      { id: 'stove_oven', label: 'Stove/Oven', icon: '🍳' },
      { id: 'microwave', label: 'Microwave', icon: '🔥' },
      { id: 'bedding_linens', label: 'Bedding/Linens', icon: '🛏️' },
      { id: 'kitchen_utensils', label: 'Kitchen Utensils', icon: '🔪' },
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
    facilities: [
      { id: 'air_conditioning', label: 'Air Conditioning (AC)', icon: '❄️' },
      { id: 'heating', label: 'Heating', icon: '🔥' },
      { id: 'internet_wifi', label: 'Wi-Fi / Internet', icon: '📶' },
      { id: 'parking_space', label: 'Parking', icon: '🚗' },
      { id: 'elevator_lift', label: 'Elevator / Lift', icon: '🛗' },
      { id: 'swimming_pool_facility', label: 'Swimming Pool', icon: '🏊' },
      { id: 'gym_fitness', label: 'Gym / Fitness Center', icon: '🏋️' },
      { id: 'laundry', label: 'Laundry', icon: '🧺' },
      { id: 'dishwasher', label: 'Dishwasher', icon: '🍽️' },
      { id: 'balcony_terrace', label: 'Balcony / Terrace', icon: '🌿' },
      { id: 'pet_friendly', label: 'Pet-Friendly', icon: '🐶' },
      { id: 'furnished', label: 'Furnished', icon: '🛋️' },
      { id: 'security_system', label: 'Security System', icon: '🔒' },
    ],
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

  const handleFacilityToggle = (facilityId: string) => {
    setFilters(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facilityId)
        ? prev.facilities.filter(f => f !== facilityId)
        : [...prev.facilities, facilityId]
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
      propertyType: '',
      priceRange: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      maxArea: '',
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

  // Lock background scroll when filters are open (prevents page jump and keeps modal fixed)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (showFilters) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const prevOverflow = body.style.overflow;
      const prevPaddingRight = body.style.paddingRight;

      // Add class to html/body for robust locking across devices
      root.classList.add('modal-open');
      body.classList.add('modal-open');

      body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        root.classList.remove('modal-open');
        body.classList.remove('modal-open');
        body.style.overflow = prevOverflow;
        body.style.paddingRight = prevPaddingRight;
      };
    }
  }, [showFilters]);

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
      <div className="w-full sticky top-10 md:top-11 lg:top-12 z-40 transition-all duration-300 px-1">
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
      isMobile ? "sticky top-10 md:top-11 lg:top-12 z-40 px-1" : "max-w-7xl mx-auto"
    )}>
      {/* Modern Slim Glass Container */}
      <div className="backdrop-blur-xl border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className={cn(
          "space-y-1.5 bg-background/40 backdrop-blur-md rounded-2xl shadow-lg border border-border/30",
          isMobile ? "p-1.5" : "p-2 lg:p-3"
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
              "inline-flex bg-background/60 rounded-lg border-0 shadow-sm relative",
              isMobile ? "p-0.5" : "p-0.5"
            )}>
              {/* Sliding background indicator */}
              <div 
                className="absolute inset-y-0.5 bg-primary rounded-md shadow-md transition-all duration-300 ease-out"
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
                  "relative z-10 rounded-md font-semibold uppercase tracking-wide transition-all duration-200 flex-1 flex items-center justify-center gap-0.5",
                  isMobile ? "px-1.5 py-1 text-[8px] min-w-[42px]" : "px-2 py-1 text-[9px] min-w-[50px]",
                  activeTab === 'all' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Layers className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                <span className={cn(isMobile ? "hidden" : "inline")}>{currentText.all}</span>
              </button>
              <button
                onClick={() => setActiveTab('sale')}
                className={cn(
                  "relative z-10 rounded-md font-semibold uppercase tracking-wide transition-all duration-200 flex-1 flex items-center justify-center gap-0.5",
                  isMobile ? "px-1.5 py-1 text-[8px] min-w-[42px]" : "px-2 py-1 text-[9px] min-w-[50px]",
                  activeTab === 'sale' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ShoppingBag className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                <span>{isMobile ? "Buy" : currentText.forSale}</span>
              </button>
              <button
                onClick={() => setActiveTab('rent')}
                className={cn(
                  "relative z-10 rounded-md font-semibold uppercase tracking-wide transition-all duration-200 flex-1 flex items-center justify-center gap-0.5",
                  isMobile ? "px-1.5 py-1 text-[8px] min-w-[42px]" : "px-2 py-1 text-[9px] min-w-[50px]",
                  activeTab === 'rent' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Key className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                <span>{isMobile ? "Rent" : currentText.forRent}</span>
              </button>
              <button
                onClick={() => setActiveTab('new_project')}
                className={cn(
                  "relative z-10 rounded-md font-semibold uppercase tracking-wide transition-all duration-200 flex-1 flex items-center justify-center gap-0.5",
                  isMobile ? "px-1.5 py-1 text-[8px] min-w-[42px]" : "px-2 py-1 text-[9px] min-w-[50px]",
                  activeTab === 'new_project' 
                    ? 'text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Rocket className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                <span>{isMobile ? "New" : currentText.newProject}</span>
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
                  isMobile ? "pl-8 pr-16 h-8 text-xs" : "pl-10 pr-20 h-9 text-sm"
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
                  isMobile ? "h-8 px-2.5" : "h-9 px-3"
                )}
              >
                <div className={cn("flex items-center", isMobile ? "gap-1.5" : "gap-2")}>
                  <Filter className={cn(isMobile ? "h-4 w-4" : "h-4 w-4")} />
                  <span className="text-xs sm:text-sm">Filters</span>
                  {getActiveFiltersCount() > 0 && (
                    <span className={cn(
                      "bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-full",
                      isMobile ? "text-[10px] px-1.5 py-0.5" : "ml-1 text-xs px-2 py-0.5"
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
                isMobile ? "h-8 px-2.5 text-xs gap-1" : "h-9 px-4 text-sm gap-1.5"
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

          {/* Compact Filter Row - Property Type + Bedrooms + Bathrooms + Location Button */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Property Type Button - Opens Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm",
                    isMobile ? "h-7 px-2 text-[10px]" : "h-8 px-3 text-xs",
                    (filters.propertyType && filters.propertyType !== 'all') && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <Home className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "mr-1 text-blue-500")} />
                  {(filters.propertyType && filters.propertyType !== 'all') 
                    ? currentFilters.propertyTypes.find(t => t.value === filters.propertyType)?.label || currentText.propertyType
                    : currentText.propertyType}
                  {(filters.propertyType && filters.propertyType !== 'all') && (
                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[99999]" align="start">
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
                      variant={(!filters.propertyType || filters.propertyType === 'all') ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs justify-start"
                      onClick={() => {
                        handleFilterChange('propertyType', 'all');
                      }}
                    >
                      {currentText.any}
                    </Button>
                    {currentFilters.propertyTypes.map((type) => (
                      <Button
                        key={type.value}
                        variant={filters.propertyType === type.value ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-xs justify-start"
                        onClick={() => {
                          handleFilterChange('propertyType', type.value);
                        }}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Bedrooms +/- */}
            <div className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className={cn("flex items-center gap-0.5 px-1", isMobile ? "h-7" : "h-8")}>
                <Bed className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "text-blue-500")} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn("p-0 hover:bg-muted rounded", isMobile ? "h-5 w-5" : "h-6 w-6")}
                  onClick={() => {
                    const current = (!filters.bedrooms || filters.bedrooms === 'all') ? 0 : parseInt(String(filters.bedrooms).replace('+',''));
                    if (current > 0) {
                      const next = current - 1;
                      handleFilterChange('bedrooms', next === 0 ? 'all' : String(next));
                    }
                  }}
                >
                  <span className={cn("font-bold", isMobile ? "text-xs" : "text-sm")}>−</span>
                </Button>
                <span className={cn("min-w-[20px] flex items-center justify-center font-semibold text-foreground", isMobile ? "text-[10px] px-1" : "text-xs px-1.5")}>
                  {(!filters.bedrooms || filters.bedrooms === 'all') ? '0' : String(filters.bedrooms).replace('+','')}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn("p-0 hover:bg-muted rounded", isMobile ? "h-5 w-5" : "h-6 w-6")}
                  onClick={() => {
                    const current = (!filters.bedrooms || filters.bedrooms === 'all') ? 0 : parseInt(String(filters.bedrooms).replace('+',''));
                    if (current < 10) {
                      handleFilterChange('bedrooms', String(current + 1));
                    }
                  }}
                >
                  <span className={cn("font-bold", isMobile ? "text-xs" : "text-sm")}>+</span>
                </Button>
              </div>
            </div>

            {/* Bathrooms +/- */}
            <div className="inline-flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className={cn("flex items-center gap-0.5 px-1", isMobile ? "h-7" : "h-8")}>
                <Bath className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "text-blue-500")} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn("p-0 hover:bg-muted rounded", isMobile ? "h-5 w-5" : "h-6 w-6")}
                  onClick={() => {
                    const current = (!filters.bathrooms || filters.bathrooms === 'all') ? 0 : parseInt(String(filters.bathrooms).replace('+',''));
                    if (current > 0) {
                      const next = current - 1;
                      handleFilterChange('bathrooms', next === 0 ? 'all' : String(next));
                    }
                  }}
                >
                  <span className={cn("font-bold", isMobile ? "text-xs" : "text-sm")}>−</span>
                </Button>
                <span className={cn("min-w-[20px] flex items-center justify-center font-semibold text-foreground", isMobile ? "text-[10px] px-1" : "text-xs px-1.5")}>
                  {(!filters.bathrooms || filters.bathrooms === 'all') ? '0' : String(filters.bathrooms).replace('+','')}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn("p-0 hover:bg-muted rounded", isMobile ? "h-5 w-5" : "h-6 w-6")}
                  onClick={() => {
                    const current = (!filters.bathrooms || filters.bathrooms === 'all') ? 0 : parseInt(String(filters.bathrooms).replace('+',''));
                    if (current < 10) {
                      handleFilterChange('bathrooms', String(current + 1));
                    }
                  }}
                >
                  <span className={cn("font-bold", isMobile ? "text-xs" : "text-sm")}>+</span>
                </Button>
              </div>
            </div>

            {/* Facilities Button - Opens Popover */}
            <Popover onOpenChange={setIsMenuOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm",
                    isMobile ? "h-7 px-2 text-[10px]" : "h-8 px-3 text-xs",
                    (filters.facilities && filters.facilities.length > 0) && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <Building2 className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "mr-1 text-blue-500")} />
                  {currentText.facilities}
                  {(filters.facilities && filters.facilities.length > 0) && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500 text-white">
                      {filters.facilities.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[99999]" align="start" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()}>
                <div>
                  {/* Facilities Tabs */}
                  <Tabs defaultValue="outdoor" className="w-full">
                    <TabsList className="w-full flex justify-start gap-1 h-auto bg-transparent p-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                      <TabsTrigger value="outdoor" className="text-[10px] px-2 py-1.5 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white whitespace-nowrap">Outdoor</TabsTrigger>
                      <TabsTrigger value="utility" className="text-[10px] px-2 py-1.5 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white whitespace-nowrap">Utility</TabsTrigger>
                      <TabsTrigger value="safety" className="text-[10px] px-2 py-1.5 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white whitespace-nowrap">Safety</TabsTrigger>
                      <TabsTrigger value="premium" className="text-[10px] px-2 py-1.5 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white whitespace-nowrap">Premium</TabsTrigger>
                      <TabsTrigger value="tech" className="text-[10px] px-2 py-1.5 rounded-md data-[state=active]:bg-blue-500 data-[state=active]:text-white whitespace-nowrap">Tech</TabsTrigger>
                    </TabsList>
                    
                    {/* Outdoor & Community */}
                    <TabsContent value="outdoor" className="mt-0 p-3">
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {currentFilters.facilities?.filter((f: any) => 
                          ['swimming_pool_facility', 'garden_yard', 'bbq_area', 'playground', 'balcony_terrace', 'pet_friendly', 'clubhouse', 'tennis_court', 'parking_space', 'near_transit', 'walk_bike_score', 'near_parks', 'waterfront_view'].includes(f.id)
                        ).map((facility: any) => (
                          <div key={facility.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Checkbox
                              id={`facility-${facility.id}`}
                              checked={filters.facilities.includes(facility.id)}
                              onCheckedChange={(checked) => {
                                const newFacilities = checked
                                  ? [...filters.facilities, facility.id]
                                  : filters.facilities.filter((f: string) => f !== facility.id);
                                handleFilterChange('facilities', newFacilities);
                              }}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={`facility-${facility.id}`}
                              className="text-xs cursor-pointer flex items-center gap-1"
                            >
                              <span>{facility.icon}</span>
                              <span className="flex-1">{facility.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Utility & Service */}
                    <TabsContent value="utility" className="mt-0 p-3">
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {currentFilters.facilities?.filter((f: any) => 
                          ['air_conditioning', 'heating', 'internet_wifi', 'laundry', 'washing_machine', 'dishwasher', 'refrigerator', 'stove_oven', 'microwave', 'bedding_linens', 'kitchen_utensils', 'utilities_included', 'trash_recycling', 'snow_removal', 'pest_control', 'onsite_maintenance'].includes(f.id)
                        ).map((facility: any) => (
                          <div key={facility.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Checkbox
                              id={`facility-${facility.id}`}
                              checked={filters.facilities.includes(facility.id)}
                              onCheckedChange={(checked) => {
                                const newFacilities = checked
                                  ? [...filters.facilities, facility.id]
                                  : filters.facilities.filter((f: string) => f !== facility.id);
                                handleFilterChange('facilities', newFacilities);
                              }}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={`facility-${facility.id}`}
                              className="text-xs cursor-pointer flex items-center gap-1"
                            >
                              <span>{facility.icon}</span>
                              <span className="flex-1">{facility.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Accessibility & Safety */}
                    <TabsContent value="safety" className="mt-0 p-3">
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {currentFilters.facilities?.filter((f: any) => 
                          ['security_system', 'cctv_surveillance', 'elevator_lift', 'backup_generator', 'wheelchair_accessible', 'ground_floor', 'grab_bars', 'smoke_free', 'gated_community'].includes(f.id)
                        ).map((facility: any) => (
                          <div key={facility.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Checkbox
                              id={`facility-${facility.id}`}
                              checked={filters.facilities.includes(facility.id)}
                              onCheckedChange={(checked) => {
                                const newFacilities = checked
                                  ? [...filters.facilities, facility.id]
                                  : filters.facilities.filter((f: string) => f !== facility.id);
                                handleFilterChange('facilities', newFacilities);
                              }}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={`facility-${facility.id}`}
                              className="text-xs cursor-pointer flex items-center gap-1"
                            >
                              <span>{facility.icon}</span>
                              <span className="flex-1">{facility.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Premium & Lifestyle */}
                    <TabsContent value="premium" className="mt-0 p-3">
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {currentFilters.facilities?.filter((f: any) => 
                          ['gym_fitness', 'furnished', 'concierge', 'rooftop_lounge', 'sauna_spa', 'coworking', 'ev_charging', 'storage_unit', 'bike_storage', 'guest_suite'].includes(f.id)
                        ).map((facility: any) => (
                          <div key={facility.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Checkbox
                              id={`facility-${facility.id}`}
                              checked={filters.facilities.includes(facility.id)}
                              onCheckedChange={(checked) => {
                                const newFacilities = checked
                                  ? [...filters.facilities, facility.id]
                                  : filters.facilities.filter((f: string) => f !== facility.id);
                                handleFilterChange('facilities', newFacilities);
                              }}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={`facility-${facility.id}`}
                              className="text-xs cursor-pointer flex items-center gap-1"
                            >
                              <span>{facility.icon}</span>
                              <span className="flex-1">{facility.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Tech & Smart Home */}
                    <TabsContent value="tech" className="mt-0 p-3">
                      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {currentFilters.facilities?.filter((f: any) => 
                          ['smart_thermostat', 'keyless_entry', 'video_doorbell', 'smart_lighting'].includes(f.id)
                        ).map((facility: any) => (
                          <div key={facility.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Checkbox
                              id={`facility-${facility.id}`}
                              checked={filters.facilities.includes(facility.id)}
                              onCheckedChange={(checked) => {
                                const newFacilities = checked
                                  ? [...filters.facilities, facility.id]
                                  : filters.facilities.filter((f: string) => f !== facility.id);
                                handleFilterChange('facilities', newFacilities);
                              }}
                              className="h-4 w-4"
                            />
                            <label
                              htmlFor={`facility-${facility.id}`}
                              className="text-xs cursor-pointer flex items-center gap-1"
                            >
                              <span>{facility.icon}</span>
                              <span className="flex-1">{facility.label}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </PopoverContent>
            </Popover>

            {/* Location Button - Opens Popover with 3 selects */}
            {!useNearbyLocation && (
              <Popover modal={false} onOpenChange={setIsMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 focus:border-blue-500 transition-all shadow-sm",
                      isMobile ? "h-7 px-2 text-[10px]" : "h-8 px-3 text-xs",
                      ((filters.state && filters.state !== 'all') || (filters.city && filters.city !== 'all') || (filters.area && filters.area !== 'all')) && "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    )}
                  >
                    <MapPin className={cn(isMobile ? "h-2.5 w-2.5" : "h-3 w-3", "mr-1 text-blue-500")} />
                    {currentText.location}
                    {((filters.state && filters.state !== 'all') || (filters.city && filters.city !== 'all') || (filters.area && filters.area !== 'all')) && (
                      <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500 text-white">
                        {[filters.state, filters.city, filters.area].filter(f => f && f !== 'all').length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[99999]" 
                  align="start" 
                  sideOffset={4}
                  avoidCollisions={true}
                  collisionPadding={8}
                >
                  <div className="space-y-3 p-1">
                    {/* State/Province Selection */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                        {currentText.selectProvince}
                        {provinces.length === 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">(⚠️ No data)</span>
                        )}
                      </Label>
                      <Select value={filters.state || "all"} onValueChange={handleStateChange} onOpenChange={setIsMenuOpen}>
                        <SelectTrigger className="h-9 text-xs bg-background hover:bg-accent/50 border-border rounded-lg transition-colors focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder={currentText.selectProvince}>
                            <span className="truncate">
                              {filters.state && filters.state !== 'all' 
                                ? provinces.find(p => p.code === filters.state)?.name 
                                : currentText.any}
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent 
                          className="bg-background dark:bg-gray-900 border-border rounded-lg shadow-2xl max-h-56 overflow-y-auto z-[100000]"
                          position="popper"
                          sideOffset={4}
                        >
                          <SelectItem value="all" className="text-xs hover:bg-accent rounded cursor-pointer transition-colors">
                            {currentText.any}
                          </SelectItem>
                          {provinces.length > 0 ? (
                            provinces.map((province) => (
                              <SelectItem key={province.code} value={province.code} className="text-xs hover:bg-accent rounded cursor-pointer transition-colors">
                                {province.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-data" disabled className="text-xs text-muted-foreground italic">
                              ⚠️ No provinces found in database
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City Selection - Only show when state is selected */}
                    {filters.state && filters.state !== 'all' && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                          {currentText.selectCity}
                          {cities.length === 0 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400">(⚠️ No data)</span>
                          )}
                        </Label>
                        <Select 
                          value={filters.city || "all"} 
                          onValueChange={handleCityChange}
                          disabled={cities.length === 0}
                        >
                          <SelectTrigger className="h-9 text-xs bg-background hover:bg-accent/50 border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500">
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
                          <SelectContent 
                            className="bg-background dark:bg-gray-900 border-border rounded-lg shadow-2xl max-h-56 overflow-y-auto z-[100000]"
                            position="popper"
                            sideOffset={4}
                          >
                            <SelectItem value="all" className="text-xs hover:bg-accent rounded cursor-pointer transition-colors">
                              {currentText.any}
                            </SelectItem>
                            {cities.length > 0 ? (
                              cities.map((city) => (
                                <SelectItem key={city.code} value={city.code} className="text-xs hover:bg-accent rounded cursor-pointer transition-colors">
                                  {city.type} {city.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled className="text-xs text-muted-foreground italic">
                                ⚠️ No cities found for selected province
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Area Selection - Only show when city is selected */}
                    {filters.city && filters.city !== 'all' && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                          {currentText.selectArea}
                          {areas.length === 0 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400">(⚠️ No data)</span>
                          )}
                        </Label>
                        <Select 
                          value={filters.area || "all"} 
                          onValueChange={handleAreaChange}
                          disabled={areas.length === 0}
                        >
                          <SelectTrigger className="h-9 text-xs bg-background hover:bg-accent/50 border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder={currentText.selectArea}>
                              <span className="truncate">
                                {filters.area && filters.area !== 'all' 
                                  ? areas.find(a => a.code === filters.area)?.name 
                                  : currentText.any}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent 
                            className="bg-background dark:bg-gray-900 border-border rounded-lg shadow-2xl max-h-56 overflow-y-auto z-[100000]"
                            position="popper"
                            sideOffset={4}
                          >
                            <SelectItem value="all" className="text-xs hover:bg-accent rounded cursor-pointer transition-colors">
                              {currentText.any}
                            </SelectItem>
                            {areas.length > 0 ? (
                              areas.map((area) => (
                                <SelectItem key={area.code} value={area.code} className="text-xs hover:bg-accent rounded cursor-pointer transition-colors">
                                  {area.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled className="text-xs text-muted-foreground italic">
                                ⚠️ No areas found for selected city
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>


           {/* Advanced Filters Modal */}
          {showFilters && (
            <div ref={filterRef} className="fixed z-[9999] inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-2 md:p-4">
              <div className="bg-background w-full max-w-[95vw] md:max-w-6xl h-[95dvh] md:h-[92dvh] rounded-xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-border/50">
              {/* Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border px-3 py-2.5 md:px-5 md:py-4 shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Filter className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-lg font-semibold text-foreground">Advanced Filters</h3>
                    <p className="text-[10px] md:text-xs text-muted-foreground">Refine your search</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-xs"
                  >
                    <X className="h-4 w-4 mr-1.5" />
                    Clear
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content with ScrollArea */}
              <ScrollArea className="flex-1 h-[calc(88dvh-120px)] md:h-[calc(90dvh-130px)] overscroll-contain">
                <div className="p-4 md:p-5">

              {/* Filter Categories in Tabs */}
              <Tabs defaultValue="propertySpecs" className="w-full">
                <TabsList className="w-full sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 rounded-lg mb-4">
                  <TabsTrigger value="propertySpecs" className="flex-1 text-xs md:text-sm py-2 md:py-2.5">
                    <Home className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Property
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="flex-1 text-xs md:text-sm py-2 md:py-2.5">
                    <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="location" className="flex-1 text-xs md:text-sm py-2 md:py-2.5">
                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Location
                  </TabsTrigger>
                  <TabsTrigger value="facilities" className="flex-1 text-xs md:text-sm py-2 md:py-2.5">
                    <Warehouse className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Facilities
                  </TabsTrigger>
                  <TabsTrigger value="amenities" className="flex-1 text-xs md:text-sm py-2 md:py-2.5">
                    <Building className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                    Amenities
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="propertySpecs" className="space-y-4 md:space-y-5 bg-card border border-border rounded-lg shadow-sm p-4 md:p-5">
                
                {/* Room Configuration */}
                <div>
                  <Label className="text-sm md:text-base font-semibold text-foreground mb-3 md:mb-4 block">Room Configuration</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {/* Bedrooms */}
                    <div className="bg-muted/30 rounded-lg p-3 md:p-4">
                      <Label className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 flex items-center gap-2">
                        <Bed className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Bedrooms
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={(!filters.bedrooms || filters.bedrooms === 'all') ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('bedrooms', 'all')}
                          className="h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm flex-1"
                        >
                          Any
                        </Button>
                        <div className="inline-flex items-center border border-border rounded-md overflow-hidden bg-background">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 md:h-10 w-9 md:w-10 p-0 rounded-none hover:bg-muted"
                            onClick={() => {
                              const current = (!filters.bedrooms || filters.bedrooms === 'all') ? 0 : parseInt(String(filters.bedrooms).replace('+',''));
                              if (current > 0) {
                                const next = current - 1;
                                handleFilterChange('bedrooms', next === 0 ? 'all' : String(next));
                              }
                            }}
                          >
                            <span className="text-sm md:text-base font-bold">−</span>
                          </Button>
                          <span className="min-w-[32px] md:min-w-[36px] h-9 md:h-10 flex items-center justify-center bg-muted/50 px-2 text-xs md:text-sm font-semibold">
                            {(!filters.bedrooms || filters.bedrooms === 'all') ? '0' : String(filters.bedrooms).replace('+','')}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 md:h-10 w-9 md:w-10 p-0 rounded-none hover:bg-muted"
                            onClick={() => {
                              const current = (!filters.bedrooms || filters.bedrooms === 'all') ? 0 : parseInt(String(filters.bedrooms).replace('+',''));
                              if (current < 1000) {
                                handleFilterChange('bedrooms', String(current + 1));
                              }
                            }}
                          >
                            <span className="text-sm md:text-base font-bold">+</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Bathrooms */}
                    <div className="bg-muted/30 rounded-lg p-3 md:p-4">
                      <Label className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 flex items-center gap-2">
                        <Bath className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        Bathrooms
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={(!filters.bathrooms || filters.bathrooms === 'all') ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('bathrooms', 'all')}
                          className="h-9 md:h-10 px-3 md:px-4 text-xs md:text-sm flex-1"
                        >
                          Any
                        </Button>
                        <div className="inline-flex items-center border border-border rounded-md overflow-hidden bg-background">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 md:h-10 w-9 md:w-10 p-0 rounded-none hover:bg-muted"
                            onClick={() => {
                              const current = (!filters.bathrooms || filters.bathrooms === 'all') ? 0 : parseInt(String(filters.bathrooms).replace('+',''));
                              if (current > 0) {
                                const next = current - 1;
                                handleFilterChange('bathrooms', next === 0 ? 'all' : String(next));
                              }
                            }}
                          >
                            <span className="text-sm md:text-base font-bold">−</span>
                          </Button>
                          <span className="min-w-[32px] md:min-w-[36px] h-9 md:h-10 flex items-center justify-center bg-muted/50 px-2 text-xs md:text-sm font-semibold">
                            {(!filters.bathrooms || filters.bathrooms === 'all') ? '0' : String(filters.bathrooms).replace('+','')}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 md:h-10 w-9 md:w-10 p-0 rounded-none hover:bg-muted"
                            onClick={() => {
                              const current = (!filters.bathrooms || filters.bathrooms === 'all') ? 0 : parseInt(String(filters.bathrooms).replace('+',''));
                              if (current < 1000) {
                                handleFilterChange('bathrooms', String(current + 1));
                              }
                            }}
                          >
                            <span className="text-sm md:text-base font-bold">+</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Details - Compact Grid Layout */}
                <div className="grid grid-cols-2 gap-1 md:gap-1.5">
                  {/* Year Built */}
                  <div>
                    <Label className={cn("text-blue-600 dark:text-blue-400 flex items-center gap-0.5", isMobile ? "text-[8px] mb-0.5" : "text-[9px] mb-1")}>
                      <Settings className={cn("text-blue-500", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                      {currentText.yearBuilt}
                    </Label>
                    <div className="flex flex-wrap gap-0.5">
                      <Button
                        type="button"
                        variant={(!filters.yearBuilt || filters.yearBuilt === 'all') ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('yearBuilt', 'all')}
                        className={cn("border-blue-200 dark:border-blue-800", isMobile ? "h-5 px-1 text-[7px]" : "h-5 px-1.5 text-[8px]")}
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
                          className={cn("border-blue-200 dark:border-blue-800", isMobile ? "h-5 px-1 text-[7px]" : "h-5 px-1.5 text-[8px]")}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <Label className={cn("text-blue-600 dark:text-blue-400 flex items-center gap-0.5", isMobile ? "text-[8px] mb-0.5" : "text-[9px] mb-1")}>
                      <Settings className={cn("text-blue-500", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                      {currentText.condition}
                    </Label>
                    <div className="flex flex-wrap gap-0.5">
                      <Button
                        type="button"
                        variant={(!filters.condition || filters.condition === 'all') ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('condition', 'all')}
                        className={cn("border-blue-200 dark:border-blue-800", isMobile ? "h-5 px-1 text-[7px]" : "h-5 px-1.5 text-[8px]")}
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
                          className={cn("border-blue-200 dark:border-blue-800", isMobile ? "h-5 px-1 text-[7px]" : "h-5 px-1.5 text-[8px]")}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Furnishing - Compact */}
                <div>
                  <Label className={cn("text-blue-600 dark:text-blue-400 block", isMobile ? "text-[8px] mb-0.5" : "text-[9px] mb-1")}>Furnishing</Label>
                  <div className="grid grid-cols-2 gap-0.5">
                    <Button
                      type="button"
                      variant={(!filters.furnishing || filters.furnishing === 'all') ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('furnishing', 'all')}
                      className={cn("border-blue-200 dark:border-blue-800", isMobile ? "h-5 px-1 text-[7px]" : "h-5 px-1.5 text-[8px]")}
                    >
                      Any
                    </Button>
                    <Button
                      type="button"
                      variant={filters.furnishing === 'unfurnished' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('furnishing', 'unfurnished')}
                      className={cn("border-blue-200 dark:border-blue-800", isMobile ? "h-5 px-1 text-[7px]" : "h-5 px-1.5 text-[8px]")}
                    >
                      Unfurnished
                    </Button>
                    <Button
                      type="button"
                      variant={filters.furnishing === 'semi_furnished' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('furnishing', 'semi_furnished')}
                      className={cn("border-blue-200 dark:border-blue-800", isMobile ? "h-5 px-1 text-[7px]" : "h-5 px-1.5 text-[8px]")}
                    >
                      Semi
                    </Button>
                    <Button
                      type="button"
                      variant={filters.furnishing === 'fully_furnished' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('furnishing', 'fully_furnished')}
                      className={cn("border-blue-200 dark:border-blue-800", isMobile ? "h-5 px-1 text-[7px]" : "h-5 px-1.5 text-[8px]")}
                    >
                      Fully
                    </Button>
                  </div>
                </div>
                </TabsContent>

                <TabsContent value="location" className={cn("bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg shadow-sm", isMobile ? "space-y-2 p-3" : "space-y-3 p-4")}>
                  <div className={cn(isMobile ? "space-y-2" : "space-y-3")}>
                    <Label className={cn("font-semibold text-foreground flex items-center gap-1.5", isMobile ? "text-xs" : "text-sm")}>
                      <MapPin className={cn("text-primary", isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                      Location Selection
                    </Label>
                    
                    {/* State/Province Selection */}
                    <div>
                      <Label className={cn("text-muted-foreground block", isMobile ? "text-[10px] mb-1" : "text-xs mb-1.5")}>{currentText.selectProvince}</Label>
                      <Select value={filters.state || "all"} onValueChange={handleStateChange}>
                        <SelectTrigger className={cn("w-full bg-background", isMobile ? "h-8 text-[10px]" : "h-9 text-xs")}>
                          <SelectValue placeholder={currentText.selectProvince} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border rounded-lg shadow-2xl max-h-[50dvh] overflow-y-auto z-[110000]">
                          <SelectItem value="all" className={cn("hover:bg-accent rounded cursor-pointer", isMobile ? "text-[10px]" : "text-xs")}>{currentText.any}</SelectItem>
                          {provinces.map((province) => (
                            <SelectItem key={province.code} value={province.code} className={cn("hover:bg-accent rounded cursor-pointer", isMobile ? "text-[10px]" : "text-xs")}>
                              {province.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City Selection */}
                    <div>
                      <Label className={cn("text-muted-foreground block", isMobile ? "text-[10px] mb-1" : "text-xs mb-1.5")}>{currentText.selectCity}</Label>
                      <Select 
                        value={filters.city || "all"} 
                        onValueChange={handleCityChange}
                        onOpenChange={setIsMenuOpen}
                        disabled={!filters.state || filters.state === 'all'}
                      >
                        <SelectTrigger className={cn("w-full bg-background disabled:opacity-50", isMobile ? "h-8 text-[10px]" : "h-9 text-xs")}>
                          <SelectValue placeholder={currentText.selectCity} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border rounded-lg shadow-2xl max-h-[50dvh] overflow-y-auto z-[110000]">
                          <SelectItem value="all" className={cn("hover:bg-accent rounded cursor-pointer", isMobile ? "text-[10px]" : "text-xs")}>{currentText.any}</SelectItem>
                          {cities.map((city) => (
                            <SelectItem key={city.code} value={city.code} className={cn("hover:bg-accent rounded cursor-pointer", isMobile ? "text-[10px]" : "text-xs")}>
                              {city.type} {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Area Selection */}
                    <div>
                      <Label className={cn("text-muted-foreground block", isMobile ? "text-[10px] mb-1" : "text-xs mb-1.5")}>{currentText.selectArea}</Label>
                      <Select 
                        value={filters.area || "all"} 
                        onValueChange={handleAreaChange}
                        onOpenChange={setIsMenuOpen}
                        disabled={!filters.city || filters.city === 'all'}
                      >
                        <SelectTrigger className={cn("w-full bg-background disabled:opacity-50", isMobile ? "h-8 text-[10px]" : "h-9 text-xs")}>
                          <SelectValue placeholder={currentText.selectArea} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border rounded-lg shadow-2xl max-h-[50dvh] overflow-y-auto z-[110000]">
                          <SelectItem value="all" className={cn("hover:bg-accent rounded cursor-pointer", isMobile ? "text-[10px]" : "text-xs")}>{currentText.any}</SelectItem>
                          {areas.map((area) => (
                            <SelectItem key={area.code} value={area.code} className={cn("hover:bg-accent rounded cursor-pointer", isMobile ? "text-[10px]" : "text-xs")}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Nearby Search */}
                    {useNearbyLocation && userLocation && (
                      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                        <Label className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
                          <MapPin className="h-4 w-4" fill="currentColor" />
                          Nearby Search Active
                        </Label>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Searching within {nearbyRadius}km radius
                          </p>
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">{currentText.radius}:</Label>
                            <Slider
                              value={[nearbyRadius]}
                              onValueChange={(value) => setNearbyRadius(value[0])}
                              max={50}
                              min={1}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-xs font-semibold min-w-[40px]">{nearbyRadius}km</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pricing" className={cn("bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50 rounded-lg shadow-sm", isMobile ? "space-y-2 p-3" : "space-y-3 p-4")}>

                {/* Price Range Slider */}
                <div>
                  <Label className={cn("font-medium text-green-700 dark:text-green-300 flex items-center gap-1.5", isMobile ? "text-[10px]" : "text-xs")}>
                    <DollarSign className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                    {currentText.priceRange}: Rp {formatPrice(priceRange[0])} - Rp {formatPrice(priceRange[1])}
                  </Label>
                  <div className={cn("bg-white/50 dark:bg-green-950/20 rounded-lg", isMobile ? "mt-1.5 p-2" : "mt-2 p-2.5")}>
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
                    <div className={cn("flex justify-between text-green-600 dark:text-green-400 mt-1.5", isMobile ? "text-[9px]" : "text-[10px]")}>
                      <span>Rp 0</span>
                      <span>Rp {currentFilters.maxPrice >= 1000 ? `${currentFilters.maxPrice/1000}M+` : `${currentFilters.maxPrice}jt+`}</span>
                    </div>
                  </div>
                </div>

                {/* Area Range Slider */}
                <div>
                  <Label className={cn("font-medium text-green-700 dark:text-green-300 flex items-center gap-1.5", isMobile ? "text-[10px]" : "text-xs")}>
                    <Square className={cn(isMobile ? "h-3 w-3" : "h-3.5 w-3.5")} />
                    {currentText.area}: {areaRange[0]} - {areaRange[1]} m²
                  </Label>
                  <div className={cn("bg-white/50 dark:bg-green-950/20 rounded-lg", isMobile ? "mt-1.5 p-2" : "mt-2 p-2.5")}>
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
                    <div className={cn("flex justify-between text-green-600 dark:text-green-400 mt-1.5", isMobile ? "text-[9px]" : "text-[10px]")}>
                      <span>0 m²</span>
                      <span>1000+ m²</span>
                    </div>
                  </div>
                </div>
                </TabsContent>

                <TabsContent value="facilities" className={cn("bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg shadow-sm", isMobile ? "space-y-2 p-3" : "space-y-3 p-4")}>
                <Label className={cn("font-semibold text-foreground block", isMobile ? "text-xs mb-2" : "text-sm mb-2.5")}>
                  Property Facilities
                  {activeTab === 'rent' && <span className="ml-2 text-blue-600 dark:text-blue-400">(Rental)</span>}
                  {(activeTab === 'sale' || activeTab === 'new_project') && <span className="ml-2 text-blue-600 dark:text-blue-400">(Buy)</span>}
                </Label>
                
                <div className={cn("grid gap-2", isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3")}>
                  {currentFilters.facilities?.map((facility: any) => (
                    <div key={facility.id} className={cn("flex items-center bg-white/50 dark:bg-blue-950/20 rounded-lg hover:bg-white/80 dark:hover:bg-blue-950/30 transition-colors", isMobile ? "space-x-1.5 p-2" : "space-x-2 p-2.5")}>
                      <Checkbox
                        id={facility.id}
                        checked={filters.facilities.includes(facility.id)}
                        onCheckedChange={() => handleFacilityToggle(facility.id)}
                        className={cn("border-blue-300 dark:border-blue-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")}
                      />
                      <Label
                        htmlFor={facility.id}
                        className={cn("font-normal cursor-pointer flex items-center gap-1 text-blue-700 dark:text-blue-300", isMobile ? "text-[10px]" : "text-xs")}
                      >
                        <span className={cn(isMobile ? "text-xs" : "text-sm")}>{facility.icon}</span>
                        <span>{facility.label}</span>
                      </Label>
                     </div>
                  ))}
                 </div>
                </TabsContent>

                <TabsContent value="amenities" className={cn("bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200/50 dark:border-purple-800/50 rounded-lg shadow-sm", isMobile ? "space-y-2 p-3" : "space-y-3 p-4")}>
                <Label className={cn("font-semibold text-foreground block", isMobile ? "text-xs mb-2" : "text-sm mb-2.5")}>Select Amenities & Features</Label>
                
                <div className={cn("grid gap-2", isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3")}>
                  {currentFilters.features.map((feature) => (
                    <div key={feature.id} className={cn("flex items-center bg-white/50 dark:bg-purple-950/20 rounded-lg hover:bg-white/80 dark:hover:bg-purple-950/30 transition-colors", isMobile ? "space-x-1.5 p-2" : "space-x-2 p-2.5")}>
                      <Checkbox
                        id={feature.id}
                        checked={filters.features.includes(feature.id)}
                        onCheckedChange={() => handleFeatureToggle(feature.id)}
                        className={cn("border-purple-300 dark:border-purple-700 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500", isMobile ? "h-3.5 w-3.5" : "h-4 w-4")}
                      />
                      <Label
                        htmlFor={feature.id}
                        className={cn("font-normal cursor-pointer flex items-center gap-1 text-purple-700 dark:text-purple-300", isMobile ? "text-[10px]" : "text-xs")}
                      >
                        <span className={cn(isMobile ? "text-xs" : "text-sm")}>{feature.icon}</span>
                        <span>{feature.label}</span>
                      </Label>
                     </div>
                  ))}
                 </div>
                </TabsContent>
              </Tabs>

              {/* Rental Details Category - Only show for rent tab */}
              {activeTab === 'rent' && (
                <div className={cn("bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-800/50 rounded-lg mt-2", isMobile ? "p-2 space-y-2" : "p-2.5 space-y-2.5")}>
                    
                    {/* Date Selection */}
                    <div>
                      <Label className={cn("font-medium text-orange-700 dark:text-orange-300 block", isMobile ? "text-[9px] mb-1" : "text-[10px] mb-1.5")}>Rental Dates</Label>
                      <div className={cn("grid grid-cols-2", isMobile ? "gap-1" : "gap-2")}>
                        <div>
                          <Label className={cn("text-orange-600 dark:text-orange-400 block", isMobile ? "text-[8px] mb-0.5" : "text-[9px] mb-1")}>{currentText.checkIn}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-orange-950/30", isMobile ? "h-6 text-[8px]" : "h-7 text-[9px]")}
                              >
                                <CalendarIcon className={cn("mr-0.5 text-orange-500", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
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
                          <Label className={cn("text-orange-600 dark:text-orange-400 block", isMobile ? "text-[8px] mb-0.5" : "text-[9px] mb-1")}>{currentText.checkOut}</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn("w-full justify-start text-left font-normal border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-orange-950/30", isMobile ? "h-6 text-[8px]" : "h-7 text-[9px]")}
                              >
                                <CalendarIcon className={cn("mr-0.5 text-orange-500", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
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
                        <div className={cn("text-center bg-orange-100 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800", isMobile ? "mt-1 p-1" : "mt-1.5 p-1.5")}>
                          <div className={cn("font-semibold text-orange-700 dark:text-orange-300", isMobile ? "text-[9px]" : "text-[10px]")}>
                            {calculateDays()} {currentText.days}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rental Duration */}
                    <div>
                      <Label className={cn("font-medium text-orange-700 dark:text-orange-300 block", isMobile ? "text-[9px] mb-1" : "text-[10px] mb-1.5")}>Rental Duration</Label>
                      <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-1.5")}>
                        <Clock className={cn("text-orange-500", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                        <Select value={filters.rentalDuration} onValueChange={(value) => handleFilterChange('rentalDuration', value)}>
                          <SelectTrigger className={cn("border-orange-200 dark:border-orange-800 bg-white/80 dark:bg-orange-950/30", isMobile ? "h-6 text-[8px]" : "h-7 text-[9px]")}>
                            <SelectValue placeholder={`${currentText.any} ${currentText.rentalDuration.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border rounded-lg shadow-2xl max-h-[50dvh] overflow-y-auto z-[110000]">
                            <SelectItem value="all" className={cn(isMobile ? "text-[8px]" : "text-[9px]")}>{currentText.any}</SelectItem>
                            {rentalDurationOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value} className={cn(isMobile ? "text-[8px]" : "text-[9px]")}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Trip Purpose */}
                    <div>
                      <Label className={cn("font-medium text-orange-700 dark:text-orange-300 block", isMobile ? "text-[9px] mb-1" : "text-[10px] mb-1.5")}>Trip Purpose</Label>
                      <div className={cn("flex items-center", isMobile ? "gap-1 mb-1" : "gap-1.5 mb-1.5")}>
                        <Users className={cn("text-orange-500", isMobile ? "h-2 w-2" : "h-2.5 w-2.5")} />
                        <span className={cn("text-orange-600 dark:text-orange-400", isMobile ? "text-[8px]" : "text-[9px]")}>{currentText.tripPurpose}</span>
                      </div>
                      <div className={cn("grid grid-cols-2", isMobile ? "gap-1" : "gap-1.5")}>
                        {tripPurposeOptions.map((purpose) => (
                          <Button
                            key={purpose.value}
                            variant={filters.tripPurpose === purpose.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFilterChange('tripPurpose', purpose.value)}
                            className={cn("justify-start border-orange-200 dark:border-orange-800", isMobile ? "h-5 text-[8px] gap-0.5" : "h-6 text-[9px] gap-1")}
                          >
                            <span className={cn(isMobile ? "text-[9px]" : "text-[10px]")}>{purpose.icon}</span>
                            {purpose.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                </div>
              )}

              {/* Sort By Category */}
              <div className={cn("bg-gradient-to-r from-gray-50/50 to-slate-50/50 dark:from-gray-950/20 dark:to-slate-950/20 border border-gray-200/50 dark:border-gray-800/50 rounded-lg", isMobile ? "p-2.5" : "p-3")}>
                <div className={cn("flex items-center gap-1.5", isMobile ? "mb-2" : "mb-2.5")}>
                  <div className={cn("rounded-full bg-gradient-to-r from-gray-400 to-slate-400 flex items-center justify-center", isMobile ? "w-5 h-5" : "w-6 h-6")}>
                    <Settings className={cn("text-white", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                  </div>
                  <h4 className={cn("font-medium text-gray-700 dark:text-gray-300", isMobile ? "text-xs" : "text-sm")}>{currentText.sortBy}</h4>
                </div>
                
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className={cn("border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/30", isMobile ? "h-8 text-[10px]" : "h-9 text-xs")}>
                    <SelectValue placeholder={currentText.sortBy} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border rounded-lg shadow-2xl max-h-[50dvh] overflow-y-auto z-[110000]">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className={cn(isMobile ? "text-[10px]" : "text-xs")}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              </div>
              </ScrollArea>
            
            {/* Footer with Apply Button */}
            <div className="border-t border-border bg-muted/30 px-4 py-3 md:px-5 md:py-4">
              <Button 
                onClick={() => {
                  handleSearch();
                  setShowFilters(false);
                }}
                className="w-full h-11 md:h-12 text-sm md:text-base font-medium"
                size="lg"
              >
                <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Apply Filters & Search
              </Button>
            </div>
          </div>
        </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default IPhoneSearchPanel;