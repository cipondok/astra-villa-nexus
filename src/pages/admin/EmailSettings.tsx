import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Loader2, Send, Wifi, Building2, Palette, FileText, Mail, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Json } from "@/integrations/supabase/types";

interface SMTPSettings {
  host: string;
  port: string;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  reply_to_email: string;
  encryption: "ssl" | "tls" | "none";
  enabled: boolean;
}

interface CompanyBranding {
  company_name: string;
  company_logo_url: string;
  company_website: string;
  company_address: string;
  company_phone: string;
  support_email: string;
  primary_color: string;
  secondary_color: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  social_linkedin: string;
  footer_text: string;
  copyright_text: string;
}

interface EmailTemplate {
  subject: string;
  preheader: string;
  header_text: string;
  body: string;
  button_text: string;
  button_url: string;
  show_social_links: boolean;
  show_unsubscribe: boolean;
}

const DEFAULT_BRANDING: CompanyBranding = {
  company_name: "ASTRA Villa",
  company_logo_url: "",
  company_website: "https://astravilla.com",
  company_address: "Jakarta, Indonesia",
  company_phone: "+62 857 1600 8080",
  support_email: "support@astravilla.com",
  primary_color: "#0ea5e9",
  secondary_color: "#6366f1",
  social_facebook: "",
  social_instagram: "",
  social_twitter: "",
  social_linkedin: "",
  footer_text: "Thank you for choosing ASTRA Villa for your property needs.",
  copyright_text: "© 2024 ASTRA Villa. All rights reserved."
};

const DEFAULT_TEMPLATE: EmailTemplate = {
  subject: "",
  preheader: "",
  header_text: "",
  body: "",
  button_text: "",
  button_url: "",
  show_social_links: true,
  show_unsubscribe: true
};

export default function EmailSettings() {
  const queryClient = useQueryClient();

  // Fetch SMTP settings
  const { data: smtpSettings, isLoading: loadingSmtp } = useQuery<SMTPSettings>({
    queryKey: ["email-smtp-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("category", "smtp")
        .eq("key", "config")
        .maybeSingle();
      
      if (error) throw error;
      
      const dbValue = data?.value as any;
      if (!dbValue) {
        return {
          host: "",
          port: "587",
          username: "",
          password: "",
          from_email: "",
          from_name: "ASTRA Villa",
          reply_to_email: "",
          encryption: "tls" as const,
          enabled: false,
        };
      }
      
      return {
        host: dbValue.host || "",
        port: String(dbValue.port || "587"),
        username: dbValue.username || "",
        password: dbValue.password || "",
        from_email: dbValue.fromEmail || dbValue.from_email || "",
        from_name: dbValue.fromName || dbValue.from_name || "ASTRA Villa",
        reply_to_email: dbValue.replyToEmail || dbValue.reply_to_email || "",
        encryption: (dbValue.encryption || "tls") as "ssl" | "tls" | "none",
        enabled: dbValue.isEnabled ?? dbValue.enabled ?? false,
      };
    },
  });

  // Fetch company branding
  const { data: brandingData, isLoading: loadingBranding } = useQuery<CompanyBranding>({
    queryKey: ["email-branding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("category", "email_branding")
        .eq("key", "config")
        .maybeSingle();
      
      if (error) throw error;
      return (data?.value as unknown as CompanyBranding) || DEFAULT_BRANDING;
    },
  });

  // Fetch email templates
  const { data: templates } = useQuery({
    queryKey: ["email-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("category", "email_templates");
      
      if (error) throw error;
      return data || [];
    },
  });

  // Update SMTP settings
  const updateSMTP = useMutation({
    mutationFn: async (settings: SMTPSettings) => {
      const dbFormat = {
        host: settings.host,
        port: settings.port,
        username: settings.username,
        password: settings.password,
        fromEmail: settings.from_email,
        fromName: settings.from_name,
        replyToEmail: settings.reply_to_email,
        encryption: settings.encryption,
        isEnabled: settings.enabled,
      };

      const { error } = await supabase
        .from("system_settings")
        .upsert({
          category: "smtp",
          key: "config",
          value: dbFormat,
          is_public: false,
        }, { onConflict: "category,key" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-smtp-settings"] });
      toast.success("SMTP settings saved!");
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  // Update branding
  const updateBranding = useMutation({
    mutationFn: async (branding: CompanyBranding) => {
      // First try to update, if not exists, insert
      const { data: existing } = await supabase
        .from("system_settings")
        .select("id")
        .eq("category", "email_branding")
        .eq("key", "config")
        .maybeSingle();

      const jsonValue = branding as unknown as Json;

      if (existing) {
        const { error } = await supabase
          .from("system_settings")
          .update({ value: jsonValue })
          .eq("category", "email_branding")
          .eq("key", "config");
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("system_settings")
          .insert([{
            category: "email_branding",
            key: "config",
            value: jsonValue,
            is_public: false,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-branding"] });
      toast.success("Branding settings saved!");
    },
    onError: (error: any) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  // Update email template
  const updateTemplate = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: EmailTemplate }) => {
      // First try to update, if not exists, insert
      const { data: existing } = await supabase
        .from("system_settings")
        .select("id")
        .eq("category", "email_templates")
        .eq("key", key)
        .maybeSingle();

      const jsonValue = value as unknown as Json;

      if (existing) {
        const { error } = await supabase
          .from("system_settings")
          .update({ value: jsonValue })
          .eq("category", "email_templates")
          .eq("key", key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("system_settings")
          .insert([{
            category: "email_templates",
            key,
            value: jsonValue,
            is_public: false,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template saved!");
    },
    onError: () => {
      toast.error("Failed to save template");
    },
  });

  const [smtpForm, setSmtpForm] = useState<SMTPSettings>({
    host: "",
    port: "587",
    username: "",
    password: "",
    from_email: "",
    from_name: "ASTRA Villa",
    reply_to_email: "",
    encryption: "tls",
    enabled: false,
  });

  const [brandingForm, setBrandingForm] = useState<CompanyBranding>(DEFAULT_BRANDING);
  const [activeTemplate, setActiveTemplate] = useState<string>("welcome");
  const [templateForm, setTemplateForm] = useState<EmailTemplate>(DEFAULT_TEMPLATE);

  useEffect(() => {
    if (smtpSettings) setSmtpForm(smtpSettings);
  }, [smtpSettings]);

  useEffect(() => {
    if (brandingData) setBrandingForm(brandingData);
  }, [brandingData]);

  useEffect(() => {
    if (templates) {
      const template = templates.find(t => t.key === activeTemplate);
      setTemplateForm((template?.value as unknown as EmailTemplate) || DEFAULT_TEMPLATE);
    }
  }, [templates, activeTemplate]);

  const [testingConnection, setTestingConnection] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: { 
          smtp_config: {
            host: smtpForm.host,
            port: parseInt(smtpForm.port),
            username: smtpForm.username,
            password: smtpForm.password,
            encryption: smtpForm.encryption,
            from_email: smtpForm.from_email,
            from_name: smtpForm.from_name,
            enabled: smtpForm.enabled
          },
          test_email: {
            to: smtpForm.from_email,
            subject: "SMTP Test",
            message: "Testing connection"
          }
        }
      });

      if (error) throw error;
      if (data?.success) {
        toast.success("SMTP connection successful!");
      } else {
        toast.error(data?.error || "Connection test failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to test connection");
    } finally {
      setTestingConnection(false);
    }
  };

  const sendTestEmail = async () => {
    setSendingTestEmail(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { 
          to: smtpForm.from_email,
          subject: "Test Email from ASTRA Villa",
          template: "test",
          variables: {
            company_name: brandingForm.company_name,
            message: "This is a test email to verify your email configuration is working correctly."
          }
        }
      });

      if (error) throw error;
      if (data?.success) {
        toast.success(`Test email sent to ${smtpForm.from_email}!`);
      } else {
        toast.error(data?.error || "Failed to send test email");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send test email");
    } finally {
      setSendingTestEmail(false);
    }
  };

  const isLoading = loadingSmtp || loadingBranding;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </h1>
          <p className="text-sm text-muted-foreground">Configure email server, branding, and templates</p>
        </div>
        <Badge variant={smtpForm.enabled ? "default" : "secondary"}>
          {smtpForm.enabled ? "Enabled" : "Disabled"}
        </Badge>
      </div>

      <Tabs defaultValue="smtp" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="smtp" className="text-xs py-2 gap-1">
            <Wifi className="h-3 w-3" />
            <span className="hidden sm:inline">SMTP</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="text-xs py-2 gap-1">
            <Building2 className="h-3 w-3" />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="text-xs py-2 gap-1">
            <Palette className="h-3 w-3" />
            <span className="hidden sm:inline">Design</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs py-2 gap-1">
            <FileText className="h-3 w-3" />
            <span className="hidden sm:inline">Templates</span>
          </TabsTrigger>
        </TabsList>

        {/* SMTP Settings Tab */}
        <TabsContent value="smtp">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">SMTP Server Configuration</CardTitle>
              <CardDescription className="text-xs">Configure your email server settings (or use Resend API)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Enable Email Sending</Label>
                  <p className="text-xs text-muted-foreground">Turn on/off all outgoing emails</p>
                </div>
                <Switch
                  checked={smtpForm.enabled}
                  onCheckedChange={(checked) => setSmtpForm({ ...smtpForm, enabled: checked })}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="host" className="text-xs">SMTP Host</Label>
                  <Input
                    id="host"
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    placeholder="smtp.resend.com"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="port" className="text-xs">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, port: e.target.value })}
                    placeholder="587"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="encryption" className="text-xs">Encryption</Label>
                  <Select value={smtpForm.encryption} onValueChange={(v) => setSmtpForm({ ...smtpForm, encryption: v as any })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS (587)</SelectItem>
                      <SelectItem value="ssl">SSL (465)</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs">Username / API Key</Label>
                  <Input
                    id="username"
                    value={smtpForm.username}
                    onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                    placeholder="resend or apikey"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="password" className="text-xs">Password / API Secret</Label>
                  <Input
                    id="password"
                    type="password"
                    value={smtpForm.password}
                    onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="from_name" className="text-xs">From Name</Label>
                  <Input
                    id="from_name"
                    value={smtpForm.from_name}
                    onChange={(e) => setSmtpForm({ ...smtpForm, from_name: e.target.value })}
                    placeholder="ASTRA Villa"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="from_email" className="text-xs">From Email</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={smtpForm.from_email}
                    onChange={(e) => setSmtpForm({ ...smtpForm, from_email: e.target.value })}
                    placeholder="noreply@yourdomain.com"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="reply_to" className="text-xs">Reply-To Email (optional)</Label>
                  <Input
                    id="reply_to"
                    type="email"
                    value={smtpForm.reply_to_email}
                    onChange={(e) => setSmtpForm({ ...smtpForm, reply_to_email: e.target.value })}
                    placeholder="support@yourdomain.com"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" onClick={() => updateSMTP.mutate(smtpForm)} disabled={updateSMTP.isPending}>
                  {updateSMTP.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                  Save Settings
                </Button>
                <Button size="sm" variant="outline" onClick={testConnection} disabled={testingConnection}>
                  {testingConnection ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Wifi className="h-3 w-3 mr-1" />}
                  Test Connection
                </Button>
                <Button size="sm" variant="secondary" onClick={sendTestEmail} disabled={sendingTestEmail}>
                  {sendingTestEmail ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Send className="h-3 w-3 mr-1" />}
                  Send Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Branding Tab */}
        <TabsContent value="branding">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Company Information</CardTitle>
              <CardDescription className="text-xs">Your company details shown in email header and footer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Company Name</Label>
                  <Input
                    value={brandingForm.company_name}
                    onChange={(e) => setBrandingForm({ ...brandingForm, company_name: e.target.value })}
                    placeholder="ASTRA Villa"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Website URL</Label>
                  <Input
                    value={brandingForm.company_website}
                    onChange={(e) => setBrandingForm({ ...brandingForm, company_website: e.target.value })}
                    placeholder="https://astravilla.com"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Logo URL</Label>
                  <Input
                    value={brandingForm.company_logo_url}
                    onChange={(e) => setBrandingForm({ ...brandingForm, company_logo_url: e.target.value })}
                    placeholder="https://yourdomain.com/logo.png"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Company Address</Label>
                  <Input
                    value={brandingForm.company_address}
                    onChange={(e) => setBrandingForm({ ...brandingForm, company_address: e.target.value })}
                    placeholder="123 Main Street, Jakarta, Indonesia"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Phone Number</Label>
                  <Input
                    value={brandingForm.company_phone}
                    onChange={(e) => setBrandingForm({ ...brandingForm, company_phone: e.target.value })}
                    placeholder="+62 857 1600 8080"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Support Email</Label>
                  <Input
                    type="email"
                    value={brandingForm.support_email}
                    onChange={(e) => setBrandingForm({ ...brandingForm, support_email: e.target.value })}
                    placeholder="support@astravilla.com"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-xs mb-2 block">Social Media Links</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Input
                    value={brandingForm.social_facebook}
                    onChange={(e) => setBrandingForm({ ...brandingForm, social_facebook: e.target.value })}
                    placeholder="Facebook URL"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={brandingForm.social_instagram}
                    onChange={(e) => setBrandingForm({ ...brandingForm, social_instagram: e.target.value })}
                    placeholder="Instagram URL"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={brandingForm.social_twitter}
                    onChange={(e) => setBrandingForm({ ...brandingForm, social_twitter: e.target.value })}
                    placeholder="Twitter URL"
                    className="h-8 text-xs"
                  />
                  <Input
                    value={brandingForm.social_linkedin}
                    onChange={(e) => setBrandingForm({ ...brandingForm, social_linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Footer Text</Label>
                  <Textarea
                    value={brandingForm.footer_text}
                    onChange={(e) => setBrandingForm({ ...brandingForm, footer_text: e.target.value })}
                    placeholder="Thank you for choosing our services..."
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Copyright Text</Label>
                  <Input
                    value={brandingForm.copyright_text}
                    onChange={(e) => setBrandingForm({ ...brandingForm, copyright_text: e.target.value })}
                    placeholder="© 2024 ASTRA Villa. All rights reserved."
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <Button size="sm" onClick={() => updateBranding.mutate(brandingForm)} disabled={updateBranding.isPending}>
                {updateBranding.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                Save Branding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Email Design Settings</CardTitle>
              <CardDescription className="text-xs">Customize the look and feel of your emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={brandingForm.primary_color}
                      onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={brandingForm.primary_color}
                      onChange={(e) => setBrandingForm({ ...brandingForm, primary_color: e.target.value })}
                      placeholder="#0ea5e9"
                      className="h-9 text-sm flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Used for buttons, links, headers</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={brandingForm.secondary_color}
                      onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={brandingForm.secondary_color}
                      onChange={(e) => setBrandingForm({ ...brandingForm, secondary_color: e.target.value })}
                      placeholder="#6366f1"
                      className="h-9 text-sm flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Used for accents, icons</p>
                </div>
              </div>

              {/* Email Preview */}
              <Separator />
              <div>
                <Label className="text-xs mb-2 block">Email Preview</Label>
                <div className="border rounded-lg overflow-hidden bg-white">
                  {/* Header */}
                  <div className="p-4 text-center" style={{ backgroundColor: brandingForm.primary_color }}>
                    {brandingForm.company_logo_url ? (
                      <img src={brandingForm.company_logo_url} alt="Logo" className="h-8 mx-auto" />
                    ) : (
                      <span className="text-white font-bold text-lg">{brandingForm.company_name}</span>
                    )}
                  </div>
                  
                  {/* Body */}
                  <div className="p-6 text-center">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">Email Subject Here</h2>
                    <p className="text-sm text-gray-600 mb-4">This is a preview of how your emails will look.</p>
                    <button 
                      className="px-4 py-2 rounded text-white text-sm"
                      style={{ backgroundColor: brandingForm.primary_color }}
                    >
                      Call to Action
                    </button>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-4 bg-gray-100 text-center">
                    <p className="text-xs text-gray-600 mb-2">{brandingForm.footer_text}</p>
                    <p className="text-xs text-gray-500">{brandingForm.company_address}</p>
                    <p className="text-xs text-gray-400 mt-2">{brandingForm.copyright_text}</p>
                  </div>
                </div>
              </div>

              <Button size="sm" onClick={() => updateBranding.mutate(brandingForm)} disabled={updateBranding.isPending}>
                {updateBranding.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                Save Design
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Email Templates</CardTitle>
              <CardDescription className="text-xs">Customize email content for different scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Select Template</Label>
                <Select value={activeTemplate} onValueChange={setActiveTemplate}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome Email</SelectItem>
                    <SelectItem value="verification">Email Verification</SelectItem>
                    <SelectItem value="password_reset">Password Reset</SelectItem>
                    <SelectItem value="inquiry_received">Inquiry Received</SelectItem>
                    <SelectItem value="booking_confirmation">Booking Confirmation</SelectItem>
                    <SelectItem value="payment_receipt">Payment Receipt</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Subject Line</Label>
                    <Input
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      placeholder="Welcome to {{company_name}}!"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Preheader Text</Label>
                    <Input
                      value={templateForm.preheader}
                      onChange={(e) => setTemplateForm({ ...templateForm, preheader: e.target.value })}
                      placeholder="Preview text shown in inbox..."
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Header Text</Label>
                  <Input
                    value={templateForm.header_text}
                    onChange={(e) => setTemplateForm({ ...templateForm, header_text: e.target.value })}
                    placeholder="Welcome aboard!"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Email Body</Label>
                  <Textarea
                    value={templateForm.body}
                    onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                    placeholder="Hello {{user_name}},&#10;&#10;Thank you for joining us..."
                    rows={6}
                    className="text-sm font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables: {"{{user_name}}"}, {"{{email}}"}, {"{{company_name}}"}, {"{{otp_code}}"}, {"{{reset_link}}"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Button Text</Label>
                    <Input
                      value={templateForm.button_text}
                      onChange={(e) => setTemplateForm({ ...templateForm, button_text: e.target.value })}
                      placeholder="Get Started"
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Button URL</Label>
                    <Input
                      value={templateForm.button_url}
                      onChange={(e) => setTemplateForm({ ...templateForm, button_url: e.target.value })}
                      placeholder="{{website_url}}/dashboard"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={templateForm.show_social_links}
                      onCheckedChange={(checked) => setTemplateForm({ ...templateForm, show_social_links: checked })}
                    />
                    <Label className="text-xs">Show Social Links</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={templateForm.show_unsubscribe}
                      onCheckedChange={(checked) => setTemplateForm({ ...templateForm, show_unsubscribe: checked })}
                    />
                    <Label className="text-xs">Show Unsubscribe</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => updateTemplate.mutate({ key: activeTemplate, value: templateForm })} 
                  disabled={updateTemplate.isPending}
                >
                  {updateTemplate.isPending ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
                  Save Template
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
