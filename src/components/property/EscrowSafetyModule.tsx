import { memo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, CheckCircle2, Banknote, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';

const EscrowSafetyModule = memo(() => {
  const { t } = useTranslation();

  const STEPS = [
    { icon: Lock, label: t('escrow.reserveViaEscrow'), desc: t('escrow.reserveViaEscrowDesc'), color: 'text-primary' },
    { icon: Search, label: t('escrow.legalPropertyVerification'), desc: t('escrow.legalPropertyVerificationDesc'), color: 'text-chart-4' },
    { icon: CheckCircle2, label: t('escrow.secureCompletion'), desc: t('escrow.secureCompletionDesc'), color: 'text-emerald-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-xl border border-border/50 bg-card overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/5 border-b border-emerald-500/10">
        <div className="p-1.5 rounded-lg bg-emerald-500/10">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-foreground">{t('escrow.protection')}</h3>
          <p className="text-[9px] text-muted-foreground">{t('escrow.howInvestmentSecured')}</p>
        </div>
      </div>

      <div className="p-3 space-y-0">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn('w-7 h-7 rounded-full border-2 flex items-center justify-center bg-card', `border-current ${step.color}`)}>
                  <Icon className={cn('h-3 w-3', step.color)} />
                </div>
                {i < STEPS.length - 1 && <div className="w-px h-6 bg-border/60" />}
              </div>
              <div className="pb-3">
                <p className="text-xs font-semibold text-foreground">{`${t('escrow.step')} ${i + 1}: ${step.label}`}</p>
                <p className="text-[10px] text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
          <Banknote className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">{t('escrow.fundsRemainProtected')}</span> {t('escrow.untilConditionsSatisfied')}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

EscrowSafetyModule.displayName = 'EscrowSafetyModule';
export default EscrowSafetyModule;
