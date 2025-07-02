
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Users, 
  Building, 
  ShoppingCart, 
  Settings, 
  BarChart3, 
  MessageSquare,
  Shield,
  Database,
  Wrench,
  FileText,
  Zap
} from "lucide-react";

interface AdminTabNavigationProps {
  isAdmin: boolean;
}

const AdminTabNavigation = ({ isAdmin }: AdminTabNavigationProps) => {
  const tabs = [
    {
      value: "diagnostic",
      label: "System Health",
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
    },
    {
      value: "overview",
      label: "Overview",
      icon: BarChart3,
      color: "text-green-600 dark:text-green-400",
      bgColor: "hover:bg-green-50 dark:hover:bg-green-900/20"
    },
    {
      value: "users",
      label: "Users",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "hover:bg-purple-50 dark:hover:bg-purple-900/20"
    },
    {
      value: "properties",
      label: "Properties",
      icon: Building,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "hover:bg-orange-50 dark:hover:bg-orange-900/20"
    },
    {
      value: "vendors",
      label: "Vendors",
      icon: ShoppingCart,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "hover:bg-pink-50 dark:hover:bg-pink-900/20"
    },
    {
      value: "analytics",
      label: "Analytics",
      icon: Database,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
    },
    {
      value: "settings",
      label: "Settings",
      icon: Settings,
      color: "text-slate-600 dark:text-slate-400",
      bgColor: "hover:bg-slate-50 dark:hover:bg-slate-900/20"
    }
  ];

  return (
    <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-2 bg-transparent gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={`
              flex flex-col items-center gap-2 p-4 h-auto min-h-[80px] 
              bg-white/60 dark:bg-slate-700/60 
              border border-slate-200 dark:border-slate-600 
              rounded-lg transition-all duration-300
              data-[state=active]:bg-blue-600 data-[state=active]:text-white
              data-[state=active]:border-blue-600 data-[state=active]:shadow-lg
              ${tab.bgColor}
              hover:shadow-md hover:scale-105 transform
            `}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium text-center leading-tight">
              {tab.label}
            </span>
            {tab.value === "diagnostic" && (
              <Badge variant="outline" className="text-xs px-1 py-0 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600">
                Live
              </Badge>
            )}
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
};

export default AdminTabNavigation;
