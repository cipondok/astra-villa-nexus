import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  { name: 'Favicon', width: 64, height: 64, key: 'faviconUrl' },
  { name: 'Email Logo', width: 300, height: 80, key: 'emailLogoUrl' },
  { name: 'Mobile App Icon', width: 512, height: 512, key: 'mobileAppIcon' },
  { name: 'Chatbot Avatar', width: 128, height: 128, key: 'chatbotLogo' },
];

const ALL_LOGO_KEYS = [
  { key: 'headerLogo', label: 'Header', description: 'Main header logo', size: '200x60' },
  { key: 'footerLogo', label: 'Footer', description: 'Footer logo', size: '180x50' },
  { key: 'welcomeScreenLogo', label: 'Welcome', description: 'Loading screen', size: '200x200' },
  { key: 'faviconUrl', label: 'Favicon', description: 'Browser tab', size: '64x64' },
  { key: 'emailLogoUrl', label: 'Email', description: 'Email templates', size: '300x80' },
  { key: 'mobileAppIcon', label: 'App Icon', description: 'PWA/mobile', size: '512x512' },
  { key: 'chatbotLogo', label: 'Chatbot', description: 'AI avatar', size: '128x128' },
  { key: 'welcomePageImage', label: 'Hero', description: 'Main hero', size: '1920x1080' },
  { key: 'welcomePageBackgroundImage', label: 'Welcome BG', description: 'Welcome bg', size: '1920x1200' },
  { key: 'loginPageBackground', label: 'Login BG', description: 'Login bg', size: '1920x1080' },
  { key: 'defaultPropertyImage', label: 'Property', description: 'Fallback property', size: '800x600' },
  { key: 'defaultAvatarImage', label: 'Avatar', description: 'Fallback avatar', size: '200x200' },
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

  const persistSetting = async (settingKey: string, value: string) => {
    const payload = { category: "general", key: settingKey, value, is_public: true, description: `System setting for ${settingKey}` };
    const attempt = async (onConflict: string) => supabase.from("system_settings").upsert(payload, { onConflict });
    const { error: err1 } = await attempt("category,key");
    if (!err1) return;
    const { error: err2 } = await attempt("key");
    if (err2) throw err2;
  };

  const handleFileUpload = async (key: string, file: File): Promise<boolean> => {
    if (!file) return false;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      showError("Invalid File", "Please upload an image file");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("File Too Large", "Max 5MB");
      return false;
    }
    setUploading(key);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showError("Auth Required", "Please log in");
        return false;
      }
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `branding/${key}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("system-assets").upload(fileName, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("system-assets").getPublicUrl(fileName);
      onInputChange(key, urlData.publicUrl);
      await persistSetting(key, urlData.publicUrl);
      queryClient.invalidateQueries({ queryKey: ["system-setting"] });
      showSuccess("Uploaded", "Image saved successfully");
      return true;
    } catch (error: any) {
      showError("Upload Failed", error?.message || "Failed to upload");
      return false;
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteLogo = async (key: string) => {
    setDeleting(key);
    try {
      onInputChange(key, '');
      await persistSetting(key, '');
      queryClient.invalidateQueries({ queryKey: ["system-setting"] });
      showSuccess("Deleted", "Logo removed");
    } catch (error: any) {
      showError("Delete Failed", error?.message || "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const generateLogo = async () => {
    if (!logoPrompt.trim()) {
      showError("Prompt Required", "Enter a description");
      return;
    }
    setGenerating(true);
    setMasterLogo(null);
    setGeneratedLogos([]);
    try {
      const stylePrompts: Record<string, string> = {
        modern: "modern minimalist clean design",
        classic: "classic elegant professional design",
        playful: "playful creative colorful design",
        tech: "futuristic tech-inspired design",
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
      } else {
        showError("Generation Failed", message);
      }
    } finally {
      setGenerating(false);
    }
  };

  const generateSizeVariants = async () => {
    if (!masterLogo) {
      showError("No Master Logo", "Create a master logo first");
      return;
    }
    setGenerating(true);
    try {
      const variants: GeneratedLogo[] = [];
      for (const size of LOGO_SIZES) {
        const resized = await resizeImage(masterLogo, size.width, size.height);
        variants.push({ size: size.name, width: size.width, height: size.height, dataUrl: resized, key: size.key });
      }
      setGeneratedLogos(variants);
      showSuccess("Variants Ready", `Created ${variants.length} sizes`);
    } catch (error: any) {
      showError("Resize Failed", "Failed to generate variants");
    } finally {
      setGenerating(false);
    }
  };

  const resizeImage = (src: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!src.startsWith('data:')) img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context not available')); return; }
        ctx.clearRect(0, 0, width, height);
        const scale = Math.min(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
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
    } catch (error: any) {
      showError("Apply Failed", error?.message || "Failed to apply");
    }
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
    reader.onload = (event) => {
      setMasterLogo(event.target?.result as string);
      setGeneratedLogos([]);
      showSuccess("Loaded", "Now generate size variants");
    };
    reader.onerror = () => showError("Load Failed", "Failed to load image");
    reader.readAsDataURL(file);
  };

  const currentLogos = ALL_LOGO_KEYS.filter(item => settings[item.key]);
  const emptyLogos = ALL_LOGO_KEYS.filter(item => !settings[item.key]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            Branding Settings
          </h2>
          <p className="text-[10px] text-muted-foreground">Manage logos and branding assets</p>
        </div>
        <Button size="sm" onClick={onSave} disabled={loading} className="h-7 text-xs px-3">
          <Save className="h-3 w-3 mr-1" />
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Current Logos */}
      <Card className="bg-card/50 border-border/50 border-l-2 border-l-emerald-500">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground flex items-center gap-2">
            <ImageIcon className="h-3.5 w-3.5" />
            Current Logos ({currentLogos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {currentLogos.length === 0 ? (
            <Alert className="bg-muted/30 border-border/50">
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-[10px]">No logos configured yet. Use AI Generator or upload.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {currentLogos.map((item) => (
                <div key={item.key} className="p-2 bg-background/30 rounded-md border border-border/50 space-y-2">
                  <div>
                    <p className="text-[10px] font-medium text-foreground">{item.label}</p>
                    <p className="text-[8px] text-muted-foreground">{item.size}</p>
                  </div>
                  <div className="flex items-center justify-center p-2 bg-white dark:bg-black rounded border border-border/30 h-12">
                    <img src={settings[item.key]} alt={item.label} className="max-h-8 max-w-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                  <div className="flex gap-1">
                    <input id={`replace-${item.key}`} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(item.key, file); e.target.value = ''; }} />
                    <Button size="sm" variant="outline" className="flex-1 h-5 text-[8px] px-1" disabled={uploading === item.key} onClick={() => document.getElementById(`replace-${item.key}`)?.click()}>
                      {uploading === item.key ? <RefreshCw className="h-2 w-2 animate-spin" /> : <Upload className="h-2 w-2" />}
                    </Button>
                    <Button size="sm" variant="outline" className="h-5 w-5 p-0" onClick={() => copyLogoUrl(item.key, settings[item.key])}>
                      {copiedKey === item.key ? <Check className="h-2 w-2 text-emerald-500" /> : <Copy className="h-2 w-2" />}
                    </Button>
                    <Button size="sm" variant="outline" className="h-5 w-5 p-0" disabled={deleting === item.key} onClick={() => handleDeleteLogo(item.key)}>
                      {deleting === item.key ? <RefreshCw className="h-2 w-2 animate-spin" /> : <Trash2 className="h-2 w-2 text-destructive" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Empty Slots */}
      {emptyLogos.length > 0 && (
        <Card className="bg-card/50 border-border/50 border-l-2 border-l-blue-500">
          <CardHeader className="py-2 px-3">
            <CardTitle className="text-xs text-foreground flex items-center gap-2">
              <Upload className="h-3.5 w-3.5" />
              Upload Logos ({emptyLogos.length} empty)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {emptyLogos.map((item) => (
                <div key={item.key} className="p-2 bg-muted/20 rounded-md border border-dashed border-border/50 space-y-2">
                  <div>
                    <p className="text-[10px] font-medium text-foreground">{item.label}</p>
                    <p className="text-[8px] text-muted-foreground">{item.size}</p>
                  </div>
                  <div className="flex items-center justify-center p-2 bg-muted/30 rounded border border-dashed h-10">
                    <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <input id={`upload-${item.key}`} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(item.key, file); e.target.value = ''; }} />
                  <Button size="sm" variant="outline" className="w-full h-5 text-[8px]" disabled={uploading === item.key} onClick={() => document.getElementById(`upload-${item.key}`)?.click()}>
                    {uploading === item.key ? <RefreshCw className="h-2 w-2 animate-spin" /> : <Upload className="h-2 w-2 mr-1" />}
                    Upload
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Logo Generator */}
      <Card className="bg-card/50 border-border/50 border-l-2 border-l-purple-500">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            AI Logo Generator
          </CardTitle>
          <CardDescription className="text-[10px]">Generate a master logo and create all size variants</CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">1</Badge>
              <Label className="text-[10px] font-medium text-foreground">Create Master Logo</Label>
            </div>
            <div className="space-y-2 pl-5">
              <Textarea value={logoPrompt} onChange={(e) => setLogoPrompt(e.target.value)} placeholder="Describe your logo..." rows={2} className="text-xs bg-background/50 resize-none" />
              <div className="flex gap-2">
                <Select value={logoStyle} onValueChange={setLogoStyle}>
                  <SelectTrigger className="h-7 text-xs flex-1 bg-background/50">
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
                <Button size="sm" onClick={generateLogo} disabled={generating || !logoPrompt.trim()} className="h-7 text-xs">
                  {generating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3 mr-1" />}
                  Generate
                </Button>
                <input id="master-logo-upload" type="file" accept="image/*" className="hidden" onChange={handleMasterLogoUpload} />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('master-logo-upload')?.click()} disabled={generating} className="h-7 text-xs">
                  <Upload className="h-3 w-3 mr-1" />
                  Upload
                </Button>
              </div>
              {masterLogo && (
                <div className="p-2 bg-muted/30 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-muted-foreground">Master Preview</span>
                    <Button size="sm" variant="ghost" className="h-5 text-[9px] px-1" onClick={() => { setMasterLogo(null); setGeneratedLogos([]); }}>
                      <Trash2 className="h-2 w-2 mr-0.5" /> Clear
                    </Button>
                  </div>
                  <div className="flex items-center justify-center p-2 bg-white dark:bg-black rounded border h-20">
                    <img src={masterLogo} alt="Master" className="max-h-16 max-w-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-2 pt-2 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Badge variant={masterLogo ? "outline" : "secondary"} className="text-[9px] px-1.5 py-0">2</Badge>
              <Label className={`text-[10px] font-medium ${!masterLogo ? 'text-muted-foreground' : 'text-foreground'}`}>Generate Variants</Label>
            </div>
            <div className="pl-5">
              <Button size="sm" variant="secondary" onClick={generateSizeVariants} disabled={generating || !masterLogo} className="h-7 text-xs w-full">
                {generating ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                Generate All Sizes
              </Button>
              {!masterLogo && <p className="text-[9px] text-muted-foreground mt-1 text-center">Create master logo first</p>}
              {generatedLogos.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                  {generatedLogos.map((logo) => (
                    <div key={logo.key} className="p-2 bg-muted/30 rounded-md space-y-1">
                      <p className="text-[9px] font-medium text-foreground">{logo.size}</p>
                      <p className="text-[7px] text-muted-foreground">{logo.width}x{logo.height}</p>
                      <div className="flex items-center justify-center p-1 bg-white dark:bg-black rounded border h-10">
                        <img src={logo.dataUrl} alt={logo.size} style={{ maxWidth: Math.min(logo.width, 50), maxHeight: 32 }} className="object-contain" />
                      </div>
                      <Button size="sm" variant="outline" className="w-full h-5 text-[8px]" disabled={uploading === logo.key} onClick={() => applyLogo(logo)}>
                        {uploading === logo.key ? <RefreshCw className="h-2 w-2 animate-spin" /> : <Download className="h-2 w-2 mr-0.5" />}
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingSettings;
