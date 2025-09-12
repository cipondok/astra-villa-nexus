import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, Phone, Mail, MapPin, Eye } from "lucide-react";

interface ProfilePreviewProps {
  profile: {
    business_name: string;
    business_type: string;
    business_description: string;
    business_address: string;
    business_phone: string;
    business_email: string;
    business_website: string;
    logo_url?: string;
    is_active: boolean;
  };
}

const ProfilePreview: React.FC<ProfilePreviewProps> = ({ profile }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Business Profile Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.logo_url} alt={profile.business_name} />
                  <AvatarFallback className="text-lg">
                    {profile.business_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{profile.business_name}</CardTitle>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="outline">{profile.business_type}</Badge>
                <Badge variant={profile.is_active ? "default" : "secondary"}>
                  {profile.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.business_description && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-muted-foreground">{profile.business_description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.business_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.business_phone}</span>
                  </div>
                )}
                {profile.business_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile.business_email}</span>
                  </div>
                )}
                {profile.business_website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={profile.business_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}
                {profile.business_address && (
                  <div className="flex items-start gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{profile.business_address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePreview;