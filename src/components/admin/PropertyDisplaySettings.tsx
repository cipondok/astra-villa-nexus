
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Save, 
  RefreshCw, 
  Grid,
  List,
  Layout,
  Eye,
  Palette,
  AlertCircle
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';

interface DisplaySettings {
  layoutType: string;
  cardsPerRow: number;
  showPriceRange: boolean;
  showBedrooms: boolean;
  showBathrooms: boolean;
  showArea: boolean;
  showLocation: boolean;
  showPropertyType: boolean;
  showListingType: boolean;
  showImages: boolean;
  imageAspectRatio: string;
  cardSpacing: number;
  showDescription: boolean;
  maxDescriptionLength: number;
  showContactInfo: boolean;
}

const PropertyDisplaySettings = () => {
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState<DisplaySettings>({
    layoutType: 'grid',
    cardsPerRow: 3,
    showPriceRange: true,
    showBedrooms: true,
    showBathrooms: true,
    showArea: true,
    showLocation: true,
    showPropertyType: true,
    showListingType: true,
    showImages: true,
    imageAspectRatio: '16:9',
    cardSpacing: 4,
    showDescription: true,
    maxDescriptionLength: 150,
    showContactInfo: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('Loading display settings...');
      
      // Add timeout to the query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), 10000);
      });

      const queryPromise = supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'property_display');

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error loading display settings:', error);
        showError('Database Error', 'Failed to load display settings. Please check your connection.');
        return;
      }

      if (data && data.length > 0) {
        const settingsMap = data.reduce((acc, setting) => {
          const key = setting.key.replace('property_display_', '');
          acc[key] = setting.value;
          return acc;
        }, {} as any);

        setSettings(prev => ({
          ...prev,
          ...settingsMap,
          showPriceRange: settingsMap.showPriceRange === 'true',
          showBedrooms: settingsMap.showBedrooms === 'true',
          showBathrooms: settingsMap.showBathrooms === 'true',
          showArea: settingsMap.showArea === 'true',
          showLocation: settingsMap.showLocation === 'true',
          showPropertyType: settingsMap.showPropertyType === 'true',
          showListingType: settingsMap.showListingType === 'true',
          showImages: settingsMap.showImages === 'true',
          showDescription: settingsMap.showDescription === 'true',
          showContactInfo: settingsMap.showContactInfo === 'true',
        }));
        
        console.log('Display settings loaded successfully');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      if (error.message === 'Database connection timeout') {
        showError('Connection Timeout', 'Database connection timed out. Please check your internet connection and try again.');
      } else {
        showError('Settings Error', 'Failed to load display settings');
      }
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    console.log('Starting to save display settings...');
    
    try {
      const settingsToSave = [
        { key: 'property_display_layoutType', value: settings.layoutType, category: 'property_display', description: 'Property layout type' },
        { key: 'property_display_cardsPerRow', value: settings.cardsPerRow.toString(), category: 'property_display', description: 'Cards per row' },
        { key: 'property_display_showPriceRange', value: settings.showPriceRange.toString(), category: 'property_display', description: 'Show price range' },
        { key: 'property_display_showBedrooms', value: settings.showBedrooms.toString(), category: 'property_display', description: 'Show bedrooms' },
        { key: 'property_display_showBathrooms', value: settings.showBathrooms.toString(), category: 'property_display', description: 'Show bathrooms' },
        { key: 'property_display_showArea', value: settings.showArea.toString(), category: 'property_display', description: 'Show area' },
        { key: 'property_display_showLocation', value: settings.showLocation.toString(), category: 'property_display', description: 'Show location' },
        { key: 'property_display_showPropertyType', value: settings.showPropertyType.toString(), category: 'property_display', description: 'Show property type' },
        { key: 'property_display_showListingType', value: settings.showListingType.toString(), category: 'property_display', description: 'Show listing type' },
        { key: 'property_display_showImages', value: settings.showImages.toString(), category: 'property_display', description: 'Show images' },
        { key: 'property_display_imageAspectRatio', value: settings.imageAspectRatio, category: 'property_display', description: 'Image aspect ratio' },
        { key: 'property_display_cardSpacing', value: settings.cardSpacing.toString(), category: 'property_display', description: 'Card spacing' },
        { key: 'property_display_showDescription', value: settings.showDescription.toString(), category: 'property_display', description: 'Show description' },
        { key: 'property_display_maxDescriptionLength', value: settings.maxDescriptionLength.toString(), category: 'property_display', description: 'Max description length' },
        { key: 'property_display_showContactInfo', value: settings.showContactInfo.toString(), category: 'property_display', description: 'Show contact info' }
      ];

      console.log('Attempting to save settings to database...');

      // Add timeout to the save operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database save timeout')), 15000);
      });

      const savePromise = supabase
        .from('system_settings')
        .upsert(settingsToSave, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        });

      const { error } = await Promise.race([savePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Database save error:', error);
        throw error;
      }

      console.log('Settings saved successfully to database');
      showSuccess('Settings Saved', 'Property display settings have been saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      if (error.message === 'Database save timeout') {
        showError('Save Timeout', 'The save operation timed out. Please check your connection and try again.');
      } else if (error.message?.includes('timeout')) {
        showError('Connection Issue', 'Database connection is unstable. Please try again in a moment.');
      } else {
        showError('Save Error', 'Failed to save display settings. Please try again.');
      }
    } finally {
      setLoading(false);
      console.log('Save operation completed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Property Display Settings</h2>
          <p className="text-gray-400">Configure how properties are displayed on the website</p>
        </div>
        <Button
          onClick={loadSettings}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Connection Status Warning */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
          <div>
            <p className="text-yellow-300 font-medium">Database Connection Status</p>
            <p className="text-yellow-200 text-sm">
              If saving takes too long, there might be connection issues. Please ensure your internet connection is stable.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="layout" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Layout className="h-5 w-5 mr-2" />
                Layout Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Layout Type</Label>
                <Select value={settings.layoutType} onValueChange={(value) => setSettings(prev => ({ ...prev, layoutType: value }))}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">
                      <div className="flex items-center">
                        <Grid className="h-4 w-4 mr-2" />
                        Grid Layout
                      </div>
                    </SelectItem>
                    <SelectItem value="list">
                      <div className="flex items-center">
                        <List className="h-4 w-4 mr-2" />
                        List Layout
                      </div>
                    </SelectItem>
                    <SelectItem value="masonry">
                      <div className="flex items-center">
                        <Layout className="h-4 w-4 mr-2" />
                        Masonry Layout
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Cards Per Row</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[settings.cardsPerRow]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, cardsPerRow: value }))}
                    max={6}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="text-white border-slate-600">
                    {settings.cardsPerRow}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Card Spacing</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[settings.cardSpacing]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, cardSpacing: value }))}
                    max={8}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="text-white border-slate-600">
                    {settings.cardSpacing}px
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Visible Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showPriceRange}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPriceRange: checked }))}
                  />
                  <Label className="text-white">Show price range</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showBedrooms}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showBedrooms: checked }))}
                  />
                  <Label className="text-white">Show bedrooms</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showBathrooms}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showBathrooms: checked }))}
                  />
                  <Label className="text-white">Show bathrooms</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showArea}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showArea: checked }))}
                  />
                  <Label className="text-white">Show area</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showLocation}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLocation: checked }))}
                  />
                  <Label className="text-white">Show location</Label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Additional Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showPropertyType}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPropertyType: checked }))}
                  />
                  <Label className="text-white">Show property type</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showListingType}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showListingType: checked }))}
                  />
                  <Label className="text-white">Show listing type</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showDescription}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showDescription: checked }))}
                  />
                  <Label className="text-white">Show description</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.showContactInfo}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showContactInfo: checked }))}
                  />
                  <Label className="text-white">Show contact info</Label>
                </div>

                {settings.showDescription && (
                  <div className="space-y-2">
                    <Label className="text-white">Max Description Length</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[settings.maxDescriptionLength]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, maxDescriptionLength: value }))}
                        max={500}
                        min={50}
                        step={25}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="text-white border-slate-600">
                        {settings.maxDescriptionLength}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Visual Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.showImages}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showImages: checked }))}
                />
                <Label className="text-white">Show property images</Label>
              </div>

              {settings.showImages && (
                <div className="space-y-2">
                  <Label className="text-white">Image Aspect Ratio</Label>
                  <Select value={settings.imageAspectRatio} onValueChange={(value) => setSettings(prev => ({ ...prev, imageAspectRatio: value }))}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                      <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      <SelectItem value="3:2">3:2 (Photo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving... (This may take a moment)
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PropertyDisplaySettings;
