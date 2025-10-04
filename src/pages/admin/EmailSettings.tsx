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

interface SMTPSettings {
  host: string;
  port: string;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
  encryption: "ssl" | "tls" | "none";
  enabled: boolean;
}

interface EmailTemplate {
  subject: string;
  body: string;
}

export default function EmailSettings() {
  const queryClient = useQueryClient();

  // Fetch SMTP settings
  const { data: smtpSettings, isLoading } = useQuery<SMTPSettings>({
    queryKey: ["email-smtp-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("category", "smtp")
        .eq("key", "config")
        .maybeSingle();
      
      if (error) throw error;
      const value = (data?.value as unknown as SMTPSettings) || null;
      return value ?? {
        host: "",
        port: "",
        username: "",
        password: "",
        from_email: "",
        from_name: "",
        encryption: "ssl",
        enabled: false,
      };
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
    mutationFn: async (settings: any) => {
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          category: "smtp",
          key: "config",
          value: settings,
          is_public: false,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-smtp-settings"] });
      toast.success("SMTP settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update SMTP settings");
    },
  });

  // Update email template
  const updateTemplate = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          category: "email_templates",
          key,
          value,
          is_public: false,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Template updated successfully");
    },
    onError: () => {
      toast.error("Failed to update template");
    },
  });

  const [smtpForm, setSmtpForm] = useState<SMTPSettings>({
    host: "",
    port: "",
    username: "",
    password: "",
    from_email: "",
    from_name: "",
    encryption: "ssl",
    enabled: false,
  });

  useEffect(() => {
    if (smtpSettings) {
      setSmtpForm(smtpSettings);
    }
  }, [smtpSettings]);

  const handleSMTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSMTP.mutate(smtpForm);
  };

  const getTemplate = (key: string): EmailTemplate => {
    const templateValue = templates?.find(t => t.key === key)?.value;
    return (templateValue as unknown as EmailTemplate) || { subject: "", body: "" };
  };

  const handleTemplateUpdate = (key: string, field: keyof EmailTemplate, value: string) => {
    const template = getTemplate(key);
    updateTemplate.mutate({
      key,
      value: { ...template, [field]: value }
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Settings</h1>
        <p className="text-muted-foreground">Configure email server and templates</p>
      </div>

      <Tabs defaultValue="smtp" className="w-full">
        <TabsList>
          <TabsTrigger value="smtp">SMTP Settings</TabsTrigger>
          <TabsTrigger value="inquiry">Inquiry Email</TabsTrigger>
          <TabsTrigger value="welcome">Welcome Email</TabsTrigger>
          <TabsTrigger value="verification">Verification Email</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Configure your email server settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSMTPSubmit} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={smtpForm.enabled}
                    onCheckedChange={(checked) => 
                      setSmtpForm({ ...smtpForm, enabled: checked })
                    }
                  />
                  <Label>Enable Email Sending</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">SMTP Host</Label>
                    <Input
                      id="host"
                      value={smtpForm.host}
                      onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="port">SMTP Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={smtpForm.port}
                      onChange={(e) => setSmtpForm({ ...smtpForm, port: e.target.value })}
                      placeholder="587"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encryption">Encryption</Label>
                    <select
                      id="encryption"
                      value={smtpForm.encryption}
                      onChange={(e) => setSmtpForm({ ...smtpForm, encryption: e.target.value as SMTPSettings["encryption"] })}
                      className="h-10 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="ssl">SSL (465)</option>
                      <option value="tls">TLS (587)</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={smtpForm.username}
                      onChange={(e) => setSmtpForm({ ...smtpForm, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={smtpForm.password}
                      onChange={(e) => setSmtpForm({ ...smtpForm, password: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="from_email">From Email</Label>
                    <Input
                      id="from_email"
                      type="email"
                      value={smtpForm.from_email}
                      onChange={(e) => setSmtpForm({ ...smtpForm, from_email: e.target.value })}
                      placeholder="noreply@yourdomain.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="from_name">From Name</Label>
                    <Input
                      id="from_name"
                      value={smtpForm.from_name}
                      onChange={(e) => setSmtpForm({ ...smtpForm, from_name: e.target.value })}
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={updateSMTP.isPending}>
                  {updateSMTP.isPending ? "Saving..." : "Save SMTP Settings"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiry">
          <Card>
            <CardHeader>
              <CardTitle>Inquiry Response Email Template</CardTitle>
              <CardDescription>Email sent automatically when inquiry is received</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={getTemplate("inquiry_received")?.subject || ""}
                  onChange={(e) => handleTemplateUpdate("inquiry_received", "subject", e.target.value)}
                  placeholder="Thank you for your inquiry"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea
                  value={getTemplate("inquiry_received")?.body || ""}
                  onChange={(e) => handleTemplateUpdate("inquiry_received", "body", e.target.value)}
                  placeholder="Dear {{customer_name}}, Thank you for contacting us..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Available variables: {"{"}{"{"} customer_name {"}"}{"}"},  {"{"}{"{"} inquiry_type {"}"}{"}"},  {"{"}{"{"} message {"}"}{"}"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="welcome">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Email Template</CardTitle>
              <CardDescription>Email sent to new users after registration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={getTemplate("welcome")?.subject || ""}
                  onChange={(e) => handleTemplateUpdate("welcome", "subject", e.target.value)}
                  placeholder="Welcome to our platform"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea
                  value={getTemplate("welcome")?.body || ""}
                  onChange={(e) => handleTemplateUpdate("welcome", "body", e.target.value)}
                  placeholder="Hello {{user_name}}, Welcome to..."
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Available variables: {"{"}{"{"} user_name {"}"}{"}"},  {"{"}{"{"} email {"}"}{"}"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Verification Email Template</CardTitle>
              <CardDescription>Email sent for account verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={getTemplate("verification")?.subject || ""}
                  onChange={(e) => handleTemplateUpdate("verification", "subject", e.target.value)}
                  placeholder="Verify your email address"
                />
              </div>

              <div className="space-y-2">
                <Label>Email Body</Label>
                <Textarea
                  value={getTemplate("verification")?.body || ""}
                  onChange={(e) => handleTemplateUpdate("verification", "body", e.target.value)}
                  placeholder="Please verify your email by clicking this link: {{verification_link}}"
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Available variables: {"{"}{"{"} user_name {"}"}{"}"},  {"{"}{"{"} verification_link {"}"}{"}"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
