
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, RefreshCw, Building, Wallet, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { useRealtyIntegration } from '@/hooks/useRealtyIntegration';
import { toast } from 'sonner';

const ProjectIntegration = () => {
  const { isAuthenticated } = useAuth();
  const { astraBalance, isConnected } = useWallet();
  const { isLoading, realtyUser, syncToRealty, getRealtyProjectUrl } = useRealtyIntegration();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Villa Realty Integration
          </CardTitle>
          <CardDescription>
            Please sign in to access project integration
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleOpenRealty = () => {
    const realtyUrl = getRealtyProjectUrl('https://your-realty-project-url.lovableproject.com');
    window.open(realtyUrl, '_blank');
  };

  const handleSyncData = async () => {
    try {
      await syncToRealty();
      toast.success('Data synced successfully!');
    } catch (error) {
      toast.error('Failed to sync data');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Villa Realty Integration
        </CardTitle>
        <CardDescription>
          Seamlessly connect with ASTRA Villa Realty platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Wallet Status</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isConnected ? "Ready for transactions" : "Connect wallet first"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">ASTRA Balance</span>
              <Badge variant="outline" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {astraBalance || '0'} ASTRA
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Available for property transactions
              </span>
            </div>
          </div>
        </div>

        {/* Sync Status */}
        {realtyUser && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="bg-green-500">
                Synced
              </Badge>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Data synchronized with Realty platform
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-300">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleOpenRealty}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            disabled={!realtyUser}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Villa Realty
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleSyncData}
            disabled={isLoading}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Syncing...' : 'Sync Data'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Your ASTRA balance and wallet data sync automatically</li>
            <li>Click "Open Villa Realty" to access the property platform</li>
            <li>Use your ASTRA tokens for property transactions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectIntegration;
