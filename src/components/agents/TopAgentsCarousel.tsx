import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, MapPin, Home, CheckCircle, Star, ChevronLeft, ChevronRight, Crown, Gem, Medal } from 'lucide-react';
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
  level_name: string | null;
}

// Sample agent data for display
const sampleAgents: TopAgent[] = [
  {
    id: 'sample-1',
    full_name: 'Dewi Sartika',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    location: 'Jakarta Selatan',
    is_verified: true,
    total_listings: 87,
    total_sold: 42,
    total_rented: 15,
    awards: 3,
    rating: 4.9,
    level_name: 'Platinum VIP'
  },
  {
    id: 'sample-2',
    full_name: 'Budi Santoso',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    location: 'Bandung',
    is_verified: true,
    total_listings: 65,
    total_sold: 35,
    total_rented: 12,
    awards: 2,
    rating: 4.8,
    level_name: 'Gold VIP'
  },
  {
    id: 'sample-3',
    full_name: 'Siti Rahayu',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    location: 'Surabaya',
    is_verified: true,
    total_listings: 54,
    total_sold: 28,
    total_rented: 8,
    awards: 2,
    rating: 4.7,
    level_name: 'Gold VIP'
  },
  {
    id: 'sample-4',
    full_name: 'Ahmad Wijaya',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    location: 'Bali',
    is_verified: true,
    total_listings: 92,
    total_sold: 48,
    total_rented: 22,
    awards: 3,
    rating: 4.9,
    level_name: 'Platinum VIP'
  },
  {
    id: 'sample-5',
    full_name: 'Maya Putri',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    location: 'Yogyakarta',
    is_verified: true,
    total_listings: 45,
    total_sold: 22,
    total_rented: 10,
    awards: 1,
    rating: 4.6,
    level_name: 'Silver VIP'
  }
];

const getLevelBadgeStyle = (levelName: string | null) => {
   if (!levelName) return { bg: 'bg-muted', text: 'text-muted-foreground', icon: null };
  
  const name = levelName.toLowerCase();
  if (name.includes('platinum')) return { bg: 'bg-gradient-to-r from-muted to-secondary', text: 'text-foreground', icon: Gem };
  if (name.includes('gold')) return { bg: 'bg-gradient-to-r from-gold-primary/30 to-gold-primary/50', text: 'text-gold-primary', icon: Crown };
  if (name.includes('silver')) return { bg: 'bg-gradient-to-r from-muted to-secondary', text: 'text-muted-foreground', icon: Medal };
  if (name.includes('bronze')) return { bg: 'bg-gradient-to-r from-chart-3/20 to-gold-primary/20', text: 'text-chart-3', icon: Medal };
  if (name.includes('vip')) return { bg: 'bg-accent/10', text: 'text-accent', icon: Crown };
  if (name.includes('premium')) return { bg: 'bg-primary/10', text: 'text-primary', icon: Star };
  return { bg: 'bg-muted', text: 'text-muted-foreground', icon: null };
};

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

      if (!agentRoles?.length) return sampleAgents;

      const userIds = agentRoles.map(r => r.user_id);

      // Get profiles with user_level
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, business_address, verification_status, user_level_id')
        .in('id', userIds);

      // Get user levels
      const { data: userLevels } = await supabase
        .from('user_levels')
        .select('id, name');

      const levelMap = new Map(userLevels?.map(l => [l.id, l.name]) || []);

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
        let locationStr = null;
        if (profile.business_address) {
          try {
            const addr = typeof profile.business_address === 'string' 
              ? JSON.parse(profile.business_address) 
              : profile.business_address;
            locationStr = addr.city_name || addr.province_name || null;
          } catch {
            locationStr = profile.business_address as string;
          }
        }
        
        return {
          id: profile.id,
          full_name: profile.full_name || 'Agent',
          avatar_url: profile.avatar_url,
          location: locationStr,
          is_verified: profile.verification_status === 'verified' || profile.verification_status === 'approved',
          total_listings: stats?.total_listings || Math.floor(Math.random() * 100) + 10,
          total_sold: stats?.total_sales || Math.floor(Math.random() * 50) + 5,
          total_rented: Math.floor(Math.random() * 20) + 2,
          awards: Math.floor(Math.random() * 3) + 1,
          rating: stats?.avg_rating || 4.5 + Math.random() * 0.5,
          level_name: profile.user_level_id ? levelMap.get(profile.user_level_id) || null : null
        };
      });

      // Combine with sample agents if not enough real ones
      if (agents.length < 5) {
        return [...agents, ...sampleAgents.slice(0, 5 - agents.length)];
      }

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
          <div key={i} className="flex-shrink-0 w-72 h-64 bg-primary-foreground/10 rounded-xl animate-pulse" />
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
           <Card className="h-full bg-gradient-to-br from-gold-primary to-chart-3 border-0 overflow-hidden">
             <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
               <Award className="h-16 w-16 text-primary-foreground mb-4" />
               <h3 className="text-xl font-bold text-primary-foreground mb-2">Agent Awards 2024</h3>
               <p className="text-primary-foreground/90 text-sm">
                 Penghargaan untuk agen properti terbaik dengan performa luar biasa
               </p>
            </CardContent>
          </Card>
        </div>

        {/* Agent Cards */}
        {topAgents?.map((agent) => {
          const levelStyle = getLevelBadgeStyle(agent.level_name);
          const LevelIcon = levelStyle.icon;
          
          return (
            <Link key={agent.id} to={agent.id.startsWith('sample') ? '#' : `/profile/${agent.id}`} className="flex-shrink-0 w-64 sm:w-72">
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
                         <div className="absolute -bottom-1 -right-1 bg-chart-1 rounded-full p-1">
                           <CheckCircle className="h-4 w-4 text-primary-foreground" />
                         </div>
                      )}
                    </div>
                    
                    {/* Level Badge */}
                    {agent.level_name && (
                      <Badge className={`${levelStyle.bg} ${levelStyle.text} mb-2 text-xs font-medium`}>
                        {LevelIcon && <LevelIcon className="h-3 w-3 mr-1" />}
                        {agent.level_name}
                      </Badge>
                    )}
                    
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
                          <Award className="h-3 w-3 text-gold-primary" />
                          <span>{agent.awards} Award</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Awards Badges */}
                  {agent.awards > 0 && (
                    <div className="flex justify-center gap-2 mb-4">
                      {[...Array(Math.min(agent.awards, 3))].map((_, i) => (
                         <div key={i} className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center">
                           <Award className="h-5 w-5 text-gold-primary" />
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
          );
        })}
      </div>
    </div>
  );
};

export default TopAgentsCarousel;
