import { Shield, MessageSquare, Clock, TrendingUp, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AgentEscrowToolkitProps {
  dealReadiness: 'not_ready' | 'approaching_agreement' | 'escrow_ready';
  suggestedDeposit: number;
  propertyTitle: string;
  buyerName?: string;
  className?: string;
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

const AgentEscrowToolkit = ({
  dealReadiness,
  suggestedDeposit,
  propertyTitle,
  buyerName = 'Investor',
  className,
}: AgentEscrowToolkitProps) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { toast } = useToast();

  const templates = [
    {
      title: 'Escrow Suggestion',
      message: `Hi ${buyerName}, great news on ${propertyTitle}! To secure this property, I recommend placing a ${formatIDR(suggestedDeposit)} escrow deposit. Your funds will be fully protected until all verification is complete. Shall I guide you through the process?`,
    },
    {
      title: 'Urgency Prompt',
      message: `Hi ${buyerName}, I wanted to let you know there's been increased interest in ${propertyTitle}. To ensure you don't miss out, I'd recommend securing it via escrow today. The deposit is only ${formatIDR(suggestedDeposit)} and is fully refundable if verification conditions aren't met.`,
    },
    {
      title: 'Follow-up',
      message: `Hi ${buyerName}, just following up on ${propertyTitle}. Have you had a chance to consider the escrow reservation? I'm happy to walk you through the security features — your funds remain protected throughout the process.`,
    },
  ];

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast({ title: 'Copied!', description: 'Message template copied to clipboard' });
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const readinessConfig = {
    not_ready: { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Not Ready' },
    approaching_agreement: { color: 'text-chart-4', bg: 'bg-chart-4/10', label: 'Approaching' },
    escrow_ready: { color: 'text-chart-1', bg: 'bg-chart-1/10', label: 'Escrow Ready' },
  };
  const config = readinessConfig[dealReadiness];

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Agent Escrow Toolkit
          </CardTitle>
          <Badge className={cn('text-[10px]', config.bg, config.color)}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Deal readiness indicator */}
        <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-2 text-xs">
          <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-muted-foreground">Suggested deposit:</span>
          <span className="font-semibold text-foreground ml-auto">{formatIDR(suggestedDeposit)}</span>
        </div>

        {/* Message templates */}
        <div className="space-y-2">
          {templates.map((tpl, i) => (
            <div key={tpl.title} className="border border-border/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium">{tpl.title}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => copyToClipboard(tpl.message, i)}
                >
                  {copiedIdx === i ? (
                    <CheckCircle2 className="h-3 w-3 mr-1 text-chart-1" />
                  ) : (
                    <Copy className="h-3 w-3 mr-1" />
                  )}
                  {copiedIdx === i ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{tpl.message}</p>
            </div>
          ))}
        </div>

        {/* Auto follow-up hint */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-2">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>Auto follow-up reminders are scheduled if no escrow action within 24 hours</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgentEscrowToolkit;
