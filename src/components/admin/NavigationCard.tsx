
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
      key={section.key}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border ${
        isActive 
          ? 'ring-2 ring-primary bg-primary/5 border-primary/30' 
          : isUsersCategory
          ? 'hover:bg-primary/5 border-primary/10'
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
                  ? "bg-primary/10 text-primary border-primary/20" 
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
            <Badge variant="outline" className="text-xs border-primary/20 text-primary">Enhanced</Badge>
            <Badge variant="outline" className="text-xs border-primary/20 text-primary">Vendors</Badge>
            <Badge variant="outline" className="text-xs border-primary/20 text-primary">Agents</Badge>
            <Badge variant="outline" className="text-xs border-primary/20 text-primary">Owners</Badge>
            <Badge variant="outline" className="text-xs border-primary/20 text-primary">Support</Badge>
            <Badge variant="outline" className="text-xs border-primary/20 text-primary">Levels</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NavigationCard;
