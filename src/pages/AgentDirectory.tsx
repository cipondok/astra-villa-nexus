import { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Award, Shield, UserPlus, Users, Star, TrendingUp } from 'lucide-react';
import AgentHeroBanner from '@/components/agents/AgentHeroBanner';
import TopAgentsCarousel from '@/components/agents/TopAgentsCarousel';
import VerifiedAgentsList from '@/components/agents/VerifiedAgentsList';
import AgentSearchResults from '@/components/agents/AgentSearchResults';
import AgentRegistrationCTA from '@/components/agents/AgentRegistrationCTA';

const AgentDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Fetch agent stats for the hero section
  const { data: agentStats } = useQuery({
    queryKey: ['agent-directory-stats'],
    queryFn: async () => {
      const { count: totalAgents } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'agent')
        .eq('is_active', true);

      const { count: verifiedAgents } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');

      return {
        totalAgents: totalAgents || 0,
        verifiedAgents: verifiedAgents || 0,
        propertiesSold: 1250,
        satisfactionRate: 98
      };
    },
    staleTime: 5 * 60 * 1000
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already reactive through the searchQuery state
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Direktori Agen Properti"
        description="Temukan agen properti terpercaya dan terverifikasi di seluruh Indonesia. Ribuan agen profesional siap membantu transaksi properti Anda."
        keywords="agen properti indonesia, agen properti terpercaya, cari agen, real estate agent"
      />
      {/* Hero Banner Section */}
      <AgentHeroBanner stats={agentStats} />

      {/* Search Section */}
      <div className="bg-primary/5 py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari lokasi, nama agen, atau kata kunci..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-background border-border"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-8">
                Cari
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Top Agents Award Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-primary-foreground" />
              <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground">
                Para Pemenang Agent Award
              </h2>
            </div>
            <Button variant="secondary" size="sm">
              Lihat Selengkapnya
            </Button>
          </div>
          <TopAgentsCarousel />
        </div>
      </section>

      {/* Main Content - Tabs */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-12">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Semua Agen</span>
                <span className="sm:hidden">Semua</span>
              </TabsTrigger>
              <TabsTrigger value="verified" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Terverifikasi</span>
                <span className="sm:hidden">Verified</span>
              </TabsTrigger>
              <TabsTrigger value="top" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">Top Agen</span>
                <span className="sm:hidden">Top</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <AgentSearchResults searchQuery={searchQuery} filter="all" />
            </TabsContent>

            <TabsContent value="verified" className="space-y-6">
              <VerifiedAgentsList searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="top" className="space-y-6">
              <AgentSearchResults searchQuery={searchQuery} filter="top" />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Agent Registration CTA */}
      <AgentRegistrationCTA />
    </div>
  );
};

export default AgentDirectory;
