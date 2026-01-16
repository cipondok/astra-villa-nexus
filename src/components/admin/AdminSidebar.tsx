import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { navigationSections, sectionTitles, categories } from './navigationSections';
import { 
  ChevronRight, 
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
  type LucideIcon 
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const categoryIcons: Record<string, LucideIcon> = {
  "overview": LayoutDashboard,
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

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Track which category is currently open
  const [openCategory, setOpenCategory] = useState<string | null>(() => {
    // Find category containing active section on mount
    for (const category of categories) {
      const sections = navigationSections[category as keyof typeof navigationSections];
      if (sections?.some((section) => section.key === activeSection)) {
        return category;
      }
    }
    return 'overview';
  });

  const handleNavClick = (key: string) => {
    onSectionChange(key);
    // Auto-close after selection
    setOpenCategory(null);
  };

  // Close when clicking outside sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpenCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update open category when active section changes
  useEffect(() => {
    for (const category of categories) {
      const sections = navigationSections[category as keyof typeof navigationSections];
      if (sections?.some((section) => section.key === activeSection)) {
        setOpenCategory(category);
        return;
      }
    }
  }, [activeSection]);

  return (
    <div ref={sidebarRef} className="group/sidebar h-full">
      <Sidebar className="!w-14 hover:!w-60 transition-all duration-300 ease-out border-r border-border/30 bg-gradient-to-b from-background to-muted/20 shadow-sm">
        <SidebarContent className="p-2 space-y-1">
          {categories.map((category) => {
            const sections = navigationSections[category as keyof typeof navigationSections];
            if (!sections || sections.length === 0) return null;

            const isOpen = openCategory === category;
            const CategoryIcon = categoryIcons[category] || LayoutDashboard;

            return (
              <Collapsible
                key={category}
                open={isOpen}
                onOpenChange={(open) => setOpenCategory(open ? category : null)}
                className="group/collapsible"
              >
                <SidebarGroup className="p-0">
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="group/label relative flex items-center gap-3 cursor-pointer hover:bg-accent/60 p-2 rounded-lg transition-all duration-200 hover:shadow-sm">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-foreground/80 opacity-0 group-hover/sidebar:opacity-100 transition-opacity whitespace-nowrap truncate flex-1">
                        {sectionTitles[category as keyof typeof sectionTitles]}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-0 group-hover/sidebar:opacity-100 shrink-0" />
                      {/* Category tooltip when collapsed */}
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border opacity-0 group-hover/label:opacity-100 group-hover/sidebar:!opacity-0 pointer-events-none whitespace-nowrap z-50 font-medium">
                        {sectionTitles[category as keyof typeof sectionTitles]}
                      </div>
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarGroupContent className="py-1 pl-2">
                      <SidebarMenu className="space-y-0.5">
                        {sections.map((section) => {
                          const Icon = section.icon;
                          const isActive = section.key === activeSection;

                          return (
                            <SidebarMenuItem key={section.key} className="relative group/item">
                              <SidebarMenuButton
                                onClick={() => handleNavClick(section.key)}
                                isActive={isActive}
                                className={`
                                  h-9 text-xs rounded-lg transition-all duration-200 p-2 gap-3
                                  ${isActive 
                                    ? 'bg-primary text-primary-foreground shadow-md' 
                                    : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground hover:shadow-sm'
                                  }
                                `}
                              >
                                <div className="w-7 h-7 flex items-center justify-center shrink-0 rounded-md bg-background/50">
                                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-primary/70'}`} />
                                </div>
                                <span className="font-medium truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity whitespace-nowrap flex-1">
                                  {section.label}
                                </span>
                                {section.badge && (
                                  <span className="text-[9px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-semibold opacity-0 group-hover/sidebar:opacity-100 shrink-0 shadow-sm">
                                    {section.badge}
                                  </span>
                                )}
                              </SidebarMenuButton>
                              {/* Menu item tooltip when collapsed */}
                              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border border-border opacity-0 group-hover/item:opacity-100 group-hover/sidebar:!opacity-0 pointer-events-none whitespace-nowrap z-50 font-medium">
                                {section.label}
                              </div>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
