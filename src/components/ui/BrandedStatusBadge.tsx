import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHeaderLogo } from "@/hooks/useBrandingLogo";
import { useBadgeSettings } from "@/hooks/useBadgeSettings";

interface BrandedStatusBadgeProps {
  verificationStatus?: string;
  userLevel?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  overrideAnimation?: string;
}

const STATUS_RING: Record<string, { label: string }> = {
  verified: { label: "Verified" },
  approved: { label: "Verified" },
  pending: { label: "Pending" },
  unverified: { label: "Unverified" },
};

const SIZE_MAP = {
  xs: { width: 22, height: 22, logoSize: 10, fontSize: "text-[8px]", gap: "gap-0.5" },
  sm: { width: 28, height: 28, logoSize: 12, fontSize: "text-[9px]", gap: "gap-1" },
  md: { width: 34, height: 34, logoSize: 15, fontSize: "text-[10px]", gap: "gap-1" },
  lg: { width: 42, height: 42, logoSize: 18, fontSize: "text-[11px]", gap: "gap-1.5" },
};

const ANIMATION_CLASSES: Record<string, string> = {
  none: "",
  pulse: "animate-pulse",
  bounce: "animate-bounce",
  glow: "",
  shimmer: "",
};

const getAnimationStyle = (effect: string, glowIntensity: number, color: string): React.CSSProperties => {
  if (effect === "glow") {
    return { filter: `drop-shadow(0 0 ${4 + glowIntensity * 0.08}px ${color})` };
  }
  if (effect === "shimmer") {
    return { animation: "shimmer-badge 2s ease-in-out infinite" };
  }
  return {};
};

/** Generate a seal/starburst SVG path */
const generateSealPath = (
  cx: number, cy: number, outerR: number, innerR: number,
  points: number, smooth: boolean
): string => {
  const totalPoints = points * 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < totalPoints; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }

  if (!smooth) {
    // Sharp starburst
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ") + "Z";
  }

  // Smooth scalloped edges using quadratic curves
  let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length];
    const mid = [(pts[i][0] + next[0]) / 2, (pts[i][1] + next[1]) / 2];
    d += `Q${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)} ${mid[0].toFixed(2)},${mid[1].toFixed(2)}`;
  }
  return d + "Z";
};

// Circular Seal Badge Icon
const SealBadgeIcon = ({
  color, lightColor, darkColor, width, height, logoUrl, logoSize, shieldStyle,
}: {
  color: string; lightColor: string; darkColor: string;
  width: number; height: number; logoUrl: string; logoSize: number;
  shieldStyle: string;
}) => {
  const uid = color.replace(/[^a-zA-Z0-9]/g, "") + width;
  const gradId = `sg-${uid}`;
  const filterId = `wf-${uid}`;

  const vb = 40;
  const cx = vb / 2;
  const cy = vb / 2;

  let sealPath: string;
  if (shieldStyle === "minimal" || shieldStyle === "circle") {
    // Simple circle
    sealPath = `M${cx},${cx - 16}A16,16,0,1,1,${cx},${cx + 16}A16,16,0,1,1,${cx},${cx - 16}Z`;
  } else {
    const points = 14;
    const outerR = 17;
    const innerR = shieldStyle === "diamond" || shieldStyle === "seal" ? 13.5 : 14.8;
    const smooth = shieldStyle === "classic" || shieldStyle === "scallop";
    sealPath = generateSealPath(cx, cy, outerR, innerR, points, smooth);
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${vb} ${vb}`}
      width={width}
      height={height}
      style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
        {/* White colorization filter for the logo */}
        <filter id={filterId}>
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
        </filter>
      </defs>

      {/* Seal shape */}
      <path d={sealPath} fill={`url(#${gradId})`} />

      {/* Subtle inner highlight */}
      <circle cx={cx} cy={cy - 1} r="11" fill="white" opacity="0.08" />

      {/* Logo centered, rendered white */}
      <image
        href={logoUrl}
        x={cx - logoSize / 2}
        y={cy - logoSize / 2 - 1}
        width={logoSize}
        height={logoSize}
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#${filterId})`}
      />

      {/* Checkmark circle at bottom-right */}
      <circle cx="30" cy="30" r="6" fill="white" />
      <circle cx="30" cy="30" r="5" fill={color} />
      <path d="M27.8 30l1.5 1.5 3-3" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const BrandedStatusBadge = ({
  verificationStatus,
  userLevel,
  size,
  className,
  overrideAnimation,
}: BrandedStatusBadgeProps) => {
  const { logoUrl: brandLogo } = useHeaderLogo();
  const { settings } = useBadgeSettings();
  const resolvedSize = size || settings.displaySize || "xs";
  const statusConfig = STATUS_RING[verificationStatus?.toLowerCase() || ""] || STATUS_RING.unverified;
  const sizeConfig = SIZE_MAP[resolvedSize];

  // Find level config from settings
  const lower = userLevel?.toLowerCase() || "";
  let levelConfig = null;
  for (const [key, config] of Object.entries(settings.levels)) {
    if (lower.includes(key)) {
      levelConfig = config;
      break;
    }
  }

  const shieldColor = levelConfig?.shieldColor || "#2563eb";
  const shieldLight = levelConfig?.shieldLight || "#60a5fa";
  const shieldDark = levelConfig?.shieldDark || "#1d4ed8";
  const logoUrl = settings.logoUrl || brandLogo;
  const tooltipLabel = levelConfig ? `Verified · ${levelConfig.label}` : statusConfig.label;

  const animEffect = overrideAnimation ?? settings.animationEffect ?? "none";
  const animClass = ANIMATION_CLASSES[animEffect] || "";
  const animStyle = getAnimationStyle(animEffect, settings.glowIntensity ?? 50, shieldColor);

  const badge = (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeConfig.gap,
        animClass,
        className
      )}
      style={animStyle}
    >
      <SealBadgeIcon
        color={shieldColor}
        lightColor={shieldLight}
        darkColor={shieldDark}
        width={sizeConfig.width}
        height={sizeConfig.height}
        logoUrl={logoUrl}
        logoSize={sizeConfig.logoSize}
        shieldStyle={settings.shieldStyle}
      />
      {resolvedSize !== "xs" && settings.showBadgeText && (
        <span
          className={cn(
            sizeConfig.fontSize,
            "font-bold tracking-tight leading-none whitespace-nowrap",
            settings.badgeTextStyle === "pill"
              ? "px-1.5 py-0.5 rounded-full text-primary-foreground"
              : "text-foreground/80"
          )}
          style={settings.badgeTextStyle === "pill" ? { backgroundColor: shieldColor } : undefined}
        >
          {settings.badgeText}
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
