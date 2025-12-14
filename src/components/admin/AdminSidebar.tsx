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
  type LucideIcon 
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const categoryIcons: Record<string, LucideIcon> = {
  "overview": LayoutDashboard,
  "core-management": LayoutDashboard,
  "user-management": Users,
  "property-management": Building2,
  "vendor-services": Wrench,
  "technical": Cpu,
  "settings": Settings,
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
    <div ref={sidebarRef} className="group/sidebar">
      <Sidebar className="w-14 hover:w-60 transition-all duration-500 ease-out border-r border-primary/10 bg-gradient-to-b from-background via-background to-primary/5 backdrop-blur-xl shadow-xl shadow-primary/5">
        <SidebarContent className="px-1 py-3 space-y-1">
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
                <SidebarGroup className="py-0">
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="group/label flex items-center justify-center group-hover/sidebar:justify-start gap-3 cursor-pointer hover:bg-primary/10 rounded-xl mx-1 px-2 py-2.5 transition-all duration-300">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 group-hover/label:from-primary/30 group-hover/label:to-primary/10 transition-all duration-300 shadow-sm">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-xs uppercase tracking-wider text-foreground/80 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 whitespace-nowrap overflow-hidden">
                        {sectionTitles[category as keyof typeof sectionTitles]}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 text-muted-foreground group-data-[state=open]/collapsible:rotate-90 ml-auto opacity-0 group-hover/sidebar:opacity-100" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="animate-in slide-in-from-top-2 duration-200">
                    <SidebarGroupContent className="mt-1">
                      <SidebarMenu className="gap-0.5 px-1">
                        {sections.map((section) => {
                          const Icon = section.icon;
                          const isActive = section.key === activeSection;

                          return (
                            <SidebarMenuItem key={section.key} className="relative group/item">
                              <SidebarMenuButton
                                onClick={() => handleNavClick(section.key)}
                                isActive={isActive}
                                className={`
                                  relative transition-all duration-300 h-9 text-xs justify-center group-hover/sidebar:justify-start px-2 group-hover/sidebar:px-3 rounded-lg
                                  ${isActive 
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40' 
                                    : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground'
                                  }
                                `}
                              >
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ${isActive ? 'bg-primary-foreground/20' : 'bg-transparent'}`}>
                                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary-foreground' : 'text-current'}`} />
                                </div>
                                <span className="flex-1 font-medium truncate opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 ml-2 whitespace-nowrap">
                                  {section.label}
                                </span>
                                {section.badge && (
                                  <span className="text-[9px] bg-destructive/90 text-destructive-foreground px-1.5 py-0.5 rounded-full font-semibold opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 shadow-sm">
                                    {section.badge}
                                  </span>
                                )}
                              </SidebarMenuButton>
                              {/* Tooltip */}
                              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover/95 backdrop-blur-sm text-popover-foreground text-xs rounded-lg shadow-lg border border-border/50 opacity-0 group-hover/item:opacity-100 group-hover/sidebar:hidden pointer-events-none whitespace-nowrap z-50 transition-all duration-200">
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
