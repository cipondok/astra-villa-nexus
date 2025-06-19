
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, Settings } from "lucide-react";

interface TabCategory {
  label: string;
  items: Array<{
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    component: React.LazyExoticComponent<React.ComponentType<any>> | null;
    adminOnly: boolean;
  }>;
}

interface AdminTabNavigationProps {
  tabCategories: Record<string, TabCategory>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
}

const AdminTabNavigation = ({ tabCategories, activeTab, setActiveTab, isAdmin }: AdminTabNavigationProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownToggle = (categoryKey: string) => {
    setOpenDropdown(openDropdown === categoryKey ? null : categoryKey);
  };

  const handleTabSelect = (tabValue: string) => {
    console.log('Tab selected:', tabValue);
    setActiveTab(tabValue);
    setOpenDropdown(null);
  };

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Control Panel</h3>
            <p className="text-sm text-muted-foreground">System management & settings</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
          {Object.values(tabCategories).flatMap(cat => cat.items).find(tab => tab.value === activeTab)?.label || 'Overview'}
        </div>
      </div>
      
      <div className="p-3 bg-muted/30">
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(tabCategories).map(([categoryKey, category]) => {
            const categoryTabs = category.items.filter(tab => !tab.adminOnly || isAdmin);
            if (categoryTabs.length === 0) return null;
            
            // Check if any tab in this category is active
            const hasActiveTab = categoryTabs.some(tab => tab.value === activeTab);
            
            return (
              <div key={categoryKey} className="relative">
                {categoryTabs.length === 1 ? (
                  // Single item - direct button
                  <TooltipProvider key={categoryTabs[0].value}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={activeTab === categoryTabs[0].value ? "default" : "ghost"}
                          size="sm"
                          className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                            activeTab === categoryTabs[0].value 
                              ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border/50'
                          }`}
                          onClick={() => handleTabSelect(categoryTabs[0].value)}
                        >
                          {React.createElement(categoryTabs[0].icon, { className: "h-4 w-4 group-hover:scale-110 transition-transform duration-200" })}
                          <span className="hidden sm:block">{categoryTabs[0].label}</span>
                          {activeTab === categoryTabs[0].value && (
                            <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full border-2 border-background"></div>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-popover border shadow-lg">
                        <p className="text-sm font-medium">{categoryTabs[0].label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  // Multiple items - dropdown
                  <DropdownMenu 
                    open={openDropdown === categoryKey} 
                    onOpenChange={(open) => setOpenDropdown(open ? categoryKey : null)}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant={hasActiveTab ? "default" : "ghost"}
                        size="sm"
                        className={`group flex items-center gap-2 px-4 py-2.5 h-auto rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          hasActiveTab 
                            ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-background border border-transparent hover:border-border/50'
                        }`}
                      >
                        <span className="hidden sm:block">{category.label}</span>
                        <span className="sm:hidden">{category.label.slice(0, 1)}</span>
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${
                          openDropdown === categoryKey ? 'rotate-180' : ''
                        }`} />
                        {hasActiveTab && (
                          <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full border-2 border-background"></div>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start" 
                      className="w-64 bg-popover/95 backdrop-blur-sm border shadow-xl rounded-xl"
                    >
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 bg-muted/50">
                        {category.label}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="border-border/50" />
                      {categoryTabs.map(tab => (
                        <DropdownMenuItem 
                          key={tab.value}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-accent/80 ${
                            activeTab === tab.value ? 'bg-primary/10 text-primary border-l-2 border-l-primary' : ''
                          }`}
                          onClick={() => handleTabSelect(tab.value)}
                        >
                          {React.createElement(tab.icon, { className: "h-4 w-4" })}
                          <span className="font-medium">{tab.label}</span>
                          {activeTab === tab.value && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminTabNavigation;
