
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Wallet, Send, Receipt, History, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { formatAstraAmount } from '@/lib/web3';
import { toast } from 'sonner';
import WalletConnector from './WalletConnector';
import TokenBalance from './TokenBalance';

const WalletDashboard = () => {
  const { isConnected, address, astraBalance } = useWallet();
  const { isAuthenticated } = useAuth();
  const { balance } = useTokenBalance();
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendTokens = async () => {
    if (!sendAmount || !recipientAddress) {
      toast.error('Please enter amount and recipient address');
      return;
    }

    setIsLoading(true);
    try {
      // Token transfer logic would go here
      toast.success('Token transfer initiated');
      setSendAmount('');
      setRecipientAddress('');
    } catch (error) {
      toast.error('Failed to send tokens');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Access</CardTitle>
          <CardDescription>Please sign in to access wallet features</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wallet Dashboard</h2>
          <p className="text-muted-foreground">Manage your ASTRA tokens and transactions</p>
        </div>
        {isConnected && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Connected
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Connection */}
        <div className="lg:col-span-1">
          <WalletConnector />
        </div>

        {/* Token Balance */}
        <div className="lg:col-span-2">
          <TokenBalance />
        </div>
      </div>

      {isConnected && (
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="send">Send Tokens</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send ASTRA Tokens
                </CardTitle>
                <CardDescription>
                  Transfer ASTRA tokens to another wallet address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ASTRA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Available: {balance || '0'} ASTRA
                  </p>
                </div>
                <Button 
                  onClick={handleSendTokens} 
                  disabled={isLoading || !sendAmount || !recipientAddress}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Tokens'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Receive Tokens
                </CardTitle>
                <CardDescription>
                  Share your wallet address to receive ASTRA tokens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Wallet Address</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={address || ''} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(address || '');
                        toast.success('Address copied to clipboard');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    Share this address to receive ASTRA tokens from other users or exchanges.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  View your recent ASTRA token transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground py-8">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                    <p className="text-sm">Your transaction history will appear here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default WalletDashboard;
