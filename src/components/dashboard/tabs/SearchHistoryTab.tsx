import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Bell, BellOff, Trash2, Filter, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

const SearchHistoryTab = () => {
  const navigate = useNavigate();
  const {
    savedSearches,
    isLoading,
    unreadNotifications,
    updateSearch,
    deleteSearch,
    markNotificationsRead,
  } = useSavedSearches();

  const buildSearchUrl = (filters: Record<string, any>, query?: string | null) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (filters.city) params.set('city', filters.city);
    if (filters.propertyType) params.set('type', filters.propertyType);
    if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
    return `/dijual?${params.toString()}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Card key={i} className="backdrop-blur-xl bg-card/60 border-border/50">
            <CardContent className="p-3">
              <Skeleton className="h-3 w-2/3 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!savedSearches.length) {
    return (
      <Card className="backdrop-blur-xl bg-card/60 border-border/50">
        <CardContent className="p-6 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Search className="h-6 w-6 text-primary/50" />
          </div>
          <h3 className="text-sm font-semibold mb-1">No saved searches</h3>
          <p className="text-xs text-muted-foreground mb-3">Save your searches to get notified about new matching properties</p>
          <Button size="sm" onClick={() => navigate('/dijual')} className="h-7 text-xs">
            Start Searching
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{savedSearches.length} saved searches</p>
        {unreadNotifications > 0 && (
          <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => markNotificationsRead()}>
            <Bell className="h-2.5 w-2.5" />
            {unreadNotifications} new
          </Button>
        )}
      </div>

      {savedSearches.map((search, i) => {
        const filterEntries = Object.entries(search.filters || {}).filter(
          ([, v]) => v && v !== 'all' && v !== '' && v !== 0
        );

        return (
          <motion.div
            key={search.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="backdrop-blur-xl bg-card/60 border-border/50 hover:shadow-sm transition-shadow">
              <CardContent className="p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Search className="h-3 w-3 text-primary flex-shrink-0" />
                      <h4 className="text-[11px] font-semibold truncate">{search.name}</h4>
                    </div>
                    {search.query && (
                      <p className="text-[9px] text-muted-foreground mb-1">"{search.query}"</p>
                    )}
                    {filterEntries.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mb-1.5">
                        {filterEntries.slice(0, 4).map(([key, val]) => (
                          <Badge key={key} variant="secondary" className="text-[7px] px-1 py-0 h-3.5">
                            <Filter className="h-2 w-2 mr-0.5" />
                            {String(val)}
                          </Badge>
                        ))}
                        {filterEntries.length > 4 && (
                          <Badge variant="secondary" className="text-[7px] px-1 py-0 h-3.5">
                            +{filterEntries.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="text-[8px] text-muted-foreground">
                      {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {search.email_notifications ? (
                        <Bell className="h-3 w-3 text-primary" />
                      ) : (
                        <BellOff className="h-3 w-3 text-muted-foreground" />
                      )}
                      <Switch
                        checked={search.email_notifications}
                        onCheckedChange={(checked) => updateSearch(search.id, { email_notifications: checked })}
                        className="scale-[0.6] origin-right"
                      />
                    </div>
                    <div className="flex gap-0.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-5 text-[8px] px-1.5"
                        onClick={() => navigate(buildSearchUrl(search.filters, search.query))}
                      >
                        <ExternalLink className="h-2.5 w-2.5 mr-0.5" />Run
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[8px] px-1 text-destructive hover:text-destructive"
                        onClick={() => deleteSearch(search.id)}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SearchHistoryTab;
