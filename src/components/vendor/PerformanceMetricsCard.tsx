
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
      green: "text-green-600 border-green-200 bg-green-50",
      yellow: "text-yellow-600 border-yellow-200 bg-yellow-50",
      red: "text-red-600 border-red-200 bg-red-50",
      blue: "text-blue-600 border-blue-200 bg-blue-50"
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
