
import { useState, useRef } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import StickySearchPanel from '@/components/search/StickySearchPanel';
import AdvancedPropertyFilters, { PropertyFilters } from '@/components/search/AdvancedPropertyFilters';
import PropertySearchResults from '@/components/search/PropertySearchResults';
import PropertyMapView from '@/components/search/PropertyMapView';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { useImageSearch } from '@/hooks/useImageSearch';
import { BaseProperty } from '@/types/property';
import { useAlert } from '@/contexts/AlertContext';
import { Search, Filter, Grid, List, Map, SlidersHorizontal, Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PropertySearch = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useAlert();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map' | 'image'>('grid');
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [areaFilteredProperties, setAreaFilteredProperties] = useState<BaseProperty[] | null>(null);
  const [showModernFilters, setShowModernFilters] = useState(false);
  const [modernFilters, setModernFilters] = useState<PropertyFilters>({
    searchQuery: "",
    priceRange: [0, 50000000000],
    location: "all",
    propertyTypes: [],
    bedrooms: null,
    bathrooms: null,
    minArea: null,
    maxArea: null,
    listingType: "all",
    sortBy: "newest"
  });

  // Image search state
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    searchResults,
    isLoading,
    error,
    searchProperties,
    clearSearch,
    filters
  } = usePropertySearch();

  const {
    searchByImage,
    isSearching: isImageSearching,
    searchResults: imageSearchResults,
    imageFeatures,
    error: imageSearchError,
    uploadProgress,
    clearResults: clearImageResults
  } = useImageSearch();

  const handleFiltersChange = (newFilters: any) => {
    console.log('Filters changed:', newFilters);
  };

  const handleSearch = (searchData: any) => {
    console.log('Searching with:', searchData);
    searchProperties(searchData);
  };

  const handlePropertyClick = (property: BaseProperty) => {
    navigate(`/property/${property.id}`);
  };

  const handleSaveProperty = (propertyId: string) => {
    if (savedProperties.includes(propertyId)) {
      setSavedProperties(prev => prev.filter(id => id !== propertyId));
      showSuccess('Property Removed', 'Property removed from your saved list');
    } else {
      setSavedProperties(prev => [...prev, propertyId]);
      showSuccess('Property Saved', 'Property added to your saved list');
    }
  };

  const handleShareProperty = (property: BaseProperty) => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description || `Check out this property: ${property.title}`,
        url: `${window.location.origin}/property/${property.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/property/${property.id}`);
      showSuccess('Link Copied', 'Property link copied to clipboard');
    }
  };

  const handleView3D = (property: BaseProperty) => {
    if (property.three_d_model_url) {
      window.open(property.three_d_model_url, '_blank');
    }
  };

  // Image search handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleImageFile(files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSearch = async () => {
    if (!uploadedImage) return;

    try {
      const result = await searchByImage(uploadedImage);
      
      setViewMode('image');
      setShowImageUpload(false);
      
      toast({
        title: "Search Complete!",
        description: `Found ${result.totalMatches} similar properties`
      });
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search by image",
        variant: "destructive"
      });
    }
  };

  const clearImageSearch = () => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
    clearImageResults();
    setViewMode('grid');
  };

  const handleFilterByArea = (filteredProperties: BaseProperty[]) => {
    setAreaFilteredProperties(filteredProperties);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.propertyType && filters.propertyType !== 'all') count++;
    if (filters.listingType && filters.listingType !== 'all') count++;
    if (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 20000000000)) count++;
    if (filters.bedrooms && filters.bedrooms !== 'all') count++;
    if (filters.bathrooms && filters.bathrooms !== 'all') count++;
    if (filters.location) count++;
    if (filters.features && filters.features.length > 0) count++;
    return count;
  };

  const text = {
    en: {
      title: "Property Search",
      subtitle: "Find your perfect property with advanced search filters",
      results: "Search Results",
      propertiesFound: "properties found",
      viewMode: "View Mode",
      clearAll: "Clear All Filters",
      noFilters: "No active filters"
    },
    id: {
      title: "Pencarian Properti",
      subtitle: "Temukan properti impian Anda dengan filter pencarian lanjutan",
      results: "Hasil Pencarian",
      propertiesFound: "properti ditemukan",
      viewMode: "Mode Tampilan",
      clearAll: "Hapus Semua Filter",
      noFilters: "Tidak ada filter aktif"
    }
  };

  const currentText = text[language];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Search className="h-8 w-8" />
                {currentText.title}
              </h1>
              <p className="text-gray-600 mt-2">{currentText.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModernFilters(true)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced Filters</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImageUpload(true)}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Search by Image</span>
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
              <Button
                variant={language === 'id' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('id')}
              >
                ID
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Advanced Filters Dialog */}
        <AdvancedPropertyFilters
          filters={modernFilters}
          onFiltersChange={(newFilters) => {
            setModernFilters(newFilters);
            // Convert and apply to main search
            searchProperties({
              query: newFilters.searchQuery,
              priceRange: [newFilters.priceRange[0], newFilters.priceRange[1]],
              propertyType: newFilters.propertyTypes[0],
              listingType: newFilters.listingType,
              bedrooms: newFilters.bedrooms,
              bathrooms: newFilters.bathrooms,
              location: newFilters.location,
            });
          }}
          onClearFilters={() => {
            setModernFilters({
              searchQuery: "",
              priceRange: [0, 50000000000],
              location: "all",
              propertyTypes: [],
              bedrooms: null,
              bathrooms: null,
              minArea: null,
              maxArea: null,
              listingType: "all",
              sortBy: "newest"
            });
            clearSearch();
          }}
          isOpen={showModernFilters}
          onToggle={() => setShowModernFilters(!showModernFilters)}
        />

        {/* Image Upload Modal */}
        <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Search by Image
              </DialogTitle>
              <DialogDescription>
                Upload a property image to find similar listings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {!uploadedImagePreview ? (
                <>
                  {/* Drag & Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">
                      Drag & drop an image here
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      or click to browse (max 10MB)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    {/* Camera capture on mobile */}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileInput}
                      className="hidden"
                      id="camera-input"
                    />
                    <label htmlFor="camera-input" className="md:hidden">
                      <Button type="button" variant="ghost" className="mt-2" asChild>
                        <span>
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </span>
                      </Button>
                    </label>
                  </div>

                  {/* Tips */}
                  <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
                    <p className="font-medium">Tips for best results:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                      <li>Use clear, well-lit exterior photos</li>
                      <li>Show the full building facade</li>
                      <li>Avoid interior-only photos</li>
                      <li>Straight angles work better than artistic shots</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  {/* Image Preview */}
                  <div className="relative">
                    <img
                      src={uploadedImagePreview}
                      alt="Uploaded property"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setUploadedImage(null);
                        setUploadedImagePreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Upload Progress */}
                  {isImageSearching && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} />
                      <p className="text-xs text-center text-muted-foreground">
                        Analyzing image and finding matches...
                      </p>
                    </div>
                  )}

                  {/* Search Button */}
                  <Button
                    onClick={handleImageSearch}
                    disabled={isImageSearching}
                    className="w-full"
                  >
                    {isImageSearching ? (
                      <>Searching...</>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Find Similar Properties
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Sticky Search Panel */}
        <div className="mb-8">
          <StickySearchPanel
            language={language}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            initialFilters={filters}
          />
        </div>

        {/* Search Results Header */}
        {((searchResults && searchResults.length > 0) || (imageSearchResults.length > 0) || isLoading || isImageSearching) ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {viewMode === 'image' ? (
                      <>
                        <Camera className="h-5 w-5" />
                        Image Search Results
                      </>
                    ) : (
                      currentText.results
                    )}
                    {!isLoading && !isImageSearching && (
                      <Badge variant="secondary">
                        {viewMode === 'image'
                          ? `${imageSearchResults.length} ${currentText.propertiesFound}`
                          : `${searchResults?.length || 0} ${currentText.propertiesFound}`
                        }
                      </Badge>
                    )}
                  </CardTitle>
                  {viewMode === 'image' && imageFeatures && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {imageFeatures.propertyType}
                      </Badge>
                      <Badge variant="outline">
                        {imageFeatures.style}
                      </Badge>
                      <Badge variant="outline">
                        {imageFeatures.bedrooms} beds
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {viewMode === 'image' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearImageSearch}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear Image Search
                      </Button>
                    ) : getActiveFiltersCount() > 0 ? (
                      <>
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getActiveFiltersCount()} active filters
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSearch}
                          className="text-red-600 hover:text-red-700"
                        >
                          {currentText.clearAll}
                        </Button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">{currentText.noFilters}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 mr-2">{currentText.viewMode}:</span>
                  <div className="flex border border-gray-200 rounded-md overflow-hidden">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('grid')}
                      className="rounded-none px-3"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('list')}
                      className="rounded-none px-3"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'map' ? 'default' : 'ghost'}
                      onClick={() => setViewMode('map')}
                      className="rounded-none px-3"
                    >
                      <Map className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : null}

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6">
              <div className="text-red-600">
                Error loading properties: {error.message}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {viewMode === 'map' ? (
          <PropertyMapView
            properties={searchResults || []}
            onPropertyClick={handlePropertyClick}
            onFilterByArea={handleFilterByArea}
          />
        ) : (
          <PropertySearchResults
            properties={
              viewMode === 'image'
                ? imageSearchResults
                : (areaFilteredProperties || searchResults || [])
            }
            language={language}
            isLoading={viewMode === 'image' ? isImageSearching : isLoading}
            onPropertyClick={handlePropertyClick}
            onSaveProperty={handleSaveProperty}
            onShareProperty={handleShareProperty}
            onView3D={handleView3D}
            savedPropertyIds={savedProperties}
          />
        )}
      </div>
    </div>
  );
};

export default PropertySearch;
