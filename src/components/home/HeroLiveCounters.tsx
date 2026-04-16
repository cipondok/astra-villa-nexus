import { useHomepageLiveMetrics } from '@/hooks/useHomepageLiveMetrics';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Percent, Zap } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

const CounterItem = ({ icon: Icon, value, label, suffix = '' }: { icon: any; value: number; label: string; suffix?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-2 sm:gap-3"
  >
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold-primary/10 border border-gold-primary/20">
      <Icon className="h-3.5 w-3.5 text-gold-primary" />
    </div>
    <div>
      <div className="text-sm sm:text-base font-bold text-foreground tabular-nums">
        {value.toLocaleString('id-ID')}{suffix}
      </div>
      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
    </div>
  </motion.div>
);

const HeroLiveCounters = () => {
  const { data: metrics } = useHomepageLiveMetrics();
  const { t } = useTranslation();

  if (!metrics) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 py-2">
      <CounterItem icon={TrendingUp} value={metrics.totalListings} label={t('homeComponents.activeListings')} />
      <div className="hidden sm:block w-px h-8 bg-border/50" />
      <CounterItem icon={Users} value={metrics.activeInvestors} label={t('homeComponents.investors')} />
      <div className="hidden sm:block w-px h-8 bg-border/50" />
      <CounterItem icon={Percent} value={metrics.avgYield} label={t('homeComponents.avgYield')} suffix="%" />
      <div className="hidden sm:block w-px h-8 bg-border/50" />
      <CounterItem icon={Zap} value={metrics.transactionVelocity} label={t('homeComponents.dealsPerMonth')} />
    </div>
  );
};

export default HeroLiveCounters;
