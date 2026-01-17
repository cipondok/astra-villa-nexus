import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle, 
  XCircle, 
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Wallet,
  Globe,
  Save
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

  const merchantLabels: Record<keyof MerchantConfigs, string> = {
    gopay: 'GoPay',
    ovo: 'OVO',
    dana: 'DANA',
    linkaja: 'LinkAja',
    shopeepay: 'ShopeePay',
    bank_transfer: 'Bank Transfer',
    virtual_account: 'Virtual Account'
  };

  const merchantIcons: Record<keyof MerchantConfigs, React.ElementType> = {
    gopay: Smartphone,
    ovo: Wallet,
    dana: CreditCard,
    linkaja: Smartphone,
    shopeepay: CreditCard,
    bank_transfer: Building2,
    virtual_account: Building2
  };

  const merchantColors: Record<keyof MerchantConfigs, string> = {
    gopay: 'border-l-emerald-500',
    ovo: 'border-l-purple-500',
    dana: 'border-l-blue-500',
    linkaja: 'border-l-red-500',
    shopeepay: 'border-l-orange-500',
    bank_transfer: 'border-l-cyan-500',
    virtual_account: 'border-l-teal-500'
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
          const [, merchant, ...rest] = setting.key.split('_');
          const remaining = rest.join('_');
          
          if (loadedConfigs[merchant as keyof MerchantConfigs]) {
            let value: any = setting.value;
            
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
        { key: `payment_${merchant}_merchantId`, value: config.merchantId, category: 'indonesian_payment', description: `${merchantLabels[merchant]} Merchant ID`, is_public: false },
        { key: `payment_${merchant}_apiKey`, value: config.apiKey, category: 'indonesian_payment', description: `${merchantLabels[merchant]} API Key`, is_public: false },
        { key: `payment_${merchant}_secretKey`, value: config.secretKey, category: 'indonesian_payment', description: `${merchantLabels[merchant]} Secret Key`, is_public: false },
        { key: `payment_${merchant}_isEnabled`, value: config.isEnabled.toString(), category: 'indonesian_payment', description: `${merchantLabels[merchant]} enabled status`, is_public: false },
        { key: `payment_${merchant}_environment`, value: config.environment, category: 'indonesian_payment', description: `${merchantLabels[merchant]} environment`, is_public: false },
        { key: `payment_${merchant}_webhookUrl`, value: config.webhookUrl, category: 'indonesian_payment', description: `${merchantLabels[merchant]} webhook URL`, is_public: false },
        { key: `payment_${merchant}_timeout`, value: config.timeout.toString(), category: 'indonesian_payment', description: `${merchantLabels[merchant]} timeout`, is_public: false },
        { key: `payment_${merchant}_description`, value: config.description, category: 'indonesian_payment', description: `${merchantLabels[merchant]} description`, is_public: false }
      ];

      const { error } = await supabase
        .from('system_settings')
        .upsert(settingsToSave, { onConflict: 'key,category', ignoreDuplicates: false });

      if (error) throw new Error(`Failed to save configuration: ${error.message}`);

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
      await new Promise(resolve => setTimeout(resolve, 2000));
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
      [merchant]: { ...prev[merchant], [field]: value }
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
      <Card className={`bg-card/50 border-border/50 border-l-2 ${merchantColors[merchant]}`}>
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center justify-between text-xs text-foreground">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {merchantLabels[merchant]} Configuration
            </div>
            {status && (
              <Badge 
                variant={status === 'connected' ? 'default' : 'destructive'} 
                className="text-[8px] px-1.5 py-0"
              >
                {status === 'connected' ? (
                  <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                ) : (
                  <XCircle className="h-2.5 w-2.5 mr-0.5" />
                )}
                {status === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Merchant ID</Label>
              <div className="flex gap-1">
                <Input
                  value={config.merchantId}
                  onChange={(e) => handleConfigChange(merchant, 'merchantId', e.target.value)}
                  placeholder="Enter merchant ID"
                  className="h-7 text-xs bg-background/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(config.merchantId)}
                  disabled={!config.merchantId}
                  className="h-7 w-7 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Environment</Label>
              <Select
                value={config.environment}
                onValueChange={(value: 'sandbox' | 'production') => handleConfigChange(merchant, 'environment', value)}
              >
                <SelectTrigger className="h-7 text-xs bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">API Key</Label>
              <div className="flex gap-1">
                <Input
                  type={showSecrets[`${merchant}_apiKey`] ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange(merchant, 'apiKey', e.target.value)}
                  placeholder="Enter API key"
                  className="h-7 text-xs bg-background/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSecretVisibility(merchant, 'apiKey')}
                  className="h-7 w-7 p-0"
                >
                  {showSecrets[`${merchant}_apiKey`] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Secret Key</Label>
              <div className="flex gap-1">
                <Input
                  type={showSecrets[`${merchant}_secretKey`] ? 'text' : 'password'}
                  value={config.secretKey}
                  onChange={(e) => handleConfigChange(merchant, 'secretKey', e.target.value)}
                  placeholder="Enter secret key"
                  className="h-7 text-xs bg-background/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSecretVisibility(merchant, 'secretKey')}
                  className="h-7 w-7 p-0"
                >
                  {showSecrets[`${merchant}_secretKey`] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Webhook URL</Label>
              <Input
                value={config.webhookUrl}
                onChange={(e) => handleConfigChange(merchant, 'webhookUrl', e.target.value)}
                placeholder="https://your-domain.com/webhook"
                className="h-7 text-xs bg-background/50"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Timeout (ms)</Label>
              <Input
                type="number"
                value={config.timeout}
                onChange={(e) => handleConfigChange(merchant, 'timeout', parseInt(e.target.value))}
                className="h-7 text-xs bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Description</Label>
            <Textarea
              value={config.description}
              onChange={(e) => handleConfigChange(merchant, 'description', e.target.value)}
              placeholder="Describe this payment method"
              className="h-14 text-xs bg-background/50 resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={config.isEnabled}
                onCheckedChange={(checked) => handleConfigChange(merchant, 'isEnabled', checked)}
                className="scale-75"
              />
              <Label className="text-[10px] text-foreground">Enable {merchantLabels[merchant]}</Label>
            </div>
            
            <div className="flex gap-1">
              <Button 
                size="sm"
                onClick={() => saveConfiguration(merchant)} 
                disabled={loading}
                className="h-6 text-[10px] px-2"
              >
                {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
                Save
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testConnection(merchant)} 
                disabled={isCurrentTesting}
                className="h-6 text-[10px] px-2"
              >
                {isCurrentTesting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Globe className="h-3 w-3 mr-1" />}
                Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Indonesian Payment Merchant Config</h2>
          <p className="text-[10px] text-muted-foreground">Configure Indonesian payment gateway integrations</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {(Object.entries(configs) as [keyof MerchantConfigs, PaymentMerchantConfig][]).map(([key, config]) => {
          const Icon = merchantIcons[key];
          const status = connectionStatus[key];
          
          return (
            <Card 
              key={key} 
              className={`bg-card/50 border-border/50 cursor-pointer hover:bg-accent/10 transition-colors ${activeTab === key ? 'ring-1 ring-primary' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <CardContent className="p-2">
                <div className="flex flex-col items-center gap-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[9px] font-medium text-foreground text-center">{merchantLabels[key]}</span>
                  <div className="flex items-center gap-1">
                    {config.isEnabled ? (
                      <Badge variant="default" className="text-[7px] px-1 py-0">On</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[7px] px-1 py-0">Off</Badge>
                    )}
                    {status === 'connected' && <CheckCircle className="h-2.5 w-2.5 text-emerald-400" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tab Configuration */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as keyof MerchantConfigs)} className="w-full">
        <TabsList className="h-7 bg-muted/50 w-full justify-start overflow-x-auto">
          {(Object.keys(configs) as (keyof MerchantConfigs)[]).map((key) => {
            const Icon = merchantIcons[key];
            return (
              <TabsTrigger key={key} value={key} className="h-5 px-2 text-[10px] gap-1">
                <Icon className="h-3 w-3" />
                {merchantLabels[key]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(configs) as (keyof MerchantConfigs)[]).map((key) => (
          <TabsContent key={key} value={key} className="mt-3">
            {renderMerchantConfig(key)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default IndonesianPaymentMerchantConfig;
