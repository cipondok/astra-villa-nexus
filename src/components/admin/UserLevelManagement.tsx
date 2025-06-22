
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAlert } from "@/contexts/AlertContext";
import { Crown, Edit, Plus, Trash2 } from "lucide-react";

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

  // Fetch user levels
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

  // Create level mutation
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

  // Update level mutation
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

  // Delete level mutation
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Level Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage user levels, privileges, and limitations
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Level
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User Level</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Level Name</Label>
                <Input
                  value={newLevel.name}
                  onChange={(e) => setNewLevel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter level name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newLevel.description}
                  onChange={(e) => setNewLevel(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter level description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Properties</Label>
                  <Input
                    type="number"
                    value={newLevel.max_properties}
                    onChange={(e) => setNewLevel(prev => ({ ...prev, max_properties: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Max Listings</Label>
                  <Input
                    type="number"
                    value={newLevel.max_listings}
                    onChange={(e) => setNewLevel(prev => ({ ...prev, max_listings: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Can Feature Listings</Label>
                <Switch
                  checked={newLevel.can_feature_listings}
                  onCheckedChange={(checked) => setNewLevel(prev => ({ ...prev, can_feature_listings: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Priority Support</Label>
                <Switch
                  checked={newLevel.priority_support}
                  onCheckedChange={(checked) => setNewLevel(prev => ({ ...prev, priority_support: checked }))}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateLevel}
                  disabled={createLevelMutation.isPending}
                  className="flex-1"
                >
                  {createLevelMutation.isPending ? 'Creating...' : 'Create Level'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Levels</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading levels...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Max Properties</TableHead>
                  <TableHead>Max Listings</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {levels?.map((level) => (
                  <TableRow key={level.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{level.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{level.description}</TableCell>
                    <TableCell>{level.max_properties}</TableCell>
                    <TableCell>{level.max_listings}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {level.can_feature_listings && (
                          <Badge variant="secondary">Featured Listings</Badge>
                        )}
                        {level.priority_support && (
                          <Badge variant="outline">Priority Support</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingLevel(level)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteLevelMutation.mutate(level.id)}
                          disabled={deleteLevelMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Level Modal */}
      {editingLevel && (
        <Dialog open={!!editingLevel} onOpenChange={() => setEditingLevel(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Level</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Level Name</Label>
                <Input
                  value={editingLevel.name}
                  onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingLevel.description}
                  onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Properties</Label>
                  <Input
                    type="number"
                    value={editingLevel.max_properties}
                    onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, max_properties: parseInt(e.target.value) }) : null)}
                  />
                </div>
                <div>
                  <Label>Max Listings</Label>
                  <Input
                    type="number"
                    value={editingLevel.max_listings}
                    onChange={(e) => setEditingLevel(prev => prev ? ({ ...prev, max_listings: parseInt(e.target.value) }) : null)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Can Feature Listings</Label>
                <Switch
                  checked={editingLevel.can_feature_listings}
                  onCheckedChange={(checked) => setEditingLevel(prev => prev ? ({ ...prev, can_feature_listings: checked }) : null)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Priority Support</Label>
                <Switch
                  checked={editingLevel.priority_support}
                  onCheckedChange={(checked) => setEditingLevel(prev => prev ? ({ ...prev, priority_support: checked }) : null)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleUpdateLevel(editingLevel)}
                  disabled={updateLevelMutation.isPending}
                  className="flex-1"
                >
                  {updateLevelMutation.isPending ? 'Updating...' : 'Update Level'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingLevel(null)}
                  className="flex-1"
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
