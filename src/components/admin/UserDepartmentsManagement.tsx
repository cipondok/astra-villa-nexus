
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Building2, 
  Plus, 
  Edit, 
  Users, 
  Shield, 
  Settings,
  UserCheck,
  HeartHandshake,
  MessageSquare,
  Share2
} from "lucide-react";

interface UserDepartment {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const UserDepartmentsManagement = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<UserDepartment | null>(null);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch departments
  const { data: departments, isLoading: departmentsLoading, refetch: refetchDepartments } = useQuery({
    queryKey: ['user-departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return (data || []) as UserDepartment[];
    },
  });

  // Initialize default departments
  const initializeDefaultDepartments = async () => {
    const defaultDepartments = [
      {
        name: 'General Users',
        description: 'Standard platform users with basic access',
        icon: '👤',
        color: '#6B7280',
        permissions: ['view_properties', 'search_properties', 'contact_agents']
      },
      {
        name: 'Property Owners',
        description: 'Users who own and list properties',
        icon: '🏠',
        color: '#059669',
        permissions: ['view_properties', 'list_properties', 'manage_own_listings', 'view_analytics']
      },
      {
        name: 'Real Estate Agents',
        description: 'Licensed real estate professionals',
        icon: '🤝',
        color: '#DC2626',
        permissions: ['view_properties', 'list_properties', 'manage_client_listings', 'access_leads', 'view_market_data']
      },
      {
        name: 'Vendors & Service Providers',
        description: 'Construction, maintenance, and other service providers',
        icon: '🔧',
        color: '#7C3AED',
        permissions: ['view_properties', 'manage_services', 'access_work_orders', 'view_vendor_analytics']
      },
      {
        name: 'Customer Service Team',
        description: 'Support staff handling customer inquiries',
        icon: '🎧',
        color: '#0891B2',
        permissions: ['view_properties', 'access_tickets', 'manage_support_cases', 'view_user_profiles']
      },
      {
        name: 'Marketing & Social Media',
        description: 'Marketing team managing campaigns and social presence',
        icon: '📱',
        color: '#EA580C',
        permissions: ['view_properties', 'manage_campaigns', 'access_analytics', 'manage_social_media']
      },
      {
        name: 'Affiliate Partners',
        description: 'External partners with referral access',
        icon: '🤝',
        color: '#BE185D',
        permissions: ['view_properties', 'generate_referrals', 'track_commissions']
      },
      {
        name: 'Administrative Staff',
        description: 'Internal staff with elevated administrative access',
        icon: '⚙️',
        color: '#374151',
        permissions: ['view_properties', 'manage_users', 'access_reports', 'system_configuration']
      }
    ];

    try {
      const { error } = await supabase
        .from('user_departments')
        .insert(defaultDepartments);
      
      if (error) throw error;
      showSuccess("Departments Initialized", "Default user departments have been created successfully!");
      refetchDepartments();
    } catch (error: any) {
      showError("Initialization Failed", error.message);
    }
  };

  // Department operations
  const departmentMutation = useMutation({
    mutationFn: async (departmentData: any) => {
      if (departmentData.id) {
        const { error } = await supabase
          .from('user_departments')
          .update(departmentData)
          .eq('id', departmentData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_departments')
          .insert([departmentData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Success", "Department saved successfully!");
      setIsDepartmentModalOpen(false);
      refetchDepartments();
    },
    onError: (error: any) => {
      showError("Error", error.message);
    },
  });

  const getDepartmentIcon = (icon: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      '👤': <Users className="h-4 w-4" />,
      '🏠': <Building2 className="h-4 w-4" />,
      '🤝': <HeartHandshake className="h-4 w-4" />,
      '🔧': <Settings className="h-4 w-4" />,
      '🎧': <MessageSquare className="h-4 w-4" />,
      '📱': <Share2 className="h-4 w-4" />,
      '⚙️': <Shield className="h-4 w-4" />,
    };
    return iconMap[icon] || <Users className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                User Departments & Categories Management
              </CardTitle>
              <CardDescription>
                Manage user departments, roles, and their access to property categories
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(!departments || departments.length === 0) && (
                <Button onClick={initializeDefaultDepartments} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Initialize Departments
                </Button>
              )}
              <Dialog open={isDepartmentModalOpen} onOpenChange={setIsDepartmentModalOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedDepartment(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DepartmentModal
                  department={selectedDepartment}
                  onSave={(data) => departmentMutation.mutate(data)}
                  isLoading={departmentMutation.isPending}
                />
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {departmentsLoading ? (
            <div className="text-center py-8">Loading departments...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments?.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-2 rounded-full"
                          style={{ backgroundColor: `${dept.color}20`, color: dept.color }}
                        >
                          {getDepartmentIcon(dept.icon)}
                        </div>
                        <div>
                          <div className="font-medium">{dept.name}</div>
                          <div className="text-sm text-gray-500">{dept.icon}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-gray-600 truncate">{dept.description}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dept.permissions?.slice(0, 2).map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                        {dept.permissions && dept.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{dept.permissions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={dept.is_active ? "default" : "secondary"}>
                        {dept.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setIsDepartmentModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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

// Department Modal Component
const DepartmentModal = ({ 
  department, 
  onSave, 
  isLoading 
}: {
  department: UserDepartment | null;
  onSave: (data: any) => void;
  isLoading: boolean;
}) => {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
    icon: department?.icon || '👤',
    color: department?.color || '#6B7280',
    permissions: department?.permissions || [],
    is_active: department?.is_active ?? true,
  });

  const availablePermissions = [
    'view_properties',
    'list_properties',
    'manage_own_listings',
    'manage_client_listings',
    'access_leads',
    'view_analytics',
    'view_market_data',
    'manage_services',
    'access_work_orders',
    'view_vendor_analytics',
    'access_tickets',
    'manage_support_cases',
    'view_user_profiles',
    'manage_campaigns',
    'manage_social_media',
    'generate_referrals',
    'track_commissions',
    'manage_users',
    'access_reports',
    'system_configuration'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(department ? { ...formData, id: department.id } : formData);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {department ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Icon (Emoji)</Label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="👤"
            />
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div>
          <Label>Color</Label>
          <Input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>
        <div>
          <Label>Permissions</Label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
            {availablePermissions.map((permission) => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.permissions.includes(permission)}
                  onCheckedChange={() => togglePermission(permission)}
                />
                <Label className="text-sm">{permission.replace('_', ' ')}</Label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
          />
          <Label>Active</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Saving...' : 'Save Department'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default UserDepartmentsManagement;
