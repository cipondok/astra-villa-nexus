import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Pause,
  Calendar,
  Target
} from "lucide-react";

interface ProjectProgress {
  id: string;
  booking_id: string;
  progress_percentage: number;
  current_stage: string;
  status: string;
  milestones: any; // Changed from any[] to any to match Json type
  next_action: string;
  estimated_completion: string;
  notes: string;
  created_at: string;
  updated_at: string;
  vendor_bookings: {
    id: string;
    service_id: string;
    booking_date: string;
    vendor_services: {
      service_name: string;
    };
  };
  customer_profile: {
    full_name: string;
    email: string;
  };
}

const VendorProgressTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<ProjectProgress | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    progress_percentage: 0,
    current_stage: '',
    status: '',
    next_action: '',
    estimated_completion: '',
    notes: ''
  });

  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ['vendor-project-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching project progress...');
      const { data, error } = await supabase
        .from('vendor_project_progress')
        .select(`
          *,
          vendor_bookings!inner (
            id,
            service_id,
            booking_date,
            vendor_services (
              service_name
            )
          ),
          customer_profile:profiles!customer_id (
            full_name,
            email
          )
        `)
        .eq('vendor_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching project progress:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ projectId, updates }: { projectId: string; updates: any }) => {
      const { error } = await supabase
        .from('vendor_project_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Project progress updated successfully"
      });
      setIsUpdateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['vendor-project-progress'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress",
        variant: "destructive"
      });
    }
  });

  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      not_started: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      on_hold: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800"
    };

    const icons = {
      not_started: <Clock className="h-3 w-3" />,
      in_progress: <Play className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />,
      on_hold: <Pause className="h-3 w-3" />,
      cancelled: <AlertCircle className="h-3 w-3" />
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        <div className="flex items-center gap-1">
          {icons[status as keyof typeof icons]}
          {status.replace('_', ' ').toUpperCase()}
        </div>
      </Badge>
    );
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const handleUpdateProgress = (project: ProjectProgress) => {
    setSelectedProject(project);
    setUpdateData({
      progress_percentage: project.progress_percentage,
      current_stage: project.current_stage || '',
      status: project.status,
      next_action: project.next_action || '',
      estimated_completion: project.estimated_completion || '',
      notes: project.notes || ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = () => {
    if (!selectedProject) return;

    updateProgressMutation.mutate({
      projectId: selectedProject.id,
      updates: updateData
    });
  };

  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const inProgressProjects = projects.filter(p => p.status === 'in_progress').length;
  const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;
  const averageProgress = projects.length > 0 
    ? projects.reduce((sum, p) => sum + p.progress_percentage, 0) / projects.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressProjects}</p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600">{averageProgress.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Project Progress Tracking
              </CardTitle>
              <CardDescription>
                Monitor and update project progress and milestones
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading project progress...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No projects found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Current Stage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Completion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {project.vendor_bookings?.vendor_services?.service_name || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Booking Date: {new Date(project.vendor_bookings?.booking_date || '').toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.customer_profile?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{project.customer_profile?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{project.progress_percentage}%</span>
                        </div>
                        <Progress 
                          value={project.progress_percentage} 
                          className="w-full h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{project.current_stage || 'Not set'}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>
                      {project.estimated_completion 
                        ? new Date(project.estimated_completion).toLocaleDateString()
                        : 'Not set'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateProgress(project)}
                      >
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Update Progress Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Project Progress</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Progress Percentage</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={updateData.progress_percentage}
                onChange={(e) => setUpdateData({ 
                  ...updateData, 
                  progress_percentage: parseInt(e.target.value) || 0 
                })}
              />
            </div>
            
            <div>
              <Label>Current Stage</Label>
              <Input
                value={updateData.current_stage}
                onChange={(e) => setUpdateData({ ...updateData, current_stage: e.target.value })}
                placeholder="e.g., Design phase, Construction, Testing"
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select 
                value={updateData.status} 
                onValueChange={(value) => setUpdateData({ ...updateData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Next Action</Label>
              <Input
                value={updateData.next_action}
                onChange={(e) => setUpdateData({ ...updateData, next_action: e.target.value })}
                placeholder="What's the next step?"
              />
            </div>
            
            <div>
              <Label>Estimated Completion</Label>
              <Input
                type="date"
                value={updateData.estimated_completion}
                onChange={(e) => setUpdateData({ ...updateData, estimated_completion: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Notes</Label>
              <Textarea
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                placeholder="Progress notes and updates..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveUpdate} disabled={updateProgressMutation.isPending}>
                {updateProgressMutation.isPending ? "Updating..." : "Update Progress"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorProgressTracking;
