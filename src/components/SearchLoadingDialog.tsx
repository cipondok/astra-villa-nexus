import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Bot, Search, Sparkles } from "lucide-react";

interface SearchLoadingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery?: string;
}

export const SearchLoadingDialog: React.FC<SearchLoadingDialogProps> = ({
  open,
  onOpenChange,
  searchQuery = ""
}) => {
  const [progress, setProgress] = useState(0);
  const [searchCount, setSearchCount] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState("Initializing search...");

  const searchSteps = [
    "Initializing ASTRA AI search...",
    "Analyzing your preferences...",
    "Scanning property database...",
    "Applying intelligent filters...",
    "Ranking best matches...",
    "Finalizing results..."
  ];

  useEffect(() => {
    if (open) {
      setProgress(0);
      setSearchCount(null);
      setCurrentStep(searchSteps[0]);

      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 15 + 5, 95);
          
          // Update step based on progress
          const stepIndex = Math.floor((newProgress / 100) * searchSteps.length);
          if (stepIndex < searchSteps.length) {
            setCurrentStep(searchSteps[stepIndex]);
          }
          
          return newProgress;
        });
      }, 300);

      // Simulate search count updates
      const countInterval = setInterval(() => {
        setSearchCount(prev => {
          if (prev === null) return Math.floor(Math.random() * 50) + 20;
          return Math.max(1, prev - Math.floor(Math.random() * 5));
        });
      }, 400);

      // Complete after 2-3 seconds
      const timeout = setTimeout(() => {
        setProgress(100);
        setCurrentStep("Search completed!");
        setTimeout(() => {
          onOpenChange(false);
        }, 800);
      }, 2500);

      return () => {
        clearInterval(interval);
        clearInterval(countInterval);
        clearTimeout(timeout);
      };
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background border border-primary/20 p-0 shadow-2xl animate-scale-in">
        <div className="flex flex-col items-center justify-center px-8 py-10 space-y-6">
          {/* ASTRA AI Logo with Animation */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-pulse">
              <Bot className="h-8 w-8 text-primary-foreground" />
            </div>
            {/* Floating sparkles */}
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary animate-bounce" />
            <div className="absolute -top-2 -left-2 w-3 h-3 bg-primary/30 rounded-full animate-ping" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-secondary rounded-full animate-pulse" />
          </div>

          {/* ASTRA Villa Branding */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ASTRA Villa
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              AI-Powered Property Search
            </p>
          </div>

          {/* Search Query Display */}
          {searchQuery && (
            <div className="bg-muted/50 rounded-lg px-4 py-2 border border-primary/10">
              <div className="flex items-center gap-2 text-sm">
                <Search className="h-3 w-3 text-primary" />
                <span className="text-muted-foreground">Searching for:</span>
                <span className="font-medium text-foreground">"{searchQuery}"</span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="w-full space-y-3">
            <Progress 
              value={progress} 
              className="h-2 bg-muted/50"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              {searchCount !== null && (
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  {searchCount} properties found
                </span>
              )}
            </div>
          </div>

          {/* Current Step */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground animate-fade-in">
              {currentStep}
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};