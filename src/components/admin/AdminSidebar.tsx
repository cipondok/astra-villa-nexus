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
    <div ref={sidebarRef} className="group/sidebar h-full">
      <Sidebar className="!w-[52px] hover:!w-56 transition-all duration-400 ease-out border-r border-border/20 bg-background/95 backdrop-blur-md">
        <SidebarContent className="px-0 py-2 space-y-0.5">
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
                    <SidebarGroupLabel className="group/label flex items-center gap-2.5 cursor-pointer hover:bg-accent/50 active:bg-accent mx-1 px-2 py-2 rounded-lg transition-colors duration-200">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover/label:bg-primary/20 transition-colors">
                        <CategoryIcon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground/70 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap truncate flex-1">
                        {sectionTitles[category as keyof typeof sectionTitles]}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-0 group-hover/sidebar:opacity-100 shrink-0" />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="animate-accordion-down">
                    <SidebarGroupContent className="pt-0.5 pb-1">
                      <SidebarMenu className="space-y-0.5 px-1">
                        {sections.map((section) => {
                          const Icon = section.icon;
                          const isActive = section.key === activeSection;

                          return (
                            <SidebarMenuItem key={section.key} className="relative group/item">
                              <SidebarMenuButton
                                onClick={() => handleNavClick(section.key)}
                                isActive={isActive}
                                className={`
                                  h-8 text-[11px] rounded-md transition-all duration-200 px-2 gap-2.5
                                  ${isActive 
                                    ? 'bg-primary text-primary-foreground shadow-sm' 
                                    : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground'
                                  }
                                `}
                              >
                                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary-foreground' : ''}`} />
                                </div>
                                <span className="font-medium truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap flex-1">
                                  {section.label}
                                </span>
                                {section.badge && (
                                  <span className="text-[8px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-semibold opacity-0 group-hover/sidebar:opacity-100 transition-opacity shrink-0">
                                    {section.badge}
                                  </span>
                                )}
                              </SidebarMenuButton>
                              {/* Tooltip when collapsed */}
                              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded-md shadow-md border border-border opacity-0 group-hover/item:opacity-100 group-hover/sidebar:hidden pointer-events-none whitespace-nowrap z-50">
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
