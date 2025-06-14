
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface SearchLoadingAnimationProps {
  language: "en" | "id";
}

const SearchLoadingAnimation = ({ language }: SearchLoadingAnimationProps) => {
  const [progress, setProgress] = useState(0);

  const text = {
    en: {
      searching: "Searching properties...",
      analyzing: "Analyzing results..."
    },
    id: {
      searching: "Mencari properti...",
      analyzing: "Menganalisis hasil..."
    }
  };

  const currentText = text[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {/* Animated ASTRA Villa Logo */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">
          <span className="inline-block animate-gradient bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 bg-clip-text text-transparent bg-[length:300%_300%]">
            ASTRA Villa
          </span>
        </h1>
        <p className="text-lg text-muted-foreground animate-pulse">
          {progress < 70 ? currentText.searching : currentText.analyzing}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>0%</span>
          <span>{Math.round(progress)}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Loading Dots */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default SearchLoadingAnimation;
