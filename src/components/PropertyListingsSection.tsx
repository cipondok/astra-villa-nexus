
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import PropertyViewer3D from "@/components/PropertyViewer3D";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";
import AutoScrollCarousel from "@/components/property/AutoScrollCarousel";
import PropertyModal from "@/components/admin/PropertyModal";
import { useProperties } from "@/hooks/useProperties";

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
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    propertyId: string | null;
    mode: 'view' | 'edit';
  }>({
    isOpen: false,
    propertyId: null,
    mode: 'view'
  });

  // Use the optimized hook for fetching properties
  const { data: featuredProperties = [], isLoading: isFeaturedLoading } = useProperties({
    limit: 20,
    status: 'active'
  });

  const text = {
    en: {
      title: "Featured Properties",
      subtitle: "Discover premium real estate opportunities",
      noResults: "No properties found matching your search",
      searchResults: "Search Results",
      noFeaturedProperties: "No properties available at the moment",
      showingResults: "Showing",
      loadingProperties: "Loading properties...",
      tryDifferentSearch: "Try adjusting your search criteria",
      browseAll: "Browse All Properties"
    },
    id: {
      title: "Properti Unggulan",
      subtitle: "Temukan peluang real estate premium",
      noResults: "Tidak ada properti yang sesuai dengan pencarian Anda",
      searchResults: "Hasil Pencarian",
      noFeaturedProperties: "Tidak ada properti tersedia saat ini",
      showingResults: "Menampilkan",
      loadingProperties: "Memuat properti...",
      tryDifferentSearch: "Coba sesuaikan kriteria pencarian Anda",
      browseAll: "Lihat Semua Properti"
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
    setModalState({
      isOpen: true,
      propertyId,
      mode: 'view'
    });
  };

  const handleView3D = (property: any) => {
    setPropertyFor3DView(property);
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      propertyId: null,
      mode: 'view'
    });
  };

  const sectionData = useMemo(() => {
    const sectionTitle = hasSearched ? currentText.searchResults : currentText.title;
    const sectionSubtitle = hasSearched && searchResults.length > 0
      ? `${currentText.showingResults} ${searchResults.length} properties` 
      : hasSearched ? "" : currentText.subtitle;
    
    return { sectionTitle, sectionSubtitle };
  }, [hasSearched, searchResults.length, currentText]);

  // Show loading state
  if (isSearching || (!hasSearched && isFeaturedLoading)) {
    return (
      <section className="py-6 sm:py-8 min-h-[400px]">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600">{currentText.loadingProperties}</p>
          </div>
        </div>
      </section>
    );  
  }
  
  // Determine which properties to display
  const displayProperties = hasSearched ? searchResults : featuredProperties;

  return (
    <>
      <section className="py-6 sm:py-8 min-h-[500px]">
        <div className="container mx-auto px-2 sm:px-4">
          {!hideTitle && (
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{sectionData.sectionTitle}</h2>
              {sectionData.sectionSubtitle && (
                <p className="text-base sm:text-lg text-muted-foreground">{sectionData.sectionSubtitle}</p>
              )}
            </div>
          )}

          {!displayProperties || displayProperties.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="max-w-md mx-auto px-4">
                <div className="mb-6">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-4">
                  {hasSearched ? currentText.noResults : currentText.noFeaturedProperties}
                </h3>
                {hasSearched && (
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
                    {currentText.tryDifferentSearch}
                  </p>
                )}
                <div className="space-y-2">
                  <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          ) : displayProperties.length >= 4 ? (
            <div data-property-container="true">
              <AutoScrollCarousel
                title=""
                currentPropertyId=""
                queryType="recommended"
                propertyData={{
                  properties: displayProperties.map(property => ({
                    ...property,
                    'data-property-id': property.id
                  }))
                }}
                autoScrollInterval={6000}
                limit={displayProperties.length}
                hideTitle={true}
                customProperties={displayProperties}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {displayProperties.map((property, index) => (
                <div key={`${property.id}-${index}`} data-property-id={property.id} className="transition-all duration-300">
                  <CompactPropertyCard
                    property={property}
                    language={language}
                    isSaved={favoriteProperties.has(property.id)}
                    onSave={() => toggleFavorite(property.id)}
                    onView={() => handleViewDetails(property.id)}
                    onView3D={handleView3D}
                  />
                </div>
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

      <PropertyModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        propertyId={modalState.propertyId}
        mode={modalState.mode}
      />
    </>
  );
};

export default PropertyListingsSection;
