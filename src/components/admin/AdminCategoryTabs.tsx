import React from 'react';
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

const categoryThemes: Record<string, { header: string; active: string }> = {
  overview: { header: "bg-primary text-primary-foreground", active: "bg-primary text-primary-foreground" },
  transactions: { header: "bg-accent text-accent-foreground", active: "bg-accent text-accent-foreground" },
  "astra-token": { header: "bg-secondary text-secondary-foreground", active: "bg-secondary text-secondary-foreground" },
  tools: { header: "bg-muted text-foreground", active: "bg-primary text-primary-foreground" },
  "core-management": { header: "bg-primary text-primary-foreground", active: "bg-primary text-primary-foreground" },
  "customer-service": { header: "bg-accent text-accent-foreground", active: "bg-accent text-accent-foreground" },
  "vendor-management": { header: "bg-secondary text-secondary-foreground", active: "bg-secondary text-secondary-foreground" },
  "analytics-monitoring": { header: "bg-primary text-primary-foreground", active: "bg-primary text-primary-foreground" },
  "content-settings": { header: "bg-accent text-accent-foreground", active: "bg-accent text-accent-foreground" },
  "system-settings": { header: "bg-secondary text-secondary-foreground", active: "bg-secondary text-secondary-foreground" },
  technical: { header: "bg-destructive text-destructive-foreground", active: "bg-destructive text-destructive-foreground" },
  features: { header: "bg-primary text-primary-foreground", active: "bg-primary text-primary-foreground" },
  help: { header: "bg-muted text-foreground", active: "bg-primary text-primary-foreground" },
};

interface AdminCategoryTabsProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminCategoryTabs({ activeSection, onSectionChange }: AdminCategoryTabsProps) {
  // Find which category contains the active section
  const getActiveCategory = (): string | null => {
    for (const category of categories) {
      const sections = navigationSections[category as keyof typeof navigationSections];
      if (sections?.some((section) => section.key === activeSection)) {
        return category;
      }
    }
    return null;
  };

  const activeCategory = getActiveCategory();
  
  if (!activeCategory || activeSection === 'overview') {
    return null;
  }

  const categorySections = navigationSections[activeCategory as keyof typeof navigationSections] || [];
  const CategoryIcon = categoryIcons[activeCategory] || LayoutDashboard;
  const theme = categoryThemes[activeCategory] || categoryThemes.overview;
  const categoryTitle = sectionTitles[activeCategory as keyof typeof sectionTitles] || activeCategory;

  return (
    <div className="mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="bg-background/80 backdrop-blur-sm border border-border/40 rounded-lg overflow-hidden shadow-sm">
        {/* Mini Header */}
        <div className={cn("px-3 py-1.5 flex items-center gap-2", theme.header)}>
          <CategoryIcon className="h-3.5 w-3.5" />
          <span className="text-[11px] font-bold tracking-wide uppercase">{categoryTitle}</span>
          <Badge variant="secondary" className="text-[8px] px-1.5 py-0 h-3.5 bg-background/20 text-inherit border-0 ml-auto">
            {categorySections.length} items
          </Badge>
        </div>

        {/* Scrollable on mobile, wrap on desktop */}
        <ScrollArea className="w-full md:hidden">
          <div className="flex items-center gap-1 p-1.5">
            {categorySections.map((section) => {
              const Icon = section.icon;
              const isActive = section.key === activeSection;

              return (
                <button
                  key={section.key}
                  onClick={() => onSectionChange(section.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all duration-150 whitespace-nowrap shrink-0",
                    isActive
                      ? cn("shadow-sm ring-1 ring-primary/20", theme.active)
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground bg-muted/30"
                  )}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span>{section.label}</span>
                  {'badge' in section && section.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[7px] px-1 py-0 h-3 leading-none",
                        isActive
                          ? "bg-primary-foreground/25 text-primary-foreground border-0"
                          : String(section.badge) === 'New'
                            ? "bg-chart-1/15 text-chart-1 border-0"
                            : "bg-primary/10 text-primary border-0"
                      )}
                    >
                      {String(section.badge)}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>

        {/* Desktop: wrap to rows */}
        <div className="hidden md:flex flex-wrap items-center gap-1 p-1.5 bg-muted/10">
          {categorySections.map((section) => {
            const Icon = section.icon;
            const isActive = section.key === activeSection;

            return (
              <button
                key={section.key}
                onClick={() => onSectionChange(section.key)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-medium transition-all duration-150 whitespace-nowrap",
                  isActive
                    ? cn("shadow-sm ring-1 ring-primary/20", theme.active)
                    : "hover:bg-muted/60 text-muted-foreground hover:text-foreground bg-muted/30"
                )}
              >
                <Icon className="h-3 w-3 shrink-0" />
                <span className="max-w-[100px] truncate">{section.label}</span>
                {'badge' in section && section.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[7px] px-1 py-0 h-3 leading-none",
                      isActive
                        ? "bg-primary-foreground/25 text-primary-foreground border-0"
                        : String(section.badge) === 'New'
                          ? "bg-chart-1/15 text-chart-1 border-0"
                          : "bg-primary/10 text-primary border-0"
                    )}
                  >
                    {String(section.badge)}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminCategoryTabs;
