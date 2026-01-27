import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Globe, 
  Settings, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

const text = {
  en: {
    title: "Payment Gateway Settings",
    subtitle: "Configure Midtrans and PayPal payment integrations",
    midtrans: "Midtrans",
    paypal: "PayPal",
    enabled: "Enabled",
    disabled: "Disabled",
    serverKey: "Server Key",
    clientKey: "Client Key",
    clientId: "Client ID",
    clientSecret: "Client Secret",
    productionMode: "Production Mode",
    sandboxMode: "Sandbox Mode",
    save: "Save Settings",
    saving: "Saving...",
    testConnection: "Test Connection",
    testing: "Testing...",
    connected: "Connected",
    notConfigured: "Not Configured",
    midtransDesc: "Indonesian local payments: GoPay, OVO, DANA, Bank Transfer, QRIS",
    paypalDesc: "International payments: PayPal, Credit/Debit Cards",
    showKey: "Show",
    hideKey: "Hide"
  },
  id: {
    title: "Pengaturan Payment Gateway",
    subtitle: "Konfigurasi integrasi pembayaran Midtrans dan PayPal",
    midtrans: "Midtrans",
    paypal: "PayPal",
    enabled: "Aktif",
    disabled: "Nonaktif",
    serverKey: "Server Key",
    clientKey: "Client Key",
    clientId: "Client ID",
    clientSecret: "Client Secret",
    productionMode: "Mode Produksi",
    sandboxMode: "Mode Sandbox",
    save: "Simpan Pengaturan",
    saving: "Menyimpan...",
    testConnection: "Tes Koneksi",
    testing: "Menguji...",
    connected: "Terhubung",
    notConfigured: "Belum Dikonfigurasi",
    midtransDesc: "Pembayaran lokal Indonesia: GoPay, OVO, DANA, Transfer Bank, QRIS",
    paypalDesc: "Pembayaran internasional: PayPal, Kartu Kredit/Debit",
    showKey: "Tampilkan",
    hideKey: "Sembunyikan"
  }
};

interface GatewayConfig {
  midtrans: {
    enabled: boolean;
    serverKey: string;
    clientKey: string;
    isProduction: boolean;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    isProduction: boolean;
  };
}

const PaymentGatewaySettings = () => {
  const { language } = useLanguage();
  const t = text[language];
  
  const [config, setConfig] = useState<GatewayConfig>({
    midtrans: { enabled: false, serverKey: '', clientKey: '', isProduction: false },
    paypal: { enabled: false, clientId: '', clientSecret: '', isProduction: false },
  });
  
  const [showKeys, setShowKeys] = useState({
    midtransServer: false,
    midtransClient: false,
    paypalId: false,
    paypalSecret: false,
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState<'midtrans' | 'paypal' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState({
    midtrans: false,
    paypal: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .in('api_name', ['midtrans', 'paypal']);

      if (error) throw error;

      const newConfig = { ...config };
      
      data?.forEach((setting) => {
        if (setting.api_name === 'midtrans') {
          newConfig.midtrans = {
            enabled: setting.is_active || false,
            serverKey: setting.api_key || '',
            clientKey: setting.api_endpoint || '', // Using api_endpoint for client key
            isProduction: setting.description?.includes('production') || false,
          };
          setConnectionStatus(prev => ({ ...prev, midtrans: !!setting.api_key }));
        } else if (setting.api_name === 'paypal') {
          newConfig.paypal = {
            enabled: setting.is_active || false,
            clientId: setting.api_key || '',
            clientSecret: setting.api_endpoint || '', // Using api_endpoint for secret
            isProduction: setting.description?.includes('production') || false,
          };
          setConnectionStatus(prev => ({ ...prev, paypal: !!setting.api_key }));
        }
      });

      setConfig(newConfig);
    } catch (error) {
      console.error('Error loading payment settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Save Midtrans settings
      await supabase.from('api_settings').upsert({
        api_name: 'midtrans',
        api_key: config.midtrans.serverKey,
        api_endpoint: config.midtrans.clientKey,
        is_active: config.midtrans.enabled,
        description: config.midtrans.isProduction ? 'production' : 'sandbox',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'api_name' });

      // Save PayPal settings
      await supabase.from('api_settings').upsert({
        api_name: 'paypal',
        api_key: config.paypal.clientId,
        api_endpoint: config.paypal.clientSecret,
        is_active: config.paypal.enabled,
        description: config.paypal.isProduction ? 'production' : 'sandbox',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'api_name' });

      toast.success('Payment settings saved successfully');
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error('Failed to save payment settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async (gateway: 'midtrans' | 'paypal') => {
    setIsTesting(gateway);
    
    try {
      if (gateway === 'paypal') {
        const { data, error } = await supabase.functions.invoke('paypal-payment', {
          body: { action: 'test_connection' },
        });
        
        if (error) throw error;
        setConnectionStatus(prev => ({ ...prev, paypal: true }));
        toast.success('PayPal connection successful');
      } else {
        // Test Midtrans
        const { data, error } = await supabase.functions.invoke('midtrans-payment', {
          body: { action: 'check_status', order_id: 'test-connection' },
        });
        
        setConnectionStatus(prev => ({ ...prev, midtrans: true }));
        toast.success('Midtrans connection successful');
      }
    } catch (error: any) {
      toast.error(`Connection test failed: ${error.message}`);
    } finally {
      setIsTesting(null);
    }
  };

  const maskKey = (key: string) => {
    if (!key || key.length < 8) return '••••••••';
    return `••••-••••-••••-${key.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{t.title}</CardTitle>
              <CardDescription>{t.subtitle}</CardDescription>
            </div>
          </div>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? t.saving : t.save}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="midtrans" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="midtrans" className="gap-2">
              <Settings className="h-4 w-4" />
              {t.midtrans}
              {connectionStatus.midtrans ? (
                <Badge variant="default" className="ml-2 text-xs">{t.connected}</Badge>
              ) : (
                <Badge variant="secondary" className="ml-2 text-xs">{t.notConfigured}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="paypal" className="gap-2">
              <Globe className="h-4 w-4" />
              {t.paypal}
              {connectionStatus.paypal ? (
                <Badge variant="default" className="ml-2 text-xs">{t.connected}</Badge>
              ) : (
                <Badge variant="secondary" className="ml-2 text-xs">{t.notConfigured}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Midtrans Settings */}
          <TabsContent value="midtrans" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{t.midtransDesc}</p>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="midtrans-enabled">{t.midtrans}</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="midtrans-enabled"
                  checked={config.midtrans.enabled}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, midtrans: { ...prev.midtrans, enabled: checked } }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {config.midtrans.enabled ? t.enabled : t.disabled}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="midtrans-server-key">{t.serverKey}</Label>
                <div className="flex gap-2">
                  <Input
                    id="midtrans-server-key"
                    type={showKeys.midtransServer ? 'text' : 'password'}
                    value={showKeys.midtransServer ? config.midtrans.serverKey : maskKey(config.midtrans.serverKey)}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, midtrans: { ...prev.midtrans, serverKey: e.target.value } }))
                    }
                    placeholder="SB-Mid-server-xxx..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKeys(prev => ({ ...prev, midtransServer: !prev.midtransServer }))}
                  >
                    {showKeys.midtransServer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="midtrans-client-key">{t.clientKey}</Label>
                <div className="flex gap-2">
                  <Input
                    id="midtrans-client-key"
                    type={showKeys.midtransClient ? 'text' : 'password'}
                    value={showKeys.midtransClient ? config.midtrans.clientKey : maskKey(config.midtrans.clientKey)}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, midtrans: { ...prev.midtrans, clientKey: e.target.value } }))
                    }
                    placeholder="SB-Mid-client-xxx..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKeys(prev => ({ ...prev, midtransClient: !prev.midtransClient }))}
                  >
                    {showKeys.midtransClient ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="midtrans-production">{t.productionMode}</Label>
              <Switch
                id="midtrans-production"
                checked={config.midtrans.isProduction}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, midtrans: { ...prev.midtrans, isProduction: checked } }))
                }
              />
            </div>

            <Button 
              variant="outline" 
              onClick={() => testConnection('midtrans')}
              disabled={isTesting === 'midtrans'}
            >
              {isTesting === 'midtrans' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : connectionStatus.midtrans ? (
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {isTesting === 'midtrans' ? t.testing : t.testConnection}
            </Button>
          </TabsContent>

          {/* PayPal Settings */}
          <TabsContent value="paypal" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{t.paypalDesc}</p>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="paypal-enabled">{t.paypal}</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="paypal-enabled"
                  checked={config.paypal.enabled}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, paypal: { ...prev.paypal, enabled: checked } }))
                  }
                />
                <span className="text-sm text-muted-foreground">
                  {config.paypal.enabled ? t.enabled : t.disabled}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="paypal-client-id">{t.clientId}</Label>
                <div className="flex gap-2">
                  <Input
                    id="paypal-client-id"
                    type={showKeys.paypalId ? 'text' : 'password'}
                    value={showKeys.paypalId ? config.paypal.clientId : maskKey(config.paypal.clientId)}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, paypal: { ...prev.paypal, clientId: e.target.value } }))
                    }
                    placeholder="AYSxxxxx..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKeys(prev => ({ ...prev, paypalId: !prev.paypalId }))}
                  >
                    {showKeys.paypalId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypal-client-secret">{t.clientSecret}</Label>
                <div className="flex gap-2">
                  <Input
                    id="paypal-client-secret"
                    type={showKeys.paypalSecret ? 'text' : 'password'}
                    value={showKeys.paypalSecret ? config.paypal.clientSecret : maskKey(config.paypal.clientSecret)}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, paypal: { ...prev.paypal, clientSecret: e.target.value } }))
                    }
                    placeholder="ELxxxxx..."
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowKeys(prev => ({ ...prev, paypalSecret: !prev.paypalSecret }))}
                  >
                    {showKeys.paypalSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="paypal-production">{t.productionMode}</Label>
              <Switch
                id="paypal-production"
                checked={config.paypal.isProduction}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, paypal: { ...prev.paypal, isProduction: checked } }))
                }
              />
            </div>

            <Button 
              variant="outline" 
              onClick={() => testConnection('paypal')}
              disabled={isTesting === 'paypal'}
            >
              {isTesting === 'paypal' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : connectionStatus.paypal ? (
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {isTesting === 'paypal' ? t.testing : t.testConnection}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PaymentGatewaySettings;
