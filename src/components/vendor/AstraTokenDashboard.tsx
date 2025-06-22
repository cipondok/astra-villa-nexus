
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Coins, 
  TrendingUp, 
  Gift, 
  Star,
  Calendar,
  Award,
  AlertTriangle
} from "lucide-react";

const AstraTokenDashboard = () => {
  const { user } = useAuth();

  // Check if ASTRA tokens are enabled
  const { data: tokenSystemEnabled } = useQuery({
    queryKey: ['astra-token-system-enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'astra_tokens_enabled')
        .eq('category', 'tools')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value === true;
    },
  });

  // Mock data for when system is disabled
  const mockData = {
    balance: { balance: 0, lifetime_earned: 0 },
    transactions: [],
    settings: []
  };

  if (!tokenSystemEnabled) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ASTRA Token system is currently disabled. Enable it through Admin Tools Management to activate token features.
          </AlertDescription>
        </Alert>

        {/* Token Balance Overview - Disabled State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-50">
          <Card className="card-ios">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Balance</p>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-muted-foreground">ASTRA Tokens (Disabled)</p>
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
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-muted-foreground">Total ASTRA (Disabled)</p>
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
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-muted-foreground">ASTRA Earned (Disabled)</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History - Disabled State */}
        <Card className="card-ios opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              ASTRA Token Transactions (Disabled)
            </CardTitle>
            <CardDescription>
              Token transaction history will appear here when the system is enabled
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
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      ASTRA Token system is disabled. Enable it through Admin Tools to view transactions.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Earning Opportunities - Disabled State */}
        <Card className="card-ios opacity-50">
          <CardHeader>
            <CardTitle>Ways to Earn ASTRA Tokens (Disabled)</CardTitle>
            <CardDescription>
              Token earning opportunities will be available when the system is enabled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">Signup Bonus (Disabled)</div>
                    <div className="text-sm text-muted-foreground">
                      Earn tokens for joining the platform
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium">Complete Profile (Disabled)</div>
                    <div className="text-sm text-muted-foreground">
                      Earn tokens for 100% profile completion
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Service Completion (Disabled)</div>
                    <div className="text-sm text-muted-foreground">
                      Earn tokens for completing services
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Coins className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Transaction Rewards (Disabled)</div>
                    <div className="text-sm text-muted-foreground">
                      Earn percentage of transaction value
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // When enabled, show actual functionality (this would need proper implementation)
  return (
    <div className="space-y-6">
      <Alert>
        <Coins className="h-4 w-4" />
        <AlertDescription>
          ASTRA Token system is enabled but requires database setup to display actual data.
        </AlertDescription>
      </Alert>
      
      {/* This would contain the actual token dashboard when fully implemented */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-ios">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Balance</p>
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-sm text-muted-foreground">ASTRA Tokens</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                <Coins className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AstraTokenDashboard;
