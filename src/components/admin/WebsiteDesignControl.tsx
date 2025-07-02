import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Palette, 
  Image, 
  Type, 
  Layout, 
  Settings, 
  Upload, 
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Paintbrush,
  FileImage,
  Navigation,
  Globe,
  Menu,
  Save,
  CheckCircle
} from 'lucide-react';

const WebsiteDesignControl = () => {
  const [settings, setSettings] = useState({
    // Logo & Branding
    siteLogo: '',
    siteName: 'AstraVilla',
    siteTagline: 'Premium Real Estate Platform',
    faviconUrl: '',
    
    // Colors - Light Mode
    lightPrimaryColor: '#3B82F6',
    lightSecondaryColor: '#10B981',
    lightBackgroundColor: '#FFFFFF',
    lightSurfaceColor: '#F8FAFC',
    lightTextColor: '#1E293B',
    lightAccentColor: '#F59E0B',
    
    // Colors - Dark Mode
    darkPrimaryColor: '#60A5FA',
    darkSecondaryColor: '#34D399',
    darkBackgroundColor: '#0F172A',
    darkSurfaceColor: '#1E293B',
    darkTextColor: '#F1F5F9',
    darkAccentColor: '#FBBF24',
    
    // Typography
    primaryFont: 'Inter',
    secondaryFont: 'SF Pro Display',
    baseFontSize: 16,
    headingFontWeight: 600,
    bodyFontWeight: 400,
    
    // Layout
    containerMaxWidth: 1200,
    borderRadius: 12,
    spacing: 16,
    shadowIntensity: 3,
    
    // Header
    headerHeight: 80,
    headerBackground: 'glass',
    headerPosition: 'sticky',
    showNavigation: true,
    showUserMenu: true,
    showThemeToggle: true,
    
    // Footer
    footerBackground: '#1F2937',
    footerTextColor: '#F9FAFB',
    showFooterLinks: true,
    showSocialMedia: true,
    copyrightText: '© 2024 AstraVilla. All rights reserved.',
    
    // Backgrounds
    heroBackgroundType: 'gradient',
    heroBackgroundImage: '',
    heroGradientStart: '#667EEA',
    heroGradientEnd: '#764BA2',
    bodyBackgroundPattern: 'none',
    bodyBackgroundImage: '',
    
    // Advanced
    animations: true,
    glassEffect: true,
    particleEffects: false,
    darkModeDefault: false,
    rtlSupport: false,
    customCSS: ''
  });

  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('Loading website design settings...');
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'website_design');
      
      if (error) {
        console.error('Error loading settings:', error);
        throw error;
      }

      console.log('Loaded settings data:', data);

      if (data && data.length > 0) {
        const settingsObj = data.reduce((acc, setting) => {
          let value = setting.value;
          // Handle different value types
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value);
            } catch {
              // Keep as string if not valid JSON
            }
          }
          acc[setting.key] = value;
          return acc;
        }, {} as any);
        
        console.log('Processed settings object:', settingsObj);
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load website design settings');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      console.log('Starting to save website design settings...');
      console.log('Current settings to save:', settings);

      // Process settings in batches to avoid conflicts
      const settingsEntries = Object.entries(settings);
      const batchSize = 5;
      
      for (let i = 0; i < settingsEntries.length; i += batchSize) {
        const batch = settingsEntries.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}:`, batch);
        
        for (const [key, value] of batch) {
          console.log(`Saving setting: ${key} = ${value}`);
          
          // First, check if the setting exists
          const { data: existing, error: selectError } = await supabase
            .from('system_settings')
            .select('id')
            .eq('key', key)
            .eq('category', 'website_design')
            .maybeSingle();
          
          if (selectError) {
            console.error(`Error checking existing setting for ${key}:`, selectError);
            throw selectError;
          }

          let result;
          if (existing) {
            // Update existing setting
            console.log(`Updating existing setting for ${key}`);
            result = await supabase
              .from('system_settings')
              .update({
                value: value,
                description: `Website design setting for ${key}`,
                is_public: true,
                updated_at: new Date().toISOString()
              })
              .eq('key', key)
              .eq('category', 'website_design');
          } else {
            // Insert new setting
            console.log(`Inserting new setting for ${key}`);
            result = await supabase
              .from('system_settings')
              .insert({
                key,
                value: value,
                category: 'website_design',
                description: `Website design setting for ${key}`,
                is_public: true
              });
          }
          
          if (result.error) {
            console.error(`Error saving setting ${key}:`, result.error);
            throw result.error;
          }
          
          console.log(`Successfully saved setting: ${key}`);
        }
        
        // Small delay between batches to prevent overwhelming the database
        if (i + batchSize < settingsEntries.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Apply settings to CSS variables immediately
      applySettingsToCSS();
      
      setHasUnsavedChanges(false);
      console.log('All settings saved successfully');
      toast.success('Website design settings saved successfully!');
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(`Failed to save website design settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const applySettingsToCSS = () => {
    try {
      console.log('Applying settings to CSS variables...');
      const root = document.documentElement;
      
      // Apply light mode colors
      root.style.setProperty('--primary-light', settings.lightPrimaryColor);
      root.style.setProperty('--secondary-light', settings.lightSecondaryColor);
      root.style.setProperty('--background-light', settings.lightBackgroundColor);
      root.style.setProperty('--surface-light', settings.lightSurfaceColor);
      root.style.setProperty('--text-light', settings.lightTextColor);
      root.style.setProperty('--accent-light', settings.lightAccentColor);
      
      // Apply dark mode colors
      root.style.setProperty('--primary-dark', settings.darkPrimaryColor);
      root.style.setProperty('--secondary-dark', settings.darkSecondaryColor);
      root.style.setProperty('--background-dark', settings.darkBackgroundColor);
      root.style.setProperty('--surface-dark', settings.darkSurfaceColor);
      root.style.setProperty('--text-dark', settings.darkTextColor);
      root.style.setProperty('--accent-dark', settings.darkAccentColor);
      
      // Apply typography
      root.style.setProperty('--font-primary', settings.primaryFont);
      root.style.setProperty('--font-secondary', settings.secondaryFont);
      root.style.setProperty('--font-size-base', `${settings.baseFontSize}px`);
      
      // Apply layout
      root.style.setProperty('--container-max-width', `${settings.containerMaxWidth}px`);
      root.style.setProperty('--border-radius', `${settings.borderRadius}px`);
      root.style.setProperty('--spacing-base', `${settings.spacing}px`);
      
      console.log('CSS variables applied successfully');
    } catch (error) {
      console.error('Error applying CSS variables:', error);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    console.log(`Setting changed: ${key} = ${value}`);
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = async (file: File, settingKey: string) => {
    try {
      console.log(`Uploading file for ${settingKey}:`, file.name);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `website-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      console.log(`File uploaded successfully: ${data.publicUrl}`);
      handleInputChange(settingKey, data.publicUrl);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    }
  };

  const resetToDefaults = () => {
    setSettings({
      siteLogo: '',
      siteName: 'AstraVilla',
      siteTagline: 'Premium Real Estate Platform',
      faviconUrl: '',
      lightPrimaryColor: '#3B82F6',
      lightSecondaryColor: '#10B981',
      lightBackgroundColor: '#FFFFFF',
      lightSurfaceColor: '#F8FAFC',
      lightTextColor: '#1E293B',
      lightAccentColor: '#F59E0B',
      darkPrimaryColor: '#60A5FA',
      darkSecondaryColor: '#34D399',
      darkBackgroundColor: '#0F172A',
      darkSurfaceColor: '#1E293B',
      darkTextColor: '#F1F5F9',
      darkAccentColor: '#FBBF24',
      primaryFont: 'Inter',
      secondaryFont: 'SF Pro Display',
      baseFontSize: 16,
      headingFontWeight: 600,
      bodyFontWeight: 400,
      containerMaxWidth: 1200,
      borderRadius: 12,
      spacing: 16,
      shadowIntensity: 3,
      headerHeight: 80,
      headerBackground: 'glass',
      headerPosition: 'sticky',
      showNavigation: true,
      showUserMenu: true,
      showThemeToggle: true,
      footerBackground: '#1F2937',
      footerTextColor: '#F9FAFB',
      showFooterLinks: true,
      showSocialMedia: true,
      copyrightText: '© 2024 AstraVilla. All rights reserved.',
      heroBackgroundType: 'gradient',
      heroBackgroundImage: '',
      heroGradientStart: '#667EEA',
      heroGradientEnd: '#764BA2',
      bodyBackgroundPattern: 'none',
      bodyBackgroundImage: '',
      animations: true,
      glassEffect: true,
      particleEffects: false,
      darkModeDefault: false,
      rtlSupport: false,
      customCSS: ''
    });
    setHasUnsavedChanges(true);
    toast.info('Settings reset to defaults. Click Save to apply changes.');
  };

  const colorPresets = [
    { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#06b6d4', accent: '#8b5cf6' },
    { name: 'Forest Green', primary: '#059669', secondary: '#10b981', accent: '#f59e0b' },
    { name: 'Sunset Orange', primary: '#ea580c', secondary: '#f97316', accent: '#eab308' },
    { name: 'Purple Rain', primary: '#8b5cf6', secondary: '#a855f7', accent: '#ec4899' },
    { name: 'Royal Navy', primary: '#1e40af', secondary: '#3b82f6', accent: '#06b6d4' },
    { name: 'Rose Gold', primary: '#be185d', secondary: '#ec4899', accent: '#f59e0b' }
  ];

  const fontOptions = [
    'Inter', 'SF Pro Display', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Source Sans Pro', 'IBM Plex Sans'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Website Design Control</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Complete control over your website's appearance and design</p>
          {hasUnsavedChanges && (
            <p className="text-orange-600 dark:text-orange-400 text-sm mt-1 flex items-center gap-1">
              <Settings className="h-4 w-4" />
              You have unsaved changes
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-600">
            <Monitor className={`h-5 w-5 cursor-pointer ${previewMode === 'desktop' ? 'text-blue-600' : 'text-gray-400'}`} 
              onClick={() => setPreviewMode('desktop')} />
            <Tablet className={`h-5 w-5 cursor-pointer ${previewMode === 'tablet' ? 'text-blue-600' : 'text-gray-400'}`} 
              onClick={() => setPreviewMode('tablet')} />
            <Smartphone className={`h-5 w-5 cursor-pointer ${previewMode === 'mobile' ? 'text-blue-600' : 'text-gray-400'}`} 
              onClick={() => setPreviewMode('mobile')} />
          </div>
          
          <Button 
            onClick={resetToDefaults} 
            variant="outline" 
            className="border-gray-300 dark:border-gray-600"
          >
            Reset to Defaults
          </Button>
          
          <Button 
            onClick={saveSettings} 
            disabled={loading || !hasUnsavedChanges} 
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                All Saved
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="header" className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            Header
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="backgrounds" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Backgrounds
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5" />
                  Site Identity
                </CardTitle>
                <CardDescription>Logo, name, and branding elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Site Name</Label>
                  <Input 
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    placeholder="Your Site Name"
                  />
                </div>
                <div>
                  <Label>Tagline</Label>
                  <Input 
                    value={settings.siteTagline}
                    onChange={(e) => handleInputChange('siteTagline', e.target.value)}
                    placeholder="Your site tagline"
                  />
                </div>
                <div>
                  <Label>Logo Upload</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'siteLogo');
                      }}
                    />
                    {settings.siteLogo && (
                      <img src={settings.siteLogo} alt="Logo" className="h-10 w-10 object-contain rounded" />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Favicon Upload</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'faviconUrl');
                      }}
                    />
                    {settings.faviconUrl && (
                      <img src={settings.faviconUrl} alt="Favicon" className="h-8 w-8 object-contain rounded" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your branding looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    {settings.siteLogo ? (
                      <img src={settings.siteLogo} alt="Logo" className="h-12 w-12 object-contain" />
                    ) : (
                      <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {settings.siteName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{settings.siteName}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{settings.siteTagline}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Light Mode Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'lightPrimaryColor', label: 'Primary Color' },
                  { key: 'lightSecondaryColor', label: 'Secondary Color' },
                  { key: 'lightBackgroundColor', label: 'Background' },
                  { key: 'lightSurfaceColor', label: 'Surface' },
                  { key: 'lightTextColor', label: 'Text Color' },
                  { key: 'lightAccentColor', label: 'Accent Color' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Label className="w-24">{label}</Label>
                    <Input
                      type="color"
                      value={settings[key as keyof typeof settings] as string}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings[key as keyof typeof settings] as string}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  Dark Mode Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'darkPrimaryColor', label: 'Primary Color' },
                  { key: 'darkSecondaryColor', label: 'Secondary Color' },
                  { key: 'darkBackgroundColor', label: 'Background' },
                  { key: 'darkSurfaceColor', label: 'Surface' },
                  { key: 'darkTextColor', label: 'Text Color' },
                  { key: 'darkAccentColor', label: 'Accent Color' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Label className="w-24">{label}</Label>
                    <Input
                      type="color"
                      value={settings[key as keyof typeof settings] as string}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings[key as keyof typeof settings] as string}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Color Presets</CardTitle>
              <CardDescription>Quick color combinations to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {colorPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2"
                    onClick={() => {
                      handleInputChange('lightPrimaryColor', preset.primary);
                      handleInputChange('lightSecondaryColor', preset.secondary);
                      handleInputChange('lightAccentColor', preset.accent);
                      handleInputChange('darkPrimaryColor', preset.primary);
                      handleInputChange('darkSecondaryColor', preset.secondary);
                      handleInputChange('darkAccentColor', preset.accent);
                    }}
                  >
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                    </div>
                    <span className="text-xs">{preset.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Font Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Primary Font</Label>
                  <Select value={settings.primaryFont} onValueChange={(value) => handleInputChange('primaryFont', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Secondary Font</Label>
                  <Select value={settings.secondaryFont} onValueChange={(value) => handleInputChange('secondaryFont', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>{font}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Base Font Size: {settings.baseFontSize}px</Label>
                <Slider
                  value={[settings.baseFontSize]}
                  onValueChange={([value]) => handleInputChange('baseFontSize', value)}
                  max={24}
                  min={12}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Heading Font Weight: {settings.headingFontWeight}</Label>
                  <Slider
                    value={[settings.headingFontWeight]}
                    onValueChange={([value]) => handleInputChange('headingFontWeight', value)}
                    max={900}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Body Font Weight: {settings.bodyFontWeight}</Label>
                  <Slider
                    value={[settings.bodyFontWeight]}
                    onValueChange={([value]) => handleInputChange('bodyFontWeight', value)}
                    max={900}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Container Max Width: {settings.containerMaxWidth}px</Label>
                <Slider
                  value={[settings.containerMaxWidth]}
                  onValueChange={([value]) => handleInputChange('containerMaxWidth', value)}
                  max={1600}
                  min={800}
                  step={50}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Border Radius: {settings.borderRadius}px</Label>
                <Slider
                  value={[settings.borderRadius]}
                  onValueChange={([value]) => handleInputChange('borderRadius', value)}
                  max={32}
                  min={0}
                  step={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Base Spacing: {settings.spacing}px</Label>
                <Slider
                  value={[settings.spacing]}
                  onValueChange={([value]) => handleInputChange('spacing', value)}
                  max={32}
                  min={8}
                  step={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Shadow Intensity: {settings.shadowIntensity}</Label>
                <Slider
                  value={[settings.shadowIntensity]}
                  onValueChange={([value]) => handleInputChange('shadowIntensity', value)}
                  max={10}
                  min={0}
                  step={1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Header Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Header Height: {settings.headerHeight}px</Label>
                <Slider
                  value={[settings.headerHeight]}
                  onValueChange={([value]) => handleInputChange('headerHeight', value)}
                  max={120}
                  min={60}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Header Background</Label>
                <Select value={settings.headerBackground} onValueChange={(value) => handleInputChange('headerBackground', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="glass">Glass Effect</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="transparent">Transparent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Header Position</Label>
                <Select value={settings.headerPosition} onValueChange={(value) => handleInputChange('headerPosition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="sticky">Sticky</SelectItem>
                    <SelectItem value="fixed">Fixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show Navigation</Label>
                  <Switch 
                    checked={settings.showNavigation}
                    onCheckedChange={(checked) => handleInputChange('showNavigation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show User Menu</Label>
                  <Switch 
                    checked={settings.showUserMenu}
                    onCheckedChange={(checked) => handleInputChange('showUserMenu', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Theme Toggle</Label>
                  <Switch 
                    checked={settings.showThemeToggle}
                    onCheckedChange={(checked) => handleInputChange('showThemeToggle', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Label className="w-32">Background Color</Label>
                <Input
                  type="color"
                  value={settings.footerBackground}
                  onChange={(e) => handleInputChange('footerBackground', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.footerBackground}
                  onChange={(e) => handleInputChange('footerBackground', e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-3">
                <Label className="w-32">Text Color</Label>
                <Input
                  type="color"
                  value={settings.footerTextColor}
                  onChange={(e) => handleInputChange('footerTextColor', e.target.value)}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.footerTextColor}
                  onChange={(e) => handleInputChange('footerTextColor', e.target.value)}
                  className="flex-1"
                />
              </div>

              <div>
                <Label>Copyright Text</Label>
                <Input 
                  value={settings.copyrightText}
                  onChange={(e) => handleInputChange('copyrightText', e.target.value)}
                  placeholder="© 2024 Your Company. All rights reserved."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show Footer Links</Label>
                  <Switch 
                    checked={settings.showFooterLinks}
                    onCheckedChange={(checked) => handleInputChange('showFooterLinks', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Social Media</Label>
                  <Switch 
                    checked={settings.showSocialMedia}
                    onCheckedChange={(checked) => handleInputChange('showSocialMedia', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backgrounds" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Background Type</Label>
                  <Select value={settings.heroBackgroundType} onValueChange={(value) => handleInputChange('heroBackgroundType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Solid Color</SelectItem>
                      <SelectItem value="gradient">Gradient</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.heroBackgroundType === 'gradient' && (
                  <>
                    <div className="flex items-center gap-3">
                      <Label className="w-20">Start Color</Label>
                      <Input
                        type="color"
                        value={settings.heroGradientStart}
                        onChange={(e) => handleInputChange('heroGradientStart', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Label className="w-20">End Color</Label>
                      <Input
                        type="color"
                        value={settings.heroGradientEnd}
                        onChange={(e) => handleInputChange('heroGradientEnd', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                    </div>
                  </>
                )}

                {settings.heroBackgroundType === 'image' && (
                  <div>
                    <Label>Background Image</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'heroBackgroundImage');
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Body Background</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Background Pattern</Label>
                  <Select value={settings.bodyBackgroundPattern} onValueChange={(value) => handleInputChange('bodyBackgroundPattern', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="dots">Dots</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="diagonal">Diagonal Lines</SelectItem>
                      <SelectItem value="waves">Waves</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Background Image</Label>
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'bodyBackgroundImage');
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Animations</Label>
                  <Switch 
                    checked={settings.animations}
                    onCheckedChange={(checked) => handleInputChange('animations', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Glass Effect</Label>
                  <Switch 
                    checked={settings.glassEffect}
                    onCheckedChange={(checked) => handleInputChange('glassEffect', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Particle Effects</Label>
                  <Switch 
                    checked={settings.particleEffects}
                    onCheckedChange={(checked) => handleInputChange('particleEffects', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Dark Mode Default</Label>
                  <Switch 
                    checked={settings.darkModeDefault}
                    onCheckedChange={(checked) => handleInputChange('darkModeDefault', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>RTL Support</Label>
                  <Switch 
                    checked={settings.rtlSupport}
                    onCheckedChange={(checked) => handleInputChange('rtlSupport', checked)}
                  />
                </div>
              </div>

              <div>
                <Label>Custom CSS</Label>
                <Textarea 
                  value={settings.customCSS}
                  onChange={(e) => handleInputChange('customCSS', e.target.value)}
                  placeholder="Add your custom CSS here..."
                  rows={8}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsiteDesignControl;
