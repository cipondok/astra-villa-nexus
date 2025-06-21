
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
      noFeaturedProperties: "No properties available at the moment",
      showingResults: "Showing",
      loadingProperties: "Loading properties...",
      databaseIssue: "We're working on adding new properties. Please check back later.",
      troubleshooting: "If this persists, there might be a database connection issue."
    },
    id: {
      title: "Properti Unggulan",
      subtitle: "Temukan peluang real estate premium",
      noResults: "Tidak ada properti ditemukan",
      searchResults: "Hasil Pencarian",
      noFeaturedProperties: "Tidak ada properti tersedia saat ini",
      showingResults: "Menampilkan",
      loadingProperties: "Memuat properti...",
      databaseIssue: "Kami sedang menambahkan properti baru. Silakan cek kembali nanti.",
      troubleshooting: "Jika masalah berlanjut, mungkin ada masalah koneksi database."
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

          {!displayProperties || displayProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  {currentText.noFeaturedProperties}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {currentText.databaseIssue}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {currentText.troubleshooting}
                </p>
                <div className="space-y-2">
                  <Button onClick={() => window.location.reload()} className="w-full">
                    Reload Page
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/properties')} className="w-full">
                    Browse All Properties
                  </Button>
                </div>
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
