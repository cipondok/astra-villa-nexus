import { useState } from "react";
import { getCurrencyFormatter } from "@/stores/currencyStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Code, 
  Palette, 
  Megaphone, 
  MessageSquare, 
  MapPin, 
  Brain, 
  Handshake,
  Plus,
  Search,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  Globe,
  Briefcase,
  UserPlus,
  Target,
  Award,
  Zap
} from "lucide-react";

const TeamManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  // Fetch core team members
  const { data: coreTeam = [], isLoading: loadingCore } = useQuery({
    queryKey: ['core-team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('core_team_members')
        .select('*')
        .order('department', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch community moderators (existing table has different schema)
  const { data: moderators = [], isLoading: loadingMods } = useQuery({
    queryKey: ['community-moderators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_moderators')
        .select('*, profiles:user_id(full_name, email, avatar_url)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch local experts
  const { data: localExperts = [], isLoading: loadingExperts } = useQuery({
    queryKey: ['local-experts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('local_experts')
        .select('*')
        .order('city', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch AI training specialists
  const { data: aiSpecialists = [], isLoading: loadingAI } = useQuery({
    queryKey: ['ai-training-specialists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_training_specialists')
        .select('*')
        .order('specialist_level', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch partnership managers
  const { data: partnershipManagers = [], isLoading: loadingPartners } = useQuery({
    queryKey: ['partnership-managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partnership_managers')
        .select('*')
        .order('manager_level', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch hiring pipeline
  const { data: hiringPipeline = [] } = useQuery({
    queryKey: ['team-hiring-pipeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_hiring_pipeline')
        .select('*')
        .eq('status', 'open')
        .order('posted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Stats calculations
  const coreByDepartment = {
    technology: coreTeam.filter(m => m.department === 'technology').length,
    product: coreTeam.filter(m => m.department === 'product').length,
    marketing: coreTeam.filter(m => m.department === 'marketing').length,
    operations: coreTeam.filter(m => m.department === 'operations').length,
  };

  const activeModerators = moderators.filter((m: any) => m.is_active === true).length;
  const activeExperts = localExperts.filter((e: any) => e.status === 'active').length;
  const activeAISpecialists = aiSpecialists.filter((s: any) => s.status === 'active').length;
  const activePartnerManagers = partnershipManagers.filter((p: any) => p.status === 'active').length;

  const totalOpenPositions = hiringPipeline.reduce((acc: number, p: any) => acc + ((p.total_positions || 0) - (p.positions_filled || 0)), 0);

  const cities = [...new Set(localExperts.map((e: any) => e.city))];

  const filteredExperts = localExperts.filter((expert: any) => {
    const name = expert.full_name || '';
    const city = expert.city || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'all' || city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
      case 'technology': return <Code className="h-4 w-4" />;
      case 'product': return <Palette className="h-4 w-4" />;
      case 'marketing': return <Megaphone className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-chart-1';
      case 'onboarding': return 'bg-chart-2';
      case 'on_leave': return 'bg-chart-3';
      case 'inactive': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-primary/80 text-primary-foreground';
      case 'gold': return 'bg-chart-3/80 text-background';
      case 'silver': return 'bg-muted-foreground/80 text-background';
      default: return 'bg-chart-4/80 text-background';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-border">
        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Remote-First Team Management</h2>
            <Badge className="bg-primary/20 text-primary text-xs">Platform</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Manage core team, moderators, local experts, AI specialists, and partnerships</p>
        </div>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-2/20 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{coreTeam.length}</p>
                <p className="text-xs text-muted-foreground">Core Team</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-1/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeModerators}</p>
                <p className="text-xs text-muted-foreground">Moderators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-3/20 rounded-lg flex items-center justify-center">
                <MapPin className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeExperts}</p>
                <p className="text-xs text-muted-foreground">Local Experts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAISpecialists}</p>
                <p className="text-xs text-muted-foreground">AI Specialists</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-chart-4/20 rounded-lg flex items-center justify-center">
                <Handshake className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePartnerManagers}</p>
                <p className="text-xs text-muted-foreground">Partners Mgrs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="core" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 h-10">
          <TabsTrigger value="core" className="text-xs gap-1">
            <Code className="h-3 w-3" />
            Core Team
          </TabsTrigger>
          <TabsTrigger value="moderators" className="text-xs gap-1">
            <MessageSquare className="h-3 w-3" />
            Moderators
          </TabsTrigger>
          <TabsTrigger value="experts" className="text-xs gap-1">
            <MapPin className="h-3 w-3" />
            Local Experts
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs gap-1">
            <Brain className="h-3 w-3" />
            AI Training
          </TabsTrigger>
          <TabsTrigger value="partnerships" className="text-xs gap-1">
            <Handshake className="h-3 w-3" />
            Partnerships
          </TabsTrigger>
          <TabsTrigger value="hiring" className="text-xs gap-1">
            <UserPlus className="h-3 w-3" />
            Hiring ({totalOpenPositions})
          </TabsTrigger>
        </TabsList>

        {/* Core Team Tab */}
        <TabsContent value="core" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Core Team (10 People)</CardTitle>
                  <CardDescription className="text-xs">Tech, Product, Marketing departments</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Code className="h-3 w-3" /> Tech: {coreByDepartment.technology}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Palette className="h-3 w-3" /> Product: {coreByDepartment.product}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Megaphone className="h-3 w-3" /> Marketing: {coreByDepartment.marketing}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingCore ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : coreTeam.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No core team members yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Start building your remote-first team</p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Member
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coreTeam.map((member: any) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>{member.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{member.full_name}</p>
                              {member.is_team_lead && (
                                <Badge className="bg-chart-3/20 text-chart-3 text-[10px]">Lead</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.job_title}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px] gap-1">
                                {getDepartmentIcon(member.department)}
                                {member.department}
                              </Badge>
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          {member.timezone || 'Asia/Jakarta'}
                          <Clock className="h-3 w-3 ml-2" />
                          Since {new Date(member.hire_date).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moderators Tab */}
        <TabsContent value="moderators" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Community Moderators (50+ Contractors)</CardTitle>
                  <CardDescription className="text-xs">Forums, reviews, chat, social media moderation</CardDescription>
                </div>
                <Badge className="bg-chart-1/20 text-chart-1">{activeModerators} Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMods ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : moderators.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No moderators yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Hire contractors to moderate your community</p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Moderator
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {moderators.slice(0, 8).map((mod: any) => {
                    const profile = mod.profiles;
                    const displayName = profile?.full_name || mod.user_id?.substring(0, 8) || 'Moderator';
                    return (
                      <Card key={mod.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="text-xs">{displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{displayName}</p>
                              <div className="flex items-center gap-1">
                                <Badge variant="outline" className="text-[9px]">{mod.role}</Badge>
                                <div className={`w-1.5 h-1.5 rounded-full ${mod.is_active ? 'bg-chart-1' : 'bg-muted-foreground'}`} />
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-[10px] text-muted-foreground">
                            <div className="flex flex-wrap gap-1">
                              {mod.assigned_categories?.slice(0, 3).map((cat: string) => (
                                <Badge key={cat} variant="secondary" className="text-[8px]">{cat}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Local Experts Tab */}
        <TabsContent value="experts" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Local Experts (100+ Per City)</CardTitle>
                  <CardDescription className="text-xs">Commission-based property experts across cities</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 w-40 text-sm"
                    />
                  </div>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue placeholder="City" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingExperts ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : filteredExperts.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No local experts yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Recruit commission-based experts in each city</p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Local Expert
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredExperts.slice(0, 9).map((expert: any) => (
                    <Card key={expert.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={expert.avatar_url} />
                            <AvatarFallback>{expert.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{expert.full_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] gap-1">
                                <MapPin className="h-3 w-3" />
                                {expert.city}
                              </Badge>
                              <Badge className={`text-[10px] ${getTierColor(expert.commission_tier)}`}>
                                {expert.commission_tier}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold">{expert.total_deals_closed || 0}</p>
                            <p className="text-[10px] text-muted-foreground">Deals</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold">{expert.rating || 0}</p>
                            <p className="text-[10px] text-muted-foreground">Rating</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold">{expert.commission_rate}%</p>
                            <p className="text-[10px] text-muted-foreground">Rate</p>
                          </div>
                        </div>
                        <div className="mt-3 text-xs">
                          <div className="flex justify-between text-muted-foreground mb-1">
                            <span>Commission Earned</span>
                            <span className="font-medium text-foreground">
                              {getCurrencyFormatter()(expert.total_commission_earned || 0)}
                            </span>
                          </div>
                          <Progress value={Math.min(100, (expert.total_deals_closed || 0) * 10)} className="h-1" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Training Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">AI Training Specialists</CardTitle>
                  <CardDescription className="text-xs">Data labeling, annotation, and model training</CardDescription>
                </div>
                <Badge className="bg-primary/20 text-primary">{activeAISpecialists} Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAI ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : aiSpecialists.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No AI specialists yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Hire specialists for data labeling and model training</p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add AI Specialist
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiSpecialists.map((specialist: any) => (
                    <Card key={specialist.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Brain className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{specialist.full_name}</p>
                            <Badge variant="outline" className="text-[10px] mt-1">{specialist.specialist_level}</Badge>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Accuracy</span>
                            <span className="font-medium">{specialist.accuracy_score || 0}%</span>
                          </div>
                          <Progress value={specialist.accuracy_score || 0} className="h-1.5" />
                          <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                            <div className="p-2 bg-muted/30 rounded">
                              <p className="font-bold">{specialist.total_tasks_completed || 0}</p>
                              <p className="text-muted-foreground">Tasks</p>
                            </div>
                            <div className="p-2 bg-muted/30 rounded">
                              <p className="font-bold">{specialist.total_labels_created || 0}</p>
                              <p className="text-muted-foreground">Labels</p>
                            </div>
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

        {/* Partnerships Tab */}
        <TabsContent value="partnerships" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Partnership Managers</CardTitle>
                  <CardDescription className="text-xs">Industry relationships and strategic alliances</CardDescription>
                </div>
                <Badge className="bg-chart-4/20 text-chart-4">{activePartnerManagers} Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPartners ? (
                <p className="text-center text-muted-foreground py-8">Loading...</p>
              ) : partnershipManagers.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Handshake className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="font-medium">No partnership managers yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Build your partnerships team</p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Partnership Manager
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partnershipManagers.map((manager: any) => (
                    <Card key={manager.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={manager.avatar_url} />
                            <AvatarFallback>{manager.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{manager.full_name}</p>
                            <p className="text-sm text-muted-foreground">{manager.manager_level} Manager</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {manager.industries_covered?.slice(0, 3).map((industry: string) => (
                                <Badge key={industry} variant="outline" className="text-[9px]">{industry}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold">{manager.active_partnerships || 0}</p>
                            <p className="text-[10px] text-muted-foreground">Active</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold">{manager.proposals_accepted || 0}</p>
                            <p className="text-[10px] text-muted-foreground">Closed</p>
                          </div>
                          <div className="p-2 bg-muted/30 rounded">
                            <p className="text-lg font-bold">{manager.nps_score || 0}</p>
                            <p className="text-[10px] text-muted-foreground">NPS</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Revenue Generated</span>
                          <span className="font-medium text-chart-1">
                            {getCurrencyFormatter()(manager.revenue_generated || 0)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hiring Pipeline Tab */}
        <TabsContent value="hiring" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Hiring Pipeline</CardTitle>
                  <CardDescription className="text-xs">Open positions across all team types</CardDescription>
                </div>
                <Badge className="bg-chart-2/20 text-chart-2">{totalOpenPositions} Open Positions</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hiringPipeline.map((position: any) => (
                  <Card key={position.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            position.position_type === 'core' ? 'bg-chart-2/20' :
                            position.position_type === 'moderator' ? 'bg-chart-1/20' :
                            position.position_type === 'local_expert' ? 'bg-chart-3/20' :
                            position.position_type === 'ai_specialist' ? 'bg-primary/20' :
                            'bg-chart-4/20'
                          }`}>
                           {position.position_type === 'core' ? <Code className="h-5 w-5 text-chart-2" /> :
                             position.position_type === 'moderator' ? <MessageSquare className="h-5 w-5 text-chart-1" /> :
                             position.position_type === 'local_expert' ? <MapPin className="h-5 w-5 text-chart-3" /> :
                             position.position_type === 'ai_specialist' ? <Brain className="h-5 w-5 text-primary" /> :
                             <Handshake className="h-5 w-5 text-chart-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{position.job_title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px]">{position.position_type}</Badge>
                              <Badge variant="outline" className="text-[10px]">{position.employment_type}</Badge>
                              {position.location && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />{position.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{position.total_positions - position.positions_filled}</p>
                          <p className="text-xs text-muted-foreground">positions open</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {position.applicants_count || 0} applicants
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {position.interviews_scheduled || 0} interviews
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {position.offers_sent || 0} offers
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Capacity Targets */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Capacity Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Core Team</span>
                <span className="font-medium">{coreTeam.length}/10</span>
              </div>
              <Progress value={(coreTeam.length / 10) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Moderators</span>
                <span className="font-medium">{activeModerators}/50+</span>
              </div>
              <Progress value={(activeModerators / 50) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Local Experts</span>
                <span className="font-medium">{activeExperts}/100+ per city</span>
              </div>
              <Progress value={(activeExperts / 100) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>AI Specialists</span>
                <span className="font-medium">{activeAISpecialists}/∞</span>
              </div>
              <Progress value={activeAISpecialists > 0 ? 50 : 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Partner Managers</span>
                <span className="font-medium">{activePartnerManagers}/∞</span>
              </div>
              <Progress value={activePartnerManagers > 0 ? 50 : 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
