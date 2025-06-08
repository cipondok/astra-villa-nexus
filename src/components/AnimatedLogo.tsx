
import React from "react";

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo = ({ className = "" }: AnimatedLogoProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Animated Colorful Text Only */}
      <div>
        <h1 className="text-xl font-bold relative overflow-hidden">
          <span className="inline-block animate-gradient bg-gradient-to-r from-ios-blue via-ios-purple via-ios-pink to-ios-orange bg-clip-text text-transparent bg-[length:300%_300%] hover:scale-105 transition-transform duration-300">
            Astra Villa
          </span>
        </h1>
        <p className="text-xs text-muted-foreground animate-fade-in opacity-80 hover:opacity-100 transition-opacity duration-300">
          AI-Powered Real Estate
        </p>
      </div>
    </div>
  );
};

export default AnimatedLogo;
