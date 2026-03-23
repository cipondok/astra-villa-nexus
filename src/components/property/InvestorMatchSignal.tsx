import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserAiProfile } from '@/hooks/useUserAiProfile';
import Price from '@/components/ui/Price';

interface InvestorMatchSignalProps {
  propertyPrice: number;
  propertyType?: string;
  city?: string | null;
  rentalYield?: number;
}

const InvestorMatchSignal = memo(({ propertyPrice, propertyType, city, rentalYield }: InvestorMatchSignalProps) => {
  const { data: profile } = useUserAiProfile();

  const matches = useMemo(() => {
    if (!profile) return [];
    const signals: string[] = [];

    // Budget match
    const budgetMin = (profile as any)?.budget_min;
    const budgetMax = (profile as any)?.budget_max;
    if (budgetMin && budgetMax && propertyPrice >= budgetMin && propertyPrice <= budgetMax) {
      signals.push('Within your typical investment budget');
    } else if (budgetMax && propertyPrice <= budgetMax * 1.2) {
      signals.push('Close to your preferred price range');
    }

    // City preference
    const prefCities = (profile as any)?.preferred_cities;
    if (prefCities?.length && city && prefCities.some((c: string) => city.toLowerCase().includes(c.toLowerCase()))) {
      signals.push('Matches your preferred location');
    }

    // Property type preference
    const prefTypes = (profile as any)?.preferred_property_types;
    if (prefTypes?.length && propertyType && prefTypes.includes(propertyType.toLowerCase())) {
      signals.push(`Matches your ${propertyType} preference`);
    }

    // Yield match
    if (rentalYield && rentalYield > 6) {
      signals.push('Matches your target rental yield preference');
    }

    return signals;
  }, [profile, propertyPrice, propertyType, city, rentalYield]);

  if (matches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.3 }}
      className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Target className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-bold text-primary">Personalized Match</span>
      </div>
      <div className="space-y-1">
        {matches.map((m, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
            <span className="text-[10px] text-foreground">{m}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

InvestorMatchSignal.displayName = 'InvestorMatchSignal';
export default InvestorMatchSignal;
