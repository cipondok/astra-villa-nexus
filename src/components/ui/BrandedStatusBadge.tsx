import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import astraLogo from "@/assets/astra-logo-optimized.png";

interface BrandedStatusBadgeProps {
  verificationStatus?: string;
  userLevel?: string;
  size?: "xs" | "sm" | "md";
  className?: string;
}

const STATUS_RING: Record<string, { ring: string; glow: string; label: string }> = {
  verified: {
    ring: "ring-emerald-400 dark:ring-emerald-500",
    glow: "shadow-[0_0_6px_rgba(52,211,153,0.5)]",
    label: "Verified",
  },
  approved: {
    ring: "ring-emerald-400 dark:ring-emerald-500",
    glow: "shadow-[0_0_6px_rgba(52,211,153,0.5)]",
    label: "Verified",
  },
  pending: {
    ring: "ring-amber-400 dark:ring-amber-500",
    glow: "shadow-[0_0_4px_rgba(251,191,36,0.3)]",
    label: "Pending",
  },
  unverified: {
    ring: "ring-slate-300 dark:ring-slate-600",
    glow: "",
    label: "Unverified",
  },
};

const LEVEL_RING: Record<string, { ring: string; glow: string; label: string; bg: string }> = {
  diamond: {
    ring: "ring-sky-400 dark:ring-sky-300",
    glow: "shadow-[0_0_8px_rgba(56,189,248,0.6)]",
    label: "Diamond",
    bg: "bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/50 dark:to-indigo-900/50",
  },
  platinum: {
    ring: "ring-cyan-400 dark:ring-cyan-300",
    glow: "shadow-[0_0_8px_rgba(34,211,238,0.5)]",
    label: "Platinum",
    bg: "bg-gradient-to-br from-cyan-100 to-slate-100 dark:from-cyan-900/50 dark:to-slate-900/50",
  },
  gold: {
    ring: "ring-amber-400 dark:ring-yellow-400",
    glow: "shadow-[0_0_8px_rgba(251,191,36,0.5)]",
    label: "Gold",
    bg: "bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50",
  },
  vip: {
    ring: "ring-purple-400 dark:ring-purple-400",
    glow: "shadow-[0_0_6px_rgba(168,85,247,0.4)]",
    label: "VIP",
    bg: "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50",
  },
  silver: {
    ring: "ring-slate-400 dark:ring-slate-400",
    glow: "shadow-[0_0_4px_rgba(148,163,184,0.4)]",
    label: "Silver",
    bg: "bg-slate-100 dark:bg-slate-800/50",
  },
  premium: {
    ring: "ring-violet-400 dark:ring-violet-400",
    glow: "shadow-[0_0_6px_rgba(139,92,246,0.4)]",
    label: "Premium",
    bg: "bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50",
  },
};

const SIZE_MAP = {
  xs: { container: "h-4 w-4", ring: "ring-[1.5px]", img: "h-2.5 w-2.5" },
  sm: { container: "h-5 w-5", ring: "ring-2", img: "h-3 w-3" },
  md: { container: "h-6 w-6", ring: "ring-2", img: "h-3.5 w-3.5" },
};

const getLevelConfig = (level?: string) => {
  if (!level) return null;
  const lower = level.toLowerCase();
  for (const [key, config] of Object.entries(LEVEL_RING)) {
    if (lower.includes(key)) return config;
  }
  return null;
};

const BrandedStatusBadge = ({
  verificationStatus,
  userLevel,
  size = "xs",
  className,
}: BrandedStatusBadgeProps) => {
  const statusConfig = STATUS_RING[verificationStatus?.toLowerCase() || ""] || STATUS_RING.unverified;
  const levelConfig = getLevelConfig(userLevel);
  const sizeConfig = SIZE_MAP[size];

  // If there's a VIP level, use that ring color; otherwise use verification status ring
  const activeRing = levelConfig?.ring || statusConfig.ring;
  const activeGlow = levelConfig?.glow || statusConfig.glow;
  const activeBg = levelConfig?.bg || "bg-white dark:bg-slate-800";
  const tooltipLabel = levelConfig
    ? `${levelConfig.label} · ${statusConfig.label}`
    : statusConfig.label;

  const badge = (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-110",
        sizeConfig.container,
        sizeConfig.ring,
        activeRing,
        activeGlow,
        activeBg,
        className
      )}
    >
      <img
        src={astraLogo}
        alt="Astra"
        className={cn(sizeConfig.img, "object-contain rounded-full")}
        loading="lazy"
      />
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
