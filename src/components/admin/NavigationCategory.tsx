
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sectionCategories } from "./navigationSections";

interface NavigationCategoryProps {
  category: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const NavigationCategory = ({ category, activeSection, onSectionChange }: NavigationCategoryProps) => {
  const sections = sectionCategories[category as keyof typeof sectionCategories] || [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
        {category.replace('-', ' ')}
      </h3>
      <div className="grid gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.key}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                activeSection === section.key
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700"
              }`}
              onClick={() => onSectionChange(section.key)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${
                    activeSection === section.key 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`} />
                  <span className="text-gray-900 dark:text-gray-100">{section.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs text-gray-600 dark:text-gray-400">
                  {section.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationCategory;
