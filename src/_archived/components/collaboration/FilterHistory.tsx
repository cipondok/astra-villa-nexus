import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Undo2, Redo2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';

interface HistoryEntry {
  id: string;
  filters: any;
  user_name: string;
  timestamp: string;
}

interface FilterHistoryProps {
  history: HistoryEntry[];
  currentIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  onRestore: (index: number) => void;
}

const FilterHistory = ({
  history,
  currentIndex,
  onUndo,
  onRedo,
  onRestore,
}: FilterHistoryProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const getFilterSummary = (filters: any) => {
    const parts: string[] = [];
    if (filters.propertyType && filters.propertyType !== 'all') {
      parts.push(filters.propertyType);
    }
    if (filters.city) {
      parts.push(filters.city);
    }
    if (filters.minPrice || filters.maxPrice) {
      parts.push(`$${filters.minPrice || 0}-${filters.maxPrice || '∞'}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'All filters cleared';
  };

  return (
    <div className="flex items-center gap-1">
      {/* Undo Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>

      {/* Redo Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      {/* History Timeline */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="ghost">
            <History className="h-4 w-4 mr-1" />
            <span className="text-xs">
              {currentIndex + 1} / {history.length}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Filter History</h4>
              <Badge variant="secondary">{history.length} changes</Badge>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {history.map((entry, index) => {
                  const isCurrent = index === currentIndex;
                  const isPast = index < currentIndex;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => {
                          onRestore(index);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          isCurrent
                            ? 'bg-primary text-primary-foreground border-primary'
                            : isPast
                            ? 'bg-muted/50 border-border/50 opacity-60'
                            : 'bg-background border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="text-xs font-medium truncate">
                                {entry.user_name}
                              </span>
                            </div>
                            <p className="text-xs opacity-90 truncate">
                              {getFilterSummary(entry.filters)}
                            </p>
                          </div>
                          <span className="text-xs opacity-70 whitespace-nowrap">
                            {formatDistanceToNow(new Date(entry.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        {isCurrent && (
                          <Badge
                            variant="secondary"
                            className="mt-2 text-xs"
                          >
                            Current
                          </Badge>
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterHistory;
