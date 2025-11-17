import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressPopupProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  duration?: number;
}

const ProgressPopup = ({ 
  isVisible, 
  title = "Loading Properties", 
  description = "Please wait...",
  duration = 3000 
}: ProgressPopupProps) => {
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + (100 / (duration / 50)); // Update every 50ms
        });
      }, 50);

      return () => clearInterval(interval);
    } else {
      // Delay hiding to show completion
      const timer = setTimeout(() => setShow(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed z-[9999] w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-sm sm:max-w-md",
        "transition-all duration-300 ease-out",
        isVisible ? "animate-fade-in translate-y-0" : "animate-fade-out translate-y-4"
      )}
      style={{ 
        bottom: 'calc(0.5rem + env(safe-area-inset-bottom))', 
        right: 'calc(0.5rem + env(safe-area-inset-right))' 
      }}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl">
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h4 className="text-white font-semibold text-xs sm:text-sm truncate">{title}</h4>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 animate-pulse flex-shrink-0" />
              </div>
              <p className="text-white/80 text-[10px] sm:text-xs mt-0.5 truncate">{description}</p>
            </div>
            <div className="text-white font-bold text-sm sm:text-lg tabular-nums flex-shrink-0">
              {Math.round(progress)}%
            </div>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-white/20 [&>div]:bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressPopup;
