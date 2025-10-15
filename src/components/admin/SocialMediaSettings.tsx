import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, MessageCircle, Send, Music, Loader2, Save, Plus, Trash2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  api_credentials: {
    api_key?: string;
    api_secret?: string;
    access_token?: string;
  } | null;
  posting_settings: {
    auto_post: boolean;
    post_template?: string;
    post_frequency?: string;
    hashtags?: string[];
  } | null;
  is_active: boolean;
}

const SocialMediaSettings = () => {
  const queryClient = useQueryClient();
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SocialMediaSetting>>({});
  const [activeTab, setActiveTab] = useState("accounts");

  const { data: settings, isLoading } = useQuery({
    queryKey: ['social-media-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_media_settings')
        .select('*')
        .order('platform');
      
      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        api_credentials: item.api_credentials as { api_key?: string; api_secret?: string; access_token?: string; } | null,
        posting_settings: item.posting_settings as { auto_post: boolean; post_template?: string; post_frequency?: string; hashtags?: string[]; } | null,
      })) as SocialMediaSetting[];
    },
  });

  const initializePlatformsMutation = useMutation({
    mutationFn: async () => {
      const defaultPlatforms = [
        { platform: 'facebook', account_name: null, profile_url: null, is_active: true },
        { platform: 'twitter', account_name: null, profile_url: null, is_active: true },
        { platform: 'instagram', account_name: null, profile_url: null, is_active: false },
        { platform: 'linkedin', account_name: null, profile_url: null, is_active: true },
        { platform: 'youtube', account_name: null, profile_url: null, is_active: false },
        { platform: 'whatsapp', account_name: null, profile_url: null, is_active: true },
        { platform: 'telegram', account_name: null, profile_url: null, is_active: true },
        { platform: 'tiktok', account_name: null, profile_url: null, is_active: false },
      ];

      const { error } = await supabase
        .from('social_media_settings')
        .insert(defaultPlatforms);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-settings'] });
      toast({
        title: "Success",
        description: "Default social media platforms initialized",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to initialize platforms",
        variant: "destructive",
      });
      console.error(error);
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
    setFormData({
      ...setting,
      posting_settings: setting.posting_settings || { auto_post: false, hashtags: [] },
      api_credentials: setting.api_credentials || {},
    });
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

  const handleAddHashtag = () => {
    const currentHashtags = formData.posting_settings?.hashtags || [];
    setFormData({
      ...formData,
      posting_settings: {
        ...formData.posting_settings,
        auto_post: formData.posting_settings?.auto_post || false,
        hashtags: [...currentHashtags, ''],
      }
    });
  };

  const handleHashtagChange = (index: number, value: string) => {
    const hashtags = [...(formData.posting_settings?.hashtags || [])];
    hashtags[index] = value;
    setFormData({
      ...formData,
      posting_settings: {
        ...formData.posting_settings,
        auto_post: formData.posting_settings?.auto_post || false,
        hashtags,
      }
    });
  };

  const handleRemoveHashtag = (index: number) => {
    const hashtags = [...(formData.posting_settings?.hashtags || [])];
    hashtags.splice(index, 1);
    setFormData({
      ...formData,
      posting_settings: {
        ...formData.posting_settings,
        auto_post: formData.posting_settings?.auto_post || false,
        hashtags,
      }
    });
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
            Manage your social media accounts and automated posting settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="accounts">Account Settings</TabsTrigger>
              <TabsTrigger value="posting">Posting Configuration</TabsTrigger>
            </TabsList>

            <TabsContent value="accounts" className="space-y-4 mt-6">
              {!settings || settings.length === 0 ? (
                <Alert>
                  <AlertDescription className="flex flex-col items-center gap-4 py-8">
                    <p className="text-center text-muted-foreground">
                      No social media platforms found. Initialize default platforms to get started.
                    </p>
                    <Button 
                      onClick={() => initializePlatformsMutation.mutate()}
                      disabled={initializePlatformsMutation.isPending}
                    >
                      {initializePlatformsMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Initialize Default Platforms
                        </>
                      )}
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : (
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
              )}
            </TabsContent>

            <TabsContent value="posting" className="space-y-4 mt-6">
              {editingPlatform ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">
                      {editingPlatform} Posting Settings
                    </CardTitle>
                    <CardDescription>
                      Configure automated posting for {editingPlatform}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Post New Properties</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically share new properties to {editingPlatform}
                        </p>
                      </div>
                      <Switch
                        checked={formData.posting_settings?.auto_post || false}
                        onCheckedChange={(checked) => setFormData({
                          ...formData,
                          posting_settings: {
                            ...formData.posting_settings,
                            auto_post: checked,
                            hashtags: formData.posting_settings?.hashtags || [],
                          }
                        })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Post Template</Label>
                      <Textarea
                        placeholder="New property available! {title} - {price} 🏠&#10;Location: {location}&#10;{bedrooms}BR | {bathrooms}BA"
                        value={formData.posting_settings?.post_template || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          posting_settings: {
                            ...formData.posting_settings,
                            auto_post: formData.posting_settings?.auto_post || false,
                            post_template: e.target.value,
                          }
                        })}
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        Use variables: {'{'}title{'}'}, {'{'}price{'}'}, {'{'}location{'}'}, {'{'}bedrooms{'}'}, {'{'}bathrooms{'}'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Hashtags</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleAddHashtag}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {formData.posting_settings?.hashtags?.map((tag, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="#property"
                              value={tag}
                              onChange={(e) => handleHashtagChange(index, e.target.value)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveHashtag(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="flex-1"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Posting Settings
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingPlatform(null)}
                      >
                        Back
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Platform to Configure</CardTitle>
                    <CardDescription>
                      Choose a social media platform to configure posting settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!settings || settings.length === 0 ? (
                      <Alert>
                        <AlertDescription className="flex flex-col items-center gap-4 py-8">
                          <p className="text-center text-muted-foreground">
                            No platforms available. Please add platforms in the Account Settings tab first.
                          </p>
                          <Button 
                            variant="outline"
                            onClick={() => setActiveTab("accounts")}
                          >
                            Go to Account Settings
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : settings.filter(s => s.is_active).length === 0 ? (
                      <Alert>
                        <AlertDescription className="flex flex-col items-center gap-4 py-8">
                          <p className="text-center text-muted-foreground">
                            No active platforms. Please enable at least one platform in Account Settings.
                          </p>
                          <Button 
                            variant="outline"
                            onClick={() => setActiveTab("accounts")}
                          >
                            Go to Account Settings
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="grid gap-3 md:grid-cols-3">
                        {settings?.filter(s => s.is_active).map((setting) => {
                          const Icon = platformIcons[setting.platform as keyof typeof platformIcons] || MessageCircle;
                          const color = platformColors[setting.platform as keyof typeof platformColors] || "#000000";
                          
                          return (
                            <Button
                              key={setting.id}
                              variant="outline"
                              className="h-auto py-4 flex flex-col gap-2"
                              onClick={() => {
                                handleEdit(setting);
                                setActiveTab("posting");
                              }}
                            >
                              <Icon className="h-6 w-6" style={{ color }} />
                              <span className="capitalize text-sm font-medium">{setting.platform}</span>
                              {setting.posting_settings?.auto_post && (
                                <span className="text-xs text-green-600">Auto-post enabled</span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaSettings;
