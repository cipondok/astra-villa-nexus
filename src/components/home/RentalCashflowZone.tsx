import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, BarChart3, Sofa, Wifi, Eye } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-intel-success" />
            <h2 className="font-playfair text-lg sm:text-xl font-bold text-foreground">Rental Cashflow Zone</h2>
          </div>
          <p className="text-xs text-muted-foreground">Yield-optimized units with passive income estimates</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/rent')} className="text-xs h-8">
          View All
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
        {rentals.map((property, i) => {
          const monthlyIncome = property.price || 0;
          const occupancyScore = 78 + Math.floor(Math.random() * 18);
          const img = property.thumbnail_url || property.images?.[0] || '';

          return (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start glass-effect rounded-xl overflow-hidden border border-border/40 hover:border-gold-primary/30 transition-colors cursor-pointer group"
              onClick={() => navigate(`/properties/${property.id}`)}
            >
              <div className="relative h-36 overflow-hidden">
                {img ? (
                  <img src={img} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge className="bg-intel-success/90 text-[10px] h-5 border-0">
                    <Sofa className="h-2.5 w-2.5 mr-1" /> Furnished
                  </Badge>
                  <Badge className="bg-intel-blue/90 text-[10px] h-5 border-0">
                    <Wifi className="h-2.5 w-2.5 mr-1" /> Smart
                  </Badge>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <h3 className="text-sm font-semibold text-foreground truncate">{property.title}</h3>
                <p className="text-[10px] text-muted-foreground truncate">{property.location || property.city}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground">Monthly</span>
                    <div className="text-sm font-bold text-intel-success">{formatCurrencyIDRShort(monthlyIncome)}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <BarChart3 className="h-3 w-3" /> Occupancy
                    </div>
                    <div className="text-sm font-bold text-foreground">{occupancyScore}%</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1">
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
