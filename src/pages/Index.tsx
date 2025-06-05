
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Bed, Bath, Car, Heart, Star, Menu, Sun, Moon, Globe } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import PropertyCard from "@/components/PropertyCard";
import VendorCard from "@/components/VendorCard";
import AuthModal from "@/components/AuthModal";
import { useTheme } from "@/components/ThemeProvider";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const { theme, setTheme } = useTheme();

  const featuredProperties = [
    {
      id: 1,
      title: "Modern Villa in Bali",
      location: "Seminyak, Bali",
      price: "Rp 15,000,000,000",
      type: "sale",
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      title: "Jakarta Apartment",
      location: "Kuningan, Jakarta",
      price: "Rp 150,000,000/month",
      type: "rent",
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      rating: 4.6,
      featured: true
    },
    {
      id: 3,
      title: "New Project Surabaya",
      location: "Surabaya, East Java",
      price: "Starting Rp 800,000,000",
      type: "new-project",
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop",
      rating: 4.9,
      featured: true
    }
  ];

  const vendors = [
    {
      id: 1,
      name: "Premium Interior Design",
      category: "Interior Design",
      rating: 4.9,
      reviews: 127,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop",
      verified: true
    },
    {
      id: 2,
      name: "Professional Cleaning Services",
      category: "Maintenance",
      rating: 4.7,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
      verified: true
    }
  ];

  const trendingSearches = [
    "Apartemen Jakarta", "Villa Bali", "Rumah Surabaya", "Kost Bandung", "Office Space", "Landed House"
  ];

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "id" : "en");
  };

  const text = {
    en: {
      title: "Find Your Perfect Property",
      subtitle: "Indonesia's Complete Property & Lifestyle Ecosystem",
      search: "Search properties, location, or area...",
      location: "Select Location",
      type: "Property Type",
      price: "Price Range",
      bedrooms: "Bedrooms",
      searchBtn: "Search Properties",
      trending: "Trending Searches",
      featured: "Featured Properties",
      vendors: "Top Vendors & Services",
      buy: "Buy",
      rent: "Rent",
      newProject: "New Project",
      allTypes: "All Types",
      anyPrice: "Any Price",
      anyBedroom: "Any",
      login: "Login",
      register: "Register"
    },
    id: {
      title: "Temukan Properti Impian Anda",
      subtitle: "Ekosistem Properti & Gaya Hidup Lengkap Indonesia",
      search: "Cari properti, lokasi, atau area...",
      location: "Pilih Lokasi",
      type: "Jenis Properti",
      price: "Range Harga",
      bedrooms: "Kamar Tidur",
      searchBtn: "Cari Properti",
      trending: "Pencarian Trending",
      featured: "Properti Pilihan",
      vendors: "Vendor & Layanan Terbaik",
      buy: "Beli",
      rent: "Sewa",
      newProject: "Proyek Baru",
      allTypes: "Semua Jenis",
      anyPrice: "Semua Harga",
      anyBedroom: "Semua",
      login: "Masuk",
      register: "Daftar"
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        onLoginClick={() => setIsAuthModalOpen(true)}
        language={language}
        onLanguageToggle={toggleLanguage}
        theme={theme}
        onThemeToggle={() => setTheme(theme === "light" ? "dark" : "light")}
      />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-orange-500">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            {currentText.title}
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 animate-fade-in">
            {currentText.subtitle}
          </p>
          
          {/* Search Section */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl max-w-6xl mx-auto animate-scale-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder={currentText.search}
                    className="pl-10 h-12 text-gray-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-12 text-gray-700">
                  <SelectValue placeholder={currentText.location} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jakarta">Jakarta</SelectItem>
                  <SelectItem value="bali">Bali</SelectItem>
                  <SelectItem value="surabaya">Surabaya</SelectItem>
                  <SelectItem value="bandung">Bandung</SelectItem>
                  <SelectItem value="medan">Medan</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-12 text-gray-700">
                  <SelectValue placeholder={currentText.type} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{currentText.allTypes}</SelectItem>
                  <SelectItem value="buy">{currentText.buy}</SelectItem>
                  <SelectItem value="rent">{currentText.rent}</SelectItem>
                  <SelectItem value="new-project">{currentText.newProject}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="h-12 text-gray-700">
                  <SelectValue placeholder={currentText.price} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">{currentText.anyPrice}</SelectItem>
                  <SelectItem value="0-1b">< Rp 1B</SelectItem>
                  <SelectItem value="1b-5b">Rp 1B - 5B</SelectItem>
                  <SelectItem value="5b+">Rp 5B+</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="h-12 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-semibold transition-all duration-300 transform hover:scale-105">
                {currentText.searchBtn}
              </Button>
            </div>
            
            {/* Trending Searches */}
            <div className="text-left">
              <p className="text-gray-600 mb-3 font-medium">{currentText.trending}:</p>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-blue-100 transition-colors"
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{currentText.featured}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* Vendors Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">{currentText.vendors}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      </section>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
      />
    </div>
  );
};

export default Index;
