import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Users, 
  TrendingDown, 
  Calculator, 
  ArrowLeftRight,
  MessageSquare,
  MoreHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionBarProps {
  language?: 'en' | 'id';
}

const QuickActionBar = ({ language = 'id' }: QuickActionBarProps) => {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: Search, 
      label: language === 'id' ? 'Carikan Properti' : 'Find Property',
      path: '/search',
      color: 'text-blue-600'
    },
    { 
      icon: Plus, 
      label: language === 'id' ? 'Iklankan Properti' : 'List Property',
      path: '/add-property',
      color: 'text-green-600'
    },
    { 
      icon: Users, 
      label: language === 'id' ? 'Cari Agen' : 'Find Agent',
      path: '/search?view=agents',
      color: 'text-purple-600'
    },
    { 
      icon: TrendingDown, 
      label: language === 'id' ? 'Properti Turun Harga' : 'Price Drop',
      path: '/search?sort=price-drop',
      color: 'text-red-600'
    },
    { 
      icon: Calculator, 
      label: language === 'id' ? 'Kalkulator KPR' : 'KPR Calculator',
      path: '/ai-tools',
      color: 'text-amber-600'
    },
    { 
      icon: ArrowLeftRight, 
      label: language === 'id' ? 'Pindah KPR' : 'Transfer KPR',
      path: '/ai-tools',
      color: 'text-teal-600'
    },
    { 
      icon: MessageSquare, 
      label: language === 'id' ? 'Tanya Forum' : 'Ask Forum',
      path: '/community',
      color: 'text-indigo-600'
    },
    { 
      icon: MoreHorizontal, 
      label: language === 'id' ? 'Lainnya' : 'More',
      path: '/ai-tools',
      color: 'text-muted-foreground'
    },
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 px-1 py-2 min-w-max mx-auto justify-center">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path + action.label}
              onClick={() => navigate(action.path)}
              className={cn(
                "flex flex-col items-center gap-1 sm:gap-1.5",
                "w-[52px] sm:w-16 md:w-20 py-1.5 sm:py-2",
                "rounded-lg",
                "transition-all duration-200",
                "hover:bg-muted/50",
                "active:scale-95",
                "group"
              )}
            >
              <div className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12",
                "rounded-xl flex items-center justify-center",
                "bg-card border border-border/40 shadow-sm",
                "group-hover:shadow-md group-hover:border-primary/30",
                "transition-all duration-200"
              )}>
                <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5", action.color)} />
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-foreground/70 text-center leading-tight line-clamp-2 px-0.5">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionBar;
