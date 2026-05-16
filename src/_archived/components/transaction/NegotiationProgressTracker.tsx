import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Clock, MessageSquare, FileText, 
  Scale, Handshake, AlertCircle, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NegotiationStage = 'offer_submitted' | 'under_review' | 'counter_offer' | 'negotiating' | 'accepted' | 'legal_process' | 'closing' | 'completed';

interface NegotiationStep {
  id: NegotiationStage;
  label: string;
  icon: typeof CheckCircle2;
  description: string;
}

const STEPS: NegotiationStep[] = [
  { id: 'offer_submitted', label: 'Offer Sent', icon: MessageSquare, description: 'Your offer has been submitted to the seller' },
  { id: 'under_review', label: 'Under Review', icon: Clock, description: 'Seller is reviewing your offer' },
  { id: 'negotiating', label: 'Negotiating', icon: Scale, description: 'Active negotiation in progress' },
  { id: 'accepted', label: 'Accepted', icon: Handshake, description: 'Both parties have agreed on terms' },
  { id: 'legal_process', label: 'Legal Process', icon: FileText, description: 'Document preparation and legal review' },
  { id: 'closing', label: 'Closing', icon: CheckCircle2, description: 'Final transaction settlement' },
];

interface NegotiationProgressTrackerProps {
  currentStage: NegotiationStage;
  offerPrice: number;
  listPrice: number;
  daysElapsed: number;
  nextAction?: string;
  nextActionDate?: string;
  onActionClick?: () => void;
}

function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

export default function NegotiationProgressTracker({
  currentStage,
  offerPrice,
  listPrice,
  daysElapsed,
  nextAction,
  nextActionDate,
  onActionClick,
}: NegotiationProgressTrackerProps) {
  const currentIdx = STEPS.findIndex(s => s.id === currentStage);
  const progressPct = Math.min(100, ((currentIdx + 1) / STEPS.length) * 100);

  return (
    <Card className="border border-primary/10 bg-card rounded-xl overflow-hidden">
      <CardHeader className="p-3 pb-2 bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Negotiation Progress
          </span>
          <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 text-primary border-primary/30">
            Day {daysElapsed}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Progress Bar */}
        <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute h-full bg-gradient-to-r from-primary to-chart-2 rounded-full"
          />
        </div>

        {/* Steps */}
        <div className="space-y-1">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isFuture = idx > currentIdx;
            const StepIcon = step.icon;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all',
                  isCurrent && 'bg-primary/5 border border-primary/15',
                  isCompleted && 'opacity-60',
                  isFuture && 'opacity-30'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                  isCompleted && 'bg-chart-2/15',
                  isCurrent && 'bg-primary/15',
                  isFuture && 'bg-muted'
                )}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-3 w-3 text-chart-2" />
                  ) : (
                    <StepIcon className={cn('h-3 w-3', isCurrent ? 'text-primary' : 'text-muted-foreground')} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-[11px] font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-[9px] text-muted-foreground">{step.description}</p>
                  )}
                </div>
                {isCurrent && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Price Summary */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
          <div className="bg-muted/20 rounded-lg p-2 text-center">
            <p className="text-[9px] text-muted-foreground">Your Offer</p>
            <p className="text-xs font-bold text-foreground">{formatPrice(offerPrice)}</p>
          </div>
          <div className="bg-muted/20 rounded-lg p-2 text-center">
            <p className="text-[9px] text-muted-foreground">List Price</p>
            <p className="text-xs font-bold text-muted-foreground">{formatPrice(listPrice)}</p>
          </div>
        </div>

        {/* Next Action Alert */}
        {nextAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-2.5 flex items-start gap-2"
          >
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-foreground">{nextAction}</p>
              {nextActionDate && (
                <p className="text-[9px] text-muted-foreground">Due: {nextActionDate}</p>
              )}
            </div>
            {onActionClick && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-[9px] px-2 text-primary"
                onClick={onActionClick}
              >
                Action <ChevronRight className="h-2.5 w-2.5" />
              </Button>
            )}
          </motion.div>
        )}

        {/* Legal Support Prompt */}
        {(currentStage === 'accepted' || currentStage === 'legal_process') && (
          <div className="bg-primary/5 border border-primary/10 rounded-lg p-2.5 flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <div className="flex-1">
              <p className="text-[10px] font-medium text-foreground">Need legal support?</p>
              <p className="text-[9px] text-muted-foreground">AI Document Verifier available for contract review</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[9px] px-2 border-primary/20 text-primary"
              onClick={() => window.location.href = '/document-verifier'}
            >
              Open
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
