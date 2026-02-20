
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
          ? 'ring-2 ring-primary bg-primary/5 border-primary/30' 
          : isUsersCategory
          ? 'hover:bg-chart-2/5 border-chart-2/20 bg-card'
          : 'hover:bg-muted/50 bg-card border-border'
      }`}
      onClick={() => onSectionChange(section.key)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className={`h-4 w-4 ${
            isActive 
              ? 'text-primary' 
              : isUsersCategory 
              ? 'text-chart-2' 
              : 'text-muted-foreground'
          }`} />
          <span className="flex-1 text-foreground">{section.label}</span>
          {section.badge && (
            <Badge 
              variant={isUsersCategory ? "default" : "secondary"} 
              className={`text-xs ${
                isUsersCategory 
                  ? "bg-chart-2/20 text-chart-2" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {section.badge}
            </Badge>
          )}
          {isActive && (
            <Badge 
              variant="default" 
              className="text-xs bg-primary text-primary-foreground"
            >
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">{section.description}</p>
        {isUsersCategory && (
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs border-chart-2/30 text-chart-2">Enhanced</Badge>
            <Badge variant="outline" className="text-xs border-chart-2/30 text-chart-2">Vendors</Badge>
            <Badge variant="outline" className="text-xs border-chart-2/30 text-chart-2">Agents</Badge>
            <Badge variant="outline" className="text-xs border-chart-2/30 text-chart-2">Owners</Badge>
            <Badge variant="outline" className="text-xs border-chart-2/30 text-chart-2">Support</Badge>
            <Badge variant="outline" className="text-xs border-chart-2/30 text-chart-2">Levels</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LightModeNavigationCard;
