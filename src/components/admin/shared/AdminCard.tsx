import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  };
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

export const AdminCard = ({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  badge,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
  noPadding = false,
}: AdminCardProps) => {
  return (
    <Card className={cn(
      "bg-card border border-border rounded-[6px] shadow-sm",
      className
    )}>
      <CardHeader className={cn("pb-3", headerClassName)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className={cn("h-4 w-4", iconColor)} />
            )}
            <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
            {badge && (
              <Badge variant={badge.variant || "outline"} className="text-xs ml-2">
                {badge.text}
              </Badge>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn(
        noPadding ? "p-0" : "",
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default AdminCard;
