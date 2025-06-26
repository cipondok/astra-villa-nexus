
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavigationSection } from "./navigationSections";

interface LightModeNavigationCardProps {
  section: NavigationSection;
  isActive: boolean;
  isUsersCategory: boolean;
  onSectionChange: (sectionId: string) => void;
}

const LightModeNavigationCard = ({ section, isActive, isUsersCategory, onSectionChange }: LightModeNavigationCardProps) => {
  const Icon = section.icon;

  return (
    <Card 
      key={section.key}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border ${
        isActive 
          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' 
          : isUsersCategory
          ? 'hover:bg-blue-50 dark:hover:bg-blue-950 border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-900'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700'
      }`}
      onClick={() => onSectionChange(section.key)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={`h-4 w-4 ${
            isActive 
              ? 'text-blue-600 dark:text-blue-400' 
              : isUsersCategory 
              ? 'text-blue-500 dark:text-blue-400' 
              : 'text-gray-600 dark:text-gray-400'
          }`} />
          <span className="flex-1 text-gray-900 dark:text-gray-100">{section.label}</span>
          {section.badge && (
            <Badge 
              variant={isUsersCategory ? "default" : "secondary"} 
              className={`text-xs ${
                isUsersCategory 
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
              }`}
            >
              {section.badge}
            </Badge>
          )}
          {isActive && (
            <Badge 
              variant="default" 
              className="text-xs bg-blue-600 text-white dark:bg-blue-500"
            >
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 dark:text-gray-400">{section.description}</p>
        {isUsersCategory && (
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">Enhanced</Badge>
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">Vendors</Badge>
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">Agents</Badge>
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">Owners</Badge>
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">Support</Badge>
            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 dark:border-blue-700 dark:text-blue-300">Levels</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LightModeNavigationCard;
