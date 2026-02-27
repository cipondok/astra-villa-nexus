import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, ArrowLeft } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import CompactPropertyCard from '@/components/property/CompactPropertyCard';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { motion } from 'framer-motion';

const Saved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toggleFavorite } = useFavorites();

  const { data: savedProperties, isLoading } = useQuery({
    queryKey: ['saved-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('id, property_id, created_at, properties(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) return [];
      return (data || []).map((fav: any) => fav.properties).filter(Boolean);
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const handleUnsave = async (propertyId: string) => {
    await toggleFavorite(propertyId);
    queryClient.invalidateQueries({ queryKey: ['saved-properties', user?.id] });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-gold-primary/5">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="h-16 w-16 rounded-2xl bg-gold-primary/10 flex items-center justify-center mx-auto mb-4 border border-gold-primary/15">
            <Heart className="h-8 w-8 text-gold-primary/50" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Saved Properties</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your saved properties</p>
          <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-gold-primary to-gold-primary/80 text-background hover:from-gold-primary/90 hover:to-gold-primary/70 shadow-md shadow-gold-primary/20">
            Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  const properties = savedProperties || [];

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0 hover:bg-gold-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-gold-primary" />
              Saved Properties
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${properties.length} properti tersimpan`}
            </p>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && <PropertyCardSkeleton count={6} />}

        {/* Properties Grid */}
        {!isLoading && properties.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 sm:gap-3">
            {properties.map((property: any, i: number) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <CompactPropertyCard
                  property={property}
                  language="id"
                  isSaved={true}
                  onSave={handleUnsave}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="h-20 w-20 rounded-2xl bg-gold-primary/10 flex items-center justify-center mx-auto mb-4 border border-gold-primary/15">
              <Heart className="h-10 w-10 text-gold-primary/30" />
            </div>
            <h2 className="text-base sm:text-xl font-semibold mb-2">No saved properties yet</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6">
              Start browsing and save your favorites by clicking the heart icon
            </p>
            <Button onClick={() => navigate('/')} className="gap-2 h-9 text-sm bg-gradient-to-r from-gold-primary to-gold-primary/80 text-background hover:from-gold-primary/90 hover:to-gold-primary/70 shadow-md shadow-gold-primary/20">
              <Home className="h-4 w-4" />
              Browse Properties
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Saved;
