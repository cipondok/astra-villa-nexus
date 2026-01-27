import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  Video,
  CheckCircle2,
  Search,
  Plus,
  Ticket,
  ExternalLink,
  Sparkles,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface CommunityEvent {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  description: string;
  event_type: string;
  cover_image_url: string;
  location_name: string;
  city: string;
  is_online: boolean;
  online_link: string;
  start_datetime: string;
  end_datetime: string;
  max_attendees: number;
  current_attendees: number;
  is_free: boolean;
  ticket_price: number;
  tags: string[];
  is_featured: boolean;
  status: string;
}

const eventTypes = [
  { value: 'all', label: 'All Events' },
  { value: 'open_house', label: 'Open House' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'networking', label: 'Networking' },
  { value: 'community_cleanup', label: 'Community' },
];

interface CommunityEventsProps {
  city?: string;
  className?: string;
}

const CommunityEvents: React.FC<CommunityEventsProps> = ({ city, className }) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [registering, setRegistering] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [selectedType, city]);

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from('community_events')
        .select('*')
        .in('status', ['upcoming', 'ongoing'])
        .gte('start_datetime', new Date().toISOString())
        .order('is_featured', { ascending: false })
        .order('start_datetime', { ascending: true });

      if (selectedType !== 'all') {
        query = query.eq('event_type', selectedType);
      }

      if (city) {
        query = query.eq('city', city);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    setRegistering(eventId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Please sign in', description: 'You need to be signed in to register for events', variant: 'destructive' });
        return;
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already Registered', description: 'You are already registered for this event.', variant: 'destructive' });
        } else {
          throw error;
        }
        return;
      }

      toast({ title: 'Registration Successful!', description: 'You are now registered for this event.' });
      fetchEvents();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setRegistering(null);
    }
  };

  const filteredEvents = events.filter(event =>
    !searchQuery ||
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatEventDate = (date: string) => {
    return format(new Date(date), 'EEE, MMM d');
  };

  const formatEventTime = (date: string) => {
    return format(new Date(date), 'h:mm a');
  };

  const getAvailability = (event: CommunityEvent) => {
    if (!event.max_attendees) return null;
    const remaining = event.max_attendees - (event.current_attendees || 0);
    if (remaining <= 0) return { text: 'Sold Out', color: 'destructive' };
    if (remaining <= 5) return { text: `${remaining} spots left`, color: 'warning' };
    return { text: `${remaining} spots available`, color: 'default' };
  };

  const EventCard = ({ event, featured = false }: { event: CommunityEvent; featured?: boolean }) => {
    const availability = getAvailability(event);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
      >
        <Card className={cn(
          'overflow-hidden cursor-pointer transition-shadow hover:shadow-lg',
          featured && 'ring-2 ring-primary'
        )}>
          <div className="relative">
            <img
              src={event.cover_image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
              alt={event.title}
              className={cn('w-full object-cover', featured ? 'h-48' : 'h-36')}
            />
            <div className="absolute top-2 left-2 flex gap-2">
              {event.is_featured && (
                <Badge className="bg-primary">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {event.is_online && (
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  <Video className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              )}
            </div>
            <div className="absolute top-2 right-2">
              <Badge variant={event.is_free ? 'secondary' : 'default'}>
                {event.is_free ? 'Free' : `Rp ${(event.ticket_price || 0).toLocaleString()}`}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="shrink-0 text-center bg-primary/10 rounded-lg p-2 min-w-14">
                <div className="text-xs text-primary font-medium uppercase">
                  {format(new Date(event.start_datetime), 'MMM')}
                </div>
                <div className="text-2xl font-bold text-primary">
                  {format(new Date(event.start_datetime), 'd')}
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold line-clamp-2">{event.title}</h3>
                <Badge variant="outline" className="text-xs capitalize mt-1">
                  {event.event_type.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{formatEventTime(event.start_datetime)}</span>
                {event.end_datetime && (
                  <span>- {formatEventTime(event.end_datetime)}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {event.is_online ? (
                  <>
                    <Globe className="h-4 w-4 shrink-0" />
                    <span>Online Event</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="truncate">{event.location_name || event.city}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 shrink-0" />
                <span>{event.current_attendees || 0} attending</span>
                {availability && (
                  <Badge variant="outline" className="text-xs ml-auto">
                    {availability.text}
                  </Badge>
                )}
              </div>
            </div>

            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {event.tags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              disabled={registering === event.id || availability?.text === 'Sold Out'}
              onClick={(e) => {
                e.stopPropagation();
                handleRegister(event.id);
              }}
            >
              {registering === event.id ? (
                'Registering...'
              ) : availability?.text === 'Sold Out' ? (
                'Sold Out'
              ) : (
                <>
                  <Ticket className="h-4 w-4 mr-2" />
                  Register Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Community Events
          </h2>
          <p className="text-muted-foreground">
            Connect with neighbors and local professionals
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {eventTypes.map(type => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type.value)}
            className="shrink-0"
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} featured={event.is_featured} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No upcoming events</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Be the first to organize a community event!
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create an Event
          </Button>
        </Card>
      )}
    </div>
  );
};

export default CommunityEvents;
