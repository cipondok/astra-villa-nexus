import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Star, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import MajorTopicsDashboard from "./MajorTopicsDashboard";
import FeedbackAnalytics from "../feedback/FeedbackAnalytics";
import FeedbackFlowDemo from "../feedback/FeedbackFlowDemo";

const FeedbackManagement = () => {
  const { profile } = useAuth();
  const { data: userRoles = [], isLoading: rolesLoading } = useUserRoles();
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [response, setResponse] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback-monitoring', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('feedback_monitoring')
        .select(`
          *,
          profiles!feedback_monitoring_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ id, status, response }: { id: string; status: string; response?: string }) => {
      const updateData: any = { status };
      if (response) {
        updateData.admin_response = response;
      }
      
      const { error } = await supabase
        .from('feedback_monitoring')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Feedback Updated", "Feedback status has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['feedback-monitoring'] });
      setShowDetailDialog(false);
      setSelectedFeedback(null);
      setResponse("");
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleViewDetails = (item: any) => {
    setSelectedFeedback(item);
    setResponse(item.admin_response || "");
    setShowDetailDialog(true);
  };

  const handleStatusUpdate = (status: string) => {
    if (selectedFeedback) {
      updateFeedbackMutation.mutate({ 
        id: selectedFeedback.id, 
        status, 
        response: response.trim() || undefined 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/30"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'in_progress':
        return <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/30"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-chart-4/50 text-chart-4">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-destructive/10 text-destructive border-destructive/30",
      medium: "bg-chart-3/10 text-chart-3 border-chart-3/30",
      low: "bg-chart-1/10 text-chart-1 border-chart-1/30"
    };
    return <Badge variant="outline" className={colors[priority] || colors.medium}>{priority?.toUpperCase()}</Badge>;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground'}`}
      />
    ));
  };

  const hasAccess = userRoles.some(role => ['admin', 'agent', 'customer_service'].includes(role));
  
  if (rolesLoading) {
    return <div className="p-4">Loading...</div>;
  }
  
  if (!profile || !hasAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">You do not have permission to view this page. Please contact an administrator.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <FeedbackFlowDemo />
      
      <FeedbackAnalytics />
      
      <MajorTopicsDashboard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback & Comments Management
          </CardTitle>
          <CardDescription>
            Review and respond to user feedback and comments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Feedback</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border border-border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Loading feedback...
                      </TableCell>
                    </TableRow>
                  ) : feedback?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No feedback found
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedback?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{item.profiles?.full_name || 'Anonymous'}</div>
                            <div className="text-muted-foreground">{item.profiles?.email || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground">
                          {item.feedback_type}
                        </TableCell>
                        <TableCell>
                          {item.rating ? (
                            <div className="flex items-center gap-1">
                              {renderStars(item.rating)}
                              <span className="text-muted-foreground text-sm ml-1">({item.rating})</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{getPriorityBadge(item.priority)}</TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(item)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>Review and respond to user feedback</DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground font-medium">User:</label>
                  <p className="font-medium">{selectedFeedback.profiles?.full_name || 'Anonymous'}</p>
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Type:</label>
                  <p className="capitalize font-medium">{selectedFeedback.feedback_type}</p>
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Rating:</label>
                  <div className="flex items-center gap-1">
                    {selectedFeedback.rating ? renderStars(selectedFeedback.rating) : <span className="text-muted-foreground">N/A</span>}
                  </div>
                </div>
                <div>
                  <label className="text-muted-foreground font-medium">Priority:</label>
                  {getPriorityBadge(selectedFeedback.priority)}
                </div>
              </div>
              <div>
                <label className="text-muted-foreground font-medium">Content:</label>
                <p className="bg-muted/50 p-3 rounded mt-2 text-sm">{selectedFeedback.content}</p>
              </div>
              <div>
                <label className="text-muted-foreground font-medium">Admin Response:</label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your response..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleStatusUpdate('rejected')} disabled={updateFeedbackMutation.isPending}>
              Reject
            </Button>
            <Button variant="secondary" onClick={() => handleStatusUpdate('in_progress')} disabled={updateFeedbackMutation.isPending}>
              Mark In Progress
            </Button>
            <Button onClick={() => handleStatusUpdate('resolved')} disabled={updateFeedbackMutation.isPending}>
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackManagement;
