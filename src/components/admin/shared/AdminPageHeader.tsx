import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  };
  actions?: React.ReactNode;
  className?: string;
}

export const AdminPageHeader = ({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  className,
}: AdminPageHeaderProps) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border",
      className
    )}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="h-10 w-10 rounded-[6px] bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {badge && (
              <Badge variant={badge.variant || "outline"} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default AdminPageHeader;
