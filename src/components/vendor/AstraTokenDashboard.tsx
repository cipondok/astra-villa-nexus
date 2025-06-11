
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Coins, 
  TrendingUp, 
  Gift, 
  Star,
  Calendar,
  Award
} from "lucide-react";

const AstraTokenDashboard = () => {
  const { user } = useAuth();

  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['astra-token-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('No user');
      
      // Get balance
      const { data: balance, error: balanceError } = await supabase
        .from('vendor_astra_balances')
        .select('*')
        .eq('vendor_id', user.id)
        .single();
      
      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;

      // Get recent transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('astra_token_transactions')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (transactionsError) throw transactionsError;

      // Get token settings
      const { data: settings, error: settingsError } = await supabase
        .from('astra_token_settings')
        .select('*');
      
      if (settingsError) throw settingsError;

      return {
        balance: balance || { balance: 0, lifetime_earned: 0 },
        transactions: transactions || [],
        settings: settings || []
      };
    },
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'signup_bonus':
        return <Gift className="h-4 w-4 text-green-600" />;
      case 'profile_completion':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'service_completion':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'admin_reward':
        return <Award className="h-4 w-4 text-purple-600" />;
      default:
        return <Coins className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'signup_bonus':
        return <Badge className="bg-green-100 text-green-800">Signup Bonus</Badge>;
      case 'profile_completion':
        return <Badge className="bg-yellow-100 text-yellow-800">Profile Complete</Badge>;
      case 'service_completion':
        return <Badge className="bg-blue-100 text-blue-800">Service Complete</Badge>;
      case 'admin_reward':
        return <Badge className="bg-purple-100 text-purple-800">Admin Reward</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-ios">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-purple-600">
                  {tokenData?.balance?.balance || 0}
                </p>
                <p className="text-sm text-muted-foreground">ASTRA Tokens</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                <Coins className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-ios">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Lifetime Earned</p>
                <p className="text-2xl font-bold text-green-600">
                  {tokenData?.balance?.lifetime_earned || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total ASTRA</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-ios">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tokenData?.transactions?.filter(t => {
                    const transactionDate = new Date(t.created_at);
                    const currentDate = new Date();
                    return transactionDate.getMonth() === currentDate.getMonth() &&
                           transactionDate.getFullYear() === currentDate.getFullYear();
                  }).reduce((sum, t) => sum + Number(t.amount), 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">ASTRA Earned</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="card-ios">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            ASTRA Token Transactions
          </CardTitle>
          <CardDescription>
            Track your token earnings and spending history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokenData?.transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No transactions yet. Start completing your profile to earn ASTRA tokens!
                    </TableCell>
                  </TableRow>
                ) : (
                  tokenData?.transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.transaction_type)}
                          {getTransactionBadge(transaction.transaction_type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.description || 'Token transaction'}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          +{transaction.amount} ASTRA
                        </span>
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

      {/* Earning Opportunities */}
      <Card className="card-ios">
        <CardHeader>
          <CardTitle>Ways to Earn ASTRA Tokens</CardTitle>
          <CardDescription>
            Complete these activities to earn more tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tokenData?.settings?.map((setting) => {
              if (setting.setting_key === 'signup_bonus') {
                return (
                  <div key={setting.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Gift className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Signup Bonus</div>
                        <div className="text-sm text-muted-foreground">
                          Earn {setting.setting_value.amount} ASTRA for joining
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              if (setting.setting_key === 'profile_completion') {
                return (
                  <div key={setting.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-medium">Complete Profile</div>
                        <div className="text-sm text-muted-foreground">
                          Earn {setting.setting_value.amount} ASTRA for 100% completion
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              if (setting.setting_key === 'service_creation') {
                return (
                  <div key={setting.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Create Services</div>
                        <div className="text-sm text-muted-foreground">
                          Earn {setting.setting_value.amount} ASTRA per service
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              if (setting.setting_key === 'transaction_percentage') {
                return (
                  <div key={setting.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Coins className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Transaction Rewards</div>
                        <div className="text-sm text-muted-foreground">
                          Earn {setting.setting_value.percentage}% of transaction value
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AstraTokenDashboard;
