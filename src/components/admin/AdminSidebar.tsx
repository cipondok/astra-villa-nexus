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
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
      <Sidebar className="w-12 hover:w-56 transition-all duration-300 border-r border-border/30 bg-gradient-to-b from-background to-muted/10">
        <SidebarContent className="px-1 py-2">
          {categories.map((category) => {
            const sections = navigationSections[category as keyof typeof navigationSections];
            if (!sections || sections.length === 0) return null;

            const isOpen = openCategory === category;

            return (
              <Collapsible
                key={category}
                open={isOpen}
                onOpenChange={(open) => setOpenCategory(open ? category : null)}
                className="group/collapsible"
              >
                <SidebarGroup className="py-0.5">
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="group/label flex items-center gap-2 cursor-pointer hover:bg-accent/30 rounded-md px-2 py-1.5 transition-all text-[10px]">
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform text-muted-foreground group-data-[state=open]/collapsible:rotate-90" />
                      <span className="font-semibold uppercase tracking-wider text-muted-foreground opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
                        {sectionTitles[category as keyof typeof sectionTitles]}
                      </span>
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu className="gap-0.5">
                        {sections.map((section) => {
                          const Icon = section.icon;
                          const isActive = section.key === activeSection;

                          return (
                            <SidebarMenuItem key={section.key} className="relative group/item">
                              <SidebarMenuButton
                                onClick={() => handleNavClick(section.key)}
                                isActive={isActive}
                                className={`
                                  relative transition-all duration-200 h-8 text-xs justify-center group-hover/sidebar:justify-start px-2
                                  ${isActive 
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm hover:from-primary/90 hover:to-primary/70' 
                                    : 'hover:bg-accent/40'
                                  }
                                `}
                              >
                                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                <span className="flex-1 font-medium truncate opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ml-2 whitespace-nowrap">
                                  {section.label}
                                </span>
                                {section.badge && (
                                  <span className="text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-medium opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
                                    {section.badge}
                                  </span>
                                )}
                              </SidebarMenuButton>
                              {/* Tooltip on hover when collapsed */}
                              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover/item:opacity-100 group-hover/sidebar:hidden pointer-events-none whitespace-nowrap z-50 transition-opacity">
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
