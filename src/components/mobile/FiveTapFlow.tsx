import React, { useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Five-Tap Flow Component
 * Ensures any key action can be completed in maximum 5 taps:
 * 1. Initiate action
 * 2. Select option (if needed)
 * 3. Review/Confirm
 * 4. Execute
 * 5. Confirmation
 */

interface FlowStep {
  id: string;
  title: string;
  subtitle?: string;
  content: ReactNode | ((props: FlowStepProps) => ReactNode);
  validation?: () => boolean | string;
  skipable?: boolean;
}

interface FlowStepProps {
  next: () => void;
  prev: () => void;
  complete: () => void;
  setData: (key: string, value: any) => void;
  getData: (key: string) => any;
}

interface FiveTapFlowProps {
  steps: FlowStep[];
  onComplete: (data: Record<string, any>) => void;
  onCancel?: () => void;
  className?: string;
}

const FiveTapFlow: React.FC<FiveTapFlowProps> = ({
  steps,
  onComplete,
  onCancel,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [flowData, setFlowData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalSteps = Math.min(steps.length, 5); // Enforce max 5 steps
  const activeSteps = steps.slice(0, 5);
  const step = activeSteps[currentStep];

  const setData = useCallback((key: string, value: any) => {
    setFlowData(prev => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  const getData = useCallback((key: string) => {
    return flowData[key];
  }, [flowData]);

  const next = useCallback(() => {
    if (step.validation) {
      const result = step.validation();
      if (result !== true) {
        setError(typeof result === 'string' ? result : 'Please complete this step');
        return;
      }
    }
    
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    }
  }, [currentStep, totalSteps, step]);

  const prev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  }, [currentStep]);

  const complete = useCallback(() => {
    if (step.validation) {
      const result = step.validation();
      if (result !== true) {
        setError(typeof result === 'string' ? result : 'Please complete this step');
        return;
      }
    }
    
    setIsCompleted(true);
    onComplete(flowData);
  }, [step, flowData, onComplete]);

  const stepProps: FlowStepProps = { next, prev, complete, setData, getData };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Complete!</h3>
        <p className="text-sm text-muted-foreground">Action completed successfully</p>
      </motion.div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header with progress */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <button
          onClick={onCancel}
          className="p-2 -ml-2 text-muted-foreground active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
        
        {/* Step indicator - visual tap count */}
        <div className="flex items-center gap-1.5">
          {activeSteps.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                idx <= currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted"
              )}
            />
          ))}
        </div>
        
        <span className="text-xs text-muted-foreground font-medium">
          {currentStep + 1}/{totalSteps}
        </span>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="p-4"
          >
            {/* Step header */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-foreground">{step.title}</h2>
              {step.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{step.subtitle}</p>
              )}
            </div>

            {/* Step content */}
            <div>
              {typeof step.content === 'function' 
                ? step.content(stepProps) 
                : step.content}
            </div>

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive mt-3"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action zone - thumb friendly */}
      <div 
        className="p-4 border-t border-border/30 bg-card/50"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
      >
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={prev}
              className="flex-1 h-12 active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          
          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={next}
              className="flex-1 h-12 active:scale-95"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={complete}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 active:scale-95"
            >
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
          )}
        </div>
        
        {step.skipable && currentStep < totalSteps - 1 && (
          <button
            onClick={next}
            className="w-full mt-2 py-2 text-sm text-muted-foreground"
          >
            Skip this step
          </button>
        )}
      </div>
    </div>
  );
};

export default FiveTapFlow;
