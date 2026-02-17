import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, SlidersHorizontal, MapPin, Glasses, Building, Camera, Layers, ShoppingBag, Key, Rocket } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyHeaderSearchProps {
  onSearch: (query: string) => void;
  onOpenFilters?: () => void;
  initialQuery?: string;
  className?: string;
  activeFiltersCount?: number;
  onTabChange?: (tab: string) => void;
  activeTab?: string;
}

export function StickyHeaderSearch({ 
  onSearch, 
  onOpenFilters,
  initialQuery = '',
  className,
  activeFiltersCount = 0,
  onTabChange,
  activeTab = 'all'
}: StickyHeaderSearchProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();

  const text = {
    en: {
      placeholder: "Search properties...",
      search: "Search"
    },
    id: {
      placeholder: "Cari properti...",
      search: "Cari"
    }
  };

  const t = text[language];

  // Sync initialQuery when it changes externally
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Show sticky search only when main search panel is scrolled out of view
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Find the hero section or main search panel
          const heroSection = document.getElementById('hero-section');
          if (heroSection) {
            const heroBottom = heroSection.getBoundingClientRect().bottom;
            // Show when the hero section (containing the main search panel) is fully scrolled past
            setIsVisible(heroBottom < 0);
          } else {
            // Fallback: show after scrolling 600px
            setIsVisible(window.scrollY > 600);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const tabs = [
    { value: 'all', icon: Layers, label: 'All' },
    { value: 'sale', icon: ShoppingBag, label: 'Buy' },
    { value: 'rent', icon: Key, label: 'Rent' },
    { value: 'new_project', icon: Rocket, label: 'New' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            "fixed top-[40px] sm:top-[44px] md:top-[48px] left-0 right-0 z-[9999]",
            "bg-background/95 dark:bg-card/95 backdrop-blur-2xl border-b border-border/50",
            "shadow-lg shadow-black/5 dark:shadow-black/20",
            className
          )}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              
              {/* Tab Pills - compact */}
              {onTabChange && (
                <div className="hidden md:flex items-center gap-0.5 bg-muted/50 rounded-lg p-0.5 border border-border/30">
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => onTabChange(tab.value)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md transition-all",
                        activeTab === tab.value
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <tab.icon className="h-3 w-3" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.placeholder}
                  className="pl-9 pr-8 h-9 text-xs md:text-sm bg-muted/30 dark:bg-muted/20 border-border/40 rounded-lg focus:bg-background transition-colors"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Search Button */}
              <Button
                type="submit"
                size="sm"
                className="h-9 px-3 rounded-lg bg-primary hover:bg-primary/90 shrink-0"
              >
                <Search className="h-3.5 w-3.5 md:mr-1.5" />
                <span className="hidden md:inline text-xs">{t.search}</span>
              </Button>

              {/* Action Buttons */}
              <div className="hidden sm:flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/location'}
                  className="h-9 w-9 p-0 rounded-lg border-border/40 relative group"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover text-popover-foreground border border-border shadow-lg px-2 py-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100000]">
                    Map
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/vr-tour'}
                  className="h-9 w-9 p-0 rounded-lg border-border/40 relative group"
                >
                  <Glasses className="h-3.5 w-3.5" />
                  <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover text-popover-foreground border border-border shadow-lg px-2 py-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-[100000]">
                    VR Tour
                  </span>
                </Button>
              </div>

              {/* Filters Button */}
              {onOpenFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onOpenFilters}
                  className="h-9 px-2.5 rounded-lg border-border/40 shrink-0 relative"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  {activeFiltersCount > 0 && (
                    <Badge className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 flex items-center justify-center text-[9px] rounded-full bg-primary text-primary-foreground">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              )}
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StickyHeaderSearch;
