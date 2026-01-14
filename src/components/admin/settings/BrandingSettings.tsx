import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Check,
  AlertCircle,
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

// All logo settings keys for the current logos section
const ALL_LOGO_KEYS = [
  { key: 'headerLogo', label: 'Header Logo', description: 'Main logo in top header', size: '200x60px' },
  { key: 'footerLogo', label: 'Footer Logo', description: 'Logo in website footer', size: '180x50px' },
  { key: 'welcomeScreenLogo', label: 'Welcome Screen Logo', description: 'Logo on app loading/welcome screen', size: '200x200px' },
  { key: 'faviconUrl', label: 'Favicon', description: 'Browser tab icon', size: '64x64px' },
  { key: 'emailLogoUrl', label: 'Email Logo', description: 'Logo in email templates', size: '300x80px' },
  { key: 'mobileAppIcon', label: 'Mobile App Icon', description: 'PWA/mobile app icon', size: '512x512px' },
  { key: 'chatbotLogo', label: 'Chatbot Avatar', description: 'AI chatbot avatar', size: '128x128px' },
  { key: 'welcomePageImage', label: 'Welcome Hero Image', description: 'Main hero image', size: '1920x1080px' },
  { key: 'welcomePageBackgroundImage', label: 'Welcome Background', description: 'Welcome section background', size: '1920x1200px' },
  { key: 'loginPageBackground', label: 'Login Background', description: 'Login page background', size: '1920x1080px' },
  { key: 'defaultPropertyImage', label: 'Default Property Image', description: 'Fallback property image', size: '800x600px' },
  { key: 'defaultAvatarImage', label: 'Default Avatar', description: 'Fallback user avatar', size: '200x200px' },
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

  // Persist setting to database
  const persistSetting = async (settingKey: string, value: string) => {
    const payload = {
      category: "general",
      key: settingKey,
      value,
      is_public: true,
      description: `System setting for ${settingKey}`,
    };

    const attempt = async (onConflict: string) =>
      supabase.from("system_settings").upsert(payload, { onConflict });

    const { error: err1 } = await attempt("category,key");
    if (!err1) return;

    const { error: err2 } = await attempt("key");
    if (err2) throw err2;
  };

  const handleFileUpload = async (key: string, file: File): Promise<boolean> => {
    if (!file) return false;

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      showError(
        "Invalid File",
        "Please upload an image file (JPG, PNG, GIF, WebP, or SVG)"
      );
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("File Too Large", "Please upload an image smaller than 5MB");
      return false;
    }

    setUploading(key);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        showError("Authentication Required", "Please log in to upload images");
        return false;
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "png";
      const fileName = `branding/${key}_${Date.now()}.${fileExt}`;

      console.log(
        "Uploading file:",
        fileName,
        "Size:",
        file.size,
        "Type:",
        file.type
      );

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

      const { data: urlData } = supabase.storage
        .from("system-assets")
        .getPublicUrl(fileName);

      console.log("Public URL:", urlData.publicUrl);

      onInputChange(key, urlData.publicUrl);
      await persistSetting(key, urlData.publicUrl);

      // Ensure the rest of the app (e.g. navigation) refreshes immediately
      queryClient.invalidateQueries({ queryKey: ["system-setting"] });

      showSuccess("Upload Complete", "Image uploaded and saved successfully");
      return true;
    } catch (error: any) {
      console.error("Upload error details:", error);
      const errorMessage =
        error?.message || error?.error_description || "Failed to upload image";
      showError("Upload Failed", errorMessage);
      return false;
    } finally {
      setUploading(null);
    }
  };

  // Delete a logo
  const handleDeleteLogo = async (key: string) => {
    setDeleting(key);
    try {
      onInputChange(key, '');
      await persistSetting(key, '');
      queryClient.invalidateQueries({ queryKey: ["system-setting"] });
      showSuccess("Logo Deleted", "The logo has been removed successfully");
    } catch (error: any) {
      console.error("Delete error:", error);
      showError("Delete Failed", error?.message || "Failed to delete logo");
    } finally {
      setDeleting(null);
    }
  };

  // Generate logo using AI
  const generateLogo = async () => {
    if (!logoPrompt.trim()) {
      showError("Prompt Required", "Please enter a description for your logo");
      return;
    }

    setGenerating(true);
    setMasterLogo(null);
    setGeneratedLogos([]);
    
    try {
      const stylePrompts: Record<string, string> = {
        modern: "modern minimalist clean design with simple geometric shapes",
        classic: "classic elegant professional design with refined typography",
        playful: "playful creative colorful design with friendly aesthetic",
        tech: "futuristic tech-inspired design with sleek digital elements",
        luxury: "luxurious premium design with gold accents and sophisticated feel",
      };

      const fullPrompt = `Create a professional company logo for: ${logoPrompt}. Style: ${stylePrompts[logoStyle]}. The logo should be centered, on a transparent or simple background, suitable for business branding. High quality vector-style logo.`;

      console.log("Calling AI image generator with prompt:", fullPrompt.substring(0, 100));

      const response = await supabase.functions.invoke('ai-image-generator', {
        body: { prompt: fullPrompt }
      });

      console.log("AI response:", response);

      // Handle edge function errors
      if (response.error) {
        const errMsg = response.error?.message || String(response.error);
        throw new Error(errMsg);
      }

      // Check for API error in response data
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const imageUrl = response.data?.imageUrl || response.data?.image;
      
      if (!imageUrl) {
        console.error("No image in response:", response.data);
        throw new Error("No image generated - please try again");
      }

      console.log("Master logo generated successfully");
      setMasterLogo(imageUrl);
      showSuccess("Logo Generated", "Your logo has been created! Now click 'Generate All Size Variants' to create all logo sizes.");
      
    } catch (error: any) {
      console.error("Logo generation error:", error);
      const message = error?.message || "Failed to generate logo";
      
      // Check for billing/limit errors
      if (message.toLowerCase().includes('billing') || message.toLowerCase().includes('limit') || message.toLowerCase().includes('payment')) {
        showError("AI Generation Unavailable", "The workspace has reached its usage limit. Please upload an existing logo instead.");
      } else if (message.toLowerCase().includes('rate limit')) {
        showError("Rate Limited", "Too many requests. Please wait a moment and try again.");
      } else {
        showError("Generation Failed", message);
      }
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
      showSuccess("Variants Generated", `Created ${variants.length} logo size variants. Click 'Apply' on each to save.`);
    } catch (error: any) {
      console.error("Resize error:", error);
      showError("Resize Failed", "Failed to generate size variants. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Resize image using canvas
  const resizeImage = (src: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      // Only set crossOrigin for external URLs, not for data URLs
      if (!src.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Clear canvas with transparent background
        ctx.clearRect(0, 0, width, height);

        // Calculate scaling to fit while maintaining aspect ratio
        const scale = Math.min(width / img.width, height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = (e) => {
        console.error('Image load error:', e);
        reject(new Error('Failed to load image for resizing'));
      };
      img.src = src;
    });
  };

  // Apply generated logo to settings
  const applyLogo = async (logo: GeneratedLogo) => {
    setUploading(logo.key);
    try {
      // Convert data URL to blob and upload
      const response = await fetch(logo.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `${logo.key}.png`, { type: "image/png" });

      const ok = await handleFileUpload(logo.key, file);
      if (ok) {
        showSuccess("Logo Applied", `${logo.size} has been saved successfully`);
      }
    } catch (error: any) {
      console.error("Apply logo error:", error);
      showError("Apply Failed", error?.message || "Failed to apply logo");
    }
  };

  // Copy logo URL
  const copyLogoUrl = (key: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    showSuccess("Copied", "URL copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle master logo file upload
  const handleMasterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setMasterLogo(event.target?.result as string);
      setGeneratedLogos([]);
      showSuccess("Logo Loaded", "Master logo loaded. Now click 'Generate All Size Variants'.");
    };
    reader.onerror = () => {
      showError("Load Failed", "Failed to load the image file");
    };
    reader.readAsDataURL(file);
  };

  // Get current logos that have values
  const currentLogos = ALL_LOGO_KEYS.filter(item => settings[item.key]);

  return (
    <div className="space-y-6">
      {/* Current Website Logos Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            Current Website Logos
          </CardTitle>
          <CardDescription>
            View, change, or delete your existing logos and branding images
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentLogos.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No logos configured yet. Use the AI Generator below to create logos, or upload existing ones.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentLogos.map((item) => (
                <div key={item.key} className="p-4 bg-muted/30 rounded-lg border space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{item.size}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center p-3 bg-white dark:bg-black rounded border min-h-[80px]">
                    <img 
                      src={settings[item.key]} 
                      alt={item.label}
                      className="max-h-16 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    {/* Replace/Upload new */}
                    <input
                      id={`replace-${item.key}`}
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
                      variant="outline"
                      className="flex-1"
                      disabled={uploading === item.key}
                      onClick={() => document.getElementById(`replace-${item.key}`)?.click()}
                    >
                      {uploading === item.key ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Upload className="h-3 w-3 mr-1" />
                          Change
                        </>
                      )}
                    </Button>

                    {/* Copy URL */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLogoUrl(item.key, settings[item.key])}
                    >
                      {copiedKey === item.key ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deleting === item.key}
                      onClick={() => handleDeleteLogo(item.key)}
                    >
                      {deleting === item.key ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Logo Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Logo Generator
          </CardTitle>
          <CardDescription>
            Generate a master logo with AI and automatically create all size variants, or upload an existing logo
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
                  placeholder="e.g., A luxury real estate company with modern architecture focus, elegant and professional..."
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
                      Generate with AI
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
                  disabled={generating}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Existing
                </Button>
              </div>

              {/* Master Logo Preview */}
              {masterLogo && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm text-muted-foreground">Master Logo Preview</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setMasterLogo(null);
                        setGeneratedLogos([]);
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
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

              {!masterLogo && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  First create a master logo above, then generate size variants
                </p>
              )}

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
                        disabled={uploading === logo.key}
                        onClick={() => applyLogo(logo)}
                      >
                        {uploading === logo.key ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Applying...
                          </>
                        ) : (
                          <>
                            <Download className="h-3 w-3 mr-1" />
                            Apply
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
