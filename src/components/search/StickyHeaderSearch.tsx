import { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface StickyHeaderSearchProps {
  onSearch: (query: string) => void;
  onOpenFilters?: () => void;
  initialQuery?: string;
  className?: string;
}

export function StickyHeaderSearch({ 
  onSearch, 
  onOpenFilters,
  initialQuery = '',
  className 
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

  // Show sticky search after scrolling past the hero section
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const shouldShow = window.scrollY > 400;
          setIsVisible(shouldShow);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
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
            "bg-background border-b border-border/30",
            className
          )}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1">
            <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
              {/* Mobile: Compact search bar */}
              <div className="md:hidden flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      ref={inputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.placeholder}
                      className="pl-8 pr-7 h-8 text-xs bg-muted/40 border-border/40 rounded-lg focus:bg-background"
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="absolute right-0.5 top-1/2 -translate-y-1/2 h-5 w-5 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0 rounded-lg bg-primary hover:bg-primary/90"
                  >
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                  {onOpenFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onOpenFilters}
                      className="h-8 w-8 p-0 shrink-0 border-border/40 rounded-lg"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Desktop: Compact search bar */}
              <div className="hidden md:flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.placeholder}
                    className="pl-9 pr-9 h-9 bg-muted/30 border-border/40 rounded-lg focus:bg-background transition-colors"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-3 rounded-lg bg-primary hover:bg-primary/90"
                >
                  <Search className="h-4 w-4 mr-1.5" />
                  {t.search}
                </Button>
                {onOpenFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenFilters}
                    className="h-9 px-2.5 rounded-lg border-border/40"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StickyHeaderSearch;
