import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIPropertyValuation } from '@/hooks/useAIPropertyValuation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SmartPricePositioningProps {
  propertyId: string;
  currentPrice: number;
}

const SmartPricePositioning = memo(({ propertyId, currentPrice }: SmartPricePositioningProps) => {
  const { data } = useAIPropertyValuation(propertyId);

  if (!data || !data.price_position) return null;

  const deviation = Math.abs(data.deviation_percent || 0);
  const isUndervalued = data.price_position === 'undervalued';
  const isOverpriced = data.price_position === 'overpriced';

  const config = isUndervalued
    ? { icon: TrendingDown, color: 'text-emerald-500', bg: 'bg-emerald-500/8 border-emerald-500/20', message: `Priced ${deviation}% below similar listings`, sub: 'High value opportunity vs area average' }
    : isOverpriced
    ? { icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/8 border-amber-500/20', message: `Priced ${deviation}% above similar listings`, sub: 'Premium positioning in this market' }
    : { icon: Minus, color: 'text-primary', bg: 'bg-primary/8 border-primary/20', message: 'Fairly priced for this area', sub: 'In line with comparable properties' };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className={cn('flex items-center gap-2.5 rounded-lg border px-3 py-2', config.bg)}
    >
      <div className={cn('p-1.5 rounded-md bg-card/80', config.color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-xs font-semibold', config.color)}>{config.message}</p>
        <p className="text-[10px] text-muted-foreground">{config.sub}</p>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-1 rounded-full hover:bg-muted/50 cursor-help">
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-[220px]">
            <p className="text-xs">
              Based on {data.comparables_count} comparable properties in this area.
              AI confidence: {data.confidence}%.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
});

SmartPricePositioning.displayName = 'SmartPricePositioning';
export default SmartPricePositioning;
