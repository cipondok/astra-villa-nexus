
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAlert } from "@/contexts/AlertContext";
import { CreditCard, Plus, Edit, DollarSign, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const BillingManagement = () => {
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    billing_cycle: 'monthly',
    features: ''
  });
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: billingPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_plans')
        .select('*')
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          user:profiles!user_subscriptions_user_id_fkey(full_name, email),
          plan:billing_plans(name, price, currency)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const { error } = await supabase
        .from('billing_plans')
        .insert({
          ...planData,
          price: parseFloat(planData.price),
          features: planData.features ? JSON.parse(planData.features) : {}
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-plans'] });
      showSuccess("Success", "Billing plan created successfully");
      setIsCreatePlanOpen(false);
      setNewPlan({
        name: '',
        description: '',
        price: '',
        currency: 'USD',
        billing_cycle: 'monthly',
        features: ''
      });
    },
    onError: (error) => {
      showError("Error", `Failed to create plan: ${error.message}`);
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { error } = await supabase
        .from('billing_plans')
        .update({
          ...updates,
          price: parseFloat(updates.price),
          features: updates.features ? JSON.parse(updates.features) : {}
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-plans'] });
      showSuccess("Success", "Billing plan updated successfully");
      setEditingPlan(null);
    },
    onError: (error) => {
      showError("Error", `Failed to update plan: ${error.message}`);
    }
  });

  const handleCreatePlan = () => {
    if (!newPlan.name.trim() || !newPlan.price) {
      showError("Error", "Name and price are required");
      return;
    }
    createPlanMutation.mutate(newPlan);
  };

  const handleUpdatePlan = () => {
    if (!editingPlan) return;
    updatePlanMutation.mutate({
      id: editingPlan.id,
      updates: {
        name: editingPlan.name,
        description: editingPlan.description,
        price: editingPlan.price,
        currency: editingPlan.currency,
        billing_cycle: editingPlan.billing_cycle,
        features: editingPlan.features,
        is_active: editingPlan.is_active
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      case 'suspended': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing & Subscription Management
          </CardTitle>
          <CardDescription>Manage billing plans, subscriptions, and payments</CardDescription>
        </CardHeader>
      </Card>

      {/* Billing Plans Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing Plans</CardTitle>
              <CardDescription>Create and manage subscription plans</CardDescription>
            </div>
            <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Billing Plan</DialogTitle>
                  <DialogDescription>Add a new subscription plan</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="plan-name">Plan Name</Label>
                    <Input
                      id="plan-name"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                      placeholder="Basic Plan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-description">Description</Label>
                    <Textarea
                      id="plan-description"
                      value={newPlan.description}
                      onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                      placeholder="Plan description..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan-price">Price</Label>
                      <Input
                        id="plan-price"
                        type="number"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                        placeholder="29.99"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-currency">Currency</Label>
                      <Select
                        value={newPlan.currency}
                        onValueChange={(value) => setNewPlan({...newPlan, currency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="plan-cycle">Billing Cycle</Label>
                    <Select
                      value={newPlan.billing_cycle}
                      onValueChange={(value) => setNewPlan({...newPlan, billing_cycle: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="plan-features">Features (JSON)</Label>
                    <Textarea
                      id="plan-features"
                      value={newPlan.features}
                      onChange={(e) => setNewPlan({...newPlan, features: e.target.value})}
                      placeholder='{"listings": 10, "premium_support": true}'
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePlan} disabled={createPlanMutation.isPending}>
                    {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plansLoading ? (
              <div className="col-span-full text-center py-8">Loading plans...</div>
            ) : billingPlans?.map((plan) => (
              <Card key={plan.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {formatPrice(plan.price, plan.currency)}
                      </div>
                      <div className="text-sm text-gray-500">
                        per {plan.billing_cycle}
                      </div>
                    </div>
                    
                    {plan.features && (
                      <div>
                        <h4 className="font-medium mb-2">Features:</h4>
                        <div className="text-sm text-gray-600">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(plan.features, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPlan({
                        ...plan,
                        features: JSON.stringify(plan.features, null, 2)
                      })}
                      className="w-full"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Subscriptions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Active Subscriptions</CardTitle>
          <CardDescription>Monitor user subscriptions and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                ) : subscriptions?.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{subscription.user?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">{subscription.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{subscription.plan?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(subscription.starts_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {subscription.ends_at 
                        ? new Date(subscription.ends_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      {subscription.plan?.price ? 
                        formatPrice(subscription.plan.price, subscription.plan.currency) : 
                        'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingPlans?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Available plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions?.filter(s => s.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently subscribed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(
                subscriptions?.filter(s => s.status === 'active' && s.plan)
                  .reduce((total, s) => total + (s.plan?.price || 0), 0) || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Estimated monthly</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions ? 
                Math.round((subscriptions.filter(s => s.status === 'cancelled').length / subscriptions.length) * 100) : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">Cancelled subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Billing Plan</DialogTitle>
            <DialogDescription>Update plan information</DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-plan-name">Plan Name</Label>
                <Input
                  id="edit-plan-name"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-plan-description">Description</Label>
                <Textarea
                  id="edit-plan-description"
                  value={editingPlan.description || ''}
                  onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-plan-price">Price</Label>
                  <Input
                    id="edit-plan-price"
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({...editingPlan, price: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-plan-currency">Currency</Label>
                  <Select
                    value={editingPlan.currency}
                    onValueChange={(value) => setEditingPlan({...editingPlan, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-plan-features">Features (JSON)</Label>
                <Textarea
                  id="edit-plan-features"
                  value={editingPlan.features}
                  onChange={(e) => setEditingPlan({...editingPlan, features: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlan} disabled={updatePlanMutation.isPending}>
              {updatePlanMutation.isPending ? 'Updating...' : 'Update Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingManagement;
