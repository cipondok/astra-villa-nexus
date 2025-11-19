import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Home, Bed, Bath } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import AdvancedFilters from './AdvancedFilters';

interface CollapsibleSearchPanelProps {
  language?: "en" | "id";
  onSearch?: (searchData: any) => void;
}

const CollapsibleSearchPanel = ({ language = "en", onSearch }: CollapsibleSearchPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const [filters, setFilters] = useState({
    propertyType: 'all',
    bedrooms: 'all',
    bathrooms: 'all',
  });

  const text = {
    en: {
      search: "Search properties...",
      propertyType: "Property Type",
      bedrooms: "Bedrooms",
      bathrooms: "Bathrooms",
      advancedFilters: "Advanced",
      all: "All",
      villa: "Villa",
      apartment: "Apartment",
      house: "House",
      searchBtn: "Search"
    },
    id: {
      search: "Cari properti...",
      propertyType: "Tipe Properti",
      bedrooms: "Kamar Tidur",
      bathrooms: "Kamar Mandi",
      advancedFilters: "Lanjutan",
      all: "Semua",
      villa: "Villa",
      apartment: "Apartemen",
      house: "Rumah",
      searchBtn: "Cari"
    }
  };

  const currentText = text[language];

  // Handle scroll-based minimize/expand
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      if (currentScrollY > lastScrollY) {
        // Scrolling down - minimize
        setIsMinimized(true);
      } else {
        // Scrolling up - expand
        setIsMinimized(false);
      }
    } else {
      setIsMinimized(false);
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleSearch = () => {
    onSearch?.({
      query: searchQuery,
      ...filters
    });
  };

  const propertyTypes = [
    { value: 'all', label: currentText.all },
    { value: 'villa', label: currentText.villa },
    { value: 'apartment', label: currentText.apartment },
    { value: 'house', label: currentText.house },
  ];

  return (
    <>
      {/* Main Search Panel */}
      <div
        className={cn(
          "fixed left-0 top-20 z-40 transition-all duration-500 ease-in-out",
          "backdrop-blur-xl bg-background/80 dark:bg-background/60",
          "border-r border-border/50 shadow-2xl",
          isExpanded && !isMinimized ? "w-80 md:w-96" : "w-16",
          "h-[calc(100vh-5rem)] overflow-hidden"
        )}
        style={{
          borderRadius: '0 24px 24px 0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "absolute -right-4 top-4 z-50 h-8 w-8 rounded-full",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "shadow-lg transition-transform hover:scale-110"
          )}
        >
          {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>

        {/* Expanded Content */}
        <div
          className={cn(
            "p-6 space-y-6 transition-opacity duration-300",
            isExpanded && !isMinimized ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* Search Input */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={currentText.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Property Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{currentText.propertyType}</label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <Badge
                  key={type.value}
                  variant={filters.propertyType === type.value ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setFilters({ ...filters, propertyType: type.value })}
                >
                  <Home className="h-3 w-3 mr-1" />
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bedrooms Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{currentText.bedrooms}</label>
            <div className="flex flex-wrap gap-2">
              {['all', '1', '2', '3', '4', '5'].map((num) => (
                <Badge
                  key={num}
                  variant={filters.bedrooms === num ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setFilters({ ...filters, bedrooms: num })}
                >
                  <Bed className="h-3 w-3 mr-1" />
                  {num === 'all' ? currentText.all : `${num}+`}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bathrooms Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{currentText.bathrooms}</label>
            <div className="flex flex-wrap gap-2">
              {['all', '1', '2', '3', '4'].map((num) => (
                <Badge
                  key={num}
                  variant={filters.bathrooms === num ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setFilters({ ...filters, bathrooms: num })}
                >
                  <Bath className="h-3 w-3 mr-1" />
                  {num === 'all' ? currentText.all : `${num}+`}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t">
            <Button 
              onClick={handleSearch}
              className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Search className="h-4 w-4 mr-2" />
              {currentText.searchBtn}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowAdvanced(true)}
              className="w-full"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {currentText.advancedFilters}
            </Button>
          </div>
        </div>

        {/* Minimized Icon Bar */}
        <div
          className={cn(
            "flex flex-col items-center justify-start gap-4 p-4 transition-opacity duration-300",
            !isExpanded || isMinimized ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-primary/10"
            onClick={() => setIsExpanded(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-primary/10"
            onClick={() => setShowAdvanced(true)}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters Dialog */}
      <AdvancedFilters
        language={language}
        open={showAdvanced}
        onOpenChange={setShowAdvanced}
        onFiltersChange={setFilters}
        onSearch={(data) => {
          setFilters(data);
          onSearch?.(data);
        }}
      />

      {/* Mobile Compact Bar (shows when minimized on mobile) */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 md:hidden transition-transform duration-300",
          "backdrop-blur-xl bg-background/80 border-t border-border/50",
          "p-3 shadow-2xl",
          isMinimized ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          borderRadius: '24px 24px 0 0',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={currentText.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background/50 backdrop-blur-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            size="icon"
            onClick={() => setShowAdvanced(true)}
            className="h-10 w-10 shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default CollapsibleSearchPanel;
