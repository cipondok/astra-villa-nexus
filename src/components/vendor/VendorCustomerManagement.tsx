
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, Eye, Search, Filter, Phone, Mail, Calendar, DollarSign } from "lucide-react";

interface Customer {
  id: string;
  customer_id: string;
  customer_type: string;
  relationship_status: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  notes: string;
  customer_profile: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const VendorCustomerManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['vendor-customers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching vendor customers...');
      const { data, error } = await supabase
        .from('vendor_customers')
        .select(`
          *,
          customer_profile:profiles!customer_id (
            full_name,
            email,
            phone
          )
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ customerId, updates }: { customerId: string; updates: any }) => {
      const { error } = await supabase
        .from('vendor_customers')
        .update(updates)
        .eq('id', customerId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-customers'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive"
      });
    }
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.customer_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.relationship_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      blocked: "bg-red-100 text-red-800"
    };

    return (
      <Badge variant="outline" className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const handleStatusChange = (customerId: string, newStatus: string) => {
    updateCustomerMutation.mutate({
      customerId,
      updates: { relationship_status: newStatus }
    });
  };

  const totalRevenue = customers.reduce((sum, customer) => sum + (customer.total_spent || 0), 0);
  const totalOrders = customers.reduce((sum, customer) => sum + (customer.total_orders || 0), 0);
  const activeCustomers = customers.filter(c => c.relationship_status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">{activeCustomers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Management
          </CardTitle>
          <CardDescription>
            Manage your customer relationships and track their activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No customers found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.customer_profile?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{customer.customer_profile?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {customer.customer_profile?.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.customer_profile.email}
                          </div>
                        )}
                        {customer.customer_profile?.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {customer.customer_profile.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {customer.customer_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.relationship_status)}</TableCell>
                    <TableCell>{customer.total_orders}</TableCell>
                    <TableCell>${customer.total_spent?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      {customer.last_order_date 
                        ? new Date(customer.last_order_date).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={customer.relationship_status}
                          onValueChange={(value) => handleStatusChange(customer.id, value)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedCustomer.customer_profile?.full_name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedCustomer.customer_profile?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedCustomer.customer_profile?.phone || 'N/A'}</p>
                    <p><strong>Type:</strong> {selectedCustomer.customer_type.replace('_', ' ')}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Relationship Stats</h3>
                  <div className="space-y-2">
                    <p><strong>Status:</strong> {getStatusBadge(selectedCustomer.relationship_status)}</p>
                    <p><strong>Total Orders:</strong> {selectedCustomer.total_orders}</p>
                    <p><strong>Total Spent:</strong> ${selectedCustomer.total_spent?.toFixed(2) || '0.00'}</p>
                    <p><strong>Last Order:</strong> {selectedCustomer.last_order_date 
                      ? new Date(selectedCustomer.last_order_date).toLocaleDateString()
                      : 'Never'
                    }</p>
                  </div>
                </div>
              </div>
              
              {selectedCustomer.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorCustomerManagement;
