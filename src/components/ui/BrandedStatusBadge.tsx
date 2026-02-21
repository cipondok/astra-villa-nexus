import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";

interface BrandedStatusBadgeProps {
  verificationStatus?: string;
  userLevel?: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const STATUS_RING: Record<string, {ring: string;glow: string;label: string;}> = {
  verified: {
    ring: "ring-emerald-400 dark:ring-emerald-500",
    glow: "shadow-[0_0_6px_rgba(52,211,153,0.5)]",
    label: "Verified"
  },
  approved: {
    ring: "ring-emerald-400 dark:ring-emerald-500",
    glow: "shadow-[0_0_6px_rgba(52,211,153,0.5)]",
    label: "Verified"
  },
  pending: {
    ring: "ring-amber-400 dark:ring-amber-500",
    glow: "shadow-[0_0_4px_rgba(251,191,36,0.3)]",
    label: "Pending"
  },
  unverified: {
    ring: "ring-slate-300 dark:ring-slate-600",
    glow: "",
    label: "Unverified"
  }
};

const LEVEL_CONFIG: Record<string, {label: string; shieldColor: string;}> = {
  diamond: {
    label: "Diamond",
    shieldColor: "#38bdf8", // sky-400
  },
  platinum: {
    label: "Platinum",
    shieldColor: "#22d3ee", // cyan-400
  },
  gold: {
    label: "Gold",
    shieldColor: "#d4a017", // gold
  },
  vip: {
    label: "VIP",
    shieldColor: "#a855f7", // purple
  },
  silver: {
    label: "Silver",
    shieldColor: "#94a3b8", // slate-400
  },
  premium: {
    label: "Premium",
    shieldColor: "#8b5cf6", // violet
  }
};

const SIZE_MAP = {
  xs: { width: 16, height: 18, fontSize: "text-[8px]", gap: "gap-0.5" },
  sm: { width: 20, height: 23, fontSize: "text-[9px]", gap: "gap-1" },
  md: { width: 24, height: 28, fontSize: "text-[10px]", gap: "gap-1" }
};

const getLevelConfig = (level?: string) => {
  if (!level) return null;
  const lower = level.toLowerCase();
  for (const [key, config] of Object.entries(LEVEL_CONFIG)) {
    if (lower.includes(key)) return config;
  }
  return null;
};

// Shield with dove SVG component
const ShieldDoveIcon = ({ color, width, height }: { color: string; width: number; height: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 37"
    width={width}
    height={height}
    style={{ display: 'block' }}
  >
    {/* Shield */}
    <path
      d="M16 1L2 7.5v10c0 9 6.2 17.4 14 19.5 7.8-2.1 14-10.5 14-19.5v-10L16 1z"
      fill={color}
    />
    {/* Dove body */}
    <path
      d="M16 10c-1.8 0-3.2 1.2-3.8 2.8-.3-.1-.7-.2-1-.2-1.5 0-2.7 1-2.7 2.3 0 .8.4 1.5 1.1 2l4.8 4.2c.5.4 1 .7 1.6.7s1.1-.3 1.6-.7l4.8-4.2c.7-.5 1.1-1.2 1.1-2 0-1.3-1.2-2.3-2.7-2.3-.3 0-.7.1-1 .2-.6-1.6-2-2.8-3.8-2.8z"
      fill="white"
    />
    {/* Left wing */}
    <path
      d="M9.5 15.5c-.8-.3-2.2.5-2.5 1.5-.1.4.1.7.4.6 1-.3 2.2-1.2 2.1-2.1z"
      fill="rgba(255,255,255,0.85)"
    />
    {/* Right wing */}
    <path
      d="M22.5 15.5c.8-.3 2.2.5 2.5 1.5.1.4-.1.7-.4.6-1-.3-2.2-1.2-2.1-2.1z"
      fill="rgba(255,255,255,0.85)"
    />
  </svg>
);

const BrandedStatusBadge = ({
  verificationStatus,
  userLevel,
  size = "xs",
  className
}: BrandedStatusBadgeProps) => {
  const statusConfig = STATUS_RING[verificationStatus?.toLowerCase() || ""] || STATUS_RING.unverified;
  const levelConfig = getLevelConfig(userLevel);
  const sizeConfig = SIZE_MAP[size];

  // Default blue shield for verified, level color if available
  const shieldColor = levelConfig?.shieldColor || "#2563eb"; // blue-600 default
  const tooltipLabel = levelConfig
    ? `Verified · ${levelConfig.label}`
    : statusConfig.label;

  const badge = (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeConfig.gap,
        className
      )}
    >
      <ShieldDoveIcon
        color={shieldColor}
        width={sizeConfig.width}
        height={sizeConfig.height}
      />
      {size !== "xs" && (
        <span className={cn(
          sizeConfig.fontSize,
          "font-bold tracking-tight leading-none text-foreground/80 whitespace-nowrap"
        )}>
          Verified Partner
        </span>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-medium">
          {tooltipLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BrandedStatusBadge;