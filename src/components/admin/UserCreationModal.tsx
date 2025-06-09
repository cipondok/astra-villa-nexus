
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { UserPlus, Eye, EyeOff } from "lucide-react";

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin';

interface UserCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserCreationModal = ({ isOpen, onClose }: UserCreationModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("general_user");
  const [verificationStatus, setVerificationStatus] = useState("approved");
  const [companyName, setCompanyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      fullName: string;
      phone: string;
      role: UserRole;
      verificationStatus: string;
      companyName?: string;
      licenseNumber?: string;
    }) => {
      console.log('Creating new user with admin privileges:', userData);
      
      // Create the user in Supabase Auth with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role,
            verification_status: userData.verificationStatus
          }
        }
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user returned');
      }

      console.log('User created in auth:', authData.user.id);

      // Wait a moment for the trigger to potentially create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if profile was created by trigger, if not create it manually
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!existingProfile) {
        console.log('Profile not created by trigger, creating manually');
        
        // Create the profile manually
        const profileData = {
          id: authData.user.id,
          email: userData.email,
          full_name: userData.fullName,
          phone: userData.phone || null,
          role: userData.role,
          verification_status: userData.verificationStatus,
          company_name: userData.companyName || null,
          license_number: userData.licenseNumber || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw profileError;
        }
      } else {
        console.log('Profile already exists, updating with additional data');
        
        // Update the existing profile with additional data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            phone: userData.phone || null,
            company_name: userData.companyName || null,
            license_number: userData.licenseNumber || null,
            verification_status: userData.verificationStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw updateError;
        }
      }

      console.log('User and profile created/updated successfully');
      return authData.user;
    },
    onSuccess: () => {
      showSuccess("User Created", "New user has been created successfully and should now appear in the user management tables.");
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      handleClose();
    },
    onError: (error: any) => {
      console.error('User creation failed:', error);
      showError("Creation Failed", error.message || "Failed to create user");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName || !role) {
      showError("Validation Error", "Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      showError("Validation Error", "Password must be at least 6 characters long");
      return;
    }

    createUserMutation.mutate({
      email,
      password,
      fullName,
      phone,
      role,
      verificationStatus,
      companyName: companyName || undefined,
      licenseNumber: licenseNumber || undefined
    });
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setRole("general_user");
    setVerificationStatus("approved");
    setCompanyName("");
    setLicenseNumber("");
    setShowPassword(false);
    onClose();
  };

  const getRoleDescription = (role: UserRole) => {
    const descriptions = {
      general_user: "Basic user with property browsing access",
      property_owner: "Can list and manage properties",
      agent: "Real estate agent with client management tools",
      vendor: "Service provider with booking management",
      admin: "Full system administration access"
    };
    return descriptions[role];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-card-foreground">
            <UserPlus className="h-5 w-5" />
            Create New User
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new user account with specified role and verification status
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="bg-background border-border text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="fullName" className="text-foreground">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="bg-background border-border text-foreground pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-foreground">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              className="bg-background border-border text-foreground"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-foreground">User Role *</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="general_user" className="text-popover-foreground">General User</SelectItem>
                <SelectItem value="property_owner" className="text-popover-foreground">Property Owner</SelectItem>
                <SelectItem value="agent" className="text-popover-foreground">Agent</SelectItem>
                <SelectItem value="vendor" className="text-popover-foreground">Vendor</SelectItem>
                <SelectItem value="admin" className="text-popover-foreground">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{getRoleDescription(role)}</p>
          </div>

          <div>
            <Label htmlFor="verificationStatus" className="text-foreground">Verification Status</Label>
            <Select value={verificationStatus} onValueChange={setVerificationStatus}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue placeholder="Select verification status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="approved" className="text-popover-foreground">Approved</SelectItem>
                <SelectItem value="pending" className="text-popover-foreground">Pending</SelectItem>
                <SelectItem value="rejected" className="text-popover-foreground">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(role === 'agent' || role === 'vendor' || role === 'property_owner') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName" className="text-foreground">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company LLC"
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber" className="text-foreground">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="LIC123456"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button 
            type="button"
            variant="outline" 
            onClick={handleClose}
            className="border-border text-foreground"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={createUserMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreationModal;
