import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Wand2,
  Sparkles,
  RefreshCw,
  Download,
  Copy,
  Check,
  AlertCircle,
  Save,
  Eye,
  Grid3X3,
  Palette,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Settings2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LOGO_PLACEHOLDER } from '@/hooks/useBrandingLogo';
import WelcomeScreenPreview from './WelcomeScreenPreview';

interface BrandingSettingsProps {
  settings: any;
  loading: boolean;
  onInputChange: (key: string, value: any) => void;
  onSave: () => void;
}

interface GeneratedLogo {
  size: string;
  width: number;
  height: number;
  dataUrl: string;
  key: string;
}

const LOGO_SIZES = [
  { name: 'Header Logo', width: 200, height: 60, key: 'headerLogo' },
  { name: 'Footer Logo', width: 180, height: 50, key: 'footerLogo' },
  { name: 'Loading Page Logo', width: 200, height: 200, key: 'loadingPageLogo' },
  { name: 'Welcome Screen Logo', width: 200, height: 200, key: 'welcomeScreenLogo' },
  { name: 'PWA Install Logo', width: 128, height: 128, key: 'pwaLogo' },
  { name: 'Favicon', width: 64, height: 64, key: 'faviconUrl' },
  { name: 'Email Logo', width: 300, height: 80, key: 'emailLogoUrl' },
  { name: 'Mobile App Icon', width: 512, height: 512, key: 'mobileAppIcon' },
  { name: 'Chatbot Avatar', width: 128, height: 128, key: 'chatbotLogo' },
];

const ALL_LOGO_KEYS = [
  { key: 'headerLogo', label: 'Header', description: 'Main header logo', size: '200x60', category: 'core' },
  { key: 'footerLogo', label: 'Footer', description: 'Footer logo', size: '180x50', category: 'core' },
  { key: 'loadingPageLogo', label: 'Loading', description: 'Loading popup', size: '200x200', category: 'screen' },
  { key: 'welcomeScreenLogo', label: 'Welcome', description: 'Welcome screen', size: '200x200', category: 'screen' },
  { key: 'pwaLogo', label: 'PWA', description: 'Install prompt', size: '128x128', category: 'app' },
  { key: 'faviconUrl', label: 'Favicon', description: 'Browser tab', size: '64x64', category: 'app' },
  { key: 'emailLogoUrl', label: 'Email', description: 'Email templates', size: '300x80', category: 'core' },
  { key: 'mobileAppIcon', label: 'App Icon', description: 'PWA/mobile', size: '512x512', category: 'app' },
  { key: 'chatbotLogo', label: 'Chatbot', description: 'AI avatar', size: '128x128', category: 'app' },
  { key: 'welcomePageImage', label: 'Hero', description: 'Main hero', size: '1920x1080', category: 'image' },
  { key: 'welcomePageBackgroundImage', label: 'Welcome BG', description: 'Welcome bg', size: '1920x1200', category: 'image' },
  { key: 'loginPageBackground', label: 'Login BG', description: 'Login bg', size: '1920x1080', category: 'image' },
  { key: 'defaultPropertyImage', label: 'Property', description: 'Fallback property', size: '800x600', category: 'image' },
  { key: 'defaultAvatarImage', label: 'Avatar', description: 'Fallback avatar', size: '200x200', category: 'image' },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Grid3X3 },
  { id: 'core', label: 'Core', icon: LayoutGrid },
  { id: 'screen', label: 'Screens', icon: Eye },
  { id: 'app', label: 'App', icon: Settings2 },
  { id: 'image', label: 'Images', icon: Palette },
];

const BrandingSettings = ({ settings, loading, onInputChange, onSave }: BrandingSettingsProps) => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState('');
  const [logoStyle, setLogoStyle] = useState('modern');
  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
  const [masterLogo, setMasterLogo] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const persistSetting = async (settingKey: string, value: string) => {
    const payload = { category: "general", key: settingKey, value, is_public: true, description: `System setting for ${settingKey}` };
    const attempt = async (onConflict: string) => supabase.from("system_settings").upsert(payload, { onConflict });
    const { error: err1 } = await attempt("key");
    if (!err1) return;
    const { error: err2 } = await attempt("category,key");
    if (err2) throw err2;
  };

  const handleFileUpload = async (key: string, file: File): Promise<boolean> => {
    if (!file) return false;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) { showError("Invalid File", "Please upload an image file"); return false; }
    if (file.size > 5 * 1024 * 1024) { showError("File Too Large", "Max 5MB"); return false; }
    setUploading(key);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { showError("Auth Required", "Please log in"); return false; }
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `branding/${key}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("system-assets").upload(fileName, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("system-assets").getPublicUrl(fileName);
      onInputChange(key, urlData.publicUrl);
      await persistSetting(key, urlData.publicUrl);
      queryClient.invalidateQueries({ queryKey: ["system-setting"] });
      queryClient.invalidateQueries({ queryKey: ["branding-logo"] });
      showSuccess("Uploaded", "Image saved successfully");
      return true;
    } catch (error: any) { showError("Upload Failed", error?.message || "Failed to upload"); return false; }
    finally { setUploading(null); }
  };

  const handleDeleteLogo = async (key: string) => {
    setDeleting(key);
    try {
      onInputChange(key, '');
      await persistSetting(key, '');
      queryClient.invalidateQueries({ queryKey: ["system-setting"] });
      queryClient.invalidateQueries({ queryKey: ["branding-logo"] });
      showSuccess("Deleted", "Logo removed");
    } catch (error: any) { showError("Delete Failed", error?.message || "Failed to delete"); }
    finally { setDeleting(null); }
  };

  const generateLogo = async () => {
    if (!logoPrompt.trim()) { showError("Prompt Required", "Enter a description"); return; }
    setGenerating(true); setMasterLogo(null); setGeneratedLogos([]);
    try {
      const stylePrompts: Record<string, string> = {
        modern: "modern minimalist clean design", classic: "classic elegant professional design",
        playful: "playful creative colorful design", tech: "futuristic tech-inspired design",
        luxury: "luxurious premium design with gold accents",
      };
      const fullPrompt = `Create a professional company logo for: ${logoPrompt}. Style: ${stylePrompts[logoStyle]}. High quality vector-style logo.`;
      const response = await supabase.functions.invoke('ai-image-generator', { body: { prompt: fullPrompt } });
      if (response.error) throw new Error(response.error?.message || String(response.error));
      if (response.data?.error) throw new Error(response.data.error);
      const imageUrl = response.data?.imageUrl || response.data?.image;
      if (!imageUrl) throw new Error("No image generated");
      setMasterLogo(imageUrl);
      showSuccess("Generated", "Now generate size variants");
    } catch (error: any) {
      const message = error?.message || "Failed to generate";
      if (message.toLowerCase().includes('billing') || message.toLowerCase().includes('limit')) {
        showError("AI Unavailable", "Usage limit reached. Upload an existing logo instead.");
      } else { showError("Generation Failed", message); }
    } finally { setGenerating(false); }
  };

  const generateSizeVariants = async () => {
    if (!masterLogo) { showError("No Master Logo", "Create a master logo first"); return; }
    setGenerating(true);
    try {
      const variants: GeneratedLogo[] = [];
      for (const size of LOGO_SIZES) {
        const resized = await resizeImage(masterLogo, size.width, size.height);
        variants.push({ size: size.name, width: size.width, height: size.height, dataUrl: resized, key: size.key });
      }
      setGeneratedLogos(variants);
      showSuccess("Variants Ready", `Created ${variants.length} sizes`);
    } catch { showError("Resize Failed", "Failed to generate variants"); }
    finally { setGenerating(false); }
  };

  const resizeImage = (src: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context not available')); return; }
        ctx.clearRect(0, 0, width, height);
        const scale = Math.min(width / img.width, height / img.height);
        const sw = img.width * scale, sh = img.height * scale;
        ctx.drawImage(img, (width - sw) / 2, (height - sh) / 2, sw, sh);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  const applyLogo = async (logo: GeneratedLogo) => {
    setUploading(logo.key);
    try {
      const response = await fetch(logo.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${logo.key}.png`, { type: "image/png" });
      const ok = await handleFileUpload(logo.key, file);
      if (ok) showSuccess("Applied", `${logo.size} saved`);
    } catch (error: any) { showError("Apply Failed", error?.message || "Failed to apply"); }
  };

  const copyLogoUrl = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    showSuccess("Copied", "URL copied");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleMasterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { setMasterLogo(event.target?.result as string); setGeneratedLogos([]); showSuccess("Loaded", "Now generate size variants"); };
    reader.onerror = () => showError("Load Failed", "Failed to load image");
    reader.readAsDataURL(file);
  };

  const filteredLogos = activeCategory === 'all'
    ? ALL_LOGO_KEYS
    : ALL_LOGO_KEYS.filter(item => item.category === activeCategory);

  const configuredCount = ALL_LOGO_KEYS.filter(item => settings[item.key]).length;
  const totalCount = ALL_LOGO_KEYS.length;

  return (
    <div className="space-y-4 w-full overflow-x-hidden">
      {/* Header with Status */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary shrink-0" />
            Branding Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Centralized logo & asset management
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={configuredCount === totalCount ? 'default' : 'secondary'}
            className="text-[10px] px-2 py-0.5"
          >
            {configuredCount === totalCount ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            {configuredCount}/{totalCount} set
          </Badge>
          <Button size="sm" onClick={onSave} disabled={loading} className="h-8 text-xs px-4">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {loading ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList className="h-9 bg-muted/40 border border-border/30">
          <TabsTrigger value="assets" className="text-xs gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Live Preview
          </TabsTrigger>
          <TabsTrigger value="generator" className="text-xs gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            AI Generator
          </TabsTrigger>
        </TabsList>

        {/* ─── Assets Tab ─── */}
        <TabsContent value="assets" className="space-y-4 mt-0">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = cat.id === 'all'
                ? ALL_LOGO_KEYS.length
                : ALL_LOGO_KEYS.filter(i => i.category === cat.id).length;
              const setCount = cat.id === 'all'
                ? configuredCount
                : ALL_LOGO_KEYS.filter(i => i.category === cat.id && settings[i.key]).length;
              return (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={activeCategory === cat.id ? 'default' : 'outline'}
                  className="h-7 text-[11px] px-3 gap-1.5"
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <Icon className="h-3 w-3" />
                  {cat.label}
                  <span className="text-[9px] opacity-70">{setCount}/{count}</span>
                </Button>
              );
            })}
          </div>

          {/* Logo Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredLogos.map((item) => {
              const hasLogo = !!settings[item.key];
              return (
                <Card
                  key={item.key}
                  className={`overflow-hidden transition-all ${
                    hasLogo
                      ? 'border-primary/30 bg-card shadow-sm'
                      : 'border-dashed border-border/50 bg-muted/10'
                  }`}
                >
                  <CardContent className="p-3 space-y-2">
                    {/* Label row */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-foreground truncate">{item.label}</p>
                        <p className="text-[9px] text-muted-foreground">{item.description}</p>
                      </div>
                      {hasLogo ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                      )}
                    </div>

                    {/* Preview */}
                    <div className="flex items-center justify-center rounded-lg border bg-background/60 h-20 overflow-hidden">
                      {hasLogo ? (
                        <img
                          src={settings[item.key]}
                          alt={item.label}
                          className="max-h-16 max-w-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-muted-foreground/30">
                          <ImageIcon className="h-6 w-6" />
                          <span className="text-[8px]">{item.size}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <input
                        id={`branding-${item.key}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(item.key, file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        size="sm"
                        variant={hasLogo ? 'outline' : 'default'}
                        className="flex-1 h-7 text-[10px] px-2"
                        disabled={uploading === item.key}
                        onClick={() => document.getElementById(`branding-${item.key}`)?.click()}
                      >
                        {uploading === item.key ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <Upload className="h-3 w-3 mr-1" />
                            {hasLogo ? 'Replace' : 'Upload'}
                          </>
                        )}
                      </Button>
                      {hasLogo && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => copyLogoUrl(item.key, settings[item.key])}
                          >
                            {copiedKey === item.key ? (
                              <Check className="h-3 w-3 text-primary" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            disabled={deleting === item.key}
                            onClick={() => handleDeleteLogo(item.key)}
                          >
                            {deleting === item.key ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ─── Live Preview Tab ─── */}
        <TabsContent value="preview" className="mt-0">
          <WelcomeScreenPreview settings={settings} />
        </TabsContent>

        {/* ─── AI Generator Tab ─── */}
        <TabsContent value="generator" className="space-y-4 mt-0">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Logo Generator
              </CardTitle>
              <CardDescription className="text-xs">Generate a master logo and create all size variants automatically</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Create Master */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-mono">1</Badge>
                  <Label className="text-xs font-medium">Create Master Logo</Label>
                </div>
                <div className="pl-7 space-y-3">
                  <Textarea
                    value={logoPrompt}
                    onChange={(e) => setLogoPrompt(e.target.value)}
                    placeholder="Describe your logo (e.g., 'luxury real estate company with modern typography')..."
                    rows={2}
                    className="text-xs bg-background/50 resize-none"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Select value={logoStyle} onValueChange={setLogoStyle}>
                      <SelectTrigger className="h-8 text-xs w-full sm:w-auto sm:min-w-[130px] bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                        <SelectItem value="tech">Tech</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={generateLogo} disabled={generating || !logoPrompt.trim()} className="h-8 text-xs">
                      {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> : <Wand2 className="h-3.5 w-3.5 mr-1" />}
                      Generate
                    </Button>
                    <input id="master-logo-upload" type="file" accept="image/*" className="hidden" onChange={handleMasterLogoUpload} />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('master-logo-upload')?.click()} disabled={generating} className="h-8 text-xs">
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      Upload Master
                    </Button>
                  </div>

                  {masterLogo && (
                    <div className="p-3 bg-muted/20 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium text-muted-foreground">Master Preview</span>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => { setMasterLogo(null); setGeneratedLogos([]); }}>
                          <Trash2 className="h-2.5 w-2.5 mr-1" /> Clear
                        </Button>
                      </div>
                      <div className="flex items-center justify-center p-3 bg-background rounded-md border h-24">
                        <img src={masterLogo} alt="Master" className="max-h-20 max-w-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Generate Variants */}
              <div className="space-y-3 pt-3 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <Badge variant={masterLogo ? "outline" : "secondary"} className="text-[10px] px-2 py-0.5 font-mono">2</Badge>
                  <Label className={`text-xs font-medium ${!masterLogo ? 'text-muted-foreground' : ''}`}>Generate All Sizes</Label>
                </div>
                <div className="pl-7 space-y-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={generateSizeVariants}
                    disabled={generating || !masterLogo}
                    className="h-8 text-xs w-full"
                  >
                    {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                    Generate {LOGO_SIZES.length} Variants
                  </Button>
                  {!masterLogo && (
                    <p className="text-[10px] text-muted-foreground text-center">Create or upload a master logo first</p>
                  )}

                  {generatedLogos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {generatedLogos.map((logo) => (
                        <Card key={logo.key} className="overflow-hidden">
                          <CardContent className="p-2 space-y-1.5">
                            <p className="text-[10px] font-medium truncate">{logo.size}</p>
                            <p className="text-[8px] text-muted-foreground">{logo.width}×{logo.height}</p>
                            <div className="flex items-center justify-center p-1.5 bg-muted/20 rounded border h-14">
                              <img
                                src={logo.dataUrl}
                                alt={logo.size}
                                style={{ maxWidth: Math.min(logo.width, 60), maxHeight: 44 }}
                                className="object-contain"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full h-7 text-[10px]"
                              disabled={uploading === logo.key}
                              onClick={() => applyLogo(logo)}
                            >
                              {uploading === logo.key ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Download className="h-3 w-3 mr-1" />
                                  Apply
                                </>
                              )}
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandingSettings;
