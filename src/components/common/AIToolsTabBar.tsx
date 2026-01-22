import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    // tiny epsilon to avoid jitter due to fractional pixels
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 2);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  const scrollByAmount = (direction: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.max(160, Math.floor(el.clientWidth * 0.7));
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };
  
  const isActive = (path: string) => {
    const [pathBase, pathQuery] = path.split('?');
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    if (pathQuery) {
      if (currentPath === pathBase) {
        if (currentSearch.includes(pathQuery.split('=')[0])) {
          return currentSearch.includes(pathQuery);
        }
        return path === '/analytics?tab=overview' && !currentSearch.includes('tab=');
      }
      return false;
    }
    
    return currentPath === pathBase;
  };

  const activeIndex = useMemo(() => {
    const idx = tools.findIndex((t) => isActive(t.path));
    return idx >= 0 ? idx : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Keep active tab visible when navigating between pages
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const buttons = el.querySelectorAll<HTMLButtonElement>('button[data-ai-tab="true"]');
    const activeBtn = buttons[activeIndex];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    // Allow scrollIntoView to finish then re-evaluate
    const t = window.setTimeout(updateScrollState, 250);
    return () => window.clearTimeout(t);
  }, [activeIndex]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Edge fades (helps users discover horizontal scroll) */}
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent" />
      )}

      {/* Scroll buttons */}
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll tabs left"
          onClick={() => scrollByAmount('left')}
          className={cn(
            'absolute left-1 top-1/2 -translate-y-1/2 z-10',
            'h-7 w-7 rounded-full border',
            'bg-background/70 backdrop-blur-sm',
            'border-border/30 hover:border-primary/30 hover:bg-primary/5'
          )}
        >
          <ChevronLeft className="h-4 w-4 mx-auto text-foreground" strokeWidth={1.5} />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll tabs right"
          onClick={() => scrollByAmount('right')}
          className={cn(
            'absolute right-1 top-1/2 -translate-y-1/2 z-10',
            'h-7 w-7 rounded-full border',
            'bg-background/70 backdrop-blur-sm',
            'border-border/30 hover:border-primary/30 hover:bg-primary/5'
          )}
        >
          <ChevronRight className="h-4 w-4 mx-auto text-foreground" strokeWidth={1.5} />
        </button>
      )}

      <div ref={scrollerRef} className="w-full overflow-x-auto scrollbar-hide">
        <div className="flex gap-1.5 sm:gap-2 p-1.5 min-w-max">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const active = isActive(tool.path);
            
            return (
              <button
                key={tool.path}
                data-ai-tab="true"
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
    </div>
  );
};

export default AIToolsTabBar;