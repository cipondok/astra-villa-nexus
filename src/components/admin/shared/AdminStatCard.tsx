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
              iconColor.includes("primary") ? "bg-primary/10" : 
              iconColor.includes("green") ? "bg-green-500/10" :
              iconColor.includes("blue") ? "bg-blue-500/10" :
              iconColor.includes("amber") ? "bg-amber-500/10" :
              iconColor.includes("purple") ? "bg-purple-500/10" :
              iconColor.includes("pink") ? "bg-pink-500/10" :
              iconColor.includes("orange") ? "bg-orange-500/10" :
              iconColor.includes("indigo") ? "bg-indigo-500/10" :
              iconColor.includes("red") ? "bg-red-500/10" :
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
              trend.value >= 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
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
