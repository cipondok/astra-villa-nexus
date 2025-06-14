
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface LoadingPopupProps {
  isOpen: boolean;
  message?: string;
  language?: "en" | "id";
}

const LoadingPopup = ({ isOpen, message, language = "en" }: LoadingPopupProps) => {
  const [progress, setProgress] = useState(0);

  const text = {
    en: {
      loading: "Loading...",
      processing: "Processing your request..."
    },
    id: {
      loading: "Memuat...",
      processing: "Memproses permintaan Anda..."
    }
  };

  const currentText = text[language];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 150);

    return () => {
      clearInterval(timer);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-none">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          {/* Animated ASTRA Villa Logo */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">
              <span className="inline-block animate-gradient bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 bg-clip-text text-transparent bg-[length:300%_300%]">
                ASTRA Villa
              </span>
            </h1>
            <p className="text-lg text-muted-foreground animate-pulse">
              {message || currentText.processing}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-sm space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span>{Math.round(progress)}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Loading Dots */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingPopup;
