
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Award, Plus, Edit, Users, TrendingUp, Star } from "lucide-react";

interface MembershipLevel {
  id: string;
  level_name: string;
  level_number: number;
  requirements: any;
  benefits: any;
  tasks_required: number;
  time_requirement_days: number;
  min_rating: number;
  min_completed_bookings: number;
  is_active: boolean;
}

const AdminMembershipManagement = () => {
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<MembershipLevel | null>(null);
  const [formData, setFormData] = useState({
    level_name: '',
    level_number: 1,
    tasks_required: 0,
    time_requirement_days: 30,
    min_rating: 0,
    min_completed_bookings: 0,
    requirements: '',
    benefits: ''
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: membershipLevels, isLoading: levelsLoading } = useQuery({
    queryKey: ['membership-levels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_membership_levels')
        .select('*')
        .order('level_number', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: membershipProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['membership-progress'],
    queryFn: async () => {
      // Get membership progress
      const { data: progressData, error: progressError } = await supabase
        .from('vendor_membership_progress')
        .select('*');
      
      if (progressError) throw progressError;

      // Get vendor profiles separately
      const vendorIds = progressData?.map(p => p.vendor_id).filter(Boolean) || [];
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', vendorIds);
      
      if (profileError) throw profileError;

      // Get business profiles separately  
      const { data: businessProfiles, error: businessError } = await supabase
        .from('vendor_business_profiles')
        .select('vendor_id, business_name')
        .in('vendor_id', vendorIds);
      
      if (businessError) throw businessError;

      // Get level names
      const levelIds = [...new Set([
        ...progressData?.map(p => p.current_level_id).filter(Boolean) || [],
        ...progressData?.map(p => p.next_level_id).filter(Boolean) || []
      ])];
      
      const { data: levels, error: levelError } = await supabase
        .from('vendor_membership_levels')
        .select('id, level_name')
        .in('id', levelIds);
      
      if (levelError) throw levelError;

      // Combine the data
      const combinedData = progressData?.map(progress => {
        const profile = profiles?.find(p => p.id === progress.vendor_id);
        const businessProfile = businessProfiles?.find(bp => bp.vendor_id === progress.vendor_id);
        const currentLevel = levels?.find(l => l.id === progress.current_level_id);
        const nextLevel = levels?.find(l => l.id === progress.next_level_id);
        
        return {
          ...progress,
          vendor_profile: profile,
          business_profile: businessProfile,
          current_level: currentLevel,
          next_level: nextLevel
        };
      });

      return combinedData;
    },
  });

  const createLevelMutation = useMutation({
    mutationFn: async (levelData: any) => {
      const { error } = await supabase
        .from('vendor_membership_levels')
        .insert([{
          ...levelData,
          requirements: JSON.parse(levelData.requirements || '{}'),
          benefits: JSON.parse(levelData.benefits || '{}')
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Membership level created successfully");
      queryClient.invalidateQueries({ queryKey: ['membership-levels'] });
      setShowLevelForm(false);
      resetForm();
    },
    onError: (error) => {
      console.error('Level creation error:', error);
      showError("Error", "Failed to create membership level");
    },
  });

  const updateLevelMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('vendor_membership_levels')
        .update({
          ...updates,
          requirements: JSON.parse(updates.requirements || '{}'),
          benefits: JSON.parse(updates.benefits || '{}')
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Membership level updated successfully");
      queryClient.invalidateQueries({ queryKey: ['membership-levels'] });
      setShowLevelForm(false);
      setEditingLevel(null);
      resetForm();
    },
    onError: (error) => {
      console.error('Level update error:', error);
      showError("Error", "Failed to update membership level");
    },
  });

  const resetForm = () => {
    setFormData({
      level_name: '',
      level_number: 1,
      tasks_required: 0,
      time_requirement_days: 30,
      min_rating: 0,
      min_completed_bookings: 0,
      requirements: '',
      benefits: ''
    });
  };

  const handleSubmit = () => {
    if (editingLevel) {
      updateLevelMutation.mutate({ id: editingLevel.id, updates: formData });
    } else {
      createLevelMutation.mutate(formData);
    }
  };

  const handleEdit = (level: MembershipLevel) => {
    setEditingLevel(level);
    setFormData({
      level_name: level.level_name,
      level_number: level.level_number,
      tasks_required: level.tasks_required,
      time_requirement_days: level.time_requirement_days,
      min_rating: level.min_rating,
      min_completed_bookings: level.min_completed_bookings,
      requirements: JSON.stringify(level.requirements || {}, null, 2),
      benefits: JSON.stringify(level.benefits || {}, null, 2)
    });
    setShowLevelForm(true);
  };

  const getBenefitsDisplay = (benefits: any) => {
    if (!benefits || typeof benefits === 'string') return 'No benefits defined';
    
    const benefitsObj = typeof benefits === 'object' ? benefits : {};
    const commission = benefitsObj.commission || 'N/A';
    const features = benefitsObj.features || 'N/A';
    
    return `Commission: ${commission}%, Features: ${features}`;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="levels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="levels">Membership Levels</TabsTrigger>
          <TabsTrigger value="progress">Vendor Progress</TabsTrigger>
        </TabsList>

        {/* Membership Levels Tab */}
        <TabsContent value="levels">
          <Card className="card-ios">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Membership Levels
                  </CardTitle>
                  <CardDescription>
                    Configure vendor membership levels and requirements
                  </CardDescription>
                </div>
                <Dialog open={showLevelForm} onOpenChange={setShowLevelForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetForm(); setEditingLevel(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Level
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingLevel ? 'Edit Membership Level' : 'Create New Membership Level'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure the requirements and benefits for this membership level
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="level_name">Level Name</Label>
                          <Input
                            id="level_name"
                            value={formData.level_name}
                            onChange={(e) => setFormData({ ...formData, level_name: e.target.value })}
                            placeholder="e.g., Bronze, Silver, Gold"
                          />
                        </div>
                        <div>
                          <Label htmlFor="level_number">Level Number</Label>
                          <Input
                            id="level_number"
                            type="number"
                            value={formData.level_number}
                            onChange={(e) => setFormData({ ...formData, level_number: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="tasks_required">Tasks Required</Label>
                          <Input
                            id="tasks_required"
                            type="number"
                            value={formData.tasks_required}
                            onChange={(e) => setFormData({ ...formData, tasks_required: parseInt(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="time_requirement_days">Time Requirement (Days)</Label>
                          <Input
                            id="time_requirement_days"
                            type="number"
                            value={formData.time_requirement_days}
                            onChange={(e) => setFormData({ ...formData, time_requirement_days: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min_rating">Minimum Rating</Label>
                          <Input
                            id="min_rating"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={formData.min_rating}
                            onChange={(e) => setFormData({ ...formData, min_rating: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="min_completed_bookings">Min Completed Bookings</Label>
                          <Input
                            id="min_completed_bookings"
                            type="number"
                            value={formData.min_completed_bookings}
                            onChange={(e) => setFormData({ ...formData, min_completed_bookings: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="requirements">Requirements (JSON)</Label>
                        <Textarea
                          id="requirements"
                          value={formData.requirements}
                          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                          placeholder='{"verification": "full", "documents": "required"}'
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="benefits">Benefits (JSON)</Label>
                        <Textarea
                          id="benefits"
                          value={formData.benefits}
                          onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                          placeholder='{"commission": 10, "features": "premium"}'
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowLevelForm(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        disabled={createLevelMutation.isPending || updateLevelMutation.isPending}
                      >
                        {editingLevel ? 'Update' : 'Create'} Level
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Requirements</TableHead>
                      <TableHead>Benefits</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levelsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading membership levels...
                        </TableCell>
                      </TableRow>
                    ) : membershipLevels?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No membership levels found
                        </TableCell>
                      </TableRow>
                    ) : (
                      membershipLevels?.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{level.level_name}</div>
                              <div className="text-sm text-muted-foreground">
                                Level {level.level_number}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div>Tasks: {level.tasks_required}</div>
                              <div>Days: {level.time_requirement_days}</div>
                              <div>Rating: {level.min_rating}+</div>
                              <div>Bookings: {level.min_completed_bookings}+</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {getBenefitsDisplay(level.benefits)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={level.is_active ? "default" : "secondary"}>
                              {level.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(level)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Progress Tab */}
        <TabsContent value="progress">
          <Card className="card-ios">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Vendor Membership Progress
              </CardTitle>
              <CardDescription>
                Track vendor progress through membership levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Current Level</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Next Level</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progressLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading progress data...
                        </TableCell>
                      </TableRow>
                    ) : membershipProgress?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No progress data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      membershipProgress?.map((progress) => (
                        <TableRow key={progress.id}>
                          <TableCell>
                            <div className="font-medium">
                              {progress.vendor_profile?.full_name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {progress.business_profile?.business_name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {progress.current_level?.level_name || 'None'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${progress.progress_percentage || 0}%` }}
                                />
                              </div>
                              <span className="text-sm">{progress.progress_percentage || 0}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {progress.next_level?.level_name || 'Max Level'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(progress.level_started_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMembershipManagement;
