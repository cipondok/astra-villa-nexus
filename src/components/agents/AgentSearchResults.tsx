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

      if (!agentRoles?.length) return [];

      const userIds = agentRoles.map(r => r.user_id);

      // Get profiles - use business_address instead of city
      let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, business_address, verification_status, phone, email');

      query = query.in('id', userIds);

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,business_address.ilike.%${searchQuery}%`);
      }

      if (locationFilter !== 'all') {
        query = query.ilike('business_address', `%${locationFilter}%`);
      }

      const { data: profiles } = await query.limit(30);

      let agentsList = (profiles || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Agent',
        avatar_url: profile.avatar_url,
        location: profile.business_address,
        is_verified: profile.verification_status === 'verified',
        phone: profile.phone,
        email: profile.email,
        total_listings: Math.floor(Math.random() * 100) + 10,
        total_sold: Math.floor(Math.random() * 50) + 5,
        total_rented: Math.floor(Math.random() * 20) + 2,
        rating: 4 + Math.random() * 1,
        response_rate: 80 + Math.floor(Math.random() * 20)
      }));

      // Apply filter
      if (filter === 'top') {
        agentsList = agentsList.filter(a => a.rating >= 4.5 && a.total_sold >= 20);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          agentsList.sort((a, b) => b.rating - a.rating);
          break;
        case 'listings':
          agentsList.sort((a, b) => b.total_listings - a.total_listings);
          break;
        case 'sold':
          agentsList.sort((a, b) => b.total_sold - a.total_sold);
          break;
        default:
          agentsList.sort((a, b) => (b.total_sold + b.rating * 10) - (a.total_sold + a.rating * 10));
      }

      return agentsList;
    },
    staleTime: 2 * 60 * 1000
  });

  const locations = ['Jakarta', 'Bandung', 'Surabaya', 'Bali', 'Yogyakarta', 'Medan'];

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
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentSearchResults;
