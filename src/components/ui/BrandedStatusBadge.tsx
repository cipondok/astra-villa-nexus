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
  xs: { width: 22, height: 26, logoSize: 13, logoY: 6, fontSize: "text-[8px]", gap: "gap-0.5" },
  sm: { width: 28, height: 32, logoSize: 16, logoY: 8, fontSize: "text-[9px]", gap: "gap-1" },
  md: { width: 34, height: 40, logoSize: 20, logoY: 9, fontSize: "text-[10px]", gap: "gap-1" }
};

const getLevelConfig = (level?: string) => {
  if (!level) return null;
  const lower = level.toLowerCase();
  for (const [key, config] of Object.entries(LEVEL_CONFIG)) {
    if (lower.includes(key)) return config;
  }
  return null;
};

// 3D Shield with embedded logo — checkmark color matches shield tier
const Shield3DIcon = ({ color, lightColor, darkColor, width, height, logoUrl, logoSize, logoY, checkColor }: {
  color: string; lightColor: string; darkColor: string;
  width: number; height: number; logoUrl: string; logoSize: number; logoY: number;
  checkColor: string;
}) => {
  const uid = color.replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `sg-${uid}`;
  const glossId = `sgl-${uid}`;
  const shadowId = `ss-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 38"
      width={width}
      height={height}
      style={{ display: 'block', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
        <linearGradient id={glossId} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="40%" stopColor="white" stopOpacity="0.1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={shadowId} cx="0.5" cy="1" r="0.7">
          <stop offset="0%" stopColor="black" stopOpacity="0.2" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Shield */}
      <path
        d="M16 1L2 7v11c0 9.5 6.2 17.4 14 19.5 7.8-2.1 14-10 14-19.5V7L16 1z"
        fill={`url(#${gradId})`}
        stroke={darkColor}
        strokeWidth="0.8"
      />
      <path
        d="M16 1L2 7v11c0 9.5 6.2 17.4 14 19.5 7.8-2.1 14-10 14-19.5V7L16 1z"
        fill={`url(#${glossId})`}
      />
      <path
        d="M16 1L2 7v11c0 9.5 6.2 17.4 14 19.5 7.8-2.1 14-10 14-19.5V7L16 1z"
        fill={`url(#${shadowId})`}
      />

      {/* White circle background for logo */}
      <circle cx="16" cy={logoY + logoSize / 2} r={logoSize / 2 + 1.5} fill="white" opacity="0.9" />

      {/* Logo */}
      <image
        href={logoUrl}
        x={16 - logoSize / 2}
        y={logoY}
        width={logoSize}
        height={logoSize}
        preserveAspectRatio="xMidYMid meet"
      />

      {/* Checkmark badge — color matches tier */}
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