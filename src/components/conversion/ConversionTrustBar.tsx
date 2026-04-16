import { memo } from 'react';
import { Shield, BadgeCheck, Scale, Building2, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';

interface ConversionTrustBarProps {
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * Horizontal trust badge bar for high-conversion placement.
 * Shows key investor trust signals in a compact, scannable format.
 */
const ConversionTrustBar = memo(({ variant = 'compact', className }: ConversionTrustBarProps) => {
  const { t } = useTranslation();

  const badges = [
    { icon: Shield, label: t('trustBar.escrowProtected', 'Escrow Protected') },
    { icon: BadgeCheck, label: t('trustBar.verified', 'Verified Property') },
    { icon: Scale, label: t('trustBar.legalCleared', 'Legal Cleared') },
    { icon: Building2, label: t('trustBar.certifiedDev', 'Certified Developer') },
    { icon: Banknote, label: t('trustBar.refundable', 'Refundable Deposit') },
  ];

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 overflow-x-auto scrollbar-hide py-1', className)}>
        {badges.slice(0, 3).map((b) => (
          <div key={b.label} className="flex items-center gap-1 text-[10px] text-muted-foreground whitespace-nowrap">
            <b.icon className="h-3 w-3 text-chart-1" />
            <span>{b.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 py-2 px-3 rounded-lg',
      'bg-muted/30 border border-border/30',
      className,
    )}>
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <b.icon className="h-3.5 w-3.5 text-chart-1" />
          <span>{b.label}</span>
        </div>
      ))}
    </div>
  );
});

ConversionTrustBar.displayName = 'ConversionTrustBar';
export default ConversionTrustBar;
