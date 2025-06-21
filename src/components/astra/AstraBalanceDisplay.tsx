
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, RefreshCw, Wallet } from 'lucide-react';
import { useAstraToken } from '@/hooks/useAstraToken';
import { useAuth } from '@/contexts/AuthContext';

interface AstraBalanceDisplayProps {
  variant?: 'header' | 'card' | 'inline';
  showRefresh?: boolean;
}

const AstraBalanceDisplay: React.FC<AstraBalanceDisplayProps> = ({ 
  variant = 'inline',
  showRefresh = false 
}) => {
  const { isAuthenticated } = useAuth();
  const { balance, isLoading, fetchBalance } = useAstraToken();

  if (!isAuthenticated) {
    return null;
  }

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (variant === 'header') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full">
        <Coins className="h-4 w-4" />
        <span className="font-semibold text-sm">
          {isLoading ? '...' : formatBalance(balance)} ASTRA
        </span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-500" />
              <span className="font-medium">ASTRA Balance</span>
            </div>
            {showRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchBalance}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {isLoading ? '...' : formatBalance(balance)} ASTRA
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            ≈ ${(balance * 0.01).toFixed(2)} USD
          </div>
        </CardContent>
      </Card>
    );
  }

  // inline variant
  return (
    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
      <Coins className="h-3 w-3 mr-1" />
      {isLoading ? '...' : formatBalance(balance)} ASTRA
    </Badge>
  );
};

export default AstraBalanceDisplay;
