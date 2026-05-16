import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
  onClick?: () => void;
}

export const AdminStatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  className,
  onClick,
}: AdminStatCardProps) => {
  return (
    <Card 
      className={cn(
        "bg-card border border-border rounded-[6px] transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:border-primary/20",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-[6px] flex items-center justify-center shrink-0",
              iconColor.includes("chart-1") ? "bg-chart-1/10" :
              iconColor.includes("chart-2") ? "bg-chart-2/10" :
              iconColor.includes("chart-3") ? "bg-chart-3/10" :
              iconColor.includes("chart-4") ? "bg-chart-4/10" :
              iconColor.includes("chart-5") ? "bg-chart-5/10" :
              iconColor.includes("destructive") ? "bg-destructive/10" :
              "bg-primary/10"
            )}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{title}</p>
            </div>
          </div>
          {trend && (
            <div className={cn(
              "text-xs font-medium px-2 py-1 rounded-[4px]",
              trend.value >= 0 ? "bg-chart-1/10 text-chart-1" : "bg-destructive/10 text-destructive"
            )}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminStatCard;
