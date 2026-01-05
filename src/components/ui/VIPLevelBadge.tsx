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
    color: "text-cyan-400",
    bgColor: "bg-gradient-to-r from-cyan-500/30 to-blue-500/30",
    glow: "shadow-[0_0_8px_rgba(34,211,238,0.5)]",
    borderColor: "border-cyan-400/50",
  },
  diamond: {
    icon: Gem,
    label: "Diamond VIP",
    color: "text-cyan-400",
    bgColor: "bg-gradient-to-r from-cyan-500/30 to-blue-500/30",
    glow: "shadow-[0_0_8px_rgba(34,211,238,0.5)]",
    borderColor: "border-cyan-400/50",
  },
  gold: {
    icon: Crown,
    label: "Gold VIP",
    color: "text-amber-400",
    bgColor: "bg-gradient-to-r from-amber-500/30 to-yellow-500/30",
    glow: "shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    borderColor: "border-amber-400/50",
  },
  silver: {
    icon: Award,
    label: "Silver VIP",
    color: "text-slate-300",
    bgColor: "bg-gradient-to-r from-slate-400/30 to-gray-500/30",
    glow: "shadow-[0_0_8px_rgba(148,163,184,0.4)]",
    borderColor: "border-slate-400/50",
  },
  bronze: {
    icon: Medal,
    label: "Bronze VIP",
    color: "text-orange-400",
    bgColor: "bg-gradient-to-r from-orange-600/30 to-amber-700/30",
    glow: "shadow-[0_0_6px_rgba(251,146,60,0.4)]",
    borderColor: "border-orange-400/50",
  },
  vip: {
    icon: Crown,
    label: "VIP Member",
    color: "text-amber-500",
    bgColor: "bg-amber-500/20",
    glow: "",
    borderColor: "border-amber-500/50",
  },
  premium: {
    icon: Sparkles,
    label: "Premium",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    glow: "",
    borderColor: "border-purple-400/50",
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
