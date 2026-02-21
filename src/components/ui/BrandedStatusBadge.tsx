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

const STATUS_RING: Record<string, {label: string;}> = {
  verified: { label: "Verified" },
  approved: { label: "Verified" },
  pending: { label: "Pending" },
  unverified: { label: "Unverified" }
};

const LEVEL_CONFIG: Record<string, {label: string; shieldColor: string; shieldLight: string; shieldDark: string;}> = {
  diamond: {
    label: "Diamond",
    shieldColor: "#38bdf8",
    shieldLight: "#7dd3fc",
    shieldDark: "#0284c7",
  },
  platinum: {
    label: "Platinum",
    shieldColor: "#22d3ee",
    shieldLight: "#67e8f9",
    shieldDark: "#0891b2",
  },
  gold: {
    label: "Gold",
    shieldColor: "#d4a017",
    shieldLight: "#facc15",
    shieldDark: "#a16207",
  },
  vip: {
    label: "VIP",
    shieldColor: "#a855f7",
    shieldLight: "#c084fc",
    shieldDark: "#7c3aed",
  },
  silver: {
    label: "Silver",
    shieldColor: "#94a3b8",
    shieldLight: "#cbd5e1",
    shieldDark: "#64748b",
  },
  premium: {
    label: "Premium",
    shieldColor: "#8b5cf6",
    shieldLight: "#a78bfa",
    shieldDark: "#6d28d9",
  }
};

const SIZE_MAP = {
  xs: { width: 22, height: 26, logoSize: 16, logoY: 5, fontSize: "text-[8px]", gap: "gap-0.5" },
  sm: { width: 28, height: 32, logoSize: 20, logoY: 6, fontSize: "text-[9px]", gap: "gap-1" },
  md: { width: 34, height: 40, logoSize: 24, logoY: 7, fontSize: "text-[10px]", gap: "gap-1" }
};

const getLevelConfig = (level?: string) => {
  if (!level) return null;
  const lower = level.toLowerCase();
  for (const [key, config] of Object.entries(LEVEL_CONFIG)) {
    if (lower.includes(key)) return config;
  }
  return null;
};

// Diamond-faceted 3D Shield with embedded logo
const Shield3DIcon = ({ color, lightColor, darkColor, width, height, logoUrl, logoSize, logoY, checkColor }: {
  color: string; lightColor: string; darkColor: string;
  width: number; height: number; logoUrl: string; logoSize: number; logoY: number;
  checkColor: string;
}) => {
  const uid = color.replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `sg-${uid}`;
  const glossId = `sgl-${uid}`;
  const facetL = `sf-l-${uid}`;
  const facetR = `sf-r-${uid}`;
  const facetT = `sf-t-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 38"
      width={width}
      height={height}
      style={{ display: 'block', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}
    >
      <defs>
        {/* Main gradient */}
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
        {/* Top gloss */}
        <linearGradient id={glossId} x1="0.5" y1="0" x2="0.5" y2="0.6">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Left facet — lighter */}
        <linearGradient id={facetL} x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%" stopColor="white" stopOpacity="0.3" />
          <stop offset="100%" stopColor="white" stopOpacity="0.05" />
        </linearGradient>
        {/* Right facet — darker */}
        <linearGradient id={facetR} x1="1" y1="0" x2="0" y2="0.5">
          <stop offset="0%" stopColor="black" stopOpacity="0.15" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </linearGradient>
        {/* Top facet highlight */}
        <linearGradient id={facetT} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Base shield shape */}
      <path
        d="M16 1L2 7v11c0 9.5 6.2 17.4 14 19.5 7.8-2.1 14-10 14-19.5V7L16 1z"
        fill={`url(#${gradId})`}
        stroke={darkColor}
        strokeWidth="0.8"
      />

      {/* Diamond facet: top triangle highlight */}
      <path d="M16 1L2 7 16 13 30 7z" fill={`url(#${facetT})`} />

      {/* Diamond facet: left panel */}
      <path d="M2 7v11c0 4 1.5 8 4 11.5L16 13z" fill={`url(#${facetL})`} />

      {/* Diamond facet: right panel */}
      <path d="M30 7v11c0 4-1.5 8-4 11.5L16 13z" fill={`url(#${facetR})`} />

      {/* Center line for diamond cut effect */}
      <path d="M16 13v24.5" stroke="white" strokeWidth="0.3" strokeOpacity="0.25" />

      {/* Top gloss overlay */}
      <path
        d="M16 1L2 7v11c0 9.5 6.2 17.4 14 19.5 7.8-2.1 14-10 14-19.5V7L16 1z"
        fill={`url(#${glossId})`}
      />

      {/* Sparkle accents for diamond effect */}
      <circle cx="10" cy="10" r="0.6" fill="white" opacity="0.7" />
      <circle cx="22" cy="10" r="0.4" fill="white" opacity="0.5" />
      <circle cx="16" cy="6" r="0.5" fill="white" opacity="0.6" />

      {/* Logo */}
      <image
        href={logoUrl}
        x={16 - logoSize / 2}
        y={logoY}
        width={logoSize}
        height={logoSize}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Checkmark badge */}
      <circle cx="25" cy="30" r="5" fill="white" />
      <circle cx="25" cy="30" r="4" fill={checkColor} />
      <path d="M23 30l1.5 1.5 3-3" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
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

  const shieldColor = levelConfig?.shieldColor || "#2563eb";
  const shieldLight = levelConfig?.shieldLight || "#60a5fa";
  const shieldDark = levelConfig?.shieldDark || "#1d4ed8";
  const checkColor = levelConfig?.shieldColor || "#22c55e";
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
      <Shield3DIcon
        color={shieldColor}
        lightColor={shieldLight}
        darkColor={shieldDark}
        width={sizeConfig.width}
        height={sizeConfig.height}
        logoUrl={brandLogo}
        logoSize={sizeConfig.logoSize}
        logoY={sizeConfig.logoY}
        checkColor={checkColor}
      />
      {size !== "xs" && (
        <span
          className={cn(
            sizeConfig.fontSize,
            "font-bold tracking-tight leading-none whitespace-nowrap px-1.5 py-0.5 rounded-full text-white"
          )}
          style={{ backgroundColor: shieldColor }}
        >
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