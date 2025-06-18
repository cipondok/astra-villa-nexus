
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Save, RefreshCw, Check, X, Globe, TrendingUp, Tag } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

interface SEOSettingsState {
  // Global SEO
  site_title: string;
  site_description: string;
  site_keywords: string;
  canonical_url: string;
  
  // Social Media
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  
  // Analytics
  google_analytics_id: string;
  google_search_console_id: string;
  facebook_pixel_id: string;
  
  // Schema.org / Structured Data
  organization_name: string;
  organization_logo: string;
  organization_address: string;
  organization_phone: string;
  organization_email: string;
  
  // Technical SEO
  robots_txt: string;
  sitemap_enabled: boolean;
  breadcrumbs_enabled: boolean;
  schema_markup_enabled: boolean;
}

const SEOSettings = () => {
  const [settings, setSettings] = useState<SEOSettingsState>({
    // Global SEO
    site_title: "Astra Villa - Luxury Property Management with AI",
    site_description: "Astra Villa redefines luxury property management with AI-powered 3D tours, verified vendor ecosystems, and seamless booking. Experience smart homes, data-driven investments, and white-glove service.",
    site_keywords: "luxury property management, AI real estate, 3D villa tours, verified home services, smart home investments, vacation rental optimization",
    canonical_url: "https://astravilla.com",
    
    // Social Media
    og_title: "Astra Villa - Smart Luxury Property Management",
    og_description: "Discover villas in 3D before you tour IRL. AI-matched vendors, investment forecasts, and seamless bookings.",
    og_image: "/og-image.jpg",
    twitter_title: "Astra Villa - Future of Real Estate",
    twitter_description: "Revolutionizing property management with AI-driven analytics and verified vendor networks.",
    twitter_image: "/twitter-image.jpg",
    
    // Analytics
    google_analytics_id: "",
    google_search_console_id: "",
    facebook_pixel_id: "",
    
    // Schema.org
    organization_name: "Astra Villa",
    organization_logo: "/logo.png",
    organization_address: "",
    organization_phone: "",
    organization_email: "hello@astravilla.com",
    
    // Technical SEO
    robots_txt: `User-agent: *\nAllow: /\nSitemap: https://astravilla.com/sitemap.xml`,
    sitemap_enabled: true,
    breadcrumbs_enabled: true,
    schema_markup_enabled: true,
  });

  const [savingStates, setSavingStates] = useState<{[key: string]: 'idle' | 'saving' | 'success' | 'error'}>({});
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch SEO settings
  const { data: seoSettings, isLoading, refetch } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      try {
        console.log('Fetching SEO settings from database...');
        
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .eq('category', 'seo');
        
        if (error) {
          console.error('Error fetching SEO settings:', error);
          return [];
        }
        
        console.log('Fetched SEO settings:', data?.length || 0, 'settings');
        return data || [];
      } catch (error) {
        console.error('Unexpected error fetching SEO settings:', error);
        return [];
      }
    }
  });

  // Load settings from database
  useEffect(() => {
    if (seoSettings && seoSettings.length > 0) {
      const loadedSettings = { ...settings };
      
      seoSettings.forEach((setting: any) => {
        try {
          const key = setting.key as keyof SEOSettingsState;
          if (key in loadedSettings) {
            let value = setting.value;
            
            if (typeof value === 'object' && value !== null) {
              if ('value' in value) {
                value = value.value;
              } else if (typeof value === 'object') {
                value = JSON.stringify(value);
              }
            }
            
            if (typeof loadedSettings[key] === 'boolean') {
              value = Boolean(value === true || value === 'true' || value === 1);
            } else if (typeof loadedSettings[key] === 'string') {
              value = String(value || '');
            }
            
            (loadedSettings as any)[key] = value;
          }
        } catch (error) {
          console.error('Error processing SEO setting:', setting.key, error);
        }
      });
      
      setSettings(loadedSettings);
    }
  }, [seoSettings]);

  // Save setting mutation
  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      try {
        console.log('Saving SEO setting:', key, '=', value);
        
        const settingData = {
          key,
          value,
          category: 'seo',
          description: `SEO setting for ${key.replace(/_/g, ' ')}`,
          is_public: true,
          updated_at: new Date().toISOString()
        };
        
        const { data: existingData, error: selectError } = await supabase
          .from('system_settings')
          .select('id')
          .eq('key', key)
          .eq('category', 'seo')
          .single();
        
        let result;
        if (existingData?.id) {
          const { data, error } = await supabase
            .from('system_settings')
            .update(settingData)
            .eq('id', existingData.id)
            .select();
          
          result = { data, error };
        } else {
          const { data, error } = await supabase
            .from('system_settings')
            .upsert(settingData, { 
              onConflict: 'category,key',
              ignoreDuplicates: false
            })
            .select();
          
          result = { data, error };
        }
        
        if (result.error) {
          console.error('Save error:', result.error);
          throw new Error(`Failed to save ${key}: ${result.error.message}`);
        }
        
        console.log('Successfully saved SEO setting:', result.data);
        return { key, value };
      } catch (error) {
        console.error('SEO setting mutation error:', error);
        throw error;
      }
    },
    onMutate: ({ key }) => {
      setSavingStates(prev => ({ ...prev, [key]: 'saving' }));
    },
    onSuccess: ({ key }) => {
      setSavingStates(prev => ({ ...prev, [key]: 'success' }));
      showSuccess("SEO Setting Saved", `${key.replace(/_/g, ' ')} has been updated successfully.`);
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [key]: 'idle' }));
      }, 2000);
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
    },
    onError: (error: any, { key }) => {
      setSavingStates(prev => ({ ...prev, [key]: 'error' }));
      showError("Save Failed", `Failed to save ${key.replace(/_/g, ' ')}: ${error.message}`);
      setTimeout(() => {
        setSavingStates(prev => ({ ...prev, [key]: 'idle' }));
      }, 3000);
    },
  });

  const handleSettingChange = (key: keyof SEOSettingsState, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSetting = (key: keyof SEOSettingsState) => {
    const value = settings[key];
    saveSettingMutation.mutate({ key, value });
  };

  const getSaveIcon = (key: string) => {
    const state = savingStates[key] || 'idle';
    switch (state) {
      case 'saving':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const InputWithSave = ({ 
    id, 
    label, 
    value, 
    onChange, 
    onSave, 
    type = "text",
    placeholder = "",
    description = ""
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    type?: string;
    placeholder?: string;
    description?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor={id}>{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="mt-1"
          />
        </div>
        <Button 
          onClick={onSave}
          disabled={savingStates[id] === 'saving'}
          size="sm"
          className="mb-0"
        >
          {getSaveIcon(id)}
        </Button>
      </div>
    </div>
  );

  const TextareaWithSave = ({ 
    id, 
    label, 
    value, 
    onChange, 
    onSave, 
    placeholder = "",
    description = "",
    rows = 3
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
    placeholder?: string;
    description?: string;
    rows?: number;
  }) => (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Label htmlFor={id}>{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          <Textarea
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="mt-1"
          />
        </div>
        <Button 
          onClick={onSave}
          disabled={savingStates[id] === 'saving'}
          size="sm"
          className="mt-6"
        >
          {getSaveIcon(id)}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO Settings
              </CardTitle>
              <CardDescription>
                Manage search engine optimization settings for better visibility
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading SEO settings...</p>
            </div>
          ) : (
            <Tabs defaultValue="global" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="global" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Global
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Social
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="schema" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Schema
                </TabsTrigger>
                <TabsTrigger value="technical" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Technical
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Global SEO Settings</CardTitle>
                    <CardDescription>Basic SEO information for your website</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InputWithSave
                      id="site_title"
                      label="Site Title"
                      value={settings.site_title}
                      onChange={(value) => handleSettingChange('site_title', value)}
                      onSave={() => handleSaveSetting('site_title')}
                      placeholder="Your website title"
                      description="Main title that appears in search results and browser tabs"
                    />
                    <TextareaWithSave
                      id="site_description"
                      label="Site Description"
                      value={settings.site_description}
                      onChange={(value) => handleSettingChange('site_description', value)}
                      onSave={() => handleSaveSetting('site_description')}
                      placeholder="Brief description of your website..."
                      description="Meta description that appears in search results (150-160 characters recommended)"
                      rows={3}
                    />
                    <TextareaWithSave
                      id="site_keywords"
                      label="Site Keywords"
                      value={settings.site_keywords}
                      onChange={(value) => handleSettingChange('site_keywords', value)}
                      onSave={() => handleSaveSetting('site_keywords')}
                      placeholder="keyword1, keyword2, keyword3"
                      description="Comma-separated keywords relevant to your website"
                      rows={2}
                    />
                    <InputWithSave
                      id="canonical_url"
                      label="Canonical URL"
                      value={settings.canonical_url}
                      onChange={(value) => handleSettingChange('canonical_url', value)}
                      onSave={() => handleSaveSetting('canonical_url')}
                      placeholder="https://yourdomain.com"
                      description="Primary domain URL for canonical tags"
                      type="url"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="social" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Open Graph & Social Media</CardTitle>
                    <CardDescription>Settings for social media sharing</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Open Graph</Badge>
                      </div>
                      <InputWithSave
                        id="og_title"
                        label="OG Title"
                        value={settings.og_title}
                        onChange={(value) => handleSettingChange('og_title', value)}
                        onSave={() => handleSaveSetting('og_title')}
                        placeholder="Title for social media shares"
                        description="Title that appears when shared on Facebook, LinkedIn, etc."
                      />
                      <TextareaWithSave
                        id="og_description"
                        label="OG Description"
                        value={settings.og_description}
                        onChange={(value) => handleSettingChange('og_description', value)}
                        onSave={() => handleSaveSetting('og_description')}
                        placeholder="Description for social media shares..."
                        description="Description for social media previews"
                        rows={2}
                      />
                      <InputWithSave
                        id="og_image"
                        label="OG Image"
                        value={settings.og_image}
                        onChange={(value) => handleSettingChange('og_image', value)}
                        onSave={() => handleSaveSetting('og_image')}
                        placeholder="/og-image.jpg"
                        description="Image URL for social media previews (1200x630px recommended)"
                        type="url"
                      />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Twitter</Badge>
                      </div>
                      <InputWithSave
                        id="twitter_title"
                        label="Twitter Title"
                        value={settings.twitter_title}
                        onChange={(value) => handleSettingChange('twitter_title', value)}
                        onSave={() => handleSaveSetting('twitter_title')}
                        placeholder="Title for Twitter cards"
                        description="Title for Twitter card previews"
                      />
                      <TextareaWithSave
                        id="twitter_description"
                        label="Twitter Description"
                        value={settings.twitter_description}
                        onChange={(value) => handleSettingChange('twitter_description', value)}
                        onSave={() => handleSaveSetting('twitter_description')}
                        placeholder="Description for Twitter cards..."
                        description="Description for Twitter card previews"
                        rows={2}
                      />
                      <InputWithSave
                        id="twitter_image"
                        label="Twitter Image"
                        value={settings.twitter_image}
                        onChange={(value) => handleSettingChange('twitter_image', value)}
                        onSave={() => handleSaveSetting('twitter_image')}
                        placeholder="/twitter-image.jpg"
                        description="Image URL for Twitter cards (1200x600px recommended)"
                        type="url"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics & Tracking</CardTitle>
                    <CardDescription>Configure tracking and analytics tools</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InputWithSave
                      id="google_analytics_id"
                      label="Google Analytics ID"
                      value={settings.google_analytics_id}
                      onChange={(value) => handleSettingChange('google_analytics_id', value)}
                      onSave={() => handleSaveSetting('google_analytics_id')}
                      placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
                      description="Google Analytics tracking ID"
                    />
                    <InputWithSave
                      id="google_search_console_id"
                      label="Google Search Console ID"
                      value={settings.google_search_console_id}
                      onChange={(value) => handleSettingChange('google_search_console_id', value)}
                      onSave={() => handleSaveSetting('google_search_console_id')}
                      placeholder="Verification code"
                      description="Google Search Console verification code"
                    />
                    <InputWithSave
                      id="facebook_pixel_id"
                      label="Facebook Pixel ID"
                      value={settings.facebook_pixel_id}
                      onChange={(value) => handleSettingChange('facebook_pixel_id', value)}
                      onSave={() => handleSaveSetting('facebook_pixel_id')}
                      placeholder="Facebook Pixel ID"
                      description="Facebook Pixel for conversion tracking"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schema" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schema.org / Structured Data</CardTitle>
                    <CardDescription>Organization information for structured data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <InputWithSave
                      id="organization_name"
                      label="Organization Name"
                      value={settings.organization_name}
                      onChange={(value) => handleSettingChange('organization_name', value)}
                      onSave={() => handleSaveSetting('organization_name')}
                      placeholder="Your company name"
                      description="Legal name of your organization"
                    />
                    <InputWithSave
                      id="organization_logo"
                      label="Organization Logo URL"
                      value={settings.organization_logo}
                      onChange={(value) => handleSettingChange('organization_logo', value)}
                      onSave={() => handleSaveSetting('organization_logo')}
                      placeholder="/logo.png"
                      description="URL to your organization's logo"
                      type="url"
                    />
                    <TextareaWithSave
                      id="organization_address"
                      label="Organization Address"
                      value={settings.organization_address}
                      onChange={(value) => handleSettingChange('organization_address', value)}
                      onSave={() => handleSaveSetting('organization_address')}
                      placeholder="Street address, City, State, ZIP, Country"
                      description="Physical address of your organization"
                      rows={2}
                    />
                    <InputWithSave
                      id="organization_phone"
                      label="Organization Phone"
                      value={settings.organization_phone}
                      onChange={(value) => handleSettingChange('organization_phone', value)}
                      onSave={() => handleSaveSetting('organization_phone')}
                      placeholder="+1-555-123-4567"
                      description="Contact phone number"
                      type="tel"
                    />
                    <InputWithSave
                      id="organization_email"
                      label="Organization Email"
                      value={settings.organization_email}
                      onChange={(value) => handleSettingChange('organization_email', value)}
                      onSave={() => handleSaveSetting('organization_email')}
                      placeholder="contact@yourcompany.com"
                      description="Contact email address"
                      type="email"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical SEO</CardTitle>
                    <CardDescription>Advanced SEO configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TextareaWithSave
                      id="robots_txt"
                      label="Robots.txt Content"
                      value={settings.robots_txt}
                      onChange={(value) => handleSettingChange('robots_txt', value)}
                      onSave={() => handleSaveSetting('robots_txt')}
                      placeholder="User-agent: *\nAllow: /"
                      description="Content for robots.txt file"
                      rows={4}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sitemap_enabled"
                          checked={settings.sitemap_enabled}
                          onChange={(e) => {
                            handleSettingChange('sitemap_enabled', e.target.checked);
                            handleSaveSetting('sitemap_enabled');
                          }}
                        />
                        <Label htmlFor="sitemap_enabled">Enable Sitemap</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="breadcrumbs_enabled"
                          checked={settings.breadcrumbs_enabled}
                          onChange={(e) => {
                            handleSettingChange('breadcrumbs_enabled', e.target.checked);
                            handleSaveSetting('breadcrumbs_enabled');
                          }}
                        />
                        <Label htmlFor="breadcrumbs_enabled">Enable Breadcrumbs</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="schema_markup_enabled"
                          checked={settings.schema_markup_enabled}
                          onChange={(e) => {
                            handleSettingChange('schema_markup_enabled', e.target.checked);
                            handleSaveSetting('schema_markup_enabled');
                          }}
                        />
                        <Label htmlFor="schema_markup_enabled">Enable Schema Markup</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOSettings;
