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
  Smartphone,
  Home,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

interface BrandingSettingsProps {
  settings: any;
  loading: boolean;
  onInputChange: (key: string, value: any) => void;
  onSave: () => void;
}

const BrandingSettings = ({ settings, loading, onInputChange, onSave }: BrandingSettingsProps) => {
  const { showSuccess, showError } = useAlert();
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = async (key: string, file: File) => {
    if (!file) return;

    // Validate file type
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("File Too Large", "Please upload an image smaller than 5MB");
      return;
    }

    setUploading(key);

    const persistSetting = async (settingKey: string, value: string) => {
      // Ensure the uploaded logo is actually saved to DB (so the header can read it)
      const payload = {
        category: "general",
        key: settingKey,
        value,
        description: `System setting for ${settingKey}`,
      };

      // Most setups use a unique constraint on (category, key). If yours is only (key), we fall back.
      const attempt = async (onConflict: string) =>
        supabase.from("system_settings").upsert(payload, { onConflict });

      const { error: err1 } = await attempt("category,key");
      if (!err1) return;

      const { error: err2 } = await attempt("key");
      if (err2) throw err2;
    };

    try {
      // Check if user is authenticated
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

      // Update UI state immediately
      onInputChange(key, urlData.publicUrl);

      // Persist immediately so other pages/components (e.g. header) can read it
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
              <AvatarImage src={settings[settingsKey]} alt={label} className="object-cover" />
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
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(settingsKey, file);
              }}
              disabled={uploading === settingsKey}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              disabled={uploading === settingsKey}
            >
              {uploading === settingsKey ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
          </div>
          {settings[settingsKey] && (
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={() => onInputChange(settingsKey, '')}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
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
