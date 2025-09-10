import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Camera, 
  Settings, 
  Eye, 
  Monitor, 
  Smartphone, 
  Tablet, 
  VolumeX, 
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Maximize,
  MousePointer,
  Sun,
  Layers,
  Palette,
  Zap,
  Upload,
  Download,
  Trash2,
  Edit
} from 'lucide-react';

const VirtualTourSettings = () => {
  const [tourSettings, setTourSettings] = useState({
    autoRotation: true,
    autoRotationSpeed: 5,
    mouseControl: true,
    touchControl: true,
    vrMode: false,
    fullscreenEnabled: true,
    audioEnabled: true,
    backgroundMusic: false,
    musicVolume: 70,
    showHotspots: true,
    showCompass: true,
    showFullscreenButton: true,
    showVRButton: false,
    initialFOV: 75,
    minFOV: 30,
    maxFOV: 120,
    quality: 'high',
    loadingAnimation: true
  });

  const [tours, setTours] = useState([
    {
      id: 1,
      name: 'Luxury Villa Ubud',
      scenes: 8,
      hotspots: 15,
      status: 'Active',
      views: 1250,
      size: '45.2 MB',
      createdAt: '2024-01-15',
      thumbnail: '/placeholder-tour.jpg'
    },
    {
      id: 2,
      name: 'Modern Apartment Jakarta',
      scenes: 5,
      hotspots: 8,
      status: 'Draft',
      views: 0,
      size: '32.1 MB',
      createdAt: '2024-01-12',
      thumbnail: '/placeholder-tour.jpg'
    },
    {
      id: 3,
      name: 'Beach House Lombok',
      scenes: 12,
      hotspots: 22,
      status: 'Active',
      views: 2100,
      size: '78.5 MB',
      createdAt: '2024-01-10',
      thumbnail: '/placeholder-tour.jpg'
    }
  ]);

  const [themes, setThemes] = useState([
    { id: 1, name: 'Modern Dark', active: true, preview: '#1a1a1a' },
    { id: 2, name: 'Classic Light', active: false, preview: '#ffffff' },
    { id: 3, name: 'Luxury Gold', active: false, preview: '#d4af37' },
    { id: 4, name: 'Ocean Blue', active: false, preview: '#0077be' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">3D Virtual Tour Settings</h2>
          <p className="text-muted-foreground">Manage virtual tours and 3D viewing experiences</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload New Tour
        </Button>
      </div>

      <Tabs defaultValue="tours" className="w-full">
        <TabsList>
          <TabsTrigger value="tours">Virtual Tours</TabsTrigger>
          <TabsTrigger value="settings">Player Settings</TabsTrigger>
          <TabsTrigger value="themes">Themes & UI</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tours" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tours</p>
                    <p className="text-2xl font-bold">{tours.length}</p>
                  </div>
                  <Camera className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Tours</p>
                    <p className="text-2xl font-bold">
                      {tours.filter(t => t.status === 'Active').length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">
                      {tours.reduce((sum, t) => sum + t.views, 0).toLocaleString()}
                    </p>
                  </div>
                  <Monitor className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                    <p className="text-2xl font-bold">155.8 MB</p>
                  </div>
                  <Layers className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tours List */}
          <Card>
            <CardHeader>
              <CardTitle>Virtual Tours</CardTitle>
              <CardDescription>Manage all virtual tours and 3D experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tours.map((tour) => (
                  <div key={tour.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{tour.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{tour.scenes} scenes</span>
                          <span>{tour.hotspots} hotspots</span>
                          <span>{tour.size}</span>
                          <span>{tour.views.toLocaleString()} views</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(tour.status)}>
                        {tour.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Player Controls</CardTitle>
                <CardDescription>Configure virtual tour player behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Rotation</Label>
                    <p className="text-sm text-muted-foreground">Automatically rotate the view</p>
                  </div>
                  <Switch 
                    checked={tourSettings.autoRotation}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, autoRotation: checked }))
                    }
                  />
                </div>

                {tourSettings.autoRotation && (
                  <div className="space-y-2">
                    <Label>Rotation Speed: {tourSettings.autoRotationSpeed}</Label>
                    <Slider
                      value={[tourSettings.autoRotationSpeed]}
                      onValueChange={(value) => 
                        setTourSettings(prev => ({ ...prev, autoRotationSpeed: value[0] }))
                      }
                      max={10}
                      min={1}
                      step={1}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mouse Control</Label>
                    <p className="text-sm text-muted-foreground">Enable mouse navigation</p>
                  </div>
                  <Switch 
                    checked={tourSettings.mouseControl}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, mouseControl: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Touch Control</Label>
                    <p className="text-sm text-muted-foreground">Enable touch navigation on mobile</p>
                  </div>
                  <Switch 
                    checked={tourSettings.touchControl}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, touchControl: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>VR Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable virtual reality support</p>
                  </div>
                  <Switch 
                    checked={tourSettings.vrMode}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, vrMode: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audio Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Audio Settings</CardTitle>
                <CardDescription>Configure audio and sound effects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audio Enabled</Label>
                    <p className="text-sm text-muted-foreground">Enable audio narration</p>
                  </div>
                  <Switch 
                    checked={tourSettings.audioEnabled}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, audioEnabled: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Background Music</Label>
                    <p className="text-sm text-muted-foreground">Play ambient background music</p>
                  </div>
                  <Switch 
                    checked={tourSettings.backgroundMusic}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, backgroundMusic: checked }))
                    }
                  />
                </div>

                {tourSettings.backgroundMusic && (
                  <div className="space-y-2">
                    <Label>Music Volume: {tourSettings.musicVolume}%</Label>
                    <Slider
                      value={[tourSettings.musicVolume]}
                      onValueChange={(value) => 
                        setTourSettings(prev => ({ ...prev, musicVolume: value[0] }))
                      }
                      max={100}
                      min={0}
                      step={5}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="ambient-sound">Ambient Sound File</Label>
                  <div className="flex gap-2">
                    <Input id="ambient-sound" placeholder="No file selected" readOnly />
                    <Button variant="outline">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Visual Settings</CardTitle>
                <CardDescription>Configure display and visual options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Quality Setting</Label>
                  <Select value={tourSettings.quality} onValueChange={(value) => 
                    setTourSettings(prev => ({ ...prev, quality: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Faster Loading)</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High (Best Quality)</SelectItem>
                      <SelectItem value="auto">Auto Detect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Initial Field of View: {tourSettings.initialFOV}°</Label>
                  <Slider
                    value={[tourSettings.initialFOV]}
                    onValueChange={(value) => 
                      setTourSettings(prev => ({ ...prev, initialFOV: value[0] }))
                    }
                    max={120}
                    min={30}
                    step={5}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min FOV: {tourSettings.minFOV}°</Label>
                    <Slider
                      value={[tourSettings.minFOV]}
                      onValueChange={(value) => 
                        setTourSettings(prev => ({ ...prev, minFOV: value[0] }))
                      }
                      max={60}
                      min={10}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max FOV: {tourSettings.maxFOV}°</Label>
                    <Slider
                      value={[tourSettings.maxFOV]}
                      onValueChange={(value) => 
                        setTourSettings(prev => ({ ...prev, maxFOV: value[0] }))
                      }
                      max={150}
                      min={90}
                      step={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* UI Elements */}
            <Card>
              <CardHeader>
                <CardTitle>UI Elements</CardTitle>
                <CardDescription>Configure visible user interface elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Hotspots</Label>
                    <p className="text-sm text-muted-foreground">Display interactive hotspots</p>
                  </div>
                  <Switch 
                    checked={tourSettings.showHotspots}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, showHotspots: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Compass</Label>
                    <p className="text-sm text-muted-foreground">Display navigation compass</p>
                  </div>
                  <Switch 
                    checked={tourSettings.showCompass}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, showCompass: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fullscreen Button</Label>
                    <p className="text-sm text-muted-foreground">Show fullscreen toggle</p>
                  </div>
                  <Switch 
                    checked={tourSettings.showFullscreenButton}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, showFullscreenButton: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>VR Button</Label>
                    <p className="text-sm text-muted-foreground">Show VR mode button</p>
                  </div>
                  <Switch 
                    checked={tourSettings.showVRButton}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, showVRButton: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Loading Animation</Label>
                    <p className="text-sm text-muted-foreground">Show loading spinner</p>
                  </div>
                  <Switch 
                    checked={tourSettings.loadingAnimation}
                    onCheckedChange={(checked) => 
                      setTourSettings(prev => ({ ...prev, loadingAnimation: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Reset to Default</Button>
            <Button>Save Settings</Button>
          </div>
        </TabsContent>

        <TabsContent value="themes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Player Themes</CardTitle>
              <CardDescription>Customize the virtual tour player appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <div key={theme.id} className="p-4 border rounded-lg">
                    <div className="w-full h-32 rounded-lg mb-3" style={{ backgroundColor: theme.preview }}>
                      <div className="flex items-center justify-center h-full">
                        <Palette className="h-8 w-8 text-white opacity-50" />
                      </div>
                    </div>
                    <h4 className="font-semibold mb-2">{theme.name}</h4>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={theme.active ? "default" : "outline"}
                        className="flex-1"
                      >
                        {theme.active ? 'Active' : 'Apply'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Theme Settings</CardTitle>
              <CardDescription>Create your own custom theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input id="primary-color" value="#0077be" />
                      <div className="w-10 h-10 bg-blue-500 rounded border"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input id="background-color" value="#1a1a1a" />
                      <div className="w-10 h-10 bg-gray-900 rounded border"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input id="text-color" value="#ffffff" />
                      <div className="w-10 h-10 bg-white rounded border"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="opensans">Open Sans</SelectItem>
                        <SelectItem value="poppins">Poppins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="border-radius">Border Radius</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select radius" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="4">Small</SelectItem>
                        <SelectItem value="8">Medium</SelectItem>
                        <SelectItem value="12">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">Create Custom Theme</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">12,450</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Session</p>
                    <p className="text-2xl font-bold">4:32</p>
                  </div>
                  <Play className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mobile Views</p>
                    <p className="text-2xl font-bold">68%</p>
                  </div>
                  <Smartphone className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">VR Sessions</p>
                    <p className="text-2xl font-bold">342</p>
                  </div>
                  <Monitor className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device Analytics</CardTitle>
              <CardDescription>Virtual tour engagement by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-blue-500" />
                    <span>Mobile</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-green-500" />
                    <span>Desktop</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                    </div>
                    <span className="text-sm font-medium">24%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tablet className="h-5 w-5 text-purple-500" />
                    <span>Tablet</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                    <span className="text-sm font-medium">8%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VirtualTourSettings;