
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { UserPlus, Eye, EyeOff, Loader2 } from "lucide-react";

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin';

interface SimpleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleRegistrationModal = ({ isOpen, onClose }: SimpleRegistrationModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("general_user");
  const [showPassword, setShowPassword] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      fullName: string;
      role: UserRole;
    }) => {
      console.log('Creating user with enhanced process:', userData.email);
      
      // Validate input data
      if (!userData.email || !userData.password || !userData.fullName) {
        throw new Error('All fields are required');
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
        // Create user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              full_name: userData.fullName,
              role: userData.role
            }
          }
        });

        if (authError) {
          console.error('Auth error:', authError);
          
          // Handle specific error cases
          if (authError.message.includes('already registered')) {
            throw new Error('A user with this email already exists');
          } else if (authError.message.includes('email rate limit')) {
            throw new Error('Too many signup attempts. Please wait a few minutes before trying again');
          } else if (authError.message.includes('Password should be')) {
            throw new Error('Password does not meet security requirements');
          } else {
            throw new Error(`Registration failed: ${authError.message}`);
          }
        }

        if (!authData.user) {
          throw new Error('User creation failed - no user data returned');
        }

        console.log('User created successfully:', authData.user.id);

        // Wait for the database trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verify profile creation with retries
        let retries = 3;
        let profile = null;
        
        while (retries > 0 && !profile) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile verification error:', profileError);
            retries--;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
          } else if (profileData) {
            profile = profileData;
            break;
          }
          
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // If profile still doesn't exist, create it manually
        if (!profile) {
          console.log('Profile not found after retries, creating manually...');
          
          const { error: manualProfileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: userData.email,
              full_name: userData.fullName,
              role: userData.role,
              verification_status: 'approved',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (manualProfileError) {
            console.error('Manual profile creation error:', manualProfileError);
            throw new Error(`Profile creation failed: ${manualProfileError.message}`);
          }
          
          console.log('Profile created manually');
        } else {
          console.log('Profile found:', profile.id);
        }

        return authData.user;
      } catch (error: any) {
        console.error('User creation process failed:', error);
        throw error;
      }
    },
    onSuccess: (user) => {
      console.log('User creation completed successfully:', user.id);
      showSuccess("User Created Successfully", "The new user has been created and can now login to the system.");
      
      // Invalidate and refetch all user-related queries
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      handleClose();
    },
    onError: (error: any) => {
      console.error('User creation failed:', error);
      showError("Registration Failed", error.message || "Failed to create user. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      showError("Validation Error", "Please fill in all required fields");
      return;
    }

    createUserMutation.mutate({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      role
    });
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setRole("general_user");
    setShowPassword(false);
    onClose();
  };

  const isLoading = createUserMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Quick User Registration
          </DialogTitle>
          <DialogDescription>
            Create a new user account with simplified process
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                disabled={isLoading}
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="role">User Role</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)} disabled={isLoading}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general_user">General User</SelectItem>
                <SelectItem value="property_owner">Property Owner</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
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

export default SimpleRegistrationModal;
