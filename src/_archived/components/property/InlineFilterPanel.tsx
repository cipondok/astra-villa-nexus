import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export interface InlineFilters {
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
}

interface InlineFilterPanelProps {
  filters: InlineFilters;
  onFiltersChange: (updates: Partial<InlineFilters>) => void;
  propertyTypes: string[];
  maxPriceLimit?: number;
  priceStep?: number;
  isOpen: boolean;
  onToggle: () => void;
}

const BEDROOM_OPTIONS = ["all", "1", "2", "3", "4", "5+"];
const BATHROOM_OPTIONS = ["all", "1", "2", "3", "4+"];

const InlineFilterPanel = ({
  filters,
  onFiltersChange,
  propertyTypes,
  maxPriceLimit = 10_000_000_000,
  priceStep = 100_000_000,
  isOpen,
  onToggle,
}: InlineFilterPanelProps) => {
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.propertyType && filters.propertyType !== "all") count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < maxPriceLimit) count++;
    if (filters.bedrooms && filters.bedrooms !== "all") count++;
    if (filters.bathrooms && filters.bathrooms !== "all") count++;
    return count;
  }, [filters, maxPriceLimit]);

  const clearAll = () => {
    onFiltersChange({
      propertyType: "all",
      minPrice: 0,
      maxPrice: maxPriceLimit,
      bedrooms: "all",
      bathrooms: "all",
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div className="flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button
            size="sm"
            variant={isOpen ? "default" : "outline"}
            className="h-9 px-4 text-sm font-medium rounded-md"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filter
            {activeCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                {activeCount}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={clearAll}>
            <X className="h-3 w-3 mr-1" /> Hapus filter
          </Button>
        )}
      </div>

      <CollapsibleContent>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-3 p-4 rounded-lg border border-border bg-card space-y-5"
            >
              {/* Property Type Pills */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Tipe Properti</p>
                <div className="flex flex-wrap gap-2">
                  {["all", ...propertyTypes].map((type) => {
                    const selected = filters.propertyType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onFiltersChange({ propertyType: type })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 capitalize
                          ${selected
                            ? "bg-primary border-primary text-primary-foreground shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/50"
                          }`}
                      >
                        {type === "all" ? "Semua" : type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Rentang Harga</p>
                <Slider
                  min={0}
                  max={maxPriceLimit}
                  step={priceStep}
                  value={[filters.minPrice, filters.maxPrice]}
                  onValueChange={([min, max]) => onFiltersChange({ minPrice: min, maxPrice: max })}
                  className="my-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(filters.minPrice)}</span>
                  <span>{formatCurrency(filters.maxPrice)}</span>
                </div>
              </div>

              {/* Bedrooms & Bathrooms - side by side on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bedrooms */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Kamar Tidur</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BEDROOM_OPTIONS.map((opt) => {
                      const selected = filters.bedrooms === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onFiltersChange({ bedrooms: opt })}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                            ${selected
                              ? "bg-primary border-primary text-primary-foreground shadow-sm"
                              : "bg-background border-border text-foreground hover:border-primary/50"
                            }`}
                        >
                          {opt === "all" ? "Semua" : opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bathrooms */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Kamar Mandi</p>
                  <div className="flex flex-wrap gap-1.5">
                    {BATHROOM_OPTIONS.map((opt) => {
                      const selected = filters.bathrooms === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onFiltersChange({ bathrooms: opt })}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                            ${selected
                              ? "bg-primary border-primary text-primary-foreground shadow-sm"
                              : "bg-background border-border text-foreground hover:border-primary/50"
                            }`}
                        >
                          {opt === "all" ? "Semua" : opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default InlineFilterPanel;
