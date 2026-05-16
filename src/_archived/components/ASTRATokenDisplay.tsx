
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Zap,
  Shield,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';

interface ASTRATokenInfo {
  balance: number;
  transactions: number;
  lastTransaction: string;
  apiStatus: 'connected' | 'disconnected' | 'checking';
  tokenPrice: number;
  priceChange24h: number;
}

const ASTRATokenDisplay = () => {
  const { showSuccess, showError } = useAlert();
  const [tokenInfo, setTokenInfo] = useState<ASTRATokenInfo>({
    balance: 0,
    transactions: 0,
    lastTransaction: 'Never',
    apiStatus: 'checking',
    tokenPrice: 380, // Example price in IDR
    priceChange24h: 5.2 // Example 24h change percentage
  });
  const [loading, setLoading] = useState(false);
  const [apiConfig, setApiConfig] = useState<any>(null);

  useEffect(() => {
    loadTokenInfo();
    loadAPIConfig();
  }, []);

  const loadAPIConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'astra_api');
      
      if (error) {
        console.error('Error loading API config:', error);
        return;
      }

      if (data && data.length > 0) {
        const settings = data.reduce((acc, setting) => {
          const key = setting.key.replace('astra_api_', '');
          acc[key] = setting.value;
          return acc;
        }, {} as any);
        
        setApiConfig(settings);
        
        // Check if API is properly configured
        if (settings.apiKey && settings.baseUrl && settings.isEnabled === 'true') {
          checkAPIStatus(settings);
        } else {
          setTokenInfo(prev => ({ ...prev, apiStatus: 'disconnected' }));
        }
      }
    } catch (error) {
      console.error('Error loading API config:', error);
      setTokenInfo(prev => ({ ...prev, apiStatus: 'disconnected' }));
    }
  };

  const checkAPIStatus = async (config: any) => {
    try {
      setTokenInfo(prev => ({ ...prev, apiStatus: 'checking' }));
      
      const response = await fetch(`${config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        setTokenInfo(prev => ({ ...prev, apiStatus: 'connected' }));
        // Load actual token data if API is working
        await loadUserTokenData(config);
      } else {
        setTokenInfo(prev => ({ ...prev, apiStatus: 'disconnected' }));
      }
    } catch (error) {
      console.error('API status check failed:', error);
      setTokenInfo(prev => ({ ...prev, apiStatus: 'disconnected' }));
    }
  };

  const loadUserTokenData = async (config: any) => {
    try {
      // Simulate loading user token data
      // In real implementation, this would call the ASTRA API
      setTokenInfo(prev => ({
        ...prev,
        balance: 1250.75,
        transactions: 42,
        lastTransaction: new Date().toLocaleDateString()
      }));
    } catch (error) {
      console.error('Error loading token data:', error);
    }
  };

  const loadTokenInfo = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, this would fetch from ASTRA API
      setTokenInfo(prev => ({
        ...prev,
        balance: 1250.75,
        transactions: 42,
        lastTransaction: new Date().toLocaleDateString(),
        tokenPrice: 380,
        priceChange24h: 5.2
      }));
    } catch (error) {
      showError('Load Error', 'Failed to load ASTRA token information');
    } finally {
      setLoading(false);
    }
  };

  const refreshTokenData = async () => {
    setLoading(true);
    try {
      await loadAPIConfig();
      showSuccess('Refreshed', 'ASTRA token data has been refreshed');
    } catch (error) {
      showError('Refresh Failed', 'Could not refresh token data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (tokenInfo.apiStatus) {
      case 'connected':
        return (
          <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'checking':
        return (
          <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Checking
          </Badge>
        );
      case 'disconnected':
      default:
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTokenAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
            <Coins className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">ASTRA Token</h2>
            <p className="text-muted-foreground">Your digital property token balance</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <Button
            onClick={refreshTokenData}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* API Status Alert */}
      {tokenInfo.apiStatus === 'disconnected' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ASTRA Token API is not connected. Please check your API configuration in the admin panel.
          </AlertDescription>
        </Alert>
      )}

      {/* Token Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Token Balance</CardTitle>
            <Coins className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : `${formatTokenAmount(tokenInfo.balance)} ASTRA`}
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ {formatCurrency(tokenInfo.balance * tokenInfo.tokenPrice)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Token Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(tokenInfo.tokenPrice)}
            </div>
            <p className={`text-xs ${tokenInfo.priceChange24h >= 0 ? 'text-chart-1' : 'text-destructive'}`}>
              {tokenInfo.priceChange24h >= 0 ? '+' : ''}{tokenInfo.priceChange24h}% 24h
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Transactions</CardTitle>
            <Zap className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : tokenInfo.transactions}
            </div>
            <p className="text-xs text-muted-foreground">
              Total completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? '...' : tokenInfo.lastTransaction}
            </div>
            <p className="text-xs text-muted-foreground">
              Last transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token Features */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            ASTRA Token Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Property Transactions</h4>
              <p className="text-sm text-muted-foreground">
                Use ASTRA tokens for secure, fast property purchases and investments.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Staking Rewards</h4>
              <p className="text-sm text-muted-foreground">
                Earn passive income by staking your ASTRA tokens in property pools.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Governance Rights</h4>
              <p className="text-sm text-muted-foreground">
                Vote on platform decisions and property development proposals.
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Low Fees</h4>
              <p className="text-sm text-muted-foreground">
                Enjoy reduced transaction fees across all platform services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {tokenInfo.apiStatus === 'connected' && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-primary hover:bg-primary/90">
                <Coins className="h-4 w-4 mr-2" />
                Buy ASTRA
              </Button>
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="outline">
                <Zap className="h-4 w-4 mr-2" />
                Transaction History
              </Button>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Staking Pool
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ASTRATokenDisplay;
