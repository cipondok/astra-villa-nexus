import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';

export const useFavorites = (propertyData?: { title?: string; images?: string[] }) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addNotification } = useNotifications();

  // Load user's favorites
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(new Set(data?.map(fav => fav.property_id) || []));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save properties to your favorites.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    
    try {
      const isFavorited = favorites.has(propertyId);
      
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);

        if (error) throw error;

        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(propertyId);
          return newFavorites;
        });

        toast({
          title: "Removed from favorites",
          description: "Property removed from your saved list.",
        });

        // Add notification for removal
        addNotification({
          type: 'info',
          title: 'Property Removed',
          message: `${propertyData?.title || 'Property'} removed from favorites`,
          propertyId: propertyId,
          propertyTitle: propertyData?.title,
          propertyImage: propertyData?.images?.[0],
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{
            user_id: user.id,
            property_id: propertyId
          }]);

        if (error) throw error;

        setFavorites(prev => new Set([...prev, propertyId]));

        toast({
          title: "Added to favorites",
          description: "Property saved to your favorites!",
        });

        // Add notification for addition
        addNotification({
          type: 'favorite',
          title: 'Property Saved',
          message: `${propertyData?.title || 'Property'} added to favorites`,
          propertyId: propertyId,
          propertyTitle: propertyData?.title,
          propertyImage: propertyData?.images?.[0],
        });
      }

      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (propertyId: string) => favorites.has(propertyId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite
  };
};