import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Building2, Users, PieChart, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { cn } from '@/lib/utils';
import { MarketData } from '@/hooks/useAgentAnalytics';

interface MarketComparisonProps {
  data: MarketData;
  className?: string;
}

const formatPrice = (price: number): string => {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)}M`;
  return price.toLocaleString();
};

const MarketComparison: React.FC<MarketComparisonProps> = ({ data, className }) => {
  const priceDiff = ((data.yourAvgPrice - data.avgMarketPrice) / data.avgMarketPrice) * 100;
  const sqmDiff = ((data.pricePerSqm - data.marketPricePerSqm) / data.marketPricePerSqm) * 100;

  const radarData = data.priceComparison.map(item => ({
    area: item.area,
    you: item.yourPrice,
    market: item.marketPrice,
  }));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-[10px] text-muted-foreground">Your Avg. Price</span>
          </div>
          <p className="text-lg font-bold text-foreground">Rp {formatPrice(data.yourAvgPrice)}</p>
          <div className={cn(
            "flex items-center gap-1 text-[10px]",
            priceDiff < 0 ? "text-green-500" : "text-destructive"
          )}>
            {priceDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {Math.abs(priceDiff).toFixed(1)}% vs market
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-[10px] text-muted-foreground">Price per m²</span>
          </div>
          <p className="text-lg font-bold text-foreground">Rp {formatPrice(data.pricePerSqm)}</p>
          <div className={cn(
            "flex items-center gap-1 text-[10px]",
            sqmDiff < 0 ? "text-green-500" : "text-destructive"
          )}>
            {sqmDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {Math.abs(sqmDiff).toFixed(1)}% vs market
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-4 w-4 text-green-500" />
            <span className="text-[10px] text-muted-foreground">Market Share</span>
          </div>
          <p className="text-lg font-bold text-foreground">{data.marketShare}%</p>
          <p className="text-[10px] text-muted-foreground">
            of {data.competitorCount} competitors
          </p>
        </motion.div>
      </div>

      {/* Price Comparison Chart */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Price Comparison by Area (M/m²)</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.priceComparison} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="area" type="category" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" width={70} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
                formatter={(value: number) => [`Rp ${value}M/m²`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar dataKey="yourPrice" name="Your Price" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="marketPrice" name="Market Avg" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Comparison */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Regional Performance Overview</h4>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="area" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <Radar name="Your Listings" dataKey="you" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              <Radar name="Market Avg" dataKey="market" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted))" fillOpacity={0.3} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Competitive Position */}
      <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 border border-border/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">Your Market Position</h4>
        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.marketShare * 4}%` }}
            transition={{ duration: 1 }}
            className="absolute h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-lg"
            style={{ left: `${data.marketShare * 4}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          <span>0%</span>
          <span>Top 25% Agents</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export default MarketComparison;
