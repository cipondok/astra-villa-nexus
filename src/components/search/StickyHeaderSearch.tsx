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
  const [isExpanded, setIsExpanded] = useState(false);
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
          // Show after scrolling 400px (past hero section)
          const shouldShow = window.scrollY > 400;
          setIsVisible(shouldShow);
          
          // Collapse when not visible
          if (!shouldShow) {
            setIsExpanded(false);
          }
          
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
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
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
            "fixed top-[52px] sm:top-[56px] md:top-[60px] left-0 right-0 z-[9999]",
            "bg-background/95 backdrop-blur-xl border-b border-border/50",
            "shadow-lg shadow-black/10",
            className
          )}
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              {/* Mobile: Icon button that expands */}
              <div className="md:hidden flex-1">
                {isExpanded ? (
                  <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.placeholder}
                        className="pl-9 pr-8 h-9 text-sm bg-muted/50 border-border/50 rounded-xl"
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                      className="h-9 w-9 p-0 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExpand}
                      className="flex-1 justify-start h-9 px-3 text-sm text-muted-foreground bg-muted/30 border-border/50 rounded-xl"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {t.placeholder}
                    </Button>
                    {onOpenFilters && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onOpenFilters}
                        className="h-9 w-9 p-0 shrink-0 border-border/50 rounded-xl"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop: Full search bar */}
              <div className="hidden md:flex flex-1 items-center gap-2">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.placeholder}
                    className="pl-10 pr-10 h-10 bg-muted/30 border-border/50 rounded-xl focus:bg-background transition-colors"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t.search}
                </Button>
                {onOpenFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onOpenFilters}
                    className="h-10 px-3 rounded-xl border-border/50"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
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
