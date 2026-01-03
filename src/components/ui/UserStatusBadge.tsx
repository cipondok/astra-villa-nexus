import { ShieldCheck, Clock, AlertCircle, XCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserStatusBadgeProps {
  status?: string;
  size?: "xs" | "sm" | "md";
  showTooltip?: boolean;
  className?: string;
}

const UserStatusBadge = ({ 
  status, 
  size = "sm",
  showTooltip = true,
  className 
}: UserStatusBadgeProps) => {
  if (!status) return null;

  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4"
  };

  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case "verified":
        return {
          icon: ShieldCheck,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
          label: "Verified User"
        };
      case "premium":
        return {
          icon: CheckCircle2,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
          label: "Premium User"
        };
      case "pending":
        return {
          icon: Clock,
          color: "text-orange-500",
          bgColor: "bg-orange-500/10",
          label: "Verification Pending"
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          label: "Verification Rejected"
        };
      case "unverified":
        return {
          icon: AlertCircle,
          color: "text-muted-foreground",
          bgColor: "bg-muted/50",
          label: "Unverified"
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  const badge = (
    <div 
      className={cn(
        "inline-flex items-center justify-center rounded-full p-0.5",
        config.bgColor,
        className
      )}
    >
      <Icon className={cn(sizeClasses[size], config.color)} />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {config.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserStatusBadge;
