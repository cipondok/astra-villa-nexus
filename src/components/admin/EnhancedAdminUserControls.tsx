import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/contexts/AlertContext";
import { 
  RotateCcw, 
  Mail, 
  Edit, 
  Settings, 
  Shield, 
  Lock, 
  Unlock,
  UserX,
  Key,
  Database,
  Clock
} from "lucide-react";

type UserRole = "general_user" | "property_owner" | "agent" | "vendor" | "admin" | "customer_service";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  verification_status: string;
  created_at: string;
  phone?: string;
  company_name?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
  last_seen_at?: string;
}

interface EnhancedAdminUserControlsProps {
  user: User;
  onUserUpdate?: () => void;
}

const EnhancedAdminUserControls = ({ user, onUserUpdate }: EnhancedAdminUserControlsProps) => {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user.full_name || "",
    phone: user.phone || "",
    company_name: user.company_name || "",
    role: user.role as UserRole,
    verification_status: user.verification_status
  });
  const [suspensionReason, setSuspensionReason] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Reset user account mutation
  const resetAccountMutation = useMutation({
    mutationFn: async () => {
      // Reset verification status and clear suspension
      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: 'pending',
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null
        })
        .eq('id', user.id);
      
      if (error) throw error;
      return user.id;
    },
    onSuccess: () => {
      showSuccess("Account Reset", "User account has been reset successfully.");
      setIsResetDialogOpen(false);
      onUserUpdate?.();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      showError("Reset Failed", error.message);
    },
  });

  // Resend verification email mutation
  const resendVerificationMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      showSuccess("Verification Email Sent", "Verification email has been resent to the user.");
    },
    onError: (error: any) => {
      showError("Send Failed", error.message);
    },
  });

  // Update user data mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: typeof editData) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      showSuccess("User Updated", "User information has been updated successfully.");
      setIsEditDialogOpen(false);
      onUserUpdate?.();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: async ({ reason }: { reason: string }) => {
      const { data: currentUser, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
          suspended_by: currentUser?.user?.id
        })
        .eq('id', user.id);
      
      if (error) throw error;
      return { userId: user.id, reason };
    },
    onSuccess: () => {
      showSuccess("User Suspended", "User has been suspended successfully.");
      setSuspensionReason("");
      onUserUpdate?.();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      showError("Suspension Failed", error.message);
    },
  });

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null
        })
        .eq('id', user.id);
      
      if (error) throw error;
      return user.id;
    },
    onSuccess: () => {
      showSuccess("User Unsuspended", "User suspension has been lifted.");
      onUserUpdate?.();
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      showError("Unsuspend Failed", error.message);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      showSuccess("Password Reset Email Sent", "Password reset email has been sent to the user.");
    },
    onError: (error: any) => {
      showError("Reset Failed", error.message);
    },
  });

  const handleEditSubmit = () => {
    updateUserMutation.mutate(editData);
  };

  const handleSuspend = () => {
    if (!suspensionReason.trim()) {
      showError("Validation Error", "Please provide a suspension reason.");
      return;
    }
    suspendUserMutation.mutate({ reason: suspensionReason });
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Quick Actions */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => resendVerificationMutation.mutate()}
        disabled={resendVerificationMutation.isPending}
        title="Resend verification email"
      >
        <Mail className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant="outline"
        onClick={() => resetPasswordMutation.mutate()}
        disabled={resetPasswordMutation.isPending}
        title="Send password reset email"
      >
        <Key className="h-4 w-4" />
      </Button>

      {/* Suspension Controls */}
      {user.is_suspended ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => unsuspendUserMutation.mutate()}
          disabled={unsuspendUserMutation.isPending}
          title="Unsuspend user"
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          <Unlock className="h-4 w-4" />
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              title="Suspend user"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Lock className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Suspension Reason</Label>
                <Textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Provide a detailed reason for suspension..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSuspend}
                  disabled={suspendUserMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  {suspendUserMutation.isPending ? 'Suspending...' : 'Suspend User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" title="Edit user details">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={editData.full_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Company Name</Label>
              <Input
                value={editData.company_name}
                onChange={(e) => setEditData(prev => ({ ...prev, company_name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <Select value={editData.role} onValueChange={(value: UserRole) => setEditData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_user">General User</SelectItem>
                    <SelectItem value="property_owner">Property Owner</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="customer_service">Customer Service</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Verification Status</Label>
                <Select value={editData.verification_status} onValueChange={(value) => setEditData(prev => ({ ...prev, verification_status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEditSubmit} disabled={updateUserMutation.isPending} className="flex-1">
                {updateUserMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Reset Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" title="Reset account">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will reset the user's verification status to pending and remove any suspensions.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => resetAccountMutation.mutate()}
                disabled={resetAccountMutation.isPending}
                variant="destructive"
                className="flex-1"
              >
                {resetAccountMutation.isPending ? 'Resetting...' : 'Reset Account'}
              </Button>
              <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" title="Advanced settings">
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Advanced User Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* User Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Current Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.is_suspended ? "destructive" : "default"}>
                    {user.is_suspended ? "Suspended" : "Active"}
                  </Badge>
                  <Badge variant={user.verification_status === 'approved' ? "default" : "secondary"}>
                    {user.verification_status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Last Seen</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <Label className="text-sm font-medium">Account Information</Label>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">User ID:</span>
                  <p className="font-mono">{user.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p>{new Date(user.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Suspension Details */}
            {user.is_suspended && user.suspension_reason && (
              <div>
                <Label className="text-sm font-medium">Suspension Details</Label>
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{user.suspension_reason}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedAdminUserControls;