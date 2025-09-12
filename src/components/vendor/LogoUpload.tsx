import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LogoUploadProps {
  currentLogoUrl?: string;
  businessName: string;
  onLogoChange: (logoUrl: string) => void;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ 
  currentLogoUrl, 
  businessName, 
  onLogoChange 
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "File size must be less than 2MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Get current user ID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/vendor-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-assets')
        .getPublicUrl(filePath);

      onLogoChange(publicUrl);
      toast({
        title: "Success",
        description: "Logo uploaded successfully"
      });
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    onLogoChange('');
  };

  return (
    <div className="space-y-4">
      <Label>Company Logo</Label>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={currentLogoUrl} alt={businessName} />
          <AvatarFallback className="text-lg">
            {businessName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm" disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Logo"}
            </Button>
          </div>
          {currentLogoUrl && (
            <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload a company logo (max 2MB, JPG/PNG/GIF)
      </p>
    </div>
  );
};

export default LogoUpload;