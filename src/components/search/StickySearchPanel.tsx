import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, SlidersHorizontal, Save, Clock, X, Mic, Download, BarChart3, FileText, FileJson, FileSpreadsheet } from 'lucide-react';
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
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const scrollRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

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

  // Voice Recognition Setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language === 'id' ? 'id-ID' : 'en-US';

      let silenceTimer: NodeJS.Timeout;
      recognition.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setSearchQuery(transcript);
        
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (transcript.trim()) {
            handleQuickSearch();
            recognition.stop();
          }
        }, 1500);
      };

      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: "Voice Error",
          description: "Voice recognition failed. Please try again.",
          variant: "destructive"
        });
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

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
        setShowExportMenu(false);
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

      // Close export menu when clicking outside
      if (
        showExportMenu &&
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFiltersExpanded, showAutocomplete, showExportMenu]);

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

  // Voice Search Toggle
  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice search is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak your search query"
        });
      } catch (error) {
        toast({
          title: "Voice Error",
          description: "Could not start voice recognition",
          variant: "destructive"
        });
      }
    }
  };

  // Export Functions
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Query', 'Filters', 'Date'];
    const rows = savedSearches.map(s => [
      s.name,
      s.query,
      JSON.stringify(s.filters),
      new Date(s.timestamp).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csv, `saved-searches-${date}.csv`, 'text/csv');
    
    toast({
      title: "Exported",
      description: "Saved searches exported as CSV"
    });
    setShowExportMenu(false);
  };

  const exportJSON = () => {
    const data = JSON.stringify(savedSearches, null, 2);
    downloadFile(data, 'saved-searches.json', 'application/json');
    
    toast({
      title: "Exported",
      description: "Saved searches exported as JSON"
    });
    setShowExportMenu(false);
  };

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text('Saved Property Searches', 14, 15);
      
      (doc as any).autoTable({
        startY: 25,
        head: [['Name', 'Query', 'Date']],
        body: savedSearches.map(s => [
          s.name, 
          s.query, 
          new Date(s.timestamp).toLocaleDateString()
        ]),
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      doc.save('saved-searches.pdf');
      
      toast({
        title: "Exported",
        description: "Saved searches exported as PDF"
      });
      setShowExportMenu(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export PDF",
        variant: "destructive"
      });
    }
  };

  // Analytics Calculations
  const getAnalytics = () => {
    const totalSearches = recentSearches.length + savedSearches.length;
    
    // Top locations from queries
    const locationCounts: Record<string, number> = {};
    [...recentSearches, ...savedSearches].forEach(s => {
      const query = 'query' in s ? s.query : '';
      const words = query.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 3) {
          locationCounts[word] = (locationCounts[word] || 0) + 1;
        }
      });
    });
    
    const topLocations = Object.entries(locationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));

    // Filter usage
    const filterCounts: Record<string, number> = {};
    savedSearches.forEach(s => {
      Object.keys(s.filters || {}).forEach(key => {
        if (s.filters[key] && s.filters[key] !== 'all') {
          filterCounts[key] = (filterCounts[key] || 0) + 1;
        }
      });
    });

    const topFilters = Object.entries(filterCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([filter, count]) => ({ filter, count }));

    // Time trend (last 7 days)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const timeTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now - (6 - i) * dayMs);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = [...recentSearches, ...savedSearches].filter(s => {
        const searchDate = new Date(s.timestamp);
        return searchDate.toDateString() === date.toDateString();
      }).length;
      return { date: dateStr, searches: count };
    });

    return {
      totalSearches,
      topLocations,
      topFilters,
      timeTrend,
      savedCount: savedSearches.length,
      recentCount: recentSearches.length
    };
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
      keyboardHint: "Press Ctrl+K to search",
      analytics: "Analytics",
      export: "Export",
      voiceSearch: "Voice Search",
      listening: "Listening..."
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
      keyboardHint: "Tekan Ctrl+K untuk mencari",
      analytics: "Analitik",
      export: "Ekspor",
      voiceSearch: "Pencarian Suara",
      listening: "Mendengarkan..."
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
                 {/* Search Input with Autocomplete and Voice */}
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
                     className="pl-10 pr-10 h-10 bg-background"
                   />
                   <Button
                     variant="ghost"
                     size="icon"
                     onClick={toggleVoice}
                     className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 z-10 ${isListening ? 'text-destructive animate-pulse' : ''}`}
                     title={currentText.voiceSearch}
                   >
                     <Mic className="h-4 w-4" />
                   </Button>

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

                 {/* Analytics Button */}
                 <Button
                   variant="outline"
                   size="default"
                   onClick={() => setShowAnalytics(true)}
                   className="h-10 px-3 sm:px-4 whitespace-nowrap"
                   title={currentText.analytics}
                 >
                   <BarChart3 className="h-4 w-4" />
                 </Button>

                 {/* Export Menu */}
                 <div className="relative" ref={exportMenuRef}>
                   <Button
                     variant="outline"
                     size="default"
                     onClick={() => setShowExportMenu(!showExportMenu)}
                     className="h-10 px-3 sm:px-4 whitespace-nowrap"
                     title={currentText.export}
                   >
                     <Download className="h-4 w-4" />
                   </Button>
                   
                   <AnimatePresence>
                     {showExportMenu && (
                       <motion.div
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -10 }}
                         transition={{ duration: 0.2 }}
                         className="absolute top-full right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 w-40"
                       >
                         <button
                           onClick={exportCSV}
                           className="w-full flex items-center gap-2 px-4 py-2 hover:bg-accent transition-colors text-sm"
                         >
                           <FileSpreadsheet className="h-4 w-4" />
                           Export CSV
                         </button>
                         <button
                           onClick={exportJSON}
                           className="w-full flex items-center gap-2 px-4 py-2 hover:bg-accent transition-colors text-sm"
                         >
                           <FileJson className="h-4 w-4" />
                           Export JSON
                         </button>
                         <button
                           onClick={exportPDF}
                           className="w-full flex items-center gap-2 px-4 py-2 hover:bg-accent transition-colors text-sm rounded-b-lg"
                         >
                           <FileText className="h-4 w-4" />
                           Export PDF
                         </button>
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

      {/* Analytics Dashboard Modal */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {currentText.analytics}
            </DialogTitle>
            <DialogDescription>
              Your search activity and insights
            </DialogDescription>
          </DialogHeader>

          {(() => {
            const analytics = getAnalytics();
            const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } = require('recharts');
            const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

            return (
              <div className="space-y-6 py-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Searches</p>
                    <p className="text-2xl font-bold">{analytics.totalSearches}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Saved</p>
                    <p className="text-2xl font-bold">{analytics.savedCount}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Recent</p>
                    <p className="text-2xl font-bold">{analytics.recentCount}</p>
                  </div>
                </div>

                {/* Time Trend Chart */}
                {analytics.timeTrend.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Search Activity (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={analytics.timeTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey="searches" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Top Locations */}
                {analytics.topLocations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Most Searched Terms</h3>
                    <div className="space-y-2">
                      {analytics.topLocations.map((loc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm capitalize">{loc.location}</span>
                          <Badge variant="secondary">{loc.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Filters */}
                {analytics.topFilters.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3">Most Used Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {analytics.topFilters.map((filter, idx) => (
                        <Badge key={idx} variant="outline" className="capitalize">
                          {filter.filter}: {filter.count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
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

      {/* Voice Listening Indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 right-4 z-50 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Mic className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">{currentText.listening}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StickySearchPanel;
