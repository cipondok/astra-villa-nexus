import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecentSearch {
  id: string;
  thumbnail: string;
  timestamp: number;
}

interface RecentImageSearchesProps {
  onRerunSearch: (thumbnail: string) => void;
  className?: string;
}

const MAX_RECENT_SEARCHES = 3;
const STORAGE_KEY = 'recentImageSearches';

export const RecentImageSearches = ({ onRerunSearch, className }: RecentImageSearchesProps) => {
  const getRecentSearches = (): RecentSearch[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const removeSearch = (id: string) => {
    const searches = getRecentSearches();
    const updated = searches.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('recentSearchesUpdated'));
  };

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('recentSearchesUpdated'));
  };

  const recentSearches = getRecentSearches();

  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">Recent Image Searches</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-6 px-2 text-xs hover:text-destructive"
        >
          Clear all
        </Button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {recentSearches.map((search) => (
          <div
            key={search.id}
            className="relative group flex-shrink-0"
          >
            <button
              onClick={() => onRerunSearch(search.thumbnail)}
              className="relative h-16 w-16 rounded-lg overflow-hidden border-2 border-border hover:border-purple-500 transition-all shadow-sm hover:shadow-md"
              title="Click to rerun this search"
            >
              <img
                src={search.thumbnail}
                alt="Recent search"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <RotateCcw className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeSearch(search.id);
              }}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const addRecentSearch = (thumbnail: string) => {
  try {
    const searches = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as RecentSearch[];
    
    // Don't add duplicates
    const isDuplicate = searches.some(s => s.thumbnail === thumbnail);
    if (isDuplicate) return;
    
    const newSearch: RecentSearch = {
      id: `search-${Date.now()}`,
      thumbnail,
      timestamp: Date.now()
    };
    
    // Add to beginning and limit to MAX_RECENT_SEARCHES
    const updated = [newSearch, ...searches].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('recentSearchesUpdated'));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
};
