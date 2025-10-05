import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Save, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const CaptchaSettings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [settings, setSettings] = useState({
    captcha_enabled: true,
    recaptcha_site_key: "",
    recaptcha_secret_key: "",
    captcha_minimum_score: 0.5,
    captcha_actions: {
      partner_network: true,
      become_partner: true,
      partner_benefits: true,
      joint_ventures: true,
      contact_form: true,
      survey_booking: true
    }
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'captcha_enabled',
          'recaptcha_site_key',
          'recaptcha_secret_key',
          'captcha_minimum_score',
          'captcha_actions'
        ]);

      if (error) throw error;

      if (data) {
        const loadedSettings = { ...settings };
        data.forEach(item => {
          if (item.key === 'captcha_actions') {
            loadedSettings[item.key] = typeof item.value === 'string' 
              ? JSON.parse(item.value) 
              : item.value;
          } else if (item.key === 'captcha_enabled') {
            loadedSettings[item.key] = item.value === true || item.value === 'true';
          } else if (item.key === 'captcha_minimum_score') {
            loadedSettings[item.key] = parseFloat(item.value as string) || 0.5;
          } else {
            loadedSettings[item.key] = item.value;
          }
        });
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Error loading captcha settings:', error);
      toast({
        title: "Error",
        description: "Failed to load captcha settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'captcha_enabled', value: settings.captcha_enabled },
        { key: 'recaptcha_site_key', value: settings.recaptcha_site_key },
        { key: 'recaptcha_secret_key', value: settings.recaptcha_secret_key },
        { key: 'captcha_minimum_score', value: settings.captcha_minimum_score.toString() },
        { key: 'captcha_actions', value: JSON.stringify(settings.captcha_actions) }
      ];

      for (const setting of settingsToSave) {
        // Check if setting exists
        const { data: existing } = await supabase
          .from('system_settings')
          .select('id')
          .eq('key', setting.key)
          .single();

        if (existing) {
          // Update existing setting
          const { error } = await supabase
            .from('system_settings')
            .update({
              value: setting.value,
              updated_at: new Date().toISOString()
            })
            .eq('key', setting.key);

          if (error) throw error;
        } else {
          // Insert new setting
          const { error } = await supabase
            .from('system_settings')
            .insert({
              key: setting.key,
              value: setting.value,
              category: 'security'
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "Captcha settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving captcha settings:', error);
      toast({
        title: "Error",
        description: "Failed to save captcha settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateActionSetting = (action: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      captcha_actions: {
        ...prev.captcha_actions,
        [action]: enabled
      }
    }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle>reCAPTCHA Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure Google reCAPTCHA v3 for form protection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Enable Switch */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Captcha Protection</Label>
              <p className="text-sm text-muted-foreground">
                Master switch to enable/disable captcha across all forms
              </p>
            </div>
            <Switch
              checked={settings.captcha_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, captcha_enabled: checked })}
            />
          </div>

          {/* API Keys */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_key">
                reCAPTCHA Site Key (Public)
              </Label>
              <Input
                id="site_key"
                value={settings.recaptcha_site_key}
                onChange={(e) => setSettings({ ...settings, recaptcha_site_key: e.target.value })}
                placeholder="6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                disabled={!settings.captcha_enabled}
              />
              <p className="text-xs text-muted-foreground">
                Your public site key - safe to expose in frontend code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret_key">
                reCAPTCHA Secret Key (Private)
              </Label>
              <div className="relative">
                <Input
                  id="secret_key"
                  type={showSecretKey ? "text" : "password"}
                  value={settings.recaptcha_secret_key}
                  onChange={(e) => setSettings({ ...settings, recaptcha_secret_key: e.target.value })}
                  placeholder="6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  disabled={!settings.captcha_enabled}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  disabled={!settings.captcha_enabled}
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                ⚠️ Keep this secret! Used for server-side verification
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full"
            >
              <a
                href="https://www.google.com/recaptcha/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Get reCAPTCHA Keys
              </a>
            </Button>
          </div>

          {/* Minimum Score */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Minimum Score Threshold: {settings.captcha_minimum_score.toFixed(1)}
              </Label>
              <Slider
                value={[settings.captcha_minimum_score]}
                onValueChange={([value]) => setSettings({ ...settings, captcha_minimum_score: value })}
                min={0}
                max={1}
                step={0.1}
                disabled={!settings.captcha_enabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.0 (Bot)</span>
                <span>0.5 (Balanced)</span>
                <span>1.0 (Human)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Lower scores = stricter (may block real users). Higher scores = more lenient (may allow bots).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form-Specific Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Form Protection Settings</CardTitle>
          <CardDescription>
            Enable captcha for specific forms individually
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.captcha_actions).map(([action, enabled]) => (
            <div key={action} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <Label className="font-medium capitalize">
                  {action.replace(/_/g, ' ')}
                </Label>
              </div>
              <Switch
                checked={enabled && settings.captcha_enabled}
                onCheckedChange={(checked) => updateActionSetting(action, checked)}
                disabled={!settings.captcha_enabled}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isSaving || !settings.captcha_enabled}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-sm">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Get your reCAPTCHA keys from Google reCAPTCHA Admin Console</p>
          <p>2. Add the Site Key above (safe to expose publicly)</p>
          <p>3. Store the Secret Key in Supabase Edge Function secrets as <code className="bg-muted px-1 py-0.5 rounded">RECAPTCHA_SECRET_KEY</code></p>
          <p>4. Enable captcha protection and configure minimum score threshold</p>
          <p>5. Choose which forms require captcha protection</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptchaSettings;
