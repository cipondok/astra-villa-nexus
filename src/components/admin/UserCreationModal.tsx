import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { UserPlus, Eye, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin' | 'customer_service';

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
  const [isRateLimited, setIsRateLimited] = useState(false);

  const { showSuccess, showError, showWarning } = useAlert();
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
      // Comprehensive validation
      if (!userData.email || !userData.password || !userData.fullName) {
        throw new Error('Email, password, and full name are required');
      }

      if (userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Please enter a valid email address');
      }

      try {
        // Create the user in Supabase Auth with metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              full_name: userData.fullName,
              role: userData.role,
              verification_status: userData.verificationStatus,
              phone: userData.phone || null,
              company_name: userData.companyName || null,
              license_number: userData.licenseNumber || null
            }
          }
        });

        if (authError) {
          console.error('Auth creation error:', authError);
          
          // Handle specific error cases
          if (authError.message.includes('already registered')) {
            throw new Error('A user with this email already exists. Try with a different email.');
          } else if (authError.message.includes('email rate limit') || authError.code === 'over_email_send_rate_limit') {
            setIsRateLimited(true);
            throw new Error('RATE_LIMITED');
          } else {
            throw new Error(`Registration failed: ${authError.message}`);
          }
        }

        if (!authData.user) {
          throw new Error('User creation failed - no user returned');
        }

        return authData.user;
      } catch (error: any) {
        console.error('User creation process failed:', error);
        throw error;
      }
    },
    onSuccess: (user) => {
      showSuccess("User Created Successfully", "New user has been created and is ready to use the system.");
      
      // Refresh all related queries
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      handleClose();
    },
    onError: (error: any) => {
      console.error('User creation failed:', error);
      
      if (error.message === 'RATE_LIMITED') {
        showWarning(
          "Rate Limited", 
          "Too many signup attempts detected. Please wait 5-10 minutes before trying again, or use a different email address."
        );
      } else {
        showError("Creation Failed", error.message || "Failed to create user. Please try again with different details.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      showError("Validation Error", "Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      showError("Validation Error", "Password must be at least 6 characters long");
      return;
    }

    // Reset rate limit flag on new attempt
    setIsRateLimited(false);

    createUserMutation.mutate({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      phone: phone.trim(),
      role,
      verificationStatus,
      companyName: companyName.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined
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
    setIsRateLimited(false);
    onClose();
  };

  const getRoleDescription = (role: UserRole) => {
    const descriptions = {
      general_user: "Basic user with property browsing access",
      property_owner: "Can list and manage properties",
      agent: "Real estate agent with client management tools",
      vendor: "Service provider with booking management",
      admin: "Full system administration access",
      customer_service: "Can manage feedback and support tickets"
    };
    return descriptions[role];
  };

  const isLoading = createUserMutation.isPending;

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

        {isRateLimited && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Email rate limit reached. Solutions:
              <br />• Wait 5-10 minutes before trying again
              <br />• Use a different email address
              <br />• Disable email confirmation in Supabase Auth settings
            </AlertDescription>
          </Alert>
        )}
        
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
                disabled={isLoading}
                className="bg-background border-border text-foreground mt-1"
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
                disabled={isLoading}
                className="bg-background border-border text-foreground mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-foreground">Password *</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                disabled={isLoading}
                className="bg-background border-border text-foreground pr-10"
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
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
              disabled={isLoading}
              className="bg-background border-border text-foreground mt-1"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-foreground">User Role *</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)} disabled={isLoading}>
              <SelectTrigger className="bg-background border-border text-foreground mt-1">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="general_user" className="text-popover-foreground">General User</SelectItem>
                <SelectItem value="property_owner" className="text-popover-foreground">Property Owner</SelectItem>
                <SelectItem value="agent" className="text-popover-foreground">Agent</SelectItem>
                <SelectItem value="vendor" className="text-popover-foreground">Vendor</SelectItem>
                <SelectItem value="admin" className="text-popover-foreground">Admin</SelectItem>
                <SelectItem value="customer_service" className="text-popover-foreground">Customer Service</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">{getRoleDescription(role)}</p>
          </div>

          <div>
            <Label htmlFor="verificationStatus" className="text-foreground">Verification Status</Label>
            <Select value={verificationStatus} onValueChange={setVerificationStatus} disabled={isLoading}>
              <SelectTrigger className="bg-background border-border text-foreground mt-1">
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
                  disabled={isLoading}
                  className="bg-background border-border text-foreground mt-1"
                />
              </div>
              <div>
                <Label htmlFor="licenseNumber" className="text-foreground">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="LIC123456"
                  disabled={isLoading}
                  className="bg-background border-border text-foreground mt-1"
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
            disabled={isLoading}
            className="border-border text-foreground"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || isRateLimited}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreationModal;
