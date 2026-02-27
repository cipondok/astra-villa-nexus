import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AgentCard from './AgentCard';
import { Loader2, Users, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface AgentSearchResultsProps {
  searchQuery: string;
  filter: 'all' | 'top';
}

// Sample agents for display
const sampleAgents = [
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
    level_name: 'Platinum VIP',
    latest_review: 'Sangat profesional dan membantu saya menemukan villa impian di Bali!'
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
    level_name: 'Gold VIP',
    latest_review: 'Respon cepat dan sangat mengerti kebutuhan klien.'
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
    level_name: 'Gold VIP',
    latest_review: 'Proses transaksi sangat lancar berkat bantuan Bu Siti.'
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
    level_name: 'Platinum VIP',
    latest_review: 'Best agent in Bali! Helped me find the perfect investment property.'
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
    id: 'sample-6',
    full_name: 'Rizki Pratama',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    location: 'Medan',
    is_verified: false,
    phone: '+62 817 8901 2345',
    email: 'rizki@example.com',
    total_listings: 38,
    total_sold: 18,
    total_rented: 7,
    rating: 4.5,
    response_rate: 85,
    level_name: 'Bronze VIP'
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
    level_name: 'Silver VIP',
    latest_review: 'Agen yang sangat sabar dan teliti dalam setiap proses.'
  },
  {
    id: 'sample-8',
    full_name: 'Hendra Gunawan',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    location: 'Makassar',
    is_verified: false,
    phone: '+62 819 0123 4567',
    email: 'hendra@example.com',
    total_listings: 29,
    total_sold: 14,
    total_rented: 5,
    rating: 4.4,
    response_rate: 82,
    level_name: 'Premium'
  }
];

const AgentSearchResults = ({ searchQuery, filter }: AgentSearchResultsProps) => {
  const [sortBy, setSortBy] = useState('popular');
  const [locationFilter, setLocationFilter] = useState('all');

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agent-search', searchQuery, filter, sortBy, locationFilter],
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
        // Get profiles
        let query = supabase
          .from('profiles')
          .select('id, full_name, avatar_url, business_address, verification_status, phone, email, user_level_id');

        query = query.in('id', userIds);

        if (searchQuery) {
          query = query.or(`full_name.ilike.%${searchQuery}%,business_address.ilike.%${searchQuery}%`);
        }

        const { data: profiles } = await query.limit(30);

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
            is_verified: profile.verification_status === 'verified' || profile.verification_status === 'approved',
            phone: profile.phone,
            email: profile.email,
            total_listings: Math.floor(Math.random() * 100) + 10,
            total_sold: Math.floor(Math.random() * 50) + 5,
            total_rented: Math.floor(Math.random() * 20) + 2,
            rating: 4 + Math.random() * 1,
            response_rate: 80 + Math.floor(Math.random() * 20),
            level_name: profile.user_level_id ? levelMap.get(profile.user_level_id) || null : null
          };
        });
      }

      // Combine with sample agents
      let allAgents = [...dbAgents, ...sampleAgents];

      // Filter by search query for sample agents too
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        allAgents = allAgents.filter(a => 
          a.full_name.toLowerCase().includes(query) || 
          (a.location && a.location.toLowerCase().includes(query))
        );
      }

      // Apply location filter
      if (locationFilter !== 'all') {
        allAgents = allAgents.filter(a => 
          a.location && a.location.toLowerCase().includes(locationFilter.toLowerCase())
        );
      }

      // Apply filter
      if (filter === 'top') {
        allAgents = allAgents.filter(a => a.rating >= 4.5 && a.total_sold >= 20);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          allAgents.sort((a, b) => b.rating - a.rating);
          break;
        case 'listings':
          allAgents.sort((a, b) => b.total_listings - a.total_listings);
          break;
        case 'sold':
          allAgents.sort((a, b) => b.total_sold - a.total_sold);
          break;
        default:
          allAgents.sort((a, b) => (b.total_sold + b.rating * 10) - (a.total_sold + a.rating * 10));
      }

      return allAgents;
    },
    staleTime: 2 * 60 * 1000
  });

  const locations = ['Jakarta', 'Bandung', 'Surabaya', 'Bali', 'Yogyakarta', 'Medan', 'Semarang', 'Makassar'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const Icon = filter === 'top' ? Star : Users;
  const title = filter === 'top' ? 'Top Agen' : 'Semua Agen';

  if (!agents?.length) {
    return (
      <div className="text-center py-12">
        <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Tidak ada agen ditemukan
        </h3>
        <p className="text-muted-foreground">
          {searchQuery ? 'Coba kata kunci lain' : 'Belum ada agen terdaftar'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            {title} ({agents.length})
          </h2>
        </div>

        <div className="flex gap-3">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Semua Lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Lokasi</SelectItem>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Paling Populer</SelectItem>
              <SelectItem value="rating">Rating Tertinggi</SelectItem>
              <SelectItem value="listings">Iklan Terbanyak</SelectItem>
              <SelectItem value="sold">Paling Banyak Terjual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent, i) => (
          <AgentCard key={agent.id} agent={agent} index={i} />
        ))}
      </div>
    </div>
  );
};

export default AgentSearchResults;
