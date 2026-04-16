import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, MapPin, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n/useTranslation';

interface CityHeat { city: string; score: number; trend: 'rising' | 'stable' | 'cooling'; changePercent: number; }

const MarketHeatHighlight = memo(() => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const cities: CityHeat[] = useMemo(() => [
    { city: 'Bali', score: 92, trend: 'rising', changePercent: 8.4 },
    { city: 'Jakarta', score: 78, trend: 'stable', changePercent: 2.1 },
    { city: 'Bandung', score: 71, trend: 'rising', changePercent: 5.7 },
    { city: 'Surabaya', score: 65, trend: 'cooling', changePercent: -1.3 },
  ], []);

  const getTempColor = (score: number) => score >= 85 ? 'text-destructive' : score >= 70 ? 'text-chart-1' : score >= 50 ? 'text-chart-4' : 'text-muted-foreground';
  const getTempBg = (score: number) => score >= 85 ? 'bg-destructive/10' : score >= 70 ? 'bg-chart-1/10' : score >= 50 ? 'bg-chart-4/10' : 'bg-muted/50';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-destructive/10"><Flame className="h-4 w-4 text-destructive" /></div>
          <div><h3 className="text-sm font-bold text-foreground">{t('homeComponents.marketHeat')}</h3><p className="text-[10px] text-muted-foreground">{t('homeComponents.trendingCitiesThisWeek')}</p></div>
        </div>
        <button onClick={() => navigate('/market-intelligence')} className="flex items-center gap-0.5 text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors">{t('homeComponents.viewAllBtn')}<ArrowUpRight className="h-3 w-3" /></button>
      </div>
      <div className="space-y-2">
        {cities.map((city, i) => (
          <motion.div key={city.city} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 w-20 flex-shrink-0"><MapPin className="h-3 w-3 text-muted-foreground" /><span className="text-xs font-medium text-foreground truncate">{city.city}</span></div>
            <div className="flex-1 h-2 bg-muted/60 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${city.score}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: 'easeOut' }} className={cn('h-full rounded-full', getTempBg(city.score))} style={{ backgroundColor: `hsl(var(--${city.score >= 85 ? 'destructive' : city.score >= 70 ? 'chart-1' : 'chart-4'}))` }} />
            </div>
            <div className="flex items-center gap-1 w-16 flex-shrink-0 justify-end">
              <span className={cn('text-xs font-bold tabular-nums', getTempColor(city.score))}>{city.score}</span>
              <span className={cn('text-[9px] font-semibold', city.trend === 'rising' ? 'text-chart-2' : city.trend === 'cooling' ? 'text-destructive' : 'text-muted-foreground')}>{city.changePercent > 0 ? '+' : ''}{city.changePercent}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

MarketHeatHighlight.displayName = 'MarketHeatHighlight';
export default MarketHeatHighlight;
