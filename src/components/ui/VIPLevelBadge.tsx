import { Gem, Crown, Award, Medal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VIPLevelBadgeProps {
  level?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const VIP_LEVELS = {
  platinum: {
    icon: Gem,
    label: "Platinum VIP",
    color: "text-chart-4",
    bgColor: "bg-gradient-to-r from-chart-4/30 to-primary/30",
    glow: "shadow-[0_0_8px_rgba(34,211,238,0.5)]",
    borderColor: "border-chart-4/50",
  },
  diamond: {
    icon: Gem,
    label: "Diamond VIP",
    color: "text-chart-4",
    bgColor: "bg-gradient-to-r from-chart-4/30 to-primary/30",
    glow: "shadow-[0_0_8px_rgba(34,211,238,0.5)]",
    borderColor: "border-chart-4/50",
  },
  gold: {
    icon: Crown,
    label: "Gold VIP",
    color: "text-gold-primary",
    bgColor: "bg-gradient-to-r from-gold-primary/30 to-chart-3/30",
    glow: "shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    borderColor: "border-gold-primary/50",
  },
  silver: {
    icon: Award,
    label: "Silver VIP",
    color: "text-muted-foreground",
    bgColor: "bg-gradient-to-r from-muted/30 to-muted-foreground/30",
    glow: "shadow-[0_0_8px_rgba(148,163,184,0.4)]",
    borderColor: "border-muted-foreground/50",
  },
  bronze: {
    icon: Medal,
    label: "Bronze VIP",
    color: "text-chart-3",
    bgColor: "bg-gradient-to-r from-chart-3/30 to-gold-primary/30",
    glow: "shadow-[0_0_6px_rgba(251,146,60,0.4)]",
    borderColor: "border-chart-3/50",
  },
  vip: {
    icon: Crown,
    label: "VIP Member",
    color: "text-gold-primary",
    bgColor: "bg-gold-primary/20",
    glow: "",
    borderColor: "border-gold-primary/50",
  },
  premium: {
    icon: Sparkles,
    label: "Premium",
    color: "text-accent",
    bgColor: "bg-accent/20",
    glow: "",
    borderColor: "border-accent/50",
  },
};

const SIZE_CLASSES = {
  xs: {
    icon: "h-2.5 w-2.5",
    padding: "p-0.5",
    text: "text-[8px]",
    gap: "gap-0.5",
  },
  sm: {
    icon: "h-3 w-3",
    padding: "p-1",
    text: "text-[10px]",
    gap: "gap-1",
  },
  md: {
    icon: "h-3.5 w-3.5",
    padding: "p-1.5",
    text: "text-xs",
    gap: "gap-1",
  },
  lg: {
    icon: "h-4 w-4",
    padding: "p-2",
    text: "text-sm",
    gap: "gap-1.5",
  },
};

export const getVIPConfig = (level?: string) => {
  if (!level) return null;
  const lowerLevel = level.toLowerCase();
  
  for (const [key, config] of Object.entries(VIP_LEVELS)) {
    if (lowerLevel.includes(key)) {
      return config;
    }
  }
  return null;
};

const VIPLevelBadge = ({
  level,
  size = "sm",
  showLabel = false,
  showTooltip = true,
  className,
}: VIPLevelBadgeProps) => {
  const config = getVIPConfig(level);
  if (!config) return null;

  const Icon = config.icon;
  const sizeConfig = SIZE_CLASSES[size];

  const badge = (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full backdrop-blur-sm border transition-all duration-300 hover:scale-110",
        config.bgColor,
        config.glow,
        config.borderColor,
        sizeConfig.padding,
        sizeConfig.gap,
        className
      )}
    >
      <Icon className={cn(sizeConfig.icon, config.color)} />
      {showLabel && (
        <span className={cn(sizeConfig.text, config.color, "font-semibold whitespace-nowrap")}>
          {config.label}
        </span>
      )}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <Icon className={cn("h-3 w-3", config.color)} />
            {config.label}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VIPLevelBadge;
