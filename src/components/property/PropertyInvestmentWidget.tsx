import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, PiggyBank, Calendar, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Price from '@/components/ui/Price';
import { motion } from 'framer-motion';

interface PropertyInvestmentWidgetProps {
  price: number;
  city?: string;
  propertyType?: string;
  landArea?: number;
}

const CITY_RATES: Record<string, number> = {
  'bali': 10, 'seminyak': 12, 'canggu': 14, 'ubud': 9, 'jakarta': 6,
  'bandung': 8, 'surabaya': 7, 'yogyakarta': 9, 'lombok': 12, 'default': 7,
};

const TYPE_YIELDS: Record<string, number> = {
  villa: 8.5, apartment: 6.2, house: 5.5, townhouse: 5.8, land: 0, commercial: 7.5, default: 6,
};

export default function PropertyInvestmentWidget({ price, city, propertyType, landArea }: PropertyInvestmentWidgetProps) {
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const cityKey = Object.keys(CITY_RATES).find(k => city?.toLowerCase().includes(k)) || 'default';
    const appreciation = CITY_RATES[cityKey];
    const typeKey = propertyType?.toLowerCase() || 'default';
    const rentalYield = TYPE_YIELDS[typeKey] || TYPE_YIELDS.default;

    const monthlyRental = Math.round(price * (rentalYield / 100) / 12);
    const fiveYearValue = Math.round(price * Math.pow(1 + appreciation / 100, 5));
    const fiveYearGain = fiveYearValue - price;
    const breakEvenYears = rentalYield > 0 ? Math.round(price / (monthlyRental * 12) * 10) / 10 : 0;

    return { appreciation, rentalYield, monthlyRental, fiveYearValue, fiveYearGain, breakEvenYears };
  }, [price, city, propertyType]);

  if (!price || price <= 0) return null;

  return (
    <Card className="border border-gold-primary/15 bg-card backdrop-blur-xl rounded-xl overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-gold-primary via-gold-primary/80 to-gold-primary/40" />
      <CardHeader className="p-2.5 sm:p-3 pb-1.5 bg-gold-primary/5">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs sm:text-sm text-foreground">
            <div className="w-5 h-5 rounded-md bg-gold-primary/10 flex items-center justify-center">
              <Sparkles className="h-2.5 w-2.5 text-gold-primary" />
            </div>
            Investment Snapshot
          </span>
          <Badge className="text-[8px] bg-gold-primary/10 text-gold-primary border-gold-primary/20">AI Est.</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2.5 sm:p-3 pt-1.5 space-y-2">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-2 rounded-lg bg-gold-primary/[0.04] border border-gold-primary/10"
          >
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-gold-primary" />
              <span className="text-[9px] text-muted-foreground">Annual Growth</span>
            </div>
            <p className="text-sm font-black text-gold-primary">{metrics.appreciation}%</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-2 rounded-lg bg-gold-primary/[0.04] border border-gold-primary/10"
          >
            <div className="flex items-center gap-1 mb-1">
              <PiggyBank className="h-3 w-3 text-gold-primary" />
              <span className="text-[9px] text-muted-foreground">Rental Yield</span>
            </div>
            <p className="text-sm font-black text-gold-primary">{metrics.rentalYield}%</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-2 rounded-lg bg-muted/30 border border-border/30"
          >
            <div className="flex items-center gap-1 mb-1">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Monthly Rent</span>
            </div>
            <p className="text-xs font-bold text-foreground"><Price amount={metrics.monthlyRental} short /></p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="p-2 rounded-lg bg-muted/30 border border-border/30"
          >
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Break Even</span>
            </div>
            <p className="text-xs font-bold text-foreground">{metrics.breakEvenYears} yrs</p>
          </motion.div>
        </div>

        {/* 5-Year Projection */}
        <div className="p-2.5 rounded-lg bg-gradient-to-r from-gold-primary/[0.06] to-transparent border border-gold-primary/10">
          <p className="text-[9px] text-muted-foreground mb-0.5">5-Year Projected Value</p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-foreground"><Price amount={metrics.fiveYearValue} short /></span>
            <span className="text-[10px] font-bold text-emerald-500">+<Price amount={metrics.fiveYearGain} short /></span>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-[10px] font-semibold border-gold-primary/20 text-gold-primary hover:bg-gold-primary/10 gap-1"
          onClick={() => navigate('/investment?section=analysis')}
        >
          Full Investment Analysis
          <ArrowRight className="h-3 w-3" />
        </Button>

        <p className="text-[8px] text-muted-foreground text-center italic">
          AI estimate based on area trends. Not financial advice.
        </p>
      </CardContent>
    </Card>
  );
}
