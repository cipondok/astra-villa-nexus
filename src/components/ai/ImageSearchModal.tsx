import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Sparkles, Grid, ScanEye } from "lucide-react";
import { BaseProperty } from "@/types/property";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";
import { PropertyComparisonView } from "./PropertyComparisonView";
import { useState } from "react";
import { TableStyleDialog, TableSection } from "@/components/ui/TableStyleDialog";

interface ImageSearchResult extends BaseProperty {
  similarityScore: number;
  similarityBreakdown: {
    propertyType: number;
    style: number;
    architecture: number;
    bedrooms: number;
    amenities: number;
  };
}

interface ImageFeatures {
  propertyType: string;
  style: string;
  architecture: string;
  bedrooms: number;
  amenities: string[];
  condition: string;
  size: string;
}

interface ImageSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: ImageSearchResult[];
  imageFeatures: ImageFeatures | null;
  isSearching: boolean;
  uploadProgress: number;
  searchImageUrl: string | null;
}

export const ImageSearchModal = ({
  isOpen,
  onClose,
  searchResults,
  imageFeatures,
  isSearching,
  uploadProgress,
  searchImageUrl
}: ImageSearchModalProps) => {
  const [selectedPropertyForComparison, setSelectedPropertyForComparison] = useState<ImageSearchResult | null>(null);
  const [activeTab, setActiveTab] = useState("grid");

  // Build table sections for detected features
  const featuresSections: TableSection[] = imageFeatures ? [{
    title: "Detected Features",
    icon: Sparkles,
    rows: [
      {
        label: "Property Type",
        value: (
          <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
            {imageFeatures.propertyType}
          </Badge>
        )
      },
      {
        label: "Style",
        value: (
          <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
            {imageFeatures.style} Style
          </Badge>
        )
      },
      {
        label: "Architecture",
        value: (
          <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
            {imageFeatures.architecture}
          </Badge>
        )
      },
      {
        label: "Bedrooms",
        value: (
          <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
            {imageFeatures.bedrooms} Bedrooms
          </Badge>
        )
      },
      {
        label: "Condition",
        value: (
          <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
            {imageFeatures.condition}
          </Badge>
        )
      },
      {
        label: "Amenities",
        value: (
          <div className="flex flex-wrap gap-2">
            {imageFeatures.amenities.slice(0, 3).map((amenity, idx) => (
              <Badge key={idx} variant="secondary" className="bg-white/50 dark:bg-black/20">
                {amenity}
              </Badge>
            ))}
          </div>
        )
      }
    ]
  }] : [];

  return (
    <TableStyleDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Image Search Results"
      description={isSearching 
        ? "Analyzing your image..." 
        : `Found ${searchResults.length} similar properties`
      }
      icon={ImageIcon}
      iconClassName="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500"
      maxWidth="4xl"
      showProgress={isSearching ? {
        value: uploadProgress,
        label: uploadProgress < 40 ? "Processing image..." : 
               uploadProgress < 80 ? "Searching database..." : 
               "Finalizing results..."
      } : undefined}
      sections={featuresSections}
    >
      <div className="space-y-6">
        {/* Search Image Preview */}
        {searchImageUrl && (
          <div className="flex justify-center">
            <div className="relative rounded-lg overflow-hidden border-2 border-purple-200 dark:border-purple-800 max-w-xs">
              <img 
                src={searchImageUrl} 
                alt="Search query" 
                className="w-full h-auto"
              />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                Your Search
              </div>
            </div>
          </div>
        )}

        {/* Tabs for Grid and Comparison Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger 
              value="comparison" 
              className="flex items-center gap-2"
              disabled={!selectedPropertyForComparison}
            >
              <ScanEye className="w-4 h-4" />
              Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4 mt-6">
            {/* Search Results */}
            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Similar Properties ({searchResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((property) => (
                    <div 
                      key={property.id}
                      onClick={() => {
                        setSelectedPropertyForComparison(property);
                        setActiveTab("comparison");
                      }}
                      className="cursor-pointer transition-all hover:shadow-lg"
                    >
                      <CompactPropertyCard
                        property={property as any}
                        language="en"
                        searchImage={searchImageUrl || undefined}
                        similarityScore={property.similarityScore}
                        similarityBreakdown={property.similarityBreakdown}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Click on a property to view detailed comparison
                </p>
              </div>
            )}

            {/* No Results */}
            {!isSearching && searchResults.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Similar Properties Found</h3>
                <p className="text-muted-foreground">
                  Try uploading a different image or adjust your search criteria
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            {selectedPropertyForComparison && searchImageUrl && (
              <PropertyComparisonView
                searchImage={searchImageUrl}
                propertyImage={selectedPropertyForComparison.thumbnail_url || selectedPropertyForComparison.images?.[0] || ''}
                propertyTitle={selectedPropertyForComparison.title}
                similarityScore={selectedPropertyForComparison.similarityScore}
                similarityBreakdown={selectedPropertyForComparison.similarityBreakdown}
                imageFeatures={imageFeatures || undefined}
                propertyData={{
                  property_type: selectedPropertyForComparison.property_type,
                  bedrooms: selectedPropertyForComparison.bedrooms
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TableStyleDialog>
  );
};
