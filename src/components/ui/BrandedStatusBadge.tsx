import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger } from
"@/components/ui/tooltip";
import { useHeaderLogo } from "@/hooks/useBrandingLogo";

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

const LEVEL_CONFIG: Record<string, {ring: string;glow: string;label: string;bg: string;overlay: string;}> = {
  diamond: {
    ring: "ring-sky-400 dark:ring-sky-300",
    glow: "shadow-[0_0_10px_rgba(56,189,248,0.7)]",
    label: "Diamond",
    bg: "bg-gradient-to-br from-sky-200 via-indigo-100 to-sky-300 dark:from-sky-800/70 dark:via-indigo-900/60 dark:to-sky-700/70",
    overlay: "from-sky-400/40 to-indigo-400/30"
  },
  platinum: {
    ring: "ring-cyan-400 dark:ring-cyan-300",
    glow: "shadow-[0_0_10px_rgba(34,211,238,0.6)]",
    label: "Platinum",
    bg: "bg-gradient-to-br from-cyan-200 via-slate-100 to-cyan-300 dark:from-cyan-800/70 dark:via-slate-900/60 dark:to-cyan-700/70",
    overlay: "from-cyan-400/40 to-slate-400/30"
  },
  gold: {
    ring: "ring-amber-400 dark:ring-yellow-400",
    glow: "shadow-[0_0_10px_rgba(251,191,36,0.6)]",
    label: "Gold",
    bg: "bg-gradient-to-br from-amber-200 via-yellow-100 to-amber-300 dark:from-amber-800/70 dark:via-yellow-900/60 dark:to-amber-700/70",
    overlay: "from-amber-400/40 to-yellow-400/30"
  },
  vip: {
    ring: "ring-purple-400 dark:ring-purple-400",
    glow: "shadow-[0_0_8px_rgba(168,85,247,0.5)]",
    label: "VIP",
    bg: "bg-gradient-to-br from-purple-200 via-pink-100 to-purple-300 dark:from-purple-800/70 dark:via-pink-900/60 dark:to-purple-700/70",
    overlay: "from-purple-400/40 to-pink-400/30"
  },
  silver: {
    ring: "ring-slate-400 dark:ring-slate-400",
    glow: "shadow-[0_0_6px_rgba(148,163,184,0.5)]",
    label: "Silver",
    bg: "bg-gradient-to-br from-slate-200 via-gray-100 to-slate-300 dark:from-slate-700/70 dark:via-gray-800/60 dark:to-slate-600/70",
    overlay: "from-slate-400/30 to-gray-400/20"
  },
  premium: {
    ring: "ring-violet-400 dark:ring-violet-400",
    glow: "shadow-[0_0_8px_rgba(139,92,246,0.5)]",
    label: "Premium",
    bg: "bg-gradient-to-br from-violet-200 via-purple-100 to-violet-300 dark:from-violet-800/70 dark:via-purple-900/60 dark:to-violet-700/70",
    overlay: "from-violet-400/40 to-purple-400/30"
  }
};

const SIZE_MAP = {
  xs: { container: "h-4 w-4", ring: "ring-[1.5px]", img: "h-2.5 w-2.5" },
  sm: { container: "h-5 min-w-5 px-1", ring: "ring-2", img: "h-3 w-3" },
  md: { container: "h-6 min-w-6 px-1.5", ring: "ring-2", img: "h-3.5 w-3.5" }
};

const getLevelConfig = (level?: string) => {
  if (!level) return null;
  const lower = level.toLowerCase();
  for (const [key, config] of Object.entries(LEVEL_CONFIG)) {
    if (lower.includes(key)) return config;
  }
  return null;
};

const BrandedStatusBadge = ({
  verificationStatus,
  userLevel,
  size = "xs",
  className
}: BrandedStatusBadgeProps) => {
  const { logoUrl: brandLogo } = useHeaderLogo();
  const statusConfig = STATUS_RING[verificationStatus?.toLowerCase() || ""] || STATUS_RING.unverified;
  const levelConfig = getLevelConfig(userLevel);
  const sizeConfig = SIZE_MAP[size];

  const activeRing = levelConfig?.ring || statusConfig.ring;
  const activeGlow = levelConfig?.glow || statusConfig.glow;
  const activeBg = levelConfig?.bg || "bg-white dark:bg-slate-800";
  const tooltipLabel = levelConfig ?
  `${levelConfig.label} · ${statusConfig.label}` :
  statusConfig.label;

  const badge =
  <div
    className={cn(
      "relative inline-flex items-center justify-center gap-1 rounded-full",
      sizeConfig.container,
      sizeConfig.ring,
      activeRing,
      activeGlow,
      activeBg,
      className
    )}>

      {/* Color overlay for level shading */}
      {levelConfig &&
    <div
      className={cn(
        "absolute inset-0 rounded-full bg-gradient-to-br mix-blend-overlay opacity-60",
        levelConfig.overlay
      )} />

    }
      <img
      src={brandLogo}
      alt="Astra"
      className={cn(sizeConfig.img, "object-contain rounded-full relative z-10")}
      loading="lazy" />

      {size !== "xs" &&
    <span className="relative z-10 text-[8px] font-bold tracking-tight leading-none text-foreground/80 pr-1">
          Verified Partner
        </span>
    }
    </div>;


  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-medium">
          {tooltipLabel}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>);

};

export default BrandedStatusBadge;