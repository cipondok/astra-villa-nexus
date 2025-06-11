
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Crown, TrendingUp, Users, Settings, Plus, Edit, Award } from "lucide-react";

const AdminMembershipManagement = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch membership levels
  const { data: membershipLevels } = useQuery({
    queryKey: ['membership-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_membership_levels')
        .select('*')
        .order('level_number');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch vendor progress
  const { data: vendorProgress } = useQuery({
    queryKey: ['vendor-progress'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_membership_progress')
        .select(`
          *,
          profiles(full_name, email),
          vendor_business_profiles(business_name),
          vendor_membership_levels!vendor_membership_progress_current_level_id_fkey(level_name, level_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Update membership level mutation
  const updateLevelMutation = useMutation({
    mutationFn: async (levelData: any) => {
      const { error } = await supabase
        .from('vendor_membership_levels')
        .update(levelData)
        .eq('id', editingLevel.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Membership level updated successfully");
      queryClient.invalidateQueries({ queryKey: ['membership-levels'] });
      setIsEditDialogOpen(false);
      setEditingLevel(null);
    },
    onError: () => {
      showError("Error", "Failed to update membership level");
    }
  });

  const getLevelIcon = (levelNumber: number) => {
    const icons = [Crown, Award, TrendingUp, Crown];
    const Icon = icons[levelNumber - 1] || Crown;
    return <Icon className="h-5 w-5" />;
  };

  const getLevelColor = (levelName: string) => {
    const colors: Record<string, string> = {
      Bronze: "text-amber-600",
      Silver: "text-gray-600", 
      Gold: "text-yellow-600",
      Platinum: "text-purple-600"
    };
    return colors[levelName] || "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor Membership Management</h2>
          <p className="text-muted-foreground">Manage membership levels and vendor progression</p>
        </div>
      </div>

      <Tabs defaultValue="levels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="levels">Membership Levels</TabsTrigger>
          <TabsTrigger value="progress">Vendor Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {membershipLevels?.map((level) => (
              <Card key={level.id} className="card-ios relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${getLevelColor(level.level_name)}`}>
                      {getLevelIcon(level.level_number)}
                      <CardTitle className="text-lg">{level.level_name}</CardTitle>
                    </div>
                    <Badge variant="outline">Level {level.level_number}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tasks Required:</span>
                      <span className="font-medium">{level.tasks_required}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time Requirement:</span>
                      <span className="font-medium">{level.time_requirement_days} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min. Bookings:</span>
                      <span className="font-medium">{level.min_completed_bookings}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Min. Rating:</span>
                      <span className="font-medium">{level.min_rating}/5.0</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">BENEFITS</Label>
                    <div className="text-sm">
                      Commission: {level.benefits?.commission}%
                    </div>
                    <div className="text-sm capitalize">
                      Features: {level.benefits?.features}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingLevel(level);
                      setIsEditDialogOpen(true);
                    }}
                    className="w-full"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Level
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4">
            {vendorProgress?.map((progress) => (
              <Card key={progress.id} className="card-ios">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{progress.profiles?.full_name}</CardTitle>
                      <CardDescription>
                        {progress.vendor_business_profiles?.business_name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {progress.vendor_membership_levels?.level_name} 
                        (Level {progress.vendor_membership_levels?.level_number})
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Progress</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${progress.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{progress.progress_percentage}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Completed Tasks</Label>
                      <p className="text-sm text-muted-foreground">{progress.completed_tasks}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Level Started</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(progress.level_started_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <Badge variant={progress.level_achieved_at ? "default" : "secondary"}>
                        {progress.level_achieved_at ? "Achieved" : "In Progress"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vendorProgress?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Active vendor accounts</p>
              </CardContent>
            </Card>
            
            {membershipLevels?.map((level) => (
              <Card key={level.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getLevelIcon(level.level_number)}
                    {level.level_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vendorProgress?.filter(p => 
                      p.vendor_membership_levels?.level_number === level.level_number
                    ).length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Vendors at this level</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Membership Level: {editingLevel?.level_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tasks Required</Label>
                <Input
                  type="number"
                  defaultValue={editingLevel?.tasks_required}
                  onChange={(e) => setEditingLevel({
                    ...editingLevel,
                    tasks_required: parseInt(e.target.value)
                  })}
                />
              </div>
              <div>
                <Label>Time Requirement (days)</Label>
                <Input
                  type="number"
                  defaultValue={editingLevel?.time_requirement_days}
                  onChange={(e) => setEditingLevel({
                    ...editingLevel,
                    time_requirement_days: parseInt(e.target.value)
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min. Completed Bookings</Label>
                <Input
                  type="number"
                  defaultValue={editingLevel?.min_completed_bookings}
                  onChange={(e) => setEditingLevel({
                    ...editingLevel,
                    min_completed_bookings: parseInt(e.target.value)
                  })}
                />
              </div>
              <div>
                <Label>Min. Rating</Label>
                <Input
                  type="number"
                  step="0.1"
                  max="5"
                  defaultValue={editingLevel?.min_rating}
                  onChange={(e) => setEditingLevel({
                    ...editingLevel,
                    min_rating: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>

            <Button 
              onClick={() => updateLevelMutation.mutate(editingLevel)}
              className="w-full"
            >
              Update Level
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMembershipManagement;
