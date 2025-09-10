import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Globe, 
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Copy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

interface ApiSetting {
  id: string;
  api_name: string;
  api_key: string;
  api_endpoint: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ApiSettings = () => {
  const [apiSettings, setApiSettings] = useState<ApiSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<ApiSetting | null>(null);
  const [formData, setFormData] = useState({
    api_name: '',
    api_key: '',
    api_endpoint: '',
    description: '',
    is_active: true
  });
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadApiSettings();
  }, []);

  const loadApiSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('api_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiSettings(data || []);
    } catch (error) {
      showError('Error', 'Failed to load API settings');
      console.error('Error loading API settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from('api_settings')
          .update(formData)
          .eq('id', editingSetting.id);

        if (error) throw error;
        showSuccess('Success', 'API setting updated successfully');
      } else {
        // Create new setting
        const { error } = await supabase
          .from('api_settings')
          .insert([formData]);

        if (error) throw error;
        showSuccess('Success', 'API setting created successfully');
      }

      loadApiSettings();
      resetForm();
      setIsAddDialogOpen(false);
      setEditingSetting(null);
    } catch (error) {
      showError('Error', 'Failed to save API setting');
      console.error('Error saving API setting:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API setting?')) return;

    try {
      const { error } = await supabase
        .from('api_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setApiSettings(apiSettings.filter(setting => setting.id !== id));
      showSuccess('Success', 'API setting deleted successfully');
    } catch (error) {
      showError('Error', 'Failed to delete API setting');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('api_settings')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      setApiSettings(apiSettings.map(setting => 
        setting.id === id ? { ...setting, is_active: isActive } : setting
      ));
      showSuccess('Success', `API setting ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      showError('Error', 'Failed to update API setting');
    }
  };

  const resetForm = () => {
    setFormData({
      api_name: '',
      api_key: '',
      api_endpoint: '',
      description: '',
      is_active: true
    });
  };

  const handleEdit = (setting: ApiSetting) => {
    setEditingSetting(setting);
    setFormData({
      api_name: setting.api_name,
      api_key: setting.api_key,
      api_endpoint: setting.api_endpoint,
      description: setting.description,
      is_active: setting.is_active
    });
    setIsAddDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied', 'Copied to clipboard');
  };

  const maskApiKey = (apiKey: string) => {
    if (!apiKey || apiKey.length <= 8) return apiKey || '';
    return apiKey.substring(0, 4) + '***' + apiKey.substring(apiKey.length - 4);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            API Settings
          </h2>
          <p className="text-muted-foreground">Manage external API configurations and keys</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setEditingSetting(null);
            setIsAddDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add API Setting
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total APIs</span>
            </div>
            <div className="text-2xl font-bold mt-2">{apiSettings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {apiSettings.filter(s => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Inactive</span>
            </div>
            <div className="text-2xl font-bold mt-2">
              {apiSettings.filter(s => !s.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings">API Settings</TabsTrigger>
          <TabsTrigger value="monitoring">API Monitoring</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Manage external API endpoints and authentication</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading API settings...</div>
              ) : apiSettings.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No API Settings</h3>
                  <p className="text-muted-foreground mb-4">Get started by adding your first API configuration</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add API Setting
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiSettings.map((setting) => (
                    <Card key={setting.id} className="relative">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Globe className="h-5 w-5 text-blue-500" />
                              <h3 className="text-lg font-semibold">{setting.api_name}</h3>
                            </div>
                            <Badge variant={setting.is_active ? "default" : "secondary"}>
                              {setting.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={setting.is_active}
                              onCheckedChange={(checked) => handleToggleActive(setting.id, checked)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(setting)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(setting.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Endpoint</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-sm bg-muted px-2 py-1 rounded flex-1 truncate">
                                {setting.api_endpoint}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(setting.api_endpoint)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">API Key</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                                {maskApiKey(setting.api_key)}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(setting.api_key)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {setting.description && (
                          <div className="mt-4">
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Monitoring</CardTitle>
              <CardDescription>Monitor API usage, response times, and errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">API Monitoring Dashboard</h3>
                <p className="text-muted-foreground">
                  Real-time API performance monitoring and usage analytics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Security</CardTitle>
              <CardDescription>Security settings and access controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Security Controls</h3>
                <p className="text-muted-foreground">
                  API security settings, rate limiting, and access controls
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSetting ? 'Edit API Setting' : 'Add API Setting'}
            </DialogTitle>
            <DialogDescription>
              Configure external API connection and authentication
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="api_name">API Name</Label>
                <Input
                  id="api_name"
                  value={formData.api_name}
                  onChange={(e) => setFormData({...formData, api_name: e.target.value})}
                  placeholder="e.g., OpenAI API"
                  required
                />
              </div>
              <div>
                <Label htmlFor="api_endpoint">API Endpoint</Label>
                <Input
                  id="api_endpoint"
                  value={formData.api_endpoint}
                  onChange={(e) => setFormData({...formData, api_endpoint: e.target.value})}
                  placeholder="https://api.example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                placeholder="Enter API key"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description of this API and its usage"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">Enable this API setting</Label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingSetting ? 'Update' : 'Create'} API Setting
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiSettings;