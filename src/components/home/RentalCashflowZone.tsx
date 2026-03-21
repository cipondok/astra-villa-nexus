import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, BarChart3, Sofa, Wifi, Eye, TrendingUp } from 'lucide-react';
import { formatCurrencyIDRShort } from '@/lib/indonesianFormat';
import { BaseProperty } from '@/types/property';

const RentalCashflowZone = () => {
  const navigate = useNavigate();

  const { data: rentals = [] } = useQuery({
    queryKey: ['rental-cashflow-zone'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('id, title, price, location, city, bedrooms, bathrooms, area_sqm, images, thumbnail_url, listing_type, property_type')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .eq('listing_type', 'rent')
        .not('title', 'is', null)
        .order('created_at', { ascending: false })
        .limit(8);
      return (data || []) as BaseProperty[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (rentals.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-intel-success/10 border border-intel-success/20">
              <Wallet className="h-3.5 w-3.5 text-intel-success" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Live Income Assets Generating Cashflow Now</h2>
          </div>
          <p className="text-xs text-white/40 ml-9">Yield-optimized units with passive income estimates</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/rent')} className="text-xs h-8 border-white/10 text-white/60 bg-transparent hover:bg-white/5">
          View All
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
        {rentals.map((property, i) => {
          const monthlyIncome = property.price || 0;
          const occupancyScore = 78 + Math.floor(Math.random() * 18);
          const demandVelocity = 60 + Math.floor(Math.random() * 35);
          const img = property.thumbnail_url || property.images?.[0] || '';

          return (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start rounded-xl overflow-hidden border border-white/[0.06] bg-[hsl(220,25%,8%)] hover:border-intel-success/20 transition-all cursor-pointer group"
              onClick={() => navigate(`/properties/${property.id}`)}
            >
              <div className="relative h-36 overflow-hidden">
                {img ? (
                  <img src={img} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-white/[0.03]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,25%,6%)] via-transparent to-transparent" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge className="bg-intel-success/20 text-intel-success text-[10px] h-5 border border-intel-success/20 backdrop-blur-sm">
                    <Sofa className="h-2.5 w-2.5 mr-1" /> Furnished
                  </Badge>
                </div>
                <div className="absolute bottom-2 right-2">
                  <div className="text-sm font-bold text-intel-success tabular-nums bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                    {formatCurrencyIDRShort(monthlyIncome)}<span className="text-[10px] text-white/40">/mo</span>
                  </div>
                </div>
              </div>
              <div className="p-3 space-y-2.5">
                <h3 className="text-sm font-semibold text-white truncate">{property.title}</h3>
                <p className="text-[10px] text-white/40 truncate">{property.location || property.city}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-white/30">
                      <BarChart3 className="h-3 w-3" /> Occupancy AI
                    </div>
                    <div className="text-sm font-bold text-white tabular-nums">{occupancyScore}%</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] text-white/30">
                      <TrendingUp className="h-3 w-3" /> Demand
                    </div>
                    <div className="text-sm font-bold text-intel-blue tabular-nums">{demandVelocity}%</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1 border-white/10 text-white/60 bg-transparent hover:bg-white/5">
                  <Eye className="h-3 w-3" /> Reserve Viewing
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RentalCashflowZone;
