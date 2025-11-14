import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Image as ImageIcon, Sparkles, Grid, ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseProperty } from "@/types/property";
import CompactPropertyCard from "@/components/property/CompactPropertyCard";
import { PropertyComparisonView } from "./PropertyComparisonView";
import { useState } from "react";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Image Search Results</DialogTitle>
                <DialogDescription>
                  {isSearching 
                    ? "Analyzing your image..." 
                    : `Found ${searchResults.length} similar properties`
                  }
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Progress Bar */}
        {isSearching && (
          <div className="px-6 pb-4">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {uploadProgress < 40 ? "Processing image..." : 
               uploadProgress < 80 ? "Searching database..." : 
               "Finalizing results..."}
            </p>
          </div>
        )}

        <Tabs defaultValue="grid" className="flex-1">
          <div className="px-6 pb-2 border-b">
            <TabsList className="grid w-full max-w-md grid-cols-2">
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
          </div>

          <ScrollArea className="max-h-[calc(90vh-250px)]">
            <TabsContent value="grid" className="p-6 space-y-6 mt-0">
              {/* Image Features Detected */}
              {imageFeatures && (
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-rose-950/20 border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                      Detected Features
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
                      {imageFeatures.propertyType}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
                      {imageFeatures.style} Style
                    </Badge>
                    <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
                      {imageFeatures.architecture}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
                      {imageFeatures.bedrooms} Bedrooms
                    </Badge>
                    <Badge variant="secondary" className="bg-white/50 dark:bg-black/20">
                      {imageFeatures.condition}
                    </Badge>
                    {imageFeatures.amenities.slice(0, 3).map((amenity, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-white/50 dark:bg-black/20">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

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
                        onClick={() => setSelectedPropertyForComparison(property)}
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

            <TabsContent value="comparison" className="p-6 mt-0">
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
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
