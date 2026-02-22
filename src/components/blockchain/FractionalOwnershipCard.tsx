import React from 'react';
import { usePropertyToken } from '@/lib/blockchain/hooks/usePropertyToken';
import { useWallet } from '@/lib/blockchain/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Users, 
  TrendingUp, 
  Gift,
  Building2,
  Wallet,
  PieChart,
  AlertTriangle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

interface FractionalOwnershipCardProps {
  propertyId: string;
  propertyTitle: string;
  propertyImage?: string;
  tokenId?: bigint;
}

export const FractionalOwnershipCard: React.FC<FractionalOwnershipCardProps> = ({
  propertyId,
  propertyTitle,
  propertyImage,
  tokenId,
}) => {
  const { address, isConnected, isPolygon } = useWallet();
  const { 
    useGetPropertyToken, 
    useGetHolderInfo,
    purchaseShares,
    claimDividend,
    isWritePending,
    isConfirming,
    formatAmount 
  } = usePropertyToken();

  const { tokenInfo, isLoading: loadingToken } = useGetPropertyToken(tokenId);
  const { holderInfo, isLoading: loadingHolder } = useGetHolderInfo(tokenId, address);

  const handlePurchaseShares = async (shares: number) => {
    if (!tokenId || !tokenInfo) return;
    
    const totalPrice = Number(tokenInfo.pricePerShare) * shares / 1e18;
    
    try {
      await purchaseShares(tokenId, shares, totalPrice.toString());
      toast.success('Purchase initiated');
    } catch (error) {
      toast.error('Failed to purchase shares');
    }
  };

  const handleClaimDividend = async () => {
    if (!tokenId) return;
    
    try {
      await claimDividend(tokenId);
      toast.success('Dividend claim initiated');
    } catch (error) {
      toast.error('Failed to claim dividend');
    }
  };

  if (!isConnected) {
    return (
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Coins className="h-12 w-12 text-primary/40" />
        </div>
        <CardContent className="pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Connect wallet to view tokenized ownership
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isPolygon) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-chart-3 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Switch to Polygon network
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loadingToken) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!tokenInfo) {
    return (
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Building2 className="h-12 w-12 text-primary/40" />
        </div>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-lg mb-2">{propertyTitle}</h3>
          <Badge variant="outline" className="mb-3">Not Tokenized</Badge>
          <p className="text-sm text-muted-foreground">
            This property is not yet available for fractional ownership.
          </p>
        </CardContent>
      </Card>
    );
  }

  const soldPercentage = tokenInfo.totalShares > 0n 
    ? Number((tokenInfo.totalShares - tokenInfo.availableShares) * 100n / tokenInfo.totalShares)
    : 0;

  const pricePerShareMatic = Number(tokenInfo.pricePerShare) / 1e18;
  const propertyValueMatic = Number(tokenInfo.propertyValue) / 1e18;
  const minInvestmentMatic = Number(tokenInfo.minInvestment) / 1e18;

  return (
    <Card className="overflow-hidden">
      {propertyImage ? (
        <div 
          className="h-32 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${propertyImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <Badge 
            className="absolute top-2 right-2"
            variant={tokenInfo.isActive ? 'default' : 'secondary'}
          >
            {tokenInfo.isActive ? 'Active' : 'Closed'}
          </Badge>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-purple-500/20 to-blue-500/10 flex items-center justify-center relative">
          <Coins className="h-12 w-12 text-primary/40" />
          <Badge 
            className="absolute top-2 right-2"
            variant={tokenInfo.isActive ? 'default' : 'secondary'}
          >
            {tokenInfo.isActive ? 'Active' : 'Closed'}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{propertyTitle}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <PieChart className="h-3 w-3" />
          Fractional Ownership Available
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Shares Sold</span>
            <span className="font-medium">{soldPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={soldPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{(Number(tokenInfo.totalShares) - Number(tokenInfo.availableShares)).toLocaleString()} sold</span>
            <span>{Number(tokenInfo.availableShares).toLocaleString()} available</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Coins className="h-3 w-3" />
              Price/Share
            </div>
            <p className="font-semibold">{pricePerShareMatic.toFixed(4)} MATIC</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              Property Value
            </div>
            <p className="font-semibold">{propertyValueMatic.toLocaleString()} MATIC</p>
          </div>
        </div>

        {/* My Holdings */}
        {holderInfo && holderInfo.shares > 0n && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Your Holdings
              </span>
              <Badge variant="outline">
                {Number(holderInfo.ownershipPercentage) / 100}% Ownership
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Shares:</span>
                <span className="ml-1 font-medium">{Number(holderInfo.shares).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Invested:</span>
                <span className="ml-1 font-medium">
                  {(Number(holderInfo.totalInvested) / 1e18).toFixed(2)} MATIC
                </span>
              </div>
            </div>

            {holderInfo.unclaimedDividends > 0n && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleClaimDividend}
                disabled={isWritePending}
                className="w-full mt-3"
              >
                <Gift className="h-3 w-3 mr-1" />
                Claim {(Number(holderInfo.unclaimedDividends) / 1e18).toFixed(4)} MATIC Dividend
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {tokenInfo.isActive && !tokenInfo.isSoldOut && (
          <Button 
            onClick={() => handlePurchaseShares(1)}
            disabled={isWritePending || isConfirming}
            className="w-full"
          >
            {isWritePending || isConfirming ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Coins className="h-4 w-4 mr-2" />
            )}
            Buy Shares (Min: {minInvestmentMatic} MATIC)
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        {tokenInfo.isSoldOut && (
          <Badge variant="secondary" className="w-full justify-center py-2">
            <Users className="h-4 w-4 mr-2" />
            Fully Subscribed
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default FractionalOwnershipCard;
