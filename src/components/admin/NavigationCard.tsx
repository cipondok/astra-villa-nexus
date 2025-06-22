
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavigationSection } from "./navigationSections";

interface NavigationCardProps {
  section: NavigationSection;
  isActive: boolean;
  isUsersCategory: boolean;
  onSectionChange: (sectionId: string) => void;
}

const NavigationCard = ({ section, isActive, isUsersCategory, onSectionChange }: NavigationCardProps) => {
  const Icon = section.icon;

  return (
    <Card 
      key={section.id}
      className={`cursor-pointer transition-all hover:shadow-md ${
        isActive 
          ? 'ring-2 ring-blue-500 bg-blue-50' 
          : isUsersCategory
          ? 'hover:bg-blue-50 border-blue-200'
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onSectionChange(section.id)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={`h-4 w-4 ${
            isActive 
              ? 'text-blue-600' 
              : isUsersCategory 
              ? 'text-blue-500' 
              : 'text-gray-600'
          }`} />
          <span className="flex-1">{section.label}</span>
          {section.badge && (
            <Badge variant={isUsersCategory ? "default" : "secondary"} className="text-xs">
              {section.badge}
            </Badge>
          )}
          {isActive && <Badge variant="default" className="text-xs">Active</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{section.description}</p>
        {isUsersCategory && (
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">Enhanced</Badge>
            <Badge variant="outline" className="text-xs">Vendors</Badge>
            <Badge variant="outline" className="text-xs">Agents</Badge>
            <Badge variant="outline" className="text-xs">Owners</Badge>
            <Badge variant="outline" className="text-xs">Support</Badge>
            <Badge variant="outline" className="text-xs">Levels</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NavigationCard;
