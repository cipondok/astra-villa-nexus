import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image as ImageIcon, 
  Upload, 
  LayoutTemplate, 
  MessageCircle, 
  Mail,
  Home,
  Trash2,
  Wand2,
  Sparkles,
  RefreshCw,
  Download,
  Copy,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const BrandingSettings = ({ settings, loading, onInputChange, onSave }: BrandingSettingsProps) => {
  const { showSuccess, showError } = useAlert();
  const [uploading, setUploading] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [logoPrompt, setLogoPrompt] = useState('');
  const [logoStyle, setLogoStyle] = useState('modern');
  const [generatedLogos, setGeneratedLogos] = useState<GeneratedLogo[]>([]);
  const [masterLogo, setMasterLogo] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFileUpload = async (key: string, file: File) => {
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      showError("Invalid File", "Please upload an image file (JPG, PNG, GIF, WebP, or SVG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("File Too Large", "Please upload an image smaller than 5MB");
      return;
    }

    setUploading(key);

    const persistSetting = async (settingKey: string, value: string) => {
      const payload = {
        category: "general",
        key: settingKey,
        value,
        description: `System setting for ${settingKey}`,
      };

      const attempt = async (onConflict: string) =>
        supabase.from("system_settings").upsert(payload, { onConflict });

      const { error: err1 } = await attempt("category,key");
      if (!err1) return;

      const { error: err2 } = await attempt("key");
      if (err2) throw err2;
    };

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showError("Authentication Required", "Please log in to upload images");
        setUploading(null);
        return;
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `branding/${key}_${Date.now()}.${fileExt}`;

      console.log("Uploading file:", fileName, "Size:", file.size, "Type:", file.type);

      const { error: uploadError, data } = await supabase.storage
        .from("system-assets")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw uploadError;
      }

      console.log("Upload successful:", data);

      const { data: urlData } = supabase.storage.from("system-assets").getPublicUrl(fileName);

      console.log("Public URL:", urlData.publicUrl);

      onInputChange(key, urlData.publicUrl);
      await persistSetting(key, urlData.publicUrl);

      showSuccess("Upload Complete", "Image uploaded and saved successfully");
    } catch (error: any) {
      console.error("Upload error details:", error);
      const errorMessage = error?.message || error?.error_description || "Failed to upload image";
      showError("Upload Failed", errorMessage);
    } finally {
      setUploading(null);
    }
  };

  // Generate logo using AI
  const generateLogo = async () => {
    if (!logoPrompt.trim()) {
      showError("Prompt Required", "Please enter a description for your logo");
      return;
    }

    setGenerating(true);
    try {
      const stylePrompts: Record<string, string> = {
        modern: "modern minimalist clean design with simple geometric shapes",
        classic: "classic elegant professional design with refined typography",
        playful: "playful creative colorful design with friendly aesthetic",
        tech: "futuristic tech-inspired design with sleek digital elements",
        luxury: "luxurious premium design with gold accents and sophisticated feel",
      };

      const fullPrompt = `Create a professional company logo for: ${logoPrompt}. Style: ${stylePrompts[logoStyle]}. The logo should be centered, on a transparent or simple background, suitable for business branding. High quality vector-style logo.`;

      const response = await supabase.functions.invoke('ai-image-generator', {
        body: { prompt: fullPrompt }
      });

      if (response.error) throw response.error;

      const imageUrl = response.data?.imageUrl || response.data?.image;
      
      if (!imageUrl) {
        throw new Error("No image generated");
      }

      setMasterLogo(imageUrl);
      showSuccess("Logo Generated", "Your logo has been created! Now generate size variants.");
      
    } catch (error: any) {
      console.error("Logo generation error:", error);
      showError("Generation Failed", error.message || "Failed to generate logo");
    } finally {
      setGenerating(false);
    }
  };

  // Generate size variants from master logo
  const generateSizeVariants = async () => {
    if (!masterLogo) {
      showError("No Master Logo", "Please generate or upload a master logo first");
      return;
    }

    setGenerating(true);
    try {
      const variants: GeneratedLogo[] = [];

      for (const size of LOGO_SIZES) {
        // Create resized version using canvas
        const resized = await resizeImage(masterLogo, size.width, size.height);
        variants.push({
          size: size.name,
          width: size.width,
          height: size.height,
          dataUrl: resized,
          key: size.key
        });
      }

      setGeneratedLogos(variants);
      showSuccess("Variants Generated", `Created ${variants.length} logo size variants`);
    } catch (error: any) {
      console.error("Resize error:", error);
      showError("Resize Failed", "Failed to generate size variants");
    } finally {
      setGenerating(false);
    }
  };

  // Resize image using canvas
  const resizeImage = (src: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate scaling to fit while maintaining aspect ratio
        const scale = Math.min(width / img.width, height / img.height);
        const x = (width - img.width * scale) / 2;
        const y = (height - img.height * scale) / 2;

        ctx.fillStyle = 'transparent';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  // Apply generated logo to settings
  const applyLogo = async (logo: GeneratedLogo) => {
    try {
      // Convert data URL to blob and upload
      const response = await fetch(logo.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${logo.key}.png`, { type: 'image/png' });
      
      await handleFileUpload(logo.key, file);
      showSuccess("Logo Applied", `${logo.size} has been applied`);
    } catch (error: any) {
      showError("Apply Failed", "Failed to apply logo");
    }
  };

  // Copy logo URL
  const copyLogoUrl = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle master logo file upload
  const handleMasterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setMasterLogo(event.target?.result as string);
      showSuccess("Logo Loaded", "Master logo loaded. Generate size variants now.");
    };
    reader.readAsDataURL(file);
  };

  const ImageUploadField = ({ 
    label, 
    description, 
    settingsKey, 
    placeholder,
    previewSize = 'md'
  }: { 
    label: string; 
    description: string; 
    settingsKey: string; 
    placeholder: string;
    previewSize?: 'sm' | 'md' | 'lg' | 'xl';
  }) => {
    const sizeClasses = {
      sm: 'h-10 w-10',
      md: 'h-16 w-16',
      lg: 'h-24 w-24',
      xl: 'h-32 w-32'
    };

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <Label>{label}</Label>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {settings[settingsKey] && (
            <Avatar className={sizeClasses[previewSize]}>
              <AvatarImage src={settings[settingsKey]} alt={label} className="object-contain" />
              <AvatarFallback><ImageIcon className="h-6 w-6" /></AvatarFallback>
            </Avatar>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={settings[settingsKey] || ''}
            onChange={(e) => onInputChange(settingsKey, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          <input
            id={`file-upload-${settingsKey}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(settingsKey, file);
              e.target.value = '';
            }}
            disabled={uploading === settingsKey}
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            disabled={uploading === settingsKey}
            onClick={() => document.getElementById(`file-upload-${settingsKey}`)?.click()}
          >
            {uploading === settingsKey ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
          {settings[settingsKey] && (
            <>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => copyLogoUrl(settingsKey, settings[settingsKey])}
              >
                {copiedKey === settingsKey ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={() => onInputChange(settingsKey, '')}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="inline-flex h-10 w-auto gap-1 bg-muted/40 p-1 rounded-lg border border-border/30">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Logos
          </TabsTrigger>
          <TabsTrigger value="generate">
            <Wand2 className="h-4 w-4 mr-2" />
            AI Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6 mt-6">
          {/* AI Logo Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Logo Generator
              </CardTitle>
              <CardDescription>
                Generate a master logo and automatically create all size variants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Generate or Upload Master */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">1</div>
                  <Label className="text-base font-medium">Create Master Logo</Label>
                </div>
                
                <div className="grid gap-4 pl-10">
                  <div className="space-y-2">
                    <Label>Logo Description</Label>
                    <Textarea
                      value={logoPrompt}
                      onChange={(e) => setLogoPrompt(e.target.value)}
                      placeholder="e.g., A luxury real estate company with modern architecture focus..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Label>Style</Label>
                      <Select value={logoStyle} onValueChange={setLogoStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern & Minimal</SelectItem>
                          <SelectItem value="classic">Classic & Elegant</SelectItem>
                          <SelectItem value="playful">Playful & Creative</SelectItem>
                          <SelectItem value="tech">Tech & Futuristic</SelectItem>
                          <SelectItem value="luxury">Luxury & Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={generateLogo} 
                      disabled={generating || !logoPrompt.trim()}
                      className="flex-1"
                    >
                      {generating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Logo
                        </>
                      )}
                    </Button>
                    
                    <input
                      id="master-logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMasterLogoUpload}
                    />
                    <Button 
                      variant="outline"
                      onClick={() => document.getElementById('master-logo-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Existing
                    </Button>
                  </div>

                  {/* Master Logo Preview */}
                  {masterLogo && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Label className="text-sm text-muted-foreground mb-2 block">Master Logo Preview</Label>
                      <div className="flex items-center justify-center p-4 bg-white dark:bg-black rounded-lg border">
                        <img 
                          src={masterLogo} 
                          alt="Master Logo" 
                          className="max-h-40 max-w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Generate Variants */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${masterLogo ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
                  <Label className={`text-base font-medium ${!masterLogo ? 'text-muted-foreground' : ''}`}>Generate Size Variants</Label>
                </div>

                <div className="pl-10">
                  <Button 
                    onClick={generateSizeVariants} 
                    disabled={generating || !masterLogo}
                    variant="secondary"
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Generating Variants...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate All Size Variants
                      </>
                    )}
                  </Button>

                  {/* Generated Variants Grid */}
                  {generatedLogos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {generatedLogos.map((logo) => (
                        <div key={logo.key} className="p-4 bg-muted/50 rounded-lg space-y-2">
                          <div className="text-sm font-medium">{logo.size}</div>
                          <div className="text-xs text-muted-foreground">{logo.width}x{logo.height}px</div>
                          <div className="flex items-center justify-center p-2 bg-white dark:bg-black rounded border min-h-[60px]">
                            <img 
                              src={logo.dataUrl} 
                              alt={logo.size}
                              style={{ maxWidth: Math.min(logo.width, 80), maxHeight: Math.min(logo.height, 60) }}
                              className="object-contain"
                            />
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => applyLogo(logo)}
                          >
                            <Download className="h-3 w-3 mr-1" />
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
        </TabsContent>

        <TabsContent value="upload" className="space-y-6 mt-6">
          {/* Header & Navigation Logos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5" />
                Header & Navigation
              </CardTitle>
              <CardDescription>Logo images for the main header and navigation areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploadField
                label="Header Logo"
                description="Main logo displayed in the top header (recommended: 200x60px)"
                settingsKey="headerLogo"
                placeholder="https://example.com/logo.png"
                previewSize="md"
              />
              
              <ImageUploadField
                label="Footer Logo"
                description="Logo displayed in the website footer (recommended: 180x50px)"
                settingsKey="footerLogo"
                placeholder="https://example.com/footer-logo.png"
                previewSize="md"
              />

              <ImageUploadField
                label="Favicon"
                description="Browser tab icon (recommended: 32x32px or 64x64px)"
                settingsKey="faviconUrl"
                placeholder="https://example.com/favicon.ico"
                previewSize="sm"
              />
            </CardContent>
          </Card>

          {/* Welcome/Home Page */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Welcome & Home Page
              </CardTitle>
              <CardDescription>Images for the landing page and hero sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploadField
                label="Welcome Page Hero Image"
                description="Main hero/slider image for the welcome page (recommended: 1920x1080px)"
                settingsKey="welcomePageImage"
                placeholder="https://example.com/hero.jpg"
                previewSize="xl"
              />
              
              <ImageUploadField
                label="Welcome Page Background"
                description="Background image for the welcome section (recommended: 1920x1200px)"
                settingsKey="welcomePageBackgroundImage"
                placeholder="https://example.com/background.jpg"
                previewSize="xl"
              />

              <ImageUploadField
                label="Login Page Background"
                description="Background image for login/auth pages (recommended: 1920x1080px)"
                settingsKey="loginPageBackground"
                placeholder="https://example.com/login-bg.jpg"
                previewSize="xl"
              />
            </CardContent>
          </Card>

          {/* Chatbot & AI */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chatbot & AI Assistant
              </CardTitle>
              <CardDescription>Branding for chat and AI assistant interfaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploadField
                label="Chatbot Avatar/Logo"
                description="Avatar image for the AI chatbot (recommended: 128x128px, circular)"
                settingsKey="chatbotLogo"
                placeholder="https://example.com/chatbot-avatar.png"
                previewSize="lg"
              />
            </CardContent>
          </Card>

          {/* Default/Fallback Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Default & Fallback Images
              </CardTitle>
              <CardDescription>Placeholder images when no specific image is available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploadField
                label="Default Property Image"
                description="Fallback image when property has no photos (recommended: 800x600px)"
                settingsKey="defaultPropertyImage"
                placeholder="https://example.com/default-property.jpg"
                previewSize="lg"
              />
              
              <ImageUploadField
                label="Default Avatar Image"
                description="Fallback avatar for users without profile pictures (recommended: 200x200px)"
                settingsKey="defaultAvatarImage"
                placeholder="https://example.com/default-avatar.png"
                previewSize="md"
              />
            </CardContent>
          </Card>

          {/* Email & Mobile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email & Mobile
              </CardTitle>
              <CardDescription>Branding for emails and mobile applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ImageUploadField
                label="Email Header Logo"
                description="Logo used in email templates (recommended: 300x80px)"
                settingsKey="emailLogoUrl"
                placeholder="https://example.com/email-logo.png"
                previewSize="md"
              />
              
              <ImageUploadField
                label="Mobile App Icon"
                description="Icon for PWA/mobile app (recommended: 512x512px)"
                settingsKey="mobileAppIcon"
                placeholder="https://example.com/app-icon.png"
                previewSize="lg"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button onClick={onSave} disabled={loading} size="lg">
          {loading ? 'Saving Branding Settings...' : 'Save Branding Settings'}
        </Button>
      </div>
    </div>
  );
};

export default BrandingSettings;
