import { useState, useMemo, lazy, Suspense } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, RefreshCw, ArrowRight, Sparkles } from "lucide-react";
const PropertyViewer3D = lazy(() => import("@/components/PropertyViewer3D"));
import CompactPropertyCard from "@/components/property/CompactPropertyCard";
import AutoScrollCarousel from "@/components/property/AutoScrollCarousel";
import MaintenanceMode from './MaintenanceMode';
import { useSystemControls } from '@/hooks/useSystemControls';
import { useTranslation } from "@/i18n/useTranslation";

interface PropertyListingsSectionProps {
  language?: "en" | "id" | "zh" | "ja" | "ko";
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
  const { t } = useTranslation();

  const toggleFavorite = (propertyId: string) => {
    setFavoriteProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const handleViewDetails = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleView3D = (property: any) => {
    setPropertyFor3DView(property);
  };

  const { isFeatureEnabled, getFeatureErrorMessage } = useSystemControls();

  const sectionData = useMemo(() => ({
    sectionTitle: hasSearched ? t('propertyListings.searchResults') : t('propertyListings.title'),
    sectionSubtitle: hasSearched ? undefined : t('propertyListings.subtitle'),
  }), [hasSearched, t]);

  if (!isFeatureEnabled('property_listings')) {
    return (
      <MaintenanceMode
        feature="Property Listings"
        message={getFeatureErrorMessage('property_listings')}
      />
    );
  }

  if (isSearching) {
    return (
      <section className="py-3 sm:py-4 min-h-[300px]">
        <div className="w-full px-2 sm:px-4">
          <div className="text-center p-8 rounded-2xl max-w-sm mx-auto
            bg-muted/50 backdrop-blur-xl border border-border shadow-xl">
            <div className="relative w-14 h-14 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-primary/60 animate-spin" />
              <div className="absolute inset-1 rounded-full bg-background" />
              <div className="absolute inset-2.5 rounded-full bg-gradient-to-r from-primary/40 to-primary/20 animate-pulse" />
              <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-primary" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-primary">
              {t('propertyListings.loadingProperties')}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{t('propertyListings.loadingSubtext')}</p>
          </div>
        </div>
      </section>
    );  
  }
  
  const displayProperties = hasSearched ? searchResults : fallbackResults;

  return (
    <>
      <ScrollReveal direction="up">
        <div className="w-full px-1 sm:px-2 md:px-4">
          {!hideTitle && (
            <div className="text-center mb-3 sm:mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-primary/30" />
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground uppercase tracking-wider">
                  {sectionData.sectionTitle}
                </h2>
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
                <div className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-primary/30" />
              </div>
              {sectionData.sectionSubtitle && (
                <p className="text-sm sm:text-base text-muted-foreground">{sectionData.sectionSubtitle}</p>
              )}
            </div>
          )}

          {!displayProperties || displayProperties.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="max-w-md mx-auto px-4 p-6 rounded-2xl
                bg-muted/50 backdrop-blur-xl border border-border shadow-xl">
                <div className="mb-4">
                   <div className="w-14 h-14 mx-auto mb-3 bg-muted rounded-xl flex items-center justify-center border border-border">
                    <Building2 className="w-7 h-7 text-gold-primary/70" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-2 text-foreground">
                  {hasSearched ? t('propertyListings.noResults') : t('propertyListings.noFeaturedProperties')}
                </h3>
                {hasSearched && (
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    {t('propertyListings.tryDifferentSearch')}
                  </p>
                )}
                <div className="space-y-2">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full text-sm border-border hover:bg-muted hover:border-primary/30 transition-all duration-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    {t('common.refresh')}
                  </Button>
                  <Button
                    onClick={() => navigate('/dijual')}
                    className="w-full text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    {t('propertyListings.browseAll')}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">{t('propertyListings.connectionIssue')}</p>
              </div>
            </div>
          ) : displayProperties.length >= 4 ? (
            <AutoScrollCarousel
              title=""
              currentPropertyId=""
              queryType="recommended"
              propertyData={{ properties: displayProperties }}
              autoScrollInterval={8000}
              limit={displayProperties.length}
              hideTitle={true}
              customProperties={displayProperties}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              {displayProperties.map((property, index) => (
                <ScrollReveal key={`${property.id}-${index}`} direction="up" delay={index * 100} distance={20}>
                  <CompactPropertyCard
                    property={property}
                    language={language || "en"}
                    isSaved={favoriteProperties.has(property.id)}
                    onSave={() => toggleFavorite(property.id)}
                    onView={() => handleViewDetails(property.id)}
                    onView3D={handleView3D}
                  />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </ScrollReveal>


      {propertyFor3DView && (
        <Suspense fallback={null}>
          <PropertyViewer3D
            isOpen={!!propertyFor3DView}
            onClose={() => setPropertyFor3DView(null)}
            propertyId={propertyFor3DView.id}
            propertyTitle={propertyFor3DView.title}
          />
        </Suspense>
      )}
    </>
  );
};

export default PropertyListingsSection;
