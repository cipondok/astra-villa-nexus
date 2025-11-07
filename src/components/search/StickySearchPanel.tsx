import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal } from 'lucide-react';
import PropertyAdvancedFilters from './PropertyAdvancedFilters';

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
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters.query || '');
  const scrollRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Handle click outside to collapse filters
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFiltersExpanded &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsFiltersExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFiltersExpanded]);

  const handleQuickSearch = () => {
    onSearch({
      query: searchQuery,
      ...initialFilters
    });
  };

  const text = {
    en: {
      search: "Search properties, location, or developer...",
      filters: "Filters",
      searchBtn: "Search"
    },
    id: {
      search: "Cari properti, lokasi, atau pengembang...",
      filters: "Filter",
      searchBtn: "Cari"
    }
  };

  const currentText = text[language];

  return (
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
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder={currentText.search}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
                    className="pl-10 h-10 bg-background"
                  />
                </div>

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
  );
};

export default StickySearchPanel;
