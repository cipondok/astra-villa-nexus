import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  CreditCard, 
  BanknoteIcon, 
  Download,
  History,
  Settings,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Smartphone
} from "lucide-react";
import { format } from "date-fns";

interface PayoutSettings {
  id?: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  bank_code: string;
  digital_wallet_type: string;
  digital_wallet_account: string;
  preferred_payout_method: string;
  minimum_payout_amount: number;
  payout_schedule: string;
}

interface PayoutRequest {
  id: string;
  amount: number;
  currency: string;
  payout_method: string;
  status: string;
  reference_number: string;
  created_at: string;
  processed_at: string;
}

interface PayoutTransaction {
  id: string;
  booking_type: string;
  transaction_type: string;
  amount: number;
  commission_rate: number;
  base_amount: number;
  status: string;
  description: string;
  created_at: string;
}

const PayoutManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>({
    bank_account_name: '',
    bank_account_number: '',
    bank_name: '',
    bank_code: '',
    digital_wallet_type: '',
    digital_wallet_account: '',
    preferred_payout_method: 'bank_transfer',
    minimum_payout_amount: 100000,
    payout_schedule: 'weekly'
  });
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [payoutTransactions, setPayoutTransactions] = useState<PayoutTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchAvailableBalance(),
        fetchPayoutSettings(),
        fetchPayoutRequests(),
        fetchPayoutTransactions()
      ]);
    } catch (error) {
      console.error('Error fetching payout data:', error);
      toast({
        title: "Error",
        description: "Failed to load payout data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBalance = async () => {
    const { data, error } = await supabase.rpc('get_available_payout_balance', {
      p_user_id: user!.id
    });

    if (error) throw error;
    setAvailableBalance(data || 0);
  };

  const fetchPayoutSettings = async () => {
    const { data, error } = await supabase
      .from('payout_settings')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (data) {
      setPayoutSettings(data);
    }
  };

  const fetchPayoutRequests = async () => {
    const { data, error } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setPayoutRequests(data || []);
  };

  const fetchPayoutTransactions = async () => {
    const { data, error } = await supabase
      .from('payout_transactions')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    setPayoutTransactions(data || []);
  };

  const savePayoutSettings = async () => {
    try {
      const { error } = await supabase
        .from('payout_settings')
        .upsert({
          ...payoutSettings,
          user_id: user!.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payout settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving payout settings:', error);
      toast({
        title: "Error",
        description: "Failed to save payout settings",
        variant: "destructive"
      });
    }
  };

  const requestPayout = async () => {
    const amount = parseFloat(requestAmount);
    
    if (!amount || amount < payoutSettings.minimum_payout_amount) {
      toast({
        title: "Invalid Amount",
        description: `Minimum payout amount is Rp ${payoutSettings.minimum_payout_amount.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: "Requested amount exceeds available balance",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          user_id: user!.id,
          amount,
          payout_method: payoutSettings.preferred_payout_method,
          payout_details: {
            bank_account_name: payoutSettings.bank_account_name,
            bank_account_number: payoutSettings.bank_account_number,
            bank_name: payoutSettings.bank_name,
            bank_code: payoutSettings.bank_code,
            digital_wallet_type: payoutSettings.digital_wallet_type,
            digital_wallet_account: payoutSettings.digital_wallet_account
          }
        });

      if (error) throw error;

      // Update transaction statuses to pending_payout
      await supabase
        .from('payout_transactions')
        .update({ status: 'pending_payout' })
        .eq('user_id', user!.id)
        .eq('status', 'earned');

      toast({
        title: "Success",
        description: "Payout request submitted successfully"
      });

      setRequestAmount('');
      fetchAllData();
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        title: "Error",
        description: "Failed to submit payout request",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid_out':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'earned':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const bankOptions = [
    { code: 'BCA', name: 'Bank Central Asia (BCA)' },
    { code: 'BNI', name: 'Bank Negara Indonesia (BNI)' },
    { code: 'BRI', name: 'Bank Rakyat Indonesia (BRI)' },
    { code: 'MANDIRI', name: 'Bank Mandiri' },
    { code: 'CIMB', name: 'CIMB Niaga' },
    { code: 'DANAMON', name: 'Bank Danamon' },
    { code: 'PERMATA', name: 'Bank Permata' },
    { code: 'MEGA', name: 'Bank Mega' }
  ];

  const walletOptions = [
    { value: 'ovo', name: 'OVO' },
    { value: 'gopay', name: 'GoPay' },
    { value: 'dana', name: 'DANA' },
    { value: 'shopeepay', name: 'ShopeePay' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Payout Management</h2>
          <p className="text-muted-foreground">Manage your earnings and payout preferences</p>
        </div>
        <Button onClick={fetchAllData} className="bg-primary hover:bg-primary/90">
          Refresh Data
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Available Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(availableBalance)}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{payoutRequests.filter(r => r.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(payoutTransactions.reduce((sum, t) => sum + t.amount, 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="request">Request Payout</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.booking_type === 'rental' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {transaction.booking_type === 'rental' ? 
                            <BanknoteIcon className="h-5 w-5 text-blue-600" /> :
                            <Smartphone className="h-5 w-5 text-green-600" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{formatCurrency(transaction.amount)}</p>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Payout Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Recent Payout Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{formatCurrency(request.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Request Payout Tab */}
        <TabsContent value="request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Payout</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (IDR)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  min={payoutSettings.minimum_payout_amount}
                  max={availableBalance}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum: {formatCurrency(payoutSettings.minimum_payout_amount)} • 
                  Available: {formatCurrency(availableBalance)}
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Payout Method</h4>
                <p className="text-sm">
                  {payoutSettings.preferred_payout_method === 'bank_transfer' ? 
                    `${payoutSettings.bank_name} - ${payoutSettings.bank_account_number}` :
                    `${payoutSettings.digital_wallet_type?.toUpperCase()} - ${payoutSettings.digital_wallet_account}`
                  }
                </p>
                <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab('settings')}>
                  Change payout method
                </Button>
              </div>

              <Button 
                onClick={requestPayout} 
                className="w-full"
                disabled={!requestAmount || parseFloat(requestAmount) < payoutSettings.minimum_payout_amount}
              >
                <Download className="h-4 w-4 mr-2" />
                Submit Payout Request
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid gap-6">
            {/* Payout Requests History */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-semibold">{formatCurrency(request.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested: {format(new Date(request.created_at), 'MMM dd, yyyy')}
                        </p>
                        {request.reference_number && (
                          <p className="text-xs text-muted-foreground">
                            Ref: {request.reference_number}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {request.processed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Processed: {format(new Date(request.processed_at), 'MMM dd')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>All Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.booking_type === 'rental' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {transaction.booking_type === 'rental' ? 
                            <BanknoteIcon className="h-4 w-4 text-blue-600" /> :
                            <Smartphone className="h-4 w-4 text-green-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.transaction_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy • HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Payout Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payout Method Selection */}
              <div>
                <Label>Preferred Payout Method</Label>
                <Select
                  value={payoutSettings.preferred_payout_method}
                  onValueChange={(value) => setPayoutSettings(prev => ({ ...prev, preferred_payout_method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Details */}
              {payoutSettings.preferred_payout_method === 'bank_transfer' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-semibold">Bank Account Details</h4>
                  
                  <div>
                    <Label htmlFor="bank_name">Bank</Label>
                    <Select
                      value={payoutSettings.bank_code}
                      onValueChange={(value) => {
                        const bank = bankOptions.find(b => b.code === value);
                        setPayoutSettings(prev => ({ 
                          ...prev, 
                          bank_code: value,
                          bank_name: bank?.name || ''
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankOptions.map((bank) => (
                          <SelectItem key={bank.code} value={bank.code}>
                            {bank.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="bank_account_name">Account Holder Name</Label>
                    <Input
                      id="bank_account_name"
                      value={payoutSettings.bank_account_name}
                      onChange={(e) => setPayoutSettings(prev => ({ ...prev, bank_account_name: e.target.value }))}
                      placeholder="Full name as registered"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bank_account_number">Account Number</Label>
                    <Input
                      id="bank_account_number"
                      value={payoutSettings.bank_account_number}
                      onChange={(e) => setPayoutSettings(prev => ({ ...prev, bank_account_number: e.target.value }))}
                      placeholder="Account number"
                    />
                  </div>
                </div>
              )}

              {/* Digital Wallet Details */}
              {payoutSettings.preferred_payout_method === 'digital_wallet' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-semibold">Digital Wallet Details</h4>
                  
                  <div>
                    <Label>Wallet Type</Label>
                    <Select
                      value={payoutSettings.digital_wallet_type}
                      onValueChange={(value) => setPayoutSettings(prev => ({ ...prev, digital_wallet_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select wallet" />
                      </SelectTrigger>
                      <SelectContent>
                        {walletOptions.map((wallet) => (
                          <SelectItem key={wallet.value} value={wallet.value}>
                            {wallet.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="digital_wallet_account">Wallet Account</Label>
                    <Input
                      id="digital_wallet_account"
                      value={payoutSettings.digital_wallet_account}
                      onChange={(e) => setPayoutSettings(prev => ({ ...prev, digital_wallet_account: e.target.value }))}
                      placeholder="Phone number or account ID"
                    />
                  </div>
                </div>
              )}

              {/* General Settings */}
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-semibold">General Settings</h4>
                
                <div>
                  <Label htmlFor="minimum_payout_amount">Minimum Payout Amount (IDR)</Label>
                  <Input
                    id="minimum_payout_amount"
                    type="number"
                    value={payoutSettings.minimum_payout_amount}
                    onChange={(e) => setPayoutSettings(prev => ({ ...prev, minimum_payout_amount: parseInt(e.target.value) || 0 }))}
                    min="50000"
                  />
                </div>

                <div>
                  <Label>Payout Schedule</Label>
                  <Select
                    value={payoutSettings.payout_schedule}
                    onValueChange={(value) => setPayoutSettings(prev => ({ ...prev, payout_schedule: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="on_demand">On Demand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={savePayoutSettings} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayoutManagement;