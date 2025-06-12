
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Home, MapPin, Camera, Sparkles, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatIDR } from "@/utils/currency";
import LocationSelector from "./LocationSelector";

// Indonesian location data
const indonesianStates = [
  "Jawa Barat", "Jawa Tengah", "Jawa Timur", "DKI Jakarta", "Banten",
  "Sumatera Utara", "Sumatera Barat", "Sumatera Selatan", "Lampung", "Riau",
  "Kalimantan Barat", "Kalimantan Timur", "Kalimantan Selatan", "Kalimantan Tengah",
  "Sulawesi Selatan", "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Tenggara",
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat"
];

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
    three_d_model_url: "",
    virtual_tour_url: "",
    has_3d_tour: false,
    furnishing: "",
    parking: "",
    facilities: [] as string[]
  });

  const [currentTab, setCurrentTab] = useState("basic");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiHelp, setShowAiHelp] = useState(false);

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const insertPropertyMutation = useMutation({
    mutationFn: async (propertyData: any) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('properties')
        .insert([{
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
          owner_type: profile?.role === 'property_owner' ? 'individual' : 'agent',
          approval_status: 'pending',
          status: 'pending_approval',
          image_urls: propertyData.images,
          three_d_model_url: propertyData.three_d_model_url,
          virtual_tour_url: propertyData.virtual_tour_url
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      alert("Properti berhasil diajukan! Tim admin kami akan meninjau dalam 24 jam.");
      navigate('/');
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
        three_d_model_url: "",
        virtual_tour_url: "",
        has_3d_tour: false,
        furnishing: "",
        parking: "",
        facilities: []
      });
    },
    onError: (error) => {
      alert(`Gagal mengajukan properti: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert("Silakan login untuk menambahkan properti");
      return;
    }

    if (!formData.title || !formData.property_type || !formData.listing_type) {
      alert("Mohon lengkapi semua bidang yang wajib diisi");
      return;
    }

    insertPropertyMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateAiSuggestion = () => {
    setShowAiHelp(true);
    const suggestions = [
      "Berdasarkan lokasi yang dipilih, harga rata-rata properti serupa adalah " + formatIDR(2500000000),
      "Tambahkan foto eksterior, interior, dan fasilitas untuk meningkatkan daya tarik properti",
      "Sertakan informasi tentang akses transportasi umum dan fasilitas terdekat",
      "Untuk properti di area ini, tambahkan informasi tentang keamanan 24 jam",
      "Pertimbangkan untuk menambahkan virtual tour 3D untuk menarik lebih banyak pembeli"
    ];
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
  };

  const formatPriceInput = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      const formatted = formatIDR(Number(numericValue));
      return formatted.replace('Rp', '').trim();
    }
    return '';
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <Card>
          <CardContent className="p-8">
            <Home className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Login Diperlukan</h2>
            <p className="text-gray-600 mb-6">
              Anda perlu login untuk menambahkan listing properti.
            </p>
            <Button onClick={() => navigate('/')} className="mr-4">
              Ke Halaman Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Listing Properti
            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {profile?.role === 'agent' ? 'Agen' : 'Pemilik'}
            </span>
          </CardTitle>
          <CardDescription>
            Listingkan properti Anda untuk dijual atau disewakan
            {profile?.role === 'agent' && (
              <span className="block text-blue-600 text-sm mt-1">
                Anda login sebagai agen: {profile.full_name || profile.email}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateAiSuggestion}
              className="flex items-center gap-2"
            >
              <Bot className="h-4 w-4" />
              Bantuan AI
            </Button>
          </div>

          {showAiHelp && aiSuggestion && (
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Saran AI</h4>
                    <p className="text-blue-700 text-sm">{aiSuggestion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit}>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
                <TabsTrigger value="location">Lokasi</TabsTrigger>
                <TabsTrigger value="details">Detail & Fitur</TabsTrigger>
                <TabsTrigger value="media">Media & 3D</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Judul Properti *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Rumah Keluarga Indah di Jakarta"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Harga (IDR) *</Label>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="2500000000"
                    />
                    {formData.price && (
                      <p className="text-sm text-gray-500 mt-1">
                        {formatIDR(Number(formData.price))}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="property_type">Tipe Properti *</Label>
                    <Select value={formData.property_type} onValueChange={(value) => handleInputChange('property_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe properti" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="house">Rumah</SelectItem>
                        <SelectItem value="apartment">Apartemen</SelectItem>
                        <SelectItem value="condo">Kondominium</SelectItem>
                        <SelectItem value="townhouse">Rumah Teras</SelectItem>
                        <SelectItem value="land">Tanah</SelectItem>
                        <SelectItem value="commercial">Komersial</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="shop">Ruko</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tipe Listing *</Label>
                    <RadioGroup 
                      value={formData.listing_type} 
                      onValueChange={(value) => handleInputChange('listing_type', value)}
                      className="flex flex-row space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sale" id="sale" />
                        <Label htmlFor="sale" className="text-sm">Dijual</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rent" id="rent" />
                        <Label htmlFor="rent" className="text-sm">Disewakan</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Deskripsi detail properti..."
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-6 mt-6">
                <LocationSelector
                  selectedState={formData.state}
                  selectedCity={formData.city}
                  selectedArea={formData.area}
                  onStateChange={(state) => handleInputChange('state', state)}
                  onCityChange={(city) => handleInputChange('city', city)}
                  onAreaChange={(area) => handleInputChange('area', area)}
                  onLocationChange={(location) => handleInputChange('location', location)}
                />
              </TabsContent>

              <TabsContent value="details" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bedrooms">Kamar Tidur</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange('bedrooms', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0,1,2,3,4,5,6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bathrooms">Kamar Mandi</Label>
                    <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange('bathrooms', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}+</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="area_sqm">Luas (m²)</Label>
                    <Input
                      id="area_sqm"
                      type="number"
                      value={formData.area_sqm}
                      onChange={(e) => handleInputChange('area_sqm', e.target.value)}
                      placeholder="120"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Kondisi Furnitur</Label>
                    <RadioGroup 
                      value={formData.furnishing} 
                      onValueChange={(value) => handleInputChange('furnishing', value)}
                      className="flex flex-col space-y-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unfurnished" id="unfurnished" />
                        <Label htmlFor="unfurnished" className="text-sm">Tidak Berperabot</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="semi-furnished" id="semi-furnished" />
                        <Label htmlFor="semi-furnished" className="text-sm">Semi Furnished</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fully-furnished" id="fully-furnished" />
                        <Label htmlFor="fully-furnished" className="text-sm">Fully Furnished</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="parking">Parkir</Label>
                    <Select value={formData.parking} onValueChange={(value) => handleInputChange('parking', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kapasitas parkir" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Tidak Ada</SelectItem>
                        <SelectItem value="1">1 Mobil</SelectItem>
                        <SelectItem value="2">2 Mobil</SelectItem>
                        <SelectItem value="3">3+ Mobil</SelectItem>
                        <SelectItem value="carport">Carport</SelectItem>
                        <SelectItem value="garage">Garasi Tertutup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Virtual Tour 3D</Label>
                    <RadioGroup 
                      value={formData.has_3d_tour.toString()} 
                      onValueChange={(value) => handleInputChange('has_3d_tour', value === 'true')}
                      className="flex flex-row space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="has_3d" />
                        <Label htmlFor="has_3d" className="text-sm">Ada 3D Tour</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="no_3d" />
                        <Label htmlFor="no_3d" className="text-sm">Tidak Ada</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {formData.has_3d_tour && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="three_d_model_url">URL Model 3D</Label>
                      <Input
                        id="three_d_model_url"
                        value={formData.three_d_model_url}
                        onChange={(e) => handleInputChange('three_d_model_url', e.target.value)}
                        placeholder="https://example.com/3d-model"
                      />
                    </div>

                    <div>
                      <Label htmlFor="virtual_tour_url">URL Virtual Tour</Label>
                      <Input
                        id="virtual_tour_url"
                        value={formData.virtual_tour_url}
                        onChange={(e) => handleInputChange('virtual_tour_url', e.target.value)}
                        placeholder="https://example.com/virtual-tour"
                      />
                    </div>
                  </div>
                )}

                <Card className="p-4 border-dashed border-2 border-gray-300">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 mb-2">Upload Foto Properti</p>
                    <p className="text-sm text-gray-500">Drag & drop atau klik untuk upload</p>
                    <Button type="button" variant="outline" className="mt-2">
                      Pilih Foto
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex gap-4 mt-8">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={insertPropertyMutation.isPending}
              >
                {insertPropertyMutation.isPending ? 'Mengirim...' : 'Kirim untuk Review'}
              </Button>
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyInsertForm;
