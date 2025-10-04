import React from 'react';
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

  const handleNavClick = (key: string) => {
    onSectionChange(key);
  };

  return (
    <Sidebar className="border-r border-border/50">
      <SidebarContent className="px-2">
        {categories.map((category) => {
          const sections = navigationSections[category as keyof typeof navigationSections];
          if (!sections || sections.length === 0) return null;

          const hasActiveSection = sections.some((section) => section.key === activeSection);

          return (
            <Collapsible
              key={category}
              defaultOpen={hasActiveSection || category === 'overview'}
              className="group/collapsible"
            >
              <SidebarGroup>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="group/label flex items-center justify-between cursor-pointer hover:bg-accent/50 rounded-lg px-2 py-2 transition-all">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {sectionTitles[category as keyof typeof sectionTitles]}
                    </span>
                    {!isCollapsed && (
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = section.key === activeSection;

                        return (
                          <SidebarMenuItem key={section.key}>
                            <SidebarMenuButton
                              onClick={() => handleNavClick(section.key)}
                              isActive={isActive}
                              className={`
                                relative group/item transition-all duration-200
                                ${isActive 
                                  ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90' 
                                  : 'hover:bg-accent/50'
                                }
                              `}
                              tooltip={isCollapsed ? section.label : undefined}
                            >
                              <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : ''}`} />
                              {!isCollapsed && (
                                <span className="flex-1 text-sm font-medium">
                                  {section.label}
                                </span>
                              )}
                              {!isCollapsed && section.badge && (
                                <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
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
  );
}
