import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, Save, Clock, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import PropertyAdvancedFilters from './PropertyAdvancedFilters';

// Schema for saved search name validation
const savedSearchSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Search name cannot be empty" })
    .max(50, { message: "Search name must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9\s\-_]+$/, { message: "Only letters, numbers, spaces, hyphens and underscores allowed" })
});

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: any;
  timestamp: number;
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
}

interface StickySearchPanelProps {
  language: "en" | "id";
  onFiltersChange: (filters: any) => void;
  onSearch: (searchData: any) => void;
  initialFilters?: any;
}

const StickySearchPanel = ({
  language,
  onFiltersChange,
  onSearch,
  initialFilters = {}
}: StickySearchPanelProps) => {
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const scrollRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (initialFilters.propertyType && initialFilters.propertyType !== 'all') count++;
    if (initialFilters.listingType && initialFilters.listingType !== 'all') count++;
    if (initialFilters.priceRange && (initialFilters.priceRange[0] > 0 || initialFilters.priceRange[1] < 20000000000)) count++;
    if (initialFilters.bedrooms && initialFilters.bedrooms !== 'all') count++;
    if (initialFilters.bathrooms && initialFilters.bathrooms !== 'all') count++;
    if (initialFilters.location) count++;
    if (initialFilters.features && initialFilters.features.length > 0) count++;
    if (initialFilters.amenities && initialFilters.amenities.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Load saved and recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedSearches');
      const recent = localStorage.getItem('recentSearches');
      
      if (saved) {
        setSavedSearches(JSON.parse(saved));
      }
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Failed to load searches:', error);
    }
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowAutocomplete(true);
      }
      
      // ESC to close autocomplete
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      
      if (current > 120 && scrollRef.current <= 120) {
        setIsMinimized(true);
        setIsFiltersExpanded(false);
      } else if (current < 80 && scrollRef.current >= 80) {
        setIsMinimized(false);
      }
      
      scrollRef.current = current;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside to collapse filters and autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFiltersExpanded &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsFiltersExpanded(false);
      }

      // Close autocomplete when clicking outside
      if (
        showAutocomplete &&
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFiltersExpanded, showAutocomplete]);

  const handleQuickSearch = () => {
    // Add to recent searches
    if (searchQuery.trim()) {
      addToRecentSearches(searchQuery.trim());
    }

    onSearch({
      query: searchQuery,
      ...initialFilters
    });

    setShowAutocomplete(false);
  };

  const addToRecentSearches = (query: string) => {
    try {
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        query,
        timestamp: Date.now()
      };

      const updated = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const handleSaveSearch = () => {
    try {
      const validation = savedSearchSchema.safeParse({ name: saveName });
      
      if (!validation.success) {
        toast({
          title: "Invalid Name",
          description: validation.error.errors[0].message,
          variant: "destructive"
        });
        return;
      }

      const newSavedSearch: SavedSearch = {
        id: Date.now().toString(),
        name: saveName.trim(),
        query: searchQuery,
        filters: initialFilters,
        timestamp: Date.now()
      };

      const updated = [...savedSearches, newSavedSearch];
      setSavedSearches(updated);
      localStorage.setItem('savedSearches', JSON.stringify(updated));

      toast({
        title: "Search Saved",
        description: `"${saveName}" has been saved successfully`
      });

      setShowSaveDialog(false);
      setSaveName('');
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save search. Please try again.",
        variant: "destructive"
      });
    }
  };

  const loadSavedSearch = (saved: SavedSearch) => {
    setSearchQuery(saved.query);
    onFiltersChange(saved.filters);
    onSearch({
      query: saved.query,
      ...saved.filters
    });
    setShowAutocomplete(false);

    toast({
      title: "Search Loaded",
      description: `Loaded "${saved.name}"`
    });
  };

  const deleteSavedSearch = (id: string) => {
    try {
      const updated = savedSearches.filter(s => s.id !== id);
      setSavedSearches(updated);
      localStorage.setItem('savedSearches', JSON.stringify(updated));

      toast({
        title: "Search Deleted",
        description: "Saved search has been removed"
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete search",
        variant: "destructive"
      });
    }
  };

  const selectRecentSearch = (query: string) => {
    setSearchQuery(query);
    setShowAutocomplete(false);
    handleQuickSearch();
  };

  const text = {
    en: {
      search: "Search properties, location, or developer...",
      filters: "Filters",
      searchBtn: "Search",
      saveSearch: "Save Search",
      savedSearches: "Saved Searches",
      recentSearches: "Recent Searches",
      noRecent: "No recent searches",
      noSaved: "No saved searches yet",
      searchName: "Search Name",
      save: "Save",
      cancel: "Cancel",
      keyboardHint: "Press Ctrl+K to search"
    },
    id: {
      search: "Cari properti, lokasi, atau pengembang...",
      filters: "Filter",
      searchBtn: "Cari",
      saveSearch: "Simpan Pencarian",
      savedSearches: "Pencarian Tersimpan",
      recentSearches: "Pencarian Terbaru",
      noRecent: "Tidak ada pencarian terbaru",
      noSaved: "Belum ada pencarian tersimpan",
      searchName: "Nama Pencarian",
      save: "Simpan",
      cancel: "Batal",
      keyboardHint: "Tekan Ctrl+K untuk mencari"
    }
  };

  const currentText = text[language];

  return (
    <>
      <motion.div
        ref={panelRef}
        className={`${
          isMinimized ? 'fixed top-0 left-0 right-0 z-40' : 'relative'
        } bg-background transition-all duration-300`}
        initial={false}
        animate={{
          boxShadow: isMinimized ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 0 0 0 rgba(0, 0, 0, 0)'
        }}
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {isMinimized ? (
            // Minimized View
            <motion.div
              key="minimized"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="py-3"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Search Input with Autocomplete */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
                  <Input
                    ref={searchInputRef}
                    id="search-input"
                    placeholder={currentText.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                    onFocus={() => setShowAutocomplete(true)}
                    className="pl-10 h-10 bg-background"
                  />

                  {/* Autocomplete Dropdown */}
                  <AnimatePresence>
                    {showAutocomplete && (recentSearches.length > 0 || savedSearches.length > 0) && (
                      <motion.div
                        ref={autocompleteRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                      >
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                          <div className="p-2 border-b border-border">
                            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {currentText.recentSearches}
                            </div>
                            {recentSearches.slice(0, 5).map((recent) => (
                              <button
                                key={recent.id}
                                onClick={() => selectRecentSearch(recent.query)}
                                className="w-full text-left px-3 py-2 hover:bg-accent rounded-md transition-colors text-sm"
                              >
                                {recent.query}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Saved Searches */}
                        {savedSearches.length > 0 && (
                          <div className="p-2">
                            <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                              <Save className="h-3 w-3" />
                              {currentText.savedSearches}
                            </div>
                            {savedSearches.map((saved) => (
                              <div
                                key={saved.id}
                                className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-md transition-colors group"
                              >
                                <button
                                  onClick={() => loadSavedSearch(saved)}
                                  className="flex-1 text-left text-sm"
                                >
                                  <div className="font-medium">{saved.name}</div>
                                  <div className="text-xs text-muted-foreground">{saved.query}</div>
                                </button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteSavedSearch(saved.id);
                                  }}
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Save Search Button */}
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setShowSaveDialog(true)}
                  className="h-10 px-3 sm:px-4 whitespace-nowrap"
                  title={currentText.saveSearch}
                >
                  <Save className="h-4 w-4" />
                </Button>

                {/* Search Button */}
                <Button
                  onClick={handleQuickSearch}
                  size="default"
                  className="h-10 px-4 sm:px-6 whitespace-nowrap"
                >
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{currentText.searchBtn}</span>
                </Button>

                {/* Filters Toggle Button */}
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className="h-10 px-4 sm:px-6 relative whitespace-nowrap"
                >
                  <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{currentText.filters}</span>
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Expanded Filters in Minimized State */}
              <AnimatePresence>
                {isFiltersExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 pb-2">
                      <PropertyAdvancedFilters
                        language={language}
                        onFiltersChange={onFiltersChange}
                        onSearch={(data) => {
                          onSearch(data);
                          setIsFiltersExpanded(false);
                        }}
                        initialFilters={initialFilters}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            // Full View
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-4"
            >
              <PropertyAdvancedFilters
                language={language}
                onFiltersChange={onFiltersChange}
                onSearch={onSearch}
                initialFilters={initialFilters}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Spacer to prevent layout shift when sticky */}
        {isMinimized && <div className="h-16" />}
      </motion.div>

      {/* Save Search Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              {currentText.saveSearch}
            </DialogTitle>
            <DialogDescription>
              Save your current search with filters for quick access later
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search-name">{currentText.searchName}</Label>
              <Input
                id="search-name"
                placeholder="e.g., Affordable houses in Jakarta"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                maxLength={50}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
              />
              <p className="text-xs text-muted-foreground">
                {saveName.length}/50 characters
              </p>
            </div>

            {searchQuery && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="font-medium mb-1">Current Search:</p>
                <p className="text-muted-foreground">{searchQuery}</p>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    {activeFiltersCount} filters active
                  </Badge>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setSaveName('');
              }}
            >
              {currentText.cancel}
            </Button>
            <Button onClick={handleSaveSearch} disabled={!saveName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {currentText.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcut Hint */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.6, y: 0 }}
          className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-2"
        >
          <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Ctrl+K</kbd>
          <span>{currentText.keyboardHint}</span>
        </motion.div>
      </div>
    </>
  );
};

export default StickySearchPanel;
