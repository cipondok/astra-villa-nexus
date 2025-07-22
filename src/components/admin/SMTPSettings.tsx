import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Shield, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SMTPSettings = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

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

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "SMTP configuration has been updated successfully.",
    });
  };

  const testConnection = async () => {
    setIsTesting(true);
    // Simulate test
    setTimeout(() => {
      setIsTesting(false);
      setIsConnected(true);
      toast({
        title: "Connection Successful",
        description: "SMTP server is reachable and credentials are valid.",
      });
    }, 2000);
  };

  const sendTestEmail = () => {
    toast({
      title: "Test Email Sent",
      description: "A test email has been sent to verify the configuration.",
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
          <Mail className="w-6 h-6" />
          SMTP Configuration
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Configure email server settings for system notifications
        </p>
      </div>

      <div className="space-y-6">
        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Connection Status</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Not Connected
                  </>
                )}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Last Test</p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 'Just now' : 'Never tested'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email Status</p>
                <p className="text-sm text-muted-foreground">
                  {settings.isEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMTP Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Server Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="host">SMTP Host</Label>
                <Input
                  id="host"
                  placeholder="smtp.gmail.com"
                  value={settings.host}
                  onChange={(e) => setSettings({...settings, host: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="587"
                  value={settings.port}
                  onChange={(e) => setSettings({...settings, port: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="encryption">Encryption</Label>
              <Select value={settings.encryption} onValueChange={(value) => setSettings({...settings, encryption: value})}>
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

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="your-email@gmail.com"
                  value={settings.username}
                  onChange={(e) => setSettings({...settings, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={settings.password}
                  onChange={(e) => setSettings({...settings, password: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sender Information */}
        <Card>
          <CardHeader>
            <CardTitle>Sender Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  placeholder="Your Company Name"
                  value={settings.fromName}
                  onChange={(e) => setSettings({...settings, fromName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input
                  id="fromEmail"
                  type="email"
                  placeholder="noreply@yourcompany.com"
                  value={settings.fromEmail}
                  onChange={(e) => setSettings({...settings, fromEmail: e.target.value})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-enabled">Enable Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Turn on/off all outgoing emails from the system
                </p>
              </div>
              <Switch
                id="email-enabled"
                checked={settings.isEnabled}
                onCheckedChange={(checked) => setSettings({...settings, isEnabled: checked})}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1 sm:flex-none">
                Save Configuration
              </Button>
              <Button 
                variant="outline" 
                onClick={testConnection}
                disabled={isTesting}
                className="flex-1 sm:flex-none"
              >
                <Shield className="w-4 h-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button 
                variant="outline" 
                onClick={sendTestEmail}
                disabled={!isConnected}
                className="flex-1 sm:flex-none"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SMTPSettings;