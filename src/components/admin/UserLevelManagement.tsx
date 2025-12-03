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
import { useAlert } from "@/contexts/AlertContext";
import { Crown, Edit, Plus, Trash2, Shield, Star, Gem, Award, Users, Sparkles } from "lucide-react";
import { MEMBERSHIP_LEVELS, getMembershipFromUserLevel } from "@/types/membership";

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

const getLevelIcon = (levelName: string) => {
  const membership = getMembershipFromUserLevel(levelName);
  switch (membership) {
    case 'diamond': return <Gem className="h-3.5 w-3.5 text-sky-500" />;
    case 'platinum': return <Sparkles className="h-3.5 w-3.5 text-cyan-500" />;
    case 'gold': return <Crown className="h-3.5 w-3.5 text-yellow-500" />;
    case 'vip': return <Star className="h-3.5 w-3.5 text-purple-500" />;
    case 'verified': return <Shield className="h-3.5 w-3.5 text-blue-500" />;
    default: return <Users className="h-3.5 w-3.5 text-muted-foreground" />;
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

  const { data: levels, isLoading } = useQuery({
    queryKey: ['user-levels'],
    queryFn: async (): Promise<UserLevel[]> => {
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: userCounts } = useQuery({
    queryKey: ['user-level-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_level_id');
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(p => {
        if (p.user_level_id) {
          counts[p.user_level_id] = (counts[p.user_level_id] || 0) + 1;
        }
      });
      return counts;
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
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
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

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Crown className="h-4 w-4 text-yellow-500" />
            User Levels & Membership
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            Manage membership tiers and privileges
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-7 text-xs gap-1">
              <Plus className="h-3 w-3" />
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
                  placeholder="e.g., Gold, VIP, Diamond"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={newLevel.description}
                  onChange={(e) => setNewLevel(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Level benefits description"
                  className="text-sm min-h-[60px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Max Properties</Label>
                  <Input
                    type="number"
                    value={newLevel.max_properties}
                    onChange={(e) => setNewLevel(prev => ({ ...prev, max_properties: parseInt(e.target.value) || 0 }))}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Listings</Label>
                  <Input
                    type="number"
                    value={newLevel.max_listings}
                    onChange={(e) => setNewLevel(prev => ({ ...prev, max_listings: parseInt(e.target.value) || 0 }))}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <Label className="text-xs">Can Feature Listings</Label>
                <Switch
                  checked={newLevel.can_feature_listings}
                  onCheckedChange={(checked) => setNewLevel(prev => ({ ...prev, can_feature_listings: checked }))}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <Label className="text-xs">Priority Support</Label>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(MEMBERSHIP_LEVELS).slice(0, 4).map(([key, config]) => (
          <Card key={key} className="p-2">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{config.icon}</span>
              <div>
                <p className="text-[10px] text-muted-foreground">{config.shortLabel}</p>
                <p className="text-sm font-semibold">
                  {levels?.filter(l => getMembershipFromUserLevel(l.name) === key).length || 0}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Levels List */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium">Configured Levels</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {isLoading ? (
            <div className="text-center py-4 text-xs text-muted-foreground">Loading levels...</div>
          ) : levels?.length === 0 ? (
            <div className="text-center py-4 text-xs text-muted-foreground">
              No levels configured. Create your first membership level.
            </div>
          ) : (
            <div className="space-y-2">
              {levels?.map((level) => (
                <div 
                  key={level.id} 
                  className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`p-1.5 rounded-md ${getLevelBadgeStyle(level.name)}`}>
                      {getLevelIcon(level.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate">{level.name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                          {userCounts?.[level.id] || 0} users
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {level.max_properties} props • {level.max_listings} listings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {level.can_feature_listings && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 hidden sm:flex">
                        Featured
                      </Badge>
                    )}
                    {level.priority_support && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 hidden sm:flex">
                        Priority
                      </Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => setEditingLevel(level)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => deleteLevelMutation.mutate(level.id)}
                      disabled={deleteLevelMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Membership Tiers Reference */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium">Membership Tiers Reference</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(MEMBERSHIP_LEVELS).map(([key, config]) => (
              <div 
                key={key}
                className={`p-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{config.icon}</span>
                  <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {config.benefits.slice(0, 2).join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Level Modal */}
      {editingLevel && (
        <Dialog open={!!editingLevel} onOpenChange={() => setEditingLevel(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-sm flex items-center gap-2">
                {getLevelIcon(editingLevel.name)}
                Edit {editingLevel.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Level Name</Label>
                <Input
                  value={editingLevel.name}
                  onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={editingLevel.description || ''}
                  onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  className="text-sm min-h-[60px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Max Properties</Label>
                  <Input
                    type="number"
                    value={editingLevel.max_properties}
                    onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, max_properties: parseInt(e.target.value) || 0 }) : null)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Max Listings</Label>
                  <Input
                    type="number"
                    value={editingLevel.max_listings}
                    onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, max_listings: parseInt(e.target.value) || 0 }) : null)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-1">
                <Label className="text-xs">Can Feature Listings</Label>
                <Switch
                  checked={editingLevel.can_feature_listings}
                  onCheckedChange={(checked) => setEditingLevel(prev => prev ? ({ ...prev, can_feature_listings: checked }) : null)}
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <Label className="text-xs">Priority Support</Label>
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
                  {updateLevelMutation.isPending ? 'Updating...' : 'Update Level'}
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