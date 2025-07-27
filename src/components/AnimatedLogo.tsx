
import React from "react";

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo = ({ className = "" }: AnimatedLogoProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Simple Text Logo - No Animation */}
      <div>
        <h1 className="text-xl font-bold">
          <span className="text-foreground">
            Start
          </span>
        </h1>
      </div>
    </div>
  );
};

export default AnimatedLogo;
