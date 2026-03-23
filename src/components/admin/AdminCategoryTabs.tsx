import React, { useState, useMemo, useCallback } from 'react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { navigationSections, sectionTitles, categories } from './navigationSections';
import { Input } from "@/components/ui/input";
import { 
  LayoutDashboard, Users, Building2, Wrench, Settings, Cpu,
  Coins, Headphones, ShoppingBag, BarChart3, FileText, HelpCircle,
  DollarSign, Search, ChevronDown, ChevronUp, type LucideIcon 
} from 'lucide-react';

const categoryIcons: Record<string, LucideIcon> = {
  "overview": LayoutDashboard,
  "transactions": DollarSign,
  "astra-token": Coins,
  "tools": Wrench,
  "core-management": Users,
  "customer-service": Headphones,
  "vendor-management": ShoppingBag,
  "analytics-monitoring": BarChart3,
  "content-settings": FileText,
  "system-settings": Settings,
  "technical": Cpu,
  "features": Building2,
  "help": HelpCircle,
};

const STORAGE_KEY = 'admin-tab-visit-history';
const COLLAPSED_VISIBLE = 12;

function getVisitHistory(): Record<string, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function recordVisit(sectionKey: string) {
  try {
    const history = getVisitHistory();
    history[sectionKey] = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

interface AdminCategoryTabsProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

export function AdminCategoryTabs({ activeSection, onSectionChange }: AdminCategoryTabsProps) {
  const [visitHistory, setVisitHistory] = useState<Record<string, number>>(getVisitHistory);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (activeSection) {
      recordVisit(activeSection);
      setVisitHistory(getVisitHistory());
    }
  }, [activeSection]);

  const activeCategory = useMemo((): string | null => {
    for (const category of categories) {
      const sections = navigationSections[category as keyof typeof navigationSections];
      if (sections?.some((section) => section.key === activeSection)) return category;
    }
    return null;
  }, [activeSection]);

  const categorySections = useMemo(() => 
    activeCategory ? (navigationSections[activeCategory as keyof typeof navigationSections] || []) : [],
    [activeCategory]
  );

  const sortedSections = useMemo(() => {
    return [...categorySections].sort((a, b) => {
      if (a.key === activeSection) return -1;
      if (b.key === activeSection) return 1;
      return (visitHistory[b.key] || 0) - (visitHistory[a.key] || 0);
    });
  }, [categorySections, activeSection, visitHistory]);

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sortedSections;
    const q = query.toLowerCase();
    return sortedSections.filter(s => s.label.toLowerCase().includes(q));
  }, [sortedSections, query]);

  const handleSectionClick = useCallback((key: string) => {
    onSectionChange?.(key);
  }, [onSectionChange]);

  if (!activeCategory || activeSection === 'overview') return null;

  const categoryTitle = sectionTitles[activeCategory as keyof typeof sectionTitles] || activeCategory;
  const totalCount = categorySections.length;
  const showToggle = filteredSections.length > COLLAPSED_VISIBLE && !query.trim();
  const displaySections = showToggle && !expanded ? filteredSections.slice(0, COLLAPSED_VISIBLE) : filteredSections;
  const hiddenCount = filteredSections.length - COLLAPSED_VISIBLE;

  return (
    <div className="mb-3 sticky top-14 z-30">
      <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
        {/* Header */}
        <div className="px-3 py-1.5 flex items-center gap-3 border-b border-border/30">
          <span className="text-xs font-semibold text-foreground truncate">{categoryTitle}</span>
          <span className="text-[10px] tabular-nums text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
            {totalCount}
          </span>
          {totalCount > 8 && (
            <div className="ml-auto relative max-w-[160px] w-full">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setExpanded(true); }}
                placeholder="Filter…"
                className="h-6 text-[10px] pl-6 pr-2 bg-muted/30 border-border/30"
              />
            </div>
          )}
        </div>

        {/* Chips */}
        <div className="p-1.5">
          <div className="flex flex-wrap gap-1">
            {displaySections.map((section) => {
              const isActive = section.key === activeSection;
              const Icon = section.icon;
              return (
                <button
                  key={section.key}
                  onClick={() => handleSectionClick(section.key)}
                  title={section.label}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate max-w-[100px]">{section.label}</span>
                </button>
              );
            })}
          </div>

          {showToggle && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 w-full flex items-center justify-center gap-1 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> {hiddenCount} more</>}
            </button>
          )}

          {query.trim() && filteredSections.length === 0 && (
            <div className="py-3 text-center text-[11px] text-muted-foreground">No sections match "{query}"</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCategoryTabs;
