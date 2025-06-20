
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Coins, ExternalLink } from 'lucide-react';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useWallet } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

interface PremiumListingProps {
  children: React.ReactNode;
  requiredTokens: string;
  propertyTitle?: string;
  fallbackMessage?: string;
  showUpgrade?: boolean;
}

const PremiumListing: React.FC<PremiumListingProps> = ({
  children,
  requiredTokens,
  propertyTitle = 'Premium Property',
  fallbackMessage,
  showUpgrade = true,
}) => {
  const { balance, hasMinimumBalance, isLoading } = useTokenBalance();
  const { isConnected, connectWallet } = useWallet();
  const navigate = useNavigate();

  const hasAccess = hasMinimumBalance(requiredTokens);

  // Show loading state while checking balance
  if (isLoading && isConnected) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <Coins className="h-5 w-5 animate-spin" />
            <span>Checking token balance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show content if user has sufficient tokens
  if (isConnected && hasAccess) {
    return <>{children}</>;
  }

  // Fallback UI for insufficient tokens or not connected
  return (
    <Card className="w-full border-2 border-dashed border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-orange-600" />
        </div>
        <CardTitle className="text-orange-800 dark:text-orange-200">
          Premium Content
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          {fallbackMessage || `Access to "${propertyTitle}" requires ASTRA tokens`}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <Badge variant="outline" className="border-orange-300 text-orange-700">
            <Coins className="h-3 w-3 mr-1" />
            Required: {requiredTokens} ASTRA
          </Badge>
          
          {isConnected && balance && (
            <Badge variant="outline" className="border-gray-300 text-gray-700">
              Your Balance: {parseFloat(balance).toFixed(2)} ASTRA
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {!isConnected ? (
            <Button onClick={connectWallet} className="w-full">
              Connect Wallet to View
            </Button>
          ) : (
            <>
              {showUpgrade && (
                <Button 
                  onClick={() => navigate('/wallet')} 
                  variant="outline" 
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get ASTRA Tokens
                </Button>
              )}
              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost" 
                size="sm" 
                className="w-full"
              >
                Refresh Balance
              </Button>
            </>
          )}
        </div>

        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          Premium listings provide enhanced property details, 3D tours, and exclusive features
        </div>
      </CardContent>
    </Card>
  );
};

export default PremiumListing;
