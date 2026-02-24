
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

interface SearchLoadingAnimationProps {
  language: "en" | "id" | "zh" | "ja" | "ko";
}

const SearchLoadingAnimation = ({ language }: SearchLoadingAnimationProps) => {
  const [progress, setProgress] = useState(0);

  // Use centralized translations via key access
  const searchingText = language === 'id' ? 'Mencari properti...' : language === 'zh' ? '搜索房产中...' : language === 'ja' ? '物件を検索中...' : language === 'ko' ? '부동산 검색 중...' : 'Searching properties...';
  const analyzingText = language === 'id' ? 'Menganalisis hasil...' : language === 'zh' ? '分析结果中...' : language === 'ja' ? '結果を分析中...' : language === 'ko' ? '결과 분석 중...' : 'Analyzing results...';

  const currentText = { searching: searchingText, analyzing: analyzingText };

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
          <span className="inline-block animate-gradient bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent bg-[length:300%_300%]">
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
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-chart-3 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default SearchLoadingAnimation;
