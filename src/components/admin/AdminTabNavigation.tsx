import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown } from "lucide-react";

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

  return (
    <div className="bg-card border rounded-xl shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Admin Dashboard</h3>
        <div className="text-sm text-muted-foreground">
          {Object.values(tabCategories).flatMap(cat => cat.items).find(tab => tab.value === activeTab)?.label}
        </div>
      </div>
      
      <div className="p-2">
        <nav className="flex flex-wrap items-center gap-1">
          {Object.entries(tabCategories).map(([categoryKey, category]) => {
            const categoryTabs = category.items.filter(tab => !tab.adminOnly || isAdmin);
            if (categoryTabs.length === 0) return null;
            
            // Check if any tab in this category is active
            const hasActiveTab = categoryTabs.some(tab => tab.value === activeTab);
            
            return (
              <div key={categoryKey} className="relative">
                {categoryTabs.length === 1 ? (
                  // Single item - direct tab
                  <TooltipProvider key={categoryTabs[0].value}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger 
                          value={categoryTabs[0].value}
                          className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                            activeTab === categoryTabs[0].value 
                              ? 'bg-primary text-primary-foreground shadow-sm' 
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => setActiveTab(categoryTabs[0].value)}
                        >
                          {React.createElement(categoryTabs[0].icon, { className: "h-4 w-4 group-hover:scale-110 transition-transform duration-200" })}
                          <span className="hidden sm:block">{categoryTabs[0].label}</span>
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-sm">{categoryTabs[0].label}</p>
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
                        variant="ghost" 
                        className={`group flex items-center gap-2 px-4 py-2 h-auto rounded-lg text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                          hasActiveTab 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="hidden sm:block">{category.label}</span>
                        <span className="sm:hidden">{category.label.slice(0, 1)}</span>
                        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${
                          openDropdown === categoryKey ? 'rotate-180' : ''
                        }`} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start" 
                      className="w-56 bg-popover/95 backdrop-blur-sm border shadow-lg"
                    >
                      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {category.label}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {categoryTabs.map(tab => (
                        <DropdownMenuItem 
                          key={tab.value}
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                            activeTab === tab.value ? 'bg-accent text-accent-foreground' : ''
                          }`}
                          onClick={() => {
                            setActiveTab(tab.value);
                            setOpenDropdown(null);
                          }}
                        >
                          {React.createElement(tab.icon, { className: "h-4 w-4" })}
                          <span className="font-medium">{tab.label}</span>
                          {activeTab === tab.value && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AdminTabNavigation;
