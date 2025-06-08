
import React from "react";
import { Brain } from "lucide-react";

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo = ({ className = "" }: AnimatedLogoProps) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* AI Icon with Animation Effects */}
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-primary via-ios-purple to-ios-pink rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 animate-pulse">
          <Brain className="h-7 w-7 text-white animate-bounce" />
        </div>
        {/* Floating particles around icon */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-ios-blue rounded-full animate-ping"></div>
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-ios-orange rounded-full animate-ping delay-75"></div>
        <div className="absolute top-0 left-0 w-1 h-1 bg-ios-green rounded-full animate-ping delay-150"></div>
      </div>

      {/* Animated Colorful Text */}
      <div className="hidden sm:block">
        <h1 className="text-xl font-bold relative overflow-hidden">
          <span className="inline-block animate-gradient bg-gradient-to-r from-ios-blue via-ios-purple via-ios-pink to-ios-orange bg-clip-text text-transparent bg-[length:300%_300%]">
            Astra Villa
          </span>
        </h1>
        <p className="text-xs text-muted-foreground animate-fade-in">
          AI-Powered Real Estate
        </p>
      </div>
    </div>
  );
};

export default AnimatedLogo;
