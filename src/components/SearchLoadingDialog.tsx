import React, { useEffect, useState } from 'react';
import { TableStyleDialog, TableStats } from "@/components/ui/TableStyleDialog";
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
        setTimeout(() => onOpenChange(false), 500);
      }, 3000);

      return () => {
        clearInterval(interval);
        clearInterval(countInterval);
        clearTimeout(timeout);
      };
    }
  }, [open, onOpenChange]);

  return (
    <TableStyleDialog
      open={open}
      onOpenChange={onOpenChange}
      title="ASTRA Villa AI Search"
      description="Intelligent Property Discovery Engine"
      icon={Bot}
      maxWidth="2xl"
      showProgress={{ value: Math.round(progress) }}
      sections={searchQuery ? [
        {
          rows: [
            {
              label: "Query",
              value: <span className="font-medium">{searchQuery}</span>,
              icon: Search
            }
          ]
        }
      ] : []}
      footer={
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <p className="text-xs text-muted-foreground">
            Powered by ASTRA AI • Advanced Property Matching Algorithms
          </p>
        </div>
      }
    >
      {/* Progress Status */}
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
                  <p className="text-center text-sm text-muted-foreground animate-pulse font-medium">
                    {currentStep}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Search Statistics */}
      {searchCount !== null && (
        <TableStats
          stats={[
            {
              label: "Properties Scanned",
              value: <span className="text-2xl font-bold text-primary">{searchCount}</span>
            },
            {
              label: "AI Confidence Score",
              value: <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
            }
          ]}
        />
      )}
    </TableStyleDialog>
  );
};
