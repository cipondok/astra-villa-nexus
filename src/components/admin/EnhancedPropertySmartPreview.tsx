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
import { Textarea } from '@/components/ui/textarea';
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
  Pause,
  Download,
  Upload,
  Code,
  Monitor,
  Smartphone,
  Tablet,
  Copy,
  Check,
  RotateCcw,
  Zap,
  Database,
  Wand2,
  Lightbulb
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

interface DesignTemplate {
  name: string;
  description: string;
  settings: Partial<PreviewSettings>;
  preview: string;
}

const designTemplates: DesignTemplate[] = [
  {
    name: 'Modern Minimal',
    description: 'Clean and minimal design with subtle shadows',
    preview: '🎨',
    settings: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#3b82f6',
      cardBorderRadius: 12,
      layoutStyle: 'minimal',
      imageHeight: 180,
      titleSize: 16,
      priceSize: 18,
      buttonStyle: 'rounded'
    }
  },
  {
    name: 'Luxury Gold',
    description: 'Premium design with gold accents',
    preview: '✨',
    settings: {
      backgroundColor: '#fefdf8',
      textColor: '#292524',
      accentColor: '#f59e0b',
      cardBorderRadius: 16,
      layoutStyle: 'spacious',
      imageHeight: 220,
      titleSize: 20,
      priceSize: 22,
      buttonStyle: 'rounded'
    }
  },
  {
    name: 'Dark Mode',
    description: 'Sleek dark theme for modern appeal',
    preview: '🌙',
    settings: {
      backgroundColor: '#1f2937',
      textColor: '#f9fafb',
      accentColor: '#10b981',
      cardBorderRadius: 8,
      layoutStyle: 'compact',
      imageHeight: 200,
      titleSize: 18,
      priceSize: 20,
      buttonStyle: 'square'
    }
  },
  {
    name: 'Warm Tones',
    description: 'Cozy design with warm colors',
    preview: '🏠',
    settings: {
      backgroundColor: '#fef7ed',
      textColor: '#7c2d12',
      accentColor: '#ea580c',
      cardBorderRadius: 20,
      layoutStyle: 'spacious',
      imageHeight: 240,
      titleSize: 19,
      priceSize: 21,
      buttonStyle: 'pill'
    }
  },
  {
    name: 'Corporate Blue',
    description: 'Professional blue theme for business',
    preview: '💼',
    settings: {
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      accentColor: '#0f172a',
      cardBorderRadius: 6,
      layoutStyle: 'compact',
      imageHeight: 160,
      titleSize: 17,
      priceSize: 19,
      buttonStyle: 'square'
    }
  }
];

const EnhancedPropertySmartPreview = () => {
  const { showSuccess, showError } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<PreviewProperty | null>(null);
  const [previewMode, setPreviewMode] = useState<'card' | 'list' | 'detailed'>('card');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending_approval' | 'active'>('all');
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const [exportedSettings, setExportedSettings] = useState<string>('');
  const [importSettings, setImportSettings] = useState<string>('');
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [customCSS, setCustomCSS] = useState<string>('');
  const [isSettingsCopied, setIsSettingsCopied] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
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
    setHasUnsavedChanges(true);
  };

  const applyTemplate = (templateName: string) => {
    const template = designTemplates.find(t => t.name === templateName);
    if (template) {
      setPreviewSettings(prev => ({ ...prev, ...template.settings }));
      setSelectedTemplate(templateName);
      setHasUnsavedChanges(true);
      showSuccess('Template Applied', `${templateName} template has been applied successfully`);
    }
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
      setHasUnsavedChanges(false);
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
    setSelectedTemplate('');
    setHasUnsavedChanges(true);
  };

  const exportSettingsToJSON = () => {
    const settingsJSON = JSON.stringify(previewSettings, null, 2);
    setExportedSettings(settingsJSON);
    
    // Copy to clipboard
    navigator.clipboard.writeText(settingsJSON).then(() => {
      setIsSettingsCopied(true);
      showSuccess('Settings Exported', 'Settings copied to clipboard and displayed below');
      setTimeout(() => setIsSettingsCopied(false), 2000);
    });
  };

  const importSettingsFromJSON = () => {
    try {
      const parsedSettings = JSON.parse(importSettings);
      setPreviewSettings(parsedSettings);
      setHasUnsavedChanges(true);
      showSuccess('Settings Imported', 'Settings imported successfully');
      setImportSettings('');
    } catch (error) {
      showError('Import Error', 'Invalid JSON format. Please check your settings data.');
    }
  };

  const getDevicePreviewStyles = () => {
    switch (devicePreview) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      default:
        return {};
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const getSizeIndicator = (value: number, min: number, max: number) => {
    const percentage = ((value - min) / (max - min)) * 100;
    if (percentage < 25) return { color: 'text-green-500', text: 'Small' };
    if (percentage < 50) return { color: 'text-blue-500', text: 'Medium' };
    if (percentage < 75) return { color: 'text-orange-500', text: 'Large' };
    return { color: 'text-red-500', text: 'Extra Large' };
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
          <Button 
            onClick={savePreviewSettings} 
            disabled={!hasUnsavedChanges}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-4">
          {/* Search Controls */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1">
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
                
                {/* Device Preview Toggle */}
                <div className="flex items-center space-x-2">
                  <Label className="text-white text-sm">Device:</Label>
                  <div className="flex border border-slate-600 rounded-md overflow-hidden">
                    <Button
                      size="sm"
                      variant={devicePreview === 'desktop' ? 'default' : 'ghost'}
                      onClick={() => setDevicePreview('desktop')}
                      className="rounded-none px-3"
                    >
                      <Monitor className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={devicePreview === 'tablet' ? 'default' : 'ghost'}
                      onClick={() => setDevicePreview('tablet')}
                      className="rounded-none px-3"
                    >
                      <Tablet className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={devicePreview === 'mobile' ? 'default' : 'ghost'}
                      onClick={() => setDevicePreview('mobile')}
                      className="rounded-none px-3"
                    >
                      <Smartphone className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview Area */}
          <Card className="bg-white border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center justify-between">
                <span>Live Preview ({properties?.length || 0} properties)</span>
                <div className="flex items-center space-x-2">
                  <Badge variant={isLivePreview ? "default" : "secondary"}>
                    {isLivePreview ? "Live Updates" : "Static"}
                  </Badge>
                  <Badge variant="outline">
                    {devicePreview.charAt(0).toUpperCase() + devicePreview.slice(1)} View
                  </Badge>
                  {hasUnsavedChanges && (
                    <Badge variant="destructive">
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={getDevicePreviewStyles()}>
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
                  <div key={previewKey} className={`grid gap-4 ${
                    devicePreview === 'mobile' ? 'grid-cols-1' : 
                    devicePreview === 'tablet' ? 'grid-cols-2' : 
                    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {properties.slice(0, 6).map((property) => (
                      <CustomPropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wand2 className="h-5 w-5 mr-2" />
                Design Templates
              </CardTitle>
              <p className="text-gray-400">Choose from pre-designed templates to quickly style your property cards</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {designTemplates.map((template) => (
                  <Card 
                    key={template.name}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate === template.name 
                        ? 'ring-2 ring-blue-500 bg-slate-700/50' 
                        : 'bg-slate-700/30 hover:bg-slate-700/50'
                    }`}
                    onClick={() => applyTemplate(template.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">{template.preview}</span>
                        <div>
                          <h3 className="text-white font-medium">{template.name}</h3>
                          <p className="text-gray-400 text-sm">{template.description}</p>
                        </div>
                      </div>
                      
                      {/* Mini Preview */}
                      <div 
                        className="w-full h-20 rounded-lg border-2 flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: template.settings.backgroundColor,
                          color: template.settings.textColor,
                          borderColor: template.settings.accentColor,
                          borderRadius: `${template.settings.cardBorderRadius || 8}px`
                        }}
                      >
                        <div className="text-center">
                          <div className="font-semibold">Property Title</div>
                          <div style={{ color: template.settings.accentColor }}>
                            $500,000
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full mt-3"
                        variant={selectedTemplate === template.name ? "default" : "outline"}
                        size="sm"
                      >
                        {selectedTemplate === template.name ? 'Applied' : 'Apply Template'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Lightbulb className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-blue-300 font-medium">Template Tips</h4>
                    <p className="text-blue-200 text-sm mt-1">
                      Templates provide a quick starting point. After applying a template, you can further customize 
                      colors, sizes, and layout in the Customize tab to match your brand perfectly.
                    </p>
                  </div>
                </div>
              </div>
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

            {/* Enhanced Size Settings */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Maximize2 className="h-5 w-5 mr-2" />
                  Size Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Image Height: {previewSettings.imageHeight}px</Label>
                    <Badge variant="outline" className={getSizeIndicator(previewSettings.imageHeight, 100, 400).color}>
                      {getSizeIndicator(previewSettings.imageHeight, 100, 400).text}
                    </Badge>
                  </div>
                  <Slider
                    value={[previewSettings.imageHeight]}
                    onValueChange={([value]) => updateSetting('imageHeight', value)}
                    max={400}
                    min={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>100px</span>
                    <span>400px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Title Size: {previewSettings.titleSize}px</Label>
                    <Badge variant="outline" className={getSizeIndicator(previewSettings.titleSize, 12, 32).color}>
                      {getSizeIndicator(previewSettings.titleSize, 12, 32).text}
                    </Badge>
                  </div>
                  <Slider
                    value={[previewSettings.titleSize]}
                    onValueChange={([value]) => updateSetting('titleSize', value)}
                    max={32}
                    min={12}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>12px</span>
                    <span>32px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Price Size: {previewSettings.priceSize}px</Label>
                    <Badge variant="outline" className={getSizeIndicator(previewSettings.priceSize, 14, 36).color}>
                      {getSizeIndicator(previewSettings.priceSize, 14, 36).text}
                    </Badge>
                  </div>
                  <Slider
                    value={[previewSettings.priceSize]}
                    onValueChange={([value]) => updateSetting('priceSize', value)}
                    max={36}
                    min={14}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>14px</span>
                    <span>36px</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Card Border Radius: {previewSettings.cardBorderRadius}px</Label>
                    <Badge variant="outline" className={getSizeIndicator(previewSettings.cardBorderRadius, 0, 24).color}>
                      {getSizeIndicator(previewSettings.cardBorderRadius, 0, 24).text}
                    </Badge>
                  </div>
                  <Slider
                    value={[previewSettings.cardBorderRadius]}
                    onValueChange={([value]) => updateSetting('cardBorderRadius', value)}
                    max={24}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0px (Square)</span>
                    <span>24px (Very Round)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Color Settings */}
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
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={previewSettings.backgroundColor}
                      onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                      className="w-16 h-10 p-1 border-2 rounded"
                    />
                    <Input
                      type="text"
                      value={previewSettings.backgroundColor}
                      onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                      className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Text Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={previewSettings.textColor}
                      onChange={(e) => updateSetting('textColor', e.target.value)}
                      className="w-16 h-10 p-1 border-2 rounded"
                    />
                    <Input
                      type="text"
                      value={previewSettings.textColor}
                      onChange={(e) => updateSetting('textColor', e.target.value)}
                      className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                      placeholder="#1f2937"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Accent Color</Label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="color"
                      value={previewSettings.accentColor}
                      onChange={(e) => updateSetting('accentColor', e.target.value)}
                      className="w-16 h-10 p-1 border-2 rounded"
                    />
                    <Input
                      type="text"
                      value={previewSettings.accentColor}
                      onChange={(e) => updateSetting('accentColor', e.target.value)}
                      className="flex-1 bg-slate-700/50 border-slate-600 text-white"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                {/* Color Preset Buttons */}
                <div className="pt-2">
                  <Label className="text-white text-sm mb-2 block">Quick Color Presets</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Default', bg: '#ffffff', text: '#1f2937', accent: '#3b82f6' },
                      { name: 'Dark', bg: '#1f2937', text: '#f9fafb', accent: '#10b981' },
                      { name: 'Warm', bg: '#fef7ed', text: '#7c2d12', accent: '#ea580c' },
                      { name: 'Cool', bg: '#f0f9ff', text: '#0c4a6e', accent: '#0284c7' }
                    ].map((preset) => (
                      <Button
                        key={preset.name}
                        size="sm"
                        variant="outline"
                        className="flex flex-col h-16 p-1"
                        onClick={() => {
                          updateSetting('backgroundColor', preset.bg);
                          updateSetting('textColor', preset.text);
                          updateSetting('accentColor', preset.accent);
                        }}
                      >
                        <div 
                          className="w-full h-8 rounded mb-1 border"
                          style={{ 
                            backgroundColor: preset.bg,
                            borderColor: preset.accent
                          }}
                        />
                        <span className="text-xs">{preset.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings Management */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Settings Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Save Current Settings</h3>
                    <p className="text-gray-400 text-sm">Save these settings as default for the property preview</p>
                  </div>
                  <Button 
                    onClick={savePreviewSettings} 
                    disabled={!hasUnsavedChanges}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
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
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Defaults
                  </Button>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">Export Settings</h3>
                    <Button onClick={exportSettingsToJSON} variant="outline" size="sm">
                      {isSettingsCopied ? <Check className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                      {isSettingsCopied ? 'Copied!' : 'Export'}
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Export current settings as JSON for backup or sharing</p>
                  {exportedSettings && (
                    <Textarea
                      value={exportedSettings}
                      readOnly
                      className="bg-slate-700/50 border-slate-600 text-white text-xs font-mono"
                      rows={6}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Import & Advanced Options */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Import & Advanced
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white font-medium">Import Settings</Label>
                  <p className="text-gray-400 text-sm mb-3">Paste JSON settings to import configuration</p>
                  <Textarea
                    value={importSettings}
                    onChange={(e) => setImportSettings(e.target.value)}
                    placeholder="Paste JSON settings here..."
                    className="bg-slate-700/50 border-slate-600 text-white text-xs font-mono mb-2"
                    rows={6}
                  />
                  <Button 
                    onClick={importSettingsFromJSON} 
                    disabled={!importSettings.trim()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Settings
                  </Button>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <Label className="text-white font-medium">Custom CSS</Label>
                  <p className="text-gray-400 text-sm mb-3">Add custom CSS for advanced styling (Coming Soon)</p>
                  <Textarea
                    value={customCSS}
                    onChange={(e) => setCustomCSS(e.target.value)}
                    placeholder="/* Custom CSS rules will go here */
.property-card {
  /* Your custom styles */
}"
                    className="bg-slate-700/50 border-slate-600 text-white text-xs font-mono"
                    rows={8}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* Performance & Debug */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Performance & Debug
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Live Preview Mode</h3>
                    <p className="text-gray-400 text-sm">Toggle real-time updates for better performance</p>
                  </div>
                  <Switch
                    checked={isLivePreview}
                    onCheckedChange={setIsLivePreview}
                  />
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <h3 className="text-white font-medium mb-2">Preview Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-700/30 p-3 rounded">
                      <div className="text-gray-400">Properties Loaded</div>
                      <div className="text-white font-semibold">{properties?.length || 0}</div>
                    </div>
                    <div className="bg-slate-700/30 p-3 rounded">
                      <div className="text-gray-400">Render Updates</div>
                      <div className="text-white font-semibold">{previewKey}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline" 
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Hard Refresh Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Database & Sync */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database & Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-700/30 p-4 rounded">
                  <h3 className="text-white font-medium mb-2">Data Source Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Table:</span>
                      <span className="text-white">properties</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status Filter:</span>
                      <span className="text-white">{statusFilter}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Search Term:</span>
                      <span className="text-white">{searchTerm || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Loading:</span>
                      <span className="text-white">{isLoading ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  className="w-full"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>

                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 p-3 rounded">
                    <div className="text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 inline mr-2" />
                      Database Error: {error.message}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPropertySmartPreview;
