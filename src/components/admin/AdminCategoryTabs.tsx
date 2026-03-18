import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { navigationSections, sectionTitles, categories } from './navigationSections';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Wrench, 
  Settings, 
  Cpu,
  Coins,
  Headphones,
  ShoppingBag,
  BarChart3,
  FileText,
  HelpCircle,
  DollarSign,
  ChevronDown,
  ChevronUp,
  type LucideIcon 
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

// Unified panel theme — all categories use the same sleek Astra Villa style
const categoryAccent: Record<string, string> = {
  overview: "--panel-accent",
  transactions: "--panel-success",
  "astra-token": "--panel-accent",
  tools: "--panel-text-secondary",
  "core-management": "--panel-success",
  "customer-service": "--panel-accent",
  "vendor-management": "--panel-success",
  "analytics-monitoring": "--panel-info",
  "content-settings": "--panel-accent",
  "system-settings": "--panel-text-secondary",
  technical: "--panel-danger",
  features: "--panel-accent",
  help: "--panel-text-secondary",
};

const VISIBLE_COUNT = Infinity;
const STORAGE_KEY = 'admin-tab-visit-history';

function getVisitHistory(): Record<string, number> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
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
  onSectionChange: (section: string) => void;
}

export function AdminCategoryTabs({ activeSection, onSectionChange }: AdminCategoryTabsProps) {
  const [visitHistory, setVisitHistory] = useState<Record<string, number>>(getVisitHistory);

  useEffect(() => {
    if (activeSection) {
      recordVisit(activeSection);
      setVisitHistory(getVisitHistory());
    }
  }, [activeSection]);

  const activeCategory = useMemo((): string | null => {
    for (const category of categories) {
      const sections = navigationSections[category as keyof typeof navigationSections];
      if (sections?.some((section) => section.key === activeSection)) {
        return category;
      }
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
      const aTime = visitHistory[a.key] || 0;
      const bTime = visitHistory[b.key] || 0;
      return bTime - aTime;
    });
  }, [categorySections, activeSection, visitHistory]);

  const handleSectionClick = useCallback((key: string) => {
    onSectionChange(key);
  }, [onSectionChange]);

  if (!activeCategory || activeSection === 'overview') {
    return null;
  }

  const CategoryIcon = categoryIcons[activeCategory] || LayoutDashboard;
  const accentVar = categoryAccent[activeCategory] || "--panel-accent";
  const categoryTitle = sectionTitles[activeCategory as keyof typeof sectionTitles] || activeCategory;

  const visibleSections = sortedSections;

  const renderTab = (section: typeof categorySections[0], isActive: boolean) => {
    const Icon = section.icon;
    return (
      <button
        key={section.key}
        onClick={() => handleSectionClick(section.key)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all duration-150 whitespace-nowrap border",
          isActive
            ? "bg-[hsl(var(--panel-accent)/.08)] text-[hsl(var(--panel-accent))] border-[hsl(var(--panel-accent)/.25)] shadow-[0_0_8px_hsl(var(--panel-glow-accent)/.08)]"
            : "text-[hsl(var(--panel-text-secondary))] hover:text-[hsl(var(--panel-text))] hover:bg-[hsl(var(--panel-hover))] hover:border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border-subtle))]"
        )}
      >
        <Icon className="h-3 w-3 shrink-0" />
        <span className="max-w-[100px] truncate">{section.label}</span>
        {'badge' in section && section.badge && (
          <span
            className={cn(
              "text-[7px] px-1 py-0 h-3 leading-[12px] rounded font-semibold inline-block",
              isActive
                ? "bg-[hsl(var(--panel-accent)/.15)] text-[hsl(var(--panel-accent))]"
                : String(section.badge) === 'New'
                  ? "bg-[hsl(var(--panel-success)/.1)] text-[hsl(var(--panel-success))]"
                  : "bg-[hsl(var(--panel-accent)/.08)] text-[hsl(var(--panel-accent-dim))]"
            )}
          >
            {String(section.badge)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="mb-2 sticky top-0 z-40 animate-in fade-in slide-in-from-top-1 duration-200">
      <div
        className="bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] rounded-lg overflow-hidden"
        style={{ boxShadow: 'var(--panel-shadow)' }}
      >
        {/* Mini Header */}
        <div
          className="px-3 py-1.5 flex items-center gap-2 border-b border-[hsl(var(--panel-border))]"
          style={{ background: `hsl(var(${accentVar}) / 0.05)` }}
        >
          <div className="flex items-center justify-center w-5 h-5 rounded bg-[hsl(var(--panel-accent)/.1)] border border-[hsl(var(--panel-accent)/.15)]">
            <CategoryIcon className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          </div>
          <span className="text-[11px] font-bold tracking-wide uppercase text-[hsl(var(--panel-text))]">{categoryTitle}</span>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-[hsl(var(--panel-success))] animate-pulse" />
            <span className="text-[8px] px-1.5 py-0 h-3.5 leading-[14px] rounded bg-[hsl(var(--panel-border)/.4)] text-[hsl(var(--panel-text-muted))] font-mono">
              {categorySections.length}
            </span>
          </div>
        </div>

        {/* Mobile: horizontal scroll */}
        <ScrollArea className="w-full md:hidden">
          <div className="flex items-center gap-1 p-1.5">
            {visibleSections.map((section) =>
              renderTab(section, section.key === activeSection)
            )}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>

        {/* Desktop: all tabs wrapped */}
        <div className="hidden md:block p-1.5">
          <div className="flex flex-wrap items-center gap-1">
            {visibleSections.map((section) =>
              renderTab(section, section.key === activeSection)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCategoryTabs;
