import React from "react";
import astraLogo from "@/assets/astra-logo.png";

interface AnimatedLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const AnimatedLogo = ({ className = "", size = "md" }: AnimatedLogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10 md:h-12",
    lg: "h-16 md:h-20"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={astraLogo} 
        alt="ASTRA Villa" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </div>
  );
};

export default AnimatedLogo;
