
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

const FeedbackManagement = () => {
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
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-orange-500 text-orange-500">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-yellow-500",
      low: "bg-green-500"
    };
    return <Badge className={colors[priority] || colors.medium}>{priority?.toUpperCase()}</Badge>;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="h-5 w-5" />
            Feedback & Comments Management
          </CardTitle>
          <CardDescription className="text-gray-300">
            Review and respond to user feedback and comments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Filter Controls */}
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white">All Feedback</SelectItem>
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                  <SelectItem value="resolved" className="text-white">Resolved</SelectItem>
                  <SelectItem value="rejected" className="text-white">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Feedback Table */}
            <div className="border border-white/20 rounded-lg bg-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Rating</TableHead>
                    <TableHead className="text-gray-300">Priority</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-300">
                        Loading feedback...
                      </TableCell>
                    </TableRow>
                  ) : feedback?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-300">
                        No feedback found
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedback?.map((item) => (
                      <TableRow key={item.id} className="border-white/20">
                        <TableCell className="text-white">
                          <div className="text-sm">
                            <div>{item.profiles?.full_name || 'Anonymous'}</div>
                            <div className="text-gray-400">{item.profiles?.email || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300 capitalize">
                          {item.feedback_type}
                        </TableCell>
                        <TableCell>
                          {item.rating ? (
                            <div className="flex items-center gap-1">
                              {renderStars(item.rating)}
                              <span className="text-gray-300 text-sm ml-1">({item.rating})</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(item.priority)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(item)}
                            className="border-gray-600 text-gray-300 hover:bg-white/10"
                          >
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
        <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Feedback Details</DialogTitle>
            <DialogDescription className="text-gray-300">
              Review and respond to user feedback
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-300 font-medium">User:</label>
                  <p className="text-white">{selectedFeedback.profiles?.full_name || 'Anonymous'}</p>
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Type:</label>
                  <p className="text-white capitalize">{selectedFeedback.feedback_type}</p>
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Rating:</label>
                  <div className="flex items-center gap-1">
                    {selectedFeedback.rating ? renderStars(selectedFeedback.rating) : <span className="text-gray-400">N/A</span>}
                  </div>
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Priority:</label>
                  {getPriorityBadge(selectedFeedback.priority)}
                </div>
              </div>
              <div>
                <label className="text-gray-300 font-medium">Content:</label>
                <p className="text-white bg-gray-800 p-3 rounded mt-2">{selectedFeedback.content}</p>
              </div>
              <div>
                <label className="text-gray-300 font-medium">Admin Response:</label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your response..."
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStatusUpdate('rejected')}
              disabled={updateFeedbackMutation.isPending}
            >
              Reject
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={updateFeedbackMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Mark In Progress
            </Button>
            <Button 
              onClick={() => handleStatusUpdate('resolved')}
              disabled={updateFeedbackMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FeedbackManagement;
