import { useNavigate } from "react-router-dom";
import { Home, Building2, Building, Warehouse, TreePine, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryChipsProps {
  language?: 'en' | 'id';
}

const CategoryChips = ({ language = 'id' }: CategoryChipsProps) => {
  const navigate = useNavigate();

  const categories = [
    { 
      icon: Home, 
      label: language === 'id' ? 'Rumah' : 'House', 
      value: 'house',
      color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
    },
    { 
      icon: Building2, 
      label: 'Apartemen', 
      value: 'apartment',
      color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20'
    },
    { 
      icon: Building, 
      label: 'Ruko', 
      value: 'commercial',
      color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20'
    },
    { 
      icon: Warehouse, 
      label: language === 'id' ? 'Gudang' : 'Warehouse', 
      value: 'warehouse',
      color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
    },
    { 
      icon: TreePine, 
      label: 'Tanah', 
      value: 'land',
      color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
    },
    { 
      icon: MoreHorizontal, 
      label: language === 'id' ? 'Lainnya' : 'Others', 
      value: 'all',
      color: 'bg-muted text-muted-foreground hover:bg-muted/80'
    },
  ];

  const handleCategoryClick = (value: string) => {
    if (value === 'all') {
      navigate('/search');
    } else {
      navigate(`/search?propertyType=${value}`);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.value}
              onClick={() => handleCategoryClick(category.value)}
              className={cn(
                "flex flex-col items-center gap-1 sm:gap-1.5",
                "w-14 sm:w-16 md:w-20 py-2 sm:py-2.5 md:py-3",
                "rounded-xl border border-border/50",
                "bg-card/80 backdrop-blur-sm",
                "transition-all duration-200",
                "hover:scale-105 hover:shadow-md hover:border-primary/30",
                "active:scale-95",
                "group"
              )}
            >
              <div className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center",
                "transition-colors duration-200",
                category.color
              )}>
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-foreground/80 group-hover:text-foreground text-center leading-tight">
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;
