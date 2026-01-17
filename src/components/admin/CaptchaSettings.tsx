import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Save, Eye, EyeOff, ExternalLink, Info } from "lucide-react";
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
        const { data: existing } = await supabase
          .from('system_settings')
          .select('id')
          .eq('key', setting.key)
          .single();

        if (existing) {
          const { error } = await supabase
            .from('system_settings')
            .update({ value: setting.value, updated_at: new Date().toISOString() })
            .eq('key', setting.key);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('system_settings')
            .insert({ key: setting.key, value: setting.value, category: 'security' });
          if (error) throw error;
        }
      }

      toast({ title: "Success", description: "Captcha settings saved successfully" });
    } catch (error) {
      console.error('Error saving captcha settings:', error);
      toast({ title: "Error", description: "Failed to save captcha settings", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateActionSetting = (action: string, enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      captcha_actions: { ...prev.captcha_actions, [action]: enabled }
    }));
  };

  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm text-foreground">Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Captcha Security
          </h2>
          <p className="text-[10px] text-muted-foreground">Configure Google reCAPTCHA v3 protection</p>
        </div>
        <Button size="sm" onClick={saveSettings} disabled={isSaving || !settings.captcha_enabled} className="h-7 text-xs px-3">
          <Save className="h-3 w-3 mr-1" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Main Configuration */}
      <Card className="bg-card/50 border-border/50 border-l-2 border-l-blue-500">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground">reCAPTCHA Configuration</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          {/* Master Switch */}
          <div className="flex items-center justify-between p-2 border border-border/50 rounded-md bg-background/30">
            <div>
              <Label className="text-[10px] font-medium text-foreground">Enable Captcha Protection</Label>
              <p className="text-[9px] text-muted-foreground">Master switch for all forms</p>
            </div>
            <Switch
              checked={settings.captcha_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, captcha_enabled: checked })}
              className="scale-75"
            />
          </div>

          {/* API Keys */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Site Key (Public)</Label>
              <Input
                value={settings.recaptcha_site_key}
                onChange={(e) => setSettings({ ...settings, recaptcha_site_key: e.target.value })}
                placeholder="6LcXXXXXXXXXXXXXX"
                disabled={!settings.captcha_enabled}
                className="h-7 text-xs bg-background/50"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Secret Key (Private)</Label>
              <div className="flex gap-1">
                <Input
                  type={showSecretKey ? "text" : "password"}
                  value={settings.recaptcha_secret_key}
                  onChange={(e) => setSettings({ ...settings, recaptcha_secret_key: e.target.value })}
                  placeholder="6LcXXXXXXXXXXXXXX"
                  disabled={!settings.captcha_enabled}
                  className="h-7 text-xs bg-background/50"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  disabled={!settings.captcha_enabled}
                  className="h-7 w-7 p-0"
                >
                  {showSecretKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild className="h-6 text-[10px] w-full">
            <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Get reCAPTCHA Keys
            </a>
          </Button>

          {/* Score Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Minimum Score</Label>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">{settings.captcha_minimum_score.toFixed(1)}</Badge>
            </div>
            <Slider
              value={[settings.captcha_minimum_score]}
              onValueChange={([value]) => setSettings({ ...settings, captcha_minimum_score: value })}
              min={0}
              max={1}
              step={0.1}
              disabled={!settings.captcha_enabled}
              className="w-full"
            />
            <div className="flex justify-between text-[8px] text-muted-foreground">
              <span>0.0 Bot</span>
              <span>0.5 Balanced</span>
              <span>1.0 Human</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Protection */}
      <Card className="bg-card/50 border-border/50 border-l-2 border-l-emerald-500">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs text-foreground">Form Protection</CardTitle>
          <CardDescription className="text-[10px]">Enable captcha per form</CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(settings.captcha_actions).map(([action, enabled]) => (
              <div key={action} className="flex items-center justify-between p-2 border border-border/50 rounded-md bg-background/30">
                <Label className="text-[9px] font-medium capitalize text-foreground">
                  {action.replace(/_/g, ' ')}
                </Label>
                <Switch
                  checked={enabled && settings.captcha_enabled}
                  onCheckedChange={(checked) => updateActionSetting(action, checked)}
                  disabled={!settings.captcha_enabled}
                  className="scale-[0.6]"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20 border-l-2 border-l-primary">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-[10px] text-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-1 text-[9px] text-muted-foreground">
          <p>1. Get keys from Google reCAPTCHA Admin Console</p>
          <p>2. Add Site Key above (public)</p>
          <p>3. Store Secret Key in Edge Function secrets as <code className="bg-muted px-1 py-0.5 rounded text-[8px]">RECAPTCHA_SECRET_KEY</code></p>
          <p>4. Enable protection and configure score threshold</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptchaSettings;
