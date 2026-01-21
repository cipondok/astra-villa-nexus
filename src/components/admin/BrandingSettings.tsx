import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Image, Upload, Trash2, Eye, Save, RotateCcw, 
  Monitor, Smartphone, Moon, Sun, Globe, Layout, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import astraLogo from '@/assets/astra-logo.png';

interface LogoAsset {
  id: string;
  name: string;
  description: string;
  currentUrl: string;
  type: 'image' | 'icon';
  usedIn: string[];
  lightMode?: string;
  darkMode?: string;
}

const BrandingSettings = () => {
  const [isUploading, setIsUploading] = useState<string | null>(null);
  
  const [logos, setLogos] = useState<LogoAsset[]>([
    {
      id: 'welcome-screen',
      name: 'Welcome Screen Logo',
      description: 'Displayed on the initial loading screen',
      currentUrl: astraLogo,
      type: 'image',
      usedIn: ['Loading Screen', 'Splash Page'],
    },
    {
      id: 'navbar',
      name: 'Navbar Logo',
      description: 'Main navigation header logo',
      currentUrl: astraLogo,
      type: 'image',
      usedIn: ['Header', 'Navigation'],
      lightMode: astraLogo,
      darkMode: astraLogo,
    },
    {
      id: 'footer',
      name: 'Footer Logo',
      description: 'Logo displayed in the website footer',
      currentUrl: astraLogo,
      type: 'image',
      usedIn: ['Footer'],
    },
    {
      id: 'favicon',
      name: 'Favicon',
      description: 'Browser tab icon (recommended: 32x32 or 16x16)',
      currentUrl: '/favicon.ico',
      type: 'icon',
      usedIn: ['Browser Tab', 'Bookmarks'],
    },
    {
      id: 'og-image',
      name: 'Social Share Image',
      description: 'Image shown when sharing on social media (1200x630)',
      currentUrl: '/og-image.png',
      type: 'image',
      usedIn: ['Facebook', 'Twitter', 'LinkedIn'],
    },
    {
      id: 'email-logo',
      name: 'Email Header Logo',
      description: 'Logo used in email templates',
      currentUrl: astraLogo,
      type: 'image',
      usedIn: ['Email Templates', 'Notifications'],
    },
  ]);

  const [brandSettings, setBrandSettings] = useState({
    brandName: 'ASTRA Villa',
    tagline: 'Premium Real Estate',
    primaryColor: '#f0b90b',
    useDarkModeLogo: true,
    showLogoInEmails: true,
  });

  const handleUpload = async (logoId: string) => {
    setIsUploading(logoId);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUploading(null);
    toast.success(`${logos.find(l => l.id === logoId)?.name} updated successfully`);
  };

  const handleSave = () => {
    toast.success('Branding settings saved successfully');
  };

  const handleReset = () => {
    toast.info('Settings reset to defaults');
  };

  const LogoCard = ({ logo }: { logo: LogoAsset }) => (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              {logo.type === 'icon' ? <Globe className="h-4 w-4" /> : <Image className="h-4 w-4" />}
              {logo.name}
            </CardTitle>
            <CardDescription className="text-xs mt-1">{logo.description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-[9px]">
            {logo.type.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Preview */}
        <div className="relative h-24 rounded-lg bg-muted/50 border-2 border-dashed border-border flex items-center justify-center overflow-hidden group">
          {logo.currentUrl ? (
            <img 
              src={logo.currentUrl} 
              alt={logo.name}
              className="max-h-20 max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '';
                (e.target as HTMLImageElement).className = 'hidden';
              }}
            />
          ) : (
            <div className="text-center">
              <Image className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-[10px] text-muted-foreground mt-1">No image</p>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => handleUpload(logo.id)}
              disabled={isUploading === logo.id}
            >
              {isUploading === logo.id ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Upload className="h-3 w-3 mr-1" />
              )}
              Upload
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Dark/Light mode variants */}
        {logo.lightMode && logo.darkMode && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded bg-white border">
              <div className="flex items-center gap-1 mb-1">
                <Sun className="h-3 w-3 text-amber-500" />
                <span className="text-[9px] text-muted-foreground">Light</span>
              </div>
              <img 
                src={logo.lightMode} 
                alt="Light mode" 
                className="h-8 object-contain mx-auto"
              />
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-700">
              <div className="flex items-center gap-1 mb-1">
                <Moon className="h-3 w-3 text-slate-400" />
                <span className="text-[9px] text-slate-400">Dark</span>
              </div>
              <img 
                src={logo.darkMode} 
                alt="Dark mode" 
                className="h-8 object-contain mx-auto"
              />
            </div>
          </div>
        )}

        {/* Used in */}
        <div className="flex flex-wrap gap-1">
          {logo.usedIn.map((usage) => (
            <Badge key={usage} variant="secondary" className="text-[9px] h-5">
              {usage}
            </Badge>
          ))}
        </div>

        {/* URL Input */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Image URL/Path</Label>
          <Input 
            value={logo.currentUrl}
            onChange={(e) => {
              const updated = logos.map(l => 
                l.id === logo.id ? {...l, currentUrl: e.target.value} : l
              );
              setLogos(updated);
            }}
            placeholder="/assets/logo.png"
            className="h-7 text-xs"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 h-7 text-xs"
            onClick={() => handleUpload(logo.id)}
            disabled={isUploading === logo.id}
          >
            {isUploading === logo.id ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Upload className="h-3 w-3 mr-1" />
            )}
            Replace
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Branding Settings</h1>
            <p className="text-sm text-muted-foreground">Manage logos and branding assets across the website</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save All
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-9">
          <TabsTrigger value="logos" className="text-xs gap-1.5">
            <Image className="h-3.5 w-3.5" />
            Logo Assets
          </TabsTrigger>
          <TabsTrigger value="brand" className="text-xs gap-1.5">
            <Layout className="h-3.5 w-3.5" />
            Brand Identity
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Logo Assets Tab */}
        <TabsContent value="logos" className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Image className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">{logos.length}</p>
                  <p className="text-[10px] text-muted-foreground">Total Assets</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">{logos.filter(l => l.currentUrl).length}</p>
                  <p className="text-[10px] text-muted-foreground">Configured</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Sun className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">{logos.filter(l => l.lightMode).length}</p>
                  <p className="text-[10px] text-muted-foreground">Light Variants</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
                  <Moon className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-lg font-bold">{logos.filter(l => l.darkMode).length}</p>
                  <p className="text-[10px] text-muted-foreground">Dark Variants</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Logo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logos.map((logo) => (
              <LogoCard key={logo.id} logo={logo} />
            ))}
          </div>
        </TabsContent>

        {/* Brand Identity Tab */}
        <TabsContent value="brand" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Brand Information
                </CardTitle>
                <CardDescription className="text-xs">Core brand identity settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Brand Name</Label>
                  <Input 
                    value={brandSettings.brandName}
                    onChange={(e) => setBrandSettings({...brandSettings, brandName: e.target.value})}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tagline</Label>
                  <Input 
                    value={brandSettings.tagline}
                    onChange={(e) => setBrandSettings({...brandSettings, tagline: e.target.value})}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Primary Brand Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="color"
                      value={brandSettings.primaryColor}
                      onChange={(e) => setBrandSettings({...brandSettings, primaryColor: e.target.value})}
                      className="h-8 w-12 p-1 cursor-pointer"
                    />
                    <Input 
                      value={brandSettings.primaryColor}
                      onChange={(e) => setBrandSettings({...brandSettings, primaryColor: e.target.value})}
                      className="h-8 text-xs flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Display Options
                </CardTitle>
                <CardDescription className="text-xs">Configure logo display behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Use Dark Mode Logo Variants</Label>
                    <p className="text-[10px] text-muted-foreground">Switch logos based on theme</p>
                  </div>
                  <Switch 
                    checked={brandSettings.useDarkModeLogo}
                    onCheckedChange={(checked) => setBrandSettings({...brandSettings, useDarkModeLogo: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs">Show Logo in Emails</Label>
                    <p className="text-[10px] text-muted-foreground">Include logo in email headers</p>
                  </div>
                  <Switch 
                    checked={brandSettings.showLogoInEmails}
                    onCheckedChange={(checked) => setBrandSettings({...brandSettings, showLogoInEmails: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Welcome Screen Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Welcome Screen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 border flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <img 
                        src={logos.find(l => l.id === 'welcome-screen')?.currentUrl} 
                        alt="Logo" 
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        <span className="text-primary">ASTRA</span>
                        <span className="text-foreground ml-1">Villa</span>
                      </h3>
                      <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                        {brandSettings.tagline}
                      </p>
                    </div>
                    <div className="w-32 mx-auto">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navbar Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Navigation Header</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={logos.find(l => l.id === 'navbar')?.currentUrl} 
                        alt="Logo" 
                        className="h-8 w-8 object-contain"
                      />
                      <span className="font-bold text-sm">{brandSettings.brandName}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Properties</span>
                      <span>About</span>
                      <span>Contact</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Footer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={logos.find(l => l.id === 'footer')?.currentUrl} 
                      alt="Logo" 
                      className="h-10 w-10 object-contain"
                    />
                    <div>
                      <p className="font-bold text-sm">{brandSettings.brandName}</p>
                      <p className="text-[10px] text-muted-foreground">{brandSettings.tagline}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Browser Tab Preview */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Browser Tab</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-muted/50 p-2">
                  <div className="flex items-center gap-2 bg-background rounded px-3 py-2">
                    <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
                      <img 
                        src={logos.find(l => l.id === 'favicon')?.currentUrl} 
                        alt="Favicon" 
                        className="w-3 h-3 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="text-xs truncate">{brandSettings.brandName} - Premium Real Estate</span>
                    <span className="text-muted-foreground text-xs ml-auto">×</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandingSettings;
