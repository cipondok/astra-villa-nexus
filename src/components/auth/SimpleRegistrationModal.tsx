
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
      console.log('Creating user with simplified process:', userData.email);
      
      // Create user with basic auth
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
        throw new Error(`Registration failed: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user data returned');
      }

      console.log('User created successfully:', authData.user.id);

      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile verification error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      if (!profile) {
        console.log('Profile not found, creating manually...');
        
        // Create profile manually if trigger failed
        const { error: manualProfileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.fullName,
            role: userData.role,
            verification_status: 'approved'
          });

        if (manualProfileError) {
          console.error('Manual profile creation error:', manualProfileError);
          throw new Error(`Manual profile creation failed: ${manualProfileError.message}`);
        }
      }

      return authData.user;
    },
    onSuccess: () => {
      showSuccess("Registration Successful", "User has been created and can now login.");
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      handleClose();
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
      showError("Registration Failed", error.message || "Please try again with different details");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !fullName) {
      showError("Missing Information", "Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      showError("Invalid Password", "Password must be at least 6 characters long");
      return;
    }

    createUserMutation.mutate({
      email,
      password,
      fullName,
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
            />
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="role">User Role</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
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
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleRegistrationModal;
