import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  RefreshCw, 
  Shield, 
  ShieldAlert 
} from "lucide-react";

interface NewUserForm {
  email: string;
  full_name: string;
  role: 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin';
  phone: string;
  password: string;
}

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState<NewUserForm>({
    email: '',
    full_name: '',
    role: 'general_user',
    phone: '',
    password: ''
  });
  
  const { showSuccess, showError } = useAlert();
  const { user: currentUser, signIn } = useAuth();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('Fetching users for admin panel');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      
      console.log('Fetched users:', data?.length || 0);
      return data || [];
    },
    retry: 2,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Enhanced admin login function
  const adminDirectLogin = useMutation({
    mutationFn: async () => {
      console.log('Attempting direct admin login');
      
      try {
        // First, try to sign in directly
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'mycode103@gmail.com',
          password: 'master2179A'
        });
        
        if (!signInError && signInData.user) {
          console.log('Direct login successful');
          return { success: true, message: 'Admin login successful!' };
        }
        
        // If login fails, try to create/setup the user
        console.log('Direct login failed, attempting user setup');
        
        // Try to create the auth user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'mycode103@gmail.com',
          password: 'master2179A',
          options: {
            data: {
              full_name: 'Super Admin'
            }
          }
        });
        
        let adminUserId: string;
        
        if (signUpError) {
          if (signUpError.message.includes('email rate limit exceeded')) {
            // Rate limit hit, try to find existing user
            console.log('Rate limit exceeded, checking for existing user');
            
            // Try to get user by checking profiles table
            const { data: existingProfile, error: profileError } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', 'mycode103@gmail.com')
              .single();
            
            if (!profileError && existingProfile) {
              adminUserId = existingProfile.id;
              console.log('Found existing admin profile with ID:', adminUserId);
            } else {
              throw new Error('Admin user not found and cannot create due to rate limit. Please wait a few minutes and try again.');
            }
          } else if (!signUpError.message.includes('already registered')) {
            throw new Error(`Failed to create admin user: ${signUpError.message}`);
          } else {
            // User already exists, try to sign in again
            const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
              email: 'mycode103@gmail.com',
              password: 'master2179A'
            });
            
            if (retryError) {
              throw new Error('Admin user exists but password is incorrect');
            }
            
            if (retrySignIn.user) {
              adminUserId = retrySignIn.user.id;
              console.log('Retry login successful with ID:', adminUserId);
            } else {
              throw new Error('Login failed after user creation');
            }
          }
        } else if (signUpData.user) {
          adminUserId = signUpData.user.id;
          console.log('New admin user created with ID:', adminUserId);
        } else {
          throw new Error('User creation failed - no user data returned');
        }
        
        // Ensure profile exists and is set to admin
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: adminUserId,
            email: 'mycode103@gmail.com',
            full_name: 'Super Admin',
            role: 'admin',
            verification_status: 'approved'
          }, {
            onConflict: 'id'
          });
          
        if (profileError) {
          console.error('Failed to create/update profile:', profileError);
          throw new Error(`Failed to setup admin profile: ${profileError.message}`);
        }
        
        // Now try to sign in
        const { error: finalSignInError } = await supabase.auth.signInWithPassword({
          email: 'mycode103@gmail.com',
          password: 'master2179A'
        });
        
        if (finalSignInError) {
          console.warn('Profile setup complete but auto-login failed:', finalSignInError);
          return { 
            success: true, 
            message: 'Admin setup complete! Please try logging in manually with:\nEmail: mycode103@gmail.com\nPassword: master2179A' 
          };
        }
        
        console.log('Admin setup and login completed successfully');
        return { success: true, message: 'Admin setup and login successful!' };
        
      } catch (error) {
        console.error('Admin setup error:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      showSuccess("Admin Setup Complete", result.message);
      refetch();
    },
    onError: (error: any) => {
      console.error('Admin setup error:', error);
      showError("Setup Failed", error.message || 'Failed to setup admin user');
    },
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (userData: NewUserForm) => {
      console.log('Creating new user:', userData.email, userData.role);
      
      if (!userData.password || userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!userData.email || !userData.full_name) {
        throw new Error('Email and full name are required');
      }
      
      // Create the user using Supabase auth signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      });
      
      if (authError) {
        console.error('Error creating auth user:', authError);
        throw new Error(`Failed to create user: ${authError.message}`);
      }
      
      if (!authData.user) {
        throw new Error('User creation failed - no user data returned');
      }
      
      // Update the profile with the correct role and additional info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: userData.role,
          phone: userData.phone,
          verification_status: 'approved'
        })
        .eq('id', authData.user.id);
      
      if (profileError) {
        console.error('Error updating profile:', profileError);
        // Don't throw here as user is created, just log the error
        console.warn('Profile update failed but user was created');
      }
      
      console.log('User created successfully:', authData.user.id, userData.role);
      return authData.user;
    },
    onSuccess: () => {
      showSuccess("User Created", "New user has been created successfully.");
      setIsAddUserOpen(false);
      setNewUser({ email: '', full_name: '', role: 'general_user', phone: '', password: '' });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetch();
    },
    onError: (error: any) => {
      console.error('Add user error:', error);
      showError("Creation Failed", error.message || 'Failed to create user');
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Deleting user:', userId);
      
      // First delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) {
        console.error('Error deleting profile:', profileError);
        throw new Error(`Failed to delete user profile: ${profileError.message}`);
      }
      
      console.log('User deleted successfully');
    },
    onSuccess: () => {
      showSuccess("User Deleted", "User has been deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetch();
    },
    onError: (error: any) => {
      console.error('Delete user error:', error);
      showError("Deletion Failed", error.message || 'Failed to delete user');
    },
  });

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const getRoleBadge = (role: string) => {
    const roleColors: { [key: string]: "destructive" | "default" | "secondary" | "outline" } = {
      admin: "destructive",
      agent: "default",
      vendor: "secondary", 
      property_owner: "outline",
      general_user: "outline"
    };
    
    return (
      <Badge variant={roleColors[role] || "outline"}>
        {role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
        {role === 'agent' && <ShieldAlert className="h-3 w-3 mr-1" />}
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const canDeleteUser = (userId: string, userRole: string) => {
    // Prevent admin from deleting themselves
    if (userId === currentUser?.id) {
      return false;
    }
    return true;
  };

  const handleAddUser = () => {
    if (!newUser.email || !newUser.full_name || !newUser.password) {
      showError("Invalid Input", "Please fill in all required fields including password.");
      return;
    }
    
    if (newUser.password.length < 6) {
      showError("Invalid Password", "Password must be at least 6 characters long.");
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      showError("Invalid Email", "Please enter a valid email address.");
      return;
    }
    
    addUserMutation.mutate(newUser);
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage system users and their roles. Total users: {filteredUsers.length}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => adminDirectLogin.mutate()} variant="outline" disabled={adminDirectLogin.isPending}>
                <Shield className="h-4 w-4 mr-2" />
                {adminDirectLogin.isPending ? 'Setting up...' : 'Setup & Login Admin'}
              </Button>
              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="user@example.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={newUser.full_name}
                        onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                        placeholder="+1234567890"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value as any})}>
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
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password *</Label>
                        <Button type="button" variant="outline" size="sm" onClick={generatePassword}>
                          Generate
                        </Button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        placeholder="Minimum 6 characters"
                        minLength={6}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddUser} 
                        disabled={addUserMutation.isPending}
                        className="flex-1"
                      >
                        {addUserMutation.isPending ? 'Creating...' : 'Create User'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddUserOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="property_owner">Property Owner</SelectItem>
                <SelectItem value="general_user">General User</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'N/A'}
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="ml-2">You</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant={user.verification_status === 'approved' ? 'default' : 'secondary'}>
                        {user.verification_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {canDeleteUser(user.id, user.role) && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteUserMutation.mutate(user.id)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
