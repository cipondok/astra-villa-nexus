
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Send, CheckCircle, AlertCircle, Settings, RefreshCw } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: 'none' | 'tls' | 'ssl';
  from_email: string;
  from_name: string;
  enabled: boolean;
}

const SMTPSettings = () => {
  const [config, setConfig] = useState<SMTPConfig>({
    host: '',
    port: 587,
    username: '',
    password: '',
    encryption: 'tls',
    from_email: '',
    from_name: 'Astra Villa',
    enabled: false
  });
  
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('SMTP Test Email');
  const [testMessage, setTestMessage] = useState('This is a test email to verify SMTP configuration.');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState('');

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch SMTP settings
  const { data: smtpSettings, isLoading, refetch } = useQuery({
    queryKey: ['smtp-settings'],
    queryFn: async () => {
      console.log('Fetching SMTP settings...');
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'smtp');
      
      if (error) {
        console.error('Error fetching SMTP settings:', error);
        throw new Error(`Failed to fetch SMTP settings: ${error.message}`);
      }
      
      console.log('Fetched SMTP settings:', data?.length || 0, 'settings');
      return data || [];
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Load settings from database
  useEffect(() => {
    if (smtpSettings && smtpSettings.length > 0) {
      const loadedConfig = { ...config };
      
      smtpSettings.forEach((setting: any) => {
        try {
          const key = setting.key.replace('smtp_', '') as keyof SMTPConfig;
          if (key in loadedConfig) {
            let value = setting.value;
            if (typeof setting.value === 'object' && setting.value?.value !== undefined) {
              value = setting.value.value;
            }
            
            // Handle type conversions
            if (key === 'port') {
              (loadedConfig as any)[key] = parseInt(value) || 587;
            } else if (key === 'enabled') {
              (loadedConfig as any)[key] = Boolean(value);
            } else {
              (loadedConfig as any)[key] = value || '';
            }
          }
        } catch (error) {
          console.error('Error processing SMTP setting:', setting.key, error);
        }
      });
      
      setConfig(loadedConfig);
    }
  }, [smtpSettings]);

  // Save SMTP configuration
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: SMTPConfig) => {
      console.log('Saving SMTP configuration...');
      
      const settingsToSave = [
        { key: 'smtp_host', value: configData.host, description: 'SMTP server hostname' },
        { key: 'smtp_port', value: configData.port, description: 'SMTP server port' },
        { key: 'smtp_username', value: configData.username, description: 'SMTP authentication username' },
        { key: 'smtp_password', value: configData.password, description: 'SMTP authentication password' },
        { key: 'smtp_encryption', value: configData.encryption, description: 'SMTP encryption method' },
        { key: 'smtp_from_email', value: configData.from_email, description: 'Default sender email address' },
        { key: 'smtp_from_name', value: configData.from_name, description: 'Default sender name' },
        { key: 'smtp_enabled', value: configData.enabled, description: 'Enable/disable SMTP email sending' }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: setting.key,
            value: setting.value,
            category: 'smtp',
            description: setting.description
          }, { 
            onConflict: 'key',
            ignoreDuplicates: false 
          });
        
        if (error) {
          throw new Error(`Failed to save ${setting.key}: ${error.message}`);
        }
      }
      
      return configData;
    },
    onSuccess: () => {
      showSuccess("Configuration Saved", "SMTP settings have been saved successfully.");
      queryClient.invalidateQueries({ queryKey: ['smtp-settings'] });
    },
    onError: (error: any) => {
      showError("Save Failed", `Failed to save SMTP configuration: ${error.message}`);
    },
  });

  // Test SMTP connection
  const testSMTPMutation = useMutation({
    mutationFn: async ({ email, subject, message }: { email: string; subject: string; message: string }) => {
      console.log('Testing SMTP connection...');
      setTestStatus('sending');
      
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: {
          smtp_config: config,
          test_email: {
            to: email,
            subject: subject,
            message: message
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data) => {
      setTestStatus('success');
      setTestResult('Test email sent successfully!');
      showSuccess("Test Successful", "SMTP test email sent successfully.");
    },
    onError: (error: any) => {
      setTestStatus('error');
      setTestResult(`Test failed: ${error.message}`);
      showError("Test Failed", `SMTP test failed: ${error.message}`);
    },
  });

  const handleConfigSave = () => {
    saveConfigMutation.mutate(config);
  };

  const handleSMTPTest = () => {
    if (!testEmail) {
      showError("Validation Error", "Please enter a test email address.");
      return;
    }
    
    testSMTPMutation.mutate({
      email: testEmail,
      subject: testSubject,
      message: testMessage
    });
  };

  const handleConfigChange = (field: keyof SMTPConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="glass-ios">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                SMTP Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for email delivery
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-center py-8">Loading SMTP settings...</div>
          ) : (
            <>
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="font-medium">Enable SMTP</Label>
                  <p className="text-sm text-muted-foreground">Enable SMTP email delivery</p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
                />
              </div>

              {/* Server Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Server Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp_host">SMTP Host</Label>
                    <Input
                      id="smtp_host"
                      placeholder="smtp.gmail.com"
                      value={config.host}
                      onChange={(e) => handleConfigChange('host', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_port">Port</Label>
                    <Input
                      id="smtp_port"
                      type="number"
                      placeholder="587"
                      value={config.port}
                      onChange={(e) => handleConfigChange('port', parseInt(e.target.value) || 587)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_encryption">Encryption</Label>
                    <Select value={config.encryption} onValueChange={(value) => handleConfigChange('encryption', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Authentication */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Authentication</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp_username">Username</Label>
                    <Input
                      id="smtp_username"
                      placeholder="your-email@gmail.com"
                      value={config.username}
                      onChange={(e) => handleConfigChange('username', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_password">Password</Label>
                    <Input
                      id="smtp_password"
                      type="password"
                      placeholder="App password or email password"
                      value={config.password}
                      onChange={(e) => handleConfigChange('password', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Sender Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sender Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp_from_email">From Email</Label>
                    <Input
                      id="smtp_from_email"
                      placeholder="noreply@astravilla.com"
                      value={config.from_email}
                      onChange={(e) => handleConfigChange('from_email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp_from_name">From Name</Label>
                    <Input
                      id="smtp_from_name"
                      placeholder="Astra Villa"
                      value={config.from_name}
                      onChange={(e) => handleConfigChange('from_name', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Save Configuration */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleConfigSave}
                  disabled={saveConfigMutation.isPending}
                  className="btn-ios btn-primary-ios"
                >
                  {saveConfigMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMTP Test */}
      <Card className="glass-ios">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test SMTP Connection
          </CardTitle>
          <CardDescription>
            Send a test email to verify your SMTP configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test_email">Test Email Address</Label>
            <Input
              id="test_email"
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="test_subject">Subject</Label>
            <Input
              id="test_subject"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="test_message">Message</Label>
            <Textarea
              id="test_message"
              rows={4}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
            />
          </div>

          {/* Test Status */}
          {testStatus !== 'idle' && (
            <Alert className={`${
              testStatus === 'success' ? 'border-green-200 bg-green-50' : 
              testStatus === 'error' ? 'border-red-200 bg-red-50' : 
              'border-blue-200 bg-blue-50'
            }`}>
              {testStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : testStatus === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              )}
              <AlertDescription className={
                testStatus === 'success' ? 'text-green-800' : 
                testStatus === 'error' ? 'text-red-800' : 
                'text-blue-800'
              }>
                {testResult || 'Sending test email...'}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleSMTPTest}
              disabled={testSMTPMutation.isPending || !config.enabled}
              variant="outline"
              className="btn-ios"
            >
              {testSMTPMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Test Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMTPSettings;
