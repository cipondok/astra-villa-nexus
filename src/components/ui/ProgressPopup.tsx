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
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-[9998] w-[calc(100%-2rem)] max-w-md",
        "transition-all duration-300 ease-out",
        isVisible ? "animate-fade-in translate-y-0" : "animate-fade-out translate-y-4"
      )}
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl border border-white/20 overflow-hidden backdrop-blur-xl">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold text-sm">{title}</h4>
                <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-white/80 text-xs mt-0.5">{description}</p>
            </div>
            <div className="text-white font-bold text-lg tabular-nums">
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
