
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, Settings, Save, TestTube } from 'lucide-react';
import { astraTokenAPI, AstraTokenConfig } from '@/services/astraTokenAPI';
import { toast } from 'sonner';

const AstraTokenAPIConfiguration = () => {
  const [config, setConfig] = useState<AstraTokenConfig>({
    contractAddress: '',
    networkId: 97, // BSC Testnet
    blockExplorer: 'https://testnet.bscscan.com'
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('astra-token-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        astraTokenAPI.initialize(parsed);
        setConnectionStatus('success');
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }
  }, []);

  const handleSaveConfiguration = () => {
    if (!config.contractAddress.startsWith('0x') || config.contractAddress.length !== 42) {
      toast.error('Please enter a valid contract address');
      return;
    }

    try {
      // Save to localStorage
      localStorage.setItem('astra-token-config', JSON.stringify(config));
      
      // Initialize API
      astraTokenAPI.initialize(config);
      
      setConnectionStatus('success');
      toast.success('ASTRA Token API configured successfully!');
    } catch (error) {
      toast.error('Failed to save configuration');
      setConnectionStatus('error');
    }
  };

  const handleTestConnection = async () => {
    if (!astraTokenAPI.isConfigured()) {
      toast.error('Please save configuration first');
      return;
    }

    setIsTestingConnection(true);
    try {
      // Test connection with a dummy address
      await astraTokenAPI.getBalance('0x0000000000000000000000000000000000000001');
      setConnectionStatus('success');
      toast.success('Connection test successful!');
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const networkOptions = [
    { value: 56, label: 'BSC Mainnet', explorer: 'https://bscscan.com' },
    { value: 97, label: 'BSC Testnet', explorer: 'https://testnet.bscscan.com' },
    { value: 1, label: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
    { value: 11155111, label: 'Sepolia Testnet', explorer: 'https://sepolia.etherscan.io' },
  ];

  const handleNetworkChange = (networkId: string) => {
    const network = networkOptions.find(n => n.value.toString() === networkId);
    if (network) {
      setConfig(prev => ({
        ...prev,
        networkId: network.value,
        blockExplorer: network.explorer
      }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ASTRA Token API Configuration
          </CardTitle>
          <CardDescription>
            Configure your personal ASTRA token API for seamless integration
          </CardDescription>
        </CardHeader>
      </Card>

      <Alert>
        <div className="flex items-center gap-2">
          {connectionStatus === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
        <AlertDescription>
          {connectionStatus === 'success' 
            ? "✅ ASTRA Token API is configured and ready!" 
            : "⚠️ Configure your ASTRA token to enable wallet features"}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="configure" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="configure">Configuration</TabsTrigger>
          <TabsTrigger value="test">Test & Validate</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Configuration</CardTitle>
              <CardDescription>
                Enter your ASTRA token contract details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-address">Contract Address</Label>
                <Input
                  id="contract-address"
                  placeholder="0x..."
                  value={config.contractAddress}
                  onChange={(e) => setConfig(prev => ({ ...prev, contractAddress: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your deployed ASTRA token contract address
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="network">Network</Label>
                <Select onValueChange={handleNetworkChange} value={config.networkId.toString()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {networkOptions.map((network) => (
                      <SelectItem key={network.value} value={network.value.toString()}>
                        {network.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explorer">Block Explorer</Label>
                <Input
                  id="explorer"
                  value={config.blockExplorer}
                  onChange={(e) => setConfig(prev => ({ ...prev, blockExplorer: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveConfiguration} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Connection</CardTitle>
              <CardDescription>
                Validate your ASTRA token configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">API Status</p>
                  <p className="text-sm text-muted-foreground">
                    {astraTokenAPI.isConfigured() ? 'Configured' : 'Not configured'}
                  </p>
                </div>
                <Badge variant={astraTokenAPI.isConfigured() ? "default" : "secondary"}>
                  {astraTokenAPI.isConfigured() ? "Ready" : "Pending"}
                </Badge>
              </div>

              <Button 
                onClick={handleTestConnection} 
                disabled={isTestingConnection || !astraTokenAPI.isConfigured()}
                className="w-full"
              >
                <TestTube className={`h-4 w-4 mr-2 ${isTestingConnection ? 'animate-spin' : ''}`} />
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </Button>

              {connectionStatus === 'success' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Connection successful! Your ASTRA token API is working properly.
                  </AlertDescription>
                </Alert>
              )}

              {connectionStatus === 'error' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ❌ Connection failed. Please check your configuration and try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AstraTokenAPIConfiguration;
