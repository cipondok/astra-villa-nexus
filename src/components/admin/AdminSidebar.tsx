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

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('Click detected, sidebarRef:', sidebarRef.current);
      console.log('Target:', event.target);
      console.log('Contains:', sidebarRef.current?.contains(event.target as Node));
      
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        console.log('Closing sidebar - clicked outside');
        setOpenCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={sidebarRef}>
      <Sidebar className="border-r border-border/30 bg-gradient-to-b from-background to-muted/10">
        <SidebarContent className="px-1.5 py-2">
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
                <SidebarGroup className="py-1">
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="group/label flex items-center justify-between cursor-pointer hover:bg-accent/30 rounded-md px-2 py-1.5 transition-all text-[10px]">
                      <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                        {sectionTitles[category as keyof typeof sectionTitles]}
                      </span>
                      {!isCollapsed && (
                        <ChevronRight className="h-3 w-3 transition-transform text-muted-foreground/60 group-data-[state=open]/collapsible:rotate-90" />
                      )}
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu className="gap-0.5">
                        {sections.map((section) => {
                          const Icon = section.icon;
                          const isActive = section.key === activeSection;

                          return (
                            <SidebarMenuItem key={section.key}>
                              <SidebarMenuButton
                                onClick={() => handleNavClick(section.key)}
                                isActive={isActive}
                                className={`
                                  relative group/item transition-all duration-200 h-8 text-xs
                                  ${isActive 
                                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-sm hover:from-primary/90 hover:to-primary/70' 
                                    : 'hover:bg-accent/40'
                                  }
                                `}
                                tooltip={isCollapsed ? section.label : undefined}
                              >
                                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                {!isCollapsed && (
                                  <span className="flex-1 font-medium truncate">
                                    {section.label}
                                  </span>
                                )}
                                {!isCollapsed && section.badge && (
                                  <span className="text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-medium">
                                    {section.badge}
                                  </span>
                                )}
                              </SidebarMenuButton>
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
