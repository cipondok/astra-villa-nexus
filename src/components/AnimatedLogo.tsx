import React from "react";
import astraLogo from "@/assets/astra-logo.png";

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo = ({ className = "" }: AnimatedLogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src={astraLogo} alt="ASTRA AI Logo" className="w-8 h-8" />
      <h1 className="text-xl font-bold">
        <span className="text-foreground">
          ASTRA AI
        </span>
      </h1>
    </div>
  );
};

export default AnimatedLogo;
