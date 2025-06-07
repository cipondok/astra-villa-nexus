
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, Database, Globe, Shield, Mail, Upload, Users, Search, MapPin, Eye } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const SystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const [generalSettings, setGeneralSettings] = useState({
    site_name: "Astra Villa",
    site_description: "Premium Property Management Platform",
    contact_email: "admin@astravilla.com",
    maintenance_mode: false,
    allow_registrations: true,
    default_language: "en"
  });

  const [seoSettings, setSeoSettings] = useState({
    meta_title: "Astra Villa - Premium Properties",
    meta_description: "Discover premium properties with Astra Villa. Your trusted real estate platform.",
    meta_keywords: "real estate, properties, villa, apartment, house",
    google_analytics_id: "",
    facebook_pixel_id: "",
    google_site_verification: ""
  });

  const [authSettings, setAuthSettings] = useState({
    enable_google_auth: false,
    google_client_id: "",
    google_client_secret: "",
    enable_email_verification: true,
    enable_password_reset: true,
    session_timeout: "30"
  });

  const [securitySettings, setSecuritySettings] = useState({
    enable_cloudflare: false,
    cloudflare_zone_id: "",
    cloudflare_api_token: "",
    enable_2fa: true,
    max_login_attempts: "5",
    password_min_length: "8",
    enable_rate_limiting: true
  });

  const [apiSettings, setApiSettings] = useState({
    google_maps_api_key: "",
    stripe_publishable_key: "",
    stripe_secret_key: "",
    openai_api_key: "",
    email_service_api_key: ""
  });

  const [userRoleSettings, setUserRoleSettings] = useState({
    default_user_role: "general_user",
    auto_approve_agents: false,
    auto_approve_vendors: false,
    require_email_verification: true
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async ({ category, settings }: { category: string; settings: any }) => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value as any,
        category,
        description: `${category} setting for ${key}`
      }));

      for (const setting of updates) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(setting);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Settings Updated", "System settings have been saved successfully.");
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleSave = (category: string, settings: any) => {
    updateSettingsMutation.mutate({ category, settings });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            Configure and manage system-wide settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 bg-white/10">
              <TabsTrigger value="general" className="text-white data-[state=active]:bg-blue-600">General</TabsTrigger>
              <TabsTrigger value="seo" className="text-white data-[state=active]:bg-blue-600">SEO</TabsTrigger>
              <TabsTrigger value="auth" className="text-white data-[state=active]:bg-blue-600">Auth</TabsTrigger>
              <TabsTrigger value="security" className="text-white data-[state=active]:bg-blue-600">Security</TabsTrigger>
              <TabsTrigger value="apis" className="text-white data-[state=active]:bg-blue-600">APIs</TabsTrigger>
              <TabsTrigger value="roles" className="text-white data-[state=active]:bg-blue-600">User Roles</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Globe className="h-4 w-4" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site_name" className="text-white">Site Name</Label>
                      <Input
                        id="site_name"
                        value={generalSettings.site_name}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, site_name: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_email" className="text-white">Contact Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={generalSettings.contact_email}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contact_email: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="site_description" className="text-white">Site Description</Label>
                    <Textarea
                      id="site_description"
                      value={generalSettings.site_description}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, site_description: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Maintenance Mode</Label>
                        <p className="text-sm text-gray-300">Enable to show maintenance page to users</p>
                      </div>
                      <Switch
                        checked={generalSettings.maintenance_mode}
                        onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, maintenance_mode: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Allow User Registrations</Label>
                        <p className="text-sm text-gray-300">Allow new users to register accounts</p>
                      </div>
                      <Switch
                        checked={generalSettings.allow_registrations}
                        onCheckedChange={(checked) => setGeneralSettings({ ...generalSettings, allow_registrations: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('general', generalSettings)} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Search className="h-4 w-4" />
                    SEO & Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="meta_title" className="text-white">Meta Title</Label>
                      <Input
                        id="meta_title"
                        value={seoSettings.meta_title}
                        onChange={(e) => setSeoSettings({ ...seoSettings, meta_title: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="meta_description" className="text-white">Meta Description</Label>
                      <Textarea
                        id="meta_description"
                        value={seoSettings.meta_description}
                        onChange={(e) => setSeoSettings({ ...seoSettings, meta_description: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meta_keywords" className="text-white">Meta Keywords</Label>
                      <Input
                        id="meta_keywords"
                        value={seoSettings.meta_keywords}
                        onChange={(e) => setSeoSettings({ ...seoSettings, meta_keywords: e.target.value })}
                        placeholder="keyword1, keyword2, keyword3"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="google_analytics_id" className="text-white">Google Analytics ID</Label>
                        <Input
                          id="google_analytics_id"
                          value={seoSettings.google_analytics_id}
                          onChange={(e) => setSeoSettings({ ...seoSettings, google_analytics_id: e.target.value })}
                          placeholder="G-XXXXXXXXXX"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="facebook_pixel_id" className="text-white">Facebook Pixel ID</Label>
                        <Input
                          id="facebook_pixel_id"
                          value={seoSettings.facebook_pixel_id}
                          onChange={(e) => setSeoSettings({ ...seoSettings, facebook_pixel_id: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleSave('seo', seoSettings)} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save SEO Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="auth" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-4 w-4" />
                    Authentication Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Enable Google Authentication</Label>
                      <p className="text-sm text-gray-300">Allow users to sign in with Google</p>
                    </div>
                    <Switch
                      checked={authSettings.enable_google_auth}
                      onCheckedChange={(checked) => setAuthSettings({ ...authSettings, enable_google_auth: checked })}
                    />
                  </div>

                  {authSettings.enable_google_auth && (
                    <div className="grid grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="google_client_id" className="text-white">Google Client ID</Label>
                        <Input
                          id="google_client_id"
                          value={authSettings.google_client_id}
                          onChange={(e) => setAuthSettings({ ...authSettings, google_client_id: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="google_client_secret" className="text-white">Google Client Secret</Label>
                        <Input
                          id="google_client_secret"
                          type="password"
                          value={authSettings.google_client_secret}
                          onChange={(e) => setAuthSettings({ ...authSettings, google_client_secret: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Email Verification</Label>
                        <p className="text-sm text-gray-300">Require email verification for new accounts</p>
                      </div>
                      <Switch
                        checked={authSettings.enable_email_verification}
                        onCheckedChange={(checked) => setAuthSettings({ ...authSettings, enable_email_verification: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Password Reset</Label>
                        <p className="text-sm text-gray-300">Allow users to reset their password</p>
                      </div>
                      <Switch
                        checked={authSettings.enable_password_reset}
                        onCheckedChange={(checked) => setAuthSettings({ ...authSettings, enable_password_reset: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('auth', authSettings)} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Auth Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-4 w-4" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Enable Cloudflare Protection</Label>
                      <p className="text-sm text-gray-300">Protect your site with Cloudflare</p>
                    </div>
                    <Switch
                      checked={securitySettings.enable_cloudflare}
                      onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, enable_cloudflare: checked })}
                    />
                  </div>

                  {securitySettings.enable_cloudflare && (
                    <div className="grid grid-cols-2 gap-4 p-4 border border-gray-700 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="cloudflare_zone_id" className="text-white">Cloudflare Zone ID</Label>
                        <Input
                          id="cloudflare_zone_id"
                          value={securitySettings.cloudflare_zone_id}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, cloudflare_zone_id: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cloudflare_api_token" className="text-white">Cloudflare API Token</Label>
                        <Input
                          id="cloudflare_api_token"
                          type="password"
                          value={securitySettings.cloudflare_api_token}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, cloudflare_api_token: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_login_attempts" className="text-white">Max Login Attempts</Label>
                      <Input
                        id="max_login_attempts"
                        type="number"
                        value={securitySettings.max_login_attempts}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, max_login_attempts: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password_min_length" className="text-white">Minimum Password Length</Label>
                      <Input
                        id="password_min_length"
                        type="number"
                        value={securitySettings.password_min_length}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, password_min_length: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('security', securitySettings)} className="bg-red-600 hover:bg-red-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="apis" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <MapPin className="h-4 w-4" />
                    API Keys & Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="google_maps_api_key" className="text-white">Google Maps API Key</Label>
                      <Input
                        id="google_maps_api_key"
                        type="password"
                        value={apiSettings.google_maps_api_key}
                        onChange={(e) => setApiSettings({ ...apiSettings, google_maps_api_key: e.target.value })}
                        placeholder="Enter your Google Maps API key"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stripe_publishable_key" className="text-white">Stripe Publishable Key</Label>
                        <Input
                          id="stripe_publishable_key"
                          value={apiSettings.stripe_publishable_key}
                          onChange={(e) => setApiSettings({ ...apiSettings, stripe_publishable_key: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripe_secret_key" className="text-white">Stripe Secret Key</Label>
                        <Input
                          id="stripe_secret_key"
                          type="password"
                          value={apiSettings.stripe_secret_key}
                          onChange={(e) => setApiSettings({ ...apiSettings, stripe_secret_key: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="openai_api_key" className="text-white">OpenAI API Key</Label>
                      <Input
                        id="openai_api_key"
                        type="password"
                        value={apiSettings.openai_api_key}
                        onChange={(e) => setApiSettings({ ...apiSettings, openai_api_key: e.target.value })}
                        placeholder="For AI chatbot functionality"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('apis', apiSettings)} className="bg-orange-600 hover:bg-orange-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save API Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="roles" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Eye className="h-4 w-4" />
                    User Roles & Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Default User Role</Label>
                    <Select value={userRoleSettings.default_user_role} onValueChange={(value) => setUserRoleSettings({ ...userRoleSettings, default_user_role: value })}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="general_user">General User</SelectItem>
                        <SelectItem value="property_owner">Property Owner</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Auto-approve Agent Registrations</Label>
                        <p className="text-sm text-gray-300">Automatically approve new agent registrations</p>
                      </div>
                      <Switch
                        checked={userRoleSettings.auto_approve_agents}
                        onCheckedChange={(checked) => setUserRoleSettings({ ...userRoleSettings, auto_approve_agents: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Auto-approve Vendor Registrations</Label>
                        <p className="text-sm text-gray-300">Automatically approve new vendor registrations</p>
                      </div>
                      <Switch
                        checked={userRoleSettings.auto_approve_vendors}
                        onCheckedChange={(checked) => setUserRoleSettings({ ...userRoleSettings, auto_approve_vendors: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Require Email Verification</Label>
                        <p className="text-sm text-gray-300">Require email verification for role changes</p>
                      </div>
                      <Switch
                        checked={userRoleSettings.require_email_verification}
                        onCheckedChange={(checked) => setUserRoleSettings({ ...userRoleSettings, require_email_verification: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('roles', userRoleSettings)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Role Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
