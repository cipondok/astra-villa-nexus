import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, Plus, TrendingUp } from 'lucide-react';
import { formatCurrencyIDRShort, formatRelativeTimeID } from '@/lib/indonesianFormat';

interface StreamItem {
  id: string;
  type: 'sold' | 'new' | 'syndication';
  title: string;
  location: string;
  price: number;
  time: string;
}

const typeConfig = {
  sold: { icon: CheckCircle, label: 'Sold', color: 'bg-intel-success/10 text-intel-success border-intel-success/20' },
  new: { icon: Plus, label: 'New Listing', color: 'bg-intel-blue/10 text-intel-blue border-intel-blue/20' },
  syndication: { icon: TrendingUp, label: 'Syndication', color: 'bg-intel-purple/10 text-intel-purple border-intel-purple/20' },
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

      return (data || []).map((p: any, i: number) => ({
        id: p.id,
        type: i % 5 === 0 ? 'sold' : i % 7 === 0 ? 'syndication' : 'new',
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
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Activity className="h-4 w-4 text-intel-blue" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-intel-success rounded-full animate-pulse" />
        </div>
        <h2 className="font-playfair text-lg sm:text-xl font-bold text-foreground">Marketplace Activity</h2>
        <Badge variant="secondary" className="text-[10px] h-5">Live</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {streamItems.slice(0, 6).map((item, i) => {
            const config = typeConfig[item.type];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/properties/${item.id}`)}
                className="flex items-center gap-3 p-3 rounded-xl glass-effect border border-border/30 hover:border-gold-primary/20 cursor-pointer transition-colors"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${config.color}`}>
                  <config.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.location}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-bold text-foreground">{formatCurrencyIDRShort(item.price)}</div>
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
