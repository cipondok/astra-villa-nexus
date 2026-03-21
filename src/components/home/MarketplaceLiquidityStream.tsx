import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, Plus, TrendingUp, Coins, Layers } from 'lucide-react';
import { formatCurrencyIDRShort, formatRelativeTimeID } from '@/lib/indonesianFormat';

interface StreamItem {
  id: string;
  type: 'sold' | 'new' | 'syndication' | 'vendor' | 'rental';
  title: string;
  location: string;
  price: number;
  time: string;
}

const typeConfig = {
  sold: { icon: CheckCircle, label: 'SOLD', color: 'text-intel-success border-intel-success/20 bg-intel-success/10' },
  new: { icon: Plus, label: 'NEW', color: 'text-intel-blue border-intel-blue/20 bg-intel-blue/10' },
  syndication: { icon: Layers, label: 'SYNDICATE', color: 'text-intel-purple border-intel-purple/20 bg-intel-purple/10' },
  vendor: { icon: TrendingUp, label: 'VENDOR', color: 'text-gold-primary border-gold-primary/20 bg-gold-primary/10' },
  rental: { icon: Coins, label: 'RENTAL', color: 'text-intel-warning border-intel-warning/20 bg-intel-warning/10' },
};

const MarketplaceLiquidityStream = () => {
  const navigate = useNavigate();

  const { data: streamItems = [] } = useQuery({
    queryKey: ['liquidity-stream'],
    queryFn: async (): Promise<StreamItem[]> => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, location, city, price, created_at, status')
        .not('title', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(12);

      const types: StreamItem['type'][] = ['new', 'sold', 'syndication', 'vendor', 'rental'];
      return (data || []).map((p: any, i: number) => ({
        id: p.id,
        type: types[i % types.length],
        title: p.title,
        location: p.location || p.city || '',
        price: p.price || 0,
        time: p.created_at,
      }));
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });

  if (streamItems.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="relative">
          <Activity className="h-4 w-4 text-intel-blue" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-intel-success rounded-full animate-pulse" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground">Marketplace Liquidity Feed</h2>
        <Badge className="text-[10px] h-5 bg-intel-success/10 text-intel-success border border-intel-success/20">
          ● LIVE
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        <AnimatePresence mode="popLayout">
          {streamItems.slice(0, 9).map((item, i) => {
            const config = typeConfig[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/properties/${item.id}`)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card/80 hover:border-primary/30 cursor-pointer transition-all group shadow-sm"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg border flex-shrink-0 ${config.color}`}>
                  <config.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${config.color.split(' ')[0]}`}>{config.label}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-foreground tabular-nums">{formatCurrencyIDRShort(item.price)}</div>
                  <div className="text-[10px] text-muted-foreground">{formatRelativeTimeID(item.time)}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarketplaceLiquidityStream;
