
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Coins, 
  Settings, 
  TrendingUp, 
  Users, 
  Gift,
  Plus,
  Edit
} from "lucide-react";

const AstraTokenManagement = () => {
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [rewardAmount, setRewardAmount] = useState("");
  const [rewardReason, setRewardReason] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: tokenSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['astra-token-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('astra_token_settings')
        .select('*')
        .order('setting_key');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: vendorBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ['vendor-astra-balances'],
    queryFn: async () => {
      // Get balances
      const { data: balances, error: balancesError } = await supabase
        .from('vendor_astra_balances')
        .select('*')
        .order('balance', { ascending: false });
      
      if (balancesError) throw balancesError;

      // Get vendor profiles
      const vendorIds = balances?.map(b => b.vendor_id).filter(Boolean) || [];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', vendorIds);
      
      if (profilesError) throw profilesError;

      // Combine data
      const combinedData = balances?.map(balance => {
        const profile = profiles?.find(p => p.id === balance.vendor_id);
        return {
          ...balance,
          vendor_profile: profile
        };
      });

      return combinedData;
    },
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['recent-astra-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('astra_token_transactions')
        .select('*, profiles!vendor_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('astra_token_settings')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "ASTRA token settings updated");
      queryClient.invalidateQueries({ queryKey: ['astra-token-settings'] });
    },
    onError: (error) => {
      console.error('Settings update error:', error);
      showError("Error", "Failed to update settings");
    },
  });

  const rewardVendorMutation = useMutation({
    mutationFn: async ({ vendorId, amount, reason }: { vendorId: string; amount: number; reason: string }) => {
      // Create transaction
      const { error: transactionError } = await supabase
        .from('astra_token_transactions')
        .insert([{
          vendor_id: vendorId,
          transaction_type: 'admin_reward',
          amount: amount,
          description: reason
        }]);
      
      if (transactionError) throw transactionError;

      // Update balance
      const { data: currentBalance, error: balanceError } = await supabase
        .from('vendor_astra_balances')
        .select('balance, lifetime_earned')
        .eq('vendor_id', vendorId)
        .single();
      
      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

      if (currentBalance) {
        const { error: updateError } = await supabase
          .from('vendor_astra_balances')
          .update({
            balance: Number(currentBalance.balance) + amount,
            lifetime_earned: Number(currentBalance.lifetime_earned) + amount
          })
          .eq('vendor_id', vendorId);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('vendor_astra_balances')
          .insert([{
            vendor_id: vendorId,
            balance: amount,
            lifetime_earned: amount
          }]);
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      showSuccess("Success", "ASTRA tokens awarded successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-astra-balances'] });
      queryClient.invalidateQueries({ queryKey: ['recent-astra-transactions'] });
      setShowRewardModal(false);
      setRewardAmount("");
      setRewardReason("");
      setSelectedVendor(null);
    },
    onError: (error) => {
      console.error('Reward error:', error);
      showError("Error", "Failed to award tokens");
    },
  });

  const handleRewardVendor = () => {
    if (!selectedVendor || !rewardAmount || !rewardReason) return;
    
    rewardVendorMutation.mutate({
      vendorId: selectedVendor.vendor_id,
      amount: Number(rewardAmount),
      reason: rewardReason
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">ASTRA Token Management</h2>
          <p className="text-muted-foreground">Manage token settings, balances, and rewards</p>
        </div>
        <Dialog open={showRewardModal} onOpenChange={setShowRewardModal}>
          <DialogTrigger asChild>
            <Button>
              <Gift className="h-4 w-4 mr-2" />
              Reward Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Award ASTRA Tokens</DialogTitle>
              <DialogDescription>
                Manually award tokens to a vendor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Vendor</Label>
                <select 
                  className="w-full p-2 border rounded"
                  value={selectedVendor?.id || ""}
                  onChange={(e) => {
                    const vendor = vendorBalances?.find(v => v.id === e.target.value);
                    setSelectedVendor(vendor);
                  }}
                >
                  <option value="">Choose vendor...</option>
                  {vendorBalances?.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.vendor_profile?.full_name || vendor.vendor_profile?.email || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Amount (ASTRA)</Label>
                <Input
                  type="number"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value)}
                  placeholder="Enter token amount"
                />
              </div>
              <div>
                <Label>Reason</Label>
                <Input
                  value={rewardReason}
                  onChange={(e) => setRewardReason(e.target.value)}
                  placeholder="Why are you awarding these tokens?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRewardModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRewardVendor}
                disabled={rewardVendorMutation.isPending || !selectedVendor || !rewardAmount || !rewardReason}
              >
                Award Tokens
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Token Settings</TabsTrigger>
          <TabsTrigger value="balances">Vendor Balances</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        {/* Token Settings */}
        <TabsContent value="settings">
          <Card className="card-ios">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                ASTRA Token Configuration
              </CardTitle>
              <CardDescription>
                Configure token rewards and limits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {settingsLoading ? (
                  <div className="text-center py-8">Loading settings...</div>
                ) : (
                  tokenSettings?.map((setting) => (
                    <div key={setting.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</h3>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        <Switch
                          checked={setting.setting_value?.enabled || false}
                          onCheckedChange={(enabled) => {
                            updateSettingMutation.mutate({
                              id: setting.id,
                              updates: {
                                setting_value: { ...setting.setting_value, enabled }
                              }
                            });
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(setting.setting_value || {}).map(([key, value]) => {
                          if (key === 'enabled') return null;
                          return (
                            <div key={key}>
                              <Label className="text-sm">{key.replace(/_/g, ' ')}</Label>
                              <Input
                                type="number"
                                value={value as string}
                                onChange={(e) => {
                                  const newValue = { ...setting.setting_value };
                                  newValue[key] = Number(e.target.value);
                                  updateSettingMutation.mutate({
                                    id: setting.id,
                                    updates: { setting_value: newValue }
                                  });
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Balances */}
        <TabsContent value="balances">
          <Card className="card-ios">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Vendor Token Balances
              </CardTitle>
              <CardDescription>
                View and manage vendor ASTRA token balances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Current Balance</TableHead>
                      <TableHead>Lifetime Earned</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balancesLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading balances...
                        </TableCell>
                      </TableRow>
                    ) : vendorBalances?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No vendor balances found
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendorBalances?.map((balance) => (
                        <TableRow key={balance.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {balance.vendor_profile?.full_name || 'Unknown'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {balance.vendor_profile?.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-purple-100 text-purple-800">
                              {balance.balance} ASTRA
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {balance.lifetime_earned} ASTRA
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVendor(balance);
                                setShowRewardModal(true);
                              }}
                            >
                              <Gift className="h-4 w-4 mr-2" />
                              Reward
                            </Button>
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

        {/* Recent Transactions */}
        <TabsContent value="transactions">
          <Card className="card-ios">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent ASTRA Transactions
              </CardTitle>
              <CardDescription>
                Monitor token transactions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : recentTransactions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTransactions?.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {transaction.profiles?.full_name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                transaction.transaction_type === 'admin_reward' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-green-100 text-green-800'
                              }
                            >
                              {transaction.transaction_type.replace(/_/g, ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-600">
                              +{transaction.amount} ASTRA
                            </span>
                          </TableCell>
                          <TableCell>
                            {transaction.description || 'No description'}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString()}
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

export default AstraTokenManagement;
