import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Glasses, Image, Settings, Upload, Trash2, Plus, 
  Eye, EyeOff, Save, Loader2, MapPin, Sun, Moon,
  Ruler, Sparkles, RefreshCw, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface VRTourConfig {
  defaultPanoramaUrl: string;
  enableAIStaging: boolean;
  enableMeasurement: boolean;
  enableDayNightToggle: boolean;
  enableNeighborhood: boolean;
  defaultLightingMode: 'day' | 'night' | 'warm' | 'cool';
  initialZoom: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  showHotspots: boolean;
  panoramaQuality: 'low' | 'medium' | 'high';
  vrModeEnabled: boolean;
  pageTitle: string;
  pageDescription: string;
}

interface PanoramaImage {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: string;
  isDefault: boolean;
  createdAt: string;
}

const defaultConfig: VRTourConfig = {
  defaultPanoramaUrl: '',
  enableAIStaging: true,
  enableMeasurement: true,
  enableDayNightToggle: true,
  enableNeighborhood: true,
  defaultLightingMode: 'day',
  initialZoom: 1,
  autoRotate: false,
  autoRotateSpeed: 0.5,
  showHotspots: true,
  panoramaQuality: 'high',
  vrModeEnabled: true,
  pageTitle: 'VR Property Tours',
  pageDescription: 'Explore properties in immersive 360° virtual reality'
};

const VRTourSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<VRTourConfig>(defaultConfig);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageName, setNewImageName] = useState('');
  const [newImageCategory, setNewImageCategory] = useState('living-room');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch VR tour settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['vr-tour-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'vr_tour_config')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching VR settings:', error);
      }
      
      if (data?.value) {
        const parsed = typeof data.value === 'string' 
          ? JSON.parse(data.value) 
          : data.value;
        setConfig({ ...defaultConfig, ...parsed });
        return parsed;
      }
      return defaultConfig;
    }
  });

  // Fetch panorama images
  const { data: panoramas = [], isLoading: loadingPanoramas } = useQuery({
    queryKey: ['vr-panorama-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'vr_panorama_images')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching panoramas:', error);
      }
      
      if (data?.value) {
        return typeof data.value === 'string' 
          ? JSON.parse(data.value) 
          : data.value;
      }
      return [];
    }
  });

  // Save settings mutation
  const saveSettings = useMutation({
    mutationFn: async (newConfig: VRTourConfig) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'vr_tour_config',
          category: 'vr_tour',
          value: JSON.stringify(newConfig),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      
      if (error) throw error;
      return newConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vr-tour-settings'] });
      toast.success('VR Tour settings saved successfully');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    }
  });

  // Save panoramas mutation
  const savePanoramas = useMutation({
    mutationFn: async (images: PanoramaImage[]) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'vr_panorama_images',
          category: 'vr_tour',
          value: JSON.stringify(images),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
      
      if (error) throw error;
      return images;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vr-panorama-images'] });
      toast.success('Panorama images updated');
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Failed to save panorama images');
    }
  });

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await saveSettings.mutateAsync(config);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPanorama = () => {
    if (!newImageUrl || !newImageName) {
      toast.error('Please provide image URL and name');
      return;
    }

    const newPanorama: PanoramaImage = {
      id: crypto.randomUUID(),
      name: newImageName,
      url: newImageUrl,
      thumbnail: newImageUrl,
      category: newImageCategory,
      isDefault: panoramas.length === 0,
      createdAt: new Date().toISOString()
    };

    savePanoramas.mutate([...panoramas, newPanorama]);
    setNewImageUrl('');
    setNewImageName('');
    setShowAddDialog(false);
  };

  const handleDeletePanorama = (id: string) => {
    const updated = panoramas.filter((p: PanoramaImage) => p.id !== id);
    savePanoramas.mutate(updated);
  };

  const handleSetDefault = (id: string) => {
    const updated = panoramas.map((p: PanoramaImage) => ({
      ...p,
      isDefault: p.id === id
    }));
    savePanoramas.mutate(updated);
    
    const defaultImage = updated.find((p: PanoramaImage) => p.isDefault);
    if (defaultImage) {
      setConfig(prev => ({ ...prev, defaultPanoramaUrl: defaultImage.url }));
    }
  };

  const categories = [
    { value: 'living-room', label: 'Living Room' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'bathroom', label: 'Bathroom' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'garden', label: 'Garden' },
    { value: 'pool', label: 'Pool' },
    { value: 'other', label: 'Other' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Glasses className="h-6 w-6 text-primary" />
            VR Tour Settings
          </h2>
          <p className="text-muted-foreground">
            Configure 360° virtual tour settings and manage panorama images
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="/vr-tour" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </a>
          </Button>
          <Button onClick={handleSaveConfig} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="panoramas">
            <Image className="h-4 w-4 mr-2" />
            Panoramas
          </TabsTrigger>
          <TabsTrigger value="features">
            <Sparkles className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Settings</CardTitle>
              <CardDescription>Configure VR tour page title and description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input
                    value={config.pageTitle}
                    onChange={(e) => setConfig(prev => ({ ...prev, pageTitle: e.target.value }))}
                    placeholder="VR Property Tours"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Panorama URL</Label>
                  <Input
                    value={config.defaultPanoramaUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, defaultPanoramaUrl: e.target.value }))}
                    placeholder="https://example.com/panorama.jpg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Page Description</Label>
                <Textarea
                  value={config.pageDescription}
                  onChange={(e) => setConfig(prev => ({ ...prev, pageDescription: e.target.value }))}
                  placeholder="Explore properties in immersive 360° virtual reality"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Viewer Settings</CardTitle>
              <CardDescription>Configure panorama viewer behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Lighting Mode</Label>
                  <Select
                    value={config.defaultLightingMode}
                    onValueChange={(value: 'day' | 'night' | 'warm' | 'cool') => 
                      setConfig(prev => ({ ...prev, defaultLightingMode: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day (Natural)</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                      <SelectItem value="warm">Warm</SelectItem>
                      <SelectItem value="cool">Cool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Panorama Quality</Label>
                  <Select
                    value={config.panoramaQuality}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setConfig(prev => ({ ...prev, panoramaQuality: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Faster)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Best Quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Initial Zoom Level</Label>
                  <Input
                    type="number"
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={config.initialZoom}
                    onChange={(e) => setConfig(prev => ({ ...prev, initialZoom: parseFloat(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Auto Rotate Speed</Label>
                  <Input
                    type="number"
                    min={0.1}
                    max={2}
                    step={0.1}
                    value={config.autoRotateSpeed}
                    onChange={(e) => setConfig(prev => ({ ...prev, autoRotateSpeed: parseFloat(e.target.value) || 0.5 }))}
                    disabled={!config.autoRotate}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Rotate</Label>
                    <p className="text-xs text-muted-foreground">Automatically rotate panorama when idle</p>
                  </div>
                  <Switch
                    checked={config.autoRotate}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoRotate: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Hotspots</Label>
                    <p className="text-xs text-muted-foreground">Display interactive hotspots on panorama</p>
                  </div>
                  <Switch
                    checked={config.showHotspots}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showHotspots: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>VR Mode</Label>
                    <p className="text-xs text-muted-foreground">Enable VR headset support</p>
                  </div>
                  <Switch
                    checked={config.vrModeEnabled}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, vrModeEnabled: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Panorama Images */}
        <TabsContent value="panoramas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Panorama Images</CardTitle>
                  <CardDescription>Manage 360° panorama images for the VR tour</CardDescription>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Panorama
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Panorama Image</DialogTitle>
                      <DialogDescription>
                        Add a new 360° panorama image to the library
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Image Name</Label>
                        <Input
                          value={newImageName}
                          onChange={(e) => setNewImageName(e.target.value)}
                          placeholder="e.g., Modern Living Room"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="https://example.com/panorama.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={newImageCategory}
                          onValueChange={setNewImageCategory}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {newImageUrl && (
                        <div className="space-y-2">
                          <Label>Preview</Label>
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-muted">
                            <img 
                              src={newImageUrl} 
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPanorama}>
                        <Upload className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPanoramas ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : panoramas.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No panorama images added yet</p>
                  <Button variant="outline" onClick={() => setShowAddDialog(true)}>
                    Add your first panorama
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {panoramas.map((panorama: PanoramaImage) => (
                      <Card key={panorama.id} className="overflow-hidden">
                        <div className="relative aspect-video bg-muted">
                          <img
                            src={panorama.url}
                            alt={panorama.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          {panorama.isDefault && (
                            <Badge className="absolute top-2 left-2 bg-primary">
                              Default
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className="absolute top-2 right-2 bg-background/80"
                          >
                            {categories.find(c => c.value === panorama.category)?.label || panorama.category}
                          </Badge>
                        </div>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">{panorama.name}</p>
                            <div className="flex items-center gap-1">
                              {!panorama.isDefault && (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleSetDefault(panorama.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeletePanorama(panorama.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable VR tour features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Sparkles className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <Label className="text-base">AI Virtual Staging</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to add virtual furniture using AI
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.enableAIStaging}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableAIStaging: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-4/10">
                    <Ruler className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <Label className="text-base">Distance Measurement</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable interactive distance measurement tool
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.enableMeasurement}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableMeasurement: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-3/10">
                    <Sun className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <Label className="text-base">Day/Night Toggle</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow switching between day and night lighting modes
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.enableDayNightToggle}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableDayNightToggle: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-1/10">
                    <MapPin className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <Label className="text-base">Neighborhood Explorer</Label>
                    <p className="text-sm text-muted-foreground">
                      Show nearby points of interest and neighborhood info
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.enableNeighborhood}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enableNeighborhood: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VRTourSettings;
