
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/contexts/AlertContext";
import { Shield, Save, RefreshCw } from "lucide-react";

interface CategoryAccess {
  department_id: string;
  category_id: string;
  access_level: 'read' | 'write' | 'manage';
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
}

const PropertyCategoryAccessManagement = () => {
  const [accessMatrix, setAccessMatrix] = useState<CategoryAccess[]>([]);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ['user-departments-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_departments')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch property categories
  const { data: categories } = useQuery({
    queryKey: ['property-categories-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch existing access rules
  const { data: existingAccess, refetch: refetchAccess } = useQuery({
    queryKey: ['property-category-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_category_access')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Save access matrix mutation
  const saveAccessMutation = useMutation({
    mutationFn: async (accessData: CategoryAccess[]) => {
      // Delete existing access rules
      const { error: deleteError } = await supabase
        .from('property_category_access')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (deleteError) throw deleteError;

      // Insert new access rules
      if (accessData.length > 0) {
        const { error: insertError } = await supabase
          .from('property_category_access')
          .insert(accessData);
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      showSuccess("Access Rules Saved", "Property category access rules updated successfully!");
      refetchAccess();
    },
    onError: (error: any) => {
      showError("Save Failed", error.message);
    },
  });

  const updateAccess = (
    departmentId: string, 
    categoryId: string, 
    field: keyof CategoryAccess, 
    value: any
  ) => {
    setAccessMatrix(prev => {
      const existing = prev.find(
        a => a.department_id === departmentId && a.category_id === categoryId
      );
      
      if (existing) {
        return prev.map(a => 
          a.department_id === departmentId && a.category_id === categoryId
            ? { ...a, [field]: value }
            : a
        );
      } else {
        return [...prev, {
          department_id: departmentId,
          category_id: categoryId,
          access_level: 'read',
          can_create: false,
          can_edit: false,
          can_delete: false,
          can_approve: false,
          [field]: value
        } as CategoryAccess];
      }
    });
  };

  const getAccess = (departmentId: string, categoryId: string): CategoryAccess | undefined => {
    return accessMatrix.find(
      a => a.department_id === departmentId && a.category_id === categoryId
    ) || existingAccess?.find(
      a => a.department_id === departmentId && a.category_id === categoryId
    );
  };

  const initializeDefaultAccess = () => {
    const defaultAccess: CategoryAccess[] = [];
    
    departments?.forEach(dept => {
      categories?.forEach(cat => {
        let access: CategoryAccess;
        
        // Define default access based on department
        switch (dept.name) {
          case 'Real Estate Agents':
            access = {
              department_id: dept.id,
              category_id: cat.id,
              access_level: 'manage',
              can_create: true,
              can_edit: true,
              can_delete: false,
              can_approve: false
            };
            break;
          case 'Property Owners':
            access = {
              department_id: dept.id,
              category_id: cat.id,
              access_level: 'write',
              can_create: true,
              can_edit: true,
              can_delete: false,
              can_approve: false
            };
            break;
          case 'Administrative Staff':
            access = {
              department_id: dept.id,
              category_id: cat.id,
              access_level: 'manage',
              can_create: true,
              can_edit: true,
              can_delete: true,
              can_approve: true
            };
            break;
          case 'Customer Service Team':
            access = {
              department_id: dept.id,
              category_id: cat.id,
              access_level: 'read',
              can_create: false,
              can_edit: false,
              can_delete: false,
              can_approve: false
            };
            break;
          default:
            access = {
              department_id: dept.id,
              category_id: cat.id,
              access_level: 'read',
              can_create: false,
              can_edit: false,
              can_delete: false,
              can_approve: false
            };
        }
        
        defaultAccess.push(access);
      });
    });
    
    setAccessMatrix(defaultAccess);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Property Category Access Control
              </CardTitle>
              <CardDescription>
                Configure which departments can access and manage different property categories
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={initializeDefaultAccess} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Set Defaults
              </Button>
              <Button 
                onClick={() => saveAccessMutation.mutate(accessMatrix)}
                disabled={saveAccessMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveAccessMutation.isPending ? 'Saving...' : 'Save Access Rules'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Department</TableHead>
                  <TableHead className="min-w-[200px]">Property Category</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Create</TableHead>
                  <TableHead>Edit</TableHead>
                  <TableHead>Delete</TableHead>
                  <TableHead>Approve</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments?.map(dept => 
                  categories?.map(cat => {
                    const access = getAccess(dept.id, cat.id);
                    return (
                      <TableRow key={`${dept.id}-${cat.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{dept.icon}</span>
                            <span className="font-medium">{dept.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={access?.access_level || 'read'}
                            onValueChange={(value) => updateAccess(dept.id, cat.id, 'access_level', value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="read">Read</SelectItem>
                              <SelectItem value="write">Write</SelectItem>
                              <SelectItem value="manage">Manage</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={access?.can_create || false}
                            onCheckedChange={(checked) => 
                              updateAccess(dept.id, cat.id, 'can_create', !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={access?.can_edit || false}
                            onCheckedChange={(checked) => 
                              updateAccess(dept.id, cat.id, 'can_edit', !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={access?.can_delete || false}
                            onCheckedChange={(checked) => 
                              updateAccess(dept.id, cat.id, 'can_delete', !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={access?.can_approve || false}
                            onCheckedChange={(checked) => 
                              updateAccess(dept.id, cat.id, 'can_approve', !!checked)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyCategoryAccessManagement;
