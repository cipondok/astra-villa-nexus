import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Map, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketIntelligenceCTA() {
  const navigate = useNavigate();

  return (
    <section className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Left — text */}
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
              <BarChart3 className="h-3 w-3" /> Market Intelligence
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-2">
              Data-Driven Property Insights
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Track area price trends, discover undervalued markets, and identify top luxury zones across Indonesia.
            </p>
          </div>

          {/* Right — mini stat cards + CTA */}
          <div className="flex flex-col items-center gap-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: TrendingUp, label: 'Price Trends', color: 'text-chart-1' },
                { icon: Map, label: 'Heat Maps', color: 'text-chart-4' },
                { icon: Crown, label: 'Top Luxury', color: 'text-chart-5' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-muted/50">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{label}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => navigate('/market-intelligence')}
              className="w-full sm:w-auto gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Explore Market Data
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
