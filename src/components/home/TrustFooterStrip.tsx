import { Shield, Lock, Scale, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';

export default function TrustFooterStrip({ className }: { className?: string }) {
  const { t } = useTranslation();

  const signals = [
    { icon: Shield, label: t('homeComponents.verifiedListings'), detail: t('homeComponents.verifiedListingsDesc') },
    { icon: Lock, label: t('homeComponents.secureData'), detail: t('homeComponents.secureDataDesc') },
    { icon: Scale, label: t('homeComponents.fairPricing'), detail: t('homeComponents.fairPricingDesc') },
    { icon: BadgeCheck, label: t('homeComponents.licensedAgents'), detail: t('homeComponents.licensedAgentsDesc') },
  ];

  return (
    <div className={cn("w-full border-t border-border/40 bg-muted/20", className)}>
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <p className="text-center text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5">
          {t('homeComponents.yourProtection')}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {signals.map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center gap-1.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/5 border border-primary/10">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground leading-tight">{s.label}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground leading-snug max-w-[140px]">{s.detail}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted-foreground/60 mt-2.5 max-w-lg mx-auto leading-relaxed">
          {t('homeComponents.legalCompliance')}
        </p>
      </div>
    </div>
  );
}
