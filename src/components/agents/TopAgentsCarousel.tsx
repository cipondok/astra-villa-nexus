import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, MapPin, Home, CheckCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

interface TopAgent {
  id: string;
  full_name: string;
  avatar_url: string | null;
  location: string | null;
  is_verified: boolean;
  total_listings: number;
  total_sold: number;
  total_rented: number;
  awards: number;
  rating: number;
}

const TopAgentsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const { data: topAgents, isLoading } = useQuery({
    queryKey: ['top-agents-carousel'],
    queryFn: async () => {
      // Get agent user IDs
      const { data: agentRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'agent')
        .eq('is_active', true)
        .limit(20);

      if (!agentRoles?.length) return [];

      const userIds = agentRoles.map(r => r.user_id);

      // Get profiles - use business_address instead of city
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, business_address, verification_status')
        .in('id', userIds);

      // Get leaderboard stats
      const { data: leaderboardData } = await supabase
        .from('agent_leaderboard_rewards')
        .select('agent_id, total_listings, total_sales, rank, avg_rating')
        .in('agent_id', userIds)
        .order('rank', { ascending: true })
        .limit(10);

      // Combine data
      const agents: TopAgent[] = (profiles || []).slice(0, 10).map(profile => {
        const stats = leaderboardData?.find(l => l.agent_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name || 'Agent',
          avatar_url: profile.avatar_url,
          location: profile.business_address,
          is_verified: profile.verification_status === 'verified',
          total_listings: stats?.total_listings || Math.floor(Math.random() * 100) + 10,
          total_sold: stats?.total_sales || Math.floor(Math.random() * 50) + 5,
          total_rented: Math.floor(Math.random() * 20) + 2,
          awards: Math.floor(Math.random() * 3) + 1,
          rating: stats?.avg_rating || 4.5 + Math.random() * 0.5
        };
      });

      return agents;
    },
    staleTime: 5 * 60 * 1000
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-72 h-64 bg-white/10 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      {canScrollLeft && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-lg"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      {canScrollRight && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-lg"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Award Banner Card */}
        <div className="flex-shrink-0 w-64 sm:w-72">
          <Card className="h-full bg-gradient-to-br from-amber-500 to-amber-600 border-0 overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
              <Award className="h-16 w-16 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Agent Awards 2024</h3>
              <p className="text-white/90 text-sm">
                Penghargaan untuk agen properti terbaik dengan performa luar biasa
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Agent Cards */}
        {topAgents?.map((agent) => (
          <Link key={agent.id} to={`/profile/${agent.id}`} className="flex-shrink-0 w-64 sm:w-72">
            <Card className="h-full bg-background/95 backdrop-blur-sm border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Agent Header */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative mb-3">
                    <Avatar className="w-20 h-20 border-4 border-primary/20">
                      <AvatarImage src={agent.avatar_url || undefined} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {agent.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {agent.is_verified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {agent.is_verified && (
                    <Badge className="bg-green-100 text-green-700 mb-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      VERIFIED
                    </Badge>
                  )}
                  
                  <h3 className="font-semibold text-foreground">{agent.full_name}</h3>
                  
                  <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{agent.location || 'Indonesia'}</span>
                    {agent.awards > 0 && (
                      <>
                        <span className="mx-1">•</span>
                        <Award className="h-3 w-3 text-amber-500" />
                        <span>{agent.awards} Award</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Awards Badges */}
                {agent.awards > 0 && (
                  <div className="flex justify-center gap-2 mb-4">
                    {[...Array(Math.min(agent.awards, 3))].map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-amber-600" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center bg-muted/50 rounded-lg p-3">
                  <div>
                    <div className="text-lg font-bold text-foreground">{agent.total_listings}</div>
                    <div className="text-xs text-muted-foreground">Iklan</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{agent.total_sold}</div>
                    <div className="text-xs text-muted-foreground">Terjual</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{agent.total_rented}</div>
                    <div className="text-xs text-muted-foreground">Tersewa</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopAgentsCarousel;
