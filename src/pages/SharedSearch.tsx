import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import PropertyAdvancedFilters from '@/components/search/PropertyAdvancedFilters';
import CollaborativeCursor from '@/components/collaboration/CollaborativeCursor';
import ChatBubble from '@/components/collaboration/ChatBubble';
import FilterHistory from '@/components/collaboration/FilterHistory';
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
  const [filters, setFilters] = useState<any>({});
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number; name: string; color: string }>>(new Map());
  const channelRef = useRef<any>(null);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);
  const sessionUserId = useRef(user?.id || `guest-${Math.random().toString(36).substr(2, 9)}`).current;
  const [filterHistory, setFilterHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // Generate consistent color for user
  const getUserColor = (userId: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

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
        setFilters(searchDetails.filters || {});
        
        // Initialize filter history
        const initialHistory = [{
          id: `initial-${Date.now()}`,
          filters: searchDetails.filters || {},
          user_name: 'Initial',
          timestamp: searchDetails.created_at || new Date().toISOString()
        }];
        setFilterHistory(initialHistory);
        setHistoryIndex(0);

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

    // Set up real-time collaborative editing channel
    const collabChannel = supabase.channel(`collab-${shareId}`);
    channelRef.current = collabChannel;
    
    collabChannel
      .on('broadcast', { event: 'filters' }, ({ payload }) => {
        setFilters(payload);
        fetchProperties(payload);
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (payload.userId !== (user?.id || sessionUserId)) {
          setCursors(prev => {
            const newCursors = new Map(prev);
            newCursors.set(payload.userId, {
              x: payload.x,
              y: payload.y,
              name: payload.name,
              color: payload.color
            });
            return newCursors;
          });
        }
      })
      .on('broadcast', { event: 'filter_history' }, ({ payload }) => {
        setFilterHistory(payload.history);
        setHistoryIndex(payload.currentIndex);
      })
      .on('broadcast', { event: 'chat_message' }, ({ payload }) => {
        setChatMessages(prev => [...prev, payload]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = collabChannel.presenceState();
        const users = Object.values(state).flat();
        setCollaborators(users);
        setOnlineUsers(users.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const state = collabChannel.presenceState();
        const users = Object.values(state).flat();
        setCollaborators(users);
        setOnlineUsers(users.length);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const state = collabChannel.presenceState();
        const users = Object.values(state).flat();
        setCollaborators(users);
        setOnlineUsers(users.length);
        
        // Remove cursors of users who left
        leftPresences.forEach((presence: any) => {
          setCursors(prev => {
            const newCursors = new Map(prev);
            newCursors.delete(presence.user_id);
            return newCursors;
          });
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await collabChannel.track({
            user_id: user?.id || sessionUserId,
            name: user?.email?.split('@')[0] || 'Guest',
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      supabase.removeChannel(collabChannel);
    };
  }, [shareId, user?.id]);

  // Handle mouse movement with throttling
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!channelRef.current) return;

    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }

    throttleRef.current = setTimeout(() => {
      const userId = user?.id || sessionUserId;
      const name = user?.email?.split('@')[0] || 'Guest';
      const color = getUserColor(userId);

      channelRef.current?.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          userId,
          name,
          color,
          x: e.clientX,
          y: e.clientY + window.scrollY
        }
      });
    }, 50);
  }, [user?.id, user?.email, sessionUserId]);

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

  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    fetchProperties(newFilters);
    
    // Add to history
    const historyEntry = {
      id: `${Date.now()}-${sessionUserId}`,
      filters: newFilters,
      user_name: user?.email?.split('@')[0] || 'Guest',
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [...filterHistory.slice(0, historyIndex + 1), historyEntry];
    setFilterHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Broadcast to other collaborators
    const channel = supabase.channel(`collab-${shareId}`);
    channel.send({
      type: 'broadcast',
      event: 'filters',
      payload: newFilters
    });
    
    channel.send({
      type: 'broadcast',
      event: 'filter_history',
      payload: {
        history: newHistory,
        currentIndex: newHistory.length - 1
      }
    });
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousFilters = filterHistory[newIndex].filters;
      setFilters(previousFilters);
      setHistoryIndex(newIndex);
      fetchProperties(previousFilters);
      
      // Broadcast
      const channel = supabase.channel(`collab-${shareId}`);
      channel.send({
        type: 'broadcast',
        event: 'filters',
        payload: previousFilters
      });
      channel.send({
        type: 'broadcast',
        event: 'filter_history',
        payload: {
          history: filterHistory,
          currentIndex: newIndex
        }
      });
    }
  }, [historyIndex, filterHistory, shareId]);

  const handleRedo = useCallback(() => {
    if (historyIndex < filterHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const nextFilters = filterHistory[newIndex].filters;
      setFilters(nextFilters);
      setHistoryIndex(newIndex);
      fetchProperties(nextFilters);
      
      // Broadcast
      const channel = supabase.channel(`collab-${shareId}`);
      channel.send({
        type: 'broadcast',
        event: 'filters',
        payload: nextFilters
      });
      channel.send({
        type: 'broadcast',
        event: 'filter_history',
        payload: {
          history: filterHistory,
          currentIndex: newIndex
        }
      });
    }
  }, [historyIndex, filterHistory, shareId]);

  const handleRestoreHistory = useCallback((index: number) => {
    const historyFilters = filterHistory[index].filters;
    setFilters(historyFilters);
    setHistoryIndex(index);
    fetchProperties(historyFilters);
    
    // Broadcast
    const channel = supabase.channel(`collab-${shareId}`);
    channel.send({
      type: 'broadcast',
      event: 'filters',
      payload: historyFilters
    });
    channel.send({
      type: 'broadcast',
      event: 'filter_history',
      payload: {
        history: filterHistory,
        currentIndex: index
      }
    });
  }, [filterHistory, shareId]);

  const handleSendMessage = useCallback((text: string) => {
    const message = {
      id: `${Date.now()}-${sessionUserId}`,
      text,
      user_id: sessionUserId,
      user_name: user?.email?.split('@')[0] || 'Guest',
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, message]);
    
    // Broadcast
    const channel = supabase.channel(`collab-${shareId}`);
    channel.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: message
    });
  }, [shareId, sessionUserId, user?.email]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

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
    <div className="min-h-screen bg-background" onMouseMove={handleMouseMove}>
      {/* Render collaborative cursors */}
      {Array.from(cursors.entries()).map(([userId, cursor]) => (
        <CollaborativeCursor
          key={userId}
          userId={userId}
          x={cursor.x}
          y={cursor.y}
          name={cursor.name}
          color={cursor.color}
        />
      ))}
      
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
              {collaborators.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {collaborators.slice(0, 3).map((collab: any, i: number) => (
                      <div
                        key={i}
                        className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs border-2 border-background"
                        title={collab.name}
                      >
                        {collab.name?.[0]?.toUpperCase() || 'G'}
                      </div>
                    ))}
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {collaborators.length} editing
                  </Badge>
                </div>
              )}
              
              {/* Filter History Controls */}
              {filterHistory.length > 0 && (
                <FilterHistory
                  history={filterHistory}
                  currentIndex={historyIndex}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onRestore={handleRestoreHistory}
                />
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
            Real-time collaborative search • {collaborators.length} users editing • Total views: {searchData.access_count}
          </p>
        </div>

        {/* Collaborative Filter Editor */}
        <div className="mb-8">
          <PropertyAdvancedFilters
            language="en"
            onFiltersChange={updateFilters}
            onSearch={() => fetchProperties(filters)}
          />
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
        
        {/* Chat Bubble */}
        <ChatBubble
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          currentUserId={sessionUserId}
        />
      </div>
    </div>
  );
};

export default SharedSearch;
