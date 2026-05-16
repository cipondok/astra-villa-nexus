import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Home, MapPin, DollarSign, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketStat {
  label: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
}

export default function MarketOverviewCards() {
  const { data: stats } = useQuery({
    queryKey: ['market-overview-stats'],
    queryFn: async () => {
      // Total active listings
      const { count: totalListings } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Average price
      const { data: priceData } = await supabase
        .from('properties')
        .select('price')
        .eq('status', 'active')
        .not('price', 'is', null)
        .gt('price', 0);

      const prices = (priceData || []).map(p => p.price);
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

      // Unique locations
      const { data: locationData } = await supabase
        .from('properties')
        .select('city')
        .eq('status', 'active')
        .not('city', 'is', null);

      const uniqueCities = new Set((locationData || []).map(l => l.city)).size;

      // New this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const { count: newListings } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('created_at', monthAgo.toISOString());

      return {
        totalListings: totalListings || 0,
        avgPrice,
        uniqueCities,
        newListings: newListings || 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `Rp ${(price / 1_000_000_000).toFixed(1)}B`;
    if (price >= 1_000_000) return `Rp ${(price / 1_000_000).toFixed(0)}M`;
    return `Rp ${price.toLocaleString()}`;
  };

  const cards: MarketStat[] = [
    {
      label: 'Active Listings',
      value: stats ? stats.totalListings.toLocaleString() : '—',
      icon: <Home className="h-5 w-5 text-primary" />,
    },
    {
      label: 'Average Price',
      value: stats ? formatPrice(stats.avgPrice) : '—',
      icon: <DollarSign className="h-5 w-5 text-chart-1" />,
    },
    {
      label: 'Markets Covered',
      value: stats ? stats.uniqueCities.toString() : '—',
      icon: <MapPin className="h-5 w-5 text-chart-5" />,
    },
    {
      label: 'New This Month',
      value: stats ? stats.newListings.toLocaleString() : '—',
      icon: <BarChart3 className="h-5 w-5 text-chart-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="bg-card border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {card.icon}
              <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
