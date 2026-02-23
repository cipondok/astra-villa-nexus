import React from "react";
import { LOGO_PLACEHOLDER } from "@/hooks/useBrandingLogo";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Optional override (e.g. from system settings). */
  src?: string | null;
  alt?: string;
}

const AnimatedLogo = ({
  className = "",
  size = "md",
  src,
  alt = "ASTRA Villa",
}: AnimatedLogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10 md:h-12",
    lg: "h-16 md:h-20",
  };

  return (
    <div className={`flex items-center ${className}`.trim()}>
      <img
        src={src || LOGO_PLACEHOLDER}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        width={120}
        height={48}
        className={`${sizeClasses[size]} w-auto object-contain`}
        onError={(e) => {
          e.currentTarget.src = LOGO_PLACEHOLDER;
        }}
      />
    </div>
  );
};

export default AnimatedLogo;

