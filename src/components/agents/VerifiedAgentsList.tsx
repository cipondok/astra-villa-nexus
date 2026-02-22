import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AgentCard from './AgentCard';
import { Loader2, Shield } from 'lucide-react';

interface VerifiedAgentsListProps {
  searchQuery: string;
}

// Sample verified agents
const sampleVerifiedAgents = [
  {
    id: 'sample-1',
    full_name: 'Dewi Sartika',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    location: 'Jakarta Selatan',
    is_verified: true,
    phone: '+62 812 3456 7890',
    email: 'dewi@example.com',
    total_listings: 87,
    total_sold: 42,
    total_rented: 15,
    rating: 4.9,
    response_rate: 98,
    level_name: 'Platinum VIP'
  },
  {
    id: 'sample-2',
    full_name: 'Budi Santoso',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    location: 'Bandung',
    is_verified: true,
    phone: '+62 813 4567 8901',
    email: 'budi@example.com',
    total_listings: 65,
    total_sold: 35,
    total_rented: 12,
    rating: 4.8,
    response_rate: 95,
    level_name: 'Gold VIP'
  },
  {
    id: 'sample-3',
    full_name: 'Siti Rahayu',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    location: 'Surabaya',
    is_verified: true,
    phone: '+62 814 5678 9012',
    email: 'siti@example.com',
    total_listings: 54,
    total_sold: 28,
    total_rented: 8,
    rating: 4.7,
    response_rate: 92,
    level_name: 'Gold VIP'
  },
  {
    id: 'sample-4',
    full_name: 'Ahmad Wijaya',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    location: 'Bali',
    is_verified: true,
    phone: '+62 815 6789 0123',
    email: 'ahmad@example.com',
    total_listings: 92,
    total_sold: 48,
    total_rented: 22,
    rating: 4.9,
    response_rate: 99,
    level_name: 'Platinum VIP'
  },
  {
    id: 'sample-5',
    full_name: 'Maya Putri',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    location: 'Yogyakarta',
    is_verified: true,
    phone: '+62 816 7890 1234',
    email: 'maya@example.com',
    total_listings: 45,
    total_sold: 22,
    total_rented: 10,
    rating: 4.6,
    response_rate: 88,
    level_name: 'Silver VIP'
  },
  {
    id: 'sample-7',
    full_name: 'Anita Kusuma',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    location: 'Semarang',
    is_verified: true,
    phone: '+62 818 9012 3456',
    email: 'anita@example.com',
    total_listings: 52,
    total_sold: 25,
    total_rented: 9,
    rating: 4.7,
    response_rate: 91,
    level_name: 'Silver VIP'
  }
];

const VerifiedAgentsList = ({ searchQuery }: VerifiedAgentsListProps) => {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['verified-agents', searchQuery],
    queryFn: async () => {
      // Get agent user IDs
      const { data: agentRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'agent')
        .eq('is_active', true);

      const userIds = agentRoles?.map(r => r.user_id) || [];

      // Get user levels
      const { data: userLevels } = await supabase
        .from('user_levels')
        .select('id, name');

      const levelMap = new Map(userLevels?.map(l => [l.id, l.name]) || []);

      let dbAgents: any[] = [];

      if (userIds.length > 0) {
        // Get verified profiles
        let query = supabase
          .from('profiles')
          .select('id, full_name, avatar_url, business_address, verification_status, phone, email, user_level_id')
          .in('id', userIds)
          .in('verification_status', ['verified', 'approved']);

        if (searchQuery) {
          query = query.or(`full_name.ilike.%${searchQuery}%,business_address.ilike.%${searchQuery}%`);
        }

        const { data: profiles } = await query.limit(20);

        dbAgents = (profiles || []).map(profile => {
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
            is_verified: true,
            phone: profile.phone,
            email: profile.email,
            total_listings: Math.floor(Math.random() * 100) + 10,
            total_sold: Math.floor(Math.random() * 50) + 5,
            total_rented: Math.floor(Math.random() * 20) + 2,
            rating: 4.5 + Math.random() * 0.5,
            response_rate: 90 + Math.floor(Math.random() * 10),
            level_name: profile.user_level_id ? levelMap.get(profile.user_level_id) || null : null
          };
        });
      }

      // Combine with sample verified agents
      let allAgents = [...dbAgents, ...sampleVerifiedAgents];

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        allAgents = allAgents.filter(a => 
          a.full_name.toLowerCase().includes(query) || 
          (a.location && a.location.toLowerCase().includes(query))
        );
      }

      return allAgents;
    },
    staleTime: 2 * 60 * 1000
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agents?.length) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Tidak ada agen terverifikasi ditemukan
        </h3>
        <p className="text-muted-foreground">
          {searchQuery ? 'Coba kata kunci lain' : 'Belum ada agen terverifikasi'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-chart-1" />
        <h2 className="text-xl font-semibold text-foreground">
          Agen Terverifikasi ({agents.length})
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} showVerifiedBadge />
        ))}
      </div>
    </div>
  );
};

export default VerifiedAgentsList;
