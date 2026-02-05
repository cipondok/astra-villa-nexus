import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface AdminTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  tabs: TabItem[];
  children: React.ReactNode;
  className?: string;
  tabsListClassName?: string;
  fullWidth?: boolean;
}

export const AdminTabs = ({
  value,
  onValueChange,
  tabs,
  children,
  className,
  tabsListClassName,
  fullWidth = true,
}: AdminTabsProps) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={className}>
      <TabsList className={cn(
        "bg-muted/50 border border-border rounded-[6px] p-1",
        fullWidth && "w-full",
        fullWidth && `grid grid-cols-${tabs.length}`,
        tabsListClassName
      )}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "text-xs sm:text-sm rounded-[4px] data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
              "transition-all duration-200"
            )}
          >
            {tab.icon && <tab.icon className="h-4 w-4 mr-1.5" />}
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};

export { TabsContent };

export default AdminTabs;
