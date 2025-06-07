
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MapPin, Bed, Bath, Car, Heart } from "lucide-react";
import AuthenticatedNavigation from "@/components/navigation/AuthenticatedNavigation";

const Properties = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState<"en" | "id">("en");
  const [theme, setTheme] = useState("light");

  // Mock properties data
  const properties = [
    {
      id: 1,
      title: "Modern Villa in Seminyak",
      location: "Seminyak, Bali",
      price: "$450,000",
      bedrooms: 3,
      bathrooms: 2,
      parking: 2,
      image: "/placeholder.svg",
      type: "Villa",
      status: "For Sale"
    },
    {
      id: 2,
      title: "Luxury Apartment in Jakarta",
      location: "Jakarta Pusat, Jakarta",
      price: "$280,000",
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      image: "/placeholder.svg",
      type: "Apartment",
      status: "For Sale"
    },
    {
      id: 3,
      title: "Beach House in Canggu",
      location: "Canggu, Bali",
      price: "$650,000",
      bedrooms: 4,
      bathrooms: 3,
      parking: 3,
      image: "/placeholder.svg",
      type: "House",
      status: "For Sale"
    }
  ];

  const toggleLanguage = () => {
    setLanguage(prev => prev === "en" ? "id" : "en");
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  const text = {
    en: {
      title: "Properties",
      subtitle: "Find your perfect property",
      search: "Search properties...",
      filter: "Filter",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      parking: "Parking",
      noResults: "No properties found"
    },
    id: {
      title: "Properti",
      subtitle: "Temukan properti impian Anda",
      search: "Cari properti...",
      filter: "Filter",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      parking: "Parkir",
      noResults: "Tidak ada properti ditemukan"
    }
  };

  const currentText = text[language];

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthenticated && (
        <AuthenticatedNavigation
          language={language}
          onLanguageToggle={toggleLanguage}
          theme={theme}
          onThemeToggle={toggleTheme}
        />
      )}
      
      <div className={`${isAuthenticated ? 'pt-16' : 'pt-8'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentText.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {currentText.subtitle}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder={currentText.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {currentText.filter}
            </Button>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.length > 0 ? (
              filteredProperties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                      {property.status}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {property.price}
                      </span>
                      <Badge variant="outline">{property.type}</Badge>
                    </div>
                    
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.bedrooms} {currentText.bedrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.bathrooms} {currentText.bathrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-1" />
                        <span>{property.parking} {currentText.parking}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {currentText.noResults}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;
