import React, { Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Map, Search, Crown, BarChart3, Flame } from 'lucide-react';

const AreaPriceTrends = lazy(() => import('@/components/market-intelligence/AreaPriceTrends'));
const PriceHeatMap = lazy(() => import('@/components/market-intelligence/PriceHeatMap'));
const MostSearchedLocations = lazy(() => import('@/components/market-intelligence/MostSearchedLocations'));
const TopLuxuryAreas = lazy(() => import('@/components/market-intelligence/TopLuxuryAreas'));
const MarketOverviewCards = lazy(() => import('@/components/market-intelligence/MarketOverviewCards'));
const InvestmentHotspotsChart = lazy(() => import('@/components/market-intelligence/InvestmentHotspotsChart'));

const SectionLoader = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-muted rounded w-1/3" />
    <div className="h-64 bg-muted rounded" />
  </div>
);

export default function MarketIntelligence() {
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Hero header */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-chart-4/5">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Market Intelligence</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                Indonesia Property
                <span className="block text-primary">Market Data</span>
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
                Real-time insights powered by live transaction data. Track area price trends,
                discover undervalued markets, and identify top-performing luxury zones across Indonesia.
              </p>
            </div>
          </div>
          {/* Decorative grid */}
          <div className="absolute inset-0 -z-10 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </section>

        {/* Overview cards */}
        <section className="container mx-auto px-4 -mt-6 relative z-10">
          <Suspense fallback={<SectionLoader />}>
            <MarketOverviewCards />
          </Suspense>
        </section>

        {/* Main content tabs */}
        <section className="container mx-auto px-4 py-8">
          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-muted/50 p-1">
              <TabsTrigger value="trends" className="gap-1.5 text-xs md:text-sm">
                <TrendingUp className="h-4 w-4" /> Price Trends
              </TabsTrigger>
              <TabsTrigger value="heatmap" className="gap-1.5 text-xs md:text-sm">
                <Map className="h-4 w-4" /> Heat Map
              </TabsTrigger>
              <TabsTrigger value="searched" className="gap-1.5 text-xs md:text-sm">
                <Search className="h-4 w-4" /> Most Searched
              </TabsTrigger>
              <TabsTrigger value="luxury" className="gap-1.5 text-xs md:text-sm">
                <Crown className="h-4 w-4" /> Top Luxury
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trends">
              <Suspense fallback={<SectionLoader />}>
                <AreaPriceTrends />
              </Suspense>
            </TabsContent>

            <TabsContent value="heatmap">
              <Suspense fallback={<SectionLoader />}>
                <PriceHeatMap />
              </Suspense>
            </TabsContent>

            <TabsContent value="searched">
              <Suspense fallback={<SectionLoader />}>
                <MostSearchedLocations />
              </Suspense>
            </TabsContent>

            <TabsContent value="luxury">
              <Suspense fallback={<SectionLoader />}>
                <TopLuxuryAreas />
              </Suspense>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </>
  );
}
