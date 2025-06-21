
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
  hideTitle = false
}: PropertyListingsSectionProps) => {
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());
  const [propertyFor3DView, setPropertyFor3DView] = useState<any | null>(null);
  const navigate = useNavigate();

  const text = {
    en: {
      title: "Featured Properties",
      subtitle: "Discover premium real estate opportunities",
      noResults: "No properties found",
      searchResults: "Search Results",
      noFeaturedProperties: "Loading properties...",
      showingResults: "Showing",
      loadingProperties: "Loading properties..."
    },
    id: {
      title: "Properti Unggulan",
      subtitle: "Temukan peluang real estate premium",
      noResults: "Tidak ada properti ditemukan",
      searchResults: "Hasil Pencarian",
      noFeaturedProperties: "Memuat properti...",
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
  
  console.log("=== PROPERTY LISTINGS SECTION DEBUG ===");
  console.log("hasSearched:", hasSearched);
  console.log("searchResults:", searchResults);
  console.log("fallbackResults:", fallbackResults);
  console.log("displayProperties:", displayProperties);
  console.log("displayProperties length:", displayProperties?.length || 0);
  console.log("=== END PROPERTY LISTINGS DEBUG ===");

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

          {/* Debug info - will remove later */}
          <div className="mb-4 p-4 bg-gray-100 rounded">
            <p><strong>Debug Info:</strong></p>
            <p>Display Properties Count: {displayProperties?.length || 0}</p>
            <p>Has Searched: {hasSearched ? 'Yes' : 'No'}</p>
            <p>Fallback Results Count: {fallbackResults?.length || 0}</p>
            <p>Search Results Count: {searchResults?.length || 0}</p>
          </div>

          {!displayProperties || displayProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-4">
                  {currentText.noFeaturedProperties}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Please wait while we load the properties...
                </p>
                <Button onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
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
