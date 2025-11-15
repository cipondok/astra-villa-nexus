
import React from "react";
import { Icons } from "./icons";

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo = ({ className = "" }: AnimatedLogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icons.aiLogo className="w-8 h-8" />
      <h1 className="text-xl font-bold">
        <span className="text-foreground">
          ASTRA AI
        </span>
      </h1>
    </div>
  );
};

export default AnimatedLogo;
