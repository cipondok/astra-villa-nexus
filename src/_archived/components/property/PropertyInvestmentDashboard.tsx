import React, { Suspense, lazy } from 'react';
import { TrendingUp, Sparkles, BarChart3, Loader2 } from 'lucide-react';
import ScrollReveal from '@/components/ui/ScrollReveal';
import StaggeredReveal from '@/components/ui/StaggeredReveal';
import { AutoValuationCard } from '@/components/property/AutoValuationCard';
import { ROIForecastCard } from '@/components/property/ROIForecastCard';

const PropertyLiquidityWidget = lazy(() => import('@/components/property/PropertyLiquidityWidget'));

interface PropertyInvestmentDashboardProps {
  propertyId: string;
  currentPrice: number;
  city?: string | null;
  propertyType?: string;
}

const PropertyInvestmentDashboard: React.FC<PropertyInvestmentDashboardProps> = ({
  propertyId,
  currentPrice,
  city,
  propertyType,
}) => {
  return (
    <section className="mt-6 sm:mt-10">
      <ScrollReveal direction="up" delay={0}>
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/15">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-bold text-foreground">Investment Dashboard</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-gold-primary" />
              AI-powered valuation &amp; market analysis
            </p>
          </div>
        </div>
      </ScrollReveal>

      <StaggeredReveal staggerDelay={150} direction="up" className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <AutoValuationCard propertyId={propertyId} currentPrice={currentPrice} />
        <ROIForecastCard propertyId={propertyId} currentPrice={currentPrice} />
        <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}>
          <PropertyLiquidityWidget city={city} propertyType={propertyType} />
        </Suspense>
      </StaggeredReveal>
    </section>
  );
};

export default PropertyInvestmentDashboard;
