import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, Search, BarChart3, MapPin, Calculator, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Brain;
  ctaLabel: string;
  route: string;
  color: string;
  bgColor: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 'discover',
    title: 'Discover Opportunities',
    description: 'Tell me what you\'re looking for — AI finds the best matches across thousands of listings',
    icon: Search,
    ctaLabel: 'Start AI Search',
    route: '/ai-search',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 'analyze',
    title: 'Analyze & Compare',
    description: 'Get instant ROI projections, fair value estimates, and side-by-side comparisons',
    icon: BarChart3,
    ctaLabel: 'Open Deal Finder',
    route: '/deal-finder',
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
  },
  {
    id: 'explore',
    title: 'Explore Location Intel',
    description: 'Understand neighborhood dynamics, growth forecasts, and demand hotspots',
    icon: MapPin,
    ctaLabel: 'View Heatmap',
    route: '/location-intelligence',
    color: 'text-chart-4',
    bgColor: 'bg-chart-4/10',
  },
  {
    id: 'calculate',
    title: 'Simulate Financials',
    description: 'Calculate mortgage scenarios, rental yields, and long-term investment returns',
    icon: Calculator,
    ctaLabel: 'Try Calculator',
    route: '/kpr-calculator',
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
  },
];

/**
 * AIJourneyGuide — Conversational stepper that guides users through
 * the property evaluation workflow. Each step reveals the next,
 * creating a progressive disclosure journey.
 */
export default function AIJourneyGuide({ className }: { className?: string }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const handleStepAction = (step: JourneyStep, index: number) => {
    setCompletedSteps(prev => new Set([...prev, step.id]));
    navigate(step.route);
  };

  return (
    <Card className={cn('border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden', className)}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
            <Brain className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              AI Property Journey
              <Sparkles className="h-3 w-3 text-chart-3" />
            </h3>
            <p className="text-[10px] text-muted-foreground">Your guided path to smart decisions</p>
          </div>
        </div>

        {/* Steps */}
        <div className="px-4 pb-4 space-y-1.5">
          {JOURNEY_STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = activeStep === i;
            const isCompleted = completedSteps.has(step.id);
            const isLocked = i > activeStep + 1 && !completedSteps.has(JOURNEY_STEPS[i - 1]?.id);

            return (
              <motion.div
                key={step.id}
                layout
                className={cn(
                  'rounded-xl border transition-all duration-200 cursor-pointer',
                  isActive
                    ? 'border-primary/20 bg-primary/[0.03] shadow-sm'
                    : isCompleted
                    ? 'border-chart-2/15 bg-chart-2/[0.02]'
                    : 'border-border/30 hover:border-border/50'
                )}
                onClick={() => !isLocked && setActiveStep(i)}
              >
                <div className="flex items-center gap-3 px-3 py-3">
                  {/* Step indicator */}
                  <div className={cn(
                    'shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
                    isCompleted ? 'bg-chart-2/15' : step.bgColor,
                  )}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-chart-2" />
                    ) : (
                      <Icon className={cn('h-4 w-4', step.color)} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs font-semibold truncate',
                      isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                    )}>
                      {step.title}
                    </p>
                    {!isActive && (
                      <p className="text-[10px] text-muted-foreground truncate">{step.description.slice(0, 50)}...</p>
                    )}
                  </div>

                  <ChevronRight className={cn(
                    'shrink-0 h-4 w-4 text-muted-foreground/30 transition-transform',
                    isActive && 'rotate-90'
                  )} />
                </div>

                {/* Expanded content */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3 pb-3 pt-0">
                        <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed">
                          {step.description}
                        </p>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepAction(step, i);
                          }}
                          className="h-8 text-xs gap-1.5 w-full"
                        >
                          {step.ctaLabel}
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground">Journey Progress</span>
            <span className="text-[10px] font-semibold text-foreground">{completedSteps.size}/{JOURNEY_STEPS.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
              animate={{ width: `${(completedSteps.size / JOURNEY_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
