
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { Globe, Settings, Palette, Mail, Bell, Shield } from 'lucide-react';

const WebSettingsControl = () => {
  const [settings, setSettings] = useState({
    siteName: 'Property Platform',
    siteDescription: 'Your trusted property platform...',
    contactEmail: 'admin@yoursite.com',
    contactPhone: '+62 21 1234 5678',
    maintenanceMode: false,
    userRegistration: true,
    propertySubmission: true,
    commentsSystem: true,
    defaultLanguage: 'en',
    primaryColor: '#3B82F6',
    darkModeAvailable: true,
    fontFamily: 'inter',
    sidebarNavigation: true,
    breadcrumbs: true,
    footerVisible: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    adminAlerts: true,
    googleAnalyticsId: '',
    facebookPixelId: '',
    whatsappNumber: '',
    mapsApiKey: '',
    paymentGateway: 'midtrans'
  });

  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'web_settings');
      
      if (error) throw error;

      if (data && data.length > 0) {
        const settingsObj = data.reduce((acc, setting) => {
          // Handle boolean values
          if (typeof setting.value === 'object' && setting.value !== null) {
            acc[setting.key] = setting.value.value;
          } else {
            acc[setting.key] = setting.value;
          }
          return acc;
        }, {});
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Error', 'Failed to load web settings');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key,
            value,
            category: 'web_settings',
            description: `Web setting for ${key}`,
            is_public: false
          });
        
        if (error) throw error;
      }

      showSuccess('Settings Saved', 'Web settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Error', 'Failed to save web settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Web Settings Control</h2>
          <p className="text-gray-600">Global website settings and configuration</p>
        </div>
        <Button onClick={saveSettings} disabled={loading}>
          <Settings className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Site Name</label>
                  <Input 
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    placeholder="Property Platform" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Site Description</label>
                  <Textarea 
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    placeholder="Your trusted property platform..." 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Contact Email</label>
                  <Input 
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    placeholder="admin@yoursite.com" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input 
                    value={settings.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="+62 21 1234 5678" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Maintenance Mode</span>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleInputChange('maintenanceMode', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>User Registration</span>
                  <Switch 
                    checked={settings.userRegistration}
                    onCheckedChange={(checked) => handleInputChange('userRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Property Submission</span>
                  <Switch 
                    checked={settings.propertySubmission}
                    onCheckedChange={(checked) => handleInputChange('propertySubmission', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Comments System</span>
                  <Switch 
                    checked={settings.commentsSystem}
                    onCheckedChange={(checked) => handleInputChange('commentsSystem', checked)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Default Language</label>
                  <Select 
                    value={settings.defaultLanguage}
                    onValueChange={(value) => handleInputChange('defaultLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="id">Indonesian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2 mt-2">
                    {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B'].map((color) => (
                      <div 
                        key={color} 
                        className={`w-8 h-8 rounded cursor-pointer border-2 ${settings.primaryColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                        style={{backgroundColor: color}}
                        onClick={() => handleInputChange('primaryColor', color)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Dark Mode Available</span>
                  <Switch 
                    checked={settings.darkModeAvailable}
                    onCheckedChange={(checked) => handleInputChange('darkModeAvailable', checked)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Font Family</label>
                  <Select 
                    value={settings.fontFamily}
                    onValueChange={(value) => handleInputChange('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Sidebar Navigation</span>
                  <Switch 
                    checked={settings.sidebarNavigation}
                    onCheckedChange={(checked) => handleInputChange('sidebarNavigation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Breadcrumbs</span>
                  <Switch 
                    checked={settings.breadcrumbs}
                    onCheckedChange={(checked) => handleInputChange('breadcrumbs', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Footer Visible</span>
                  <Switch 
                    checked={settings.footerVisible}
                    onCheckedChange={(checked) => handleInputChange('footerVisible', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Email Notifications</span>
                <Switch 
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>SMS Notifications</span>
                <Switch 
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Push Notifications</span>
                <Switch 
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Admin Alerts</span>
                <Switch 
                  checked={settings.adminAlerts}
                  onCheckedChange={(checked) => handleInputChange('adminAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Third-party Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Google Analytics ID</label>
                  <Input 
                    value={settings.googleAnalyticsId}
                    onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                    placeholder="GA-XXXXXXXXX" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Facebook Pixel ID</label>
                  <Input 
                    value={settings.facebookPixelId}
                    onChange={(e) => handleInputChange('facebookPixelId', e.target.value)}
                    placeholder="Facebook Pixel ID" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">WhatsApp Number</label>
                  <Input 
                    value={settings.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    placeholder="+62 812 3456 7890" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Maps API Key</label>
                  <Input 
                    value={settings.mapsApiKey}
                    onChange={(e) => handleInputChange('mapsApiKey', e.target.value)}
                    placeholder="Google Maps API Key" 
                    type="password" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Gateway</label>
                  <Select 
                    value={settings.paymentGateway}
                    onValueChange={(value) => handleInputChange('paymentGateway', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midtrans">Midtrans</SelectItem>
                      <SelectItem value="xendit">Xendit</SelectItem>
                      <SelectItem value="gopay">GoPay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebSettingsControl;
