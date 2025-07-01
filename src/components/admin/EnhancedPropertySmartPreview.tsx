import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Eye, 
  RefreshCw, 
  Search,
  Building2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  ExternalLink,
  AlertCircle,
  Settings,
  Palette,
  Layout,
  Grid,
  List,
  Maximize2,
  Edit3,
  Save,
  Play,
  Pause
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatIDR } from '@/utils/currency';
import { useAlert } from '@/contexts/AlertContext';

interface PreviewProperty {
  id: string;
  title: string;
  description?: string;
  property_type: string;
  listing_type: string;
  price?: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  status?: string;
  images?: string[];
  three_d_model_url?: string;
  virtual_tour_url?: string;
  development_status?: string;
  approval_status?: string;
}

interface PreviewSettings {
  showTitle: boolean;
  showPrice: boolean;
  showLocation: boolean;
  showBedrooms: boolean;
  showBathrooms: boolean;
  showArea: boolean;
  showDescription: boolean;
  showImages: boolean;
  show3DButton: boolean;
  showVirtualTour: boolean;
  showSaveButton: boolean;
  showShareButton: boolean;
  showPropertyType: boolean;
  showListingType: boolean;
  cardBorderRadius: number;
  cardSpacing: number;
  imageHeight: number;
  titleSize: number;
  priceSize: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  layoutStyle: 'compact' | 'spacious' | 'minimal';
  imageStyle: 'cover' | 'contain' | 'fill';
  pricePosition: 'top' | 'bottom' | 'overlay';
  buttonStyle: 'rounded' | 'square' | 'pill';
}

const EnhancedPropertySmartPreview = () => {
  const { showSuccess, showError } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<PreviewProperty | null>(null);
  const [previewMode, setPreviewMode] = useState<'card' | 'list' | 'detailed'>('card');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending_approval' | 'active'>('all');
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>({
    showTitle: true,
    showPrice: true,
    showLocation: true,
    showBedrooms: true,
    showBathrooms: true,
    showArea: true,
    showDescription: true,
    showImages: true,
    show3DButton: true,
    showVirtualTour: true,
    showSaveButton: true,
    showShareButton: true,
    showPropertyType: true,
    showListingType: true,
    cardBorderRadius: 8,
    cardSpacing: 16,
    imageHeight: 200,
    titleSize: 18,
    priceSize: 20,
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#3b82f6',
    layoutStyle: 'compact',
    imageStyle: 'cover',
    pricePosition: 'bottom',
    buttonStyle: 'rounded'
  });

  const { data: properties, isLoading, error, refetch } = useQuery({
    queryKey: ['enhanced-preview-properties', searchTerm, statusFilter],
    queryFn: async () => {
      console.log('Fetching properties for enhanced preview...', { searchTerm, statusFilter });
      
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (statusFilter !== 'all') {
        if (statusFilter === 'approved') {
          query = query.eq('status', 'approved');
        } else if (statusFilter === 'pending_approval') {
          query = query.eq('status', 'pending_approval');
        } else if (statusFilter === 'active') {
          query = query.eq('status', 'active');
        }
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching properties:', error);
        throw error;
      }
      
      return data as PreviewProperty[];
    },
  });

  useEffect(() => {
    if (isLivePreview) {
      setPreviewKey(prev => prev + 1);
    }
  }, [previewSettings, isLivePreview]);

  const updateSetting = (key: keyof PreviewSettings, value: any) => {
    setPreviewSettings(prev => ({ ...prev, [key]: value }));
  };

  const savePreviewSettings = async () => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'property_preview_settings',
          value: previewSettings as any, // Cast to any to satisfy Json type
          category: 'property_display',
          description: 'Enhanced property preview settings'
        });

      if (error) throw error;
      showSuccess('Settings Saved', 'Preview settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Save Error', 'Failed to save preview settings');
    }
  };

  const resetToDefaults = () => {
    setPreviewSettings({
      showTitle: true,
      showPrice: true,
      showLocation: true,
      showBedrooms: true,
      showBathrooms: true,
      showArea: true,
      showDescription: true,
      showImages: true,
      show3DButton: true,
      showVirtualTour: true,
      showSaveButton: true,
      showShareButton: true,
      showPropertyType: true,
      showListingType: true,
      cardBorderRadius: 8,
      cardSpacing: 16,
      imageHeight: 200,
      titleSize: 18,
      priceSize: 20,
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#3b82f6',
      layoutStyle: 'compact',
      imageStyle: 'cover',
      pricePosition: 'bottom',
      buttonStyle: 'rounded'
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const CustomPropertyCard = ({ property }: { property: PreviewProperty }) => {
    const cardStyle = {
      borderRadius: `${previewSettings.cardBorderRadius}px`,
      margin: `${previewSettings.cardSpacing / 2}px`,
      backgroundColor: previewSettings.backgroundColor,
      color: previewSettings.textColor,
      padding: previewSettings.layoutStyle === 'spacious' ? '24px' : previewSettings.layoutStyle === 'minimal' ? '12px' : '16px'
    };

    const imageStyle = {
      height: `${previewSettings.imageHeight}px`,
      objectFit: previewSettings.imageStyle as any,
      borderRadius: previewSettings.imageStyle === 'cover' ? `${previewSettings.cardBorderRadius - 4}px` : '0px'
    };

    const titleStyle = {
      fontSize: `${previewSettings.titleSize}px`,
      fontWeight: 'bold',
      color: previewSettings.textColor
    };

    const priceStyle = {
      fontSize: `${previewSettings.priceSize}px`,
      fontWeight: 'bold',
      color: previewSettings.accentColor
    };

    const buttonClass = previewSettings.buttonStyle === 'pill' ? 'rounded-full' : 
                       previewSettings.buttonStyle === 'square' ? 'rounded-none' : 'rounded-md';

    return (
      <Card 
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        style={cardStyle}
        onClick={() => setSelectedProperty(property)}
      >
        <CardContent className="p-0">
          {previewSettings.showImages && (
            <div className="relative">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-full"
                  style={imageStyle}
                />
              ) : (
                <div 
                  className="w-full flex items-center justify-center bg-gray-200"
                  style={{ height: `${previewSettings.imageHeight}px` }}
                >
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {previewSettings.pricePosition === 'overlay' && previewSettings.showPrice && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded">
                  {property.price ? formatIDR(property.price) : 'Price on request'}
                </div>
              )}
            </div>
          )}
          
          <div className="p-4 space-y-3">
            {previewSettings.showTitle && (
              <h3 style={titleStyle} className="line-clamp-2">
                {property.title}
              </h3>
            )}
            
            {previewSettings.showLocation && (
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </div>
            )}
            
            {previewSettings.pricePosition === 'top' && previewSettings.showPrice && (
              <div style={priceStyle}>
                {property.price ? formatIDR(property.price) : 'Price on request'}
              </div>
            )}
            
            {previewSettings.showDescription && property.description && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {property.description}
              </p>
            )}
            
            {(previewSettings.showBedrooms || previewSettings.showBathrooms || previewSettings.showArea) && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                {previewSettings.showBedrooms && property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms}
                  </div>
                )}
                {previewSettings.showBathrooms && property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </div>
                )}
                {previewSettings.showArea && property.area_sqm && (
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    {property.area_sqm}m²
                  </div>
                )}
              </div>
            )}
            
            {(previewSettings.showPropertyType || previewSettings.showListingType) && (
              <div className="flex gap-2">
                {previewSettings.showPropertyType && (
                  <Badge variant="outline" className="text-xs">
                    {property.property_type}
                  </Badge>
                )}
                {previewSettings.showListingType && (
                  <Badge variant="outline" className="text-xs">
                    {property.listing_type}
                  </Badge>
                )}
              </div>
            )}
            
            {previewSettings.pricePosition === 'bottom' && previewSettings.showPrice && (
              <div style={priceStyle}>
                {property.price ? formatIDR(property.price) : 'Price on request'}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-2">
                {previewSettings.show3DButton && property.three_d_model_url && (
                  <Button size="sm" variant="outline" className={buttonClass}>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    3D
                  </Button>
                )}
                {previewSettings.showVirtualTour && property.virtual_tour_url && (
                  <Button size="sm" variant="outline" className={buttonClass}>
                    <Eye className="h-3 w-3 mr-1" />
                    VR
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-1">
                {previewSettings.showSaveButton && (
                  <Button size="sm" variant="ghost" className={buttonClass}>
                    <Heart className="h-3 w-3" />
                  </Button>
                )}
                {previewSettings.showShareButton && (
                  <Button size="sm" variant="ghost" className={buttonClass}>
                    <Share2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Enhanced Property Smart Preview</h2>
          <p className="text-gray-400">Customize and preview how properties appear with live editing tools</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsLivePreview(!isLivePreview)}
            variant={isLivePreview ? "default" : "outline"}
            size="sm"
          >
            {isLivePreview ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isLivePreview ? 'Live Preview On' : 'Live Preview Off'}
          </Button>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {/* Search Controls */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search properties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="approved">Approved Only</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="pending_approval">Pending Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview Area */}
          <Card className="bg-white border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center justify-between">
                <span>Live Preview ({properties?.length || 0} properties)</span>
                <Badge variant={isLivePreview ? "default" : "secondary"}>
                  {isLivePreview ? "Live Updates" : "Static"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading properties...</p>
                </div>
              ) : !properties || properties.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Properties Found</h3>
                  <p className="text-gray-500">No properties match your current filters.</p>
                </div>
              ) : (
                <div key={previewKey} className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.slice(0, 6).map((property) => (
                    <CustomPropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Settings */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Content Display
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.showTitle}
                      onCheckedChange={(checked) => updateSetting('showTitle', checked)}
                    />
                    <Label className="text-white text-sm">Show Title</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.showPrice}
                      onCheckedChange={(checked) => updateSetting('showPrice', checked)}
                    />
                    <Label className="text-white text-sm">Show Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.showLocation}
                      onCheckedChange={(checked) => updateSetting('showLocation', checked)}
                    />
                    <Label className="text-white text-sm">Show Location</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.showDescription}
                      onCheckedChange={(checked) => updateSetting('showDescription', checked)}
                    />
                    <Label className="text-white text-sm">Show Description</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.showBedrooms}
                      onCheckedChange={(checked) => updateSetting('showBedrooms', checked)}
                    />
                    <Label className="text-white text-sm">Show Bedrooms</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.showBathrooms}
                      onCheckedChange={(checked) => updateSetting('showBathrooms', checked)}
                    />
                    <Label className="text-white text-sm">Show Bathrooms</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.showArea}
                      onCheckedChange={(checked) => updateSetting('showArea', checked)}
                    />
                    <Label className="text-white text-sm">Show Area</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={previewSettings.show3DButton}
                      onCheckedChange={(checked) => updateSetting('show3DButton', checked)}
                    />
                    <Label className="text-white text-sm">Show 3D Button</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layout Settings */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Layout className="h-5 w-5 mr-2" />
                  Layout & Style
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Layout Style</Label>
                  <Select value={previewSettings.layoutStyle} onValueChange={(value: any) => updateSetting('layoutStyle', value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Price Position</Label>
                  <Select value={previewSettings.pricePosition} onValueChange={(value: any) => updateSetting('pricePosition', value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="overlay">Image Overlay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Button Style</Label>
                  <Select value={previewSettings.buttonStyle} onValueChange={(value: any) => updateSetting('buttonStyle', value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded">Rounded</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="pill">Pill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Size Settings */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Maximize2 className="h-5 w-5 mr-2" />
                  Size Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Image Height: {previewSettings.imageHeight}px</Label>
                  <Slider
                    value={[previewSettings.imageHeight]}
                    onValueChange={([value]) => updateSetting('imageHeight', value)}
                    max={400}
                    min={100}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Title Size: {previewSettings.titleSize}px</Label>
                  <Slider
                    value={[previewSettings.titleSize]}
                    onValueChange={([value]) => updateSetting('titleSize', value)}
                    max={32}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Price Size: {previewSettings.priceSize}px</Label>
                  <Slider
                    value={[previewSettings.priceSize]}
                    onValueChange={([value]) => updateSetting('priceSize', value)}
                    max={36}
                    min={14}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Card Border Radius: {previewSettings.cardBorderRadius}px</Label>
                  <Slider
                    value={[previewSettings.cardBorderRadius]}
                    onValueChange={([value]) => updateSetting('cardBorderRadius', value)}
                    max={24}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Color Settings */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Background Color</Label>
                  <Input
                    type="color"
                    value={previewSettings.backgroundColor}
                    onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                    className="w-full h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Text Color</Label>
                  <Input
                    type="color"
                    value={previewSettings.textColor}
                    onChange={(e) => updateSetting('textColor', e.target.value)}
                    className="w-full h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Accent Color</Label>
                  <Input
                    type="color"
                    value={previewSettings.accentColor}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Save Current Settings</h3>
                  <p className="text-gray-400 text-sm">Save these settings as default for the property preview</p>
                </div>
                <Button onClick={savePreviewSettings} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-600">
                <div>
                  <h3 className="text-white font-medium">Reset to Defaults</h3>
                  <p className="text-gray-400 text-sm">Restore all settings to their default values</p>
                </div>
                <Button onClick={resetToDefaults} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPropertySmartPreview;
