import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Crown, Edit, Plus, Trash2, Shield, Star, Gem, Award, Users, Sparkles,
  Building, ListChecks, Zap, HeadphonesIcon, TrendingUp, Check, Search,
  UserCog, Mail, RefreshCw, ChevronDown
} from "lucide-react";
import { MEMBERSHIP_LEVELS, getMembershipFromUserLevel, type MembershipLevel } from "@/types/membership";

interface UserLevel {
  id: string;
  name: string;
  description: string;
  privileges: any;
  max_properties: number;
  max_listings: number;
  can_feature_listings: boolean;
  priority_support: boolean;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  user_level_id: string | null;
  verification_status: string | null;
  created_at: string;
}

const getLevelIcon = (levelName: string, size: 'sm' | 'md' | 'lg' = 'sm') => {
  const membership = getMembershipFromUserLevel(levelName);
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  switch (membership) {
    case 'diamond': return <Gem className={`${sizeClass} text-sky-500`} />;
    case 'platinum': return <Sparkles className={`${sizeClass} text-cyan-500`} />;
    case 'gold': return <Crown className={`${sizeClass} text-yellow-500`} />;
    case 'vip': return <Star className={`${sizeClass} text-purple-500`} />;
    case 'verified': return <Shield className={`${sizeClass} text-blue-500`} />;
    default: return <Users className={`${sizeClass} text-muted-foreground`} />;
  }
};

const getLevelBadgeStyle = (levelName: string) => {
  const membership = getMembershipFromUserLevel(levelName);
  const config = MEMBERSHIP_LEVELS[membership];
  return `${config.bgColor} ${config.color} ${config.borderColor} border`;
};

const UserLevelManagement = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<UserLevel | null>(null);
  const [activeTab, setActiveTab] = useState("levels");
  const [userSearch, setUserSearch] = useState("");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>("all");
  const [newLevel, setNewLevel] = useState({
    name: "",
    description: "",
    max_properties: 10,
    max_listings: 5,
    can_feature_listings: false,
    priority_support: false
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch levels
  const { data: levels, isLoading } = useQuery({
    queryKey: ['user-levels'],
    queryFn: async (): Promise<UserLevel[]> => {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user counts per level
  const { data: userCounts } = useQuery({
    queryKey: ['user-level-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_level_id');
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      let totalWithLevel = 0;
      data?.forEach(p => {
        if (p.user_level_id) {
          counts[p.user_level_id] = (counts[p.user_level_id] || 0) + 1;
          totalWithLevel++;
        }
      });
      return { counts, totalUsers: data?.length || 0, totalWithLevel };
    },
  });

  // Fetch users for assignment
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users-for-vip', userSearch, selectedLevelFilter],
    queryFn: async (): Promise<UserProfile[]> => {
      let query = supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, user_level_id, verification_status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (userSearch) {
        query = query.or(`full_name.ilike.%${userSearch}%,email.ilike.%${userSearch}%`);
      }
      
      if (selectedLevelFilter === 'none') {
        query = query.is('user_level_id', null);
      } else if (selectedLevelFilter !== 'all') {
        query = query.eq('user_level_id', selectedLevelFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const createLevelMutation = useMutation({
    mutationFn: async (levelData: typeof newLevel) => {
      const { error } = await supabase
        .from('user_levels')
        .insert({
          ...levelData,
          privileges: { basic_access: true }
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Level Created", "User level created successfully.");
      setIsCreateModalOpen(false);
      setNewLevel({
        name: "",
        description: "",
        max_properties: 10,
        max_listings: 5,
        can_feature_listings: false,
        priority_support: false
      });
      queryClient.invalidateQueries({ queryKey: ['user-levels'] });
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  const updateLevelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<UserLevel> }) => {
      const { error } = await supabase
        .from('user_levels')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Level Updated", "User level updated successfully.");
      setEditingLevel(null);
      queryClient.invalidateQueries({ queryKey: ['user-levels'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: async (levelId: string) => {
      const { error } = await supabase
        .from('user_levels')
        .delete()
        .eq('id', levelId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Level Deleted", "User level deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['user-levels'] });
      queryClient.invalidateQueries({ queryKey: ['user-level-counts'] });
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
    },
  });

  // Assign VIP level to user mutation
  const assignLevelMutation = useMutation({
    mutationFn: async ({ userId, levelId }: { userId: string; levelId: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ user_level_id: levelId })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Level Assigned", "User VIP level updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['users-for-vip'] });
      queryClient.invalidateQueries({ queryKey: ['user-level-counts'] });
    },
    onError: (error: any) => {
      showError("Assignment Failed", error.message);
    },
  });

  const handleCreateLevel = () => {
    if (!newLevel.name) {
      showError("Validation Error", "Level name is required.");
      return;
    }
    createLevelMutation.mutate(newLevel);
  };

  const handleUpdateLevel = (level: UserLevel) => {
    updateLevelMutation.mutate({
      id: level.id,
      data: level
    });
  };

  const handleAssignLevel = (userId: string, levelId: string | null) => {
    assignLevelMutation.mutate({ userId, levelId });
  };

  const getLevelName = (levelId: string | null) => {
    if (!levelId) return 'No Level';
    return levels?.find(l => l.id === levelId)?.name || 'Unknown';
  };

  // Calculate stats
  const totalLevels = levels?.length || 0;
  const totalUsersWithLevel = userCounts?.totalWithLevel || 0;
  const totalUsers = userCounts?.totalUsers || 0;
  const assignmentRate = totalUsers > 0 ? Math.round((totalUsersWithLevel / totalUsers) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            User Levels & VIP Management
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage VIP tiers, privileges, and assign levels to users
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Crown className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Total Levels</p>
              <p className="text-lg font-bold">{totalLevels}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Users className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Users Assigned</p>
              <p className="text-lg font-bold">{totalUsersWithLevel}</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Assignment Rate</p>
              <p className="text-lg font-bold">{assignmentRate}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Award className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Unassigned</p>
              <p className="text-lg font-bold">{totalUsers - totalUsersWithLevel}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="levels" className="text-xs gap-1.5">
            <Crown className="h-3.5 w-3.5" />
            VIP Levels
          </TabsTrigger>
          <TabsTrigger value="assign" className="text-xs gap-1.5">
            <UserCog className="h-3.5 w-3.5" />
            Assign to Users
          </TabsTrigger>
        </TabsList>

        {/* Levels Tab */}
        <TabsContent value="levels" className="space-y-4 mt-4">
          {/* Add Level Button */}
          <div className="flex justify-end">
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Level
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader className="pb-2">
                  <DialogTitle className="text-sm">Create New Level</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Level Name</Label>
                    <Input
                      value={newLevel.name}
                      onChange={(e) => setNewLevel(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Gold VIP, Platinum VIP, Diamond"
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={newLevel.description}
                      onChange={(e) => setNewLevel(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Level benefits description"
                      className="text-xs min-h-[60px] mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Max Properties</Label>
                      <Input
                        type="number"
                        value={newLevel.max_properties}
                        onChange={(e) => setNewLevel(prev => ({ ...prev, max_properties: parseInt(e.target.value) || 0 }))}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max Listings</Label>
                      <Input
                        type="number"
                        value={newLevel.max_listings}
                        onChange={(e) => setNewLevel(prev => ({ ...prev, max_listings: parseInt(e.target.value) || 0 }))}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-yellow-500" />
                      <Label className="text-xs">Can Feature Listings</Label>
                    </div>
                    <Switch
                      checked={newLevel.can_feature_listings}
                      onCheckedChange={(checked) => setNewLevel(prev => ({ ...prev, can_feature_listings: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <HeadphonesIcon className="h-3.5 w-3.5 text-green-500" />
                      <Label className="text-xs">Priority Support</Label>
                    </div>
                    <Switch
                      checked={newLevel.priority_support}
                      onCheckedChange={(checked) => setNewLevel(prev => ({ ...prev, priority_support: checked }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={handleCreateLevel}
                      disabled={createLevelMutation.isPending}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      {createLevelMutation.isPending ? 'Creating...' : 'Create Level'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                      size="sm"
                      className="flex-1 h-8 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Membership Tiers Visual */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-500" />
                Membership Tier System
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {Object.entries(MEMBERSHIP_LEVELS).map(([key, config]) => (
                  <div 
                    key={key}
                    className={`p-3 rounded-lg border text-center transition-all hover:scale-105 ${config.bgColor} ${config.borderColor} ${config.glowColor ? `shadow-lg ${config.glowColor}` : ''}`}
                  >
                    <div className="text-2xl mb-1">{config.icon}</div>
                    <p className={`text-xs font-semibold ${config.color}`}>{config.shortLabel}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">Priority: {config.priority}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configured Levels */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-blue-500" />
                  Configured Levels ({levels?.length || 0})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {isLoading ? (
                <div className="text-center py-6 text-xs text-muted-foreground">Loading levels...</div>
              ) : levels?.length === 0 ? (
                <div className="text-center py-6">
                  <Crown className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No levels configured yet.</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2 h-7 text-xs"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Create First Level
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2 pr-2">
                    {levels?.map((level) => {
                      const usersInLevel = userCounts?.counts[level.id] || 0;
                      const membership = getMembershipFromUserLevel(level.name);
                      const tierConfig = MEMBERSHIP_LEVELS[membership];
                      
                      return (
                        <div 
                          key={level.id} 
                          className={`p-3 rounded-lg border transition-all hover:shadow-md ${tierConfig.bgColor} ${tierConfig.borderColor}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <div className={`p-2 rounded-lg ${tierConfig.bgColor} border ${tierConfig.borderColor}`}>
                                {getLevelIcon(level.name, 'md')}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-sm font-semibold ${tierConfig.color}`}>
                                    {level.name}
                                  </span>
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                    {usersInLevel} users
                                  </Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                  {level.description || 'No description'}
                                </p>
                                
                                {/* Level Stats */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <Building className="h-3 w-3" />
                                    <span>{level.max_properties} properties</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <ListChecks className="h-3 w-3" />
                                    <span>{level.max_listings} listings</span>
                                  </div>
                                  {level.can_feature_listings && (
                                    <Badge className="text-[9px] px-1 py-0 h-4 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                      <Zap className="h-2.5 w-2.5 mr-0.5" />
                                      Featured
                                    </Badge>
                                  )}
                                  {level.priority_support && (
                                    <Badge className="text-[9px] px-1 py-0 h-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                      <HeadphonesIcon className="h-2.5 w-2.5 mr-0.5" />
                                      Priority
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => setEditingLevel(level)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this level?')) {
                                    deleteLevelMutation.mutate(level.id);
                                  }
                                }}
                                disabled={deleteLevelMutation.isPending || usersInLevel > 0}
                                title={usersInLevel > 0 ? 'Cannot delete: users assigned' : 'Delete level'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Benefits Reference */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Tier Benefits Reference</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(MEMBERSHIP_LEVELS).map(([key, config]) => (
                  <div 
                    key={key}
                    className={`p-2.5 rounded-lg border ${config.bgColor} ${config.borderColor}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{config.icon}</span>
                      <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                    </div>
                    <div className="space-y-1">
                      {config.benefits.slice(0, 3).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Check className="h-2.5 w-2.5 text-green-500" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assign to Users Tab */}
        <TabsContent value="assign" className="space-y-4 mt-4">
          {/* Search and Filter */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={selectedLevelFilter} onValueChange={setSelectedLevelFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-9">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="none">No Level Assigned</SelectItem>
                  {levels?.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchUsers()}
                className="h-9 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Users ({users?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="text-center py-10 text-sm text-muted-foreground">Loading users...</div>
              ) : users?.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No users found.</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">User</TableHead>
                        <TableHead className="text-xs">Email</TableHead>
                        <TableHead className="text-xs">Current Level</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs text-right">Assign Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users?.map((user) => {
                        const currentLevel = getLevelName(user.user_level_id);
                        const membership = getMembershipFromUserLevel(currentLevel);
                        const tierConfig = MEMBERSHIP_LEVELS[membership];
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar_url || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium truncate max-w-[150px]">
                                  {user.full_name || 'No name'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[180px]">{user.email || 'No email'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {user.user_level_id ? (
                                <Badge className={`text-[10px] ${tierConfig.bgColor} ${tierConfig.color} ${tierConfig.borderColor} border`}>
                                  {getLevelIcon(currentLevel, 'sm')}
                                  <span className="ml-1">{currentLevel}</span>
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">
                                  No Level
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {user.verification_status === 'verified' ? (
                                <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  <Shield className="h-2.5 w-2.5 mr-0.5" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">
                                  {user.verification_status || 'Pending'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Select
                                value={user.user_level_id || 'none'}
                                onValueChange={(value) => handleAssignLevel(user.id, value === 'none' ? null : value)}
                                disabled={assignLevelMutation.isPending}
                              >
                                <SelectTrigger className="w-[140px] h-7 text-xs">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Remove Level</SelectItem>
                                  {levels?.map((level) => {
                                    const levelMembership = getMembershipFromUserLevel(level.name);
                                    return (
                                      <SelectItem key={level.id} value={level.id}>
                                        <div className="flex items-center gap-1.5">
                                          {getLevelIcon(level.name, 'sm')}
                                          <span>{level.name}</span>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Level Modal */}
      {editingLevel && (
        <Dialog open={!!editingLevel} onOpenChange={() => setEditingLevel(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-sm flex items-center gap-2">
                {getLevelIcon(editingLevel.name, 'md')}
                Edit {editingLevel.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Level Name</Label>
                <Input
                  value={editingLevel.name}
                  onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="h-8 text-xs mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={editingLevel.description || ''}
                  onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="text-xs min-h-[60px] mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Max Properties</Label>
                  <Input
                    type="number"
                    value={editingLevel.max_properties}
                    onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, max_properties: parseInt(e.target.value) || 0 }) : null)}
                    className="h-8 text-xs mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Listings</Label>
                  <Input
                    type="number"
                    value={editingLevel.max_listings}
                    onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, max_listings: parseInt(e.target.value) || 0 }) : null)}
                    className="h-8 text-xs mt-1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  <Label className="text-xs">Can Feature Listings</Label>
                </div>
                <Switch
                  checked={editingLevel.can_feature_listings}
                  onCheckedChange={(checked) => setEditingLevel(prev => prev ? ({ ...prev, can_feature_listings: checked }) : null)}
                />
              </div>
              <div className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <HeadphonesIcon className="h-3.5 w-3.5 text-green-500" />
                  <Label className="text-xs">Priority Support</Label>
                </div>
                <Switch
                  checked={editingLevel.priority_support}
                  onCheckedChange={(checked) => setEditingLevel(prev => prev ? ({ ...prev, priority_support: checked }) : null)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={() => handleUpdateLevel(editingLevel)}
                  disabled={updateLevelMutation.isPending}
                  size="sm"
                  className="flex-1 h-8 text-xs"
                >
                  {updateLevelMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingLevel(null)}
                  size="sm"
                  className="flex-1 h-8 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserLevelManagement;
