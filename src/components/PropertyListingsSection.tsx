
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Heart } from "lucide-react";
import { formatIDR } from "@/utils/currency";
import SearchLoadingAnimation from "@/components/SearchLoadingAnimation";

interface PropertyListingsSectionProps {
  language: "en" | "id";
  searchResults?: any[];
  isSearching?: boolean;
  hasSearched?: boolean;
}

const PropertyListingsSection = ({ 
  language, 
  searchResults = [], 
  isSearching = false,
  hasSearched = false 
}: PropertyListingsSectionProps) => {
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());

  const text = {
    en: {
      title: "Featured Properties",
      subtitle: "Discover premium real estate opportunities",
      viewDetails: "View Details",
      forSale: "For Sale",
      forRent: "For Rent",
      noResults: "No properties found",
      searchResults: "Search Results",
      bedrooms: "bed",
      bathrooms: "bath",
      area: "sqm",
      contactForPrice: "Contact for price",
      searchMessage: "Try searching for properties in Jakarta, Bali, or other locations",
      noFeaturedProperties: "No properties available at the moment"
    },
    id: {
      title: "Properti Unggulan",
      subtitle: "Temukan peluang real estate premium",
      viewDetails: "Lihat Detail",
      forSale: "Dijual",
      forRent: "Disewa",
      noResults: "Tidak ada properti ditemukan",
      searchResults: "Hasil Pencarian",
      bedrooms: "kmr",
      bathrooms: "km",
      area: "m²",
      contactForPrice: "Hubungi untuk harga",
      searchMessage: "Coba cari properti di Jakarta, Bali, atau lokasi lainnya",
      noFeaturedProperties: "Tidak ada properti tersedia saat ini"
    }
  };

  const currentText = text[language];

  const toggleFavorite = (propertyId: string) => {
    setFavoriteProperties(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const getPropertyTypeColor = (type: string) => {
    const colors = {
      villa: 'bg-purple-100 text-purple-800',
      apartment: 'bg-blue-100 text-blue-800',
      house: 'bg-green-100 text-green-800',
      commercial: 'bg-orange-100 text-orange-800',
      land: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Stable section data to prevent flickering
  const sectionData = useMemo(() => {
    const sectionTitle = hasSearched ? currentText.searchResults : currentText.title;
    const sectionSubtitle = hasSearched 
      ? `${searchResults.length} properties found` 
      : currentText.subtitle;
    
    return { sectionTitle, sectionSubtitle };
  }, [hasSearched, searchResults.length, currentText]);

  // Show loading animation with ASTRA Villa branding
  if (isSearching) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SearchLoadingAnimation language={language} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{sectionData.sectionTitle}</h2>
          <p className="text-xl text-muted-foreground">{sectionData.sectionSubtitle}</p>
        </div>

        {searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4">
                {hasSearched ? currentText.noResults : currentText.noFeaturedProperties}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {hasSearched ? currentText.searchMessage : "Please check back later for new listings."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResults.map((property) => (
              <Card key={`${property.id}-${property.title}`} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative">
                  <img
                    src={property.image_urls?.[0] || property.images?.[0] || "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop"}
                    alt={property.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                    onClick={() => toggleFavorite(property.id)}
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        favoriteProperties.has(property.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </Button>
                  <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
                    {property.listing_type === 'sale' ? currentText.forSale : currentText.forRent}
                  </Badge>
                </div>
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl line-clamp-2">{property.title}</CardTitle>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm line-clamp-1">
                      {property.location || `${property.city || ''}, ${property.state || ''}`.replace(/^,\s*|,\s*$/g, '')}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {property.price ? formatIDR(property.price) : currentText.contactForPrice}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={getPropertyTypeColor(property.property_type)}
                    >
                      {property.property_type}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-6">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms || 0} {currentText.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms || 0} {currentText.bathrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.area_sqm || 0} {currentText.area}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    {currentText.viewDetails}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasSearched && searchResults.length > 0 && (
          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View All Properties
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyListingsSection;
