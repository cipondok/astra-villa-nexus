
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
        const settingsMap = data.reduce((acc: any, setting: any) => {
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Property Display Settings</h2>
          <p className="text-[10px] text-muted-foreground">Configure how properties are displayed on the website</p>
        </div>
        <Button
          onClick={loadSettings}
          variant="outline"
          size="sm"
          className="h-7 text-[10px] gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {/* Connection Status Warning */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          <div>
            <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Database Connection Status</p>
            <p className="text-[9px] text-muted-foreground">
              If saving takes too long, there might be connection issues.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="layout" className="space-y-3">
        <TabsList className="h-8 bg-muted/50 p-0.5 w-full grid grid-cols-3">
          <TabsTrigger value="layout" className="text-[10px] h-7">Layout</TabsTrigger>
          <TabsTrigger value="content" className="text-[10px] h-7">Content</TabsTrigger>
          <TabsTrigger value="appearance" className="text-[10px] h-7">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-3">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Layout className="h-3.5 w-3.5 text-primary" />
                Layout Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] text-foreground">Layout Type</Label>
                <Select value={settings.layoutType} onValueChange={(value) => setSettings(prev => ({ ...prev, layoutType: value }))}>
                  <SelectTrigger className="h-7 text-[10px] bg-background/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid" className="text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Grid className="h-3 w-3" />
                        Grid Layout
                      </div>
                    </SelectItem>
                    <SelectItem value="list" className="text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <List className="h-3 w-3" />
                        List Layout
                      </div>
                    </SelectItem>
                    <SelectItem value="masonry" className="text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <Layout className="h-3 w-3" />
                        Masonry Layout
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] text-foreground">Cards Per Row</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[settings.cardsPerRow]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, cardsPerRow: value }))}
                    max={6}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-border/50">
                    {settings.cardsPerRow}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] text-foreground">Card Spacing</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[settings.cardSpacing]}
                    onValueChange={([value]) => setSettings(prev => ({ ...prev, cardSpacing: value }))}
                    max={8}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-border/50">
                    {settings.cardSpacing}px
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 text-primary" />
                  Visible Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show price range</Label>
                  <Switch
                    checked={settings.showPriceRange}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPriceRange: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show bedrooms</Label>
                  <Switch
                    checked={settings.showBedrooms}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showBedrooms: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show bathrooms</Label>
                  <Switch
                    checked={settings.showBathrooms}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showBathrooms: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show area</Label>
                  <Switch
                    checked={settings.showArea}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showArea: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show location</Label>
                  <Switch
                    checked={settings.showLocation}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLocation: checked }))}
                    className="scale-75"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs font-medium text-foreground">Additional Options</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show property type</Label>
                  <Switch
                    checked={settings.showPropertyType}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPropertyType: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show listing type</Label>
                  <Switch
                    checked={settings.showListingType}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showListingType: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show description</Label>
                  <Switch
                    checked={settings.showDescription}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showDescription: checked }))}
                    className="scale-75"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-[10px] text-foreground">Show contact info</Label>
                  <Switch
                    checked={settings.showContactInfo}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showContactInfo: checked }))}
                    className="scale-75"
                  />
                </div>

                {settings.showDescription && (
                  <div className="space-y-1.5 pt-1">
                    <Label className="text-[10px] text-foreground">Max Description Length</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[settings.maxDescriptionLength]}
                        onValueChange={([value]) => setSettings(prev => ({ ...prev, maxDescriptionLength: value }))}
                        max={500}
                        min={50}
                        step={25}
                        className="flex-1"
                      />
                      <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-border/50">
                        {settings.maxDescriptionLength}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-3">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" />
                Visual Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] text-foreground">Show Images</Label>
                  <div className="flex items-center justify-between">
                    <Switch
                      checked={settings.showImages}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showImages: checked }))}
                      className="scale-75"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] text-foreground">Image Aspect Ratio</Label>
                  <Select value={settings.imageAspectRatio} onValueChange={(value) => setSettings(prev => ({ ...prev, imageAspectRatio: value }))}>
                    <SelectTrigger className="h-7 text-[10px] bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9" className="text-[10px]">16:9 (Widescreen)</SelectItem>
                      <SelectItem value="4:3" className="text-[10px]">4:3 (Standard)</SelectItem>
                      <SelectItem value="1:1" className="text-[10px]">1:1 (Square)</SelectItem>
                      <SelectItem value="3:2" className="text-[10px]">3:2 (Photo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={saveSettings}
          disabled={loading}
          size="sm"
          className="h-7 text-[10px] gap-1.5 bg-primary hover:bg-primary/90"
        >
          <Save className="h-3 w-3" />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default PropertyDisplaySettings;
