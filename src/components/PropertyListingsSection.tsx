
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchLoadingAnimation from "@/components/SearchLoadingAnimation";
import PropertyViewer3D from "@/components/PropertyViewer3D";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";

interface PropertyListingsSectionProps {
  language: "en" | "id";
  searchResults?: any[];
  isSearching?: boolean;
  hasSearched?: boolean;
  fallbackResults?: any[];
  hideTitle?: boolean;
  showSearchFilters?: boolean;
  onSearch?: (searchData: any) => void;
  onLiveSearch?: (searchTerm: string) => void;
}

const PropertyListingsSection = ({ 
  language, 
  searchResults = [], 
  isSearching = false,
  hasSearched = false,
  fallbackResults = [],
  hideTitle = false,
  showSearchFilters = false,
  onSearch,
  onLiveSearch
}: PropertyListingsSectionProps) => {
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());
  const [propertyFor3DView, setPropertyFor3DView] = useState<any | null>(null);
  const navigate = useNavigate();

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
      searchMessage: "Try adjusting your search filters or browse our featured properties below.",
      noFeaturedProperties: "No properties available at the moment",
      view3D: "3D View",
      youMightLike: "You might also like",
      featuredSubtitle: "Here are some of our featured properties",
      showingResults: "Showing",
      loadingProperties: "Loading properties..."
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
      searchMessage: "Coba sesuaikan filter pencarian Anda atau lihat properti unggulan kami di bawah.",
      noFeaturedProperties: "Belum ada properti tersedia saat ini",
      view3D: "Tampilan 3D",
      youMightLike: "Anda mungkin juga suka",
      featuredSubtitle: "Berikut adalah beberapa properti unggulan kami",
      showingResults: "Menampilkan",
      loadingProperties: "Memuat properti..."
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

  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleView3D = (property: any) => {
    setPropertyFor3DView(property);
  }

  const sectionData = useMemo(() => {
    const sectionTitle = hasSearched ? currentText.searchResults : currentText.title;
    const sectionSubtitle = hasSearched && searchResults.length > 0
      ? `${currentText.showingResults} ${searchResults.length} properties` 
      : hasSearched ? "" : currentText.subtitle;
    
    return { sectionTitle, sectionSubtitle };
  }, [hasSearched, searchResults.length, currentText]);

  if (isSearching) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <SearchLoadingAnimation language={language} />
        </div>
      </section>
    );  
  }
  
  const displayProperties = hasSearched ? searchResults : fallbackResults;
  const noPropertiesFound = displayProperties.length === 0;

  console.log("PropertyListingsSection - displayProperties:", displayProperties);
  console.log("PropertyListingsSection - hasSearched:", hasSearched);
  console.log("PropertyListingsSection - noPropertiesFound:", noPropertiesFound);

  return (
    <>
      <section className="py-8">
        <div className="container mx-auto px-4">
          {!hideTitle && (
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">{sectionData.sectionTitle}</h2>
              {sectionData.sectionSubtitle && (
                <p className="text-lg text-muted-foreground">{sectionData.sectionSubtitle}</p>
              )}
            </div>
          )}

          {noPropertiesFound ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-4">
                  {hasSearched ? currentText.noResults : currentText.noFeaturedProperties}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {hasSearched 
                    ? currentText.searchMessage 
                    : "We're working on adding new properties. Please check back later."}
                </p>
                {!hasSearched && (
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {displayProperties.map((property, index) => (
                <CompactPropertyCard
                  key={`${property.id}-${index}`}
                  property={property}
                  language={language}
                  isSaved={favoriteProperties.has(property.id)}
                  onSave={() => toggleFavorite(property.id)}
                  onView={() => handleViewDetails(property.id)}
                  onView3D={handleView3D}
                />
              ))}
            </div>
          )}

          {!hasSearched && displayProperties.length > 0 && (
            <div className="text-center mt-8">
              <Button size="lg" variant="outline" onClick={() => navigate('/properties')}>
                View All Properties
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {propertyFor3DView && (
        <PropertyViewer3D
          isOpen={!!propertyFor3DView}
          onClose={() => setPropertyFor3DView(null)}
          propertyId={propertyFor3DView.id}
          propertyTitle={propertyFor3DView.title}
        />
      )}
    </>
  );
};

export default PropertyListingsSection;
