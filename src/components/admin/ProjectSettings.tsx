import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Globe, 
  Palette, 
  Shield, 
  Mail, 
  Database,
  Server,
  Code,
  Zap,
  Upload,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

interface ProjectConfig {
  project_name: string;
  project_description: string;
  company_name: string;
  company_address: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification_required: boolean;
  auto_approval: boolean;
  max_file_size: number;
  allowed_file_types: string[];
  session_timeout: number;
  password_complexity: boolean;
  two_factor_enabled: boolean;
}

const ProjectSettings = () => {
  const [config, setConfig] = useState<ProjectConfig>({
    project_name: '',
    project_description: '',
    company_name: '',
    company_address: '',
    contact_email: '',
    contact_phone: '',
    website_url: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
    accent_color: '#06b6d4',
    font_family: 'Inter',
    maintenance_mode: false,
    registration_enabled: true,
    email_verification_required: true,
    auto_approval: false,
    max_file_size: 10,
    allowed_file_types: ['jpg', 'png', 'pdf', 'doc', 'docx'],
    session_timeout: 30,
    password_complexity: true,
    two_factor_enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadProjectSettings();
  }, []);

  const loadProjectSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .eq('category', 'project');

      if (error) throw error;

      const settingsObj = data.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as any);

      // Merge with defaults
      setConfig(prevConfig => ({
        ...prevConfig,
        ...settingsObj
      }));
    } catch (error) {
      showError('Error', 'Failed to load project settings');
      console.error('Error loading project settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProjectSettings = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(config).map(([key, value]) => ({
        key,
        value,
        category: 'project'
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: update.key,
            value: update.value,
            category: update.category
          });

        if (error) throw error;
      }

      showSuccess('Success', 'Project settings saved successfully');
    } catch (error) {
      showError('Error', 'Failed to save project settings');
      console.error('Error saving project settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfigChange = (key: keyof ProjectConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const exportSettings = async () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'project-settings.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showSuccess('Success', 'Settings exported successfully');
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        setConfig(importedConfig);
        showSuccess('Success', 'Settings imported successfully');
      } catch (error) {
        showError('Error', 'Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Project Settings
          </h2>
          <p className="text-muted-foreground">Configure global project settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label htmlFor="import-settings" className="cursor-pointer">
            <Button variant="outline" asChild>
              <div>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </div>
            </Button>
            <input
              id="import-settings"
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
          </label>
          <Button onClick={saveProjectSettings} disabled={saving || loading}>
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="uploads">File Uploads</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Information
              </CardTitle>
              <CardDescription>Basic project and company information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Project Name</Label>
                  <Input
                    value={config.project_name}
                    onChange={(e) => handleConfigChange('project_name', e.target.value)}
                    placeholder="My Awesome Project"
                  />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={config.company_name}
                    onChange={(e) => handleConfigChange('company_name', e.target.value)}
                    placeholder="Your Company Ltd."
                  />
                </div>
              </div>
              
              <div>
                <Label>Project Description</Label>
                <Textarea
                  value={config.project_description}
                  onChange={(e) => handleConfigChange('project_description', e.target.value)}
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Company Address</Label>
                <Textarea
                  value={config.company_address}
                  onChange={(e) => handleConfigChange('company_address', e.target.value)}
                  placeholder="Your company address..."
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={config.contact_email}
                    onChange={(e) => handleConfigChange('contact_email', e.target.value)}
                    placeholder="contact@company.com"
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={config.contact_phone}
                    onChange={(e) => handleConfigChange('contact_phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <Label>Website URL</Label>
                  <Input
                    value={config.website_url}
                    onChange={(e) => handleConfigChange('website_url', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to prevent user access
                    </p>
                  </div>
                  <Switch
                    checked={config.maintenance_mode}
                    onCheckedChange={(checked) => handleConfigChange('maintenance_mode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Registration Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow new users to register accounts
                    </p>
                  </div>
                  <Switch
                    checked={config.registration_enabled}
                    onCheckedChange={(checked) => handleConfigChange('registration_enabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Identity
              </CardTitle>
              <CardDescription>Customize your project's visual identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Logo URL</Label>
                  <Input
                    value={config.logo_url}
                    onChange={(e) => handleConfigChange('logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div>
                  <Label>Favicon URL</Label>
                  <Input
                    value={config.favicon_url}
                    onChange={(e) => handleConfigChange('favicon_url', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => handleConfigChange('primary_color', e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={config.primary_color}
                      onChange={(e) => handleConfigChange('primary_color', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.secondary_color}
                      onChange={(e) => handleConfigChange('secondary_color', e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={config.secondary_color}
                      onChange={(e) => handleConfigChange('secondary_color', e.target.value)}
                      placeholder="#64748b"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.accent_color}
                      onChange={(e) => handleConfigChange('accent_color', e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      value={config.accent_color}
                      onChange={(e) => handleConfigChange('accent_color', e.target.value)}
                      placeholder="#06b6d4"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Font Family</Label>
                <Select value={config.font_family} onValueChange={(value) => handleConfigChange('font_family', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Email Verification Required</Label>
                    <p className="text-sm text-muted-foreground">
                      Require email verification for new registrations
                    </p>
                  </div>
                  <Switch
                    checked={config.email_verification_required}
                    onCheckedChange={(checked) => handleConfigChange('email_verification_required', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Auto Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve new user registrations
                    </p>
                  </div>
                  <Switch
                    checked={config.auto_approval}
                    onCheckedChange={(checked) => handleConfigChange('auto_approval', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Password Complexity</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforce strong password requirements
                    </p>
                  </div>
                  <Switch
                    checked={config.password_complexity}
                    onCheckedChange={(checked) => handleConfigChange('password_complexity', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable 2FA for enhanced security
                    </p>
                  </div>
                  <Switch
                    checked={config.two_factor_enabled}
                    onCheckedChange={(checked) => handleConfigChange('two_factor_enabled', checked)}
                  />
                </div>
              </div>
              
              <div>
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={config.session_timeout}
                  onChange={(e) => handleConfigChange('session_timeout', Number(e.target.value))}
                  placeholder="30"
                  min="5"
                  max="1440"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Automatic logout after inactivity (5-1440 minutes)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>File Upload Settings</CardTitle>
              <CardDescription>Configure file upload limits and allowed types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Maximum File Size (MB)</Label>
                <Input
                  type="number"
                  value={config.max_file_size}
                  onChange={(e) => handleConfigChange('max_file_size', Number(e.target.value))}
                  placeholder="10"
                  min="1"
                  max="100"
                />
              </div>
              
              <div>
                <Label>Allowed File Types</Label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                  {['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`file-${type}`}
                        checked={config.allowed_file_types.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...config.allowed_file_types, type]
                            : config.allowed_file_types.filter(t => t !== type);
                          handleConfigChange('allowed_file_types', newTypes);
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`file-${type}`} className="text-sm">
                        .{type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>Advanced system settings and performance options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
                <p className="text-muted-foreground">
                  Coming soon: Performance optimization, caching, and advanced configuration options
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectSettings;