import React from "react";
import fallbackLogo from "@/assets/astra-logo.png";

// Preconnect hint for logo loading - emitted once globally
if (typeof document !== 'undefined' && !document.querySelector('link[rel="preload"][as="image"][data-logo]')) {
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'image';
  preload.href = fallbackLogo;
  preload.setAttribute('data-logo', '1');
  document.head.appendChild(preload);
}

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
        src={src || fallbackLogo}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        width={120}
        height={48}
        className={`${sizeClasses[size]} w-auto object-contain`}
        onError={(e) => {
          // Fallback if the configured URL is invalid / blocked / not public
          e.currentTarget.src = fallbackLogo;
        }}
      />
    </div>
  );
};

export default AnimatedLogo;

