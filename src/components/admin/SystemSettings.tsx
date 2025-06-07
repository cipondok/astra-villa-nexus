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
import { Settings, Save, Database, Globe, Shield, Mail, Upload, Users, Search, MapPin, Eye, FileText, Phone, Clock, UserCheck, Building } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const SystemSettings = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const [generalSettings, setGeneralSettings] = useState({
    site_name: "Astra Villa",
    site_description: "Premium Property Management Platform",
    contact_email: "admin@astravilla.com",
    contact_phone: "+1-234-567-8900",
    support_email: "support@astravilla.com",
    maintenance_mode: false,
    allow_registrations: true,
    default_language: "en",
    timezone: "UTC",
    currency: "USD"
  });

  const [authSettings, setAuthSettings] = useState({
    enable_google_auth: true,
    google_client_id: "",
    google_client_secret: "",
    enable_facebook_auth: false,
    facebook_app_id: "",
    facebook_app_secret: "",
    enable_email_verification: true,
    enable_password_reset: true,
    enable_2fa: true,
    session_timeout: "30",
    max_login_attempts: "5",
    password_min_length: "8",
    require_strong_password: true
  });

  const [userRoleSettings, setUserRoleSettings] = useState({
    default_user_role: "general_user",
    auto_approve_agents: false,
    auto_approve_vendors: false,
    auto_approve_property_owners: true,
    require_email_verification: true,
    require_phone_verification: false,
    enable_role_upgrade_requests: true,
    agent_verification_required: true,
    vendor_verification_required: true
  });

  const [propertySettings, setPropertySettings] = useState({
    auto_approve_properties: false,
    require_property_verification: true,
    max_images_per_property: "20",
    enable_3d_tours: true,
    enable_virtual_staging: true,
    require_property_survey: false,
    enable_property_comparison: true,
    property_expiry_days: "365"
  });

  const [surveySettings, setSurveySettings] = useState({
    enable_property_surveys: true,
    survey_booking_advance_days: "7",
    max_surveys_per_day: "10",
    survey_duration_minutes: "60",
    auto_assign_surveyors: false,
    require_survey_confirmation: true,
    send_survey_reminders: true,
    survey_rating_required: true
  });

  const [complianceSettings, setComplianceSettings] = useState({
    enable_gdpr_compliance: true,
    data_retention_days: "2555", // 7 years
    enable_cookie_consent: true,
    enable_audit_logs: true,
    require_terms_acceptance: true,
    enable_privacy_controls: true,
    auto_delete_inactive_accounts: false,
    inactive_account_threshold_days: "365"
  });

  const [staffSettings, setStaffSettings] = useState({
    enable_staff_management: true,
    enable_staff_hierarchy: true,
    require_staff_verification: true,
    enable_staff_scheduling: true,
    enable_staff_performance_tracking: true,
    max_staff_per_department: "50",
    enable_staff_notifications: true,
    staff_break_duration_minutes: "30"
  });

  const [customerServiceSettings, setCustomerServiceSettings] = useState({
    enable_live_chat: true,
    enable_ticket_system: true,
    auto_assign_tickets: true,
    max_response_time_hours: "24",
    enable_priority_levels: true,
    enable_customer_feedback: true,
    enable_satisfaction_surveys: true,
    escalation_threshold_hours: "48"
  });

  const [securitySettings, setSecuritySettings] = useState({
    enable_cloudflare: false,
    cloudflare_zone_id: "",
    cloudflare_api_token: "",
    enable_rate_limiting: true,
    max_requests_per_minute: "100",
    enable_ip_blocking: true,
    enable_ddos_protection: true,
    security_scan_frequency: "daily",
    enable_ssl_enforcement: true
  });

  const [apiSettings, setApiSettings] = useState({
    google_maps_api_key: "",
    stripe_publishable_key: "",
    stripe_secret_key: "",
    openai_api_key: "",
    email_service_api_key: "",
    sms_service_api_key: "",
    payment_gateway_mode: "test",
    enable_webhook_verification: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    enable_email_notifications: true,
    enable_sms_notifications: false,
    enable_push_notifications: true,
    enable_in_app_notifications: true,
    notification_frequency: "immediate",
    digest_frequency: "daily",
    enable_marketing_emails: false
  });

  const [seoSettings, setSeoSettings] = useState({
    meta_title: "Astra Villa - Premium Properties",
    meta_description: "Discover premium properties with Astra Villa. Your trusted real estate platform.",
    meta_keywords: "real estate, properties, villa, apartment, house",
    google_analytics_id: "",
    google_tag_manager_id: "",
    facebook_pixel_id: "",
    google_site_verification: "",
    enable_sitemap: true,
    enable_robots_txt: true
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
            Comprehensive System Settings
          </CardTitle>
          <CardDescription className="text-gray-300">
            Configure all aspects of your property management platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-white/10">
              <TabsTrigger value="general" className="text-white data-[state=active]:bg-blue-600">General</TabsTrigger>
              <TabsTrigger value="auth" className="text-white data-[state=active]:bg-blue-600">Authentication</TabsTrigger>
              <TabsTrigger value="users" className="text-white data-[state=active]:bg-blue-600">User Roles</TabsTrigger>
              <TabsTrigger value="properties" className="text-white data-[state=active]:bg-blue-600">Properties</TabsTrigger>
              <TabsTrigger value="surveys" className="text-white data-[state=active]:bg-blue-600">Surveys</TabsTrigger>
              <TabsTrigger value="compliance" className="text-white data-[state=active]:bg-blue-600">Compliance</TabsTrigger>
              <TabsTrigger value="staff" className="text-white data-[state=active]:bg-blue-600">Staff</TabsTrigger>
              <TabsTrigger value="support" className="text-white data-[state=active]:bg-blue-600">Support</TabsTrigger>
              <TabsTrigger value="security" className="text-white data-[state=active]:bg-blue-600">Security</TabsTrigger>
              <TabsTrigger value="apis" className="text-white data-[state=active]:bg-blue-600">APIs</TabsTrigger>
              <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-blue-600">Notifications</TabsTrigger>
              <TabsTrigger value="seo" className="text-white data-[state=active]:bg-blue-600">SEO</TabsTrigger>
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
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone" className="text-white">Contact Phone</Label>
                      <Input
                        id="contact_phone"
                        value={generalSettings.contact_phone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, contact_phone: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="support_email" className="text-white">Support Email</Label>
                      <Input
                        id="support_email"
                        type="email"
                        value={generalSettings.support_email}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, support_email: e.target.value })}
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

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Default Language</Label>
                      <Select value={generalSettings.default_language} onValueChange={(value) => setGeneralSettings({ ...generalSettings, default_language: value })}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="id">Bahasa Indonesia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Timezone</Label>
                      <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Currency</Label>
                      <Select value={generalSettings.currency} onValueChange={(value) => setGeneralSettings({ ...generalSettings, currency: value })}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="IDR">IDR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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

            <TabsContent value="auth" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-4 w-4" />
                    Authentication & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-white font-semibold">Social Authentication</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Enable Google Login</Label>
                          <p className="text-sm text-gray-300">Allow users to sign in with Google</p>
                        </div>
                        <Switch
                          checked={authSettings.enable_google_auth}
                          onCheckedChange={(checked) => setAuthSettings({ ...authSettings, enable_google_auth: checked })}
                        />
                      </div>

                      {authSettings.enable_google_auth && (
                        <div className="space-y-2 p-4 border border-gray-700 rounded-lg">
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

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Enable Facebook Login</Label>
                          <p className="text-sm text-gray-300">Allow users to sign in with Facebook</p>
                        </div>
                        <Switch
                          checked={authSettings.enable_facebook_auth}
                          onCheckedChange={(checked) => setAuthSettings({ ...authSettings, enable_facebook_auth: checked })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-white font-semibold">Security Settings</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="session_timeout" className="text-white">Session Timeout (minutes)</Label>
                          <Input
                            id="session_timeout"
                            type="number"
                            value={authSettings.session_timeout}
                            onChange={(e) => setAuthSettings({ ...authSettings, session_timeout: e.target.value })}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max_login_attempts" className="text-white">Max Login Attempts</Label>
                          <Input
                            id="max_login_attempts"
                            type="number"
                            value={authSettings.max_login_attempts}
                            onChange={(e) => setAuthSettings({ ...authSettings, max_login_attempts: e.target.value })}
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Enable Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-300">Require 2FA for enhanced security</p>
                        </div>
                        <Switch
                          checked={authSettings.enable_2fa}
                          onCheckedChange={(checked) => setAuthSettings({ ...authSettings, enable_2fa: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-white">Email Verification Required</Label>
                          <p className="text-sm text-gray-300">Require email verification for new accounts</p>
                        </div>
                        <Switch
                          checked={authSettings.enable_email_verification}
                          onCheckedChange={(checked) => setAuthSettings({ ...authSettings, enable_email_verification: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleSave('auth', authSettings)} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Authentication Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="h-4 w-4" />
                    User Roles & Permissions
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
                        <Label className="text-white">Agent Verification Required</Label>
                        <p className="text-sm text-gray-300">Require verification documents for agents</p>
                      </div>
                      <Switch
                        checked={userRoleSettings.agent_verification_required}
                        onCheckedChange={(checked) => setUserRoleSettings({ ...userRoleSettings, agent_verification_required: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('user_roles', userRoleSettings)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save User Role Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="properties" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Building className="h-4 w-4" />
                    Property Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_images_per_property" className="text-white">Max Images per Property</Label>
                      <Input
                        id="max_images_per_property"
                        type="number"
                        value={propertySettings.max_images_per_property}
                        onChange={(e) => setPropertySettings({ ...propertySettings, max_images_per_property: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="property_expiry_days" className="text-white">Property Listing Expiry (days)</Label>
                      <Input
                        id="property_expiry_days"
                        type="number"
                        value={propertySettings.property_expiry_days}
                        onChange={(e) => setPropertySettings({ ...propertySettings, property_expiry_days: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Auto-approve Properties</Label>
                        <p className="text-sm text-gray-300">Automatically approve new property listings</p>
                      </div>
                      <Switch
                        checked={propertySettings.auto_approve_properties}
                        onCheckedChange={(checked) => setPropertySettings({ ...propertySettings, auto_approve_properties: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Enable 3D Virtual Tours</Label>
                        <p className="text-sm text-gray-300">Allow 3D virtual tour uploads</p>
                      </div>
                      <Switch
                        checked={propertySettings.enable_3d_tours}
                        onCheckedChange={(checked) => setPropertySettings({ ...propertySettings, enable_3d_tours: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Enable Virtual Staging</Label>
                        <p className="text-sm text-gray-300">Allow virtual staging features</p>
                      </div>
                      <Switch
                        checked={propertySettings.enable_virtual_staging}
                        onCheckedChange={(checked) => setPropertySettings({ ...propertySettings, enable_virtual_staging: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('properties', propertySettings)} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Property Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="surveys" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-4 w-4" />
                    Property Survey System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="survey_booking_advance_days" className="text-white">Booking Advance Days</Label>
                      <Input
                        id="survey_booking_advance_days"
                        type="number"
                        value={surveySettings.survey_booking_advance_days}
                        onChange={(e) => setSurveySettings({ ...surveySettings, survey_booking_advance_days: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_surveys_per_day" className="text-white">Max Surveys per Day</Label>
                      <Input
                        id="max_surveys_per_day"
                        type="number"
                        value={surveySettings.max_surveys_per_day}
                        onChange={(e) => setSurveySettings({ ...surveySettings, max_surveys_per_day: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Enable Property Surveys</Label>
                      <p className="text-sm text-gray-300">Allow property survey booking</p>
                    </div>
                    <Switch
                      checked={surveySettings.enable_property_surveys}
                      onCheckedChange={(checked) => setSurveySettings({ ...surveySettings, enable_property_surveys: checked })}
                    />
                  </div>

                  <Button onClick={() => handleSave('surveys', surveySettings)} className="bg-orange-600 hover:bg-orange-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Survey Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="h-4 w-4" />
                    Compliance & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">GDPR Compliance</Label>
                        <p className="text-sm text-gray-300">Enable GDPR compliance features</p>
                      </div>
                      <Switch
                        checked={complianceSettings.enable_gdpr_compliance}
                        onCheckedChange={(checked) => setComplianceSettings({ ...complianceSettings, enable_gdpr_compliance: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Cookie Consent</Label>
                        <p className="text-sm text-gray-300">Show cookie consent banner</p>
                      </div>
                      <Switch
                        checked={complianceSettings.enable_cookie_consent}
                        onCheckedChange={(checked) => setComplianceSettings({ ...complianceSettings, enable_cookie_consent: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Audit Logs</Label>
                        <p className="text-sm text-gray-300">Enable system audit logging</p>
                      </div>
                      <Switch
                        checked={complianceSettings.enable_audit_logs}
                        onCheckedChange={(checked) => setComplianceSettings({ ...complianceSettings, enable_audit_logs: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('compliance', complianceSettings)} className="bg-red-600 hover:bg-red-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Compliance Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <UserCheck className="h-4 w-4" />
                    Staff Management System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Enable Staff Management</Label>
                        <p className="text-sm text-gray-300">Enable comprehensive staff management features</p>
                      </div>
                      <Switch
                        checked={staffSettings.enable_staff_management}
                        onCheckedChange={(checked) => setStaffSettings({ ...staffSettings, enable_staff_management: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Staff Hierarchy</Label>
                        <p className="text-sm text-gray-300">Enable organizational hierarchy</p>
                      </div>
                      <Switch
                        checked={staffSettings.enable_staff_hierarchy}
                        onCheckedChange={(checked) => setStaffSettings({ ...staffSettings, enable_staff_hierarchy: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Performance Tracking</Label>
                        <p className="text-sm text-gray-300">Track staff performance metrics</p>
                      </div>
                      <Switch
                        checked={staffSettings.enable_staff_performance_tracking}
                        onCheckedChange={(checked) => setStaffSettings({ ...staffSettings, enable_staff_performance_tracking: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('staff', staffSettings)} className="bg-teal-600 hover:bg-teal-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Staff Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Phone className="h-4 w-4" />
                    Customer Support System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_response_time_hours" className="text-white">Max Response Time (hours)</Label>
                      <Input
                        id="max_response_time_hours"
                        type="number"
                        value={customerServiceSettings.max_response_time_hours}
                        onChange={(e) => setCustomerServiceSettings({ ...customerServiceSettings, max_response_time_hours: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="escalation_threshold_hours" className="text-white">Escalation Threshold (hours)</Label>
                      <Input
                        id="escalation_threshold_hours"
                        type="number"
                        value={customerServiceSettings.escalation_threshold_hours}
                        onChange={(e) => setCustomerServiceSettings({ ...customerServiceSettings, escalation_threshold_hours: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Enable Live Chat</Label>
                        <p className="text-sm text-gray-300">Enable real-time customer support chat</p>
                      </div>
                      <Switch
                        checked={customerServiceSettings.enable_live_chat}
                        onCheckedChange={(checked) => setCustomerServiceSettings({ ...customerServiceSettings, enable_live_chat: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Ticket System</Label>
                        <p className="text-sm text-gray-300">Enable support ticket system</p>
                      </div>
                      <Switch
                        checked={customerServiceSettings.enable_ticket_system}
                        onCheckedChange={(checked) => setCustomerServiceSettings({ ...customerServiceSettings, enable_ticket_system: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('customer_service', customerServiceSettings)} className="bg-cyan-600 hover:bg-cyan-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Support Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="h-4 w-4" />
                    Security & Protection
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

            <TabsContent value="notifications" className="space-y-4">
              <Card className="bg-white/5 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Mail className="h-4 w-4" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Email Notifications</Label>
                        <p className="text-sm text-gray-300">Send email notifications to users</p>
                      </div>
                      <Switch
                        checked={notificationSettings.enable_email_notifications}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, enable_email_notifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">SMS Notifications</Label>
                        <p className="text-sm text-gray-300">Send SMS notifications to users</p>
                      </div>
                      <Switch
                        checked={notificationSettings.enable_sms_notifications}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, enable_sms_notifications: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Push Notifications</Label>
                        <p className="text-sm text-gray-300">Send push notifications</p>
                      </div>
                      <Switch
                        checked={notificationSettings.enable_push_notifications}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, enable_push_notifications: checked })}
                      />
                    </div>
                  </div>

                  <Button onClick={() => handleSave('notifications', notificationSettings)} className="bg-pink-600 hover:bg-pink-700">
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
