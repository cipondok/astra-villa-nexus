import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Send, Music, Loader2, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const platformIcons = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  whatsapp: MessageCircle,
  telegram: Send,
  tiktok: Music,
};

const platformColors = {
  facebook: "#1877F2",
  twitter: "#1DA1F2",
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  youtube: "#FF0000",
  whatsapp: "#25D366",
  telegram: "#0088cc",
  tiktok: "#000000",
};

interface SocialMediaSetting {
  id: string;
  platform: string;
  account_name: string | null;
  profile_url: string | null;
  api_credentials: any;
  posting_settings: any;
  is_active: boolean;
}

const SocialMediaSettings = () => {
  const queryClient = useQueryClient();
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SocialMediaSetting>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['social-media-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('*')
        .order('platform');
      
      if (error) throw error;
      return data as SocialMediaSetting[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (setting: Partial<SocialMediaSetting> & { id: string }) => {
      const { error } = await supabase
        .from('social_media_settings')
        .update({
          account_name: setting.account_name,
          profile_url: setting.profile_url,
          is_active: setting.is_active,
          api_credentials: setting.api_credentials,
          posting_settings: setting.posting_settings,
        })
        .eq('id', setting.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-settings'] });
      toast({
        title: "Success",
        description: "Social media settings updated successfully",
      });
      setEditingPlatform(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleEdit = (setting: SocialMediaSetting) => {
    setEditingPlatform(setting.platform);
    setFormData(setting);
  };

  const handleSave = () => {
    if (formData.id) {
      updateMutation.mutate(formData as SocialMediaSetting & { id: string });
    }
  };

  const handleToggleActive = async (setting: SocialMediaSetting) => {
    const { error } = await supabase
      .from('social_media_settings')
      .update({ is_active: !setting.is_active })
      .eq('id', setting.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to toggle platform status",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ['social-media-settings'] });
      toast({
        title: "Success",
        description: `${setting.platform} ${!setting.is_active ? 'enabled' : 'disabled'}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Social Media Configuration</CardTitle>
          <CardDescription>
            Manage your social media accounts and sharing settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="accounts">Account Settings</TabsTrigger>
              <TabsTrigger value="posting">Posting Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="space-y-4 mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {settings?.map((setting) => {
                  const Icon = platformIcons[setting.platform as keyof typeof platformIcons] || MessageCircle;
                  const color = platformColors[setting.platform as keyof typeof platformColors] || "#000000";
                  const isEditing = editingPlatform === setting.platform;

                  return (
                    <Card key={setting.id} className="border border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${color}20` }}
                            >
                              <Icon className="h-5 w-5" style={{ color }} />
                            </div>
                            <div>
                              <h3 className="font-semibold capitalize">{setting.platform}</h3>
                              <p className="text-xs text-muted-foreground">
                                {setting.account_name || 'Not configured'}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={setting.is_active}
                            onCheckedChange={() => handleToggleActive(setting)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {isEditing ? (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor={`account-${setting.platform}`}>Account Name</Label>
                              <Input
                                id={`account-${setting.platform}`}
                                placeholder="@username"
                                value={formData.account_name || ''}
                                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`url-${setting.platform}`}>Profile URL</Label>
                              <Input
                                id={`url-${setting.platform}`}
                                placeholder="https://..."
                                value={formData.profile_url || ''}
                                onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="flex-1"
                              >
                                {updateMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingPlatform(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            {setting.profile_url && (
                              <a
                                href={setting.profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline block truncate"
                              >
                                {setting.profile_url}
                              </a>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(setting)}
                              className="w-full"
                            >
                              Edit Settings
                            </Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="posting" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Auto-Posting Settings</CardTitle>
                  <CardDescription>
                    Configure automatic posting to social media platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Auto-posting features can be configured here. Connect your API credentials
                      to enable automatic property sharing to social media platforms.
                    </p>
                    <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                      <p className="text-sm font-medium mb-2">Coming Soon:</p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Automatic property listing posts</li>
                        <li>Scheduled social media campaigns</li>
                        <li>Custom post templates</li>
                        <li>Analytics and engagement tracking</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaSettings;
