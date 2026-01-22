import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Calculator, 
  Landmark, 
  Map, 
  MapPin, 
  TrendingUp, 
  Ruler, 
  BarChart3,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolItem {
  icon: LucideIcon;
  label: string;
  shortLabel: string;
  path: string;
  color: string;
  iconBg: string;
}

const tools: ToolItem[] = [
  {
    icon: Building2,
    label: 'New Projects',
    shortLabel: 'Projects',
    path: '/new-projects',
    color: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50'
  },
  {
    icon: Calculator,
    label: 'Construction Cost',
    shortLabel: 'Build Cost',
    path: '/calculators/construction',
    color: 'text-cyan-600 dark:text-cyan-400',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/50'
  },
  {
    icon: Landmark,
    label: 'Home Loan',
    shortLabel: 'KPR',
    path: '/calculators/loan',
    color: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50'
  },
  {
    icon: Map,
    label: 'Area Guides',
    shortLabel: 'Areas',
    path: '/areas',
    color: 'text-pink-600 dark:text-pink-400',
    iconBg: 'bg-pink-100 dark:bg-pink-900/50'
  },
  {
    icon: MapPin,
    label: 'Plot Finder',
    shortLabel: 'Plots',
    path: '/search?property_type=land',
    color: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-teal-100 dark:bg-teal-900/50'
  },
  {
    icon: TrendingUp,
    label: 'Property Index',
    shortLabel: 'Index',
    path: '/analytics?tab=overview',
    color: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50'
  },
  {
    icon: Ruler,
    label: 'Area Converter',
    shortLabel: 'Convert',
    path: '/calculators/area',
    color: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50'
  },
  {
    icon: BarChart3,
    label: 'Property Trends',
    shortLabel: 'Trends',
    path: '/analytics?tab=trends',
    color: 'text-violet-600 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/50'
  }
];

interface AIToolsTabBarProps {
  className?: string;
}

const AIToolsTabBar: React.FC<AIToolsTabBarProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    const [pathBase, pathQuery] = path.split('?');
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    // Exact match for paths with query params
    if (pathQuery) {
      // Check if base path matches and query contains the param
      if (currentPath === pathBase) {
        if (currentSearch.includes(pathQuery.split('=')[0])) {
          return currentSearch.includes(pathQuery);
        }
        // If on analytics page without specific tab, highlight first analytics tab
        return path === '/analytics?tab=overview' && !currentSearch.includes('tab=');
      }
      return false;
    }
    
    return currentPath === pathBase;
  };

  return (
    <div className={cn('w-full overflow-x-auto scrollbar-hide', className)}>
      <div className="flex gap-1.5 sm:gap-2 p-1.5 min-w-max">
        {tools.map((tool) => {
          const IconComponent = tool.icon;
          const active = isActive(tool.path);
          
          return (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200',
                'border whitespace-nowrap',
                active 
                  ? 'bg-primary/10 border-primary/40 text-primary shadow-sm' 
                  : 'bg-transparent dark:bg-white/5 border-border/20 dark:border-white/10 hover:border-primary/30 hover:bg-primary/5'
              )}
            >
              <div className={cn(
                'w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-md',
                active ? 'bg-primary/20' : tool.iconBg
              )}>
                <IconComponent 
                  className={cn(
                    'w-3.5 h-3.5 sm:w-4 sm:h-4',
                    active ? 'text-primary' : tool.color
                  )} 
                  strokeWidth={1.5} 
                />
              </div>
              <span className={cn(
                'text-[10px] sm:text-xs font-medium',
                active ? 'text-primary' : 'text-foreground'
              )}>
                <span className="hidden sm:inline">{tool.label}</span>
                <span className="sm:hidden">{tool.shortLabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AIToolsTabBar;