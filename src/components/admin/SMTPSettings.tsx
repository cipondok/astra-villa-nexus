import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Shield, AlertCircle, CheckCircle, Send, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SMTPSettings = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [settings, setSettings] = useState({
    host: '',
    port: '587',
    username: '',
    password: '',
    encryption: 'tls',
    fromName: '',
    fromEmail: '',
    isEnabled: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('category', 'smtp')
        .eq('key', 'config')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data?.value) setSettings(data.value as any);
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
      toast({ title: "Error", description: "Failed to load SMTP settings", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          category: 'smtp',
          key: 'config',
          value: settings,
          description: 'SMTP email configuration',
          is_public: false
        }, { onConflict: 'category,key' });

      if (error) throw error;
      toast({ title: "Settings Saved", description: "SMTP configuration updated successfully" });
    } catch (error) {
      console.error('Error saving SMTP settings:', error);
      toast({ title: "Error", description: "Failed to save SMTP settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: {
          smtp_config: {
            host: settings.host,
            port: parseInt(settings.port),
            username: settings.username,
            password: settings.password,
            encryption: settings.encryption,
            from_email: settings.fromEmail,
            from_name: settings.fromName,
            enabled: settings.isEnabled
          },
          test_email: {
            to: settings.username,
            subject: 'SMTP Test Email',
            message: 'This is a test email to verify your SMTP configuration.'
          }
        }
      });

      if (error) throw error;
      if (data?.success) {
        setIsConnected(true);
        toast({ title: "Connection Successful", description: "SMTP server is reachable" });
      }
    } catch (error) {
      console.error('SMTP test failed:', error);
      toast({ title: "Connection Failed", description: "Could not connect to SMTP server", variant: "destructive" });
    } finally {
      setIsTesting(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('generate-otp', {
        body: { purpose: 'email_verification', email: user.email }
      });

      if (error) throw error;
      toast({ title: "Test Email Sent", description: `Sent to ${user.email}` });
    } catch (error) {
      console.error('Test email failed:', error);
      toast({ title: "Failed to Send", description: "Check SMTP configuration", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="text-xs text-muted-foreground p-4">Loading SMTP settings...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" />
            SMTP Configuration
          </h2>
          <p className="text-[10px] text-muted-foreground">Configure email server settings</p>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"} className="text-[9px] px-1.5 py-0">
          {isConnected ? (
            <><CheckCircle className="h-2.5 w-2.5 mr-0.5" /> Connected</>
          ) : (
            <><AlertCircle className="h-2.5 w-2.5 mr-0.5" /> Not Connected</>
          )}
        </Badge>
      </div>

      {/* Connection Status */}
      <Card className="bg-card/50 border-border/50 border-l-2 border-l-blue-500">
        <CardContent className="p-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] text-muted-foreground">Last Test</p>
              <p className="text-xs font-medium text-foreground">{isConnected ? 'Just now' : 'Never'}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground">Status</p>
              <p className="text-xs font-medium text-foreground">{settings.isEnabled ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div>
              <p className="text-[9px] text-muted-foreground">Encryption</p>
              <p className="text-xs font-medium text-foreground uppercase">{settings.encryption}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Server Configuration */}
      <Card className="bg-card/50 border-border/50 border-l-2 border-l-emerald-500">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground">Server Configuration</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">SMTP Host</Label>
              <Input
                placeholder="smtp.gmail.com"
                value={settings.host}
                onChange={(e) => setSettings({...settings, host: e.target.value})}
                className="h-7 text-xs bg-background/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Port</Label>
              <Input
                placeholder="587"
                value={settings.port}
                onChange={(e) => setSettings({...settings, port: e.target.value})}
                className="h-7 text-xs bg-background/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Encryption</Label>
              <Select value={settings.encryption} onValueChange={(value) => setSettings({...settings, encryption: value})}>
                <SelectTrigger className="h-7 text-xs bg-background/50">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Username</Label>
              <Input
                type="email"
                placeholder="your-email@gmail.com"
                value={settings.username}
                onChange={(e) => setSettings({...settings, username: e.target.value})}
                className="h-7 text-xs bg-background/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={settings.password}
                onChange={(e) => setSettings({...settings, password: e.target.value})}
                className="h-7 text-xs bg-background/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sender Information */}
      <Card className="bg-card/50 border-border/50 border-l-2 border-l-purple-500">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground">Sender Information</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">From Name</Label>
              <Input
                placeholder="Your Company Name"
                value={settings.fromName}
                onChange={(e) => setSettings({...settings, fromName: e.target.value})}
                className="h-7 text-xs bg-background/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">From Email</Label>
              <Input
                type="email"
                placeholder="noreply@yourcompany.com"
                value={settings.fromEmail}
                onChange={(e) => setSettings({...settings, fromEmail: e.target.value})}
                className="h-7 text-xs bg-background/50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings & Actions */}
      <Card className="bg-card/50 border-border/50 border-l-2 border-l-orange-500">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground">Email Settings</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          <div className="flex items-center justify-between p-2 border border-border/50 rounded-md bg-background/30">
            <div>
              <Label className="text-[10px] font-medium text-foreground">Enable Email Notifications</Label>
              <p className="text-[9px] text-muted-foreground">Turn on/off all outgoing emails</p>
            </div>
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={(checked) => setSettings({...settings, isEnabled: checked})}
              className="scale-75"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-7 text-xs flex-1">
              <Save className="h-3 w-3 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" onClick={testConnection} disabled={isTesting} className="h-7 text-xs flex-1">
              <Shield className="h-3 w-3 mr-1" />
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
            <Button variant="outline" size="sm" onClick={sendTestEmail} disabled={!isConnected} className="h-7 text-xs flex-1">
              <Send className="h-3 w-3 mr-1" />
              Send Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMTPSettings;
