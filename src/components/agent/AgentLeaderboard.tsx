import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Trophy, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Star, 
  Medal,
  Crown,
  Target,
  Users,
  Building,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";

interface AgentStats {
  id: string;
  name: string;
  avatar_url?: string;
  total_properties: number;
  active_properties: number;
  total_views: number;
  total_inquiries: number;
  rating: number;
  conversion_rate: number;
  rank: number;
  rank_change: number; // positive = up, negative = down
  membership_level: string;
}

const AgentLeaderboard = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  // Fetch agent rankings with their stats
  const { data: rankings = [], isLoading } = useQuery({
    queryKey: ['agent-leaderboard', period],
    queryFn: async () => {
      // Get all agents with their property counts
      const { data: agents, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          profile_completion_percentage
        `)
        .limit(20);

      if (error) throw error;

      // Get property counts for each agent
      const agentStats: AgentStats[] = await Promise.all(
        (agents || []).map(async (agent, index) => {
          const { count: totalProperties } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agent.id);

          const { count: activeProperties } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agent.id)
            .eq('status', 'active');

          // Simulated metrics (in production, these would come from analytics tables)
          const hash = agent.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          
          return {
            id: agent.id,
            name: agent.full_name || 'Agent',
            avatar_url: agent.avatar_url,
            total_properties: totalProperties || 0,
            active_properties: activeProperties || 0,
            total_views: (hash % 500) + 100,
            total_inquiries: (hash % 50) + 5,
            rating: 3.5 + (hash % 15) / 10,
            conversion_rate: 5 + (hash % 15),
            rank: index + 1,
            rank_change: (hash % 5) - 2,
            membership_level: ['Basic', 'Verified', 'Gold', 'Platinum', 'Diamond'][hash % 5]
          };
        })
      );

      // Sort by a composite score
      return agentStats.sort((a, b) => {
        const scoreA = a.total_properties * 10 + a.total_views * 0.1 + a.total_inquiries * 5 + a.rating * 20;
        const scoreB = b.total_properties * 10 + b.total_views * 0.1 + b.total_inquiries * 5 + b.rating * 20;
        return scoreB - scoreA;
      }).map((agent, index) => ({ ...agent, rank: index + 1 }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Find current user's stats
  const myStats = rankings.find(r => r.id === user?.id);
  const myRank = myStats?.rank || rankings.length + 1;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-emerald-500" />;
    if (change < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'Basic': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      'Verified': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'Gold': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Platinum': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'Diamond': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    };
    return colors[level] || colors['Basic'];
  };

  return (
    <div className="space-y-3">
      {/* My Performance Card */}
      {myStats && (
        <Card className="bg-gradient-to-br from-primary/10 via-card to-accent/10 border-primary/20">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              My Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="text-center p-2 bg-card/50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {getRankIcon(myRank)}
                  {getRankChangeIcon(myStats.rank_change)}
                </div>
                <div className="text-lg font-bold">#{myRank}</div>
                <div className="text-[9px] text-muted-foreground">Current Rank</div>
              </div>
              <div className="text-center p-2 bg-card/50 rounded-lg">
                <Eye className="h-3.5 w-3.5 mx-auto mb-1 text-blue-500" />
                <div className="text-lg font-bold">{myStats.total_views}</div>
                <div className="text-[9px] text-muted-foreground">Total Views</div>
              </div>
              <div className="text-center p-2 bg-card/50 rounded-lg">
                <MessageSquare className="h-3.5 w-3.5 mx-auto mb-1 text-emerald-500" />
                <div className="text-lg font-bold">{myStats.total_inquiries}</div>
                <div className="text-[9px] text-muted-foreground">Inquiries</div>
              </div>
              <div className="text-center p-2 bg-card/50 rounded-lg">
                <Target className="h-3.5 w-3.5 mx-auto mb-1 text-orange-500" />
                <div className="text-lg font-bold">{myStats.conversion_rate}%</div>
                <div className="text-[9px] text-muted-foreground">Conversion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Agent Rankings
            </CardTitle>
            <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <TabsList className="h-7">
                <TabsTrigger value="week" className="text-[10px] px-2 py-1">Week</TabsTrigger>
                <TabsTrigger value="month" className="text-[10px] px-2 py-1">Month</TabsTrigger>
                <TabsTrigger value="all" className="text-[10px] px-2 py-1">All Time</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {isLoading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">Loading rankings...</div>
          ) : (
            <div className="space-y-2">
              {rankings.slice(0, 10).map((agent, index) => {
                const isMe = agent.id === user?.id;
                
                return (
                  <div 
                    key={agent.id}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      isMe 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-8 flex items-center justify-center">
                      {getRankIcon(agent.rank)}
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {agent.avatar_url ? (
                        <img 
                          src={agent.avatar_url} 
                          alt={agent.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate flex items-center gap-1">
                          {agent.name}
                          {isMe && <Badge variant="outline" className="text-[8px] px-1 py-0">You</Badge>}
                        </div>
                        <Badge className={`text-[8px] px-1 py-0 ${getLevelColor(agent.membership_level)}`}>
                          {agent.membership_level}
                        </Badge>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-0.5">
                        <Building className="h-3 w-3" />
                        {agent.total_properties}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Eye className="h-3 w-3" />
                        {agent.total_views}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <MessageSquare className="h-3 w-3" />
                        {agent.total_inquiries}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{agent.rating.toFixed(1)}</span>
                    </div>

                    {/* Rank Change */}
                    <div className="w-6 flex items-center justify-center">
                      {getRankChangeIcon(agent.rank_change)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentLeaderboard;
