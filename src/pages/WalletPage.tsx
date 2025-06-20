
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import WalletConnector from '@/components/wallet/WalletConnector';
import TokenBalance from '@/components/wallet/TokenBalance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, CreditCard, History } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const WalletPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Wallet Management</h1>
            <p className="text-muted-foreground">
              Connect and manage your cryptocurrency wallets
            </p>
          </div>
        </div>

        {!isAuthenticated && (
          <Card className="mb-6 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-orange-600">⚠️</div>
                <div>
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                    Authentication Required
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Please sign in to link your wallet to your profile and access all features.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet Connection */}
          <div className="space-y-6">
            <WalletConnector />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common wallet operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <History className="h-4 w-4 mr-2" />
                  Transaction History
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Buy ASTRA (Coming Soon)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Token Balances */}
          <div className="space-y-6">
            <TokenBalance />
            
            {/* Network Info */}
            <Card>
              <CardHeader>
                <CardTitle>Network Information</CardTitle>
                <CardDescription>
                  Currently connected to Binance Smart Chain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="font-medium">BSC Mainnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Chain ID:</span>
                    <span className="font-medium">56</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Currency:</span>
                    <span className="font-medium">BNB</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
