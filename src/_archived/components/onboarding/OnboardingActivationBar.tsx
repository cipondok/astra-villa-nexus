import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useActivationMilestones, type ActivationMilestone } from '@/hooks/useActivationMilestones';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Heart, BarChart3, MessageSquare, CheckCircle2, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { type: 'first_search' as ActivationMilestone, label: 'Search Properties', icon: Search, hint: 'Try searching for properties in your preferred city' },
  { type: 'first_save' as ActivationMilestone, label: 'Save to Watchlist', icon: Heart, hint: 'Tap the heart icon on any property you like' },
  { type: 'first_insight_view' as ActivationMilestone, label: 'View AI Insights', icon: BarChart3, hint: 'Open the Investment Insights panel on a property' },
  { type: 'first_inquiry' as ActivationMilestone, label: 'Contact an Agent', icon: MessageSquare, hint: 'Send a message or WhatsApp to start a conversation' },
];

export default function OnboardingActivationBar() {
  const { user } = useAuth();
  const { activationProgress, isNewUser } = useActivationMilestones();
  const [dismissed, setDismissed] = useState(false);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    // Only show for authenticated new users after a short delay
    if (user && isNewUser && !dismissed) {
      const timer = setTimeout(() => setShowBar(true), 2000);
      return () => clearTimeout(timer);
    }
    setShowBar(false);
  }, [user, isNewUser, dismissed]);

  // Don't render if user is fully activated or has dismissed
  if (!showBar || activationProgress.isActivated) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-12 left-0 right-0 z-[9970] px-2 sm:px-4"
      >
        <div className="max-w-3xl mx-auto">
          <div className="bg-card/95 backdrop-blur-xl border border-primary/15 rounded-xl shadow-lg shadow-primary/5 p-3 sm:p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Welcome to ASTRA Villa</p>
                  <p className="text-[10px] text-muted-foreground">Complete these steps to unlock your investor profile</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setDismissed(true)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activationProgress.percentage}%` }}
                className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full"
              />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STEPS.map((step) => {
                const completed = activationProgress.milestones[step.type];
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.type}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg border transition-all',
                      completed
                        ? 'bg-chart-2/5 border-chart-2/20'
                        : 'bg-muted/20 border-border/30'
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4 text-chart-2 flex-shrink-0" />
                    ) : (
                      <StepIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-[10px] font-medium leading-tight',
                        completed ? 'text-chart-2 line-through' : 'text-foreground'
                      )}>
                        {step.label}
                      </p>
                      {!completed && (
                        <p className="text-[8px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                          {step.hint}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress label */}
            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-primary border-primary/20">
                {activationProgress.completed}/{activationProgress.total} completed
              </Badge>
              {activationProgress.completed > 0 && (
                <span className="text-[9px] text-chart-2 font-medium">
                  {activationProgress.completed === 1 ? 'Great start!' : 'Almost there!'}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
