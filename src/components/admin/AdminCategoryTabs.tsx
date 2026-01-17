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
      {/* Compact Combined Header + Tabs */}
      <div className="bg-background/80 backdrop-blur-sm border border-border/40 rounded-lg overflow-hidden">
        {/* Mini Header */}
        <div className={cn("px-2.5 py-1.5 flex items-center gap-2", theme.header)}>
          <CategoryIcon className="h-3 w-3" />
          <span className="text-[10px] font-semibold">{categoryTitle}</span>
          <span className="text-[9px] opacity-70">({categorySections.length})</span>
        </div>

        {/* Compact Tabs */}
        <ScrollArea className="w-full">
          <div className="flex items-center gap-0.5 p-1 bg-muted/20">
            {categorySections.map((section) => {
              const Icon = section.icon;
              const isActive = section.key === activeSection;
              
              return (
                <button
                  key={section.key}
                  onClick={() => onSectionChange(section.key)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all duration-150 whitespace-nowrap shrink-0",
                    isActive
                      ? cn("shadow-sm", theme.active)
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "h-2.5 w-2.5",
                    isActive ? "text-white" : "text-current"
                  )} />
                  <span className="max-w-[80px] truncate">{section.label}</span>
                  {'badge' in section && section.badge && (
                    <Badge 
                      variant="secondary"
                      className={cn(
                        "text-[7px] px-1 py-0 h-3 leading-none",
                        isActive 
                          ? "bg-white/25 text-white border-0" 
                          : String(section.badge) === 'New' 
                            ? "bg-green-500/15 text-green-600 border-0"
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
      </div>
    </div>
  );
}

export default AdminCategoryTabs;
