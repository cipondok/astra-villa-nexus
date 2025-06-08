
import React from "react";

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo = ({ className = "" }: AnimatedLogoProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Simple Text Logo Only */}
      <div>
        <h1 className="text-xl font-bold relative overflow-hidden">
          <span className="inline-block animate-gradient bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:300%_300%] hover:scale-105 transition-transform duration-300">
            Astra Villa
          </span>
        </h1>
      </div>
    </div>
  );
};

export default AnimatedLogo;
