
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Plus, Edit, DollarSign, Users } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const BillingManagement = () => {
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planData, setPlanData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    billing_cycle: 'monthly',
    features: {}
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
    },
  });

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          user:profiles!user_subscriptions_user_id_fkey(full_name, email),
          plan:billing_plans!user_subscriptions_plan_id_fkey(name, price, currency)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const { error } = await supabase
        .from('billing_plans')
        .insert([{
          ...planData,
          price: parseFloat(planData.price)
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Plan Created", "Billing plan has been created successfully.");
      queryClient.invalidateQueries({ queryKey: ['billing-plans'] });
      setShowPlanForm(false);
      resetPlanForm();
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('billing_plans')
        .update({
          ...updates,
          price: parseFloat(updates.price)
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Plan Updated", "Billing plan has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['billing-plans'] });
      setShowPlanForm(false);
      setEditingPlan(null);
      resetPlanForm();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const resetPlanForm = () => {
    setPlanData({
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      billing_cycle: 'monthly',
      features: {}
    });
  };

  const handlePlanSubmit = () => {
    if (editingPlan) {
      updatePlanMutation.mutate({ id: editingPlan.id, updates: planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price?.toString() || '',
      currency: plan.currency,
      billing_cycle: plan.billing_cycle,
      features: plan.features || {}
    });
    setShowPlanForm(true);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="plans" className="w-full">
        <TabsList>
          <TabsTrigger value="plans">Billing Plans</TabsTrigger>
          <TabsTrigger value="subscriptions">User Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing Plans
                  </CardTitle>
                  <CardDescription>
                    Manage subscription plans and pricing
                  </CardDescription>
                </div>
                <Dialog open={showPlanForm} onOpenChange={setShowPlanForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetPlanForm(); setEditingPlan(null); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingPlan ? 'Update the plan details.' : 'Create a new billing plan.'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="plan_name">Plan Name</Label>
                        <Input
                          id="plan_name"
                          value={planData.name}
                          onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
                          placeholder="Basic Plan"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="plan_description">Description</Label>
                        <Textarea
                          id="plan_description"
                          value={planData.description}
                          onChange={(e) => setPlanData({ ...planData, description: e.target.value })}
                          placeholder="Plan description..."
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            value={planData.price}
                            onChange={(e) => setPlanData({ ...planData, price: e.target.value })}
                            placeholder="29.99"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select value={planData.currency} onValueChange={(value) => setPlanData({ ...planData, currency: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="IDR">IDR</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="billing_cycle">Billing Cycle</Label>
                        <Select value={planData.billing_cycle} onValueChange={(value) => setPlanData({ ...planData, billing_cycle: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                            <SelectItem value="one-time">One-time</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="features">Features (JSON)</Label>
                        <Textarea
                          id="features"
                          value={JSON.stringify(planData.features, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              setPlanData({ ...planData, features: parsed });
                            } catch (error) {
                              // Invalid JSON
                            }
                          }}
                          placeholder='{"max_properties": 10, "featured_listings": true}'
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPlanForm(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handlePlanSubmit}
                        disabled={createPlanMutation.isPending || updatePlanMutation.isPending}
                      >
                        {editingPlan ? 'Update' : 'Create'} Plan
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plansLoading ? (
                  <div className="col-span-full text-center py-8">Loading plans...</div>
                ) : billingPlans?.map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => handleEditPlan(plan)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-3xl font-bold">
                            {formatPrice(plan.price, plan.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per {plan.billing_cycle}
                          </div>
                        </div>
                        {plan.features && Object.keys(plan.features).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Features:</h4>
                            <ul className="text-sm space-y-1">
                              {Object.entries(plan.features).map(([key, value]) => (
                                <li key={key} className="flex justify-between">
                                  <span>{key.replace('_', ' ')}:</span>
                                  <span>{value?.toString()}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Subscriptions
              </CardTitle>
              <CardDescription>
                Manage user subscriptions and billing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading subscriptions...
                        </TableCell>
                      </TableRow>
                    ) : subscriptions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions?.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{subscription.user?.full_name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{subscription.user?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{subscription.plan?.name || 'Unknown Plan'}</div>
                              <div className="text-sm text-muted-foreground">
                                {subscription.plan && formatPrice(subscription.plan.price, subscription.plan.currency)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(subscription.status)}>
                              {subscription.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {subscription.starts_at ? new Date(subscription.starts_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {subscription.ends_at ? new Date(subscription.ends_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline">
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingManagement;
