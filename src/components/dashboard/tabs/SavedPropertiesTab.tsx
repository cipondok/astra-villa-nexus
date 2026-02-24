import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Eye, Trash2, MapPin, Bed, Bath, Maximize } from 'lucide-react';
import { formatIDR } from '@/utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

const SavedPropertiesTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: favorites = [], isLoading, refetch } = useQuery({
    queryKey: ['dashboard-saved-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: favs, error } = await supabase
        .from('favorites')
        .select('id, property_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error || !favs?.length) return [];

      const propertyIds = favs.map(f => f.property_id);
      const { data: properties } = await supabase
        .from('properties')
        .select('id, title, price, city, state, property_type, listing_type, bedrooms, bathrooms, area_sqm, images, image_urls')
        .in('id', propertyIds);

      return favs.map(f => ({
        ...f,
        property: (properties || []).find(p => p.id === f.property_id),
      })).filter(f => f.property);
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const handleRemove = async (favId: string) => {
    await supabase.from('favorites').delete().eq('id', favId);
    refetch();
  };

  const getImg = (p: any) => p?.images?.[0] || p?.image_urls?.[0] || '/placeholder.svg';

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="backdrop-blur-xl bg-card/60 border-border/50">
            <CardContent className="p-2">
              <Skeleton className="h-24 w-full rounded-lg mb-2" />
              <Skeleton className="h-3 w-3/4 mb-1" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <Card className="backdrop-blur-xl bg-card/60 border-border/50">
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <Heart className="h-6 w-6 text-destructive/50" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No saved properties</h3>
          <p className="text-xs text-muted-foreground mb-3">Save properties you like to compare them later</p>
          <Button size="sm" onClick={() => navigate('/dijual')} className="h-7 text-xs">
            Browse Properties
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{favorites.length} saved properties</p>
        <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => navigate('/favorites')}>
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <AnimatePresence>
          {favorites.slice(0, 6).map((fav, i) => {
            const p = fav.property as any;
            return (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="backdrop-blur-xl bg-card/60 border-border/50 overflow-hidden group hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex gap-2">
                      <div className="relative w-24 h-20 flex-shrink-0">
                        <img src={getImg(p)} alt={p.title} className="w-full h-full object-cover" />
                        <Badge className="absolute top-1 left-1 text-[7px] px-1 py-0 h-3.5" variant={p.listing_type === 'sale' ? 'default' : 'secondary'}>
                          {p.listing_type === 'sale' ? 'Sale' : 'Rent'}
                        </Badge>
                      </div>
                      <div className="flex-1 py-1.5 pr-2 min-w-0">
                        <h4 className="text-[10px] font-semibold line-clamp-1 mb-0.5">{p.title}</h4>
                        <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mb-1">
                          <MapPin className="h-2.5 w-2.5" />{p.city || p.state || '—'}
                        </p>
                        <p className="text-xs font-bold text-primary">{formatIDR(p.price)}</p>
                        <div className="flex items-center gap-2 mt-1 text-[8px] text-muted-foreground">
                          {p.bedrooms && <span className="flex items-center gap-0.5"><Bed className="h-2.5 w-2.5" />{p.bedrooms}</span>}
                          {p.bathrooms && <span className="flex items-center gap-0.5"><Bath className="h-2.5 w-2.5" />{p.bathrooms}</span>}
                          {p.area_sqm && <span className="flex items-center gap-0.5"><Maximize className="h-2.5 w-2.5" />{p.area_sqm}m²</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 p-1.5 pt-0 border-t border-border/30 mt-1">
                      <Button variant="outline" size="sm" className="h-5 text-[8px] flex-1" onClick={() => navigate(`/properties/${p.id}`)}>
                        <Eye className="h-2.5 w-2.5 mr-0.5" />View
                      </Button>
                      <Button variant="ghost" size="sm" className="h-5 text-[8px] text-destructive hover:text-destructive" onClick={() => handleRemove(fav.id)}>
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SavedPropertiesTab;
