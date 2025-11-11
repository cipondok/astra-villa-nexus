import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface QuickFilter {
  id: string;
  label: string;
  labelId: string;
  icon: string;
  filters: {
    propertyType?: string;
    listingType?: string;
    priceRange?: string;
    bedrooms?: string;
    bathrooms?: string;
  };
}

interface QuickFiltersChipBarProps {
  language: "en" | "id";
  onFilterSelect: (filters: any) => void;
}

const QuickFiltersChipBar = ({ language, onFilterSelect }: QuickFiltersChipBarProps) => {
  const text = {
    en: {
      quickFilters: "Quick Filters",
      budgetHomes: "Budget Homes",
      luxuryVillas: "Luxury Villas",
      studios: "Studios",
      familyHomes: "Family Homes",
      penthouses: "Penthouses",
      commercialSpaces: "Commercial",
    },
    id: {
      quickFilters: "Filter Cepat",
      budgetHomes: "Rumah Hemat",
      luxuryVillas: "Villa Mewah",
      studios: "Studio",
      familyHomes: "Rumah Keluarga",
      penthouses: "Penthouse",
      commercialSpaces: "Komersial",
    },
  };

  const currentText = text[language];

  const quickFilters: QuickFilter[] = [
    {
      id: "budget-homes",
      label: currentText.budgetHomes,
      labelId: "budgetHomes",
      icon: "🏡",
      filters: {
        listingType: "sale",
        priceRange: "0-1000000000",
        bedrooms: "2",
      },
    },
    {
      id: "luxury-villas",
      label: currentText.luxuryVillas,
      labelId: "luxuryVillas",
      icon: "🏰",
      filters: {
        propertyType: "villa",
        listingType: "sale",
        priceRange: "5000000000-10000000000",
        bedrooms: "4",
      },
    },
    {
      id: "studios",
      label: currentText.studios,
      labelId: "studios",
      icon: "🏢",
      filters: {
        propertyType: "apartment",
        listingType: "rent",
        bedrooms: "1",
        bathrooms: "1",
      },
    },
    {
      id: "family-homes",
      label: currentText.familyHomes,
      labelId: "familyHomes",
      icon: "🏠",
      filters: {
        propertyType: "house",
        listingType: "sale",
        bedrooms: "3",
        bathrooms: "2",
      },
    },
    {
      id: "penthouses",
      label: currentText.penthouses,
      labelId: "penthouses",
      icon: "✨",
      filters: {
        propertyType: "apartment",
        listingType: "sale",
        priceRange: "3000000000-10000000000",
        bedrooms: "3",
      },
    },
    {
      id: "commercial",
      label: currentText.commercialSpaces,
      labelId: "commercialSpaces",
      icon: "🏬",
      filters: {
        propertyType: "commercial",
        listingType: "sale",
      },
    },
  ];

  const handleChipClick = (filter: QuickFilter) => {
    onFilterSelect(filter.filters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full py-4 sm:py-6 px-2 sm:px-4 bg-gradient-to-r from-background/95 via-background/90 to-background/95 backdrop-blur-sm border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-3 px-2">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
            {currentText.quickFilters}
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 px-2">
          {quickFilters.map((filter, index) => (
            <motion.button
              key={filter.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleChipClick(filter)}
              className="group"
            >
              <Badge
                variant="outline"
                className="min-h-[44px] sm:min-h-[36px] px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-xs font-semibold cursor-pointer
                  bg-gradient-to-r from-primary/10 to-accent/10 
                  border-2 border-primary/30 
                  hover:from-primary hover:to-primary/80 
                  hover:border-primary hover:text-primary-foreground
                  hover:shadow-lg hover:shadow-primary/20
                  transition-all duration-300 ease-out
                  active:scale-95 touch-manipulation
                  text-foreground group-hover:text-primary-foreground"
              >
                <span className="mr-1.5 text-base sm:text-sm">{filter.icon}</span>
                <span className="whitespace-nowrap">{filter.label}</span>
              </Badge>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-3 px-2"
        >
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="hidden sm:inline">💡</span>
            {language === "en" 
              ? "Tap any chip to instantly apply popular filter combinations" 
              : "Ketuk chip apa pun untuk langsung menerapkan kombinasi filter populer"}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuickFiltersChipBar;
