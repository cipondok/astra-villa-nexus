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

      if (error) {
        console.error('Error fetching saved properties:', error);
        return [];
      }

      return (data || [])
        .map((fav: any) => fav.properties)
        .filter(Boolean);
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  const handleUnsave = async (propertyId: string) => {
    const property = savedProperties?.find((p: any) => p.id === propertyId);
    await toggleFavorite(propertyId);
    queryClient.invalidateQueries({ queryKey: ['saved-properties', user?.id] });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Saved Properties</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to view your saved properties
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const properties = savedProperties || [];

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">Saved Properties</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isLoading
                ? 'Loading...'
                : `${properties.length} properti tersimpan`}
            </p>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <PropertyCardSkeleton count={6} />}

        {/* Properties Grid */}
        {!isLoading && properties.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 sm:gap-3">
            {properties.map((property: any) => (
              <CompactPropertyCard
                key={property.id}
                property={property}
                language="id"
                isSaved={true}
                onSave={handleUnsave}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <Heart className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-muted-foreground/30" />
            <h2 className="text-base sm:text-xl font-semibold mb-2">No saved properties yet</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6">
              Start browsing and save your favorites by clicking the heart icon
            </p>
            <Button onClick={() => navigate('/')} className="gap-2 h-9 text-sm">
              <Home className="h-4 w-4" />
              Browse Properties
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
