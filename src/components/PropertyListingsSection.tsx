import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchLoadingAnimation from "@/components/SearchLoadingAnimation";
import PropertyViewer3D from "@/components/PropertyViewer3D";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";
import AutoScrollCarousel from "@/components/property/AutoScrollCarousel";
import MaintenanceMode from './MaintenanceMode';
import { useSystemControls } from '@/hooks/useSystemControls';

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
      noResults: "No properties found matching your search",
      searchResults: "Search Results",
      noFeaturedProperties: "No properties available at the moment",
      showingResults: "Showing",
      loadingProperties: "Searching properties...",
      tryDifferentSearch: "Try adjusting your search criteria",
      browseAll: "Browse All Properties",
      connectionIssue: "Having trouble loading properties? Check your connection."
    },
    id: {
      title: "Properti Unggulan",
      subtitle: "Temukan peluang real estate premium",
      noResults: "Tidak ada properti yang sesuai dengan pencarian Anda",
      searchResults: "Hasil Pencarian",
      noFeaturedProperties: "Tidak ada properti tersedia saat ini",
      showingResults: "Menampilkan",
      loadingProperties: "Mencari properti...",
      tryDifferentSearch: "Coba sesuaikan kriteria pencarian Anda",
      browseAll: "Lihat Semua Properti",
      connectionIssue: "Masalah memuat properti? Periksa koneksi Anda."
    }
  };

  const currentText = text[language];

  const toggleFavorite = (propertyId: string) => {
    console.log('Toggling favorite for property:', propertyId);
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
    console.log('Viewing details for property:', propertyId);
    // Don't navigate, the CompactPropertyCard already handles modals
  };

  const handleView3D = (property: any) => {
    console.log('Opening 3D view for property:', property.id);
    setPropertyFor3DView(property);
  }

  const sectionData = useMemo(() => {
    const sectionTitle = hasSearched ? currentText.searchResults : currentText.title;
    const sectionSubtitle = hasSearched && searchResults.length > 0
      ? `${currentText.showingResults} ${searchResults.length} properties` 
      : hasSearched ? "" : currentText.subtitle;
    
    return { sectionTitle, sectionSubtitle };
  }, [hasSearched, searchResults.length, currentText]);

  const { isFeatureEnabled, getFeatureErrorMessage } = useSystemControls();

  // Check if property listings are enabled
  if (!isFeatureEnabled('property_listings')) {
    return (
      <MaintenanceMode
        feature="Property Listings"
        message={getFeatureErrorMessage('property_listings')}
      />
    );
  }

  // Optimized loading state with luxury styling
  if (isSearching) {
    return (
      <section className="py-3 sm:py-4 min-h-[300px]">
        <div className="w-full px-2 sm:px-4">
          <div className="text-center p-8 rounded-2xl max-w-sm mx-auto
            bg-[rgba(255,253,248,0.9)] dark:bg-[rgba(25,25,25,0.9)]
            border border-[hsl(48,95%,45%)]/20 dark:border-[hsl(48,100%,50%)]/25
            backdrop-blur-xl shadow-xl">
            <div className="relative w-12 h-12 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[hsl(48,95%,45%)] to-[hsl(42,85%,55%)] dark:from-[hsl(48,100%,50%)] dark:to-[hsl(45,90%,60%)] animate-spin" />
              <div className="absolute inset-1 rounded-full bg-[hsl(45,30%,97%)] dark:bg-[hsl(0,0%,8%)]" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-[hsl(48,95%,45%)]/50 to-[hsl(42,85%,55%)]/50 dark:from-[hsl(48,100%,50%)]/50 dark:to-[hsl(45,90%,60%)]/50 animate-pulse" />
            </div>
            <p className="text-sm sm:text-base font-medium bg-gradient-to-r from-[hsl(48,95%,45%)] to-[hsl(42,85%,55%)] dark:from-[hsl(48,100%,50%)] dark:to-[hsl(45,90%,60%)] bg-clip-text text-transparent">{currentText.loadingProperties}</p>
            <p className="text-xs text-[hsl(0,0%,40%)] dark:text-[hsl(0,0%,70%)] mt-2">This should only take a few seconds...</p>
          </div>
        </div>
      </section>
    );  
  }
  
  const displayProperties = hasSearched ? searchResults : fallbackResults;
  console.log('PropertyListingsSection - displayProperties count:', displayProperties?.length || 0);

  return (
    <>
      <section className="py-3 sm:py-4 min-h-[400px]">
        <div className="w-full px-1 sm:px-2 md:px-4">
          {!hideTitle && (
            <div className="text-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 bg-gradient-to-r from-[hsl(48,95%,45%)] to-[hsl(42,85%,55%)] dark:from-[hsl(48,100%,50%)] dark:to-[hsl(45,90%,60%)] bg-clip-text text-transparent">{sectionData.sectionTitle}</h2>
              {sectionData.sectionSubtitle && (
                <p className="text-sm sm:text-base text-[hsl(0,0%,40%)] dark:text-[hsl(0,0%,70%)]">{sectionData.sectionSubtitle}</p>
              )}
              <div className="w-24 h-0.5 mx-auto mt-2 bg-gradient-to-r from-transparent via-[hsl(48,95%,45%)] dark:via-[hsl(48,100%,50%)] to-transparent rounded-full" />
            </div>
          )}

          {!displayProperties || displayProperties.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="max-w-md mx-auto px-4 p-6 rounded-2xl
                bg-[rgba(255,253,248,0.9)] dark:bg-[rgba(25,25,25,0.9)]
                border border-[hsl(48,95%,45%)]/20 dark:border-[hsl(48,100%,50%)]/25
                backdrop-blur-xl shadow-xl">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-[hsl(48,95%,45%)]/20 to-[hsl(42,85%,55%)]/20 dark:from-[hsl(48,100%,50%)]/20 dark:to-[hsl(45,90%,60%)]/20 rounded-full flex items-center justify-center border border-[hsl(48,95%,45%)]/30 dark:border-[hsl(48,100%,50%)]/30">
                    <svg className="w-8 h-8 text-[hsl(48,95%,45%)] dark:text-[hsl(48,100%,50%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 bg-gradient-to-r from-[hsl(48,95%,45%)] to-[hsl(42,85%,55%)] dark:from-[hsl(48,100%,50%)] dark:to-[hsl(45,90%,60%)] bg-clip-text text-transparent">
                  {hasSearched ? currentText.noResults : currentText.noFeaturedProperties}
                </h3>
                {hasSearched && (
                  <p className="text-xs sm:text-sm text-[hsl(0,0%,40%)] dark:text-[hsl(0,0%,70%)] mb-4">
                    {currentText.tryDifferentSearch}
                  </p>
                )}
                <div className="space-y-2">
                  <Button onClick={() => window.location.reload()} variant="outline" className="w-full text-sm border-[hsl(48,95%,45%)]/30 dark:border-[hsl(48,100%,50%)]/30 hover:bg-[hsl(48,95%,45%)]/10 dark:hover:bg-[hsl(48,100%,50%)]/10 hover:border-[hsl(48,95%,45%)]/50 dark:hover:border-[hsl(48,100%,50%)]/50 transition-all duration-300">
                    Refresh
                  </Button>
                  <Button onClick={() => navigate('/dijual')} className="w-full text-sm bg-gradient-to-r from-[hsl(48,95%,45%)] to-[hsl(42,85%,55%)] dark:from-[hsl(48,100%,50%)] dark:to-[hsl(45,90%,60%)] hover:from-[hsl(48,95%,40%)] hover:to-[hsl(42,85%,50%)] dark:hover:from-[hsl(48,100%,45%)] dark:hover:to-[hsl(45,90%,55%)] text-white dark:text-[hsl(0,0%,10%)] shadow-lg shadow-[hsl(48,95%,45%)]/20 dark:shadow-[hsl(48,100%,50%)]/30">
                    {currentText.browseAll}
                  </Button>
                </div>
                <p className="text-xs text-[hsl(0,0%,40%)] dark:text-[hsl(0,0%,70%)] mt-3">{currentText.connectionIssue}</p>
              </div>
            </div>
          ) : displayProperties.length >= 4 ? (
            // Use AutoScrollCarousel for 4 or more properties
            <AutoScrollCarousel
              title=""
              currentPropertyId=""
              queryType="recommended"
              propertyData={{
                properties: displayProperties
              }}
              autoScrollInterval={8000}
              limit={displayProperties.length}
              hideTitle={true}
              customProperties={displayProperties}
            />
          ) : (
            // Use responsive grid layout for less than 4 properties - full width on mobile
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {displayProperties.map((property, index) => {
                console.log('Rendering CompactPropertyCard for property:', property.id);
                return (
                  <div key={`${property.id}-${index}`}>
                    <CompactPropertyCard
                      property={property}
                      language={language}
                      isSaved={favoriteProperties.has(property.id)}
                      onSave={() => toggleFavorite(property.id)}
                      onView={() => handleViewDetails(property.id)}
                      onView3D={handleView3D}
                    />
                  </div>
                );
              })}
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
