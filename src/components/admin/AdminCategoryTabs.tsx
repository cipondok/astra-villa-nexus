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

const categoryColors: Record<string, string> = {
  "overview": "from-blue-500 to-cyan-500",
  "transactions": "from-green-500 to-emerald-500",
  "astra-token": "from-yellow-500 to-orange-500",
  "tools": "from-slate-500 to-zinc-500",
  "core-management": "from-violet-500 to-purple-500",
  "customer-service": "from-pink-500 to-rose-500",
  "vendor-management": "from-orange-500 to-amber-500",
  "analytics-monitoring": "from-indigo-500 to-blue-500",
  "content-settings": "from-teal-500 to-cyan-500",
  "system-settings": "from-gray-500 to-slate-500",
  "technical": "from-red-500 to-rose-500",
  "features": "from-emerald-500 to-green-500",
  "help": "from-sky-500 to-blue-500",
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
  const categoryColor = categoryColors[activeCategory] || "from-gray-500 to-slate-500";
  const categoryTitle = sectionTitles[activeCategory as keyof typeof sectionTitles] || activeCategory;

  return (
    <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Category Header */}
      <div className={`bg-gradient-to-r ${categoryColor} rounded-t-lg px-4 py-2.5 flex items-center gap-3`}>
        <div className="p-1.5 bg-white/20 rounded-lg">
          <CategoryIcon className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-white">{categoryTitle}</h2>
          <p className="text-[10px] text-white/70">{categorySections.length} sections available</p>
        </div>
        <Badge className="bg-white/20 text-white border-0 text-[10px]">
          {categorySections.filter(s => s.key === activeSection).length > 0 ? 'Active' : ''}
        </Badge>
      </div>

      {/* Tabs Container */}
      <div className="bg-muted/30 border border-t-0 border-border/40 rounded-b-lg">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-1 p-1.5">
            {categorySections.map((section) => {
              const Icon = section.icon;
              const isActive = section.key === activeSection;
              
              return (
                <button
                  key={section.key}
                  onClick={() => onSectionChange(section.key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0",
                    isActive
                      ? `bg-gradient-to-r ${categoryColor} text-white shadow-md`
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn(
                    "h-3.5 w-3.5",
                    isActive ? "text-white" : "text-current"
                  )} />
                  <span>{section.label}</span>
                  {'badge' in section && section.badge && (
                    <Badge 
                      variant={isActive ? "secondary" : "outline"}
                      className={cn(
                        "text-[9px] px-1.5 py-0 h-4",
                        isActive 
                          ? "bg-white/20 text-white border-0" 
                          : String(section.badge) === 'New' 
                            ? "bg-green-500/10 text-green-600 border-green-500/30"
                            : String(section.badge) === 'Coming Soon'
                              ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                              : "bg-primary/10 text-primary border-primary/30"
                      )}
                    >
                      {String(section.badge)}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </div>
    </div>
  );
}

export default AdminCategoryTabs;
