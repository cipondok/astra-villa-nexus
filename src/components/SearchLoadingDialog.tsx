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
          const newProgress = Math.min(prev + (100 / 30), 95);
          
          const stepIndex = Math.floor((newProgress / 100) * searchSteps.length);
          if (stepIndex < searchSteps.length) {
            setCurrentStep(searchSteps[stepIndex]);
          }
          
          return newProgress;
        });
      }, 100);

      const countInterval = setInterval(() => {
        setSearchCount(prev => {
          if (prev === null) return Math.floor(Math.random() * 50) + 20;
          return Math.max(1, prev - Math.floor(Math.random() * 5));
        });
      }, 300);

      const timeout = setTimeout(() => {
        setProgress(100);
        setCurrentStep("Search completed!");
        setTimeout(() => {
          onOpenChange(false);
        }, 500);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearInterval(countInterval);
        clearTimeout(timeout);
      };
    }
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card/100 border-2 border-primary/20 p-0 shadow-2xl animate-macos-window-in backdrop-blur-none overflow-hidden">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/50 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                  <Bot className="h-7 w-7 text-primary-foreground" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-bounce" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary/30 rounded-full animate-ping" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">ASTRA Villa AI Search</h3>
                <p className="text-sm text-muted-foreground">Intelligent Property Discovery Engine</p>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4">
          {searchQuery && (
            <div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="px-4 py-3 w-32 bg-muted/20 font-semibold text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        Query
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{searchQuery}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="px-4 py-3 bg-muted/20" colSpan={2}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-sm font-semibold text-foreground">Processing Status</span>
                      </div>
                      <span className="text-xs font-semibold text-primary px-2 py-1 bg-primary/10 rounded-full">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4" colSpan={2}>
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2.5" />
                      <p className="text-center text-sm text-muted-foreground animate-pulse font-medium">{currentStep}</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {searchCount !== null && (
            <div className="bg-muted/30 rounded-lg border border-border/50 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase">Metric</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-foreground uppercase">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">Properties Scanned</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-2xl font-bold text-primary">{searchCount}</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground">AI Confidence Score</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-muted/20 border-t border-border/50 px-6 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs text-muted-foreground">Powered by ASTRA AI • Advanced Property Matching Algorithms</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
