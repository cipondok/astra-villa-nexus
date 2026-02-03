import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AgentCard from './AgentCard';
import { Loader2, Shield } from 'lucide-react';

interface VerifiedAgentsListProps {
  searchQuery: string;
}

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

      if (!agentRoles?.length) return [];

      const userIds = agentRoles.map(r => r.user_id);

      // Get verified profiles - use verification_status and business_address
      let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, business_address, verification_status, phone, email')
        .in('id', userIds)
        .eq('verification_status', 'verified');

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,business_address.ilike.%${searchQuery}%`);
      }

      const { data: profiles } = await query.limit(20);

      return (profiles || []).map(profile => ({
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
        rating: 4.5 + Math.random() * 0.5,
        response_rate: 90 + Math.floor(Math.random() * 10)
      }));
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
        <Shield className="h-5 w-5 text-green-600" />
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
