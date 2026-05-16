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
  xs: { width: 22, height: 22, logoSize: 14, fontSize: "text-[8px]", gap: "gap-0.5" },
  sm: { width: 28, height: 28, logoSize: 18, fontSize: "text-[9px]", gap: "gap-1" },
  md: { width: 34, height: 34, logoSize: 22, fontSize: "text-[10px]", gap: "gap-1" },
  lg: { width: 42, height: 42, logoSize: 28, fontSize: "text-[11px]", gap: "gap-1.5" },
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

// 3D Shield Badge Icon with embedded logo
const Shield3DBadgeIcon = ({
  color, lightColor, darkColor, width, height, logoUrl, logoSize,
}: {
  color: string; lightColor: string; darkColor: string;
  width: number; height: number; logoUrl: string; logoSize: number;
}) => {
  const uid = color.replace(/[^a-zA-Z0-9]/g, "") + width;
  const gradMain = `sh-main-${uid}`;
  const gradShine = `sh-shine-${uid}`;
  const gradDark = `sh-dark-${uid}`;
  const gradInner = `sh-inner-${uid}`;
  const filterId = `wf-${uid}`;
  const shadowId = `sh-shadow-${uid}`;

  const shieldOuter = "M20,2 C20,2 6,6 6,6 C6,6 4,8 4,10 L4,18 C4,26 10,33 20,38 C30,33 36,26 36,18 L36,10 C36,8 34,6 34,6 Z";
  const shieldInner = "M20,5 C20,5 8,8.5 8,8.5 C8,8.5 7,10 7,11.5 L7,18.5 C7,25 12,31 20,35.5 C28,31 33,25 33,18.5 L33,11.5 C33,10 32,8.5 32,8.5 Z";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      width={width}
      height={height}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gradMain} x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
        <linearGradient id={gradShine} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity={0.45} />
          <stop offset="40%" stopColor="white" stopOpacity={0.08} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <linearGradient id={gradDark} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={darkColor} stopOpacity={0.6} />
          <stop offset="100%" stopColor={darkColor} stopOpacity={0.9} />
        </linearGradient>
        <radialGradient id={gradInner} cx="0.5" cy="0.4" r="0.6">
          <stop offset="0%" stopColor={darkColor} stopOpacity={0.15} />
          <stop offset="100%" stopColor={darkColor} stopOpacity={0.45} />
        </radialGradient>
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="white" />
          <feGaussianBlur in="white" stdDeviation="0.4" result="blurred" />
          <feSpecularLighting in="blurred" surfaceScale="4" specularConstant="0.9" specularExponent="25" lightingColor="white" result="spec">
            <fePointLight x="12" y="8" z="18" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut" />
          <feComposite in="white" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="0.7" k4="0" />
        </filter>
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" floodColor={darkColor} floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Shadow layer */}
      <path d={shieldOuter} fill="rgba(0,0,0,0.18)" transform="translate(0,1.2)" />

      {/* Outer shield body */}
      <path d={shieldOuter} fill={`url(#${gradMain})`} filter={`url(#${shadowId})`} />

      {/* Left-edge dark bevel */}
      <path
        d="M20,2 C20,2 6,6 6,6 C6,6 4,8 4,10 L4,18 C4,26 10,33 20,38 L20,5 C20,5 8,8.5 8,8.5 C8,8.5 7,10 7,11.5 L7,18.5 C7,25 12,31 20,35.5 Z"
        fill={darkColor} opacity="0.18"
      />

      {/* Right-edge lighter side */}
      <path
        d="M20,2 C20,2 34,6 34,6 C34,6 36,8 36,10 L36,18 C36,26 30,33 20,38 L20,5 C20,5 32,8.5 32,8.5 C32,8.5 33,10 33,11.5 L33,18.5 C33,25 28,31 20,35.5 Z"
        fill={lightColor} opacity="0.12"
      />

      {/* Inner recessed area */}
      <path d={shieldInner} fill={`url(#${gradInner})`} />

      {/* Glossy top highlight */}
      <path d={shieldOuter} fill={`url(#${gradShine})`} />

      {/* Rim highlight */}
      <path
        d="M20,3 C20,3 7,6.8 7,6.8 Q5.5,8 5.5,10 L5.5,11 Q14,8 20,6.5 Q26,8 34.5,11 L34.5,10 Q34.5,8 33,6.8 Z"
        fill="white" opacity="0.22"
      />

      {/* Logo centered, embossed white */}
      <image
        href={logoUrl}
        x={20 - logoSize / 2}
        y={17 - logoSize / 2}
        width={logoSize}
        height={logoSize}
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#${filterId})`}
      />

      {/* Embossed outline glow on logo */}
      <image
        href={logoUrl}
        x={20 - logoSize / 2}
        y={17 - logoSize / 2}
        width={logoSize}
        height={logoSize}
        preserveAspectRatio="xMidYMid meet"
        filter={`url(#${filterId})`}
        opacity="0.3"
        style={{ mixBlendMode: "overlay" }}
      />

      {/* Checkmark circle */}
      <circle cx="30" cy="31" r="6.5" fill="white" />
      <circle cx="30" cy="31" r="5.5" fill={color} />
      <path d="M27.5 31l1.8 1.8 3.2-3.2" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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
      <Shield3DBadgeIcon
        color={shieldColor}
        lightColor={shieldLight}
        darkColor={shieldDark}
        width={sizeConfig.width}
        height={sizeConfig.height}
        logoUrl={logoUrl}
        logoSize={sizeConfig.logoSize}
      />
      {resolvedSize !== "xs" && settings.showBadgeText && (
        <span
          className={cn(
            sizeConfig.fontSize,
            "font-extrabold tracking-tight leading-none whitespace-nowrap",
            settings.badgeTextStyle === "pill"
              ? "px-1.5 py-0.5 rounded-full"
              : ""
          )}
          style={
            settings.badgeTextStyle === "pill"
              ? {
                  background: `linear-gradient(135deg, ${shieldLight}, ${shieldColor}, ${shieldDark})`,
                  color: "white",
                  textShadow: `0 1px 2px rgba(0,0,0,0.4), 0 0 4px ${shieldColor}40`,
                }
              : {
                  background: `linear-gradient(135deg, ${shieldLight}, ${shieldColor}, ${shieldDark})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: `0 1px 1px rgba(0,0,0,0.15)`,
                  filter: `drop-shadow(0 1px 1px ${shieldDark}50)`,
                }
          }
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
