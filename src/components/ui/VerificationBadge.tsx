import { ShieldCheck, Building2, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  type: "owner" | "agent" | "agency";
  verified?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const VerificationBadge = ({ 
  type, 
  verified = false,
  className,
  size = "md"
}: VerificationBadgeProps) => {
  if (!verified) return null;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
    md: "text-xs px-2 py-1 gap-1",
    lg: "text-sm px-3 py-1.5 gap-1.5"
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5"
  };

  const getIcon = () => {
    switch (type) {
      case "owner":
        return <ShieldCheck className={cn(iconSizes[size], "flex-shrink-0")} />;
      case "agent":
        return <UserCheck className={cn(iconSizes[size], "flex-shrink-0")} />;
      case "agency":
        return <Building2 className={cn(iconSizes[size], "flex-shrink-0")} />;
    }
  };

  const getLabel = () => {
    switch (type) {
      case "owner":
        return "Verified Owner";
      case "agent":
        return "Verified Agent";
      case "agency":
        return "Verified Agency";
    }
  };

  return (
    <Badge 
      className={cn(
        "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-none shadow-md backdrop-blur-sm font-semibold flex items-center",
        sizeClasses[size],
        className
      )}
    >
      {getIcon()}
      <span className="whitespace-nowrap">{getLabel()}</span>
    </Badge>
  );
};

export default VerificationBadge;
