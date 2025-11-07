import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PropertyAdvancedFilters from '@/components/search/PropertyAdvancedFilters';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Clock, MapPin, DollarSign, Users, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharedSearchData {
  id: string;
  search_id: string;
  owner_id: string;
  expires_at: string;
  access_count: number;
  user_searches: {
    name: string;
    query: string;
    filters: any;
  };
}

const SharedSearch = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchData, setSearchData] = useState<SharedSearchData | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    if (!shareId) return;

    const fetchSharedSearch = async () => {
      try {
        // Track analytics - view event
        await supabase.from('share_analytics').insert({
          share_id: shareId,
          event_type: 'view',
          ip_address: null,
          user_agent: navigator.userAgent,
          referrer: document.referrer || window.location.origin
        });

        // Fetch shared search data
        const { data: sharedData, error: sharedError } = await supabase
          .from('shared_searches')
          .select('*')
          .eq('id', shareId)
          .single();

        if (sharedError || !sharedData) {
          setExpired(true);
          setLoading(false);
          return;
        }

        // Fetch associated search
        const { data: searchDetails, error: searchError } = await supabase
          .from('user_searches')
          .select('*')
          .eq('id', sharedData.search_id)
          .single();

        if (searchError || !searchDetails) {
          setExpired(true);
          setLoading(false);
          return;
        }

        // Check if expired
        if (new Date(sharedData.expires_at) < new Date()) {
          setExpired(true);
          setLoading(false);
          return;
        }

        const combinedData = {
          ...sharedData,
          user_searches: searchDetails
        };

        setSearchData(combinedData as any);

        // Increment access count
        await supabase
          .from('shared_searches')
          .update({ access_count: sharedData.access_count + 1 })
          .eq('id', shareId);

        // Fetch properties based on filters
        await fetchProperties(searchDetails.filters);
      } catch (error) {
        console.error('Error fetching shared search:', error);
        toast({
          title: "Error",
          description: "Failed to load shared search",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSharedSearch();

    // Set up real-time presence for collaborative viewing
    const presenceChannel = supabase.channel(`shared-search-presence-${shareId}`, {
      config: { presence: { key: user?.id || `anon-${Math.random()}` } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = presenceChannel.presenceState();
        setOnlineUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user?.id || 'anonymous',
            online_at: new Date().toISOString()
          });
        }
      });

    // Set up real-time subscription for live updates
    const channel = supabase
      .channel(`shared-search-${shareId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_searches',
          filter: `id=eq.${shareId}`
        },
        (payload) => {
          console.log('Search updated:', payload);
          if (payload.new) {
            fetchProperties((payload.new as any).filters);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [shareId, user?.id]);

  const fetchProperties = async (filters: any) => {
    try {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'available');

      // Apply filters
      if (filters.propertyType && filters.propertyType !== 'all') {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters.listingType && filters.listingType !== 'all') {
        query = query.eq('listing_type', filters.listingType);
      }
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      const { data } = await query.limit(20);
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (expired || !searchData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full p-6 text-center">
          <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Search Expired</h2>
          <p className="text-muted-foreground">
            This shared search link has expired or is no longer available.
          </p>
        </Card>
      </div>
    );
  }

  const expiresIn = Math.ceil((new Date(searchData.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{searchData.user_searches.name}</h1>
              <p className="text-muted-foreground mt-1">
                {searchData.user_searches.query}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {onlineUsers > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {onlineUsers} viewing
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expires in {expiresIn} days
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {searchData.access_count} views
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            👁️ Total views: {searchData.access_count} • {onlineUsers} currently viewing • Real-time updates enabled
          </p>
        </div>

        {/* Results */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {properties.length} Properties Found
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                {property.image_urls?.[0] && (
                  <img
                    src={property.image_urls[0]}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{property.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <DollarSign className="h-4 w-4" />
                      ${property.price?.toLocaleString()}
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedSearch;
