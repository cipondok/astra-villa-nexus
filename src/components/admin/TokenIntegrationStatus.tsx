
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  Wallet,
  Database,
  Globe,
  Settings
} from 'lucide-react';

const TokenIntegrationStatus = () => {
  const integrationChecks = [
    {
      name: 'Database Tables',
      status: 'success',
      description: 'ASTRA token settings and transactions tables',
      icon: Database,
    },
    {
      name: 'Wallet Integration',
      status: 'success',
      description: 'Web3Modal and Wagmi wallet connection',
      icon: Wallet,
    },
    {
      name: 'Villa Realty Project',
      status: 'warning',
      description: 'External project integration configured',
      icon: Globe,
    },
    {
      name: 'Token Contract',
      status: 'warning',
      description: 'BSC Testnet contract deployment needed',
      icon: Settings,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ASTRA Token Integration Status</CardTitle>
          <CardDescription>
            Overview of token system components and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {integrationChecks.map((check) => {
              const StatusIcon = getStatusIcon(check.status);
              const IconComponent = check.icon;
              
              return (
                <div key={check.name} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <StatusIcon className={`h-4 w-4 ${
                      check.status === 'success' ? 'text-green-600' : 
                      check.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{check.name}</span>
                      <Badge variant="outline" className={getStatusColor(check.status)}>
                        {check.status === 'success' ? 'Ready' : 
                         check.status === 'warning' ? 'Needs Setup' : 'Error'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{check.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>
            Complete these steps to fully activate the ASTRA token system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Token Contract Deployment Required:</strong> Deploy ASTRA token contract to BSC Testnet and update the contract address in web3 configuration.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Update Villa Realty Integration</p>
                <p className="text-sm text-gray-600">Add token display components to the Realty project</p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Guide
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium">Configure Contract Address</p>
                <p className="text-sm text-gray-600">Update ASTRA_TOKEN_ADDRESS in web3.ts configuration</p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium">Test Token Transfers</p>
                <p className="text-sm text-gray-600">Verify wallet integration and token transactions</p>
              </div>
              <Button variant="outline" size="sm">
                <Wallet className="h-4 w-4 mr-2" />
                Test Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenIntegrationStatus;
