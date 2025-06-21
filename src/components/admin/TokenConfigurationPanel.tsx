
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, ExternalLink, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { ASTRA_TOKEN_CONFIG, isTokenConfigured } from '@/lib/web3';
import { toast } from 'sonner';

const TokenConfigurationPanel = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenName, setTokenName] = useState('ASTRA Token');
  const [tokenSymbol, setTokenSymbol] = useState('ASTRA');
  const [decimals, setDecimals] = useState('18');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSaveConfiguration = () => {
    if (!contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      toast.error('Please enter a valid contract address');
      return;
    }
    
    toast.info('Configuration saved! Please update the web3.ts file with your contract details.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            ASTRA Token Configuration
          </CardTitle>
          <CardDescription>
            Configure your personal ASTRA token contract for integration with the property platform
          </CardDescription>
        </CardHeader>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {isTokenConfigured() 
            ? "✅ Token contract is configured and ready to use!" 
            : "⚠️ Token contract address needs to be configured. Please update the contract address in web3.ts"}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="configure" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure">Configure Contract</TabsTrigger>
          <TabsTrigger value="current">Current Config</TabsTrigger>
          <TabsTrigger value="instructions">Instructions</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Contract Details</CardTitle>
              <CardDescription>
                Enter your deployed ASTRA token contract details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contract-address">Contract Address</Label>
                <Input
                  id="contract-address"
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="token-name">Token Name</Label>
                  <Input
                    id="token-name"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token-symbol">Token Symbol</Label>
                  <Input
                    id="token-symbol"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decimals">Decimals</Label>
                <Input
                  id="decimals"
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveConfiguration} className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Testnet Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {ASTRA_TOKEN_CONFIG.testnet.address.slice(0, 8)}...
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(ASTRA_TOKEN_CONFIG.testnet.address)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Chain:</span>
                  <Badge variant="outline">BSC Testnet</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Symbol:</span>
                  <span className="text-sm">{ASTRA_TOKEN_CONFIG.testnet.symbol}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mainnet Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {ASTRA_TOKEN_CONFIG.mainnet.address.slice(0, 8)}...
                    </span>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(ASTRA_TOKEN_CONFIG.mainnet.address)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Chain:</span>
                  <Badge variant="outline">BSC Mainnet</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Symbol:</span>
                  <span className="text-sm">{ASTRA_TOKEN_CONFIG.mainnet.symbol}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integration Instructions</CardTitle>
              <CardDescription>
                Steps to integrate your personal ASTRA token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Deploy Your ASTRA Token</h4>
                    <p className="text-sm text-muted-foreground">
                      Deploy your ASTRA token contract on BSC Testnet and/or Mainnet
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Update Contract Address</h4>
                    <p className="text-sm text-muted-foreground">
                      Replace the placeholder addresses in src/lib/web3.ts with your actual contract addresses
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Update Token ABI</h4>
                    <p className="text-sm text-muted-foreground">
                      Add your contract's ABI to the ASTRA_TOKEN_ABI array if you have custom functions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-medium">Test Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect your wallet and test the token balance display and transfers
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  After updating the contract address, all wallet connections will automatically use your ASTRA token!
                </AlertDescription>
              </Alert>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('https://docs.binance.org/smart-chain/developer/deploy/remix.html', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                BSC Deployment Guide
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TokenConfigurationPanel;
