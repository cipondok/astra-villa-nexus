import React, { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, ArrowLeft, SlidersHorizontal, TrendingUp, Flame, LayoutGrid, LayoutList } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PropertyCardSkeleton from '@/components/property/PropertyCardSkeleton';
import WatchlistPropertyCard from '@/components/property/WatchlistPropertyCard';
import { useFavorites } from '@/hooks/useFavorites';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead } from '@/components/SEOHead';
import { cn } from '@/lib/utils';

type SortKey = 'recent' | 'score' | 'price-low' | 'price-high';

const Saved = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toggleFavorite } = useFavorites();
  const [sortBy, setSortBy] = React.useState<SortKey>('recent');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

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

  // Sort properties
  const sortedProperties = useMemo(() => {
    const props = [...(savedProperties || [])];
    switch (sortBy) {
      case 'score':
        return props.sort((a: any, b: any) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0));
      case 'price-low':
        return props.sort((a: any, b: any) => (a.price ?? 0) - (b.price ?? 0));
      case 'price-high':
        return props.sort((a: any, b: any) => (b.price ?? 0) - (a.price ?? 0));
      default:
        return props; // already sorted by created_at desc
    }
  }, [savedProperties, sortBy]);

  // Stats
  const stats = useMemo(() => {
    if (!sortedProperties.length) return null;
    const withScore = sortedProperties.filter((p: any) => p.opportunity_score && p.opportunity_score >= 80);
    const avgScore = sortedProperties.reduce((sum: number, p: any) => sum + (p.opportunity_score ?? 0), 0) / sortedProperties.length;
    return {
      total: sortedProperties.length,
      eliteCount: withScore.length,
      avgScore: Math.round(avgScore),
    };
  }, [sortedProperties]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-primary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/15">
            <Heart className="h-8 w-8 text-primary/50" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Investment Watchlist</h1>
          <p className="text-muted-foreground mb-6">Sign in to track and manage your preferred property opportunities</p>
          <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-md shadow-primary/20">
            Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  const sortOptions: { key: SortKey; label: string; icon: typeof TrendingUp }[] = [
    { key: 'recent', label: 'Recent', icon: ArrowLeft },
    { key: 'score', label: 'AI Score', icon: TrendingUp },
    { key: 'price-low', label: 'Price ↑', icon: SlidersHorizontal },
    { key: 'price-high', label: 'Price ↓', icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <SEOHead title="Investment Watchlist" description="Track and manage your saved property investment opportunities." noIndex />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-3"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Investment Watchlist
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${sortedProperties.length} properties tracked`}
            </p>
          </div>
        </motion.div>

        {/* Stats strip */}
        {stats && stats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-3 overflow-x-auto scrollbar-hide"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs flex-shrink-0">
              <Heart className="h-3 w-3 text-primary" />
              <span className="font-bold">{stats.total}</span>
              <span className="text-muted-foreground">Saved</span>
            </div>
            {stats.eliteCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-chart-2/10 border border-chart-2/20 text-xs flex-shrink-0">
                <TrendingUp className="h-3 w-3 text-chart-2" />
                <span className="font-bold text-chart-2">{stats.eliteCount}</span>
                <span className="text-chart-2/70">Elite</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-xs flex-shrink-0">
              <Flame className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Avg Score</span>
              <span className="font-bold">{stats.avgScore}</span>
            </div>
          </motion.div>
        )}

        {/* Sort bar + view toggle */}
        {!isLoading && sortedProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-between mb-3 gap-2"
          >
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {sortOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortBy(opt.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors flex-shrink-0',
                    sortBy === opt.key
                      ? 'bg-primary/15 text-primary border border-primary/25'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted')}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-1.5 rounded-lg transition-colors', viewMode === 'list' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted')}
              >
                <LayoutList className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && <PropertyCardSkeleton count={6} />}

        {/* Properties Grid */}
        {!isLoading && sortedProperties.length > 0 && (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3'
              : 'grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3',
          )}>
            <AnimatePresence mode="popLayout">
              {sortedProperties.map((property: any, i: number) => (
                <WatchlistPropertyCard
                  key={property.id}
                  property={property}
                  onRemove={handleUnsave}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedProperties.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/15">
              <Heart className="h-10 w-10 text-primary/30" />
            </div>
            <h2 className="text-base sm:text-xl font-semibold mb-2">Start Building Your Watchlist</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Save properties you're interested in by tapping the heart icon. Track price changes, demand surges, and AI opportunity scores.
            </p>
            <Button onClick={() => navigate('/')} className="gap-2 h-9 text-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-md shadow-primary/20">
              <Home className="h-4 w-4" />
              Discover Properties
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Saved;
