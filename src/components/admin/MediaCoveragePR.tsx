import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Newspaper, 
  Mic, 
  Target, 
  Building2, 
  TrendingUp,
  ExternalLink,
  Calendar,
  Mail,
  Phone,
  Star,
  Users,
  Globe,
  Plus,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  DollarSign,
  Eye,
  Share2,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const MediaCoveragePR = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("coverage");
  const [newPitchOpen, setNewPitchOpen] = useState(false);

  // Fetch press coverage
  const { data: pressCoverage = [], isLoading: loadingCoverage } = useQuery({
    queryKey: ['press-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('press_coverage')
        .select('*')
        .order('publication_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch PR outreach
  const { data: prOutreach = [] } = useQuery({
    queryKey: ['pr-outreach'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pr_outreach')
        .select('*')
        .order('pitch_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch podcast appearances
  const { data: podcasts = [] } = useQuery({
    queryKey: ['podcast-appearances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcast_appearances')
        .select('*')
        .order('air_date', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch PR agencies
  const { data: agencies = [] } = useQuery({
    queryKey: ['pr-agencies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pr_agencies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch media targets
  const { data: mediaTargets = [] } = useQuery({
    queryKey: ['media-targets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_targets')
        .select('*')
        .order('priority_score', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Stats
  const totalCoverage = pressCoverage.length;
  const totalReach = pressCoverage.reduce((sum, c) => sum + (c.reach_estimate || 0), 0);
  const totalMediaValue = pressCoverage.reduce((sum, c) => sum + (c.media_value_estimate || 0), 0);
  const pendingPitches = prOutreach.filter(p => p.status === 'pending' || p.status === 'sent').length;
  const scheduledPodcasts = podcasts.filter(p => p.status === 'scheduled').length;
  const airedPodcasts = podcasts.filter(p => p.status === 'aired').length;

  const getPublicationIcon = (type: string) => {
    switch (type) {
      case 'tech_media': return '🚀';
      case 'business_media': return '💼';
      case 'local_news': return '📰';
      case 'industry_publication': return '🏢';
      case 'podcast': return '🎙️';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': case 'aired': return 'bg-green-500/20 text-green-700';
      case 'scheduled': case 'confirmed': return 'bg-blue-500/20 text-blue-700';
      case 'interested': case 'responded': return 'bg-yellow-500/20 text-yellow-700';
      case 'pitched': case 'sent': return 'bg-purple-500/20 text-purple-700';
      case 'declined': case 'no_response': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'tier1': return <Badge className="bg-yellow-500 text-white">Tier 1</Badge>;
      case 'tier2': return <Badge className="bg-gray-400 text-white">Tier 2</Badge>;
      case 'tier3': return <Badge variant="outline">Tier 3</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Newspaper className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Media Coverage & PR</h2>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Press Room
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Manage press coverage, HARO outreach, and podcast appearances</p>
        </div>
        <Dialog open={newPitchOpen} onOpenChange={setNewPitchOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              New Pitch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New PR Pitch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Outlet Name (e.g., TechCrunch)" />
              <Input placeholder="Contact Name" />
              <Input placeholder="Contact Email" type="email" />
              <Input placeholder="Pitch Subject" />
              <Textarea placeholder="Pitch Content..." rows={4} />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="haro">HARO</SelectItem>
                  <SelectItem value="direct_pitch">Direct Pitch</SelectItem>
                  <SelectItem value="pr_agency">PR Agency</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full">Send Pitch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Newspaper className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCoverage}</p>
                <p className="text-xs text-muted-foreground">Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(totalReach / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-muted-foreground">Total Reach</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalMediaValue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Media Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Send className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingPitches}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-pink-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <Mic className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{airedPodcasts}</p>
                <p className="text-xs text-muted-foreground">Podcasts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-200/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mediaTargets.length}</p>
                <p className="text-xs text-muted-foreground">Targets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 h-10">
          <TabsTrigger value="coverage" className="text-xs gap-1">
            <Newspaper className="h-3 w-3" />
            Coverage
          </TabsTrigger>
          <TabsTrigger value="outreach" className="text-xs gap-1">
            <Send className="h-3 w-3" />
            Outreach
          </TabsTrigger>
          <TabsTrigger value="podcasts" className="text-xs gap-1">
            <Mic className="h-3 w-3" />
            Podcasts
          </TabsTrigger>
          <TabsTrigger value="targets" className="text-xs gap-1">
            <Target className="h-3 w-3" />
            Targets
          </TabsTrigger>
          <TabsTrigger value="agencies" className="text-xs gap-1">
            <Building2 className="h-3 w-3" />
            Agencies
          </TabsTrigger>
        </TabsList>

        {/* Coverage Tab */}
        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Press Coverage</CardTitle>
                  <CardDescription>Track all media mentions and articles</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Coverage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pressCoverage.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No coverage recorded yet</p>
                  <p className="text-sm text-muted-foreground">Add your first media coverage</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pressCoverage.slice(0, 10).map((coverage: any) => (
                    <div key={coverage.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="text-3xl">{getPublicationIcon(coverage.publication_type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{coverage.article_title}</h4>
                          {coverage.featured && <Badge className="bg-yellow-500/20 text-yellow-700">Featured</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{coverage.publication_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {coverage.publication_date ? format(new Date(coverage.publication_date), 'MMM d, yyyy') : 'TBD'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {(coverage.reach_estimate / 1000).toFixed(0)}k reach
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            {coverage.social_shares} shares
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(coverage.status)}>{coverage.status}</Badge>
                        {coverage.article_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={coverage.article_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outreach Tab */}
        <TabsContent value="outreach" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>PR Outreach & HARO</CardTitle>
                  <CardDescription>Track pitches, follow-ups, and responses</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-500/20 text-blue-700">
                    {prOutreach.filter(p => p.source === 'haro').length} HARO
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-700">
                    {prOutreach.filter(p => p.source === 'direct_pitch').length} Direct
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {prOutreach.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Send className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No outreach yet</p>
                  <p className="text-sm text-muted-foreground">Start pitching to media outlets</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prOutreach.slice(0, 10).map((pitch: any) => (
                    <div key={pitch.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                      <div className={`w-2 h-12 rounded-full ${
                        pitch.priority === 'high' ? 'bg-red-500' : 
                        pitch.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{pitch.outlet_name}</h4>
                          <Badge variant="outline" className="text-[10px]">{pitch.source}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{pitch.pitch_subject}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{pitch.contact_name}</span>
                          {pitch.deadline && (
                            <span className="text-red-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due: {format(new Date(pitch.deadline), 'MMM d')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(pitch.status)}>{pitch.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Podcasts Tab */}
        <TabsContent value="podcasts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Podcast Appearances
                  </CardTitle>
                  <CardDescription>Goal: 10 interviews/month</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={(airedPodcasts / 10) * 100} className="w-32 h-2" />
                  <span className="text-sm font-medium">{airedPodcasts}/10</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {podcasts.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Mic className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No podcast appearances</p>
                  <p className="text-sm text-muted-foreground">Start booking podcast interviews</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {podcasts.slice(0, 8).map((podcast: any) => (
                    <Card key={podcast.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
                            🎙️
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{podcast.podcast_name}</h4>
                            <p className="text-sm text-muted-foreground">{podcast.host_name}</p>
                            {podcast.episode_title && (
                              <p className="text-xs mt-1 truncate">{podcast.episode_title}</p>
                            )}
                          </div>
                          <Badge className={getStatusColor(podcast.status)}>{podcast.status}</Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          {podcast.air_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(podcast.air_date), 'MMM d, yyyy')}
                            </span>
                          )}
                          {podcast.listener_estimate && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {(podcast.listener_estimate / 1000).toFixed(0)}k listeners
                            </span>
                          )}
                          {podcast.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {podcast.duration_minutes}min
                            </span>
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

        {/* Media Targets Tab */}
        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Media Targets</CardTitle>
              <CardDescription>Priority publications for coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mediaTargets.map((target: any) => (
                  <div key={target.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                    <div className="text-2xl">{getPublicationIcon(target.publication_type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{target.publication_name}</h4>
                        {getTierBadge(target.tier)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {(target.monthly_visitors / 1000000).toFixed(0)}M visitors
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Priority: {target.priority_score}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {target.target_topics?.slice(0, 3).map((topic: string) => (
                        <Badge key={topic} variant="outline" className="text-[10px]">{topic}</Badge>
                      ))}
                    </div>
                    <Badge className={getStatusColor(target.status)}>{target.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agencies Tab */}
        <TabsContent value="agencies" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>PR Agencies</CardTitle>
                  <CardDescription>Manage agency relationships</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Agency
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {agencies.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No PR agencies</p>
                  <p className="text-sm text-muted-foreground">Add your first PR agency or use HARO</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agencies.map((agency: any) => (
                    <Card key={agency.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{agency.agency_name}</h4>
                            <p className="text-sm text-muted-foreground">{agency.agency_type}</p>
                          </div>
                          <Badge className={agency.is_active ? 'bg-green-500/20 text-green-700' : 'bg-gray-500/20 text-gray-700'}>
                            {agency.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Retainer</p>
                            <p className="font-medium">${agency.monthly_retainer?.toLocaleString()}/mo</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Placements</p>
                            <p className="font-medium">{agency.total_placements}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaCoveragePR;
