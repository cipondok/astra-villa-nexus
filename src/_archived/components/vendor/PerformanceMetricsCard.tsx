
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface PerformanceMetricsCardProps {
  title: string;
  value: string | number;
  target?: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  color?: "green" | "yellow" | "red" | "blue";
  progress?: number;
}

const PerformanceMetricsCard = ({
  title,
  value,
  target,
  description,
  icon: Icon,
  trend,
  color = "blue",
  progress
}: PerformanceMetricsCardProps) => {
  const getColorClasses = (colorName: string) => {
    const colors = {
      green: "text-chart-1 border-chart-1/30 bg-chart-1/5",
      yellow: "text-chart-3 border-chart-3/30 bg-chart-3/5",
      red: "text-destructive border-destructive/30 bg-destructive/5",
      blue: "text-chart-4 border-chart-4/30 bg-chart-4/5"
    };
    return colors[colorName as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = () => {
    if (trend === "up") return "↗️";
    if (trend === "down") return "↘️";
    return "➡️";
  };

  return (
    <Card className={`${getColorClasses(color)} border`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
          {trend && <span className="text-xs">{getTrendIcon()}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {target && (
              <span className="text-sm text-muted-foreground">/ {target}</span>
            )}
          </div>
          
          {progress !== undefined && (
            <Progress value={progress} className="h-2" />
          )}
          
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsCard;
