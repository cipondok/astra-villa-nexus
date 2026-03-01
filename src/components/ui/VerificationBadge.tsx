import { ShieldCheck, Building2, UserCheck, Scale, Landmark, BadgeCheck, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type PropertyTrustType =
  | "owner"
  | "agent"
  | "agency"
  | "verified_ownership"
  | "developer_certified"
  | "legal_checked"
  | "premium_partner";

interface VerificationBadgeProps {
  type: PropertyTrustType;
  verified?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

const badgeConfig: Record<
  PropertyTrustType,
  {
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    tooltip: string;
    gradient: string;
    hoverGradient: string;
  }
> = {
  owner: {
    label: "Verified Owner",
    shortLabel: "Owner",
    icon: ShieldCheck,
    tooltip: "Property owner identity has been verified",
    gradient: "from-primary to-primary/80",
    hoverGradient: "hover:from-primary/90 hover:to-primary/70",
  },
  agent: {
    label: "Verified Agent",
    shortLabel: "Agent",
    icon: UserCheck,
    tooltip: "Licensed real estate agent with verified credentials",
    gradient: "from-chart-1 to-chart-1/80",
    hoverGradient: "hover:from-chart-1/90 hover:to-chart-1/70",
  },
  agency: {
    label: "Verified Agency",
    shortLabel: "Agency",
    icon: Building2,
    tooltip: "Registered real estate agency with verified business profile",
    gradient: "from-chart-5 to-chart-5/80",
    hoverGradient: "hover:from-chart-5/90 hover:to-chart-5/70",
  },
  verified_ownership: {
    label: "Verified Ownership",
    shortLabel: "Ownership",
    icon: BadgeCheck,
    tooltip: "Property ownership documents have been verified by our legal team",
    gradient: "from-chart-1 to-emerald-600",
    hoverGradient: "hover:from-chart-1/90 hover:to-emerald-600/80",
  },
  developer_certified: {
    label: "Developer Certified",
    shortLabel: "Developer",
    icon: Landmark,
    tooltip: "Property developed by a certified and registered developer",
    gradient: "from-chart-4 to-amber-600",
    hoverGradient: "hover:from-chart-4/90 hover:to-amber-600/80",
  },
  legal_checked: {
    label: "Legal Checked",
    shortLabel: "Legal",
    icon: Scale,
    tooltip: "Property legal documents (certificates, permits) have been reviewed and cleared",
    gradient: "from-sky-500 to-blue-600",
    hoverGradient: "hover:from-sky-500/90 hover:to-blue-600/80",
  },
  premium_partner: {
    label: "Premium Partner",
    shortLabel: "Premium",
    icon: Crown,
    tooltip: "Listed by an exclusive Premium Partner with top trust rating",
    gradient: "from-gold-primary to-amber-500",
    hoverGradient: "hover:from-gold-primary/90 hover:to-amber-500/80",
  },
};

const VerificationBadge = ({
  type,
  verified = false,
  className,
  size = "md",
  showTooltip = true,
}: VerificationBadgeProps) => {
  if (!verified) return null;

  const config = badgeConfig[type];
  if (!config) return null;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
    md: "text-xs px-2 py-1 gap-1",
    lg: "text-sm px-3 py-1.5 gap-1.5",
  };

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  };

  const Icon = config.icon;

  const badge = (
    <Badge
      className={cn(
        "bg-gradient-to-r text-white border-none shadow-md backdrop-blur-sm font-semibold flex items-center cursor-default",
        config.gradient,
        config.hoverGradient,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(iconSizes[size], "flex-shrink-0")} />
      <span className="whitespace-nowrap">{size === "sm" ? config.shortLabel : config.label}</span>
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px]">
          <p className="text-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;
export { badgeConfig };
