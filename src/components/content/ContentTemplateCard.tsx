import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { ContentTemplate } from "@/hooks/useAIContentGenerator";

interface ContentTemplateCardProps {
  template: ContentTemplate;
  onSelect: (template: ContentTemplate) => void;
}

const ContentTemplateCard = ({ template, onSelect }: ContentTemplateCardProps) => {
  return (
    <Card 
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/30"
      onClick={() => onSelect(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="text-4xl mb-2">{template.icon}</div>
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {template.estimatedTime}
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {template.name}
        </CardTitle>
        <CardDescription className="text-sm">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {template.variables.filter(v => v.required).length} required fields
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            Generate
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentTemplateCard;
