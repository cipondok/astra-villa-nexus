
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { navigationSections } from "./navigationSections";

interface NavigationCategoryProps {
  category: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const NavigationCategory = ({ category, activeSection, onSectionChange }: NavigationCategoryProps) => {
  const sections = navigationSections[category as keyof typeof navigationSections] || [];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {category}
      </h3>
      <div className="grid gap-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeSection === section.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => onSectionChange(section.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {section.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs">
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
