import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Rocket, 
  Users, 
  Gift, 
  Trophy, 
  Camera, 
  Medal, 
  DollarSign,
  TrendingUp,
  Target,
  Zap,
  Star,
  Crown,
  Award,
  Heart,
  Share2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  BarChart3,
  Sparkles,
  Play,
  Pause,
  Edit,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const ViralGrowthCampaigns = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch all campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['viral-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('viral_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch referral milestone participants
  const { data: referralParticipants = [] } = useQuery({
    queryKey: ['referral-milestone-participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_milestone_campaigns')
        .select('*, profiles:user_id(full_name, email, avatar_url)')
        .order('referrals_completed', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch photo contest entries
  const { data: photoEntries = [] } = useQuery({
    queryKey: ['photo-contest-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photo_contest_entries')
        .select('*, profiles:user_id(full_name, email, avatar_url)')
        .order('vote_count', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch agent leaderboard
  const { data: agentLeaderboard = [] } = useQuery({
    queryKey: ['agent-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agent_leaderboard_rewards')
        .select('*, profiles:agent_id(full_name, email, avatar_url)')
        .order('total_points', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch first-time bonuses
  const { data: firstTimeBonuses = [] } = useQuery({
    queryKey: ['first-time-bonuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('first_time_user_bonuses')
        .select('*, profiles:user_id(full_name, email, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  // Toggle campaign active status
  const toggleCampaign = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('viral_campaigns')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viral-campaigns'] });
      toast.success('Campaign updated');
    }
  });

  // Approve photo entry
  const approvePhoto = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from('photo_contest_entries')
        .update({ approved: true, rejected: false })
        .eq('id', entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-contest-entries'] });
      toast.success('Photo approved');
    }
  });

  // Calculate stats
  const activeCampaigns = campaigns.filter(c => c.is_active).length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent_budget || 0), 0);
  const totalParticipants = campaigns.reduce((sum, c) => sum + (c.total_participants || 0), 0);

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'referral_milestone': return <Users className="h-5 w-5" />;
      case 'listing_competition': return <Trophy className="h-5 w-5" />;
      case 'photo_contest': return <Camera className="h-5 w-5" />;
      case 'agent_leaderboard': return <Medal className="h-5 w-5" />;
      case 'first_time_bonus': return <Gift className="h-5 w-5" />;
      default: return <Rocket className="h-5 w-5" />;
    }
  };

  const getCampaignColor = (type: string) => {
    switch (type) {
      case 'referral_milestone': return 'from-blue-500 to-cyan-500';
      case 'listing_competition': return 'from-purple-500 to-pink-500';
      case 'photo_contest': return 'from-orange-500 to-red-500';
      case 'agent_leaderboard': return 'from-yellow-500 to-amber-500';
      case 'first_time_bonus': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white gap-1"><Crown className="h-3 w-3" /> Gold</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 text-white gap-1"><Medal className="h-3 w-3" /> Silver</Badge>;
    if (rank === 3) return <Badge className="bg-orange-700 text-white gap-1"><Award className="h-3 w-3" /> Bronze</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Viral Growth Campaigns</h2>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <Target className="h-3 w-3 mr-1" />
              Goal: 300% Growth
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Quick wins to drive 300% user growth in 30 days</p>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
          <Sparkles className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-green-200/50 dark:border-green-800/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200/50 dark:border-blue-800/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalParticipants.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50 dark:border-purple-800/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalBudget / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Total Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200/50 dark:border-orange-800/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalSpent / 1000).toFixed(1)}k</p>
                <p className="text-xs text-muted-foreground">Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200/50 dark:border-pink-800/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}%</p>
                <p className="text-xs text-muted-foreground">Budget Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 h-10">
          <TabsTrigger value="overview" className="text-xs gap-1">
            <Rocket className="h-3 w-3" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="referral" className="text-xs gap-1">
            <Users className="h-3 w-3" />
            Referral 3x
          </TabsTrigger>
          <TabsTrigger value="listing" className="text-xs gap-1">
            <Trophy className="h-3 w-3" />
            Listing Comp
          </TabsTrigger>
          <TabsTrigger value="photo" className="text-xs gap-1">
            <Camera className="h-3 w-3" />
            Photo Contest
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-xs gap-1">
            <Medal className="h-3 w-3" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="bonus" className="text-xs gap-1">
            <Gift className="h-3 w-3" />
            $50 Bonus
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getCampaignColor(campaign.campaign_type)} flex items-center justify-center text-white`}>
                      {getCampaignIcon(campaign.campaign_type)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={campaign.is_active}
                        onCheckedChange={(checked) => toggleCampaign.mutate({ id: campaign.id, is_active: checked })}
                      />
                      {campaign.is_active ? (
                        <Badge className="bg-green-500/20 text-green-700">Active</Badge>
                      ) : (
                        <Badge variant="outline">Paused</Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2">{campaign.campaign_name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reward</span>
                    <Badge variant="secondary" className="gap-1">
                      <DollarSign className="h-3 w-3" />
                      {campaign.reward_description}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Budget Used</span>
                      <span>${campaign.spent_budget?.toLocaleString() || 0} / ${campaign.budget?.toLocaleString() || 0}</span>
                    </div>
                    <Progress value={(campaign.spent_budget || 0) / (campaign.budget || 1) * 100} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Participants</span>
                    <span className="font-semibold">{campaign.total_participants?.toLocaleString() || 0}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Referral 3x Tab */}
        <TabsContent value="referral" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Refer 3 Friends, Get 6 Months Free
                  </CardTitle>
                  <CardDescription>Track referral milestone progress</CardDescription>
                </div>
                <Badge className="bg-blue-500/20 text-blue-700">
                  {referralParticipants.length} Participants
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {referralParticipants.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No participants yet</p>
                  <p className="text-sm text-muted-foreground">Promote the campaign to get users started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referralParticipants.slice(0, 10).map((participant: any) => (
                    <div key={participant.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.profiles?.avatar_url} />
                        <AvatarFallback>{participant.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{participant.profiles?.full_name || 'Unknown User'}</p>
                        <p className="text-xs text-muted-foreground">{participant.profiles?.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">
                            {participant.referrals_completed}/{participant.referrals_required}
                          </p>
                          <p className="text-xs text-muted-foreground">Referrals</p>
                        </div>
                        <Progress 
                          value={(participant.referrals_completed / participant.referrals_required) * 100} 
                          className="w-24 h-2" 
                        />
                        {participant.reward_claimed ? (
                          <Badge className="bg-green-500/20 text-green-700 gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Claimed
                          </Badge>
                        ) : participant.milestone_reached_at ? (
                          <Badge className="bg-yellow-500/20 text-yellow-700 gap-1">
                            <Clock className="h-3 w-3" />
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline">In Progress</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photo Contest Tab */}
        <TabsContent value="photo" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Camera className="h-5 w-5 text-orange-500" />
                    Most Beautiful Home Photo Contest
                  </CardTitle>
                  <CardDescription>Review and approve photo submissions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-orange-500/20 text-orange-700">
                    {photoEntries.length} Entries
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-700">
                    {photoEntries.filter(e => e.approved).length} Approved
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {photoEntries.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No photo entries yet</p>
                  <p className="text-sm text-muted-foreground">Submissions will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photoEntries.slice(0, 12).map((entry: any, index: number) => (
                    <Card key={entry.id} className="overflow-hidden">
                      <div className="relative aspect-square bg-muted">
                        <img 
                          src={entry.photo_url} 
                          alt={entry.photo_title || 'Contest entry'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image';
                          }}
                        />
                        {index < 3 && entry.approved && (
                          <div className="absolute top-2 left-2">
                            {getRankBadge(index + 1)}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                              {entry.profiles?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs truncate">{entry.profiles?.full_name || 'User'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Heart className="h-3 w-3" />
                            <span>{entry.vote_count}</span>
                            <Eye className="h-3 w-3 ml-1" />
                            <span>{entry.view_count}</span>
                          </div>
                          {!entry.approved && !entry.rejected && (
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0 text-green-600"
                                onClick={() => approvePhoto.mutate(entry.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {entry.approved && (
                            <Badge className="bg-green-500/20 text-green-700 text-[10px]">Approved</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Medal className="h-5 w-5 text-yellow-500" />
                    Agent of the Month Leaderboard
                  </CardTitle>
                  <CardDescription>Top performing agents with monthly rewards</CardDescription>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-700">
                  {format(new Date(), 'MMMM yyyy')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {agentLeaderboard.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Medal className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No leaderboard data yet</p>
                  <p className="text-sm text-muted-foreground">Agent rankings will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agentLeaderboard.slice(0, 10).map((agent: any, index: number) => (
                    <div 
                      key={agent.id} 
                      className={`flex items-center gap-4 p-3 rounded-lg border ${
                        index === 0 ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200' :
                        index === 1 ? 'bg-gray-50 dark:bg-gray-950/20 border-gray-200' :
                        index === 2 ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' :
                        'bg-card'
                      }`}
                    >
                      <div className="w-8 text-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={agent.profiles?.avatar_url} />
                        <AvatarFallback>{agent.profiles?.full_name?.charAt(0) || 'A'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{agent.profiles?.full_name || 'Agent'}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{agent.total_listings} listings</span>
                          <span>•</span>
                          <span>{agent.total_sales} sales</span>
                          <span>•</span>
                          <span>⭐ {agent.avg_rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{agent.total_points?.toLocaleString() || 0}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                      {getRankBadge(index + 1)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* $50 Bonus Tab */}
        <TabsContent value="bonus" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="h-5 w-5 text-green-500" />
                    Welcome Bonus - $50 Credit
                  </CardTitle>
                  <CardDescription>Track first-time user bonus distribution</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-green-500/20 text-green-700">
                    {firstTimeBonuses.length} Distributed
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-700">
                    ${firstTimeBonuses.reduce((sum, b) => sum + (b.bonus_amount || 0), 0).toLocaleString()} Total
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {firstTimeBonuses.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No bonuses distributed yet</p>
                  <p className="text-sm text-muted-foreground">First-time user bonuses will appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {firstTimeBonuses.slice(0, 20).map((bonus: any) => (
                    <div key={bonus.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={bonus.profiles?.avatar_url} />
                        <AvatarFallback>{bonus.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{bonus.profiles?.full_name || 'New User'}</p>
                        <p className="text-xs text-muted-foreground">{bonus.profiles?.email}</p>
                      </div>
                      <div className="text-center">
                        <Badge className="bg-green-500/20 text-green-700">
                          ${bonus.bonus_amount} {bonus.bonus_type}
                        </Badge>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{format(new Date(bonus.created_at), 'MMM d, yyyy')}</p>
                        <p>{bonus.claimed ? 'Claimed' : bonus.used ? 'Used' : 'Pending'}</p>
                      </div>
                      {bonus.used ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : bonus.claimed ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Gift className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listing Competition Tab - Placeholder */}
        <TabsContent value="listing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple-500" />
                Property Listing Competition
              </CardTitle>
              <CardDescription>Best listings with cash prizes for top 10</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="font-medium">Competition tracking coming soon</p>
                <p className="text-sm text-muted-foreground">Listing entries and scoring will be available here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ViralGrowthCampaigns;
