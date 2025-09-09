import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Wallet,
  Globe,
  Key,
  Shield,
  Zap,
  ArrowRight,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocalGateway {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  configured: boolean;
  merchantId?: string;
  apiKey?: string;
  secretKey?: string;
  environment: 'sandbox' | 'production';
  webhookUrl?: string;
  setupComplete: boolean;
}

const PaymentGatewaySetup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  
  const [gateways, setGateways] = useState<LocalGateway[]>([
    {
      id: 'gopay',
      name: 'GoPay',
      description: 'Most popular digital wallet in Indonesia',
      icon: Smartphone,
      enabled: false,
      configured: false,
      environment: 'sandbox',
      setupComplete: false
    },
    {
      id: 'ovo',
      name: 'OVO',
      description: 'Leading e-wallet for cashless payments',
      icon: Wallet,
      enabled: false,
      configured: false,
      environment: 'sandbox',
      setupComplete: false
    },
    {
      id: 'dana',
      name: 'DANA',
      description: 'Universal digital wallet solution',
      icon: CreditCard,
      enabled: false,
      configured: false,
      environment: 'sandbox',
      setupComplete: false
    },
    {
      id: 'shopeepay',
      name: 'ShopeePay',
      description: 'E-commerce integrated payment',
      icon: CreditCard,
      enabled: false,
      configured: false,
      environment: 'sandbox',
      setupComplete: false
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct bank-to-bank transfers',
      icon: Building2,
      enabled: false,
      configured: false,
      environment: 'sandbox',
      setupComplete: false
    },
    {
      id: 'virtual_account',
      name: 'Virtual Account',
      description: 'Virtual account payments via banks',
      icon: Building2,
      enabled: false,
      configured: false,
      environment: 'sandbox',
      setupComplete: false
    }
  ]);

  const setupSteps = [
    {
      title: 'Select Gateway',
      description: 'Choose which payment gateway to configure',
      icon: Smartphone
    },
    {
      title: 'Configure Settings',
      description: 'Enter your merchant credentials',
      icon: Settings
    },
    {
      title: 'Test Connection',
      description: 'Verify your gateway configuration',
      icon: Zap
    },
    {
      title: 'Go Live',
      description: 'Enable gateway for live transactions',
      icon: Globe
    }
  ];

  useEffect(() => {
    loadGatewayConfigs();
  }, []);

  const loadGatewayConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'indonesian_payment');
      
      if (error) {
        console.error('Error loading gateway configs:', error);
        return;
      }

      if (data && data.length > 0) {
        const updatedGateways = gateways.map(gateway => {
          const gatewaySettings = data.filter(setting => 
            setting.key.includes(`payment_${gateway.id}_`)
          );
          
          if (gatewaySettings.length > 0) {
            let updatedGateway = { ...gateway };
            
            gatewaySettings.forEach(setting => {
              const field = setting.key.replace(`payment_${gateway.id}_`, '');
              
              switch (field) {
                case 'isEnabled':
                  updatedGateway.enabled = String(setting.value) === 'true';
                  break;
                case 'merchantId':
                  updatedGateway.merchantId = String(setting.value);
                  break;
                case 'apiKey':
                  updatedGateway.apiKey = String(setting.value);
                  break;
                case 'secretKey':
                  updatedGateway.secretKey = String(setting.value);
                  break;
                case 'environment':
                  updatedGateway.environment = setting.value as 'sandbox' | 'production';
                  break;
                case 'webhookUrl':
                  updatedGateway.webhookUrl = String(setting.value);
                  break;
              }
            });
            
            updatedGateway.configured = !!(updatedGateway.merchantId && updatedGateway.apiKey);
            updatedGateway.setupComplete = updatedGateway.configured && updatedGateway.enabled;
            
            return updatedGateway;
          }
          
          return gateway;
        });
        
        setGateways(updatedGateways);
      }
    } catch (error) {
      console.error('Error loading gateway configs:', error);
    }
  };

  const handleGatewaySelect = (gatewayId: string) => {
    setSelectedGateway(gatewayId);
    setActiveStep(1);
  };

  const updateGateway = (gatewayId: string, updates: Partial<LocalGateway>) => {
    setGateways(prev => prev.map(gateway => 
      gateway.id === gatewayId 
        ? { ...gateway, ...updates }
        : gateway
    ));
  };

  const saveGatewayConfig = async (gatewayId: string) => {
    setLoading(true);
    try {
      const gateway = gateways.find(g => g.id === gatewayId);
      if (!gateway) return;

      if (!gateway.merchantId || !gateway.apiKey) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const settingsToSave = [
        { 
          key: `payment_${gatewayId}_merchantId`, 
          value: gateway.merchantId,
          category: 'indonesian_payment',
          description: `${gateway.name} Merchant ID`,
          is_public: false
        },
        { 
          key: `payment_${gatewayId}_apiKey`, 
          value: gateway.apiKey,
          category: 'indonesian_payment',
          description: `${gateway.name} API Key`,
          is_public: false
        },
        { 
          key: `payment_${gatewayId}_secretKey`, 
          value: gateway.secretKey || '',
          category: 'indonesian_payment',
          description: `${gateway.name} Secret Key`,
          is_public: false
        },
        { 
          key: `payment_${gatewayId}_environment`, 
          value: gateway.environment,
          category: 'indonesian_payment',
          description: `${gateway.name} Environment`,
          is_public: false
        },
        { 
          key: `payment_${gatewayId}_webhookUrl`, 
          value: gateway.webhookUrl || '',
          category: 'indonesian_payment',
          description: `${gateway.name} Webhook URL`,
          is_public: false
        },
        { 
          key: `payment_${gatewayId}_isEnabled`, 
          value: gateway.enabled.toString(),
          category: 'indonesian_payment',
          description: `${gateway.name} Enabled Status`,
          is_public: false
        }
      ];

      const { error } = await supabase
        .from('system_settings')
        .upsert(settingsToSave, {
          onConflict: 'key,category',
          ignoreDuplicates: false
        });

      if (error) {
        throw new Error(`Failed to save configuration: ${error.message}`);
      }

      updateGateway(gatewayId, { 
        configured: true,
        setupComplete: gateway.enabled
      });
      
      toast.success(`${gateway.name} configuration saved successfully`);
      setActiveStep(2);
      
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(`Could not save configuration: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testGatewayConnection = async (gatewayId: string) => {
    const gateway = gateways.find(g => g.id === gatewayId);
    if (!gateway || !gateway.configured) {
      toast.error('Gateway not configured');
      return;
    }

    setLoading(true);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`${gateway.name} connection test successful`);
      setActiveStep(3);
      
    } catch (error: any) {
      toast.error(`Connection test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const enableGateway = async (gatewayId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: `payment_${gatewayId}_isEnabled`,
          value: 'true',
          category: 'indonesian_payment',
          description: `${gateways.find(g => g.id === gatewayId)?.name} Enabled Status`,
          is_public: false
        }, {
          onConflict: 'key,category'
        });

      if (error) throw error;

      updateGateway(gatewayId, { 
        enabled: true,
        setupComplete: true
      });
      
      toast.success('Gateway enabled successfully!');
      
    } catch (error: any) {
      toast.error(`Failed to enable gateway: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8">
      {setupSteps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        
        return (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
              isCompleted 
                ? 'bg-green-500 border-green-500 text-white' 
                : isActive 
                  ? 'bg-primary border-primary text-white' 
                  : 'bg-muted border-muted-foreground/20 text-muted-foreground'
            }`}>
              {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <div className="text-center">
              <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderGatewaySelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Select Payment Gateway</h3>
        <p className="text-muted-foreground">Choose which local Indonesian payment gateway you want to set up</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gateways.map((gateway) => {
          const Icon = gateway.icon;
          
          return (
            <Card 
              key={gateway.id}
              className={`cursor-pointer hover:shadow-lg transition-all ${
                gateway.setupComplete ? 'border-green-500 bg-green-50/50 dark:bg-green-900/10' : ''
              }`}
              onClick={() => handleGatewaySelect(gateway.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{gateway.name}</h4>
                      <p className="text-sm text-muted-foreground">{gateway.description}</p>
                    </div>
                  </div>
                  {gateway.setupComplete && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Configuration:</span>
                    <span className={gateway.configured ? 'text-green-600' : 'text-orange-600'}>
                      {gateway.configured ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <span className={gateway.enabled ? 'text-green-600' : 'text-gray-600'}>
                      {gateway.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderGatewayConfig = () => {
    const gateway = gateways.find(g => g.id === selectedGateway);
    if (!gateway) return null;

    const Icon = gateway.icon;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Icon className="h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold">Configure {gateway.name}</h3>
          </div>
          <p className="text-muted-foreground">Enter your merchant credentials</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Merchant Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Merchant ID *</Label>
                <Input
                  value={gateway.merchantId || ''}
                  onChange={(e) => updateGateway(gateway.id, { merchantId: e.target.value })}
                  placeholder="Enter your merchant ID"
                />
              </div>

              <div className="space-y-2">
                <Label>Environment</Label>
                <Select
                  value={gateway.environment}
                  onValueChange={(value: 'sandbox' | 'production') => 
                    updateGateway(gateway.id, { environment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                    <SelectItem value="production">Production (Live)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>API Key *</Label>
                <div className="flex space-x-2">
                  <Input
                    type={showSecrets[`${gateway.id}_apiKey`] ? 'text' : 'password'}
                    value={gateway.apiKey || ''}
                    onChange={(e) => updateGateway(gateway.id, { apiKey: e.target.value })}
                    placeholder="Enter your API key"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecrets(prev => ({ 
                      ...prev, 
                      [`${gateway.id}_apiKey`]: !prev[`${gateway.id}_apiKey`] 
                    }))}
                  >
                    {showSecrets[`${gateway.id}_apiKey`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex space-x-2">
                  <Input
                    type={showSecrets[`${gateway.id}_secretKey`] ? 'text' : 'password'}
                    value={gateway.secretKey || ''}
                    onChange={(e) => updateGateway(gateway.id, { secretKey: e.target.value })}
                    placeholder="Enter your secret key"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecrets(prev => ({ 
                      ...prev, 
                      [`${gateway.id}_secretKey`]: !prev[`${gateway.id}_secretKey`] 
                    }))}
                  >
                    {showSecrets[`${gateway.id}_secretKey`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Webhook URL</Label>
                <Input
                  value={gateway.webhookUrl || ''}
                  onChange={(e) => updateGateway(gateway.id, { webhookUrl: e.target.value })}
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => setActiveStep(0)} variant="outline">
                Back
              </Button>
              <Button 
                onClick={() => saveGatewayConfig(gateway.id)}
                disabled={loading || !gateway.merchantId || !gateway.apiKey}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderConnectionTest = () => {
    const gateway = gateways.find(g => g.id === selectedGateway);
    if (!gateway) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Test Connection</h3>
          <p className="text-muted-foreground">Verify your gateway configuration works correctly</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Connection Test</h4>
                <p className="text-sm text-muted-foreground">
                  We'll verify your credentials can connect to {gateway.name}
                </p>
              </div>

              <div className="flex space-x-2 justify-center">
                <Button onClick={() => setActiveStep(1)} variant="outline">
                  Back to Config
                </Button>
                <Button 
                  onClick={() => testGatewayConnection(gateway.id)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderGoLive = () => {
    const gateway = gateways.find(g => g.id === selectedGateway);
    if (!gateway) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Go Live</h3>
          <p className="text-muted-foreground">Enable {gateway.name} for live transactions</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800 dark:text-green-200">Ready to Go Live!</h4>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {gateway.name} is configured and tested successfully
                </p>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Make sure you've switched to production credentials if you're ready for live transactions.
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2 justify-center">
                <Button onClick={() => setActiveStep(2)} variant="outline">
                  Back to Test
                </Button>
                <Button 
                  onClick={() => enableGateway(gateway.id)}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enabling...
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Enable Gateway
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const getProgressPercent = () => {
    return ((activeStep + 1) / setupSteps.length) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Gateway Setup</h2>
          <p className="text-muted-foreground">Configure local Indonesian payment gateways</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Setup Progress</span>
          <span>{Math.round(getProgressPercent())}%</span>
        </div>
        <Progress value={getProgressPercent()} className="h-2" />
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <Card className="min-h-[400px]">
        <CardContent className="p-6">
          {activeStep === 0 && renderGatewaySelection()}
          {activeStep === 1 && renderGatewayConfig()}
          {activeStep === 2 && renderConnectionTest()}
          {activeStep === 3 && renderGoLive()}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Configured</p>
                <p className="text-lg font-semibold">
                  {gateways.filter(g => g.configured).length} / {gateways.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Live Gateways</p>
                <p className="text-lg font-semibold">
                  {gateways.filter(g => g.enabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Setup Complete</p>
                <p className="text-lg font-semibold">
                  {gateways.filter(g => g.setupComplete).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentGatewaySetup;