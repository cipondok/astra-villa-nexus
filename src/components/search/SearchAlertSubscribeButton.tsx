import { useState, useEffect } from 'react';
import { Bell, BellOff, Mail, Smartphone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { SearchFilters } from '@/types/search';

interface SearchAlertSubscribeButtonProps {
  filters: {
    propertyType?: string;
    city?: string;
    priceRange?: string;
    listingType?: string;
  };
}

type Channel = 'email' | 'push' | 'both';

const SearchAlertSubscribeButton = ({ filters }: SearchAlertSubscribeButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Check existing subscription on mount / filter change
  useEffect(() => {
    if (!user) {
      setIsSubscribed(false);
      setSubscriptionId(null);
      return;
    }
    checkExistingSubscription();
  }, [user, filters.propertyType, filters.city, filters.priceRange]);

  const checkExistingSubscription = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_searches')
        .select('id')
        .eq('user_id', user.id)
        .limit(10);

      if (data && data.length > 0) {
        for (const search of data) {
          const { data: sub } = await supabase
            .from('push_subscriptions')
            .select('id')
            .eq('user_id', user.id)
            .eq('search_id', search.id)
            .eq('is_active', true)
            .maybeSingle();

          if (sub) {
            setIsSubscribed(true);
            setSubscriptionId(sub.id);
            return;
          }
        }
      }
      setIsSubscribed(false);
      setSubscriptionId(null);
    } catch {
      // ignore
    }
  };

  const handleSubscribe = async (channel: Channel) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to subscribe to alerts',
        variant: 'destructive',
      });
      setOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create user_search entry
      const searchName = buildSearchName(filters);
      const { data: searchData, error: searchError } = await supabase
        .from('user_searches')
        .insert({
          user_id: user.id,
          name: searchName,
          filters: filters as any,
          timestamp: Date.now(),
        })
        .select('id')
        .single();

      if (searchError) throw searchError;

      // 2. Create push_subscription record
      const { error: subError } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          search_id: searchData.id,
          is_active: true,
          subscription: { channel } as any,
        });

      if (subError) throw subError;

      setIsSubscribed(true);
      setOpen(false);
      toast({
        title: 'Alerts Activated!',
        description: `You'll receive ${channel === 'both' ? 'email & push' : channel} notifications for matching properties`,
      });
    } catch (err: any) {
      console.error('Subscribe error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to subscribe',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user || !subscriptionId) return;
    setIsLoading(true);
    try {
      await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId);

      setIsSubscribed(false);
      setSubscriptionId(null);
      setOpen(false);
      toast({
        title: 'Alerts Disabled',
        description: 'You will no longer receive alerts for this search',
      });
    } catch {
      toast({ title: 'Error', description: 'Failed to unsubscribe', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isSubscribed ? 'default' : 'outline'}
          size="sm"
          className="h-9 px-3 text-sm font-medium rounded-md gap-1.5"
        >
          {isSubscribed ? (
            <>
              <BellOff className="h-4 w-4" />
              <span className="hidden sm:inline">Subscribed</span>
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Get Alerts</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        {!user ? (
          <div className="text-center py-2">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">Sign in to get alerts</p>
            <p className="text-xs text-muted-foreground">Get notified when new properties match your search</p>
          </div>
        ) : isSubscribed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Alerts active</span>
            </div>
            <p className="text-xs text-muted-foreground">You're receiving notifications for matching listings</p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleUnsubscribe}
              disabled={isLoading}
            >
              <BellOff className="h-4 w-4 mr-2" />
              Unsubscribe
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Choose notification channel</p>
            <p className="text-xs text-muted-foreground">Get notified when new properties match your filters</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSubscribe('email')}
                disabled={isLoading}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email only
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSubscribe('push')}
                disabled={isLoading}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Push only
              </Button>
              <Button
                variant="default"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSubscribe('both')}
                disabled={isLoading}
              >
                <Bell className="h-4 w-4 mr-2" />
                Email & Push
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

function buildSearchName(filters: SearchAlertSubscribeButtonProps['filters']): string {
  const parts: string[] = [];
  if (filters.propertyType && filters.propertyType !== 'all') parts.push(filters.propertyType);
  if (filters.city && filters.city !== 'all') parts.push(filters.city);
  if (filters.priceRange && filters.priceRange !== 'all') parts.push(filters.priceRange);
  if (filters.listingType) parts.push(filters.listingType);
  return parts.length > 0 ? parts.join(' · ') : 'All Properties';
}

export default SearchAlertSubscribeButton;
