import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOptimizedPropertySearch } from '@/hooks/useOptimizedPropertySearch';
import { Search, Filter, ChevronLeft, ChevronRight, Clock, Database, Zap, Save, BookmarkCheck, Trash2, Download, FileText, FileSpreadsheet, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2pdf from 'html2pdf.js';

interface OptimizedPropertySearchProps {
  onResultSelect?: (propertyId: string) => void;
  showAnalytics?: boolean;
}

const OptimizedPropertySearch = ({ onResultSelect, showAnalytics = false }: OptimizedPropertySearchProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [savedSearches, setSavedSearches] = useState<Array<{ name: string; filters: any }>>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [savedSearchesOpen, setSavedSearchesOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const { toast } = useToast();
  
  const {
    searchResponse,
    filters,
    suggestions,
    updateFilters,
    fetchSuggestions,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    clearCache
  } = useOptimizedPropertySearch();

  // Load saved searches from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
    
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  const { results, totalCount, page, totalPages, isLoading, error, responseTime, cacheHit } = searchResponse;

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateFilters({ searchText: value });
    fetchSuggestions(value);
    setShowRecentSearches(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    updateFilters({ searchText: suggestion });
    setShowRecentSearches(false);
    addToRecentSearches(suggestion);
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchInput(query);
    updateFilters({ searchText: query });
    setShowRecentSearches(false);
  };

  const addToRecentSearches = (query: string) => {
    if (!query.trim() || query.length < 2) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setShowRecentSearches(false);
    toast({
      title: "Recent Searches Cleared",
      description: "Your search history has been removed"
    });
  };

  const handleSearchFocus = () => {
    if (!searchInput && recentSearches.length > 0) {
      setShowRecentSearches(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay to allow click on recent search items
    setTimeout(() => setShowRecentSearches(false), 200);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ searchText: undefined });
    setShowRecentSearches(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="font-bold text-primary">{part}</span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    updateFilters({ amenities: newAmenities.length > 0 ? newAmenities : undefined });
  };

  const amenitiesList = [
    'Pool',
    'Gym',
    'Parking',
    'Security',
    'Garden',
    'Balcony',
    'Air Conditioning',
    'Elevator'
  ];

  // Count active filters (excluding searchText and sortBy)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.propertyType) count++;
    if (filters.listingType) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.minBedrooms) count++;
    if (filters.minBathrooms) count++;
    if (filters.minArea || filters.maxArea) count++;
    if (filters.amenities && filters.amenities.length > 0) count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    updateFilters({
      propertyType: undefined,
      listingType: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minBedrooms: undefined,
      minBathrooms: undefined,
      minArea: undefined,
      maxArea: undefined,
      amenities: undefined,
      sortBy: undefined
    });
    setSearchInput('');
  };

  const handleSaveSearch = () => {
    if (!searchName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this search",
        variant: "destructive"
      });
      return;
    }

    const newSearch = {
      name: searchName.trim(),
      filters: { ...filters, searchText: searchInput }
    };

    const updated = [...savedSearches, newSearch];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    
    toast({
      title: "Search Saved",
      description: `"${searchName}" has been saved successfully`
    });

    setSearchName('');
    setSaveDialogOpen(false);
  };

  const handleApplySavedSearch = (search: { name: string; filters: any }) => {
    const { searchText, ...restFilters } = search.filters;
    setSearchInput(searchText || '');
    updateFilters(restFilters);
    setSavedSearchesOpen(false);
    
    toast({
      title: "Search Applied",
      description: `Applied "${search.name}" filters`
    });
  };

  const handleDeleteSavedSearch = (index: number) => {
    const updated = savedSearches.filter((_, i) => i !== index);
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    
    toast({
      title: "Search Deleted",
      description: "Saved search has been removed"
    });
  };

  const handleExportCSV = () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }

    const headers = ['Title', 'Type', 'Listing', 'Price', 'Bedrooms', 'Bathrooms', 'Area (sqm)', 'Location', 'City'];
    const csvContent = [
      headers.join(','),
      ...results.map(property => [
        `"${property.title.replace(/"/g, '""')}"`,
        property.property_type,
        property.listing_type,
        property.price,
        property.bedrooms,
        property.bathrooms,
        property.area_sqm || 0,
        `"${property.area.replace(/"/g, '""')}"`,
        property.city
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `property-search-results-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setExportMenuOpen(false);
    toast({
      title: "Export Successful",
      description: "CSV file has been downloaded"
    });
  };

  const handleExportPDF = () => {
    if (results.length === 0) {
      toast({
        title: "No Data",
        description: "No results to export",
        variant: "destructive"
      });
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #0066cc; color: white; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            tr:hover { background-color: #f5f5f5; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Property Search Results</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Total Results: ${totalCount}</p>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Price</th>
                <th>Beds</th>
                <th>Baths</th>
                <th>Area (sqm)</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              ${results.map(property => `
                <tr>
                  <td>${property.title}</td>
                  <td>${property.property_type}</td>
                  <td>$${property.price.toLocaleString()}</td>
                  <td>${property.bedrooms}</td>
                  <td>${property.bathrooms}</td>
                  <td>${property.area_sqm || 'N/A'}</td>
                  <td>${property.city}, ${property.area}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>This document contains ${results.length} properties from the search results.</p>
          </div>
        </body>
      </html>
    `;

    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    
    html2pdf()
      .from(element)
      .set({
        margin: 10,
        filename: `property-search-results-${new Date().toISOString().split('T')[0]}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      })
      .save()
      .then(() => {
        setExportMenuOpen(false);
        toast({
          title: "Export Successful",
          description: "PDF file has been downloaded"
        });
      });
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F key - Toggle filters
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Only trigger if not typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowFilters(prev => !prev);
        }
      }
      
      // Ctrl+S or Cmd+S - Save search
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (activeFilterCount > 0 || searchInput) {
          e.preventDefault();
          setSaveDialogOpen(true);
        }
      }
      
      // Ctrl+X or Cmd+X - Clear all filters
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        if (activeFilterCount > 0 || searchInput || filters.sortBy) {
          e.preventDefault();
          handleResetFilters();
        }
      }
      
      // Escape - Close dialogs/popovers
      if (e.key === 'Escape') {
        setSaveDialogOpen(false);
        setSavedSearchesOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFilterCount, searchInput, filters.sortBy]);

  const SkeletonCard = () => (
    <Card className="h-48">
      <CardContent className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-20 w-full mb-2" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Optimized Property Search
              <Badge variant="secondary" className="text-xs font-normal">
                Shortcuts: F (filters) • Ctrl+S (save) • Ctrl+X (clear)
              </Badge>
            </div>
            {showAnalytics && (
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={cacheHit ? "secondary" : "outline"} className="gap-1">
                  {cacheHit ? <Zap className="h-3 w-3" /> : <Database className="h-3 w-3" />}
                  {cacheHit ? 'Cached' : 'Fresh'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {responseTime}ms
                </Badge>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <Input
              placeholder="Search properties by location, title, or description..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className={searchInput ? "pr-20" : "pr-10"}
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-10 top-1/2 transform -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && !showRecentSearches && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors border-b last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {highlightMatch(suggestion, searchInput)}
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-lg">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">Recent Searches</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="h-6 text-xs hover:text-destructive"
                  >
                    Clear
                  </Button>
                </div>
                {recentSearches.map((query, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors border-b last:border-b-0 flex items-center gap-2"
                    onClick={() => handleRecentSearchClick(query)}
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {query}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                {activeFilterCount > 0 && (
                  <Badge 
                    variant="default" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </div>

              {(activeFilterCount > 0 || searchInput || filters.sortBy) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  Reset All
                </Button>
              )}

              <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={!activeFilterCount && !searchInput}
                  >
                    <Save className="h-4 w-4" />
                    Save Search
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Save Search</DialogTitle>
                    <DialogDescription>
                      Give this search combination a name to quickly access it later.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    placeholder="e.g., Beach Villas Under 1M"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSearch}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {savedSearches.length > 0 && (
                <Popover open={savedSearchesOpen} onOpenChange={setSavedSearchesOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <BookmarkCheck className="h-4 w-4" />
                      Saved ({savedSearches.length})
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-4 border-b">
                      <h4 className="font-semibold text-sm">Saved Searches</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to apply a saved search
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {savedSearches.map((search, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b last:border-0"
                        >
                          <button
                            onClick={() => handleApplySavedSearch(search)}
                            className="flex-1 text-left text-sm font-medium hover:text-primary transition-colors"
                          >
                            {search.name}
                          </button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSavedSearch(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Popover open={exportMenuOpen} onOpenChange={setExportMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={results.length === 0}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={handleExportCSV}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Export as CSV
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                      onClick={handleExportPDF}
                    >
                      <FileText className="h-4 w-4" />
                      Export as PDF
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Select value={filters.sortBy || ''} onValueChange={(value) => updateFilters({ sortBy: value || undefined })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="area_asc">Area: Small to Large</SelectItem>
                  <SelectItem value="area_desc">Area: Large to Small</SelectItem>
                </SelectContent>
              </Select>
              
              {totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Found {totalCount.toLocaleString()} properties
                </p>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <Select value={filters.propertyType || ''} onValueChange={(value) => updateFilters({ propertyType: value || undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.listingType || ''} onValueChange={(value) => updateFilters({ listingType: value || undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Listing Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Listings</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>

              <div className="col-span-2 md:col-span-4 space-y-3 p-4 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Price Range</label>
                  <span className="text-sm text-muted-foreground">
                    ${(filters.minPrice || 0).toLocaleString()} - ${(filters.maxPrice || 10000000).toLocaleString()}
                  </span>
                </div>
                <Slider
                  min={0}
                  max={10000000}
                  step={50000}
                  value={[filters.minPrice || 0, filters.maxPrice || 10000000]}
                  onValueChange={(value) => updateFilters({ 
                    minPrice: value[0] === 0 ? undefined : value[0],
                    maxPrice: value[1] === 10000000 ? undefined : value[1]
                  })}
                  className="w-full"
                />
              </div>

              <Select value={filters.minBedrooms?.toString() || ''} onValueChange={(value) => updateFilters({ minBedrooms: value ? Number(value) : undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Bedrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.minBathrooms?.toString() || ''} onValueChange={(value) => updateFilters({ minBathrooms: value ? Number(value) : undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Bathrooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                </SelectContent>
              </Select>

              <div className="col-span-2 md:col-span-4 space-y-3 p-4 bg-background rounded-md border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Area Range (sqm)</label>
                  <span className="text-sm text-muted-foreground">
                    {filters.minArea || 0} - {filters.maxArea || 1000} sqm
                  </span>
                </div>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={[filters.minArea || 0, filters.maxArea || 1000]}
                  onValueChange={(value) => updateFilters({ 
                    minArea: value[0] === 0 ? undefined : value[0],
                    maxArea: value[1] === 1000 ? undefined : value[1]
                  })}
                  className="w-full"
                />
              </div>

              <div className="col-span-2 md:col-span-4 space-y-3 p-4 bg-background rounded-md border">
                <label className="text-sm font-medium">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenitiesList.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={filters.amenities?.includes(amenity) || false}
                        onCheckedChange={() => handleAmenityToggle(amenity)}
                      />
                      <Label
                        htmlFor={amenity}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" onClick={clearCache} size="sm">
                Clear Cache
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Search failed: {error}. Please try again or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      )}

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((property) => (
                <Card 
                  key={property.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onResultSelect?.(property.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {property.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-primary">
                          ${property.price?.toLocaleString()}
                        </div>
                        <Badge variant="outline">
                          {property.property_type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{property.city}, {property.area}</span>
                        <span>{property.bedrooms}BR / {property.bathrooms}BA</span>
                      </div>
                      {property.area_sqm && (
                        <div className="text-xs text-muted-foreground">
                          {property.area_sqm} sqm
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={!hasPrevPage}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={!hasNextPage}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or clearing some filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OptimizedPropertySearch;