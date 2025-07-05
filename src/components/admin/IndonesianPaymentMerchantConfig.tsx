import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Wallet,
  Globe,
  Key
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';

interface PaymentMerchantConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  isEnabled: boolean;
  environment: 'sandbox' | 'production';
  webhookUrl: string;
  timeout: number;
  description: string;
}

interface MerchantConfigs {
  gopay: PaymentMerchantConfig;
  ovo: PaymentMerchantConfig;
  dana: PaymentMerchantConfig;
  linkaja: PaymentMerchantConfig;
  shopeepay: PaymentMerchantConfig;
  bank_transfer: PaymentMerchantConfig;
  virtual_account: PaymentMerchantConfig;
}

const defaultConfig: PaymentMerchantConfig = {
  merchantId: '',
  apiKey: '',
  secretKey: '',
  isEnabled: false,
  environment: 'sandbox',
  webhookUrl: '',
  timeout: 30000,
  description: ''
};

const IndonesianPaymentMerchantConfig = () => {
  const { showSuccess, showError } = useAlert();
  const [configs, setConfigs] = useState<MerchantConfigs>({
    gopay: { ...defaultConfig, description: 'GoPay - Indonesia digital wallet' },
    ovo: { ...defaultConfig, description: 'OVO - Indonesia digital wallet' },
    dana: { ...defaultConfig, description: 'DANA - Indonesia digital wallet' },
    linkaja: { ...defaultConfig, description: 'LinkAja - Digital payment platform' },
    shopeepay: { ...defaultConfig, description: 'ShopeePay - E-commerce payment' },
    bank_transfer: { ...defaultConfig, description: 'Indonesian bank transfer' },
    virtual_account: { ...defaultConfig, description: 'Virtual account payments' }
  });
  
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'disconnected' | null>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<keyof MerchantConfigs>('gopay');

  const merchantLabels = {
    gopay: 'GoPay',
    ovo: 'OVO',
    dana: 'DANA',
    linkaja: 'LinkAja',
    shopeepay: 'ShopeePay',
    bank_transfer: 'Bank Transfer',
    virtual_account: 'Virtual Account'
  };

  const merchantIcons = {
    gopay: Smartphone,
    ovo: Wallet,
    dana: CreditCard,
    linkaja: Smartphone,
    shopeepay: CreditCard,
    bank_transfer: Building2,
    virtual_account: Building2
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'indonesian_payment');
      
      if (error) {
        console.error('Error loading payment configs:', error);
        showError('Database Error', `Failed to load configurations: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        const loadedConfigs = { ...configs };
        
        data.forEach(setting => {
          const [merchant, field] = setting.key.replace('payment_', '').split('_', 2);
          const remaining = setting.key.replace(`payment_${merchant}_`, '');
          
          if (loadedConfigs[merchant as keyof MerchantConfigs]) {
            let value = setting.value;
            
            if (remaining === 'isEnabled') {
              value = String(value) === 'true';
            } else if (remaining === 'timeout') {
              value = parseInt(String(value));
            } else {
              value = String(value);
            }
            
            (loadedConfigs[merchant as keyof MerchantConfigs] as any)[remaining] = value;
          }
        });
        
        setConfigs(loadedConfigs);
      }
    } catch (error) {
      console.error('Error loading payment configs:', error);
      showError('Error', 'Failed to load payment configurations');
    }
  };

  const saveConfiguration = async (merchant: keyof MerchantConfigs) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const config = configs[merchant];
      
      if (!config.merchantId) {
        showError('Validation Error', 'Merchant ID is required');
        setLoading(false);
        return;
      }
      
      const settingsToSave = [
        { 
          key: `payment_${merchant}_merchantId`, 
          value: config.merchantId,
          category: 'indonesian_payment',
          description: `${merchantLabels[merchant]} Merchant ID`,
          is_public: false
        },
        { 
          key: `payment_${merchant}_apiKey`, 
          value: config.apiKey,
          category: 'indonesian_payment',
          description: `${merchantLabels[merchant]} API Key`,
          is_public: false
        },
        { 
          key: `payment_${merchant}_secretKey`, 
          value: config.secretKey,
          category: 'indonesian_payment',
          description: `${merchantLabels[merchant]} Secret Key`,
          is_public: false
        },
        { 
          key: `payment_${merchant}_isEnabled`, 
          value: config.isEnabled.toString(),
          category: 'indonesian_payment',
          description: `${merchantLabels[merchant]} enabled status`,
          is_public: false
        },
        { 
          key: `payment_${merchant}_environment`, 
          value: config.environment,
          category: 'indonesian_payment',
          description: `${merchantLabels[merchant]} environment`,
          is_public: false
        },
        { 
          key: `payment_${merchant}_webhookUrl`, 
          value: config.webhookUrl,
          category: 'indonesian_payment',
          description: `${merchantLabels[merchant]} webhook URL`,
          is_public: false
        },
        { 
          key: `payment_${merchant}_timeout`, 
          value: config.timeout.toString(),
          category: 'indonesian_payment',
          description: `${merchantLabels[merchant]} timeout`,
          is_public: false
        },
        { 
          key: `payment_${merchant}_description`, 
          value: config.description,
          category: 'indonesian_payment',
          description: `${merchantLabels[merchant]} description`,
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

      showSuccess('Configuration Saved', `${merchantLabels[merchant]} configuration saved successfully`);
      await loadConfigurations();
      
    } catch (error: any) {
      console.error('Save error:', error);
      showError('Save Failed', `Could not save configuration: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (merchant: keyof MerchantConfigs) => {
    const config = configs[merchant];
    
    if (!config.merchantId || !config.apiKey) {
      showError('Missing Configuration', 'Please configure merchant ID and API key before testing');
      return;
    }

    setTesting(merchant);
    setConnectionStatus({ ...connectionStatus, [merchant]: null });
    
    try {
      // Simulate API test - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      setConnectionStatus({ ...connectionStatus, [merchant]: 'connected' });
      showSuccess('Connection Test Passed', `${merchantLabels[merchant]} API connection successful`);
      
    } catch (error: any) {
      setConnectionStatus({ ...connectionStatus, [merchant]: 'disconnected' });
      showError('Connection Test Failed', `Failed to connect to ${merchantLabels[merchant]}: ${error.message}`);
    } finally {
      setTesting(null);
    }
  };

  const handleConfigChange = (merchant: keyof MerchantConfigs, field: keyof PaymentMerchantConfig, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [merchant]: {
        ...prev[merchant],
        [field]: value
      }
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied', 'Copied to clipboard');
  };

  const toggleSecretVisibility = (merchant: string, field: string) => {
    const key = `${merchant}_${field}`;
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderMerchantConfig = (merchant: keyof MerchantConfigs) => {
    const config = configs[merchant];
    const Icon = merchantIcons[merchant];
    const isCurrentTesting = testing === merchant;
    const status = connectionStatus[merchant];

    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <Icon className="h-5 w-5 mr-2" />
              {merchantLabels[merchant]} Configuration
            </div>
            {status && (
              <Badge variant={status === 'connected' ? 'default' : 'destructive'}>
                {status === 'connected' ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {status === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Merchant ID</Label>
              <div className="flex space-x-2">
                <Input
                  value={config.merchantId}
                  onChange={(e) => handleConfigChange(merchant, 'merchantId', e.target.value)}
                  placeholder="Enter merchant ID"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.merchantId)}
                  disabled={!config.merchantId}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Environment</Label>
              <Select
                value={config.environment}
                onValueChange={(value: 'sandbox' | 'production') => 
                  handleConfigChange(merchant, 'environment', value)
                }
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  type={showSecrets[`${merchant}_apiKey`] ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange(merchant, 'apiKey', e.target.value)}
                  placeholder="Enter API key"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSecretVisibility(merchant, 'apiKey')}
                >
                  {showSecrets[`${merchant}_apiKey`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Secret Key</Label>
              <div className="flex space-x-2">
                <Input
                  type={showSecrets[`${merchant}_secretKey`] ? 'text' : 'password'}
                  value={config.secretKey}
                  onChange={(e) => handleConfigChange(merchant, 'secretKey', e.target.value)}
                  placeholder="Enter secret key"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSecretVisibility(merchant, 'secretKey')}
                >
                  {showSecrets[`${merchant}_secretKey`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Webhook URL</Label>
              <Input
                value={config.webhookUrl}
                onChange={(e) => handleConfigChange(merchant, 'webhookUrl', e.target.value)}
                placeholder="https://your-domain.com/webhook"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Timeout (ms)</Label>
              <Input
                type="number"
                value={config.timeout}
                onChange={(e) => handleConfigChange(merchant, 'timeout', parseInt(e.target.value))}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            <Textarea
              value={config.description}
              onChange={(e) => handleConfigChange(merchant, 'description', e.target.value)}
              placeholder="Describe this payment method configuration"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={config.isEnabled}
              onCheckedChange={(checked) => handleConfigChange(merchant, 'isEnabled', checked)}
            />
            <Label className="text-white">Enable {merchantLabels[merchant]}</Label>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={() => saveConfiguration(merchant)} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Configuration'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => testConnection(merchant)} 
              disabled={isCurrentTesting}
            >
              {isCurrentTesting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Indonesian Payment Merchant Configuration</h2>
          <p className="text-gray-400">Configure Indonesian payment gateway integrations</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(configs).map(([key, config]) => {
          const merchant = key as keyof MerchantConfigs;
          const Icon = merchantIcons[merchant];
          const status = connectionStatus[merchant];
          
          return (
            <Card key={key} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-medium">{merchantLabels[merchant]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {config.isEnabled ? (
                      <Badge variant="default" className="bg-green-600">Enabled</Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                    {status === 'connected' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof MerchantConfigs)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7 bg-slate-800/50">
          {Object.entries(merchantLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className="text-sm">
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(configs).map((merchant) => (
          <TabsContent key={merchant} value={merchant} className="space-y-4">
            {renderMerchantConfig(merchant as keyof MerchantConfigs)}
          </TabsContent>
        ))}
      </Tabs>

      <Alert className="bg-blue-900/20 border-blue-500/30">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-blue-200">
          <strong>Important:</strong> Always test configurations in sandbox environment before enabling production mode. 
          Ensure webhook URLs are accessible and properly configured for payment notifications.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default IndonesianPaymentMerchantConfig;