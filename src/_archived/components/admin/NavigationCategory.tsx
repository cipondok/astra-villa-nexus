import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sectionCategories } from "./navigationSections";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Wrench, 
  Settings, 
  Cpu,
  type LucideIcon 
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  "core-management": LayoutDashboard,
  "user-management": Users,
  "property-management": Building2,
  "vendor-services": Wrench,
  "technical": Cpu,
  "settings": Settings,
};

interface NavigationCategoryProps {
  category: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const NavigationCategory = ({ category, activeSection, onSectionChange }: NavigationCategoryProps) => {
  const sections = sectionCategories[category as keyof typeof sectionCategories] || [];
  const CategoryIcon = categoryIcons[category] || LayoutDashboard;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent uppercase tracking-wider flex items-center gap-2">
        <CategoryIcon className="h-4 w-4" />
        {category.replace('-', ' ')}
      </h3>
      <div className="grid gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.key}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border backdrop-blur-sm ${
                activeSection === section.key
                  ? "ring-2 ring-primary bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30 shadow-lg"
                  : "hover:bg-card/80 bg-card/60 border-border/30"
              }`}
              onClick={() => onSectionChange(section.key)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activeSection === section.key 
                      ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-foreground font-medium">{section.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs text-muted-foreground leading-relaxed">
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
