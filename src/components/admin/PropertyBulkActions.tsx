
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface PropertyBulkActionsProps {
  selectedProperties: string[];
  onClearSelection: () => void;
  totalProperties: number;
}

const PropertyBulkActions = ({ selectedProperties, onClearSelection, totalProperties }: PropertyBulkActionsProps) => {
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkApprovalStatus, setBulkApprovalStatus] = useState<string>("");
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ updates }: { updates: any }) => {
      console.log('Bulk updating properties:', selectedProperties, updates);
      const { error } = await supabase
        .from('properties')
        .update(updates)
        .in('id', selectedProperties);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Bulk Update Successful", `Updated ${selectedProperties.length} properties successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['simple-properties'] });
      onClearSelection();
      setBulkStatus("");
      setBulkApprovalStatus("");
    },
    onError: (error: any) => {
      showError("Bulk Update Failed", error.message);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      console.log('Bulk deleting properties:', selectedProperties);
      const { error } = await supabase
        .from('properties')
        .delete()
        .in('id', selectedProperties);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Bulk Delete Successful", `Deleted ${selectedProperties.length} properties successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['simple-properties'] });
      onClearSelection();
    },
    onError: (error: any) => {
      showError("Bulk Delete Failed", error.message);
    },
  });

  const handleBulkStatusUpdate = () => {
    if (!bulkStatus) return;
    bulkUpdateMutation.mutate({ updates: { status: bulkStatus } });
  };

  const handleBulkApprovalUpdate = () => {
    if (!bulkApprovalStatus) return;
    bulkUpdateMutation.mutate({ updates: { approval_status: bulkApprovalStatus } });
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProperties.length} selected properties? This action cannot be undone.`)) {
      bulkDeleteMutation.mutate();
    }
  };

  if (selectedProperties.length === 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {selectedProperties.length} of {totalProperties} selected
          </Badge>
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Select value={bulkStatus} onValueChange={setBulkStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspending">Suspending</SelectItem>
                <SelectItem value="hold">Hold</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus || bulkUpdateMutation.isPending}
            >
              <Edit className="h-4 w-4 mr-1" />
              Apply Status
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Select value={bulkApprovalStatus} onValueChange={setBulkApprovalStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Update Approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={handleBulkApprovalUpdate}
              disabled={!bulkApprovalStatus || bulkUpdateMutation.isPending}
            >
              <Edit className="h-4 w-4 mr-1" />
              Apply Approval
            </Button>
          </div>

          <Button 
            size="sm" 
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Selected
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyBulkActions;
