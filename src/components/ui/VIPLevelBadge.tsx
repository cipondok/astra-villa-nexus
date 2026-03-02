import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MedalBadge, { type MedalTier } from "@/components/ui/MedalBadge";

interface VIPLevelBadgeProps {
  level?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
}

const VIP_LEVELS: Record<string, { medalTier: MedalTier; label: string }> = {
  platinum: { medalTier: "platinum", label: "Platinum VIP" },
  diamond: { medalTier: "diamond", label: "Diamond VIP" },
  gold: { medalTier: "gold", label: "Gold VIP" },
  silver: { medalTier: "silver", label: "Silver VIP" },
  vip: { medalTier: "gold", label: "VIP Member" },
  premium: { medalTier: "platinum", label: "Premium" },
};

const MEDAL_SIZE_MAP: Record<string, "sm" | "md" | "lg" | "xl"> = {
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
};

export const getVIPConfig = (level?: string) => {
  if (!level) return null;
  const lowerLevel = level.toLowerCase();
  for (const [key, config] of Object.entries(VIP_LEVELS)) {
    if (lowerLevel.includes(key)) return config;
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

  const medalSize = MEDAL_SIZE_MAP[size] || "sm";

  const badge = (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <MedalBadge tier={config.medalTier} size={medalSize} animate={size !== "xs"} />
      {showLabel && (
        <span className={cn(
          "font-semibold whitespace-nowrap",
          size === "xs" ? "text-[8px]" : size === "sm" ? "text-[10px]" : size === "md" ? "text-xs" : "text-sm",
          "text-foreground"
        )}>
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
            <MedalBadge tier={config.medalTier} size="sm" animate={false} />
            {config.label}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VIPLevelBadge;
