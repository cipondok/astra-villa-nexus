import { Shield, CheckCircle2, Clock, FileCheck, ArrowRight, BadgeCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EscrowConfidencePanelProps {
  className?: string;
}

const steps = [
  {
    icon: Shield,
    title: 'Secure Escrow Deposit',
    description: 'Your funds are held in a regulated escrow account',
  },
  {
    icon: FileCheck,
    title: 'Property Verification',
    description: 'Legal documents and ownership verified by our team',
  },
  {
    icon: CheckCircle2,
    title: 'Completion & Transfer',
    description: 'Funds released only when all conditions are satisfied',
  },
];

const EscrowConfidencePanel = ({ className }: EscrowConfidencePanelProps) => {
  return (
    <Card className={cn('border-primary/20 bg-primary/5', className)}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">Escrow Protection</h3>
          <Badge variant="secondary" className="text-[10px]">Secure</Badge>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-start gap-3"
            >
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <step.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{step.title}</p>
                <p className="text-[11px] text-muted-foreground">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground/50 mt-2 flex-shrink-0" />
              )}
            </motion.div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your funds remain protected until legal verification and agreement conditions are completed. 
              Full refund available if conditions are not met.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EscrowConfidencePanel;
