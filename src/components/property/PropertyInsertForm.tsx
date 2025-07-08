import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Home, MapPin, Camera, Sparkles, Bot, CheckCircle, AlertCircle, Eye, LogIn, ChevronLeft, ChevronRight, X, ArrowLeft, Heart, Leaf, TrendingUp, Volume2, Building2, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatIDR } from "@/utils/currency";
import LocationSelector from "./LocationSelector";
import OptimizedImageUpload from "./OptimizedImageUpload";
import PropertySpecifications from "./PropertySpecifications";
import PropertyPreview from "./PropertyPreview";
import CelebrationPopup from "@/components/CelebrationPopup";
import EnhancedLocationSelector from "./EnhancedLocationSelector";
import { DetailedAddressData } from "./DetailedAddressForm";

const PropertyInsertForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    property_type: "",
    listing_type: "",
    location: "",
    state: "",
    city: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    area_sqm: "",
    images: [] as string[],
    thumbnailIndex: 0,
    three_d_model_url: "",
    virtual_tour_url: "",
    has_3d_tour: false,
    furnishing: "",
    parking: "",
    facilities: [] as string[],
    property_filters: {} as Record<string, any>,
    detailed_address: null as DetailedAddressData | null
  });

  const [currentTab, setCurrentTab] = useState("basic");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiHelp, setShowAiHelp] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch active search filters
  const { data: searchFilters } = useQuery({
    queryKey: ['active-search-filters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_filters')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Tab navigation
  const tabs = ["basic", "location", "details", "specifications", "media"];
  const tabLabels = {
    basic: "Informasi Dasar",
    location: "Lokasi", 
    details: "Detail & Fitur",
    specifications: "Spesifikasi & Fitur Properti",
    media: "Media & 3D"
  };

  const getCurrentTabIndex = () => tabs.indexOf(currentTab);
  const getProgressPercentage = () => ((getCurrentTabIndex() + 1) / tabs.length) * 100;

  const goToNextTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1]);
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1]);
    }
  };

  const isLastTab = () => getCurrentTabIndex() === tabs.length - 1;
  const isFirstTab = () => getCurrentTabIndex() === 0;

  const insertPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      console.log('Attempting to insert property with user:', user?.id);
      
      if (!user?.id) {
        throw new Error('User not authenticated - no user ID available');
      }

      const propertyToInsert = {
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price ? Number(propertyData.price) : null,
        property_type: propertyData.property_type,
        listing_type: propertyData.listing_type,
        location: propertyData.location || `${propertyData.area}, ${propertyData.city}, ${propertyData.state}`,
        state: propertyData.state,
        city: propertyData.city,
        area: propertyData.area,
        bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : null,
        bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : null,
        area_sqm: propertyData.area_sqm ? Number(propertyData.area_sqm) : null,
        owner_id: user.id,
        agent_id: profile?.role === 'agent' ? user.id : null,
        owner_type: profile?.role === 'property_owner' ? 'individual' : (profile?.role === 'agent' ? 'agent' : 'individual'),
        status: 'pending_approval',
        image_urls: propertyData.images || [],
        three_d_model_url: propertyData.three_d_model_url || null,
        virtual_tour_url: propertyData.virtual_tour_url || null,
        property_features: {
          ...propertyData.property_filters,
          furnishing: propertyData.furnishing,
          parking: propertyData.parking,
          facilities: propertyData.facilities,
          thumbnailIndex: propertyData.thumbnailIndex
        }
      };

      console.log('Property data to insert:', propertyToInsert);

      const { data, error } = await supabase
        .from('properties')
        .insert([propertyToInsert])
        .select();
      
      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      console.log('Property inserted successfully:', data);
      return data;
    },
    onSuccess: () => {
      // Show celebration popup instead of alert
      setShowCelebration(true);
      setShowPreview(false);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        price: "",
        property_type: "",
        listing_type: "",
        location: "",
        state: "",
        city: "",
        area: "",
        bedrooms: "",
        bathrooms: "",
        area_sqm: "",
        images: [],
        thumbnailIndex: 0,
        three_d_model_url: "",
        virtual_tour_url: "",
        has_3d_tour: false,
        furnishing: "",
        parking: "",
        facilities: [],
        property_filters: {},
        detailed_address: null
      });
    },
    onError: (error) => {
      console.error('Property insertion error:', error);
      alert(`Gagal mengajukan properti: ${error.message}`);
    }
  });

  const validateCurrentTab = () => {
    const errors: string[] = [];
    
    switch (currentTab) {
      case 'basic':
        if (!formData.title) errors.push("Judul properti wajib diisi");
        if (!formData.property_type) errors.push("Tipe properti wajib dipilih");
        if (!formData.listing_type) errors.push("Tipe listing wajib dipilih");
        break;
      case 'location':
        if (!formData.state) errors.push("Provinsi wajib dipilih");
        if (!formData.city) errors.push("Kota wajib dipilih");
        if (!formData.area) errors.push("Area wajib dipilih");
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNextTab = () => {
    if (validateCurrentTab()) {
      goToNextTab();
    } else {
      alert("Mohon lengkapi semua bidang yang wajib diisi di tab ini");
    }
  };

  const handlePreview = () => {
    if (!validateCurrentTab()) {
      alert("Mohon lengkapi semua bidang yang wajib diisi");
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    console.log('Submit clicked, checking authentication...');
    
    if (!isAuthenticated || !user) {
      alert("Silakan login terlebih dahulu untuk menambahkan properti");
      navigate('/');
      return;
    }

    if (!validateCurrentTab()) {
      alert("Mohon lengkapi semua bidang yang wajib diisi");
      return;
    }

    insertPropertyMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean | string[] | Record<string, any> | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      property_filters: {
        ...prev.property_filters,
        [filterId]: value
      }
    }));
  };

  const handleClose = () => {
    if (confirm("Apakah Anda yakin ingin menutup form? Data yang belum disimpan akan hilang.")) {
      navigate('/');
    }
  };

  const generateAiSuggestion = () => {
    setShowAiHelp(true);
    const suggestions = [
      "Berdasarkan lokasi yang dipilih, harga rata-rata properti serupa adalah " + formatIDR(2500000000),
      "Tambahkan foto eksterior, interior, dan fasilitas untuk meningkatkan daya tarik properti",
      "Sertakan informasi tentang akses transportasi umum dan fasilitas terdekat",
      "Untuk properti di area ini, tambahkan informasi tentang keamanan 24 jam",
      "Pertimbangkan untuk menambahkan virtual tour 3D untuk menarik lebih banyak pembeli",
      "Deskripsi yang detail dapat meningkatkan minat pembeli hingga 40%",
      "Properti dengan 3D tour mendapat 2x lebih banyak views"
    ];
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  };

  const renderFilterField = (filter: any) => {
    const filterValue = formData.property_filters[filter.id] || '';
    
    switch (filter.filter_type) {
      case 'select':
        const options = typeof filter.filter_options === 'string' 
          ? filter.filter_options.split(',').map((opt: string) => opt.trim())
          : Array.isArray(filter.filter_options) 
          ? filter.filter_options 
          : [];

        return (
          <div key={filter.id}>
            <Label htmlFor={filter.id} className="text-gray-700 font-medium">
              {filter.filter_name}
            </Label>
            <Select 
              value={filterValue} 
              onValueChange={(value) => handleFilterChange(filter.id, value)}
            >
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue placeholder={`Pilih ${filter.filter_name}`} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {options.map((option: string, index: number) => (
                  <SelectItem key={index} value={option} className="text-gray-900 hover:bg-blue-50">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'checkbox':
        const checkboxOptions = typeof filter.filter_options === 'string' 
          ? filter.filter_options.split(',').map((opt: string) => opt.trim())
          : Array.isArray(filter.filter_options) 
          ? filter.filter_options 
          : [];

        return (
          <div key={filter.id}>
            <Label className="text-gray-700 font-medium mb-2 block">
              {filter.filter_name}
            </Label>
            <div className="space-y-2">
              {checkboxOptions.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filter.id}-${index}`}
                    checked={(filterValue as string[])?.includes(option) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = (filterValue as string[]) || [];
                      if (checked) {
                        handleFilterChange(filter.id, [...currentValues, option]);
                      } else {
                        handleFilterChange(filter.id, currentValues.filter(v => v !== option));
                      }
                    }}
                  />
                  <Label htmlFor={`${filter.id}-${index}`} className="text-sm text-gray-900">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'input':
        return (
          <div key={filter.id}>
            <Label htmlFor={filter.id} className="text-gray-700 font-medium">
              {filter.filter_name}
            </Label>
            <Input
              id={filter.id}
              value={filterValue}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              placeholder={`Masukkan ${filter.filter_name}`}
              className="bg-white border-gray-300 text-gray-900"
            />
          </div>
        );

      // Skip range filters for property listing since they're mainly for search
      case 'range':
        return null;

      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lifestyle':
        return <Heart className="h-5 w-5 text-pink-600" />;
      case 'sustainability':
        return <Leaf className="h-5 w-5 text-green-600" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'neighborhood':
        return <Volume2 className="h-5 w-5 text-purple-600" />;
      case 'developer':
        return <Building2 className="h-5 w-5 text-orange-600" />;
      default:
        return <Filter className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'lifestyle':
        return 'Gaya Hidup & Kenyamanan';
      case 'sustainability':
        return 'Keberlanjutan & Ramah Lingkungan';
      case 'investment':
        return 'Potensi Investasi';
      case 'neighborhood':
        return 'Lingkungan & Suasana';
      case 'developer':
        return 'Informasi Developer & Proyek';
      default:
        return 'Fitur Properti';
    }
  };

  // Show login required message if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardContent className="p-8">
            <LogIn className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Login Diperlukan</h2>
            <p className="text-gray-600 mb-6">
              Anda perlu login atau mendaftar terlebih dahulu untuk menambahkan listing properti.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Ke Halaman Login / Daftar
              </Button>
              <p className="text-sm text-gray-500">
                Belum punya akun? Daftar sebagai Property Owner atau Agent di halaman utama.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCelebrationClose = () => {
    setShowCelebration(false);
  };

  const handleDetailedAddressChange = (addressData: DetailedAddressData) => {
    handleInputChange('detailed_address', addressData);
  };

  return (
    <>
      <div className="p-6">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-6 w-6 text-blue-600" />
                Tambah Listing Properti
                {profile?.role === 'agent' && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
                    Agen
                  </span>
                )}
              </h2>
              <p className="text-gray-600 mt-1">
                Listingkan properti Anda untuk dijual atau disewakan
                {profile?.role === 'agent' && (
                  <span className="block text-blue-700 text-sm mt-1 font-medium">
                    Anda login sebagai agen: {profile.full_name || profile.email}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateAiSuggestion}
              className="flex items-center gap-2 bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Bot className="h-4 w-4" />
              Bantuan AI
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Langkah {getCurrentTabIndex() + 1} dari {tabs.length}: {tabLabels[currentTab as keyof typeof tabLabels]}
            </span>
            <span className="text-sm text-gray-500">{Math.round(getProgressPercentage())}%</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Harap lengkapi:</h4>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* AI Help Section */}
        {showAiHelp && aiSuggestion && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">💡 Saran AI</h4>
                <p className="text-blue-800 text-sm">{aiSuggestion}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white border border-gray-200 shadow-sm">
              <TabsTrigger value="basic" className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Informasi Dasar</span>
                <span className="sm:hidden">Dasar</span>
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Lokasi</span>
                <span className="sm:hidden">Lokasi</span>
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Detail & Fitur</span>
                <span className="sm:hidden">Detail</span>
              </TabsTrigger>
              <TabsTrigger value="specifications" className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Spesifikasi</span>
                <span className="sm:hidden">Spec</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2 text-gray-700 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200">
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Media & 3D</span>
                <span className="sm:hidden">Media</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-gray-700 font-medium">Judul Properti *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Rumah Keluarga Indah di Jakarta"
                      required
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-gray-700 font-medium">Harga (IDR) *</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="2500000000"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    {formData.price && (
                      <p className="text-sm text-green-600 mt-1 font-medium">
                        {formatIDR(Number(formData.price))}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="property_type" className="text-gray-700 font-medium">Tipe Properti *</Label>
                    <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Pilih tipe properti" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        <SelectItem value="house" className="text-gray-900 hover:bg-blue-50">🏠 Rumah</SelectItem>
                        <SelectItem value="apartment" className="text-gray-900 hover:bg-blue-50">🏢 Apartemen</SelectItem>
                        <SelectItem value="condo" className="text-gray-900 hover:bg-blue-50">🏙️ Kondominium</SelectItem>
                        <SelectItem value="townhouse" className="text-gray-900 hover:bg-blue-50">🏘️ Rumah Teras</SelectItem>
                        <SelectItem value="land" className="text-gray-900 hover:bg-blue-50">🌍 Tanah</SelectItem>
                        <SelectItem value="commercial" className="text-gray-900 hover:bg-blue-50">🏪 Komersial</SelectItem>
                        <SelectItem value="villa" className="text-gray-900 hover:bg-blue-50">🏖️ Villa</SelectItem>
                        <SelectItem value="shop" className="text-gray-900 hover:bg-blue-50">🏬 Ruko</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-700 font-medium">Tipe Listing *</Label>
                    <RadioGroup 
                      value={formData.listing_type} 
                      onValueChange={(value) => handleInputChange('listing_type', value)}
                      className="flex flex-row space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <RadioGroupItem value="sale" id="sale" />
                        <Label htmlFor="sale" className="text-sm font-medium text-gray-900">💰 Dijual</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <RadioGroupItem value="rent" id="rent" />
                        <Label htmlFor="rent" className="text-sm font-medium text-gray-900">🏠 Disewakan</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="description" className="text-gray-700 font-medium">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Deskripsi detail properti..."
                    rows={4}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-6 mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <EnhancedLocationSelector
                  selectedState={formData.state}
                  selectedCity={formData.city}
                  selectedArea={formData.area}
                  onStateChange={(state) => handleInputChange('state', state)}
                  onCityChange={(city) => handleInputChange('city', city)}
                  onAreaChange={(area) => handleInputChange('area', area)}
                  onLocationChange={(location) => handleInputChange('location', location)}
                  onDetailedAddressChange={handleDetailedAddressChange}
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6 mt-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms" className="text-gray-700 font-medium">🛏️ Kamar Tidur</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange('bedrooms', value)}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        {[0,1,2,3,4,5,6].map(num => (
                          <SelectItem key={num} value={num.toString()} className="text-gray-900 hover:bg-blue-50">
                            {num}+ Kamar
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bathrooms" className="text-gray-700 font-medium">🚿 Kamar Mandi</Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange('bathrooms', value)}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        {[1,2,3,4,5,6].map(num => (
                          <SelectItem key={num} value={num.toString()} className="text-gray-900 hover:bg-blue-50">
                            {num}+ Kamar
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="area_sqm" className="text-gray-700 font-medium">📐 Luas (m²)</Label>
                    <Input
                      id="area_sqm"
                      type="number"
                      value={formData.area_sqm}
                      onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                      placeholder="120"
                      min="0"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <Label className="text-gray-700 font-medium">🪑 Kondisi Furnitur</Label>
                    <RadioGroup 
                      value={formData.furnishing} 
                      onValueChange={(value) => handleInputChange('furnishing', value)}
                      className="flex flex-col space-y-2 mt-2"
                    >
                      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <RadioGroupItem value="unfurnished" id="unfurnished" />
                        <Label htmlFor="unfurnished" className="text-sm text-gray-900">Tidak Berperabot</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <RadioGroupItem value="semi-furnished" id="semi-furnished" />
                        <Label htmlFor="semi-furnished" className="text-sm text-gray-900">Semi Furnished</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <RadioGroupItem value="fully-furnished" id="fully-furnished" />
                        <Label htmlFor="fully-furnished" className="text-sm text-gray-900">Fully Furnished</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="parking" className="text-gray-700 font-medium">🚗 Parkir</Label>
                    <Select value={formData.parking} onValueChange={(value) => handleInputChange('parking', value)}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Pilih kapasitas parkir" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        <SelectItem value="0" className="text-gray-900 hover:bg-blue-50">❌ Tidak Ada</SelectItem>
                        <SelectItem value="1" className="text-gray-900 hover:bg-blue-50">🚗 1 Mobil</SelectItem>
                        <SelectItem value="2" className="text-gray-900 hover:bg-blue-50">🚗🚗 2 Mobil</SelectItem>
                        <SelectItem value="3" className="text-gray-900 hover:bg-blue-50">🚗🚗🚗 3+ Mobil</SelectItem>
                        <SelectItem value="carport" className="text-gray-900 hover:bg-blue-50">🏠 Carport</SelectItem>
                        <SelectItem value="garage" className="text-gray-900 hover:bg-blue-50">🏢 Garasi Tertutup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* New Specifications Tab */}
            <TabsContent value="specifications" className="space-y-6 mt-6">
              <PropertySpecifications
                propertyFilters={formData.property_filters}
                onFilterChange={handleFilterChange}
              />
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Optimized Image Upload */}
                <OptimizedImageUpload
                  images={formData.images}
                  onImagesChange={(images) => handleInputChange('images', images)}
                  thumbnailIndex={formData.thumbnailIndex}
                  onThumbnailChange={(index) => handleInputChange('thumbnailIndex', index)}
                  maxFiles={15}
                  maxSizePerFile={3}
                />

                {/* 3D Virtual Tour */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🥽 Virtual Tour 3D</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700 font-medium">Apakah properti memiliki virtual tour 3D?</Label>
                      <RadioGroup 
                        value={formData.has_3d_tour.toString()} 
                        onValueChange={(value) => handleInputChange('has_3d_tour', value === 'true')}
                        className="flex flex-row space-x-6 mt-2"
                      >
                        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                          <RadioGroupItem value="true" id="has_3d" />
                          <Label htmlFor="has_3d" className="text-sm text-gray-900">✅ Ada 3D Tour</Label>
                        </div>
                        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                          <RadioGroupItem value="false" id="no_3d" />
                          <Label htmlFor="no_3d" className="text-sm text-gray-900">❌ Tidak Ada</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.has_3d_tour && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="three_d_model_url" className="text-gray-700 font-medium">🔗 URL Model 3D</Label>
                          <Input
                            id="three_d_model_url"
                            value={formData.three_d_model_url}
                            onChange={(e) => handleInputChange('three_d_model_url', e.target.value)}
                            placeholder="https://example.com/3d-model"
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>

                        <div>
                          <Label htmlFor="virtual_tour_url" className="text-gray-700 font-medium">🌐 URL Virtual Tour</Label>
                          <Input
                            id="virtual_tour_url"
                            value={formData.virtual_tour_url}
                            onChange={(e) => handleInputChange('virtual_tour_url', e.target.value)}
                            placeholder="https://example.com/virtual-tour"
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button 
              type="button"
              variant="outline"
              onClick={goToPreviousTab}
              disabled={isFirstTab()}
              className="flex items-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>

            <div className="flex gap-4">
              {isLastTab() && (
                <>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    className="flex items-center gap-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Properti
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    disabled={insertPropertyMutation.isPending}
                  >
                    {insertPropertyMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Kirim untuk Review
                      </>
                    )}
                  </Button>
                </>
              )}
              
              {!isLastTab() && (
                <Button 
                  type="button"
                  onClick={handleNextTab}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Selanjutnya
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Property Preview Modal */}
      <PropertyPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleSubmit}
        propertyData={formData}
        isSubmitting={insertPropertyMutation.isPending}
      />

      {/* Celebration Popup */}
      <CelebrationPopup
        isOpen={showCelebration}
        onClose={handleCelebrationClose}
        title="🎉 Properti Berhasil Diajukan!"
        message="Selamat! Properti Anda telah berhasil diajukan ke sistem kami. Tim admin akan meninjau dan memverifikasi dalam waktu 24 jam."
      />
    </>
  );
};

export default PropertyInsertForm;
